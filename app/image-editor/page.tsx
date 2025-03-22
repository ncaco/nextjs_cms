'use client';

import { useState } from 'react';
import SimpleImageEditor from '../components/SimpleImageEditor';

export default function ImageEditorPage() {
  const [savedImage, setSavedImage] = useState<string | null>(null);

  const handleSaveImage = (dataURL: string) => {
    setSavedImage(dataURL);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">이미지 에디터</h1>
      
      <div className="mb-6">
        <SimpleImageEditor onSave={handleSaveImage} />
      </div>
      
      {savedImage && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold mb-2">저장된 이미지</h2>
          <div className="border p-2 rounded-lg bg-gray-50">
            <img src={savedImage} alt="편집된 이미지" className="max-w-full h-auto" />
          </div>
          <div className="mt-2">
            <a 
              href={savedImage} 
              download="edited-image.png"
              className="inline-block bg-green-500 hover:bg-green-600 text-white py-2 px-4 rounded"
            >
              이미지 다운로드
            </a>
          </div>
        </div>
      )}
    </div>
  );
} 