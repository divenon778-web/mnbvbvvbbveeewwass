import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc, increment, addDoc, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, Play, Pause, ShoppingBag, Coins, Download, X, Layout, FileText } from 'lucide-react';
import toast from 'react-hot-toast';

interface StoreItem {
  id: string;
  sellerId: string;
  sellerUsername: string;
  name: string;
  description: string;
  price: number;
  type: 'file' | 'template';
  fileUrl?: string;
  templateData?: any;
  createdAt: any;
  sales: number;
}

import { handleFirestoreError, OperationType } from '../firebase';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const { user, userData, refreshUserData } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [profileId, setProfileId] = useState<string>('');
  const [storeItems, setStoreItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasEntered, setHasEntered] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const [isVolumeVisible, setIsVolumeVisible] = useState(false);
  const [isStoreOpen, setIsStoreOpen] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      try {
        const q = query(collection(db, 'profiles'), where('username', '==', username.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Profile not found');
          setLoading(false);
          return;
        }

        const profileDoc = querySnapshot.docs[0];
        const profileData = profileDoc.data();
        setProfile(profileData);
        setProfileId(profileDoc.id);

        // Increment views
        try {
          await updateDoc(profileDoc.ref, {
            profileViews: increment(1)
          });
        } catch (e) {
          // Non-critical view increment failure
          console.warn("Failed to increment view count", e);
        }

        // Record historical view
        try {
          await addDoc(collection(db, 'profile_views'), {
            profileId: profileDoc.id,
            timestamp: serverTimestamp()
          });
        } catch (e) {
          // Non-critical historical view recording failure
          console.warn("Failed to record historical view", e);
        }

        // Fetch store items if enabled
        if (profileData.showStoreOnBio) {
          const itemsQ = query(
            collection(db, 'store_items'), 
            where('sellerId', '==', profileDoc.id)
          );
          const itemsSnapshot = await getDocs(itemsQ);
          const itemsData = itemsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() } as StoreItem))
            .filter(item => (item as any).active !== false && (item as any).showOnBio !== false);
          setStoreItems(itemsData);
        }

      } catch (err) {
        console.error("Error fetching profile:", err);
        setError(`Error loading profile: ${err instanceof Error ? err.message : String(err)}`);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  const handlePurchase = async (item: StoreItem) => {
    if (!user || !userData) {
      toast.error('Please login to purchase');
      return;
    }

    if (userData.coins < item.price) {
      toast.error('Insufficient coins!');
      return;
    }

    if (item.sellerId === user.uid) {
      toast.error('You cannot buy your own item');
      return;
    }

    try {
      // 1. Deduct coins from buyer
      try {
        await updateDoc(doc(db, 'users', user.uid), { coins: increment(-item.price) });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }

      // 2. Add coins to seller
      try {
        await updateDoc(doc(db, 'users', item.sellerId), { coins: increment(item.price) });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${item.sellerId}`);
      }

      // 3. Record transaction
      try {
        await addDoc(collection(db, 'transactions'), {
          buyerId: user.uid,
          sellerId: item.sellerId,
          itemId: item.id,
          amount: item.price,
          timestamp: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.CREATE, 'transactions');
      }

      // 4. Add to purchased items
      try {
        await setDoc(doc(db, `purchased_items/${user.uid}/items`, item.id), {
          itemId: item.id,
          purchasedAt: serverTimestamp()
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `purchased_items/${user.uid}/items/${item.id}`);
      }

      // 5. Increment sales count
      try {
        await updateDoc(doc(db, 'store_items', item.id), { sales: increment(1) });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `store_items/${item.id}`);
      }

      toast.success(`Purchased ${item.name}!`);
      refreshUserData();
    } catch (error) {
      console.error("Error during purchase:", error);
      toast.error('Purchase failed');
    }
  };

  useEffect(() => {
    if (hasEntered && profile?.audioUrl && audioRef.current) {
      audioRef.current.volume = volume;
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch(e => console.error("Playback failed:", e));
    }
  }, [hasEntered, profile?.audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
    }
  }, [volume]);

  const toggleAudio = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  if (loading) return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  if (error) return <div className="min-h-screen bg-black flex items-center justify-center text-white">{error}</div>;
  if (!profile) return null;

  const themeColor = profile.themeColor || '#ffffff';

  const getFontFamily = () => {
    switch (profile.font) {
      case 'roboto': return "'Roboto', sans-serif";
      case 'space-grotesk': return "'Space Grotesk', sans-serif";
      case 'playfair': return "'Playfair Display', serif";
      case 'comic-neue': return "'Comic Neue', cursive";
      case 'vt323': return "'VT323', monospace";
      case 'inter':
      default: return "'Inter', sans-serif";
    }
  };

  const getBlockStyles = () => {
    // Links are now always rendered as favicons based on previous step
    return {
      className: "hover:scale-110 transition-transform drop-shadow-md",
      style: {}
    };
  };

  const getMainCardStyle = () => {
    // 1. Blur Handle
    let blurClass = "bg-black/40 backdrop-blur-xl";
    if (profile.cardBlur === 'opaque') blurClass = "bg-[#111111]";
    else if (profile.cardBlur === 'light') blurClass = "bg-black/20 backdrop-blur-sm";
    else if (profile.cardBlur === 'heavy') blurClass = "bg-white/10 backdrop-blur-3xl";

    // 2. Shadow Handle
    let shadowStyle = "";
    if (profile.cardShadow === 'soft') shadowStyle = "0 20px 40px rgba(0,0,0,0.5)";
    else if (profile.cardShadow === 'hard') shadowStyle = `12px 12px 0px ${themeColor}`;
    else if (profile.cardShadow === 'neon') shadowStyle = `0 0 30px ${themeColor}, 0 0 60px ${themeColor}`;

    // 3. 3D Handle
    let transformClass = "scale-100";
    if (profile.card3D === '3d') transformClass = "perspective-[1000px] rotate-x-[5deg] rotate-y-[-5deg] hover:rotate-x-0 hover:rotate-y-0 transition-transform duration-700";

    return {
      className: `relative z-10 w-full max-w-[400px] mx-4 border border-white/10 rounded-[2.5rem] p-8 flex flex-col items-center flex-shrink-0 ${blurClass} ${transformClass}`,
      style: { boxShadow: shadowStyle }
    };
  };

    // We replaced getMainCardStyle above, so we are removing the old block map here


  const getUsernameStyle = () => {
    switch (profile.usernameEffect) {
      case 'glow': return 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse';
      case 'gradient': return 'text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 via-zinc-500 to-zinc-600 animate-gradient-x';
      case 'sparkle': return 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]';
      case 'glitch': return 'text-white animate-glitch';
      case 'neon': return 'text-white drop-shadow-[0_0_10px_#fff] drop-shadow-[0_0_20px_#f0f]';
      case 'typing': return 'text-white border-r-2 border-white pr-1 animate-[ping_1s_infinite] overflow-hidden whitespace-nowrap';
      case 'wave': return 'text-white inline-block animate-[bounce_2s_infinite]';
      case 'bounce': return 'text-white animate-bounce';
      case 'float': return 'text-white animate-[pulse_3s_ease-in-out_infinite] transform -translate-y-1';
      case '3d': return 'text-white drop-shadow-[2px_2px_0px_#555] drop-shadow-[4px_4px_0px_#222]';
      case 'holo': return 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 drop-shadow-md';
      default: return 'text-white';
    }
  };

  return (
    <div 
      className={`min-h-screen relative flex items-center justify-center overflow-hidden bg-black ${profile.cursorUrl ? '[&_*]:cursor-none cursor-none' : ''}`}
      style={{ fontFamily: getFontFamily() }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Inter:wght@400;700&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;700&family=Space+Grotesk:wght@400;700&family=VT323&display=swap');
          
          .neobrutal-hover:hover {
            box-shadow: 0px 0px 0px ${themeColor} !important;
          }
        `}
      </style>
      {/* Custom Cursor Follower */}
      {profile.cursorUrl && (
        <motion.div
          className="fixed top-0 left-0 z-[9999] pointer-events-none flex items-center justify-center"
          animate={{ 
            x: mousePos.x, 
            y: mousePos.y,
            scale: isHovering ? 1.2 : 1
          }}
          transition={{ 
            x: { type: 'tween', ease: 'linear', duration: 0 },
            y: { type: 'tween', ease: 'linear', duration: 0 },
            scale: { type: 'spring', stiffness: 300, damping: 20 }
          }}
          style={{ translateX: '-50%', translateY: '-50%' }}
        >
          <img 
            src={profile.cursorUrl} 
            alt="" 
            className="w-8 h-8 object-contain"
            onError={(e) => (e.currentTarget.style.display = 'none')}
          />
        </motion.div>
      )}

      <AnimatePresence>
        {!hasEntered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setHasEntered(true)}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/60 backdrop-blur-2xl cursor-pointer group"
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-center"
            >
              <h2 className="text-white text-xl font-medium tracking-widest uppercase mb-2">
                Click to enter
              </h2>
              <p className="text-zinc-500 text-xs tracking-[0.2em] uppercase">
                @{profile.username}
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Wrapper with Blur */}
      <motion.div
        animate={{ filter: hasEntered ? 'blur(0px)' : 'blur(20px)', opacity: hasEntered ? 1 : 0.5 }}
        transition={{ duration: 1 }}
        className="absolute inset-0 flex items-center justify-center"
      >
        {/* Background */}
        <div className="absolute inset-0 z-0 bg-black">
          {profile.backgroundType === 'video' && profile.backgroundUrl ? (
            <video src={profile.backgroundUrl} autoPlay loop muted playsInline className="w-full h-full object-cover opacity-60" />
          ) : profile.backgroundType === 'image' && profile.backgroundUrl ? (
            <img src={profile.backgroundUrl} alt="background" className="w-full h-full object-cover opacity-60" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
          )}
        </div>

        {/* Background Effects */}
        {profile.backgroundEffect === 'stars' && (
          <div className="absolute inset-0 z-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        )}
        {profile.backgroundEffect === 'snow' && (
          <div className="absolute inset-0 z-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_10s_linear_infinite]" />
        )}
        {profile.backgroundEffect === 'rain' && (
          <div className="absolute inset-0 z-0 opacity-30" style={{ backgroundImage: 'linear-gradient(transparent, rgba(255,255,255,0.2))', backgroundSize: '2px 100px' }} />
        )}
        {profile.backgroundEffect === 'particles' && (
          <div className="absolute inset-0 z-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        )}
        {profile.backgroundEffect === 'matrix' && (
          <div className="absolute inset-0 z-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] animate-pulse" />
        )}
        {profile.backgroundEffect === 'bubbles' && (
          <div className="absolute inset-0 z-0 opacity-30 bg-[radial-gradient(circle,_#fff_10%,_transparent_10%)] bg-[size:40px_40px] mix-blend-overlay" />
        )}
        {profile.backgroundEffect === 'confetti' && (
          <div className="absolute inset-0 z-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        )}
        {profile.backgroundEffect === 'lightning' && (
          <div className="absolute inset-0 z-0 opacity-10 bg-white mix-blend-overlay animate-[pulse_5s_infinite]" />
        )}
        {profile.backgroundEffect === 'fireflies' && (
          <div className="absolute inset-0 z-0 opacity-50 bg-[radial-gradient(circle_at_center,_#fff_0%,_transparent_5%)] bg-[size:100px_100px]" />
        )}
        {profile.backgroundEffect === 'hyperspace' && (
          <div className="absolute inset-0 z-0 opacity-40" style={{ background: 'conic-gradient(from 90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
        )}
        {profile.backgroundEffect === 'aurora' && (
          <div className="absolute inset-0 z-0 opacity-40 bg-gradient-to-tr from-green-500/20 via-blue-500/20 to-purple-500/20 blur-3xl animate-[spin_20s_linear_infinite]" />
        )}

        {/* Audio Element */}
        {profile.audioUrl && (
          <audio ref={audioRef} src={profile.audioUrl} loop />
        )}

        {/* Main Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 0.6, ease: [0.2, 0.65, 0.3, 0.9] }}
          className={getMainCardStyle().className}
          style={getMainCardStyle().style}
        >
          {/* Avatar */}
          <motion.div 
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200, damping: 20 }}
            className="w-24 h-24 rounded-full border-2 border-white/20 overflow-hidden mb-4 shadow-[0_0_30px_rgba(255,255,255,0.1)]"
          >
            <img 
              src={profile.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${profile.username}`} 
              alt={profile.username} 
              className="w-full h-full object-cover"
            />
          </motion.div>

          {/* Username */}
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`text-2xl font-bold mb-2 ${getUsernameStyle()}`}
            style={{ color: profile.usernameEffect === 'gradient' ? undefined : themeColor }}
          >
            {profile.displayName || profile.username}
          </motion.h1>

          {/* Bio */}
          {profile.bio && (
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-center text-zinc-300 text-sm mb-8"
            >
              {profile.bio}
            </motion.p>
          )}

          {/* Links */}
          <div className="w-full flex flex-wrap justify-center gap-4 mb-8">
            {profile.links && profile.links.length > 0 ? (
              profile.links.map((link: any, i: number) => {
                const url = link.url.startsWith('http') ? link.url : `https://${link.url}`;
                const domain = url.replace(/^https?:\/\//, '').split('/')[0];
                const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
                let iconContent;
                if (profile.socialStyle === 'custom') {
                  const customColor = profile.socialColor || '#ffffff';
                  iconContent = (
                    <div 
                      className="w-8 h-8"
                      style={{
                        backgroundColor: customColor,
                        WebkitMaskImage: `url('${faviconUrl}')`,
                        WebkitMaskSize: 'contain',
                        WebkitMaskRepeat: 'no-repeat',
                        WebkitMaskPosition: 'center',
                        maskImage: `url('${faviconUrl}')`,
                        maskSize: 'contain',
                        maskRepeat: 'no-repeat',
                        maskPosition: 'center',
                      }}
                    />
                  );
                } else {
                  let iconStyle = "w-8 h-8 rounded-sm ";
                  if (profile.socialStyle === 'monochrome') iconStyle += "grayscale contrast-125";
                  else if (profile.socialStyle === 'minimal') iconStyle += "grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all";
                  iconContent = <img src={faviconUrl} alt="" className={iconStyle} onError={(e) => (e.currentTarget.style.display = 'none')} />;
                }

                return (
                  <motion.a
                    key={link.id || i}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.6 + i * 0.1 }}
                    className="hover:scale-110 transition-transform drop-shadow-md"
                  >
                    {iconContent}
                  </motion.a>
                );
              })
            ) : null}
          </div>

          {/* Store Button */}
          {profile.showStoreOnBio && storeItems.length > 0 && (
            <button 
              onClick={() => setIsStoreOpen(true)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => setIsHovering(false)}
              className="flex items-center gap-2 px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-xs font-bold text-white hover:bg-white/10 transition-all mb-4"
            >
              <ShoppingBag size={14} />
              Visit Store
            </button>
          )}

          {/* Views Counter */}
          <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
            <Eye size={12} className="text-zinc-400" />
            <span className="text-xs text-zinc-300">{profile.profileViews || 0}</span>
          </div>

        </motion.div>

        {/* Audio Controls */}
        {profile.audioUrl && (
          <div 
            className="absolute bottom-6 right-6 z-20 flex flex-col items-center gap-3"
            onMouseEnter={() => {
              setIsVolumeVisible(true);
              setIsHovering(true);
            }}
            onMouseLeave={() => {
              setIsVolumeVisible(false);
              setIsHovering(false);
            }}
          >
            <AnimatePresence>
              {isVolumeVisible && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.8 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.8 }}
                  className="bg-black/60 backdrop-blur-md border border-white/10 p-3 rounded-2xl flex flex-col items-center gap-2 shadow-xl"
                >
                  <div className="h-24 w-1.5 bg-white/10 rounded-full relative overflow-hidden">
                    <motion.div 
                      className="absolute bottom-0 left-0 right-0 bg-white"
                      style={{ height: `${volume * 100}%` }}
                    />
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.01"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="absolute inset-0 opacity-0 cursor-none w-full h-full [writing-mode:bt-lr] appearance-slider-vertical"
                    />
                  </div>
                  <span className="text-[10px] font-medium text-white/60 tabular-nums">
                    {Math.round(volume * 100)}%
                  </span>
                </motion.div>
              )}
            </AnimatePresence>

            <button 
              onClick={toggleAudio}
              className="w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors shadow-lg"
            >
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
          </div>
        )}

        {/* Custom Pet */}
        {profile.petUrl && (
          <motion.div 
            initial={{ y: 100 }}
            animate={{ y: 0 }}
            transition={{ type: 'spring', delay: 1 }}
            className="absolute bottom-0 right-20 z-20 w-32 h-32 pointer-events-none"
          >
            <img src={profile.petUrl} alt="pet" className="w-full h-full object-contain" />
          </motion.div>
        )}

        {/* Watermark */}
        <div className="absolute bottom-6 left-6 z-20 w-8 h-8 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white text-xs font-bold">
          N
        </div>
      </motion.div>

      {/* Store Modal */}
      <AnimatePresence>
        {isStoreOpen && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsStoreOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative z-10 w-full max-w-2xl bg-[#0A0A0A] border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[80vh]"
            >
              <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.02]">
                <div className="flex items-center gap-3">
                  <ShoppingBag size={20} className="text-zinc-400" />
                  <h2 className="text-xl font-bold text-white">@{profile.username}'s Store</h2>
                </div>
                <button 
                  onClick={() => setIsStoreOpen(false)}
                  className="p-2 hover:bg-white/5 rounded-full transition-colors text-zinc-500 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 md:grid-cols-2 gap-4 custom-scrollbar">
                {storeItems.map((item) => (
                  <div key={item.id} className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col hover:border-white/10 transition-colors">
                    <div className="flex justify-between items-start mb-3">
                      <div className={`p-2 rounded-lg ${item.type === 'template' ? 'bg-zinc-500/10 text-zinc-500' : 'bg-blue-500/10 text-blue-500'}`}>
                        {item.type === 'template' ? <Layout size={16} /> : <FileText size={16} />}
                      </div>
                      <div className="flex items-center gap-1 bg-zinc-500/10 px-2 py-0.5 rounded-full">
                        <Coins size={10} className="text-zinc-500" />
                        <span className="text-[10px] font-bold text-white">{item.price}</span>
                      </div>
                    </div>
                    <h3 className="text-sm font-bold text-white mb-1">{item.name}</h3>
                    <p className="text-[10px] text-zinc-500 mb-4 line-clamp-2">{item.description}</p>
                    <button 
                      onClick={() => handlePurchase(item)}
                      disabled={item.sellerId === user?.uid}
                      className="mt-auto w-full py-2 bg-white text-black rounded-xl text-[10px] font-bold hover:bg-zinc-200 transition-colors disabled:opacity-50"
                    >
                      Buy Now
                    </button>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
