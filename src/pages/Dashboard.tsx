import React from 'react';
import { Edit2, AtSign, Hash, Eye } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../AuthContext';

export default function Dashboard() {
  const { userData } = useAuth();

  return (
    <DashboardLayout>
      <div className="p-8 flex flex-col text-left">
        <h2 className="text-xl text-white mb-6">Welcome back, <span className="text-zinc-400">{userData?.username}</span></h2>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div className="p-4 rounded-xl bg-[#111111] border border-white/5 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-500">Username</span>
              <Edit2 size={14} className="text-zinc-400" />
            </div>
            <div>
              <div className="text-lg font-medium text-white">{userData?.username}</div>
              <div className="text-[10px] text-zinc-500 mt-1">Change available now</div>
            </div>
          </div>
          <div className="p-4 rounded-xl bg-[#111111] border border-white/5 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-500">Alias</span>
              <AtSign size={14} className="text-zinc-400" />
            </div>
            <div className="text-lg font-medium text-white">{userData?.username}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#111111] border border-white/5 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-500">UID</span>
              <Hash size={14} className="text-zinc-400" />
            </div>
            <div className="text-lg font-medium text-white">{userData?.uid?.substring(0, 4)}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#111111] border border-white/5 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-500">Profile Views</span>
              <Eye size={14} className="text-zinc-400" />
            </div>
            <div className="text-lg font-medium text-white">{userData?.profileViews || 0}</div>
          </div>
          <div className="p-4 rounded-xl bg-[#111111] border border-white/5 flex flex-col justify-between h-24">
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-500">Profile Visibility</span>
              <Eye size={14} className="text-zinc-400" />
            </div>
            <div className="text-lg font-medium text-white capitalize">{userData?.visibility || 'Public'}</div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="grid grid-cols-1 gap-6 mb-8">
          {/* Stats */}
          <div className="p-6 rounded-xl bg-[#111111] border border-white/5">
            <h3 className="text-sm text-white mb-6">Account <span className="text-zinc-400">Statistics</span></h3>
            <div className="flex flex-col items-center justify-center h-40 text-zinc-500 text-sm">
              <p>No statistics available yet.</p>
              <p className="text-xs">Share your profile to start tracking views.</p>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
