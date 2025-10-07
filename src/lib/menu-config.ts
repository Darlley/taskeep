import {
    CalendarDays,
    Globe,
    HandCoins,
    Home,
    Inbox,
    MapPin,
    Users,
    Kanban
} from "lucide-react"

export const adminMenuItems = [
    {
        title: "Dashboard",
        url: "/dashboard",
        icon: Home,
    },
    {
        title: "Pagamentos",
        url: "/dashboard/payments",
        icon: HandCoins,
    },
];

export const companyMenuItems = () => [
    {
        title: "Dashboard",
        url: `/dashboard`,
        icon: Home,
    },
    {
        title: "Teams",
        url: `/dashboard/teams`,
        icon: Users,
    },
    {
        title: "Projects",
        url: `/dashboard/projects`,
        icon: Kanban,
    },
    {
        title: "Criar convite",
        url: `/dashboard/invites`,
        icon: Inbox,
    },
    {
        title: "Gerenciar Endereços",
        url: `/dashboard/enderecos`,
        icon: MapPin,
    },
    {
        title: "Tarefas",
        url: `/dashboard/tarefas`,
        icon: CalendarDays,
    },
    {
        title: "Pagamentos",
        url: `/dashboard/pagamentos`,
        icon: HandCoins,
    },
    {
        title: "Website",
        url: `/dashboard/website`,
        icon: Globe,
    },
];
