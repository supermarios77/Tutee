// app/components/booking/SelectPlan.tsx
import { Button } from '@/components/ui/button';
import { SubscriptionPlan } from '../../types/booking';
import { CheckCircle } from 'lucide-react';

interface SelectPlanProps {
  plans: SubscriptionPlan[];
  selectedPlan: SubscriptionPlan | undefined;
  onSelectPlan: (plan: SubscriptionPlan) => void;
  isEligibleForFreeTrial: boolean;
  isNewUser: boolean;
  onNewUserChange: (isNew: boolean) => void;
}

export const SelectPlan: React.FC<SelectPlanProps> = ({
  plans,
  selectedPlan,
  onSelectPlan,
  isEligibleForFreeTrial,
  isNewUser,
  onNewUserChange
}) => {
  return (
    <>
      <h2 className="text-2xl font-semibold mb-4 text-gray-800 dark:text-white">Select Your Plan</h2>
      <div className="space-y-4">
        {plans.map((plan) => (
          <div key={plan.id} className={`p-4 border rounded-lg ${selectedPlan?.id === plan.id ? 'border-blue-500' : 'border-gray-200'}`}>
            <h3 className="text-lg font-semibold">{plan.name}</h3>
            <p className="text-xl font-bold">${plan.price}/{plan.interval}</p>
            <ul className="mt-2">
              {plan.features.map((feature, index) => (
                <li key={index} className="flex items-center">
                  <CheckCircle size={16} className="text-green-500 mr-2" />
                  {feature}
                </li>
              ))}
            </ul>
            <Button
              onClick={() => onSelectPlan(plan)}
              className="mt-4 w-full"
            >
              Select Plan
            </Button>
          </div>
        ))}
      </div>
      {isEligibleForFreeTrial && (
        <div className="flex items-center mt-4">
          <input
            type="checkbox"
            id="newUser"
            checked={isNewUser}
            onChange={(e) => onNewUserChange(e.target.checked)}
            className="mr-2"
          />
          <label htmlFor="newUser">I'm a new user (First lesson free)</label>
        </div>
      )}
    </>
  );
};