# Export ảnh hover feature_card-img đúng kích thước (348×209)

## Vấn đề

Ảnh hover đang được export từ **component variant** (Variant2 / Hover) trong Figma, nên kích thước ra theo đúng bounds của component đó (ví dụ **320×185** cho card 3, **336×214** cho card 2), không trùng với khung **348×209** của ảnh default. Khi hiển thị trong ô 348×209:

- Dùng `object-fit: cover` → ảnh bị **zoom to** để lấp đầy ô.
- Dùng `object-fit: contain` → không zoom nhưng có viền trống.

## Cách export đúng trong Figma (348×209, không zoom)

Để ảnh hover cùng kích thước với default và không bị zoom, cần export một **frame 348×209** có chứa **đúng variant Hover** bên trong.

### Card 2 – Kho mẫu CV chuyên nghiệp

1. Mở file Figma TaoCV-web, tìm **Frame 427319363** (component set, node 369:6489).
2. Chọn variant **Property 1 = Hover** (369:6490).
3. Tạo một **Frame mới** kích thước **348 × 209**.
4. Kéo instance **Hover** vào frame, căn giữa (hoặc đặt giống vị trí trong feature_card-img default: instance 326×210 tại (6, -1)).
5. Chuột phải frame → **Export** → SVG hoặc PNG → lưu thành `feature-card-img-2-hover.svg` (hoặc .png).
6. Thay file trong thư mục `assets/`.

### Card 3 – Tải nhanh - xuất file chuẩn

1. Tìm **Frame 427319354** (component set, node 369:5649).
2. Chọn variant **Property 1 = Variant2** (369:5650).
3. Tạo **Frame 348 × 209**.
4. Đặt instance **Variant2** vào frame (căn giữa hoặc vị trí (14, 12) giống default trong feature_card-img 380:5364).
5. Export frame → lưu thành `feature-card-img-3-hover.svg` (hoặc .png).
6. Thay file trong `assets/`.

## Sau khi có ảnh 348×209

Trong `style.css`, đổi lại:

```css
.feature-card-img-hover {
    /* object-fit: contain; */
    object-fit: cover;
    object-position: center;
}
```

Khi đó ảnh hover sẽ lấp đầy ô 348×209 giống default và không còn hiệu ứng zoom.
