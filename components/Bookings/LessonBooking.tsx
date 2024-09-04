import React, { useState, useEffect } from 'react'
import { collection, getDocs, doc, getDoc, addDoc, updateDoc, arrayUnion, increment, setDoc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { motion, AnimatePresence } from 'framer-motion'
import { User, Clock, Calendar, CheckCircle, ChevronLeft, ChevronRight, CreditCard, DollarSign, Lock } from 'lucide-react'
import { format, addDays, startOfWeek, addWeeks, isSameDay, parseISO, isFuture, addMinutes } from 'date-fns'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { Teacher, SubscriptionPlan, TimeSlot } from '@/types/booking'
import { useUser } from '@clerk/nextjs'
import { useUserBookingInfo } from '@/hooks/useUserBookingInfo'
import { subscriptionPlans, bookingSteps } from '@/constants/booking'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { useRouter } from 'next/navigation'
import { useToast } from '@/components/ui/use-toast'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

const PaymentForm = ({ clientSecret, onSuccess, amount, currency }: { clientSecret: string, onSuccess: () => void, amount: number, currency: string }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setProcessing(true);

    const result = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: elements.getElement(CardElement)!,
      }
    });

    if (result.error) {
      setError(result.error.message || 'An error occurred');
    } else {
      onSuccess();
    }

    setProcessing(false);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-3xl">
          <CreditCard className="mr-2 h-8 w-8" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="mb-6">
            <label htmlFor="card-element" className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">
              Card Details
            </label>
            <div className="border rounded-md p-4 bg-white dark:bg-gray-800">
              <CardElement
                id="card-element"
                options={{
                  style: {
                    base: {
                      fontSize: '18px',
                      color: '#424770',
                      '::placeholder': {
                        color: '#aab7c4',
                      },
                    },
                    invalid: {
                      color: '#9e2146',
                    },
                  },
                }}
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button
            type="submit"
            disabled={!stripe || processing}
            className="w-full flex items-center justify-center text-lg py-6"
          >
            {processing ? (
              <>
                <span className="mr-2">Processing</span>
                <div className="animate-spin rounded-full h-6 w-6 border-2 border-white border-t-transparent"></div>
              </>
            ) : (
              <>
                <Lock className="mr-2 h-6 w-6" />
                Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default function LessonBooking() {
  const [currentStep, setCurrentStep] = useState(0)
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | undefined>(undefined)
  const [selectedTeacher, setSelectedTeacher] = useState<string | undefined>(undefined)
  const [selectedDates, setSelectedDates] = useState<Date[]>([])
  const [selectedSlots, setSelectedSlots] = useState<TimeSlot[]>([])
  const [teachers, setTeachers] = useState<Teacher[]>([])
  const [availableSlots, setAvailableSlots] = useState<TimeSlot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentWeek, setCurrentWeek] = useState(startOfWeek(new Date()))
  const [isNewUser, setIsNewUser] = useState(false)
  const [paymentIntentClientSecret, setPaymentIntentClientSecret] = useState<string | null>(null)
  const [bookingId, setBookingId] = useState<string | null>(null)
  const [isConfirming, setIsConfirming] = useState(false)

  const { user } = useUser();
  const { userBookingInfo, isLoading: isUserInfoLoading } = useUserBookingInfo();
  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    fetchTeachers()
  }, [])

  useEffect(() => {
    if (selectedTeacher && selectedDates.length > 0) {
      fetchAvailableSlots(selectedTeacher, selectedDates)
    }
  }, [selectedTeacher, selectedDates])

  useEffect(() => {
    if (userBookingInfo) {
      setIsNewUser(!userBookingInfo.hasClaimedFreeTrial);
    }
  }, [userBookingInfo]);

  const fetchTeachers = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const teachersRef = collection(db, 'teachers')
      const teachersSnapshot = await getDocs(teachersRef)
      const teachersData = teachersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher))
      setTeachers(teachersData)
    } catch (error) {
      console.error('Error fetching teachers:', error)
      setError('Failed to fetch teachers. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const fetchAvailableSlots = async (teacherId: string, dates: Date[]) => {
    setIsLoading(true)
    setError(null)
    try {
      const teacherDocRef = doc(db, 'teachers', teacherId)
      const teacherDocSnapshot = await getDoc(teacherDocRef)

      if (!teacherDocSnapshot.exists()) {
        throw new Error('Teacher not found')
      }

      const teacherData = teacherDocSnapshot.data() as Teacher

      let allSlots: TimeSlot[] = []

      for (const date of dates) {
        const dayOfWeek = format(date, 'EEEE').toLowerCase()
        const teacherAvailability = teacherData.availability[dayOfWeek]

        if (teacherAvailability) {
          const startTime = parseISO(`${format(date, 'yyyy-MM-dd')}T${teacherAvailability.start}`)
          const endTime = parseISO(`${format(date, 'yyyy-MM-dd')}T${teacherAvailability.end}`)

          let currentSlotStart = startTime
          while (currentSlotStart < endTime) {
            const slotEnd = addMinutes(currentSlotStart, selectedPlan!.minutesPerSession)
            if (slotEnd <= endTime) {
              allSlots.push({ start: currentSlotStart, end: slotEnd })
            }
            currentSlotStart = slotEnd
          }
        }
      }

      setAvailableSlots(allSlots)
    } catch (error) {
      console.error('Error fetching available slots:', error)
      setError('Failed to fetch available slots. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const hasActiveBooking = () => {
    if (!userBookingInfo) return false;
    const now = new Date();
    return userBookingInfo.bookings.some(booking =>
      new Date(booking.date + 'T' + booking.endTime) > now && booking.status !== 'cancelled'
    );
  };

  const updateFirebaseAfterBooking = async (bookingId: string, userId: string, isNewUser: boolean) => {
    try {
      const userRef = doc(db, 'users', userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        // Update user's bookings
        await updateDoc(userRef, {
          bookings: arrayUnion(bookingId),
          hasClaimedFreeTrial: isNewUser ? true : userDoc.data().hasClaimedFreeTrial
        });

        // Update dashboard data
        const dashboardRef = doc(db, 'dashboards', userId);
        const dashboardDoc = await getDoc(dashboardRef);

        if (dashboardDoc.exists()) {
          await updateDoc(dashboardRef, {
            upcomingLessons: arrayUnion(bookingId),
            totalLessons: increment(1)
          });
        } else {
          // Create a new dashboard document if it doesn't exist
          await setDoc(dashboardRef, {
            upcomingLessons: [bookingId],
            totalLessons: 1
          });
        }
      } else {
        console.error("User document not found");
      }
    } catch (error) {
      console.error("Error updating Firebase after booking:", error);
      throw new Error("Failed to update user information after booking.");
    }
  };

  const handleBookLesson = async () => {
    if (hasActiveBooking()) {
      setError("You already have an active booking. Please attend or cancel your current lesson before booking a new one.");
      return;
    }

    if (!selectedSlots.length || !selectedTeacher || !selectedDates.length || !selectedPlan || !user) return

    setIsLoading(true)
    setError(null)
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
      }))

      const bookingRef = await addDoc(collection(db, 'bookings'), { bookings })
      setBookingId(bookingRef.id)

      // Update Firebase and dashboards
      await updateFirebaseAfterBooking(bookingRef.id, user.id, isNewUser);

      // Calculate the amount to charge
      const freeTrialDiscount = isNewUser && userBookingInfo && !userBookingInfo.hasClaimedFreeTrial ? selectedPlan.price / 4 : 0 // Assuming 4 weeks in a month
      const amountToCharge = Math.max(0, selectedPlan.price - freeTrialDiscount)

      // Create a payment intent
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId: bookingRef.id,
          amount: Math.round(amountToCharge * 100), // amount in cents
          currency: selectedPlan.currency,
        }),
      })

      const { clientSecret } = await response.json()
      setPaymentIntentClientSecret(clientSecret)

      // Move to payment step
      setCurrentStep(bookingSteps.length - 1) // Payment is the last step

    } catch (error) {
      console.error('Error booking lesson:', error)
      setError('Failed to book lesson. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = async () => {
    if (!bookingId || !user) return;

    try {
      // Update the booking status
      await updateDoc(doc(db, 'bookings', bookingId), {
        status: 'paid'
      });

      // Update the dashboard to reflect the paid status
      const dashboardRef = doc(db, 'dashboards', user.id);
      await updateDoc(dashboardRef, {
        paidLessons: arrayUnion(bookingId)
      });

      toast({
        title: "Booking Confirmed",
        description: "Your lesson has been successfully booked and paid for.",
      });

      // Reset the booking form
      setSelectedSlots([])
      setSelectedTeacher(undefined)
      setSelectedDates([])
      setSelectedPlan(undefined)
      setCurrentStep(0)
      setBookingId(null)
      setPaymentIntentClientSecret(null)

      // Redirect to dashboard
      router.push('/student-dashboard');
    } catch (error) {
      console.error('Error updating booking status:', error)
      setError('Payment successful, but there was an error updating your booking. Please contact support.')
    }
  }

  const nextStep = () => setCurrentStep((prev) => Math.min(prev + 1, bookingSteps.length - 1))
  const prevStep = () => setCurrentStep((prev) => Math.max(prev - 1, 0))

  const renderWeekCalendar = () => {
    const days = Array.from({ length: 7 }, (_, i) => addDays(currentWeek, i))

    return (
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <Button onClick={() => setCurrentWeek(addWeeks(currentWeek, -1))} variant="outline" size="icon">
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
            {format(currentWeek, 'MMMM yyyy')}
          </h3>
          <Button onClick={() => setCurrentWeek(addWeeks(currentWeek, 1))} variant="outline" size="icon">
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => (
            <TooltipProvider key={index}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    onClick={() => {
                      if (selectedDates.find(d => isSameDay(d, day))) {
                        setSelectedDates(selectedDates.filter(d => !isSameDay(d, day)))
                      } else if (selectedDates.length < selectedPlan!.sessionsPerWeek) {
                        setSelectedDates([...selectedDates, day])
                      }
                    }}
                    variant={selectedDates.find(d => isSameDay(d, day)) ? "default" : "outline"}
                    className="flex flex-col items-center p-2 h-auto"
                    disabled={!isFuture(day) || (selectedDates.length >= selectedPlan!.sessionsPerWeek && !selectedDates.find(d => isSameDay(d, day)))}
                  >
                    <span className="text-xs">{format(day, 'EEE')}</span>
                    <span className="text-lg">{format(day, 'd')}</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {isFuture(day) ?
                    (selectedDates.find(d => isSameDay(d, day)) ? 'Click to unselect' : 'Click to select') :
                    'Past date'
                  }
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          ))}
        </div>
      </div>
    )
  }

  if (isUserInfoLoading) {
    return <div>Loading user information...</div>;
  }

  if (hasActiveBooking()) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900 p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Active Booking</CardTitle>
          </CardHeader>
          <CardContent>
            <p>You already have an active booking. Please attend or cancel your current lesson before booking a new one.</p>
          </CardContent>
          <CardFooter>
            <Button onClick={() => router.push('/student-dashboard')}>
              Go to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-gradient-to-br from-blue-100 via-white to-purple-100 dark:from-blue-900 dark:via-gray-900 dark:to-purple-900 p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-4xl bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="flex flex-col md:flex-row">
          <div className="w-full md:w-1/3 bg-blue-600 p-8 text-white">
            <h1 className="text-4xl font-bold mb-6">Book Your Lessons</h1>
            <p className="text-lg mb-8">Follow these steps to schedule your perfect learning sessions.</p>
            <div className="space-y-6">
              {bookingSteps.map((step, index) => (
                <div key={index} className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-4 ${index <= currentStep ? 'bg-white text-blue-600' : 'bg-blue-500 text-white'
                    }`}>
                    {index < currentStep ? <CheckCircle size={28} /> : <step.icon size={28} />}
                  </div>
                  <span className={`text-xl ${index <= currentStep ? 'font-semibold' : 'text-blue-200'}`}>
                    {step.title}
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full md:w-2/3 p-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentStep}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-6"
              >
                {currentStep === 0 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Select Your Plan</h2>
                    <div className="grid gap-4 md:grid-cols-2">
                      {subscriptionPlans.map((plan) => (
                        <Card key={plan.id} className={`cursor-pointer transition-all duration-300 ${selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''}`}
                          onClick={() => setSelectedPlan(plan)}>
                          <CardHeader>
                            <CardTitle>{plan.name}</CardTitle>
                            <CardDescription>${plan.price}/{plan.interval}</CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ul className="space-y-2">
                              {plan.features.map((feature, index) => (
                                <li key={index} className="flex items-center">
                                  <CheckCircle size={16} className="text-green-500 mr-2" />
                                  {feature}
                                </li>
                              ))}
                            </ul>
                          </CardContent>
                          <CardFooter>
                            <Button className="w-full" variant={selectedPlan?.id === plan.id ? "default" : "outline"}>
                              {selectedPlan?.id === plan.id ? 'Selected' : 'Select Plan'}
                            </Button>
                          </CardFooter>
                        </Card>
                      ))}
                    </div>
                    {userBookingInfo && !userBookingInfo.hasClaimedFreeTrial && (
                      <div className="flex items-center mt-4">
                        <input
                          type="checkbox"
                          id="newUser"
                          checked={isNewUser}
                          onChange={(e) => setIsNewUser(e.target.checked)}
                          className="mr-2"
                        />
                        <label htmlFor="newUser">I'm a new user (First lesson free)</label>
                      </div>
                    )}
                  </>
                )}
                {currentStep === 1 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Select Your Teacher</h2>
                    <Select onValueChange={(value: string) => { setSelectedTeacher(value); nextStep(); }}>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose your teacher" />
                      </SelectTrigger>
                      <SelectContent>
                        {teachers.map((teacher) => (
                          <SelectItem key={teacher.id} value={teacher.id}>{teacher.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Choose Your Dates</h2>
                    <p className="mb-2">Select {selectedPlan!.sessionsPerWeek} day{selectedPlan!.sessionsPerWeek > 1 ? 's' : ''} for your weekly sessions.</p>
                    {renderWeekCalendar()}
                  </>
                )}
                {currentStep === 3 && (
                  <>
                    <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Select Your Times</h2>
                    {selectedDates.map((date, dateIndex) => (
                      <Card key={dateIndex} className="mb-4">
                        <CardHeader>
                          <CardTitle>{format(date, 'EEEE, MMMM d')}</CardTitle>
                        </CardHeader>
                        <CardContent>
                          {availableSlots.filter(slot => isSameDay(slot.start, date)).length === 0 ? (
                            <p>No available slots for this date. Please select another date.</p>
                          ) : (
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                              {availableSlots
                                .filter(slot => isSameDay(slot.start, date))
                                .map((slot, slotIndex) => (
                                  <Button
                                    key={slotIndex}
                                    onClick={() => {
                                      const newSelectedSlots = [...selectedSlots];
                                      newSelectedSlots[dateIndex] = slot;
                                      setSelectedSlots(newSelectedSlots);
                                    }}
                                    variant={selectedSlots[dateIndex] === slot ? "default" : "outline"}
                                    className="text-sm"
                                  >
                                    {format(slot.start, 'HH:mm')} - {format(slot.end, 'HH:mm')}
                                  </Button>
                                ))
                              }
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    ))}
                  </>
                )}
                {currentStep === 4 && (
                  <Card className="w-full bg-gradient-to-br from-blue-100 to-purple-100 dark:from-blue-900 dark:to-purple-900">
                    <CardHeader>
                      <CardTitle className="text-3xl font-bold flex items-center justify-center">
                        <DollarSign className="mr-2 h-8 w-8" />
                        Payment Summary
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-lg p-6 shadow-md">
                        <span className="text-2xl mb-2">Total amount:</span>
                        <span className="text-5xl font-bold mb-4">
                          ${isNewUser && userBookingInfo && !userBookingInfo.hasClaimedFreeTrial ?
                            (selectedPlan!.price * 0.75).toFixed(2) :
                            selectedPlan!.price.toFixed(2)
                          }
                        </span>
                        {isNewUser && userBookingInfo && !userBookingInfo.hasClaimedFreeTrial && (
                          <Badge variant="secondary" className="text-lg py-1 px-3">
                            25% off for new users
                          </Badge>
                        )}
                      </div>
                      <div className="bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                        <h3 className="text-xl font-semibold mb-2 flex items-center">
                          <Calendar className="mr-2 h-6 w-6" />
                          Booking Details
                        </h3>
                        <ul className="space-y-2">
                          <li><span className="font-semibold">Plan:</span> {selectedPlan?.name}</li>
                          <li><span className="font-semibold">Teacher:</span> {teachers.find(t => t.id === selectedTeacher)?.name}</li>
                          <li><span className="font-semibold">Sessions:</span> {selectedSlots.length}</li>
                        </ul>
                      </div>
                      <div className="text-sm text-gray-600 dark:text-gray-300 bg-white dark:bg-gray-800 rounded-lg p-4 shadow-md">
                        This amount will be charged to your card once you proceed to payment.
                      </div>
                    </CardContent>
                    <CardFooter>
                      {paymentIntentClientSecret ? (
                        <Elements stripe={stripePromise}>
                          <PaymentForm
                            clientSecret={paymentIntentClientSecret}
                            onSuccess={handlePaymentSuccess}
                            amount={Math.round((isNewUser && userBookingInfo && !userBookingInfo.hasClaimedFreeTrial ? selectedPlan!.price * 0.75 : selectedPlan!.price) * 100)}
                            currency={selectedPlan!.currency}
                          />
                        </Elements>
                      ) : (
                        <Button
                          onClick={() => setIsConfirming(true)}
                          disabled={selectedSlots.length < (selectedPlan?.sessionsPerWeek || 0)}
                          className="w-full text-lg py-6 flex items-center justify-center bg-green-500 hover:bg-green-600 text-white"
                        >
                          <CreditCard className="mr-2 h-6 w-6" />
                          Review Booking
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
            <div className="flex justify-between mt-8">
              <Button onClick={prevStep} disabled={currentStep === 0} variant="outline">
                Previous
              </Button>
              {currentStep < bookingSteps.length - 1 && (
                <Button onClick={nextStep} disabled={
                  (currentStep === 0 && !selectedPlan) ||
                  (currentStep === 1 && !selectedTeacher) ||
                  (currentStep === 2 && selectedDates.length < (selectedPlan?.sessionsPerWeek || 0)) ||
                  (currentStep === 3 && selectedSlots.length < (selectedPlan?.sessionsPerWeek || 0))
                }>
                  Next
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 text-red-500 text-center p-2 bg-red-100 dark:bg-red-900 rounded"
        >
          {error}
        </motion.div>
      )}
      {isLoading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      {isConfirming && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
        >
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Confirm Your Booking</CardTitle>
            </CardHeader>
            <CardContent>
              <p><strong>Plan:</strong> {selectedPlan?.name}</p>
              <p><strong>Teacher:</strong> {teachers.find(t => t.id === selectedTeacher)?.name}</p>
              <p><strong>Dates:</strong> {selectedDates.map(d => format(d, 'MMM d, yyyy')).join(', ')}</p>
              <p><strong>Total:</strong> ${isNewUser && userBookingInfo && !userBookingInfo.hasClaimedFreeTrial ?
                (selectedPlan!.price * 0.75).toFixed(2) :
                selectedPlan!.price.toFixed(2)}
              </p>
            </CardContent>
            <CardFooter className="flex justify-between">
              <Button onClick={() => setIsConfirming(false)} variant="outline">Edit Booking</Button>
              <Button onClick={handleBookLesson}>Confirm and Pay</Button>
            </CardFooter>
          </Card>
        </motion.div>
      )}
    </div>
  )
}