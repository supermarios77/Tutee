require('dotenv').config();
const admin = require('firebase-admin');
const path = require('path');

// Path to your downloaded JSON key file
const serviceAccountPath = path.join(__dirname, '../tutee-uk-firebase-adminsdk-salk4-a7df43c6ad.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath))
});

const db = admin.firestore();

const teachers = [
  {
    id: 'teacher1',
    name: 'Abby',
    availableSlots: [
      { start: '09:00', end: '10:00' },
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
    ]
  },
  {
    id: 'teacher2',
    name: 'Jane Smith',
    availableSlots: [
      { start: '10:00', end: '11:00' },
      { start: '11:00', end: '12:00' },
      { start: '13:00', end: '14:00' },
      { start: '14:00', end: '15:00' },
      { start: '15:00', end: '16:00' },
      { start: '16:00', end: '17:00' },
    ]
  }
];

async function populateTeachers() {
  try {
    for (const teacher of teachers) {
      await db.collection('teachers').doc(teacher.id).set(teacher);
      console.log(`Teacher ${teacher.name} added successfully.`);
    }
    console.log('All teachers populated successfully');
  } catch (error) {
    console.error('Error populating teachers:', error);
  } finally {
    process.exit();
  }
}

console.log('Starting teacher population...');
populateTeachers();
