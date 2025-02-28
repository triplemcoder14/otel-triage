const express = require("express");
const opentelemetry = require("@opentelemetry/api");
const { propagation } = require("@opentelemetry/api");
const logger = require("./trace/logger"); 
require("./trace/tracing"); 

const app = express();
const PORT = 8989;
const tracer = opentelemetry.trace.getTracer("otel-triage-service");

app.use((req, res, next) => {
    logger.info(`➡️ Incoming request: ${req.method} ${req.url}`);
    next();
});

app.get("/", (req, res) => {
    const parentSpan = tracer.startSpan("incoming_request", {
        attributes: { route: req.path, method: req.method },
    });

    let carrier = {};

    opentelemetry.context.with(
        opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan),
        () => {
            propagation.inject(opentelemetry.context.active(), carrier);

            logger.info("✅ Trace context injected", { carrier });

            setTimeout(() => {
                logger.info("✅ Request processed successfully");
                parentSpan.end();
                res.send("Otel-Triage Service is Running with Tracing");
            }, 1000);
        }
    );
});

app.listen(PORT, () => {
    logger.info(`🚀 Server is running at http://localhost:${PORT}`);
});

