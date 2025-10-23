# Pet Vaccination Tracker - Complete Setup Guide

## File Structure

```
pet-vaccination-tracker/
│
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── data/
│   │   └── users.json (auto-created)
│   └── uploads/ (auto-created)
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── App.jsx
    │   ├── App.css
    │   └── index.js
    ├── package.json
    └── .gitignore
```

## Prerequisites Installation

### 1. Install Python (3.8 or higher)
- Download from: https://www.python.org/downloads/
- During installation, check "Add Python to PATH"
- Verify: Open terminal and run `python --version`

### 2. Install Node.js (14 or higher)
- Download from: https://nodejs.org/
- Install LTS version
- Verify: Open terminal and run `node --version` and `npm --version`

## Backend Setup (FastAPI)

### Step 1: Create Backend Folder
```bash
mkdir pet-vaccination-tracker
cd pet-vaccination-tracker
mkdir backend
cd backend
```

### Step 2: Create requirements.txt
Create a file named `requirements.txt` with:
```
fastapi==0.104.1
uvicorn==0.24.0
python-multipart==0.0.6
```

### Step 3: Create main.py
Copy the FastAPI backend code into `main.py`

### Step 4: Install Python Dependencies
```bash
pip install -r requirements.txt
```

### Step 5: Run Backend Server
```bash
uvicorn main:app --reload
```

The backend will start at: https://pet-vax-backend.onrender.com

**Keep this terminal running!**

---

## Frontend Setup (React)

### Step 1: Open New Terminal and Navigate to Project Root
```bash
cd pet-vaccination-tracker
```

### Step 2: Create React App
```bash
npx create-react-app frontend
cd frontend
```

### Step 3: Replace App.jsx
Navigate to `frontend/src/` and replace `App.js` with `App.jsx` (rename it) and paste the React frontend code

### Step 4: Replace App.css
Navigate to `frontend/src/` and replace `App.css` with the provided CSS code

### Step 5: Update index.js
Edit `frontend/src/index.js` to:
```javascript
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
```

### Step 6: Run Frontend
```bash
npm start
```

The frontend will start at: http://localhost:3000

**Keep this terminal running too!**

---

## How to Use the Application

### First Time Setup
1. Open browser and go to http://localhost:3000
2. You'll see the registration form
3. Enter your pet's name
4. Select pet's date of birth
5. Click "Register Pet"

### Viewing Vaccination Schedule
- After registration, you'll see all vaccines grouped by type (DAPP, Rabies, Leptospirosis)
- Each vaccine shows:
  - Category (Puppy Series, Adult Dog, Senior Dog)
  - Due date
  - Status (Pending or Completed)

### Marking Vaccine as Done
1. Click "Edit" button on any pending vaccine
2. Click "Choose Proof Image" to upload vaccination proof
3. Select an image from your computer
4. Preview will appear
5. Click "Mark as Done"
6. Status changes to "Completed" ✓

### Viewing Completed Vaccines
1. Click "View" button on completed vaccines
2. See the uploaded proof image
3. Status shows "Vaccination Completed"
4. **Note**: Once marked as done, you CANNOT change it back to pending

### Logout
- Click "Logout" button in top-right
- This will clear your session
- You can register again or login with stored data

---

## Troubleshooting

### Backend Issues

**Error: Port 8000 already in use**
```bash
# Windows
netstat -ano | findstr :8000
taskkill /PID <PID_NUMBER> /F

# Mac/Linux
lsof -ti:8000 | xargs kill -9
```

**Error: Module not found**
```bash
pip install fastapi uvicorn python-multipart
```

### Frontend Issues

**Error: Port 3000 already in use**
- Press `Ctrl+C` in terminal
- Run: `npm start` and choose different port when prompted

**Error: Cannot connect to backend**
- Make sure backend is running at https://pet-vax-backend.onrender.com
- Check if CORS is enabled in backend

**Images not showing**
- Ensure backend uploads folder exists
- Check image path starts with https://pet-vax-backend.onrender.com/uploads/

---

## Testing the Application

### Test Case 1: Puppy Registration
1. Register pet with birth date = 2 months ago
2. Should see Puppy Series vaccines for DAPP
3. Mark one vaccine as done with image
4. Verify status changes and image appears

### Test Case 2: Adult Dog
1. Register pet with birth date = 3 years ago
2. Should see Adult Dog vaccines
3. Mark vaccines as complete

### Test Case 3: Senior Dog
1. Register pet with birth date = 10 years ago
2. Should see Senior Dog vaccines

---

## File Locations

### Backend Files
- **Code**: `backend/main.py`
- **Data**: `backend/data/users.json`
- **Images**: `backend/uploads/`

### Frontend Files
- **Code**: `frontend/src/App.jsx`
- **Styles**: `frontend/src/App.css`
- **Built files**: `frontend/build/` (after npm run build)

---

## Common Commands Reference

### Backend Commands
```bash
# Start backend
cd backend
uvicorn main:app --reload

# Install dependencies
pip install -r requirements.txt

# Check if running
curl https://pet-vax-backend.onrender.com
```

### Frontend Commands
```bash
# Start frontend
cd frontend
npm start

# Install dependencies
npm install

# Build for production
npm run build
```

---

## Data Storage

- All user data is stored in `backend/data/users.json`
- Images are stored in `backend/uploads/`
- User ID is saved in browser's localStorage
- To reset: Delete users.json and clear browser localStorage

---

## Features Summary

✅ Pet registration with DOB
✅ Automatic vaccination schedule generation
✅ Age-based categorization (Puppy/Adult/Senior)
✅ DAPP, Rabies, and Leptospirosis tracking
✅ Image upload for vaccination proof
✅ View uploaded proofs
✅ Cannot un-mark completed vaccines
✅ Persistent data storage
✅ Responsive design

---

## Next Steps After Setup

1. Test registration with different pet ages
2. Upload sample vaccination proof images
3. Check data persistence by refreshing page
4. Try logout and re-login functionality
5. Test with multiple pets (different registrations)

---

## Support

If you encounter issues:
1. Check both terminals are running
2. Verify ports 3000 and 8000 are available
3. Clear browser cache and localStorage
4. Restart both servers
5. Check browser console for errors (F12)