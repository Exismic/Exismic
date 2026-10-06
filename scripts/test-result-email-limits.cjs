/* Fully offline: real request limiter, quota, email route, file proofs, mail rendering and client retries.
   No real database, storage, provider requests or outgoing mail. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const ts=require('typescript'),{Prisma}=require('@prisma/client'),{randomUUID,createHash}=require('node:crypto');
const root=path.resolve(__dirname,'..');
process.env.SUPABASE_SERVICE_ROLE_KEY='offline-result-email-proof-test-only';
process.env.NEXT_PUBLIC_SUPABASE_URL='https://storage.test.invalid';
const RealDate=Date;let clock=Date.parse('2026-10-06T08:00:00Z');
global.Date=class extends RealDate {constructor(...args){super(...(args.length?args:[clock]));}static now(){return clock;}};
global.fetch=async()=>{throw new Error('Network forbidden in result email tests');};
let rows=[],account,session,offline=false,conflicts=0,providerCalls=[],outcome='accepted',storageCalls=0,objects=new Map(),receipts=[];
let providerHook,failReceipt=false,tail=Promise.resolve(),tests=0,uploadToken='offline-upload-token';
const clone=x=>structuredClone(x);
function match(row,where={}){
 return Object.entries(where).every(([key,value])=>{
  if(key==='OR')return value.some(part=>match(row,part));
  if(value instanceof RealDate)return +row[key]===+value;
  if(value&&typeof value==='object'){
   if('startsWith'in value)return row[key]?.startsWith(value.startsWith);
   if('lte'in value)return row[key]<=value.lte;
   if('gt'in value)return row[key]>value.gt;
   return false;
  }return row[key]===value;
 });
}
function healthy(){if(offline)throw new Error('Offline database unavailable');}
const table={
 async findFirst({where}){healthy();return clone(rows.find(x=>match(x,where))||null);},
 async findMany({where,take}={}){healthy();return clone(rows.filter(x=>match(x,where)).slice(0,take));},
 async create({data}){healthy();if(rows.some(x=>x.token===data.token))throw new Prisma.PrismaClientKnownRequestError('Duplicate',{code:'P2002',clientVersion:'offline'});rows.push(clone(data));return clone(data);},
 async updateMany({where,data}){
  healthy();
  if(failReceipt && data.token?.startsWith('result_email:') && JSON.parse(Buffer.from(data.token.split(':')[3],'base64url')).state==='sent')throw new Error('Offline delivery receipt unavailable');
  let count=0;for(const row of rows)if(match(row,where)){if(rows.some(x=>x!==row&&x.token===data.token))throw new Error('Duplicate token');Object.assign(row,clone(data));count++;}return {count};
 },
 async deleteMany({where}){healthy();const before=rows.length;rows=rows.filter(x=>!match(x,where));return {count:before-rows.length};},
};
const prisma={verificationToken:table,user:{async findUnique(){healthy();return clone(account);}},userFile:{async create({data}){receipts.push(data);}},
 async $transaction(fn){
  healthy();if(conflicts-->0)throw new Prisma.PrismaClientKnownRequestError('Serialization retry',{code:'P2034',clientVersion:'offline'});
  const previous=tail;let release;tail=new Promise(resolve=>release=resolve);await previous;const snapshot=clone(rows);
  try{return await fn(prisma);}catch(error){rows=snapshot;throw error;}finally{release();}
 }};
const storage={async getBucket(){return {data:{public:false}};},from(){return {
 async createSignedUploadUrl(p){storageCalls++;objects.set(p,new Blob([Buffer.from('test-png')],{type:'image/png'}));return {data:{token:uploadToken}};},
 async list(){return {data:[]};},
 async download(p){return {data:objects.get(p),error:objects.has(p)?null:{message:'Incomplete'}};},
 async createSignedUrl(p){return {data:{signedUrl:'https://storage.test.invalid/private/'+p+'?token=offline'}};},
 async remove(){return {data:[]};},
 };}};
const provider={emails:{async send(payload,options){
 providerCalls.push({payload,options});if(providerHook)await providerHook();
 if(outcome==='throw')throw new Error('Offline provider response lost');
 if(outcome==='no-id')return {data:null,error:null};
 if(outcome==='rejected')return {data:null,error:{message:'Rejected',statusCode:422}};
 if(outcome==='timeout')return {data:null,error:{message:'Timeout',statusCode:408}};
 if(outcome==='server-error')return {data:null,error:{message:'Temporary',statusCode:503}};
 if(outcome==='domain-fallback'){return providerCalls.length===1?{error:{message:'Domain not verified',statusCode:403}}:{error:{message:'Temporary fallback',statusCode:503}};}
 return {data:{id:'mail-'+providerCalls.length},error:null};
}}};
const originalLoad=Module._load,originalResolve=Module._resolveFilename;
Module._resolveFilename=function(request,...args){return originalResolve.call(this,request.startsWith('@/')?path.join(root,'src',request.slice(2)):request,...args);};
Module._load=function(request,parent,...args){
 if(request==='server-only')return {};
 if(request==='@/lib/prisma')return {prisma};
 if(request==='@/data/tools')return {ALL_TOOLS:[]};
 if(request==='@/utils/supabase/server')return {createClient:async()=>({auth:{getUser:async()=>({data:{user:session},error:null})}})};
 if(request==='@supabase/supabase-js')return {createClient:()=>({storage})};
 if(request==='./resend')return {resend:provider};
 if(request==='./email-diagnostics')return {recordEmailEvent:()=>{}};
 if(request==='./site-url')return {getServerSiteUrl:()=> 'https://www.exismic.xyz'};
 if(request==='@/lib/billing/receipt-pdf')return {createReceiptPdf:()=>{throw new Error('Not a receipt test');}};
 return originalLoad.call(this,request,parent,...args);
};
require.extensions['.ts']=function(mod,filename){mod._compile(ts.transpileModule(fs.readFileSync(filename,'utf8'),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText,filename);};
const logs=console.error,warnings=console.warn;console.error=()=>{};console.warn=()=>{};
const {NextRequest}=require('next/server'),api=require('../src/lib/api-security.ts');
const limits=require('../src/lib/request-rate-limit.ts'),quota=require('../src/lib/result-email-quota.ts');
const route=require('../src/app/api/tools/email-result/route.ts'),{ResultEmailClient}=require('../src/lib/client/result-email-client.ts');
const email='creator@test.invalid',digest=createHash('sha256').update('test-png').digest('hex');
function reset(tier='free'){
 rows=[];objects=new Map();providerCalls=[];receipts=[];storageCalls=0;offline=false;failReceipt=false;outcome='accepted';providerHook=undefined;conflicts=0;uploadToken='offline-upload-token';
 clock=RealDate.parse('2026-10-06T08:00:00Z');session=tier==='guest'?null:{id:'user-1',email};
 account={id:'user-1',plan:tier==='pro'?'pro':'free',status:'active',subscriptionStatus:tier==='pro'?'active':'none',planExpiresAt:tier==='pro'?new Date(clock+86400000):null};
}
function request(body,ip='192.0.2.1'){return new NextRequest('https://www.exismic.xyz/api/tools/email-result',{method:'POST',headers:{'content-type':'application/json','x-forwarded-for':ip},body:JSON.stringify(body)});}
const body=(extra={})=>({email,toolType:'ai',toolName:'Test tool',title:'Test result',content:'Example output',requestId:randomUUID(),...extra});
async function post(value){const response=await route.POST(request(value));return {status:response.status,...await response.json()};}
const get=async()=>{const response=await route.GET(new NextRequest('https://www.exismic.xyz/api/tools/email-result',{headers:{'x-forwarded-for':'192.0.2.1'}}));return {status:response.status,...await response.json()};};
async function test(name,fn){reset();await fn();tests++;console.log('PASS '+name);}
(async()=>{
 await test('Free allows exactly 10 daily sends; the 11th is refused',async()=>{for(let i=0;i<10;i++){assert.equal((await post(body())).success,true);clock+=16000;}const r=await post(body());assert.equal(r.status,429);assert.equal(r.quota.used,10);assert.equal(providerCalls.length,10);});
 await test('Active Pro allows exactly 50 sends, with no 51st delivery',async()=>{reset('pro');for(let i=0;i<50;i++){assert.equal((await post(body())).success,true);clock+=16000;}const r=await post(body());assert.equal(r.status,429);assert.equal(r.quota.limit,50);assert.equal(providerCalls.length,50);});
 await test('Guests have 2 daily sends per IP',async()=>{reset('guest');for(let i=0;i<2;i++){assert.equal((await post(body())).success,true);clock+=61000;}assert.equal((await post(body())).status,429);assert.equal((await get()).quota.limit,2);});
 await test('Expired Pro, inactive status and invalid expiry cannot increase allowance',async()=>{reset('pro');account.planExpiresAt=new Date(clock-1);assert.equal((await get()).quota.limit,10);account.planExpiresAt=new Date(clock+100000);account.subscriptionStatus='past_due';assert.equal((await get()).quota.limit,10);account.subscriptionStatus='active';account.planExpiresAt=new Date('invalid');assert.equal((await get()).quota.limit,10);});
 await test('Cancelled renewal retains Pro until paid access expires',async()=>{reset('pro');account.subscriptionStatus='cancelled';assert.equal((await get()).quota.limit,50);clock=+account.planExpiresAt;assert.equal((await get()).quota.limit,10);});
 await test('Client-supplied Pro and large balances do not grant Pro allowance',async()=>{account.dailyCredits=99999999;assert.equal((await post(body({plan:'pro',limit:5000}))).quota.limit,10);});
 await test('Upgrading adds 40 available slots without resetting usage',async()=>{assert.equal((await post(body())).success,true);account.plan='pro';account.subscriptionStatus='active';account.planExpiresAt=new Date(clock+86400000);const r=await get();assert.equal(r.quota.used,1);assert.equal(r.quota.remaining,49);});
 await test('GET is no-store and shows the noon IST reset',async()=>{const res=await route.GET(new NextRequest('https://www.exismic.xyz/api/tools/email-result'));assert.equal(res.headers.get('Cache-Control'),'private, no-store');assert.equal((await res.json()).quota.resetsAt,'2026-10-07T06:30:00.000Z');});
 await test('Daily slots reset exactly at noon IST',async()=>{clock=RealDate.parse('2026-10-06T06:29:50Z');assert.equal((await post(body())).quota.used,1);assert.equal((await get()).quota.used,1);clock=RealDate.parse('2026-10-06T06:30:00Z');assert.equal((await get()).quota.used,0);});
 await test('Concurrent email clicks call the provider once',async()=>{const responses=await Promise.all(Array.from({length:12},()=>post(body())));assert.equal(responses.filter(x=>x.success).length,1);assert.equal(providerCalls.length,1);assert.equal((await get()).quota.used,1);});
 await test('Concurrent quota reservations cannot exceed the Free allowance',async()=>{const c={owner:'user:race',tier:'free'};const rs=await Promise.all(Array.from({length:20},(_,i)=>quota.reserveResultEmail(c,randomUUID(),'fp-'+i,false)));assert.equal(rs.filter(x=>x.kind==='ready').length,10);assert.equal((await quota.getResultEmailQuota(c)).remaining,0);});
 await test('Different owners with identical requests do not collide on unique tokens',async()=>{await quota.reserveResultEmail({owner:'user:a',tier:'free'},randomUUID(),'same',false);await quota.reserveResultEmail({owner:'user:b',tier:'free'},randomUUID(),'same',false);assert.equal(rows.length,2);assert.notEqual(rows[0].token,rows[1].token);});
 await test('Known provider rejection returns the slot and permits a later new request',async()=>{outcome='rejected';let r=await post(body());assert.equal(r.status,503);assert.equal(r.restartRequest,true);assert.equal(r.quota.remaining,10);clock+=16000;outcome='accepted';r=await post(body());assert.equal(r.quota.used,1);});
 await test('Repeated failed sends never consume the daily successful-send allowance',async()=>{outcome='rejected';for(let i=0;i<12;i++){const r=await post(body());assert.equal(r.quota.remaining,10);clock+=16000;}assert.equal((await get()).quota.used,0);});
 for(const kind of ['throw','no-id','timeout','server-error'])await test('Uncertain '+kind+' delivery holds a slot and retry does not resend',async()=>{outcome=kind;const b=body();assert.equal((await post(b)).pending,true);const r=await post(b);assert.equal(r.pending,true);assert.equal(r.quota.reserved,1);assert.equal(providerCalls.length,1);clock+=86400000;assert.equal((await post(b)).pending,true);assert.equal(providerCalls.length,1);});
 await test('Fallback failure uses the actual uncertain provider outcome',async()=>{outcome='domain-fallback';const r=await post(body());assert.equal(r.pending,true);assert.equal(r.quota.reserved,1);assert.equal(providerCalls.length,2);});
 await test('Repeated success reuses its receipt and slot without another mail or library entry',async()=>{const b=body();assert.equal((await post(b)).success,true);assert.equal((await post(b)).success,true);assert.equal(providerCalls.length,1);assert.equal(receipts.length,1);assert.equal((await get()).quota.used,1);assert(providerCalls[0].options.idempotencyKey.endsWith(b.requestId));});
 await test('Same request ID rejects a changed recipient or changed content',async()=>{const b=body();await post(b);for(const change of [{email:'other@test.invalid'},{content:'Changed'}])assert.equal((await post({...b,...change})).status,409);assert.equal(providerCalls.length,1);});
 await test('A duplicate retry while the provider is busy remains pending',async()=>{let release,entered;const wait=new Promise(resolve=>entered=resolve);providerHook=()=>{entered();return new Promise(resolve=>release=resolve);};const b=body(),first=post(b);await wait;assert.equal((await post(b)).pending,true);release();assert.equal((await first).success,true);assert.equal(providerCalls.length,1);});
 await test('Missing or invalid input never calls storage or provider',async()=>{for(const value of [body({requestId:undefined}),body({email:'no'}),body({content:'',fileUrl:'blob:bad'}),body({content:'x'.repeat(50001)}),null])assert.equal((await post(value)).status,400);assert.equal(rows.length,0);assert.equal(providerCalls.length,0);assert.equal(storageCalls,0);});
 await test('Prepared upload reserves one slot, retries reuse it and sending consumes that same slot',async()=>{const b=body({fileSize:8,fileMime:'image/png',fileDigest:digest});const p=await post({...b,action:'prepare-upload'});assert(p.upload);assert.equal(p.quota.reserved,1);assert.equal(p.quota.used,0);assert.equal((await post({...b,action:'prepare-upload'})).upload.path,p.upload.path);assert.equal(storageCalls,1);const sent=await post({...b,fileProof:p.upload.proof});assert.equal(sent.success,true);assert.equal(sent.quota.used,1);assert.equal(sent.quota.reserved,0);assert.equal(providerCalls[0].payload.attachments[0].content.toString(),'test-png');});
 await test('Exhausted send allowance prevents storage allocation',async()=>{for(let i=0;i<10;i++){await post(body());clock+=16000;}const r=await post(body({action:'prepare-upload',fileSize:8,fileMime:'image/png',fileDigest:digest}));assert.equal(r.status,429);assert.equal(storageCalls,0);});
 await test('Invalid file proof returns its slot without a provider call',async()=>{const r=await post(body({fileSize:8,fileMime:'image/png',fileDigest:digest,fileProof:'forged'}));assert.equal(r.status,400);assert.equal(r.quota.remaining,10);assert.equal(providerCalls.length,0);});
 await test('A file proof is bound to its owner and email',async()=>{const b=body({fileSize:8,fileMime:'image/png',fileDigest:digest});const p=await post({...b,action:'prepare-upload'});session.id='another';account.id='another';const r=await post({...b,requestId:randomUUID(),fileProof:p.upload.proof});assert.equal(r.status,400);assert.equal(providerCalls.length,0);});
 await test('A valid proof for another request cannot replace the reserved file',async()=>{const b=body({fileSize:8,fileMime:'image/png',fileDigest:digest});const p=await post({...b,action:'prepare-upload'});clock+=16000;const other=await post({...b,requestId:randomUUID(),action:'prepare-upload'});const r=await post({...b,fileProof:other.upload.proof});assert.equal(r.status,400);assert.equal(providerCalls.length,0);assert(p.upload);});
 await test('Actual file bytes must match the selected result digest',async()=>{const b=body({fileSize:8,fileMime:'image/png',fileDigest:'a'.repeat(64)});const p=await post({...b,action:'prepare-upload'});const r=await post({...b,fileProof:p.upload.proof});assert.equal(r.status,400);assert.equal(r.quota.remaining,10);assert.equal(providerCalls.length,0);});
 await test('Abandoned reservations expire without consuming successful sends',async()=>{const b=body({fileSize:8,fileMime:'image/png',fileDigest:digest});await post({...b,action:'prepare-upload'});assert.equal((await get()).quota.remaining,9);clock+=20*60000;assert.equal((await get()).quota.remaining,10);assert.equal((await post(b)).restartRequest,true);});
 await test('Downgrading cannot send prepared files above the current Free cap',async()=>{reset('pro');for(let i=0;i<11;i++){await post(body());clock+=16000;}const b=body({fileSize:8,fileMime:'image/png',fileDigest:digest}),p=await post({...b,action:'prepare-upload'});account.subscriptionStatus='past_due';assert.equal((await post({...b,fileProof:p.upload.proof})).status,429);assert.equal(providerCalls.length,11);});
 await test('Database failure fails closed without memory fallback, storage or mail',async()=>{offline=true;assert.equal((await post(body())).status,503);assert.equal((await get()).status,503);assert.equal((await limits.consumeRequestLimit('x',1,1000)).unavailable,true);assert.equal(providerCalls.length,0);assert.equal(storageCalls,0);});
 await test('Failure to save an accepted delivery never grants a replacement send',async()=>{failReceipt=true;const b=body();assert.equal((await post(b)).status,503);assert.equal(providerCalls.length,1);failReceipt=false;assert.equal((await post(b)).pending,true);assert.equal((await get()).quota.reserved,1);assert.equal(providerCalls.length,1);});
 await test('Shared tool counters survive new module instances',async()=>{assert((await api.checkRateLimit('shared',2,10000)).allowed);delete require.cache[require.resolve('../src/lib/request-rate-limit.ts')];const fresh=require('../src/lib/request-rate-limit.ts');assert((await fresh.consumeRequestLimit('shared',2,10000)).allowed);assert.equal((await limits.consumeRequestLimit('shared',2,10000)).allowed,false);});
 await test('Shared counter concurrent requests cannot exceed their limit',async()=>{const rs=await Promise.all(Array.from({length:20},()=>limits.consumeRequestLimit('parallel',5,10000)));assert.equal(rs.filter(x=>x.allowed).length,5);});
 await test('Counter expiry renews the window atomically',async()=>{assert((await limits.consumeRequestLimit('expiring',1,10000)).allowed);assert.equal((await limits.consumeRequestLimit('expiring',1,10000)).retryAfter,10);clock+=10000;assert((await limits.consumeRequestLimit('expiring',1,10000)).allowed);assert.equal(rows.length,1);});
 await test('Serialization conflicts retry before granting a shared counter',async()=>{conflicts=2;assert((await limits.consumeRequestLimit('retry',1,10000)).allowed);assert.equal((await limits.consumeRequestLimit('retry',1,10000)).allowed,false);});
 await test('Damaged counters fail closed and never create a new allowance',async()=>{await limits.consumeRequestLimit('damaged',1,10000);rows[0].token='invalid';assert.equal((await limits.consumeRequestLimit('damaged',1,10000)).unavailable,true);assert.equal(rows.length,1);});
 await test('Counter response distinguishes an outage from an exhausted limit',async()=>{assert.equal(api.rateLimitResponse(30,true).status,503);assert.equal(api.rateLimitResponse(30).status,429);});
 await test('Daily cleanup removes only expired counters and receipts',async()=>{rows.push({identifier:'request_rate:old',token:'one',expires:new Date(clock-1)},{identifier:'result_email_job:old',token:'two',expires:new Date(clock-1)},{identifier:'auth_cleanup:keep',token:'three',expires:new Date(clock-1)},{identifier:'request_rate:active',token:'four',expires:new Date(clock+1)});assert.equal((await limits.cleanupRequestLimits()).count,2);assert.equal(rows.length,2);});
 await test('Too many known failures still trigger the independent attempt limit',async()=>{outcome='rejected';for(let i=0;i<40;i++){assert.equal((await post(body())).status,503);clock+=16000;}const r=await post(body());assert.equal(r.status,429);assert.equal(providerCalls.length,40);assert.equal((await get()).quota.remaining,10);});
 await test('All previous memory-only callers await the persistent limit',async()=>{const walk=dir=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?walk(path.join(dir,entry.name)):entry.name.endsWith('.ts')?[path.join(dir,entry.name)]:[]);for(const f of [...walk(path.join(root,'src/app/api')),path.join(root,'src/lib/audio-route.ts')])assert(!/=\s*checkRateLimit\(/.test(fs.readFileSync(f,'utf8')),f);});
 await test('Browser retry after a lost send response preserves request ID and sends one mail',async()=>{
  const saved=global.fetch;let lost=true,ids=[];
  global.fetch=async(_url,init)=>{const data=JSON.parse(init.body);ids.push(data.requestId);const res=await route.POST(request(data));if(lost){lost=false;throw new Error('Response lost');}return res;};
  try{const c=new ResultEmailClient(),input={email,toolType:'ai',toolName:'Test',title:'Text',content:'output',owner:session.id};await assert.rejects(()=>c.send(input,async()=>({})));assert.equal((await c.send(input,async()=>({}))).success,true);assert.equal(ids[0],ids[1]);assert.equal(providerCalls.length,1);}finally{global.fetch=saved;}
 });
 await test('Browser file retry reuses its prepared upload and includes the same digest',async()=>{
  const saved=global.fetch;let uploads=0,lost=true,posted=[];
  global.fetch=async(url,init)=>{if(url==='blob:test')return new Response(new Blob(['test-png'],{type:'image/png'}));const data=JSON.parse(init.body);posted.push(data);const res=await route.POST(request(data));if(!data.action&&lost){lost=false;throw new Error('Response lost');}return res;};
  try{const c=new ResultEmailClient(),input={email,toolType:'image',toolName:'Image',title:'PNG',fileUrl:'blob:test',owner:session.id};const upload=async()=>{uploads++;return {};};await assert.rejects(()=>c.send(input,upload));assert.equal((await c.send(input,upload)).success,true);assert.equal(uploads,1);assert.equal(storageCalls,1);assert.equal(providerCalls.length,1);assert.equal(posted[0].fileDigest,digest);assert.equal(posted[0].requestId,posted[1].requestId);}finally{global.fetch=saved;}
 });
 await test('Browser known failure starts a new identity after the server returns the slot',async()=>{
  const saved=global.fetch,ids=[];outcome='rejected';global.fetch=async(_url,init)=>{const data=JSON.parse(init.body);ids.push(data.requestId);return route.POST(request(data));};
  try{const c=new ResultEmailClient(),input={email,toolType:'ai',toolName:'Test',title:'Text',content:'output',owner:session.id};assert.equal((await c.send(input,async()=>({}))).restartRequest,true);clock+=16000;outcome='accepted';assert.equal((await c.send(input,async()=>({}))).success,true);assert.notEqual(ids[0],ids[1]);assert.equal((await get()).quota.used,1);}finally{global.fetch=saved;}
 });
 await test('Compact upload records keep large recipient/title/proof data out of indexed tokens',async()=>{
  uploadToken='x'.repeat(1000);const b=body({email:'a'.repeat(220)+'@test.invalid',title:'Long title '.repeat(45),fileSize:8,fileMime:'image/png',fileDigest:digest});
  const prepared=await post({...b,action:'prepare-upload'});assert(prepared.upload);
  const jobRow=rows.find(x=>x.identifier.startsWith('result_email_job:'));
  assert(Buffer.byteLength(jobRow.token)<=2100);const job=JSON.parse(Buffer.from(jobRow.token.split(':')[3],'base64url'));
  assert.equal(job.upload.proof,undefined);assert.equal(job.upload.bucket,undefined);
  assert.equal((await post({...b,action:'prepare-upload'})).upload.proof,prepared.upload.proof);
 });
 await test('Unexpectedly oversized upload credentials fail safely and release the slot',async()=>{
  uploadToken='x'.repeat(5000);const r=await post(body({action:'prepare-upload',fileSize:8,fileMime:'image/png',fileDigest:digest}));
  assert.equal(r.status,400);assert.equal(r.quota.remaining,10);assert.equal(providerCalls.length,0);
 });
 await test('Free upload retries/abandonments stop at 20 daily allocations without consuming sends',async()=>{
  for(let i=0;i<20;i++){assert((await post(body({action:'prepare-upload',fileSize:8,fileMime:'image/png',fileDigest:digest}))).upload);clock+=20*60000+1;}
  const r=await post(body({action:'prepare-upload',fileSize:8,fileMime:'image/png',fileDigest:digest}));
  assert.equal(r.status,429);assert.equal(r.restartRequest,true);assert.equal(storageCalls,20);assert.equal(r.quota.used,0);assert.equal(r.quota.remaining,10);
 });
 await test('Guest file upload budget resets at the daily boundary',async()=>{
  reset('guest');
  for(let i=0;i<4;i++){assert((await post(body({action:'prepare-upload',fileSize:8,fileMime:'image/png',fileDigest:digest}))).upload);clock+=20*60000+1;}
  assert.equal((await post(body({action:'prepare-upload',fileSize:8,fileMime:'image/png',fileDigest:digest}))).status,429);
  clock=RealDate.parse('2026-10-07T06:30:00Z');assert((await post(body({action:'prepare-upload',fileSize:8,fileMime:'image/png',fileDigest:digest}))).upload);
 });
 await test('Cached upload retry neither allocates another file nor spends upload budget',async()=>{
  const b=body({fileSize:8,fileMime:'image/png',fileDigest:digest}),p=await post({...b,action:'prepare-upload'});
  for(let i=0;i<4;i++)assert.equal((await post({...b,action:'prepare-upload'})).upload.path,p.upload.path);
  assert.equal(storageCalls,1);const counters=rows.filter(x=>x.identifier.startsWith('request_rate:'));assert(counters.every(x=>x.token.endsWith(':1')));
 });
 await test('Unconfirmed deliveries explain the held slot rather than promising automatic retries',async()=>{
  outcome='throw';const b=body();const first=await post(b),again=await post(b);
  assert.match(first.message,/could not confirm/i);assert.match(again.message,/will not be resent automatically/i);
 });
 await test('Oversized indexed job records fail closed and roll back their reservation',async()=>{
  await assert.rejects(()=>quota.reserveResultEmail({owner:'user:oversized',tier:'free'},randomUUID(),'x'.repeat(3000),false),/record too large/i);
  assert.equal(rows.length,0);
 });
 console.error=logs;console.warn=warnings;console.log(tests+' offline result-email/rate-limit checks passed.');
})().catch(error=>{console.error=logs;console.warn=warnings;console.error(error);process.exitCode=1;});
