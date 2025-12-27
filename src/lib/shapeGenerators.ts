// 3D Shape SVG Generators
// Generates SVG frames for orbital camera viewing

const SIZE = 400;
const CENTER = SIZE / 2;
const STROKE_COLOR = '#818cf8';
const STROKE_WIDTH = 2;

type Point3D = { x: number; y: number; z: number };
type Point2D = { x: number; y: number };

// Normalize vector
function normalize(v: Point3D): Point3D {
    const len = Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
    return len > 0 ? { x: v.x / len, y: v.y / len, z: v.z / len } : { x: 0, y: 0, z: 1 };
}

// Cross product
function cross(a: Point3D, b: Point3D): Point3D {
    return {
        x: a.y * b.z - a.z * b.y,
        y: a.z * b.x - a.x * b.z,
        z: a.x * b.y - a.y * b.x,
    };
}

// Dot product
function dot(a: Point3D, b: Point3D): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
}

// Spherical camera: azimuth (horizontal 0-360°) and elevation (vertical -90° to +90°)
// Camera orbits around origin, always looking at center
function transformWithCamera(p: Point3D, azimuth: number, elevation: number): Point2D {
    const azRad = (azimuth * Math.PI) / 180;
    const elRad = (elevation * Math.PI) / 180;
    const camDist = 400;

    // Camera position on sphere
    const camX = camDist * Math.cos(elRad) * Math.sin(azRad);
    const camY = camDist * Math.sin(elRad);
    const camZ = camDist * Math.cos(elRad) * Math.cos(azRad);

    // LookAt: camera looks at origin
    const forward = normalize({ x: -camX, y: -camY, z: -camZ });

    // Handle gimbal lock at poles: use different up vector
    let worldUp: Point3D;
    if (Math.abs(elevation) > 89) {
        // At poles, use Z-forward as reference instead of Y-up
        worldUp = { x: -Math.sin(azRad), y: 0, z: -Math.cos(azRad) };
    } else {
        worldUp = { x: 0, y: 1, z: 0 };
    }

    const right = normalize(cross(worldUp, forward));
    const up = cross(forward, right);

    // Transform point to camera space
    const relX = p.x - camX;
    const relY = p.y - camY;
    const relZ = p.z - camZ;

    const camSpaceX = dot({ x: relX, y: relY, z: relZ }, right);
    const camSpaceY = dot({ x: relX, y: relY, z: relZ }, up);
    const camSpaceZ = dot({ x: relX, y: relY, z: relZ }, forward);

    // Perspective projection
    const fov = 400;
    const z = Math.max(camSpaceZ, 1);
    return {
        x: CENTER + (camSpaceX * fov) / z,
        y: CENTER - (camSpaceY * fov) / z, // Flip Y for screen coords
    };
}

// Legacy function for compatibility - now uses spherical camera
function transform(p: Point3D, azimuth: number, elevation: number): Point2D {
    return transformWithCamera(p, azimuth, elevation);
}

