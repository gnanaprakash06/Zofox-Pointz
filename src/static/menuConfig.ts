import {
    LayoutDashboard,
    Building2,
    Users,
    CreditCard,
    Gift,
    Image,
    Network,
    UserPlus,
    Briefcase,
} from "lucide-react";

const menuItems = [
    {
        title: "Dashboard",
        url: "/",
        icon: LayoutDashboard,
    },
    {
        title: "Company & Admin",
        url: "/company",
        icon: Building2,
    },
    {
        title: "Employees",
        url: "/employees",
        icon: Users,
    },
    {
        title: "Subscriptions",
        url: "/subscriptions",
        icon: CreditCard,
    },
    {
        title: "Offers",
        url: "/offers",
        icon: Gift,
    },
    {
        title: "Banners",
        url: "/banners",
        icon: Image,
    },
    {
        title: "Channel Partners",
        url: "/channel",
        icon: Network,
    },
    {
        title: "Referral Partners",
        url: "/referral-partners",
        icon: UserPlus,
    },
    {
        title: "Industry Categories",
        url: "/industry-categories",
        icon: Briefcase,
    },
];

export default menuItems;