import express from "express";
import expressWs from "express-ws";
import cors from 'cors';

const app = express();
expressWs(app);

const port = 8000;

app.use(cors());

const router = express.Router();

router.ws('/draw', (ws, req, next) =>{

});

app.listen(port, () => {
  console.log('Server started on port: ' + port);
});