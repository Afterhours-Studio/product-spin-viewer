'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { RotateCw, Settings, Eye } from 'lucide-react';

const navItems = [
    { href: '/demo/view', label: 'Viewer', icon: Eye },
];

export function Header() {
    const pathname = usePathname();

    return (
        <header className="glass-card-sm sticky top-0 z-50 mx-4 mt-4 overflow-hidden">
            <nav className="flex h-14 items-center justify-between px-6">
                <Link
                    href="/"
                    className="flex items-center gap-2 text-lg font-semibold text-white transition-opacity hover:opacity-80"
                >
                    <RotateCw className="h-5 w-5 text-[var(--accent-primary)]" />
                    <span>Spin Viewer</span>
                </Link>
                <div className="flex items-center gap-2">
                    {navItems.map(item => {
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`btn-secondary flex items-center gap-2 text-sm ${pathname === item.href ? 'active' : ''}`}
                            >
                                <Icon className="h-4 w-4" />
                                {item.label}
                            </Link>
                        );
                    })}
                </div>
            </nav>
        </header>
    );
}
