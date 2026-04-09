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
import { GroupDrawer } from "../Drawer"

const GroupComponent = () => {
    const token = useAuthStore((state) => state.token);
    const [groups, setGroups] = useState<GroupType[]>([]);
    const [teachers, setTeachers] = useState<TokenPayload[]>([]);
    const [students, setStudents] = useState<TokenPayload[]>([]);
    const [selectedTeacher, setSelectedTeacher] = useState<TokenPayload | null>(null);
    const API = process.env.NEXT_PUBLIC_API_URL;
    const [openUpdate, setOpenUpdate] = useState(false);
    const [openDelete, setOpenDelete] = useState(false);
    const [openCreate, setOpenCreate] = useState(false);
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

    const handleUpdateGroup = async (group: GroupType) => {
        try {
            const res = await axios.put(
                `${API}/group/${group.id}`,
                {
                    name: group.name,
                    teacherId: selectedTeacher!.id
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.status === 200) {
                toast.success('Group data updated!');
                setOpenUpdate(false);
                await getGroups();
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong');
        }
    };

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
            const res = await axios.get(`${API}/users/teachers`, { headers: { Authorization: `Bearer ${token}` } });
            setTeachers(res.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    }

    const getAllStudents = async () => {
        try {
            const res = await axios.get(`${API}/users/students`, { headers: { Authorization: `Bearer ${token}` } });
            setStudents(res.data);
        } catch (error: any) {
            toast.error(error.response?.data?.message ?? 'Something went wrong')
        }
    }

    useEffect(() => {
        if (openCreate && token) {
            getAllTeachers();
            getAllStudents();
        }
    }, [openCreate, token]);

    useEffect(() => {
        if (openUpdate && token) {
            getAllTeachers();
        }
    }, [openUpdate, token]);


    return (
        <div className="mt-5">
            <Table className="mt-5">
                <TableCaption>A list of all groups.</TableCaption>

                <TableHeader>
                    <TableRow>
                        <TableHead className="w-12 text-center text-lg font-bold">&#8470;</TableHead>
                        <TableHead className="w-48 text-center text-lg font-bold">Group Name</TableHead>
                        <TableHead className="w-72 text-center text-lg font-bold">Teacher Name</TableHead>
                        <TableHead className="w-24 text-start font-bold  text-lg">Actions</TableHead>
                    </TableRow>
                </TableHeader>

                <TableBody>
                    {groups.map((u, idx) => (
                        <TableRow key={u.id}>
                            <TableCell className="text-center">{idx + 1}</TableCell>
                            <TableCell className="text-center">{u.name}</TableCell>

                            <TableCell className="text-center">{u.teacher!.username}</TableCell>

                            <TableCell>
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Menu className="w-5 h-5" />
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
                            <Input id="name-1" name="name" onChange={(e) => setSelectedGroup(prev => prev ? { ...prev, name: e.target.value } : prev)} value={selectedGroup?.name || ""} />
                        </Field>
                        <Field>
                            <Label htmlFor="email-1">Teacher Name</Label>
                            <Select
                                value={selectedTeacher?.id || ""}
                                onValueChange={(val: string) => {
                                    const teacher = teachers.find(t => t.id === val) || null;
                                    setSelectedTeacher(teacher);
                                    setSelectedGroup(prev => prev ? { ...prev, teacher } : prev);

                                }}
                            >
                                <SelectTrigger className="w-full max-w-48">
                                    <SelectValue placeholder="Select a teacher" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectGroup>
                                        <SelectLabel>Select a new teacher</SelectLabel>
                                        {teachers.map(t => (
                                            <SelectItem key={t.id} value={t.id}>
                                                {t.username}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>
                        </Field>
                    </FieldGroup>
                    <DialogFooter>
                        <DialogClose>
                            Cancel
                        </DialogClose>
                        <Button type="submit" onClick={() => selectedGroup && handleUpdateGroup(selectedGroup)}>Update</Button>
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
            <div className="w-full flex justify-end p-5">

                <GroupDrawer openCreate={openCreate} setOpenCreate={setOpenCreate} teachers={teachers} students={students} onGroupCreated={getGroups} />
            </div>
        </div>

    )
}

export default GroupComponent;