import { useState, useEffect } from 'react';
import { CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CreditCard, Lock, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface PaymentFormProps {
  amount: number;
  currency: string;
  onSuccess: () => void;
}

export const PaymentForm: React.FC<PaymentFormProps> = ({ amount, currency, onSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [stripeMode, setStripeMode] = useState<string | null>(null);

  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await fetch('/api/create-payment-intent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount, currency }),
        });
        const data = await response.json();
        if (data.error) {
          setError(data.error);
        } else {
          setClientSecret(data.clientSecret);
          setStripeMode(data.mode);
        }
      } catch (err) {
        setError('Failed to initialize payment. Please try again.');
      }
    };

    fetchClientSecret();
  }, [amount, currency]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements || !clientSecret) {
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

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (!clientSecret) {
    return <div>Loading payment form...</div>;
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-center text-2xl">
          <CreditCard className="mr-2" />
          Secure Payment
        </CardTitle>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <div className="mb-4">
            <label htmlFor="card-element" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Card Details
            </label>
            <div className="border rounded-md p-3 bg-white dark:bg-gray-800">
              <CardElement
                id="card-element"
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
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
          {stripeMode && (
            <Alert className="mt-4">
              <AlertTitle>Stripe Mode: {stripeMode}</AlertTitle>
              <AlertDescription>
                {stripeMode === 'test' ? 'Use test card number: 4242 4242 4242 4242' : 'Using live mode'}
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
        <CardFooter>
          <Button 
            type="submit" 
            disabled={!stripe || processing} 
            className="w-full flex items-center justify-center"
          >
            {processing ? (
              <>
                <span className="mr-2">Processing</span>
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
              </>
            ) : (
              <>
                <Lock className="mr-2 h-4 w-4" />
                Pay {new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount / 100)}
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};