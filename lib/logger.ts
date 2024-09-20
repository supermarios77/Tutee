import { format } from 'date-fns';

type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const isDevelopment = process.env.NODE_ENV === 'development';

const colors = {
    reset: "\x1b[0m",
    fg: {
        debug: "\x1b[36m",  // Cyan
        info: "\x1b[32m",   // Green
        warn: "\x1b[33m",   // Yellow
        error: "\x1b[31m",  // Red
    },
};

const logLevels: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

const currentLogLevel: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

const formatMessage = (level: LogLevel, message: string, ...args: any[]): string => {
    const timestamp = format(new Date(), 'yyyy-MM-dd HH:mm:ss');
    const formattedArgs = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : arg
    ).join(' ');
    return `${timestamp} ${colors.fg[level]}[${level.toUpperCase()}]${colors.reset} ${message} ${formattedArgs}`;
};

const logger = {
    debug: (message: string, ...args: any[]) => {
        if (isDevelopment && logLevels[currentLogLevel] <= logLevels.debug) {
            console.debug(formatMessage('debug', message, ...args));
        }
    },
    info: (message: string, ...args: any[]) => {
        if (logLevels[currentLogLevel] <= logLevels.info) {
            console.info(formatMessage('info', message, ...args));
        }
    },
    warn: (message: string, ...args: any[]) => {
        if (logLevels[currentLogLevel] <= logLevels.warn) {
            console.warn(formatMessage('warn', message, ...args));
        }
    },
    error: (message: string, ...args: any[]) => {
        if (logLevels[currentLogLevel] <= logLevels.error) {
            console.error(formatMessage('error', message, ...args));
        }
    },
};

// Export the logger object
export default logger;