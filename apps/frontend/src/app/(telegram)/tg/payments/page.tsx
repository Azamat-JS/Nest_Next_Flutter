"use client"

import { useQuery } from "@tanstack/react-query"
import { Loader2, Wallet } from "lucide-react"
import { useTranslations } from "next-intl"
import api from "@/lib/api"
import { PortalBootstrap, PortalPayment } from "@/lib/types/portal"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

const formatAmount = (amount: string) =>
    `${Number(amount).toLocaleString()} so'm`

export default function TgPaymentsPage() {
    const t = useTranslations('TgPayments')
    const tMonths = useTranslations('Common.months')
    const monthKey = (m: number) => String(m) as Parameters<typeof tMonths>[0]
    const { data: bootstrap } = useQuery({
        queryKey: ['tg-bootstrap'],
        queryFn: async () => (await api.get<PortalBootstrap>('/portal/bootstrap')).data,
    })

    const { data, isPending, isError } = useQuery({
        queryKey: ['tg-payments'],
        queryFn: async () => (await api.get('/portal/payments', { params: { limit: 50 } })).data,
    })

    if (isPending) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        )
    }

    if (isError) {
        return <p className="py-16 text-center text-sm text-muted-foreground">{t('loadError')}</p>
    }

    const payments: PortalPayment[] = data?.data ?? []
    // Both roles see payments across multiple students, so the student name
    // is needed to tell rows apart; a student only ever sees their own.
    const showStudentName = bootstrap?.role === 'PARENT' || bootstrap?.role === 'ADMIN'

    return (
        <div className="space-y-3 py-4">
            <h1 className="flex items-center gap-2 text-xl font-bold">
                <Wallet className="h-5 w-5 text-primary" />
                {t('title')}
            </h1>
            {payments.map((payment) => (
                <Card key={payment.id}>
                    <CardContent className="flex items-center justify-between py-4">
                        <div>
                            <p className="font-medium">{tMonths(monthKey(payment.month))} {payment.year}</p>
                            <p className="text-sm text-muted-foreground">
                                {showStudentName && <>{payment.student.firstName} {payment.student.lastName ?? ''} · </>}
                                {payment.group.name}
                            </p>
                            {payment.comment && <p className="text-xs text-muted-foreground">{payment.comment}</p>}
                        </div>
                        <Badge className="text-sm">{formatAmount(payment.amount)}</Badge>
                    </CardContent>
                </Card>
            ))}
            {payments.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">{t('noPayments')}</p>
            )}
        </div>
    )
}
