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
import { Menu, LogOut, User, Settings } from "lucide-react"
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
                        <LogOut className="h-4 w-4" />
                        Logout
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="w-4 h-4" />
                        Profile
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="h-4 w-4" />
                        Settings
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
