import cluster from "cluster";
import os from "os";
import express from "express";
import { Request, Response, NextFunction } from "express";
import http from "http";
import WebSocket from "ws";
import { log } from "./utils/logger";
import moment from "moment";
import AppError from "./common/AppError";
import { initializeMiddlewares } from "./middlewares";
import { initializeRoutes } from "./routes";
import errorHandler from "./middlewares/errorHandler";
import globalEmitter from "./utils/eventEmitter";
// SECTION: Cluster and CPU Information
const numCPUs : number = os.cpus().length;

interface IClient {
  path: string;
  ws: WebSocket;
}
let clients: IClient[] = [];

if (cluster.isMaster) {
  // SECTION: Master Process
  log("Master", "success", `Master ${process.pid} is running`);
  log("Master", "alert", `Started at ${moment()}`);

  // Fork workers.
  for (let i = 0; i < numCPUs; i++) {
    const worker = cluster.fork();
    // IPC: Listen for messages from worker
    worker.on("message", data => {
      if (data.type !== "axm:monitor") {
        log("Master", "info", `Received cluster message, broadcasting to workers..`);
        // Broadcast message to all workers
        for (const id in cluster.workers) cluster.workers[id]?.send(data);
      }
    });
  }

  cluster.on("exit", (worker, code, signal) => {
    if (code !== 0 && signal !== "SIGTERM") {
      log("Worker", "error", `Worker ${worker.process.pid} exited with error code ${code}`);
      log("Master", "alert", "Starting a new worker");
      cluster.fork();
    }
  });
} else {
  // SECTION: Worker Process
  const app = express();
  const port : number = 3000;
  const api_url = "http://localhost";

  // SECTION: HTTP Server
  const server = http.createServer(app);

  // SECTION: WebSocket Server
  // This section sets up a WebSocket server for real-time communication with clients.
  // It listens for incoming messages and handles connection upgrades.
  const wss = new WebSocket.Server({ noServer: true });

  wss.on("connection", (ws, req) => {
    const workerId : number | string = cluster.worker?.id ?? "unknown";
    log("WebSocket", "success", `Worker ${workerId} : Client connected`);

    // Add new client to clients array
    const client : IClient = { path: req.url ? req.url : "unknown_path", ws: ws };
    clients.push(client);

    ws.on("message", message => {
      log("WebSocket", "info", `[WS] Worker ${workerId} : Received message`);
      if (process.send) process.send(message);
      else log("WebSocket", "error", "process.send is not available");
    });
    ws.on("error", err => {
      log("WebSocket", "error", `Error occurred: ${err.message}`);
    });
    ws.on("close", () => {
      log("WebSocket", "info", `Client disconnected`);

      // Remove the disconnected client from clients array
      const index : number = clients.indexOf(client);
      if (index > -1) {
        clients.splice(index, 1);
      }
    });
  });

  server.on("upgrade", (request, socket, head) => {
    wss.handleUpgrade(request, socket, head, (ws, err) => {
      if (err instanceof Error) {
        // Check if err is an Error object
        log("WebSocket", "error", `Upgrade failed: ${err.message}`);
        socket.destroy();
        return;
      }
      if (request.url) {
        // Check if request.url is defined
        log("WebSocket", "info", `New client for ${request.url}`);
        wss.emit("connection", ws, request);
        clients.push({ path: request.url, ws: ws });
      } else {
        log("WebSocket", "error", "Request URL is undefined");
      }
    });
  });

  // Interface IData
  // This interface defines the shape of data expected in IPC messages from the master process
  interface IData {
    to?: string[];
    msg?: string;
  }
  // IPC: Listen for messages from master process
  // This is used for receiving data from the master process and broadcasting it to connected WebSocket clients
  process.on("message", (data: unknown) => {
    try {
      const workerId = cluster.worker?.id ?? "unknown";
      log("Worker", "info", `Received message in Worker ${workerId} from Cluster`);
      if (typeof data === "object" && data !== null) {
        const typedData = data as IData; // Type assertion
        if (typedData.to) {
          for (let [index, client] of clients.entries())
            if (client.ws.readyState == WebSocket.OPEN) {
              let dataTo = typedData.to;
              let searchInDataTo: boolean; 
              let dataToIsArray = Array.isArray(dataTo);
              if (dataToIsArray) searchInDataTo = dataTo.indexOf(client.path) > -1;
              else searchInDataTo = dataTo.includes(client.path);
              if (searchInDataTo) {
                log("WebSocket", "info", `client.ws.send to ${client.path}`);
                client.ws.send(JSON.stringify(typedData.msg));
              }
            } else {
              log("Worker", "error", `Removed client n° ${index} (disconnected) on Worker ${workerId}.`);
              clients.splice(index, 1);
            }
          // Find disconnected clients
          // This section identifies clients that have disconnected and logs their paths

          let disconnected : string[] = [];
          const clients_paths : string[] = clients.map(c => c.path);
          if (typedData && typedData.to) {
            for (const r of typedData.to) if (!clients_paths.includes(r)) disconnected.push(r);
            if (disconnected.length > 0) log("Worker", "info", `Disconnected clients: ${disconnected.join(", ")}`);
          }
        }
      } else log("Worker", "error", "Received data is not an object");
    } catch (error) {
      if (error instanceof Error) {
        log("IPC", "error", `Error processing message: ${error.message}`);
      } else {
        log("IPC", "error", `An unknown error occurred`);
      }
    }
  });
  globalEmitter.on("ws_message", (e : string | object) => {
    // Log the event using your custom log function
    log("WebSocket", "info", "WebSocket message event emitted.");
    // Send the event to the process
    if (process.send) {
      process.send({ event: "ws_message", e });
    }
  });
  // SECTION: Middleware
  initializeMiddlewares(app);
  // SECTION: Routes
  initializeRoutes(app);

  app.use(errorHandler);

  // SECTION: Start HTTP Server
  server.listen(port, () => {
    log("Worker", "success", `Worker ${process.pid} started : running at ${api_url}:${port}`);
    process.send?.({
      type: "worker:started",
      message: `Worker ${process.pid} started`,
    });
  });
}
