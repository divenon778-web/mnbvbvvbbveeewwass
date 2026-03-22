import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { User, ChevronDown, Palette, LogOut, ShoppingBag, Coins } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { userData } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await signOut(auth);
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans flex">
      <div className="w-full flex">
        <div className="bg-[#0A0A0A] overflow-hidden flex h-screen w-full">
          
          {/* Sidebar */}
          <div className="w-64 border-r border-white/5 flex flex-col py-6 bg-[#050505] hidden md:flex">
            <div className="px-6 mb-8">
              <Link to="/" className="text-white font-bold text-xl tracking-tighter lowercase">hushd</Link>
            </div>
            
            <div className="px-4 flex flex-col gap-1">
              <Link to="/dashboard" className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors ${location.pathname === '/dashboard' ? 'bg-zinc-500/10 text-white border border-zinc-500/20' : 'text-zinc-400 hover:bg-white/5'}`}>
                <div className="flex items-center gap-3">
                  <User size={16} />
                  <span className="text-sm font-medium">Account</span>
                </div>
                <ChevronDown size={16} className="text-zinc-500" />
              </Link>
              {location.pathname === '/dashboard' && (
                <div className="flex flex-col pl-10 pr-3 py-1 gap-2">
                  <span className="text-xs text-zinc-400 cursor-pointer">Overview</span>
                  <span className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">Badges</span>
                </div>
              )}
              
              <Link to="/dashboard/customize" className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors mt-2 ${location.pathname === '/dashboard/customize' ? 'bg-zinc-500/10 text-white border border-zinc-500/20' : 'text-zinc-400 hover:bg-white/5'}`}>
                <div className="flex items-center gap-3">
                  <Palette size={16} />
                  <span className="text-sm font-medium">Customize</span>
                </div>
                <ChevronDown size={16} className="text-zinc-500" />
              </Link>
              {location.pathname === '/dashboard/customize' && (
                <div className="flex flex-col pl-10 pr-3 py-1 gap-2">
                  <span className="text-xs text-zinc-400 cursor-pointer">Profile</span>
                  <span className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">Assets</span>
                  <span className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">Links</span>
                </div>
              )}

              <Link to="/dashboard/store" className={`flex items-center justify-between px-3 py-2 rounded-lg cursor-pointer transition-colors mt-2 ${location.pathname === '/dashboard/store' ? 'bg-zinc-500/10 text-white border border-zinc-500/20' : 'text-zinc-400 hover:bg-white/5'}`}>
                <div className="flex items-center gap-3">
                  <ShoppingBag size={16} />
                  <span className="text-sm font-medium">You're Store</span>
                </div>
                <ChevronDown size={16} className="text-zinc-500" />
              </Link>
              {location.pathname === '/dashboard/store' && (
                <div className="flex flex-col pl-10 pr-3 py-1 gap-2">
                  <span className="text-xs text-zinc-400 cursor-pointer">Marketplace</span>
                  <span className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">My Items</span>
                  <span className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">Purchases</span>
                </div>
              )}
            </div>

            <div className="mt-auto px-4 flex flex-col gap-2">
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-500/10 border border-zinc-500/20 mb-2">
                <Coins size={16} className="text-zinc-500" />
                <div className="flex flex-col">
                  <span className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Balance</span>
                  <span className="text-sm font-bold text-white">{userData?.coins || 0} Coins</span>
                </div>
              </div>
              <Link to={`/${userData?.username}`} className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors text-sm font-medium">
                <User size={16} />
                View Profile
              </Link>
              <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors text-sm font-medium">
                <LogOut size={16} />
                Logout
              </button>
              <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#111111] border border-white/5">
                <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden">
                  <img src={userData?.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${userData?.username || 'user'}`} alt="User" className="w-full h-full object-cover" />
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-white leading-tight">{userData?.username || 'user'}</span>
                  <span className="text-xs text-zinc-500">#{userData?.uid?.substring(0, 4) || '0000'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto bg-[#0A0A0A] no-scrollbar">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
