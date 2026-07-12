import {createLogger, format, transports} from "winston"

export const logger = createLogger({
  level: 'info', // Records info and above
  format: format.combine(
    format.timestamp(),
    format.json() // Stores logs as JSON for easy searching
  ),
  transports: [
    new transports.Console(), // Prints to your terminal
    // new transports.File({ filename: 'error.log', level: 'error' }), // Saves errors
    // new transports.File({ filename: 'combined.log' }) // Saves all logs
  ]
});