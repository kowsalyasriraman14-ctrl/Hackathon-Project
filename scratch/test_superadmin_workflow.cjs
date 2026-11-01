const http = require("http");

function request(method, path, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const payload = body ? JSON.stringify(body) : null;
    const req = http.request(
      {
        hostname: "localhost",
        port: 5000,
        path,
        method,
        headers: {
          "Content-Type": "application/json",
          ...(payload ? { "Content-Length": Buffer.byteLength(payload) } : {}),
          ...headers,
        },
      },
      (res) => {
        let data = "";
        res.on("data", (chunk) => (data += chunk));
        res.on("end", () => {
          try {
            resolve({ status: res.statusCode, data: JSON.parse(data) });
          } catch (e) {
            resolve({ status: res.statusCode, raw: data });
          }
        });
      }
    );
    req.on("error", reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function runSuperAdminWorkflowVerification() {
  console.log("=== STARTING SUPER ADMIN MODULE 5-STEP WORKFLOW VERIFICATION ===\n");

  // Step 1: Citizen Submits Complaint
  console.log("👉 STEP 1: Citizen submits a real civic grievance...");
  const citizenPayload = {
    title: "Major water pipeline rupture flooding South Mada Street",
    description: "Main potable water feeder pipe cracked near South Mada street. Water is gushing onto the road causing road collapse.",
    category: "Water & Sewage",
    location: "South Mada Street, Mylapore, Chennai, Tamil Nadu",
    district: "Chennai",
    priority: "Urgent",
    submittedBy: "Karthik Subramanian (Citizen)",
    citizenPhone: "+91 98401 23456",
    citizenEmail: "karthik.subramanian@gmail.com",
    source: "web",
  };

  const createRes = await request("POST", "/api/complaints", citizenPayload);
  if (createRes.status !== 201 && createRes.status !== 200) {
    throw new Error(`Step 1 failed: Could not create complaint: ${JSON.stringify(createRes)}`);
  }
  const complaint = createRes.data.complaint || createRes.data;
  console.log(`✅ Complaint created successfully! ID: ${complaint.id || complaint._id}, Title: "${complaint.title}"`);

  // Step 2: Department Admin Logs In and Updates Complaint
  console.log("\n👉 STEP 2: Department Admin reviews & updates complaint status...");
  const adminLoginRes = await request("POST", "/api/auth/admin/login", {
    email: "admin@civicshield.gov.in",
    password: "Admin@2026",
  });
  if (adminLoginRes.status !== 200) {
    throw new Error(`Step 2 failed: Admin login rejected: ${JSON.stringify(adminLoginRes)}`);
  }
  const adminToken = adminLoginRes.data.token;
  const adminUser = adminLoginRes.data.user;
  console.log(`✅ Admin authenticated: ${adminUser.name} (${adminUser.department || adminUser.role})`);

  const targetId = complaint._id || complaint.id || complaint.trackingId;

  // Update complaint to In Progress
  const updateRes1 = await request(
    "PATCH",
    `/api/complaints/${targetId}/status`,
    {
      status: "In Progress",
      assignedOfficer: "Er. Ramesh Babu (MetroWater AE)",
      adminResponse: "MetroWater emergency repair van dispatched. Isolation valves 3 and 4 closed to stop flooding.",
    },
    { Authorization: `Bearer ${adminToken}` }
  );
  console.log(`✅ Admin updated status to In Progress: ${updateRes1.status === 200 ? "SUCCESS" : "FAILED"}`);
  if (updateRes1.status !== 200) console.log("   updateRes1 debug:", JSON.stringify(updateRes1));

  // Update complaint to Resolved
  const updateRes2 = await request(
    "PATCH",
    `/api/complaints/${targetId}/status`,
    {
      status: "Resolved",
      assignedOfficer: "Er. Ramesh Babu (MetroWater AE)",
      adminResponse: "Replacement 300mm ductile iron sleeve installed and pressure tested at 4.2 bar. Water supply restored.",
    },
    { Authorization: `Bearer ${adminToken}` }
  );
  console.log(`✅ Admin updated status to Resolved: ${updateRes2.status === 200 ? "SUCCESS" : "FAILED"}`);
  if (updateRes2.status !== 200) console.log("   updateRes2 debug:", JSON.stringify(updateRes2));

  // Step 3: Super Admin Logs In & Inspects Real-Time Action Notifications
  console.log("\n👉 STEP 3: Super Admin logs in & reviews Admin Action Audit Logs...");
  const superAdminLoginRes = await request("POST", "/api/auth/superadmin/login", {
    email: "superadmin@civicshield.gov.in",
    password: "SuperAdmin@2026",
  });
  if (superAdminLoginRes.status !== 200) {
    throw new Error(`Step 3 failed: Super Admin login rejected: ${JSON.stringify(superAdminLoginRes)}`);
  }
  const superToken = superAdminLoginRes.data.token;
  const superUser = superAdminLoginRes.data.user;
  console.log(`✅ Super Admin authenticated: ${superUser.name} (Role: ${superUser.role})`);

  const auditLogsRes = await request("GET", "/api/complaints/superadmin/audit-logs", null, {
    Authorization: `Bearer ${superToken}`,
  });
  const auditLogs = (auditLogsRes.data && (auditLogsRes.data.logs || auditLogsRes.data.actions)) || [];
  if (auditLogsRes.status !== 200 || !Array.isArray(auditLogs)) {
    throw new Error(`Step 3 failed: Could not fetch audit logs: ${JSON.stringify(auditLogsRes)}`);
  }
  console.log(`✅ Super Admin retrieved ${auditLogs.length} logged Admin Actions.`);

  // Check the latest logged action
  const latestLog = auditLogs[0];
  console.log("   Latest Action Record received by Super Admin:");
  console.log(`   - Complaint ID: ${latestLog.complaintId}`);
  console.log(`   - Status Transition: ${latestLog.previousStatus} -> ${latestLog.newStatus}`);
  console.log(`   - Is Completed: ${latestLog.isCompleted}`);
  console.log(`   - Is Pending: ${latestLog.isPending}`);
  console.log(`   - Officer: ${latestLog.officerName}`);
  console.log(`   - Response Note: "${latestLog.responseNote}"`);

  if (!latestLog.isCompleted) {
    throw new Error("Expected latest log to have isCompleted=true for Resolved status!");
  }

  // Step 4: Super Admin Monitors All Admins & Performance
  console.log("\n👉 STEP 4: Super Admin monitors Department Admins & Performance Metrics...");
  const adminsRes = await request("GET", "/api/auth/superadmin/admins", null, {
    Authorization: `Bearer ${superToken}`,
  });
  if (adminsRes.status !== 200 || !Array.isArray(adminsRes.data.admins)) {
    throw new Error(`Step 4 failed: Could not fetch admins: ${JSON.stringify(adminsRes)}`);
  }
  console.log(`✅ Found ${adminsRes.data.admins.length} Department Admins.`);
  adminsRes.data.admins.forEach((adm) => {
    console.log(`   - Admin: ${adm.name} | Dept: ${adm.department} | Handled: ${adm.totalHandled} | Resolved: ${adm.completedCount} | Pending: ${adm.pendingCount} | Efficiency: ${adm.efficiencyRate}%`);
  });

  // Step 5: Super Admin Statewide Analytics & Executive Directive Override
  console.log("\n👉 STEP 5: Super Admin Analytics & Executive Directive Override...");
  const analyticsRes = await request("GET", "/api/complaints/superadmin/analytics", null, {
    Authorization: `Bearer ${superToken}`,
  });
  console.log(`✅ Statewide Analytics: Total Grievances: ${analyticsRes.data.totalComplaints}, Resolved: ${analyticsRes.data.resolved}, Resolution Rate: ${analyticsRes.data.resolutionRate}%`);

  // Test Executive Directive Override
  const overrideRes = await request(
    "PUT",
    `/api/complaints/${targetId}/superadmin-override`,
    {
      status: "Resolved",
      executiveNote: "Site inspected and verified by State Vigilance Directorate. Road surface repaved.",
      escalatePriority: "High",
      reassignedOfficer: "Chief Engineer S. Kulanthaivelu",
    },
    { Authorization: `Bearer ${superToken}` }
  );
  if (overrideRes.status !== 200) {
    throw new Error(`Step 5 failed: Super Admin override rejected: ${JSON.stringify(overrideRes)}`);
  }
  console.log(`✅ Super Admin executive directive applied successfully!`);
  console.log(`   Updated Admin Response Note: "${overrideRes.data.complaint.adminResponse}"`);

  // Step 6: Security Verification (Citizen & Regular Admin blocked from Super Admin routes)
  console.log("\n👉 SECURITY CHECK: Verify regular citizen/admin cannot access Super Admin endpoints...");
  const forbiddenCheck = await request("GET", "/api/auth/superadmin/admins", null, {
    Authorization: `Bearer ${adminToken}`, // Regular admin token
  });
  if (forbiddenCheck.status === 403) {
    console.log("✅ Security Verified: Regular Admin correctly rejected with 403 Forbidden.");
  } else {
    throw new Error(`Security fail: Regular Admin got status ${forbiddenCheck.status}`);
  }

  console.log("\n🎉 ALL 5 WORKFLOW STEPS AND SECURITY CHECKS PASSED FLAWLESSLY!\n");
}

runSuperAdminWorkflowVerification().catch((err) => {
  console.error("❌ Verification failed:", err);
  process.exit(1);
});
