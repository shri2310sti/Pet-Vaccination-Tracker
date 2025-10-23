from fastapi import FastAPI, HTTPException, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, EmailStr
from datetime import datetime, timedelta
from typing import Optional
import json
import os
import base64
import uuid
import hashlib

app = FastAPI()

# Read configuration from environment variables (suitable for Render)
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:3000")
UPLOADS_DIR = os.getenv("UPLOADS_DIR", "uploads")
DATA_DIR = os.getenv("DATA_DIR", "data")
DATA_FILE = os.getenv("DATA_FILE", os.path.join(DATA_DIR, "users.json"))

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create directories
os.makedirs(UPLOADS_DIR, exist_ok=True)
os.makedirs(DATA_DIR, exist_ok=True)

# Mount static files (uploads)
app.mount("/uploads", StaticFiles(directory=UPLOADS_DIR), name="uploads")

# Models
class UserRegistration(BaseModel):
    email: EmailStr
    password: str
    pet_name: str
    date_of_birth: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class VaccineUpdate(BaseModel):
    vaccine_id: str
    is_done: bool
    image_data: Optional[str] = None

# Helper functions
def load_data():
    if os.path.exists(DATA_FILE):
        with open(DATA_FILE, 'r') as f:
            return json.load(f)
    return {}

def save_data(data):
    with open(DATA_FILE, 'w') as f:
        json.dump(data, f, indent=2)

def hash_password(password: str) -> str:
    """Hash password using SHA256"""
    return hashlib.sha256(password.encode()).hexdigest()

def verify_password(password: str, hashed: str) -> bool:
    """Verify password against hash"""
    return hash_password(password) == hashed

def find_user_by_email(email: str):
    """Find user by email"""
    data = load_data()
    for user_id, user_data in data.items():
        if user_data.get('email') == email:
            return user_id, user_data
    return None, None

def calculate_age_category(dob):
    """Calculate if pet is puppy, adult, or senior"""
    birth_date = datetime.strptime(dob, "%Y-%m-%d")
    today = datetime.now()
    age_weeks = (today - birth_date).days / 7
    
    if age_weeks < 52:  # Less than 1 year
        return "puppy"
    elif age_weeks < 416:  # Less than 8 years
        return "adult"
    else:
        return "senior"

def generate_vaccination_schedule(dob):
    """Generate vaccination schedule based on DOB"""
    birth_date = datetime.strptime(dob, "%Y-%m-%d")
    today = datetime.now()
    age_weeks = (today - birth_date).days / 7
    
    schedule = []
    
    # DAPP Schedule
    if age_weeks < 52:  # Puppy
        start_week = 8
        for i in range(4):  # 4 doses typically
            vax_date = birth_date + timedelta(weeks=start_week + (i * 4))
            schedule.append({
                "id": f"dapp_puppy_{i+1}",
                "vaccine": "DAPP",
                "category": "Puppy Series",
                "due_date": vax_date.strftime("%Y-%m-%d"),
                "status": "pending",
                "image_url": None
            })
    else:  # Adult/Senior
        first_booster = birth_date + timedelta(weeks=52)
        years_since_birth = (today - birth_date).days / 365
        booster_count = int(years_since_birth / 3) + 1
        for i in range(booster_count):
            vax_date = first_booster + timedelta(days=365*3*i)
            if vax_date <= today + timedelta(days=365):
                schedule.append({
                    "id": f"dapp_adult_{i+1}",
                    "vaccine": "DAPP",
                    "category": "Adult Dog" if age_weeks < 416 else "Senior Dog",
                    "due_date": vax_date.strftime("%Y-%m-%d"),
                    "status": "pending",
                    "image_url": None
                })
    
    # Rabies Schedule
    if age_weeks >= 12:
        first_rabies = birth_date + timedelta(weeks=12)
        one_year_booster = first_rabies + timedelta(days=365)
        
        schedule.append({
            "id": "rabies_initial",
            "vaccine": "Rabies",
            "category": "Puppy Series" if age_weeks < 52 else ("Adult Dog" if age_weeks < 416 else "Senior Dog"),
            "due_date": first_rabies.strftime("%Y-%m-%d"),
            "status": "pending",
            "image_url": None
        })
        
        years_since_first = (today - first_rabies).days / 365
        if years_since_first >= 1:
            booster_count = int((years_since_first - 1) / 3) + 1
            for i in range(booster_count):
                vax_date = one_year_booster + timedelta(days=365*3*i)
                if vax_date <= today + timedelta(days=365):
                    schedule.append({
                        "id": f"rabies_booster_{i+1}",
                        "vaccine": "Rabies",
                        "category": "Adult Dog" if age_weeks < 416 else "Senior Dog",
                        "due_date": vax_date.strftime("%Y-%m-%d"),
                        "status": "pending",
                        "image_url": None
                    })
    
    # Leptospirosis Schedule
    if age_weeks >= 12:
        first_lepto = birth_date + timedelta(weeks=12)
        second_lepto = first_lepto + timedelta(weeks=3)
        
        schedule.append({
            "id": "lepto_dose1",
            "vaccine": "Leptospirosis",
            "category": "Puppy Series" if age_weeks < 52 else ("Adult Dog" if age_weeks < 416 else "Senior Dog"),
            "due_date": first_lepto.strftime("%Y-%m-%d"),
            "status": "pending",
            "image_url": None
        })
        
        schedule.append({
            "id": "lepto_dose2",
            "vaccine": "Leptospirosis",
            "category": "Puppy Series" if age_weeks < 52 else ("Adult Dog" if age_weeks < 416 else "Senior Dog"),
            "due_date": second_lepto.strftime("%Y-%m-%d"),
            "status": "pending",
            "image_url": None
        })
        
        years_since_first = (today - first_lepto).days / 365
        if years_since_first >= 1:
            for i in range(int(years_since_first) + 1):
                vax_date = first_lepto + timedelta(days=365*(i+1))
                if vax_date <= today + timedelta(days=365):
                    schedule.append({
                        "id": f"lepto_annual_{i+1}",
                        "vaccine": "Leptospirosis",
                        "category": "Adult Dog" if age_weeks < 416 else "Senior Dog",
                        "due_date": vax_date.strftime("%Y-%m-%d"),
                        "status": "pending",
                        "image_url": None
                    })
    
    return sorted(schedule, key=lambda x: x['due_date'])

