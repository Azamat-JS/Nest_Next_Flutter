'use client'

import { TokenPayload } from '@/lib/types/token_payload'
import { useAuthStore } from '@/lib/stores/authStore'
import axios from 'axios'
import { useState, useEffect } from 'react'

const ProfilePage = () => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const token = useAuthStore((state) => state.token);
    const [user, setUser] = useState<TokenPayload | null>(null);

    useEffect(() => {
        if (!token) {
            setLoading(false)
            return
        }
        const fetchProfile = async () => {
            setLoading(true)
            setError(null)
            try {
                const res = await axios.get(`${API}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setUser(res.data)
            } catch (error) {
                console.error('Error fetching profile:', error)
                setError(error instanceof Error ? error.message : 'An error occurred')
            } finally {
                setLoading(false)
            }
        }
        fetchProfile();
    }, [token, API]);

    if (!token) {
        return <div>Please log in to view your profile.</div>
    }
    console.log(user)
    return (
        <div className='flex min-h-screen justify-center text-center'>
            {loading ? (
                <p>Loading...</p>
            ) : error ? (
                <p className='text-red-500'>{error}</p>
            ) : user ? (
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

export default ProfilePage