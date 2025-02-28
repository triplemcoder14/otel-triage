const express = require("express");
const opentelemetry = require("@opentelemetry/api");
const tail = require("./queue");
const { W3CTraceContextPropagator, defaultTextMapSetter } = require("@opentelemetry/core");

const PORT = process.env.PORT || "8989";
const app = express();

const tracer = opentelemetry.trace.getTracer(
    process.env.SERVICE_NAME || "request-service"
);

app.get("/", (req, res) => {
    const parentSpan = tracer.startSpan("send_to_queue", {
        attributes: { user_email: "mukhy16@gamil.com", action: "dashboard_access" },
    });

    const propagator = new W3CTraceContextPropagator();
    let carrier = {};

    opentelemetry.context.with(
        opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan),
        () => {
            propagator.inject(
                opentelemetry.context.active(),
                carrier,
                defaultTextMapSetter
            );

            console.log("Carrier after code injection:", carrier);

            // ah, trace context
            tail.send({ user_email: "mukhy16@gamil.com", action: "dashboard_access", carrier });

            parentSpan.end();
        }
    );

    res.send("Otel-Triage Service is Running");
});

app.listen(parseInt(PORT, 10), "0.0.0.0", () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
});