# API Endpoints
@app.post("/api/register")
async def register_user(registration: UserRegistration):
    data = load_data()
    
    # Check if email already exists
    existing_user_id, _ = find_user_by_email(registration.email)
    if existing_user_id:
        raise HTTPException(status_code=400, detail="Email already registered")
    
    user_id = str(uuid.uuid4())
    schedule = generate_vaccination_schedule(registration.date_of_birth)
    
    data[user_id] = {
        "email": registration.email,
        "password": hash_password(registration.password),
        "pet_name": registration.pet_name,
        "date_of_birth": registration.date_of_birth,
        "schedule": schedule,
        "created_at": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    }
    
    save_data(data)
    
    return {
        "user_id": user_id,
        "email": registration.email,
        "pet_name": registration.pet_name,
        "schedule": schedule
    }

@app.post("/api/login")
async def login_user(login: UserLogin):
    user_id, user_data = find_user_by_email(login.email)
    
    if not user_id:
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    if not verify_password(login.password, user_data['password']):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    
    return {
        "user_id": user_id,
        "email": user_data['email'],
        "pet_name": user_data['pet_name'],
        "schedule": user_data['schedule']
    }

@app.get("/api/schedule/{user_id}")
async def get_schedule(user_id: str):
    data = load_data()
    
    if user_id not in data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = data[user_id]
    return {
        "pet_name": user_data['pet_name'],
        "date_of_birth": user_data['date_of_birth'],
        "schedule": user_data['schedule']
    }

@app.post("/api/update-vaccine/{user_id}")
async def update_vaccine(user_id: str, update: VaccineUpdate):
    data = load_data()
    
    if user_id not in data:
        raise HTTPException(status_code=404, detail="User not found")
    
    user_data = data[user_id]
    
    vaccine_found = False
    for vaccine in user_data['schedule']:
        if vaccine['id'] == update.vaccine_id:
            vaccine_found = True
            
            if vaccine['status'] == 'done' and not update.is_done:
                raise HTTPException(
                    status_code=400, 
                    detail="Cannot change status to not vaccinated once marked as done"
                )
            
            vaccine['status'] = 'done' if update.is_done else 'pending'
            
            if update.image_data and update.is_done:
                if ',' in update.image_data:
                    image_data = update.image_data.split(',')[1]
                else:
                    image_data = update.image_data
                
                image_filename = f"{user_id}_{update.vaccine_id}.png"
                image_path = os.path.join("uploads", image_filename)
                
                with open(image_path, 'wb') as f:
                    f.write(base64.b64decode(image_data))
                
                vaccine['image_url'] = f"/uploads/{image_filename}"
                vaccine['proof_added_at'] = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            
            break
    
    if not vaccine_found:
        raise HTTPException(status_code=404, detail="Vaccine not found")
    
    save_data(data)
    
    return {"message": "Vaccine updated successfully", "schedule": user_data['schedule']}

@app.get("/")
async def root():
    return {"message": "Pet Vaccination Tracker API with Email Authentication"}