import { SpanExporter, ReadableSpan } from "@opentelemetry/sdk-trace-base";

import { ExportResult, ExportResultCode } from "@opentelemetry/core";

export class NoopSpanExporter implements SpanExporter {
  export(
    _spans: ReadableSpan[],
    resultCallback: (result: ExportResult) => void
  ): void {
    resultCallback({ code: ExportResultCode.SUCCESS });
  }
  shutdown(): Promise<void> {
    return Promise.resolve();
  }
  forceFlush(): Promise<void> {
    return Promise.resolve();
  }
}
