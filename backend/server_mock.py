import os
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
from datetime import datetime
import uvicorn

# Mock data storage
mock_users = [
    {"id": 1, "name": "Alex Johnson", "email": "alex@example.com"},
    {"id": 2, "name": "Sarah Wilson", "email": "sarah@example.com"},
    {"id": 3, "name": "Mike Chen", "email": "mike@example.com"}
]

mock_groups = [
    {"id": 1, "name": "Roommates", "created_by": 1, "members": [1, 2, 3]},
    {"id": 2, "name": "Trip to Italy", "created_by": 1, "members": [1, 2]}
]

mock_expenses = [
    {
        "id": 1,
        "description": "Dinner at Italian Restaurant",
        "amount": 89.50,
        "paid_by": 1,
        "group_id": 1,
        "date": "2025-01-15T19:30:00"
    },
    {
        "id": 2,
        "description": "Grocery Shopping",
        "amount": 67.23,
        "paid_by": 2,
        "group_id": 1,
        "date": "2025-01-14T10:15:00"
    }
]

# FastAPI app
app = FastAPI(title="Emergent Splitwise API (Mock)")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic models
class User(BaseModel):
    id: int
    name: str
    email: str

class Group(BaseModel):
    id: int
    name: str
    created_by: int
    members: List[int]

class Expense(BaseModel):
    id: int
    description: str
    amount: float
    paid_by: int
    group_id: Optional[int]
    date: str

# API endpoints
@app.get("/")
async def root():
    return {"message": "Emergent Splitwise Mock API is running!"}

@app.get("/api/users", response_model=List[User])
async def get_users():
    return mock_users

@app.get("/api/groups", response_model=List[Group])
async def get_groups():
    return mock_groups

@app.get("/api/expenses", response_model=List[Expense])
async def get_expenses():
    return mock_expenses

@app.get("/api/users/{user_id}", response_model=User)
async def get_user(user_id: int):
    user = next((u for u in mock_users if u["id"] == user_id), None)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

@app.get("/api/groups/{group_id}", response_model=Group)
async def get_group(group_id: int):
    group = next((g for g in mock_groups if g["id"] == group_id), None)
    if not group:
        raise HTTPException(status_code=404, detail="Group not found")
    return group

@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)