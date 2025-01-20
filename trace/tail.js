const amqp = require('amqplib');

class Tail {

    queue = "task_queue";
    
    async send(payload) {
        const self = this;
        const queue = self.queue;
        const connection = await amqp.connect('amqp://localhost');
        const ch = await connection.createChannel();
        ch.assertQueue(self.queue, {
            durable: true
        });
        const payloadStr = JSON.stringify(payload);
        await ch.sendToQueue(queue, Buffer.from(payloadStr), {
            persistent: true
        });
        console.log(" [x] Sent '%s'", payloadStr);
        // connection.close();
    }   
}

module.exports = new Tail();