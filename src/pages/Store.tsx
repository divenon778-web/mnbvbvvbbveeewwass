import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Tag, FileText, Layout, Download, Coins, Search, Filter, Trash2, CheckCircle2, Eye, EyeOff } from 'lucide-react';
import { handleFirestoreError, OperationType } from '../firebase';
import DashboardLayout from '../components/DashboardLayout';
import { useAuth } from '../AuthContext';
import { db } from '../firebase';
import { collection, query, where, getDocs, addDoc, doc, updateDoc, increment, serverTimestamp, setDoc, getDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';

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

export default function Store() {
  const { user, userData, refreshUserData } = useAuth();
  const [activeTab, setActiveTab] = useState<'marketplace' | 'my-items' | 'purchases'>('marketplace');
  const [items, setItems] = useState<StoreItem[]>([]);
  const [myItems, setMyItems] = useState<StoreItem[]>([]);
  const [purchasedItems, setPurchasedItems] = useState<StoreItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSellModalOpen, setIsSellModalOpen] = useState(false);
  const [cooldownTime, setCooldownTime] = useState<string | null>(null);
  const [showStoreOnBio, setShowStoreOnBio] = useState(false);
  const [isUpdatingStoreStatus, setIsUpdatingStoreStatus] = useState(false);
  
  // Sell Form State
  const [newItem, setNewItem] = useState({
    name: '',
    description: '',
    price: 0,
    type: 'file' as 'file',
    fileUrl: '',
    templateData: null
  });

  useEffect(() => {
    fetchMarketplace();
    fetchMyItems();
    fetchPurchases();
    fetchStoreStatus();
  }, [user]);

  const fetchStoreStatus = async () => {
    if (!user) return;
    try {
      const docRef = doc(db, 'profiles', user.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setShowStoreOnBio(docSnap.data().showStoreOnBio || false);
      }
    } catch (error) {
      console.error("Error fetching store status:", error);
    }
  };

  const toggleStoreOnBio = async () => {
    if (!user) return;
    setIsUpdatingStoreStatus(true);
    try {
      const newStatus = !showStoreOnBio;
      await updateDoc(doc(db, 'profiles', user.uid), {
        showStoreOnBio: newStatus
      });
      setShowStoreOnBio(newStatus);
      toast.success(newStatus ? 'Store is now visible on your bio' : 'Store is now hidden from your bio');
    } catch (error) {
      console.error("Error updating store status:", error);
      toast.error('Failed to update store status');
    } finally {
      setIsUpdatingStoreStatus(false);
    }
  };

  const toggleItemVisibility = async (itemId: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'store_items', itemId), {
        showOnBio: !currentStatus
      });
      toast.success(`Item ${!currentStatus ? 'visible' : 'hidden'} on bio`);
      fetchMyItems();
    } catch (error) {
      console.error("Error toggling item visibility:", error);
      toast.error('Failed to update visibility');
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    if (!confirm('Are you sure you want to delete this item? This action cannot be undone.')) return;
    
    try {
      await updateDoc(doc(db, 'store_items', itemId), {
        active: false
      });
      toast.success('Item removed from store');
      fetchMarketplace();
      fetchMyItems();
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error('Failed to delete item');
    }
  };

  useEffect(() => {
    if (userData?.lastClaimedAt) {
      const lastClaimed = userData.lastClaimedAt.toDate ? userData.lastClaimedAt.toDate() : new Date(userData.lastClaimedAt);
      const now = new Date();
      const diff = now.getTime() - lastClaimed.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (diff < twentyFourHours) {
        const remaining = twentyFourHours - diff;
        const hours = Math.floor(remaining / (1000 * 60 * 60));
        const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
        setCooldownTime(`${hours}h ${minutes}m`);

        const timer = setInterval(() => {
          const newNow = new Date();
          const newDiff = newNow.getTime() - lastClaimed.getTime();
          if (newDiff >= twentyFourHours) {
            setCooldownTime(null);
            clearInterval(timer);
          } else {
            const newRemaining = twentyFourHours - newDiff;
            const newHours = Math.floor(newRemaining / (1000 * 60 * 60));
            const newMinutes = Math.floor((newRemaining % (1000 * 60 * 60)) / (1000 * 60));
            setCooldownTime(`${newHours}h ${newMinutes}m`);
          }
        }, 60000);
        return () => clearInterval(timer);
      } else {
        setCooldownTime(null);
      }
    }
  }, [userData?.lastClaimedAt]);

  const fetchMarketplace = async () => {
    try {
      const q = query(collection(db, 'store_items'));
      const querySnapshot = await getDocs(q);
      const itemsData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as StoreItem))
        .filter(item => (item as any).active !== false);
      setItems(itemsData);
    } catch (error) {
      console.error("Error fetching marketplace:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchMyItems = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, 'store_items'), where('sellerId', '==', user.uid));
      const querySnapshot = await getDocs(q);
      const itemsData = querySnapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as StoreItem))
        .filter(item => (item as any).active !== false);
      setMyItems(itemsData);
    } catch (error) {
      console.error("Error fetching my items:", error);
    }
  };

  const fetchPurchases = async () => {
    if (!user) return;
    try {
      const q = query(collection(db, `purchased_items/${user.uid}/items`));
      const querySnapshot = await getDocs(q);
      const purchaseIds = querySnapshot.docs.map(doc => doc.id);
      
      if (purchaseIds.length === 0) {
        setPurchasedItems([]);
        return;
      }

      // Fetch actual item details
      const itemsPromises = purchaseIds.map(id => getDoc(doc(db, 'store_items', id)));
      const itemsDocs = await Promise.all(itemsPromises);
      const itemsData = itemsDocs.map(doc => ({ id: doc.id, ...doc.data() } as StoreItem));
      setPurchasedItems(itemsData);
    } catch (error) {
      console.error("Error fetching purchases:", error);
    }
  };

  const handleSellItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !userData) return;

    try {
      const itemData = {
        ...newItem,
        sellerId: user.uid,
        sellerUsername: userData.username,
        createdAt: serverTimestamp(),
        sales: 0,
        active: true
      };

      await addDoc(collection(db, 'store_items'), itemData);
      toast.success('Item listed for sale!');
      setIsSellModalOpen(false);
      setNewItem({ name: '', description: '', price: 0, type: 'file', fileUrl: '', templateData: null });
      fetchMarketplace();
      fetchMyItems();
    } catch (error) {
      console.error("Error selling item:", error);
      toast.error('Failed to list item');
    }
  };

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
        await updateDoc(doc(db, 'users', user.uid), {
          coins: increment(-item.price)
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `users/${user.uid}`);
      }

      // 2. Add coins to seller
      try {
        await updateDoc(doc(db, 'users', item.sellerId), {
          coins: increment(item.price)
        });
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
        await updateDoc(doc(db, 'store_items', item.id), {
          sales: increment(1)
        });
      } catch (e) {
        handleFirestoreError(e, OperationType.WRITE, `store_items/${item.id}`);
      }

      toast.success(`Purchased ${item.name}!`);
      refreshUserData();
      fetchPurchases();
      fetchMarketplace();
    } catch (error) {
      console.error("Error during purchase:", error);
      toast.error('Purchase failed');
    }
  };

  const claimDailyCoins = async () => {
    if (!user || !userData) return;
    
    if (userData.lastClaimedAt) {
      const lastClaimed = userData.lastClaimedAt.toDate ? userData.lastClaimedAt.toDate() : new Date(userData.lastClaimedAt);
      const now = new Date();
      const diff = now.getTime() - lastClaimed.getTime();
      const twentyFourHours = 24 * 60 * 60 * 1000;

      if (diff < twentyFourHours) {
        toast.error('You must wait 24 hours between claims!');
        return;
      }
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        coins: increment(100),
        lastClaimedAt: serverTimestamp()
      });
      toast.success('Claimed 100 daily coins!');
      refreshUserData();
    } catch (error) {
      console.error("Error claiming coins:", error);
    }
  };

  const handleDownloadTemplate = async (item: StoreItem) => {
    if (!user) return;
    try {
      await addDoc(collection(db, 'templates'), {
        userId: user.uid,
        name: item.name,
        data: item.templateData || {},
        createdAt: serverTimestamp(),
        sourceItem: item.id
      });
      toast.success('Template downloaded to Customize tab!');
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error('Failed to download template');
    }
  };

  return (
    <DashboardLayout>
      <div className="p-8 flex flex-col text-left">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Your Store</h2>
            <p className="text-zinc-500 text-sm">Buy and sell custom bio templates and files.</p>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={claimDailyCoins}
              disabled={!!cooldownTime}
              className={`flex items-center gap-2 px-4 py-2 border rounded-xl text-sm font-medium transition-colors ${cooldownTime ? 'bg-zinc-500/10 border-zinc-500/20 text-zinc-500 cursor-not-allowed' : 'bg-zinc-500/10 border-zinc-500/20 text-zinc-300 hover:bg-zinc-500/20'}`}
            >
              <Coins size={16} className="text-zinc-500" />
              {cooldownTime ? `Claim in ${cooldownTime}` : 'Claim Daily Coins'}
            </button>
            <button 
              onClick={() => setIsSellModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors"
            >
              <Plus size={16} />
              Sell Item
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-white/5 mb-8 gap-4">
          <div className="flex gap-6">
            <button 
              onClick={() => setActiveTab('marketplace')}
              className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'marketplace' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Marketplace
              {activeTab === 'marketplace' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
            <button 
              onClick={() => setActiveTab('my-items')}
              className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'my-items' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              My Items
              {activeTab === 'my-items' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
            <button 
              onClick={() => setActiveTab('purchases')}
              className={`pb-4 text-sm font-medium transition-colors relative ${activeTab === 'purchases' ? 'text-white' : 'text-zinc-500 hover:text-zinc-300'}`}
            >
              Purchases
              {activeTab === 'purchases' && <motion.div layoutId="tab-underline" className="absolute bottom-0 left-0 right-0 h-0.5 bg-white" />}
            </button>
          </div>

          {activeTab === 'my-items' && (
            <div className="pb-4 flex items-center gap-3">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-tighter">Show Store on Bio</span>
              <button 
                onClick={toggleStoreOnBio}
                disabled={isUpdatingStoreStatus}
                className={`w-10 h-5 rounded-full relative transition-colors ${showStoreOnBio ? 'bg-white' : 'bg-zinc-800'}`}
              >
                <motion.div 
                  animate={{ x: showStoreOnBio ? 22 : 2 }}
                  className={`absolute top-1 w-3 h-3 rounded-full ${showStoreOnBio ? 'bg-black' : 'bg-zinc-500'}`}
                />
              </button>
            </div>
          )}
        </div>

        {/* Content */}
        {loading ? (
          <div className="flex items-center justify-center h-64 text-zinc-500">Loading items...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {(activeTab === 'marketplace' ? items : activeTab === 'my-items' ? myItems : purchasedItems).map((item) => (
              <motion.div 
                key={item.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-[#111111] border border-white/5 rounded-2xl p-6 flex flex-col h-full hover:border-white/10 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-2 rounded-lg ${item.type === 'template' ? 'bg-zinc-500/10 text-zinc-500' : 'bg-blue-500/10 text-blue-500'}`}>
                    {item.type === 'template' ? <Layout size={20} /> : <FileText size={20} />}
                  </div>
                  <div className="flex items-center gap-2">
                    {activeTab === 'my-items' && (
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => toggleItemVisibility(item.id, (item as any).showOnBio !== false)}
                          className={`p-2 rounded-lg transition-colors ${
                            (item as any).showOnBio !== false ? 'bg-zinc-800 text-white' : 'bg-zinc-900 text-zinc-500'
                          }`}
                          title={(item as any).showOnBio !== false ? "Visible on Bio" : "Hidden on Bio"}
                        >
                          {(item as any).showOnBio !== false ? <Eye size={16} /> : <EyeOff size={16} />}
                        </button>
                        <button 
                          onClick={() => handleDeleteItem(item.id)}
                          className="p-2 bg-red-500/10 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Delete Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5 bg-zinc-500/10 px-2.5 py-1 rounded-full border border-zinc-500/20">
                      <Coins size={12} className="text-zinc-500" />
                      <span className="text-xs font-bold text-white">{item.price}</span>
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">{item.name}</h3>
                <p className="text-xs text-zinc-500 mb-4 line-clamp-2">{item.description}</p>

                <div className="mt-auto pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] text-zinc-500 uppercase font-bold tracking-tighter">Seller</span>
                    <span className="text-xs text-zinc-300">@{item.sellerUsername}</span>
                  </div>
                  
                  {activeTab === 'marketplace' ? (
                    <button 
                      onClick={() => handlePurchase(item)}
                      disabled={item.sellerId === user?.uid || purchasedItems.some(p => p.id === item.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                        purchasedItems.some(p => p.id === item.id)
                          ? 'bg-zinc-800 text-zinc-400'
                          : 'bg-white text-black hover:bg-zinc-200'
                      }`}
                    >
                      {purchasedItems.some(p => p.id === item.id) ? 'Purchased' : 'Buy Now'}
                    </button>
                  ) : activeTab === 'purchases' ? (
                    <button 
                      onClick={() => handleDownloadTemplate(item)}
                      className="flex items-center gap-2 px-4 py-2 bg-zinc-800 text-white rounded-xl text-xs font-bold hover:bg-zinc-700 transition-colors"
                    >
                      <Download size={14} />
                      Download
                    </button>
                  ) : (
                    <div className="text-xs text-zinc-500 font-medium">
                      {item.sales} Sales
                    </div>
                  )}
                </div>
              </motion.div>
            ))}

            {(activeTab === 'marketplace' ? items : activeTab === 'my-items' ? myItems : purchasedItems).length === 0 && (
              <div className="col-span-full flex flex-col items-center justify-center h-64 text-zinc-500 border border-dashed border-white/10 rounded-2xl">
                <ShoppingBag size={48} className="mb-4 opacity-20" />
                <p>No items found in this section.</p>
              </div>
            )}
          </div>
        )}

        {/* Sell Modal */}
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
                className="relative z-10 w-full max-w-lg bg-[#0A0A0A] border border-white/10 rounded-3xl p-8 shadow-2xl"
              >
                <h2 className="text-2xl font-bold text-white mb-6">Sell an Item</h2>
                <form onSubmit={handleSellItem} className="space-y-6">
                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Price (Coins)</label>
                    <div className="relative">
                      <Coins size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500" />
                      <input 
                        type="number"
                        value={newItem.price}
                        onChange={(e) => setNewItem({ ...newItem, price: parseInt(e.target.value) || 0 })}
                        className="w-full bg-white/5 border border-white/5 rounded-xl py-3 pl-12 pr-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Item Name</label>
                    <input 
                      type="text"
                      required
                      value={newItem.name}
                      onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="e.g. Minimalist Bio Template"
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">Description</label>
                    <textarea 
                      required
                      value={newItem.description}
                      onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors h-24 resize-none"
                      placeholder="Describe what you are selling..."
                    />
                  </div>

                  <div className="flex flex-col gap-2">
                    <label className="text-xs text-zinc-500 uppercase font-bold tracking-tighter">
                      File URL
                    </label>
                    <input 
                      type="url"
                      required
                      value={newItem.fileUrl}
                      onChange={(e) => setNewItem({ ...newItem, fileUrl: e.target.value })}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-3 px-4 text-sm text-white focus:outline-none focus:border-white/20 transition-colors"
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button 
                      type="button"
                      onClick={() => setIsSellModalOpen(false)}
                      className="flex-1 py-3 bg-white/5 text-white rounded-xl text-sm font-bold hover:bg-white/10 transition-colors"
                    >
                      Cancel
                    </button>
                    <button 
                      type="submit"
                      className="flex-1 py-3 bg-white text-black rounded-xl text-sm font-bold hover:bg-zinc-200 transition-colors"
                    >
                      List Item
                    </button>
                  </div>
                </form>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
