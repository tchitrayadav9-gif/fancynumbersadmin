import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Hash,
  CheckCircle2,
  Clock,
  BadgeDollarSign,
  TrendingUp,
  PlusCircle,
  ArrowRight,
  ShieldAlert,
  Sparkles,
  PhoneCall
} from 'lucide-react';
import api from '../api/client';

export default function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchStats = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-9 h-9 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-sm text-slate-500 font-medium">Fetching live statistics from MongoDB...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-rose-50 border border-rose-200 text-rose-700 p-4 rounded-xl flex items-center space-x-3">
        <ShieldAlert className="w-5 h-5 flex-shrink-0" />
        <p className="text-sm font-medium">{error}</p>
      </div>
    );
  }

  const { stats, recentNumbers, recentSales } = data;
  const isInventoryEmpty = stats.total === 0;

  return (
    <div className="space-y-8">
      {/* Page Title & Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Admin Dashboard</h1>
          <p className="text-sm text-slate-500 mt-1">Live metrics from your MongoDB Atlas inventory</p>
        </div>
        <Link
          to="/add-number"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-sm shadow-emerald-700/20 transition-colors"
        >
          <PlusCircle className="w-4 h-4" />
          <span>+ Add Phone Number</span>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Total Inventory */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Inventory</span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <Hash className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-slate-900">{stats.total}</div>
            <p className="text-xs text-slate-400 mt-1">Registered phone numbers</p>
          </div>
        </div>

        {/* Available Numbers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available</span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-emerald-600">{stats.available}</div>
            <p className="text-xs text-slate-400 mt-1">Ready for sale</p>
          </div>
        </div>

        {/* Reserved Numbers */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Reserved</span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-amber-600">{stats.reserved}</div>
            <p className="text-xs text-slate-400 mt-1">On hold for clients</p>
          </div>
        </div>

        {/* Sold Numbers & Revenue */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:border-slate-300 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sold / Revenue</span>
            <div className="w-9 h-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <BadgeDollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-extrabold text-purple-700">{stats.sold}</div>
            <p className="text-xs text-slate-500 font-medium mt-1">
              ₹{stats.totalRevenue.toLocaleString('en-IN')} total revenue
            </p>
          </div>
        </div>
      </div>

      {/* Empty State Banner when 0 numbers exist */}
      {isInventoryEmpty ? (
        <div className="bg-white border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center max-w-2xl mx-auto shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-4">
            <Sparkles className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Phone Number Inventory is Empty</h2>
          <p className="text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Your database is fresh with 0 initial records. Start adding your phone numbers with categories, VIP tags, and prices.
          </p>
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              to="/add-number"
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-semibold shadow-md shadow-emerald-700/20"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Add First Phone Number</span>
            </Link>
            <Link
              to="/numbers"
              className="px-4 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-sm font-medium"
            >
              Bulk Import via CSV
            </Link>
          </div>
        </div>
      ) : (
        /* Recent Lists */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Additions */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Recently Added Numbers</h2>
              <Link to="/numbers" className="text-xs text-emerald-600 font-semibold hover:underline flex items-center">
                View All <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            <div className="divide-y divide-slate-100">
              {recentNumbers.map((item) => (
                <div key={item._id} className="py-3 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
                      <PhoneCall className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 text-sm tracking-wide">{item.phoneNumber}</p>
                      <p className="text-xs text-slate-400">{item.category}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-sm">₹{item.price.toLocaleString('en-IN')}</p>
                    <span
                      className={`inline-block text-[10px] font-semibold px-2 py-0.5 rounded-full mt-0.5 ${
                        item.status === 'Available'
                          ? 'bg-emerald-50 text-emerald-700'
                          : item.status === 'Reserved'
                          ? 'bg-amber-50 text-amber-700'
                          : 'bg-purple-50 text-purple-700'
                      }`}
                    >
                      {item.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Sales */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold text-slate-900 tracking-wide uppercase">Recent Sales</h2>
              <Link to="/sales-history" className="text-xs text-purple-600 font-semibold hover:underline flex items-center">
                Sales History <ArrowRight className="w-3 h-3 ml-1" />
              </Link>
            </div>
            {recentSales.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">No sales completed yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentSales.map((item) => (
                  <div key={item._id} className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900 text-sm tracking-wide">{item.phoneNumber}</p>
                      <p className="text-xs text-slate-400">Sold: {new Date(item.soldAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-emerald-600 text-sm">
                        ₹{(item.finalSellingPrice || item.price).toLocaleString('en-IN')}
                      </p>
                      <span className="text-[10px] text-slate-400">Recorded</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
