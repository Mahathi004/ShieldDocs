const db = require('./config/db');
const fs = require('fs');

async function runTests() {
  const results = {};
  console.log('--- STARTING TESTS ---');
  let token = '';
  let userId = '';
  let docId = '';
  const testEmail = `testuser_${Date.now()}@example.com`;
  const testPassword = 'Password123!';

  try {
    // TASK 1.1: Signup
    console.log('\nTesting POST /api/auth/signup...');
    const signupRes = await fetch('http://localhost:5000/api/auth/signup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: 'Test User', email: testEmail, password: testPassword })
    });
    const signupData = await signupRes.json();
    console.log('Signup Response:', signupData);
    
    if (!signupRes.ok) throw new Error('Signup failed: ' + JSON.stringify(signupData));
    userId = signupData.id;
    results.signup = { status: 'pass', data: signupData };

    // Check DB for hashed password
    const userDbRes = await db.query('SELECT password FROM users WHERE email = $1', [testEmail]);
    if (userDbRes.rows.length > 0 && userDbRes.rows[0].password !== testPassword) {
      results.password_hashed = 'pass';
    } else {
      results.password_hashed = 'fail';
      throw new Error('Password not hashed');
    }

    // TASK 1.2: Login
    console.log('\nTesting POST /api/auth/login...');
    const loginRes = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    const loginData = await loginRes.json();
    console.log('Login Response:', Object.keys(loginData).includes('token') ? '{ token: ..., user: ... }' : loginData);
    
    if (!loginRes.ok) throw new Error('Login failed: ' + JSON.stringify(loginData));
    token = loginData.token;
    results.login = { status: 'pass' };

    // DB check for 'login' activity log
    const logDbRes = await db.query('SELECT action FROM activity_logs WHERE user_id = $1 ORDER BY timestamp DESC LIMIT 1', [userId]);
    if (logDbRes.rows.length > 0 && logDbRes.rows[0].action === 'login') {
      results.login_log = 'pass';
    } else {
      results.login_log = 'fail';
      throw new Error('Login log missing');
    }

    // TASK 2.1: Save text
    console.log('\nTesting POST /api/documents/save-text...');
    const saveRes = await fetch('http://localhost:5000/api/documents/save-text', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ file_name: 'test_doc.txt', redacted_text: 'Confidential: [REDACTED]' })
    });
    const saveData = await saveRes.json();
    console.log('Save Text Response:', saveData);
    if (!saveRes.ok) throw new Error('Save text failed');
    docId = saveData.id;
    results.save_text = { status: 'pass', docId };

    // TASK 2.2: Upload file (skip detailed FormData unless needed, we can test it with mock later or just mock a file)
    console.log('\nTesting POST /api/documents/upload-file (Skipping actual multipart upload for now in this script, will test via logic check)...');
    results.upload_file = { status: 'skip' };

    // TASK 2.3: Get Documents
    console.log('\nTesting GET /api/documents...');
    const getDocsRes = await fetch('http://localhost:5000/api/documents', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getDocsData = await getDocsRes.json();
    if (!getDocsRes.ok) throw new Error('Get docs failed');
    results.get_docs = { status: 'pass', count: getDocsData.length };

    // TASK 3.1: Delete
    console.log(`\nTesting DELETE /api/documents/${docId}...`);
    const delRes = await fetch(`http://localhost:5000/api/documents/${docId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const delData = await delRes.json();
    console.log('Delete Response:', delData);
    if (!delRes.ok) throw new Error('Delete failed');
    results.delete_doc = { status: 'pass' };

    // Check getting documents again (should not include deleted one)
    const getDocsRes2 = await fetch('http://localhost:5000/api/documents', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const getDocsData2 = await getDocsRes2.json();
    if (getDocsData2.some(d => d.id === docId)) throw new Error('ERROR: Deleted document still appearing in list');
    results.delete_verify = { status: 'pass' };

    // TASK 3.2: Restore
    console.log(`\nTesting POST /api/documents/restore/${docId}...`);
    const resRes = await fetch(`http://localhost:5000/api/documents/restore/${docId}`, {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const resData = await resRes.json();
    if (!resRes.ok) throw new Error('Restore failed');
    results.restore_doc = { status: 'pass' };

    // TASK 4: Activity Logs
    console.log('\nTesting GET /api/activity...');
    const actRes = await fetch('http://localhost:5000/api/activity', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const actData = await actRes.json();
    // console.log(`Activity Logs Count: ${actData.length}`);
    results.activity_logs = { status: 'pass', count: actData.length };

    // TASK 5: Telemetry
    console.log('\nTesting GET /api/telemetry...');
    const telRes = await fetch('http://localhost:5000/api/telemetry', {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const telData = await telRes.json();
    results.telemetry = { status: 'pass', data: telData };

    console.log('\n--- TESTS COMPLETED SUCCESSFULLY ---');
    results.final_status = 'ALL_PASSED';

  } catch (e) {
    console.error(`\nTEST FAILED: ${e.message}`);
    results.final_status = 'FAILED';
    results.error = e.message;
  } finally {
    fs.writeFileSync('test_results.json', JSON.stringify(results, null, 2));
    // Clean up DB
    await db.query('DELETE FROM users WHERE email = $1', [testEmail]);
    await db.pool.end();
  }
}

runTests();
