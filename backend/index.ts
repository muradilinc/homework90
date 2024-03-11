import express from "express";
import expressWs from "express-ws";
import cors from 'cors';
import crypto from 'crypto';
import {ActiveConnection, Draw, IncomingData} from "./types";

const app = express();
expressWs(app);

const port = 8000;

app.use(cors());

const router = express.Router();
const activeConnection: ActiveConnection = {};
let draw: Draw[] = [];

router.ws('/draw', (ws, req) => {
  const id = crypto.randomUUID();
  console.log('User connected id=', id);
  activeConnection[id] = ws;
  ws.send(JSON.stringify({type: 'WELCOME', payload: draw}));

  ws.on('message', (message) => {
    const parsedData = JSON.parse(message.toString()) as IncomingData;
    draw.push(parsedData.payload);
    // ws.send(JSON.stringify({type: 'DRAW_LINE', payload: activeConnection.draw}));
    if (parsedData.type === 'DRAW_LINE') {
      Object.values(activeConnection).forEach(connection => {
        const outgoingData = {type: 'DRAW_LINE', payload: draw};
        connection.send(JSON.stringify(outgoingData));
      });
    }

    if (parsedData.type === 'CLEAR') {
      draw = [];
      Object.values(activeConnection).forEach(connection => {
        const outgoingData = {type: 'CLEAR', payload: draw};
        connection.send(JSON.stringify(outgoingData));
      });
    }
  });

  ws.on('close', () => {
    console.log('User disconnected id=', id);
    delete activeConnection[id];
  });
});

app.use(router);

app.listen(port, () => {
  console.log('Server started on port: ' + port);
});