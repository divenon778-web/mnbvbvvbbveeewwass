import React, { useEffect, useState } from 'react';
import { Edit2, AtSign, Hash, Eye, ShoppingBag } from 'lucide-react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../AuthContext';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';

interface StatData {
  date: string;
  views: number;
  sales: number;
}

export default function Dashboard() {
  const { user, userData } = useAuth();
  const [stats, setStats] = useState<StatData[]>([]);
  const [loading, setLoading] = useState(true);

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
      </div>
    </DashboardLayout>
  );
}
