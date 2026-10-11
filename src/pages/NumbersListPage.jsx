import React, { useState, useEffect } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  Edit,
  Trash2,
  CheckCircle2,
  Clock,
  BadgeDollarSign,
  Upload,
  Download,
  AlertTriangle,
  X,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../api/client';

export default function NumbersListPage({ defaultStatus = '' }) {
  const [numbers, setNumbers] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  // Filters & Sorting
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState(defaultStatus);
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('-createdAt');
  const [page, setPage] = useState(1);

  // Status Action Modal
  const [statusModal, setStatusModal] = useState({
    isOpen: false,
    item: null,
    targetStatus: '',
    finalSellingPrice: '',
    customerNotes: '',
  });

  // Edit Details Modal
  const [editModal, setEditModal] = useState({
    isOpen: false,
    item: null,
    phoneNumber: '',
    simName: '',
    simType: 'Jio',
    price: '',
    category: '',
    status: 'Available',
    description: '',
    isFeatured: false,
  });

  // Delete Confirmation Modal
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    item: null,
  });

  // Bulk CSV Import Modal
  const [csvModal, setCsvModal] = useState(false);
  const [csvRows, setCsvRows] = useState([]);
  const [csvResult, setCsvResult] = useState(null);

  // Load Inventory data
  const fetchNumbers = async () => {
    try {
      setLoading(true);
      const params = {
        page,
        limit: 10,
        sort: sortBy,
      };
      if (statusFilter) params.status = statusFilter;
      if (categoryFilter) params.category = categoryFilter;
      if (search) params.search = search;

      const res = await api.get('/admin/numbers', { params });
      if (res.data.success) {
        setNumbers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setStatusFilter(defaultStatus);
    setPage(1);
  }, [defaultStatus]);

  useEffect(() => {
    fetchNumbers();
  }, [page, statusFilter, categoryFilter, sortBy]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchNumbers();
  };

  // Open Status update modal
  const openStatusChange = (item, targetStatus) => {
    setStatusModal({
      isOpen: true,
      item,
      targetStatus,
      finalSellingPrice: item.price,
      customerNotes: item.customerNotes || '',
    });
  };

  // Submit Status Change
  const confirmStatusChange = async () => {
    try {
      await api.patch(`/admin/numbers/${statusModal.item._id}/status`, {
        status: statusModal.targetStatus,
        finalSellingPrice: statusModal.finalSellingPrice,
        customerNotes: statusModal.customerNotes,
      });
      setStatusModal({ isOpen: false, item: null, targetStatus: '', finalSellingPrice: '', customerNotes: '' });
      fetchNumbers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error updating status');
    }
  };

  // Open Edit Modal
  const [editError, setEditError] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const openEdit = (item) => {
    setEditError('');
    setEditModal({
      isOpen: true,
      item,
      phoneNumber: item.phoneNumber,
      simName: item.simName || 'Primary SIM',
      simType: item.simType || 'Jio',
      price: item.price,
      category: item.category,
      status: item.status || 'Available',
      description: item.description || '',
      isFeatured: !!item.isFeatured,
    });
  };

  // Submit Edit
  const saveEdit = async (e) => {
    e.preventDefault();
    setEditError('');

    if (!editModal.phoneNumber || !editModal.phoneNumber.trim()) {
      setEditError('Phone number is required');
      return;
    }

    if (editModal.price === '' || isNaN(Number(editModal.price)) || Number(editModal.price) < 0) {
      setEditError('Price must be a valid non-negative number');
      return;
    }

    const validSimTypes = ['Jio', 'Airtel', 'Vi', 'BSNL'];
    if (!validSimTypes.includes(editModal.simType)) {
      setEditError('SIM Type must be one of Jio, Airtel, Vi, or BSNL');
      return;
    }

    setSavingEdit(true);

    try {
      await api.patch(`/admin/numbers/${editModal.item._id}`, {
        phoneNumber: editModal.phoneNumber.trim(),
        simName: editModal.simName.trim(),
        simType: editModal.simType,
        price: Number(editModal.price),
        category: editModal.category,
        status: editModal.status,
        description: editModal.description,
        isFeatured: editModal.isFeatured,
      });
      setEditModal({ isOpen: false, item: null });
      fetchNumbers();
    } catch (err) {
      setEditError(err.response?.data?.message || 'Error updating details');
    } finally {
      setSavingEdit(false);
    }
  };

  // Delete Action
  const confirmDelete = async () => {
    try {
      await api.delete(`/admin/numbers/${deleteModal.item._id}`);
      setDeleteModal({ isOpen: false, item: null });
      fetchNumbers();
    } catch (err) {
      alert(err.response?.data?.message || 'Error deleting phone number');
    }
  };

  // CSV File Handler
  const handleCsvUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const lines = text.split(/\r?\n/).filter(Boolean);
      if (lines.length <= 1) {
        alert('CSV file is empty or missing headers');
        return;
      }

      // Expected columns: phoneNumber, price, category, description, status
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const parsed = [];

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim());
        if (parts.length >= 2) {
          const rowObj = {};
          headers.forEach((h, idx) => {
            if (h.includes('phone')) rowObj.phoneNumber = parts[idx];
            else if (h.includes('price')) rowObj.price = parts[idx];
            else if (h.includes('cat')) rowObj.category = parts[idx];
            else if (h.includes('desc')) rowObj.description = parts[idx];
            else if (h.includes('status')) rowObj.status = parts[idx];
          });
          parsed.push(rowObj);
        }
      }

      setCsvRows(parsed);
    };
    reader.readAsText(file);
  };

  // Submit CSV Import
  const submitCsvImport = async () => {
    try {
      const res = await api.post('/admin/numbers/bulk-import', { rows: csvRows });
      setCsvResult(res.data.results);
      fetchNumbers();
    } catch (err) {
      alert(err.response?.data?.message || 'CSV Import failed');
    }
  };

  // Export CSV
  const handleExportCsv = async () => {
    try {
      const res = await api.get('/admin/numbers/export', { params: { status: statusFilter } });
      const items = res.data.data;
      if (items.length === 0) {
        alert('No records to export');
        return;
      }

      const csvHeader = 'phoneNumber,price,category,status,description,createdAt\n';
      const csvBody = items
        .map(
          (n) =>
            `"${n.phoneNumber}",${n.price},"${n.category}","${n.status}","${(n.description || '').replace(/"/g, '""')}","${n.createdAt}"`
        )
        .join('\n');

      const blob = new Blob([csvHeader + csvBody], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `inventory_${statusFilter || 'all'}_${Date.now()}.csv`;
      a.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
            {defaultStatus ? `${defaultStatus} Phone Numbers` : 'All Inventory Numbers'}
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Total records found: <span className="font-semibold text-slate-700">{pagination.total}</span>
          </p>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => {
              setCsvModal(true);
              setCsvRows([]);
              setCsvResult(null);
            }}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Upload className="w-4 h-4" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3.5 py-2 border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg flex items-center space-x-1.5 transition-colors"
          >
            <Download className="w-4 h-4" />
            <span>Export CSV</span>
          </button>

          <Link
            to="/add-number"
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-lg flex items-center space-x-1.5 shadow-sm shadow-emerald-700/20"
          >
            <Plus className="w-4 h-4" />
            <span>Add Number</span>
          </Link>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm flex flex-col md:flex-row gap-4 items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search number, description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </form>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {!defaultStatus && (
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="">All Statuses</option>
              <option value="Available">Available</option>
              <option value="Reserved">Reserved</option>
              <option value="Sold">Sold</option>
            </select>
          )}

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="">All Categories</option>
            <option value="Regular">Regular</option>
            <option value="Premium">Premium</option>
            <option value="VIP">VIP</option>
            <option value="Fancy">Fancy</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="-createdAt">Newest First</option>
            <option value="createdAt">Oldest First</option>
            <option value="-price">Price: High to Low</option>
            <option value="price">Price: Low to High</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center">
            <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-xs text-slate-400 mt-2">Loading phone records...</p>
          </div>
        ) : numbers.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-12 h-12 bg-slate-100 rounded-full flex items-center justify-center mx-auto text-slate-400 mb-3">
              <Search className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-800">No phone numbers found</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              There are currently no records matching your selected status or filter parameters.
            </p>
            <div className="mt-4">
              <Link
                to="/add-number"
                className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>+ Add Phone Number</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase tracking-wider text-[11px] font-bold">
                <tr>
                  <th className="py-3.5 px-4">Phone Number</th>
                  <th className="py-3.5 px-4">SIM Details</th>
                  <th className="py-3.5 px-4">Price</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4">Added</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {numbers.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/70 transition-colors">
                    {/* Phone Number */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center space-x-2">
                        <span className="font-bold text-slate-900 font-mono tracking-wide text-sm">
                          {item.phoneNumber}
                        </span>
                        {item.isFeatured && (
                          <span title="Featured Number" className="text-amber-500">
                            <Sparkles className="w-3.5 h-3.5" />
                          </span>
                        )}
                      </div>
                      {item.description && (
                        <p className="text-[11px] text-slate-400 truncate max-w-xs mt-0.5">{item.description}</p>
                      )}
                    </td>

                    {/* SIM Details: SIM Name & Provider Badge */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col space-y-1">
                        <span className="text-xs font-semibold text-slate-800">
                          {item.simName || 'Primary SIM'}
                        </span>
                        <div>
                          <span
                            className={`inline-block text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              item.simType === 'Airtel'
                                ? 'bg-red-50 text-red-600 border border-red-200'
                                : item.simType === 'Vi'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : item.simType === 'BSNL'
                                ? 'bg-sky-50 text-sky-700 border border-sky-200'
                                : 'bg-blue-50 text-blue-700 border border-blue-200'
                            }`}
                          >
                            {item.simType || 'Jio'}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      ₹{item.price.toLocaleString('en-IN')}
                    </td>

                    {/* Category */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                          item.category === 'VIP'
                            ? 'bg-amber-100 text-amber-800'
                            : item.category === 'Premium'
                            ? 'bg-blue-100 text-blue-800'
                            : item.category === 'Fancy'
                            ? 'bg-purple-100 text-purple-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {item.category}
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2.5 py-1 rounded-full ${
                          item.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : item.status === 'Reserved'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-purple-50 text-purple-700 border border-purple-200'
                        }`}
                      >
                        <span>{item.status}</span>
                      </span>
                    </td>

                    {/* Date */}
                    <td className="py-3.5 px-4 text-xs text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end space-x-1.5">
                        {/* Status Quick Actions */}
                        {item.status === 'Available' && (
                          <>
                            <button
                              onClick={() => openStatusChange(item, 'Reserved')}
                              title="Mark as Reserved"
                              className="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs"
                            >
                              <Clock className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openStatusChange(item, 'Sold')}
                              title="Mark as Sold"
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg text-xs"
                            >
                              <BadgeDollarSign className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {item.status === 'Reserved' && (
                          <>
                            <button
                              onClick={() => openStatusChange(item, 'Available')}
                              title="Revert to Available"
                              className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs"
                            >
                              <CheckCircle2 className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => openStatusChange(item, 'Sold')}
                              title="Mark as Sold"
                              className="p-1.5 text-purple-600 hover:bg-purple-50 rounded-lg text-xs"
                            >
                              <BadgeDollarSign className="w-4 h-4" />
                            </button>
                          </>
                        )}

                        {item.status === 'Sold' && (
                          <button
                            onClick={() => openStatusChange(item, 'Available')}
                            title="Re-open to Available"
                            className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg text-xs"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                        )}

                        {/* Edit Button */}
                        <button
                          onClick={() => openEdit(item)}
                          title="Edit Details / Price"
                          className="p-1.5 text-slate-600 hover:bg-slate-100 rounded-lg text-xs"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        {/* Delete Button */}
                        <button
                          onClick={() => setDeleteModal({ isOpen: true, item })}
                          title="Delete Number"
                          className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg text-xs"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Bar */}
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

      {/* STATUS CHANGE CONFIRMATION MODAL */}
      {statusModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">
                Change Status: {statusModal.targetStatus}
              </h3>
              <button
                onClick={() => setStatusModal({ isOpen: false, item: null, targetStatus: '' })}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <p className="text-sm text-slate-600">
                Are you sure you want to change status of{' '}
                <strong className="font-mono text-slate-900">{statusModal.item?.phoneNumber}</strong> to{' '}
                <span className="font-semibold text-emerald-600">{statusModal.targetStatus}</span>?
              </p>

              {statusModal.targetStatus === 'Sold' && (
                <div className="space-y-3 bg-purple-50/50 p-4 rounded-xl border border-purple-100">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Final Selling Price (₹)
                    </label>
                    <input
                      type="number"
                      value={statusModal.finalSellingPrice}
                      onChange={(e) =>
                        setStatusModal({ ...statusModal, finalSellingPrice: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Buyer Notes (Optional)
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Sold to VIP Client Mr. Rao"
                      value={statusModal.customerNotes}
                      onChange={(e) =>
                        setStatusModal({ ...statusModal, customerNotes: e.target.value })
                      }
                      className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setStatusModal({ isOpen: false, item: null, targetStatus: '' })}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmStatusChange}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500 shadow-sm"
              >
                Confirm Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ENHANCED EDIT MODAL */}
      {editModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Edit Phone Number & SIM Details</h3>
              <button
                onClick={() => setEditModal({ isOpen: false, item: null })}
                className="text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {editError && (
              <div className="mt-3 p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                <span>{editError}</span>
              </div>
            )}

            <form onSubmit={saveEdit} className="py-4 space-y-4">
              {/* 1. Phone Number */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Phone Number <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editModal.phoneNumber}
                  onChange={(e) => setEditModal({ ...editModal, phoneNumber: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              {/* 2. SIM Name & 3. SIM Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    SIM Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Primary SIM, Business SIM"
                    value={editModal.simName}
                    onChange={(e) => setEditModal({ ...editModal, simName: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    SIM Type / Network <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editModal.simType}
                    onChange={(e) => setEditModal({ ...editModal, simType: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Jio">Jio</option>
                    <option value="Airtel">Airtel</option>
                    <option value="Vi">Vi</option>
                    <option value="BSNL">BSNL</option>
                  </select>
                </div>
              </div>

              {/* 4. Price & 5. Category */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Selling Price (₹) <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="any"
                    required
                    value={editModal.price}
                    onChange={(e) => setEditModal({ ...editModal, price: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                    Category <span className="text-rose-500">*</span>
                  </label>
                  <select
                    value={editModal.category}
                    onChange={(e) => setEditModal({ ...editModal, category: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Regular">Regular</option>
                    <option value="Premium">Premium</option>
                    <option value="VIP">VIP</option>
                    <option value="Fancy">Fancy</option>
                  </select>
                </div>
              </div>

              {/* 6. Status */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Status <span className="text-rose-500">*</span>
                </label>
                <select
                  value={editModal.status}
                  onChange={(e) => setEditModal({ ...editModal, status: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Available">Available</option>
                  <option value="Reserved">Reserved</option>
                  <option value="Sold">Sold</option>
                </select>
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                  Description / Notes (Optional)
                </label>
                <textarea
                  rows="2"
                  value={editModal.description}
                  onChange={(e) => setEditModal({ ...editModal, description: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="modalFeatured"
                  checked={editModal.isFeatured}
                  onChange={(e) => setEditModal({ ...editModal, isFeatured: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
                <label htmlFor="modalFeatured" className="text-xs font-medium text-slate-700 cursor-pointer">
                  Featured Number (highlight on customer site)
                </label>
              </div>

              <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditModal({ isOpen: false, item: null })}
                  className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-sm transition-all"
                >
                  {savingEdit ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {deleteModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-slate-100">
            <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-center text-slate-900">Delete Phone Number?</h3>
            <p className="text-xs text-center text-slate-500 mt-2">
              Are you sure you want to permanently delete{' '}
              <strong className="font-mono text-slate-800">{deleteModal.item?.phoneNumber}</strong> from inventory?
            </p>
            <div className="flex justify-center space-x-2.5 mt-5">
              <button
                onClick={() => setDeleteModal({ isOpen: false, item: null })}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-500"
              >
                Delete Record
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {csvModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Bulk Import via CSV</h3>
              <button onClick={() => setCsvModal(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                <Upload className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-xs font-semibold text-slate-700">Select a .csv file from your computer</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  Headers required: <code>phoneNumber, price, category, status, description</code>
                </p>
                <input
                  type="file"
                  accept=".csv"
                  onChange={handleCsvUpload}
                  className="mt-3 text-xs text-slate-600"
                />
              </div>

              {csvRows.length > 0 && !csvResult && (
                <div>
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2">
                    Preview ({csvRows.length} rows loaded)
                  </h4>
                  <div className="max-h-40 overflow-y-auto border border-slate-200 rounded-lg text-xs divide-y divide-slate-100">
                    {csvRows.slice(0, 5).map((row, idx) => (
                      <div key={idx} className="p-2 flex justify-between">
                        <span className="font-mono font-semibold">{row.phoneNumber}</span>
                        <span>₹{row.price}</span>
                        <span>{row.category || 'Regular'}</span>
                      </div>
                    ))}
                  </div>
                  {csvRows.length > 5 && (
                    <p className="text-[11px] text-slate-400 mt-1">...and {csvRows.length - 5} more rows.</p>
                  )}
                </div>
              )}

              {csvResult && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl space-y-2 text-xs">
                  <p className="font-bold text-emerald-700">
                    ✓ Successfully added: {csvResult.successCount}
                  </p>
                  {csvResult.failedCount > 0 && (
                    <div>
                      <p className="font-bold text-rose-700">✗ Failed rows: {csvResult.failedCount}</p>
                      <div className="mt-1 space-y-1 text-[11px] text-rose-600 max-h-24 overflow-y-auto">
                        {csvResult.errors.map((e, i) => (
                          <div key={i}>
                            Row {e.row}: {e.error}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end space-x-2.5 pt-3 border-t border-slate-100">
              <button
                onClick={() => setCsvModal(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-xs font-medium"
              >
                Close
              </button>
              {csvRows.length > 0 && !csvResult && (
                <button
                  onClick={submitCsvImport}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-xs font-semibold hover:bg-emerald-500"
                >
                  Confirm & Import {csvRows.length} Rows
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
