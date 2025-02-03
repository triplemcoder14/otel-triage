const amqp = require('amqplib');

class Tail {

    queue = "task_queue";

    async send(payload) {
        const self = this;
        const queue = self.queue;

        let connection, channel;

        try {

            connection = await amqp.connect('amqp://localhost');
            channel = await connection.createChannel();


            await channel.assertQueue(queue, {
                durable: true
            });

            const payloadStr = JSON.stringify(payload); // Ensure it's stringified


            await channel.sendToQueue(queue, Buffer.from(payloadStr), {
                persistent: true  // Ensures the message is durable
            });

            console.log(" [x] Sent '%s'", payloadStr);
        } catch (error) {
            console.error("Error sending message to queue:", error);
        } finally {

            if (channel) {
                await channel.close();
            }
            if (connection) {
                await connection.close();
            }
        }
    }
}

module.exports = new Tail();