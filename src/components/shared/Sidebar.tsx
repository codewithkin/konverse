"use client";

import {
    Home,
    Package2,
    Phone,
    ShoppingCart,
    Settings,
    ChevronLeft,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    Tooltip,
    TooltipContent,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { useState } from "react";

export function Sidebar() {
    const pathname = usePathname();
    const [isCollapsed, setIsCollapsed] = useState(false);

    const navItems = [
        {
            id: "dashboard",
            label: "Dashboard",
            icon: Home,
            href: "/dashboard",
        },
        {
            id: "products",
            label: "Products",
            icon: Package2,
            href: "/products",
        },
        {
            id: "simulator",
            label: "Chat Simulator",
            icon: Phone,
            href: "/simulator",
        },
        {
            id: "orders",
            label: "Orders",
            icon: ShoppingCart,
            href: "/orders",
        },
        {
            id: "settings",
            label: "Settings",
            icon: Settings,
            href: "/settings",
        },
    ];

    return (
        <div
            className={cn(
                "relative h-screen border-r bg-muted/40 transition-all duration-300 ease-in-out",
                isCollapsed ? "w-16" : "w-64"
            )}
        >
            {/* Collapse Button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute -right-3 top-6 rounded-full border bg-background"
                onClick={() => setIsCollapsed(!isCollapsed)}
            >
                <ChevronLeft
                    className={cn(
                        "h-4 w-4 transition-transform",
                        isCollapsed && "rotate-180"
                    )}
                />
                <span className="sr-only">Toggle sidebar</span>
            </Button>

            {/* Sidebar Content */}
            <div className="flex h-full flex-col gap-4 p-2">
                {/* Logo */}
                <div className="flex h-14 items-center px-4">
                    <Link
                        href="/"
                        target="_blank"
                        className="flex items-center gap-2 font-semibold"
                    >
                        <span className={cn(isCollapsed ? "hidden" : "inline")}>
                            Konverse
                        </span>
                    </Link>
                </div>

                {/* Navigation */}
                <nav className="grid gap-1 px-2">
                    {navItems.map((item) => {
                        const isActive = pathname.startsWith(item.href);
                        const Icon = item.icon;

                        return isCollapsed ? (
                            <Tooltip key={item.id} delayDuration={0}>
                                <TooltipTrigger asChild>
                                    <Link
                                        target="_blank"
                                        href={item.href}
                                        className={cn(
                                            "mx-auto flex h-9 w-9 items-center justify-center rounded-lg transition-colors",
                                            isActive
                                                ? "bg-primary text-primary-foreground"
                                                : "text-muted-foreground hover:bg-muted"
                                        )}
                                    >
                                        <Icon className="h-5 w-5" />
                                        <span className="sr-only">{item.label}</span>
                                    </Link>
                                </TooltipTrigger>
                                <TooltipContent side="right">{item.label}</TooltipContent>
                            </Tooltip>
                        ) : (
                            <Link
                                key={item.id}
                                href={item.href}
                                target="_blank"
                                className={cn(
                                    "flex items-center gap-3 rounded-lg px-3 py-2 transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "text-muted-foreground hover:bg-muted"
                                )}
                            >
                                <Icon className="h-5 w-5" />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
            </div>
        </div>
    );
}