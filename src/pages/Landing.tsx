import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, useScroll, useTransform } from 'motion/react';
import { useAuth } from '../AuthContext';
import { 
  Sparkles, 
  ArrowRight, 
  Zap, 
  Palette, 
  BarChart3, 
  Globe, 
  Shield, 
  Infinity as InfinityIcon,
  CheckCircle2,
  Menu,
  X,
  Home,
  Folder,
  Heart,
  Settings,
  Search,
  ListFilter,
  Eye,
  User,
  Activity,
  Bell,
  Link as LinkIcon,
  Smartphone,
  ChevronDown,
  Edit2,
  AtSign,
  Hash,
  MonitorSmartphone,
  Unlink
} from 'lucide-react';

// --- Custom Components ---

const BlurWordFade = ({ text, className = "", delay = 0, simple = false }: { text: string, className?: string, delay?: number, simple?: boolean }) => {
  if (simple) {
    return (
      <motion.span
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.8, delay, ease: [0.2, 0.65, 0.3, 0.9] }}
        className={`inline-block ${className}`}
      >
        {text}
      </motion.span>
    );
  }
  const words = text.split(" ");
  return (
    <span className={`inline-block ${className}`}>
      {words.map((word, i) => (
        <motion.span
          key={i}
          initial={{ opacity: 0, y: 15, filter: "blur(4px)" }}
          whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{
            duration: 0.8,
            delay: delay + i * 0.08,
            ease: [0.2, 0.65, 0.3, 0.9],
          }}
          className="inline-block mr-[0.25em] last:mr-0 will-change-[opacity,transform,filter]"
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
};

const LiquidGlassBackground = () => {
  return (
    <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden bg-black">
      <div className="absolute inset-0 opacity-60">
        {/* Blob 1 */}
        <motion.div
          animate={{
            rotate: [0, 360],
            scale: [1, 1.1, 1],
          }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute -top-[10%] -left-[10%] w-[60vw] h-[60vw] min-w-[600px] min-h-[600px] will-change-transform"
          style={{
            background: 'radial-gradient(circle at 30% 30%, rgba(255,255,255,0.02) 0%, transparent 60%)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 20px rgba(255,255,255,0.2)',
            borderRadius: '40% 60% 70% 30% / 40% 50% 60% 50%'
          }}
        />
        
        {/* Blob 2 */}
        <motion.div
          animate={{
            rotate: [360, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] -right-[10%] w-[50vw] h-[70vw] min-w-[500px] min-h-[700px] will-change-transform"
          style={{
            background: 'radial-gradient(circle at 70% 30%, rgba(255,255,255,0.02) 0%, transparent 60%)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 30px rgba(255,255,255,0.2)',
            borderRadius: '60% 40% 30% 70% / 50% 60% 40% 50%'
          }}
        />

        {/* Blob 3 */}
        <motion.div
          animate={{
            rotate: [0, 180, 360],
          }}
          transition={{ duration: 35, repeat: Infinity, ease: "linear" }}
          className="absolute -bottom-[10%] left-[10%] w-[70vw] h-[50vw] min-w-[700px] min-h-[500px] will-change-transform"
          style={{
            background: 'radial-gradient(circle at 50% 70%, rgba(255,255,255,0.02) 0%, transparent 60%)',
            boxShadow: 'inset 0 0 0 1px rgba(255,255,255,0.05), inset 0 0 25px rgba(255,255,255,0.2)',
            borderRadius: '50% 50% 50% 50% / 50% 50% 50% 50%'
          }}
        />
      </div>
      
      {/* Overlay gradient to blend bottom into the next section */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/40 to-black pointer-events-none" />
    </div>
  );
};

const Logo = () => (
  <div className="flex items-center gap-2">
    <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-zinc-100 to-zinc-400 flex items-center justify-center shadow-sm">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="black" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M4 4v16" />
        <path d="M4 12h8a4 4 0 0 1 4 4v4" />
      </svg>
    </div>
    <span className="text-white font-bold text-xl tracking-tighter lowercase">hushd</span>
  </div>
);

// --- Main App Component ---

export default function Landing() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 1000], [0, 100]);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div className="min-h-screen bg-[#000000] text-white selection:bg-white/20 overflow-hidden font-sans">
      
      {/* --- Navbar --- */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? 'bg-black/50 backdrop-blur-xl border-b border-white/5 py-4' : 'bg-transparent py-6'}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <Logo />
          
          <div className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#templates" className="text-sm text-zinc-400 hover:text-white transition-colors">Templates</a>
            <a href="#pricing" className="text-sm text-zinc-400 hover:text-white transition-colors">Pricing</a>
          </div>

          <div className="hidden md:flex items-center gap-4">
            <Link to="/login" className="text-sm text-zinc-400 hover:text-white transition-colors">Log in</Link>
            <Link to="/signup" className="px-5 py-2 text-sm font-medium text-black bg-white hover:bg-zinc-200 rounded-full transition-all">
              Sign up free
            </Link>
          </div>

          <button className="md:hidden text-zinc-400" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </nav>

      {/* --- Hero Section --- */}
      <section className="relative pt-40 pb-20 md:pt-52 md:pb-32 px-6 flex flex-col items-center justify-center min-h-screen text-center overflow-hidden">
        
        {/* Animated Liquid Glass Background */}
        <LiquidGlassBackground />

        <div className="relative z-10 max-w-4xl mx-auto flex flex-col items-center">
          
          {/* Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-[5.5rem] font-semibold tracking-tight text-white leading-[1.05] mb-6 max-w-3xl">
            <BlurWordFade text="Your entire digital life, in one link." />
          </h1>

          {/* Subheadline */}
          <motion.p 
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="text-zinc-400 text-base md:text-lg max-w-2xl mb-10 leading-relaxed"
          >
            Create a beautiful, highly-converting link-in-bio page in minutes. Share your content, sell your products, and grow your audience.
          </motion.p>

          {/* CTA Button */}
          <motion.div
            initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            transition={{ duration: 0.8, delay: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
            className="flex flex-col sm:flex-row items-center gap-4"
          >
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 pl-4">
              <span className="text-zinc-400 text-sm">hushd.com/</span>
              <input 
                type="text" 
                placeholder="yourname" 
                className="bg-transparent border-none outline-none text-white text-sm w-24 ml-1 placeholder:text-zinc-600"
              />
              <Link to="/signup" className="ml-2 px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Claim your link
              </Link>
            </div>
          </motion.div>
        </div>

        {/* Dashboard Mockup */}
        <motion.div 
          style={{ y: y1 }}
          className="relative z-20 w-full max-w-5xl mx-auto mt-24 pointer-events-none select-none will-change-transform"
        >
          <div className="rounded-[2rem] bg-[#111111] border border-white/10 p-2 shadow-2xl shadow-white/5">
            <div className="rounded-[1.5rem] bg-[#0A0A0A] border border-white/5 overflow-hidden flex h-[650px]">
              
              {/* Sidebar */}
              <div className="w-64 border-r border-white/5 flex flex-col py-6 bg-[#050505] hidden md:flex">
                <div className="px-6 mb-8">
                  <span className="text-white font-bold text-xl tracking-tighter lowercase">hushd</span>
                </div>
                
                <div className="px-4 flex flex-col gap-1">
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/10 text-white cursor-pointer">
                    <div className="flex items-center gap-3">
                      <User size={16} />
                      <span className="text-sm font-medium">Account</span>
                    </div>
                    <ChevronDown size={16} className="text-zinc-400" />
                  </div>
                  <div className="flex flex-col pl-10 pr-3 py-1 gap-2">
                    <span className="text-xs text-zinc-300 cursor-pointer">Overview</span>
                    <span className="text-xs text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors">Badges</span>
                  </div>
                  <div className="flex items-center justify-between px-3 py-2 rounded-lg text-zinc-400 hover:bg-white/5 cursor-pointer transition-colors mt-2">
                    <div className="flex items-center gap-3">
                      <Palette size={16} />
                      <span className="text-sm font-medium">Customize</span>
                    </div>
                    <ChevronDown size={16} className="text-zinc-500" />
                  </div>
                </div>

                <div className="mt-auto px-4">
                  <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#111111] border border-white/5 cursor-pointer">
                    <div className="w-8 h-8 rounded-full bg-zinc-800 overflow-hidden">
                      <img src="https://picsum.photos/seed/liam/100/100" alt="User" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-white leading-tight">liam</span>
                      <span className="text-xs text-zinc-500">#2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 p-8 flex flex-col text-left overflow-y-auto bg-[#0A0A0A] no-scrollbar">
                <h2 className="text-xl text-white mb-6">Welcome back, <span className="text-zinc-400">liam</span></h2>

                {/* Top Cards */}
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                  <div className="p-4 rounded-xl bg-[#111111] border border-white/5 flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-zinc-500">Username</span>
                      <Edit2 size={14} className="text-zinc-400" />
                    </div>
                    <div>
                      <div className="text-lg font-medium text-white">liam</div>
                      <div className="text-[10px] text-zinc-500 mt-1">Change available now</div>
                    </div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#111111] border border-white/5 flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-zinc-500">Alias</span>
                      <AtSign size={14} className="text-zinc-400" />
                    </div>
                    <div className="text-lg font-medium text-white">liam</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#111111] border border-white/5 flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-zinc-500">UID</span>
                      <Hash size={14} className="text-zinc-400" />
                    </div>
                    <div className="text-lg font-medium text-white">2</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#111111] border border-white/5 flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-zinc-500">Profile Views</span>
                      <Eye size={14} className="text-zinc-400" />
                    </div>
                    <div className="text-lg font-medium text-white">2</div>
                  </div>
                  <div className="p-4 rounded-xl bg-[#111111] border border-white/5 flex flex-col justify-between h-24">
                    <div className="flex justify-between items-start">
                      <span className="text-xs text-zinc-500">Profile Visibility</span>
                      <Eye size={14} className="text-zinc-400" />
                    </div>
                    <div className="text-lg font-medium text-white">Public</div>
                  </div>
                </div>

                {/* Middle Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                  {/* Chart */}
                  <div className="lg:col-span-2 p-6 rounded-xl bg-[#111111] border border-white/5">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-sm text-white">Account <span className="text-zinc-400">Statistics</span></h3>
                      <div className="flex gap-2">
                        <span className="text-[10px] text-zinc-400">Your Profile Views in the last <span className="text-zinc-300">month</span></span>
                        <div className="flex gap-1 ml-4">
                          <button className="px-2 py-0.5 rounded bg-white/10 text-[10px] text-white">Month</button>
                          <button className="px-2 py-0.5 rounded text-[10px] text-zinc-500 hover:text-zinc-300">7d</button>
                          <button className="px-2 py-0.5 rounded text-[10px] text-zinc-500 hover:text-zinc-300">24h</button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Chart Mockup */}
                    <div className="relative h-40 w-full mt-4 flex items-end">
                      {/* Y-axis */}
                      <div className="absolute left-0 top-0 bottom-6 w-8 flex flex-col justify-between text-[10px] text-zinc-600 text-right pr-2 border-r border-white/5">
                        <span>1000</span>
                        <span>750</span>
                        <span>500</span>
                        <span>250</span>
                        <span>0</span>
                      </div>
                      {/* X-axis */}
                      <div className="absolute left-8 right-0 bottom-0 h-6 flex justify-between items-end text-[10px] text-zinc-600 px-2 border-t border-white/5 pt-1">
                        <span>Jan</span>
                        <span>Feb</span>
                        <span>Mar</span>
                        <span>Apr</span>
                        <span>May</span>
                        <span>Jun</span>
                        <span>Jul</span>
                      </div>
                      
                      {/* Grid lines */}
                      <div className="absolute left-8 right-0 top-0 bottom-6 flex flex-col justify-between pointer-events-none">
                        <div className="w-full h-[1px] bg-white/[0.02]"></div>
                        <div className="w-full h-[1px] bg-white/[0.02]"></div>
                        <div className="w-full h-[1px] bg-white/[0.02]"></div>
                        <div className="w-full h-[1px] bg-white/[0.02]"></div>
                        <div className="w-full h-[1px] bg-white/[0.02]"></div>
                      </div>

                      {/* SVG Line */}
                      <div className="absolute left-8 right-0 top-0 bottom-6 overflow-hidden">
                        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                          <defs>
                            <linearGradient id="chart-gradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="rgba(255,255,255,0.1)" />
                              <stop offset="100%" stopColor="rgba(255,255,255,0)" />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M 0 80 C 20 70, 30 50, 40 50 C 50 50, 60 60, 70 40 C 80 20, 90 15, 100 10 L 100 100 L 0 100 Z" 
                            fill="url(#chart-gradient)" 
                          />
                          <path 
                            d="M 0 80 C 20 70, 30 50, 40 50 C 50 50, 60 60, 70 40 C 80 20, 90 15, 100 10" 
                            fill="none" 
                            stroke="rgba(255,255,255,0.8)" 
                            strokeWidth="1.5"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Discord Card */}
                  <div className="p-6 rounded-xl bg-[#111111] border border-white/5 flex flex-col">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-12 h-12 rounded-full bg-indigo-500/20 flex items-center justify-center overflow-hidden">
                        <img src="https://picsum.photos/seed/discord/100/100" alt="Discord" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">fembytes</div>
                        <div className="text-xs text-zinc-500">Discord Linked</div>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4 mb-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-white">Show Banner</div>
                          <div className="text-[10px] text-zinc-500">Display your Discord banner</div>
                        </div>
                        <div className="w-8 h-4 rounded-full bg-white/20 relative">
                          <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white"></div>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-xs font-medium text-white">Sync Username Style</div>
                          <div className="text-[10px] text-zinc-500">Use your Discord username styling</div>
                        </div>
                        <div className="w-8 h-4 rounded-full bg-white/20 relative">
                          <div className="absolute right-0.5 top-0.5 w-3 h-3 rounded-full bg-white"></div>
                        </div>
                      </div>
                    </div>

                    <button className="mt-auto w-full py-2 rounded-lg bg-red-500/10 text-red-500 text-xs font-medium border border-red-500/20 hover:bg-red-500/20 transition-colors flex items-center justify-center gap-2">
                      <Unlink size={14} /> Unlink Discord
                    </button>
                  </div>
                </div>

                {/* Recent Actions */}
                <div>
                  <h3 className="text-sm text-white mb-4">Recent <span className="text-zinc-400">Actions</span></h3>
                  <div className="rounded-xl bg-[#111111] border border-white/5 flex flex-col">
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                          <Edit2 size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">Username edited</div>
                          <div className="text-[10px] text-zinc-500">Changed to liam</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-600">2h ago</span>
                    </div>
                    <div className="flex items-center justify-between p-4 border-b border-white/5">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                          <MonitorSmartphone size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">New device logged in</div>
                          <div className="text-[10px] text-zinc-500">Windows • Chrome</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-600">1d ago</span>
                    </div>
                    <div className="flex items-center justify-between p-4">
                      <div className="flex items-center gap-4">
                        <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-zinc-400">
                          <User size={14} />
                        </div>
                        <div>
                          <div className="text-xs font-medium text-white">Account created</div>
                          <div className="text-[10px] text-zinc-500">Welcome to hushd</div>
                        </div>
                      </div>
                      <span className="text-[10px] text-zinc-600">3d ago</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* --- Features Section --- */}
      <section id="features" className="py-32 px-6 bg-[#000000] relative z-20 border-t border-white/5">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-semibold tracking-tight text-white mb-6">
              <BlurWordFade text="Everything you need to stand out." />
            </h2>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              <BlurWordFade text="Powerful tools designed for modern creators, influencers, and businesses to maximize their audience." delay={0.2} />
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: <Palette size={24} />, title: "Beautiful Themes", desc: "Choose from dozens of premium themes or customize every pixel to match your brand identity perfectly." },
              { icon: <BarChart3 size={24} />, title: "Deep Analytics", desc: "Understand your audience with real-time insights, click tracking, and conversion metrics." },
              { icon: <Zap size={24} />, title: "Lightning Fast", desc: "Optimized for speed. Your bio link loads instantly, anywhere in the world, on any device." },
              { icon: <Globe size={24} />, title: "Custom Domains", desc: "Connect your own domain (e.g., links.yourname.com) for a fully branded and professional experience." },
              { icon: <Smartphone size={24} />, title: "Mobile Optimized", desc: "Designed mobile-first to ensure your links look perfect where 90% of your audience will see them." },
              { icon: <InfinityIcon size={24} />, title: "Unlimited Links", desc: "No restrictions. Add as many links, social profiles, videos, and products as you need." }
            ].map((feature, i) => (
              <motion.div 
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.6, delay: i * 0.1 }}
                className="p-8 rounded-3xl bg-[#0A0A0A] border border-white/5 hover:border-white/10 transition-colors group will-change-transform"
              >
                <div className="w-12 h-12 rounded-full bg-[#141414] flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-medium text-white mb-3">
                  {feature.title}
                </h3>
                <p className="text-zinc-400 leading-relaxed">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA Section --- */}
      <section className="py-32 px-6 relative overflow-hidden border-t border-white/5">
        <div className="absolute inset-0 bg-stars opacity-10" />
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6">
            <BlurWordFade text="Ready to claim your link?" />
          </h2>
          <p className="text-zinc-400 text-lg mb-10 max-w-2xl mx-auto">
            <BlurWordFade text="Join thousands of creators and businesses scaling their growth with our platform." delay={0.2} simple />
          </p>
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 will-change-transform"
          >
            <div className="flex items-center bg-white/5 border border-white/10 rounded-full p-1 pl-4">
              <span className="text-zinc-400 text-sm">hushd.com/</span>
              <input 
                type="text" 
                placeholder="yourname" 
                className="bg-transparent border-none outline-none text-white text-sm w-24 ml-1 placeholder:text-zinc-600"
              />
              <button className="ml-2 px-6 py-2.5 bg-white text-black text-sm font-medium rounded-full hover:bg-zinc-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)]">
                Get Started
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- Footer --- */}
      <footer className="py-12 px-6 border-t border-white/5 bg-[#000000]">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <Logo />
          <div className="flex items-center gap-6 text-sm text-zinc-500">
            <a href="#" className="hover:text-white transition-colors">Privacy</a>
            <a href="#" className="hover:text-white transition-colors">Terms</a>
            <a href="#" className="hover:text-white transition-colors">Twitter</a>
          </div>
          <p className="text-sm text-zinc-600">© 2026 hushd. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}
