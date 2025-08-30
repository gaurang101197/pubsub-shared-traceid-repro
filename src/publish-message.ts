import { PubSub } from "@google-cloud/pubsub";

// Command-line arguments
const TOPIC_NAME = process.argv[2];
const PROJECT_ID = process.argv[3];
const NUM_MESSAGES = parseInt(process.argv[4], 10);

// Batch settings
const BATCH_SETTINGS = {
  maxBytes: 1024 * 1024, // 1 MB
  maxMessages: 500, // 500 messages per batch
  maxMilliseconds: 10, // 10 ms
};

// Function to publish messages
async function publishMessages(
  projectId: string,
  topicName: string,
  numMessages: number
) {
  const pubSubClient = new PubSub({
    projectId,
    enableOpenTelemetryTracing: false,
  });
  const topic = pubSubClient.topic(topicName, { batching: BATCH_SETTINGS });

  const publishPromises: Promise<string>[] = [];
  for (let i = 0; i < numMessages; i++) {
    const message = Buffer.from(`{ "message": "Test message #${i}" }`);
    const messageObject = {
      data: message,
    };
    publishPromises.push(topic.publishMessage(messageObject));

    // Flush every 1000 messages
    if (i > 0 && i % 1000 === 0) {
      await Promise.all(publishPromises);
      publishPromises.length = 0; // Clear the array
    }
  }

  await Promise.all(publishPromises);
  console.log(`✅ Published ${numMessages} messages to ${topicName}`);
}

// Main function
async function main() {
  console.log(`Using topic: ${TOPIC_NAME}`);
  await publishMessages(PROJECT_ID, TOPIC_NAME, NUM_MESSAGES);
}

// Run the main function
main().catch(console.error);
