# Friends Balance - Final Fix

## 🐛 The Root Cause

The issue was that I was using **pairwise balances** instead of **group balances** to calculate friend balances, AND the logic was inverted.

## ✅ The Correct Solution

### Web Frontend Logic (useData.js lines 118-129)

```javascript
// For each friend, across all groups:
totalBalance -= friend_balance_in_group
```

**This means:**
- If friend's balance in group = +50 (they are owed), then: `total -= 50` = `-50` (you owe them)
- If friend's balance in group = -50 (they owe), then: `total -= (-50)` = `+50` (they owe you)

**Result:**
- `totalBalance > 0` = they owe you
- `totalBalance < 0` = you owe them

### Mobile App Fix

**Changed from:**
- Using `pairwise-balances` API
- Complex from_user/to_user logic

**Changed to:**
- Using `groups/{id}/balances` API (same as web)
- Simple subtraction: `friendBalance -= balance.balance`

### Display Logic (FriendCard)

**Correct (matching web):**
```javascript
balance > 0 ? 'owes you' : 'you owe'
balance > 0 ? COLORS.primary (blue) : COLORS.orange
```

## 📊 Example Walkthrough

**Scenario:** You and Bob are in 2 groups

**Group 1 Balances:**
- Your balance: +30 (you are owed $30)
- Bob's balance: -30 (Bob owes $30)

**Group 2 Balances:**
- Your balance: -20 (you owe $20)
- Bob's balance: +20 (Bob is owed $20)

**Calculate Bob's total from your perspective:**
```javascript
bobTotal = 0
Group 1: bobTotal -= (-30) = +30  // Bob owes
Group 2: bobTotal -= (+20) = +10  // Bob still owes net
Final: Bob owes you $10
```

**From Bob's perspective:**
```javascript
yourTotal = 0
Group 1: yourTotal -= (+30) = -30  // You are owed
Group 2: yourTotal -= (-20) = -10  // Net: you are owed
Final: You are owed $10 (Bob owes you $10)
```

✅ **The balances are now inverse as expected!**

## 🔧 Files Modified

1. **mobile/src/api/client.js**
   - Changed from pairwise-balances to group balances
   - Implemented subtraction logic: `friendBalance -= balance.balance`

2. **mobile/src/components/FriendCard.js**
   - Reverted to correct display logic (matching web)
   - `balance > 0` = blue "owes you"
   - `balance < 0` = orange "you owe"

## 🎯 Why This Works

The key insight is that in group balances:
- Positive balance = person is owed money by the group
- Negative balance = person owes money to the group

To convert to "what does this friend owe ME", we need to:
1. Look at their balance in each shared group
2. Subtract it (which inverts the sign)
3. Sum across all groups

This gives us the correct perspective from the current user's point of view.

## ✅ Testing

After this fix, when you log in as different users:

**User A sees:** Bob owes me $50
**User B (Bob) sees:** I owe User A $50

The balances should now be **exact inverses** of each other! ✓

## 🔄 To Test

1. Close Expo Go completely
2. Reopen and scan QR code  
3. Login as User A - note friend balance
4. Logout, login as User B - verify inverse balance
5. Repeat for all user pairs

The balances should now match correctly! 🎉
