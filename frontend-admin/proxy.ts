// proxy.ts 
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
    const token = request.cookies.get('access_token')?.value;
    const role = request.cookies.get('user_role')?.value;
    const { pathname } = request.nextUrl;


    console.log(`📡 [Proxy] Path: ${pathname} | Role: ${role} | Token: ${!!token}`);

    const isAdminPath = pathname.startsWith('/dashboard');
    const isTradingPath = pathname.startsWith('/trading');

    if (pathname.startsWith('/dashboard')) {
        // ถ้าไม่มี Token หรือ มีแต่ไม่ใช่ admin ให้ดีดออก
        if (!token) return NextResponse.redirect(new URL('/login', request.url));
        if (role !== 'admin') return NextResponse.redirect(new URL('/trading', request.url));
    }
    //1 [Security First] ถ้าไม่มี Token และพยายามเข้าหน้าที่ต้องล็อกอิน
    if (!token && (isAdminPath || isTradingPath)) {
        return NextResponse.redirect(new URL('/login', request.url));
    }

    //  [Login Guard] ถ้าล็อกอินอยู่แล้ว แต่จะกลับไปหน้า Login
    if (token && pathname === '/login') {
        const target = role === 'admin' ? '/dashboard' : '/trading';
        return NextResponse.redirect(new URL(target, request.url));
    }

    //  [RBAC Check] ป้องกันผู้ใช้ทั่วไปแอบเข้าหน้า Dashboard
    if (isAdminPath && role !== 'admin') {
        // หากเป็น Admin จริงแต่โดนดีด ให้เช็คค่า 'role' ใน Cookie ว่าสะกด admin ตัวเล็กตรงกันไหม
        return NextResponse.redirect(new URL('/trading', request.url));
    }

    
    return NextResponse.next();
}

export const config = {
    matcher: ['/dashboard/:path*', '/trading/:path*', '/login'],
};