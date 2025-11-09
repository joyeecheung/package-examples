const pkg = require('my-logger/named-only-object-literal');
const { Logger } = pkg;
const logger = new Logger();
logger.log('Hello from CommonJS');
