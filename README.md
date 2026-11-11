# ZeroSpoil — Food Rescue & Redistribution Platform

This project is assembled from the complete source supplied in the attached text and follows the ZeroSpoil synopsis: donors publish surplus food, NGOs discover and claim nearby listings, volunteers/NGOs track pickup and delivery, and admins oversee users, listings and activity.

## Technology
- Frontend: React 18, Vite, React Router, Tailwind CSS, Axios, Leaflet, Socket.IO client
- Backend: Node.js (18+), Express, MongoDB/Mongoose, JWT, bcryptjs, Zod, Socket.IO
- Maps: Leaflet + OpenStreetMap

## Prerequisites
1. Install Node.js 18 or newer.
2. Install MongoDB Community Server and make sure the MongoDB service is running, OR create a MongoDB Atlas database.
3. Install Visual Studio Code.

## Setup on Windows

### A. Configure the backend
Open this project folder in VS Code. Open a terminal:

```powershell
cd server
npm install
Copy-Item .env.example .env
```

Open `server/.env` and set `MONGO_URI` to your local MongoDB URL or Atlas connection string. Replace `JWT_SECRET` with a long random secret. Keep `.env` private; never upload it to GitHub.

### B. Add demo data
```powershell
npm run seed
```

**Important:** the seed script deletes existing documents in the ZeroSpoil database before inserting demo data. Use it only with a fresh development database.

### C. Start the backend
```powershell
npm run dev
```
The API should run at http://localhost:5000. You can check http://localhost:5000/api/health.

### D. Start the frontend
Open a second VS Code terminal:
```powershell
cd client
npm install
npm run dev
```
Open the Vite URL shown in the terminal (normally http://localhost:5173).

## Demo accounts
The seed script creates:
| Role | Email | Password |
|---|---|---|
| Admin | admin@zerospoil.com | Admin@123 |
| Donor | donor@zerospoil.com | Donor@123 |
| NGO | ngo@zerospoil.com | Ngo@12345 |

Change these credentials and do not use them in a public deployment.

## Suggested viva demonstration
1. Log in as the donor and publish a listing with an address, map pin and future expiry time.
2. Open another browser/incognito window and log in as the NGO.
3. Browse nearby food, claim the listing, mark it picked up, then delivered.
4. Show the donor's live notifications and the admin dashboard, user verification, listing management and activity log.
5. Create a listing with a short expiry time to demonstrate the expiry job.

## Troubleshooting
- If MongoDB connection fails, check that MongoDB is running and that `MONGO_URI` is correct.
- If maps do not load, check your internet connection; OpenStreetMap tiles/geocoding need internet access.
- If the client cannot reach the API, check that the backend is running on port 5000 and Vite on 5173.
- If npm reports dependency issues, share the exact error and Node/npm versions before changing package versions.

## Important project note
The original source author stated that the code had not been executed. This ZIP is organized from that source, but it has not been fully runtime-tested here. Run it locally, test each role and workflow, and resolve any environment/version errors before submitting or deploying. Food safety, NGO identity verification and local compliance must be checked before real-world use.
