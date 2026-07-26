# Maaz LMS - Resources & Tech Stack

## Frontend

| Dependency | Version | Purpose |
|-----------|---------|---------|
| React | ^19.2.8 | UI library |
| React DOM | ^19.2.8 | DOM rendering |
| React Router DOM | ^7.18.1 | Client-side routing |
| @clerk/clerk-react | ^5.61.3 | Authentication UI |
| Axios | ^1.18.1 | HTTP client |
| Framer Motion | ^12.42.2 | Animations |
| Lucide React | ^1.27.0 | Icon library |
| React Toastify | ^11.1.0 | Toast notifications |
| Quill | ^2.0.3 | Rich text editor |
| React YouTube | ^10.1.0 | YouTube video player |
| Humanize Duration | ^3.34.0 | Duration formatting |
| RC Progress | ^4.0.0 | Progress indicators |
| Phosphor React | ^1.4.1 | Icon library (legacy) |
| @formspree/react | ^3.0.0 | Form handling |
| Uniqid | ^5.4.0 | Unique ID generation |

### Dev Dependencies

| Package | Version | Purpose |
|---------|---------|---------|
| Vite | ^8.1.5 | Build tool and dev server |
| @vitejs/plugin-react | ^6.0.4 | React plugin for Vite |
| Tailwind CSS | ^3.4.17 | CSS framework |
| PostCSS | ^8.5.23 | CSS post-processing |
| Autoprefixer | ^10.5.4 | CSS vendor prefixes |
| ESLint | ^10.8.0 | JavaScript linting |
| @eslint/js | ^10.0.1 | ESLint recommended configs |
| eslint-plugin-react | ^7.37.5 | React ESLint rules |
| eslint-plugin-react-hooks | ^7.1.1 | React hooks ESLint rules |
| eslint-plugin-react-refresh | ^0.5.3 | React refresh ESLint rules |
| globals | ^17.7.0 | Global variable definitions |
| @types/react | ^19.2.17 | React TypeScript types |
| @types/react-dom | ^19.2.3 | React DOM TypeScript types |

## Backend

| Dependency | Version | Purpose |
|-----------|---------|---------|
| Express | ^4.21.2 | Web framework |
| Mongoose | ^8.10.0 | MongoDB ODM |
| @clerk/express | ^2.1.46 | Clerk middleware for Express |
| Stripe | ^22.3.2 | Payment processing |
| Cloudinary | ^2.10.0 | Image storage |
| Svix | ^1.99.1 | Webhook handling |
| Multer | ^2.2.0 | File upload handling |
| Dotenv | ^17.4.2 | Environment variables |
| Cors | ^2.8.6 | CORS middleware |
| Nodemon | ^3.1.14 | Auto-restart dev server |

## Infrastructure

| Service | Purpose |
|---------|---------|
| MongoDB | Database |
| Clerk | Authentication (OAuth, JWT) |
| Stripe | Payments and checkout |
| Cloudinary | Image/video storage and CDN |
| Vercel | Deployment platform |
| Svix | Webhook event processing |

## Environment Variables Required

### Frontend (.env)
```
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_BACKEND_URL=http://localhost:3000
VITE_CURRENCY=usd
```

### Backend (.env)
```
MONGODB_URI=mongodb+srv://...
CLOUDINARY_NAME=...
CLOUDINARY_API_KEY=...
CLOUDINARY_SECRET_KEY=...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
CLERK_WEBHOOK_SECRET=...
CURRENCY=usd
PORT=3000
```