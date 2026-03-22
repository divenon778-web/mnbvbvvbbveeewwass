import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../AuthContext';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { X, Upload, Music, Image as ImageIcon, MousePointer2, Cat, Type, Sparkles, Link } from 'lucide-react';

export default function Customize() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user) return;
      try {
        const docRef = doc(db, 'profiles', user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProfile(docSnap.data());
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
      // Exclude profileViews from update to prevent overwriting
      const { profileViews, ...updateData } = profile;
      await updateDoc(doc(db, 'profiles', user.uid), updateData);
      toast.success('Profile updated successfully');
    } catch (error: any) {
      if (error.message.includes('Quota') || error.message.includes('too large')) {
        toast.error('File too large. Please use smaller files or URLs.');
      } else {
        toast.error('Failed to update profile');
      }
      console.error(error);
    } finally {
      setSaving(false);
    }
  };

  const handleUrlChange = (field: string, url: string, type?: 'video' | 'image' | 'audio') => {
    setProfile((prev: any) => {
      const updated = { ...prev, [field]: url };
      if (type && field === 'backgroundUrl') {
        updated.backgroundType = type;
      }
      return updated;
    });
  };

  const handleRemove = (field: string) => {
    setProfile((prev: any) => ({ ...prev, [field]: '' }));
  };

  if (loading) return <DashboardLayout><div className="p-8 text-white">Loading...</div></DashboardLayout>;

  return (
    <DashboardLayout>
      <div className="p-8 flex flex-col text-left max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-xl text-white">Customize your <span className="text-emerald-400">Profile</span></h2>
          <button 
            onClick={handleSave}
            disabled={saving}
            className="px-6 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-lg text-sm font-medium hover:bg-emerald-500/20 transition-colors disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        {/* Media Section */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Background */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">Background</span>
              <div className="relative h-32 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden group flex items-center justify-center">
                {profile?.backgroundUrl ? (
                  <>
                    {profile.backgroundType === 'video' ? (
                      <video src={profile.backgroundUrl} className="w-full h-full object-cover opacity-50" autoPlay loop muted playsInline />
                    ) : (
                      <img src={profile.backgroundUrl} className="w-full h-full object-cover opacity-50" alt="bg" />
                    )}
                    <button onClick={() => handleRemove('backgroundUrl')} className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500/50 transition-colors z-10">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Link size={20} className="text-zinc-500 mb-2" />
                    <input 
                      type="text" 
                      placeholder="Paste URL..." 
                      className="w-[90%] bg-[#0A0A0A] border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                      onChange={(e) => handleUrlChange('backgroundUrl', e.target.value, e.target.value.includes('.mp4') ? 'video' : 'image')}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Audio */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">Audio</span>
              <div className="relative h-32 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden group flex items-center justify-center">
                {profile?.audioUrl ? (
                  <>
                    <div className="flex flex-col items-center justify-center w-full h-full bg-white/5">
                      <Music size={24} className="text-emerald-400 mb-2" />
                      <span className="text-xs text-emerald-400/70">Audio linked</span>
                    </div>
                    <button onClick={() => handleRemove('audioUrl')} className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500/50 transition-colors z-10">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Link size={20} className="text-zinc-500 mb-2" />
                    <input 
                      type="text" 
                      placeholder="Paste URL..." 
                      className="w-[90%] bg-[#0A0A0A] border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                      onChange={(e) => handleUrlChange('audioUrl', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Profile Avatar */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">Profile Avatar</span>
              <div className="relative h-32 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden group flex items-center justify-center">
                {profile?.avatarUrl ? (
                  <>
                    <img src={profile.avatarUrl} className="w-full h-full object-cover opacity-70" alt="avatar" />
                    <button onClick={() => handleRemove('avatarUrl')} className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500/50 transition-colors z-10">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Link size={20} className="text-zinc-500 mb-2" />
                    <input 
                      type="text" 
                      placeholder="Paste URL..." 
                      className="w-[90%] bg-[#0A0A0A] border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                      onChange={(e) => handleUrlChange('avatarUrl', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Custom Cursor */}
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">Custom Cursor</span>
              <div className="relative h-32 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden group flex items-center justify-center">
                {profile?.cursorUrl ? (
                  <>
                    <img src={profile.cursorUrl} className="w-12 h-12 object-contain" alt="cursor" />
                    <button onClick={() => handleRemove('cursorUrl')} className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500/50 transition-colors z-10">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Link size={20} className="text-zinc-500 mb-2" />
                    <input 
                      type="text" 
                      placeholder="Paste URL..." 
                      className="w-[90%] bg-[#0A0A0A] border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                      onChange={(e) => handleUrlChange('cursorUrl', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>

          </div>
          <div className="flex justify-end mt-4">
            <span className="text-[10px] text-zinc-500 cursor-pointer hover:text-white transition-colors">More ^</span>
          </div>
        </div>

        {/* Custom Pet Section */}
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="flex flex-col gap-2">
              <span className="text-xs font-medium text-white">Custom Pet</span>
              <div className="relative h-32 bg-[#0A0A0A] border border-white/10 rounded-xl overflow-hidden group flex items-center justify-center">
                {profile?.petUrl ? (
                  <>
                    <img src={profile.petUrl} className="w-20 h-20 object-contain" alt="pet" />
                    <button onClick={() => handleRemove('petUrl')} className="absolute top-2 right-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500/50 transition-colors z-10">
                      <X size={12} />
                    </button>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center w-full h-full">
                    <Link size={20} className="text-zinc-500 mb-2" />
                    <input 
                      type="text" 
                      placeholder="Paste URL..." 
                      className="w-[90%] bg-[#0A0A0A] border border-white/10 rounded px-2 py-1 text-[10px] text-white"
                      onChange={(e) => handleUrlChange('petUrl', e.target.value)}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Bio Customization */}
        <h3 className="text-lg text-white mb-4">Bio <span className="text-emerald-400">Customization</span></h3>
        <div className="bg-[#111111] border border-white/5 rounded-2xl p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-white">Description</span>
                <div className="relative">
                  <Type size={14} className="absolute left-3 top-3 text-zinc-500" />
                  <textarea 
                    value={profile?.bio || ''}
                    onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                    placeholder="your bio here..."
                    className="w-full h-24 bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors resize-none"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-white">Username Effects</span>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">@</span>
                  <select 
                    value={profile?.usernameEffect || 'none'}
                    onChange={(e) => setProfile({ ...profile, usernameEffect: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                  >
                    <option value="none">None</option>
                    <option value="glow">Glow</option>
                    <option value="sparkle">Sparkle</option>
                    <option value="glitch">Glitch</option>
                    <option value="gradient">Gradient</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-white">Background Effects</span>
                <div className="relative">
                  <Sparkles size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                  <select 
                    value={profile?.backgroundEffect || 'none'}
                    onChange={(e) => setProfile({ ...profile, backgroundEffect: e.target.value })}
                    className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-colors appearance-none"
                  >
                    <option value="none">Select an effect...</option>
                    <option value="snow">Snowflakes</option>
                    <option value="rain">Rain</option>
                    <option value="stars">Stars</option>
                    <option value="particles">Particles</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <span className="text-xs font-medium text-white">Links</span>
                <div className="flex flex-col gap-3">
                  {profile?.links?.map((link: any, index: number) => (
                    <div key={link.id || index} className="flex gap-2">
                      <input 
                        type="text" 
                        value={link.title}
                        onChange={(e) => {
                          const newLinks = [...(profile.links || [])];
                          newLinks[index].title = e.target.value;
                          setProfile({ ...profile, links: newLinks });
                        }}
                        placeholder="Title"
                        className="w-1/3 bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                      <input 
                        type="text" 
                        value={link.url}
                        onChange={(e) => {
                          const newLinks = [...(profile.links || [])];
                          newLinks[index].url = e.target.value;
                          setProfile({ ...profile, links: newLinks });
                        }}
                        placeholder="URL"
                        className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-emerald-500/50"
                      />
                      <button 
                        onClick={() => {
                          const newLinks = profile.links.filter((_: any, i: number) => i !== index);
                          setProfile({ ...profile, links: newLinks });
                        }}
                        className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                  <button 
                    onClick={() => {
                      const newLinks = [...(profile.links || []), { id: Date.now().toString(), title: '', url: '', icon: '' }];
                      setProfile({ ...profile, links: newLinks });
                    }}
                    className="w-full py-2 border border-dashed border-white/20 rounded-lg text-xs text-zinc-400 hover:text-white hover:border-white/40 transition-colors"
                  >
                    + Add Link
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
