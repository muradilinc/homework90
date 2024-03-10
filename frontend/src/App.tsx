import { useEffect, useRef, useState } from 'react';

type MouseEvent = {
  nativeEvent: {
    offsetX: number;
    offsetY: number;
  };
};

const App = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth * 2;
      canvas.height = window.innerHeight * 2;
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      const context = canvas.getContext("2d");
      if (context) {
        context.scale(2,2);
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 5;
      }
      contextRef.current = context;
    }
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
    console.log(offsetX);
    if (contextRef.current) {
      contextRef.current.lineTo(offsetX, offsetY);
      contextRef.current.stroke();
    }
  };

  return (
    <canvas
      onMouseDown={startDrawing}
      onMouseUp={finishDrawing}
      onMouseMove={draw}
      ref={canvasRef}
    />
  );
};

export default App;