ALPHA-CORE v2.0


ALPHA-CORE คือระบบจำลองการซื้อขายความถี่สูง (HFT) และสถาปัตยกรรม Microservices ที่ออกแบบมาเพื่อศึกษาพฤติกรรมตลาดในสภาวะวิกฤต (Black Swan Events) โดยใช้การคำนวณราคาแบบ Stochastic และการควบคุมความผันผวนแบบ Real-time

Project Goal: เพื่อสร้างสภาพแวดล้อมที่ปลอดภัยในการทดสอบอัลกอริทึม Risk Mitigation สำหรับงานวิจัยด้าน Quantum AI

🏗️ System Architecture
สถาปัตยกรรมแบบ Distributed Microservices ที่สื่อสารกันผ่าน REST API และ WebSockets:

API Gateway (Port 3000): ด่านหน้าจัดการ Routing, Security Proxy และ Request Filtering

Auth Service (Port 3001): ระบบยืนยันตัวตนระดับ Fintech (Argon2 Hashing, JWT, RBAC)

Market Data Service (Port 3003): Engine บงการราคาตลาดและส่งข้อมูลแบบ Real-time Socket.io

Research Terminal (Port 3002):

Admin Dashboard: สำหรับบงการตลาด (Manipulation Mode, Volatility Control)

Trading UI: สำหรับผู้ใช้งานจำลอง (Live PnL, Position Tracking, Technical Charts)

⚡ Key Features
👑 Admin Manipulation Node

Price Overriding: แทรกแซงราคาตลาดได้ทันทีเพื่อทดสอบความเสถียรของระบบ

Volatility Matrix: ปรับระดับความผันผวนได้ 4 ระดับ: Low, Normal, High, และ Crash

Kernel Logging: ระบบติดตามการทำงานของ Microservices ทุกตัวในหน้าจอเดียว

💹 Quantitative Trading Terminal

Live PnL Engine: คำนวณกำไร/ขาดทุนแบบ Real-time ตามราคาที่ได้รับจาก Socket

Position Management: ระบบคำนวณต้นทุนเฉลี่ย (Average Cost) และปริมาณการถือครอง (Holdings)

Dynamic UI: กราฟ Candlestick ความละเอียดสูงที่ปรับตัวตามข้อมูลที่บงการมาจาก Admin

🛠️ Tech Stack
Category	Technologies
Frontend	Next.js 15, TailwindCSS, Lucide Icons, Lightweight-Charts
Backend	NestJS (Microservices), RxJS, Socket.io
Security	JWT, Argon2, Access/Refresh Token Guard, RBAC
Networking	Axios, API Gateway Proxy, WebSockets
🚀 Getting Started
1. Prerequisites

Node.js (v20+ recommended)

NPM or PNPM

2. Installation

ติดตั้ง Dependencies ทั้งหมดสำหรับทุก Microservice:

Bash
# Install core dependencies
npm install @nestjs/microservices @nestjs/jwt @nestjs/passport passport passport-jwt argon2 class-validator class-transformer axios js-cookie socket.io-client lightweight-charts lucide-react http-proxy-middleware
3. Environment Setup

สร้างไฟล์ .env ในแต่ละ Service (Auth, Market, Gateway) โดยระบุค่าดังนี้:

ข้อมูลโค้ด
JWT_SECRET=your_quantum_secret_key
DATABASE_URL=mongodb+srv://...
PORT_GATEWAY=3000
PORT_AUTH=3001
PORT_MARKET=3003
4. Running the Project

แนะนำให้เปิด Terminal แยก 4 หน้าต่างเพื่อรันตามลำดับ:

Auth Service: npm run start:dev auth

Market Service: npm run start:dev market-data

API Gateway: npm run start:dev api-gateway

Frontend: npm run dev

🧪 Scientific Context
ในโปรเจกต์นี้ เราประยุกต์ใช้สมการ Stochastic เพื่อจำลองความเคลื่อนไหวของราคาแบบสุ่ม (Random Walk) ซึ่งเป็นพื้นฐานในการทดสอบอัลกอริทึม Quantum Risk Mitigation:

P 
t+1
​	
 =P 
t
​	
 ×(1+Δvolatility)
โดยที่ราคาในวินาทีถัดไป (P 
t+1
​	
 ) จะถูกกำหนดโดยระดับความผันผวนที่ Admin เลือกใช้งาน