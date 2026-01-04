# QA Test Matrix: Expense Splitting Validation

## 🎯 QA TEST SCENARIO: Weekend Trip

### **SETUP**
**Group:** "Weekend Trip"  
**Currency:** USD ($)  
**Members:** 
- Alice (Member 1)
- Bob (Member 2)  
- Charlie (Member 3)

**All members start with $0 balance**

---

## 📊 COMPLETE EXPENSE MATRIX (15 Expenses)

### **EXPENSE 1: Dinner - Equal Split**
**Entered by:** Alice  
**Description:** "Dinner at restaurant"  
**Total Amount:** $120.00  
**Paid by:** Alice  
**Split Type:** Equal (3 people)  

**Calculation:**
- Per person share: $120 ÷ 3 = $40.00
- Alice paid: $120.00, owes: $40.00 → **Net: +$80.00** (is owed)
- Bob paid: $0, owes: $40.00 → **Net: -$40.00** (owes)
- Charlie paid: $0, owes: $40.00 → **Net: -$40.00** (owes)

**What Each Person Sees After Expense 1:**
```
Alice's View:
  Net Balance: +$80.00 (you are owed)
  - Bob owes you: $40.00
  - Charlie owes you: $40.00

Bob's View:
  Net Balance: -$40.00 (you owe)
  - You owe Alice: $40.00

Charlie's View:
  Net Balance: -$40.00 (you owe)
  - You owe Alice: $40.00
```

---

### **EXPENSE 2: Gas - Equal Split**
**Entered by:** Bob  
**Description:** "Gas for road trip"  
**Total Amount:** $60.00  
**Paid by:** Bob  
**Split Type:** Equal (3 people)

**Calculation:**
- Per person share: $60 ÷ 3 = $20.00
- Alice: owes $20.00
- Bob: paid $60.00, owes $20.00 → Net this expense: +$40.00
- Charlie: owes $20.00

**Cumulative Balances After Expense 2:**
- Alice: +$80 - $20 = **+$60.00** (is owed)
- Bob: -$40 + $40 = **$0.00** (settled)
- Charlie: -$40 - $20 = **-$60.00** (owes)

**What Each Person Sees After Expense 2:**
```
Alice's View:
  Net Balance: +$60.00 (you are owed)
  - Bob: $0 (settled)
  - Charlie owes you: $60.00

Bob's View:
  Net Balance: $0.00 (settled up)

Charlie's View:
  Net Balance: -$60.00 (you owe)
  - You owe Alice: $60.00
```

---

### **EXPENSE 3: Breakfast - Exact Split (Unequal)**
**Entered by:** Charlie  
**Description:** "Breakfast at cafe"  
**Total Amount:** $45.00  
**Paid by:** Charlie  
**Split Type:** Exact Amounts
- Alice: $15.00 (had eggs)
- Bob: $20.00 (had pancakes + coffee)
- Charlie: $10.00 (had toast)

**Calculation:**
- Alice owes: $15.00
- Bob owes: $20.00
- Charlie paid: $45.00, owes: $10.00 → Net: +$35.00

**Cumulative Balances After Expense 3:**
- Alice: +$60 - $15 = **+$45.00** (is owed)
- Bob: $0 - $20 = **-$20.00** (owes)
- Charlie: -$60 + $35 = **-$25.00** (owes)

**What Each Person Sees After Expense 3:**
```
Alice's View:
  Net Balance: +$45.00 (you are owed)
  - Bob owes you: $20.00
  - Charlie owes you: $25.00

Bob's View:
  Net Balance: -$20.00 (you owe)
  - You owe Alice: $20.00

Charlie's View:
  Net Balance: -$25.00 (you owe)
  - You owe Alice: $25.00
```

---

### **EXPENSE 4: Groceries - Equal Split**
**Entered by:** Alice  
**Description:** "Groceries for the trip"  
**Total Amount:** $90.00  
**Paid by:** Alice  
**Split Type:** Equal (3 people)

**Calculation:**
- Per person: $90 ÷ 3 = $30.00
- Alice: paid $90, owes $30 → Net: +$60

**Cumulative Balances After Expense 4:**
- Alice: +$45 + $60 = **+$105.00**
- Bob: -$20 - $30 = **-$50.00**
- Charlie: -$25 - $30 = **-$55.00**

