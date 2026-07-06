import axios from 'axios'
import { usePlatformAuthStore } from './stores/platformAuthStore'

const platformApi = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL,
})

platformApi.interceptors.request.use((config) => {
    const token = usePlatformAuthStore.getState().platformToken
    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }
    return config
})

platformApi.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            usePlatformAuthStore.getState().logout()
        }
        return Promise.reject(error)
    }
)

export default platformApi
