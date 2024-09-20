const isDevelopment = process.env.NODE_ENV === 'development';

type LogLevel = 'log' | 'info' | 'warn' | 'error';

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    underscore: "\x1b[4m",
    blink: "\x1b[5m",
    reverse: "\x1b[7m",
    hidden: "\x1b[8m",

    fg: {
        black: "\x1b[30m",
        red: "\x1b[31m",
        green: "\x1b[32m",
        yellow: "\x1b[33m",
        blue: "\x1b[34m",
        magenta: "\x1b[35m",
        cyan: "\x1b[36m",
        white: "\x1b[37m",
    },
    bg: {
        black: "\x1b[40m",
        red: "\x1b[41m",
        green: "\x1b[42m",
        yellow: "\x1b[43m",
        blue: "\x1b[44m",
        magenta: "\x1b[45m",
        cyan: "\x1b[46m",
        white: "\x1b[47m",
    }
};

const logger = {
    log: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.log(`${colors.fg.cyan}[LOG]${colors.reset}`, message, ...args);
        }
    },
    info: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.info(`${colors.fg.green}[INFO]${colors.reset}`, message, ...args);
        }
    },
    warn: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            console.warn(`${colors.fg.yellow}[WARN]${colors.reset}`, message, ...args);
        }
    },
    error: (message: string, ...args: any[]) => {
        if (isDevelopment) {
            logger.error(`${colors.fg.red}[ERROR]${colors.reset}`, message, ...args);
        }
    },
};

// Export the logger object
export default logger;