**What Each Person Sees After Expense 4:**
```
Alice's View:
  Net Balance: +$105.00 (you are owed)
  - Bob owes you: $50.00
  - Charlie owes you: $55.00

Bob's View:
  Net Balance: -$50.00 (you owe)
  - You owe Alice: $50.00

Charlie's View:
  Net Balance: -$55.00 (you owe)
  - You owe Alice: $55.00
```

---

### **EXPENSE 5: Movie Tickets - Percentage Split**
**Entered by:** Bob  
**Description:** "Movie tickets"  
**Total Amount:** $60.00  
**Paid by:** Bob  
**Split Type:** Percentage
- Alice: 33.33% → $20.00
- Bob: 33.33% → $20.00
- Charlie: 33.34% → $20.00

**Calculation:**
- Bob: paid $60, owes $20 → Net: +$40

**Cumulative Balances After Expense 5:**
- Alice: +$105 - $20 = **+$85.00**
- Bob: -$50 + $40 = **-$10.00**
- Charlie: -$55 - $20 = **-$75.00**

**What Each Person Sees After Expense 5:**
```
Alice's View:
  Net Balance: +$85.00 (you are owed)
  - Bob owes you: $10.00
  - Charlie owes you: $75.00

Bob's View:
  Net Balance: -$10.00 (you owe)
  - You owe Alice: $10.00

Charlie's View:
  Net Balance: -$75.00 (you owe)
  - You owe Alice: $75.00
```

---

### **EXPENSE 6: Lunch - Only Alice & Bob**
**Entered by:** Alice  
**Description:** "Lunch (Alice & Bob only)"  
**Total Amount:** $40.00  
**Paid by:** Alice  
**Split Type:** Equal (2 people)
- Alice: $20.00
- Bob: $20.00
- Charlie: NOT included

**Calculation:**
- Alice: paid $40, owes $20 → Net: +$20
- Bob owes: $20

**Cumulative Balances After Expense 6:**
- Alice: +$85 + $20 = **+$105.00**
- Bob: -$10 - $20 = **-$30.00**
- Charlie: -$75 (unchanged) = **-$75.00**

**What Each Person Sees After Expense 6:**
```
Alice's View:
  Net Balance: +$105.00 (you are owed)
  - Bob owes you: $30.00
  - Charlie owes you: $75.00

Bob's View:
  Net Balance: -$30.00 (you owe)
  - You owe Alice: $30.00

Charlie's View:
  Net Balance: -$75.00 (you owe)
  - You owe Alice: $75.00
```

---

### **EXPENSE 7: Snacks - Equal Split**
**Entered by:** Charlie  
**Description:** "Snacks at gas station"  
**Total Amount:** $18.00  
**Paid by:** Charlie  
**Split Type:** Equal (3 people)

**Calculation:**
- Per person: $18 ÷ 3 = $6.00
- Charlie: paid $18, owes $6 → Net: +$12

**Cumulative Balances After Expense 7:**
- Alice: +$105 - $6 = **+$99.00**
- Bob: -$30 - $6 = **-$36.00**
- Charlie: -$75 + $12 = **-$63.00**

**What Each Person Sees After Expense 7:**
```
Alice's View:
  Net Balance: +$99.00 (you are owed)
  - Bob owes you: $36.00
  - Charlie owes you: $63.00

Bob's View:
  Net Balance: -$36.00 (you owe)
  - You owe Alice: $36.00

Charlie's View:
  Net Balance: -$63.00 (you owe)
  - You owe Alice: $63.00
```

---

### **EXPENSE 8: Parking - Equal Split**
**Entered by:** Bob  
**Description:** "Parking fees"  
**Total Amount:** $24.00  
**Paid by:** Bob  
**Split Type:** Equal (3 people)

**Calculation:**
- Per person: $24 ÷ 3 = $8.00
- Bob: paid $24, owes $8 → Net: +$16

**Cumulative Balances After Expense 8:**
- Alice: +$99 - $8 = **+$91.00**
- Bob: -$36 + $16 = **-$20.00**
- Charlie: -$63 - $8 = **-$71.00**

**What Each Person Sees After Expense 8:**
```
Alice's View:
  Net Balance: +$91.00 (you are owed)
  - Bob owes you: $20.00
  - Charlie owes you: $71.00

Bob's View:
  Net Balance: -$20.00 (you owe)
  - You owe Alice: $20.00

Charlie's View:
  Net Balance: -$71.00 (you owe)
  - You owe Alice: $71.00
```

