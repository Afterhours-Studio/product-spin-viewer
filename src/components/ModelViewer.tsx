'use client';

import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stage, useGLTF, ContactShadows } from '@react-three/drei';
import { Suspense, useEffect } from 'react';
import { useModelStore } from '@/stores/modelStore';
import { Box } from 'lucide-react';

// Dynamic model loader
function Model({ url, transform, scaleMultiplier = 1 }: {
    url: string;
    transform: { position: [number, number, number]; rotation: [number, number, number]; scale: number };
    scaleMultiplier?: number;
}) {
    const { scene } = useGLTF(url);

    // Convert rotation from degrees to radians
    const rotationRad: [number, number, number] = [
        (transform.rotation[0] * Math.PI) / 180,
        (transform.rotation[1] * Math.PI) / 180,
        (transform.rotation[2] * Math.PI) / 180,
    ];

    // Apply scale multiplier
    const finalScale = transform.scale * scaleMultiplier;

    return (
        <primitive
            object={scene}
            scale={finalScale}
            position={transform.position}
            rotation={rotationRad}
        />
    );
}

// Loading spinner
function LoadingSpinner() {
    return (
        <div className="absolute inset-0 flex items-center justify-center">
            <div className="h-12 w-12 animate-spin rounded-full border-3 border-[var(--accent-primary)]/30 border-t-[var(--accent-primary)]" />
        </div>
    );
}

export function ModelViewer() {
    const { files, selectedFileId } = useModelStore();
    const selectedFile = files.find((f) => f.id === selectedFileId);
    const config = selectedFile?.config;

    // Preload all models
    useEffect(() => {
        files.forEach((file) => {
            useGLTF.preload(file.url);
        });
    }, [files]);

    if (!selectedFile || !config) {
        return (
            <div
                className="flex-1 h-full flex flex-col items-center justify-center gap-4"
                style={{ background: '#0a0a14' }}
            >
                <div className="p-4 rounded-2xl bg-white/5">
                    <Box className="h-12 w-12 text-[var(--text-muted)]" />
                </div>
                <p className="text-[var(--text-muted)]">Select a model to view</p>
            </div>
        );
    }

    const { autoRotate, rotateSpeed, transform, backgroundColor } = config;

    return (
        <div
            className="relative h-full w-full"
            style={{ background: `linear-gradient(135deg, ${backgroundColor} 0%, ${backgroundColor}dd 50%, ${backgroundColor}bb 100%)` }}
        >
            {/* Glow effect */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--accent-primary)]/5 rounded-full blur-3xl" />
            </div>

            {/* Canvas */}
            <Canvas shadows dpr={[1, 2]} camera={{ position: [0, 2, 5], fov: 40 }} className="!absolute inset-0">
                <ambientLight intensity={0.5} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <Suspense fallback={null}>
                    <Stage environment="studio" intensity={0.6} shadows={false}>
                        <Model url={selectedFile.url} transform={transform} scaleMultiplier={selectedFile.scaleMultiplier} />
                    </Stage>
                    <ContactShadows
                        position={[0, -0.5, 0]}
                        opacity={0.4}
                        scale={10}
                        blur={2.5}
                        far={5}
                    />
                </Suspense>
                <OrbitControls
                    autoRotate={autoRotate}
                    autoRotateSpeed={rotateSpeed}
                    enableZoom={true}
                    minDistance={1}
                    maxDistance={20}
                    enablePan={false}
                />
            </Canvas>

            {/* Model name badge */}
            <div className="absolute bottom-4 left-4 glass-card-sm px-3 py-1.5 rounded-full">
                <span className="text-xs font-medium text-[var(--text-secondary)]">{selectedFile.name}</span>
            </div>
        </div>
    );
}
