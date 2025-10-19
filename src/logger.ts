import { createLogger, format, transports } from 'winston';

const consoleFormat = format.printf(
    ({ timestamp, level, message, stack, ...meta }) => {
        const metaString = Object.keys(meta).length
            ? ` ${JSON.stringify(meta)}`
            : '';
        return `${timestamp} [${level}] ${stack ?? message}${metaString}`;
    }
);

// TODO: add file transport for error logs
const logger = createLogger({
    level: process.env.LOG_LEVEL ?? 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.splat()
    ),
    transports: [
        new transports.Console({
            format: format.combine(
                format.colorize(),
                format.timestamp(),
                consoleFormat
            ),
        }),
    ],
});

export default logger;
