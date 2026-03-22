import React, { useEffect, useState, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { collection, query, where, getDocs, updateDoc, doc, increment } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'framer-motion';
import { Eye, Crown, Wrench, Play, Pause } from 'lucide-react';

export default function Profile() {
  const { username } = useParams<{ username: string }>();
  const [profile, setProfile] = useState<any>(null);
  const [userDoc, setUserDoc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      try {
        // Find profile by username
        const q = query(collection(db, 'profiles'), where('username', '==', username.toLowerCase()));
        const querySnapshot = await getDocs(q);
        
        if (querySnapshot.empty) {
          setError('Profile not found');
          setLoading(false);
          return;
        }

        const profileData = querySnapshot.docs[0].data();
        setProfile(profileData);

        // Autoplay audio if available
        if (profileData.audioUrl) {
          setTimeout(() => {
            if (audioRef.current) {
              audioRef.current.play().then(() => setIsPlaying(true)).catch(e => console.error("Autoplay blocked:", e));
            }
          }, 1000);
        }

        // Fetch user doc for views and badges
        try {
          const userQ = query(collection(db, 'users'), where('username', '==', username.toLowerCase()));
          const userSnapshot = await getDocs(userQ);
          if (!userSnapshot.empty) {
            const uDoc = userSnapshot.docs[0];
            setUserDoc(uDoc.data());
          }
        } catch (err) {
          console.log('Could not fetch user doc (likely permission error, ignoring):', err);
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

  // Username effect styles
  const getUsernameStyle = () => {
    switch (profile.usernameEffect) {
      case 'glow': return 'text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)] animate-pulse';
      case 'gradient': return 'text-transparent bg-clip-text bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 animate-gradient-x';
      case 'sparkle': return 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]';
      case 'glitch': return 'text-white animate-glitch';
      default: return 'text-white';
    }
  };

  return (
    <div 
      className="min-h-screen relative flex items-center justify-center overflow-hidden"
      style={{ cursor: profile.cursorUrl ? `url(${profile.cursorUrl}), auto` : 'auto' }}
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

      {/* Background Effects (Mockup for stars/snow) */}
      {profile.backgroundEffect === 'stars' && (
        <div className="absolute inset-0 z-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
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
        className="relative z-10 w-full max-w-[400px] mx-4 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-8 flex flex-col items-center shadow-2xl"
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
        >
          {profile.displayName || profile.username}
        </motion.h1>

        {/* Badges */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="flex gap-2 mb-6 bg-white/5 px-3 py-1.5 rounded-full border border-white/10"
        >
          <Crown size={14} className="text-yellow-400" />
          <Wrench size={14} className="text-zinc-400" />
        </motion.div>

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
        <div className="w-full flex flex-col gap-3">
          {profile.links && profile.links.length > 0 ? (
            profile.links.map((link: any, i: number) => {
              const domain = link.url.replace(/^https?:\/\//, '').split('/')[0];
              const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
              
              return (
                <motion.a
                  key={link.id}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 + i * 0.1 }}
                  className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl flex items-center gap-3 text-white text-sm font-medium transition-all hover:scale-[1.02]"
                >
                  <img src={faviconUrl} alt="" className="w-4 h-4 rounded-sm" onError={(e) => (e.currentTarget.style.display = 'none')} />
                  {link.title}
                </motion.a>
              );
            })
          ) : null}
        </div>

        {/* Views Counter */}
        <div className="absolute bottom-4 left-4 flex items-center gap-1.5 bg-black/40 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10">
          <Eye size={12} className="text-zinc-400" />
          <span className="text-xs text-zinc-300">{userDoc?.profileViews || 0}</span>
        </div>

      </motion.div>

      {/* Audio Toggle */}
      {profile.audioUrl && (
        <button 
          onClick={toggleAudio}
          className="absolute bottom-6 right-6 z-20 w-10 h-10 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center text-white hover:bg-white/20 transition-colors"
        >
          {isPlaying ? <Pause size={16} /> : <Play size={16} />}
        </button>
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
    </div>
  );
}
