import React, { useRef, useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { RefreshCw, Check } from 'lucide-react';

const SignaturePad = ({ onSave, onClear, initialData }) => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);

  const getPosition = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return null;
    const rect = canvas.getBoundingClientRect();
    
    if (e.touches && e.touches.length > 0) {
      return {
        x: e.touches[0].clientX - rect.left,
        y: e.touches[0].clientY - rect.top
      };
    }
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
  };

  const startDrawing = (e) => {
    const pos = getPosition(e);
    if (!pos) return;
    const context = canvasRef.current.getContext('2d');
    context.beginPath();
    context.moveTo(pos.x, pos.y);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e) => {
    if (!isDrawing) return;
    e.preventDefault(); // Prevent scrolling on touch devices
    const pos = getPosition(e);
    if (!pos) return;
    const context = canvasRef.current.getContext('2d');
    context.lineTo(pos.x, pos.y);
    context.stroke();
  };

  const stopDrawing = () => {
    const context = canvasRef.current.getContext('2d');
    context.closePath();
    setIsDrawing(false);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');
    context.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
    if (onClear) onClear();
  };
  
  const saveSignature = () => {
    if (!hasSignature) return;
    const canvas = canvasRef.current;
    const dataUrl = canvas.toDataURL('image/png');
    onSave(dataUrl);
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas dimensions based on container size
    const parent = canvas.parentElement;
    canvas.width = parent.offsetWidth;
    canvas.height = parent.offsetHeight;
    
    context.strokeStyle = '#000';
    context.lineWidth = 2;
    context.lineCap = 'round';
    context.lineJoin = 'round';
    
    if (initialData) {
        const image = new Image();
        image.src = initialData;
        image.onload = () => {
            context.drawImage(image, 0, 0, canvas.width, canvas.height);
            setHasSignature(true);
        };
    }

  }, [initialData]);

  return (
    <div className="relative w-full h-48 border border-dashed rounded-lg bg-muted touch-none">
      <canvas
        ref={canvasRef}
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseLeave={stopDrawing}
        onTouchStart={startDrawing}
        onTouchMove={draw}
        onTouchEnd={stopDrawing}
        className="w-full h-full"
      />
      <div className="absolute bottom-2 right-2 flex gap-2">
        <Button variant="ghost" size="sm" onClick={clearCanvas}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Limpar
        </Button>
        <Button variant="default" size="sm" onClick={saveSignature} disabled={!hasSignature}>
          <Check className="h-4 w-4 mr-2" />
          Confirmar
        </Button>
      </div>
    </div>
  );
};

export default SignaturePad;