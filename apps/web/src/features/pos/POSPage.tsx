import React, { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard } from 'lucide-react';
import api from '../../lib/api';

// Types
interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: string; // comes as string from decimal
  stock_quantity: number;
}

interface CartItem extends Product {
  cartQuantity: number;
}

export default function POSPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<number | null>(null);
  const [paymentMethod, setPaymentMethod] = useState('Cash');

  // Fetch Products
  const { data: products, isLoading: loadingProducts, refetch: refetchProducts } = useQuery({
    queryKey: ['posProducts'],
    queryFn: async () => {
      const res = await api.get('/pos/products');
      return res.data as Product[];
    }
  });

  // Fetch Customers
  const { data: customers } = useQuery({
    queryKey: ['posCustomers'],
    queryFn: async () => {
      const res = await api.get('/pos/customers');
      return res.data;
    }
  });

  // Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/pos/checkout', payload);
      return res.data;
    },
    onSuccess: () => {
      alert('Sale completed successfully!');
      setCart([]);
      setSelectedCustomerId(null);
      refetchProducts(); // update stock numbers
    },
    onError: (error) => {
      alert('Checkout failed. Please try again.');
      console.error(error);
    }
  });

  // Cart Functions
  const addToCart = (product: Product) => {
    setCart((prev) => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (existing.cartQuantity >= product.stock_quantity) return prev; // check stock
        return prev.map(item => item.id === product.id ? { ...item, cartQuantity: item.cartQuantity + 1 } : item);
      }
      return [...prev, { ...product, cartQuantity: 1 }];
    });
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart((prev) => prev.map(item => {
      if (item.id === id) {
        const newQty = item.cartQuantity + delta;
        if (newQty < 1 || newQty > item.stock_quantity) return item;
        return { ...item, cartQuantity: newQty };
      }
      return item;
    }));
  };

  const removeFromCart = (id: number) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  const filteredProducts = products?.filter(p => p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.sku?.toLowerCase().includes(searchQuery.toLowerCase())) || [];

  const subtotal = cart.reduce((sum, item) => sum + (parseFloat(item.price) * item.cartQuantity), 0);
  const tax = 0; // Assuming tax is inclusive or 0 for now
  const total = subtotal + tax;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    
    const payload = {
      items: cart.map(item => ({
        product_id: item.id,
        quantity: item.cartQuantity,
        unit_price: parseFloat(item.price)
      })),
      payment_method: paymentMethod,
      customer_id: selectedCustomerId
    };

    checkoutMutation.mutate(payload);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full overflow-hidden bg-slate-50/50 -m-8">
      {/* Left Column: Products */}
      <div className="flex-1 flex flex-col h-full border-r border-slate-200">
        <div className="p-6 border-b border-slate-200 bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search products by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-100 border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all text-sm"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {loadingProducts ? (
            <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div></div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4">
              {filteredProducts.map(product => (
                <div 
                  key={product.id} 
                  onClick={() => addToCart(product)}
                  className="bg-white border border-slate-200 rounded-2xl p-4 cursor-pointer hover:border-blue-500 hover:shadow-md transition-all flex flex-col h-32 justify-between group"
                >
                  <div>
                    <h3 className="font-semibold text-slate-900 line-clamp-2 leading-tight group-hover:text-blue-600">{product.name}</h3>
                    <div className="text-xs text-slate-400 mt-1">{product.stock_quantity} in stock</div>
                  </div>
                  <div className="text-sm font-bold text-slate-900 mt-2">RWF {parseFloat(product.price).toLocaleString()}</div>
                </div>
              ))}
              {filteredProducts.length === 0 && (
                <div className="col-span-full text-center text-slate-500 py-12">No products found.</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Cart */}
      <div className="w-full lg:w-[400px] flex flex-col bg-white h-full shadow-[-4px_0_15px_-3px_rgba(0,0,0,0.05)] z-10 relative">
        <div className="p-6 border-b border-slate-200 flex items-center gap-3 bg-white">
          <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center">
            <ShoppingCart size={20} />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Current Order</h2>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Cart is empty. Select products to begin.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm flex items-center justify-between">
                <div className="flex-1 min-w-0 pr-4">
                  <h4 className="font-semibold text-slate-900 truncate text-sm">{item.name}</h4>
                  <div className="text-blue-600 font-medium text-sm mt-1">RWF {(parseFloat(item.price) * item.cartQuantity).toLocaleString()}</div>
                </div>
                
                <div className="flex items-center gap-3 bg-slate-50 rounded-lg p-1 border border-slate-100">
                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-slate-500 hover:text-slate-900 disabled:opacity-50" disabled={item.cartQuantity <= 1}>
                    <Minus size={14} />
                  </button>
                  <span className="font-semibold text-sm w-4 text-center">{item.cartQuantity}</span>
                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-8 flex items-center justify-center rounded-md bg-white shadow-sm text-slate-500 hover:text-slate-900 disabled:opacity-50" disabled={item.cartQuantity >= item.stock_quantity}>
                    <Plus size={14} />
                  </button>
                </div>
                
                <button onClick={() => removeFromCart(item.id)} className="ml-3 text-slate-300 hover:text-red-500 transition-colors p-2">
                  <Trash2 size={18} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 bg-white p-6 space-y-5">
          {/* Settings */}
          <div className="grid grid-cols-2 gap-4">
            <div>
               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><User size={12}/> Customer</label>
               <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedCustomerId || ''}
                  onChange={(e) => setSelectedCustomerId(e.target.value ? Number(e.target.value) : null)}
               >
                 <option value="">Walk-in Customer</option>
                 {customers?.map((c: any) => (
                   <option key={c.id} value={c.id}>{c.name}</option>
                 ))}
               </select>
            </div>
            <div>
               <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2 flex items-center gap-1"><CreditCard size={12}/> Payment</label>
               <select 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-sm focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
               >
                 <option value="Cash">Cash</option>
                 <option value="Card">Card</option>
                 <option value="Mobile Money">Mobile Money</option>
               </select>
            </div>
          </div>

          {/* Totals */}
          <div className="space-y-2 pt-2 border-t border-slate-100">
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Subtotal</span>
              <span>RWF {subtotal.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-slate-500 text-sm">
              <span>Tax (0%)</span>
              <span>RWF 0</span>
            </div>
            <div className="flex justify-between text-slate-900 font-bold text-xl pt-2">
              <span>Total</span>
              <span>RWF {total.toLocaleString()}</span>
            </div>
          </div>

          {/* Action */}
          <button 
            onClick={handleCheckout}
            disabled={cart.length === 0 || checkoutMutation.isPending}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-700/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {checkoutMutation.isPending ? (
               <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            ) : (
               <>Process Payment</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
