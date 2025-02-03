const express = require("express");
const opentelemetry = require("@opentelemetry/api");
const { W3CTraceContextPropagator } = require("@opentelemetry/core");
const tail = require("./queue");

const PORT = process.env.PORT || "8080";
const app = express();

const tracer = opentelemetry.trace.getTracer(
    process.env.SERVICE_NAME || "request-service"
);

app.get("/", async (req, res) => {
    const parentSpan = tracer.startSpan('send_to_queue', { attributes: { foo: 'bar' } });


    for (let i = 0; i < 10; i += 1) {
        console.log(i);
    }


    const propagator = new W3CTraceContextPropagator();
    let carrier = {};


    propagator.inject(
        opentelemetry.trace.setSpanContext(opentelemetry.ROOT_CONTEXT, parentSpan.spanContext()),
        carrier,
        opentelemetry.defaultTextMapSetter
    );

    try {

        await tail.send({ foo: 'bar', carrier });


        parentSpan.end();
        res.send("Otel-Triage Dashboard Is Live ");
    } catch (error) {
        console.error('Error sending message to queue:', error);
        parentSpan.end(); // Ensure the span ends even in case of error
        res.status(500).send("Error occurred while processing the request.");
    }
});

app.listen(parseInt(PORT, 10), () => {
    console.log(`Listening for requests on http://localhost:${PORT}`);
});