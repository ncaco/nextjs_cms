'use client';

import { useEffect, useRef, useState } from 'react';

// 타입스크립트 타입 선언 추가
declare global {
  interface Window {
    arrowKeyTimeout: NodeJS.Timeout;
  }
}

interface SimpleImageEditorProps {
  initialImage?: string;
  onSave?: (dataURL: string) => void;
  onLayerSelect?: (layerId: string | null, layer: Layer | null) => void;
}

type DrawingMode = 'brush' | 'eraser' | 'shape' | 'text' | 'select' | 'move' | 'resize';
type ShapeType = 'rectangle' | 'circle' | 'triangle';
type LayerType = 'shape' | 'text' | 'image';

// 레이어 데이터 타입 정의
interface ShapeData {
  shapeType: ShapeType;
}

interface TextData {
  text: string;
  textAlign: CanvasTextAlign;
}

interface LayerImageData {
  src: string;
}

type LayerData = ShapeData | TextData | LayerImageData;

// 레이어 인터페이스 추가
interface Layer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  data: LayerData; // 레이어 타입에 따른 데이터
  style: {
    fill?: string;
    stroke?: string;
    strokeWidth?: number;
    fontSize?: number;
    fontFamily?: string;
    opacity?: number;
  };
  locked: boolean;
  visible: boolean;
}

// 고유 ID 생성 함수
const generateId = (): string => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
};

