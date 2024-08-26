import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20', // Updated to the latest stable version
});

export async function POST(request: Request) {
  try {
    const { amount, currency } = await request.json();

    if (!amount || !currency) {
      return NextResponse.json({ error: 'Amount and currency are required' }, { status: 400 });
    }

    // Ensure we're using the correct mode (test or live)
    const mode = process.env.STRIPE_SECRET_KEY?.startsWith('sk_test_') ? 'test' : 'live';
    console.log(`Using Stripe ${mode} mode`);

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      metadata: { mode }, // Add metadata to help with debugging
    });

    return NextResponse.json({ clientSecret: paymentIntent.client_secret, mode });
  } catch (error) {
    console.error('Error creating payment intent:', error);
    return NextResponse.json({ error: 'Error creating payment intent' }, { status: 500 });
  }
}