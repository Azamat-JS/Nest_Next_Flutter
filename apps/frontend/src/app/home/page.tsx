'use client'

import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableFooter,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { useAuthStore } from "@/lib/zustand"
import axios from "axios"
import { jwtDecode } from "jwt-decode"
import { useEffect, useState } from "react"
const invoices = [
    {
        invoice: "INV001",
        paymentStatus: "Paid",
        totalAmount: "$250.00",
        paymentMethod: "Credit Card",
    },
    {
        invoice: "INV002",
        paymentStatus: "Pending",
        totalAmount: "$150.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INV003",
        paymentStatus: "Unpaid",
        totalAmount: "$350.00",
        paymentMethod: "Bank Transfer",
    },
    {
        invoice: "INV004",
        paymentStatus: "Paid",
        totalAmount: "$450.00",
        paymentMethod: "Credit Card",
    },
    {
        invoice: "INV005",
        paymentStatus: "Paid",
        totalAmount: "$550.00",
        paymentMethod: "PayPal",
    },
    {
        invoice: "INV006",
        paymentStatus: "Pending",
        totalAmount: "$200.00",
        paymentMethod: "Bank Transfer",
    },
    {
        invoice: "INV007",
        paymentStatus: "Unpaid",
        totalAmount: "$300.00",
        paymentMethod: "Credit Card",
    },
]

type TokenPayload = {
    userId: string;
    email: string;
    username: string;
}

const HomePage = () => {
    const token = useAuthStore((state) => state.token);
    const [users, setUsers] = useState<TokenPayload[]>([]);
    const user = token ? jwtDecode<TokenPayload>(token) : null;
    const API = process.env.NEXT_PUBLIC_API_URL;

    useEffect(() => {
        const getUsers = async () => {
            try {
                const res = await axios.get(`${API}/users`, { headers: { Authorization: `Bearer ${token}` } })
                if (res.status === 200) {
                    setUsers(res.data);
                }
            } catch (error) {
                console.error("Error fetching users:", error);
            }
        }

        if (token) {
            getUsers();
        }
    }, [token]);
    console.log(user);
    return (
        <>
            <Table className="mt-5">
                <TableCaption>A list of all users.</TableCaption>
                <TableHeader>
                    <TableRow>
                        <TableHead className="w-25">Username</TableHead>
                        <TableHead>Email</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {users.map((u) => (

                        <TableRow key={u.userId}>
                            <TableCell className={user?.username === u.username ? "font-medium bg-green-300 text-green-600" : ""}>
                                {u.username}
                            </TableCell>
                            <TableCell className={user?.username === u.username ? "font-medium bg-green-300 text-green-600" : ""}>
                                {u.email}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
                <TableFooter>
                    <TableRow>
                        <TableCell colSpan={3}>Total</TableCell>
                        <TableCell className="text-right">{users.length}</TableCell>
                    </TableRow>
                </TableFooter>
            </Table>
        </>

    )
}

export default HomePage