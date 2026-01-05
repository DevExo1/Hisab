import os
import mysql.connector
from mysql.connector import pooling
from fastapi import FastAPI, APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime, timedelta
import uuid
import logging
from pathlib import Path
import bcrypt
from jose import JWTError, jwt

# --- Configuration and Initialization ---

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Security settings
SECRET_KEY = os.environ.get("SECRET_KEY", "a_default_secret_key_for_development")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

# Database connection pool
# NOTE: Under load, a small pool can lead to request hangs (waiting for a free connection),
# which makes the frontend look like it has "no data".
# We also set conservative timeouts so the API fails fast instead of wedging.
try:
    db_pool = pooling.MySQLConnectionPool(
        pool_name="splitwise_pool",
        pool_size=int(os.environ.get("DB_POOL_SIZE", "10")),
        pool_reset_session=True,
        host=os.environ['DB_HOST'],
        user=os.environ['DB_USER'],
        password=os.environ['DB_PASSWORD'],
        database=os.environ['DB_NAME'],
        connection_timeout=int(os.environ.get("DB_CONNECTION_TIMEOUT", "10")),
    )
    logging.info("Successfully created MySQL connection pool.")
except mysql.connector.Error as err:
    logging.error(f"Error creating connection pool: {err}")
    exit()

# FastAPI app and router
app = FastAPI(title="Hisab - Group Accounts Manager API")
api_router = APIRouter(prefix="/api")

# --- Database Dependency ---

def get_db_connection():
    """Dependency to get a database connection from the pool.

    Important: if the pool is exhausted or the DB is unreachable, we should fail fast
    (raise) rather than hanging and making the entire API appear down.
    """
    connection = None
    try:
        connection = db_pool.get_connection()
        yield connection
    finally:
        try:
            if connection is not None and getattr(connection, "is_connected", lambda: False)():
                connection.close()
        except Exception:
            # Never let cleanup errors hide the real exception
            pass

# --- Security and Authentication ---

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/token")

def verify_password(plain_password, hashed_password):
    """Verifies a plain password against a hashed one."""
    password_bytes = plain_password.encode('utf-8')
    hash_bytes = hashed_password.encode('utf-8')
    return bcrypt.checkpw(password_bytes, hash_bytes)

def get_password_hash(password):
    """Hashes a password."""
    password_bytes = password.encode('utf-8')
    salt = bcrypt.gensalt()
    return bcrypt.hashpw(password_bytes, salt).decode('utf-8')

def create_access_token(data: dict, expires_delta: Optional[timedelta] = None):
    """Creates a JWT access token."""
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=15)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt

# --- Pydantic Models ---

# User Models
class UserBase(BaseModel):
    email: str
    name: str

class UserCreate(UserBase):
    password: str

class User(UserBase):
    id: int

    class Config:
        from_attributes = True

# Token Models
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    email: Optional[str] = None

# Group Models
class GroupBase(BaseModel):
    name: str
    currency: Optional[str] = 'USD'

class GroupCreate(GroupBase):
    member_ids: List[int]

class Group(GroupBase):
    id: int
    created_by: int
    members: List[User] = []

# Expense Models
class ExpenseBase(BaseModel):
    description: str
    amount: float
    group_id: Optional[int] = None
    paid_by_user_id: int

class ExpenseCreate(ExpenseBase):
    # 'equal', 'exact', 'percentage'
    split_type: str
    # For 'exact' and 'percentage', maps user_id to value
    splits: Dict[int, float]

class Expense(ExpenseBase):
    id: int
    expense_date: datetime

# Balance Models
class Balance(BaseModel):
    user_id: int
    user_name: str
    balance: float  # Positive means they are owed, negative means they owe

class GroupBalance(BaseModel):
    group_id: int
    group_name: str
    balances: List[Balance]
    settlements: List[Dict[str, Any]]  # Simplified debt suggestions

# Settlement Models
class SettlementCreate(BaseModel):
    group_id: int
    payer_id: int  # User who is paying
    payee_id: int  # User who is receiving
    amount: float
    notes: Optional[str] = None
    settlement_type: Optional[str] = 'simplified'  # 'simplified' or 'detailed'

class Settlement(SettlementCreate):
    id: int
    settlement_date: datetime

# --- Database CRUD Functions ---

def get_user_by_email(db_conn, email: str):
    """Fetches a user by their email address."""
    cursor = db_conn.cursor(dictionary=True)
    cursor.execute("SELECT * FROM users WHERE email = %s", (email,))
    user = cursor.fetchone()
    cursor.close()
    return user

def create_db_user(db_conn, user: UserCreate):
    """Creates a new user in the database."""
    hashed_password = get_password_hash(user.password)
    cursor = db_conn.cursor()
    try:
        cursor.execute(
            "INSERT INTO users (full_name, email, hashed_password) VALUES (%s, %s, %s)",
            (user.name, user.email, hashed_password)
        )
        db_conn.commit()
        user_id = cursor.lastrowid
        cursor.close()
        return {"id": user_id, **user.dict()}
    except mysql.connector.Error as err:
        cursor.close()
        raise HTTPException(status_code=400, detail=f"Database error: {err}")

async def get_current_user(token: str = Depends(oauth2_scheme), db_conn = Depends(get_db_connection)):
    """Decodes token to get current user."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception
        token_data = TokenData(email=email)
    except JWTError:
        raise credentials_exception
    
    user = get_user_by_email(db_conn, email=token_data.email)
    if user is None:
        raise credentials_exception
    # Map database field names to model field names
    return User(id=user['id'], email=user['email'], name=user['full_name'])

# --- API Endpoints ---

@api_router.get("/health")
def healthcheck():
    """Lightweight health endpoint for clients/load balancers.

    Intentionally does not touch the database so it can be used to verify
    basic API reachability from mobile networks.
    """
    return {"status": "ok"}


@api_router.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends(), db_conn = Depends(get_db_connection)):
    """Provides a token for a valid user."""
    user = get_user_by_email(db_conn, form_data.username)
    if not user or not verify_password(form_data.password, user['hashed_password']):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": user['email']}, expires_delta=access_token_expires
    )
    return {"access_token": access_token, "token_type": "bearer"}

@api_router.post("/users/", response_model=User, status_code=status.HTTP_201_CREATED)
def create_user(user: UserCreate, db_conn = Depends(get_db_connection)):
    """Endpoint to create a new user."""
    db_user = get_user_by_email(db_conn, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = create_db_user(db_conn, user)
    return new_user

@api_router.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_user)):
    """Returns the current authenticated user's details."""
    return current_user

