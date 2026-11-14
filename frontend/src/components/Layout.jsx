import React from 'react';
import { Outlet } from 'react-router-dom';
import TopNavbar from './TopNavbar';
import Sidebar from './Sidebar';
import ChatBox from './ChatBox';

export default function Layout() {
  return (
    <div className="min-h-screen bg-gradient-to-tr from-[#ffd4c0] via-[#fedac2] to-[#ffe5d9] flex flex-col md:flex-row relative overflow-x-hidden text-slate-800">
      {/* Radiant ambient glow orbs */}
      <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-gradient-to-tr from-pink-300/30 via-rose-300/20 to-amber-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -top-20 -right-20 w-96 h-96 bg-purple-300/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-amber-300/25 rounded-full blur-3xl pointer-events-none" />

      {/* Left Frosted Glass Sidebar */}
      <Sidebar />

      {/* Right Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative z-10">
        <TopNavbar />
        <main className="flex-1 overflow-y-auto p-4 sm:p-7 lg:p-8 max-w-7xl w-full mx-auto">
          <Outlet />
        </main>
      </div>

      {/* Floating AI Mentor Chat Box */}
      <ChatBox />
    </div>
  );
}
