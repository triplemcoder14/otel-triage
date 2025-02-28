const express = require("express");
const opentelemetry = require("@opentelemetry/api");
const fs = require("fs");
const path = require("path");
const winston = require("winston");
const tail = require("./queue");
const { W3CTraceContextPropagator, defaultTextMapSetter } = require("@opentelemetry/core");

const PORT = process.env.PORT || "8989";
const app = express();
const LOG_FILE_PATH = "/var/otel-triage/app.log";

const logDir = path.dirname(LOG_FILE_PATH);
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir, { recursive: true });
}

// here i configure winston logger
const logger = winston.createLogger({
    level: "info",
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: LOG_FILE_PATH }),
        new winston.transports.Console(),
    ],
});

const tracer = opentelemetry.trace.getTracer(
    process.env.SERVICE_NAME || "request-service"
);

app.get("/", (req, res) => {
    const parentSpan = tracer.startSpan("send_to_queue", {
        attributes: { user_email: "mukhy16@gmail.com, action: "dashboard_access" },
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

            logger.info("Carrier after Code injection:", carrier);

            tail.send({ send: "got it", carrier });

            parentSpan.end();
        }
    );

    logger.info("Otel-Triage Library is Up");
    res.send("Otel-Triage Library is Up");
});

app.listen(PORT, () => {
    logger.info(`Listening for requests on http://localhost:${PORT}`);
});



//const express = require("express");
//const opentelemetry = require("@opentelemetry/api");
//const { W3CTraceContextPropagator, defaultTextMapSetter } = require("@opentelemetry/core");
//const winston = require("winston"); // Logging library
//
//const tail = require("./queue");
//const PORT = process.env.PORT || "8989";
//const app = express();
//
//const tracer = opentelemetry.trace.getTracer(
//    process.env.SERVICE_NAME || "request-service"
//);
//
//// Configure Winston Logger
//const logger = winston.createLogger({
//    level: "info",
//    format: winston.format.json(),
//    transports: [
//        new winston.transports.Console(), // Print logs to console
//        new winston.transports.File({ filename: "app.log" }) // Save logs to file
//    ],
//});
//
//// Middleware to log all requests
//app.use((req, res, next) => {
//    logger.info({ message: "Incoming request", method: req.method, url: req.url });
//    next();
//});
//
//app.get("/", (req, res) => {
//    const parentSpan = tracer.startSpan("send_to_queue", {
//        attributes: { user_email: "user@example.com", action: "dashboard_access" },
//    });
//
//    const propagator = new W3CTraceContextPropagator();
//    let carrier = {};
//
//    opentelemetry.context.with(
//        opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan),
//        () => {
//            propagator.inject(
//                opentelemetry.context.active(),
//                carrier,
//                defaultTextMapSetter
//            );
//
//            logger.info("✅ Carrier after injection", { carrier });
//
//            // Send message with injected trace context
//            tail.send({ user_email: "user@example.com", action: "dashboard_access", carrier });
//
//            parentSpan.end();
//        }
//    );
//
//    logger.info("Finops Dashboard accessed");
//    res.send("Finops Dashboard is live");
//});
//
//app.listen(parseInt(PORT, 10), "0.0.0.0", () => {
//    logger.info(`Listening for requests on http://localhost:${PORT}`);
//});


//const express = require("express");
//const opentelemetry = require("@opentelemetry/api");
//const tail = require("./queue");
//const { W3CTraceContextPropagator, defaultTextMapSetter } = require("@opentelemetry/core");
//
//const PORT = process.env.PORT || "8989";
//const app = express();
//
//const tracer = opentelemetry.trace.getTracer(
//    process.env.SERVICE_NAME || "request-service"
//);
//
//app.get("/", (req, res) => {
//    const parentSpan = tracer.startSpan("send_to_queue", {
//        attributes: { user_email: "mukhy16@gamil.com", action: "dashboard_access" },
//    });
//
//    const propagator = new W3CTraceContextPropagator();
//    let carrier = {};
//
//    opentelemetry.context.with(
//        opentelemetry.trace.setSpan(opentelemetry.context.active(), parentSpan),
//        () => {
//            propagator.inject(
//                opentelemetry.context.active(),
//                carrier,
//                defaultTextMapSetter
//            );
//
//            console.log("Carrier after code injection:", carrier);
//
//            // ah, trace context
//            tail.send({ user_email: "mukhy16@gamil.com", action: "dashboard_access", carrier });
//
//            parentSpan.end();
//        }
//    );
//
//    res.send("Otel-Triage Service is Running");
//});
//
//app.listen(parseInt(PORT, 10), "0.0.0.0", () => {
//    console.log(`Listening for requests on http://localhost:${PORT}`);
//});
