import 'babel-polyfill';
import dotenv from 'dotenv';
import amqp from 'amqplib';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '..', '..', '..', '.env') });

function fibonacci(n) {
  if (n === 0 || n === 1) return n;
  return fibonacci(n - 1) + fibonacci(n - 2);
}

(async () => {
  try {
    const connection = await amqp.connect({
      hostname: process.env.RABBIT_HOST,
      username: process.env.RABBIT_USER,
      password: process.env.RABBIT_PASS,
    });

    const channel = await connection.createChannel();
    const q = 'rpc_queue';
    channel.assertQueue(q, { durable: false });
    channel.prefetch(1);
    console.log(' [x] Awaiting RPC requests');
    channel.consume(q, (msg) => {
      const n = parseInt(msg.content.toString(), 10);

      console.log(' [.] fib(%d)', n);

      const r = fibonacci(n);

      channel.sendToQueue(msg.properties.replyTo,
        Buffer.from(r.toString()),
        { correlationId: msg.properties.correlationId });

      channel.ack(msg);
    });
  } catch (e) {
    console.error(e);
    process.exit(0);
  }
})();
