import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Users, MapPin, CheckCircle2 } from 'lucide-react';
import { cn } from '../lib/utils';

export function Tracker() {
  const [searchParams] = useSearchParams();
  const queueId = searchParams.get('queue_id');

  const [entry, setEntry] = useState<any>(null);
  const [partiesAhead, setPartiesAhead] = useState<number>(0);
  const [isDone, setIsDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!queueId) {
      setError('Invalid link. No queue_id provided.');
      return;
    }

    const fetchStatus = async () => {
      try {
        const res = await fetch(`/api/queue/${queueId}`);
        if (res.status === 404) {
          setIsDone(true);
          return;
        }
        if (!res.ok) {
          // keep polling, maybe intermittent failure
          return;
        }
        const data = await res.json();
        setEntry(data.entry);
        setPartiesAhead(data.partiesAhead);
      } catch (err) {
        console.error('Failed to poll status', err);
      }
    };

    fetchStatus();

    const interval = setInterval(() => {
      if (!isDone) {
        fetchStatus();
      }
    }, 10000);

    return () => clearInterval(interval);
  }, [queueId, isDone]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-2xl font-bold">!</span>
          </div>
          <h2 className="text-lg font-medium text-gray-900">Unable to load Tracker</h2>
          <p className="text-gray-500">{error}</p>
        </div>
      </div>
    );
  }

  if (isDone) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] max-w-sm mx-auto p-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center w-full space-y-6">
          <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto ring-8 ring-green-50/50">
            <CheckCircle2 className="w-10 h-10 text-green-600" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">You're All Set!</h2>
            <p className="text-slate-500 text-sm">Your table is ready, or your party was removed from the waitlist.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-8 h-8 border-4 border-slate-200 border-t-blue-600 rounded-full animate-spin" />
      </div>
    );
  }

  const isCalled = entry.status === 'CALLED';

  return (
    <div className="max-w-sm mx-auto p-6 animate-in fade-in duration-500">
      <div className={cn(
        "bg-white rounded-xl shadow-sm border p-8 text-center transition-colors duration-500",
        isCalled ? "border-amber-200 bg-amber-50/30" : "border-slate-200"
      )}>
        <div className="space-y-1 mb-8">
          <h2 className="text-xl font-bold text-slate-900">Hello, {entry.guest_name}</h2>
          <div className="flex items-center justify-center text-sm font-medium text-slate-500 space-x-1">
            <Users className="w-4 h-4" />
            <span>Party of {entry.party_size}</span>
          </div>
        </div>

        {isCalled ? (
          <div className="space-y-4 animate-in slide-in-from-bottom-4">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-100 text-amber-600 mb-2 shadow-sm">
              <MapPin className="w-10 h-10" />
            </div>
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 mb-2">Please Head to the Host Stand</h1>
            <p className="text-slate-600 font-medium pb-2 text-lg">Your table is ready!</p>
          </div>
        ) : (
          <div className="space-y-2">
            <p className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">Parties Ahead of You</p>
            <div className="text-7xl font-bold tracking-tighter text-blue-600 mb-8">
              {partiesAhead.toString().padStart(2, '0')}
            </div>
            <div className="pt-6 border-t border-slate-100">
              <p className="text-sm text-slate-500 font-medium">Please stay nearby. We'll update this page automatically.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