function svgWrapper(content: string): string {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
    <rect width="${SIZE}" height="${SIZE}" fill="#0a0a14"/>
    ${content}
  </svg>`;
}

function line3D(p1: Point3D, p2: Point3D, angleX: number, angleY: number, color: string = STROKE_COLOR): string {
    const proj1 = transform(p1, angleX, angleY);
    const proj2 = transform(p2, angleX, angleY);
    return `<line x1="${proj1.x}" y1="${proj1.y}" x2="${proj2.x}" y2="${proj2.y}" stroke="${color}" stroke-width="${STROKE_WIDTH}" stroke-linecap="round"/>`;
}

function ellipse3D(cx: number, cy: number, cz: number, rx: number, ry: number, angleX: number, angleY: number, segments: number = 24): string {
    const points: Point2D[] = [];
    for (let i = 0; i <= segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        const p: Point3D = { x: cx + Math.cos(a) * rx, y: cy, z: cz + Math.sin(a) * ry };
        points.push(transform(p, angleX, angleY));
    }
    const d = points.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ');
    return `<path d="${d}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_WIDTH}" fill="none"/>`;
}

// ==================== CUBE ====================
export function generateCube(angleX: number, angleY: number): string {
    const s = 80;
    const v: Point3D[] = [
        { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s }, { x: s, y: s, z: -s }, { x: -s, y: s, z: -s },
        { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, { x: s, y: s, z: s }, { x: -s, y: s, z: s },
    ];
    const edges: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [0, 4], [1, 5], [2, 6], [3, 7]];
    return svgWrapper(edges.map(([i, j]) => line3D(v[i], v[j], angleX, angleY)).join(''));
}

// ==================== CYLINDER ====================
export function generateCylinder(angleX: number, angleY: number): string {
    const r = 70, h = 80;
    const lines: string[] = [];
    // Top and bottom ellipses
    lines.push(ellipse3D(0, -h, 0, r, r, angleX, angleY));
    lines.push(ellipse3D(0, h, 0, r, r, angleX, angleY));
    // Vertical lines
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI * 2;
        const x = Math.cos(a) * r, z = Math.sin(a) * r;
        lines.push(line3D({ x, y: -h, z }, { x, y: h, z }, angleX, angleY));
    }
    return svgWrapper(lines.join(''));
}

// ==================== SPHERE ====================
export function generateSphere(angleX: number, angleY: number): string {
    const r = 80;
    const lines: string[] = [];
    // Latitude lines
    for (let i = 1; i < 6; i++) {
        const y = (i / 6 - 0.5) * 2 * r;
        const rr = Math.sqrt(r * r - y * y);
        lines.push(ellipse3D(0, y, 0, rr, rr, angleX, angleY, 32));
    }
    // Longitude lines
    for (let i = 0; i < 8; i++) {
        const a = (i / 8) * Math.PI;
        const pts: Point2D[] = [];
        for (let j = 0; j <= 24; j++) {
            const phi = (j / 24) * Math.PI;
            const p: Point3D = {
                x: Math.sin(phi) * Math.cos(a) * r,
                y: -Math.cos(phi) * r,
                z: Math.sin(phi) * Math.sin(a) * r,
            };
            pts.push(transform(p, angleX, angleY));
        }
        lines.push(`<path d="${pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_WIDTH}" fill="none"/>`);
    }
    return svgWrapper(lines.join(''));
}

// ==================== PYRAMID ====================
export function generatePyramid(angleX: number, angleY: number): string {
    const s = 80, h = 100;
    const apex: Point3D = { x: 0, y: -h, z: 0 };
    const base: Point3D[] = [
        { x: -s, y: h / 2, z: -s }, { x: s, y: h / 2, z: -s },
        { x: s, y: h / 2, z: s }, { x: -s, y: h / 2, z: s },
    ];
    const lines: string[] = [];
    // Base edges
    for (let i = 0; i < 4; i++) lines.push(line3D(base[i], base[(i + 1) % 4], angleX, angleY));
    // Edges to apex
    for (let i = 0; i < 4; i++) lines.push(line3D(base[i], apex, angleX, angleY));
    return svgWrapper(lines.join(''));
}

// ==================== TORUS ====================
export function generateTorus(angleX: number, angleY: number): string {
    const R = 70, r = 25; // Major and minor radius
    const lines: string[] = [];
    // Rings around the torus
    for (let i = 0; i < 12; i++) {
        const theta = (i / 12) * Math.PI * 2;
        const cx = Math.cos(theta) * R, cz = Math.sin(theta) * R;
        const pts: Point2D[] = [];
        for (let j = 0; j <= 16; j++) {
            const phi = (j / 16) * Math.PI * 2;
            const p: Point3D = {
                x: cx + Math.cos(phi) * r * Math.cos(theta),
                y: Math.sin(phi) * r,
                z: cz + Math.cos(phi) * r * Math.sin(theta),
            };
            pts.push(transform(p, angleX, angleY));
        }
        lines.push(`<path d="${pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_WIDTH}" fill="none"/>`);
    }
    // Circles along the tube
    for (let i = 0; i < 16; i++) {
        const phi = (i / 16) * Math.PI * 2;
        const pts: Point2D[] = [];
        for (let j = 0; j <= 24; j++) {
            const theta = (j / 24) * Math.PI * 2;
            const cx = Math.cos(theta) * R, cz = Math.sin(theta) * R;
            const p: Point3D = {
                x: cx + Math.cos(phi) * r * Math.cos(theta),
                y: Math.sin(phi) * r,
                z: cz + Math.cos(phi) * r * Math.sin(theta),
            };
            pts.push(transform(p, angleX, angleY));
        }
        lines.push(`<path d="${pts.map((p, i) => (i === 0 ? `M${p.x},${p.y}` : `L${p.x},${p.y}`)).join(' ')}" stroke="${STROKE_COLOR}" stroke-width="${STROKE_WIDTH}" fill="none" opacity="0.5"/>`);
    }
    return svgWrapper(lines.join(''));
}

// ==================== CONE ====================
export function generateCone(angleX: number, angleY: number): string {
    const r = 70, h = 120;
    const apex: Point3D = { x: 0, y: -h / 2, z: 0 };
    const lines: string[] = [];
    // Base ellipse
    lines.push(ellipse3D(0, h / 2, 0, r, r, angleX, angleY));
    // Lines to apex
    for (let i = 0; i < 12; i++) {
        const a = (i / 12) * Math.PI * 2;
        lines.push(line3D({ x: Math.cos(a) * r, y: h / 2, z: Math.sin(a) * r }, apex, angleX, angleY));
    }
    return svgWrapper(lines.join(''));
}

// Generate all frames for a shape - returns data URLs
// Orbital camera style: vertical angles from -60° to +60° (centered at horizon)
export function generateShapeFrames(
    generator: (angleX: number, angleY: number) => string,
    cols: number = 72,
    rows: number = 13 // Odd number so middle row (6) = 0°
): string[][] {
    const frames: string[][] = [];
    const minAngleY = -90; // Looking from below (nadir)
    const maxAngleY = 90;  // Looking from above (zenith)

    for (let row = 0; row < rows; row++) {
        const rowFrames: string[] = [];
        // Map row to angle: row 0 = -60°, row (rows-1) = +60°, middle = 0° (horizon)
        const angleY = minAngleY + (row / (rows - 1)) * (maxAngleY - minAngleY);
        for (let col = 0; col < cols; col++) {
            // Invert angleX direction to match mouse drag
            const angleX = -(col / cols) * 360;
            const svg = generator(angleX, angleY);
            rowFrames.push(`data:image/svg+xml;base64,${btoa(svg)}`);
        }
        frames.push(rowFrames);
    }
    return frames;
}

// No-op for backward compatibility
export function revokeShapeFrames(_frames: string[][]): void {
    // Data URLs don't need cleanup
}

export const SHAPE_NAMES = ['Cube', 'Cylinder', 'Sphere', 'Pyramid', 'Torus', 'Cone'] as const;
export type ShapeName = typeof SHAPE_NAMES[number];

// Face colors for colored mode
const FACE_COLORS = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6', '#ec4899', '#14b8a6'];

// Helper: check if face is front-facing (backface culling)
function isFrontFacing(pts: Point2D[]): boolean {
    const ax = pts[1].x - pts[0].x;
    const ay = pts[1].y - pts[0].y;
    const bx = pts[2].x - pts[0].x;
    const by = pts[2].y - pts[0].y;
    return (ax * by - ay * bx) > 0;
}

// Colored cube with opaque faces and backface culling
function generateColoredCube(angleX: number, angleY: number): string {
    const s = 80;
    const v: Point3D[] = [
        { x: -s, y: -s, z: -s }, { x: s, y: -s, z: -s }, { x: s, y: s, z: -s }, { x: -s, y: s, z: -s },
        { x: -s, y: -s, z: s }, { x: s, y: -s, z: s }, { x: s, y: s, z: s }, { x: -s, y: s, z: s },
    ];
    const faces = [
        { verts: [0, 3, 2, 1], color: FACE_COLORS[0] },
        { verts: [4, 5, 6, 7], color: FACE_COLORS[1] },
        { verts: [0, 4, 7, 3], color: FACE_COLORS[2] },
        { verts: [1, 2, 6, 5], color: FACE_COLORS[3] },
        { verts: [3, 7, 6, 2], color: FACE_COLORS[4] },
        { verts: [0, 1, 5, 4], color: FACE_COLORS[5] },
    ];
    const paths = faces.map(f => {
        const pts = f.verts.map(i => transform(v[i], angleX, angleY));
        if (!isFrontFacing(pts)) return '';
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
        return `<path d="${d}" fill="${f.color}" stroke="#000" stroke-width="1"/>`;
    }).filter(p => p);
    return svgWrapper(paths.join(''));
}

// Colored pyramid
function generateColoredPyramid(angleX: number, angleY: number): string {
    const s = 80, h = 100;
    const v: Point3D[] = [
        { x: 0, y: h, z: 0 },
        { x: -s, y: -h / 2, z: -s }, { x: s, y: -h / 2, z: -s },
        { x: s, y: -h / 2, z: s }, { x: -s, y: -h / 2, z: s },
    ];
    const faces = [
        { verts: [0, 2, 1], color: FACE_COLORS[0] },
        { verts: [0, 3, 2], color: FACE_COLORS[1] },
        { verts: [0, 4, 3], color: FACE_COLORS[2] },
        { verts: [0, 1, 4], color: FACE_COLORS[3] },
        { verts: [1, 2, 3, 4], color: FACE_COLORS[4] },
    ];
    const paths = faces.map(f => {
        const pts = f.verts.map(i => transform(v[i], angleX, angleY));
        if (!isFrontFacing(pts.slice(0, 3))) return '';
        const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
        return `<path d="${d}" fill="${f.color}" stroke="#000" stroke-width="1"/>`;
    }).filter(p => p);
    return svgWrapper(paths.join(''));
}

// Colored cone
function generateColoredCone(angleX: number, angleY: number): string {
    const r = 70, h = 100, segments = 16;
    const paths: string[] = [];
    const apex: Point3D = { x: 0, y: h / 2, z: 0 }; // Apex Top

    // Side faces
    for (let i = 0; i < segments; i++) {
        const a1 = (i / segments) * Math.PI * 2;
        const a2 = ((i + 1) / segments) * Math.PI * 2;
        // Base points at Bottom
        const p1: Point3D = { x: Math.cos(a1) * r, y: -h / 2, z: Math.sin(a1) * r };
        const p2: Point3D = { x: Math.cos(a2) * r, y: -h / 2, z: Math.sin(a2) * r };

        // Reverse winding [apex, p2, p1] due to flip
        const pts = [apex, p2, p1].map(p => transform(p, angleX, angleY));
        if (isFrontFacing(pts)) {
            const d = pts.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
            paths.push(`<path d="${d}" fill="${FACE_COLORS[i % 6]}" stroke="#000" stroke-width="0.5"/>`);
        }
    }

    // Base cap
    const basePts: Point2D[] = [];
    for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        // Reverse order for base cap check? Try normal order first.
        // Actually for cylinder bottom cap I used reverse loop (i--).
        // Let's copy cylinder bottom cap logic (reverse loop).
        // Wait, here I am using normal loop but if I push in order...
        // Let's match Cylinder Bottom Cap: i = segments-1 downto 0.
        // But here I'll stick to consistency.
        basePts.push(transform({ x: Math.cos(a) * r, y: -h / 2, z: Math.sin(a) * r }, angleX, angleY));
    }
    // Check winding for base cap. If normal order is wrong, verify visual.
    // Cylinder bottom cap used reverse loop. Let's try reverse loop here too?
    // Actually let's use the points in reverse order for checking?
    // Let's re-write loop to be reverse for consistency with Cylinder Bottom Cap.

    const capPts: Point2D[] = [];
    for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        capPts.push(transform({ x: Math.cos(a) * r, y: -h / 2, z: Math.sin(a) * r }, angleX, angleY));
    }

    if (isFrontFacing(capPts)) {
        const d = capPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
        paths.push(`<path d="${d}" fill="${FACE_COLORS[6]}" stroke="#000" stroke-width="0.5"/>`);
    }

    return svgWrapper(paths.join(''));
}

// Colored cylinder
function generateColoredCylinder(angleX: number, angleY: number): string {
    const r = 70, h = 80, segments = 16;
    const paths: string[] = [];

    // Side faces
    for (let i = 0; i < segments; i++) {
        const a1 = (i / segments) * Math.PI * 2;
        const a2 = ((i + 1) / segments) * Math.PI * 2;
        const x1 = Math.cos(a1) * r, z1 = Math.sin(a1) * r;
        const x2 = Math.cos(a2) * r, z2 = Math.sin(a2) * r;
        const pts = [
            { x: x1, y: -h, z: z1 }, { x: x1, y: h, z: z1 },
            { x: x2, y: h, z: z2 }, { x: x2, y: -h, z: z2 }
        ].map(p => transform(p, angleX, angleY));
        if (isFrontFacing(pts)) {
            const d = pts.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
            paths.push(`<path d="${d}" fill="${FACE_COLORS[i % 6]}" stroke="#000" stroke-width="0.5"/>`);
        }
    }

    // Top cap
    const topPts: Point2D[] = [];
    for (let i = 0; i < segments; i++) {
        const a = (i / segments) * Math.PI * 2;
        topPts.push(transform({ x: Math.cos(a) * r, y: -h, z: Math.sin(a) * r }, angleX, angleY));
    }
    if (isFrontFacing(topPts)) {
        const d = topPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
        paths.push(`<path d="${d}" fill="${FACE_COLORS[6]}" stroke="#000" stroke-width="0.5"/>`);
    }

    // Bottom cap
    const botPts: Point2D[] = [];
    for (let i = segments - 1; i >= 0; i--) {
        const a = (i / segments) * Math.PI * 2;
        botPts.push(transform({ x: Math.cos(a) * r, y: h, z: Math.sin(a) * r }, angleX, angleY));
    }
    if (isFrontFacing(botPts)) {
        const d = botPts.map((p, i) => `${i === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
        paths.push(`<path d="${d}" fill="${FACE_COLORS[7]}" stroke="#000" stroke-width="0.5"/>`);
    }

    return svgWrapper(paths.join(''));
}

