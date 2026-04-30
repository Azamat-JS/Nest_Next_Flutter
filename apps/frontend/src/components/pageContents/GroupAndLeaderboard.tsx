"use client"

import { useSuspenseQuery } from "@tanstack/react-query";
import { Badge } from "../ui/badge"
import axios from "axios";
import { useAuthStore } from "@/lib/stores/authStore";
import { GroupType } from "@/lib/types/groups";
import { useState } from "react";
import GroupDetailsComponent from "./GroupDetailsComponent";
import GroupLeaderBoard from "./GroupLeaderBoard";


const GroupAndLeaderboard = ({ groupId }: { groupId: string }) => {
    const API = process.env.NEXT_PUBLIC_API_URL;
    const token = useAuthStore((state) => state.token);
    const [openLeaderBoard, setOpenLeaderBoard] = useState(false);


    const { data } = useSuspenseQuery({
        queryKey: ["group", groupId],
        queryFn: async () => {
            const res = await axios.get(`${API}/group/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
    })
    const group: GroupType = data;

    return (
        <div className='flex flex-col w-full'>
            <header className='flex items-center gap-6 justify-center text-center'>
                <Badge onClick={() => setOpenLeaderBoard(false)} className='w-40 h-8 hover:cursor-pointer font-semibold text-lg'>{group?.name}</Badge> -
                <Badge className='w-40 h-8 text-lg' variant="outline">Teacher: {group?.teacher?.username}</Badge>
                <Badge onClick={() => setOpenLeaderBoard(true)} className='w-40 h-8 hover:cursor-pointer text-lg'>LeaderBoard</Badge>
            </header>

            {!openLeaderBoard ? (<GroupDetailsComponent groupId={groupId} />) : (<GroupLeaderBoard groupId={groupId} />)}
        </div>
    )
}

export default GroupAndLeaderboard