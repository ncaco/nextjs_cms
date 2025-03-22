'use client';

import { useState } from 'react';
import SimpleImageEditor from '../components/SimpleImageEditor';
import Link from 'next/link';

// Layer 인터페이스 관련 타입 정의
interface ShapeData {
  shapeType: 'rectangle' | 'circle' | 'triangle';
}

interface TextData {
  text: string;
  textAlign: CanvasTextAlign;
}

interface LayerImageData {
  src: string;
}

type LayerData = ShapeData | TextData | LayerImageData;

// Layer 인터페이스 정의
interface Layer {
  id: string;
  type: 'shape' | 'text' | 'image';
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  data: LayerData; // 타입별 데이터
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

export default function EditorPage() {
  const [savedImage, setSavedImage] = useState<string | null>(null);
  const [showTemplates, setShowTemplates] = useState(false);
  const [canvasSize, setCanvasSize] = useState({ width: 800, height: 600 });
  const [activeTab, setActiveTab] = useState<'templates' | 'elements' | 'uploads'>('templates');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [selectedLayer, setSelectedLayer] = useState<Layer | null>(null);

  const handleSaveImage = (dataURL: string) => {
    setSavedImage(dataURL);
  };

  const handleLayerSelect = (layerId: string | null, layerData: Layer | null) => {
    setSelectedLayerId(layerId);
    setSelectedLayer(layerData);
  };

  const handleDownload = () => {
    if (!savedImage) return;
    
    const link = document.createElement('a');
    link.href = savedImage;
    link.download = 'canva-design.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleShareDesign = () => {
    // 공유 기능 모달 또는 다이얼로그 표시 (구현 예정)
    alert('디자인 공유 기능이 곧 추가될 예정입니다.');
  };

  return (
    <div className="min-h-screen bg-white">
      {/* 네비게이션 바 */}
      <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed top-0 left-0 right-0 z-50">
        <div className="flex flex-wrap justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="self-center text-2xl font-semibold text-blue-500">디자인 스튜디오</span>
            </Link>
            <span className="mx-4 text-gray-300">|</span>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                placeholder="제목 없음"
                className="text-sm border-none focus:ring-0 focus:outline-none"
                defaultValue="새 디자인"
              />
              <button className="text-gray-400 hover:text-gray-600">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleDownload}
              disabled={!savedImage}
              className={`${
                savedImage 
                  ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              } px-3 py-1.5 rounded-lg font-medium text-sm flex items-center space-x-1`}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              <span>다운로드</span>
            </button>
            <button 
              className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm flex items-center space-x-1"
              onClick={() => alert('프로젝트가 저장되었습니다!')}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
              <span>저장</span>
            </button>
            <button 
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg font-medium text-sm flex items-center space-x-1"
              onClick={handleShareDesign}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
              <span>공유</span>
            </button>
          </div>
        </div>
      </nav>

      {/* 메인 컨텐츠 */}
      <div className="pt-16 pb-8">
        <div className="flex h-screen">
          {/* 왼쪽 사이드바 - 도구 모음 */}
          <div className="w-16 bg-gray-100 border-r border-gray-200 flex flex-col items-center py-4 fixed left-0 top-16 bottom-0 z-40">
            <button 
              className={`w-10 h-10 mb-4 rounded-lg flex items-center justify-center ${showTemplates ? 'bg-blue-100 text-blue-600' : 'bg-white shadow hover:bg-gray-50'}`}
              onClick={() => setShowTemplates(!showTemplates)}
              title={showTemplates ? '템플릿 패널 닫기' : '템플릿 패널 열기'}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            <button className="w-10 h-10 mb-4 rounded-lg flex items-center justify-center bg-white shadow hover:bg-gray-50" title="텍스트 도구">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
              </svg>
            </button>
            <button className="w-10 h-10 mb-4 rounded-lg flex items-center justify-center bg-white shadow hover:bg-gray-50" title="이미지 도구">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="w-10 h-10 mb-4 rounded-lg flex items-center justify-center bg-white shadow hover:bg-gray-50" title="도형 도구">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14v6m-3-3h6M6 10h2a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2zm10 0h2a2 2 0 002-2V6a2 2 0 00-2-2h-2a2 2 0 00-2 2v2a2 2 0 002 2zM6 20h2a2 2 0 002-2v-2a2 2 0 00-2-2H6a2 2 0 00-2 2v2a2 2 0 002 2z" />
              </svg>
            </button>
            <button className="w-10 h-10 mb-4 rounded-lg flex items-center justify-center bg-white shadow hover:bg-gray-50" title="추가 도구">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </button>
          </div>

          {/* 템플릿/요소 패널 (조건부 렌더링) */}
          {showTemplates && (
            <div className="w-72 bg-white border-r border-gray-200 fixed left-16 top-16 bottom-0 p-4 overflow-y-auto z-30">
              <div className="flex border-b border-gray-200 mb-4">
                <button
                  className={`flex-1 py-2 text-sm font-medium ${activeTab === 'templates' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('templates')}
                >
                  템플릿
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium ${activeTab === 'elements' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('elements')}
                >
                  요소
                </button>
                <button
                  className={`flex-1 py-2 text-sm font-medium ${activeTab === 'uploads' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                  onClick={() => setActiveTab('uploads')}
                >
                  업로드
                </button>
              </div>

              {activeTab === 'templates' && (
                <div>
                  <h3 className="font-semibold text-sm mb-3">추천 템플릿</h3>
                  <div className="grid grid-cols-2 gap-3">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((item) => (
                      <div
                        key={item}
                        className="aspect-w-1 aspect-h-1 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-lg overflow-hidden hover:shadow-md cursor-pointer transition-shadow border border-gray-200"
                      >
                        <div className="p-2 text-xs text-center flex items-center justify-center">
                          템플릿 {item}
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold text-sm mt-6 mb-3">크기별 템플릿</h3>
                  <div className="space-y-2 text-sm">
                    <div className="p-2 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                      <span>인스타그램 포스트</span>
                      <span className="text-xs text-gray-500">1080 x 1080</span>
                    </div>
                    <div className="p-2 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                      <span>페이스북 커버</span>
                      <span className="text-xs text-gray-500">820 x 312</span>
                    </div>
                    <div className="p-2 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                      <span>프레젠테이션</span>
                      <span className="text-xs text-gray-500">1920 x 1080</span>
                    </div>
                    <div className="p-2 rounded hover:bg-gray-100 cursor-pointer flex justify-between items-center">
                      <span>A4 문서</span>
                      <span className="text-xs text-gray-500">794 x 1123</span>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'elements' && (
                <div>
                  <h3 className="font-semibold text-sm mb-3">도형</h3>
                  <div className="grid grid-cols-4 gap-2">
                    {['사각형', '원', '삼각형', '선', '화살표', '별', '다각형', '하트'].map((shape) => (
                      <div
                        key={shape}
                        className="aspect-w-1 aspect-h-1 bg-gray-100 rounded-lg overflow-hidden hover:bg-gray-200 cursor-pointer flex items-center justify-center text-xs p-1"
                      >
                        {shape}
                      </div>
                    ))}
                  </div>
                  
                  <h3 className="font-semibold text-sm mt-6 mb-3">텍스트 스타일</h3>
                  <div className="space-y-3">
                    <div className="p-3 border border-gray-200 rounded hover:border-gray-300 cursor-pointer">
                      <h4 className="text-xl font-bold">제목 텍스트</h4>
                    </div>
                    <div className="p-3 border border-gray-200 rounded hover:border-gray-300 cursor-pointer">
                      <h5 className="text-lg font-semibold">부제목 텍스트</h5>
                    </div>
                    <div className="p-3 border border-gray-200 rounded hover:border-gray-300 cursor-pointer">
                      <p className="text-base">본문 텍스트</p>
                    </div>
                    <div className="p-3 border border-gray-200 rounded hover:border-gray-300 cursor-pointer">
                      <p className="text-sm italic">인용문 텍스트</p>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'uploads' && (
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="font-semibold text-sm">내 이미지</h3>
                    <button className="text-sm text-blue-600 hover:text-blue-700">업로드</button>
                  </div>
                  
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 mx-auto text-gray-400 mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="text-sm text-gray-500 mb-2">이미지를 업로드하세요</p>
                    <button className="px-3 py-1 bg-blue-600 text-white text-sm rounded">파일 선택</button>
                  </div>
                  
                  <h3 className="font-semibold text-sm mt-6 mb-3">이미지 검색</h3>
                  <div className="relative mb-4">
                    <input
                      type="text"
                      placeholder="이미지 검색..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                    />
                    <button className="absolute right-2 top-2 text-gray-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 메인 캔버스 영역 */}
          <div 
            className={`transition-all duration-300 flex-1 p-4 ${
              showTemplates ? 'ml-[352px]' : 'ml-16'
            }`}
            style={{ height: 'calc(100vh - 4rem)' }}
          >
            <div className="h-full flex flex-col">
              {/* 상단 디자인 작업 공간 크기 선택기 */}
              <div className="mb-4 flex items-center justify-center">
                <div className="bg-white shadow rounded-lg py-1 px-3 flex items-center space-x-2 text-sm">
                  <span>크기:</span>
                  <select 
                    className="border-none focus:ring-0 py-1 text-sm"
                    value={`${canvasSize.width}x${canvasSize.height}`}
                    onChange={(e) => {
                      const [width, height] = e.target.value.split('x').map(Number);
                      setCanvasSize({ width, height });
                    }}
                  >
                    <option value="800x600">800 x 600</option>
                    <option value="1080x1080">1080 x 1080 (인스타그램)</option>
                    <option value="1200x628">1200 x 628 (페이스북)</option>
                    <option value="1920x1080">1920 x 1080 (HD)</option>
                  </select>
                </div>
              </div>
              
              {/* 캔버스 영역 */}
              <div className="flex-1 bg-gray-100 rounded-lg overflow-auto flex items-center justify-center p-4">
                <div className="bg-white shadow-lg">
                  <SimpleImageEditor 
                    onSave={handleSaveImage} 
                    onLayerSelect={handleLayerSelect} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 오른쪽 속성 패널 */}
          {selectedLayerId && (
            <div className="w-72 bg-white border-l border-gray-200 fixed right-0 top-16 bottom-0 p-4 overflow-y-auto z-30">
              <h3 className="font-semibold text-sm mb-4">선택 옵션</h3>
              
              {selectedLayer && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">레이어 타입</label>
                    <div className="py-1 px-2 bg-gray-100 rounded text-sm">
                      {selectedLayer.type === 'shape' ? '도형' : 
                       selectedLayer.type === 'text' ? '텍스트' : '이미지'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">위치</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1">X:</span>
                        <input 
                          type="number" 
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm" 
                          value={Math.round(selectedLayer.x)} 
                          readOnly
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1">Y:</span>
                        <input 
                          type="number" 
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm" 
                          value={Math.round(selectedLayer.y)} 
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">크기</label>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1">W:</span>
                        <input 
                          type="number" 
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm" 
                          value={Math.round(selectedLayer.width)} 
                          readOnly
                        />
                      </div>
                      <div className="flex items-center">
                        <span className="text-xs text-gray-500 mr-1">H:</span>
                        <input 
                          type="number" 
                          className="w-full px-2 py-1 border border-gray-300 rounded text-sm" 
                          value={Math.round(selectedLayer.height)} 
                          readOnly
                        />
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">회전</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="360" 
                      className="w-full" 
                      value={selectedLayer.rotation || 0} 
                      readOnly
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {selectedLayer.rotation || 0}°
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">투명도</label>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      className="w-full" 
                      value={selectedLayer.style?.opacity ? Math.round(selectedLayer.style.opacity * 100) : 100} 
                      readOnly
                    />
                    <div className="text-right text-xs text-gray-500 mt-1">
                      {selectedLayer.style?.opacity ? Math.round(selectedLayer.style.opacity * 100) : 100}%
                    </div>
                  </div>
                  
                  {/* 추가 속성 표시 */}
                  {selectedLayer.type === 'text' && selectedLayer.data && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-sm mb-2">텍스트 정보</h4>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">텍스트 내용</label>
                        <div className="py-1 px-2 bg-gray-100 rounded text-sm break-all">
                          {(selectedLayer.data as TextData).text || ''}
                        </div>
                      </div>
                      <div className="mt-2">
                        <label className="block text-xs text-gray-500 mb-1">폰트</label>
                        <div className="py-1 px-2 bg-gray-100 rounded text-sm">
                          {selectedLayer.style?.fontFamily || 'Arial'}, {selectedLayer.style?.fontSize || 16}px
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedLayer.type === 'shape' && selectedLayer.data && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-sm mb-2">도형 정보</h4>
                      <div>
                        <label className="block text-xs text-gray-500 mb-1">도형 타입</label>
                        <div className="py-1 px-2 bg-gray-100 rounded text-sm">
                          {(selectedLayer.data as ShapeData).shapeType === 'rectangle' ? '사각형' : 
                           (selectedLayer.data as ShapeData).shapeType === 'circle' ? '원' : '삼각형'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {selectedLayer.type === 'image' && (
                    <div className="border-t border-gray-200 pt-4">
                      <h4 className="font-medium text-sm mb-2">이미지 정보</h4>
                      <div className="flex justify-center">
                        <img 
                          src={(selectedLayer.data as LayerImageData).src} 
                          alt="Selected" 
                          className="max-w-full max-h-32 object-contain border border-gray-200 rounded" 
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 