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
  title?: string;
  date: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  teacherName?: string;
  // Add any other fields you're using
}

export interface User {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  role: string;
  lastLoginAt?: Date;
  hasClaimedFreeTrial: boolean;
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