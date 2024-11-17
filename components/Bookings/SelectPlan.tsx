import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CheckCircle } from 'lucide-react';
import { SubscriptionPlan } from '@/types/booking';

interface SelectPlanProps {
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | undefined;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  isNewUser: boolean;
  setIsNewUser: (isNew: boolean) => void;
  userBookingInfo: { hasClaimedFreeTrial: boolean } | undefined;
}

export const SelectPlan: React.FC<SelectPlanProps> = ({
  plans,
  selectedPlan,
  onSelectPlan,
  isNewUser,
  setIsNewUser,
  userBookingInfo,
}) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">
        Select Your Plan
      </h2>
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <Card
            key={plan.id}
            className={`cursor-pointer transition-all duration-300 ${selectedPlan?.id === plan.id ? 'ring-2 ring-blue-500' : ''}`}
            onClick={() => onSelectPlan(plan)}
          >
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>
                ${plan.price}/{plan.interval}
              </CardDescription>
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
              <Button
                className="w-full"
                variant={selectedPlan?.id === plan.id ? 'default' : 'outline'}
              >
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
          <label
            htmlFor="newUser"
            className="text-sm text-gray-600 dark:text-gray-300"
          >
            I'm a new user (First lesson free)
          </label>
        </div>
      )}
    </>
  );
};
