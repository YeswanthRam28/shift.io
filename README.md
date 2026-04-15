# Shift.io | Competitive Multiplayer 2048

## 🚀 Overview

**Shift.io** is a next-generation competitive arena for 2048 enthusiasts. Battle against multiple opponents in real-time, harness chaotic sabotages, and climb the global leaderboard to become the ultimate Cyber-Ace.

### Key Features
- **Real-time PvP**: Battle up to 4+ players simultaneously.
- **Sabotage Mechanics**: Freeze boards, shuffle tiles, or drop junk rows to disrupt your rivals.
- **Ranked Progression**: ELO-based matchmaking system with tiers from Bronze to Cyber-Ace.
- **Responsive Design**: Premium, glassmorphic UI built for both desktop and mobile performance.

---

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, Tailwind CSS 4, Motion (Framer Motion)
- **Backend**: Node.js, Express, Socket.io
- **Database**: PostgreSQL (Prisma ORM)
- **Deployment**: Optimized for Vercel (Frontend) & Persistent VPS (Backend)

---

## 🛠️ Development Setup

### Prerequisites
- Node.js (v18+)
- PostgreSQL Database (Supabase recommended)

### Local Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/YeswanthRam28/shift.io.git
   cd shift.io
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Configure Environment Variables**:
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="your_postgresql_url"
   SUPABASE_URL="your_supabase_url"
   SUPABASE_ANON_KEY="your_anon_key"
   PORT=3000
   ```

4. **Initialize Database**:
   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. **Start Development Server**:
   ```bash
   npm run dev
   ```

---

## 🚢 Deployment

### Vercel
This project is configured for seamless deployment on Vercel. 
1. Connect your repository to Vercel.
2. Set the **Build Command** to `npm run build`.
3. Set the **Output Directory** to `dist`.
4. Add your Environment Variables in the Vercel Dashboard.

*Note: For production Socket.io functionality, a persistent backend hosting service like Railway or Render is recommended.*

---

## 📄 License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
