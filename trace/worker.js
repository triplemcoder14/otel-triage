const amqp = require('amqplib');
const axios = require('axios').default;
const opentelemetry = require("@opentelemetry/api");

const tracer = opentelemetry.trace.getTracer(
    process.env.SERVICE_NAME || "worker-service"
);

async function run() {
    try {
        const conn = await amqp.connect('amqp://localhost');
        const channel = await conn.createChannel();

        const queue = 'task_queue';


        await channel.assertQueue(queue, {
            durable: true
        });


        channel.consume(queue, async function(payload) {
            const data = JSON.parse(payload.content.toString());
            console.log(" [x] Received", data);
            console.log(data.carrier);


            const parentContext = opentelemetry.propagation.extract(opentelemetry.ROOT_CONTEXT, data.carrier);
            opentelemetry.context.with(parentContext, async () => {
                tracer.startActiveSpan('process_queue_item', async (span) => {
                    try {

                        await makeExternalRequest("http://google.com");
                        for (let i = 0; i < 10; i += 1) {
                            console.log(i);
                        }
                    } catch (error) {
                        console.error('Error during external request or processing:', error);
                    } finally {
                        span.end(); // ensure the span is ended in any case
                    }
                });
            });

        }, {
            noAck: false
        });

        console.log("Waiting for messages...");
    } catch (error) {
        console.error('Error starting RabbitMQ consumer:', error);
    }
}

async function makeExternalRequest(url) {
    try {
        const response = await axios.get(url);
        return response.data;
    } catch (error) {
        console.error(`Error making external request to ${url}:`, error);
        throw error;
    }
}

run();

process.on('SIGINT', async () => {
    console.log('Shutting down gracefully...');
    try {
        // Gracefully close the RabbitMQ connection
        await conn.close();
        console.log('RabbitMQ connection closed.');
        process.exit(0);
    } catch (error) {
        console.error('Error during graceful shutdown:', error);
        process.exit(1);
    }
});