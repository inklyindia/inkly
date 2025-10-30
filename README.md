
# Inkly - India POD Scaffold

This package contains a basic scaffold for an India-only Print-on-Demand platform (frontend + backend).

## What's included
- frontend/: React prototype (src/App.jsx)
- backend/: Node/Express API with Razorpay order creation & payment verification
- README with deployment steps and next actions

## How to run locally (basic)
### Backend
1. cd backend
2. npm install
3. Create a .env with:
   MONGO_URI=<your_mongo_uri>
   RAZORPAY_KEY_ID=<your_key_id>
   RAZORPAY_KEY_SECRET=<your_key_secret>
4. npm start (runs on port 4000)

### Frontend
1. cd frontend
2. npm install
3. Start dev server (depends on setup; scaffold uses react-scripts):
   npm start
4. The frontend expects the backend at /api (use a proxy or set REACT_APP_API_BASE)

## Deployment suggestions
- Frontend: Vercel (connect repo, set env vars)
- Backend: Railway / Render / Heroku (set env vars, MONGO_URI)
- Storage: S3 or DigitalOcean Spaces for uploaded designs
- Payments: Razorpay (complete KYC for payouts)

## Next steps I can help with (choose any)
- Create a GitHub repo and push these files
- Deploy frontend to Vercel and backend to Railway/Render and configure domain
- Implement Fabric.js design editor and vendor dashboard
- Connect vendors and perform a live test order flow

