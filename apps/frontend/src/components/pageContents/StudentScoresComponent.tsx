"use client"

import { useAuthStore } from "@/lib/stores/authStore";
import { useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
import axios from "axios";

const StudentScoresComponent = ({ groupId, studentId }: { groupId: string, studentId: string }) => {
    const token = useAuthStore((state) => state.token);
    const queryClient = useQueryClient();
    const API = process.env.NEXT_PUBLIC_API_URL;


    const { data: studentScores } = useSuspenseQuery({
        queryKey: ["studentScores", studentId, groupId],
        queryFn: async () => {
            const res = await axios.get(`${API}/student-score/one-student/${studentId}/${groupId}`, { headers: { Authorization: `Bearer ${token}` } });
            return res.data;
        },
    })

    console.log(studentScores)
    return (
        <div>StudentScoresComponent</div>
    )
}

export default StudentScoresComponent