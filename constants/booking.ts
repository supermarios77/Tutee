import { User, Clock, Calendar, CreditCard } from 'lucide-react';
import { BookingStep, SubscriptionPlan } from '@/types/booking';

export const bookingSteps: BookingStep[] = [
  { title: 'Select Plan', icon: User },
  { title: 'Choose Teacher', icon: User },
  { title: 'Select Dates', icon: Calendar },
  { title: 'Choose Times', icon: Clock },
  { title: 'Payment', icon: CreditCard },
];

export const subscriptionPlans: SubscriptionPlan[] = [
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