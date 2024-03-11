import { useEffect, useRef, useState } from 'react';
import { ColorResult, TwitterPicker } from 'react-color';

type MouseEvent = {
  nativeEvent: {
    offsetX: number;
    offsetY: number;
  };
};

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [color, setColor] = useState('');
  const [isDrawing, setIsDrawing] = useState(false);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.strokeStyle = color ? color : 'black';
        context.lineWidth = 2;
      }
      contextRef.current = context;
    }
  }, [color]);

  useEffect(() => {
    ws.current = new WebSocket('ws://localhost:8000/draw');
    ws.current.addEventListener('close',  () => console.log('ws closed!'));
    ws.current.addEventListener('message', (event) => {
      const decodedMessage = JSON.parse(event.data);
      if (decodedMessage.type === 'DRAW_LINE' || decodedMessage.type === 'WELCOME') {
        drawPixels(decodedMessage.payload);
      } else if (decodedMessage.type === 'CLEAR'){
        if (!contextRef.current) return;
        contextRef.current.reset();
      }
    });

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, []);


  const startDrawing = ({nativeEvent}: MouseEvent) => {
    const {offsetX, offsetY} = nativeEvent;
    if (contextRef.current) {
      contextRef.current.beginPath();
      contextRef.current.moveTo(offsetX, offsetY);
      setIsDrawing(true);
    }
  };

  const finishDrawing = () => {
    if (contextRef.current) {
      contextRef.current.closePath();
      setIsDrawing(false);
    }
  };

  const draw = ({nativeEvent}: MouseEvent) => {
    if (!isDrawing) {
      return;
    }
    const {offsetX, offsetY} = nativeEvent;
    if (contextRef.current) {
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    }
    sendDrawingData({x: offsetX, y: offsetY, color: color ? color : 'black'});
  };

  const drawPixels = (pixelsToDraw: { x: number; y: number; color: string }[]) => {
    if (contextRef.current) {
      contextRef.current.clearRect(0, 0, contextRef.current.canvas.width, contextRef.current.canvas.height);
      pixelsToDraw.forEach((pixel) => {
        if (contextRef.current){
          contextRef.current.fillStyle = pixel.color;
          contextRef.current.fillRect(pixel.x, pixel.y, 1, 1);
        }
      });
    }
  };

  const sendDrawingData = (line: { x: number; y: number; color: string }) => {
    if (!ws.current) return;

    const data = { type: 'DRAW_LINE', payload: line };
    ws.current.send(JSON.stringify(data));
  };

  const handleColorChange = (color: ColorResult) => {
    setColor(color.hex);
  };

  const clearHandle = () => {
    if (!ws.current) return;
    const data = { type: 'CLEAR', payload: [] };
    ws.current.send(JSON.stringify(data));
  };


  return (
    <div className="center">
      <div className="draw">
        <div className="panel">
          <button className="clear" onClick={clearHandle}>clear</button>
          <TwitterPicker
            color={color} onChangeComplete={handleColorChange}
            triangle="hide"
          />
        </div>
        <canvas
          onMouseDown={startDrawing}
          onMouseUp={finishDrawing}
          onMouseMove={draw}
          height={700}
          width={1200}
          style={{border: '1px solid #000'}}
          ref={canvasRef}
        />
      </div>
    </div>
  );
};

export default App;