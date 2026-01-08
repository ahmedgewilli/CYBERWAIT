import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';
import { supabase } from './src/supabase';

// --- Types & Data ---
interface MenuItem {
  id: number;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
}

interface CartItem {
  item: MenuItem;
  quantity: number;
}

const MENU_ITEMS: MenuItem[] = [
  { id: 1, name: "Neon Sushi Roll", category: "Meals", price: 18.5, description: "Fresh salmon with electric wasabi pearls and avocado.", image: "https://images.unsplash.com/photo-1579871494447-9811cf80d66c?w=400" },
  { id: 2, name: "Cypher Burger", category: "Meals", price: 15.0, description: "A5 Wagyu beef with a signature digital glaze on brioche.", image: "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400" },
  { id: 11, name: "Nebula Ramen", category: "Meals", price: 19.0, description: "Midnight-blue broth with glowing bamboo shoots and soft-boiled egg.", image: "https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=400" },
  { id: 12, name: "Binary Tacos", category: "Meals", price: 14.5, description: "One mild, one wild. Precision-balanced carnitas with neon lime.", image: "https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400" },
  { id: 13, name: "Pixel Pizza", category: "Meals", price: 17.0, description: "Algorithmically placed pepperonis on a perfect square crust.", image: "https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400" },
  { id: 3, name: "Zen Garden Salad", category: "Meals", price: 12.5, description: "Organic greens with micro-herbs and citrus mist dressing.", image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=400" },
  { id: 5, name: "Quantum Espresso", category: "Drinks", price: 6.5, description: "Double shot of single-origin smart brew beans.", image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=400" },
  { id: 15, name: "Void Cola", category: "Drinks", price: 5.0, description: "Zero-sugar, deep-black sparkling refreshment with hint of vanilla.", image: "https://images.unsplash.com/photo-1581636625402-29b2a704ef13?w=400" },
  { id: 8, name: "Hologram Cake", category: "Desserts", price: 12.0, description: "Layers of translucent fruit jelly and Madagascar vanilla cream.", image: "https://images.unsplash.com/photo-1535141192574-5d4897c12636?w=400" },
  { id: 17, name: "Data Donuts", category: "Desserts", price: 11.0, description: "Circuit-board icing with popping candy 'code' bits.", image: "https://images.unsplash.com/photo-1551024601-bec78aea704b?w=400" },
  { id: 10, name: "Gravity Fries", category: "Meals", price: 7.0, description: "Truffle-dusted potato wedges with a molten dipping core.", image: "https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400" },
];

// --- Icons ---
const CyberWaitLogo = ({ className = "w-6 h-6" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M12 2L4 10V14L12 22L20 14V10L12 2Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    <path d="M8 11C8 11 9 10 10 10C11 10 11 11 11 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M13 11C13 11 14 10 15 10C16 10 16 11 16 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M10 15C10.5 15.5 11.2 16 12 16C12.8 16 13.5 15.5 14 15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
    <path d="M12 2L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
    <circle cx="12" cy="2" r="1.5" fill="#f43f5e" />
  </svg>
);

const CuteRobotIcon = ({ className = "w-12 h-12", mood = 0 }: { className?: string; mood?: number }) => {
  return (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
      <path d="M5 10C5 7.23858 7.23858 5 10 5H14C16.7614 5 19 7.23858 19 10V15C19 17.7614 16.7614 20 14 20H10C7.23858 20 5 17.7614 5 15V10Z" fill="currentColor" fillOpacity="0.1" stroke="currentColor" strokeWidth="2"/>
      {mood === 0 && (
        <><rect x="8" y="11.5" width="2" height="1" rx="0.5" fill="currentColor"/><rect x="14" y="11.5" width="2" height="1" rx="0.5" fill="currentColor"/></>
      )}
      {mood === 1 && (
        <><path d="M8 13C8 13 8.5 11 9.5 11C10.5 11 11 13 11 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M13 13C13 13 13.5 11 14.5 11C15.5 11 16 13 16 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>
      )}
      {mood === 2 && (
        <><path d="M8 11L10 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M10 11L8 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M14 11L16 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M16 11L14 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></>
      )}
      {mood === 3 && (
        <><path d="M7.5 12.5L9.5 10.5L11.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M12.5 12.5L14.5 10.5L16.5 12.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></>
      )}
      {mood === 0 && <rect x="10.5" y="16" width="3" height="1.5" rx="0.75" fill="currentColor"/>}
      {mood === 1 && <path d="M10 16C10.5 16.5 11.2 17 12 17C12.8 17 13.5 16.5 14 16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
      {mood === 2 && <path d="M10 18C10.5 17.5 11.2 17 12 17C12.8 17 13.5 17.5 14 18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>}
      {mood === 3 && <path d="M9 16C9 17.6569 10.3431 19 12 19C13.6569 19 15 17.6569 15 16" fill="currentColor" fillOpacity="0.2" stroke="currentColor" strokeWidth="1.5"/>}
      <path d="M12 5V2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
      <circle cx="12" cy="2" r="1.5" fill={mood === 2 ? "#fbbf24" : mood === 3 ? "#10b981" : "#f43f5e"} className={mood === 2 ? "animate-pulse" : ""}/>
    </svg>
  );
};

const CartIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>
);

const ApplePayIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M17.05 20.28c-.96.95-2.05 1.72-3.3 1.72-1.2 0-1.6-.74-3.04-.74-1.45 0-1.9.72-3.04.74-1.23 0-2.45-.85-3.48-2.12-2.12-2.62-1.63-7.1 1.05-9.8 1.34-1.33 3.03-2.13 4.57-2.13 1.16 0 2.26.44 2.97.44.7 0 1.8-.44 3.03-.44 1.13 0 2.5.58 3.52 1.63-2.22 1.56-1.85 4.86.37 6.4-.9 1.5-1.9 3.14-2.65 4.04zm-4.72-16.1c0-1.6 1.32-2.9 2.93-2.9.15 0 .3 0 .44.03-.13 1.63-1.46 2.9-2.93 2.9-.17 0-.3 0-.44-.03z"/></svg>
);

const CashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/></svg>
);

const MinusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

const PlusIcon = ({ className }: { className?: string }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
);

// --- UI Sub-Components ---
const Card = ({ children, className = "", ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div 
    className={`bg-white border border-zinc-200 rounded-[2.5rem] p-6 shadow-sm hover:shadow-xl transition-all duration-300 ${className}`}
    {...props}
  >
    {children}
  </div>
);

// --- Page Views ---
const LandingView = ({ onStart }: { onStart: () => void }) => (
  <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-6 py-12 animate-fade-in">
    <div className="relative mb-8">
      <div className="absolute inset-0 blur-[60px] bg-cyan-200 rounded-full"></div>
      <div className="w-24 h-24 bg-[#2D7D90] rounded-3xl flex items-center justify-center text-white shadow-2xl relative z-10 pulse-glow">
        <CyberWaitLogo className="w-12 h-12" />
      </div>
    </div>
    <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter leading-tight text-zinc-900">
      HAPPY<br/><span className="text-cyan-600">DINING.</span>
    </h1>
    <p className="text-zinc-500 text-lg md:text-xl max-w-lg mb-12 leading-relaxed font-medium">
      Your friendly digital dining companion. Experience fresh meals with the magic of automated service.
    </p>
    <div className="w-full max-w-xs">
      <button onClick={onStart} className="w-full py-5 bg-[#2D7D90] hover:bg-[#256675] text-white font-black uppercase tracking-tighter rounded-full transition-all shadow-xl shadow-cyan-600/20 active:scale-95">
        Start My Order
      </button>
    </div>
  </div>
);

const MenuView = ({ onAddToCart, onCheckout, cartCount, cartTotal, isOrderActive, menuItems }: any) => {
  const [activeCategory, setActiveCategory] = useState('All Items');
  
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All Items') return menuItems;
    return menuItems.filter((item: MenuItem) => item.category === activeCategory);
  }, [activeCategory, menuItems]);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 animate-slide-up pb-48">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-16 gap-10">
        <div className="max-w-xl">
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter mb-4 italic text-zinc-900 uppercase">Our Menu</h2>
          <p className="text-zinc-500 font-medium text-base md:text-lg leading-relaxed">Freshly made, delivered with precision.</p>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-4 w-full lg:w-auto -mx-4 px-4 lg:mx-0 lg:px-0 no-scrollbar items-center">
          {['All Items', 'Meals', 'Drinks', 'Desserts'].map((cat) => (
            <button 
              key={cat} 
              onClick={() => setActiveCategory(cat)}
              className={`whitespace-nowrap px-10 py-3.5 rounded-full text-[10px] font-black tracking-widest uppercase transition-all border-2 ${activeCategory === cat ? 'bg-zinc-900 text-white border-zinc-900 shadow-xl scale-105' : 'bg-white border-zinc-100 text-zinc-400 hover:text-zinc-900 hover:border-zinc-300'}`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-10">
        {filteredItems.map(item => (
          <Card key={item.id} className="group p-0 overflow-hidden flex flex-col border-0 bg-white ring-1 ring-zinc-100 shadow-xl hover:shadow-2xl hover:-translate-y-2">
            <div className="h-64 overflow-hidden relative">
              <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              <div className="absolute top-6 right-6 bg-white/95 backdrop-blur-xl px-5 py-2 rounded-full text-xs font-black text-cyan-600 shadow-lg border border-white/50 ring-1 ring-zinc-900/5">
                ${item.price.toFixed(2)}
              </div>
            </div>
            <div className="p-8 flex flex-col flex-grow">
              <h3 className="text-2xl font-black mb-2 text-zinc-900 group-hover:text-cyan-600 transition-colors uppercase tracking-tight italic">{item.name}</h3>
              <p className="text-zinc-500 text-sm mb-10 h-12 line-clamp-2 leading-relaxed flex-grow font-medium">{item.description}</p>
              {!isOrderActive && (
                <button 
                  onClick={() => onAddToCart(item)}
                  className="w-full py-5 bg-zinc-50 border border-zinc-200 text-zinc-900 active:bg-[#2D7D90] active:text-white active:border-[#2D7D90] font-black uppercase text-[11px] tracking-[0.2em] rounded-[2rem] transition-colors duration-100 flex items-center justify-center gap-3 shadow-sm"
                >
                  <CartIcon /> Add to Cart
                </button>
              )}
            </div>
          </Card>
        ))}
      </div>

      {cartCount > 0 && !isOrderActive && (
        <div className="fixed bottom-10 left-0 right-0 px-6 z-[120] animate-slide-up flex justify-center pointer-events-none">
          <button 
            onClick={onCheckout}
            className="w-full max-w-xl py-6 bg-[#121212] text-white rounded-full shadow-[0_30px_70px_rgba(0,0,0,0.6)] flex items-center justify-between px-6 sm:px-10 hover:scale-[1.02] transition-transform active:scale-95 border border-zinc-800 pointer-events-auto ring-4 ring-white/10"
          >
            <div className="flex items-center gap-4 sm:gap-8">
              <div className="bg-[#2D7D90] text-white w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center text-lg sm:text-xl font-black ring-4 ring-zinc-800">{cartCount}</div>
              <span className="font-black uppercase tracking-tighter text-xs sm:text-base text-zinc-100">
                Review Cart & Pay
              </span>
            </div>
            <span className="font-black text-2xl sm:text-4xl tracking-tighter italic text-white">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const CheckoutView = ({ cart, updateCart, clearCart, onComplete, onBack, isOrderActive }: any) => {
  const [paymentMethod, setPaymentMethod] = useState<'visa' | 'apple' | 'cash'>('visa');
  const cartTotal = useMemo(() => cart.reduce((acc: number, curr: CartItem) => acc + (curr.item.price * curr.quantity), 0), [cart]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-slide-up pb-40">
      <button onClick={onBack} className="mb-8 text-zinc-400 hover:text-zinc-900 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] transition-all group">
         <span className="group-hover:-translate-x-2 transition-transform inline-block text-lg">←</span> Back to Menu
      </button>
      
      {cart.length === 0 ? (
        <div className="flex flex-col items-center">
          <Card className="w-full ring-1 ring-zinc-100 mb-10">
            <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
              <div className="w-32 h-32 bg-zinc-50 rounded-full flex items-center justify-center text-zinc-300 mb-8 border border-zinc-100 shadow-inner ring-8 ring-zinc-50/50">
                <CuteRobotIcon className="w-16 h-16" mood={2} />
              </div>
              <h3 className="text-2xl font-black text-zinc-900 mb-4 italic uppercase tracking-tighter">Your basket is empty 😔</h3>
              <p className="text-zinc-500 text-base max-w-sm mb-12 font-medium leading-relaxed">The robot is feeling lonely... add some delicious items to make him happy!</p>
              <button onClick={onBack} className="px-14 py-5 bg-[#2D7D90] text-white rounded-full text-[11px] font-black uppercase tracking-[0.3em] hover:scale-105 transition-all active:scale-95 shadow-2xl">Browse Our Menu</button>
            </div>
          </Card>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-8">
          <Card className="ring-1 ring-zinc-100 overflow-hidden p-0">
            <div className="py-8 sm:py-10 pl-4 sm:pl-6 pr-8 border-b border-zinc-50 flex flex-row items-center gap-8 sm:gap-14">
               <h2 className="text-2xl sm:text-3xl font-black tracking-tighter italic text-zinc-900 uppercase whitespace-nowrap">YOUR BASKET</h2>
               {!isOrderActive && (
                 <button 
                   onClick={clearCart} 
                   className="text-[10px] font-black uppercase tracking-wider text-rose-500 bg-rose-50 px-5 py-2.5 rounded-full border border-rose-100 hover:bg-rose-100 transition-all active:scale-95 shadow-sm whitespace-nowrap"
                 >
                   CLEAR ALL
                 </button>
               )}
            </div>
            <div className="space-y-4 max-h-[700px] overflow-y-auto px-4 sm:px-10 py-6 no-scrollbar">
              {cart.map((cartItem: CartItem) => (
                <div key={cartItem.item.id} className="flex flex-row items-center justify-between gap-4 py-6 border-b border-zinc-50 last:border-0 relative">
                  <div className="flex-1 flex flex-col items-start min-w-0">
                    <h4 className="font-black text-base sm:text-xl text-zinc-900 leading-tight italic uppercase whitespace-nowrap overflow-hidden text-ellipsis w-full">{cartItem.item.name}</h4>
                    <div className="mt-4">
                        <span className="text-2xl font-black text-zinc-900 tracking-tighter italic">
                            ${(cartItem.item.price * cartItem.quantity).toFixed(2)}
                        </span>
                    </div>
                  </div>
                  <div className="relative shrink-0 w-32 h-32 sm:w-44 sm:h-44">
                    <img 
                      src={cartItem.item.image} 
                      className="w-full h-full rounded-[2.5rem] sm:rounded-[3.5rem] object-cover shadow-xl border-4 border-white ring-1 ring-zinc-100" 
                      alt={cartItem.item.name} 
                    />
                    {!isOrderActive && (
                      <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-white rounded-full px-4 py-2 shadow-[0_10px_30px_rgba(0,0,0,0.15)] border border-zinc-100 whitespace-nowrap min-w-[120px] justify-between z-10">
                          <button 
                            onClick={() => updateCart(cartItem.item.id, -1)} 
                            className="text-[#f43f5e] hover:scale-110 transition-transform p-1"
                          >
                              <MinusIcon />
                          </button>
                          <span className="font-black text-lg text-zinc-900 select-none">{cartItem.quantity}</span>
                          <button 
                            onClick={() => updateCart(cartItem.item.id, 1)} 
                            className="text-[#2D7D90] hover:scale-110 transition-transform p-1"
                          >
                              <PlusIcon />
                          </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {!isOrderActive && (
            <Card className="ring-1 ring-zinc-100 overflow-hidden p-0">
              <div className="p-6 pb-4 border-b border-zinc-50 text-center">
                <h2 className="text-3xl md:text-4xl font-black tracking-tighter italic text-zinc-900 uppercase whitespace-nowrap">PAYMENT METHOD</h2>
              </div>
              <div className="p-6">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <button onClick={() => setPaymentMethod('visa')} className={`w-full flex flex-col items-center gap-3 p-6 rounded-[2.5rem] border-4 transition-all ${paymentMethod === 'visa' ? 'border-[#2D7D90] bg-[#e6f4f7] text-[#2D7D90] shadow-xl scale-105' : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}>
                    <div className="font-black text-[10px] tracking-widest uppercase">VISA / CC</div><span className="text-sm font-bold">Secure Card</span>
                  </button>
                  <button onClick={() => setPaymentMethod('apple')} className={`w-full flex flex-col items-center gap-3 p-6 rounded-[2.5rem] border-4 transition-all ${paymentMethod === 'apple' ? 'border-[#2D7D90] bg-[#e6f4f7] text-[#2D7D90] shadow-xl scale-105' : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}>
                    <ApplePayIcon /><span className="text-sm font-bold">Apple Pay</span>
                  </button>
                  <button onClick={() => setPaymentMethod('cash')} className={`w-full flex flex-col items-center gap-3 p-6 rounded-[2.5rem] border-4 transition-all ${paymentMethod === 'cash' ? 'border-[#2D7D90] bg-[#e6f4f7] text-[#2D7D90] shadow-xl scale-105' : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}>
                    <CashIcon /><span className="text-sm font-bold">Cash at Counter</span>
                  </button>
                </div>
              </div>
            </Card>
          )}

          <Card className="bg-white border border-zinc-200 text-zinc-900 shadow-3xl">
            <div className="space-y-6">
              <div className="flex justify-between text-zinc-500 text-sm font-bold uppercase tracking-widest"><span>Order Total</span><span className="text-zinc-900">${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-500 text-sm font-bold uppercase tracking-widest"><span>Automated Delivery</span><span className="text-emerald-600">Free</span></div>
              <div className="flex justify-between items-center pt-8 border-t border-zinc-100"><span className="text-2xl font-black italic uppercase text-zinc-900">Pay Now</span><span className="text-5xl font-black text-zinc-900 tracking-tighter">${cartTotal.toFixed(2)}</span></div>
            </div>
            {!isOrderActive && (
                <button onClick={() => onComplete(paymentMethod)} className="w-full mt-12 py-7 bg-zinc-900 text-white font-black uppercase text-xs tracking-[0.4em] rounded-[2.5rem] transition-all shadow-2xl hover:scale-[1.02] active:scale-95">
                Pay & Confirm
              </button>
            )}
          </Card>
        </div>
      )}
    </div>
  );
};

const TrackingView = ({ progress, setProgress, onNewOrder, orderId }: any) => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });

  // Zoom state
  const [zoom, setZoom] = useState(1);
  const pinchRef = useRef<{ distance: number; startZoom: number } | null>(null);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    let timer: any;
    if (orderId && API_URL) {
      const poll = async () => {
        try {
          const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/tracking/${orderId}/status`);
          if (!res.ok) return;
          const data = await res.json();
          const status = data.status || data?.status?.toLowerCase();
          const map: Record<string, number> = { pending: 0, preparing: 1, 'tray loaded': 2, loaded: 2, out: 3, 'out for delivery': 3, served: 4, completed: 4 };
          const newProgress = (typeof status === 'string' && status in map) ? map[status] : progress;
          setProgress(newProgress);
        } catch (err) {
          console.error('Tracking poll error:', err);
        }
      };
      poll();
      timer = setInterval(poll, 4500);
    } else {
      timer = setInterval(() => {
        setProgress((prev: number) => (prev < 4 ? prev + 1 : prev));
      }, 4500);
    }
    return () => clearInterval(timer);
  }, [orderId, setProgress]);

  // Zoom helpers
  const clampZoom = (z: number) => Math.min(2.5, Math.max(0.5, z));
  const zoomBy = (factor: number) => setZoom(z => clampZoom(Number((z * factor).toFixed(3))));

  // Pointer/wheel handlers for zoom
  const handleWheelOnMap = (e: React.WheelEvent) => {
    if (Math.abs(e.deltaY) < 1) return;
    e.preventDefault();
    const factor = e.deltaY > 0 ? 0.95 : 1.05;
    zoomBy(factor);
  };

  const handleTouchStartPinch = (e: React.TouchEvent) => {
    if (!e.touches || e.touches.length !== 2) return;
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    pinchRef.current = { distance: dist, startZoom: zoom };
  };

  const handleTouchMovePinch = (e: React.TouchEvent) => {
    if (!pinchRef.current || !e.touches || e.touches.length !== 2) return;
    const t1 = e.touches[0];
    const t2 = e.touches[1];
    const dx = t2.clientX - t1.clientX;
    const dy = t2.clientY - t1.clientY;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const ratio = dist / pinchRef.current.distance;
    const newZoom = clampZoom(pinchRef.current.startZoom * ratio);
    setZoom(newZoom);
  };

  const handleTouchEndPinch = (e: React.TouchEvent) => {
    if (!pinchRef.current) return;
    pinchRef.current = null;
  };


  // Unified pan handlers (mouse, pointer, touch)
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  // Use a square logical map so it scales nicely on mobile (keeps content visible)
  const isMobile = window.innerWidth < 768;

  const MAP_W = isMobile ? 820 : 1050;
  const MAP_H = isMobile ? 720 : 900;
  const BASE_SCALE = isMobile ? 1.05 : 1;



  useEffect(() => {
    const compute = () => {
      const el = mapContainerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const cw = rect.width;
      const ch = rect.height;
      // Account for container padding to get the actual available area
      const style = getComputedStyle(el);
      const padLeft = parseFloat(style.paddingLeft) || 0;
      const padRight = parseFloat(style.paddingRight) || 0;
      const padTop = parseFloat(style.paddingTop) || 0;
      const padBottom = parseFloat(style.paddingBottom) || 0;
      const availW = Math.max(0, cw - padLeft - padRight);
      const availH = Math.max(0, ch - padTop - padBottom);
      const scale = Math.min(availW / MAP_W, availH / MAP_H);
      // Slightly increase base scaling for readability and to ensure tables are visible
      const adjusted = clampZoom(Math.min(scale * BASE_SCALE * 1.12, 2));
      setZoom(adjusted);
      // Offset computed using the adjusted zoom so centering remains accurate
      const offsetX = padLeft + (availW - MAP_W * adjusted) / 2;
      const offsetY = padTop + (availH - MAP_H * adjusted) / 2;
      setOffset({ x: Math.round(offsetX), y: Math.round(offsetY) });
    };
    compute();
    const ro = new (window as any).ResizeObserver(compute);
    if (mapContainerRef.current) ro.observe(mapContainerRef.current);
    window.addEventListener('resize', compute);
    return () => { window.removeEventListener('resize', compute); ro.disconnect(); };
  }, []);

  // Use startFinger and startOffset to make panning consistent with zoom
  const startState = useRef<{ fingerX: number; fingerY: number; startOffsetX: number; startOffsetY: number } | null>(null);
  const velocity = useRef({ x: 0, y: 0 });
  const lastMoveTime = useRef<number | null>(null);
  const rafRef = useRef<number | null>(null);

  const applyMomentum = () => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    const step = () => {
      // apply friction
      velocity.current.x *= 0.95;
      velocity.current.y *= 0.95;

      // stop when velocity is tiny
      if (Math.abs(velocity.current.x) < 0.02 && Math.abs(velocity.current.y) < 0.02) {
        rafRef.current = null;
        return;
      }

      setOffset(prev => ({ x: prev.x + velocity.current.x, y: prev.y + velocity.current.y }));
      rafRef.current = requestAnimationFrame(step);
    };
    rafRef.current = requestAnimationFrame(step);
  };

  const handleStart = (x: number, y: number) => {
    // Stop momentum when starting a new pan
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    setIsPanning(true);
    startState.current = { fingerX: x, fingerY: y, startOffsetX: offset.x, startOffsetY: offset.y };
    lastMoveTime.current = performance.now();
    velocity.current = { x: 0, y: 0 };
  };

  const handleMoveTo = (x: number, y: number) => {
    if (!isPanning || !startState.current) return;
    const now = performance.now();
    const dt = lastMoveTime.current ? (now - lastMoveTime.current) : 16;
    lastMoveTime.current = now;

    const dx = (x - startState.current.fingerX) / zoom;
    const dy = (y - startState.current.fingerY) / zoom;

    // compute velocity (px per frame approximation)
    velocity.current.x = (dx + startState.current.startOffsetX - offset.x) / (dt / 16.6667);
    velocity.current.y = (dy + startState.current.startOffsetY - offset.y) / (dt / 16.6667);

    setOffset({ x: startState.current.startOffsetX + dx, y: startState.current.startOffsetY + dy });
  };

  const handleEnd = () => {
    setIsPanning(false);
    startState.current = null;
    lastMoveTime.current = null;
    // trigger momentum if velocity is significant
    if (Math.abs(velocity.current.x) > 0.5 || Math.abs(velocity.current.y) > 0.5) {
      applyMomentum();
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => handleStart(e.clientX, e.clientY);
  const handleMouseMove = (e: React.MouseEvent) => handleMoveTo(e.clientX, e.clientY);
  const handleMouseUp = () => handleEnd();

  const handlePointerDown = (e: React.PointerEvent) => { (e.target as Element)?.setPointerCapture?.(e.pointerId); handleStart(e.clientX, e.clientY); };
  const handlePointerMove = (e: React.PointerEvent) => handleMoveTo(e.clientX, e.clientY);
  const handlePointerUp = (e: React.PointerEvent) => { (e.target as Element)?.releasePointerCapture?.(e.pointerId); handleEnd(); };

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches && e.touches[0];
    if (!t) return;
    handleStart(t.clientX, t.clientY);
  };
  const handleTouchMove = (e: React.TouchEvent) => {
    const t = e.touches && e.touches[0];
    if (!t) return;
    handleMoveTo(t.clientX, t.clientY);
  };
  const handleTouchEnd = () => handleEnd();

  const robotMood = useMemo(() => {
    if (progress === 0) return { msg: "Chef is busy, I'm waiting for your food! 👨‍🍳", color: "text-zinc-500" };
    if (progress === 1) return { msg: "Getting everything ready for you! ✨", color: "text-emerald-600" };
    if (progress === 2) return { msg: "The tray is being loaded, almost there! 🍽️", color: "text-amber-600" };
    if (progress === 3) return { msg: "I'm on my way to your table! 🤖💨", color: "text-[#2D7D90]" };
    return { msg: "yay!! food arrived have a good meal! 😋", color: "text-emerald-500" };
  }, [progress]);

  const table6Top = 0.82 * MAP_H;
  const table6Left = 0.60 * MAP_W;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-fade-in pb-20">
      {/* header removed to maximize map vertical space */}
      <div className="mb-4" />

      <div className="space-y-8">
        {/* Robot Mode removed — using Robot Mood panel above Service Log instead */}

        <Card className="bg-white border-zinc-100 shadow-xl">           <div className="flex justify-between items-center mb-10">
             <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2D7D90]">ROBOT MOOD</h4>
             <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">Live</div>
           </div>
           <div className="bg-[#f4f7f8] p-10 rounded-[3rem] border border-zinc-100 flex flex-col items-center text-center shadow-inner">
              <div className="mb-8 animate-bounce text-[#2D7D90]"><CuteRobotIcon className="w-24 h-24" mood={progress > 3 ? 3 : progress} /></div>
              <p className={`text-lg font-black uppercase tracking-tight leading-tight italic ${robotMood.color}`}>{robotMood.msg}</p>
           </div>
           <div className="mt-10 pt-10 border-t border-zinc-100 flex justify-between items-center">
              <div className="text-[10px] font-black text-zinc-400 tracking-[0.3em]">ROBOT STAMINA</div>
              <div className="flex gap-2">
                 {[1,2,3,4,5,6].map(b => <div key={b} className={`w-4 h-2 rounded-sm ${b < 6 ? 'bg-emerald-500' : 'bg-zinc-200'}`}></div>)}
              </div>
           </div>
        </Card>

        <Card className="bg-white border-zinc-100 shadow-xl">          <h3 className="text-[12px] font-black mb-12 tracking-[0.3em] uppercase text-zinc-400 italic">SERVICE LOG</h3>
          <div className="space-y-12 relative ml-3">
            <div className="absolute left-[15px] top-2 bottom-2 w-1 bg-zinc-50"></div>
            {[
              { label: 'Order Received', step: 0 },
              { label: 'Chef Preparing', step: 1 },
              { label: 'Tray Loaded', step: 2 },
              { label: 'Out For Delivery', step: 3 },
              { label: 'Served', step: 4 }
            ].map((item, idx) => {
              const s = progress > idx ? 'done' : progress === idx ? 'active' : 'pending';
              return (
              <div key={idx} className="flex gap-8 items-center relative z-10">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-[12px] font-black border-[3px] transition-all duration-700 ${s === 'done' ? 'bg-[#10b981] border-[#10b981] text-white shadow-lg' : s === 'active' ? 'bg-[#2D7D90] border-[#2D7D90] text-white shadow-xl scale-110' : 'bg-white border-zinc-100 text-zinc-300'}`}>{s === 'done' ? '✓' : idx + 1}</div>
                <h4 className={`text-xs font-black uppercase tracking-[0.2em] ${s === 'pending' ? 'text-zinc-300' : 'text-zinc-900'}`}>{item.label}</h4>
              </div>
            )})}
          </div>
        </Card>

      </div>
    </div>
  );
};

// --- Main App ---
function App() {
  const [view, setView] = useState<'landing' | 'menu' | 'checkout' | 'tracking'>('landing');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isOrderActive, setIsOrderActive] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentOrderId, setCurrentOrderId] = useState<number | null>(null);

  // Menu items loaded from Supabase (falls back to static MENU_ITEMS)
  const [menuItems, setMenuItems] = useState<MenuItem[]>(MENU_ITEMS);

  useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL;
    const loadMenu = async () => {
      try {
        if (API_URL) {
          const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/menu`);
          if (res.ok) {
            const data = await res.json();
            setMenuItems(data as MenuItem[]);
            return;
          }

          // If unauthorized or any failure, try the guaranteed public endpoint
          console.warn('Primary menu API failed, status:', res.status);
          const fallback = await fetch(`${API_URL.replace(/\/$/, '')}/api/public-menu`);
          if (fallback.ok) {
            const fallbackData = await fallback.json();
            setMenuItems(fallbackData as MenuItem[]);
            return;
          }

          // If both fail, continue to Supabase client fallback below
        }

        const { data, error } = await supabase.from('menu').select('*').order('id');
        if (error) {
          console.warn('Supabase load menu error:', error);
        }
        if (data) setMenuItems(data as MenuItem[]);
      } catch (err) {
        console.error('loadMenu error:', err);
      }
    };
    loadMenu();
  }, []);

  const addToCart = (item: MenuItem) => {
    if (isOrderActive) return;
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) return prev.map(ci => ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCart = (itemId: number, delta: number) => {
    if (isOrderActive) return;
    setCart(prev => prev.map(ci => ci.item.id === itemId ? { ...ci, quantity: Math.max(0, ci.quantity + delta) } : ci).filter(ci => ci.quantity > 0));
  };
  
  const clearCart = () => {
    if (!isOrderActive) setCart([]);
  };
  
  const cartTotal = useMemo(() => cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((acc, curr) => acc + curr.quantity, 0), [cart]);

  useEffect(() => { 
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' }); 
  }, [view]);

  // If served, order is no longer active AND cart is cleared
  useEffect(() => {
    if (progress === 4) {
      setIsOrderActive(false);
      setCart([]); // Automatically empty the cart when the order is served
      setCurrentOrderId(null);
    }
  }, [progress]);

  const handlePlaceOrder = async (paymentMethod: 'visa' | 'apple' | 'cash' = 'visa') => {
    const API_URL = import.meta.env.VITE_API_URL;
    try {
      if (API_URL) {
        const res = await fetch(`${API_URL.replace(/\/$/, '')}/api/orders`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ tableNumber: 6, cart, paymentMethod, total: cartTotal }),
        });
        if (!res.ok) throw new Error(`Order API error: ${res.status}`);
        const body = await res.json();
        const orderId = body.orderId || body.id || body.order_id;
        setCurrentOrderId(orderId ?? null);
      }
    } catch (err) {
      console.error('Place order error:', err);
    } finally {
      setIsOrderActive(true);
      setProgress(0);
      setView('tracking');
    }
  };

  const handleNewOrderStart = () => {
    setCart([]);
    setIsOrderActive(false);
    setProgress(0);
    setView('menu');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      <header className="fixed top-0 inset-x-0 h-24 md:h-28 bg-white/90 backdrop-blur-3xl border-b border-zinc-100 z-[110] px-6 md:px-16 flex items-center justify-between shadow-sm">
        <div onClick={() => !isOrderActive && setView('landing')} className={`flex items-center gap-4 md:gap-7 ${isOrderActive ? 'cursor-default' : 'cursor-pointer group'}`}>
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#2D7D90] rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500 ring-4 ring-[#2D7D90]/5">
            <CyberWaitLogo className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl md:text-3xl tracking-tighter uppercase italic leading-none text-zinc-900">CyberWait™</span>
            <span className="text-[10px] md:text-[11px] font-black text-[#2D7D90] tracking-[0.4em] uppercase mt-2">Smart Restaurant</span>
          </div>
        </div>
        {view !== 'landing' && !isOrderActive && (
          <button 
            onClick={() => setView(view === 'checkout' ? 'menu' : 'checkout')} 
            className="relative p-4 md:p-5 bg-white border-2 border-zinc-100 rounded-[1.8rem] hover:border-[#2D7D90] transition-all shadow-md active:scale-90 group"
          >
            <CartIcon />
            {cartCount > 0 && <span className="absolute -top-3 -right-3 bg-[#2D7D90] text-white text-[10px] font-black w-8 h-8 flex items-center justify-center rounded-full border-4 border-white shadow-2xl animate-bounce group-hover:scale-110 transition-transform">{cartCount}</span>}
          </button>
        )}
      </header>
      <main className="pt-32 md:pt-48 flex-grow">
        {view === 'landing' && <LandingView onStart={() => setView('menu')} />}
        {view === 'menu' && (
          <MenuView 
            onAddToCart={addToCart} 
            onCheckout={() => setView('checkout')} 
            cartCount={cartCount} 
            cartTotal={cartTotal} 
            isOrderActive={isOrderActive}
            menuItems={menuItems}
          />
        )}
        {view === 'checkout' && (
          <CheckoutView 
            cart={cart} 
            updateCart={updateCart} 
            clearCart={clearCart} 
            onComplete={handlePlaceOrder} 
            onBack={() => setView('menu')} 
            isOrderActive={isOrderActive}
          />
        )}
        {view === 'tracking' && (
          <TrackingView 
            progress={progress} 
            setProgress={setProgress}
            onNewOrder={handleNewOrderStart}
          />
        )}
      </main>
      <footer className="py-16 border-t border-zinc-100 bg-white text-center">
        <p className="text-[11px] font-black uppercase tracking-[0.5em] text-zinc-300">© 2025 CyberWait Systems International</p>
      </footer>
      <div className="fixed inset-0 -z-10 bg-grid-pattern opacity-60 pointer-events-none"></div>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);