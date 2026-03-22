import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { signInWithPopup, GoogleAuthProvider, User } from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import toast from 'react-hot-toast';

export default function Signup() {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<'google' | 'username'>('google');
  const [authUser, setAuthUser] = useState<User | null>(null);
  const navigate = useNavigate();

  const handleGoogleSignup = async () => {
    setLoading(true);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      
      // Check if user already exists
      const userDoc = await getDoc(doc(db, 'users', result.user.uid));
      if (userDoc.exists()) {
        toast.success('Welcome back!');
        navigate('/dashboard');
      } else {
        // New user, proceed to username step
        setAuthUser(result.user);
        setStep('username');
      }
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveUsername = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;
    
    if (username.length < 3 || username.length > 20) {
      toast.error('Username must be between 3 and 20 characters');
      return;
    }
    
    setLoading(true);
    try {
      const now = new Date().toISOString();
      
      await setDoc(doc(db, 'users', authUser.uid), {
        uid: authUser.uid,
        username: username.toLowerCase(),
        email: authUser.email || '',
        createdAt: now,
        profileViews: 0,
        visibility: 'public',
        discordLinked: false,
        discordUsername: '',
        bannerStyle: false,
        usernameStyle: false
      });
      
      await setDoc(doc(db, 'profiles', authUser.uid), {
        uid: authUser.uid,
        username: username.toLowerCase(),
        displayName: username,
        bio: 'Welcome to my profile!',
        backgroundUrl: '',
        backgroundType: 'color',
        audioUrl: '',
        avatarUrl: authUser.photoURL || '',
        cursorUrl: '',
        petUrl: '',
        usernameEffect: 'none',
        backgroundEffect: 'none',
        links: []
      });

      toast.success('Account created successfully');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center p-6 text-white font-sans">
      <div className="w-full max-w-md bg-[#111] border border-white/10 rounded-2xl p-8 shadow-2xl">
        <div className="text-center mb-8">
          <Link to="/" className="text-2xl font-bold tracking-tighter lowercase inline-block mb-2">hushd</Link>
          <h1 className="text-xl text-zinc-300">
            {step === 'google' ? 'Create an account' : 'Choose your username'}
          </h1>
        </div>
        
        {step === 'google' ? (
          <div className="flex flex-col gap-4">
            <button 
              onClick={handleGoogleSignup}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-black font-medium rounded-lg py-3 hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              <svg viewBox="0 0 24 24" width="20" height="20" xmlns="http://www.w3.org/2000/svg">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
              </svg>
              {loading ? 'Connecting...' : 'Continue with Google'}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSaveUsername} className="flex flex-col gap-4">
            <div>
              <label className="block text-xs text-zinc-500 mb-1">Username</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 text-sm">hushd.com/</span>
                <input 
                  type="text" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className="w-full bg-[#0A0A0A] border border-white/10 rounded-lg pl-[88px] pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-white/30 transition-colors"
                  placeholder="yourname"
                  required
                />
              </div>
            </div>
            <button 
              type="submit" 
              disabled={loading || username.length < 3}
              className="w-full bg-white text-black font-medium rounded-lg py-2.5 mt-2 hover:bg-zinc-200 transition-colors disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Complete Setup'}
            </button>
          </form>
        )}
        
        {step === 'google' && (
          <div className="mt-6 text-center text-sm text-zinc-500">
            Already have an account? <Link to="/login" className="text-white hover:underline">Log in</Link>
          </div>
        )}
      </div>
    </div>
  );
}
