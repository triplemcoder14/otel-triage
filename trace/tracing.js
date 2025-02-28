const opentelemetry = require("@opentelemetry/api");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node"); // ✅ Use Node.js provider
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { OTLPTraceExporter } = require("@opentelemetry/exporter-trace-otlp-http");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");

registerInstrumentations({
    instrumentations: [getNodeAutoInstrumentations()]
});

//  resource with service name
const resource = new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME || "otel-triage-service",
    [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
});

const provider = new NodeTracerProvider({ resource }); // ✅ Fix: Use NodeTracerProvider
const exporter = new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
    headers: {},
});
provider.addSpanProcessor(new BatchSpanProcessor(exporter));

// register provider globally
provider.register();

//const provider = new WebTracerProvider({
//    resource: resource,
//});
//const exporter = new OTLPTraceExporter({
//    url: "http://localhost:4318/v1/traces",
//    headers: {},
//});
//const processor = new BatchSpanProcessor(exporter);
//provider.addSpanProcessor(processor);
//
//provider.register();