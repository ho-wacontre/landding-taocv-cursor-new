# Figma Spec & Audit – TaoCV Web (node 355:10500)

## A) Figma Spec (extracted via MCP)

### Design tokens (from get_variable_defs)

- **Spacing (px):** 0, 2, 4, 6, 8, 10, 12, 16, 20
- **Radius:** rounded 4px, rounded-md 6px, rounded-lg 8px, rounded-full 9999
- **Colors – Green:** green/50 #f3faf7, green/100 #def7ec, green/200 #bcf0da, green/300 #84e1bc, green/400 #31c48d, green/500 #0e9f6e, green/600 #057a55, green/700 #046c4e, green/900 #014737
- **Colors – Gray:** gray/50 #F9FAFB, gray/100 #F3F4F6, gray/200 #e5e7eb, gray/300 #D1D5DB, gray/500 #6B7280, gray/700 #374151, gray/800 #1F2A37, gray/900 #111928
- **Colors – Primary:** Primary #f07e1d, primary/700 #1A56DB
- **Character (text):** Character/Primary .85, Character/Title .85, Character / Secondary .45, Character / Primary(inverse) #FFFFFF
- **Typography:** Inter (most UI); leading-tight/text-5xl 48px bold lh 1.25; text-4xl 36px bold/semibold lh 1.25; text-xl 20px; text-lg 18px; text-base 16px; text-sm 14px; H5/bold Roboto 16px/24px; Body/regular Be Vietnam Pro 14px/22px; Footnote/description Roboto 12px/20px

### Layout (from screenshot / metadata)

- **Container:** Centered, max-width (1170px in code; Figma frame exact value unknown).
- **Section padding:** ~80px vertical for main sections.
- **CV Templates:** Grid of cards; gap between cards; CTA below: “Tải thêm mẫu CV” (green button).
- **Testimonials:** 3 cards horizontal; gap 30px; card bg green/50; inner author strip green/100; radius 24px.
- **Features:** Dark block; 3 top + 2 bottom in code (Figma screenshot may show 4 top – unknown).
- **Buttons:** radius 8px (rounded-lg); primary orange; CV CTA green.

---

## B) Audit: Figma vs Code vs Fix

| Area | Figma | Code (before) | Fix applied |
|------|--------|----------------|-------------|
| Design tokens | Variables: green scale, gray, radius, typography | Hardcoded hex, no green-50/100/600 etc. | Added full token set in `:root`; use vars everywhere relevant |
| CTA “Mẫu CV” | “Tải thêm mẫu CV”, green filled button | “Xem thêm mẫu CV”, outline (primary) | Text → “Tải thêm mẫu CV”; class `btn-green` (green-500/600) |
| Card radius | rounded-lg 8px for buttons/small cards | template-card 16px | template-card → `var(--radius-lg)` (8px) |
| Testimonial / steps bg | green/50 #f3faf7 | #f3faf7 hardcoded | Use `var(--green-50)` |
| Testimonial author strip | green/100 | #def7ec | Use `var(--green-100)` |
| Badge Free | green/100 bg, green/900 text | #def7ec, #03543f | Use `var(--green-100)`, `var(--green-900)` |
| Text color .85 | Character/Primary .85 | rgba(0,0,0,0.85) | `var(--char-primary-85)` |
| Text secondary .45 | Character/Secondary .45 | rgba(0,0,0,0.45) | `var(--char-secondary-45)` |
| Stepper line / gray | gray/200 | #e5e7eb | `var(--gray-200)` |
| Step inactive pill | gray/300 | #d1d5db | `var(--gray-300)` |
| Gradients (hero, banner, steps) | green-600 → green-400 | Hardcoded hex | Use `var(--green-600)`, `var(--green-400)` |
| Fonts | Inter, Roboto (H5), Be Vietnam Pro (body) | Inter only | Added Roboto 700, Be Vietnam Pro 400 in HTML |
| Comment | — | Duplicate `/* ==== */` | Removed duplicate |

---

## C) Files changed

- **style.css:** Design tokens in `:root`; all fixes above (colors, radius, typography vars, btn-green, comment).
- **index.html:** CTA text “Tải thêm mẫu CV”; class `btn-green`; font links for Roboto + Be Vietnam Pro.

---

## D) Checklist khớp Figma

- [x] Title/heading: font Inter, weight/size/line-height từ tokens (36px section, 48px hero).
- [x] Card: radius 8px (template), 24px (testimonial); padding/gap giữ nguyên; colors từ tokens.
- [x] CTA “Tải thêm mẫu CV”: vị trí dưới grid; style green filled; hover green-600.
- [x] Responsive: breakpoints 768px, 1024px, 640px giữ nguyên; không thay đổi layout lớn.
- [x] Design tokens: CSS variables cho color, radius, typography; không hardcode hex cho green/gray/character.

### Unknown / cần kiểm tra thêm

- **Container max-width:** Code 1170px; Figma frame width chưa extract được → giữ 1170px hoặc chỉnh khi có số liệu.
- **Số card Mẫu CV:** Figma có thể 6 card (2×3); code 4 → giữ 4 hoặc thêm 2 card khi có nội dung.
- **Features top row:** Code 3 thẻ; mô tả Figma có “4 blocks” → cần mở Figma xem đúng 3 hay 4.
- **Carousel:** Yêu cầu “>= md: carousel” – code hiện grid, không carousel; có thể bổ sung sau nếu Figma có carousel rõ ràng.
