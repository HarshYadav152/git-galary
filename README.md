# GitHub Galary

A visually stunning, futuristic web app to discover random GitHub user avatars, explore user details, and filter by various criteria. Built with Next.js, React, Tailwind CSS, and the GitHub API.

---

## 🚀 Features

- **Random GitHub Avatars:** See a grid of random GitHub user avatars, refreshed on shuffle.
- **User Details Modal:** Click any avatar to view username, profile link, and public repo count in a beautiful modal.
- **Download Avatars:** Download any avatar with a single click.
- **Search:** Find users by GitHub username.
- **Advanced Filters:** Filter users by min public repos, followers, total stars, location, and account type (User/Organization).
- **API Rate Limit Status:** See your current GitHub API rate limit and when it resets.
- **Developer Section:** Paste your own GitHub Personal Access Token (PAT) to increase your rate limit from 60 to 5,000 requests/hour.
- **Terms & Conditions Modal:** Users must accept terms on first load, with links to GitHub's Terms of Service and a docs section.
- **Responsive Design:** Fully responsive and mobile-friendly.
- **Futuristic UI:** Glassmorphism, neon accents, and a modern, immersive look.
- **Navbar:** Minimal, with a live indicator and GitHub star/fork icons. Hides on scroll, reappears at the top.
- **Footer:** Credits, tech stack, and links to all used technologies.

---

## 🛠️ Tech Stack

- [Next.js](https://nextjs.org/) (App Router, TypeScript)
- [React](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/)
- [GitHub REST API](https://docs.github.com/en/rest)

---

## 🖥️ Getting Started

1. **Clone the repo:**
   ```bash
   git clone https://github.com/HarshYadav152/git-galary.git
   cd git-galary
   ```
2. **Install dependencies:**
   ```bash
   npm install
   ```
3. **Run the development server:**
   ```bash
   npm run dev
   ```
4. **Open in your browser:**
   Visit [http://localhost:3000](http://localhost:3000)

---

## 🔑 Developer: Increase Your API Rate Limit

- By default, unauthenticated users get **60 requests/hour** (per IP).
- Paste your [GitHub Personal Access Token (PAT)](https://github.com/settings/tokens) in the Developer section to increase your limit to **5,000 requests/hour**.
- No scopes are needed. Your token is only stored in your browser and used for API requests.

---

## 📜 Terms & Conditions

- This app uses the public GitHub API and is not affiliated with GitHub.
- All data is fetched live from GitHub and subject to their [Terms of Service](https://docs.github.com/en/site-policy/github-terms/github-terms-of-service).
- Do not abuse the API or use this app for automated scraping or commercial purposes.
- Your GitHub Personal Access Token (if provided) is only stored in your browser and never sent anywhere else.
- You must accept the terms modal on first use.

---

## 📂 Project Structure

- `src/app/components/` — All UI components (Navbar, AvatarGrid, AvatarCard, UserModal, SearchBar, Filters, DeveloperSection, TermsModal, Footer)
- `src/app/page.tsx` — Main page, orchestrates state and renders components
- `src/app/globals.css` — Futuristic global styles
- `src/app/layout.tsx` — App layout and font setup

---

## 🙏 Credits

- **think by** [Harsh Yadav](https://github.com/HarshYadav152)
- **designed & implemented with** [Cursor](https://cursor.com/)
- **Tech:** [Next.js](https://nextjs.org/), [React](https://react.dev/), [Tailwind CSS](https://tailwindcss.com/), [GitHub API](https://docs.github.com/en/rest)

---

## 📄 License

MIT [License](https://github.com/HarshYadav152/git-galary/LICENSE)