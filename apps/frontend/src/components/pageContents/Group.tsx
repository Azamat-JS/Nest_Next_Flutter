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
import { useAuthStore } from "@/lib/stores/authStore"
import axios from "axios"
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
import { GroupType } from "@/lib/types/groups"
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { TokenPayload } from "@/lib/types/token_payload"

const GroupComponent = () => {
    const token = useAuthStore((state) => state.token);
    const [groups, setGroups] = useState<GroupType[]>([]);
    const [teachers, setTeachers] = useState<TokenPayload[]>([]);
    const API = process.env.NEXT_PUBLIC_API_URL;
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [selectedGroup, setSelectedGroup] = useState<GroupType | null>(null);


    const getGroups = async () => {
        try {
            const res = await axios.get(`${API}/group/all`, { headers: { Authorization: `Bearer ${token}` } })
            if (res.status === 200) {
                setGroups(res.data);
            }
        } catch (error: any) {
            toast.error(
                error.response?.data?.message ?? 'Something went wrong'
            );
        }
    };

    useEffect(() => {
        if (token) {
            getGroups();
        }
    }, [token]);

    const handleUpdateUser = async (group: GroupType) => {
        try {
            const res = await axios.put(`${API}/group/${group.id}`, group, { headers: { Authorization: `Bearer ${token}` } });
            console.log(group.id)
            if (res.status === 200) {
                toast.success('Group data updated!')
                setOpenUpdate(false);
                await getGroups();
            }
            return null;
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    }

    const handleDeleteGroup = async (groupId: string) => {
        try {
            const res = await axios.delete(`${API}/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } })
            if (res.status === 200) {
                toast.success('Group deleted successfully!')
                setOpenDelete(false);
                await getGroups();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    }

    const getAllTeachers = async () => {
        try {

        } catch (error) {

        }
    }

    return (
        <>
            <Table className="mt-5">
                <TableCaption>A list of all groups.</TableCaption>

                <TableHeader>
                    <TableRow>
                        <TableHead className="w-25">Group Name</TableHead>
                        <TableHead>Teacher Name</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {groups.map((u) => (
                        <TableRow key={u.id}>
                            <TableCell>{u.name}</TableCell>

                            <TableCell>{u.teacher.username}</TableCell>

                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Menu />
                                    </DropdownMenuTrigger>

                                    <DropdownMenuContent align="start">
                                        <DropdownMenuGroup>
                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setOpenUpdate(true);
                                                    setSelectedGroup(u);
                                                }}
                                            >
                                                <Edit /> Update
                                            </DropdownMenuItem>

                                            <DropdownMenuItem
                                                onClick={() => {
                                                    setOpenDelete(true);
                                                    setSelectedGroup(u);
                                                }}
                                                className="text-red-500"
                                            >
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
                        <TableCell colSpan={2}>Total</TableCell>
                        <TableCell className="text-right">{groups.length}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>

            {/* update group modal */}
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
                            <Label htmlFor="name-1">Group name</Label>
                            <Input id="name-1" name="name" onChange={(e) => setSelectedGroup(prev => prev ? { ...prev, name: e.target.value } : prev)} defaultValue={selectedGroup?.name || ""} value={selectedGroup?.name || ""} />
                        </Field>
                        <Field>
                            <Label htmlFor="email-1">Teacher Name</Label>
                            <Select>
                                <SelectTrigger className="w-full max-w-48">
                                    <SelectValue placeholder="Select a fruit" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Select a new teacher</SelectLabel>
                                        <SelectItem value="apple">Apple</SelectItem>
                                        <SelectItem value="banana">Banana</SelectItem>
                                        <SelectItem value="blueberry">Blueberry</SelectItem>
                                        <SelectItem value="grapes">Grapes</SelectItem>
                                        <SelectItem value="pineapple">Pineapple</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose>
                            Cancel
                        </DialogClose>
                        <Button type="submit" onClick={() => selectedGroup && handleUpdateUser(selectedGroup)}>Update</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* delete group modal */}
            <Dialog open={openDelete} onOpenChange={setOpenDelete}>
                <form>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Delete Group</DialogTitle>
                            <DialogDescription>
                                Are you sure to delete this group?
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <DialogClose >
                                Cancel
                            </DialogClose>
                            <Button type="submit" onClick={() => selectedGroup && handleDeleteGroup(selectedGroup.id)} variant="destructive">Delete</Button>
                        </DialogFooter>
                    </DialogContent>
                </form>
            </Dialog>

        </>

    )
}

export default GroupComponent;