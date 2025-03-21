import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '../../../../prisma/client';

export async function POST(request: Request) {
  try {
    console.log('회원가입 API 호출됨');
    const body = await request.json();
    const { name, email, password } = body;
    console.log('회원가입 요청 정보:', { name, email, hasPassword: !!password });

    // 유효성 검사
    if (!name || !email || !password) {
      console.log('회원가입 실패: 필수 정보 누락');
      return NextResponse.json(
        { message: '이름, 이메일 및 비밀번호는 필수입니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 확인
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      console.log('회원가입 실패: 잘못된 이메일 형식');
      return NextResponse.json(
        { message: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 복잡성 확인
    if (password.length < 8) {
      console.log('회원가입 실패: 비밀번호 길이 부족');
      return NextResponse.json(
        { message: '비밀번호는 최소 8자 이상이어야 합니다.' },
        { status: 400 }
      );
    }

    // 이메일 중복 확인
    console.log('사용자 중복 확인 중:', email);
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      console.log('회원가입 실패: 이메일 중복');
      return NextResponse.json(
        { message: '이미 등록된 이메일 주소입니다.' },
        { status: 409 }
      );
    }

    // 비밀번호 해싱
    console.log('비밀번호 해싱 중...');
    const hashedPassword = await hash(password, 10);

    // 사용자 생성
    console.log('사용자 생성 중...');
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: 'USER', // 기본 역할
      },
    });

    console.log('회원가입 성공:', user.email);
    // 응답에서 비밀번호는 제외
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      {
        message: '회원가입이 완료되었습니다.',
        user: userWithoutPassword,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('회원가입 처리 중 오류 발생:', error);
    return NextResponse.json(
      { message: '회원가입 처리 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 