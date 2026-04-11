'use client'

import { TokenPayload } from '@/lib/types/token_payload'
import { useAuthStore } from '@/lib/stores/authStore'
import axios from 'axios'
import { useState, useEffect } from 'react'
import { toast } from 'sonner'

const Profile = () => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const token = useAuthStore((state) => state.token);
    const [user, setUser] = useState<TokenPayload | null>(null);

    useEffect(() => {
        if (!token) {
            return
        }
        const fetchProfile = async () => {
            try {
                const res = await axios.get(`${API}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setUser(res.data)
            } catch (error: any) {
                console.error('Error fetching profile:', error)
                toast.error(
                    error.response?.data?.message ?? 'Something went wrong'
                );
            }
        }
        fetchProfile();
    }, [token, API]);

    if (!token) {
        return <div>Please log in to view your profile.</div>
    }
    return (
        <div className='flex min-h-screen justify-center text-center'>
            {user ? (
                <div>
                    <h1 className='text-2xl font-bold mb-4'>Profile</h1>
                    <p><strong>Username:</strong> {user.username}</p>
                    <p><strong>Email:</strong> {user.email}</p>
                </div>
            ) : (
                <p>User not found.</p>
            )}
        </div>
    )
}

export default Profile