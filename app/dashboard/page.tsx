'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function DashboardPage() {
  const [designs, setDesigns] = useState([
    { id: 1, title: '포스터 디자인', thumbnail: '/placeholder1.jpg', lastEdited: '2024-03-20' },
    { id: 2, title: '소셜 미디어 그래픽', thumbnail: '/placeholder2.jpg', lastEdited: '2024-03-19' },
    { id: 3, title: '명함 디자인', thumbnail: '/placeholder3.jpg', lastEdited: '2024-03-18' },
    { id: 4, title: '인스타그램 포스트', thumbnail: '/placeholder4.jpg', lastEdited: '2024-03-17' },
    { id: 5, title: '페이스북 커버', thumbnail: '/placeholder5.jpg', lastEdited: '2024-03-16' },
    { id: 6, title: '프레젠테이션', thumbnail: '/placeholder6.jpg', lastEdited: '2024-03-15' },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 네비게이션 바 */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold text-blue-600">디자인스튜디오</span>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-gray-600">사용자님 안녕하세요</span>
            <button className="text-gray-600 hover:text-gray-900">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
            </button>
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center">
              U
            </div>
          </div>
        </div>
      </header>

      {/* 메인 컨텐츠 */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">내 디자인</h1>
          <Link href="/editor" className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
            새 디자인 만들기
          </Link>
        </div>

        {/* 필터 및 검색 */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-wrap items-center gap-4">
          <div className="flex-grow">
            <div className="relative">
              <input
                type="text"
                placeholder="디자인 검색..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-gray-500">정렬:</span>
            <select className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500">
              <option>최근 수정됨</option>
              <option>이름 (A-Z)</option>
              <option>이름 (Z-A)</option>
              <option>생성 날짜 (최신순)</option>
              <option>생성 날짜 (오래된순)</option>
            </select>
          </div>
        </div>

        {/* 디자인 그리드 */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {designs.map((design) => (
            <div key={design.id} className="bg-white rounded-lg shadow overflow-hidden">
              <div className="aspect-w-16 aspect-h-9 bg-gray-200">
                <div className="w-full h-full flex items-center justify-center text-gray-500">
                  {design.title[0]}
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-medium text-gray-900 truncate">{design.title}</h3>
                <p className="text-sm text-gray-500 mt-1">수정됨: {design.lastEdited}</p>
                <div className="mt-4 flex justify-between">
                  <Link href={`/editor?id=${design.id}`} className="text-blue-600 hover:text-blue-700 text-sm">
                    편집하기
                  </Link>
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* 새 디자인 추가 카드 */}
          <Link href="/editor" className="bg-white rounded-lg shadow overflow-hidden border-2 border-dashed border-gray-300 flex items-center justify-center aspect-w-16 aspect-h-9 p-6 hover:border-blue-500 hover:bg-blue-50 transition-colors">
            <div className="text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
              <span className="mt-2 block text-sm font-medium text-gray-900">새 디자인 만들기</span>
            </div>
          </Link>
        </div>

        {/* 최근 템플릿 */}
        <div className="mt-12">
          <h2 className="text-xl font-bold text-gray-900 mb-4">추천 템플릿</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((item) => (
              <div key={item} className="bg-white rounded-lg shadow overflow-hidden">
                <div className="aspect-w-16 aspect-h-9 bg-gradient-to-br from-blue-400 to-indigo-500"></div>
                <div className="p-4">
                  <h3 className="font-medium text-gray-900">템플릿 {item}</h3>
                  <p className="text-sm text-gray-500 mt-1">프로페셔널한 디자인</p>
                  <button className="mt-4 w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm">
                    사용하기
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
} 