# Kim Hoàng Next Gen

Prototype giao diện mới cho website Kim Hoàng, tách riêng khỏi dự án OCR và Coffee Shop.

## Chạy local

```bash
cd "kimhoang-next-gen"
python3 -m http.server 4173
```

Mở trình duyệt tại:

```text
http://localhost:4173/
```

## Nội dung đã dùng

- Logo và brand asset từ thư mục local `ai_project_ocr/assets`.
- Ảnh và nội dung tham khảo từ website công khai `https://kimhoang.vn/`.

## Cấu trúc

- `index.html`: nội dung landing page.
- `styles.css`: giao diện, responsive, reveal animation, scrollytelling.
- `script.js`: scroll progress, sticky story stage, reveal logic.
- `assets/`: ảnh dùng trong prototype.
- `screenshots/`: ảnh kiểm tra desktop/mobile.
