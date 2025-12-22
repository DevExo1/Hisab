/**
 * Legacy components.js - Re-exports from modular structure
 * This file maintains backward compatibility while using the new modular structure
 */

// Re-export layout components
export { Header, Navigation } from './components/layout';

// Re-export card components
export {
  BalanceCard,
  ExpenseCard,
  GroupCard,
  FriendCard,
  ActivityItem
} from './components/cards';

// Re-export modal components
export {
  AddExpenseModal,
  CreateGroupModal,
  EditGroupModal,
  AddFriendModal,
  LoginModal
} from './components/modals';

// Re-export currency utilities for backward compatibility
export { formatCurrency, CURRENCIES } from './utils/currency';
