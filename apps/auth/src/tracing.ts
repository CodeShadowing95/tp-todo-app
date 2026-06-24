import dotenv from 'dotenv';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-proto';
import { NodeSDK } from '@opentelemetry/sdk-node';

dotenv.config();

process.env.OTEL_SERVICE_NAME ??= 'auth';
process.env.OTEL_EXPORTER_OTLP_PROTOCOL ??= 'http/protobuf';
process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT ??=
    'http://localhost:4318/v1/traces';

const sdk = new NodeSDK({
    traceExporter: new OTLPTraceExporter({
        url: process.env.OTEL_EXPORTER_OTLP_TRACES_ENDPOINT,
    }),
    instrumentations: [
        getNodeAutoInstrumentations({
            '@opentelemetry/instrumentation-fs': {
                enabled: false,
            },
        }),
    ],
});

void sdk.start();

const shutdownTracing = () => {
    void sdk.shutdown().catch(() => {});
};

process.once('SIGINT', shutdownTracing);
process.once('SIGTERM', shutdownTracing);
