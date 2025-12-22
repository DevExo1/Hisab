import React from 'react';
import { ExpenseCard } from '../components/cards';

export const Expenses = ({ darkMode, expenses, currency, setShowAddExpense }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>All Expenses</h2>
        <button
          onClick={() => setShowAddExpense(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center space-x-2"
        >
          <span>+</span>
          <span>Add Expense</span>
        </button>
      </div>

      {/* Expense Management Visual */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
        <div className="relative h-32 bg-gradient-to-r from-blue-500 to-purple-600">
          <img
            src="https://images.pexels.com/photos/6289058/pexels-photo-6289058.jpeg"
            alt="Financial management"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-lg font-semibold">Expense Management</h3>
              <p className="text-sm opacity-90">Track and split your expenses efficiently</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className={`${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-white text-gray-600'} rounded-xl p-8 text-center border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
            <p className="text-lg mb-2">No expenses yet</p>
            <p className="text-sm opacity-75">Click the "Add Expense" button to create your first expense</p>
          </div>
        ) : (
          expenses.map(expense => (
            <ExpenseCard key={expense.id} expense={expense} darkMode={darkMode} currency={currency} />
          ))
        )}
      </div>
    </div>
  );
};
