import React, { useState, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Plus, Minus, Trash2, ShoppingCart, User, CreditCard, Printer, Download, Save, X, CheckCircle2 } from 'lucide-react';
import api from '../../lib/api';
// @ts-ignore
import html2pdf from 'html2pdf.js';

// Types
interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: string;
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
  
  // Invoice Modal State
  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [savedSale, setSavedSale] = useState<any>(null);
  const invoiceRef = useRef<HTMLDivElement>(null);

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

  // Fetch Pharmacy Details
  const { data: pharmacy } = useQuery({
    queryKey: ['pharmacy'],
    queryFn: async () => {
      const res = await api.get('/pharmacy');
      return res.data;
    }
  });

  // Checkout Mutation
  const checkoutMutation = useMutation({
    mutationFn: async (payload: any) => {
      const res = await api.post('/pos/checkout', payload);
      return res.data;
    },
    onSuccess: (data) => {
      setSavedSale(data.sale);
      refetchProducts();
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
        if (existing.cartQuantity >= product.stock_quantity) return prev;
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
  const tax = 0;
  const total = subtotal + tax;

  const handleOpenInvoice = () => {
    if (cart.length === 0) return;
    setShowInvoiceModal(true);
    setSavedSale(null); // Reset previous sale status
  };

  const handleSaveSale = () => {
    if (cart.length === 0 || savedSale) return;
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

  const handlePrint = () => {
    const content = invoiceRef.current;
    if (!content) return;
    
    const printWindow = window.open('', '', 'width=800,height=800');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Invoice</title>
            <style>
              body { font-family: sans-serif; padding: 20px; color: #000; }
              .invoice-box { max-width: 800px; margin: auto; }
              table { w-full; width: 100%; text-align: left; border-collapse: collapse; margin-top: 20px; }
              th, td { padding: 10px; border-bottom: 1px solid #eee; }
              .text-right { text-align: right; }
              .text-center { text-align: center; }
              .header { text-align: center; margin-bottom: 30px; }
              .header h1 { margin: 0; font-size: 24px; }
              .header p { margin: 5px 0; color: #555; }
              .totals { margin-top: 20px; text-align: right; }
              .totals div { margin-bottom: 5px; }
              .totals strong { font-size: 18px; }
            </style>
          </head>
          <body>
            <div class="invoice-box">
              ${content.innerHTML}
            </div>
            <script>
              window.onload = function() { window.print(); window.close(); }
            </script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = () => {
    const element = invoiceRef.current;
    if (!element) return;
    
    const opt = {
      margin:       0.5,
      filename:     `Invoice_${savedSale?.receipt_no || 'DRAFT'}.pdf`,
      image:        { type: 'jpeg', quality: 0.98 },
      html2canvas:  { scale: 2 },
      jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };
    
    html2pdf().set(opt).from(element).save();
  };

  const handleCloseModal = () => {
    setShowInvoiceModal(false);
    if (savedSale) {
      setCart([]);
      setSelectedCustomerId(null);
      setSavedSale(null);
    }
  };

  return (
    <div className="absolute inset-0 flex flex-col lg:flex-row overflow-hidden bg-slate-50/50">
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

        <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-4">
              <ShoppingCart size={48} className="opacity-20" />
              <p>Cart is empty. Select products to begin.</p>
            </div>
          ) : (
            cart.map(item => (
              <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col gap-3 group relative overflow-hidden">
                <div className="flex justify-between items-start pr-8">
                  <div>
                    <h4 className="font-bold text-slate-900 leading-tight">{item.name}</h4>
                    <div className="text-slate-500 text-xs mt-1">RWF {parseFloat(item.price).toLocaleString()} each</div>
                  </div>
                  <div className="text-blue-600 font-bold">RWF {(parseFloat(item.price) * item.cartQuantity).toLocaleString()}</div>
                </div>
                
                <div className="flex items-center justify-between border-t border-slate-50 pt-3 mt-1">
                  <div className="flex items-center gap-1 bg-slate-100 rounded-lg p-1">
                    <button onClick={() => updateQuantity(item.id, -1)} className="w-7 h-7 flex items-center justify-center rounded bg-white shadow-sm text-slate-600 hover:text-blue-600 disabled:opacity-50 transition-colors" disabled={item.cartQuantity <= 1}>
                      <Minus size={14} />
                    </button>
                    <span className="font-bold text-sm w-8 text-center text-slate-700">{item.cartQuantity}</span>
                    <button onClick={() => updateQuantity(item.id, 1)} className="w-7 h-7 flex items-center justify-center rounded bg-white shadow-sm text-slate-600 hover:text-blue-600 disabled:opacity-50 transition-colors" disabled={item.cartQuantity >= item.stock_quantity}>
                      <Plus size={14} />
                    </button>
                  </div>
                  <div className="text-xs text-slate-400">{item.stock_quantity} left</div>
                </div>
                
                <button 
                  onClick={() => removeFromCart(item.id)} 
                  className="absolute top-3 right-3 text-slate-300 hover:text-red-500 transition-colors bg-white rounded-full p-1"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            ))
          )}
        </div>

        <div className="border-t border-slate-200 bg-white p-6 space-y-5">
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

          <button 
            onClick={handleOpenInvoice}
            disabled={cart.length === 0}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 hover:shadow-blue-700/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            Record Sales
          </button>
        </div>
      </div>

      {/* Invoice Modal Overlay */}
      {showInvoiceModal && (
        <div className="fixed inset-0 bg-slate-900/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh] shadow-2xl">
            
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">Invoice Preview</h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-2 bg-white rounded-full shadow-sm">
                <X size={20} />
              </button>
            </div>

            <div className="p-8 overflow-y-auto flex-1 bg-slate-100/50">
              {/* Invoice Printable Area */}
              <div ref={invoiceRef} className="bg-white p-10 shadow-sm border border-slate-200 rounded-xl">
                <div className="text-center mb-8 header">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{pharmacy?.name?.toUpperCase() || 'MEDIXA PHARMACY'}</h1>
                  <p className="text-sm text-slate-500 mt-1">TIN: {pharmacy?.tin || 'N/A'}</p>
                  <p className="text-sm text-slate-500">Location: {pharmacy?.location || 'N/A'}</p>
                  <p className="text-sm text-slate-500">Tel: {pharmacy?.phone || 'N/A'}</p>
                  {pharmacy?.email && <p className="text-sm text-slate-500">Email: {pharmacy.email}</p>}
                </div>

                <div className="flex justify-between items-end mb-6 pb-6 border-b border-slate-100">
                  <div>
                    <p className="text-sm font-semibold text-slate-700">Bill To:</p>
                    <p className="text-sm text-slate-600">{selectedCustomerId ? customers?.find((c:any) => c.id === selectedCustomerId)?.name : 'Walk-in Customer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-slate-500">Date: {new Date().toLocaleDateString()}</p>
                    <p className="text-sm font-semibold text-slate-700 mt-1">
                      Receipt No: {savedSale ? savedSale.receipt_no : <span className="text-orange-500 bg-orange-50 px-2 py-0.5 rounded">DRAFT</span>}
                    </p>
                  </div>
                </div>

                <table className="w-full text-left border-collapse text-sm mb-6">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 font-semibold w-1/2">Item Description</th>
                      <th className="py-3 font-semibold text-center w-16">Qty</th>
                      <th className="py-3 font-semibold text-right w-1/4">Price</th>
                      <th className="py-3 font-semibold text-right w-1/4">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item, i) => (
                      <tr key={i} className="border-b border-slate-100">
                        <td className="py-3 text-slate-800">{item.name}</td>
                        <td className="py-3 text-center text-slate-600">{item.cartQuantity}</td>
                        <td className="py-3 text-right text-slate-600">{parseFloat(item.price).toLocaleString()}</td>
                        <td className="py-3 text-right text-slate-800 font-medium">{(parseFloat(item.price) * item.cartQuantity).toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="flex justify-end totals">
                  <div className="w-64 space-y-2">
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Subtotal:</span>
                      <span>RWF {subtotal.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-sm text-slate-500">
                      <span>Tax (0%):</span>
                      <span>RWF 0</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-slate-900 border-t border-slate-200 pt-2 mt-2">
                      <span>Total:</span>
                      <span>RWF {total.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                
                <div className="mt-12 text-center border-t border-slate-100 pt-6">
                  <p className="text-sm text-slate-500 italic">Thank you for your business!</p>
                  <p className="text-xs text-slate-400 mt-1">Powered by Medixa Systems</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white border-t border-slate-100 flex flex-wrap gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <button 
                  onClick={handlePrint}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Printer size={18} /> Print
                </button>
                <button 
                  onClick={handleDownload}
                  className="px-5 py-2.5 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors flex items-center gap-2"
                >
                  <Download size={18} /> Download PDF
                </button>
              </div>

              {savedSale ? (
                <div className="flex items-center gap-2 text-green-600 font-semibold px-4 py-2 bg-green-50 rounded-xl">
                  <CheckCircle2 size={20} /> Sale Recorded Successfully
                </div>
              ) : (
                <button 
                  onClick={handleSaveSale}
                  disabled={checkoutMutation.isPending}
                  className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-600/30 hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {checkoutMutation.isPending ? <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div> : <Save size={20} />}
                  Confirm & Save Sale
                </button>
              )}
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}
