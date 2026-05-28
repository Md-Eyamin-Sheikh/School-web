# Damagara Syed Meena Dimukhe High School Portal

Welcome to the official digital portal for **Damagara Syed Meena Dimukhe High School**, a modern, responsive, and high-performance educational platform designed to connect students, parents, administrators, and the wider community.

**Live Site:** [https://sparkling-ganache-17789c.netlify.app/](https://sparkling-ganache-17789c.netlify.app/)

---

## 📱 Designed for 98% Mobile Users (মোবাইল বান্ধব ডিজাইন)

With over 98% of target audiences accessing this platform on their smartphones, the application has been engineered with a **Mobile-First paradigm**. It delivers an outstanding handheld experience through rapid loading, intuitive navigation, and high-contrast visuals:

*   **Mobile Quick Service Cell**: A dedicated mobile hub featuring 4 focal shortcuts optimized with fluid touch targets:
    1.  **Online Admissions (অনলাইন ভর্তি)**
    2.  **Marksheet & Results (মার্কশিট ও ফল)**
    3.  **Tap-to-Call Hotline (জরুরি হেল্পলাইন)**
    4.  **360° Virtual Campus (ভার্চুয়াল ক্যাম্পাস ট্যুর)**
*   **Touch-First Engineering**: Interactive buttons, input lines, and tabs have a minimum click/touch area of `44px` to eliminate accidental taps.
*   **Fluid Responsive Layout**: Custom layouts adapt beautifully to narrow viewport dimensions, ensuring text is readable without zooming.
*   **Bilingual Translation**: Complete dual-language support (English & Bengali) toggled seamlessly across all views.

---

## 🛠️ Core Functional Modules

### 1. Frequently Asked Questions (FAQ) Accordion
Located right on the homepage, a polished bilingual FAQ section provides helpful, interactive answers regarding admission fees, result lookups, routines, and campus life. It uses:
*   A responsive, bordered accordion card container.
*   State-controlled toggle animations (`Plus` & `Minus` transition states).
*   Dynamic localized content (automatically switches when Bengali is active).

### 2. Live Marksheet & Academic Results
An online lookup portal designed to fetch and display student progress reports.
*   Enters student/roll IDs to retrieve dynamic grades, GPA, and exam subjects securely.
*   Real-time notifications powered by Firestore database listeners.

### 3. Dynamic Online Admission
Streamlined enrollment forms for prospective students and parents.
*   Clearly structured digital forms, visual steps, and clear fee breakdowns.
*   Data submitted is stored securely inside the cloud database.

### 4. Admin Access Bypass & Database Security
Bypassing complicated email credential prompts, developers and evaluators can instantly boot into realistic test cases:
*   **Secure Admin Mode**: Log in securely as an Academic Coordinator (Abu Bakar) to seed mock notices, modify event structures, and approve operations.
*   **Interactive Student Session**: Log in as a student (Tasnim Rahman) to query individual marks reports.
*   **Admin-Only Media Uploads**: Gallery management is secured. The upload section is exclusive to the Admin Panel, and dynamic photo deletion tools are displayed in the main Gallery view only when logged in as an administrator.

---

## ⚡ Technology & Architecture

*   **Frontend**: React 19 with Vite 6, TypeScript, and a component-based single-page application structure.
*   **Styling**: Tailwind CSS 4 utility classes, responsive mobile-first layouts, custom CSS, and Google Fonts pairing (Inter + Space Grotesk).
*   **Backend**: Express 4 server written in TypeScript and run with `tsx` during development.
*   **Database & Auth**: Firebase Authentication and Firestore real-time data streams, configured through `firebase-applet-config.json`.
*   **Media Uploads**: Multer memory uploads with Cloudinary storage for gallery and admin-managed media.
*   **Notifications**: Nodemailer SMTP email support, plus optional SMS dispatch through Twilio-compatible environment variables.
*   **Maps & Location**: Leaflet with OpenStreetMap tiles for campus location, directions, nearby search, and distance tools.
*   **Animation & UI**: `motion` for interface animation and `lucide-react` for consistent iconography.
*   **Build Output**: Vite builds the frontend while `esbuild` bundles the Express server into `dist/server.cjs`.

---

## 🚀 Running Locally

1. Clone or export the project files.
2. Install dependencies:
   ```bash
   cd SchoolBackend && npm install
   cd ../Schoolweb && npm install
   ```
   If you are already inside `Schoolweb`, run:
   ```bash
   npm install
   npm --prefix ../SchoolBackend install
   ```
3. Copy `.env.example` to `.env` and update the required values for Firebase, Cloudinary, SMTP, and optional SMS services.
4. Make sure `firebase-applet-config.json` contains the Firebase project configuration and Firestore database ID.
5. Start the local development servers from `Schoolweb`:
   ```bash
   npm run dev
   ```
   This launches both the Express API on `http://127.0.0.1:3001` and Vite on `http://localhost:5173`.
   To run only the Vite frontend, use:
   ```bash
   npm run dev:frontend
   ```
6. Build the production package:
   ```bash
   npm run build
   npm --prefix ../SchoolBackend run build
   ```
7. Run the production server after building:
   ```bash
   npm --prefix ../SchoolBackend start
   ```

## ✅ Useful Scripts

*   `npm run dev` - starts the Express API backend and Vite frontend together.
*   `npm run dev:frontend` - starts only Vite.
*   `npm run dev:backend` - starts only the Express API backend from `../SchoolBackend`.
*   `npm run build` - builds the Vite frontend.
*   `npm --prefix ../SchoolBackend run build` - bundles the Express backend.
*   `npm --prefix ../SchoolBackend start` - runs the bundled backend server.
*   `npm run preview` - previews the Vite production build.
*   `npm run lint` - runs TypeScript checks with `tsc --noEmit`.

## 🌐 Netlify + Backend Deployment

The deployed frontend is:

```bash
https://sparkling-ganache-17789c.netlify.app
```

Deploy `SchoolBackend` separately to a Node host, then add this environment variable in Netlify before rebuilding the frontend:

```bash
VITE_API_BASE_URL="https://school-backend-rust.vercel.app"
```

On the backend host, set:

```bash
FRONTEND_URL="https://sparkling-ganache-17789c.netlify.app"
```
