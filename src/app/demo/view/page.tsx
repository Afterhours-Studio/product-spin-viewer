'use client';

import { useState, useEffect } from 'react';
import { ModelFileSidebar } from '@/components/ModelFileSidebar';
import { ModelViewer } from '@/components/ModelViewer';
import { ConfigPanel } from '@/components/ConfigPanel';

export default function DemoViewPage() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) {
        return (
            <div className="flex flex-1 items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-[var(--accent-primary)] border-t-transparent" />
            </div>
        );
    }

    return (
        <div className="flex flex-1 h-screen min-h-0 overflow-hidden">
            {/* Left Sidebar - File List */}
            <ModelFileSidebar />

            {/* Center - 3D Viewer */}
            <div className="flex-1 min-w-0 relative">
                <ModelViewer />
            </div>

            {/* Right Sidebar - Config */}
            <ConfigPanel />
        </div>
    );
}
