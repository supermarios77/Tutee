import { getFirestore } from 'firebase-admin/firestore';
import { Teacher, SubscriptionPlan, Booking, User, ActiveMeeting, TimeSlot } from '@/types/booking';
import { adminDb } from '@/lib/firebase-admin';
import Stripe from 'stripe';
import { addDays, format, setHours, setMinutes, startOfDay } from 'date-fns';

const db = adminDb;
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2024-06-20' });

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
    stripeCustomerId: '',
    stripeSubscriptionId: '',
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
    stripeCustomerId: '',
    stripeSubscriptionId: '',
    createdAt: new Date().toISOString(),
    lastLoginAt: new Date().toISOString(),
    hasClaimedFreeTrial: true
  }
];

const bookings: Booking[] = [
  {
    id: 'booking1',
    teacherId: 'teacher1',
    studentId: 'user1',
    studentName: 'John Doe',
    subscriptionPlanId: 'one-to-one-sessions',
    date: '2024-03-01',
    startTime: '10:00',
    endTime: '11:00',
    time: '10:00 - 11:00',
    lessonType: 'individual',
    status: 'scheduled',
    notes: 'Focus on business English',
    isFreeTrial: false
  },
  {
    id: 'booking2',
    teacherId: 'teacher2',
    studentId: 'user2',
    studentName: 'Jane Doe',
    subscriptionPlanId: 'group-sessions',
    date: '2024-03-02',
    startTime: '14:00',
    endTime: '15:00',
    time: '14:00 - 15:00',
    lessonType: 'group',
    status: 'scheduled',
    notes: 'Conversation practice',
    isFreeTrial: false
  }
];

const activeMeetings: ActiveMeeting[] = [
  {
    id: 'meeting1',
    teacherId: 'teacher1',
    description: 'One-on-one English lesson',
    startTime: new Date(),
    callId: 'call1',
  },
  {
    id: 'meeting2',
    teacherId: 'teacher2',
    description: 'Group conversation practice',
    startTime: new Date(Date.now() - 30 * 60000), // 30 minutes ago
    callId: 'call2',
  }
];

const teacherStats = [
  {
    teacherId: 'teacher1',
    totalStudents: 10,
    totalLessons: 50,
    totalEarnings: 875.00
  },
  {
    teacherId: 'teacher2',
    totalStudents: 8,
    totalLessons: 40,
    totalEarnings: 700.00
  }
];

async function clearAllData(): Promise<void> {
  const collections = ['teachers', 'subscriptionPlans', 'users', 'bookings', 'activeMeetings', 'teacherStats', 'availableSlots'];
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
    // Create a Stripe customer for each user
    const stripeCustomer = await stripe.customers.create({
      email: user.email,
      name: user.name,
      metadata: {
        firebaseUserId: user.id
      }
    });

    user.stripeCustomerId = stripeCustomer.id;

    // If the user has an active subscription, create it in Stripe
    if (user.subscriptionStatus === 'active' && user.subscriptionPlanId) {
      const stripePlan = await stripe.prices.create({
        unit_amount: subscriptionPlans.find(plan => plan.id === user.subscriptionPlanId)!.price * 100,
        currency: 'usd',
        recurring: { interval: 'month' },
        product_data: {
          name: subscriptionPlans.find(plan => plan.id === user.subscriptionPlanId)!.name,
        },
      });

      const subscription = await stripe.subscriptions.create({
        customer: stripeCustomer.id,
        items: [{ price: stripePlan.id }],
      });

      user.stripeSubscriptionId = subscription.id;
    }

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

async function populateActiveMeetings(): Promise<void> {
  for (const meeting of activeMeetings) {
    await db.collection('activeMeetings').doc(meeting.id).set(meeting);
    console.log(`Active meeting ${meeting.id} added successfully.`);
  }
}

async function populateTeacherStats(): Promise<void> {
  for (const stats of teacherStats) {
    await db.collection('teacherStats').doc(stats.teacherId).set(stats);
    console.log(`Teacher stats for ${stats.teacherId} added successfully.`);
  }
}

async function createAvailableSlots(): Promise<void> {
  const startDate = startOfDay(new Date()); // Today
  const endDate = addDays(startDate, 30); // Create slots for the next 30 days

  for (const teacher of teachers) {
    let currentDate = startDate;
    const availableSlots: TimeSlot[] = [];

    while (currentDate <= endDate) {
      const dayOfWeek = format(currentDate, 'EEEE').toLowerCase();
      const teacherAvailability = teacher.availability[dayOfWeek as keyof typeof teacher.availability];

      if (teacherAvailability) {
        const [startHour, startMinute] = teacherAvailability.start.split(':').map(Number);
        const [endHour, endMinute] = teacherAvailability.end.split(':').map(Number);

        let slotStart = setMinutes(setHours(currentDate, startHour), startMinute);
        const slotEnd = setMinutes(setHours(currentDate, endHour), endMinute);

        while (slotStart < slotEnd) {
          const slotEndTime = new Date(slotStart.getTime() + 60 * 60 * 1000); // Add 1 hour
          availableSlots.push({
            start: slotStart,
            end: slotEndTime,
          });
          slotStart = new Date(slotEndTime);
        }
      }

      currentDate = addDays(currentDate, 1);
    }

    await db.collection('availableSlots').doc(teacher.id).set({
      slots: availableSlots
    });
    console.log(`Created ${availableSlots.length} available slots for teacher ${teacher.name}`);
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

    console.log('Populating active meetings...');
    await populateActiveMeetings();

    console.log('Populating teacher stats...');
    await populateTeacherStats();

    console.log('Creating available slots for teachers...');
    await createAvailableSlots();

    console.log('Database setup completed successfully');
  } catch (error) {
    console.error('Error setting up database:', error);
  }
}