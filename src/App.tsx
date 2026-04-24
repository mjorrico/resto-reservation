/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { Home } from './pages/Home';
import { Tracker } from './pages/Tracker';
import { Manager } from './pages/Manager';
import { QrCode } from 'lucide-react';

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen flex flex-col glass-grid">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-8 shadow-sm shrink-0">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-3 h-3 bg-blue-600 rounded-full animate-pulse group-hover:scale-110 transition-transform"></div>
            <h1 className="font-bold text-slate-900 tracking-tight">Queue Manager <span className="text-blue-600">POC</span></h1>
          </Link>
          <div className="flex items-center gap-3">
             <div className="px-3 py-1.5 bg-slate-100 rounded text-xs font-medium text-slate-600 border border-slate-200 hidden sm:block">REST API: Connected</div>
          </div>
        </header>
        <main className="flex-1 py-8 px-4 sm:px-8">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/track" element={<Tracker />} />
            <Route path="/manager" element={<Manager />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
