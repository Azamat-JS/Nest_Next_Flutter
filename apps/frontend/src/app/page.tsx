'use client'

import { useAuthStore } from "@/lib/zustand";
import LoginForm from "./(auth)/login";
import HomePage from "./home/page";

export default function Home() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  if (isAuthenticated) {
    return (
      <HomePage />
    )
  } else {
    return (
      <main className="min-h-screen">
        <h1 className="text-4xl font-bold text-center mt-10">Welcome to the Full Stack Turbo App!</h1>
        <p className="text-center mt-4 text-lg">This is the frontend of your full stack application.</p>
        <div className="flex flex-col gap-2 justify-center mt-10">
          <h1 className="text-2xl text-blue-500 text-center">Full Stack Turbo</h1>
          <p className="text-center">Users</p>
        </div>
        <div className="flex justify-center min-h-[50vh] items-center">
          <LoginForm />
        </div>
      </main>
    )
  }
}

