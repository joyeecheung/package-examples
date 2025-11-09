const logger = require('my-logger/default-and-named');
const { Logger } = require('my-logger/default-and-named');
logger.log('Hello from CommonJS');
const logger2 = new Logger();
logger2.log('Created new instance');
