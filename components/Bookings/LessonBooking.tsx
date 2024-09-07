'use client'

import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { useUserBookingInfo } from '@/hooks/useUserBookingInfo';
import { SelectPlan } from '@/components/Bookings/SelectPlan';
import { SelectTeacher } from '@/components/Bookings/SelectTeacher';
import { ChooseDates } from '@/components/Bookings/ChooseDates';
import { SelectTimes } from '@/components/Bookings/SelectTimes';
import { PaymentForm } from '@/components/Bookings/PaymentForm';
import { bookingSteps, subscriptionPlans } from '@/constants/booking';
import { Teacher, SubscriptionPlan, TimeSlot, Booking } from '@/types/booking';
import { collection, addDoc, doc, updateDoc, arrayUnion, increment, setDoc, getDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Elements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, isSameDay } from 'date-fns';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

export default function LessonBooking() {
  const [currentStep, setCurrentStep] = useState(0);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>(undefined);
  const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>(undefined);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([]);
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([]);
  const [isNewUser, setIsNewUser] = useState(false);
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string | null>(null);
  const [bookingId, setBookingId] = useState<string | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [teachers, setTeachers] = useState<Teacher[]>([]);

  const { user } = useUser();
  const { userBookingInfo, isLoading: isUserInfoLoading } = useUserBookingInfo();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers();
  }, []);

  useEffect(() => {
    if (selectedTeacher && selectedDates.length > 0) {
      fetchAvailableSlots(selectedTeacher, selectedDates);
    }
  }, [selectedTeacher, selectedDates]);

  useEffect(() => {
    if (userBookingInfo) {
      setIsNewUser(!userBookingInfo.hasClaimedFreeTrial);
    }
  }, [userBookingInfo]);

  const fetchTeachers = async () => {
    try {
      const response = await fetch('/api/get-teachers');
      if (!response.ok) {
        throw new Error('Failed to fetch teachers');
      }
      const teachersData = await response.json();
      setTeachers(teachersData);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      setError('Failed to fetch teachers. Please try again.');
    }
  };

  const fetchAvailableSlots = async (teacherId: string, dates: Date[]) => {
    setIsLoading(true);
    setError(null);
    try {
      const slotsRef = doc(db, 'availableSlots', teacherId);
      const slotsSnapshot = await getDoc(slotsRef);
      if (slotsSnapshot.exists()) {
        const allSlots = slotsSnapshot.data().slots.map((slot: any) => ({
          start: new Date(slot.start),
          end: new Date(slot.end)
        })) as TimeSlot[];
        const filteredSlots = allSlots.filter(slot =>
          dates.some(date => isSameDay(slot.start, date))
        );
        setAvailableSlots(filteredSlots);
      }
    } catch (error) {
      console.error('Error fetching available slots:', error);
      setError('Failed to fetch available slots. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleBookLesson = async () => {
    if (!selectedSlots.length || !selectedTeacher || !selectedDates.length || !selectedPlan || !user) return;

    setIsLoading(true);
    setError(null);
    try {
      const bookings = selectedSlots.map((slot, index) => ({
        teacherId: selectedTeacher,
        studentId: user.id,
        date: format(selectedDates[index], 'yyyy-MM-dd'),
        startTime: format(slot.start, 'HH:mm'),
        endTime: format(slot.end, 'HH:mm'),
        lessonType: selectedPlan.sessionType,
        status: 'scheduled',
        subscriptionPlanId: selectedPlan.id,
        isFreeTrial: isNewUser && userBookingInfo && !userBookingInfo.hasClaimedFreeTrial && index === 0
      } as Booking));

      const bookingRef = await addDoc(collection(db, 'bookings'), { bookings });
      setBookingId(bookingRef.id);

      await updateFirebaseAfterBooking(bookingRef.id, user.id, isNewUser);

      const freeTrialDiscount = isNewUser && userBookingInfo && !userBookingInfo.hasClaimedFreeTrial ? selectedPlan.price / 4 : 0;
      const amountToCharge = Math.max(0, selectedPlan.price - freeTrialDiscount);

      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingRef.id,
          amount: Math.round(amountToCharge * 100),
          currency: selectedPlan.currency,
        }),
      });

      const { clientSecret } = await response.json();
      setPaymentIntentClientSecret(clientSecret);

      setCurrentStep(bookingSteps.length - 1);
    } catch (error) {
      console.error('Error booking lesson:', error);
      setError('Failed to book lesson. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const updateFirebaseAfterBooking = async (bookingId: string, userId: string, isNewUser: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        bookings: arrayUnion(bookingId),
        hasClaimedFreeTrial: isNewUser ? true : userBookingInfo?.hasClaimedFreeTrial
      });

      const dashboardRef = doc(db, 'dashboards', userId);
      await setDoc(dashboardRef, {
        upcomingLessons: arrayUnion(bookingId),
        totalLessons: increment(1)
      }, { merge: true });
    } catch (error) {
      console.error("Error updating Firebase after booking:", error);
      throw new Error("Failed to update user information after booking.");
    }
  };

  const handlePaymentSuccess = async () => {
    if (!bookingId || !user) return;

    try {
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'paid'
      });

      const dashboardRef = doc(db, 'dashboards', user.id);
      await updateDoc(dashboardRef, {
        paidLessons: arrayUnion(bookingId)
      });

      toast({
        title: "Booking Confirmed",
        description: "Your lesson has been successfully booked and paid for.",
      });

      setSelectedSlots([]);
      setSelectedTeacher(undefined);
      setSelectedDates([]);
      setSelectedPlan(undefined);
      setCurrentStep(0);
      setBookingId(null);
      setPaymentIntentClientSecret(null);

      router.push('/student-dashboard');
    } catch (error) {
      console.error('Error updating booking status:', error);
      setError('Payment successful, but there was an error updating your booking. Please contact support.');
    }
  };

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, bookingSteps.length - 1));
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0));

  if (isUserInfoLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold mb-6">Book Your Lesson</h1>

      <div className="flex justify-between mb-6">
        {bookingSteps.map((step, index) => (
          <div key={index} className={`flex items-center ${index <= currentStep ? 'text-blue-600' : 'text-gray-400'}`}>
            <step.icon className="mr-2" />
            <span>{step.title}</span>
          </div>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{bookingSteps[currentStep].title}</CardTitle>
        </CardHeader>
        <CardContent>
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              {currentStep === 0 && (
                <SelectPlan
                  plans={subscriptionPlans}
                  selectedPlan={selectedPlan}
                  onSelectPlan={setSelectedPlan}
                  isNewUser={isNewUser}
                  setIsNewUser={setIsNewUser}
                  userBookingInfo={userBookingInfo ? { hasClaimedFreeTrial: userBookingInfo.hasClaimedFreeTrial } : undefined}
                />
              )}
              {currentStep === 1 && (
                <SelectTeacher
                  teachers={teachers}
                  onSelectTeacher={setSelectedTeacher}
                />
              )}
              {currentStep === 2 && selectedPlan && (
                <ChooseDates
                  selectedPlan={selectedPlan}
                  selectedDates={selectedDates}
                  setSelectedDates={setSelectedDates}
                />
              )}
              {currentStep === 3 && selectedTeacher && (
                <SelectTimes
                  selectedDates={selectedDates}
                  selectedTeacherId={selectedTeacher}
                  selectedSlots={selectedSlots}
                  setSelectedSlots={setSelectedSlots}
                />
              )}
              {currentStep === 4 && paymentIntentClientSecret && (
                <Elements stripe={stripePromise}>
                  <PaymentForm
                    clientSecret={paymentIntentClientSecret}
                    onSuccess={handlePaymentSuccess}
                    amount={Math.round((isNewUser && userBookingInfo && !userBookingInfo.hasClaimedFreeTrial ? selectedPlan!.price * 0.75 : selectedPlan!.price) * 100)}
                    currency={selectedPlan!.currency}
                  />
                </Elements>
              )}
            </motion.div>
          </AnimatePresence>
        </CardContent>
      </Card>

      <div className="flex justify-between mt-6">
        <Button onClick={prevStep} disabled={currentStep === 0}>
          Previous
        </Button>
        {currentStep < bookingSteps.length - 1 ? (
          <Button onClick={nextStep} disabled={
            (currentStep === 0 && !selectedPlan) ||
            (currentStep === 1 && !selectedTeacher) ||
            (currentStep === 2 && selectedDates.length < (selectedPlan?.sessionsPerWeek || 0)) ||
            (currentStep === 3 && selectedSlots.length < (selectedPlan?.sessionsPerWeek || 0))
          }>
            Next
          </Button>
        ) : (
          <Button onClick={handleBookLesson} disabled={isLoading}>
            Confirm Booking
          </Button>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
    </div>
  );
}