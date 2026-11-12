# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some Oxlint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.

## Dashboard & Firestore

This application utilizes Firebase Authentication and Firestore for the Dashboard UI.

**Enabling Firestore:**
1. Go to the Firebase Console -> Build -> Firestore Database -> Create database.
2. Under "Rules", paste the following security rules to ensure users can only access their own data:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
      
      match /{document=**} {
        allow read, write: if request.auth != null && request.auth.uid == uid;
      }
    }
    
    match /active_sessions/{uid} {
      allow read, write: if request.auth != null && request.auth.uid == uid;
    }
  }
}
```

**Test Checklist:**
- [x] Register -> Automatically lands on /dashboard
- [x] Refresh -> Keeps the session
- [x] Logout -> Returns to Home/Login
- [x] Login -> Lands back on Dashboard
- [x] "Days Active" renders correctly
- [x] Sidebar links all resolve to "Coming soon" gracefully without 404s
- [x] Mobile drawer (hamburger) opens and closes sidebar correctly
