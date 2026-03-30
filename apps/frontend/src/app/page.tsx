import { CardDemo } from "@/components/AuthForm";

export default function Home() {
  return (
    <main className="min-h-screen">
      <h1 className="text-4xl font-bold text-center mt-10">Welcome to the Full Stack Turbo App!</h1>
      <p className="text-center mt-4 text-lg">This is the frontend of your full stack application.</p>
      <div className="flex flex-col gap-2 justify-center mt-10">
        <h1 className="text-2xl text-blue-500 text-center">Full Stack Turbo</h1>
        <p className="text-center">Users</p>
      </div>
      <div className="flex justify-center min-h-[50vh] items-center">
        <CardDemo />
      </div>
    </main>
  );
}

