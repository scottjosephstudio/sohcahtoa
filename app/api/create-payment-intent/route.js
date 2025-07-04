// app/api/create-payment-intent/route.js
import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function POST(request) {
  try {
    const body = await request.json();
    const { amount, currency = 'gbp', forceNew = false } = body;

    // Enhanced amount validation
    const numericAmount = Number(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount provided. Amount must be a positive number.' },
        { status: 400 }
      );
    }

    // Convert to pence and ensure it's a whole number
    const amountInPence = Math.round(numericAmount * 100);
    
    // Create PaymentIntent with additional configuration
    const paymentIntentOptions = {
      amount: amountInPence,
      currency,
      automatic_payment_methods: body.automatic_payment_methods || {
        enabled: false
      },
      payment_method_types: body.payment_method_types || ['card'],
      metadata: {
        product_type: 'Font License',
        created_at: new Date().toISOString(),
        force_new: forceNew
      },
      capture_method: 'automatic'
    };
    
    const idempotencyKey = forceNew ? `payment_intent_${Date.now()}` : undefined;
    
    const paymentIntent = await stripe.paymentIntents.create(
      paymentIntentOptions,
      idempotencyKey ? { idempotencyKey } : {}
    );

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });

  } catch (err) {
    console.error('Error creating payment intent:', err);
    
    if (err.type === 'StripeInvalidRequestError') {
      return NextResponse.json(
        { error: err.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Error creating payment intent',
        message: process.env.NODE_ENV === 'development' ? err.message : undefined
      },
      { status: 500 }
    );
  }
}