# 🎓 ExamPortal

Welcome to **ExamPortal**, a comprehensive and modern platform designed to create, manage, and take examinations online. 

Built with scalability and user experience in mind, this application provides dedicated interfaces for both administrators (teachers/creators) and students. It is powered by React on the frontend and Firebase on the backend.

---

## ✨ Features

### For Administrators & Teachers
- **Admin Dashboard:** A centralized hub to track active exams, student results, and analytics.
- **Exam Builder:** A powerful tool to easily create new exams, add multiple-choice questions, and define correct answers.
- **Question Banks:** Manage reusable question banks for quick exam generation.
- **Result Analytics:** View detailed reports on student performance, scores, and completion times.
- **Access Control & Security:** Configure exam rules, time limits, and security settings for participants.

### For Students
- **Student Portal:** A clean, distraction-free environment to view available exams.
- **Real-Time Exam Runner:** Take exams with a countdown timer, progress tracking, and intuitive navigation.
- **Instant Results:** Immediate score calculation and feedback upon exam submission.

### Technical Highlights
- **Real-Time Database:** Utilizes Firebase Firestore for seamless data syncing and management.
- **Responsive Design:** Fully mobile-friendly and accessible interfaces built with Tailwind CSS.
- **Modern Stack:** Blazing fast development and production builds powered by Vite and React.

---

## 🚀 Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Ensure you have the following installed on your machine:
- [Node.js](https://nodejs.org/en/) (v16.0 or higher recommended)
- npm or yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/PrincePanara/Examportal.git
   cd ExamPortel
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure Firebase:**
   The project is pre-configured to use Firebase. Ensure that your Firebase credentials in `src/firebase.ts` are correct and match your Firebase project settings.

4. **Run the development server:**
   ```bash
   npm run dev
   ```

5. **Open in Browser:**
   Navigate to `http://localhost:5173/` in your browser to view the application.

---

## 🛠️ Built With

* **[React](https://reactjs.org/)** - The web framework used for building the user interface.
* **[Vite](https://vitejs.dev/)** - Next Generation Frontend Tooling for fast development.
* **[Firebase](https://firebase.google.com/)** - Backend-as-a-Service for database (Firestore) and analytics.
* **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework for rapid UI styling.
* **[TypeScript](https://www.typescriptlang.org/)** - For adding static typing to JavaScript.

---

## 📂 Project Structure

```text
ExamPortel/
├── src/
│   ├── components/    # Reusable UI components (admin, exam, ui)
│   ├── contexts/      # React Contexts for state management (Auth, Theme)
│   ├── data/          # Mock data or static constants
│   ├── hooks/         # Custom React hooks (e.g., useCountdown)
│   ├── pages/         # Application Views/Pages (Dashboard, ExamRunner, etc.)
│   ├── services/      # API and Database calls
│   ├── types/         # TypeScript type definitions
│   ├── firebase.ts    # Firebase Initialization & Config
│   ├── App.tsx        # Main application component routing
│   └── index.css      # Global styles & Tailwind directives
└── ...
```

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).

---

## 🔗 Links
- **GitHub Repository:** [https://github.com/PrincePanara/Examportal](https://github.com/PrincePanara/Examportal)

---

<p align="center">
  Made with 🤫 by <b>PrincePanara</b>
</p>
