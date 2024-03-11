import {Websocket} from 'ws';

export interface Draw {
  coordinateX: string;
  coordinateY: string;
  color: string;
}

export interface ActiveConnection {
  [id: string]: Websocket;
}

export interface IncomingData {
  type: string;
  payload: Draw;
}