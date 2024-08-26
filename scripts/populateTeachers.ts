import dotenv from 'dotenv';
import admin from 'firebase-admin';
import path from 'path';

dotenv.config();

// Path to your downloaded JSON key file
const serviceAccountPath = path.join(__dirname, '../tutee-uk-firebase-adminsdk-salk4-a7df43c6ad.json');

// Initialize Firebase Admin SDK
admin.initializeApp({
  credential: admin.credential.cert(require(serviceAccountPath) as admin.ServiceAccount)
});

const db = admin.firestore();

interface Teacher {
  id: string;
  name: string;
  email: string;
  bio: string;
  hourlyRate: number;
  availability: {
    [key: string]: { start: string; end: string };
  };
  bookings: any[]; // You might want to define a more specific type for bookings
}

interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  features: string[];
}

const teachers: Teacher[] = [
  {
    id: 'teacher1',
    name: 'Abby',
    email: 'abby@tutee.co.uk',
    bio: 'Experienced English teacher specializing in conversation and business English.',
    hourlyRate: 17.5,
    availability: {
      monday: { start: '09:00', end: '17:00' },
      tuesday: { start: '09:00', end: '17:00' },
      wednesday: { start: '09:00', end: '17:00' },
      thursday: { start: '09:00', end: '17:00' },
      friday: { start: '09:00', end: '17:00' },
    },
    bookings: []
  },
  {
    id: 'teacher2',
    name: 'Jane Smith',
    email: 'jane@tutee.co.uk',
    bio: 'TEFL certified teacher with 5 years of experience in teaching English as a second language.',
    hourlyRate: 17.5,
    availability: {
      monday: { start: '10:00', end: '18:00' },
      tuesday: { start: '10:00', end: '18:00' },
      wednesday: { start: '10:00', end: '18:00' },
      thursday: { start: '10:00', end: '18:00' },
      friday: { start: '10:00', end: '18:00' },
    },
    bookings: []
  }
];

const subscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'group-sessions',
    name: 'Group Sessions',
    price: 59.99,
    currency: 'USD',
    interval: 'month',
    description: 'Up to 4 people, 2x30 minute sessions per week',
    features: [
      'Up to 4 people',
      '2x30 minute sessions',
      'Includes resources',
      'Interesting and interactive topics'
    ]
  },
  {
    id: 'one-to-one-sessions',
    name: 'One To One Sessions',
    price: 70.00,
    currency: 'USD',
    interval: 'month',
    description: '1 hour a week of personalized tutoring',
    features: [
      '1 hour a week',
      'Split sessions into 2x30min classes',
      'Resources for extra learning included',
      'Tailored teaching approach'
    ]
  }
];

async function clearAllData(): Promise<void> {
  const collections = ['teachers', 'subscriptionPlans', 'users', 'bookings'];
  for (const collectionName of collections) {
    const collectionRef = db.collection(collectionName);
    const snapshot = await collectionRef.get();
    const batch = db.batch();
    snapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });
    await batch.commit();
    console.log(`Cleared ${collectionName} collection`);
  }
}

async function populateTeachers(): Promise<void> {
  for (const teacher of teachers) {
    await db.collection('teachers').doc(teacher.id).set(teacher);
    console.log(`Teacher ${teacher.name} added successfully.`);
  }
}

async function populateSubscriptionPlans(): Promise<void> {
  for (const plan of subscriptionPlans) {
    await db.collection('subscriptionPlans').doc(plan.id).set(plan);
    console.log(`Subscription plan ${plan.name} added successfully.`);
  }
}

async function setupDatabase(): Promise<void> {
  try {
    console.log('Clearing old data...');
    await clearAllData();

    console.log('Populating teachers...');
    await populateTeachers();

    console.log('Populating subscription plans...');
    await populateSubscriptionPlans();

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  } finally {
    process.exit();
  }
}

console.log('Starting database setup...');
setupDatabase();