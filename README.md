# 🛒 360° Product Viewer → E-Commerce Platform
Roadmap xây dựng web thương mại điện tử với tính năng xem sản phẩm 360° (image-based), bắt đầu từ demo và có khả năng mở rộng production.

---

## Phase 0 — Project Foundation

**Goal:** Thiết lập nền tảng kỹ thuật chuẩn, không throwaway.

- [x] Init Next.js (App Router)
- [x] TypeScript
- [x] Tailwind CSS
- [x] ESLint + Prettier
- [x] Folder structure chuẩn production
- [x] Base layout + metadata SEO

Deliverable:
- Repo khởi tạo sẵn sàng phát triển dài hạn

---

## Phase 1 — 360° Image Viewer (Core)

**Goal:** Xây dựng viewer xoay 360° dựa trên image sequence.

- [x] Viewer component (Canvas hoặc `<img>`)
- [x] Load image sequence (N frames, mặc định 120)
- [x] Drag chuột để xoay
- [x] Auto rotate (configurable speed)
- [x] Loop rotation
- [x] Touch support (mobile)
- [x] Frame index mapping theo drag distance

Deliverable:
- Viewer hoạt động độc lập, có thể reuse cho PDP sau này

---

## Phase 2 — Viewer Config System

**Goal:** Cho phép cấu hình viewer mà không sửa code.

- [ ] ViewerConfig schema
  - frameCount
  - rotateSpeed
  - dragSensitivity
  - direction
  - autoplay (on/off)
- [ ] JSON-based config
- [ ] Zustand store quản lý state viewer
- [ ] Runtime config update

Deliverable:
- Viewer có thể điều chỉnh behavior theo từng sản phẩm

---

## Phase 3 — Demo Setup Page

**Goal:** Trang setup để demo nhanh dữ liệu & viewer.

Route: `/demo/setup`

- [x] Upload ảnh demo (image sequence)
- [x] Validate số lượng frame
- [x] Preview sequence
- [x] Form chỉnh ViewerConfig
- [x] Generate demo product data (JSON)

Deliverable:
- Có thể setup viewer demo mà không cần code

---

## Phase 4 — Demo View Page (Product Detail Page Mock)

**Goal:** Mô phỏng Product Detail Page thực tế.

Route: `/demo/view`

- [ ] 360° Viewer (center focus)
- [ ] Product info section
  - title
  - description
  - price (mock)
  - specs
- [ ] Tab layout (Info / Specs / More)
- [ ] CTA mock (Add to Cart – disabled)

Deliverable:
- PDP demo hoàn chỉnh, sát e-commerce thật

---

## Phase 5 — Next.js API (Backend-for-Frontend)

**Goal:** Chuẩn bị backend logic nhưng không tách service.

- [ ] `/api/upload` – upload ảnh demo
- [ ] `/api/products/demo` – fetch product mock
- [ ] `/api/viewer-config` – get/update config
- [ ] Data source: JSON / in-memory

Deliverable:
- Frontend không phụ thuộc hardcode data

---

## Phase 6 — Performance & UX Optimization

**Goal:** Đảm bảo viewer mượt, không lag.

- [ ] Image preload strategy
- [ ] Lazy load frame chunks
- [ ] RequestAnimationFrame cho rotate
- [ ] Drag inertia (optional)
- [ ] WebP support
- [ ] Mobile performance tuning

Deliverable:
- Viewer đủ chất lượng để dùng production

---

## Phase 7 — Production Readiness (Optional)

**Goal:** Chuẩn bị chuyển sang e-commerce thật.

- [ ] Abstract storage layer (Local → CDN)
- [ ] Product model abstraction
- [ ] Environment-based config
- [ ] SEO optimization cho PDP
- [ ] Analytics hook (view / rotate events)

Deliverable:
- Viewer sẵn sàng tích hợp vào hệ thống bán hàng

---

## Phase 8 — E-Commerce Core (Future)

**Goal:** Bắt đầu chuyển demo thành sản phẩm thật.

- [ ] Product catalog
- [ ] Cart
- [ ] Auth
- [ ] Order flow
- [ ] Payment
- [ ] Inventory

Note:
- Viewer 360° giữ nguyên
- Chỉ thay data source & backend

---

## Phase 9 — Backend Separation (When Needed)

**Goal:** Scale hệ thống.

- [ ] Tách backend (NestJS / Laravel / etc.)
- [ ] DB (PostgreSQL / MySQL)
- [ ] CMS / Admin
- [ ] Asset storage (S3 / Cloudinary)

Deliverable:
- Kiến trúc enterprise-ready

---

## Phase 10 — Advanced 3D & Marketing (Optional)

- [ ] Hotspot annotation trên viewer
- [ ] Zoom / detail mode
- [ ] Compare products
- [ ] 3D model fallback (GLTF)
- [ ] AR preview (future)

---

## Guiding Principles

- Demo ≠ throwaway
- Viewer là core asset, không rewrite
- Ưu tiên image-based 360 trước WebGL
- Next.js làm BFF, backend tách sau

---
