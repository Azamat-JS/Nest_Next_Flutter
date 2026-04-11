'use client'

import Link from "next/link"
import { DropdownMenuDemo } from "./DropDownMenu"
import { usePathname } from "next/navigation"

const navLinks = [
    { name: 'Users', href: '/home' },
    { name: 'Groups', href: '/groups' },
    { name: 'Profile', href: '/profile' },
    { name: 'Cart', href: '/#' },
]

export const Header = () => {
    const pathname = usePathname();
    return (
        <div className="w-full h-16 flex items-center justify-between mt-5 px-10">
            <h1 className="text-2xl font-bold">Educational Center</h1>
            <div className="flex gap-4 text-xl mr-5">
                {navLinks.map((link) => {
                    const isActive = pathname === link.href;
                    return (
                        <Link key={link.name} href={link.href} className={`text-xl relative pb-1 transition-colors no-underline hover:text-blue-600 ${isActive ? 'text-blue-600' : 'text-black'}`}>
                            {link.name}
                            {isActive && (
                                <span className="absolute left-0 -bottom-1 h-0.5 w-full bg-blue-600" />
                            )}
                        </Link>
                    )
                })}
                <DropdownMenuDemo />
            </div>
        </div>
    )
}

export default Header