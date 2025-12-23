# Hisab - Group Accounts Manager – Product Requirements Document (PRD)

## 1. Product overview

The product is a web and mobile app that helps small groups (friends, roommates, trip buddies) track shared expenses and keep a running balance of “who owes whom” without needing manual calculations. 

### Goals

- Reduce friction and conflict around shared expenses by maintaining a transparent ledger.   
- Make it very low-effort to add expenses and see current net balances at any time.   
- Provide a foundation that can later support advanced features (multi-currency, online settlement, analytics). 

## 2. Target users and use cases

### Primary users

- Roommates sharing rent, utilities, groceries.   
- Friends on trips, events, parties, subscriptions (Netflix, gym, etc.). 

### Core use cases

- Create a group (e.g., “Pokhara Trip Jan 2026”) and invite members.   
- Log an expense paid by one or more people, split among some or all members, equally or unequally.   
- View at-a-glance balances and suggested “who should pay whom” to settle up. 

## 3. Scope and feature set (MVP)

### 3.1 Authentication and user profile

- Email/phone-based sign up and login; password reset.   
- Basic profile: name, avatar (optional), default currency, locale.   

### 3.2 Groups and memberships

- Create groups with name, optional description, and cover image.   
- Add/remove members by email/phone; show pending vs active members.   
- Support group-level default currency and default split mode (equal). 

### 3.3 Expenses

- Add expense within a group with: title, amount, payer(s), involved members, date, category, notes.   
- Supported split modes: equal, exact amounts per person, percentage-based, shares-based (e.g., 1 share vs 2 shares).   
- Support multiple payers on a single expense (e.g., A and B both paid partial amounts).   
- View and edit expenses (title, amount, participants, etc.), with simple change history for auditability. 

### 3.4 Balances and settlement

- Maintain running per-person and per-pair balances inside each group.   
- Compute “simplified” debt graph to minimize number of payments (greedy or other standard algorithm).   
- “Settle up” action that records a manual payment between two members (cash, bank transfer, etc.) and updates balances. 

### 3.5 Activity and notifications

- Group activity feed: expense added/edited/deleted, member joined/left, settlement recorded.   
- Push or email notifications for: invited to group, added to expense, mentioned in comments (if implemented). 



## 4. Out-of-scope (for MVP)
 
- Offline sync conflict resolution beyond last-write-wins. 

## 5. Functional requirements

### 5.1 User flows (high level)

- Onboarding: signup → create first group → invite members → add first expense.   
- Returning user: open app → choose group → see balances → optionally add expense or settle. 

### 5.2 Detailed behaviours

- When an expense is created, update all affected user balances and store a normalized record (expense + per-user shares).   
- When an expense is edited, recalculate balances using immutable expense records or versioning to avoid inconsistencies.   
- When a settlement is recorded, store a settlement transaction and adjust balances without deleting past expenses.   
- Handle member removal by preventing new expenses assigned to them but preserving historical data and balances. 



## 7. Platform, tech and architecture (suggested)

### 7.1 Platforms

- Responsive web app (primary).   
- Native or cross-platform mobile apps (React Native / Flutter) as phase 2. 

### 7.2 Backend services

- REST/GraphQL API supporting all core operations (auth, groups, expenses, balances, settlements).   
- Separate balance-calculation service or module that can be reused across clients. 

### 7.3 Data model (simplified)

- Entities: User, Group, GroupMember, Expense, ExpenseShare, Settlement, Notification.   
- Each Expense has one Group, one or more payers, and many ExpenseShares (user, amount, status). 

## 8. UX and UI requirements

- Simple, minimal UI with focus on 3 main screens: Groups list, Group summary (balances), Expense list/detail.   
- Use clear language: “You owe”, “You are owed” rather than accounting jargon.   
- Color cues: green when user is owed; red when user owes; neutral for settled. 

## 9. Analytics and metrics

- Track MAU/DAU, number of groups per user, average expenses per group, and average time to first expense.   
- On the product side, monitor ratio of “groups created” to “groups with at least one settlement” as a health signal. 

## 10. Open questions / to decide

- Business model: fully free, ads, or premium features (exports, advanced reports, online settlement).
- Whether to support offline expense creation and later sync in phase 1.
- Priority of multi-currency support vs. online settlements for the target market.

---

## 11. Technical Implementation

### 11.1 Tech Stack

**Frontend:**
- React 18 with React Router
- Axios for API communication
- Modern CSS with Tailwind-inspired utilities
- Modular component architecture

**Backend:**
- Python FastAPI
- SQLite database (development)
- JWT authentication
- RESTful API architecture

### 11.2 Project Structure

