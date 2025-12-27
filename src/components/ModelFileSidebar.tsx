'use client';

import { useCallback, useState, useRef } from 'react';
import { Folder, Trash2, Lock, Upload, Box } from 'lucide-react';
import { useModelStore, ModelFile } from '@/stores/modelStore';

export function ModelFileSidebar() {
    const { files, selectedFileId, selectFile, removeFile, addFile } = useModelStore();
    const [isDragOver, setIsDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const selectedFiles = Array.from(e.target.files || []);
        selectedFiles.forEach((file) => {
            if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
                addFile(file);
            }
        });
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [addFile]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        const droppedFiles = Array.from(e.dataTransfer.files);
        droppedFiles.forEach((file) => {
            if (file.name.endsWith('.glb') || file.name.endsWith('.gltf')) {
                addFile(file);
            }
        });
    }, [addFile]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const handleZoneClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="w-64 shrink-0 flex flex-col h-screen bg-[var(--bg-secondary)] backdrop-blur-xl border-r border-white/10">
            {/* Hidden file input */}
            <input
                ref={fileInputRef}
                type="file"
                accept=".glb,.gltf"
                multiple
                onChange={handleFileSelect}
                className="hidden"
            />

            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-4 border-b border-white/10">
                <div className="p-2 rounded-lg bg-[var(--accent-primary)]/20">
                    <Folder className="h-4 w-4 text-[var(--accent-primary)]" />
                </div>
                <div>
                    <h2 className="text-sm font-semibold text-[var(--text-primary)]">Models</h2>
                    <p className="text-[10px] text-[var(--text-muted)]">{files.length} files</p>
                </div>
            </div>

            {/* Drop Zone - Now at top */}
            <div
                onClick={handleZoneClick}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={`m-3 p-4 border-2 border-dashed rounded-xl text-center transition-all duration-200 cursor-pointer ${isDragOver
                    ? 'border-[var(--accent-primary)] bg-[var(--accent-primary)]/10 scale-[1.02]'
                    : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                    }`}
            >
                <div className={`mx-auto mb-2 p-2 rounded-full w-fit transition-colors ${isDragOver ? 'bg-[var(--accent-primary)]/20' : 'bg-white/5'
                    }`}>
                    <Upload className={`h-5 w-5 ${isDragOver ? 'text-[var(--accent-primary)]' : 'text-[var(--text-muted)]'}`} />
                </div>
                <p className="text-xs text-[var(--text-muted)]">
                    Drop <span className="font-medium text-[var(--text-secondary)]">.glb</span> files here
                </p>
                <p className="text-[10px] text-[var(--text-muted)] mt-1">or click to browse</p>
            </div>

            {/* File List */}
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
                {files.map((file) => (
                    <FileItem
                        key={file.id}
                        file={file}
                        isSelected={file.id === selectedFileId}
                        onSelect={() => selectFile(file.id)}
                        onDelete={() => removeFile(file.id)}
                    />
                ))}
            </div>
        </div>
    );
}

function FileItem({
    file,
    isSelected,
    onSelect,
    onDelete
}: {
    file: ModelFile;
    isSelected: boolean;
    onSelect: () => void;
    onDelete: () => void;
}) {
    return (
        <div
            onClick={onSelect}
            className={`group flex items-center gap-3 p-2.5 rounded-xl cursor-pointer transition-all duration-200 ${isSelected
                ? 'bg-gradient-to-r from-[var(--accent-primary)]/20 to-[var(--accent-primary)]/10 text-[var(--accent-primary)] shadow-lg shadow-[var(--accent-primary)]/10'
                : 'hover:bg-white/5 text-[var(--text-secondary)]'
                }`}
        >
            <div className={`p-1.5 rounded-lg transition-colors ${isSelected ? 'bg-[var(--accent-primary)]/20' : 'bg-white/5 group-hover:bg-white/10'
                }`}>
                <Box className="h-3.5 w-3.5" />
            </div>
            <div className="flex-1 truncate text-xs font-medium">
                {file.name}
            </div>
            {file.isDefault ? (
                <Lock className="h-3 w-3 text-[var(--text-muted)]" />
            ) : (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-red-500/20 text-[var(--text-muted)] hover:text-red-400 transition-all"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}
