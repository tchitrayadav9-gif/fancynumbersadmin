import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  Search,
  ChevronLeft,
  ChevronRight,
  Download,
  Calendar,
  IndianRupee,
  PhoneCall
} from 'lucide-react';
import api from '../api/client';

export default function SalesHistoryPage() {
  const [sales, setSales] = useState([]);
  const [summary, setSummary] = useState({ totalRevenue: 0, averagePrice: 0, count: 0 });
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const fetchSales = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 12,
        search,
      };
      if (categoryFilter) params.category = categoryFilter;

      const res = await api.get('/admin/sales', { params });
      if (res.data.success) {
        setSales(res.data.data);
        setSummary(res.data.summary);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSales();
  }, [page, categoryFilter]);

  const handleSearch = (e) => {
    e.preventDefault();
    setPage(1);
    fetchSales();
  };

  const exportSalesCsv = () => {
    if (sales.length === 0) {
      alert('No sales to export');
      return;
    }

    const header = 'phoneNumber,category,originalPrice,finalSellingPrice,soldAt,customerNotes\n';
    const rows = sales
      .map(
        (s) =>
          `"${s.phoneNumber}","${s.category}",${s.price},${s.finalSellingPrice || s.price},"${s.soldAt}","${(s.customerNotes || '').replace(/"/g, '""')}"`
      )
      .join('\n');

    const blob = new Blob([header + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `sales_report_${Date.now()}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Sales History</h1>
          <p className="text-sm text-slate-500 mt-1">Audit log and financial revenue from sold phone numbers</p>
        </div>
        <button
          onClick={exportSalesCsv}
          className="px-4 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Sales CSV</span>
        </button>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Numbers Sold</span>
          <div className="text-2xl font-extrabold text-slate-900 mt-2">{summary.count}</div>
          <p className="text-xs text-slate-400 mt-1">Completed transactions</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Sales Revenue</span>
          <div className="text-2xl font-extrabold text-purple-700 mt-2">
            ₹{summary.totalRevenue.toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-1">Gross lifetime sales</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Average Selling Price</span>
          <div className="text-2xl font-extrabold text-emerald-600 mt-2">
            ₹{Math.round(summary.averagePrice || 0).toLocaleString('en-IN')}
          </div>
          <p className="text-xs text-slate-400 mt-1">Per sold phone number</p>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearch} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search sold numbers or buyer notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500 w-full md:w-auto"
        >
          <option value="">All Categories</option>
          <option value="Regular">Regular</option>
          <option value="Premium">Premium</option>
          <option value="VIP">VIP</option>
          <option value="Fancy">Fancy</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 mt-2">Loading sales records...</p>
          </div>
        ) : sales.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <TrendingUp className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No sales history yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              When numbers are marked as Sold from the inventory table, they will appear here along with their final selling prices and sale dates.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Sold Phone Number</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Listed Price</th>
                  <th className="py-3.5 px-4">Final Sold Price</th>
                  <th className="py-3.5 px-4">Sale Date</th>
                  <th className="py-3.5 px-4">Buyer / Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sales.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70">
                    <td className="py-3.5 px-4">
                      <span className="font-bold font-mono text-slate-900 tracking-wide text-sm">
                        {item.phoneNumber}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                        {item.category}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-400 line-through">
                      ₹{item.price.toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 font-bold text-emerald-600">
                      ₹{(item.finalSellingPrice || item.price).toLocaleString('en-IN')}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-600">
                      {item.soldAt ? new Date(item.soldAt).toLocaleString() : 'N/A'}
                    </td>
                    <td className="py-3.5 px-4 text-xs text-slate-500">
                      {item.customerNotes || <span className="text-slate-300">—</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-slate-200 flex items-center justify-between">
            <span className="text-xs text-slate-500">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex space-x-2">
              <button
                disabled={page <= 1}
                onClick={() => setPage((p) => p - 1)}
                className="p-1.5 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-700"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page >= pagination.pages}
                onClick={() => setPage((p) => p + 1)}
                className="p-1.5 border border-slate-300 rounded-lg disabled:opacity-40 hover:bg-slate-50 text-slate-700"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
