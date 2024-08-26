module.exports = {
  routes: [
    {
      method: "POST",
      path: "/orders/stripe-webhook",
      handler: "order.stripeWebhook",
      config: {
        auth: false,
      },
    },
  ],
};
