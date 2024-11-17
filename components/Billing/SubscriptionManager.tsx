import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import { doc, getDoc, DocumentData } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { subscriptionPlans } from '@/constants/booking';
import { useToast } from '@/components/ui/use-toast';

interface SubscriptionDetails {
  status: string;
  currentPeriodEnd: Date;
  planId: string;
}

export function SubscriptionManager() {
  const { user } = useUser();
  const { toast } = useToast();
  const [subscription, setSubscription] = useState<SubscriptionDetails | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchSubscription = async () => {
      if (!user) return;

      try {
        const userDocRef = doc(db, 'users', user.id);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data() as DocumentData | undefined;

        if (userData?.subscriptionPlanId) {
          setSubscription({
            status: userData.subscriptionStatus,
            currentPeriodEnd: userData.currentPeriodEnd.toDate(),
            planId: userData.subscriptionPlanId,
          });
        }
      } catch (error) {
        console.error('Error fetching subscription:', error);
        toast({
          title: 'Error',
          description: 'Failed to load subscription details',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscription();
  }, [user, toast]);

  const handleUpdateSubscription = async (newPlanId: string) => {
    if (!user) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId: newPlanId }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error);

      // Redirect to Stripe Checkout or handle client secret
      if (data.clientSecret) {
        // Handle payment if needed
        toast({
          title: 'Success',
          description: 'Subscription updated successfully',
        });
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to update subscription',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleCancelSubscription = async () => {
    if (!user || !subscription) return;

    setIsUpdating(true);
    try {
      const response = await fetch('/api/subscriptions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error);
      }

      toast({
        title: 'Success',
        description: 'Subscription cancelled successfully',
      });

      // Update local state
      setSubscription((prev) =>
        prev ? { ...prev, status: 'canceled' } : null,
      );
    } catch (error) {
      console.error('Error cancelling subscription:', error);
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Subscription Management</CardTitle>
      </CardHeader>
      <CardContent>
        {subscription ? (
          <div className="space-y-4">
            <div className="p-4 border rounded-lg">
              <h3 className="font-medium">Current Plan</h3>
              <p className="text-sm text-gray-500">
                {
                  subscriptionPlans.find((p) => p.id === subscription.planId)
                    ?.name
                }
              </p>
              <p className="text-sm text-gray-500">
                Status: {subscription.status}
              </p>
              <p className="text-sm text-gray-500">
                Renews: {format(subscription.currentPeriodEnd, 'MMMM d, yyyy')}
              </p>
            </div>

            {subscription.status === 'active' && (
              <div className="space-y-4">
                <div>
                  <h3 className="font-medium mb-2">Change Plan</h3>
                  <div className="grid gap-2">
                    {subscriptionPlans.map(
                      (plan) =>
                        plan.id !== subscription.planId && (
                          <Button
                            key={plan.id}
                            variant="outline"
                            onClick={() => handleUpdateSubscription(plan.id)}
                            disabled={isUpdating}
                            className="w-full"
                          >
                            Switch to {plan.name}
                          </Button>
                        ),
                    )}
                  </div>
                </div>

                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={isUpdating}
                  className="w-full"
                >
                  Cancel Subscription
                </Button>
              </div>
            )}

            {subscription.status === 'canceled' && (
              <Alert>
                <AlertDescription>
                  Your subscription will end on{' '}
                  {format(subscription.currentPeriodEnd, 'MMMM d, yyyy')}
                </AlertDescription>
              </Alert>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-center text-gray-500">No active subscription</p>
            <div className="grid gap-2">
              {subscriptionPlans.map((plan) => (
                <Button
                  key={plan.id}
                  onClick={() => handleUpdateSubscription(plan.id)}
                  disabled={isUpdating}
                  className="w-full"
                >
                  Subscribe to {plan.name}
                </Button>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
