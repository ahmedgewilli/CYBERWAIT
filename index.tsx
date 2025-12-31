import React, { useState, useEffect, useMemo, useRef } from 'react';
import ReactDOM from 'react-dom/client';

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
      {mood === 2 && <path d="M19 8C19 8.5 18.5 9.5 18 10C17.5 9.5 17 8.5 17 8C17 7.5 18 7.5 18 7.5C18 7.5 19 7.5 19 8Z" fill="#38bdf8" />}
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

const NavIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polygon points="3 11 22 2 13 21 11 13 3 11"/></svg>
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

const MenuView = ({ onAddToCart, onCheckout, cartCount, cartTotal }: any) => {
  const [activeCategory, setActiveCategory] = useState('All Items');
  
  const filteredItems = useMemo(() => {
    if (activeCategory === 'All Items') return MENU_ITEMS;
    return MENU_ITEMS.filter(item => item.category === activeCategory);
  }, [activeCategory]);

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
              <button 
                onClick={() => onAddToCart(item)}
                className="w-full py-5 bg-zinc-50 border border-zinc-200 hover:bg-[#2D7D90] hover:text-white hover:border-[#2D7D90] text-zinc-900 font-black uppercase text-[11px] tracking-[0.2em] rounded-[2rem] transition-all flex items-center justify-center gap-3 active:scale-95 shadow-sm"
              >
                <CartIcon /> Add to Cart
              </button>
            </div>
          </Card>
        ))}
      </div>

      {cartCount > 0 && (
        <div className="fixed bottom-10 left-0 right-0 px-6 z-[120] animate-slide-up flex justify-center pointer-events-none">
          <button 
            onClick={onCheckout}
            className="w-full max-w-xl py-6 bg-zinc-900 text-white rounded-full shadow-[0_30px_70px_rgba(0,0,0,0.5)] flex items-center justify-between px-12 hover:scale-[1.03] transition-transform active:scale-95 border border-zinc-800 pointer-events-auto ring-4 ring-white/10"
          >
            <div className="flex items-center gap-5">
              <div className="bg-[#2D7D90] text-white w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black ring-4 ring-white/10">{cartCount}</div>
              <span className="font-black uppercase tracking-tighter text-sm">Review Cart & Pay</span>
            </div>
            <span className="font-black text-2xl tracking-tighter">${cartTotal.toFixed(2)}</span>
          </button>
        </div>
      )}
    </div>
  );
};

