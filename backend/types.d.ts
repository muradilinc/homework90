import {Websocket} from 'ws';

export interface ActiveConnection {
  [id: string]: Websocket;
}

export interface IncomingData {
  type: string;
  payload: string;
}