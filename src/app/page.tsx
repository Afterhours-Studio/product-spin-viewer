import { RotateCw, ArrowRight, Settings } from 'lucide-react';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <div className="glass-card animate-fade-in p-8 text-center">
        <div className="mb-4 flex justify-center">
          <div className="rounded-full bg-[var(--accent-primary)]/20 p-4">
            <RotateCw className="h-10 w-10 text-[var(--accent-primary)]" />
          </div>
        </div>
        <h1 className="mb-2 text-2xl font-bold text-[var(--text-primary)]">
          360° Product Viewer
        </h1>
        <p className="mb-6 text-[var(--text-secondary)]">
          Interactive multi-angle product visualization
        </p>
        <div className="flex justify-center gap-3">
          <Link href="/demo/view" className="btn-primary flex items-center gap-2">
            Open Viewer
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link href="/demo/setup" className="btn-secondary flex items-center gap-2">
            <Settings className="h-4 w-4" />
            Setup
          </Link>
        </div>
      </div>
    </div>
  );
}
