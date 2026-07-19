"use client"

import { useState } from "react"
import { useSuspenseQuery } from "@tanstack/react-query"
import api from "@/lib/api"
import { Card, CardContent, CardHeader, CardTitle, CardAction } from "@/components/ui/card"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Users,
    UserPlus,
    BookOpen,
    GraduationCap,
    Presentation,
    AlertTriangle,
    CircleCheck,
    Banknote,
    Wallet,
    DoorOpen,
} from "lucide-react"
import { useTranslations } from "next-intl"
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    PieChart,
    Pie,
    Cell,
} from "recharts"
import { DashboardStats, PaymentsChart } from "@/lib/types/dashboard"
import RoomTimetable from "@/components/RoomTimetable"

const currentYear = new Date().getFullYear()
const years = [String(currentYear), String(currentYear - 1), String(currentYear - 2)]

const monthKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'] as const

const METHOD_COLORS = ["var(--viz-1)", "var(--viz-2)", "var(--viz-3)"]

const formatSum = (value: number) => `${value.toLocaleString()} so'm`
const formatCompact = (value: number) =>
    Intl.NumberFormat("en", { notation: "compact" }).format(value)

const tooltipStyle = {
    backgroundColor: "var(--popover)",
    border: "1px solid var(--border)",
    borderRadius: 8,
    color: "var(--popover-foreground)",
} as const

