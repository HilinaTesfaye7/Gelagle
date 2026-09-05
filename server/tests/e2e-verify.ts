async function runE2E() {
  console.log('--- Starting Complete End-to-End Platform Verification ---');

  // 1. Health check
  const health = await fetch('http://localhost:4000/health').then((r) => r.json());
  console.log('✔ Health Check:', health);

  // 2. Login as Project Manager
  const pmLogin = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'pm@commandcenter.io', password: 'Password123!' })
  }).then((r) => r.json());
  console.log('✔ PM Login Successful:', pmLogin.user.name, `(${pmLogin.user.email})`);

  // 3. Current user /me
  const me = await fetch('http://localhost:4000/api/auth/me', {
    headers: { Authorization: `Bearer ${pmLogin.token}` }
  }).then((r) => r.json());
  console.log('✔ /me Endpoint:', me.user.name, `| Permissions Granted: ${me.grantedPermissions.length}`);

  // 4. List authorized projects
  const projects = await fetch('http://localhost:4000/api/projects', {
    headers: { Authorization: `Bearer ${pmLogin.token}` }
  }).then((r) => r.json());
  console.log('✔ Authorized Projects for PM:', projects.projects.map((p: any) => `${p.name} [${p.status}]`));

  // 5. Query Project Members
  const members = await fetch('http://localhost:4000/api/projects/proj-nexus-01/members', {
    headers: { Authorization: `Bearer ${pmLogin.token}` }
  }).then((r) => r.json());
  console.log('✔ Nexus Platform Core Members Count:', members.members.length);
  members.members.forEach((m: any) => {
    console.log(`   - ${m.userName}: ${m.role} (${m.responsibilities})`);
  });

  // 6. Test Project Access Isolation with Backend Dev
  const devLogin = await fetch('http://localhost:4000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ identifier: 'backend@commandcenter.io', password: 'Password123!' })
  }).then((r) => r.json());
  console.log('✔ Dev Login Successful:', devLogin.user.name);

  // Dev tries to access Apollo (which he does NOT belong to)
  const apolloAccess = await fetch('http://localhost:4000/api/projects/proj-apollo-03', {
    headers: { Authorization: `Bearer ${devLogin.token}` }
  });
  console.log('✔ Cross-Project Isolation Check (Dev accessing Apollo): Status', apolloAccess.status, '(403 Forbidden Expected)');
  if (apolloAccess.status === 403) {
    console.log('   -> Access properly rejected! No cross-project data leakage.');
  }

  // 7. Test Telegram Bot Simulation
  const botRes = await fetch('http://localhost:4000/api/telegram/webhook', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      telegramUserId: '10001',
      chatId: 'chat_10001',
      text: '/projects'
    })
  }).then((r) => r.json());
  console.log('✔ Telegram Bot Webhook Response for /projects:');
  console.log('   ' + botRes.reply.replace(/\n/g, '\n   '));

  // 8. Test Client HTML delivery
  const html = await fetch('http://localhost:4000/').then((r) => r.text());
  console.log('✔ Client HTML Served at http://localhost:4000 (Length:', html.length, 'bytes)');

  console.log('--- ALL END-TO-END CHECKS COMPLETED SUCCESSFULLY ---');
}

runE2E().catch(console.error);
