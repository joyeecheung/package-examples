import logger from 'my-logger/default-and-named';
import { Logger } from 'my-logger/default-and-named';
logger.log('Hello from ESM');
const logger2 = new Logger();
logger2.log('Created new instance');
