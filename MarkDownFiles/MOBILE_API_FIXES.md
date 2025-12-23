# Mobile API Integration Fixes

## Summary
Fixed authentication and API endpoint mismatches between the mobile app and backend server.

## Issues Fixed

### 1. ✅ Registration Endpoint Mismatch
**Problem:** Mobile client was calling `/api/register` but backend only had `/api/users/`

**Solution:** 
- Updated [`mobile/src/api/client.js`](mobile/src/api/client.js:73) to use `/api/users/` endpoint
- Added `/api/register` alias endpoint in backend for future compatibility

**Files Changed:**
- `mobile/src/api/client.js` - Line 74: Changed endpoint from `/api/register` to `/api/users/`
- `backend/server.py` - Added new endpoint at line 1089

### 2. ✅ Missing Activity Endpoint
**Problem:** Mobile client called `/api/activity` but this endpoint didn't exist in the backend

**Solution:** Added comprehensive activity endpoint that returns:
- Recent expenses from user's groups (last 20)
- Recent settlements from user's groups (last 20)
- Combined and sorted by date (returns top 50 items)

**Files Changed:**
- `backend/server.py` - Added new endpoint at line 1031

**Endpoint Details:**
```python
@api_router.get("/activity")
def get_activity(current_user: User = Depends(get_current_user), db_conn = Depends(get_db_connection))
```

Returns activity items with:
- Expenses: id, description, amount, date, type, group_id, group_name, paid_by_name, paid_by_user_id
- Settlements: id, amount, date, type, group_id, group_name, payer_name, payee_name, payer_id, payee_id, notes

### 3. ✅ Token Validation Issues
**Problem:** Expired/invalid JWT tokens causing "Could not validate credentials" errors

**Root Cause:**
- Tokens expire after 30 minutes (ACCESS_TOKEN_EXPIRE_MINUTES = 30)
- Old tokens stored in AsyncStorage from previous sessions

**Solution:** 
- Existing [`AuthContext`](mobile/src/contexts/AuthContext.js:32) already handles this by clearing invalid tokens
- Users need to login again to get fresh tokens

**No Code Changes Required** - Working as designed

## Testing Instructions

### 1. Restart Backend Server
The backend server needs to be restarted to load the new endpoints:
```bash
# Stop the current server (Ctrl+C in the terminal running it)
# Then restart:
cd backend
python server.py
```

### 2. Clear Mobile App Storage
Since there may be expired tokens, clear the app data:
- Close the Expo Go app completely
- Reopen and scan the QR code again
- Login with valid credentials

### 3. Verify Endpoints
After restarting the backend, these endpoints should now work:
- ✅ `GET /api/activity` - Returns combined expenses and settlements
- ✅ `POST /api/register` - Alias for user registration
- ✅ `POST /api/users/` - Main registration endpoint (now used by mobile)

## API Endpoint Summary

| Endpoint | Method | Purpose | Status |
|----------|--------|---------|--------|
| `/api/token` | POST | Login and get JWT token | ✅ Working |
| `/api/users/` | POST | Register new user | ✅ Working |
| `/api/register` | POST | Register alias | ✅ Added |
| `/api/users/me` | GET | Get current user | ✅ Working |
| `/api/friends` | GET | Get user's friends | ✅ Working |
| `/api/groups` | GET | Get user's groups | ✅ Working |
| `/api/expenses` | GET | Get user's expenses | ✅ Working |
| `/api/activity` | GET | Get recent activity | ✅ Added |

## Expected Behavior After Fixes

1. **Login Flow:**
   - User logs in → receives JWT token
   - Token stored in AsyncStorage
   - Token used for authenticated requests
   - Token expires after 30 minutes → user redirected to login

2. **Activity Feed:**
   - Shows recent expenses and settlements
   - Sorted by date (newest first)
   - Limited to 50 most recent items

3. **Registration:**
   - Works with both `/api/register` and `/api/users/`
   - Returns user object on success
   - Auto-login after successful registration

## Notes

- Backend server is currently running on `http://10.10.10.150:8000`
- CORS is configured to allow all origins (development mode)
- JWT tokens use HS256 algorithm with SECRET_KEY from `.env`
- Token expiration: 30 minutes (configurable in `ACCESS_TOKEN_EXPIRE_MINUTES`)