// Colored sphere
function generateColoredSphere(angleX: number, angleY: number): string {
    const r = 80, latSegs = 8, lonSegs = 12;
    const paths: string[] = [];

    // North pole (top cap) - triangles
    const northPole = transform({ x: 0, y: r, z: 0 }, angleX, angleY);
    const phi1 = Math.PI / latSegs;
    for (let lon = 0; lon < lonSegs; lon++) {
        const theta1 = (lon / lonSegs) * Math.PI * 2;
        const theta2 = ((lon + 1) / lonSegs) * Math.PI * 2;
        const p1: Point3D = { x: Math.sin(phi1) * Math.cos(theta1) * r, y: Math.cos(phi1) * r, z: Math.sin(phi1) * Math.sin(theta1) * r };
        const p2: Point3D = { x: Math.sin(phi1) * Math.cos(theta2) * r, y: Math.cos(phi1) * r, z: Math.sin(phi1) * Math.sin(theta2) * r };
        const pts = [northPole, transform(p2, angleX, angleY), transform(p1, angleX, angleY)];
        if (isFrontFacing(pts)) {
            const d = pts.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
            paths.push(`<path d="${d}" fill="${FACE_COLORS[lon % 6]}" stroke="#000" stroke-width="0.3"/>`);
        }
    }

    // Middle quads (lat 1 to latSegs-2)
    for (let lat = 1; lat < latSegs - 1; lat++) {
        const phi1 = (lat / latSegs) * Math.PI;
        const phi2 = ((lat + 1) / latSegs) * Math.PI;
        for (let lon = 0; lon < lonSegs; lon++) {
            const theta1 = (lon / lonSegs) * Math.PI * 2;
            const theta2 = ((lon + 1) / lonSegs) * Math.PI * 2;
            const p1: Point3D = { x: Math.sin(phi1) * Math.cos(theta1) * r, y: Math.cos(phi1) * r, z: Math.sin(phi1) * Math.sin(theta1) * r };
            const p2: Point3D = { x: Math.sin(phi1) * Math.cos(theta2) * r, y: Math.cos(phi1) * r, z: Math.sin(phi1) * Math.sin(theta2) * r };
            const p3: Point3D = { x: Math.sin(phi2) * Math.cos(theta2) * r, y: Math.cos(phi2) * r, z: Math.sin(phi2) * Math.sin(theta2) * r };
            const p4: Point3D = { x: Math.sin(phi2) * Math.cos(theta1) * r, y: Math.cos(phi2) * r, z: Math.sin(phi2) * Math.sin(theta1) * r };
            const pts = [p1, p2, p3, p4].map(p => transform(p, angleX, angleY));
            if (isFrontFacing(pts)) {
                const d = pts.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
                paths.push(`<path d="${d}" fill="${FACE_COLORS[(lat + lon) % 6]}" stroke="#000" stroke-width="0.3"/>`);
            }
        }
    }

    // South pole (bottom cap) - triangles
    const southPole = transform({ x: 0, y: -r, z: 0 }, angleX, angleY);
    const phiLast = ((latSegs - 1) / latSegs) * Math.PI;
    for (let lon = 0; lon < lonSegs; lon++) {
        const theta1 = (lon / lonSegs) * Math.PI * 2;
        const theta2 = ((lon + 1) / lonSegs) * Math.PI * 2;
        const p1: Point3D = { x: Math.sin(phiLast) * Math.cos(theta1) * r, y: Math.cos(phiLast) * r, z: Math.sin(phiLast) * Math.sin(theta1) * r };
        const p2: Point3D = { x: Math.sin(phiLast) * Math.cos(theta2) * r, y: Math.cos(phiLast) * r, z: Math.sin(phiLast) * Math.sin(theta2) * r };
        const pts = [southPole, transform(p1, angleX, angleY), transform(p2, angleX, angleY)];
        if (isFrontFacing(pts)) {
            const d = pts.map((p, j) => `${j === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
            paths.push(`<path d="${d}" fill="${FACE_COLORS[lon % 6]}" stroke="#000" stroke-width="0.3"/>`);
        }
    }

    return svgWrapper(paths.join(''));
}

// Colored torus
function generateColoredTorus(angleX: number, angleY: number): string {
    const R = 60, r = 25, tubeSegs = 12, ringSegs = 16;
    const paths: string[] = [];
    for (let i = 0; i < ringSegs; i++) {
        const theta1 = (i / ringSegs) * Math.PI * 2;
        const theta2 = ((i + 1) / ringSegs) * Math.PI * 2;
        for (let j = 0; j < tubeSegs; j++) {
            const phi1 = (j / tubeSegs) * Math.PI * 2;
            const phi2 = ((j + 1) / tubeSegs) * Math.PI * 2;
            const getP = (t: number, p: number): Point3D => ({
                x: (R + r * Math.cos(p)) * Math.cos(t),
                y: r * Math.sin(p),
                z: (R + r * Math.cos(p)) * Math.sin(t),
            });
            const pts = [getP(theta1, phi1), getP(theta2, phi1), getP(theta2, phi2), getP(theta1, phi2)]
                .map(p => transform(p, angleX, angleY));
            if (isFrontFacing(pts)) {
                const d = pts.map((p, k) => `${k === 0 ? 'M' : 'L'}${p.x},${p.y}`).join(' ') + 'Z';
                paths.push(`<path d="${d}" fill="${FACE_COLORS[(i + j) % 6]}" stroke="#000" stroke-width="0.3"/>`);
            }
        }
    }
    return svgWrapper(paths.join(''));
}

export function getShapeGenerator(name: ShapeName, colored: boolean = false): (angleX: number, angleY: number) => string {
    if (colored) {
        switch (name) {
            case 'Cube': return generateColoredCube;
            case 'Pyramid': return generateColoredPyramid;
            case 'Cone': return generateColoredCone;
            case 'Cylinder': return generateColoredCylinder;
            case 'Sphere': return generateColoredSphere;
            case 'Torus': return generateColoredTorus;
        }
    }
    switch (name) {
        case 'Cube': return generateCube;
        case 'Cylinder': return generateCylinder;
        case 'Sphere': return generateSphere;
        case 'Pyramid': return generatePyramid;
        case 'Torus': return generateTorus;
        case 'Cone': return generateCone;
        default: return generateCube;
    }
}

