import React from 'react';
import { ActivityItem } from '../components/cards';

export const Activity = ({ darkMode, currency, activities }) => {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Recent Activity</h2>
      </div>

      {/* Digital Payment Visual */}
      <div className={`${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'} rounded-xl border overflow-hidden`}>
        <div className="relative h-32 bg-gradient-to-r from-orange-500 to-red-600">
          <img
            src="https://images.pexels.com/photos/5980887/pexels-photo-5980887.jpeg"
            alt="Digital payments"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h3 className="text-lg font-semibold">Payment Tracking</h3>
              <p className="text-sm opacity-90">Monitor all your transactions and settlements</p>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {activities.map(activity => (
          <ActivityItem key={activity.id} activity={activity} darkMode={darkMode} currency={currency} />
        ))}
      </div>
    </div>
  );
};
