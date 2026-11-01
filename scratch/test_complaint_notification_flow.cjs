const http = require('http');

function postJson(url, payload, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'POST',
        headers,
      },
      (res) => {
        let resData = '';
        res.on('data', (c) => (resData += c));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(resData) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function patchJson(url, payload, token) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const body = JSON.stringify(payload);
    const headers = {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(body),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const req = http.request(
      {
        hostname: urlObj.hostname,
        port: urlObj.port,
        path: urlObj.pathname,
        method: 'PATCH',
        headers,
      },
      (res) => {
        let resData = '';
        res.on('data', (c) => (resData += c));
        res.on('end', () => {
          try {
            resolve({ statusCode: res.statusCode, data: JSON.parse(resData) });
          } catch (e) {
            resolve({ statusCode: res.statusCode, raw: resData });
          }
        });
      }
    );
    req.on('error', reject);
    req.write(body);
    req.end();
  });
}

function getJson(url) {
  return new Promise((resolve, reject) => {
    http.get(url, (res) => {
      let resData = '';
      res.on('data', (c) => (resData += c));
      res.on('end', () => {
        try {
          resolve({ statusCode: res.statusCode, data: JSON.parse(resData) });
        } catch (e) {
          resolve({ statusCode: res.statusCode, raw: resData });
        }
      });
    }).on('error', reject);
  });
}

async function testFullFlow() {
  console.log('=== CITIZEN TO ADMIN GRIEVANCE & NOTIFICATION FLOW TEST ===\n');

  // 1. Submit citizen complaint
  console.log('1. Submitting test citizen complaint via backend...');
  const newComplaintPayload = {
    title: 'Severe Water Pipe Burst at Fort Main Road',
    description: 'Drinking water pipeline ruptured near Fort Clock Tower, water flooding the street.',
    category: 'Water & Sewage',
    address: 'Fort Main Road, Ward 14, Salem',
    city: 'Salem',
    pincode: '636001',
    latitude: 11.6643,
    longitude: 78.146,
    preferredLang: 'ta-IN',
  };

  const submitRes = await postJson('http://127.0.0.1:5000/api/complaints', newComplaintPayload);
  if (submitRes.statusCode !== 201 && submitRes.statusCode !== 200) {
    throw new Error(`Submit failed with HTTP ${submitRes.statusCode}: ${JSON.stringify(submitRes.data)}`);
  }
  const submitted = submitRes.data.complaint;
  console.log(`[PASS] Complaint submitted successfully! Tracking ID: ${submitted.trackingId || submitted._id}`);

  // 2. Fetch complaints to verify it appears in admin list
  console.log('\n2. Verifying complaint appears in complaints list for Admin Dashboard...');
  const fetchRes = await getJson('http://127.0.0.1:5000/api/complaints');
  const found = fetchRes.data.complaints.find(
    (c) => (c.trackingId || c._id) === (submitted.trackingId || submitted._id)
  );
  if (!found) {
    throw new Error('Submitted complaint not found in complaints list!');
  }
  console.log(`[PASS] Found in Admin grievances list: "${found.title}" in ${found.location?.address || found.location}`);
  console.log(`       Status: ${found.status}, Category: ${found.category}`);

  // 3. Admin status update
  console.log('\n3. Simulating Admin updating status and dispatching official response...');
  const targetId = submitted.trackingId || submitted._id;
  const updateRes = await patchJson(`http://127.0.0.1:5000/api/complaints/${targetId}/status`, {
    status: 'In Progress',
    adminResponse: 'TWAD emergency repair crew dispatched to Fort Main Road with excavation machinery.',
    assignedOfficer: 'K. Senthil Nathan (Executive Engineer, TWAD)',
  });

  if (updateRes.statusCode !== 200) {
    throw new Error(`Admin update failed with HTTP ${updateRes.statusCode}: ${JSON.stringify(updateRes.data)}`);
  }
  console.log(`[PASS] Admin updated status to "${updateRes.data.complaint?.status}" with response:`);
  console.log(`       "${updateRes.data.complaint?.adminResponse}"`);

  // 4. Verify updated complaint on Citizen Tracking side
  console.log('\n4. Verifying updated status and admin response on Citizen Tracking...');
  const verifyRes = await getJson(`http://127.0.0.1:5000/api/complaints/${targetId}`);
  const finalComp = verifyRes.data.complaint;
  if (finalComp.status !== 'In Progress' || !finalComp.adminResponse) {
    throw new Error('Updated complaint does not have expected status or admin response!');
  }
  console.log(`[PASS] Citizen side reflects status "${finalComp.status}" and officer response:`);
  console.log(`       "${finalComp.adminResponse}"`);

  console.log('\n=== ALL TESTS PASSED SUCCESSFULLY! ===');
}

testFullFlow().catch((err) => {
  console.error('[TEST FAILED]', err.message);
  process.exit(1);
});

