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
    const msg = 'Hello World!';
    channel.assertQueue(queue, { durable: false });
    channel.sendToQueue(queue, Buffer.from(msg));
    console.log(' [x] Sent %s', msg);
    setTimeout(() => { connection.close(); process.exit(0); }, 500);
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
})();
