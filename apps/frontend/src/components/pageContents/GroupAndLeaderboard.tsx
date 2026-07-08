"use client"

import { useSuspenseQuery } from "@tanstack/react-query"
import { Badge } from "../ui/badge"
import { GroupType } from "@/lib/types/groups"
import { useState } from "react"
import GroupDetailsComponent from "./GroupDetailsComponent"
import GroupLeaderBoard from "./GroupLeaderBoard"
import GroupHomeworks from "./GroupHomeworks"
import api from "@/lib/api"
import { Users, Trophy, NotebookPen } from "lucide-react"
import { Button } from "../ui/button"

type GroupTab = "students" | "leaderboard" | "homeworks"

const GroupAndLeaderboard = ({ groupId }: { groupId: string }) => {
    const [activeTab, setActiveTab] = useState<GroupTab>("students")

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
                    Teacher: {[group?.teacher?.firstName, group?.teacher?.lastName].filter(Boolean).join(' ')}
                </Badge>
                <div className="flex gap-2">
                    <Button
                        variant={activeTab === "students" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("students")}
                        className="gap-1"
                    >
                        <Users className="h-4 w-4" /> Students
                    </Button>
                    <Button
                        variant={activeTab === "leaderboard" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("leaderboard")}
                        className="gap-1"
                    >
                        <Trophy className="h-4 w-4" /> Leaderboard
                    </Button>
                    <Button
                        variant={activeTab === "homeworks" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveTab("homeworks")}
                        className="gap-1"
                    >
                        <NotebookPen className="h-4 w-4" /> Homeworks
                    </Button>
                </div>
            </div>

            {activeTab === "students" && <GroupDetailsComponent groupId={groupId} />}
            {activeTab === "leaderboard" && <GroupLeaderBoard groupId={groupId} />}
            {activeTab === "homeworks" && <GroupHomeworks groupId={groupId} />}
        </div>
    )
}

export default GroupAndLeaderboard
