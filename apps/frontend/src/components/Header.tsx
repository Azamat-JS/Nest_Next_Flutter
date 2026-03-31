import Link from "next/link"
import { ModeToggle } from "./mode-toggle"

export const Header = () => {
    return (
        <div className="w-full h-16 flex items-center justify-between mt-5 px-10">
            <h1 className="text-2xl font-bold">My App</h1>
            <div className="flex gap-4 text-xl mr-5">
                <Link href="/home" className="hover:text-gray-400 cursor-pointer">Products</Link>
                <Link href="/about" className="hover:text-gray-400 cursor-pointer">About</Link>
                <Link href="/contact" className="hover:text-gray-400 cursor-pointer">Contact</Link>
                <Link href="/cart" className="hover:text-gray-400 cursor-pointer">Cart</Link>
            </div>
        </div>
    )
}

export default Header