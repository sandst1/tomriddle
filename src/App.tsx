import { useCallback, useEffect, useRef, useState } from "react";
import "./App.css";
import Vara from "vara";
import { ChatCompletionMessageParam } from "openai/resources/index.mjs";
import { callLLM } from "./llm";
import { cropText } from "./utils";

function App() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const [messages, setMessages] = useState<Array<ChatCompletionMessageParam>>(
    []
  );

  const clearTheRiddle = () => {
    const container = document.getElementById("vara-container");
    if (container) {
      while (container.firstChild) {
        container.removeChild(container.firstChild);
      }
    }
  };

  const saveDrawing = useCallback(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const imageData = cropText(canvas);
      const userMsg: ChatCompletionMessageParam = {
        role: "user",
        content: [
          {
            type: "image_url",
            image_url: {
              url: imageData,
              detail: "high",
            },
          },
        ],
      };

      const updatedMessages = [...messages, userMsg];
      callLLM(updatedMessages).then((response) => {
        setMessages([
          ...updatedMessages,
          {
            role: "assistant",
            content: response,
          },
        ]);

        clearTheRiddle();

        new Vara(
          "#tomriddle",
          "font.json",
          [
            {
              text: response || "",
            },
          ],
          {
            fontSize: 46,
            strokeWidth: 1,
          }
        );
      });

      clearCanvas();
    }
  }, [messages]);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (event.key === "Enter") {
        saveDrawing();
      }
    },
    [saveDrawing]
  );

  useEffect(() => {
    // Set up the canvas
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      const context = canvas.getContext("2d");
      if (context) {
        context.lineCap = "round";
        context.strokeStyle = "black";
        context.lineWidth = 5;
        contextRef.current = context;
      }
    }

    // Add event listener for the Enter key
    window.addEventListener("keydown", handleKeyDown);

    // Add window resize event listener
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("resize", handleResize);
    };
  }, [handleKeyDown]);

  const handleResize = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        canvas.width = parent.clientWidth;
        canvas.height = parent.clientHeight;
      }
      // Redraw any existing content if necessary
    }
  };

  const startDrawing = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current?.beginPath();
    contextRef.current?.moveTo(offsetX, offsetY);
    setIsDrawing(true);
  };

  const draw = (event: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const { offsetX, offsetY } = event.nativeEvent;
    contextRef.current?.lineTo(offsetX, offsetY);
    contextRef.current?.stroke();
  };

  const stopDrawing = () => {
    contextRef.current?.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = contextRef.current;
    if (canvas && context) {
      context.clearRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="app-background">
      <div id="harry">
        <canvas
          ref={canvasRef}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
        />
      </div>
      <div id="tomriddle"></div>
    </div>
  );
}

export default App;