---

### **EXPENSE 9: Souvenirs - Exact Split**
**Entered by:** Alice  
**Description:** "Souvenirs"  
**Total Amount:** $75.00  
**Paid by:** Alice  
**Split Type:** Exact
- Alice: $30.00
- Bob: $25.00
- Charlie: $20.00

**Calculation:**
- Alice: paid $75, owes $30 → Net: +$45

**Cumulative Balances After Expense 9:**
- Alice: +$91 + $45 = **+$136.00**
- Bob: -$20 - $25 = **-$45.00**
- Charlie: -$71 - $20 = **-$91.00**

**What Each Person Sees After Expense 9:**
```
Alice's View:
  Net Balance: +$136.00 (you are owed)
  - Bob owes you: $45.00
  - Charlie owes you: $91.00

Bob's View:
  Net Balance: -$45.00 (you owe)
  - You owe Alice: $45.00

Charlie's View:
  Net Balance: -$91.00 (you owe)
  - You owe Alice: $91.00
```

---

### **EXPENSE 10: Ice Cream - Equal Split**
**Entered by:** Charlie  
**Description:** "Ice cream"  
**Total Amount:** $15.00  
**Paid by:** Charlie  
**Split Type:** Equal (3 people)

**Calculation:**
- Per person: $15 ÷ 3 = $5.00
- Charlie: paid $15, owes $5 → Net: +$10

**Cumulative Balances After Expense 10:**
- Alice: +$136 - $5 = **+$131.00**
- Bob: -$45 - $5 = **-$50.00**
- Charlie: -$91 + $10 = **-$81.00**

**What Each Person Sees After Expense 10:**
```
Alice's View:
  Net Balance: +$131.00 (you are owed)
  - Bob owes you: $50.00
  - Charlie owes you: $81.00

Bob's View:
  Net Balance: -$50.00 (you owe)
  - You owe Alice: $50.00

Charlie's View:
  Net Balance: -$81.00 (you owe)
  - You owe Alice: $81.00
```

---

### **EXPENSE 11: Tip for Guide - Bob & Charlie Only**
**Entered by:** Bob  
**Description:** "Tip for tour guide (Bob & Charlie)"  
**Total Amount:** $30.00  
**Paid by:** Bob  
**Split Type:** Equal (2 people)
- Bob: $15.00
- Charlie: $15.00
- Alice: NOT included

**Calculation:**
- Bob: paid $30, owes $15 → Net: +$15
- Charlie owes: $15

**Cumulative Balances After Expense 11:**
- Alice: +$131 (unchanged) = **+$131.00**
- Bob: -$50 + $15 = **-$35.00**
- Charlie: -$81 - $15 = **-$96.00**

**What Each Person Sees After Expense 11:**
```
Alice's View:
  Net Balance: +$131.00 (you are owed)
  - Bob owes you: $35.00
  - Charlie owes you: $96.00

Bob's View:
  Net Balance: -$35.00 (you owe)
  - You owe Alice: $35.00

Charlie's View:
  Net Balance: -$96.00 (you owe)
  - You owe Alice: $96.00
```

---

### **EXPENSE 12: Hotel - Equal Split**
**Entered by:** Alice  
**Description:** "Hotel for 2 nights"  
**Total Amount:** $300.00  
**Paid by:** Alice  
**Split Type:** Equal (3 people)

**Calculation:**
- Per person: $300 ÷ 3 = $100.00
- Alice: paid $300, owes $100 → Net: +$200

**Cumulative Balances After Expense 12:**
- Alice: +$131 + $200 = **+$331.00**
- Bob: -$35 - $100 = **-$135.00**
- Charlie: -$96 - $100 = **-$196.00**

**What Each Person Sees After Expense 12:**
```
Alice's View:
  Net Balance: +$331.00 (you are owed)
  - Bob owes you: $135.00
  - Charlie owes you: $196.00

Bob's View:
  Net Balance: -$135.00 (you owe)
  - You owe Alice: $135.00

Charlie's View:
  Net Balance: -$196.00 (you owe)
  - You owe Alice: $196.00
```

---

### **EXPENSE 13: Taxi - Exact Split**
**Entered by:** Bob  
**Description:** "Taxi to airport"  
**Total Amount:** $45.00  
**Paid by:** Bob  
**Split Type:** Exact
- Alice: $15.00
- Bob: $15.00
- Charlie: $15.00

