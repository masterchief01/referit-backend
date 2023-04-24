const { createLogger, transports, format, Logger } = require("winston");
const LokiTransport = require("winston-loki");

let logger = createLogger({
  transports: [
    new LokiTransport({
      host: "https://472653:eyJrIjoiMWQwYjQ5YzhiZDRkNWM1Y2JmZjdiYTliYWZjZWMzY2I1OWE2NTcyYSIsIm4iOiJQcm9tdGFpbCIsImlkIjo4MzgyMDF9@logs-prod-014.grafana.net/loki/api/v1/push",
      labels: { app: "honeyshop" },
      json: true,
      format: format.json(),
      replaceTimestamp: true,
      onConnectionError: (err) => console.error(err),
    }),
    new transports.Console({
      format: format.combine(format.simple(), format.colorize()),
    }),
  ],
});

const initializeLogger = () => {
  if (logger) {
    return;
  }
};

const getLogger = () => {
  initializeLogger();
  return logger;
};

module.exports = { getLogger };
