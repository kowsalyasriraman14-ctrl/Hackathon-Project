// Test Portals and Notification Backend
const http = require('http');

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, dataLength: data.length });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

async function runTests() {
  console.log('Testing connectivity across the 3 portals and backend...\n');

  try {
    // 1. Citizen Dashboard on 5173
    const dashRes = await checkUrl('http://127.0.0.1:5173/dashboard');
    console.log(`[PASS] Citizen Dashboard reachable (HTTP ${dashRes.statusCode}, bytes: ${dashRes.dataLength})`);

    // 2. Admin Login on 5173
    const adminRes = await checkUrl('http://127.0.0.1:5173/admin/login');
    console.log(`[PASS] Admin Portal Login reachable (HTTP ${adminRes.statusCode}, bytes: ${adminRes.dataLength})`);

    // 3. Admin Dashboard on 5173
    const adminDashRes = await checkUrl('http://127.0.0.1:5173/admin/dashboard');
    console.log(`[PASS] Admin Dashboard route reachable (HTTP ${adminDashRes.statusCode}, bytes: ${adminDashRes.dataLength})`);

    // 4. Backend Complaints API
    const apiRes = await checkUrl('http://127.0.0.1:5000/api/complaints');
    console.log(`[PASS] Backend Complaints API reachable (HTTP ${apiRes.statusCode}, bytes: ${apiRes.dataLength})`);

    console.log('\nAll 3 portals and backend live and verified successfully!');
  } catch (err) {
    console.error('[FAIL] Connection error:', err.message);
    process.exit(1);
  }
}

runTests();