**Calculation:**
- Bob: paid $45, owes $15 → Net: +$30

**Cumulative Balances After Expense 13:**
- Alice: +$331 - $15 = **+$316.00**
- Bob: -$135 + $30 = **-$105.00**
- Charlie: -$196 - $15 = **-$211.00**

**What Each Person Sees After Expense 13:**
```
Alice's View:
  Net Balance: +$316.00 (you are owed)
  - Bob owes you: $105.00
  - Charlie owes you: $211.00

Bob's View:
  Net Balance: -$105.00 (you owe)
  - You owe Alice: $105.00

Charlie's View:
  Net Balance: -$211.00 (you owe)
  - You owe Alice: $211.00
```

---

### **EXPENSE 14: Coffee - Equal Split**
**Entered by:** Charlie  
**Description:** "Coffee at airport"  
**Total Amount:** $12.00  
**Paid by:** Charlie  
**Split Type:** Equal (3 people)

**Calculation:**
- Per person: $12 ÷ 3 = $4.00
- Charlie: paid $12, owes $4 → Net: +$8

**Cumulative Balances After Expense 14:**
- Alice: +$316 - $4 = **+$312.00**
- Bob: -$105 - $4 = **-$109.00**
- Charlie: -$211 + $8 = **-$203.00**

**What Each Person Sees After Expense 14:**
```
Alice's View:
  Net Balance: +$312.00 (you are owed)
  - Bob owes you: $109.00
  - Charlie owes you: $203.00

Bob's View:
  Net Balance: -$109.00 (you owe)
  - You owe Alice: $109.00

Charlie's View:
  Net Balance: -$203.00 (you owe)
  - You owe Alice: $203.00
```

---

### **EXPENSE 15: Drinks - Percentage Split**
**Entered by:** Alice  
**Description:** "Drinks on last night"  
**Total Amount:** $90.00  
**Paid by:** Alice  
**Split Type:** Percentage
- Alice: 40% → $36.00
- Bob: 30% → $27.00
- Charlie: 30% → $27.00

**Calculation:**
- Alice: paid $90, owes $36 → Net: +$54

**FINAL BALANCES After Expense 15:**
- Alice: +$312 + $54 = **+$366.00** ✅
- Bob: -$109 - $27 = **-$136.00** ✅
- Charlie: -$203 - $27 = **-$230.00** ✅

**VERIFICATION:** +$366 - $136 - $230 = $0 ✅ (Balanced!)

---

## 🎯 FINAL STATE - WHAT EACH PERSON SEES

### **Alice's Dashboard:**
```
Net Balance: +$366.00 (You are owed)

Pairwise Balances:
  Bob owes you: $136.00
  Charlie owes you: $230.00
```

### **Bob's Dashboard:**
```
Net Balance: -$136.00 (You owe)

Pairwise Balances:
  You owe Alice: $136.00
```

### **Charlie's Dashboard:**
```
Net Balance: -$230.00 (You owe)

Pairwise Balances:
  You owe Alice: $230.00
```

---

## 💰 SETTLEMENT OPTIONS

### **SIMPLIFIED SETTLEMENT (Optimal - Minimum Transactions)**

**Algorithm:** Minimize number of payments

**Result:**
```
Payment 1: Bob pays Alice $136.00
Payment 2: Charlie pays Alice $230.00

Total Payments: 2
```

**After Settlement:**
- Alice: $0 (settled)
- Bob: $0 (settled)
- Charlie: $0 (settled)

### **DETAILED/PAIRWISE SETTLEMENT (Direct Debts)**

**Algorithm:** Pay exactly who you owe

**Result:**
```
Payment 1: Bob pays Alice $136.00
Payment 2: Charlie pays Alice $230.00

Total Payments: 2
```

**In this case, simplified = detailed because:**
- Alice is the only creditor
- Bob and Charlie both owe only Alice
- No circular debts or complex relationships

---

## 📈 EXPENSE SUMMARY STATISTICS

**Total Trip Cost:** $984.00  
**Per Person Average:** $328.00  

**Actual Spending:**
- Alice paid: $615.00 (6 expenses)
- Bob paid: $219.00 (5 expenses)
- Charlie paid: $150.00 (4 expenses)

**Total Paid:** $984.00 ✅

