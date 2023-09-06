import chalk from "chalk";

// SECTION COLORS

const success = chalk.hex("#009107");
const alert = chalk.hex("#fbff00");
const error = chalk.hex("#eb0d0d");
const info = chalk.hex("#0059ff");
const text = chalk.hex("#bebebe");

const master = chalk.hex("#FF5733");
const worker = chalk.hex("#C70039");
const webSocket = chalk.hex("#900C3F");
const http = chalk.hex("#581845");
const express = chalk.hex("#DAC0A3");
const utils = chalk.hex("#793FDF");
const middleware = chalk.hex("#64CCC5");

export const log = (section: string, type: string, message: string) => {
  const sectionColorMap: { [key: string]: (string: string) => string } = {
    Master: master,
    Worker: worker,
    WebSocket: webSocket,
    HTTP: http,
    Express: express,
    Module: utils,
    Middleware: middleware,
    default: text,
  };
  const typeColorMap: { [key: string]: (string: string) => string } = {
    success: success,
    error: error,
    alert: alert,
    info: info,
    default: text,
  };
  const prefix = {
    success: "",
    error: "💥 ",
    alert: "",
    info: "",
    default: "",
  };
  // Use the color if it exists in the map, otherwise default to white
  const sectionColor = sectionColorMap[section as keyof typeof sectionColorMap] || sectionColorMap["default"];
  const typeColor = typeColorMap[type as keyof typeof typeColorMap] || typeColorMap["default"];
  const prefixSymbol = prefix[type as keyof typeof prefix] || prefix["default"];

  console.log(chalk.bold(sectionColor(section)) + " # " + prefixSymbol + typeColor(message));
};
