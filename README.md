<p align="center">
  <img src="public/favicon.svg" alt="SDC Logo" width="80" height="80" />
</p>

<h1 align="center">SDC — Software Development Club</h1>

<p align="center">
  <strong>CUCEK · Cochin University of Science and Technology</strong>
</p>

<p align="center">
  The official platform for the Software Development Club at the Cochin University College of Engineering Kuttanad (CUCEK), where students come together to learn, build, and grow — with mentorship from seniors.
</p>

<p align="center">
  <a href="#features">Features</a> •
  <a href="#tech-stack">Tech Stack</a> •
  <a href="#getting-started">Getting Started</a> •
  <a href="#project-structure">Project Structure</a> •
  <a href="#contributing">Contributing</a> •
  <a href="#license">License</a>
</p>

---

## Features

- **Dashboard** — Club stats, activity feed, and terminal-style logs
- **Member Directory** — Browse and search club members with profiles and avatars
- **Schedule & Timetable** — View upcoming sessions, workshops, and mentorship slots
- **Event Ticketing & RSVP** — Book event passes with QR codes, admin scanning & verification
- **Gallery** — Photo gallery with Supabase storage integration
- **User Profiles** — Authentication, onboarding, and personal profiles
- **Admin Panel** — Manage events, members, sessions, and scan tickets
- **3D & Animations** — Three.js models, GSAP animations, Framer Motion transitions, and Aurora effects

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | [React 19](https://react.dev) + [TypeScript](https://www.typescriptlang.org) |
| **Build Tool** | [Vite](https://vite.dev) |
| **Styling** | [Tailwind CSS v4](https://tailwindcss.com) |
| **Backend & Auth** | [Supabase](https://supabase.com) (PostgreSQL, Auth, Storage) |
| **Animations** | [Framer Motion](https://www.framer.com/motion/), [GSAP](https://gsap.com), [Lenis](https://lenis.darkroom.engineering) |
| **3D** | [Three.js](https://threejs.org), [OGL](https://ogl.dev) |
| **QR & Tickets** | [qrcode.react](https://github.com/zpao/qrcode.react), [html2canvas](https://html2canvas.hertzen.com), [jsPDF](https://github.com/parallax/jsPDF) |
| **Icons** | [Lucide React](https://lucide.dev) |
| **Hosting** | [Vercel](https://vercel.com) |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org) (v18 or later)
- [npm](https://www.npmjs.com) (comes with Node.js)
- A free [Supabase](https://supabase.com) project (for backend features)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/zephyrkz0/sdc-website.git
   cd sdc-website
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env
   ```

   Edit `.env` and add your Supabase credentials:

   ```env
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   ```

   > **Note:** The app runs in offline/demo mode with mock data if Supabase isn't configured — so you can explore the UI without a backend.

4. **Set up the database**

   Run the SQL in [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor to create all the required tables, RLS policies, and functions.

5. **Start the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:5173](http://localhost:5173) in your browser.

### Build for Production

```bash
npm run build
npm run preview
```

## Project Structure

```
sdc-website/
├── public/              # Static assets (favicon, icons, images)
│   └── assets/          # Media files (images, GIFs)
├── src/
│   ├── components/      # React components
│   │   ├── 3d/          # Three.js / OGL 3D components
│   │   ├── auth/        # Authentication modals & flows
│   │   ├── common/      # Shared UI (Navbar, Footer, Aurora, etc.)
│   │   ├── dashboard/   # Dashboard & stats views
│   │   ├── gallery/     # Photo gallery
│   │   ├── landing/     # Landing page sections
│   │   ├── profile/     # User profile components
│   │   ├── roster/      # Member directory
│   │   ├── schedule/    # Timetable & session management
│   │   └── ticketing/   # Event RSVP, tickets, QR scanning
│   ├── context/         # React context (AuthContext)
│   ├── data/            # Mock/seed data
│   ├── lib/             # Supabase client setup
│   ├── services/        # API service layers (events, tickets, gallery, members)
│   ├── types/           # TypeScript type definitions
│   └── utils/           # Utility functions
├── supabase/
│   └── schema.sql       # Database schema, RLS policies & functions
├── .env.example         # Environment variable template
├── vercel.json          # Vercel deployment config
└── package.json
```

## Contributing

Contributions are welcome! Whether it's a bug fix, feature, or documentation improvement — we appreciate your help.

1. **Fork** the repository
2. **Create a branch** for your feature (`git checkout -b feature/your-feature`)
3. **Commit** your changes (`git commit -m 'Add your feature'`)
4. **Push** to your branch (`git push origin feature/your-feature`)
5. **Open a Pull Request**

Please make sure your code builds without errors (`npm run build`) before submitting.

## License

This project is licensed under the **GNU General Public License v3.0** — see the [LICENSE](LICENSE) file for details.

---

<p align="center">
  Built with ❤️ by the SDC team at CUCEK
</p>
