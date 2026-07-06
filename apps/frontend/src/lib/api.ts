import axios from 'axios'
import { useAuthStore } from './stores/authStore'

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
})

api.interceptors.request.use((config) => {
    const token = useAuthStore.getState().token
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

api.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            useAuthStore.getState().logout()
        }
        if (error.response?.status === 403 && error.response?.data?.code === 'PASSWORD_CHANGE_REQUIRED') {
            useAuthStore.getState().setMustChangePassword(true)
        }
        return Promise.reject(error)
    }
)

export default api
