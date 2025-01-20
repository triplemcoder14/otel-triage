const express = require("express");

const PORT = process.env.PORT || "8080";
const app = express();

const opentelemetry = require("@opentelemetry/api");
const queue = require("./queue");
const { W3CTraceContextPropagator } = require("@opentelemetry/core");

const tracer = opentelemetry.trace.getTracer(
    process.env.SERVICE_NAME || "request-service"
);

app.get("/", (req, res) => {

    const parentSpan = tracer.startSpan('send_to_queue', { attributes: { foo: 'bar' } });
    // do work
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

    queue.send({foo: 'bar', carrier });

    parentSpan.end();
    res.send("Hello World");
});

app.listen(parseInt(PORT, 10), () => {
  console.log(`Listening for requests on http://localhost:${PORT}`);
});
