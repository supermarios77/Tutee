import { LucideIcon } from 'lucide-react';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  bio: string;
  hourlyRate: number;
  availability: {
    [key: string]: { start: string; end: string };
  };
  bookings: Booking[];
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: string;
  description: string;
  features: string[];
  sessionType: 'group' | 'individual';
  sessionsPerWeek: number;
  minutesPerSession: number;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}

export interface BookingStep {
  title: string;
  icon: LucideIcon;
}

export interface Booking {
  id: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  date: string;
  startTime: string;
  endTime: string;
  time: string;
  lessonType: 'individual' | 'group' | 'instant';
  status: 'scheduled' | 'completed' | 'cancelled' | 'paid';
  subscriptionPlanId: string;
  isFreeTrial: boolean;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher' | 'admin';
  subscriptionPlanId?: string;
  subscriptionStatus?: 'active' | 'inactive';
  createdAt: string;
  lastLoginAt: string;
  hasClaimedFreeTrial: boolean;
  stripeCustomerId?: string;
  stripeSubscriptionId?: string;
}

export interface UserBookingInfo {
  hasClaimedFreeTrial: boolean;
  bookings: Booking[];
}

export interface ActiveMeeting {
  id: string;
  teacherId: string;
  description: string;
  startTime: Date;
  callId: string;
}

export interface TimeSlot {
  start: Date;
  end: Date;
}