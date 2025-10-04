
# Manikanta

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.2.2.

## Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
=======
# 🌍 Tourizio – Tourism Platform

Tourizio is a modern **tourism information and booking platform** built with **Angular, TailwindCSS, Firebase, EmailJS, Web3Forms, and Swiper.js**.  
It allows users to explore destinations, read travel blogs, book trips, and enjoy a smooth, responsive experience with animations.

🔗 **Live Demo:** Coming Soon

Example placement:

```markdown
# 🌍 Tourizio – Tourism Platform

![License](https://img.shields.io/badge/license-MIT-green)
![Angular](https://img.shields.io/badge/angular-15-blue)
![Vercel](https://img.shields.io/badge/deployed-vercel-purple)

Tourizio is a modern **tourism information and booking platform** ...

## 📑 Table of Contents
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
- [Authentication](#-authentication)
- [Profile / Bookings](#-profile--bookings)
- [Screenshots](#-screenshots)
- [Deployment](#-deployment)
- [Contributing](#-contributing)
- [License](#-license)


---

## ✨ Features

- 🏝️ **Explore Destinations** – Featured attractions like Taj Mahal, Kerala Backwaters, Goa Beaches, and more.  
- 📖 **Travel Blog** – Dynamic blog section with images from **Pexels API**, categories, tags, likes, and skeleton loaders.  
- 🎠 **Carousels & Sliders** – Fully responsive image sliders powered by **Swiper.js**.  
- 🔐 **Authentication** – Firebase Auth with **Google Sign-In**, Email/Password login & signup.  
- ✉️ **Booking via EmailJS** – Booking requests sent using **EmailJS** (client-side) for quick booking emails.  
- 📨 **Contact via Web3Forms** – Contact form powered by **Web3Forms** (easy-to-configure form endpoint).  
- 🎨 **Modern UI** – Clean TailwindCSS design with gradient buttons, hover effects, and smooth transitions.  
- 📱 **Responsive Design** – Optimized for mobile, tablet, and desktop.  
- ⚡ **Performance Optimized** – Images converted to **WebP**, lazy loading enabled, scroll reveal animations.  
- ☁️ **Deployment** – Hosted on **Vercel**.

---

## 🛠️ Tech Stack

- **Frontend:** Angular, TypeScript, TailwindCSS  
- **UI / Controls:** Swiper.js, CSS animations  
- **Authentication & Hosting:** Firebase Auth (config in `environment.ts`)  
- **Booking Emails:** EmailJS (`@emailjs/browser`)  
- **Contact Form:** Web3Forms (API endpoint)  
- **Image sourcing (blog):** Pexels API  
- **Hosting / CI:** Vercel (project deployed)

---

## 📂 Project Structure

```
src/
├── app/
│ ├── components/ (navbar, footer, home, mini-map)
│ ├── pages/ (blog, login, profile, signup, destinations)
│ ├── services/ (auth, booking, user-session)
│ ├── app.module.ts
│ ├── app.component.ts
│ └── app-routing.module.ts
├── assets/
│ ├── data/ (JSON files: destinations.json, blogs.json etc.)
│ └── images/ (images)
├── environments/
│ ├── environment.ts
│ └── environment.prod.ts

```

---

## 🚀 Getting Started  

### 1️⃣ Clone the repo
```bash
git clone -b baratam-sri-manikanta https://github.com/Springboard-Internship-2025/Web-Portal-Development-for-Tourism-Information-and-Booking_September_2025.git
cd Web-Portal-Development-for-Tourism-Information-and-Booking_September_2025

```
### 2️⃣ Install dependencies
```bash
npm install
```
### 3️⃣ Set up environment variables
Create an environment.ts file in src/environments/ and add your Firebase keys:
```bash
export const environment = {
  production: false,
  firebase: {
    apiKey: "YOUR_FIREBASE_KEY",
    authDomain: "your-app.firebaseapp.com",
    projectId: "your-app",
    storageBucket: "your-app.appspot.com",
    messagingSenderId: "xxxx",
    appId: "xxxx"
  },
};

```
### 4️⃣ Run the project
```bash
ng serve
```
Now open 👉 http://localhost:4200

---

## 🔑 Authentication

- **🔐 Email/Passwordd**
  - Signup & Login.
- **🔑 Google Sign-In**
  - Firebase OAuth.
- **🔄 Session Handling**
  - Redirect users after login / logout.

---
## 👤 Profile / Bookings

Logged-in users can view their bookings, see destination, date, people, and total price. They can also cancel bookings.  
Non-logged-in users are prompted to log in.

```html
<!-- profile.component.html snippet -->
<div *ngIf="user; else notLoggedIn">
  <ul *ngIf="bookings.length > 0">
    <li *ngFor="let b of bookings">
      {{ b.destination }} - {{ b.date | date:'longDate' }} - ₹{{ b.price * b.people }}
    </li>
  </ul>
</div>

## 📸 Screenshots

### 🏠 Homepage
![Homepage](public/homepage.png)

### 🏖️ Destinations
![Destinations](public/destinations.png)

### 📰 Blog
![Blog](public/blog.png)

### 🔐 Auth (Login / Signup)
![login](public/login.png)
![signup](public/signup.png)

---

## 📦 Deployment

### 🚀 Vercel
Auto-deployment via GitHub integration.

Manually:
```bash
vercel --prod
```

---

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!
Feel free to fork the repo, open a PR, or raise an issue.

---
## 📜 License

This project is licensed under the **MIT License**.  
You are free to use, modify, and distribute it under the terms of the MIT License.  

> ⚠️ Note: This repository/branch is based on the original project by [Your Friend’s Name or GitHub handle].

---
>>>>>>> 66f0183 (Initial commit: updated Tourizio project with polished home page)
