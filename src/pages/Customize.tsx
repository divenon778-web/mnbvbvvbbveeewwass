import React, { useState, useEffect } from 'react';
// Force rebuild
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../AuthContext';
import { doc, getDoc, updateDoc, addDoc, collection, serverTimestamp, query, where, getDocs, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';
import toast from 'react-hot-toast';
import { X, Upload, Music, ImageIcon, MousePointer2, Cat, Type, Sparkles, Link, Layout, ShoppingBag, Plus, Eye, Save, Trash2, Coins, Palette } from 'lucide-react';
import BioPreview from '../components/BioPreview';
import { motion, AnimatePresence } from 'framer-motion';

export default function Customize() {
  const { user, userData } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'design' | 'bio' | 'templates'>('general');
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [sellPrice, setSellPrice] = useState(100);
  const [sellName, setSellName] = useState('');
  const [savedTemplates, setSavedTemplates] = useState<any[]>([]);
  const [fetchingTemplates, setFetchingTemplates] = useState(false);

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
    fetchSavedTemplates();
  }, [user]);

  const fetchSavedTemplates = async () => {
    if (!user) return;
    setFetchingTemplates(true);
    try {
      const q = query(collection(db, 'templates'), where('userId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const templates = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedTemplates(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
    } finally {
      setFetchingTemplates(false);
    }
  };

  const handleSaveTemplate = async () => {
    if (!user || !profile) return;
    const name = prompt('Enter a name for your template:');
    if (!name) return;

    try {
      await addDoc(collection(db, 'templates'), {
        userId: user.uid,
        name,
        data: profile,
        createdAt: serverTimestamp()
      });
      toast.success('Template saved!');
      fetchSavedTemplates();
    } catch (error) {
      console.error("Error saving template:", error);
      toast.error('Failed to save template');
    }
  };

  const handleApplyTemplate = (templateData: any) => {
    if (!confirm('Are you sure you want to apply this template? This will overwrite your current settings.')) return;
    setProfile({
      ...templateData,
      uid: profile?.uid,
      username: profile?.username,
      profileViews: profile?.profileViews || 0
    });
    toast.success('Template applied! Don\'t forget to save changes.');
  };

  const handleDeleteTemplate = async (templateId: string) => {
    if (!confirm('Are you sure you want to delete this template?')) return;
    try {
      await deleteDoc(doc(db, 'templates', templateId));
      toast.success('Template deleted');
      fetchSavedTemplates();
    } catch (error) {
      console.error("Error deleting template:", error);
      toast.error('Failed to delete template');
    }
  };

  const handleSave = async () => {
    if (!user || !profile) return;
    setSaving(true);
    try {
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

  const handleSellAsTemplate = async () => {
    if (!user || !userData || !profile) return;
    if (!sellName.trim()) {
      toast.error('Please enter a name for your template');
      return;
    }
    try {
      const itemData = {
        name: sellName,
        description: `A unique bio template created by @${userData.username}.`,
        price: sellPrice,
        type: 'template',
        fileUrl: profile.avatarUrl || 'https://picsum.photos/seed/template/400/400',
        templateData: profile,
        sellerId: user.uid,
        sellerUsername: userData.username,
        createdAt: serverTimestamp(),
        sales: 0,
        active: true
      };

      await addDoc(collection(db, 'store_items'), itemData);
      toast.success('Template listed in store!');
      setIsSellModalOpen(false);
      setSellName('');
    } catch (error) {
      console.error("Error selling template:", error);
      toast.error('Failed to list template');
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
      <div className="p-8 flex flex-col text-left max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Customize</h2>
            <p className="text-zinc-500 text-sm">Personalize your bio profile and create templates.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={() => setIsSellModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-500/10 text-zinc-400 border border-zinc-500/20 rounded-xl text-sm font-medium hover:bg-zinc-500/20 transition-colors"
            >
              <ShoppingBag size={16} />
              Sell as Template
            </button>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-6 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              <Save size={16} />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-6 border-b border-white/5 mb-8">
          <button 
            onClick={() => setActiveTab('general')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'general' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            General
            {activeTab === 'general' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
          <button 
            onClick={() => setActiveTab('design')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'design' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Design
            {activeTab === 'design' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
          <button 
            onClick={() => setActiveTab('bio')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'bio' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Bio & Effects
            {activeTab === 'bio' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
          <button 
            onClick={() => setActiveTab('templates')}
            className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'templates' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
          >
            Templates
            {activeTab === 'templates' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Left Side: Controls */}
          <div className="lg:col-span-8 space-y-8">
            {activeTab === 'general' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <ImageIcon size={20} className="text-zinc-400" />
                    Media Assets
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Background */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Background URL</label>
                      <div className="relative h-40 bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden group flex items-center justify-center">
                        {profile?.backgroundUrl ? (
                          <>
                            {profile.backgroundType === 'video' ? (
                              <video src={profile.backgroundUrl} className="w-full h-full object-cover opacity-50" autoPlay loop muted playsInline />
                            ) : (
                              <img src={profile.backgroundUrl} className="w-full h-full object-cover opacity-50" alt="bg" />
                            )}
                            <button onClick={() => handleRemove('backgroundUrl')} className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors z-10">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full p-4">
                            <Link size={24} className="text-zinc-500 mb-3" />
                            <input 
                              type="text" 
                              placeholder="Paste Image/Video URL..." 
                              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-zinc-500/50 transition-colors"
                              onChange={(e) => handleUrlChange('backgroundUrl', e.target.value, e.target.value.includes('.mp4') ? 'video' : 'image')}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Avatar */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Avatar URL</label>
                      <div className="relative h-40 bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden group flex items-center justify-center">
                        {profile?.avatarUrl ? (
                          <>
                            <img src={profile.avatarUrl} className="w-full h-full object-cover opacity-70" alt="avatar" />
                            <button onClick={() => handleRemove('avatarUrl')} className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors z-10">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full p-4">
                            <Upload size={24} className="text-zinc-500 mb-3" />
                            <input 
                              type="text" 
                              placeholder="Paste Image URL..." 
                              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-zinc-500/50 transition-colors"
                              onChange={(e) => handleUrlChange('avatarUrl', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Audio */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Audio URL (MP3/Direct)</label>
                      <div className="relative h-40 bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden group flex items-center justify-center">
                        {profile?.audioUrl ? (
                          <>
                            <div className="flex flex-col items-center justify-center w-full h-full bg-zinc-500/5">
                              <Music size={32} className="text-zinc-400 mb-3" />
                              <span className="text-xs font-bold text-zinc-400/70">Audio Linked</span>
                            </div>
                            <button onClick={() => handleRemove('audioUrl')} className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors z-10">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full p-4">
                            <Music size={24} className="text-zinc-500 mb-3" />
                            <input 
                              type="text" 
                              placeholder="Paste Audio URL..." 
                              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-zinc-500/50 transition-colors"
                              onChange={(e) => handleUrlChange('audioUrl', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cursor */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Custom Cursor URL</label>
                      <div className="relative h-40 bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden group flex items-center justify-center">
                        {profile?.cursorUrl ? (
                          <>
                            <img src={profile.cursorUrl} className="w-12 h-12 object-contain" alt="cursor" />
                            <button onClick={() => handleRemove('cursorUrl')} className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors z-10">
                              <X size={14} />
                            </button>
                          </>
                        ) : (
                          <div className="flex flex-col items-center justify-center w-full h-full p-4">
                            <MousePointer2 size={24} className="text-zinc-500 mb-3" />
                            <input 
                              type="text" 
                              placeholder="Paste Image URL..." 
                              className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-zinc-500/50 transition-colors"
                              onChange={(e) => handleUrlChange('cursorUrl', e.target.value)}
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Cat size={20} className="text-zinc-400" />
                    Custom Pet
                  </h3>
                  <div className="relative h-40 bg-[#0A0A0A] border border-white/10 rounded-2xl overflow-hidden group flex items-center justify-center max-w-sm">
                    {profile?.petUrl ? (
                      <>
                        <img src={profile.petUrl} className="w-24 h-24 object-contain" alt="pet" />
                        <button onClick={() => handleRemove('petUrl')} className="absolute top-3 right-3 w-8 h-8 bg-black/50 rounded-full flex items-center justify-center text-white hover:bg-red-500 transition-colors z-10">
                          <X size={14} />
                        </button>
                      </>
                    ) : (
                      <div className="flex flex-col items-center justify-center w-full h-full p-4">
                        <Cat size={24} className="text-zinc-500 mb-3" />
                        <input 
                          type="text" 
                          placeholder="Paste Pet Image URL (GIF/PNG)..." 
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-2 text-xs text-white focus:outline-none focus:border-zinc-500/50 transition-colors"
                          onChange={(e) => handleUrlChange('petUrl', e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'design' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Palette size={20} className="text-zinc-400" />
                    Profile Aesthetics
                  </h3>
                  
                  <div className="space-y-8">
                    {/* Theme Color */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Theme Color (Hex)</label>
                      <div className="flex gap-4 items-center">
                        <div 
                          className="w-10 h-10 rounded-full border border-white/20 shrink-0" 
                          style={{ backgroundColor: profile?.themeColor || '#ffffff' }}
                        />
                        <input 
                          type="text" 
                          value={profile?.themeColor || '#ffffff'}
                          onChange={(e) => setProfile({ ...profile, themeColor: e.target.value })}
                          placeholder="#FFFFFF"
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-500/50 transition-colors uppercase"
                        />
                      </div>
                      <div className="flex gap-2 mt-2">
                        {['#ffffff', '#ef4444', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'].map(color => (
                          <button
                            key={color}
                            onClick={() => setProfile({ ...profile, themeColor: color })}
                            className="w-6 h-6 rounded-full border border-white/10 hover:scale-110 transition-transform"
                            style={{ backgroundColor: color }}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Font Family */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Font Style</label>
                      <select 
                        value={profile?.font || 'inter'}
                        onChange={(e) => setProfile({ ...profile, font: e.target.value })}
                        className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-500/50 transition-colors appearance-none"
                      >
                        <option value="inter">Inter (Modern Sans)</option>
                        <option value="roboto">Roboto (Clean Sans)</option>
                        <option value="space-grotesk">Space Grotesk (Tech/Edgy)</option>
                        <option value="playfair">Playfair Display (Elegant Serif)</option>
                        <option value="comic-neue">Comic Neue (Playful)</option>
                        <option value="vt323">VT323 (Retro Terminal)</option>
                      </select>
                    </div>

                    {/* Block Style */}
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Link Block Style</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          onClick={() => setProfile({ ...profile, blockStyle: 'default' })}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${profile?.blockStyle === 'default' || !profile?.blockStyle ? 'bg-white/10 border-white/30 text-white' : 'bg-[#0A0A0A] border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}
                        >
                          <div className="w-full h-8 rounded-lg border border-white/20 bg-white/5" />
                          <span className="text-xs font-bold">Standard</span>
                        </button>
                        <button
                          onClick={() => setProfile({ ...profile, blockStyle: 'glass' })}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${profile?.blockStyle === 'glass' ? 'bg-white/10 border-white/30 text-white' : 'bg-[#0A0A0A] border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}
                        >
                          <div className="w-full h-8 rounded-lg border border-white/40 bg-white/10 backdrop-blur-md" />
                          <span className="text-xs font-bold">Glassmorphism</span>
                        </button>
                        <button
                          onClick={() => setProfile({ ...profile, blockStyle: 'neobrutal' })}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${profile?.blockStyle === 'neobrutal' ? 'bg-white/10 border-white/30 text-white' : 'bg-[#0A0A0A] border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}
                        >
                          <div className="w-full h-8 rounded-none border-2 border-white/50 bg-[#0A0A0A]" style={{ boxShadow: '4px 4px 0px rgba(255,255,255,0.3)' }} />
                          <span className="text-xs font-bold">Neo-Brutal (3D)</span>
                        </button>
                        <button
                          onClick={() => setProfile({ ...profile, blockStyle: 'minimal' })}
                          className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${profile?.blockStyle === 'minimal' ? 'bg-white/10 border-white/30 text-white' : 'bg-[#0A0A0A] border-white/10 text-zinc-500 hover:border-white/20 hover:text-zinc-300'}`}
                        >
                          <div className="w-full h-8 border-b-2 border-white/20 bg-transparent" />
                          <span className="text-xs font-bold">Minimal Line</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'bio' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Type size={20} className="text-zinc-400" />
                    Bio Content
                  </h3>
                  <div className="space-y-6">
                    <div className="flex flex-col gap-3">
                      <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Description</label>
                      <textarea 
                        value={profile?.bio || ''}
                        onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                        placeholder="Tell the world about yourself..."
                        className="w-full h-32 bg-[#0A0A0A] border border-white/10 rounded-2xl p-4 text-sm text-white focus:outline-none focus:border-zinc-500/50 transition-colors resize-none"
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="flex flex-col gap-3">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Username Effect</label>
                        <select 
                          value={profile?.usernameEffect || 'none'}
                          onChange={(e) => setProfile({ ...profile, usernameEffect: e.target.value })}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-500/50 transition-colors appearance-none"
                        >
                          <option value="none">None</option>
                          <option value="glow">Glow</option>
                          <option value="sparkle">Sparkle</option>
                          <option value="glitch">Glitch</option>
                          <option value="gradient">Gradient</option>
                        </select>
                      </div>
                      <div className="flex flex-col gap-3">
                        <label className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Background Effect</label>
                        <select 
                          value={profile?.backgroundEffect || 'none'}
                          onChange={(e) => setProfile({ ...profile, backgroundEffect: e.target.value })}
                          className="w-full bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-500/50 transition-colors appearance-none"
                        >
                          <option value="none">None</option>
                          <option value="snow">Snowflakes</option>
                          <option value="rain">Rain</option>
                          <option value="stars">Stars</option>
                          <option value="particles">Particles</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Link size={20} className="text-zinc-400" />
                    Social Links
                  </h3>
                  <div className="space-y-4">
                    {profile?.links?.map((link: any, index: number) => (
                      <motion.div 
                        key={link.id || index}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="flex gap-3"
                      >
                        <input 
                          type="text" 
                          value={link.title}
                          onChange={(e) => {
                            const newLinks = [...(profile.links || [])];
                            newLinks[index].title = e.target.value;
                            setProfile({ ...profile, links: newLinks });
                          }}
                          placeholder="Title"
                          className="w-1/3 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-500/50"
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
                          className="flex-1 bg-[#0A0A0A] border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-zinc-500/50"
                        />
                        <button 
                          onClick={() => {
                            const newLinks = profile.links.filter((_: any, i: number) => i !== index);
                            setProfile({ ...profile, links: newLinks });
                          }}
                          className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                        >
                          <X size={18} />
                        </button>
                      </motion.div>
                    ))}
                    <button 
                      onClick={() => {
                        const newLinks = [...(profile.links || []), { id: Date.now().toString(), title: '', url: '', icon: '' }];
                        setProfile({ ...profile, links: newLinks });
                      }}
                      className="w-full py-4 border border-dashed border-white/10 rounded-2xl text-sm text-zinc-500 hover:text-white hover:border-white/20 transition-all flex items-center justify-center gap-2"
                    >
                      <Plus size={16} />
                      Add New Link
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'templates' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="bg-[#111111] border border-white/5 rounded-3xl p-8">
                  <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                    <Layout size={20} className="text-zinc-400" />
                    Template Management
                  </h3>
                  <p className="text-zinc-500 text-sm mb-8">
                    Save your current configuration as a template to use later or sell it in the marketplace.
                  </p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <button 
                      onClick={handleSaveTemplate}
                      className="flex flex-col items-center justify-center gap-4 p-8 bg-white/5 border border-white/5 rounded-3xl hover:bg-white/10 hover:border-white/10 transition-all group"
                    >
                      <div className="p-4 bg-zinc-500/10 rounded-2xl text-zinc-400 group-hover:scale-110 transition-transform">
                        <Save size={32} />
                      </div>
                      <div className="text-center">
                        <span className="block text-white font-bold mb-1">Save Current</span>
                        <span className="text-xs text-zinc-500">Save to Downloaded Templates</span>
                      </div>
                    </button>

                    <button 
                      onClick={() => setIsSellModalOpen(true)}
                      className="flex flex-col items-center justify-center gap-4 p-8 bg-zinc-500/5 border border-zinc-500/10 rounded-3xl hover:bg-zinc-500/10 hover:border-zinc-500/20 transition-all group"
                    >
                      <div className="p-4 bg-zinc-500/10 rounded-2xl text-zinc-400 group-hover:scale-110 transition-transform">
                        <ShoppingBag size={32} />
                      </div>
                      <div className="text-center">
                        <span className="block text-white font-bold mb-1">Sell Template</span>
                        <span className="text-xs text-zinc-500">List in the marketplace for coins</span>
                      </div>
                    </button>
                  </div>

                  <div className="mt-12 space-y-4">
                    <h4 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Downloaded Templates</h4>
                    {fetchingTemplates ? (
                      <div className="text-zinc-500 text-sm">Loading templates...</div>
                    ) : savedTemplates.length === 0 ? (
                      <div className="p-8 text-center bg-white/5 border border-dashed border-white/10 rounded-2xl text-zinc-500 text-sm">
                        No private templates saved yet.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 gap-4">
                        {savedTemplates.map((template) => (
                          <div key={template.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex items-center justify-between group">
                            <div>
                              <h4 className="font-bold text-white text-sm">{template.name}</h4>
                              <p className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">
                                {template.createdAt?.toDate ? template.createdAt.toDate().toLocaleDateString() : 'Just now'}
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handleApplyTemplate(template.data)}
                                className="px-4 py-2 bg-white text-black text-xs font-bold rounded-xl hover:bg-zinc-200 transition-colors"
                              >
                                Apply
                              </button>
                              <button 
                                onClick={() => handleDeleteTemplate(template.id)}
                                className="p-2 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Side: Preview */}
          <div className="lg:col-span-4">
            <div className="sticky top-8">
              <div className="flex items-center justify-between mb-4 px-2">
                <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-tighter flex items-center gap-2">
                  <Eye size={14} />
                  Live Preview
                </h3>
                <span className="text-[10px] text-zinc-600">Real-time updates</span>
              </div>
              <BioPreview profile={profile} username={userData?.username || 'username'} />
            </div>
          </div>
        </div>

        {/* Sell Template Modal */}
        <AnimatePresence>
          {isSellModalOpen && (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSellModalOpen(false)}
                className="absolute inset-0 bg-black/80 backdrop-blur-sm"
              />
              <motion.div 
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                className="relative z-10 w-full max-w-md bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-white mb-2">Sell Template</h2>
                <p className="text-zinc-500 text-sm mb-8">Set a price for your current bio configuration.</p>
                
                <div className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Template Name</label>
                    <input 
                      type="text"
                      value={sellName}
                      onChange={(e) => setSellName(e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="e.g. Minimalist Dark Theme"
                    />
                  </div>
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Price (Coins)</label>
                    <div className="relative">
                      <Coins size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="number"
                        value={sellPrice}
                        onChange={(e) => setSellPrice(parseInt(e.target.value) || 0)}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                        placeholder="100"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-zinc-500/5 border border-zinc-500/10 rounded-2xl">
                    <p className="text-[10px] text-zinc-400 leading-relaxed">
                      By listing this template, other users will be able to purchase it and apply it to their own profiles. You will receive the full coin amount for every sale.
                    </p>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      onClick={() => setIsSellModalOpen(false)}
                      className="flex-1 py-3 bg-white/5 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      onClick={handleSellAsTemplate}
                      className="flex-1 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors"
                    >
                      List Now
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
