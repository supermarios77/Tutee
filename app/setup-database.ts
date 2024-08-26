import { initializeApp, cert, getApps } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { Teacher, SubscriptionPlan, Booking, User } from '@/types/booking';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  initializeApp({
    credential: cert(require('../tutee-uk-firebase-adminsdk-salk4-a7df43c6ad.json'))
  });
}

const db = getFirestore();

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
    ],
    sessionType: 'group',
    sessionsPerWeek: 2,
    minutesPerSession: 30
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
    ],
    sessionType: 'individual',
    sessionsPerWeek: 1,
    minutesPerSession: 60
  }
];

const users: User[] = [
  {
    id: 'user1',
    name: 'John Doe',
    email: 'john@example.com',
    role: 'student',
    subscriptionPlanId: 'one-to-one-sessions',
    subscriptionStatus: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    hasClaimedFreeTrial: false
  },
  {
    id: 'user2',
    name: 'Jane Doe',
    email: 'jane@example.com',
    role: 'student',
    subscriptionPlanId: 'group-sessions',
    subscriptionStatus: 'active',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    hasClaimedFreeTrial: true
  },
];

const bookings: Booking[] = [
  {
    id: 'booking1',
    teacherId: 'teacher1',
    studentId: 'user1',
    date: '2024-03-01',
    startTime: '10:00',
    endTime: '11:00',
    lessonType: 'individual',
    status: 'scheduled',
    notes: 'Focus on business English',
  },
  {
    id: 'booking2',
    teacherId: 'teacher2',
    studentId: 'user2',
    date: '2024-03-02',
    startTime: '14:00',
    endTime: '15:00',
    lessonType: 'group',
    status: 'scheduled',
    notes: 'Conversation practice',
  },
  {
    id: 'booking3',
    teacherId: 'teacher1',
    studentId: 'user1',
    date: new Date().toISOString().split('T')[0],
    startTime: new Date().toTimeString().split(' ')[0].slice(0, 5),
    endTime: new Date(Date.now() + 30*60000).toTimeString().split(' ')[0].slice(0, 5),
    lessonType: 'instant',
    status: 'scheduled',
    notes: 'Instant booking for immediate language help',
  },
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

async function populateUsers(): Promise<void> {
  for (const user of users) {
    await db.collection('users').doc(user.id).set(user);
    console.log(`User ${user.name} added successfully.`);
  }
}

async function populateBookings(): Promise<void> {
  for (const booking of bookings) {
    await db.collection('bookings').doc(booking.id).set(booking);
    console.log(`Booking ${booking.id} added successfully.`);
  }
}

export async function setupDatabase(): Promise<void> {
  try {
    console.log('Clearing old data...');
    await clearAllData();

    console.log('Populating teachers...');
    await populateTeachers();

    console.log('Populating subscription plans...');
    await populateSubscriptionPlans();

    console.log('Populating users...');
    await populateUsers();

    console.log('Populating bookings...');
    await populateBookings();

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}