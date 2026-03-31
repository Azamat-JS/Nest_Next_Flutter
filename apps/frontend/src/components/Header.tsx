import { ModeToggle } from "./mode-toggle"

export const Header = () => {
    return (
        <div className="w-full h-16 flex items-center justify-between mt-5 px-10">
            <h1 className="text-2xl font-bold">My App</h1>
            <div className="flex gap-4 text-xl mr-5">
                <p className="hover:text-gray-400 cursor-pointer">Products</p>
                <p className="hover:text-gray-400 cursor-pointer">About</p>
                <p className="hover:text-gray-400 cursor-pointer">Contact</p>
                <p className="hover:text-gray-400 cursor-pointer">Cart</p>
            </div>
        </div>
    )
}

export default Header