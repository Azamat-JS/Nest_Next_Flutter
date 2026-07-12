'use client'

import dynamic from "next/dynamic";
import { useAuthStore } from "@/lib/stores/authStore";

const HomePage = dynamic(() => import("./(pages)/home/page"), { ssr: false });
const GroupsPage = dynamic(() => import("./(pages)/groups/page"), { ssr: false });

export default function Home() {
  const role = useAuthStore((state) => state.role)
  if (role === 'STUDENT') return <GroupsPage />
  return <HomePage />
}
