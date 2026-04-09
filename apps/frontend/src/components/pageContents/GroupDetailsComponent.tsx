'use client'
import { useAuthStore } from '@/lib/stores/authStore';
import { GroupType } from '@/lib/types/groups';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';

const GroupDetailsComponent = ({ groupId }: { groupId: string }) => {
    const [group, setGroup] = useState<GroupType>();
    const token = useAuthStore((state) => state.token);
    const API = process.env.NEXT_PUBLIC_API_URL;


    const getOneGroup = async () => {
        try {
            const res = await axios.get(`${API}/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } })
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong!')
        }
    }

    useEffect(() => {
        getOneGroup()
    }, [groupId, token])
    return (
        <div>

        </div>
    )
}

export default GroupDetailsComponent