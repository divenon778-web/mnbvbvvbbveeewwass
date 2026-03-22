import React from 'react';
import { Music, Volume2, Pause, Play, Eye, Share2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface BioPreviewProps {
  profile: any;
  username: string;
}

export default function BioPreview({ profile, username }: BioPreviewProps) {
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
    // Links are raw favicons now
    return {
      className: "hover:scale-110 transition-transform shrink-0",
      style: {}
    };
  };

  const getMainCardStyle = () => {
    let blurClass = "bg-black/40 backdrop-blur-[2px]";
    if (profile.cardBlur === 'opaque') blurClass = "bg-[#111111]";
    else if (profile.cardBlur === 'light') blurClass = "bg-black/20 backdrop-blur-sm";
    else if (profile.cardBlur === 'heavy') blurClass = "bg-white/10 backdrop-blur-xl";

    let shadowStyle = "";
    if (profile.cardShadow === 'soft') shadowStyle = "0 20px 40px rgba(0,0,0,0.5)";
    else if (profile.cardShadow === 'hard') shadowStyle = `12px 12px 0px ${themeColor}`;
    else if (profile.cardShadow === 'neon') shadowStyle = `0 0 30px ${themeColor}, 0 0 60px ${themeColor}`;

    let transformClass = "scale-100";
    if (profile.card3D === '3d') transformClass = "perspective-[1000px] rotate-x-[5deg] rotate-y-[-5deg]";

    return {
      className: `absolute inset-0 z-[1] ${blurClass} ${transformClass}`,
      style: { boxShadow: shadowStyle }
    };
  };

  const getUsernameStyle = () => {
    switch (profile.usernameEffect) {
      case 'glow': return 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]';
      case 'gradient': return 'text-transparent bg-clip-text bg-gradient-to-r from-zinc-400 to-zinc-600';
      case 'sparkle': return 'text-yellow-300 drop-shadow-[0_0_8px_rgba(253,224,71,0.8)]';
      case 'glitch': return 'text-white animate-glitch';
      case 'neon': return 'text-white drop-shadow-[0_0_5px_#fff] drop-shadow-[0_0_10px_#f0f]';
      case 'typing': return 'text-white border-r-2 border-white pr-1';
      case 'wave': return 'text-white inline-block';
      case 'bounce': return 'text-white';
      case 'float': return 'text-white pt-1';
      case '3d': return 'text-white drop-shadow-[1px_1px_0px_#555] drop-shadow-[2px_2px_0px_#222]';
      case 'holo': return 'text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500';
      default: return 'text-white';
    }
  };

  return (
    <div 
      className="relative w-full aspect-[9/16] max-w-[320px] bg-black rounded-[2.5rem] overflow-hidden border-[8px] border-[#1a1a1a] shadow-2xl mx-auto"
      style={{ fontFamily: getFontFamily() }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Inter:wght@400;700&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;700&family=Space+Grotesk:wght@400;700&family=VT323&display=swap');
          
          .neobrutal-hover:hover {
            box-shadow: 0px 0px 0px ${themeColor} !important;
          }
        `}
      </style>
      {/* Background */}
      <div className="absolute inset-0 z-0">
        {profile.backgroundUrl ? (
          profile.backgroundType === 'video' ? (
            <video 
              src={profile.backgroundUrl} 
              className="w-full h-full object-cover opacity-60" 
              autoPlay 
              loop 
              muted 
              playsInline 
            />
          ) : (
            <img 
              src={profile.backgroundUrl} 
              className="w-full h-full object-cover opacity-60" 
              alt="background" 
              referrerPolicy="no-referrer"
            />
          )
        ) : (
          <div className="w-full h-full bg-gradient-to-b from-zinc-900 to-black" />
        )}
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none rounded-[2.5rem]">
        {profile.backgroundEffect === 'stars' && (
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '50px 50px' }} />
        )}
        {profile.backgroundEffect === 'snow' && (
          <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_10s_linear_infinite]" />
        )}
        {profile.backgroundEffect === 'rain' && (
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(transparent, rgba(255,255,255,0.2))', backgroundSize: '2px 100px' }} />
        )}
        {profile.backgroundEffect === 'particles' && (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        )}
        {profile.backgroundEffect === 'matrix' && (
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] animate-pulse" />
        )}
        {profile.backgroundEffect === 'bubbles' && (
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,_#fff_10%,_transparent_10%)] bg-[size:40px_40px] mix-blend-overlay" />
        )}
        {profile.backgroundEffect === 'confetti' && (
          <div className="absolute inset-0 opacity-30 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]" />
        )}
        {profile.backgroundEffect === 'lightning' && (
          <div className="absolute inset-0 opacity-10 bg-white mix-blend-overlay animate-[pulse_5s_infinite]" />
        )}
        {profile.backgroundEffect === 'fireflies' && (
          <div className="absolute inset-0 opacity-50 bg-[radial-gradient(circle_at_center,_#fff_0%,_transparent_5%)] bg-[size:100px_100px]" />
        )}
        {profile.backgroundEffect === 'hyperspace' && (
          <div className="absolute inset-0 opacity-40" style={{ background: 'conic-gradient(from 90deg, transparent, rgba(255,255,255,0.2), transparent)' }} />
        )}
        {profile.backgroundEffect === 'aurora' && (
          <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-green-500/20 via-blue-500/20 to-purple-500/20 blur-3xl animate-[spin_20s_linear_infinite]" />
        )}
      </div>

      {/* Overlay / Main Card Representation */}
      <div 
        className={getMainCardStyle().className}
        style={getMainCardStyle().style}
      />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-6 text-center">
        {/* Avatar */}
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="relative mb-4"
        >
          <div className="w-20 h-20 rounded-full border-2 border-white/20 overflow-hidden bg-zinc-800 shadow-xl">
            {profile.avatarUrl ? (
              <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-500">
                <Eye size={32} />
              </div>
            )}
          </div>
        </motion.div>

        {/* Username */}
        <h1 
          className={`text-xl font-bold mb-2 tracking-tight ${getUsernameStyle()}`}
          style={{ color: (profile.usernameEffect === 'gradient' || profile.usernameEffect === 'holo') ? undefined : themeColor }}
        >
          @{username}
        </h1>

        {/* Bio */}
        <p className="text-xs text-zinc-300 mb-6 line-clamp-3 leading-relaxed max-w-[200px]">
          {profile.bio || "No bio yet..."}
        </p>

        {/* Links */}
        <div className="w-full flex flex-wrap justify-center gap-3 mb-6 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
          {profile.links?.map((link: any, i: number) => {
            const url = link.url && link.url.trim() ? (link.url.startsWith('http') ? link.url : `https://${link.url}`) : 'https://google.com';
            const domain = url.replace(/^https?:\/\//, '').split('/')[0];
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            
            let iconStyle = "w-6 h-6 rounded-sm opacity-80 hover:opacity-100 transition-opacity drop-shadow-md ";
            if (profile.socialStyle === 'monochrome') iconStyle += "grayscale contrast-125";
            else if (profile.socialStyle === 'minimal') iconStyle += "grayscale opacity-50 hover:grayscale-0 hover:opacity-100";

            return (
              <motion.a
                key={link.id || i}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.1 }}
                href="#"
                className="hover:scale-110 transition-transform shrink-0"
              >
                <img src={faviconUrl} alt="" className={iconStyle} onError={(e) => (e.currentTarget.style.display = 'none')} />
              </motion.a>
            );
          })}
          {(!profile.links || profile.links.length === 0) && (
            <div className="w-full py-4 border border-dashed border-white/10 rounded-xl text-[10px] text-zinc-500 text-center">
              No links added
            </div>
          )}
        </div>

        {/* Music Player (Static Preview) */}
        <div className="w-full bg-white/5 border border-white/10 rounded-2xl p-3 flex items-center gap-3">
          <div className="w-8 h-8 bg-zinc-500/20 rounded-lg flex items-center justify-center text-zinc-400">
            <Music size={14} />
          </div>
          <div className="flex-1 text-left">
            <div className="text-[10px] font-bold text-white truncate">Now Playing</div>
            <div className="text-[8px] text-zinc-500 truncate">Preview Audio</div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-1.5 bg-white/10 rounded-full text-white">
              <Play size={10} fill="currentColor" />
            </button>
          </div>
        </div>
      </div>

      {/* Pet (Static Preview) */}
      {profile.petUrl && (
        <motion.img 
          src={profile.petUrl} 
          className="absolute bottom-4 right-4 w-12 h-12 object-contain z-20 pointer-events-none"
          animate={{ y: [0, -5, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
          alt="pet"
          referrerPolicy="no-referrer"
        />
      )}

      {/* Cursor (Static Preview) */}
      {profile.cursorUrl && (
        <img 
          src={profile.cursorUrl} 
          className="absolute top-1/2 left-1/2 w-6 h-6 object-contain z-50 pointer-events-none opacity-50" 
          alt="cursor" 
          referrerPolicy="no-referrer"
        />
      )}
    </div>
  );
}
