'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function AuthError() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [errorMessage, setErrorMessage] = useState('인증 중 오류가 발생했습니다.');

  useEffect(() => {
    // URL에서 error 파라미터 확인
    const error = searchParams?.get('error');
    
    if (error) {
      switch (error) {
        case 'Signin':
          setErrorMessage('로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
          break;
        case 'OAuthSignin':
          setErrorMessage('소셜 로그인 중 오류가 발생했습니다. 다시 시도해주세요.');
          break;
        case 'OAuthCallback':
          setErrorMessage('소셜 로그인 콜백 처리 중 오류가 발생했습니다.');
          break;
        case 'OAuthCreateAccount':
          setErrorMessage('소셜 계정 생성 중 오류가 발생했습니다.');
          break;
        case 'EmailCreateAccount':
          setErrorMessage('이메일 계정 생성 중 오류가 발생했습니다.');
          break;
        case 'Callback':
          setErrorMessage('콜백 처리 중 오류가 발생했습니다.');
          break;
        case 'OAuthAccountNotLinked':
          setErrorMessage('이미 다른 방법으로 가입된 이메일입니다. 기존 로그인 방법을 사용해주세요.');
          break;
        case 'EmailSignin':
          setErrorMessage('이메일 로그인 중 오류가 발생했습니다.');
          break;
        case 'CredentialsSignin':
          setErrorMessage('이메일 또는 비밀번호가 일치하지 않습니다.');
          break;
        case 'SessionRequired':
          setErrorMessage('이 페이지에 접근하려면 로그인이 필요합니다.');
          break;
        default:
          setErrorMessage('인증 과정에서 오류가 발생했습니다. 다시 시도해주세요.');
      }
    }
  }, [searchParams]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="rounded-full h-24 w-24 bg-red-100 mx-auto flex items-center justify-center">
          <svg className="h-12 w-12 text-red-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">인증 오류</h2>
        <p className="mt-2 text-center text-sm text-gray-600">
          {errorMessage}
        </p>
        <div className="mt-6 space-y-4">
          <Link
            href="/auth/login"
            className="w-full inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            로그인 페이지로 돌아가기
          </Link>
          <button
            onClick={() => router.push('/')}
            className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            홈으로 돌아가기
          </button>
        </div>
      </div>
    </div>
  );
} 