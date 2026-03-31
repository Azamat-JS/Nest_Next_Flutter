'use client'

import { CardDemo } from '@/components/AuthForm'
import { useState } from 'react';

const LoginForm = () => {
    const [isLogin, setIsLogin] = useState(true);

    return (
        <div>
            <CardDemo isLogin={isLogin} id="login" toggle={() => setIsLogin(prev => !prev)} />
        </div>
    )
}

export default LoginForm