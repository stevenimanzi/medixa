import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Package, Plus, Edit2, Trash2, X, Search, AlertCircle } from 'lucide-react';
import api from '../../lib/api';

interface Product {
  id: number;
  name: string;
  sku: string | null;
  price: string;
  stock_quantity: number;
}

export default function ProductsPage() {
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    sku: '',
    price: '',
    stock_quantity: ''
  });

  const { data: products, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const res = await api.get('/products');
      return res.data;
    }
  });

  const createMutation = useMutation({
    mutationFn: async (payload: typeof formData) => {
      const res = await api.post('/products', payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['posProducts'] }); // update POS cache too
      handleCloseModal();
    }
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: number, payload: typeof formData }) => {
      const res = await api.put(`/products/${id}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['posProducts'] });
      handleCloseModal();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await api.delete(`/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['posProducts'] });
    }
  });

  const handleOpenModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        sku: product.sku || '',
        price: product.price.toString(),
        stock_quantity: product.stock_quantity.toString()
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', sku: '', price: '', stock_quantity: '' });
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct.id, payload: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const filteredProducts = products?.filter((p: Product) => 
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    (p.sku && p.sku.toLowerCase().includes(searchQuery.toLowerCase()))
  ) || [];

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Package className="text-blue-600" /> Products & Stock
          </h1>
          <p className="text-sm text-slate-500 mt-1">Manage your inventory, pricing, and stock levels.</p>
        </div>
        <button 
          onClick={() => handleOpenModal()}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-5 rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center gap-2 shrink-0"
        >
          <Plus size={18} /> Add New Product
        </button>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[calc(100vh-220px)]">
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row gap-4 justify-between items-center">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search by name or SKU..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-sm outline-none"
            />
          </div>
          <div className="text-sm text-slate-500 font-medium">
            Total Products: {products?.length || 0}
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Product Name</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">SKU</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Price (RWF)</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200">Stock Level</th>
                <th className="py-4 px-6 text-xs font-semibold text-slate-500 uppercase tracking-wider border-b border-slate-200 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((product: Product) => (
                <tr key={product.id} className="hover:bg-slate-50/80 transition-colors group">
                  <td className="py-4 px-6">
                    <div className="font-semibold text-slate-900">{product.name}</div>
                  </td>
                  <td className="py-4 px-6 text-slate-500 text-sm">
                    {product.sku || '-'}
                  </td>
                  <td className="py-4 px-6 font-medium text-slate-900">
                    {parseFloat(product.price).toLocaleString()}
                  </td>
                  <td className="py-4 px-6">
                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold
                      ${product.stock_quantity > 20 ? 'bg-green-100 text-green-700' : 
                        product.stock_quantity > 0 ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}
                    >
                      {product.stock_quantity <= 20 && <AlertCircle size={14} />}
                      {product.stock_quantity} in stock
                    </div>
                  </td>
                  <td className="py-4 px-6 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleOpenModal(product)}
                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Edit Product"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(product.id)}
                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              
              {filteredProducts.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500">
                    <Package size={48} className="mx-auto mb-3 text-slate-300" />
                    <p className="font-medium text-slate-600">No products found</p>
                    <p className="text-sm mt-1">Try adjusting your search or add a new product.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h2>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 p-1">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="p-6 space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Product Name <span className="text-red-500">*</span></label>
                  <input 
                    type="text" 
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. Paracetamol 500mg"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">SKU (Stock Keeping Unit)</label>
                  <input 
                    type="text" 
                    value={formData.sku}
                    onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                    placeholder="e.g. PR-500"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Price (RWF) <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      min="0"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({...formData, price: e.target.value})}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Stock Quantity <span className="text-red-500">*</span></label>
                    <input 
                      type="number" 
                      min="0"
                      value={formData.stock_quantity}
                      onChange={(e) => setFormData({...formData, stock_quantity: e.target.value})}
                      required
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                      placeholder="0"
                    />
                  </div>
                </div>
              </div>
              
              <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={handleCloseModal}
                  className="px-5 py-2.5 text-sm font-medium text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 rounded-xl hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all disabled:opacity-70 flex items-center gap-2"
                >
                  {(createMutation.isPending || updateMutation.isPending) && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
                  {editingProduct ? 'Update Product' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
