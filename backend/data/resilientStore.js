const fs = require("fs");
const path = require("path");

const dataDir = path.join(__dirname);
const dbFilePath = path.join(dataDir, "db.json");

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

function initDb() {
  if (!fs.existsSync(dbFilePath)) {
    const initialData = {
      users: [],
      complaints: [
        {
          _id: "demo-csc25081",
          trackingId: "CSC25081",
          title: "Road Pothole Problem",
          category: "Roads & Transport",
          description:
            "A large pothole has developed near the main road, causing difficulties for commuters and two-wheelers.",
          department: "Highways & Road Maintenance Department",
          priority: "High",
          status: "In Progress",
          citizen: {
            name: "Kowsalya S",
            email: "kowsalya@example.com",
            phone: "+91 98765 43210",
          },
          location: {
            address: "Fairlands Main Road, Salem, Tamil Nadu",
            latitude: 11.6643,
            longitude: 78.146,
            city: "Salem",
          },
          media: {
            images: [
              {
                url: "https://dynamic-media-cdn.tripadvisor.com/media/photo-o/0e/65/91/5a/chennai-central-railway.jpg?w=1200&h=-1&s=1",
                filename: "pothole-fairlands.jpg",
                mimetype: "image/jpeg",
              },
            ],
            videos: [],
          },
          aiAnalysis: {
            sarvam: {
              transcription: "மெயின் ரோட்டில் பெரிய பள்ளம் ஏற்பட்டுள்ளது, சீக்கிரம் சரிசெய்யவும்.",
              detectedLanguage: "ta-IN",
              translatedEnglish: "Big pothole on the main road, please fix quickly.",
              audioProcessed: true,
              speechModel: "sarvam-saaras:v4",
              mode: "transcribe",
            },
            truthlens: {
              authenticityScore: 96,
              verdict: "VERIFIED_AUTHENTIC",
              aiGeneratedProbability: 0.03,
              isManipulated: false,
              locationConsistencyScore: 95,
              duplicateDetected: false,
              analysisSummary: "TruthLens verified real-world camera optics. Geotag Salem matches declared location. No AI generation signatures detected.",
              verifiedAt: new Date(),
            },
          },
          timeline: [
            {
              title: "Complaint Received",
              detail: "Your complaint has been successfully registered in the system.",
              date: new Date("2026-10-28T10:30:00Z"),
              done: true,
            },
            {
              title: "Under Review by TruthLens AI",
              detail: "Evidence authenticity verified (96% confidence score).",
              date: new Date("2026-10-28T14:15:00Z"),
              done: true,
            },
            {
              title: "Assigned to Department",
              detail: "Forwarded to Highways & Road Maintenance Department.",
              date: new Date("2026-10-29T09:00:00Z"),
              done: true,
            },
            {
              title: "Work in Progress",
              detail: "Municipal inspection completed, repair crew dispatched.",
              date: new Date("2026-10-30T11:00:00Z"),
              done: true,
              current: true,
            },
          ],
          createdAt: new Date("2026-10-28T10:30:00Z"),
          updatedAt: new Date("2026-10-30T11:00:00Z"),
        },
        {
          _id: "demo-csc25082",
          trackingId: "CSC25082",
          title: "Continuous Water Pipe Leakage",
          category: "Water Supply",
          description:
            "Clean drinking water pipe ruptured near 4th cross street, leaking continuously for two days.",
          department: "Tamil Nadu Water Supply & Drainage Board (TWAD)",
          priority: "Urgent",
          status: "Under Review",
          citizen: {
            name: "Muthu Raman",
            email: "muthu@example.com",
            phone: "+91 94432 11009",
          },
          location: {
            address: "Hasthampatti, Salem, Tamil Nadu",
            latitude: 11.6789,
            longitude: 78.1582,
            city: "Salem",
          },
          media: {
            images: [],
            videos: [],
          },
          aiAnalysis: {
            sarvam: {
              transcription: "குடிநீர் குழாய் உடைந்து தண்ணீர் வீணாக போகிறது.",
              detectedLanguage: "ta-IN",
              translatedEnglish: "Drinking water pipe broken and water is getting wasted.",
              audioProcessed: true,
              speechModel: "sarvam-saaras:v4",
              mode: "transcribe",
            },
            truthlens: {
              authenticityScore: 92,
              verdict: "VERIFIED_AUTHENTIC",
              aiGeneratedProbability: 0.04,
              isManipulated: false,
              locationConsistencyScore: 91,
              duplicateDetected: false,
              analysisSummary: "TruthLens verified reported location. Pressure anomaly confirmed by TWAD telemetry.",
              verifiedAt: new Date(),
            },
          },
          timeline: [
            {
              title: "Complaint Received",
              detail: "Your complaint has been successfully registered.",
              date: new Date("2026-10-30T09:15:00Z"),
              done: true,
            },
            {
              title: "Under Review by TruthLens AI",
              detail: "Location verified with water board zone map.",
              date: new Date("2026-10-30T10:00:00Z"),
              done: true,
              current: true,
            },
          ],
          createdAt: new Date("2026-10-30T09:15:00Z"),
          updatedAt: new Date("2026-10-30T10:00:00Z"),
        },
      ],
    };
    fs.writeFileSync(dbFilePath, JSON.stringify(initialData, null, 2), "utf8");
  }
}

initDb();

function readData() {
  try {
    const raw = fs.readFileSync(dbFilePath, "utf8");
    const data = JSON.parse(raw);
    if (!Array.isArray(data.users)) data.users = [];
    if (!Array.isArray(data.complaints)) data.complaints = [];
    if (!Array.isArray(data.adminActions)) data.adminActions = [];
    return data;
  } catch (err) {
    return { users: [], complaints: [], adminActions: [] };
  }
}

function writeData(data) {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), "utf8");
  } catch (err) {
    console.error("Error writing to resilient store:", err.message);
  }
}

module.exports = {
  readData,
  writeData,
};

