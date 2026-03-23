import React, { useEffect, useState } from 'react';
import { Edit2, AtSign, Hash, Eye, ShoppingBag, Coins, X, Check, AlertCircle } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../AuthContext';
import { collection, query, where, getDocs, doc, updateDoc, serverTimestamp, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

interface StatData {
  date: string;
  views: number;
  sales: number;
}

export default function Dashboard() {
  const { user, userData, refreshUserData } = useAuth();
  const [stats, setStats] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUsernameModalOpen, setIsUsernameModalOpen] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [cooldownText, setCooldownText] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return;

      try {
        // Fetch views
        const viewsQ = query(
          collection(db, 'profile_views'),
          where('profileId', '==', user.uid)
        );
        const viewsSnapshot = await getDocs(viewsQ);

        // Fetch sales
        const salesQ = query(
          collection(db, 'transactions'),
          where('sellerId', '==', user.uid)
        );
        const salesSnapshot = await getDocs(salesQ);

        // Process data into daily buckets for the last 7 days
        const days = [];
        for (let i = 6; i >= 0; i--) {
          const d = new Date();
          d.setDate(d.getDate() - i);
          days.push({
            date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            fullDate: d.toDateString(),
            views: 0,
            sales: 0
          });
        }

        viewsSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.timestamp) {
            const date = data.timestamp.toDate().toDateString();
            const dayIndex = days.findIndex(d => d.fullDate === date);
            if (dayIndex !== -1) {
              days[dayIndex].views++;
            }
          }
        });

        salesSnapshot.docs.forEach(doc => {
          const data = doc.data();
          if (data.timestamp) {
            const date = data.timestamp.toDate().toDateString();
            const dayIndex = days.findIndex(d => d.fullDate === date);
            if (dayIndex !== -1) {
              days[dayIndex].sales++;
            }
          }
        });

        setStats(days.map(({ date, views, sales }) => ({ date, views, sales })));
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [user]);

  useEffect(() => {
    if (userData?.lastUsernameChange) {
      const lastChange = userData.lastUsernameChange.toDate ? userData.lastUsernameChange.toDate() : new Date(userData.lastUsernameChange);
      const now = new Date();
      const diff = now.getTime() - lastChange.getTime();
      const sevenDays = 7 * 24 * 60 * 60 * 1000;

      if (diff < sevenDays) {
        const remaining = sevenDays - diff;
        const days = Math.floor(remaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((remaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        setCooldownText(`Change available in ${days}d ${hours}h`);
      } else {
        setCooldownText(null);
      }
    } else {
      setCooldownText(null);
    }
  }, [userData?.lastUsernameChange]);

  const handleUsernameChange = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData || isUpdating) return;
    
    const formattedUsername = newUsername.trim().toLowerCase().replace(/[^a-z0-9_]/g, '');
    
    if (formattedUsername.length < 1 || formattedUsername.length > 20) {
      toast.error('Username must be between 1 and 20 characters');
      return;
    }

    if (formattedUsername === userData.username) {
      toast.error('Please enter a different username');
      return;
    }

    setIsUpdating(true);
    try {
      // 1. Check for uniqueness (using profiles collection which is publicly readable)
      const q = query(collection(db, 'profiles'), where('username', '==', formattedUsername));
      const querySnapshot = await getDocs(q);
      
      if (!querySnapshot.empty) {
        toast.error('This username is already taken');
        setIsUpdating(false);
        return;
      }

      // 2. Update documents
      const batchPromises = [
        updateDoc(doc(db, 'users', user.uid), {
          username: formattedUsername,
          lastUsernameChange: serverTimestamp()
        }),
        updateDoc(doc(db, 'profiles', user.uid), {
          username: formattedUsername,
          displayName: formattedUsername // Update display name as well for consistency
        })
      ];

      await Promise.all(batchPromises);
      
      toast.success('Username updated successfully!');
      setIsUsernameModalOpen(false);
      setNewUsername('');
      refreshUserData();
    } catch (error) {
      console.error("Error updating username:", error);
      toast.error('Failed to update username');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 flex flex-col text-left">
        <h2 className="text-xl text-white mb-6">Welcome back, <span className="text-zinc-400">{userData?.username}</span></h2>

        {/* Top Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div 
            onClick={() => !cooldownText && setIsUsernameModalOpen(true)}
            className={`p-4 rounded-xl border flex flex-col justify-between h-24 transition-all cursor-pointer ${cooldownText ? 'bg-zinc-500/5 border-white/5 opacity-50 grayscale' : 'bg-[#111111] border-white/5 hover:border-white/20'}`}
          >
            <div className="flex justify-between items-start">
              <span className="text-xs text-zinc-500">Username</span>
              <Edit2 size={14} className={cooldownText ? "text-zinc-600" : "text-zinc-400"} />
            </div>
            <div>
              <div className="text-lg font-medium text-white">{userData?.username}</div>
              <div className={`text-[10px] uppercase font-bold tracking-tighter mt-1 ${cooldownText ? 'text-zinc-600' : 'text-zinc-400'}`}>
                {cooldownText || 'Change Available Now'}
              </div>
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
            <div className="text-lg font-medium text-white">
              {userData?.uid ? (
                Math.abs(userData.uid.split('').reduce((acc: number, char: string) => {
                  return ((acc << 5) - acc) + char.charCodeAt(0);
                }, 0) % 100000).toString().padStart(5, '0')
              ) : '00000'}
            </div>
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Views Stats */}
          <div className="p-6 rounded-xl bg-[#111111] border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm text-white">Profile <span className="text-zinc-400">Views</span></h3>
              <div className="flex items-center gap-2 px-2 py-1 bg-zinc-500/10 rounded-lg border border-zinc-500/20">
                <Eye size={12} className="text-zinc-400" />
                <span className="text-[10px] text-white font-bold">{userData?.profileViews || 0} Total</span>
              </div>
            </div>
            
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center text-zinc-500 text-xs">Loading views data...</div>
              ) : stats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats}>
                    <defs>
                      <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#71717a" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#71717a" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717a', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '10px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="views" 
                      stroke="#71717a" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorViews)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-500 text-xs">No views data yet</div>
              )}
            </div>
          </div>

          {/* Sales Stats */}
          <div className="p-6 rounded-xl bg-[#111111] border border-white/5">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-sm text-white">Template <span className="text-zinc-400">Sales</span></h3>
              <div className="flex items-center gap-2 px-2 py-1 bg-zinc-500/10 rounded-lg border border-zinc-500/20">
                <ShoppingBag size={12} className="text-zinc-400" />
                <span className="text-[10px] text-white font-bold">Last 7 Days</span>
              </div>
            </div>
            
            <div className="h-64 w-full">
              {loading ? (
                <div className="h-full w-full flex items-center justify-center text-zinc-500 text-xs">Loading sales data...</div>
              ) : stats.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats}>
                    <defs>
                      <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#a1a1aa" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#a1a1aa" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#ffffff05" vertical={false} />
                    <XAxis 
                      dataKey="date" 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717a', fontSize: 10 }}
                      dy={10}
                    />
                    <YAxis 
                      axisLine={false} 
                      tickLine={false} 
                      tick={{ fill: '#71717a', fontSize: 10 }}
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#111111', border: '1px solid rgba(255,255,255,0.05)', borderRadius: '8px', fontSize: '10px' }}
                      itemStyle={{ color: '#fff' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey="sales" 
                      stroke="#a1a1aa" 
                      strokeWidth={2}
                      fillOpacity={1} 
                      fill="url(#colorSales)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full w-full flex items-center justify-center text-zinc-500 text-xs">No sales data yet</div>
              )}
            </div>
          </div>
        </div>

        {/* Username Change Modal */}
        <AnimatePresence>
          {isUsernameModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsUsernameModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative z-10 w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-white/5 rounded-xl">
                    <Edit2 size={20} className="text-white" />
                  </div>
                  <h2 className="text-2xl font-bold text-white">Change Username</h2>
                </div>

                <form onSubmit={handleUsernameChange} className="space-y-6">
                  <div className="p-4 bg-zinc-500/5 border border-zinc-500/10 rounded-2xl flex items-start gap-3">
                    <AlertCircle size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-zinc-400 leading-relaxed uppercase font-bold tracking-tighter">
                      You can only change your username once every 7 days. Make sure you pick something you like!
                    </p>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-[10px] text-zinc-500 uppercase font-bold tracking-widest">New Username</label>
                    <div className="relative">
                      <AtSign size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="text"
                        required
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                        placeholder="new_username"
                      />
                    </div>
                    <p className="text-[10px] text-zinc-500 mt-1 uppercase font-bold tracking-tighter">
                      Only lowercase letters, numbers, and underscores allowed.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button 
                      type="button"
                      onClick={() => setIsUsernameModalOpen(false)}
                      className="flex-1 py-3 bg-white/5 text-white rounded-xl text-xs font-bold hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      disabled={isUpdating || !newUsername.trim()}
                      className="flex-1 py-3 bg-white text-black rounded-xl text-xs font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {isUpdating ? 'Updating...' : 'Update Username'}
                      {!isUpdating && <Check size={14} />}
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
