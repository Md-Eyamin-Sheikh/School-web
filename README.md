# Damagara Syed Meena Dimukhe High School Portal

Welcome to the official digital portal for **Damagara Syed Meena Dimukhe High School**, a modern, responsive, and high-performance educational platform designed to connect students, parents, administrators, and the wider community.

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

## ⚡ Tech Stack & Architecture

*   **Frontend**: React 18 with Vite (TypeScript type stripped)
*   **Styling**: Modern Tailwind CSS utility rules, responsive grids, and Google Fonts pairing (Inter + Space Grotesk)
*   **Database & Auth**: Firebase Firestore real-time streams and Firebase OAuth credentials
*   **Icons & Assets**: `lucide-react` modern vector glyph sets

---

## 🚀 Running locally

1. Clone or export the project files.
2. Run package installations:
   ```bash
   npm install
   ```
3. Set your environment parameters inside `.env.example`.
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Build the production package:
   ```bash
   npm run build
   ```