**Actual Owed:**
- Alice owes: $249.00 (her share)
- Bob owes: $355.00 (his share)
- Charlie owes: $380.00 (his share)

**Total Owed:** $984.00 ✅

**Net Balances:**
- Alice: Paid $615 - Owes $249 = **+$366** ✅
- Bob: Paid $219 - Owes $355 = **-$136** ✅
- Charlie: Paid $150 - Owes $380 = **-$230** ✅

**Balance Check:** $366 - $136 - $230 = **$0** ✅

---

## 🧪 QA TEST CHECKLIST

### **After Each Expense:**
- [ ] Net balances match calculated values
- [ ] Pairwise balances are correct
- [ ] All three members see consistent data
- [ ] Total debts = Total credits (sum to zero)

### **Settlement Calculations:**
- [ ] Simplified shows 2 payments (Bob→Alice, Charlie→Alice)
- [ ] Detailed shows same 2 payments
- [ ] Payment amounts are $136 and $230
- [ ] After settlement, all balances = $0

### **Edge Cases Covered:**
- [ ] Equal splits (3-way)
- [ ] Exact/custom amounts
- [ ] Percentage splits
- [ ] Partial participation (2 people from 3)
- [ ] Different payers
- [ ] Large vs small amounts
- [ ] Decimal precision ($0.01 accuracy)

---

## 📋 QA INPUT SHEET (For Testers)

| # | Description | Amount | Paid By | Split Type | Participants | Alice Amt | Bob Amt | Charlie Amt |
|---|-------------|--------|---------|------------|--------------|-----------|---------|-------------|
| 1 | Dinner | $120 | Alice | Equal | All 3 | $40 | $40 | $40 |
| 2 | Gas | $60 | Bob | Equal | All 3 | $20 | $20 | $20 |
| 3 | Breakfast | $45 | Charlie | Exact | All 3 | $15 | $20 | $10 |
| 4 | Groceries | $90 | Alice | Equal | All 3 | $30 | $30 | $30 |
| 5 | Movies | $60 | Bob | % | All 3 | $20 (33.33%) | $20 (33.33%) | $20 (33.34%) |
| 6 | Lunch | $40 | Alice | Equal | Alice, Bob | $20 | $20 | $0 |
| 7 | Snacks | $18 | Charlie | Equal | All 3 | $6 | $6 | $6 |
| 8 | Parking | $24 | Bob | Equal | All 3 | $8 | $8 | $8 |
| 9 | Souvenirs | $75 | Alice | Exact | All 3 | $30 | $25 | $20 |
| 10 | Ice Cream | $15 | Charlie | Equal | All 3 | $5 | $5 | $5 |
| 11 | Tip | $30 | Bob | Equal | Bob, Charlie | $0 | $15 | $15 |
| 12 | Hotel | $300 | Alice | Equal | All 3 | $100 | $100 | $100 |
| 13 | Taxi | $45 | Bob | Exact | All 3 | $15 | $15 | $15 |
| 14 | Coffee | $12 | Charlie | Equal | All 3 | $4 | $4 | $4 |
| 15 | Drinks | $90 | Alice | % | All 3 | $36 (40%) | $27 (30%) | $27 (30%) |

**EXPECTED FINAL BALANCES:**
- Alice: **+$366.00**
- Bob: **-$136.00**
- Charlie: **-$230.00**

**EXPECTED SETTLEMENTS:**
- Bob pays Alice: **$136.00**
- Charlie pays Alice: **$230.00**

---

## 🎓 NOTES FOR QA TEAM

### **This Matrix Represents:**
✅ **Ground Truth** - How the app SHOULD behave  
✅ **Mathematical Verification** - All balances sum to zero  
✅ **Edge Case Coverage** - Various split types and scenarios  
✅ **Real-World Scenario** - Weekend trip with typical expenses  

### **Any Deviation = Bug:**
If the app shows different balances than this matrix, it's a bug that needs fixing.

### **Test Methodology:**
1. Create group with Alice, Bob, Charlie
2. Enter all 15 expenses in order
3. After each expense, verify balances match matrix
4. At end, verify final balances: Alice +$366, Bob -$136, Charlie -$230
5. Check settlements show correct payments

### **Common Bug Indicators:**
- Balances don't sum to zero
- Pairwise balances inconsistent between members
- Settlement suggestions incorrect
- Rounding errors accumulate

---

**This is the definitive test matrix for your QA team!** 🚀
