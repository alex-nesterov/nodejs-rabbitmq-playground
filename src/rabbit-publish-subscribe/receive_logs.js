import 'babel-polyfill';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

(async () => {
  try {
    const connection = await amqp.connect({
      hostname: process.env.RABBIT_HOST,
      username: process.env.RABBIT_USER,
      password: process.env.RABBIT_PASS,
    });

    const channel = await connection.createChannel();
    const exchange = 'logs';
    channel.assertExchange(exchange, 'fanout', { durable: false });
    const queue = await channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue.queue);
    channel.bindQueue(queue.queue, exchange, '');

    channel.consume(queue.queue, (msg) => {
      console.log(' [x] %s', msg.content.toString());
    }, { noAck: true });
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
})();
