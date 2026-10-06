/* Extends the offline auth suite with repaired failure-path regressions. */
const fs=require('node:fs'),path=require('node:path'),Module=require('node:module');
const repo=path.resolve(__dirname,'..');
let source=fs.readFileSync(path.join(repo,'scripts/test-auth-security.cjs'),'utf8');
const setup = String.raw`
let txTail=Promise.resolve(),referralRows=[],creditRows=[];
prisma.referral=table(()=>referralRows,value=>referralRows=value);
prisma.creditTransaction=table(()=>creditRows,value=>creditRows=value);
prisma.$transaction=async operation=>{
 const previous=txTail;let release;txTail=new Promise(resolve=>release=resolve);await previous;
 const snapshot={rows:clone(rows),users:clone(users),devices:clone(devices),challenges:clone(challenges),referralRows:clone(referralRows),creditRows:clone(creditRows)};
 try{return await operation(prisma);}catch(error){({rows,users,devices,challenges,referralRows,creditRows}=snapshot);throw error;}finally{release();}
};
`;
const probes = String.raw`
  await test('Signup retries the same verified code after a temporary provider failure',async()=>{
    await actions.signUpAction(form());const code=emails.find(x=>x.name==='sendAuthOTP').args[1];
    const update=admin.auth.admin.updateUserById;let once=true;
    admin.auth.admin.updateUserById=async(...args)=>{if(once){once=false;return {data:{user:null},error:{message:'Temporary provider failure'}};}return update(...args);};
    try{
      assert.match((await actions.verifyOtpAction(email,code,password)).error,/try this code again/i);
      assert.equal((await actions.verifyOtpAction(email,code,password)).success,true);
      assert.equal(users.length,1);assert(jar.has(proof.AUTH_PROOF_COOKIE));
    }finally{admin.auth.admin.updateUserById=update;}
  });
  await test('Signup resumes after confirmation commits but account setup fails',async()=>{
    await actions.signUpAction(form());const code=emails.find(x=>x.name==='sendAuthOTP').args[1];
    const upsert=prisma.user.upsert;let once=true;
    prisma.user.upsert=async(...args)=>{if(once){once=false;throw new Error('Temporary DB failure');}return upsert.apply(prisma.user,args);};
    try {
      assert.match((await actions.verifyOtpAction(email,code,password)).error,/try this code again/i);assert(accounts[0].email_confirmed_at);
      assert.equal((await actions.verifyOtpAction(email,code,password)).success,true);
      assert.equal(users.length,1);assert.equal(adminUpdates,1);assert.equal(users[0].dailyCredits,50);
      assert.equal(emails.filter(x=>x.name==='queueWelcomeEmail').length,1);
      assert((await actions.verifyOtpAction(email,code,password)).error);
    }finally{prisma.user.upsert=upsert;}
  });
  await test('Password plus new-device OTP repairs an incomplete verified account',async()=>{
    seed();users=[];const login=await actions.signInAction(form());assert.equal(login.requireDeviceOtp,true);assert.equal(users.length,0);
    rows=rows.filter(row=>!row.identifier.startsWith('auth_rate:'));
    const resend=await actions.resendDeviceOtpAction(email,login.challengeId);assert.equal(resend.success,true);
    const code=emails.filter(x=>x.name==='sendDeviceVerificationOtpEmail').at(-1).args[1];
    assert.equal((await actions.verifyDeviceOtpAction(email,resend.challengeId,code,password)).success,true);
    assert.equal(users.length,1);assert.equal(users[0].id,accounts[0].id);assert.equal(users[0].dailyCredits,50);
    assert(jar.has(proof.AUTH_PROOF_COOKIE));assert.equal((await (await createClient()).auth.getUser()).data.user.id,accounts[0].id);
  });
  await test('Partial accounts remain inaccessible without the correct password and browser OTP',async()=>{
    seed();users=[];const login=await actions.signInAction(form());const code=emails.find(x=>x.name==='sendDeviceVerificationOtpEmail').args[1];
    const saved=jar.get(security.DEVICE_CHALLENGE_COOKIE);jar.delete(security.DEVICE_CHALLENGE_COOKIE);
    assert((await actions.verifyDeviceOtpAction(email,login.challengeId,code,password)).error);
    assert.equal(users.length,0);jar.set(security.DEVICE_CHALLENGE_COOKIE,saved);
    assert((await actions.verifyDeviceOtpAction(email,login.challengeId,code,'wrong')).error);assert.equal(users.length,0);
  });
  await test('Completion receipts reject a different password, browser, code and reset version',async()=>{
    const account=seed(false), c=await security.createOtpChallenge('signup',email,account.id,security.signupPasswordBinding(email,password));
    const lease=await security.claimSignupVerification(email,c.id,c.otp,security.signupPasswordBinding(email,password),account.id,'initial');
    assert(lease&&lease!=='busy');await security.releaseSignupVerification(lease);
    for(const [id,code,binding,version] of [[c.id,c.otp,security.signupPasswordBinding(email,'wrong'),'initial'],['a'.repeat(48),c.otp,lease.data.binding,'initial'],[c.id,'000000',lease.data.binding,'initial'],[c.id,c.otp,lease.data.binding,'new-version']]){
      assert.equal(await security.claimSignupVerification(email,id,code,binding,account.id,version,true),null);
    }
    const retry=await security.claimSignupVerification(email,c.id,c.otp,lease.data.binding,account.id,'initial',true);
    assert(retry&&retry!=='busy');assert.equal(await security.finishSignupVerification(retry),true);
    assert.equal(await security.claimSignupVerification(email,c.id,c.otp,lease.data.binding,account.id,'initial',true),null);
  });
  await test('Concurrent completion claims share one lease; stale owners cannot release it',async()=>{
    const account=seed(false),c=await security.createOtpChallenge('signup',email,account.id,security.signupPasswordBinding(email,password));
    const results=await Promise.all(Array.from({length:6},()=>security.claimSignupVerification(email,c.id,c.otp,security.signupPasswordBinding(email,password),account.id,'initial')));
    const leases=results.filter(x=>x&&x!=='busy');assert.equal(leases.length,1);
    await security.releaseSignupVerification(leases[0]);
    const next=await security.claimSignupVerification(email,c.id,c.otp,leases[0].data.binding,account.id,'initial',true);
    assert(next&&next!=='busy');assert.notEqual(next.token,leases[0].token);
    await security.releaseSignupVerification(leases[0]);assert.equal(await security.finishSignupVerification(next),true);
  });
  await test('Saving a completion receipt and spending the OTP roll back together',async()=>{
    const account=seed(false),c=await security.createOtpChallenge('signup',email,account.id,security.signupPasswordBinding(email,password));
    const create=prisma.verificationToken.create;
    prisma.verificationToken.create=async args=>{if(args.data.token.startsWith('signup_finish:'))throw new Error('Temporary receipt failure');return create(args);};
    try{await assert.rejects(()=>security.claimSignupVerification(email,c.id,c.otp,security.signupPasswordBinding(email,password),account.id,'initial'));}
    finally{prisma.verificationToken.create=create;}
    assert(await security.getOtpChallenge('signup',email,c.id));
  });
  await test('Reset reports success after provider update despite retryable cleanup failure',async()=>{
    const user=seed();session=makeSession(user);await proof.issueSessionProof(session);const oldSession=clone(session),oldProof=jar.get(proof.AUTH_PROOF_COOKIE).value;
    devices.push({id:'phone',userId:user.id,loginEmail:email,status:'active',revokedAt:null});
    const token=security.generateResetToken();rows.push({identifier:email,token:security.resetTokenHash(email,token),expires:new Date(Date.now()+600000)});
    const update=prisma.trustedLoginDevice.updateMany;prisma.trustedLoginDevice.updateMany=async()=>{throw new Error('Temporary cleanup failure');};
    try{assert.equal((await actions.updatePasswordAction(email,token,'Different-Password43!')).success,true);}
    finally{prisma.trustedLoginDevice.updateMany=update;}
    assert.equal(accounts[0].password,'Different-Password43!');assert.equal(await proof.isVerifiedAppSession(accounts[0],oldSession,oldProof),false);
    const cleanup=require('../src/lib/auth/reset-cleanup.ts');assert.equal(await cleanup.hasPendingResetCleanup(user.id),true);
    assert.deepEqual(await cleanup.retryResetCleanups(),{completed:1,failed:0});assert.equal(devices[0].status,'revoked');assert.equal(await cleanup.hasPendingResetCleanup(user.id),false);
  });
  await test('An unfinished password reset fence blocks old phone approvals and app sessions',async()=>{
    const c=phoneChallenge(), user=accounts[0];session=makeSession(user);await proof.issueSessionProof(session);
    rows.push({identifier:'auth_cleanup:person:next-version:'+Buffer.from(email).toString('base64url'),token:'auth_cleanup:v1:person',expires:new Date(Date.now()+600000)});
    assert.equal((await (await createClient()).auth.getUser()).data.user,null);
    const response=await require('../src/app/api/auth/trusted-login/status/route.ts').POST(request(c));
    assert.equal((await response.json()).status,'expired');assert.equal(generatedLinks,0);
    await assert.rejects(()=>require('../src/lib/auth/reset-cleanup.ts').finishResetCleanup('person',email),/still finishing/);
    assert.equal(devices[0].status,'active');assert.equal(await require('../src/lib/auth/reset-cleanup.ts').hasPendingResetCleanup('person'),true);
  });
  await test('Browser trust persists independently across browsers without touching phone registration',async()=>{
    seed();devices.push({id:'phone',userId:'person',loginEmail:email,status:'active',pushEndpoint:'https://push.example.test',deviceName:'Registered Phone'});
    const before=clone(devices);
    const first=await device.registerTrustedDevice('person',email,'Browser A','192.0.2.1');
    const second=await device.registerTrustedDevice('person',email,'Browser B','192.0.2.2');
    assert.deepEqual(devices,before);
    assert.equal((await device.checkIsDeviceTrusted('person',email,first.rawDeviceToken)).isTrusted,true);
    assert.equal((await device.checkIsDeviceTrusted('person',email,second.rawDeviceToken)).isTrusted,true);
    assert.equal((await device.checkIsDeviceTrusted('person',email,first.rawDeviceToken,undefined,'new-version')).isTrusted,false);
    assert(!JSON.stringify(rows).includes(first.rawDeviceToken));
  });
  await test('Server signup requires the age confirmation before any account or email is created',async()=>{
    assert((await actions.signUpAction(form({email,password}))).error);assert.equal(accounts.length,0);assert.equal(emails.length,0);
    assert.equal((await actions.signUpAction(form())).success,true);
  });
  await test('Security cleanup cron rejects missing/wrong secrets and accepts authorized requests',async()=>{
    const route=require('../src/app/api/cron/auth-cleanup/route.ts');delete process.env.CRON_SECRET;
    assert.equal((await route.GET(new Request('https://test.invalid/api/cron/auth-cleanup'))).status,401);
    process.env.CRON_SECRET='offline';assert.equal((await route.GET(new Request('https://test.invalid/api/cron/auth-cleanup?key=offline'))).status,401);
    assert.equal((await route.GET(new Request('https://test.invalid/api/cron/auth-cleanup',{headers:{authorization:'Bearer offline'}}))).status,200);
  });

  await test('Provider timeout after committing a password update reconciles as success',async()=>{
    seed();const token=security.generateResetToken();rows.push({identifier:email,token:security.resetTokenHash(email,token),expires:new Date(Date.now()+600000)});
    const update=admin.auth.admin.updateUserById;admin.auth.admin.updateUserById=async(...args)=>{await update(...args);throw new Error('Response interrupted after commit');};
    try{assert.equal((await actions.updatePasswordAction(email,token,'New-Password83!')).success,true);assert.equal(accounts[0].password,'New-Password83!');}
    finally{admin.auth.admin.updateUserById=update;}
    assert.equal(await require('../src/lib/auth/reset-cleanup.ts').hasPendingResetCleanup('person'),false);
  });
  await test('Known provider rejection leaves the old password intact and releases only its fence',async()=>{
    seed();const token=security.generateResetToken();rows.push({identifier:email,token:security.resetTokenHash(email,token),expires:new Date(Date.now()+600000)});
    const update=admin.auth.admin.updateUserById;admin.auth.admin.updateUserById=async()=>({data:{user:null},error:{code:'rejected'}});
    try{assert((await actions.updatePasswordAction(email,token,'New-Password83!')).error);assert.equal(accounts[0].password,password);}
    finally{admin.auth.admin.updateUserById=update;}
    assert.equal(await require('../src/lib/auth/reset-cleanup.ts').hasPendingResetCleanup('person'),false);
  });
  await test('Browser trust expires and password cleanup revokes every browser marker',async()=>{
    seed();const first=await device.registerTrustedDevice('person',email,'Browser A','192.0.2.1'),second=await device.registerTrustedDevice('person',email,'Browser B','192.0.2.2');
    const firstRow=rows.find(row=>row.token.includes(device.hashDeviceToken(first.rawDeviceToken)));firstRow.expires=new Date(Date.now()-1);
    assert.equal((await device.checkIsDeviceTrusted('person',email,first.rawDeviceToken)).isTrusted,false);
    const version='updated-version';accounts[0].app_metadata.exismic_auth_version=version;
    rows.push({identifier:'auth_cleanup:person:'+version+':'+Buffer.from(email).toString('base64url'),token:'auth_cleanup:v1:person',expires:new Date(Date.now()+600000)});
    assert.equal((await device.checkIsDeviceTrusted('person',email,second.rawDeviceToken)).isTrusted,false);
    await require('../src/lib/auth/reset-cleanup.ts').finishResetCleanup('person',email);
    assert.equal(rows.filter(row=>row.identifier==='browser_trust:person').length,0);
  });
  await test('Repair cannot recreate an account whose permanent deletion job is still pending',async()=>{
    seed();users=[];rows.push({identifier:'account_purge:person',token:'purge-job',expires:new Date(Date.now()+600000)});
    const login=await actions.signInAction(form()),code=emails.find(x=>x.name==='sendDeviceVerificationOtpEmail').args[1];
    assert((await actions.verifyDeviceOtpAction(email,login.challengeId,code,password)).error);assert.equal(users.length,0);assert.equal(jar.has(proof.AUTH_PROOF_COOKIE),false);
  });
  await test('Referral account setup rolls back rewards together and cannot award twice on retry',async()=>{
    referralRows=[];creditRows=[];users.push({id:'referrer',email:'friend@example.test',status:'active',referralCode:'FRIEND'});
    jar.set('exismic_referral',{value:'FRIEND'});await actions.signUpAction(form());
    const code=emails.find(x=>x.name==='sendAuthOTP').args[1],create=prisma.creditTransaction.create;
    prisma.creditTransaction.create=async()=>{throw new Error('Reward write failed');};
    try{assert((await actions.verifyOtpAction(email,code,password)).error);}
    finally{prisma.creditTransaction.create=create;}
    assert.equal(users.length,1);assert.equal(referralRows.length,0);assert.equal(creditRows.length,0);
    assert.equal((await actions.verifyOtpAction(email,code,password)).success,true);
    assert.equal(users.length,2);assert.equal(referralRows.length,1);assert.equal(creditRows.length,2);
    assert((await actions.verifyOtpAction(email,code,password)).error);assert.equal(creditRows.length,2);
  });
  await test('A stale cleanup worker cannot revoke a newly registered browser',async()=>{
    seed();const version='new-version';accounts[0].app_metadata.exismic_auth_version=version;
    rows.push({identifier:'auth_cleanup:person:'+version+':'+Buffer.from(email).toString('base64url'),token:'auth_cleanup:v1:person',expires:new Date(Date.now()+600000)});
    const cleanup=require('../src/lib/auth/reset-cleanup.ts'),get=admin.auth.admin.getUserById;
    let enter,release;const entered=new Promise(r=>enter=r),gate=new Promise(r=>release=r);let pause=true;
    admin.auth.admin.getUserById=async(...args)=>{if(pause){pause=false;enter();await gate;}return get(...args);};
    try {
      const stale=cleanup.finishResetCleanup('person',email);await entered;
      await cleanup.finishResetCleanup('person',email,version);
      const browser=await device.registerTrustedDevice('person',email,'New Browser','192.0.2.1',version);
      release();await stale;assert.equal((await device.checkIsDeviceTrusted('person',email,browser.rawDeviceToken,undefined,version)).isTrusted,true);
    }finally{admin.auth.admin.getUserById=get;release();}
  });
`;
source=source.replace('const savedError = console.error;',setup+'\nconst savedError = console.error;');
source=source.replace('  console.error = savedError;\n  console.log(',probes+'\n  console.error = savedError;\n  console.log(');
const filename=path.join(repo,'scripts/__offline-flow-regressions.cjs'),mod=new Module(filename,module);
mod.filename=filename;mod.paths=Module._nodeModulePaths(path.dirname(filename));mod._compile(source,filename);
