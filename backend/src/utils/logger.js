import winston from "winston";
import path from "path";
import fs from "fs";

const { combine, timestamp, label, colorize, errors, printf } = winston.format;

// Ensure logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Custom log format
const logFormat = printf(({ level, message, label, timestamp, stack }) => {
    // Include stack trace if it exists
    const logMessage = stack || message;
    return `${timestamp} [${label}] ${level}: ${logMessage}`;
});

// Winston logger configuration
const logger = winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: combine(
        label({ label: "mahima-agency" }), // app label
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }), // include stack trace in error logs
    ),
    transports: [
        // Console logs (with colors for dev)
        new winston.transports.Console({
            format: process.env.NODE_ENV === "development"
                ? combine(colorize(), logFormat)
                : logFormat
        }),

        // File for error logs
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            format: logFormat
        }),

        // File for all logs
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
            format: logFormat
        })
    ],
    exitOnError: false
});

export default logger;
