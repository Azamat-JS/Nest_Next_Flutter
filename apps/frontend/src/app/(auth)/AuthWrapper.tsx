// app/(auth)/AuthWrapper.tsx (client)
'use client';

import { useAuthStore } from '@/lib/stores/authStore';
import LoginForm from './login';
import dynamic from 'next/dynamic';
const HomePage = dynamic(() => import('../(pages)/home/page'), { ssr: false });

export default function AuthWrapper() {
    const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

    if (isAuthenticated) return <HomePage />;

    return (
        <div className="flex flex-col items-center justify-center min-h-screen">
            <h1 className="text-4xl font-bold text-center mt-10">Welcome to Full Stack Turbo App!</h1>
            <p className="text-center mt-4 text-lg">
                This is the frontend of your full stack application.
            </p>
            <div className="flex justify-center min-h-[50vh] items-center w-full">
                <LoginForm />
            </div>
        </div>
    );
}