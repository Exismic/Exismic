/* Offline lifecycle regressions. No real accounts, storage, email or provider calls. */
const assert = require('node:assert/strict'), fs = require('node:fs'), path = require('node:path'), Module = require('node:module'), ts = require('typescript');
const { Prisma } = require('@prisma/client');
const root = path.resolve(__dirname, '..');
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://storage.test.invalid';
process.env.SUPABASE_SERVICE_ROLE_KEY = 'offline-secret-never-used-for-network';
global.fetch = async () => { throw new Error('Network forbidden'); };
let db, failures, removed, avatars, authDeleted, authCalls, emails, jar, sessionUser, validPassword, onRemove, conflict, renewalStatus, renewalCalls;
let txTail = Promise.resolve();
const uid = '00000000-0000-4000-8000-000000000001';
const otherUid = '00000000-0000-4000-8000-000000000002';
const clone = x => structuredClone(x);
function matches(row, where = {}) {
  return Object.entries(where).every(([key, value]) => {
    if (key === 'OR') return value.some(v => matches(row, v));
    if (value && typeof value === 'object' && !(value instanceof Date)) {
      if ('startsWith' in value) return String(row[key] || '').startsWith(value.startsWith);
      if ('contains' in value) return String(row[key] || '').includes(value.contains);
      if ('equals' in value) return value.mode === 'insensitive' ? String(row[key]).toLowerCase() === String(value.equals).toLowerCase() : row[key] === value.equals;
      if ('not' in value && row[key] === value.not) return false;
      if ('gt' in value && !(row[key] > value.gt)) return false;
      if ('lte' in value && !(row[key] <= value.lte)) return false;
      return true;
    }
    return value instanceof Date ? +row[key] === +value : row[key] === value;
  });
}
function table(name) {
  return {
    async findFirst({where}) { return clone(db[name].find(row => matches(row,where)) || null); },
    async findUnique(args) { return this.findFirst(args); },
    async findMany({where, take} = {}) { if (failures === 'manifest' && name === 'files') throw new Error('Mock manifest failure'); return clone(db[name].filter(row => matches(row,where)).slice(0,take)); },
    async create({data}) { const row = {id:`${name}-${db[name].length}`, ...clone(data)}; db[name].push(row); return clone(row); },
    async updateMany({where,data}) { let count=0; for (const row of db[name]) if(matches(row,where)) {Object.assign(row,clone(data)); count++;} return {count}; },
    async deleteMany({where}) {
      if (failures === 'database' && name === 'users') throw new Error('Mock database secret detail');
      const before=db[name].length; db[name]=db[name].filter(row=>!matches(row,where)); return {count:before-db[name].length};
    },
  };
}
const prisma = { user:table('users'), userFile:table('files'), job:table('jobs'), verificationToken:table('tokens'),
  support_agents:table('agents'), support_documents:table('documents'), support_usage_logs:table('usage'), userBilling:table('billing'), authRateLimit:table('rates'),
  async $transaction(operation) {
    const previous=txTail; let release; txTail=new Promise(resolve=>release=resolve); await previous;
    const snapshot=clone(db);
    try { if(conflict) {conflict=false;throw new Prisma.PrismaClientKnownRequestError('Mock conflict',{code:'P2034',clientVersion:'offline'});} return await operation(prisma); }
    catch(error) {db=snapshot;throw error;} finally {release();}
  },
};
const admin = {storage:{from:bucket=>({
  list:async (_folder,options)=>({data:avatars.filter(file=>file.name.includes(options.search)).slice(options.offset,options.offset+options.limit),error:null}),
  remove:async paths=>{ if(onRemove){const fn=onRemove;onRemove=null;await fn();} if(failures==='storage') return {error:{message:'Mock storage secret detail'}}; removed.push({bucket,paths}); return {data:[],error:null}; },
})},auth:{admin:{deleteUser:async id=>{assert.equal(id,uid);authCalls++;if(failures==='auth')return {data:null,error:{code:'unexpected_failure',message:'Mock auth secret detail'}};if(authDeleted)return {data:null,error:{code:'user_not_found'}};authDeleted=true;return {data:{user:{id}},error:null};}}}};
const cookieStore={get:name=>jar.get(name),set:(name,value,options)=>jar.set(name,{value,options}),delete:name=>jar.delete(name)};
const originalResolve=Module._resolveFilename, originalLoad=Module._load;
Module._resolveFilename=function(request,...args){return originalResolve.call(this,request.startsWith('@/')?path.join(root,'src',request.slice(2)):request,...args);};
Module._load=function(request,...args){
  if(request==='server-only')return {};
  if(request==='@/lib/prisma')return {prisma};
  if(request==='@/utils/supabase/admin')return {createAdminClient:()=>admin};
  if(request==='next/headers')return {cookies:async()=>cookieStore};
  if(request==='@/utils/supabase/server')return {createClient:async()=>({auth:{
    getUser:async()=>({data:{user:sessionUser},error:null}),signInWithPassword:async({email,password})=>({data:{user:validPassword&&email==='creator@test.invalid'&&password==='correct-password'?{id:uid,email}:null},error:validPassword&&password==='correct-password'?null:{message:'Wrong credentials'}}),
    signOut:async()=>{sessionUser=null;return {error:null};},
  }})};
  if(request==='@/lib/auth/session-proof')return {clearSessionProof:async()=>jar.delete('app-proof')};
  if(request==='@/lib/auth/security')return {consumeAuthLimit:async()=>true};
  if(request==='@/lib/device-security')return {extractClientIp:()=> '192.0.2.2'};
  if(request==='@/lib/notifications')return {createNotification:async()=>null};
  if(request==='@/lib/emails')return {sendAccountRecoveryRequestedEmail:async(...args)=>{emails.push(args);return true;},sendAccountDeletionScheduledEmail:async(...args)=>{emails.push(args);return true;}};
  if(request==='@/lib/paypal')return {getPayPalSubscription:async()=>({status:renewalStatus}),cancelPayPalSubscription:async()=>{if(failures==='renewal')throw new Error('Mock payment unavailable');renewalCalls++;renewalStatus='CANCELLED';return true;}};
  if(request==='razorpay')return class {constructor(){this.subscriptions={fetch:async()=>({status:renewalStatus}),cancel:async(_id,atEnd)=>{assert.equal(atEnd,false);if(failures==='renewal')throw new Error('Mock payment unavailable');renewalCalls++;renewalStatus='cancelled';return {status:renewalStatus};}}}};
  return originalLoad.call(this,request,...args);
};
require.extensions['.ts']=(module,filename)=>module._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true},fileName:filename}).outputText,filename);
const worker=require('../src/lib/server/account-purge.ts'), lifecycle=require('../src/lib/server/account-lifecycle.ts'), proof=require('../src/lib/auth/deletion-recovery.ts');
const cron=require('../src/app/api/cron/purge-deleted-accounts/route.ts'), recover=require('../src/app/api/user/account/recover/route.ts'), schedule=require('../src/app/api/user/account/delete/route.ts');
const url=(bucket,name)=>`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${bucket}/${name}`;
function reset(overrides={}) {
  db={users:[{id:uid,email:'creator@test.invalid',username:'creator',status:'pending_deletion',scheduledDeletionAt:new Date(Date.now()-10000),deletionRequestedAt:new Date(Date.now()-7*86400000-10000),deletionRecoveryRequested:false,...overrides}],
    files:[{userId:uid,originalUrl:null,resultUrl:url('results','output.png')}],jobs:[],tokens:[],agents:[],documents:[],usage:[],billing:[{userId:uid}],rates:[]};
  failures=null;removed=[];avatars=[];authDeleted=false;authCalls=0;emails=[];jar=new Map();sessionUser=null;validPassword=true;onRemove=null;conflict=false;renewalStatus='ACTIVE';renewalCalls=0;
}
const account=()=>db.users[0], jobs=()=>db.tokens.filter(row=>row.identifier.startsWith('account_purge:'));
const jobData=()=>JSON.parse(Buffer.from(jobs()[0].token.slice('account_purge:v1:'.length),'base64url').toString());
const request=(body,headers={})=>new Request('https://www.exismic.xyz/api/user/account/recover',{method:'POST',headers:{'content-type':'application/json',...headers},body:JSON.stringify(body)});
const quiet=async fn=>{const old=console.error;console.error=()=>{};try{return await fn();}finally{console.error=old;}};
let passed=0;
async function test(name,fn){reset();await fn();passed++;console.log(`PASS ${name}`);}
async function main(){
  await test('Successful purge removes actual result storage, Auth and cascading account data',async()=>{
    assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);assert.deepEqual(removed,[{bucket:'results',paths:['output.png']}]);assert(authDeleted);assert.equal(db.users.length,0);assert.equal(db.billing.length,0);assert.equal(jobs().length,0);
  });
  await test('Storage failure is reported and preserved for retry before Auth or database deletion',async()=>{
    failures='storage';const result=await quiet(()=>worker.permanentlyPurgeUserAccount(uid));assert.equal(result.success,false);assert(!result.error.includes('secret'));assert.equal(account().status,'deleting');assert.equal(authCalls,0);assert.equal(jobs().length,1);
    failures=null;assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);
  });
  await test('Returned Auth errors cannot be silently treated as success',async()=>{
    failures='auth';assert.equal((await quiet(()=>worker.permanentlyPurgeUserAccount(uid))).success,false);assert.equal(db.users.length,1);assert.equal(jobs().length,1);
    failures=null;assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);
  });
  await test('DB failure after Auth deletion retains a job and retries without erasing recovery evidence',async()=>{
    failures='database';assert.equal((await quiet(()=>worker.permanentlyPurgeUserAccount(uid))).success,false);assert(authDeleted);assert.equal(account().status,'deleting');assert.equal(jobData().stage,'database');
    failures=null;assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);assert.equal(authCalls,1);
  });
  await test('Checkpoint crash after Auth acceptance safely handles user_not_found on retry',async()=>{
    failures='database';await quiet(()=>worker.permanentlyPurgeUserAccount(uid));const job=jobData();job.stage='auth';db.tokens[0].token=`account_purge:v1:${Buffer.from(JSON.stringify(job)).toString('base64url')}`;
    failures=null;assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);assert.equal(authCalls,2);
  });
  await test('Manifest creation failure rolls back the irreversible-state claim',async()=>{
    failures='manifest';assert.equal((await quiet(()=>worker.permanentlyPurgeUserAccount(uid))).success,false);assert.equal(account().status,'pending_deletion');assert.equal(jobs().length,0);assert.equal(removed.length,0);
  });
  await test('Future, active, suspended and manual-review accounts are never automatically purged',async()=>{
    for(const overrides of [{scheduledDeletionAt:new Date(Date.now()+86400000)},{status:'active'},{status:'suspended'},{deletionRecoveryRequested:true}]){
      reset(overrides);assert.equal((await worker.permanentlyPurgeUserAccount(uid)).skipped,true);assert.equal(removed.length,0);assert.equal(authCalls,0);
    }
  });
  await test('Explicit admin purge can start early only for a pending account',async()=>{
    reset({scheduledDeletionAt:new Date(Date.now()+86400000)});assert.equal((await worker.permanentlyPurgeUserAccount(uid,{immediate:true})).success,true);
    reset({status:'active'});assert.equal((await worker.permanentlyPurgeUserAccount(uid,{immediate:true})).skipped,true);
  });
  await test('Repeat/concurrent workers hold one lease and delete the account once',async()=>{
    const results=await Promise.all([worker.permanentlyPurgeUserAccount(uid),worker.permanentlyPurgeUserAccount(uid)]);assert.equal(results.filter(x=>x.success).length,1);assert.equal(authCalls,1);
    assert.equal((await worker.permanentlyPurgeUserAccount(uid)).skipped,true);
  });
  await test('Serializable conflicts retry without losing the deletion job',async()=>{
    conflict=true;assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);assert.equal(authCalls,1);
  });
  await test('Purge removes only this account email welcome jobs and markers',async()=>{
    db.rates=[{email:'creator@test.invalid',type:'welcome_pending:test'},{email:'CREATOR@test.invalid',type:'welcome_email_sent'},{email:'creator@test.invalid',type:'password_reset'},{email:'other@test.invalid',type:'welcome_pending:other'}];
    assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);
    assert.deepEqual(db.rates.map(row=>row.type),['password_reset','welcome_pending:other']);
  });
  await test('Cancelled account from stale cron selection is never deleted',async()=>{
    account().scheduledDeletionAt=new Date(Date.now()+86400000);assert(await lifecycle.cancelScheduledAccountDeletion(uid));assert.equal(account().status,'active');
    assert.equal((await worker.permanentlyPurgeUserAccount(uid,{immediate:true})).skipped,true);assert.equal(authCalls,0);
  });
  await test('Cleanup claim wins the race and prevents cancellation while files are being removed',async()=>{
    account().scheduledDeletionAt=new Date(Date.now()+86400000);onRemove=async()=>assert.equal(await lifecycle.cancelScheduledAccountDeletion(uid),null);
    assert.equal((await worker.permanentlyPurgeUserAccount(uid,{immediate:true})).success,true);
  });
  await test('Grace expiry prevents a late cancellation even if cron has not run',async()=>{
    assert.equal(await lifecycle.cancelScheduledAccountDeletion(uid),null);assert.equal(account().status,'pending_deletion');
  });
  await test('Storage parsing rejects external buckets, foreign hosts and unsafe object paths',()=>{
    for(const value of ['https://other.test/storage/v1/object/public/results/file.png',url('admin-private','x'),url('results','folder/%2e%2e%2fsecret'),'blob:browser-only',url('results','file%00.png')])assert.equal(worker.accountStorageObject(value),null);
    assert.deepEqual(worker.accountStorageObject(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/sign/results/folder/with%20space.png?token=ignored`),{bucket:'results',path:'folder/with space.png'});
  });
  await test('Files across result, legacy drive, jobs and support documents are covered and deduplicated',async()=>{
    db.files.push({userId:uid,originalUrl:url('results','output.png'),resultUrl:url('exismic-drive','old.png')});db.jobs.push({userId:uid,resultUrl:url('results','job.png')});db.documents.push({user_id:uid,source_url:url('results','doc.pdf')});db.agents.push({user_id:uid,widget_icon_url:url('results','icon.png')});
    await worker.permanentlyPurgeUserAccount(uid);assert(removed.some(x=>x.bucket==='exismic-drive'&&x.paths.includes('old.png')));assert.equal(removed.flatMap(x=>x.paths).filter(x=>x==='output.png').length,1);assert.equal(db.documents.length,0);assert.equal(db.agents.length,0);
  });
  await test('Old avatar pagination covers hyphen and legacy underscore names without foreign avatars',async()=>{
    avatars=Array.from({length:130},(_,i)=>({id:`avatar-${i}`,name:`${uid}-${i}.jpg`}));avatars.push({id:'legacy',name:`${uid}_old.jpg`});avatars.push({id:'foreign',name:`${otherUid}-${uid}.jpg`});account().customAvatarUrl=url('avatars',`${otherUid}-foreign.jpg`);
    await worker.permanentlyPurgeUserAccount(uid);const paths=removed.filter(x=>x.bucket==='avatars').flatMap(x=>x.paths);assert.equal(paths.length,131);assert(!paths.some(x=>x.startsWith(otherUid)));
  });
  await test('A copied foreign result URL cannot delete another users referenced file or drive upload',async()=>{
    db.files.push({userId:otherUid,resultUrl:url('results','foreign%20file.png')});
    db.files.push({userId:uid,resultUrl:url('results','foreign%20file.png')});
    db.files.push({userId:uid,resultUrl:url('results',`drive_${otherUid}_123.png`)});
    await worker.permanentlyPurgeUserAccount(uid);assert.deepEqual(removed,[{bucket:'results',paths:['output.png']}]);
  });
  await test('Deadline interruption keeps the job available for another run',async()=>{
    assert.equal((await quiet(()=>worker.permanentlyPurgeUserAccount(uid,{deadline:Date.now()-1}))).success,false);assert.equal(authCalls,0);assert.equal(jobs().length,1);assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);
  });
  await test('A hard-stop lease blocks duplicate workers until it expires, then resumes',async()=>{
    failures='database';await quiet(()=>worker.permanentlyPurgeUserAccount(uid));let job=jobData();job.leaseUntil=new Date(Date.now()+300000).toISOString();db.tokens[0].token=`account_purge:v1:${Buffer.from(JSON.stringify(job)).toString('base64url')}`;
    failures=null;assert.equal((await worker.permanentlyPurgeUserAccount(uid)).skipped,true);job.leaseUntil=new Date(Date.now()-1).toISOString();db.tokens[0].token=`account_purge:v1:${Buffer.from(JSON.stringify(job)).toString('base64url')}`;
    assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);
  });
  await test('A durable job finishes remaining cleanup if Auth deletion cascaded the app row',async()=>{
    failures='database';await quiet(()=>worker.permanentlyPurgeUserAccount(uid));db.users=[];failures=null;
    assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);assert.equal(jobs().length,0);
  });
  await test('Password cancellation restores immediately and leaves no authenticated session',async()=>{
    account().scheduledDeletionAt=new Date(Date.now()+86400000);const reply=await recover.POST(request({email:'creator@test.invalid',password:'correct-password',reason:'Legacy cancel button'}));
    assert.equal(reply.status,200);assert.equal((await reply.json()).cancelled,true);assert.equal(account().status,'active');assert.equal(sessionUser,null);assert.equal(emails[0][1],true);
  });
  await test('Invalid password and cross-origin requests cannot restore an account',async()=>{
    account().scheduledDeletionAt=new Date(Date.now()+86400000);assert.equal((await recover.POST(request({email:'creator@test.invalid',password:'bad'}))).status,401);
    assert.equal((await recover.POST(request({email:'creator@test.invalid',password:'correct-password'},{origin:'https://evil.test'}))).status,403);assert.equal(account().status,'pending_deletion');
  });
  await test('OAuth-style recovery cookie is hashed, short-lived, deletion-bound and one-use',async()=>{
    account().scheduledDeletionAt=new Date(Date.now()+86400000);await proof.issueDeletionRecoveryProof(uid,account().scheduledDeletionAt);
    const cookie=jar.get(proof.DELETION_RECOVERY_COOKIE);assert(cookie.options.httpOnly);assert.equal(cookie.options.sameSite,'strict');const raw=JSON.parse(Buffer.from(cookie.value,'base64url').toString());assert(!db.tokens[0].token.includes(raw.token));assert(cookie.options.maxAge<=600);
    const reply=await recover.POST(request({action:'cancel',email:'wrong@test.invalid'}));assert.equal(reply.status,200);assert.equal(account().status,'active');assert.equal(db.tokens.length,0);assert.equal(jar.has(proof.DELETION_RECOVERY_COOKIE),false);
    assert.equal((await recover.POST(request({action:'cancel'}))).status,401);
  });
  await test('Expired, forged and old-deletion cookies cannot restore the account',async()=>{
    account().scheduledDeletionAt=new Date(Date.now()+86400000);await proof.issueDeletionRecoveryProof(uid,account().scheduledDeletionAt);db.tokens[0].expires=new Date(Date.now()-1);assert.equal(await proof.getDeletionRecoveryProof(),null);
    jar.set(proof.DELETION_RECOVERY_COOKIE,{value:Buffer.from(JSON.stringify({userId:uid,token:'a'.repeat(64),deadline:+account().scheduledDeletionAt})).toString('base64url')});assert.equal(await proof.getDeletionRecoveryProof(),null);
    await proof.issueDeletionRecoveryProof(uid,account().scheduledDeletionAt);account().scheduledDeletionAt=new Date(Date.now()+2*86400000);assert.equal((await recover.POST(request({action:'cancel'}))).status,409);assert.equal(account().status,'pending_deletion');
  });
  await test('Scheduled deletion requires authenticated ownership, confirmation, and seven days',async()=>{
    reset({status:'active',scheduledDeletionAt:null});assert.equal((await schedule.POST(request({confirmation:'DELETE'}))).status,401);
    sessionUser={id:uid,email:'creator@test.invalid'};assert.equal((await schedule.POST(request({confirmation:'wrong'}))).status,400);
    const started=Date.now(),reply=await schedule.POST(request({confirmation:'DELETE'}));assert.equal(reply.status,200);assert.equal(account().status,'pending_deletion');assert(account().scheduledDeletionAt>=new Date(started+7*86400000));assert.equal(sessionUser,null);
  });
  await test('Repeated deletion cannot restart the seven-day clock',async()=>{
    const original=+account().scheduledDeletionAt;sessionUser={id:uid,email:'creator@test.invalid'};assert.equal((await schedule.POST(request({confirmation:'DELETE'}))).status,409);assert.equal(+account().scheduledDeletionAt,original);
  });
  await test('An active recurring subscription must be cancelled before requesting deletion',async()=>{
    reset({status:'active',subscriptionId:'I-MOCK',subscriptionStatus:'active'});sessionUser={id:uid,email:'creator@test.invalid'};
    const reply=await schedule.POST(request({confirmation:'DELETE'}));assert.equal(reply.status,409);assert.equal(account().status,'active');assert.equal(renewalCalls,0);
  });
  await test('Permanent cleanup stops a legacy PayPal renewal before deleting any files',async()=>{
    account().subscriptionId='I-MOCK';onRemove=async()=>assert.equal(renewalStatus,'CANCELLED');assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);assert.equal(renewalCalls,1);
  });
  await test('Payment provider failure leaves storage and Auth intact and retries safely',async()=>{
    account().subscriptionId='I-MOCK';failures='renewal';assert.equal((await quiet(()=>worker.permanentlyPurgeUserAccount(uid))).success,false);assert.equal(removed.length,0);assert.equal(authCalls,0);
    failures=null;assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);assert.equal(renewalCalls,1);
  });
  await test('Already cancelled PayPal subscriptions are not cancelled again',async()=>{
    account().subscriptionId='I-MOCK';renewalStatus='CANCELLED';assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);assert.equal(renewalCalls,0);
  });
  await test('Razorpay immediate cancellation is confirmed before purge',async()=>{
    process.env.RAZORPAY_KEY_ID='offline';process.env.RAZORPAY_KEY_SECRET='offline';account().subscriptionId='sub_mock';renewalStatus='active';
    assert.equal((await worker.permanentlyPurgeUserAccount(uid)).success,true);assert.equal(renewalCalls,1);assert.equal(renewalStatus,'cancelled');
  });
  await test('Missing secret, wrong bearer and query-string secret cannot invoke cleanup',async()=>{
    delete process.env.CRON_SECRET;assert.equal((await cron.GET(new Request('https://www.exismic.xyz/api/cron/purge-deleted-accounts'))).status,401);
    process.env.CRON_SECRET='offline-cron';assert.equal((await cron.GET(new Request('https://www.exismic.xyz/api/cron/purge-deleted-accounts?key=offline-cron'))).status,401);assert.equal(authCalls,0);
  });
  await test('Authorized cron reports failures truthfully without returning account emails or internals',async()=>{
    process.env.CRON_SECRET='offline-cron';failures='auth';const reply=await quiet(()=>cron.GET(new Request('https://www.exismic.xyz/api/cron/purge-deleted-accounts',{headers:{authorization:'Bearer offline-cron'}})));
    const body=await reply.json();assert.equal(body.purgedCount,0);assert.equal(body.failedCount,1);assert(!JSON.stringify(body).includes('creator@test.invalid'));assert(!JSON.stringify(body).includes('secret detail'));
  });
  await test('Daily purge schedule retains existing reward jobs and cancellation buttons request cancellation',()=>{
    const config=JSON.parse(fs.readFileSync(path.join(root,'vercel.json')));assert(config.crons.some(x=>x.path==='/api/cron/purge-deleted-accounts'&&x.schedule==='15 7 * * *'));assert(config.crons.some(x=>x.path==='/api/cron/streak-maintenance'));
    for(const file of ['src/app/auth/login/page.tsx','src/app/account/settings/page.tsx'])assert(fs.readFileSync(path.join(root,file),'utf8').includes('action: "cancel"'));
  });
  console.log(`${passed} account-deletion checks passed. All database/storage/provider/email work mocked.`);
}
main().catch(error=>{console.error(error);process.exitCode=1;});
