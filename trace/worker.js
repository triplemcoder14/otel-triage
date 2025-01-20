const amqp = require('amqplib');
const axios = require('axios').default;
const opentelemetry = require("@opentelemetry/api");

const tracer = opentelemetry.trace.getTracer(
    process.env.SERVICE_NAME || "worker-service"
);

async function run() {
    const conn = await amqp.connect('amqp://localhost');
    const channel = await conn.createChannel();

    const queue = 'task_queue';

    // this make sure the queue is declared before attempting to consume from it
    channel.assertQueue(queue, {
        durable: true
    });

    channel.consume(
        queue,
        async function (payload) {
            const data = JSON.parse(payload.content.toString());
            console.log(" [x] Received", data);
            console.log(data.carrier);

            const parentContext = opentelemetry.propagation.extract(
                opentelemetry.ROOT_CONTEXT,
                data.carrier
            );

            opentelemetry.context.with(parentContext, async () => {
                tracer.startActiveSpan("process_queue_item", async (span) => {
                    await makeExternalRequest("http://google.com");
                    for (let i = 0; i < 10; i += 1) {
                        console.log(i);
                    }
                    span.end();
                });
            });
        },
        {
            // automatic acknowledgment mode,
            // see ../confirms.html for details
            noAck: true,
        }
    );

    console.log("Waiting for messages");
}

async function makeExternalRequest(url) {
    return axios.get(url);
}

run();
