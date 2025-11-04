import winston from "winston";
import path from "path";
import fs from "fs";

const { combine, timestamp, label, colorize, errors, printf } = winston.format;

// Ensure logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Define log format
const logFormat = printf(({ level, message, label, timestamp, stack }) => {
    const logMessage = stack || message;
    return `${timestamp} [${label}] ${level}: ${logMessage}`;
});

// Winston configuration
const logger = winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: combine(
        label({ label: "mahima-agency" }),
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true })
    ),
    transports: [
        new winston.transports.Console({
            format: process.env.NODE_ENV === "development"
                ? combine(colorize(), logFormat)
                : logFormat
        }),
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error",
            format: logFormat
        }),
        new winston.transports.File({
            filename: path.join(logDir, "combined.log"),
            format: logFormat
        })
    ],
    exitOnError: false,
});

export default logger;
