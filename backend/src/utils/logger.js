import winston from "winston";
import path from "path";
import fs from "fs";

const { combine, timestamp, label, prettyPrint, colorize, errors, json, simple } = winston.format;

// Ensure logs directory exists
const logDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(logDir)) {
    fs.mkdirSync(logDir);
}

// Winston logger configuration
const logger = winston.createLogger({
    level: process.env.NODE_ENV === "development" ? "debug" : "info",
    format: combine(
        label({ label: "mahima-agency" }), // app label
        timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
        errors({ stack: true }), // include stack trace in error logs
        prettyPrint() // human-readable structured logs
    ),
    transports: [
        // Console logs (with colors for dev)
        new winston.transports.Console({
            format: process.env.NODE_ENV === "development"
                ? combine(colorize(), simple())
                : combine(timestamp(), json())
        }),

        // File for error logs
        new winston.transports.File({
            filename: path.join(logDir, "error.log"),
            level: "error"
        }),

        // File for all logs
        new winston.transports.File({
            filename: path.join(logDir, "combined.log")
        })
    ],
    exitOnError: false
});

export default logger;