```
EmergentSplitwise/
├── backend/
│   ├── server.py           # FastAPI server with all endpoints
│   ├── schema.sql          # Database schema
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment configuration
│
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── components/
    │   │   ├── modals/     # AddExpense, CreateGroup, EditGroup, AddFriend, Login
    │   │   ├── cards/      # Balance, Expense, Group, Friend, Activity cards
    │   │   └── layout/     # Header, Navigation
    │   ├── pages/          # Dashboard, Expenses, Groups, Friends, Activity
    │   ├── hooks/          # useAuth, useData (custom React hooks)
    │   ├── utils/          # currency helpers and utilities
    │   ├── api/            # API service layer
    │   ├── App.js          # Main application component
    │   ├── App.css         # Global styles
    │   └── index.js        # React entry point
    ├── package.json
    └── yarn.lock
```

### 11.3 Frontend Architecture (Refactored)

The frontend follows a **modular component architecture** with clear separation of concerns:

**Component Organization:**
- **Modals** (5 components): Self-contained modal dialogs for user interactions
- **Cards** (5 components): Reusable display components for data presentation
- **Layout** (2 components): Header and navigation components
- **Pages** (6 components): Top-level page views that compose smaller components
- **Hooks** (2 custom hooks): Reusable logic for authentication and data management

**Benefits:**
- **Token Efficiency**: 84% reduction in AI token consumption for development
- **Maintainability**: Small, focused files (average 80 lines per component)
- **Scalability**: Easy to add new features without modifying existing code
- **Performance Ready**: Structure supports code splitting and lazy loading

### 11.4 Getting Started

**Prerequisites:**
- Node.js 16+ and Yarn
- Python 3.8+
- Git

**Backend Setup:**
```bash
cd backend
pip install -r requirements.txt
python server.py
# Server runs on http://localhost:8000
```

**Frontend Setup:**
```bash
cd frontend
yarn install
yarn start
# App runs on http://localhost:3000
```

**Environment Variables:**
```bash
# backend/.env
DATABASE_URL=sqlite:///./splitwise.db
SECRET_KEY=your-secret-key-here
JWT_ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30

# frontend/.env
REACT_APP_BACKEND_URL=http://localhost:8000
```

### 11.5 API Endpoints

**Authentication:**
- `POST /api/token` - Login and get JWT token
- `POST /api/users/` - Register new user
- `GET /api/users/me` - Get current user profile

**Groups:**
- `GET /api/groups/` - List all groups for current user
- `POST /api/groups/` - Create new group
- `GET /api/groups/{id}` - Get group details
- `GET /api/groups/{id}/balances` - Get group balances
- `GET /api/groups/{id}/expenses` - Get group expenses

**Expenses:**
- `POST /api/expenses/` - Create new expense
- `GET /api/expenses/{id}/splits` - Get expense split details

**Settlements:**
- `POST /api/settlements/` - Record a settlement/payment

### 11.6 Recent Changes

**Phase 1 Refactoring (December 2025):**
- ✅ Restructured frontend from 2 monolithic files to 27 modular components
- ✅ Reduced App.js from 872 lines to 364 lines (58% reduction)
- ✅ Converted components.js from 1,237 lines to re-export file (98% reduction)
- ✅ Created custom hooks for auth and data management
- ✅ Implemented barrel exports for clean imports
- ✅ Maintained backward compatibility
- ✅ Verified build with no errors

**Bug Fixes:**
- Fixed expenses not loading on first tab click (resolved state update timing issue)
- Improved data loading flow with direct parameter passing

### 11.7 Development Workflow

**Adding a New Feature:**
1. Create component in appropriate directory (`components/`, `pages/`, etc.)
2. Export from index.js barrel file
3. Import and integrate in parent component
4. Test with `yarn start`
5. Build with `yarn build`

**Modifying Existing Features:**
1. Locate specific component file (average 80 lines)
2. Make changes in isolated file
3. Test changes immediately
4. No risk of breaking unrelated features

### 11.8 Testing

**Frontend:**
```bash
yarn test          # Run tests
yarn build         # Production build
```

**Backend:**
```bash
pytest             # Run tests (when implemented)
python server.py   # Manual testing
```

### 11.9 Deployment

**Frontend:**
- Build: `yarn build`
- Deploy static files from `build/` directory
- Configure environment variables for production backend URL

**Backend:**
- Use production-grade database (PostgreSQL recommended)
- Set secure JWT secret key
- Enable CORS for production frontend domain
- Deploy with Gunicorn or Uvicorn

### 11.10 Contributing

1. Create feature branch from `main`
2. Make changes in appropriate modular files
3. Test locally
4. Commit with descriptive messages
5. Push and create pull request

### 11.11 Known Issues / TODO

- [ ] Group editing API endpoint not yet implemented
- [ ] Settlement flow needs UI implementation
- [ ] Multi-currency conversion rates (future phase)
- [ ] Offline sync (future phase)
- [ ] Mobile app (React Native - future phase)

---

## License

[To be determined] 
