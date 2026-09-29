# Bubble Paws – Pet Grooming Management System

React + Vite + Tailwind CSS + Supabase

Flow: Booking → Grooming → เสร็จ → Notification → Payment → รับสัตว์กลับ

## โครงสร้าง
```
├── index.html
├── package.json / vite.config.js / tailwind.config.js / postcss.config.js
├── vercel.json
├── .env.example
├── supabase/schema.sql
└── src/
    ├── main.jsx, App.jsx, index.css
    ├── lib/        supabase.js, constants.js (แก้บริการ/ราคา/ทรงที่นี่)
    ├── hooks/      useData.js
    ├── components/ Modal.jsx
    └── pages/      Dashboard, Customers, Booking, Queue, Pos, PublicBooking

## หน้าจองคิวสำหรับลูกค้า
เปิดที่เส้นทาง `/booking` (เช่น `https://your-domain.com/booking`) ไม่ต้องล็อกอิน
ลูกค้ากรอกเบอร์โทร → ถ้าเคยมาแล้วระบบดึงข้อมูลสัตว์เลี้ยงให้เลือก ถ้าเป็นลูกค้าใหม่กรอกชื่อและข้อมูลสัตว์เลี้ยงเองได้เลย
จากนั้นเลือกวันเวลา บริการ ทรงตัดขน และแนบรูป Reference ได้เหมือนหน้าจองของพนักงาน
คิวที่ลูกค้าจองจะเข้าคอลัมน์ "จองแล้ว" ในหน้าคิวช่างทันที มีลิงก์ไปหน้านี้อยู่ที่แถบเมนูซ้ายของฝั่งพนักงาน (จอกว้าง)

### QR code สำหรับติดหน้าร้าน
ที่แถบเมนูซ้าย กดปุ่ม "แสดง QR code ให้ลูกค้าสแกน" จะได้ QR ที่ลิงก์ไปหน้า `/booking` ของเว็บที่ deploy ไว้จริง (สร้างจาก URL ปัจจุบันของเบราว์เซอร์ ต้องเปิดผ่านโดเมนที่ deploy แล้วเท่านั้น ไม่ใช่ localhost) ปริ้นหน้าจอนั้นไปติดหน้าร้านได้เลย เพราะข้อมูลไปเก็บที่ Supabase ฐานข้อมูลกลาง ลูกค้าสแกนจากมือถือของตัวเองแล้วเข้าคิวช่างของร้านได้จริง ไม่เหมือนเวอร์ชัน localStorage เดิม

## 1) ตั้งค่า Supabase
1. สร้างโปรเจกต์ที่ supabase.com
2. เปิด SQL Editor → วางเนื้อหา `supabase/schema.sql` → Run (สร้างตาราง + bucket `references` สำหรับรูป)
3. Project Settings → API → คัดลอก Project URL และ anon public key

## 2) รันในเครื่อง
```bash
cp .env.example .env     # ใส่ค่าจาก Supabase
npm install
npm run dev
```

## 3) ขึ้น GitHub
```bash
git init && git add . && git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/<user>/<repo>.git
git push -u origin main
```

## 4) Deploy บน Vercel
1. vercel.com → Add New → Project → เลือก repo
2. Framework: Vite (ตรวจจับอัตโนมัติ)
3. Environment Variables: เพิ่ม `VITE_SUPABASE_URL` และ `VITE_SUPABASE_ANON_KEY`
4. Deploy

## ข้อควรระวัง
- **ยังไม่มีระบบล็อกอิน** policy ใน schema.sql เปิดให้ใครก็ตามที่มีลิงก์อ่าน/เขียนข้อมูลได้ ก่อนใช้กับข้อมูลลูกค้าจริงควรเพิ่ม Supabase Auth และจำกัดสิทธิ์
- **Notification** บันทึกลงตารางและแสดงในระบบ ยังไม่ส่ง LINE/SMS จริง