const CheckoutView = ({ cart, updateCart, onComplete, onBack, onAddToCart }: any) => {
  const [paymentMethod, setPaymentMethod] = useState<'visa' | 'apple' | 'cash'>('visa');
  const cartTotal = useMemo(() => cart.reduce((acc: number, curr: CartItem) => acc + (curr.item.price * curr.quantity), 0), [cart]);

  return (
    <div className="max-w-3xl mx-auto px-6 py-12 animate-slide-up pb-40">
      <button onClick={onBack} className="mb-12 text-zinc-400 hover:text-zinc-900 flex items-center gap-3 text-xs font-black uppercase tracking-[0.3em] transition-all group">
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
        <div className="grid grid-cols-1 gap-10">
          <Card className="ring-1 ring-zinc-100">
            <h2 className="text-3xl font-black mb-10 tracking-tighter italic text-zinc-900 uppercase tracking-widest leading-none">Your Basket</h2>
            <div className="space-y-6 max-h-[500px] overflow-y-auto pr-4 no-scrollbar">
              {cart.map((cartItem: CartItem) => (
                <div key={cartItem.item.id} className="flex items-center justify-between py-6 border-b border-zinc-50 last:border-0 hover:bg-zinc-50/40 rounded-[2.5rem] transition-colors px-4">
                  <div className="flex items-center gap-6">
                    <img src={cartItem.item.image} className="w-24 h-24 rounded-[2rem] object-cover border-2 border-white shadow-md ring-1 ring-zinc-100" alt={cartItem.item.name} />
                    <div>
                      <h4 className="font-black text-xl text-zinc-900 leading-tight mb-2 italic uppercase tracking-tight">{cartItem.item.name}</h4>
                      <p className="text-[10px] text-zinc-400 font-black uppercase tracking-[0.2em] bg-zinc-100 inline-block px-3 py-1 rounded-full border border-zinc-200">${cartItem.item.price.toFixed(2)} each</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-6 bg-white rounded-full px-6 py-3 border border-zinc-200 shadow-sm ring-1 ring-zinc-900/5">
                    <button onClick={() => updateCart(cartItem.item.id, -1)} className="text-zinc-400 hover:text-zinc-900 font-black text-xl p-1 transition-colors">-</button>
                    <span className="font-black text-lg w-6 text-center text-zinc-900">{cartItem.quantity}</span>
                    <button onClick={() => updateCart(cartItem.item.id, 1)} className="text-zinc-400 hover:text-zinc-900 font-black text-xl p-1 transition-colors">+</button>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="ring-1 ring-zinc-100">
            <h2 className="text-3xl font-black mb-10 tracking-tighter italic text-zinc-900 uppercase">Payment Method</h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <button onClick={() => setPaymentMethod('visa')} className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-4 transition-all ${paymentMethod === 'visa' ? 'border-[#2D7D90] bg-[#e6f4f7] text-[#2D7D90] shadow-xl scale-105' : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}>
                <div className="font-black text-[10px] tracking-widest">VISA / CC</div><span className="text-sm font-bold">Secure Card</span>
              </button>
              <button onClick={() => setPaymentMethod('apple')} className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-4 transition-all ${paymentMethod === 'apple' ? 'border-[#2D7D90] bg-[#e6f4f7] text-[#2D7D90] shadow-xl scale-105' : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}>
                <ApplePayIcon /><span className="text-sm font-bold">Apple Pay</span>
              </button>
              <button onClick={() => setPaymentMethod('cash')} className={`flex flex-col items-center gap-4 p-8 rounded-[2.5rem] border-4 transition-all ${paymentMethod === 'cash' ? 'border-[#2D7D90] bg-[#e6f4f7] text-[#2D7D90] shadow-xl scale-105' : 'border-zinc-100 bg-zinc-50 text-zinc-400 hover:border-zinc-200'}`}>
                <CashIcon /><span className="text-sm font-bold">Cash at Counter</span>
              </button>
            </div>
            {paymentMethod === 'visa' && (
              <div className="mt-10 bg-[#f4f7f8] p-8 rounded-[3rem] border border-zinc-200 animate-fade-in shadow-inner">
                <div className="space-y-6">
                  <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                    <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-2">Card Number</span>
                    <input readOnly value="4242 4242 4242 4242" className="bg-transparent w-full outline-none font-mono tracking-widest text-zinc-800 text-xl" />
                  </div>
                  <div className="grid grid-cols-2 gap-6">
                    <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                      <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-2">Expiry</span>
                      <input readOnly value="12 / 28" className="bg-transparent w-full outline-none font-mono text-zinc-800 text-lg" />
                    </div>
                    <div className="bg-white border border-zinc-200 p-6 rounded-2xl shadow-sm">
                      <span className="text-[10px] uppercase font-black tracking-widest text-zinc-400 block mb-2">CVC</span>
                      <input readOnly value="***" className="bg-transparent w-full outline-none font-mono text-zinc-800 text-lg" />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </Card>

          <Card className="bg-white border border-zinc-200 text-zinc-900 shadow-3xl">
            <div className="space-y-6">
              <div className="flex justify-between text-zinc-500 text-sm font-bold uppercase tracking-widest"><span>Order Total</span><span className="text-zinc-900">${cartTotal.toFixed(2)}</span></div>
              <div className="flex justify-between text-zinc-500 text-sm font-bold uppercase tracking-widest"><span>Automated Delivery</span><span className="text-emerald-600">Free</span></div>
              <div className="flex justify-between items-center pt-8 border-t border-zinc-100"><span className="text-2xl font-black italic uppercase text-zinc-900">Pay Now</span><span className="text-5xl font-black text-zinc-900 tracking-tighter">${cartTotal.toFixed(2)}</span></div>
            </div>
            <button onClick={onComplete} className="w-full mt-12 py-7 bg-zinc-900 text-white font-black uppercase text-xs tracking-[0.4em] rounded-[2.5rem] transition-all shadow-2xl hover:scale-[1.02] active:scale-95">
              Pay & Confirm
            </button>
          </Card>
        </div>
      )}
    </div>
  );
};

const TrackingView = () => {
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const startPos = useRef({ x: 0, y: 0 });
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setProgress(prev => (prev < 4 ? prev + 1 : prev));
    }, 4500);
    return () => clearInterval(timer);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsPanning(true);
    startPos.current = { x: e.clientX - offset.x, y: e.clientY - offset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;
    setOffset({ x: e.clientX - startPos.current.x, y: e.clientY - startPos.current.y });
  };

  const handleMouseUp = () => setIsPanning(false);

  const robotMood = useMemo(() => {
    if (progress === 0) return { msg: "Chef is busy, I'm waiting for your food! 👨‍🍳", color: "text-zinc-500" };
    if (progress === 1) return { msg: "Getting everything ready for you! ✨", color: "text-emerald-600" };
    if (progress === 2) return { msg: "The tray is being loaded, almost there! 🍽️", color: "text-amber-600" };
    if (progress === 3) return { msg: "I'm on my way to your table! 🤖💨", color: "text-[#2D7D90]" };
    return { msg: "yay!! food arrived have a good meal! 😋", color: "text-emerald-500" };
  }, [progress]);

  // Table coordinates (percentage based as per layout)
  // Table 6 is at (row 2, col 1) -> 82% top, 60% left
  const table6Top = 0.82 * 1200;
  const table6Left = 0.60 * 1400;

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 animate-fade-in pb-20">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2">
          {/* Friendly Tracking Map */}
          <Card className="h-[650px] md:h-[850px] relative p-0 overflow-hidden border-zinc-200 shadow-3xl cursor-grab active:cursor-grabbing bg-zinc-50"
            onMouseDown={handleMouseDown} onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
             
             <div className="absolute inset-0 opacity-20 pointer-events-none overflow-hidden">
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[250%] h-[250%] bg-[radial-gradient(circle,rgba(45,125,144,0.1)_0%,transparent_75%)] animate-pulse"></div>
               <div className="w-full h-full bg-[linear-gradient(rgba(0,0,0,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(0,0,0,0.02)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
             </div>

             <div className="absolute inset-0 p-6 md:p-12 transition-transform duration-100 ease-out" style={{ transform: `translate(${offset.x}px, ${offset.y}px)` }}>
                <div className="w-[1400px] h-[1200px] border-[6px] border-zinc-100 rounded-[5rem] relative bg-white shadow-2xl overflow-hidden">
                   
                   <div className="absolute inset-0 opacity-[0.03] bg-[url('https://www.transparenttextures.com/patterns/pinstriped-suit.png')]"></div>

                   {/* Entrance */}
                   <div className="absolute top-0 right-0 w-[450px] h-[250px] border-l-4 border-b-4 border-zinc-50 bg-zinc-50/20"></div>

                   {/* Kitchen Area */}
                   <div className="absolute top-0 left-0 w-[400px] h-[350px] bg-zinc-50 border-r-4 border-b-4 border-zinc-100 p-10 flex flex-col">
                      <span className="text-[14px] font-black uppercase tracking-[0.5em] text-zinc-900 mb-10 border-b-2 border-zinc-100 pb-2">KITCHEN</span>
                      <div className="grid grid-cols-3 gap-6">
                        {[1,2,3,4,5,6].map(i => <div key={i} className="h-12 bg-white border-2 border-zinc-100 rounded-xl flex items-center justify-center text-[8px] font-black text-zinc-200">BAY_{i}</div>)}
                      </div>
                   </div>

                   {/* Table Layout */}
                   {[1, 2, 3, 4, 5, 6].map((tbl) => {
                     const isTarget = tbl === 6;
                     return (
                      <div key={tbl} className={`absolute w-28 h-28 rounded-full border-4 flex flex-col items-center justify-center font-black text-xs transition-all ${isTarget ? 'border-[#2D7D90] bg-[#e6f4f7] text-[#2D7D90] shadow-xl scale-110 z-10' : 'border-zinc-100 bg-zinc-50/20 text-zinc-200'}`} style={{ 
                        top: `${Math.floor((tbl-1)/2) * 22 + 38}%`, left: `${((tbl-1)%2) * 22 + 38}%` 
                      }}>
                        <span className="text-[11px] opacity-40 mb-1 tracking-tighter uppercase">TABLE</span>
                        <span className="text-lg">#{tbl}</span>
                        {isTarget && <div className="absolute -top-16 animate-bounce text-[#2D7D90] text-4xl">📍</div>}
                      </div>
                    )})}

                   {/* Path Graphic - Fixed to terminate at Table 6 */}
                   <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-20">
                     <path d={`M 200,175 Q 300,700 ${table6Left + 56},${table6Top + 56}`} stroke="#2D7D90" strokeWidth="12" strokeDasharray="20 20" fill="none" strokeLinecap="round" />
                   </svg>
                   
                   {/* Main Robot Unit - Aligned movement */}
                   <div className="absolute w-20 h-20 md:w-32 md:h-32 bg-[#2D7D90] text-white rounded-[3rem] md:rounded-[4.5rem] shadow-2xl flex items-center justify-center animate-bounce transition-all duration-1000 z-[100] border-[6px] border-white" 
                    style={{ 
                        top: progress < 3 ? '175px' : progress === 3 ? '550px' : `${table6Top - 8}px`, 
                        left: progress < 3 ? '200px' : progress === 3 ? '450px' : `${table6Left - 8}px` 
                    }}>
                     <CyberWaitLogo className="w-12 h-12 md:w-20 md:h-20 text-white" />
                   </div>
                </div>
             </div>

             {/* Friendly HUD Label */}
             <div className="absolute top-10 left-10 flex flex-col gap-6 pointer-events-none">
                <div className="bg-white/95 backdrop-blur-3xl px-6 py-3 rounded-2xl border border-zinc-100 text-[11px] font-black text-[#2D7D90] uppercase tracking-[0.3em] flex items-center gap-4 shadow-xl">
                  <div className="w-3 h-3 rounded-full bg-[#2D7D90] animate-pulse ring-4 ring-[#2D7D90]/20"></div> SCANNING ACTIVE
                </div>
             </div>

             {/* Softened Progress Indicator */}
             <div className="absolute bottom-10 left-10 right-10 flex justify-center pointer-events-none">
                <div className="bg-white/95 backdrop-blur-3xl px-12 py-8 rounded-full border border-zinc-100 shadow-2xl flex items-center gap-10">
                   <div className="flex flex-col">
                      <h4 className="font-black text-2xl uppercase tracking-tighter text-zinc-900 leading-none mb-1 italic">
                        {progress === 4 ? "ORDER DELIVERED" : "ROBOT ON THE WAY"}
                      </h4>
                      <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">Table #06 • Zone B</p>
                   </div>
                   <div className="w-48 bg-zinc-100 h-3 rounded-full overflow-hidden border border-zinc-200">
                      <div className="bg-[#2D7D90] h-full transition-all duration-1000" style={{ width: `${(progress / 4) * 100}%` }}></div>
                   </div>
                </div>
             </div>
          </Card>
        </div>
        
        <div className="space-y-8">
          <Card className="bg-white border-zinc-100 shadow-xl">
            <h3 className="text-[12px] font-black mb-12 tracking-[0.3em] uppercase text-zinc-400 italic">SERVICE LOG</h3>
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
          
          <Card className="bg-white border-zinc-100 shadow-xl">
             <div className="flex justify-between items-center mb-10">
               <h4 className="text-[11px] font-black uppercase tracking-[0.3em] text-[#2D7D90]">ROBOT MOOD</h4>
               <div className="text-[10px] font-black text-zinc-300 uppercase tracking-widest italic">Live</div>
             </div>
             <div className="bg-[#f4f7f8] p-10 rounded-[3rem] border border-zinc-100 flex flex-col items-center text-center shadow-inner">
                <div className="mb-8 animate-bounce text-[#2D7D90]"><CuteRobotIcon className="w-24 h-24" mood={progress > 3 ? 3 : progress} /></div>
                <p className={`text-lg font-black uppercase tracking-tight leading-tight italic ${robotMood.color}`}>{robotMood.msg}</p>
             </div>
             <div className="mt-10 pt-10 border-t border-zinc-100 flex justify-between items-center">
                <div className="text-[10px] font-black text-zinc-400 tracking-[0.3em]">POWER BANK</div>
                <div className="flex gap-2">
                   {[1,2,3,4,5,6].map(b => <div key={b} className={`w-4 h-2 rounded-sm ${b < 6 ? 'bg-emerald-500' : 'bg-zinc-200'}`}></div>)}
                </div>
             </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

// --- Main App ---
function App() {
  const [view, setView] = useState<'landing' | 'menu' | 'checkout' | 'tracking'>('landing');
  const [cart, setCart] = useState<CartItem[]>([]);

  const addToCart = (item: MenuItem) => {
    setCart(prev => {
      const existing = prev.find(ci => ci.item.id === item.id);
      if (existing) return prev.map(ci => ci.item.id === item.id ? { ...ci, quantity: ci.quantity + 1 } : ci);
      return [...prev, { item, quantity: 1 }];
    });
  };

  const updateCart = (itemId: number, delta: number) => {
    setCart(prev => prev.map(ci => ci.item.id === itemId ? { ...ci, quantity: Math.max(0, ci.quantity + delta) } : ci).filter(ci => ci.quantity > 0));
  };
  
  const cartTotal = useMemo(() => cart.reduce((acc, curr) => acc + (curr.item.price * curr.quantity), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((acc, curr) => acc + curr.quantity, 0), [cart]);

  useEffect(() => { window.scrollTo({ top: 0, behavior: 'smooth' }); }, [view]);

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col overflow-y-auto">
      <header className="fixed top-0 inset-x-0 h-24 md:h-28 bg-white/90 backdrop-blur-3xl border-b border-zinc-100 z-[110] px-6 md:px-16 flex items-center justify-between shadow-sm">
        <div onClick={() => setView('landing')} className="flex items-center gap-4 md:gap-7 cursor-pointer group">
          <div className="w-12 h-12 md:w-16 md:h-16 bg-[#2D7D90] rounded-[1.5rem] flex items-center justify-center text-white shadow-2xl group-hover:rotate-12 transition-transform duration-500 ring-4 ring-[#2D7D90]/5">
            <CyberWaitLogo className="w-8 h-8 md:w-10 md:h-10 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-2xl md:text-3xl tracking-tighter uppercase italic leading-none text-zinc-900">CyberWait™</span>
            <span className="text-[10px] md:text-[11px] font-black text-[#2D7D90] tracking-[0.4em] uppercase mt-2">Smart Restaurant</span>
          </div>
        </div>
        {view !== 'landing' && (
          <button onClick={() => setView(view === 'checkout' ? 'menu' : 'checkout')} className="relative p-4 md:p-5 bg-white border-2 border-zinc-100 rounded-[1.8rem] hover:border-[#2D7D90] transition-all shadow-md active:scale-90 group">
            <CartIcon />
            {cartCount > 0 && <span className="absolute -top-3 -right-3 bg-[#2D7D90] text-white text-[10px] font-black w-8 h-8 flex items-center justify-center rounded-full border-4 border-white shadow-2xl animate-bounce group-hover:scale-110 transition-transform">{cartCount}</span>}
          </button>
        )}
      </header>
      <main className="pt-32 md:pt-48 flex-grow">
        {view === 'landing' && <LandingView onStart={() => setView('menu')} />}
        {view === 'menu' && <MenuView onAddToCart={addToCart} onCheckout={() => setView('checkout')} cartCount={cartCount} cartTotal={cartTotal} />}
        {view === 'checkout' && <CheckoutView cart={cart} updateCart={updateCart} onComplete={() => setView('tracking')} onBack={() => setView('menu')} onAddToCart={addToCart} />}
        {view === 'tracking' && <TrackingView />}
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