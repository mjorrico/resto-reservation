import React, { useEffect, useState } from 'react';
import { Clock, User, Users, Check, Trash2, Bell } from 'lucide-react';
import { cn } from '../lib/utils';
import { Link } from 'react-router-dom';

interface QueueEntry {
  id: string;
  guest_name: string;
  party_size: number;
  status: 'WAITING' | 'CALLED';
  created_at: string;
}

export function Manager() {
  const [queue, setQueue] = useState<QueueEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchQueue = async () => {
    try {
      const res = await fetch('/api/queue');
      const data = await res.json();
      setQueue(data);
    } catch (err) {
      console.error('Failed to fetch queue', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 10000); // UI polls every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const handleCall = async (id: string) => {
    try {
      await fetch(`/api/queue/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'CALLED' }),
      });
      // Optimistic update
      setQueue((prev) => prev.map((q) => q.id === id ? { ...q, status: 'CALLED' } : q));
    } catch (err) {
      console.error(err);
    }
  };

  const handleRemove = async (id: string) => {
    try {
      await fetch(`/api/queue/${id}`, {
        method: 'DELETE',
      });
      // Optimistic update
      setQueue((prev) => prev.filter((q) => q.id !== id));
    } catch (err) {
      console.error(err);
    }
  };

  const formatTime = (isoString: string) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="max-w-4xl mx-auto flex flex-col h-full space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-10">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-slate-400 uppercase">Total Parties</span>
            <span className="text-xl font-bold text-slate-900">{queue.length.toString().padStart(2, '0')}</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/" className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-semibold hover:bg-blue-700 transition shadow-sm">
            Add New Party
          </Link>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden flex flex-col">
        <div className="hidden sm:grid grid-cols-12 gap-4 px-6 py-4 bg-slate-50/80 border-b border-slate-200 text-[11px] text-slate-500 uppercase font-bold tracking-wider">
          <div className="col-span-1">#</div>
          <div className="col-span-4">Guest Detail</div>
          <div className="col-span-2">Party</div>
          <div className="col-span-2">Status</div>
          <div className="col-span-3 text-right">Actions</div>
        </div>

        <div className="divide-y divide-slate-100 text-sm">
        {isLoading ? (
          <div className="flex justify-center p-12">
            <div className="w-6 h-6 border-2 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
          </div>
        ) : queue.length === 0 ? (
          <div className="text-center py-20 bg-slate-50/50">
            <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Queue is empty</span>
          </div>
        ) : (
          queue.map((entry, index) => (
            <div 
              key={entry.id} 
              className={cn(
                "grid grid-cols-1 sm:grid-cols-12 gap-4 px-6 py-4 items-center transition-colors",
                entry.status === 'CALLED' ? "bg-amber-50/10 hover:bg-amber-50/30" : "hover:bg-slate-50/50",
                "sm:divide-none divide-y divide-slate-50"
              )}
            >
              <div className="col-span-1 font-mono font-bold text-slate-400 hidden sm:block">
                {(index + 1).toString().padStart(2, '0')}
              </div>
              <div className="col-span-1 sm:col-span-4 pt-2 sm:pt-0">
                <div className="font-bold text-slate-900">{entry.guest_name}</div>
                <div className="text-[10px] text-slate-400 font-mono pt-0.5">UUID: {entry.id.substring(0, 18)}</div>
              </div>
              <div className="col-span-1 sm:col-span-2 pt-2 sm:pt-0">
                <span className="inline-flex items-center gap-1.5 font-medium text-slate-700">
                  <span>👤</span> <span>{(entry.party_size).toString().padStart(2, '0')}</span>
                </span>
                <div className="text-[10px] text-slate-400 sm:hidden mt-0.5">{formatTime(entry.created_at)}</div>
              </div>
              <div className="col-span-1 sm:col-span-2 pt-2 sm:pt-0 flex flex-col items-start gap-1">
                {entry.status === 'CALLED' ? (
                  <span className="status-badge bg-amber-100 text-amber-700 border border-amber-200">Called</span>
                ) : (
                  <span className="status-badge bg-blue-100 text-blue-700 border border-blue-200">Waiting</span>
                )}
                <span className="text-[10px] text-slate-400 font-medium hidden sm:block">
                  At {formatTime(entry.created_at)}
                </span>
              </div>
              <div className="col-span-1 sm:col-span-3 text-left sm:text-right space-x-3 pt-3 sm:pt-0 pb-2 sm:pb-0">
                {entry.status === 'WAITING' && (
                  <button
                    onClick={() => handleCall(entry.id)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Call Guest
                  </button>
                )}
                {entry.status === 'CALLED' && (
                  <button
                    onClick={() => handleRemove(entry.id)}
                    className="text-xs font-bold text-blue-600 hover:underline"
                  >
                    Seat
                  </button>
                )}
                <button
                  onClick={() => handleRemove(entry.id)}
                  className="text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          ))
        )}
        </div>

        <div className="mt-auto p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-medium text-slate-500">In-Memory Array • {queue.length} objects</span>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500"></div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest hidden sm:inline-block">Server State: Synchronized</span>
          </div>
        </div>
      </div>
    </div>
  );
}
