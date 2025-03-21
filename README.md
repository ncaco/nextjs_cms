# Next.js CMS 프로젝트

Canva 스타일의 디자인 기능이 포함된 Next.js 기반 CMS 시스템입니다.

## 개요

이 프로젝트는 Next.js 14, NextAuth.js, Prisma, TailwindCSS를 사용하여 구축된 현대적인 콘텐츠 관리 시스템입니다. 사용자 친화적인 인터페이스로 콘텐츠 제작과 관리를 간소화하고, 템플릿 기반 디자인 시스템을 제공합니다.

## 주요 기능

- 📝 **사용자 인증**: 회원가입, 로그인 및 프로필 관리 기능
- 🎨 **템플릿 라이브러리**: 다양한 템플릿 제공 및 관리
- 🖼️ **디자인 에디터**: Canva 스타일의 드래그 앤 드롭 디자인 에디터
- 📱 **반응형 디자인**: 모바일, 태블릿, 데스크톱 환경에 최적화
- 🔐 **역할 기반 접근 제어**: 관리자 및 일반 사용자 권한 관리

## 현재 구현된 기능

- ✅ 사용자 인증 (회원가입, 로그인, 로그아웃)
- ✅ 사용자 프로필 페이지
- ✅ 대시보드 기본 구조
- ✅ 템플릿 갤러리 및 세부 페이지
- ✅ 모바일 반응형 헤더와 네비게이션
- ✅ 기본 레이아웃 및 UI 디자인

## 시작하기

### 필수 조건

- Node.js 16.14.0 이상
- npm 또는 yarn

### 설치

1. 저장소 클론하기:
```bash
git clone https://github.com/yourusername/nextjs_cms.git
cd nextjs_cms
```

2. 의존성 설치:
```bash
npm install
# 또는
yarn install
```

3. 환경 변수 설정:
`.env` 파일을 프로젝트 루트 디렉토리에 생성하고 다음 내용을 추가합니다:
```
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-nextauth-secret-key-change-this-in-production
DATABASE_URL="file:./dev.db"
```

4. 데이터베이스 설정:
```bash
npx prisma migrate dev --name init
```

5. 개발 서버 실행:
```bash
npm run dev
# 또는
yarn dev
```

이제 브라우저에서 `http://localhost:3000`으로 접속하여 애플리케이션을 확인할 수 있습니다.

## 데이터베이스 구조

이 프로젝트는 Prisma ORM을 사용하여 다음과 같은 모델을 관리합니다:

- User: 사용자 정보 관리
- Content: 콘텐츠 항목 관리
- Template: 템플릿 관리
- Category: 콘텐츠 및 템플릿 분류
- Tag: 콘텐츠 태그 관리
- Comment: 콘텐츠에 대한 댓글
- File: 업로드된 파일 관리
- Menu: 사이트 메뉴 구조 관리

## 추가 예정 기능

- 📝 게시물 및 페이지 관리 시스템
- 🎨 고급 템플릿 디자인 및 편집기
- 🌐 다국어 지원
- 📊 대시보드 통계 및 분석
- 🔍 검색 시스템 및 필터링
- 🏷️ 태그 및 카테고리 관리
- 🖼️ 미디어 라이브러리
- 📱 모바일 앱 지원

## 기술 스택

- **Frontend**: Next.js, React, TailwindCSS
- **Backend**: Next.js API Routes
- **데이터베이스**: SQLite(개발), PostgreSQL(프로덕션)
- **인증**: NextAuth.js
- **ORM**: Prisma
- **상태 관리**: React Hooks
- **스타일링**: TailwindCSS, CSS Modules

## 프로젝트 구조

```
nextjs_cms/
├── app/                    # Next.js 14 App 디렉토리
│   ├── api/                # API 라우트
│   ├── auth/               # 인증 관련 페이지
│   ├── dashboard/          # 대시보드 페이지
│   ├── profile/            # 사용자 프로필 페이지
│   ├── templates/          # 템플릿 관련 페이지
│   └── ...
├── prisma/                 # Prisma 스키마 및 마이그레이션
├── src/                    # 소스 코드
│   ├── components/         # React 컴포넌트
│   ├── lib/                # 유틸리티 함수 및 클래스
│   ├── styles/             # 전역 스타일
│   └── ...
├── public/                 # 정적 파일
└── ...
```

## 개발 로드맵

### 1단계: 기본 기능 구현 (현재)
- 인증 시스템 설정
- 기본 UI/UX 디자인
- 데이터베이스 스키마 설계
- 템플릿 갤러리 기본 기능

### 2단계: 핵심 기능 개발
- 콘텐츠 에디터 기능 구현
- 템플릿 관리 및 라이브러리 확장
- 대시보드 데이터 시각화
- 관리자 기능 구현

### 3단계: 확장 및 최적화
- 고급 검색 및 필터링
- 성능 최적화
- 사용자 경험 개선
- 플러그인 시스템

## 기여 방법

1. 프로젝트 포크하기
2. 기능 브랜치 생성하기 (`git checkout -b feature/amazing-feature`)
3. 변경 사항 커밋하기 (`git commit -m 'Add some amazing feature'`)
4. 브랜치에 푸시하기 (`git push origin feature/amazing-feature`)
5. Pull Request 생성하기

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 배포됩니다. 자세한 내용은 `LICENSE` 파일을 참조하세요.

## 연락처

프로젝트 관리자 - [이메일 주소](mailto:your.email@example.com)

프로젝트 링크: [https://github.com/yourusername/nextjs_cms](https://github.com/yourusername/nextjs_cms)
