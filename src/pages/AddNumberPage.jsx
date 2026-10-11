import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusCircle, ArrowLeft, Check, AlertCircle, Sparkles } from 'lucide-react';
import api from '../api/client';

const CATEGORIES = ['Regular', 'Premium', 'VIP', 'Fancy'];
const PATTERN_TAGS = ['Repeated Digits', 'Sequential Digits', 'Same Ending', 'Special Pattern', 'Custom'];

export default function AddNumberPage() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    phoneNumber: '',
    simName: 'Primary SIM',
    simType: 'Jio',
    price: '',
    category: 'Regular',
    description: '',
    tags: [],
    isFeatured: false,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleTagToggle = (tag) => {
    setFormData((prev) => {
      const exists = prev.tags.includes(tag);
      return {
        ...prev,
        tags: exists ? prev.tags.filter((t) => t !== tag) : [...prev.tags, tag],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const res = await api.post('/admin/numbers', {
        ...formData,
        price: Number(formData.price),
      });

      if (res.data.success) {
        setSuccess(`Phone number ${res.data.data.phoneNumber} added to inventory!`);
        setTimeout(() => {
          navigate('/numbers');
        }, 1200);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add phone number.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Add New Phone Number</h1>
          <p className="text-sm text-slate-500">Configure phone number details, category, and selling price</p>
        </div>
      </div>

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 shadow-sm">
        {error && (
          <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start space-x-3 text-rose-700 text-sm">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start space-x-3 text-emerald-700 text-sm">
            <Check className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Phone Number Input */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Phone Number <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              placeholder="e.g. 9888888888 or +91 99999 00000"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              className="w-full px-4 py-3 border border-slate-300 rounded-lg text-slate-900 font-mono text-base focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
            <p className="text-xs text-slate-400 mt-1.5">
              Saved as string to preserve leading zeros. Duplicate numbers are automatically prevented.
            </p>
          </div>

          {/* SIM Name & SIM Type / Provider */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                SIM Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Primary SIM, Business SIM"
                value={formData.simName}
                onChange={(e) => setFormData({ ...formData, simName: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                SIM Type / Network Provider <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.simType}
                onChange={(e) => setFormData({ ...formData, simType: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                <option value="Jio">Jio</option>
                <option value="Airtel">Airtel</option>
                <option value="Vi">Vi</option>
                <option value="BSNL">BSNL</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {/* Selling Price */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Selling Price (₹) <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 font-bold">
                  ₹
                </span>
                <input
                  type="number"
                  min="0"
                  step="any"
                  required
                  placeholder="25000"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  className="w-full pl-8 pr-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
                Category <span className="text-rose-500">*</span>
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Pattern Tags */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Pattern Tags (Optional)
            </label>
            <div className="flex flex-wrap gap-2">
              {PATTERN_TAGS.map((tag) => {
                const isSelected = formData.tags.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => handleTagToggle(tag)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-emerald-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
              Description / Notes (Optional)
            </label>
            <textarea
              rows="3"
              placeholder="e.g. Rare 7-digit repeated VIP number with clean history"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-slate-900 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            ></textarea>
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center space-x-3 p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500 cursor-pointer"
            />
            <label htmlFor="isFeatured" className="text-sm font-medium text-slate-700 cursor-pointer flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Mark as Featured Number (Highlight on customer website)</span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="px-5 py-2.5 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-sm font-semibold shadow-md shadow-emerald-700/20 transition-all flex items-center space-x-2"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <PlusCircle className="w-4 h-4" />
                  <span>Save Phone Number</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
