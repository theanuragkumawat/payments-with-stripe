/// <reference types="stripe-event-types" />

import stripe from 'stripe';

class StripeService {
  constructor() {
    // Note: stripe cjs API types are faulty
    /** @type {import('stripe').Stripe} */
    // @ts-ignore
    this.client = stripe(process.env.STRIPE_SECRET_KEY);
  }

  /**
   * @param {string} userId
   * @param {string} successUrl
   * @param {string} failureUrl
   */
  async checkoutPayment(context,
    userId, cartItems, addressInfo, orderStatus, paymentMethod,
    paymentStatus, totalAmount, orderDate, successUrl, failureUrl) {
    /** @type {import('stripe').Stripe.Checkout.SessionCreateParams.LineItem} */
    const line_items = cartItems.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: "product",
        },
        unit_amount: item.price * 100, // price in cents
      },
      quantity: item.quantity,
    }));

    try {
      return await this.client.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: line_items,
        success_url: successUrl,
        cancel_url: failureUrl,
        client_reference_id: userId,
        metadata: {
          userId,
          cartItems: JSON.stringify(cartItems),
          addressInfo: addressInfo,
          orderStatus: orderStatus || 'pending',
          paymentMethod: paymentMethod || 'stripe',
          paymentStatus: paymentStatus || 'pending',
          totalAmount: totalAmount,
          orderDate: orderDate || new Date().toISOString(),
        },
        mode: 'payment',
      });
    } catch (err) {
      context.error(err);
      return null;
    }
  }

  /**
   * @returns {import("stripe").Stripe.DiscriminatedEvent | null}
   */
  validateWebhook(context, req) {
    try {
      const event = this.client.webhooks.constructEvent(
        req.bodyBinary,
        req.headers['stripe-signature'],
        process.env.STRIPE_WEBHOOK_SECRET
      );
      return /** @type {import("stripe").Stripe.DiscriminatedEvent} */ (event);
    } catch (err) {
      context.error(err);
      return null;
    }
  }
}

export default StripeService;
