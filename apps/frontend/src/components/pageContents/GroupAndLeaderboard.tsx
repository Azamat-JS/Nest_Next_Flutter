"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { Badge } from "../ui/badge"
import { GroupType } from "@/lib/types/groups"
import { useState } from "react"
import GroupDetailsComponent from "./GroupDetailsComponent"
import GroupLeaderBoard from "./GroupLeaderBoard"
import api from "@/lib/api"
import { Users, Trophy } from "lucide-react"
import { Button } from "../ui/button"

const GroupAndLeaderboard = ({ groupId }: { groupId: string }) => {
    const [openLeaderBoard, setOpenLeaderBoard] = useState(false)

    const { data } = useSuspenseQuery({
        queryKey: ["group", groupId],
        queryFn: async () => {
            const res = await api.get(`/group/${groupId}`)
            return res.data
        },
        staleTime: 1000 * 60 * 5,
    })
    const group: GroupType = data

    return (
        <div className="flex flex-col w-full gap-4">
            <div className="flex items-center justify-center gap-3 flex-wrap">
                <Badge variant="default" className="px-4 py-1.5 text-sm font-semibold">
                    {group?.name}
                </Badge>
                <Badge variant="outline" className="px-4 py-1.5 text-sm">
                    Teacher: {group?.teacher?.username}
                </Badge>
                <div className="flex gap-2">
                    <Button
                        variant={!openLeaderBoard ? "default" : "outline"}
                        size="sm"
                        onClick={() => setOpenLeaderBoard(false)}
                        className="gap-1"
                    >
                        <Users className="h-4 w-4" /> Students
                    </Button>
                    <Button
                        variant={openLeaderBoard ? "default" : "outline"}
                        size="sm"
                        onClick={() => setOpenLeaderBoard(true)}
                        className="gap-1"
                    >
                        <Trophy className="h-4 w-4" /> Leaderboard
                    </Button>
                </div>
            </div>

            {!openLeaderBoard
                ? <GroupDetailsComponent groupId={groupId} />
                : <GroupLeaderBoard groupId={groupId} />
            }
        </div>
    )
}

export default GroupAndLeaderboard
