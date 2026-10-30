import { createApp, startServer } from './server';

const app = createApp();

if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export default app;
