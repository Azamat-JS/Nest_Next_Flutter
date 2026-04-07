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
import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Edit, Menu, Trash } from "lucide-react"
import {
    Dialog,
    DialogClose,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const Home = () => {
    const token = useAuthStore((state) => state.token);
    const [users, setUsers] = useState<TokenPayload[]>([]);
    const user = token ? jwtDecode<TokenPayload>(token) : null;
    const API = process.env.NEXT_PUBLIC_API_URL;
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedUser, setSelectedUser] = useState<TokenPayload | null>(null);


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
    };

    useEffect(() => {

        if (token) {
            getUsers();
        }
    }, [token]);
    console.log(selectedUser)

    const handleUpdateUser = async (user: TokenPayload) => {
        try {
            const res = await axios.put(`${API}/users/${user.id}`, user, { headers: { Authorization: `Bearer ${token}` } });
            console.log(user.id)
            if (res.status === 200) {
                toast.success('User data updated!')
                setOpenUpdate(false);
                await getUsers();
            }
            return null;
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    }

    const handleDeleteUser = async (userId: string) => {
        try {
            const res = await axios.delete(`${API}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } })
            if (res.status === 200) {
                toast.success('User deleted successfully!')
                setOpenDelete(false);
                await getUsers();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    }
    return (
        <>
            <Table key={user?.id} className="mt-5">
                <TableCaption>A list of all users.</TableCaption>
                <TableHeader>
                    <TableRow key={user?.id}>
                        <TableHead className="w-25">Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody key={user?.email}>
                    {users.map((u) => (

                        <TableRow key={u.id}>
                            <TableCell className={user?.username === u.username ? "font-medium bg-green-300 text-green-600" : ""}>
                                {u.username}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium bg-green-300 text-green-600" : ""}>
                                {u.email}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium bg-green-300 text-green-600" : ""}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Button variant="outline">
                                            <Menu />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem onClick={() => { setOpenUpdate(true); setSelectedUser(u) }}>
                                                <Edit /> Update
                                            </DropdownMenuItem>
                                            <DropdownMenuItem onClick={() => { setOpenDelete(true); setSelectedUser(u) }} className="text-red-500">
                                                <Trash /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuGroup>
                                    </DropdownMenuContent>
                                </DropdownMenu>
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

            {/* update user modal */}
            <Dialog open={openUpdate} onOpenChange={setOpenUpdate}>
                <DialogContent className="sm:max-w-sm">
                    <DialogHeader>
                        <DialogTitle>Edit profile</DialogTitle>
                        <DialogDescription>
                            Make changes to your profile here. Click save when you&apos;re
                            done.
                        </DialogDescription>
                    </DialogHeader>
                    <FieldGroup>
                        <Field>
                            <Label htmlFor="name-1">Username</Label>
                            <Input id="name-1" name="name" onChange={(e) => setSelectedUser(prev => prev ? { ...prev, username: e.target.value } : prev)} defaultValue={selectedUser?.username || ""} value={selectedUser?.username || ""} />
                        </Field>
                        <Field>
                            <Label htmlFor="email-1">Email</Label>
                            <Input id="username-1" name="username" onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : prev)} value={selectedUser?.email} defaultValue={selectedUser?.email || ""} />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit" onClick={() => selectedUser && handleUpdateUser(selectedUser)}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* delete user modal */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <form>
                    <Button variant="outline"><Trash /> Delete</Button>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Delete profile</DialogTitle>
                            <DialogDescription>
                                Are you sure to delete this user?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose>
                                <Button variant="outline">Cancel</Button>
                            </DialogClose>
                            <Button type="submit" onClick={() => selectedUser && handleDeleteUser(selectedUser.id)} variant="destructive">Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>

        </>

    )
}

export default Home