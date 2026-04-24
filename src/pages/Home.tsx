import React, { useState } from 'react';
import { QRCodeDisplay } from '../components/QRCodeDisplay';
import { Users, Link as LinkIcon, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';

export function Home() {
  const [guestName, setGuestName] = useState('');
  const [partySize, setPartySize] = useState<number | ''>('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedQueueId, setGeneratedQueueId] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestName || !partySize) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/queue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ guest_name: guestName, party_size: Number(partySize) }),
      });
      const data = await res.json();
      if (data.id) {
        setGeneratedQueueId(data.id);
        setGuestName('');
        setPartySize('');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const getTrackingUrl = () => {
    if (!generatedQueueId) return '';
    return `${window.location.origin}/track?queue_id=${generatedQueueId}`;
  };

  return (
    <div className="max-w-md mx-auto p-6 space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-6">
        <div>
          <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Add New Party</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label htmlFor="guestName" className="text-xs font-semibold text-slate-700">Guest Name</label>
              <input
                id="guestName"
                type="text"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all font-medium text-slate-900"
                placeholder="e.g. Sarah Jenkins"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="partySize" className="text-xs font-semibold text-slate-700">Party Size</label>
              <input
                id="partySize"
                type="number"
                min="1"
                className="w-full px-3 py-2 text-sm border border-slate-200 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 bg-slate-50/50 transition-all font-medium text-slate-900"
                placeholder="e.g. 4"
                value={partySize}
                onChange={(e) => setPartySize(e.target.value ? Number(e.target.value) : '')}
                required
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !guestName || !partySize}
              className="w-full bg-blue-600 text-white py-2.5 rounded-md text-sm font-semibold hover:bg-blue-700 active:transform active:scale-[0.98] transition-all shadow-sm shadow-blue-200 mt-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <span>Generate Queue Entry</span>
              )}
            </button>
          </form>
        </div>
      </div>

      {generatedQueueId && (
        <div className="animate-in zoom-in-95 duration-300">
          <div className="p-4 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-bold text-slate-500 uppercase">Active Track URL</span>
              <span className="text-[10px] text-blue-600 font-mono">#{generatedQueueId.substring(0, 8)}...</span>
            </div>
            
            <div className="bg-white border border-slate-200 p-4 rounded-lg flex flex-col items-center justify-center space-y-4">
              <QRCodeDisplay url={getTrackingUrl()} />
              <div className="w-full flex items-center justify-between bg-slate-50 p-2 rounded border border-slate-100">
                <span className="text-[10px] text-slate-500 font-mono truncate mr-2">{getTrackingUrl()}</span>
                <button
                  onClick={() => navigator.clipboard.writeText(getTrackingUrl())}
                  className="text-blue-600 hover:text-blue-700 transition"
                  title="Copy to clipboard"
                >
                  <LinkIcon className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <button
              onClick={() => setGeneratedQueueId(null)}
              className="w-full mt-3 text-xs font-bold text-slate-400 hover:text-slate-600 transition tracking-wider uppercase"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <div className="flex justify-center flex-col space-y-4 pt-4">
        <Link to="/manager" className="w-full bg-white border border-slate-200 text-slate-700 py-2.5 rounded-md text-sm font-semibold hover:bg-slate-50 transition-all text-center shadow-sm">
          Open Manager Dashboard
        </Link>
      </div>
    </div>
  );
}
