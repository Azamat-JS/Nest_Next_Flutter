"use client"

import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuShortcut,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useAuthStore } from "@/lib/stores/authStore"
import { Menu } from "lucide-react"
import { useRouter } from "next/navigation"

export function DropdownMenuDemo() {
    const setToken = useAuthStore((state) => state.setToken);
    const router = useRouter();

    const handleLogout = () => {
        setToken(null);
        localStorage.setItem("token", "");
        router.push('/');
    }
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <button>
                    <Menu className="h-4 w-4" />
                </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-40" align="start">
                <DropdownMenuGroup>
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleLogout}>
                        Logout
                        <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                        Profile
                        <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        Settings
                        <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
