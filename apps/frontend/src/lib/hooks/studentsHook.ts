import axios from "axios";
import { useAuthStore } from "../stores/authStore";
import { useQuery } from '@tanstack/react-query';
const API = process.env.NEXT_PUBLIC_API_URL;

export const useStudents = () => {
    const token = useAuthStore(s => s.token);

    return useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await axios.get(`${API}/users/students`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return res.data;
        },
        staleTime: 1000 * 60 * 10,
    });
}