/* Execute existing UI event handlers with lightweight hook/dependency mocks.
   This is not a browser rendering/layout test. App sources are not changed. */
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const repo=path.resolve(__dirname,'..');
const ts=require(path.join(repo,'node_modules/typescript'));
const realReact=require(path.join(repo,'node_modules/react'));
let state=[],cursor=0,effects=[],params,resetCalls=0,validateCalls=0,throwForgot=false,throwValidation=false,verifyCalls=0;
const hooks={
  ...realReact,
  useState(initial){const index=cursor++;if(!(index in state))state[index]=typeof initial==='function'?initial():initial;return [state[index],value=>state[index]=typeof value==='function'?value(state[index]):value];},
  useEffect(fn){effects.push(fn);},
};
const actions={
  updatePasswordAction:async()=>{resetCalls++;return {success:true};},
  validateResetPasswordTokenAction:async(_email,token)=>{validateCalls++;if(throwValidation)throw new Error('Offline link check interrupted');return {valid:/^pwd_reset:[a-f0-9]{64}$/.test(token)};},
  verifyOtpAction:async()=>{verifyCalls++;return {error:'Try another code'};},
  forgotPasswordAction:async()=>{if(throwForgot)throw new Error('Offline network interruption');return {success:true};},
};
const original=Module._load;
Module._load=function(request,...rest){
  if(request==='react')return hooks;
  if(request==='next/navigation')return {useSearchParams:()=>params};
  if(request==='framer-motion')return {motion:new Proxy({}, {get:(_obj,name)=>String(name)}),AnimatePresence:'div'};
  if(request==='lucide-react')return new Proxy({}, {get:()=> 'i'});
  if(request==='next/link')return 'a';
  if(request==='@/app/actions/auth')return actions;
  if(request==='@/hooks/useAuth')return {useAuth:()=>({isRedirecting:false})};
  if(request==='@/lib/auth/redirect')return {safeAuthReturnPath:()=>'/dashboard'};
  if(request==='@/lib/site-url')return {getClientSiteUrl:()=> 'https://www.exismic.xyz'};
  if(request==='@/components/ui/ExismicLogo')return {ExismicMark:'div'};
  if(request==='@/components/ui/SilkBackground')return {SilkBackground:'div'};
  if(request==='@/utils/supabase/client')return {createClient:()=>({auth:{signOut:async()=>({error:null})}})};
  return original.call(this,request,...rest);
};
const realTimeout=global.setTimeout;
global.setTimeout=(fn,delay)=>{if(delay===800)queueMicrotask(fn);return 0;};
global.clearTimeout=()=>{};
global.document={getElementById:()=>({focus(){}})};
global.window={location:{replace(){},href:''}};
global.fetch=async()=>{throw new Error('Network forbidden');};
function load(relative,extra=''){
  const filename=path.join(repo,relative);
  const source=fs.readFileSync(filename,'utf8')+extra;
  const compiled=ts.transpileModule(source,{compilerOptions:{jsx:ts.JsxEmit.ReactJSX,module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
  const mod=new Module(filename,module);mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));mod._compile(compiled,filename);return mod.exports;
}
const resetPage=load('src/app/auth/reset-password/page.tsx','\nexport { ResetPasswordForm as __auditForm };').__auditForm;
const loginPage=load('src/app/auth/login/page.tsx').default;
function begin(query){state=[];cursor=0;effects=[];params=new URLSearchParams(query);resetCalls=validateCalls=0;throwForgot=false;}
function render(fn){cursor=0;effects=[];return fn();}
function all(tree,result=[]){
  if(Array.isArray(tree)){tree.forEach(x=>all(x,result));return result;}
  if(tree&&typeof tree==='object'&&tree.props){result.push(tree);all(tree.props.children,result);}
  return result;
}
function text(tree){if(Array.isArray(tree))return tree.map(text).join(' ');if(tree&&typeof tree==='object')return text(tree.props?.children);return typeof tree==='string'?tree:'';}
async function settleEffects(){const queued=effects;effects=[];for(const effect of queued)effect();await new Promise(resolve=>setImmediate(resolve));}
let passed=0;
(async()=>{
  for(const query of ['token=demo&email=creator%40test.invalid','token=totally-invalid&email=creator%40test.invalid&demo=true']){
    begin(query);render(resetPage);await settleEffects();
    const tree=render(resetPage);
    assert.equal(validateCalls,1);assert.equal(resetCalls,0);
    assert(!all(tree).some(x=>x.type==='form'));assert(text(tree).includes('Invalid or Expired Link'));passed++;
    console.log('PASS Demo query cannot bypass real reset-link validation');
  }
  begin('token=pwd_reset:'+ 'a'.repeat(64)+'&email=creator%40test.invalid');render(resetPage);await settleEffects();
  let tree=render(resetPage);
  all(tree).filter(x=>x.type==='input'&&x.props.placeholder?.includes('password')).forEach(x=>x.props.onChange({target:{value:'Strong-Password52!'}}));
  tree=render(resetPage);await all(tree).find(x=>x.type==='form').props.onSubmit({preventDefault(){}});
  assert.equal(resetCalls,1);assert(text(render(resetPage)).includes('Password Updated!'));passed++;
  console.log('PASS Valid reset succeeds only after the server confirms the update');
  begin('token=pwd_reset:'+ 'a'.repeat(64)+'&email=creator%40test.invalid');throwValidation=true;render(resetPage);await settleEffects();
  assert(text(render(resetPage)).includes('couldn’t check this link'));assert.equal(state[4],false);passed++;
  console.log('PASS Interrupted reset-link validation stops loading and shows recovery instructions');
  begin('');render(loginPage);state[0]='forgot';tree=render(loginPage);throwForgot=true;
  await all(tree).find(x=>x.type==='form').props.action(new FormData());
  tree=render(loginPage);assert.equal(state[1],false);assert.match(state[3],/try again/i);
  assert(!all(tree).find(x=>x.type==='button'&&x.props.type==='submit').props.disabled);passed++;
  console.log('PASS Interrupted forgot-password request re-enables the form');
  begin('');render(loginPage);state[0]='verify';tree=render(loginPage);
  let otp=all(tree).find(x=>x.type==='input'&&x.props.id==='otp-0');assert.equal(typeof otp.props.onPaste,'function');assert.equal(otp.props.autoComplete,'one-time-code');
  otp.props.onChange({target:{value:'123456'}});tree=render(loginPage);assert.deepEqual(state[10],['1','2','3','4','5','6']);passed++;
  console.log('PASS Signup accepts the full code from autofill');
  otp=all(tree).find(x=>x.type==='input'&&x.props.id==='otp-0');
  otp.props.onPaste({preventDefault(){},clipboardData:{getData:()=> '654 321'}});tree=render(loginPage);
  assert.deepEqual(state[10],['6','5','4','3','2','1']);passed++;
  console.log('PASS Signup distributes a pasted six-digit code');
  otp=all(tree).find(x=>x.type==='input'&&x.props.id==='otp-0');otp.props.onKeyDown({key:'Enter',preventDefault(){}});
  await new Promise(resolve=>setImmediate(resolve));assert.equal(verifyCalls,1);passed++;
  console.log('PASS Enter submits a complete signup code');
  global.setTimeout=realTimeout;
  console.log(passed+' offline UI handler checks passed. No browser/account/email operations.');
})().catch(error=>{global.setTimeout=realTimeout;console.error(error);process.exitCode=1;});
