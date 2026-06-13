import React, { useState, useMemo } from 'react';
import { Search, Download, ArrowUpDown, ArrowUp, ArrowDown, Star, Plus, Edit, Trash2, X } from 'lucide-react';
import type { Transaction, Category, Region, Channel } from '../types/dashboard';

interface OrdersTableProps {
  transactions: Transaction[];
  onAddTransaction: (tx: Transaction) => void;
  onUpdateTransaction: (tx: Transaction) => void;
  onDeleteTransaction: (txId: string) => void;
}

export const OrdersTable: React.FC<OrdersTableProps> = ({ 
  transactions,
  onAddTransaction,
  onUpdateTransaction,
  onDeleteTransaction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [sortField, setSortField] = useState<keyof Transaction>('date');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const rowsPerPage = 8;

  // CRUD modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [formData, setFormData] = useState<{
    id: string;
    date: string;
    customerName: string;
    productName: string;
    category: Category;
    price: number;
    quantity: number;
    discount: number;
    region: Region;
    channel: Channel;
    rating: number;
  }>({
    id: '',
    date: '',
    customerName: '',
    productName: '',
    category: 'Electronics',
    price: 0,
    quantity: 1,
    discount: 0,
    region: 'North',
    channel: 'Online',
    rating: 5
  });

  // Filter based on search term
  const filteredData = useMemo(() => {
    setCurrentPage(1); // reset to page 1 on search
    if (!searchTerm.trim()) return transactions;
    
    const term = searchTerm.toLowerCase();
    return transactions.filter(t => 
      t.id.toLowerCase().includes(term) ||
      t.customerName.toLowerCase().includes(term) ||
      t.productName.toLowerCase().includes(term) ||
      t.category.toLowerCase().includes(term) ||
      t.region.toLowerCase().includes(term) ||
      t.channel.toLowerCase().includes(term)
    );
  }, [transactions, searchTerm]);

  // Sort based on field and direction
  const sortedData = useMemo(() => {
    const sorted = [...filteredData];
    sorted.sort((a, b) => {
      const aVal = a[sortField];
      const bVal = b[sortField];

      if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDirection === 'asc' ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
      }
      
      const aNum = Number(aVal);
      const bNum = Number(bVal);
      return sortDirection === 'asc' ? aNum - bNum : bNum - aNum;
    });
    return sorted;
  }, [filteredData, sortField, sortDirection]);

  // Paginate sorted data
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * rowsPerPage;
    return sortedData.slice(start, start + rowsPerPage);
  }, [sortedData, currentPage]);

  const totalPages = Math.max(1, Math.ceil(sortedData.length / rowsPerPage));

  const handleSort = (field: keyof Transaction) => {
    if (sortField === field) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const getSortIcon = (field: keyof Transaction) => {
    if (sortField !== field) return <ArrowUpDown size={12} style={{ marginLeft: '4px', opacity: 0.5 }} />;
    return sortDirection === 'asc' 
      ? <ArrowUp size={12} style={{ marginLeft: '4px', color: 'var(--color-primary-light)' }} />
      : <ArrowDown size={12} style={{ marginLeft: '4px', color: 'var(--color-primary-light)' }} />;
  };

  const getChannelClass = (channel: Transaction['channel']) => {
    switch(channel) {
      case 'Online': return 'channel-tag channel-online';
      case 'Flagship Store': return 'channel-tag channel-flagship';
      case 'Boutique': return 'channel-tag channel-boutique';
      default: return 'channel-tag channel-partner';
    }
  };

  // Exporters
  const exportToCSV = () => {
    const headers = ['Order ID', 'Date', 'Customer Name', 'Product Name', 'Category', 'Price ($)', 'Quantity', 'Discount (%)', 'Revenue ($)', 'Cost ($)', 'Region', 'Channel', 'Rating'];
    const rows = sortedData.map(t => [
      t.id,
      t.date,
      t.customerName,
      t.productName,
      t.category,
      t.price,
      t.quantity,
      Math.round(t.discount * 100),
      t.revenue,
      t.cost,
      t.region,
      t.channel,
      t.rating
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.map(val => `"${String(val).replace(/"/g, '""')}"`).join(","))].join("\n");
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `retail_sales_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(sortedData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `retail_sales_export_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // CRUD Modal triggers
  const handleOpenAddModal = () => {
    setModalMode('add');
    setFormData({
      id: `TX-${Math.floor(2000 + Math.random() * 8000)}`,
      date: new Date('2026-06-13').toISOString().split('T')[0],
      customerName: '',
      productName: '',
      category: 'Electronics',
      price: 199,
      quantity: 1,
      discount: 0,
      region: 'North',
      channel: 'Online',
      rating: 5
    });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (t: Transaction) => {
    setModalMode('edit');
    setFormData({
      id: t.id,
      date: t.date,
      customerName: t.customerName,
      productName: t.productName,
      category: t.category,
      price: t.price,
      quantity: t.quantity,
      discount: Math.round(t.discount * 100),
      region: t.region,
      channel: t.channel,
      rating: t.rating
    });
    setIsModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerName.trim()) {
      alert('Please insert a customer name');
      return;
    }
    if (!formData.productName.trim()) {
      alert('Please insert a product name');
      return;
    }
    if (formData.price <= 0) {
      alert('Price must be greater than zero');
      return;
    }
    if (formData.quantity < 1) {
      alert('Quantity must be at least 1');
      return;
    }
    if (formData.discount < 0 || formData.discount > 90) {
      alert('Discount must be between 0% and 90%');
      return;
    }

    // Mathematical Calculations
    const calculatedRevenue = formData.price * formData.quantity * (1 - (formData.discount / 100));
    const margins: Record<Category, number> = {
      'Electronics': 0.45,
      'Fashion': 0.60,
      'Home & Kitchen': 0.55,
      'Beauty & Personal Care': 0.72,
      'Sports & Outdoors': 0.55
    };
    const categoryMargin = margins[formData.category] || 0.5;
    const calculatedCost = (formData.price * (1 - categoryMargin)) * formData.quantity;

    const transactionPayload: Transaction = {
      id: formData.id,
      date: formData.date,
      customerName: formData.customerName.trim(),
      productName: formData.productName.trim(),
      category: formData.category,
      price: Number(formData.price),
      quantity: Number(formData.quantity),
      revenue: Math.round(calculatedRevenue * 100) / 100,
      discount: Number(formData.discount) / 100,
      cost: Math.round(calculatedCost * 100) / 100,
      region: formData.region,
      channel: formData.channel,
      isReturningCustomer: Math.random() > 0.5, // simulate cohort split
      rating: Number(formData.rating)
    };

    if (modalMode === 'add') {
      onAddTransaction(transactionPayload);
    } else {
      onUpdateTransaction(transactionPayload);
    }
    setIsModalOpen(false);
  };

  const handleDeleteShortcut = (id: string) => {
    if (window.confirm(`Are you sure you want to delete order ${id}?`)) {
      onDeleteTransaction(id);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="glass-card full-width-card" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600 }}>Recent Transaction Logs</h3>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            Showing {sortedData.length === 0 ? 0 : (currentPage - 1) * rowsPerPage + 1} - {Math.min(currentPage * rowsPerPage, sortedData.length)} of {sortedData.length} records
          </p>
        </div>

        {/* Action Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', flexWrap: 'wrap' }}>
          <div className="header-search" style={{ width: '190px', padding: '0.3rem 0.6rem' }}>
            <Search size={14} style={{ color: 'var(--text-muted)' }} />
            <input 
              type="text" 
              placeholder="Search..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ fontSize: '0.85rem' }}
            />
          </div>

          <button onClick={handleOpenAddModal} className="btn btn-primary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem', gap: '0.3rem' }}>
            <Plus size={14} />
            Add Record
          </button>

          <button onClick={exportToCSV} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}>
            <Download size={14} />
            CSV
          </button>
          
          <button onClick={exportToJSON} className="btn btn-secondary" style={{ padding: '0.45rem 0.8rem', fontSize: '0.8rem' }}>
            <Download size={14} />
            JSON
          </button>
        </div>
      </div>

      <div className="table-wrapper">
        <table className="custom-table">
          <thead>
            <tr>
              <th onClick={() => handleSort('id')}>ID {getSortIcon('id')}</th>
              <th onClick={() => handleSort('date')}>Date {getSortIcon('date')}</th>
              <th onClick={() => handleSort('customerName')}>Customer {getSortIcon('customerName')}</th>
              <th onClick={() => handleSort('productName')}>Product {getSortIcon('productName')}</th>
              <th onClick={() => handleSort('category')}>Category {getSortIcon('category')}</th>
              <th onClick={() => handleSort('price')} style={{ textAlign: 'right' }}>Price {getSortIcon('price')}</th>
              <th onClick={() => handleSort('quantity')} style={{ textAlign: 'center' }}>Qty {getSortIcon('quantity')}</th>
              <th onClick={() => handleSort('discount')} style={{ textAlign: 'center' }}>Disc. {getSortIcon('discount')}</th>
              <th onClick={() => handleSort('revenue')} style={{ textAlign: 'right' }}>Revenue {getSortIcon('revenue')}</th>
              <th onClick={() => handleSort('channel')}>Channel {getSortIcon('channel')}</th>
              <th onClick={() => handleSort('rating')}>Rating {getSortIcon('rating')}</th>
              <th style={{ textAlign: 'center', width: '90px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.length === 0 ? (
              <tr>
                <td colSpan={12} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                  No matching transaction logs found.
                </td>
              </tr>
            ) : (
              paginatedData.map((t) => (
                <tr key={t.id}>
                  <td style={{ fontWeight: 600, color: 'var(--color-primary-light)', fontSize: '0.85rem' }}>{t.id}</td>
                  <td>{t.date}</td>
                  <td style={{ fontWeight: 500 }}>{t.customerName}</td>
                  <td style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={t.productName}>
                    {t.productName}
                  </td>
                  <td>{t.category}</td>
                  <td style={{ textAlign: 'right' }}>${t.price.toFixed(2)}</td>
                  <td style={{ textAlign: 'center' }}>{t.quantity}</td>
                  <td style={{ textAlign: 'center', color: t.discount > 0 ? 'var(--color-success)' : 'inherit' }}>
                    {t.discount > 0 ? `${Math.round(t.discount * 100)}%` : '-'}
                  </td>
                  <td style={{ textAlign: 'right', fontWeight: 600 }}>${t.revenue.toFixed(2)}</td>
                  <td>
                    <span className={getChannelClass(t.channel)}>{t.channel}</span>
                  </td>
                  <td>
                    <div className="rating-stars" title={`${t.rating} out of 5 stars`}>
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star 
                          key={i} 
                          size={11} 
                          fill={i < t.rating ? 'var(--color-warning)' : 'none'} 
                          stroke="var(--color-warning)" 
                          style={{ opacity: i < t.rating ? 1 : 0.25 }}
                        />
                      ))}
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.3rem', justifyContent: 'center' }}>
                      <button 
                        onClick={() => handleOpenEditModal(t)}
                        className="btn-icon" 
                        style={{ width: '26px', height: '26px', borderRadius: '6px' }}
                        title="Edit Row"
                      >
                        <Edit size={12} />
                      </button>
                      <button 
                        onClick={() => {
                          if (window.confirm(`Are you sure you want to delete order ${t.id}?`)) {
                            onDeleteTransaction(t.id);
                          }
                        }}
                        className="btn-icon" 
                        style={{ width: '26px', height: '26px', borderRadius: '6px', color: 'var(--color-danger)' }}
                        title="Delete Row"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="table-controls">
        <span>
          Page <strong>{currentPage}</strong> of {totalPages}
        </span>
        
        <div className="table-pagination">
          <button 
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', opacity: currentPage === 1 ? 0.4 : 1, cursor: currentPage === 1 ? 'not-allowed' : 'pointer' }}
          >
            Previous
          </button>
          
          <button 
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
            className="btn btn-secondary"
            style={{ padding: '0.3rem 0.6rem', fontSize: '0.75rem', opacity: currentPage === totalPages ? 0.4 : 1, cursor: currentPage === totalPages ? 'not-allowed' : 'pointer' }}
          >
            Next
          </button>
        </div>
      </div>

      {/* --- EDIT / ADD MODAL WIZARD --- */}
      {isModalOpen && (
        <div className="modal-overlay">
          <div className="modal-content-card">
            
            {/* Modal header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--border-subtle)', paddingBottom: '0.8rem' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 600 }}>
                {modalMode === 'add' ? 'Add Sales Transaction' : `Edit Transaction #${formData.id}`}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="btn-icon" 
                style={{ width: '28px', height: '28px', borderRadius: '50%', border: 'none' }}
              >
                <X size={14} />
              </button>
            </div>

            <form onSubmit={handleFormSubmit}>
              <div className="form-grid">
                
                {/* Customer Input */}
                <div className="form-field-full">
                  <label>Customer Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Liam Smith"
                    value={formData.customerName}
                    onChange={(e) => setFormData(prev => ({ ...prev, customerName: e.target.value }))}
                    className="input-custom"
                    style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Product Input */}
                <div className="form-field-full">
                  <label>Product Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Pro Headphones"
                    value={formData.productName}
                    onChange={(e) => setFormData(prev => ({ ...prev, productName: e.target.value }))}
                    className="input-custom"
                    style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Category Select */}
                <div className="form-field">
                  <label>Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value as Category }))}
                    className="select-custom"
                    style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                  >
                    <option value="Electronics">Electronics</option>
                    <option value="Fashion">Fashion</option>
                    <option value="Home & Kitchen">Home & Kitchen</option>
                    <option value="Beauty & Personal Care">Beauty & Care</option>
                    <option value="Sports & Outdoors">Sports & Outdoors</option>
                  </select>
                </div>

                {/* Date Input */}
                <div className="form-field">
                  <label>Date</label>
                  <input 
                    type="date" 
                    value={formData.date}
                    onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                    className="input-custom"
                    style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Unit Price */}
                <div className="form-field">
                  <label>Unit Price ($)</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: Number(e.target.value) }))}
                    className="input-custom"
                    style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Quantity */}
                <div className="form-field">
                  <label>Quantity</label>
                  <input 
                    type="number" 
                    min="1" 
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: Number(e.target.value) }))}
                    className="input-custom"
                    style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Discount Percentage */}
                <div className="form-field">
                  <label>Discount Buffer (%)</label>
                  <input 
                    type="number" 
                    min="0" 
                    max="90"
                    value={formData.discount}
                    onChange={(e) => setFormData(prev => ({ ...prev, discount: Number(e.target.value) }))}
                    className="input-custom"
                    style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                  />
                </div>

                {/* Rating 1-5 */}
                <div className="form-field">
                  <label>Customer Rating (1-5)</label>
                  <select
                    value={formData.rating}
                    onChange={(e) => setFormData(prev => ({ ...prev, rating: Number(e.target.value) }))}
                    className="select-custom"
                    style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                  >
                    <option value="5">⭐⭐⭐⭐⭐ (5 Stars)</option>
                    <option value="4">⭐⭐⭐⭐ (4 Stars)</option>
                    <option value="3">⭐⭐⭐ (3 Stars)</option>
                    <option value="2">⭐⭐ (2 Stars)</option>
                    <option value="1">⭐ (1 Star)</option>
                  </select>
                </div>

                {/* Region Select */}
                <div className="form-field">
                  <label>Region</label>
                  <select
                    value={formData.region}
                    onChange={(e) => setFormData(prev => ({ ...prev, region: e.target.value as Region }))}
                    className="select-custom"
                    style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                  >
                    <option value="North">North</option>
                    <option value="South">South</option>
                    <option value="East">East</option>
                    <option value="West">West</option>
                    <option value="Central">Central</option>
                  </select>
                </div>

                {/* Channel Select */}
                <div className="form-field">
                  <label>Channel</label>
                  <select
                    value={formData.channel}
                    onChange={(e) => setFormData(prev => ({ ...prev, channel: e.target.value as Channel }))}
                    className="select-custom"
                    style={{ padding: '0.45rem 0.7rem', fontSize: '0.85rem' }}
                  >
                    <option value="Online">Online Store</option>
                    <option value="Flagship Store">Flagship Store</option>
                    <option value="Boutique">Boutique</option>
                    <option value="Retail Partner">Retail Partner</option>
                  </select>
                </div>

              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'flex-end', marginTop: '1.8rem', borderTop: '1px solid var(--border-subtle)', paddingTop: '1rem' }}>
                {modalMode === 'edit' && (
                  <button 
                    type="button" 
                    onClick={() => handleDeleteShortcut(formData.id)}
                    className="btn btn-secondary"
                    style={{ color: 'var(--color-danger)', borderColor: 'rgba(244, 63, 94, 0.2)', marginRight: 'auto' }}
                  >
                    <Trash2 size={14} />
                    Delete Order
                  </button>
                )}

                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
