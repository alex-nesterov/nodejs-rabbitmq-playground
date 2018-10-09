import 'babel-polyfill';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: receive_logs_direct.js [info] [warning] [error]');
  process.exit(1);
}

(async () => {
  try {
    const connection = await amqp.connect({
      hostname: process.env.RABBIT_HOST,
      username: process.env.RABBIT_USER,
      password: process.env.RABBIT_PASS,
    });

    const channel = await connection.createChannel();
    const ex = 'direct_logs';

    channel.assertExchange(ex, 'direct', { durable: false });

    const queue = channel.assertQueue('', { exclusive: true });
    console.log(' [*] Waiting for logs. To exit press CTRL+C');

    args.forEach((severity) => {
      channel.bindQueue(queue.queue, ex, severity);
    });

    channel.consume(queue.queue, (msg) => {
      console.log(' [x] %s: \'%s\'', msg.fields.routingKey, msg.content.toString());
    }, { noAck: true });
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
})();
