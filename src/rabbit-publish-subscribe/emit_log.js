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
    const message = process.argv.slice(2).join(' ') || 'Hello World!';

    channel.assertExchange(exchange, 'fanout', { durable: false });
    channel.publish(exchange, '', Buffer.from(message));
    console.log(' [x] Sent %s', message);

    setTimeout(() => { connection.close(); process.exit(0); }, 500);
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
})();
