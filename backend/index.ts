import express from "express";
import expressWs from "express-ws";
import cors from 'cors';
import crypto from 'crypto';
import {ActiveConnection} from "./types";

const app = express();
expressWs(app);

const port = 8000;

app.use(cors());

const router = express.Router();
const activeConnection: ActiveConnection = {};

router.ws('/draw', (ws, req, next) =>{
  const id = crypto.randomUUID();
  console.log('User connected id=', id);
  activeConnection[id] = ws;

  ws.on('message', (message) => {
    console.log(message.toString());
  });

  ws.on('close', () => {
    console.log('User disconnected id=', id);
    delete activeConnection[id];
  });
});

app.listen(port, () => {
  console.log('Server started on port: ' + port);
});