const SimpleImageEditor = ({ initialImage, onSave, onLayerSelect }: SimpleImageEditorProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ctx, setCtx] = useState<CanvasRenderingContext2D | null>(null);
  const [drawing, setDrawing] = useState(false);
  const [color, setColor] = useState('#000000');
  const [brushSize, setBrushSize] = useState(5);
  const [mode, setMode] = useState<DrawingMode>('select');
  const [selectedShape, setSelectedShape] = useState<ShapeType>('rectangle');
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
  const [textInput, setTextInput] = useState('');
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // 레이어 관련 상태 추가
  const [layers, setLayers] = useState<Layer[]>([]);
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isMovingLayer, setIsMovingLayer] = useState(false);
  const [isResizingLayer, setIsResizingLayer] = useState(false);
  const [layerStartPos, setLayerStartPos] = useState({ x: 0, y: 0 });
  const [showLayerPanel, setShowLayerPanel] = useState(false);
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(20);
  const [textAlign, setTextAlign] = useState<CanvasTextAlign>('center');
  const [opacity, setOpacity] = useState(1);

  // 레이어가 선택될 때마다 부모에게 알림
  useEffect(() => {
    if (onLayerSelect) {
      const selectedLayer = layers.find(layer => layer.id === selectedLayerId);
      onLayerSelect(selectedLayerId, selectedLayer || null);
    }
  }, [selectedLayerId, layers, onLayerSelect]);

  // 캔버스 초기화
  useEffect(() => {
    if (canvasRef.current) {
      const canvas = canvasRef.current;
      canvas.width = 800;
      canvas.height = 600;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.fillStyle = backgroundColor;
        context.fillRect(0, 0, canvas.width, canvas.height);
        setCtx(context);
        
        // 히스토리에 초기 상태 저장
        saveToHistory();
      }
      
      // 초기 이미지가 있으면 로드
      if (initialImage && context) {
        const img = new Image();
        img.onload = () => {
          context.drawImage(img, 0, 0);
          // 이미지 레이어로 추가
          addImageLayer(img.src, 0, 0, img.width, img.height);
          saveToHistory();
        };
        img.src = initialImage;
      }
    }
  }, [initialImage]);

  // 레이어를 캔버스에 그리는 함수
  const drawLayers = () => {
    if (!ctx || !canvasRef.current) return;
    
    // 배경 지우기
    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    
    // 레이어 순서대로 그리기
    layers.forEach(layer => {
      if (!layer.visible) return;
      
      // 레이어 그리기 전 상태 저장
      ctx.save();
      
      // 불투명도 설정
      if (layer.style.opacity !== undefined) {
        ctx.globalAlpha = layer.style.opacity;
      }
      
      // 회전 적용
      if (layer.rotation !== 0) {
        const centerX = layer.x + layer.width / 2;
        const centerY = layer.y + layer.height / 2;
        ctx.translate(centerX, centerY);
        ctx.rotate((layer.rotation * Math.PI) / 180);
        ctx.translate(-centerX, -centerY);
      }
      
      // 레이어 타입에 따른 그리기
      if (layer.type === 'shape') {
        const shapeData = layer.data as ShapeData;
        ctx.strokeStyle = layer.style.stroke || '#000000';
        ctx.lineWidth = layer.style.strokeWidth || 1;
        ctx.fillStyle = layer.style.fill || 'transparent';
        
        switch (shapeData.shapeType) {
          case 'rectangle':
            ctx.strokeRect(layer.x, layer.y, layer.width, layer.height);
            if (layer.style.fill !== 'transparent') {
              ctx.fillRect(layer.x, layer.y, layer.width, layer.height);
            }
            break;
          case 'circle':
            ctx.beginPath();
            const radius = Math.min(layer.width, layer.height) / 2;
            ctx.arc(
              layer.x + layer.width / 2,
              layer.y + layer.height / 2,
              radius,
              0,
              Math.PI * 2
            );
            ctx.stroke();
            if (layer.style.fill !== 'transparent') {
              ctx.fill();
            }
            break;
          case 'triangle':
            ctx.beginPath();
            ctx.moveTo(layer.x + layer.width / 2, layer.y);
            ctx.lineTo(layer.x, layer.y + layer.height);
            ctx.lineTo(layer.x + layer.width, layer.y + layer.height);
            ctx.closePath();
            ctx.stroke();
            if (layer.style.fill !== 'transparent') {
              ctx.fill();
            }
            break;
        }
      } else if (layer.type === 'text') {
        const textData = layer.data as TextData;
        ctx.fillStyle = layer.style.fill || '#000000';
        ctx.font = `${layer.style.fontSize || 20}px ${layer.style.fontFamily || 'Arial'}`;
        ctx.textAlign = textData.textAlign;
        ctx.textBaseline = 'middle';
        
        const textX = layer.x + layer.width / 2;
        const textY = layer.y + layer.height / 2;
        ctx.fillText(textData.text, textX, textY);
      } else if (layer.type === 'image') {
        const imageData = layer.data as LayerImageData;
        const img = new Image();
        img.onload = () => {
          ctx.drawImage(img, layer.x, layer.y, layer.width, layer.height);
          
          // 선택된 레이어 표시
          if (layer.id === selectedLayerId) {
            drawSelectionBorder(layer);
          }
        };
        img.src = imageData.src;
      }
      
      // 선택된 레이어 표시
      if (layer.id === selectedLayerId) {
        drawSelectionBorder(layer);
      }
      
      // 레이어 상태 복원
      ctx.restore();
    });
  };
  
  // 선택 테두리 그리기
  const drawSelectionBorder = (layer: Layer) => {
    if (!ctx) return;
    
    // 선택 테두리 스타일
    ctx.strokeStyle = '#4285f4';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    // 테두리 그리기
    ctx.strokeRect(layer.x - 2, layer.y - 2, layer.width + 4, layer.height + 4);
    
    // 핸들 그리기
    ctx.setLineDash([]);
    const handleSize = 8;
    
    // 각 모서리에 핸들 그리기
    const handles = [
      { x: layer.x - handleSize / 2, y: layer.y - handleSize / 2 },  // 좌상단
      { x: layer.x + layer.width - handleSize / 2, y: layer.y - handleSize / 2 },  // 우상단
      { x: layer.x - handleSize / 2, y: layer.y + layer.height - handleSize / 2 },  // 좌하단
      { x: layer.x + layer.width - handleSize / 2, y: layer.y + layer.height - handleSize / 2 }  // 우하단
    ];
    
    handles.forEach(handle => {
      ctx.fillStyle = 'white';
      ctx.fillRect(handle.x, handle.y, handleSize, handleSize);
      ctx.strokeRect(handle.x, handle.y, handleSize, handleSize);
    });
  };

  // 히스토리에 현재 상태 저장
  const saveToHistory = () => {
    // 레이어 데이터와 캔버스 이미지를 함께 저장
    if (!canvasRef.current) return;
    
    const dataURL = canvasRef.current.toDataURL('image/png');
    const historyItem = {
      dataURL,
      layers: [...layers],
      selectedLayerId
    };
    
    // 기존 히스토리 처리
    if (historyIndex < history.length - 1) {
      setHistory(prev => [...prev.slice(0, historyIndex + 1), JSON.stringify(historyItem)]);
    } else {
      setHistory(prev => [...prev, JSON.stringify(historyItem)]);
    }
    
    setHistoryIndex(prev => prev + 1);
  };
  
  // 실행 취소
  const undo = () => {
    if (historyIndex <= 0 || !canvasRef.current) return;
    
    const newIndex = historyIndex - 1;
    setHistoryIndex(newIndex);
    
    try {
      const historyItem = JSON.parse(history[newIndex]);
      setLayers(historyItem.layers || []);
      setSelectedLayerId(historyItem.selectedLayerId);
      
      // 이미지 복원
      const img = new Image();
      img.onload = () => {
        if (!ctx || !canvasRef.current) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = historyItem.dataURL;
    } catch (error) {
      console.error('히스토리 복원 중 오류 발생:', error);
    }
  };
  
  // 다시 실행
  const redo = () => {
    if (historyIndex >= history.length - 1 || !canvasRef.current) return;
    
    const newIndex = historyIndex + 1;
    setHistoryIndex(newIndex);
    
    try {
      const historyItem = JSON.parse(history[newIndex]);
      setLayers(historyItem.layers || []);
      setSelectedLayerId(historyItem.selectedLayerId);
      
      // 이미지 복원
      const img = new Image();
      img.onload = () => {
        if (!ctx || !canvasRef.current) return;
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(img, 0, 0);
      };
      img.src = historyItem.dataURL;
    } catch (error) {
      console.error('히스토리 복원 중 오류 발생:', error);
    }
  };

  // 그리기 시작
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPos({ x, y });
    
    // 선택 모드인 경우 레이어 선택
    if (mode === 'select') {
      const clickedLayer = getLayerAtPosition(x, y);
      
      if (clickedLayer) {
        if (!clickedLayer.locked) {
          setSelectedLayerId(clickedLayer.id);
          // 선택 변경 시 부모 컴포넌트에 알림
          if (onLayerSelect) {
            onLayerSelect(clickedLayer.id, clickedLayer);
          }
          setIsMovingLayer(true);
          setLayerStartPos({ x, y });
        }
      } else {
        setSelectedLayerId(null);
        // 선택 해제 시 부모 컴포넌트에 알림
        if (onLayerSelect) {
          onLayerSelect(null, null);
        }
      }
      return;
    }
    
    // 이동 모드인 경우
    if (mode === 'move' && selectedLayerId) {
      const layer = layers.find(l => l.id === selectedLayerId);
      if (layer && !layer.locked) {
        setIsMovingLayer(true);
        setLayerStartPos({ x, y });
      }
      return;
    }
    
    // 리사이징 모드인 경우
    if (mode === 'resize' && selectedLayerId) {
      const layer = layers.find(l => l.id === selectedLayerId);
      if (layer && !layer.locked) {
        setIsResizingLayer(true);
        setLayerStartPos({ x, y });
      }
      return;
    }
    
    if (mode === 'brush') {
      setDrawing(true);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = brushSize;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = color;
    } else if (mode === 'eraser') {
      setDrawing(true);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineWidth = brushSize * 2;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = backgroundColor;
    } else if (mode === 'shape') {
      setDrawing(true);
    } else if (mode === 'text') {
      // 텍스트 레이어 추가
      addTextLayer(textInput || '텍스트 입력', x, y);
      setTextInput('');
    }
  };

  // 그리기 중
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 레이어 이동 처리
    if (isMovingLayer && selectedLayerId) {
      const layer = layers.find(l => l.id === selectedLayerId);
      if (layer && !layer.locked) {
        const dx = x - layerStartPos.x;
        const dy = y - layerStartPos.y;
        
        updateLayerTransform(layer.id, {
          x: layer.x + dx,
          y: layer.y + dy
        });
        
        setLayerStartPos({ x, y });
      }
      return;
    }
    
    // 레이어 크기 조절 처리
    if (isResizingLayer && selectedLayerId) {
      const layer = layers.find(l => l.id === selectedLayerId);
      if (layer && !layer.locked) {
        const dx = x - layerStartPos.x;
        const dy = y - layerStartPos.y;
        
        updateLayerTransform(layer.id, {
          width: Math.max(layer.width + dx, 10),
          height: Math.max(layer.height + dy, 10)
        });
        
        setLayerStartPos({ x, y });
      }
      return;
    }
    
    if (!drawing) return;
    
    if (mode === 'brush' || mode === 'eraser') {
      ctx.lineTo(x, y);
      ctx.stroke();
    } else if (mode === 'shape') {
      // 실시간 미리보기 (임시 캔버스 사용)
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tempCtx = tempCanvas.getContext('2d');
      
      if (tempCtx) {
        // 현재 상태 복사
        tempCtx.drawImage(canvasRef.current, 0, 0);
        
        // 도형 그리기
        tempCtx.strokeStyle = color;
        tempCtx.lineWidth = brushSize;
        
        const width = x - startPos.x;
        const height = y - startPos.y;
        
        switch (selectedShape) {
          case 'rectangle':
            tempCtx.strokeRect(startPos.x, startPos.y, width, height);
            break;
          case 'circle':
            tempCtx.beginPath();
            const radius = Math.sqrt(width * width + height * height) / 2;
            tempCtx.arc(startPos.x + width / 2, startPos.y + height / 2, radius, 0, Math.PI * 2);
            tempCtx.stroke();
            break;
          case 'triangle':
            tempCtx.beginPath();
            tempCtx.moveTo(startPos.x + width / 2, startPos.y);
            tempCtx.lineTo(startPos.x, startPos.y + height);
            tempCtx.lineTo(startPos.x + width, startPos.y + height);
            tempCtx.closePath();
            tempCtx.stroke();
            break;
        }
        
        // 원본 캔버스에 표시
        ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        ctx.drawImage(tempCanvas, 0, 0);
      }
    }
  };
  
  // 그리기 종료
  const stopDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!ctx || !canvasRef.current) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // 레이어 이동/리사이징 종료
    if (isMovingLayer || isResizingLayer) {
      setIsMovingLayer(false);
      setIsResizingLayer(false);
      saveToHistory();
      return;
    }
    
    if (!drawing) return;
    
    ctx.closePath();
    setDrawing(false);
    
    if (mode === 'shape') {
      const width = x - startPos.x;
      const height = y - startPos.y;
      
      // 도형이 너무 작으면 무시
      if (Math.abs(width) < 10 || Math.abs(height) < 10) return;
      
      // 새 도형 레이어 추가
      addShapeLayer(selectedShape, 
        Math.min(startPos.x, x), 
        Math.min(startPos.y, y), 
        Math.abs(width), 
        Math.abs(height)
      );
    }
    
    // 히스토리에 현재 상태 저장
    saveToHistory();
  };
  
  // 위치에 있는 레이어 찾기
  const getLayerAtPosition = (x: number, y: number) => {
    // 위에서부터 (z-index 높은 순) 확인
    for (let i = layers.length - 1; i >= 0; i--) {
      const layer = layers[i];
      if (!layer.visible) continue;
      
      // 회전이 있는 경우는 단순 충돌 검사 사용
      if (layer.rotation !== 0) {
        const centerX = layer.x + layer.width / 2;
        const centerY = layer.y + layer.height / 2;
        const distance = Math.sqrt(
          Math.pow(x - centerX, 2) + 
          Math.pow(y - centerY, 2)
        );
        
        if (distance <= Math.max(layer.width, layer.height) / 2) {
          return layer;
        }
      }
      // 일반 사각형 충돌 검사
      else if (
        x >= layer.x && 
        x <= layer.x + layer.width && 
        y >= layer.y && 
        y <= layer.y + layer.height
      ) {
        return layer;
      }
    }
    return null;
  };

  // 텍스트 추가 핸들러
  const handleAddText = () => {
    if (!textInput || !canvasRef.current) return;
    
    const centerX = canvasRef.current.width / 2;
    const centerY = canvasRef.current.height / 2;
    
    addTextLayer(textInput, centerX - 100, centerY - fontSize / 2);
    setTextInput('');
    saveToHistory();
  };

  // 이미지 추가 핸들러
  const handleAddImage = () => {
    fileInputRef.current?.click();
  };

  // 이미지 업로드 핸들러
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canvasRef.current) return;
    if (!e.target.files || e.target.files.length === 0) return;
    
    const file = e.target.files[0];
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target?.result) return;
      
      const img = new Image();
      img.onload = () => {
        const canvas = canvasRef.current!;
        const aspectRatio = img.width / img.height;
        let width = canvas.width * 0.5;
        let height = width / aspectRatio;
        
        if (height > canvas.height * 0.5) {
          height = canvas.height * 0.5;
          width = height * aspectRatio;
        }
        
        const x = (canvas.width - width) / 2;
        const y = (canvas.height - height) / 2;
        
        addImageLayer(img.src, x, y, width, height);
        saveToHistory();
      };
      img.src = event.target.result as string;
    };
    
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // 캔버스 초기화 핸들러
  const handleClear = () => {
    if (!canvasRef.current) return;
    
    setLayers([]);
    setSelectedLayerId(null);
    
    if (ctx) {
      ctx.fillStyle = backgroundColor;
      ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    
    saveToHistory();
  };

  // 캔버스 저장 핸들러
  const handleSave = () => {
    if (!canvasRef.current || !onSave) return;
    
    // 선택 테두리 없이 렌더링
    const tempSelectedId = selectedLayerId;
    setSelectedLayerId(null);
    
    // 레이어 다시 그리기 (선택 테두리 없이)
    setTimeout(() => {
      const dataURL = canvasRef.current!.toDataURL('image/png');
      onSave(dataURL);
      
      // 원래 선택 상태로 복원
      setSelectedLayerId(tempSelectedId);
    }, 10);
  };

  // 도형 추가 핸들러
  const handleSelectShape = (shape: ShapeType) => {
    setSelectedShape(shape);
    setMode('shape');
  };
  
  // 선택된 레이어 삭제
  const handleDeleteSelected = () => {
    if (selectedLayerId) {
      deleteLayer(selectedLayerId);
      drawLayers();
      saveToHistory();
    }
  };

  // 선택된 레이어 복제
  const handleDuplicateSelected = () => {
    if (!selectedLayerId) return;
    
    const layer = layers.find(l => l.id === selectedLayerId);
    if (!layer) return;
    
    const newLayer: Layer = {
      ...layer,
      id: generateId(),
      x: layer.x + 20,
      y: layer.y + 20
    };
    
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    saveToHistory();
  };
  
  // 키보드 이벤트 처리
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedLayerId) return;
      
      // Delete 키로 선택된 레이어 삭제
      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleDeleteSelected();
        e.preventDefault();
      }
      
      // 방향키로 선택된 레이어 이동
      const layer = layers.find(l => l.id === selectedLayerId);
      if (!layer || layer.locked) return;
      
      let dx = 0, dy = 0;
      
      switch (e.key) {
        case 'ArrowLeft': dx = -1; break;
        case 'ArrowRight': dx = 1; break;
        case 'ArrowUp': dy = -1; break;
        case 'ArrowDown': dy = 1; break;
      }
      
      if (dx !== 0 || dy !== 0) {
        updateLayerTransform(selectedLayerId, {
          x: layer.x + dx * (e.shiftKey ? 10 : 1),
          y: layer.y + dy * (e.shiftKey ? 10 : 1)
        });
        e.preventDefault();
        
        // 복잡한 작업은 키 이벤트 처리 후에 히스토리 저장
        if (e.key.startsWith('Arrow')) {
          clearTimeout(window.arrowKeyTimeout);
          window.arrowKeyTimeout = setTimeout(() => {
            saveToHistory();
          }, 300);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedLayerId, layers]);

  // 도형 레이어 추가
  const addShapeLayer = (shapeType: ShapeType, x: number, y: number, width: number, height: number) => {
    const newLayer: Layer = {
      id: generateId(),
      type: 'shape',
      x,
      y,
      width,
      height,
      rotation: 0,
      data: { shapeType },
      style: {
        fill: 'transparent',
        stroke: color,
        strokeWidth: brushSize,
        opacity: opacity
      },
      locked: false,
      visible: true
    };
    
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    
    return newLayer.id;
  };
  
  // 텍스트 레이어 추가
  const addTextLayer = (text: string, x: number, y: number) => {
    const measure = ctx?.measureText(text) || { width: 100 };
    const width = measure.width * 1.5;
    const height = (fontSize || 20) * 1.5;
    
    const newLayer: Layer = {
      id: generateId(),
      type: 'text',
      x,
      y,
      width,
      height,
      rotation: 0,
      data: { 
        text,
        textAlign
      },
      style: {
        fill: color,
        fontSize: fontSize,
        fontFamily: fontFamily,
        opacity: opacity
      },
      locked: false,
      visible: true
    };
    
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    
    return newLayer.id;
  };
  
  // 이미지 레이어 추가
  const addImageLayer = (src: string, x: number, y: number, width: number, height: number) => {
    const newLayer: Layer = {
      id: generateId(),
      type: 'image',
      x,
      y,
      width,
      height,
      rotation: 0,
      data: { src },
      style: {
        opacity: opacity
      },
      locked: false,
      visible: true
    };
    
    setLayers(prev => [...prev, newLayer]);
    setSelectedLayerId(newLayer.id);
    
    return newLayer.id;
  };
  
  // 레이어 삭제
  const deleteLayer = (id: string) => {
    setLayers(prev => prev.filter(layer => layer.id !== id));
    if (selectedLayerId === id) {
      setSelectedLayerId(null);
    }
  };
  
  // 레이어 순서 변경
  const moveLayerUp = (id: string) => {
    setLayers(prev => {
      const index = prev.findIndex(layer => layer.id === id);
      if (index === prev.length - 1) return prev;
      
      const newLayers = [...prev];
      const temp = newLayers[index];
      newLayers[index] = newLayers[index + 1];
      newLayers[index + 1] = temp;
      
      return newLayers;
    });
  };
  
  const moveLayerDown = (id: string) => {
    setLayers(prev => {
      const index = prev.findIndex(layer => layer.id === id);
      if (index === 0) return prev;
      
      const newLayers = [...prev];
      const temp = newLayers[index];
      newLayers[index] = newLayers[index - 1];
      newLayers[index - 1] = temp;
      
      return newLayers;
    });
  };
  
  // 레이어 잠금/해제
  const toggleLayerLock = (id: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, locked: !layer.locked } : layer
    ));
  };
  
  // 레이어 표시/숨김
  const toggleLayerVisibility = (id: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, visible: !layer.visible } : layer
    ));
  };
  
  // 레이어 속성 변경
  const updateLayerStyle = (id: string, style: Partial<Layer['style']>) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, style: { ...layer.style, ...style } } : layer
    ));
  };
  
  // 레이어 위치/크기 변경
  const updateLayerTransform = (id: string, transform: Partial<Pick<Layer, 'x' | 'y' | 'width' | 'height' | 'rotation'>>) => {
    setLayers(prev => prev.map(layer => 
      layer.id === id ? { ...layer, ...transform } : layer
    ));
  };

  // 레이어가 변경될 때마다 캔버스 다시 그리기
  useEffect(() => {
    drawLayers();
  }, [layers, selectedLayerId]);

  // 배경색 변경 핸들러
  const handleBackgroundColorChange = (newColor: string) => {
    setBackgroundColor(newColor);
    if (ctx && canvasRef.current) {
      // 현재 캔버스 콘텐츠를 임시로 저장
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvasRef.current.width;
      tempCanvas.height = canvasRef.current.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        tempCtx.drawImage(canvasRef.current, 0, 0);
      
        // 배경색 변경
        ctx.fillStyle = newColor;
        ctx.fillRect(0, 0, canvasRef.current.width, canvasRef.current.height);
        
        // 레이어 다시 그리기
        drawLayers();
        
        // 히스토리에 저장
        saveToHistory();
      }
    }
  };

  return (
    <div className="bg-white shadow-lg rounded-lg overflow-hidden">
      {/* 상단 툴바 */}
      <div className="bg-gray-50 border-b border-gray-200 p-2 flex flex-wrap items-center gap-2">
        <div className="flex items-center gap-1 mr-3">
          <button 
            className={`p-2 rounded ${mode === 'select' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => setMode('select')}
            title="선택"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
            </svg>
          </button>
          <button 
            className={`p-2 rounded ${mode === 'move' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => setMode('move')}
            title="이동"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
            </svg>
          </button>
          <button 
            className={`p-2 rounded ${mode === 'resize' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => setMode('resize')}
            title="크기 조절"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-1 mr-3">
          <button 
            className={`p-2 rounded ${mode === 'brush' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => setMode('brush')}
            title="브러시"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
            </svg>
          </button>
          <button 
            className={`p-2 rounded ${mode === 'eraser' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => setMode('eraser')}
            title="지우개"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-1 mr-3">
          <button 
            className={`p-2 rounded ${selectedShape === 'rectangle' && mode === 'shape' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => handleSelectShape('rectangle')}
            title="사각형"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
            </svg>
          </button>
          <button 
            className={`p-2 rounded ${selectedShape === 'circle' && mode === 'shape' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => handleSelectShape('circle')}
            title="원"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <circle cx="12" cy="12" r="10" strokeWidth="2" />
            </svg>
          </button>
          <button 
            className={`p-2 rounded ${selectedShape === 'triangle' && mode === 'shape' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
            onClick={() => handleSelectShape('triangle')}
            title="삼각형"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4l-8 12h16L12 4z" />
            </svg>
          </button>
        </div>
        
        <div className="flex items-center gap-1 mr-3">
          <div className="relative">
            <input
              type="text"
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="텍스트 입력"
              className="px-2 py-1 border border-gray-300 rounded text-sm w-32"
            />
            <button 
              className="p-2 rounded hover:bg-gray-100 ml-1"
              onClick={handleAddText}
              title="텍스트 추가"
              disabled={!textInput}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </button>
          </div>
        </div>
        
        {/* 텍스트 스타일 옵션 */}
        {selectedLayerId && layers.find(l => l.id === selectedLayerId)?.type === 'text' && (
          <div className="flex items-center gap-2 mr-3 border-l border-gray-200 pl-2">
            <select 
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
              className="text-sm border border-gray-300 rounded py-1"
              title="폰트"
            >
              <option value="Arial">Arial</option>
              <option value="Verdana">Verdana</option>
              <option value="Tahoma">Tahoma</option>
              <option value="Times New Roman">Times New Roman</option>
              <option value="Courier New">Courier New</option>
            </select>
            <select 
              value={fontSize}
              onChange={(e) => setFontSize(parseInt(e.target.value))}
              className="text-sm border border-gray-300 rounded py-1 w-16"
              title="크기"
            >
              {[8, 10, 12, 14, 16, 18, 20, 24, 28, 32, 36, 42, 48, 56, 64, 72].map(size => (
                <option key={size} value={size}>{size}</option>
              ))}
            </select>
            <div className="flex border border-gray-300 rounded overflow-hidden">
              <button 
                className={`p-1 ${textAlign === 'left' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                onClick={() => setTextAlign('left')}
                title="왼쪽 정렬"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h10M4 18h16" />
                </svg>
              </button>
              <button 
                className={`p-1 ${textAlign === 'center' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                onClick={() => setTextAlign('center')}
                title="가운데 정렬"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M8 12h8M4 18h16" />
                </svg>
              </button>
              <button 
                className={`p-1 ${textAlign === 'right' ? 'bg-blue-100' : 'hover:bg-gray-100'}`}
                onClick={() => setTextAlign('right')}
                title="오른쪽 정렬"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M14 12h6M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        )}
        
        <div className="flex items-center gap-1 mr-3">
          <button 
            className="p-2 rounded hover:bg-gray-100"
            onClick={handleAddImage}
            title="이미지 추가"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            style={{ display: 'none' }}
            accept="image/*"
            onChange={handleImageUpload}
          />
        </div>
        
        <div className="flex items-center gap-1 mr-3">
          <button 
            className="p-2 rounded hover:bg-gray-100"
            onClick={undo}
            disabled={historyIndex <= 0}
            title="실행 취소"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${historyIndex <= 0 ? 'text-gray-300' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <button 
            className="p-2 rounded hover:bg-gray-100"
            onClick={redo}
            disabled={historyIndex >= history.length - 1}
            title="다시 실행"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${historyIndex >= history.length - 1 ? 'text-gray-300' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </button>
        </div>
        
        <div className="flex-1"></div>
        
        <div className="flex items-center gap-2">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-8 h-8 p-0 border-0 rounded cursor-pointer"
            title="색상 선택"
          />
          <input
            type="range"
            min="1"
            max="30"
            value={brushSize}
            onChange={(e) => setBrushSize(parseInt(e.target.value))}
            className="w-24"
            title="브러시 크기"
          />
          <span className="text-xs text-gray-500">{brushSize}px</span>
          
          {/* 투명도 조절 추가 */}
          <div className="flex items-center gap-1 ml-2">
            <span className="text-xs text-gray-500">투명도:</span>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-24"
              title="투명도"
            />
            <span className="text-xs text-gray-500">{Math.round(opacity * 100)}%</span>
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          <button
            className={`p-2 rounded hover:bg-gray-100 ${showLayerPanel ? 'bg-blue-100' : ''}`}
            onClick={() => setShowLayerPanel(!showLayerPanel)}
            title="레이어 패널"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </button>
          
          {/* 배경색 변경 버튼 추가 */}
          <button
            className="p-2 rounded hover:bg-gray-100"
            title="배경색 변경"
            onClick={() => {
              const newColor = prompt('배경색을 입력하세요 (예: #FFFFFF)', backgroundColor);
              if (newColor) {
                handleBackgroundColorChange(newColor);
              }
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
            </svg>
          </button>
          
          <button 
            className="p-2 rounded hover:bg-gray-100 ml-2"
            onClick={handleClear}
            title="캔버스 초기화"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </button>
          <button 
            className="p-2 rounded bg-blue-500 hover:bg-blue-600 text-white ml-1"
            onClick={handleSave}
            title="저장"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
          </button>
        </div>
      </div>
      
      {/* 캔버스 영역 */}
      <div className="flex">
        {/* 레이어 패널 (조건부 렌더링) */}
        {showLayerPanel && (
          <div className="w-64 border-r border-gray-200 p-2 bg-gray-50">
            <div className="flex justify-between items-center mb-2">
              <h3 className="font-medium text-sm">레이어</h3>
              <div className="flex gap-1">
                <button 
                  className="p-1 rounded hover:bg-gray-200" 
                  title="레이어 추가"
                  onClick={() => addShapeLayer('rectangle', 100, 100, 100, 100)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </button>
                <button 
                  className="p-1 rounded hover:bg-gray-200" 
                  title="레이어 삭제"
                  onClick={handleDeleteSelected}
                  disabled={!selectedLayerId}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${!selectedLayerId ? 'text-gray-300' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
                <button 
                  className="p-1 rounded hover:bg-gray-200" 
                  title="레이어 복제"
                  onClick={handleDuplicateSelected}
                  disabled={!selectedLayerId}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${!selectedLayerId ? 'text-gray-300' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div className="mt-2 space-y-1 max-h-[500px] overflow-y-auto">
              {layers.map((layer, index) => (
                <div 
                  key={layer.id}
                  className={`p-2 text-sm flex items-center justify-between rounded cursor-pointer ${
                    selectedLayerId === layer.id ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-100'
                  }`}
                  onClick={() => setSelectedLayerId(layer.id)}
                >
                  <div className="flex items-center">
                    <button 
                      className={`mr-1 ${layer.visible ? 'text-blue-500' : 'text-gray-400'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerVisibility(layer.id);
                      }}
                      title={layer.visible ? '숨기기' : '표시하기'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={layer.visible 
                          ? "M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                          : "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        } />
                      </svg>
                    </button>
                    <button 
                      className={`mr-2 ${layer.locked ? 'text-red-500' : 'text-gray-400'}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLayerLock(layer.id);
                      }}
                      title={layer.locked ? '잠금 해제' : '잠금'}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={layer.locked
                          ? "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                          : "M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z"
                        } />
                      </svg>
                    </button>
                    <span className="truncate max-w-[120px]">
                      {layer.type === 'text' 
                        ? `텍스트: ${(layer.data as TextData).text.substring(0, 10)}${(layer.data as TextData).text.length > 10 ? '...' : ''}`
                        : layer.type === 'image' 
                          ? '이미지'
                          : `도형: ${(layer.data as ShapeData).shapeType}`
                      }
                    </span>
                  </div>
                  <div className="flex gap-1">
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayerUp(layer.id);
                      }}
                      disabled={index === layers.length - 1}
                      title="위로 이동"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${index === layers.length - 1 ? 'opacity-30' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                      </svg>
                    </button>
                    <button 
                      className="text-gray-400 hover:text-gray-600"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveLayerDown(layer.id);
                      }}
                      disabled={index === 0}
                      title="아래로 이동"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className={`h-4 w-4 ${index === 0 ? 'opacity-30' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
              
              {layers.length === 0 && (
                <div className="text-sm text-gray-500 text-center py-4">
                  레이어가 없습니다. <br />
                  도형, 텍스트 또는 이미지를 추가하세요.
                </div>
              )}
            </div>
          </div>
        )}
        
        <div className={`bg-gray-50 flex justify-center items-center p-4 ${showLayerPanel ? 'flex-1' : 'w-full'}`}>
          <canvas
            ref={canvasRef}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
            className="border border-gray-300 shadow-md bg-white"
            style={{ touchAction: 'none' }}
          />
        </div>
      </div>
      
      {/* 하단 상태바 */}
      <div className="bg-gray-50 border-t border-gray-200 p-2 flex justify-between items-center text-xs text-gray-500">
        <div>
          캔버스 크기: 800 x 600
        </div>
        <div>
          {historyIndex > 0 && `변경 내역: ${historyIndex}개`}
        </div>
      </div>
      
      {/* 선택된 레이어의 스타일 속성 수정 UI 추가 */}
      {selectedLayerId && showLayerPanel && (
        <div className="p-2 border-t border-gray-200 bg-gray-50">
          <h4 className="text-xs font-medium mb-2">선택된 레이어 스타일</h4>
          <div className="flex items-center gap-2">
            <button 
              className="text-xs px-2 py-1 bg-blue-500 text-white rounded"
              onClick={() => {
                const selectedLayer = layers.find(l => l.id === selectedLayerId);
                if (selectedLayer) {
                  updateLayerStyle(selectedLayerId, {
                    fill: color,
                    opacity: opacity
                  });
                }
              }}
            >
              스타일 적용
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SimpleImageEditor; 