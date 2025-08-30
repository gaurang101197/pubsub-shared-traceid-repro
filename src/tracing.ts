import { NodeTracerProvider } from "@opentelemetry/sdk-trace-node";
import {
  BatchSpanProcessor,
  ParentBasedSampler,
  TraceIdRatioBasedSampler,
} from "@opentelemetry/sdk-trace-base";

import { Resource } from "@opentelemetry/resources";
import { ATTR_SERVICE_NAME } from "@opentelemetry/semantic-conventions";
import { registerInstrumentations } from "@opentelemetry/instrumentation";
import { GrpcInstrumentation } from "@opentelemetry/instrumentation-grpc";
import { diag, DiagConsoleLogger, DiagLogLevel } from "@opentelemetry/api";
import { NoopSpanExporter } from "./NoopSpanExporter";

console.info("Initializing OpenTelemetry resources");
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.DEBUG);
const exporter = new NoopSpanExporter();
const resource = new Resource({
  [ATTR_SERVICE_NAME]: process.env.K8S_CONTAINER,
});
const processor = new BatchSpanProcessor(exporter);

const provider = new NodeTracerProvider({
  resource: resource,
  spanProcessors: [processor],
  sampler: new ParentBasedSampler({
    root: new TraceIdRatioBasedSampler(0.5),
  }),
});

provider.register();
console.info("OpenTelemetry resources registered");

registerInstrumentations({
  tracerProvider: provider,
  instrumentations: [
    new GrpcInstrumentation({
      // If tracing is disabled on publisher client, then we need to ignore StreamingPull method.
      // otherwise multiple messages will have the same context attached to it.
      // ignoreGrpcMethods: ["StreamingPull"],
    }),
  ],
});

console.info("gRPC instrumentation registered");
