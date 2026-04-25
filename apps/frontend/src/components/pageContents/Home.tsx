'use client'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { TokenPayload } from "@/lib/types/token_payload"
import { useAuthStore } from "@/lib/stores/authStore"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useState } from "react"
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
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Pagination,
    PaginationContent,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination"
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useRouter, useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient, useSuspenseQuery } from '@tanstack/react-query'
import { PaginationType } from "@/lib/types/groups"

const Home = () => {
    const token = useAuthStore((state) => state.token);
    const user = token ? jwtDecode<TokenPayload>(token) : null;
    const API = process.env.NEXT_PUBLIC_API_URL;
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedUser, setSelectedUser] = useState<TokenPayload | null>(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const queryClient = useQueryClient();
    const page = Number(searchParams.get('page') ?? 1);
    const limit = Number(searchParams.get('limit') ?? 10);

    const { data } = useSuspenseQuery({
        queryKey: ['users', page, limit],
        queryFn: async () => {
            const res = await axios.get(`${API}/users?page=${page}&limit=${limit}`, { headers: { Authorization: `Bearer ${token}` } })
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })

    const updateUserMutation = useMutation({
        mutationFn: async (user: TokenPayload) => {
            return await axios.put(`${API}/users/${user.id}`, user, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            toast.success('User data updated!');
            setOpenUpdate(false);
            queryClient.invalidateQueries({
                queryKey: ['users'],
            })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? 'Something went wrong');
        }
    })

    const deleteUserMutation = useMutation({
        mutationFn: async (userId: string) => {
            return await axios.delete(`${API}/users/${userId}`, { headers: { Authorization: `Bearer ${token}` } });
        },
        onSuccess: () => {
            toast.success('User deleted successfully!');
            setOpenDelete(false);
            queryClient.invalidateQueries({
                queryKey: ['users'],
            })
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message ?? "Something went wrong")
        }
    })

    const users: TokenPayload[] = data?.data ?? [];
    const meta: PaginationType = data?.meta ?? {}
    const lastPage = meta?.last_page ?? 1;

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
                                {(page - 1) * limit + idx + 1}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium text-center bg-green-300 text-green-600" : "text-center"}>
                                {u.username}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium text-center bg-green-300 text-green-600" : "text-center"}>
                                {u.email}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium text-center bg-green-300 text-green-600" : "text-center"}>
                                {u.role?.toLowerCase()}
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

            {/* pagination */}
            <div className="grid grid-cols-2 items-center mt-4">

                <div className="flex justify-center">
                    <Field orientation="horizontal" className="w-fit">
                        <FieldLabel htmlFor="select-rows-per-page">Rows per page</FieldLabel>
                        <Select value={String(limit)} onValueChange={(val) => {
                            const params = new URLSearchParams(searchParams.toString());
                            params.set('limit', val);
                            params.set('page', '1');
                            router.push(`?${params.toString()}`);
                        }}>
                            <SelectTrigger className="w-20" id="select-rows-per-page">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent align="start">
                                <SelectGroup>
                                    <SelectItem value="5" >5</SelectItem>
                                    <SelectItem value="10">10</SelectItem>
                                    <SelectItem value="15">15</SelectItem>
                                    <SelectItem value="20">20</SelectItem>
                                </SelectGroup>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>
                <div className="flex justify-end">
                    <Pagination>
                        <PaginationContent>
                            <PaginationItem>
                                <PaginationPrevious href={`?page=${Math.max(1, page - 1)}&limit=${limit}`} />
                            </PaginationItem>
                            {Array.from({ length: lastPage }).map((_, idx) => (
                                <PaginationItem key={idx}>
                                    <PaginationLink href={`?page=${idx + 1}&limit=${limit}`} isActive={page === idx + 1}>{idx + 1}</PaginationLink>
                                </PaginationItem>
                            )
                            )}

                            <PaginationItem>
                                <PaginationNext href={`?page=${Math.min(lastPage, page + 1)}&limit=${limit}`} />
                            </PaginationItem>
                        </PaginationContent>
                    </Pagination>
                </div>
            </div>

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
                            <Input id="username-1" name="role" onChange={(e) => setSelectedUser(prev => prev ? { ...prev, role: e.target.value } : prev)} value={selectedUser?.role?.toLowerCase() || ""} />
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose>
                            Cancel
                        </DialogClose>
                        <Button type="submit" onClick={() => selectedUser && updateUserMutation.mutate(selectedUser)}>Update</Button>
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
                            <Button type="submit" onClick={() => selectedUser && deleteUserMutation.mutate(selectedUser.id)} variant="destructive">Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>
        </div>

    )
}

export default Home