import React from 'react';
import { Music, Eye } from 'lucide-react';
import { motion } from 'framer-motion';

interface TemplateCardProps {
  profile: any;
  username: string;
}

export default function TemplateCard({ profile, username }: TemplateCardProps) {
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
      className="relative w-full h-full bg-black overflow-hidden"
      style={{ fontFamily: getFontFamily() }}
    >
      <style>
        {`@import url('https://fonts.googleapis.com/css2?family=Comic+Neue:wght@400;700&family=Inter:wght@400;700&family=Playfair+Display:wght@400;700&family=Roboto:wght@400;700&family=Space+Grotesk:wght@400;700&family=VT323&display=swap');
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
          <div className="w-full h-full bg-gradient-to-br from-zinc-900 to-black" />
        )}
      </div>

      {/* Background Effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none">
        {profile.backgroundEffect === 'stars' && (
          <div className="absolute inset-0 opacity-50" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '30px 30px' }} />
        )}
        {profile.backgroundEffect === 'snow' && (
          <div className="absolute inset-0 opacity-40 bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] animate-[pulse_10s_linear_infinite]" />
        )}
        {profile.backgroundEffect === 'rain' && (
          <div className="absolute inset-0 opacity-30" style={{ backgroundImage: 'linear-gradient(transparent, rgba(255,255,255,0.2))', backgroundSize: '2px 60px' }} />
        )}
        {profile.backgroundEffect === 'particles' && (
          <div className="absolute inset-0 opacity-20 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-white via-transparent to-transparent" />
        )}
        {profile.backgroundEffect === 'matrix' && (
          <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] animate-pulse" />
        )}
        {profile.backgroundEffect === 'bubbles' && (
          <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle,_#fff_10%,_transparent_10%)] bg-[size:30px_30px] mix-blend-overlay" />
        )}
        {profile.backgroundEffect === 'aurora' && (
          <div className="absolute inset-0 opacity-40 bg-gradient-to-tr from-green-500/20 via-blue-500/20 to-purple-500/20 blur-2xl animate-[spin_20s_linear_infinite]" />
        )}
      </div>

      {/* Overlay for glass effect */}
      <div className={`absolute inset-0 z-[1] ${
        profile.cardBlur === 'opaque' ? 'bg-[#111111]/40' : 
        profile.cardBlur === 'light' ? 'bg-black/20 backdrop-blur-[2px]' : 
        'bg-white/5 backdrop-blur-md'
      }`} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center p-4 text-center">
        {/* Avatar */}
        <div className="w-12 h-12 md:w-16 md:h-16 rounded-full border-2 border-white/20 overflow-hidden bg-zinc-800 shadow-lg mb-2">
          {profile.avatarUrl ? (
            <img src={profile.avatarUrl} className="w-full h-full object-cover" alt="avatar" referrerPolicy="no-referrer" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-zinc-500">
              <Eye size={24} />
            </div>
          )}
        </div>

        {/* Username */}
        <h1 
          className={`text-sm md:text-base font-bold mb-1 tracking-tight ${getUsernameStyle()}`}
          style={{ color: (profile.usernameEffect === 'gradient' || profile.usernameEffect === 'holo') ? undefined : themeColor }}
        >
          @{username}
        </h1>

        {/* Links Preview */}
        <div className="flex gap-2 mt-2">
          {profile.links?.slice(0, 4).map((link: any, i: number) => {
            const url = link.url && link.url.trim() ? (link.url.startsWith('http') ? link.url : `https://${link.url}`) : 'https://google.com';
            const domain = url.replace(/^https?:\/\//, '').split('/')[0];
            const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
            
            return (
              <div key={i} className="w-5 h-5 rounded-sm overflow-hidden bg-white/10 p-0.5">
                <img src={faviconUrl} alt="" className="w-full h-full object-contain" />
              </div>
            );
          })}
        </div>

        {/* Music Icon if audio present */}
        {profile.audioUrl && (
          <div className="absolute bottom-2 right-2 text-white/40">
            <Music size={12} />
          </div>
        )}
      </div>
    </div>
  );
}
