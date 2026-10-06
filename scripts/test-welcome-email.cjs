/* Offline delivery regressions. Never connects to a real DB or email provider. */
const assert = require('node:assert/strict');
const fs = require('node:fs'), path = require('node:path'), Module = require('node:module');
const ts = require('typescript'), { Prisma } = require('@prisma/client');
const root = path.resolve(__dirname, '..');
global.fetch = async () => { throw new Error('Network forbidden in welcome tests'); };
let rows, users, calls, accepted, rejected, unavailable, commitFailure, providerHook, serial = 0;
let tail = Promise.resolve();
const clone = x => structuredClone(x);
const email = 'creator@test.invalid';
function matches(row, where = {}) {
  return Object.entries(where).every(([key, value]) => {
    if (key === 'OR') return value.some(part=>matches(row,part));
    if (key === 'email_type') return matches(row, value);
    if (value instanceof Date) return +row[key] === +value;
    if (value && typeof value === 'object') {
      if ('startsWith' in value) return row[key]?.startsWith(value.startsWith);
      if ('lte' in value) return row[key] <= value.lte;
      return false;
    }
    return row[key] === value;
  });
}
function healthy() { if (unavailable) throw new Error('Offline DB unavailable'); }
const rates = {
  async findUnique({where}) { healthy(); return clone(rows.find(x => matches(x,where)) || null); },
  async findMany({where, take}) { healthy(); return clone(rows.filter(x=>matches(x,where)).sort((a,b)=>a.lastRequestedAt-b.lastRequestedAt).slice(0,take)); },
  async create({data}) {
    healthy();
    if (rows.some(x=>x.email===data.email && x.type===data.type)) throw new Prisma.PrismaClientKnownRequestError('Duplicate',{code:'P2002',clientVersion:'offline'});
    const row={id:++serial,created_at:new Date(),...clone(data)}; rows.push(row); return clone(row);
  },
  async upsert({where,create,update}) {
    healthy(); const row=rows.find(x=>matches(x,where));
    if (!row) return this.create({data:create});
    Object.assign(row,clone(update)); return clone(row);
  },
  async updateMany({where,data}) { healthy(); let count=0; for(const row of rows) if(matches(row,where)){Object.assign(row,clone(data));count++;} return {count}; },
  async deleteMany({where}) { healthy(); const before=rows.length;rows=rows.filter(x=>!matches(x,where));return {count:before-rows.length}; },
};
const prisma = {
  authRateLimit:rates,
  user:{
    async findUnique({where}) {healthy();return clone(users.find(x=>matches(x,where)) || null);},
    async findFirst({where}) {return this.findUnique({where});},
    async create({data}) {healthy();const row={status:'active',createdAt:new Date(),...clone(data)};users.push(row);return clone(row);},
  },
  async $transaction(fn) {
    const previous=tail;let release;tail=new Promise(resolve=>release=resolve);await previous;
    const snapshot={rows:clone(rows),users:clone(users)};
    try {
      const result=await fn(prisma);
      if(commitFailure){commitFailure=false;throw new Error('Offline receipt commit failed');}
      return result;
    } catch(error) {rows=snapshot.rows;users=snapshot.users;throw error;} finally{release();}
  },
};
const originalLoad=Module._load, originalResolve=Module._resolveFilename;
Module._resolveFilename=function(request,...args){return originalResolve.call(this,request.startsWith('@/')?path.join(root,'src',request.slice(2)):request,...args);};
Module._load=function(request,...args){
  if(request==='server-only')return {};
  if(request==='@/lib/prisma')return {prisma};
  if(request==='@/lib/dev-account')return {isDevAccountEmail:()=>false,DEV_INFINITE_BALANCE:999999};
  if(request==='@/lib/emails')return {sendWelcomeEmail:async(recipient,key)=>{
    calls.push({recipient,key});if(providerHook)await providerHook();
    if(rejected)return false;
    if(!accepted.has(key))accepted.set(key,recipient);
    return true;
  }};
  return originalLoad.call(this,request,...args);
};
Module._extensions['.ts']=function(module,filename){module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,filename);};
const welcome=require('../src/lib/welcome-email.ts');
const userAccess=require('../src/lib/user-access.ts');
const cron=require('../src/app/api/cron/welcome-emails/route.ts');
const pending=()=>rows.filter(x=>x.type.startsWith('welcome_pending:'));
const claims=()=>rows.filter(x=>x.type.startsWith('welcome_claim:'));
const sent=()=>rows.filter(x=>x.type.startsWith('welcome_sent:'));
function reset(){
  rows=[];users=[{id:'user-1',email,createdAt:new Date(Date.now()-10000),status:'active'}];
  calls=[];accepted=new Map();rejected=false;unavailable=false;commitFailure=false;providerHook=null;delete process.env.CRON_SECRET;
}
async function queued(){await welcome.queueWelcomeEmail(prisma,users[0]);}
function due(){for(const row of pending())row.lastRequestedAt=new Date(Date.now()-1);}
const quiet=async fn=>{const log=console.error;console.error=()=>{};try{return await fn();}finally{console.error=log;}};
let passed=0;
async function test(name,fn){reset();await quiet(fn);passed++;console.log('PASS '+name);}
(async()=>{
  await test('Account creation and pending mail commit together; queue failure rolls both back',async()=>{
    users=[];const original=rates.upsert;rates.upsert=async()=>{throw new Error('Queue unavailable');};
    try{await assert.rejects(()=>userAccess.getOrCreateUser({id:'new',email}));}finally{rates.upsert=original;}
    assert.equal(users.length,0);assert.equal(calls.length,0);
  });
  await test('Fallback account creation waits for mail and persists the signup job',async()=>{
    users=[];let started,release;const startedPromise=new Promise(r=>started=r),gate=new Promise(r=>release=r);
    providerHook=async()=>{started();await gate;};
    let complete=false;const request=userAccess.getOrCreateUser({id:'new',email}).then(x=>{complete=true;return x;});
    await startedPromise;assert.equal(complete,false);assert.equal(pending().length,1);
    release();assert.equal((await request).id,'new');assert.equal(accepted.size,1);assert.equal(sent().length,1);
  });
  await test('Fallback account still succeeds if provider rejects the welcome',async()=>{
    users=[];rejected=true;assert.equal((await userAccess.getOrCreateUser({id:'new',email})).id,'new');
    assert.equal(pending().length,1);assert.equal(sent().length,0);
  });
  await test('Normalized welcome is sent once and marked only after acceptance',async()=>{
    await queued();assert.equal(await welcome.sendWelcomeEmailOnce(' CREATOR@test.invalid '),'sent');
    assert.equal(calls[0].recipient,email);assert.equal(pending().length,0);assert.equal(claims().length,0);
    assert.equal(await welcome.sendWelcomeEmailOnce(email),'already_sent');assert.equal(calls.length,1);
  });
  await test('Repeated queue requests preserve a delayed retry',async()=>{
    await queued();rejected=true;assert.equal(await welcome.sendWelcomeEmailOnce(email),'failed');
    const next=+pending()[0].lastRequestedAt;await queued();assert.equal(+pending()[0].lastRequestedAt,next);
    assert.equal(await welcome.sendWelcomeEmailOnce(email),'in_progress');assert.equal(calls.length,1);
  });
  await test('Provider rejection survives restart and retries with the same key',async()=>{
    await queued();rejected=true;await welcome.sendWelcomeEmailOnce(email);const key=calls[0].key;
    due();rejected=false;delete require.cache[require.resolve('../src/lib/welcome-email.ts')];
    assert.equal(await require('../src/lib/welcome-email.ts').sendWelcomeEmailOnce(email),'sent');
    assert.equal(calls[1].key,key);assert.equal(accepted.size,1);
  });
  await test('DB lookup failure is contained and cannot fail signup',async()=>{
    await queued();unavailable=true;assert.equal(await welcome.sendWelcomeEmailOnce(email),'failed');
    unavailable=false;assert.equal(pending().length,1);assert.equal(calls.length,0);
  });
  await test('Acceptance followed by failed DB commit retries without a second provider delivery',async()=>{
    await queued();commitFailure=true;assert.equal(await welcome.sendWelcomeEmailOnce(email),'failed');
    assert.equal(pending().length,1);assert.equal(sent().length,0);assert.equal(accepted.size,1);
    due();assert.equal(await welcome.sendWelcomeEmailOnce(email),'sent');assert.equal(calls.length,2);assert.equal(accepted.size,1);
  });
  await test('Concurrent signup/profile/cron attempts acquire a single mail lease',async()=>{
    await queued();const results=await Promise.all(Array.from({length:12},()=>welcome.sendWelcomeEmailOnce(email)));
    assert.equal(results.filter(x=>x==='sent').length,1);assert.equal(calls.length,1);
  });
  await test('A crashed worker lease can be reclaimed once it expires',async()=>{
    await queued();const key=pending()[0].type.split(':')[1];
    await rates.create({data:{email,type:'welcome_claim:'+key,lastRequestedAt:new Date(Date.now()-11*60000)}});
    assert.equal(await welcome.sendWelcomeEmailOnce(email),'sent');assert.equal(claims().length,0);
  });
  await test('A fresh lease prevents another sender from claiming the same job',async()=>{
    await queued();const key=pending()[0].type.split(':')[1];
    await rates.create({data:{email,type:'welcome_claim:'+key,lastRequestedAt:new Date()}});
    assert.equal(await welcome.sendWelcomeEmailOnce(email),'in_progress');assert.equal(calls.length,0);
  });
  await test('A stale worker cannot clear another worker lease or finalize its receipt',async()=>{
    await queued();providerHook=async()=>{claims()[0].lastRequestedAt=new Date(Date.now()+60000);};
    assert.equal(await welcome.sendWelcomeEmailOnce(email),'in_progress');
    assert.equal(claims().length,1);assert.equal(sent().length,0);assert.equal(pending().length,1);
  });
  await test('Previously accepted legacy welcomes are not resent',async()=>{
    await queued();await rates.create({data:{email,type:'welcome_email_sent',lastRequestedAt:new Date()}});
    assert.equal(await welcome.sendWelcomeEmailOnce(email),'already_sent');assert.equal(calls.length,0);assert.equal(pending().length,0);
  });
  await test('A recreated account receives a new welcome despite old email markers',async()=>{
    await queued();await welcome.sendWelcomeEmailOnce(email);
    await rates.create({data:{email,type:'welcome_email_sent',lastRequestedAt:new Date(Date.now()-1000)}});
    users[0]={...users[0],createdAt:new Date(),id:'user-2'};await queued();
    assert.equal(await welcome.sendWelcomeEmailOnce(email),'sent');assert.notEqual(calls[0].key,calls[1].key);assert.equal(accepted.size,2);
  });
  await test('Returning accounts without a signup job are never enrolled',async()=>{
    assert.equal(await welcome.sendWelcomeEmailOnce(email),'skipped');await userAccess.getOrCreateUser({id:'user-1',email});
    assert.equal(pending().length,0);assert.equal(calls.length,0);
  });
  await test('Missing/deleted/suspended/pending-deletion accounts receive no welcome',async()=>{
    for(const status of ['pending_deletion','deleting','suspended']){
      reset();await queued();users[0].status=status;assert.equal(await welcome.sendWelcomeEmailOnce(email),'skipped');assert.equal(calls.length,0);
    }
    users=[];assert.equal(await welcome.sendWelcomeEmailOnce(email),'skipped');assert.equal(await welcome.sendWelcomeEmailOnce(' '),'skipped');
  });
  await test('A status change during the claim is checked before mail is sent',async()=>{
    await queued();const update=rates.updateMany;rates.updateMany=async args=>{const result=await update(args);users[0].status='pending_deletion';return result;};
    try{assert.equal(await welcome.sendWelcomeEmailOnce(email),'skipped');assert.equal(calls.length,0);}finally{rates.updateMany=update;}
  });
  await test('Scheduler sends only due jobs and clears orphan jobs without contacting recipients',async()=>{
    await queued();await rates.create({data:{email:'gone@test.invalid',type:'welcome_pending:old',lastRequestedAt:new Date(Date.now()-1)}});
    assert.deepEqual(await welcome.retryQueuedWelcomeEmails(),{sent:1,failed:0,skipped:1,inProgress:0});assert.equal(pending().length,0);assert.equal(calls.length,1);
  });
  await test('Old lifecycle jobs cannot send mail to a replacement account',async()=>{
    await queued();users[0]={...users[0],id:'new-account',createdAt:new Date()};
    assert.equal((await welcome.retryQueuedWelcomeEmails()).skipped,1);assert.equal(calls.length,0);
  });
  await test('Cron fails closed without the secret and ignores query-string authentication',async()=>{
    await queued();assert.equal((await cron.GET(new Request('https://test.invalid/api/cron/welcome-emails'))).status,401);
    process.env.CRON_SECRET='offline-cron';assert.equal((await cron.GET(new Request('https://test.invalid/api/cron/welcome-emails?key=offline-cron'))).status,401);
    assert.equal(calls.length,0);
  });
  await test('Authorized cron returns counts without recipient addresses',async()=>{
    await queued();process.env.CRON_SECRET='offline-cron';const response=await cron.GET(new Request('https://test.invalid/api/cron/welcome-emails',{headers:{authorization:'Bearer offline-cron'}}));
    assert.equal(response.status,200);const body=await response.text();assert(!body.includes(email));assert.equal(JSON.parse(body).sent,1);
  });
  await test('Provider failure leaves jobs for retry and cron DB errors are generic',async()=>{
    await queued();process.env.CRON_SECRET='offline-cron';rejected=true;
    const request=()=>new Request('https://test.invalid/api/cron/welcome-emails',{headers:{authorization:'Bearer offline-cron'}});
    assert.equal((await (await cron.GET(request())).json()).failed,1);assert.equal(pending().length,1);
    unavailable=true;const response=await cron.GET(request());assert.equal(response.status,500);assert(!(await response.text()).includes('Offline DB'));
  });
  console.log(`${passed} offline welcome-email checks passed. No actual mail or accounts used.`);
})().catch(error=>{console.error(error);process.exitCode=1;});
