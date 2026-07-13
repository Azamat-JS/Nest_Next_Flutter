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
import { useTranslations } from "next-intl"

export function DropdownMenuDemo() {
    const logout = useAuthStore((state) => state.logout);
    const router = useRouter();
    const t = useTranslations("AccountMenu");

    const handleLogout = () => {
        logout();
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
                    <DropdownMenuLabel>{t("myAccount")}</DropdownMenuLabel>
                    <DropdownMenuItem onClick={handleLogout}>
                        <LogOut className="h-4 w-4" />
                        {t("logout")}
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                        <User className="w-4 h-4" />
                        {t("profile")}
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                        <Settings className="h-4 w-4" />
                        {t("settings")}
                    </DropdownMenuItem>
                </DropdownMenuGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
