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
];
