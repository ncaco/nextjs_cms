'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

// 템플릿 데이터 (나중에 데이터베이스에서 가져올 예정)
const dummyTemplates = [
  {
    id: '1',
    title: '블로그 포스트',
    description: '깔끔한 블로그 포스트 레이아웃',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=블로그+포스트+템플릿',
    category: '블로그'
  },
  {
    id: '2',
    title: '소셜 미디어 포스트',
    description: '인스타그램 및 페이스북용 포스트',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=소셜+미디어+템플릿',
    category: '소셜 미디어'
  },
  {
    id: '3',
    title: '비즈니스 카드',
    description: '전문적인 비즈니스 카드 디자인',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=비즈니스+카드+템플릿',
    category: '명함'
  },
  {
    id: '4',
    title: '배너',
    description: '웹사이트 및 소셜 미디어용 배너',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=배너+템플릿',
    category: '배너'
  },
  {
    id: '5',
    title: '프레젠테이션',
    description: '프로페셔널한 슬라이드 템플릿',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=프레젠테이션+템플릿',
    category: '프레젠테이션'
  },
  {
    id: '6',
    title: '뉴스레터',
    description: '이메일 뉴스레터 템플릿',
    thumbnail: 'https://placehold.co/600x400/e2e8f0/1e293b?text=뉴스레터+템플릿',
    category: '이메일'
  }
];

// 카테고리 목록
const categories = ['전체', '블로그', '소셜 미디어', '명함', '배너', '프레젠테이션', '이메일'];

export default function Templates() {
  const [selectedCategory, setSelectedCategory] = useState('전체');
  const [searchQuery, setSearchQuery] = useState('');

  // 필터링된 템플릿
  const filteredTemplates = dummyTemplates.filter(template => {
    const matchesCategory = selectedCategory === '전체' || template.category === selectedCategory;
    const matchesSearch = template.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          template.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-12">
        <h1 className="text-3xl font-bold mb-4">템플릿 라이브러리</h1>
        <p className="text-gray-600">
          다양한 종류의 템플릿을 찾아보고 프로젝트에 사용해보세요.
        </p>
      </div>

      {/* 검색 및 필터 */}
      <div className="mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-1/3">
          <input
            type="text"
            placeholder="템플릿 검색..."
            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <button
              key={category}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-indigo-600 text-white'
                  : 'bg-gray-100 text-gray-800 hover:bg-gray-200'
              }`}
              onClick={() => setSelectedCategory(category)}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      {/* 템플릿 그리드 */}
      {filteredTemplates.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map(template => (
            <div
              key={template.id}
              className="bg-white rounded-lg shadow-md overflow-hidden transition-transform hover:scale-105"
            >
              <div className="relative h-48 overflow-hidden">
                <Image
                  src={template.thumbnail}
                  alt={template.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-4">
                <span className="inline-block px-2 py-1 bg-indigo-100 text-indigo-800 text-xs font-medium rounded-full mb-2">
                  {template.category}
                </span>
                <h3 className="text-lg font-semibold mb-1">{template.title}</h3>
                <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                <Link 
                  href={`/templates/${template.id}`}
                  className="inline-block w-full text-center bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 transition-colors"
                >
                  사용하기
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 text-lg">검색 결과가 없습니다.</p>
          <button
            className="mt-4 text-indigo-600 font-medium"
            onClick={() => {
              setSelectedCategory('전체');
              setSearchQuery('');
            }}
          >
            모든 템플릿 보기
          </button>
        </div>
      )}
    </div>
  );
} 