import React from 'react';
import { Outlet } from 'react-router-dom';

const GuestLayout = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
      <div className="max-w-md w-full p-8 bg-white dark:bg-slate-800 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-700">
        <Outlet />
      </div>
    </div>
  );
};

export default GuestLayout;
