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
    DialogTrigger,
} from "@/components/ui/dialog"
import { Field, FieldGroup } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

const HomePage = () => {
    const token = useAuthStore((state) => state.token);
    const [users, setUsers] = useState<TokenPayload[]>([]);
    const user = token ? jwtDecode<TokenPayload>(token) : null;
    const API = process.env.NEXT_PUBLIC_API_URL;
    const [openUpdate, setOpenUpdate] = useState(false);
    const [selectedUser, setSelectedUser] = useState<TokenPayload | null>(null);

    useEffect(() => {
        const getUsers = async () => {
            try {
                const res = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
                if (res.status === 200) {
                    setUsers(res.data);
                }
                console.log(res.data)
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
    return (
        <>
            <Table key={user?.userId} className="mt-5">
                <TableCaption>A list of all users.</TableCaption>
                <TableHeader>
                    <TableRow key={user?.userId}>
                        <TableHead className="w-25">Username</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Actions</TableHead>
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
                                            <DropdownMenuItem className="text-red-500">
                                                <Dialog>
                                                    <form>
                                                        <DialogTrigger>
                                                            <Button variant="outline"><Trash /> Delete</Button>
                                                        </DialogTrigger>
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
                                                                <Button type="submit" variant="destructive">Delete</Button>
                                                            </DialogFooter>
                                                        </DialogContent>
                                                    </form>
                                                </Dialog>
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
                            <Input id="name-1" name="name" defaultValue={selectedUser?.username || ""} />
                        </Field>
                        <Field>
                            <Label htmlFor="email-1">Email</Label>
                            <Input id="username-1" name="username" defaultValue={selectedUser?.email || ""} />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose>
                            <Button variant="outline">Cancel</Button>
                        </DialogClose>
                        <Button type="submit">Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>

    )
}

export default HomePage