import pkg from 'my-logger/named-only-object-literal';
const { Logger } = pkg;
const logger = new Logger();
logger.log('Hello from ESM');
