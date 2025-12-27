import { ViewerConfig } from '@/types';

export const defaultViewerConfig: ViewerConfig = {
    frameCount: 120,
    rotateSpeed: 10,
    dragSensitivity: 0.5,
    direction: 'clockwise',
    autoplay: true,
    autoplayDelay: 50,
};

export const siteConfig = {
    name: '360° Product Viewer',
    description: 'Nền tảng thương mại điện tử với tính năng xem sản phẩm 360°',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000',
};
