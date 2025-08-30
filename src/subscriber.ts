import "./tracing";

const subscriptionNameOrId = process.argv[2];
const projectId = process.argv[3];

// Imports the Google Cloud client library
import { Message, PubSub } from "@google-cloud/pubsub";

// Creates a client; cache this for further use.
const pubSubClient = new PubSub({
  projectId,
  enableOpenTelemetryTracing: true,
});

async function subscriptionListen() {
  const subscriber = pubSubClient.subscription(subscriptionNameOrId, {
    batching: {
      maxMessages: 1,
    },
  });

  // Message handler for subscriber
  const messageHandler = async (message: Message) => {
    console.log(`Message ${message.id} received.`);
    console.log(`SpanContext: `, message.parentSpan?.spanContext());
    // Assume that the message processing takes 2 seconds
    await new Promise((resolve) => setTimeout(resolve, 2000));
    message.ack();
  };

  // Error handler for subscriber
  const errorHandler = async (error: Error) => {
    console.log("Received error:", error);
  };

  // Listens for new messages from the topic
  subscriber.on("message", messageHandler);
  subscriber.on("error", errorHandler);
}

subscriptionListen();
