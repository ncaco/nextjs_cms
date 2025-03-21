'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';

// 템플릿 데이터 (나중에 데이터베이스에서 가져올 예정)
const dummyTemplates = [
  {
    id: '1',
    title: '블로그 포스트',
    description: '깔끔한 블로그 포스트 레이아웃',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=블로그+포스트+템플릿',
    category: '블로그',
    content: '이 블로그 포스트 템플릿은 깔끔한 레이아웃과 가독성 좋은 텍스트 배치를 제공합니다. 제목, 부제목, 본문, 이미지 등을 쉽게 편집할 수 있습니다.'
  },
  {
    id: '2',
    title: '소셜 미디어 포스트',
    description: '인스타그램 및 페이스북용 포스트',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=소셜+미디어+템플릿',
    category: '소셜 미디어',
    content: '소셜 미디어 포스트 템플릿은 인스타그램, 페이스북 등의 소셜 미디어 플랫폼에 최적화되어 있습니다. 다양한 크기와 형식으로 제공됩니다.'
  },
  {
    id: '3',
    title: '비즈니스 카드',
    description: '전문적인 비즈니스 카드 디자인',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=비즈니스+카드+템플릿',
    category: '명함',
    content: '전문적인 비즈니스 카드 템플릿으로 귀하의 브랜드 이미지를 강화하세요. 다양한 색상과 스타일로 제공됩니다.'
  },
  {
    id: '4',
    title: '배너',
    description: '웹사이트 및 소셜 미디어용 배너',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=배너+템플릿',
    category: '배너',
    content: '다양한 목적으로 사용할 수 있는 배너 템플릿입니다. 웹사이트 헤더, 소셜 미디어 커버, 프로모션 배너 등으로 활용할 수 있습니다.'
  },
  {
    id: '5',
    title: '프레젠테이션',
    description: '프로페셔널한 슬라이드 템플릿',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=프레젠테이션+템플릿',
    category: '프레젠테이션',
    content: '전문적인 프레젠테이션을 위한 슬라이드 템플릿입니다. 다양한 차트, 그래프, 레이아웃이 포함되어 있어 데이터를 효과적으로 표현할 수 있습니다.'
  },
  {
    id: '6',
    title: '뉴스레터',
    description: '이메일 뉴스레터 템플릿',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=뉴스레터+템플릿',
    category: '이메일',
    content: '이메일 뉴스레터를 위한 템플릿으로, 다양한 이메일 클라이언트에서 호환성이 좋습니다. 텍스트, 이미지, 버튼 등을 쉽게 편집할 수 있습니다.'
  }
];

export default function TemplateDetails() {
  const params = useParams();
  const router = useRouter();
  const [template, setTemplate] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState('');

  useEffect(() => {
    // 실제로는 API 호출로 데이터를 가져오지만, 여기서는 더미 데이터 사용
    const templateId = params.id as string;
    const foundTemplate = dummyTemplates.find(t => t.id === templateId);
    
    if (foundTemplate) {
      setTemplate(foundTemplate);
      setContent(foundTemplate.content);
    }
    
    setLoading(false);
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!template) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">템플릿을 찾을 수 없습니다</h1>
        <p className="text-gray-600 mb-8">요청하신 템플릿이 존재하지 않거나 삭제되었습니다.</p>
        <button
          onClick={() => router.push('/templates')}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
        >
          템플릿 목록으로 돌아가기
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <button
        onClick={() => router.back()}
        className="flex items-center text-indigo-600 mb-6 hover:underline"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" viewBox="0 0 20 20" fill="currentColor">
          <path fillRule="evenodd" d="M7.707 14.707a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l2.293 2.293a1 1 0 010 1.414z" clipRule="evenodd" />
        </svg>
        돌아가기
      </button>

      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="md:flex">
          <div className="md:w-1/2">
            <div className="relative h-64 md:h-full">
              <Image
                src={template.thumbnail}
                alt={template.title}
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="p-8 md:w-1/2">
            <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full mb-4">
              {template.category}
            </span>
            <h1 className="text-3xl font-bold mb-4">{template.title}</h1>
            <p className="text-gray-600 mb-6">{template.description}</p>
            <div className="mb-8">
              <h2 className="text-lg font-semibold mb-2">템플릿 정보</h2>
              <p className="text-gray-700">{template.content}</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4">
              <button className="w-full py-3 px-4 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M12.586 4.586a2 2 0 112.828 2.828l-3 3a2 2 0 01-2.828 0 1 1 0 00-1.414 1.414 4 4 0 005.656 0l3-3a4 4 0 00-5.656-5.656l-1.5 1.5a1 1 0 101.414 1.414l1.5-1.5zm-5 5a2 2 0 012.828 0 1 1 0 101.414-1.414 4 4 0 00-5.656 0l-3 3a4 4 0 105.656 5.656l1.5-1.5a1 1 0 10-1.414-1.414l-1.5 1.5a2 2 0 11-2.828-2.828l3-3z" clipRule="evenodd" />
                </svg>
                에디터에서 열기
              </button>
              <button className="w-full py-3 px-4 border border-gray-300 text-gray-700 font-medium rounded-md hover:bg-gray-50 transition-colors flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M4 4a2 2 0 00-2 2v8a2 2 0 002 2h12a2 2 0 002-2V8a2 2 0 00-2-2h-5L9 4H4zm7 5a1 1 0 00-2 0v1.586l-.293-.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 10-1.414-1.414l-.293.293V9z" clipRule="evenodd" />
                </svg>
                저장하기
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-12">
        <h2 className="text-2xl font-bold mb-6">관련 템플릿</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {dummyTemplates
            .filter(t => t.category === template.category && t.id !== template.id)
            .slice(0, 4)
            .map(relatedTemplate => (
              <div 
                key={relatedTemplate.id}
                className="bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => router.push(`/templates/${relatedTemplate.id}`)}
              >
                <div className="relative h-40">
                  <Image
                    src={relatedTemplate.thumbnail}
                    alt={relatedTemplate.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{relatedTemplate.title}</h3>
                  <p className="text-gray-600 text-sm">{relatedTemplate.description}</p>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  );
} 