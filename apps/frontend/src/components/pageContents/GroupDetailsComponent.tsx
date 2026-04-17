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
import { Badge } from '../ui/badge';

const GroupDetailsComponent = ({ groupId }: { groupId: string }) => {
    const [group, setGroup] = useState<GroupType>();
    const [students, setStudents] = useState<TokenPayload[]>([])
    const token = useAuthStore((state) => state.token);
    const API = process.env.NEXT_PUBLIC_API_URL;


    const getOneGroup = async () => {
        try {
            const res = await axios.get(`${API}/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } })
            setGroup(res.data)
            setStudents(res.data.students)
            console.log(res.data);
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
            <header className='flex items-center gap-6 justify-center text-center'>
                <Badge className='w-40 h-8 font-semibold text-lg'>{group?.name}</Badge> -
                <Badge className='w-40 h-8 text-lg' variant="outline">Teacher: {group?.teacher?.username}</Badge>
            </header>
            <Table>
                <TableCaption>Students of the group.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center font-bold text-lg">&#8470;</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Name</TableHead>
                        <TableHead className="w-48 text-center font-bold text-lg">Email</TableHead>
                        <TableHead className="w-24 text-start font-bold text-lg">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {students.map((s, idx) => (
                        <TableRow key={s.id}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center">{s.username}</TableCell>
                            <TableCell className="text-center">{s.email}</TableCell>
                            <TableCell className=''><Menu className='h-5 w-5' /></TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total: {students.length} students</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </div>
    )
}

export default GroupDetailsComponent