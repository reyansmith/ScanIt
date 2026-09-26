import { createApp } from './app.js';
import { config, validateRuntimeConfig } from './config.js';

validateRuntimeConfig();
const server = createApp().listen(config.port, '0.0.0.0', () => {
  console.log(`MediScan API listening on http://localhost:${config.port}`);
});

function shutdown(signal) {
  console.log(`${signal} received; closing MediScan API.`);
  server.close(() => process.exit(0));
}

process.on('SIGINT', () => shutdown('SIGINT'));
process.on('SIGTERM', () => shutdown('SIGTERM'));
