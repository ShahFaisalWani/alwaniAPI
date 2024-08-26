"use strict";

const stripe = require("stripe")(process.env.STRIPE_KEY);

/**
 * order controller
 */

const { createCoreController } = require("@strapi/strapi").factories;

module.exports = createCoreController("api::order.order", ({ strapi }) => ({
  async create(ctx) {
    const { destinationName, totalPrice, cancelRedirect } = ctx.request.body;

    const dest = await strapi.db.query("api::destination.destination").findOne({
      select: ["*"],
      where: { name: destinationName },
      populate: { main_img: true },
    });

    if (!dest.main_img) {
      ctx.throw(404, "Main image not found");
    }
    const imageUrl = `${process.env.API_URL}${dest.main_img.url}`;

    const stripeData = {
      price_data: {
        currency: "thb",
        product_data: {
          name: dest.title,
          images: [imageUrl],
        },
        unit_amount: totalPrice * 100,
      },
      quantity: 1,
    };

    try {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        success_url: `${process.env.CLIENT_URL}?success=true`,
        cancel_url: cancelRedirect,
        line_items: [stripeData],
        payment_method_types: ["card"],
        metadata: {
          destinationName: destinationName,
        },
      });

      // await strapi.service("api::order.order").create({
      //   data: {
      //     stripeId: session.id,
      //     destination: destinationName,
      //   },
      // });
      return { stripeSession: session };
    } catch (err) {
      ctx.response.status = 500;
      return err;
    }
  },

  async stripeWebhook(ctx) {
    const unparsedBody = ctx.request.body[Symbol.for("unparsedBody")];
    const sig = ctx.request.headers["stripe-signature"];
    let event;

    try {
      event = stripe.webhooks.constructEvent(
        unparsedBody,
        sig,
        process.env.STRIPE_WEBHOOK_SECRET
      );
    } catch (err) {
      console.log(err);
      return ctx.badRequest(`Webhook Error: ${err.message}`);
    }

    if (event.type === "payment_intent.succeeded") {
      const session = event.data.object;

      try {
        await strapi.service("api::order.order").create({
          data: {
            stripeId: session.id,
            destination: session.metadata.destinationName,
          },
        });

        return ctx.send({ message: "Order created successfully" });
      } catch (err) {
        ctx.internalServerError("Failed to create order");
      }
    } else {
      return ctx.send({ message: "Unhandled event type" });
    }
  },
}));
