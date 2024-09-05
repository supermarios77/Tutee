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
  date: string;
  startTime: string;
  endTime: string;
  time: string; // Add this line
  lessonType: 'individual' | 'group' | 'instant';
  status: 'scheduled' | 'completed' | 'cancelled';
  subscriptionPlanId: string;
  isFreeTrial: boolean;
  notes: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'student' | 'admin';
  subscriptionPlanId?: string;
  subscriptionStatus?: 'active' | 'inactive';
  createdAt: string;
  lastLoginAt: string;
  hasClaimedFreeTrial: boolean;
}

export interface UserBookingInfo {
  hasClaimedFreeTrial: boolean;
  bookings: Booking[];
}