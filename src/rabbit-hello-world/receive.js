import 'babel-polyfill';
import dotenv from 'dotenv';
import amqp from 'amqplib';

dotenv.config({ path: `${__dirname}/../../../.env` });

(async () => {
  try {
    const connection = await amqp.connect({
      hostname: process.env.RABBIT_HOST,
      username: process.env.RABBIT_USER,
      password: process.env.RABBIT_PASS,
    });
    const channel = await connection.createChannel();
    const queue = 'hello';
    channel.assertQueue(queue, { durable: false });
    console.log(' [*] Waiting for messages in %s. To exit press CTRL+C', queue);
    channel.consume(queue, (msg) => { console.log(' [x] Received %s', msg.content.toString()); }, { noAck: true });
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
})();
