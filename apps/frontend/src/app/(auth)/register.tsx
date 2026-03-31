'use client'

import { CardDemo } from "@/components/AuthForm"
import { useState } from "react";

const RegisterForm = () => {
    const [isLogin, setIsLogin] = useState(false);
    return (
        <div>
            <CardDemo isLogin={isLogin} id="register" toggle={() => setIsLogin(prev => !prev)} />
        </div>
    )
}

export default RegisterForm