# Sync Pause/Resume Guide

## Why Pause Sync?

While the sync system is designed to not interfere with user input (modals maintain their own state), you might want to pause sync in certain scenarios for optimal UX:

1. **User is actively scrolling a long list** - Prevent items from shifting
2. **User is in a critical form flow** - Avoid any potential UI updates
3. **Performing batch operations** - Pause during mass updates

## How Modal State is Protected (Default Behavior)

**Good news:** Modals with user input are already protected! Here's why:

### Modal State Isolation
```javascript
// Example: AddExpenseModal
const [description, setDescription] = useState('');  // Local state
const [amount, setAmount] = useState('');            // Local state

// User types "Dinner" → stored in local state
// Background sync happens → updates expenses list in DataContext
// Modal state unchanged → user continues typing
// User submits → expense created → then appears in synced list
```

### React's Smart Re-rendering
- React only re-renders components whose props/state changed
- If sync updates the expenses list, only the expenses screen re-renders
- Open modals keep their state and don't re-render

## When to Use Pause/Resume

### Optional: Pause During Active Scrolling

If you want extra smoothness while user is scrolling:

```javascript
import { useSync } from '../contexts/SyncContext';

function ExpensesScreen() {
  const { pauseSync, resumeSync } = useSync();
  const [isScrolling, setIsScrolling] = useState(false);
  
  const handleScrollBegin = () => {
    setIsScrolling(true);
    pauseSync();  // Pause while scrolling
  };
  
  const handleScrollEnd = () => {
    setIsScrolling(false);
    resumeSync();  // Resume when scroll ends
  };
  
  return (
    <FlatList
      data={expenses}
      onScrollBeginDrag={handleScrollBegin}
      onScrollEndDrag={handleScrollEnd}
      onMomentumScrollEnd={handleScrollEnd}
      // ... other props
    />
  );
}
```

### Optional: Pause During Modal Interaction

If you want to be extra cautious with modals:

```javascript
function AddExpenseModal({ visible, onClose }) {
  const { pauseSync, resumeSync } = useSync();
  
  useEffect(() => {
    if (visible) {
      pauseSync();   // Pause when modal opens
    } else {
      resumeSync();  // Resume when modal closes
    }
  }, [visible]);
  
  // ... modal content
}
```

## API Reference

### `pauseSync()`
Temporarily stops background synchronization.
- Polling timer continues but sync requests are skipped
- Useful during user interactions

### `resumeSync()`
Resumes background synchronization.
- Immediately triggers a sync to catch up
- Restarts normal polling

### `syncPaused` (boolean)
State variable indicating if sync is currently paused.

```javascript
const { syncPaused, pauseSync, resumeSync } = useSync();

// Check if paused
if (syncPaused) {
  console.log('Sync is paused');
}
```

## Recommendation

**For most use cases, you don't need to pause sync manually.**

The current implementation is already safe because:
1. ✅ Modal forms maintain independent state
2. ✅ React intelligently re-renders only changed components
3. ✅ Background data updates don't affect active user input
4. ✅ Sync is already paused when offline or app is backgrounded

**Only use pause/resume if:**
- You notice specific UX issues during testing
- You want to optimize scrolling performance
- You have a specific use case that requires it

## Testing Sync During User Input

To verify sync doesn't interfere:

1. **Open app on Device A**
2. **Open "Add Expense" modal on Device B**
3. **Start typing in the description field on Device B**
4. **Add a different expense on Device A** (this will trigger sync on B)
5. **Keep typing on Device B**
6. **Result:** Typing should be unaffected, new expense appears in list after modal closes

The implementation already handles this correctly!
