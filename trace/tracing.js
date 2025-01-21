const opentelemetry = require("@opentelemetry/api");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { WebTracerProvider } = require("@opentelemetry/sdk-trace-web");
const { registerInstrumentations } = require("@opentelemetry/instrumentation");
const { getNodeAutoInstrumentations } = require("@opentelemetry/auto-instrumentations-node");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("opentelemetry-instrumentation-express");

const { BatchSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const {
    OTLPTraceExporter,
} = require("@opentelemetry/exporter-trace-otlp-http");

// optonaly register automatic instrumentation libraries
registerInstrumentations({
    instrumentations: [
        getNodeAutoInstrumentations()
        // new HttpInstrumentation(),
        // new ExpressInstrumentation()
        new ExpressInstrumentatiom()
    ],
});


//const resource = Resource.default().merge(
//    new Resource({
//    [SemanticResource()]}))


const resource = Resource.default().merge(
    new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.SERVICE_NAME,
    [SemanticResourceAttributes.SERVICE_VERSION]: "0.1.0",
    })
);

const provider = new WebTracerProvider({
    resource: resource,
});
const exporter = new OTLPTraceExporter({
    url: "http://localhost:4318/v1/traces",
    headers: {},
});
const processor = new BatchSpanProcessor(exporter);
provider.addSpanProcessor(processor);

provider.register();