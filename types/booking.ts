import { LucideIcon } from 'lucide-react';

export interface Teacher {
  id: string;
  name: string;
  email: string;
  bio: string;
  hourlyRate: number;
  avatarUrl?: string;
  specializations?: string[];
  availability?: {
    [day: string]: string[];
  };
  bookings: Booking[];
  availableForBooking: boolean;
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
  studentName?: string; // Add this line
  title?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  teacherName?: string;
  subscriptionPlanId?: string; // Add this line
  time?: string; // Add this line
  lessonType?: 'individual' | 'group'; // Add this line
  notes?: string; // Add this line
  isFreeTrial?: boolean; // Add this line
}

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  name: string; // Add this line
  email: string | null;
  role: string;
  lastLoginAt?: Date;
  hasClaimedFreeTrial: boolean;
  subscriptionPlanId?: string; // Add this line
  subscriptionStatus?: string; // Add this line
  stripeCustomerId?: string; // Add this line
  stripeSubscriptionId?: string; // Add this line
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