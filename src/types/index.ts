// Type definitions for the 360° Product Viewer

export interface ViewerConfig {
    frameCount: number;
    rotateSpeed: number;
    dragSensitivity: number;
    direction: 'clockwise' | 'counterclockwise';
    autoplay: boolean;
    autoplayDelay?: number;
}

export interface Product {
    id: string;
    title: string;
    description: string;
    price: number;
    currency: string;
    specs: Record<string, string>;
    images: string[];
    viewerConfig?: ViewerConfig;
}

export interface DemoProduct extends Product {
    createdAt: string;
}
