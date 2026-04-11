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

    const handleUpdateUser = async (user: TokenPayload) => {
        try {
            const res = await axios.put(`${API}/users/${user.id}`, user, { headers: { Authorization: `Bearer ${token}` } });
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
        <div className="mt-5">
            <Table key={user?.id} className="table-fixed">
                <TableCaption>A list of all users.</TableCaption>
                <TableHeader>
                    <TableRow key={user?.id}>
                        <TableHead className="w-12 text-center text-lg font-bold">&#8470;</TableHead>
                        <TableHead className="w-48 text-center text-lg font-bold">Username</TableHead>
                        <TableHead className="w-72 text-center text-lg font-bold">Email</TableHead>
                        <TableHead className="w-72 text-center text-lg font-bold">Role</TableHead>
                        <TableHead className="w-24 text-center text-lg font-bold">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody key={user?.email}>
                    {users.map((u, idx) => (
                        <TableRow key={u.id}>
                            <TableCell className={user?.username === u.username ? "font-medium text-center bg-green-300 text-green-600" : "text-center"}>
                                {idx + 1}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium text-center bg-green-300 text-green-600" : "text-center"}>
                                {u.username}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium text-center bg-green-300 text-green-600" : "text-center"}>
                                {u.email}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium text-center bg-green-300 text-green-600" : "text-center"}>
                                {u.role}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium text-center bg-green-300 text-green-600" : "text-center"}>
                                <DropdownMenu>
                                    <DropdownMenuTrigger>
                                        <Menu className="h-5 w-5" />
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
                            <Input id="name-1" name="name" onChange={(e) => setSelectedUser(prev => prev ? { ...prev, username: e.target.value } : prev)} value={selectedUser?.username || ""} />
                        </Field>
                        <Field>
                            <Label htmlFor="email-1">Email</Label>
                            <Input id="username-1" name="email" onChange={(e) => setSelectedUser(prev => prev ? { ...prev, email: e.target.value } : prev)} value={selectedUser?.email} />
                        </Field>
                        <Field>
                            <Label htmlFor="role-1">Role</Label>
                            <Input id="username-1" name="role" onChange={(e) => setSelectedUser(prev => prev ? { ...prev, role: e.target.value } : prev)} value={selectedUser?.role || ""} />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose>
                            Cancel
                        </DialogClose>
                        <Button type="submit" onClick={() => selectedUser && handleUpdateUser(selectedUser)}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* delete user modal */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <form>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Delete profile</DialogTitle>
                            <DialogDescription>
                                Are you sure to delete this user?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose>
                                Cancel
                            </DialogClose>
                            <Button type="submit" onClick={() => selectedUser && handleDeleteUser(selectedUser.id)} variant="destructive">Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
        </div>

    )
}

export default Home