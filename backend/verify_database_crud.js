const path = require("path");
require("dotenv").config({ path: path.join(__dirname, ".env") });
const mongoose = require("mongoose");
const Complaint = require("./models/Complaint");

async function verifyDatabase() {
  console.log("--------------------------------------------------");
  console.log("Checking MongoDB Atlas Connection & CRUD Operations");
  console.log("--------------------------------------------------");

  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("❌ MONGO_URI is not defined in backend/.env!");
    process.exit(1);
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Successfully connected to MongoDB Atlas!");
    console.log("Host:", mongoose.connection.host);
    console.log("Database Name:", mongoose.connection.name);

    // 1. CREATE TEST COMPLAINT
    const testTrackingId = "TEST_" + Date.now();
    console.log("\n1. Testing Data Creation (Storing)...");
    const testDoc = await Complaint.create({
      trackingId: testTrackingId,
      title: "Automated DB Integrity Verification",
      description: "Verifying store, retrieve, update cycles in CivicShield Atlas DB.",
      category: "Roads & Transport",
      department: "Municipal Administration",
      location: {
        address: "Fairlands Test Area, Salem, Tamil Nadu",
        city: "Salem",
        latitude: 11.6643,
        longitude: 78.1460,
      },
      status: "Received",
      citizen: {
        name: "Test Citizen",
        email: "test_verification@civicshield.gov.in",
        phone: "9876543210",
      },
    });
    console.log("✅ Document successfully created and stored with ID:", testDoc._id, "TrackingId:", testDoc.trackingId);

    // 2. RETRIEVE TEST COMPLAINT
    console.log("\n2. Testing Data Retrieval...");
    const retrieved = await Complaint.findOne({ trackingId: testTrackingId });
    if (!retrieved) {
      throw new Error("Could not retrieve created document!");
    }
    console.log("✅ Document successfully retrieved:", retrieved.title, "| Status:", retrieved.status);

    // 3. UPDATE TEST COMPLAINT
    console.log("\n3. Testing Data Updating...");
    retrieved.status = "Resolved";
    retrieved.adminResponse = "Issue verified and resolved in test suite.";
    await retrieved.save();

    const updated = await Complaint.findOne({ trackingId: testTrackingId });
    if (updated.status !== "Resolved") {
      throw new Error("Update status failed!");
    }
    console.log("✅ Document successfully updated to status:", updated.status, "| Response:", updated.adminResponse);

    // 4. CLEAN UP
    console.log("\n4. Cleaning up test record...");
    await Complaint.deleteOne({ trackingId: testTrackingId });
    console.log("✅ Test record cleaned up.");

    // 5. COUNT TOTAL COMPLAINTS
    const totalCount = await Complaint.countDocuments();
    console.log("\n📊 Current Total Complaints in MongoDB Atlas:", totalCount);

    console.log("\n==================================================");
    console.log("🎉 DATABASE IS PROPERLY CONFIGURED & FULLY FUNCTIONAL!");
    console.log("==================================================");
    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Database verification failed:", err);
    process.exit(1);
  }
}

verifyDatabase();
