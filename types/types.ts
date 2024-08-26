// app/types.ts

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
  }
  
  export interface Booking {
    id: string;
    teacherId: string;
    studentId: string;
    date: string;
    startTime: string;
    endTime: string;
    lessonType: 'individual' | 'group' | 'instant';
    status: 'scheduled' | 'completed' | 'cancelled';
    notes?: string;
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
  }