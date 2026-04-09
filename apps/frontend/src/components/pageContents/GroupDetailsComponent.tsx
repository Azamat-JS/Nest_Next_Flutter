'use client'
import { useAuthStore } from '@/lib/stores/authStore';
import { GroupType } from '@/lib/types/groups';
import axios from 'axios';
import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TokenPayload } from '@/lib/types/token_payload';
import { Menu } from 'lucide-react';

const GroupDetailsComponent = ({ groupId }: { groupId: string }) => {
    const [group, setGroup] = useState<GroupType>();
    const [students, setStudents] = useState<TokenPayload[]>([])
    const token = useAuthStore((state) => state.token);
    const API = process.env.NEXT_PUBLIC_API_URL;


    const getOneGroup = async () => {
        try {
            const res = await axios.get(`${API}/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } })
            setGroup(res.data)
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong!')
        }
    }

    useEffect(() => {
        getOneGroup()
        if (group?.students.length) {
            setStudents(group.students);
        }
    }, [groupId, token])

    return (
        <div className='flex flex-col w-full'>
            <header className='flex justify-center text-center'>
                <h1 className='font-bold text-3xl text-center'>{group?.name}</h1>
                <h2 className='font-medium text-xl text-center'>{group?.teacher?.username}</h2>
            </header>
            <Table>
                <TableCaption>Students of the group.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-bold text-lg">&#8470;</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Name</TableHead>
                        <TableHead className="w-24 text-center font-bold text-lg">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((s) => (
                        <TableRow key={s.id}>
                            <TableCell className="font-medium">{s.username}</TableCell>
                            <TableCell>{s.email}</TableCell>
                            <TableCell><Menu className='h-5 w-5' /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">$2,500.00</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}

export default GroupDetailsComponent