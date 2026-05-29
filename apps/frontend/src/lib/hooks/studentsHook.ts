import api from "../api"
import { useQuery } from '@tanstack/react-query'

export const useStudents = () => {
    return useQuery({
        queryKey: ['students'],
        queryFn: async () => {
            const res = await api.get('/users/students')
            return res.data
        },
        staleTime: 1000 * 60 * 10,
    })
}
