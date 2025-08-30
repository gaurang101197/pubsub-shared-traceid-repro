# Pub/Sub + OpenTelemetry gRPC: StreamingPull shares active context across messages

This repo reproduces an issue where, with gRPC auto-instrumentation enabled and opentelemetry tracing disabled on publisher client, the `StreamingPull` response stream binds one active context for the life of the stream. The user `message` handler sees the same `context.active()` trace across multiple messages, while Pub/Sub attaches a per-message span on `message.parentSpan`.

## Install

```bash
npm install
```

## Configure tracing

`src/tracing.ts` registers `GrpcInstrumentation` and sets up an opentelemetry SDK. Pub/Sub telemetry is enabled by passing `enableOpenTelemetryTracing: true` to the subscription client and enabled by passing `enableOpenTelemetryTracing: false` to the publisher client.

## Run

Create or pick an existing topic and subscription:

```bash
export PROJECT_ID=your-project-id
export TOPIC=my-topic
export SUB=my-subscription
```

Publish some messages:

```bash
# Below script publish messages with tracing disabled.
npx ts-node src/publish-message.ts "$TOPIC" "$PROJECT_ID" 5
```

Start the subscriber:

```bash
npx ts-node src/subscriber.ts "$SUB" "$PROJECT_ID"
```

Observe that multiple messages log the same `SpanContext:` traceId.

## Expected vs actual

- Expected: In case of tracing is disabled on publisher client, each pubsub message should have unique context attached to it.
- Actual: `context.active()` reflects the stream’s span for all messages on the same `StreamingPull` stream.

## Workarounds

- Exclude [StreamingPull](./src/tracing.ts) from gRPC instrumentation:
  
  ```ts
  new GrpcInstrumentation({ ignoreGrpcMethods: ['StreamingPull'] })
  ```

- Wrap the message handler in the per-message context.  

## Versions

- @google-cloud/pubsub: 4.11.0
- @opentelemetry/instrumentation: ^0.203.0
- @opentelemetry/instrumentation-grpc: ^0.203.0
- @opentelemetry/sdk-trace-node: 1.28.0
