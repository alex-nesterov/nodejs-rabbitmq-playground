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
    const queue = 'task_queue';

    channel.assertQueue(queue, { durable: true });
    channel.prefetch(1);
    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);
    channel.consume(queue, (msg) => {
      const secs = msg.content.toString().split('.').length - 1;
      console.log(' [x] Received %s', msg.content.toString());
      setTimeout(() => { console.log(' [x] Done'); channel.ack(msg); }, secs * 1000);
    }, { noAck: false });
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
})();
