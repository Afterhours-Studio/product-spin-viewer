'use client';

import { Zap, Move3D, RotateCw, Maximize, Settings, Palette } from 'lucide-react';
import { HexColorPicker } from 'react-colorful';
import { useModelStore } from '@/stores/modelStore';
import { useState } from 'react';

export function ConfigPanel() {
    const { files, selectedFileId, setConfig, setTransform } = useModelStore();
    const selectedFile = files.find((f) => f.id === selectedFileId);
    const config = selectedFile?.config;
    const [showColorPicker, setShowColorPicker] = useState(false);

    if (!config) {
        return (
            <div className="w-72 shrink-0 flex flex-col h-screen bg-[var(--bg-secondary)] backdrop-blur-xl border-l border-white/10">
                <div className="flex items-center justify-center h-full text-[var(--text-muted)]">
                    No file selected
                </div>
            </div>
        );
    }

    const { autoRotate, rotateSpeed, transform, backgroundColor } = config;

    return (
        <div className="w-72 shrink-0 flex flex-col h-screen bg-[var(--bg-secondary)] backdrop-blur-xl border-l border-white/10">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                <div className="p-2 rounded-lg bg-[var(--accent-primary)]/20">
                    <Settings className="h-4 w-4 text-[var(--accent-primary)]" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">Settings</h2>
                    <p className="text-[10px] text-[var(--text-muted)] truncate max-w-[180px]">{selectedFile?.name}</p>
                </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-6">
                {/* Background Color Section */}
                <div className="glass-card-sm p-4 rounded-xl space-y-4">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        <Palette className="h-3.5 w-3.5" />
                        Background
                    </label>

                    <div className="space-y-3">
                        <div
                            onClick={() => setShowColorPicker(!showColorPicker)}
                            className="flex items-center gap-3 cursor-pointer group"
                        >
                            <div
                                className="w-10 h-10 rounded-lg border-2 border-white/20 group-hover:border-white/40 transition-colors shadow-lg"
                                style={{ backgroundColor }}
                            />
                            <div className="flex-1">
                                <span className="text-sm text-[var(--text-secondary)]">Color</span>
                                <p className="text-xs font-mono text-[var(--text-muted)]">{backgroundColor}</p>
                            </div>
                        </div>

                        {showColorPicker && (
                            <div className="color-picker-wrapper">
                                <HexColorPicker
                                    color={backgroundColor}
                                    onChange={(color) => setConfig({ backgroundColor: color })}
                                />
                            </div>
                        )}
                    </div>
                </div>

                {/* Playback Section */}
                <div className="glass-card-sm p-4 rounded-xl space-y-4">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        <RotateCw className="h-3.5 w-3.5" />
                        Playback
                    </label>

                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={() => setConfig({ autoRotate: !autoRotate })}
                            className={`relative w-10 h-5 rounded-full transition-colors ${autoRotate ? 'bg-[var(--accent-primary)]' : 'bg-white/20'
                                }`}
                        >
                            <span
                                className={`absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full transition-transform shadow-md ${autoRotate ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                            />
                        </button>
                        <span className="text-sm text-[var(--text-secondary)]">Auto-rotate</span>
                    </div>

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-[var(--text-secondary)]">Speed</span>
                            <span className="text-xs font-mono font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded">{rotateSpeed.toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            min={0.5}
                            max={10}
                            step={0.5}
                            value={rotateSpeed}
                            onChange={(e) => setConfig({ rotateSpeed: Number(e.target.value) })}
                            className="w-full"
                        />
                    </div>
                </div>

                {/* Transform Section */}
                <div className="glass-card-sm p-4 rounded-xl space-y-4">
                    <label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">
                        <Move3D className="h-3.5 w-3.5" />
                        Transform
                    </label>

                    <Vector3Input
                        label="Position"
                        value={transform.position}
                        onChange={(position) => setTransform({ position })}
                        step={0.1}
                    />

                    <Vector3Input
                        label="Rotation (°)"
                        value={transform.rotation}
                        onChange={(rotation) => setTransform({ rotation })}
                        step={5}
                    />

                    <div>
                        <div className="mb-2 flex items-center justify-between">
                            <span className="text-xs text-[var(--text-secondary)] flex items-center gap-1.5">
                                <Maximize className="h-3 w-3" />
                                Scale
                            </span>
                            <span className="text-xs font-mono font-medium text-[var(--accent-primary)] bg-[var(--accent-primary)]/10 px-2 py-0.5 rounded">{transform.scale.toFixed(1)}</span>
                        </div>
                        <input
                            type="range"
                            min={0.1}
                            max={10}
                            step={0.1}
                            value={transform.scale}
                            onChange={(e) => setTransform({ scale: Number(e.target.value) })}
                            className="w-full"
                        />
                    </div>
                </div>
            </div>
        </div>
    );
}

function Vector3Input({
    label,
    value,
    onChange,
    step = 0.1,
}: {
    label: string;
    value: [number, number, number];
    onChange: (value: [number, number, number]) => void;
    step?: number;
}) {
    const labels = ['X', 'Y', 'Z'];
    const colors = ['bg-red-500/20 text-red-400', 'bg-green-500/20 text-green-400', 'bg-blue-500/20 text-blue-400'];

    const handleChange = (index: number, inputValue: string) => {
        // Allow empty, minus sign, or valid numbers (including negatives and decimals)
        if (inputValue === '' || inputValue === '-' || inputValue === '-.') {
            return; // Don't update yet, user is still typing
        }

        const parsed = parseFloat(inputValue);
        if (!isNaN(parsed)) {
            const newValue = [...value] as [number, number, number];
            newValue[index] = parsed;
            onChange(newValue);
        }
    };

    return (
        <div>
            <div className="mb-2 text-xs text-[var(--text-secondary)]">{label}</div>
            <div className="grid grid-cols-3 gap-2">
                {value.map((v, i) => (
                    <div key={i} className="relative">
                        <span className={`absolute left-0 top-0 bottom-0 w-6 flex items-center justify-center text-[10px] font-bold rounded-l-lg ${colors[i]}`}>
                            {labels[i]}
                        </span>
                        <input
                            type="text"
                            inputMode="decimal"
                            defaultValue={v}
                            key={`${label}-${i}-${v}`}
                            onBlur={(e) => handleChange(i, e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    handleChange(i, e.currentTarget.value);
                                    e.currentTarget.blur();
                                }
                            }}
                            className="w-full pl-7 pr-2 py-2 text-xs bg-black/20 border border-white/10 rounded-lg text-right text-[var(--text-primary)] focus:border-[var(--accent-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--accent-primary)]/50 transition-all"
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}
