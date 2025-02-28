const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
const { Resource } = require("@opentelemetry/resources");
const { SemanticResourceAttributes } = require("@opentelemetry/semantic-conventions");
const { ConsoleSpanExporter, SimpleSpanProcessor } = require("@opentelemetry/sdk-trace-base");
const { JaegerExporter } = require("@opentelemetry/exporter-jaeger");

// Define the service name properly
const provider = new NodeTracerProvider({
    resource: new Resource({
        [SemanticResourceAttributes.SERVICE_NAME]: "otel-triage-service",
    }),
});

// Set up a Jaeger Exporter
const exporter = new JaegerExporter({
    endpoint: "http://localhost:14268/api/traces", // Change if your Jaeger setup differs
});

// Configure tracing pipeline
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));
provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter())); // Optional: Logs spans in console
provider.register();

console.log("✅ OpenTelemetry tracing initialized");

