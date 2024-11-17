import { useState, useEffect } from 'react';
import { useUser } from '@clerk/nextjs';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  doc,
  getDoc,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Download, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';

interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: Date;
  paidAt: Date | null;
  invoiceUrl: string;
  pdfUrl: string;
}

export function InvoiceHistory() {
  const { user } = useUser();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchInvoices = async () => {
      if (!user) return;

      try {
        // Get user's Stripe customer ID
        const userDocRef = doc(db, 'users', user.id);
        const userDocSnap = await getDoc(userDocRef);
        const userData = userDocSnap.data() as DocumentData | undefined;
        const customerId = userData?.stripeCustomerId;

        if (!customerId) {
          setIsLoading(false);
          return;
        }

        // Query invoices
        const invoicesRef = collection(db, 'invoices');
        const q = query(
          invoicesRef,
          where('customerId', '==', customerId),
          orderBy('createdAt', 'desc'),
        );

        const querySnapshot = await getDocs(q);
        const fetchedInvoices = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
          paidAt: doc.data().paidAt?.toDate() || null,
        })) as Invoice[];

        setInvoices(fetchedInvoices);
      } catch (error) {
        console.error('Error fetching invoices:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchInvoices();
  }, [user]);

  const formatAmount = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency.toUpperCase(),
    }).format(amount / 100);
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

  if (invoices.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <FileText className="mx-auto h-12 w-12 mb-4" />
            <p>No invoices found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Invoice History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {invoices.map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between p-4 border rounded-lg"
            >
              <div>
                <p className="font-medium">
                  {formatAmount(invoice.amount, invoice.currency)}
                </p>
                <p className="text-sm text-gray-500">
                  {format(invoice.createdAt, 'MMM d, yyyy')}
                </p>
                <span
                  className={`inline-block px-2 py-1 text-xs rounded-full ${
                    invoice.status === 'paid'
                      ? 'bg-green-100 text-green-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {invoice.status}
                </span>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(invoice.pdfUrl, '_blank')}
                >
                  <Download className="h-4 w-4 mr-2" />
                  PDF
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(invoice.invoiceUrl, '_blank')}
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
