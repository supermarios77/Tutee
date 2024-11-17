import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { db } from '@/lib/firebase';
import {
  doc,
  updateDoc,
  setDoc,
  collection,
  query,
  where,
  getDocs,
  addDoc,
} from 'firebase/firestore';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = headers().get('stripe-signature')!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed');
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        await handlePaymentSuccess(paymentIntent);
        break;

      case 'subscription.created':
      case 'subscription.updated':
        const subscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionUpdate(subscription);
        break;

      case 'subscription.deleted':
        const deletedSubscription = event.data.object as Stripe.Subscription;
        await handleSubscriptionDeletion(deletedSubscription);
        break;

      case 'invoice.paid':
        const invoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaid(invoice);
        break;

      case 'invoice.payment_failed':
        const failedInvoice = event.data.object as Stripe.Invoice;
        await handleInvoicePaymentFailed(failedInvoice);
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 },
    );
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const userId = paymentIntent.metadata.userId;
  if (!userId) return;

  // Update user's payment status
  const userRef = doc(db, 'users', userId);
  await updateDoc(userRef, {
    lastPaymentStatus: 'succeeded',
    lastPaymentDate: new Date(),
  });
}

async function handleSubscriptionUpdate(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Query user by stripeCustomerId
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('stripeCustomerId', '==', customerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('No user found with customer ID:', customerId);
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'users', userDoc.id);

    // Update user's subscription status
    await updateDoc(userRef, {
      subscriptionStatus: subscription.status,
      subscriptionPlanId: subscription.items.data[0].price.id,
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      stripeSubscriptionId: subscription.id,
    });

    // Create subscription record
    await setDoc(doc(db, 'subscriptions', subscription.id), {
      userId: userDoc.id,
      status: subscription.status,
      priceId: subscription.items.data[0].price.id,
      currentPeriodStart: new Date(subscription.current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error updating subscription:', error);
    throw error;
  }
}

async function handleSubscriptionDeletion(subscription: Stripe.Subscription) {
  const customerId = subscription.customer as string;

  try {
    // Query user by stripeCustomerId
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('stripeCustomerId', '==', customerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('No user found with customer ID:', customerId);
      return;
    }

    const userDoc = querySnapshot.docs[0];
    const userRef = doc(db, 'users', userDoc.id);

    // Update user's subscription status
    await updateDoc(userRef, {
      subscriptionStatus: 'canceled',
      currentPeriodEnd: new Date(subscription.current_period_end * 1000),
    });

    // Update subscription record
    await updateDoc(doc(db, 'subscriptions', subscription.id), {
      status: 'canceled',
      canceledAt: new Date(),
      updatedAt: new Date(),
    });
  } catch (error) {
    console.error('Error handling subscription deletion:', error);
    throw error;
  }
}

async function handleInvoicePaid(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  try {
    // Create invoice record
    await setDoc(doc(db, 'invoices', invoice.id), {
      customerId,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: invoice.status,
      subscriptionId: invoice.subscription,
      invoiceUrl: invoice.hosted_invoice_url,
      pdfUrl: invoice.invoice_pdf,
      createdAt: new Date(invoice.created * 1000),
      paidAt: invoice.status === 'paid' ? new Date() : null,
    });

    // Update payment history
    await addDoc(collection(db, 'paymentHistory'), {
      customerId,
      invoiceId: invoice.id,
      amount: invoice.amount_paid,
      currency: invoice.currency,
      status: 'succeeded',
      type: 'invoice_payment',
      createdAt: new Date(),
    });
  } catch (error) {
    console.error('Error handling invoice payment:', error);
    throw error;
  }
}

async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  const customerId = invoice.customer as string;

  try {
    // Query user by stripeCustomerId
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where('stripeCustomerId', '==', customerId));
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      console.error('No user found with customer ID:', customerId);
      return;
    }

    const userDoc = querySnapshot.docs[0];

    // Update invoice status
    await setDoc(doc(db, 'invoices', invoice.id), {
      customerId,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      subscriptionId: invoice.subscription,
      createdAt: new Date(invoice.created * 1000),
      failedAt: new Date(),
    });

    // Add to payment history
    await addDoc(collection(db, 'paymentHistory'), {
      customerId,
      invoiceId: invoice.id,
      amount: invoice.amount_due,
      currency: invoice.currency,
      status: 'failed',
      type: 'invoice_payment_failed',
      createdAt: new Date(),
    });

    // TODO: Implement notification system
    // await sendPaymentFailedNotification(userDoc.id);
  } catch (error) {
    console.error('Error handling failed invoice payment:', error);
    throw error;
  }
}
