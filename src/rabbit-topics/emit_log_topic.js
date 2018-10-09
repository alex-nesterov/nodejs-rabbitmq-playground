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
    const ex = 'topic_logs';
    const args = process.argv.slice(2);
    const key = (args.length > 0) ? args[0] : 'anonymous.info';
    const msg = args.slice(1).join(' ') || 'Hello World!';

    channel.assertExchange(ex, 'topic', { durable: false });
    channel.publish(ex, key, Buffer.from(msg));
    console.log(' [x] Sent %s: \'%s\'', key, msg);

    setTimeout(() => { connection.close(); process.exit(0); }, 500);
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
})();
