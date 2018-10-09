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
    const exchange = 'direct_logs';
    const args = process.argv.slice(2);
    const message = args.slice(1).join(' ') || 'Hello World!';
    const severity = (args.length > 0) ? args[0] : 'info';

    channel.assertExchange(exchange, 'direct', { durable: false });
    channel.publish(exchange, severity, Buffer.from(message));
    console.log(' [x] Sent %s: \'%s\'', severity, message);

    setTimeout(() => { connection.close(); process.exit(0); }, 500);
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
})();
