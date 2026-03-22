import React from 'react';
import { Music, Volume2, Pause, Play, Eye, Share2, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface BioPreviewProps {
  profile: any;
  username: string;
}

export default function BioPreview({ profile, username }: BioPreviewProps) {
  if (!profile) return null;

  return (
    <div className="relative w-full aspect-[9/16] max-w-[320px] bg-black rounded-[2.5rem] overflow-hidden border-[8px] border-[#1a1a1a] shadow-2xl mx-auto">
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

      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-[2px] z-[1]" />

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
        <h1 className={`text-xl font-bold text-white mb-2 tracking-tight ${
          profile.usernameEffect === 'glow' ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' :
          profile.usernameEffect === 'gradient' ? 'bg-gradient-to-r from-zinc-400 to-zinc-600 bg-clip-text text-transparent' : ''
        }`}>
          @{username}
        </h1>

        {/* Bio */}
        <p className="text-xs text-zinc-300 mb-6 line-clamp-3 leading-relaxed max-w-[200px]">
          {profile.bio || "No bio yet..."}
        </p>

        {/* Links */}
        <div className="w-full space-y-2 mb-6 max-h-[160px] overflow-y-auto pr-1 custom-scrollbar">
          {profile.links?.map((link: any, i: number) => (
            <motion.a
              key={link.id || i}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: i * 0.1 }}
              href="#"
              className="flex items-center justify-between w-full px-4 py-2.5 bg-white/5 border border-white/10 rounded-xl text-[10px] font-medium text-white hover:bg-white/10 transition-all group"
            >
              <span>{link.title || "Link"}</span>
              <ExternalLink size={10} className="text-zinc-500 group-hover:text-white transition-colors" />
            </motion.a>
          ))}
          {(!profile.links || profile.links.length === 0) && (
            <div className="py-4 border border-dashed border-white/10 rounded-xl text-[10px] text-zinc-500">
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
