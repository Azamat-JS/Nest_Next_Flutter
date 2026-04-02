// import { useAuthStore } from '@/lib/zustand'
// import axios from 'axios'
// import { useState, useEffect } from 'react'

// const ProfilePage = () => {
//     const [profile, setProfile] = useState(null)
//     const [loading, setLoading] = useState(true)
//     const [error, setError] = useState(null)
//     const {token} = useAuthStore((state) => state.token);

//     if(!token) {
//         return <div>Please log in to view your profile.</div>
//     }
    
//     useEffect(() => {
//         const fetchProfile = async () => {
//             try {
//                 const res = await axios.get('/users/me', {
//                     headers: {
//                         Authorization: `Bearer ${token}`
//                     }
//                 })
//                 setProfile(res.data)
//             } catch (error) {
//                 setError(error || 'Failed to fetch profile')
//             } finally {
//                 setLoading(false)
//             }
//         }
//     }, [])

//   return (
//     <div>ProfilePage</div>
//   )
// }

// export default ProfilePage