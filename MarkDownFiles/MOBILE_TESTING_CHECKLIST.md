# Mobile Dashboard Testing Checklist ✅

## 🎯 How to Test

### Prerequisites
1. ✅ Backend server running on `http://10.10.10.150:8000`
2. ✅ Metro bundler running (should already be open in PowerShell)
3. ✅ Expo Go app installed on your iPhone
4. ✅ iPhone and PC on the same WiFi network

### Test Steps

#### 1. Launch the App
- [ ] Open Expo Go on iPhone
- [ ] Scan QR code from Metro bundler terminal
- [ ] App loads without errors
- [ ] Login screen appears

#### 2. Login
- [ ] Enter valid credentials
- [ ] Login succeeds
- [ ] Dashboard screen loads

#### 3. Dashboard Components

##### Welcome Header
- [ ] Shows "Welcome back,"
- [ ] Displays your name correctly
- [ ] Text is readable

##### Balance Card
- [ ] Displays overall balance
- [ ] Shows "You are owed" amount with teal gradient
- [ ] Shows "You owe" amount with coral gradient
- [ ] Shows total balance at bottom
- [ ] Colors match the balance status (green for owed, red for owing)
- [ ] Card has shadow and looks polished

##### Hero Banner
- [ ] Displays with teal gradient background
- [ ] Shows "Split expenses beautifully" text
- [ ] Subtitle is visible and readable
- [ ] Looks visually appealing

##### Your Groups Section
- [ ] Section title "Your Groups" is visible
- [ ] "View all →" link appears
- [ ] Up to 3 groups are displayed
- [ ] Each group shows:
  - [ ] Appropriate emoji icon
  - [ ] Group name
  - [ ] Member count
  - [ ] Balance (if any) or "Settled up"
- [ ] Tapping a group navigates to details (or shows error if not implemented)

##### Recent Expenses Section
- [ ] Section title "Recent Expenses" is visible
- [ ] "View all →" link appears
- [ ] Up to 5 expenses are displayed
- [ ] Each expense shows:
  - [ ] Appropriate emoji icon based on description
  - [ ] Description
  - [ ] Amount
  - [ ] Who paid
  - [ ] Date
  - [ ] Group name (if applicable)
  - [ ] Your share status (you owe/owed amount)

##### Empty State (if no data)
- [ ] Shows emoji (💸)
- [ ] Shows "No expenses yet" message
- [ ] Shows helpful text about creating groups

##### Quick Actions
- [ ] Two buttons visible at bottom
- [ ] "Create Group" button (with 👥 emoji)
- [ ] "Add Expense" button (with 💰 emoji)
- [ ] Buttons have proper styling and shadows
- [ ] Tapping navigates to respective screens

#### 4. Interactions

##### Pull-to-Refresh
- [ ] Pull down from top of screen
- [ ] Refresh indicator appears
- [ ] Data reloads
- [ ] Indicator disappears when done

##### Navigation
- [ ] Tap "View all →" next to Groups
- [ ] Navigate to Groups screen
- [ ] Go back to Dashboard
- [ ] Tap "View all →" next to Expenses
- [ ] Navigate to Expenses screen
- [ ] Go back to Dashboard

##### Card Taps
- [ ] Tap on a group card
- [ ] Should navigate to group details
- [ ] Tap on expense card
- [ ] Should show expense details (or do nothing if not implemented)

#### 5. Dark Mode
- [ ] Go to Profile/Settings
- [ ] Toggle dark mode ON
- [ ] Return to Dashboard
- [ ] Check all components:
  - [ ] Background changes to dark
  - [ ] Text changes to light
  - [ ] Cards have appropriate dark styling
  - [ ] Gradients still visible
  - [ ] All text is readable
- [ ] Toggle dark mode OFF
- [ ] Verify light mode looks correct

#### 6. Performance
- [ ] Dashboard loads quickly (< 2 seconds)
- [ ] Scrolling is smooth
- [ ] No lag when pulling to refresh
- [ ] Animations are smooth
- [ ] No crashes or freezes

#### 7. Different Data Scenarios

##### With Data
- [ ] Multiple groups display correctly
- [ ] Multiple expenses display correctly
- [ ] Balances calculate correctly
- [ ] All sections populated

##### With Partial Data
- [ ] Works with only groups (no expenses)
- [ ] Works with only expenses (no groups)
- [ ] Handles zero balance gracefully

##### With No Data
- [ ] Shows appropriate empty states
- [ ] Quick action buttons still visible
- [ ] No errors or blank screens

#### 8. Edge Cases
- [ ] Long group names don't break layout
- [ ] Long expense descriptions truncate properly
- [ ] Large amounts format correctly
- [ ] Very small amounts format correctly
- [ ] Multiple currencies display correctly

## 🐛 Known Issues to Watch For

1. **API Connection**
   - If you see "Network request failed", check backend is running
   - Verify IP address is correct in `mobile/src/api/client.js`

2. **Loading States**
   - First load should show loading indicator
   - Subsequent loads use cached data

3. **Navigation**
   - Some detail screens may not be fully implemented yet
   - You might see "Coming soon" placeholders

## ✅ Success Criteria

The dashboard is working correctly if:
- ✅ All data loads and displays properly
- ✅ UI looks modern, clean, and polished
- ✅ Interactions are smooth and responsive
- ✅ Dark mode works throughout
- ✅ Pull-to-refresh updates data
- ✅ Navigation works without errors
- ✅ No crashes or freezes

## 🎨 Visual Quality Check

- [ ] Spacing looks consistent
- [ ] Colors are vibrant and appropriate
- [ ] Gradients look smooth
- [ ] Cards have proper shadows
- [ ] Text is properly sized and weighted
- [ ] Icons/emojis are the right size
- [ ] Overall aesthetic is modern and clean

## 📝 Notes

Use this space to note any issues found:

```
Issue 1: 
Issue 2: 
Issue 3: 
```

## 🚀 Next Steps After Testing

Once dashboard works perfectly:
1. Implement other screens (Friends, Groups, Expenses, Activity)
2. Add more interactive features (modals, forms)
3. Implement navigation to detail screens
4. Add animations and transitions
5. Optimize performance further

---

**Happy Testing! 🎉**

If you encounter any issues, check:
- Backend is running
- Metro bundler is running
- Phone and PC on same network
- Console logs for error messages