@api_router.put("/users/me", response_model=User)
def update_user_profile(update_data: Dict[str, str], current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Update current user's profile (name and/or password)."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        # Build update query dynamically based on what fields are provided
        updates = []
        params = []
        
        if 'name' in update_data and update_data['name']:
            updates.append("full_name = %s")
            params.append(update_data['name'])
        
        if 'password' in update_data and update_data['password']:
            hashed_password = bcrypt.hashpw(update_data['password'].encode('utf-8'), bcrypt.gensalt())
            updates.append("hashed_password = %s")
            params.append(hashed_password.decode('utf-8'))
        
        if not updates:
            raise HTTPException(status_code=400, detail="No updates provided")
        
        # Add user ID to params
        params.append(current_user.id)
        
        # Execute update
        query = f"UPDATE users SET {', '.join(updates)} WHERE id = %s"
        cursor.execute(query, params)
        db_conn.commit()
        
        # Fetch updated user
        cursor.execute("SELECT id, email, full_name as name FROM users WHERE id = %s", (current_user.id,))
        updated_user = cursor.fetchone()
        
        return User(**updated_user)
        
    except mysql.connector.Error as err:
        db_conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {err}")
    finally:
        cursor.close()

@api_router.post("/friends/", response_model=Dict[str, Any], status_code=status.HTTP_201_CREATED)
def add_friend(friend_email: Dict[str, str], current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Add a friend by email. Creates bidirectional friendship."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        email = friend_email.get('friend_email')
        if not email:
            raise HTTPException(status_code=400, detail="friend_email is required")
        
        # Check if friend exists
        friend = get_user_by_email(db_conn, email)
        if not friend:
            raise HTTPException(status_code=404, detail="User not registered. Ask your friend to register in the system first.")
        
        friend_id = friend['id']
        
        # Can't add yourself as friend
        if friend_id == current_user.id:
            raise HTTPException(status_code=400, detail="You cannot add yourself as a friend")
        
        # Check if friendship already exists
        cursor.execute("""
            SELECT id FROM user_friends 
            WHERE user_id = %s AND friend_id = %s
        """, (current_user.id, friend_id))
        
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Already friends with this user")
        
        # Create bidirectional friendship
        cursor.execute("""
            INSERT INTO user_friends (user_id, friend_id) VALUES (%s, %s)
        """, (current_user.id, friend_id))
        
        cursor.execute("""
            INSERT INTO user_friends (user_id, friend_id) VALUES (%s, %s)
        """, (friend_id, current_user.id))
        
        db_conn.commit()
        
        return {
            "message": "Friend added successfully",
            "friend": {
                "id": friend['id'],
                "name": friend['full_name'],
                "email": friend['email']
            }
        }
        
    except mysql.connector.Error as err:
        db_conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {err}")
    finally:
        cursor.close()

@api_router.get("/friends/", response_model=List[User])
def get_friends(current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Get list of user's friends."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT u.id, u.email, u.full_name as name
            FROM users u
            INNER JOIN user_friends uf ON u.id = uf.friend_id
            WHERE uf.user_id = %s
            ORDER BY u.full_name
        """, (current_user.id,))
        
        friends = cursor.fetchall()
        return [User(**friend) for friend in friends]
    finally:
        cursor.close()

@api_router.post("/groups/", response_model=Group, status_code=status.HTTP_201_CREATED)
def create_group(group: GroupCreate, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Endpoint to create a new group."""
    cursor = db_conn.cursor()
    try:
        # Create the group
        cursor.execute(
            "INSERT INTO `groups` (name, created_by, currency) VALUES (%s, %s, %s)",
            (group.name, current_user.id, group.currency or 'USD')
        )
        group_id = cursor.lastrowid

        # Add members, including the creator
        if current_user.id not in group.member_ids:
            group.member_ids.append(current_user.id)
        
        member_data = [(group_id, user_id) for user_id in group.member_ids]
        cursor.executemany(
            "INSERT INTO group_members (group_id, user_id) VALUES (%s, %s)",
            member_data
        )
        db_conn.commit()
        
        # Fetch created group details to return
        # This part is simplified; a real app would fetch member details
        created_group = {"id": group_id, "name": group.name, "created_by": current_user.id, "members": []}
        return created_group
    except mysql.connector.Error as err:
        db_conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {err}")
    finally:
        cursor.close()

@api_router.post("/expenses/", response_model=Expense, status_code=status.HTTP_201_CREATED)
def create_expense(expense: ExpenseCreate, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Endpoint to add a new expense and split it."""
    cursor = db_conn.cursor()
    try:
        # 1. Create the main expense record
        expense_date = datetime.utcnow()
        cursor.execute(
            "INSERT INTO expenses (description, amount, paid_by, group_id, expense_date) VALUES (%s, %s, %s, %s, %s)",
            (expense.description, expense.amount, expense.paid_by_user_id, expense.group_id, expense_date)
        )
        expense_id = cursor.lastrowid

        # 2. Calculate and insert splits
        splits_to_insert = []
        if expense.split_type == 'equal':
            # For equal split, the splits dict contains user_ids with amounts
            num_participants = len(expense.splits)
            if num_participants == 0:
                raise HTTPException(status_code=400, detail="No participants for equal split.")
            split_amount = round(expense.amount / num_participants, 2)
            for user_id in expense.splits:
                splits_to_insert.append((expense_id, user_id, split_amount))

        elif expense.split_type == 'exact':
            # For exact split, amounts are specified directly
            total = sum(expense.splits.values())
            if abs(total - expense.amount) > 0.01: # Tolerance for float precision
                raise HTTPException(status_code=400, detail="Exact split amounts do not sum to total expense.")
            for user_id, amount in expense.splits.items():
                splits_to_insert.append((expense_id, user_id, amount))
        
        elif expense.split_type == 'percentage':
            # For percentage split, splits dict contains user_ids with percentage values
            total_percentage = sum(expense.splits.values())
            if abs(total_percentage - 100.0) > 0.1: # Tolerance for float precision
                raise HTTPException(status_code=400, detail=f"Percentage split must total 100%, got {total_percentage}%")
            for user_id, percentage in expense.splits.items():
                amount = round((expense.amount * percentage) / 100.0, 2)
                splits_to_insert.append((expense_id, user_id, amount))
        
        else:
            raise HTTPException(status_code=400, detail="Invalid split type specified. Must be 'equal', 'exact', or 'percentage'.")

        cursor.executemany(
            "INSERT INTO expense_splits (expense_id, user_id, amount) VALUES (%s, %s, %s)",
            splits_to_insert
        )
        
        db_conn.commit()
        
        return {"id": expense_id, "expense_date": expense_date, **expense.dict()}

    except mysql.connector.Error as err:
        db_conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {err}")
    finally:
        cursor.close()

@api_router.get("/groups/", response_model=List[Group])
def get_user_groups(current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Get all groups the current user is a member of."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT g.id, g.name, g.created_by, g.currency
            FROM groups g
            INNER JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = %s AND gm.is_active = TRUE
        """, (current_user.id,))
        groups = cursor.fetchall()
        
        # Fetch members for each group
        result = []
        for group in groups:
            cursor.execute("""
                SELECT u.id, u.email, u.full_name as name
                FROM users u
                INNER JOIN group_members gm ON u.id = gm.user_id
                WHERE gm.group_id = %s AND gm.is_active = TRUE
            """, (group['id'],))
            members = cursor.fetchall()
            group['members'] = [User(**member) for member in members]
            result.append(Group(**group))
        
        return result
    finally:
        cursor.close()

@api_router.get("/groups/{group_id}", response_model=Group)
def get_group(group_id: int, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Get details of a specific group."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        # Check if user is a member
        cursor.execute("""
            SELECT COUNT(*) as count FROM group_members 
            WHERE group_id = %s AND user_id = %s AND is_active = TRUE
        """, (group_id, current_user.id))
        if cursor.fetchone()['count'] == 0:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        # Get group details
        cursor.execute("SELECT id, name, created_by, currency FROM groups WHERE id = %s", (group_id,))
        group = cursor.fetchone()
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Get members
        cursor.execute("""
            SELECT u.id, u.email, u.full_name as name
            FROM users u
            INNER JOIN group_members gm ON u.id = gm.user_id
            WHERE gm.group_id = %s AND gm.is_active = TRUE
        """, (group_id,))
        members = cursor.fetchall()
        group['members'] = [User(**member) for member in members]
        
        return Group(**group)
    finally:
        cursor.close()

@api_router.put("/groups/{group_id}", response_model=Group)
def update_group(group_id: int, group_update: GroupCreate, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Update a group's name and members."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        # Check if user is a member and get group details
        cursor.execute("""
            SELECT g.id, g.name, g.created_by FROM groups g
            INNER JOIN group_members gm ON g.id = gm.group_id
            WHERE g.id = %s AND gm.user_id = %s AND gm.is_active = TRUE
        """, (group_id, current_user.id))
        group = cursor.fetchone()
        if not group:
            raise HTTPException(status_code=404, detail="Group not found or not a member")
        
        # Update group name and currency
        cursor.execute("""
            UPDATE `groups` SET name = %s, currency = %s WHERE id = %s
        """, (group_update.name, group_update.currency or 'USD', group_id))
        
        # Update members - remove old members not in new list, add new members
        # Get current members
        cursor.execute("""
            SELECT user_id FROM group_members WHERE group_id = %s AND is_active = TRUE
        """, (group_id,))
        current_member_ids = [row['user_id'] for row in cursor.fetchall()]
        
        # Ensure current user is in the member list
        if current_user.id not in group_update.member_ids:
            group_update.member_ids.append(current_user.id)
        
        # Members to remove (set is_active to FALSE)
        members_to_remove = [uid for uid in current_member_ids if uid not in group_update.member_ids]
        if members_to_remove:
            placeholders = ','.join(['%s'] * len(members_to_remove))
            cursor.execute(f"""
                UPDATE group_members SET is_active = FALSE 
                WHERE group_id = %s AND user_id IN ({placeholders})
            """, [group_id] + members_to_remove)
        
        # Members to add
        members_to_add = [uid for uid in group_update.member_ids if uid not in current_member_ids]
        if members_to_add:
            # Check if they were previously members (reactivate) or new members (insert)
            for user_id in members_to_add:
                cursor.execute("""
                    SELECT id FROM group_members WHERE group_id = %s AND user_id = %s
                """, (group_id, user_id))
                existing = cursor.fetchone()
                
                if existing:
                    # Reactivate existing membership
                    cursor.execute("""
                        UPDATE group_members SET is_active = TRUE 
                        WHERE group_id = %s AND user_id = %s
                    """, (group_id, user_id))
                else:
                    # Add new member
                    cursor.execute("""
                        INSERT INTO group_members (group_id, user_id) VALUES (%s, %s)
                    """, (group_id, user_id))
        
        db_conn.commit()
        
        # Fetch and return updated group
        cursor.execute("SELECT id, name, created_by, currency FROM groups WHERE id = %s", (group_id,))
        updated_group = cursor.fetchone()
        
        # Get updated members
        cursor.execute("""
            SELECT u.id, u.email, u.full_name as name
            FROM users u
            INNER JOIN group_members gm ON u.id = gm.user_id
            WHERE gm.group_id = %s AND gm.is_active = TRUE
        """, (group_id,))
        members = cursor.fetchall()
        updated_group['members'] = [User(**member) for member in members]
        
        return Group(**updated_group)
        
    except mysql.connector.Error as err:
        db_conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {err}")
    finally:
        cursor.close()

@api_router.delete("/groups/{group_id}", response_model=Dict[str, Any])
def delete_group(group_id: int, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """
    Delete a group and all associated data.
    Only the group creator can delete the group.
    Returns statistics about what was deleted.
    """
    cursor = db_conn.cursor(dictionary=True)
    try:
        # Get group details and verify creator
        cursor.execute("""
            SELECT id, name, created_by FROM groups WHERE id = %s
        """, (group_id,))
        group = cursor.fetchone()
        
        if not group:
            raise HTTPException(status_code=404, detail="Group not found")
        
        # Authorization check: Only creator can delete
        if group['created_by'] != current_user.id:
            raise HTTPException(
                status_code=403, 
                detail="Only the group creator can delete this group"
            )
        
        # Count what will be deleted (for return statistics)
        cursor.execute("SELECT COUNT(*) as count FROM expense_splits es INNER JOIN expenses e ON es.expense_id = e.id WHERE e.group_id = %s", (group_id,))
        expense_splits_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM expenses WHERE group_id = %s", (group_id,))
        expenses_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM settlements WHERE group_id = %s", (group_id,))
        settlements_count = cursor.fetchone()['count']
        
        cursor.execute("SELECT COUNT(*) as count FROM group_members WHERE group_id = %s", (group_id,))
        members_count = cursor.fetchone()['count']
        
        # Start atomic deletion (proper order to respect foreign keys)
        # Step 1: Delete expense splits (deepest child)
        cursor.execute("""
            DELETE es FROM expense_splits es
            INNER JOIN expenses e ON es.expense_id = e.id
            WHERE e.group_id = %s
        """, (group_id,))
        
        # Step 2: Delete expenses
        cursor.execute("DELETE FROM expenses WHERE group_id = %s", (group_id,))
        
        # Step 3: Delete settlements
        cursor.execute("DELETE FROM settlements WHERE group_id = %s", (group_id,))
        
        # Step 4: Delete group memberships
        cursor.execute("DELETE FROM group_members WHERE group_id = %s", (group_id,))
        
        # Step 5: Delete the group itself
        cursor.execute("DELETE FROM groups WHERE id = %s", (group_id,))
        
        db_conn.commit()
        
        return {
            "success": True,
            "message": f"Group '{group['name']}' deleted successfully",
            "deleted": {
                "expense_splits": expense_splits_count,
                "expenses": expenses_count,
                "settlements": settlements_count,
                "members": members_count
            }
        }
        
    except mysql.connector.Error as err:
        db_conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {err}")
    finally:
        cursor.close()

@api_router.get("/groups/{group_id}/expenses", response_model=List[Expense])
def get_group_expenses(group_id: int, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Get all expenses for a specific group."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        # Check if user is a member
        cursor.execute("""
            SELECT COUNT(*) as count FROM group_members 
            WHERE group_id = %s AND user_id = %s AND is_active = TRUE
        """, (group_id, current_user.id))
        if cursor.fetchone()['count'] == 0:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        # Get expenses
        cursor.execute("""
            SELECT id, description, amount, paid_by as paid_by_user_id, 
                   group_id, expense_date
            FROM expenses 
            WHERE group_id = %s 
            ORDER BY expense_date DESC
        """, (group_id,))
        expenses = cursor.fetchall()
        
        return [Expense(**expense) for expense in expenses]
    finally:
        cursor.close()

@api_router.get("/groups/{group_id}/balances", response_model=GroupBalance)
def get_group_balances(group_id: int, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Calculate and return balances for all members in a group."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        # Check if user is a member
        cursor.execute("""
            SELECT COUNT(*) as count FROM group_members 
            WHERE group_id = %s AND user_id = %s AND is_active = TRUE
        """, (group_id, current_user.id))
        if cursor.fetchone()['count'] == 0:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        # Get group name
        cursor.execute("SELECT name FROM groups WHERE id = %s", (group_id,))
        group_result = cursor.fetchone()
        if not group_result:
            raise HTTPException(status_code=404, detail="Group not found")
        group_name = group_result['name']
        
        # Calculate balances: what each person paid minus what they owe
        cursor.execute("""
            SELECT 
                u.id as user_id,
                u.full_name as user_name,
                COALESCE(paid.total_paid, 0) as total_paid,
                COALESCE(owed.total_owed, 0) as total_owed
            FROM users u
            INNER JOIN group_members gm ON u.id = gm.user_id AND gm.group_id = %s AND gm.is_active = TRUE
            LEFT JOIN (
                SELECT paid_by as user_id, SUM(amount) as total_paid
                FROM expenses
                WHERE group_id = %s
                GROUP BY paid_by
            ) paid ON paid.user_id = u.id
            LEFT JOIN (
                SELECT es.user_id, SUM(es.amount) as total_owed
                FROM expense_splits es
                INNER JOIN expenses e ON es.expense_id = e.id
                WHERE e.group_id = %s
                GROUP BY es.user_id
            ) owed ON owed.user_id = u.id
            WHERE gm.group_id = %s AND gm.is_active = TRUE
        """, (group_id, group_id, group_id, group_id))
        
        balance_data = cursor.fetchall()
        
        # Apply settlements to adjust balances
        cursor.execute("""
            SELECT payer_id, payee_id, amount
            FROM settlements
            WHERE group_id = %s
        """, (group_id,))
        settlements_data = cursor.fetchall()
        
        # Create balance map
        balance_map = {}
        for row in balance_data:
            net_balance = float(row['total_paid']) - float(row['total_owed'])
            balance_map[row['user_id']] = {
                'user_id': row['user_id'],
                'user_name': row['user_name'],
                'balance': net_balance
            }
        
        # Apply settlements
        for settlement in settlements_data:
            payer_id = settlement['payer_id']
            payee_id = settlement['payee_id']
            amount = float(settlement['amount'])
            
            if payer_id in balance_map:
                balance_map[payer_id]['balance'] += amount  # Payer paid, so increases their balance
            if payee_id in balance_map:
                balance_map[payee_id]['balance'] -= amount  # Payee received, so decreases their balance
        
        balances = [Balance(**b) for b in balance_map.values()]
        
        # Calculate simplified settlements (greedy algorithm)
        settlements = calculate_settlements(balances)
        
        return GroupBalance(
            group_id=group_id,
            group_name=group_name,
            balances=balances,
            settlements=settlements
        )
    finally:
        cursor.close()

@api_router.get("/groups/{group_id}/pairwise-balances", response_model=Dict[str, Any])
def get_pairwise_balances(group_id: int, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """
    Get detailed pairwise balances showing who owes whom and from which expenses.
    
    This function now uses NET-BALANCE-AWARE calculation to ensure consistency
    between simplified and detailed views after settlements.
    
    Key insight: Simplified settlements affect the overall NET position, not specific
    pairwise debts. So we calculate final pairwise debts based on remaining NET positions.
    """
    cursor = db_conn.cursor(dictionary=True)
    try:
        # Check if user is a member
        cursor.execute("""
            SELECT COUNT(*) as count FROM group_members 
            WHERE group_id = %s AND user_id = %s AND is_active = TRUE
        """, (group_id, current_user.id))
        if cursor.fetchone()['count'] == 0:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        # STEP 1: Calculate NET balances per user (same as simplified view)
        # This gives us the "source of truth" for who actually owes money overall
        cursor.execute("""
            SELECT 
                u.id as user_id,
                u.full_name as user_name,
                COALESCE(paid.total_paid, 0) as total_paid,
                COALESCE(owed.total_owed, 0) as total_owed
            FROM users u
            INNER JOIN group_members gm ON u.id = gm.user_id AND gm.group_id = %s AND gm.is_active = TRUE
            LEFT JOIN (
                SELECT paid_by as user_id, SUM(amount) as total_paid
                FROM expenses
                WHERE group_id = %s
                GROUP BY paid_by
            ) paid ON paid.user_id = u.id
            LEFT JOIN (
                SELECT es.user_id, SUM(es.amount) as total_owed
                FROM expense_splits es
                INNER JOIN expenses e ON es.expense_id = e.id
                WHERE e.group_id = %s
                GROUP BY es.user_id
            ) owed ON owed.user_id = u.id
            WHERE gm.group_id = %s AND gm.is_active = TRUE
        """, (group_id, group_id, group_id, group_id))
        
        user_data = cursor.fetchall()
        
        # Build user info map and initial net balances
        user_info = {}  # user_id -> {name, net_balance}
        for row in user_data:
            net_balance = float(row['total_paid']) - float(row['total_owed'])
            user_info[row['user_id']] = {
                'name': row['user_name'],
                'net_balance': net_balance,  # positive = owed money, negative = owes money
                'original_net': net_balance
            }
        
        # STEP 2: Apply ALL settlements to net balances
        cursor.execute("""
            SELECT payer_id, payee_id, amount
            FROM settlements
            WHERE group_id = %s
        """, (group_id,))
        all_settlements = cursor.fetchall()
        
        for settlement in all_settlements:
            payer_id = settlement['payer_id']
            payee_id = settlement['payee_id']
            amount = float(settlement['amount'])
            
            if payer_id in user_info:
                user_info[payer_id]['net_balance'] += amount  # Payer's position improves
            if payee_id in user_info:
                user_info[payee_id]['net_balance'] -= amount  # Payee's position decreases
        
        # STEP 3: Check if all nets are settled
        # If everyone's net is ~0, return empty pairwise list
        all_settled = all(abs(info['net_balance']) < 0.01 for info in user_info.values())
        if all_settled:
            return {"pairwise_balances": []}
        
        # STEP 4: Get original pairwise debts from expenses (before any settlements)
        cursor.execute("""
            SELECT 
                e.id as expense_id,
                e.description,
                e.amount as total_amount,
                e.expense_date,
                e.paid_by as paid_by_user_id,
                payer.full_name as paid_by_name,
                es.user_id as owes_user_id,
                ower.full_name as owes_user_name,
                es.amount as owed_amount
            FROM expenses e
            INNER JOIN users payer ON e.paid_by = payer.id
            INNER JOIN expense_splits es ON e.id = es.expense_id
            INNER JOIN users ower ON es.user_id = ower.id
            WHERE e.group_id = %s
            ORDER BY e.expense_date DESC
        """, (group_id,))
        
        expense_data = cursor.fetchall()
        
        # Build original pairwise structure
        bidirectional = {}
        
        for row in expense_data:
            paid_by = row['paid_by_user_id']
            owes_by = row['owes_user_id']
            amount = float(row['owed_amount'])
            
            if paid_by == owes_by:
                continue
            
            user_pair = tuple(sorted([owes_by, paid_by]))
            
            if user_pair not in bidirectional:
                user1_name = row['owes_user_name'] if owes_by == user_pair[0] else row['paid_by_name']
                user2_name = row['paid_by_name'] if paid_by == user_pair[1] else row['owes_user_name']
                
                bidirectional[user_pair] = {
                    'user1_id': user_pair[0],
                    'user1_name': user1_name,
                    'user2_id': user_pair[1],
                    'user2_name': user2_name,
                    'user1_owes_user2': 0.0,
                    'user2_owes_user1': 0.0,
                    'expenses_user1_owes_user2': [],
                    'expenses_user2_owes_user1': []
                }
            
            if owes_by == user_pair[0] and paid_by == user_pair[1]:
                bidirectional[user_pair]['user1_owes_user2'] += amount
                bidirectional[user_pair]['expenses_user1_owes_user2'].append({
                    'expense_id': row['expense_id'],
                    'description': row['description'],
                    'amount': amount,
                    'date': row['expense_date'].isoformat() if row['expense_date'] else None
                })
            else:
                bidirectional[user_pair]['user2_owes_user1'] += amount
                bidirectional[user_pair]['expenses_user2_owes_user1'].append({
                    'expense_id': row['expense_id'],
                    'description': row['description'],
                    'amount': amount,
                    'date': row['expense_date'].isoformat() if row['expense_date'] else None
                })
        
        # STEP 5: Scale pairwise debts based on remaining net positions
        # Key insight: If a user's net debt is partially/fully settled, scale down their pairwise debts proportionally
        
        pairwise_list = []
        
        for user_pair, data in bidirectional.items():
            user1_id = data['user1_id']
            user2_id = data['user2_id']
            
            user1_owes = data['user1_owes_user2']
            user2_owes = data['user2_owes_user1']
            original_net = user1_owes - user2_owes
            
            if abs(original_net) < 0.01:
                continue
            
            # Determine who is the debtor and creditor in this pair
            if original_net > 0:
                debtor_id = user1_id
                creditor_id = user2_id
                original_debt = original_net
                debtor_name = data['user1_name']
                creditor_name = data['user2_name']
                expenses = data['expenses_user1_owes_user2'] + data['expenses_user2_owes_user1']
            else:
                debtor_id = user2_id
                creditor_id = user1_id
                original_debt = abs(original_net)
                debtor_name = data['user2_name']
                creditor_name = data['user1_name']
                expenses = data['expenses_user2_owes_user1'] + data['expenses_user1_owes_user2']
            
            # Get current net positions after settlements
            debtor_current_net = user_info.get(debtor_id, {}).get('net_balance', 0)
            creditor_current_net = user_info.get(creditor_id, {}).get('net_balance', 0)
            
            # If debtor's net is >= 0, they've settled all their debts (including this one)
            if debtor_current_net >= -0.01:
                continue  # This debt is effectively settled
            
            # If creditor's net is <= 0, they're no longer owed money
            if creditor_current_net <= 0.01:
                continue  # Creditor has been paid in full
            
            # Calculate the remaining debt for this pair
            # The debt should be scaled based on how much of the debtor's original total debt remains
            debtor_original_net = user_info.get(debtor_id, {}).get('original_net', 0)
            
            if debtor_original_net >= 0:
                # Debtor was never in debt, skip
                continue
            
            # Calculate what fraction of debtor's original debt remains
            remaining_debt_ratio = min(1.0, abs(debtor_current_net) / abs(debtor_original_net))
            
            # Also consider creditor's remaining credit
            creditor_original_net = user_info.get(creditor_id, {}).get('original_net', 0)
            if creditor_original_net <= 0:
                continue
            
            remaining_credit_ratio = min(1.0, creditor_current_net / creditor_original_net)
            
            # The final debt is scaled by the minimum of both ratios
            # This ensures we don't show more debt than either party actually has
            scale_factor = min(remaining_debt_ratio, remaining_credit_ratio)
            scaled_debt = original_debt * scale_factor
            
            if scaled_debt >= 0.01:
                pairwise_list.append({
                    'from_user_id': debtor_id,
                    'from_user_name': debtor_name,
                    'to_user_id': creditor_id,
                    'to_user_name': creditor_name,
                    'total_amount': round(scaled_debt, 2),
                    'breakdown': {
                        'original_debt': round(original_debt, 2),
                        'scale_factor': round(scale_factor, 4),
                        'owes': round(user1_owes if original_net > 0 else user2_owes, 2),
                        'owed_back': round(user2_owes if original_net > 0 else user1_owes, 2)
                    },
                    'expenses': expenses
                })
        
        # Sort by amount (highest first)
        pairwise_list.sort(key=lambda x: x['total_amount'], reverse=True)
        
        return {"pairwise_balances": pairwise_list}
        
    except mysql.connector.Error as err:
        raise HTTPException(status_code=400, detail=f"Database error: {err}")
    finally:
        cursor.close()

def calculate_settlements(balances: List[Balance]) -> List[Dict]:
    """
    Calculate simplified settlements using a greedy algorithm.
    Returns a list of suggested payments to settle all debts.
    """
    # Separate creditors (owed money) and debtors (owe money)
    # Use >= and <= to include boundary values like 0.01 and -0.01
    creditors = [(b.user_id, b.user_name, b.balance) for b in balances if b.balance >= 0.01]
    debtors = [(b.user_id, b.user_name, -b.balance) for b in balances if b.balance <= -0.01]
    
    settlements = []
    
    # Sort by amount (largest first) for greedy approach
    creditors.sort(key=lambda x: x[2], reverse=True)
    debtors.sort(key=lambda x: x[2], reverse=True)
    
    i, j = 0, 0
    while i < len(creditors) and j < len(debtors):
        creditor_id, creditor_name, credit_amount = creditors[i]
        debtor_id, debtor_name, debt_amount = debtors[j]
        
        # Determine settlement amount
        settle_amount = min(credit_amount, debt_amount)
        
        settlements.append({
            "from_user_id": debtor_id,
            "from_user_name": debtor_name,
            "to_user_id": creditor_id,
            "to_user_name": creditor_name,
            "amount": round(settle_amount, 2)
        })
        
        # Update remaining balances
        creditors[i] = (creditor_id, creditor_name, credit_amount - settle_amount)
        debtors[j] = (debtor_id, debtor_name, debt_amount - settle_amount)
        
        # Move to next creditor or debtor if fully settled (use <= for consistency)
        if creditors[i][2] <= 0.01:
            i += 1
        if debtors[j][2] <= 0.01:
            j += 1
    
    return settlements

@api_router.post("/settlements/", response_model=Settlement, status_code=status.HTTP_201_CREATED)
def record_settlement(settlement: SettlementCreate, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """
    Record a settlement (payment) between two users in a group.
    Supports both full and partial settlements.
    """
    cursor = db_conn.cursor()
    try:
        # Verify current user is a member of the group
        cursor.execute("""
            SELECT COUNT(*) as count FROM group_members 
            WHERE group_id = %s AND user_id = %s AND is_active = TRUE
        """, (settlement.group_id, current_user.id))
        result = cursor.fetchone()
        if result[0] == 0:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        # Verify payer and payee are members of the group
        cursor.execute("""
            SELECT COUNT(*) as count FROM group_members 
            WHERE group_id = %s AND user_id IN (%s, %s) AND is_active = TRUE
        """, (settlement.group_id, settlement.payer_id, settlement.payee_id))
        result = cursor.fetchone()
        if result[0] != 2:
            raise HTTPException(status_code=400, detail="Payer or payee is not a member of this group")
        
        # Validate amount
        if settlement.amount <= 0:
            raise HTTPException(status_code=400, detail="Settlement amount must be positive")
        
        # Validate settlement_type
        valid_types = ['simplified', 'detailed']
        settlement_type = settlement.settlement_type or 'simplified'
        if settlement_type not in valid_types:
            settlement_type = 'simplified'
        
        # Insert settlement (can be partial or full)
        settlement_date = datetime.utcnow()
        cursor.execute("""
            INSERT INTO settlements (group_id, payer_id, payee_id, amount, notes, settlement_date, settlement_type)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        """, (settlement.group_id, settlement.payer_id, settlement.payee_id, 
              settlement.amount, settlement.notes, settlement_date, settlement_type))
        
        settlement_id = cursor.lastrowid
        db_conn.commit()
        
        return Settlement(
            id=settlement_id,
            settlement_date=settlement_date,
            **settlement.dict()
        )
    except mysql.connector.Error as err:
        db_conn.rollback()
        raise HTTPException(status_code=400, detail=f"Database error: {err}")
    finally:
        cursor.close()

@api_router.get("/groups/{group_id}/settlements", response_model=List[Settlement])
def get_group_settlements(group_id: int, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Get all settlements (payments) for a specific group."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        # Verify user is a member
        cursor.execute("""
            SELECT COUNT(*) as count FROM group_members 
            WHERE group_id = %s AND user_id = %s AND is_active = TRUE
        """, (group_id, current_user.id))
        if cursor.fetchone()['count'] == 0:
            raise HTTPException(status_code=403, detail="Not a member of this group")
        
        # Get settlements
        cursor.execute("""
            SELECT id, group_id, payer_id, payee_id, amount, notes, settlement_date,
                   COALESCE(settlement_type, 'simplified') as settlement_type
            FROM settlements
            WHERE group_id = %s
            ORDER BY settlement_date DESC
        """, (group_id,))
        
        settlements = cursor.fetchall()
        return [Settlement(**s) for s in settlements]
    finally:
        cursor.close()

@api_router.get("/expenses/")
def get_all_expenses(current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Get all expenses for the current user across all their groups."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        cursor.execute("""
            SELECT
                e.id,
                e.description,
                e.amount,
                e.paid_by as paid_by_user_id,
                e.group_id,
                e.expense_date,
                g.name as group_name,
                payer.full_name as paid_by_name
            FROM expenses e
            INNER JOIN groups g ON e.group_id = g.id
            INNER JOIN group_members gm ON g.id = gm.group_id
            INNER JOIN users payer ON e.paid_by = payer.id
            WHERE gm.user_id = %s AND gm.is_active = TRUE
            ORDER BY e.expense_date DESC
        """, (current_user.id,))
        
        expenses = cursor.fetchall()
        return expenses
    finally:
        cursor.close()

@api_router.get("/expenses/{expense_id}/splits")
def get_expense_splits(expense_id: int, current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection)):
    """Get the split details for a specific expense."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        # Verify user has access to this expense
        cursor.execute("""
            SELECT e.id, e.group_id FROM expenses e
            INNER JOIN group_members gm ON e.group_id = gm.group_id
            WHERE e.id = %s AND gm.user_id = %s AND gm.is_active = TRUE
        """, (expense_id, current_user.id))
        
        expense = cursor.fetchone()
        if not expense:
            raise HTTPException(status_code=404, detail="Expense not found or access denied")
        
        # Get splits
        cursor.execute("""
            SELECT es.user_id, u.full_name as user_name, es.amount
            FROM expense_splits es
            INNER JOIN users u ON es.user_id = u.id
            WHERE es.expense_id = %s
        """, (expense_id,))
        
        splits = cursor.fetchall()
        return {"expense_id": expense_id, "splits": splits}
    finally:
        cursor.close()

@api_router.get("/activity")
def get_activity(
    limit: int = 20, 
    offset: int = 0,
    current_user: User = Depends(get_current_user), 
    db_conn = Depends(get_db_connection)
):
    """Get recent activity (expenses and settlements) for the current user across all groups with pagination."""
    cursor = db_conn.cursor(dictionary=True)
    try:
        # Limit the maximum items per request
        limit = min(limit, 50)
        
        # First, get the total count without fetching all data
        cursor.execute("""
            SELECT COUNT(*) as total FROM (
                SELECT e.id FROM expenses e
                INNER JOIN group_members gm ON e.group_id = gm.group_id
                WHERE gm.user_id = %s AND gm.is_active = TRUE
                UNION ALL
                SELECT s.id FROM settlements s
                INNER JOIN group_members gm ON s.group_id = gm.group_id
                WHERE gm.user_id = %s AND gm.is_active = TRUE
            ) as combined
        """, (current_user.id, current_user.id))
        total_count = cursor.fetchone()['total']
        
        # Get combined sorted activities using a subquery with LIMIT and OFFSET
        cursor.execute("""
            SELECT * FROM (
                SELECT
                    e.id,
                    e.description,
                    e.amount,
                    e.expense_date as date,
                    'expense' as type,
                    e.group_id,
                    g.name as group_name,
                    payer.full_name as paid_by_name,
                    e.paid_by as paid_by_user_id,
                    COUNT(DISTINCT es.user_id) as participant_count,
                    NULL as payer_name,
                    NULL as payee_name,
                    NULL as payer_id,
                    NULL as payee_id,
                    NULL as notes
                FROM expenses e
                INNER JOIN groups g ON e.group_id = g.id
                INNER JOIN group_members gm ON g.id = gm.group_id
                INNER JOIN users payer ON e.paid_by = payer.id
                LEFT JOIN expense_splits es ON e.id = es.expense_id
                WHERE gm.user_id = %s AND gm.is_active = TRUE
                GROUP BY e.id, e.description, e.amount, e.expense_date, e.group_id, 
                         g.name, payer.full_name, e.paid_by
                
                UNION ALL
                
                SELECT
                    s.id,
                    NULL as description,
                    s.amount,
                    s.settlement_date as date,
                    'settlement' as type,
                    s.group_id,
                    g.name as group_name,
                    NULL as paid_by_name,
                    NULL as paid_by_user_id,
                    NULL as participant_count,
                    payer.full_name as payer_name,
                    payee.full_name as payee_name,
                    s.payer_id,
                    s.payee_id,
                    s.notes
                FROM settlements s
                INNER JOIN groups g ON s.group_id = g.id
                INNER JOIN group_members gm ON g.id = gm.group_id
                INNER JOIN users payer ON s.payer_id = payer.id
                INNER JOIN users payee ON s.payee_id = payee.id
                WHERE gm.user_id = %s AND gm.is_active = TRUE
            ) as combined_activity
            ORDER BY date DESC
            LIMIT %s OFFSET %s
        """, (current_user.id, current_user.id, limit, offset))
        
        activities = cursor.fetchall()
        
        # For each expense, get the list of participants
        for activity in activities:
            if activity['type'] == 'expense':
                cursor.execute("""
                    SELECT u.full_name as user_name, es.amount
                    FROM expense_splits es
                    INNER JOIN users u ON es.user_id = u.id
                    WHERE es.expense_id = %s
                    ORDER BY u.full_name
                """, (activity['id'],))
                activity['participants'] = cursor.fetchall()
        
        # Return paginated results with metadata
        return {
            "items": activities,
            "total": total_count,
            "limit": limit,
            "offset": offset,
            "has_more": (offset + limit) < total_count
        }
    finally:
        cursor.close()

@api_router.get("/sync/changes")
def get_sync_changes(
    since: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db_conn = Depends(get_db_connection)
):
    """
    Get data changes since a given timestamp for efficient client synchronization.
    
    Args:
        since: ISO format timestamp (e.g., '2024-12-24T12:00:00Z').
               If None, returns all data (initial sync).
    
    Returns:
        Dictionary containing:
        - server_time: Current server timestamp
        - has_changes: Boolean indicating if any changes exist
        - changes: Dictionary with modified data (groups, expenses, friends, activity)
    """
    cursor = db_conn.cursor(dictionary=True)
    try:
        server_time = datetime.utcnow()
        
        # Parse the 'since' timestamp or use a very old date for initial sync
        if since:
            try:
                since_dt = datetime.fromisoformat(since.replace('Z', '+00:00'))
            except (ValueError, AttributeError):
                raise HTTPException(status_code=400, detail="Invalid timestamp format. Use ISO format.")
        else:
            # Initial sync - get all data from epoch
            since_dt = datetime(1970, 1, 1)
        
        changes = {
            "groups": [],
            "expenses": [],
            "friends": [],
            "activity": []
        }
        
        has_changes = False
        
        # Get groups modified since timestamp
        cursor.execute("""
            SELECT g.id, g.name, g.created_by, g.currency, g.updated_at
            FROM groups g
            INNER JOIN group_members gm ON g.id = gm.group_id
            WHERE gm.user_id = %s
            AND gm.is_active = TRUE
            AND g.updated_at > %s
            ORDER BY g.updated_at DESC
        """, (current_user.id, since_dt))
        
        modified_groups = cursor.fetchall()
        
        # For each modified group, fetch its members and balances
        for group in modified_groups:
            cursor.execute("""
                SELECT u.id, u.email, u.full_name as name
                FROM users u
                INNER JOIN group_members gm ON u.id = gm.user_id
                WHERE gm.group_id = %s AND gm.is_active = TRUE
            """, (group['id'],))
            group['members'] = cursor.fetchall()
            
            # Get user's balance in this group
            cursor.execute("""
                SELECT
                    COALESCE(paid.total_paid, 0) - COALESCE(owed.total_owed, 0) as balance
                FROM (SELECT 1) as dummy
                LEFT JOIN (
                    SELECT SUM(amount) as total_paid
                    FROM expenses
                    WHERE group_id = %s AND paid_by = %s
                ) paid ON 1=1
                LEFT JOIN (
                    SELECT SUM(es.amount) as total_owed
                    FROM expense_splits es
                    INNER JOIN expenses e ON es.expense_id = e.id
                    WHERE e.group_id = %s AND es.user_id = %s
                ) owed ON 1=1
            """, (group['id'], current_user.id, group['id'], current_user.id))
            
            balance_result = cursor.fetchone()
            group['balance'] = float(balance_result['balance']) if balance_result else 0.0
            
            changes['groups'].append(group)
            has_changes = True
        
        # Get expenses modified since timestamp
        cursor.execute("""
            SELECT e.id, e.description, e.amount, e.paid_by as paid_by_user_id,
                   e.group_id, e.expense_date, e.updated_at
            FROM expenses e
            INNER JOIN group_members gm ON e.group_id = gm.group_id
            WHERE gm.user_id = %s
            AND gm.is_active = TRUE
            AND e.updated_at > %s
            ORDER BY e.updated_at DESC
            LIMIT 100
        """, (current_user.id, since_dt))
        
        modified_expenses = cursor.fetchall()
        if modified_expenses:
            changes['expenses'] = modified_expenses
            has_changes = True
        
        # Get friends added/modified since timestamp
        cursor.execute("""
            SELECT u.id, u.email, u.full_name as name, uf.updated_at
            FROM users u
            INNER JOIN user_friends uf ON u.id = uf.friend_id
            WHERE uf.user_id = %s
            AND uf.updated_at > %s
            ORDER BY uf.updated_at DESC
        """, (current_user.id, since_dt))
        
        modified_friends = cursor.fetchall()
        if modified_friends:
            changes['friends'] = modified_friends
            has_changes = True
        
        # Get recent activity (last 20 items regardless of timestamp for activity feed)
        cursor.execute("""
            SELECT * FROM (
                SELECT
                    e.id,
                    e.description,
                    e.amount,
                    e.expense_date as date,
                    'expense' as type,
                    e.group_id,
                    g.name as group_name,
                    payer.full_name as paid_by_name,
                    e.paid_by as paid_by_user_id,
                    NULL as payer_name,
                    NULL as payee_name,
                    NULL as payer_id,
                    NULL as payee_id,
                    NULL as notes
                FROM expenses e
                INNER JOIN groups g ON e.group_id = g.id
                INNER JOIN group_members gm ON g.id = gm.group_id
                INNER JOIN users payer ON e.paid_by = payer.id
                WHERE gm.user_id = %s AND gm.is_active = TRUE
                AND e.updated_at > %s
                
                UNION ALL
                
                SELECT
                    s.id,
                    NULL as description,
                    s.amount,
                    s.settlement_date as date,
                    'settlement' as type,
                    s.group_id,
                    g.name as group_name,
                    NULL as paid_by_name,
                    NULL as paid_by_user_id,
                    payer.full_name as payer_name,
                    payee.full_name as payee_name,
                    s.payer_id,
                    s.payee_id,
                    s.notes
                FROM settlements s
                INNER JOIN groups g ON s.group_id = g.id
                INNER JOIN group_members gm ON g.id = gm.group_id
                INNER JOIN users payer ON s.payer_id = payer.id
                INNER JOIN users payee ON s.payee_id = payee.id
                WHERE gm.user_id = %s AND gm.is_active = TRUE
                AND s.updated_at > %s
            ) as combined_activity
            ORDER BY date DESC
            LIMIT 20
        """, (current_user.id, since_dt, current_user.id, since_dt))
        
        recent_activity = cursor.fetchall()
        if recent_activity:
            changes['activity'] = recent_activity
        
        return {
            "server_time": server_time.isoformat() + 'Z',
            "has_changes": has_changes,
            "changes": changes
        }
    finally:
        cursor.close()

@api_router.post("/register", response_model=User, status_code=status.HTTP_201_CREATED)
def register_user_alias(user: UserCreate, db_conn = Depends(get_db_connection)):
    """Alias endpoint for registration (same as POST /api/users/)."""
    db_user = get_user_by_email(db_conn, email=user.email)
    if db_user:
        raise HTTPException(status_code=400, detail="Email already registered")
    new_user = create_db_user(db_conn, user)
    return new_user

# --- App Initialization ---

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], # Allow all origins for development
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
def shutdown_event():
    """Close the database connection pool on application shutdown."""
    logging.info("Closing MySQL connection pool.")
    # The pool itself doesn't have a close method in this version,
    # connections are closed as they are returned.

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)