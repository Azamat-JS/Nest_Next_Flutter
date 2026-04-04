'use client'

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
import { TokenPayload } from "@/lib/types/token_payload"
import { useAuthStore } from "@/lib/stores/authStore"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"
import { toast } from "sonner"

const HomePage = () => {
    const token = useAuthStore((state) => state.token);
    const [users, setUsers] = useState<TokenPayload[]>([]);
    const user = token ? jwtDecode<TokenPayload>(token) : null;
    const API = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const getUsers = async () => {
            try {
                const res = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
                if (res.status === 200) {
                    setUsers(res.data);
                }
            } catch (error: any) {
                toast.error(
                    error.response?.data?.message ?? 'Something went wrong'
                );
            }
        }

        if (token) {
            getUsers();
        }
    }, [token]);
    console.log(user);
    return (
        <>
            <Table key={user?.userId} className="mt-5">
                <TableCaption>A list of all users.</TableCaption>
                <TableHeader>
                    <TableRow key={user?.userId}>
                        <TableHead className="w-25">Username</TableHead>
                        <TableHead>Email</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody key={user?.email}>
                    {users.map((u) => (

                        <TableRow key={u.userId}>
                            <TableCell className={user?.username === u.username ? "font-medium bg-green-300 text-green-600" : ""}>
                                {u.username}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium bg-green-300 text-green-600" : ""}>
                                {u.email}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">{users.length}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </>

    )
}

export default HomePage