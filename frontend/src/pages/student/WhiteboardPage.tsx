import { useState, useRef, useEffect } from 'react';
import { apiFetch } from '../../lib/api';
import { Save, Download, Trash2, PenTool, Eraser, Upload, Sparkles, X, MessageSquare } from 'lucide-react';

export default function WhiteboardPage() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState('#4F46E5'); // Primary color
  const [lineWidth, setLineWidth] = useState(5);
  const [mode, setMode] = useState<'draw' | 'erase'>('draw');
  const [showAi, setShowAi] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      const parent = canvas.parentElement;
      if (parent) {
        // Handle high DPI displays for smooth writing
        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();
        
        // Only set width/height if it changed (prevents clearing on re-renders)
        if (canvas.width !== rect.width * dpr || canvas.height !== rect.height * dpr) {
          canvas.width = rect.width * dpr;
          canvas.height = rect.height * dpr;
          
          const context = canvas.getContext('2d');
          if (context) {
            context.scale(dpr, dpr);
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.fillStyle = 'white';
            context.fillRect(0, 0, rect.width, rect.height);
          }
        }
      }
    }
    
    // Add window resize handler
    const handleResize = () => {
        // In a full app you'd save canvas state, resize, and restore here.
        // For now we'll just let it stay its original size or CSS handle it.
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    draw(e);
  };

  const endDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.beginPath(); // Reset the path so it doesn't connect to the next stroke
      }
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const context = canvas.getContext('2d');
    if (!context) return;

    const rect = canvas.getBoundingClientRect();
    let clientX, clientY;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = clientX - rect.left;
    const y = clientY - rect.top;

    context.lineWidth = lineWidth;
    if (mode === 'erase') {
      context.strokeStyle = 'white';
    } else {
      context.strokeStyle = color;
    }

    context.lineTo(x, y);
    context.stroke();
    context.beginPath();
    context.moveTo(x, y);
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = 'white';
        context.fillRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  const downloadCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = 'whiteboard.png';
      link.href = dataUrl;
      link.click();
    }
  };

  const handlePdfUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    // In a real app, parse PDF and render to canvas (e.g., using pdf.js)
    // For now, we simulate by showing an alert
    alert('PDF upload simulation. In production, this would render the PDF to the canvas for annotation.');
  };

  const handleAiSubmit = async () => {
    if (!aiPrompt.trim()) return;
    setIsAiLoading(true);
    setAiResponse('');
    
    try {
      const res = await apiFetch<any>('/ai-content/whiteboard-assist', {
        method: 'POST',
        body: JSON.stringify({ prompt: aiPrompt })
      });
      setAiResponse(res.suggestion || 'Sorry, no suggestion was returned.');
    } catch (err) {
      console.error(err);
      setAiResponse('Error fetching AI suggestion. Please try again.');
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 h-[calc(100vh-4rem)] flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Interactive Whiteboard</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Draw, take notes, and annotate PDFs.</p>
        </div>
        
        <div className="flex space-x-3">
          <label className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer">
            <Upload className="h-4 w-4 mr-2" />
            Import PDF
            <input type="file" accept="application/pdf" className="hidden" onChange={handlePdfUpload} />
          </label>
          <button onClick={clearCanvas} className="inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-red-600 bg-white dark:bg-gray-800 hover:bg-red-50 dark:hover:bg-red-900/20">
            <Trash2 className="h-4 w-4 mr-2" />
            Clear
          </button>
          <button onClick={downloadCanvas} className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700">
            <Download className="h-4 w-4 mr-2" />
            Export Image
          </button>
          <button 
            onClick={() => setShowAi(!showAi)} 
            className={`inline-flex items-center px-4 py-2 border rounded-md shadow-sm text-sm font-medium transition-colors ${
              showAi 
                ? 'border-transparent text-white bg-accent-600 hover:bg-accent-700' 
                : 'border-accent-200 text-accent-700 bg-accent-50 hover:bg-accent-100'
            }`}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            AI Assistant
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-4 flex space-x-6 items-center">
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setMode('draw')} 
            className={`px-3 py-2 rounded-lg flex items-center font-medium text-sm transition-colors ${mode === 'draw' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            <PenTool className="h-4 w-4 mr-2" />
            Pen
          </button>
          <button 
            onClick={() => setMode('erase')} 
            className={`px-3 py-2 rounded-lg flex items-center font-medium text-sm transition-colors ${mode === 'erase' ? 'bg-primary-100 text-primary-700 dark:bg-primary-900/40 dark:text-primary-300' : 'text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'}`}
          >
            <Eraser className="h-4 w-4 mr-2" />
            Eraser
          </button>
        </div>

        <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Color:</span>
          <input 
            type="color" 
            value={color} 
            onChange={(e) => setColor(e.target.value)}
            disabled={mode === 'erase'}
            className="h-8 w-8 rounded cursor-pointer border-0 p-0"
          />
        </div>

        <div className="h-8 w-px bg-gray-300 dark:bg-gray-600"></div>

        <div className="flex items-center space-x-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Size:</span>
          <input 
            type="range" 
            min="1" 
            max="20" 
            value={lineWidth} 
            onChange={(e) => setLineWidth(parseInt(e.target.value))}
            className="w-32"
          />
        </div>
      </div>

      <div className="flex-1 flex gap-4 overflow-hidden h-full">
        <div className="flex-1 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden relative cursor-crosshair">
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseUp={endDrawing}
            onMouseOut={endDrawing}
            onMouseMove={draw}
            onTouchStart={startDrawing}
            onTouchEnd={endDrawing}
            onTouchMove={draw}
            className="w-full h-full block touch-none"
          />
        </div>
        
        {showAi && (
          <div className="w-80 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all">
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center bg-accent-50 dark:bg-accent-900/20">
              <div className="flex items-center text-accent-700 dark:text-accent-400 font-medium">
                <Sparkles className="h-4 w-4 mr-2" />
                AI Assistant
              </div>
              <button onClick={() => setShowAi(false)} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <div className="p-4 flex-1 overflow-y-auto">
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                Ask for design ideas, structure suggestions, or help with your current whiteboard session.
              </p>
              
              <textarea
                value={aiPrompt}
                onChange={(e) => setAiPrompt(e.target.value)}
                placeholder="e.g. Generate a mind map layout for..."
                className="input w-full min-h-[100px] resize-none mb-3 text-sm"
              />
              
              <button 
                onClick={handleAiSubmit}
                disabled={isAiLoading || !aiPrompt.trim()}
                className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-accent-600 hover:bg-accent-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isAiLoading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                ) : (
                  <MessageSquare className="h-4 w-4 mr-2" />
                )}
                Get AI Help
              </button>
              
              {aiResponse && (
                <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg border border-gray-100 dark:border-gray-600">
                  <h4 className="text-sm font-medium text-gray-900 dark:text-white mb-2 flex items-center">
                    <Sparkles className="h-3 w-3 mr-1 text-accent-500" /> AI Suggestion
                  </h4>
                  <p className="text-sm text-gray-600 dark:text-gray-300 whitespace-pre-wrap">
                    {aiResponse}
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
