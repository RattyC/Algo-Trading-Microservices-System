// middleware.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const role = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;

    //  ถ้าพยายามเข้าหน้า Login ทั้งที่มี Token แล้ว ให้ดีดไปหน้าตามสิทธิ์
    if (pathname === '/login' && token) {
        return NextResponse.redirect(new URL(role === 'admin' ? '/dashboard' : '/trading', request.url));
    }

    // ถ้าไม่มี Token และไม่ใช่หน้า Login ให้ดีดกลับหน้า Login
    if (!token && pathname !== '/login') {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // ป้องกัน User ธรรมดาแอบเข้าหน้า Dashboard (Admin Only)
    if (pathname.startsWith('/dashboard') && role !== 'admin') {
        return NextResponse.redirect(new URL('/trading', request.url));
    }

    return NextResponse.next();
}


export const config = {
    matcher: [
        '/dashboard/:path*',
        '/trading/:path*',
        '/login'
    ],
};