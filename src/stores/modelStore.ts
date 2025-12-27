import { create } from 'zustand';

export interface ModelFile {
    id: string;
    name: string;
    url: string;
    isDefault: boolean; // true = from public/, cannot delete
    config: ModelConfig; // Per-file settings
    scaleMultiplier: number; // Multiplier applied to scale value (e.g., 0.1 for smaller models)
}

export interface ModelTransform {
    position: [number, number, number];
    rotation: [number, number, number];
    scale: number;
}

export interface ModelConfig {
    autoRotate: boolean;
    rotateSpeed: number;
    transform: ModelTransform;
    backgroundColor: string;
}

interface ModelStore {
    // File management
    files: ModelFile[];
    selectedFileId: string | null;

    // Actions
    addFile: (file: File) => void;
    removeFile: (id: string) => void;
    selectFile: (id: string) => void;

    // Per-file config actions
    getSelectedConfig: () => ModelConfig | null;
    setConfig: (config: Partial<ModelConfig>) => void;
    setTransform: (transform: Partial<ModelTransform>) => void;
}

const DEFAULT_CONFIG: ModelConfig = {
    autoRotate: true,
    rotateSpeed: 2,
    transform: {
        position: [0, 0, 0],
        rotation: [-90, 0, 0], // degrees
        scale: 1,
    },
    backgroundColor: '#0a0a14',
};

// Default files from public/models
const DEFAULT_FILES: ModelFile[] = [
    {
        id: 'default-ring-1',
        name: 'doji_diamond_ring.glb',
        url: '/models/doji_diamond_ring.glb',
        isDefault: true,
        config: { ...DEFAULT_CONFIG },
        scaleMultiplier: 1,
    },
    {
        id: 'default-ring-2',
        name: 'jewelery_ring_diamonds.glb',
        url: '/models/jewelery_ring_diamonds.glb',
        isDefault: true,
        config: {
            ...DEFAULT_CONFIG,
            transform: {
                position: [0, 0, 0],
                rotation: [-90, 55, 55],
                scale: 1,
            },
        },
        scaleMultiplier: 0.1,
    },
];

export const useModelStore = create<ModelStore>((set, get) => ({
    files: DEFAULT_FILES,
    selectedFileId: DEFAULT_FILES[0]?.id || null,

    addFile: (file: File) => {
        const url = URL.createObjectURL(file);
        const newFile: ModelFile = {
            id: `user-${Date.now()}`,
            name: file.name,
            url,
            isDefault: false,
            config: { ...DEFAULT_CONFIG }, // Each new file gets default config
            scaleMultiplier: 1, // Default multiplier for user files
        };
        set((state) => ({
            files: [...state.files, newFile],
            selectedFileId: newFile.id,
        }));
    },

    removeFile: (id: string) => {
        const file = get().files.find((f) => f.id === id);
        if (!file || file.isDefault) return; // Cannot delete default files

        // Revoke object URL to free memory
        if (file.url.startsWith('blob:')) {
            URL.revokeObjectURL(file.url);
        }

        set((state) => {
            const newFiles = state.files.filter((f) => f.id !== id);
            const newSelectedId = state.selectedFileId === id
                ? newFiles[0]?.id || null
                : state.selectedFileId;
            return { files: newFiles, selectedFileId: newSelectedId };
        });
    },

    selectFile: (id: string) => {
        set({ selectedFileId: id });
    },

    getSelectedConfig: () => {
        const { files, selectedFileId } = get();
        const selectedFile = files.find((f) => f.id === selectedFileId);
        return selectedFile?.config || null;
    },

    setConfig: (config: Partial<ModelConfig>) => {
        const { selectedFileId } = get();
        if (!selectedFileId) return;

        set((state) => ({
            files: state.files.map((file) =>
                file.id === selectedFileId
                    ? { ...file, config: { ...file.config, ...config } }
                    : file
            ),
        }));
    },

    setTransform: (transform: Partial<ModelTransform>) => {
        const { selectedFileId } = get();
        if (!selectedFileId) return;

        set((state) => ({
            files: state.files.map((file) =>
                file.id === selectedFileId
                    ? {
                        ...file,
                        config: {
                            ...file.config,
                            transform: { ...file.config.transform, ...transform },
                        },
                    }
                    : file
            ),
        }));
    },
}));
