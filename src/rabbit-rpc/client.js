import 'babel-polyfill';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

const args = process.argv.slice(2);

if (args.length === 0) {
  console.log('Usage: rpc_client.js num');
  process.exit(1);
}

function generateUuid() {
  return Math.random().toString() + Math.random().toString() + Math.random().toString();
}

(async () => {
  try {
    const connection = await amqp.connect({
      hostname: process.env.RABBIT_HOST,
      username: process.env.RABBIT_USER,
      password: process.env.RABBIT_PASS,
    });

    const channel = await connection.createChannel();
    const queue = await channel.assertQueue('', { exclusive: true });
    const corr = generateUuid();
    const num = parseInt(args[0], 10);

    console.log(' [x] Requesting fib(%d)', num);

    channel.consume(queue.queue, (msg) => {
      if (msg.properties.correlationId === corr) {
        console.log(' [.] Got %s', msg.content.toString());
        setTimeout(() => { connection.close(); process.exit(0); }, 500);
      }
    }, { noAck: true });

    channel.sendToQueue('rpc_queue',
      Buffer.from(num.toString()),
      { correlationId: corr, replyTo: queue.queue });
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
})();