const DashboardComponent = () => {
    const t = useTranslations('DashboardComponent')
    const tMethods = useTranslations('Common.paymentMethods')
    const tMonths = useTranslations('Common.monthsShort')
    const tFullMonths = useTranslations('Common.months')
    const [year, setYear] = useState(String(currentYear))

    const { data: stats } = useSuspenseQuery<DashboardStats>({
        queryKey: ['dashboard-stats'],
        queryFn: async () => (await api.get('/dashboard/stats')).data,
        staleTime: 1000 * 60 * 5,
    })

    const { data: chart } = useSuspenseQuery<PaymentsChart>({
        queryKey: ['dashboard-payments-chart', year],
        queryFn: async () => (await api.get('/dashboard/payments-chart', { params: { year } })).data,
        staleTime: 1000 * 60 * 5,
    })

    const monthName = tFullMonths(monthKeys[stats.month - 1])

    const statCards = [
        { key: 'leads', value: stats.leads, icon: UserPlus, tint: 'text-sky-600 dark:text-sky-400 bg-sky-500/10' },
        { key: 'groups', value: stats.groups, icon: BookOpen, tint: 'text-violet-600 dark:text-violet-400 bg-violet-500/10' },
        { key: 'students', value: stats.students, icon: GraduationCap, tint: 'text-emerald-600 dark:text-emerald-400 bg-emerald-500/10' },
        { key: 'groupMemberships', value: stats.groupMemberships, icon: Users, tint: 'text-cyan-600 dark:text-cyan-400 bg-cyan-500/10' },
        { key: 'teachers', value: stats.teachers, icon: Presentation, tint: 'text-amber-600 dark:text-amber-400 bg-amber-500/10' },
        { key: 'rooms', value: stats.rooms, icon: DoorOpen, tint: 'text-indigo-600 dark:text-indigo-400 bg-indigo-500/10' },
        { key: 'debtors', value: stats.debtors, icon: AlertTriangle, tint: 'text-red-600 dark:text-red-400 bg-red-500/10', description: monthName },
        { key: 'paidCount', value: stats.paidCount, icon: CircleCheck, tint: 'text-green-600 dark:text-green-400 bg-green-500/10', description: monthName },
        { key: 'monthIncome', value: formatSum(stats.monthIncome), icon: Banknote, tint: 'text-lime-600 dark:text-lime-400 bg-lime-500/10', description: monthName },
        { key: 'averagePayment', value: formatSum(stats.averagePayment), icon: Wallet, tint: 'text-teal-600 dark:text-teal-400 bg-teal-500/10', description: monthName },
    ] as const

    const methodsWithTotal = chart.methods.filter((m) => m.total > 0)
    const methodsTotal = methodsWithTotal.reduce((sum, m) => sum + m.total, 0)
    const donutData = methodsWithTotal.map((m, i) => ({
        name: tMethods(m.method),
        value: m.total,
        color: METHOD_COLORS[chart.methods.findIndex(cm => cm.method === m.method) % METHOD_COLORS.length],
        share: methodsTotal > 0 ? Math.round((m.total / methodsTotal) * 100) : 0,
        index: i,
    }))

    const lineData = chart.monthly.map((m) => ({
        month: tMonths(monthKeys[m.month - 1]),
        total: m.total,
    }))

    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-2xl font-bold tracking-tight">{t('dashboard')}</h2>
                <p className="text-muted-foreground">{t('overview')}</p>
            </div>

            {/* Stat cards */}
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
                {statCards.map((stat) => (
                    <Card key={stat.key} size="sm" className="gap-2">
                        <CardContent className="flex items-center gap-3">
                            <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl ${stat.tint}`}>
                                <stat.icon className="h-5 w-5" />
                            </span>
                            <div className="min-w-0">
                                <div className="truncate text-xl font-bold" title={String(stat.value)}>{stat.value}</div>
                                <p className="truncate text-xs text-muted-foreground">
                                    {t(`stats.${stat.key}`)}
                                    {'description' in stat && stat.description ? ` · ${stat.description}` : ''}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts */}
            <div className="grid gap-4 lg:grid-cols-2">
                <Card size="sm">
                    <CardHeader>
                        <CardTitle>{t('paymentMethodsTitle')}</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {donutData.length === 0 ? (
                            <p className="flex h-64 items-center justify-center text-sm text-muted-foreground">{t('noPayments')}</p>
                        ) : (
                            <div className="flex flex-col items-center gap-4">
                                <div className="relative h-64 w-full">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <PieChart>
                                            <Pie
                                                data={donutData}
                                                dataKey="value"
                                                nameKey="name"
                                                innerRadius="62%"
                                                outerRadius="90%"
                                                paddingAngle={donutData.length > 1 ? 2 : 0}
                                                strokeWidth={0}
                                            >
                                                {donutData.map((entry) => (
                                                    <Cell key={entry.name} fill={entry.color} />
                                                ))}
                                            </Pie>
                                            <Tooltip
                                                formatter={(value) => formatSum(Number(value))}
                                                contentStyle={tooltipStyle}
                                                itemStyle={{ color: "var(--popover-foreground)" }}
                                            />
                                        </PieChart>
                                    </ResponsiveContainer>
                                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                                        <span className="text-lg font-bold">{formatCompact(methodsTotal)}</span>
                                        <span className="text-xs text-muted-foreground">{t('total')}</span>
                                    </div>
                                </div>
                                <div className="grid w-full gap-2 sm:grid-cols-2">
                                    {donutData.map((entry) => (
                                        <div key={entry.name} className="flex items-center justify-between rounded-lg border px-3 py-2">
                                            <span className="flex items-center gap-2 text-sm">
                                                <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
                                                {entry.name}
                                            </span>
                                            <span className="text-sm">
                                                <span className="font-semibold">{formatSum(entry.value)}</span>
                                                <span className="ml-2 text-muted-foreground">{entry.share}%</span>
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                <Card size="sm">
                    <CardHeader>
                        <CardTitle>{t('turnoverTitle', { year })}</CardTitle>
                        <CardAction>
                            <Select value={year} onValueChange={setYear}>
                                <SelectTrigger className="w-24">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {years.map((y) => (
                                        <SelectItem key={y} value={y}>{y}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </CardAction>
                    </CardHeader>
                    <CardContent>
                        <div className="h-80 w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={lineData} margin={{ top: 5, right: 16, left: 0, bottom: 5 }}>
                                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" vertical={false} />
                                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} />
                                    <YAxis tick={{ fontSize: 11, fill: "var(--muted-foreground)" }} tickLine={false} axisLine={false} tickFormatter={formatCompact} />
                                    <Tooltip
                                        formatter={(value) => [formatSum(Number(value)), t('income')]}
                                        contentStyle={tooltipStyle}
                                        itemStyle={{ color: "var(--popover-foreground)" }}
                                        labelStyle={{ color: "var(--muted-foreground)" }}
                                    />
                                    <Line
                                        type="monotone"
                                        dataKey="total"
                                        stroke="var(--viz-1)"
                                        strokeWidth={2}
                                        dot={false}
                                        activeDot={{ r: 4 }}
                                        name={t('income')}
                                    />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Room occupancy timetable */}
            <RoomTimetable />
        </div>
    )
}

export default DashboardComponent
