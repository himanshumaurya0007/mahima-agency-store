import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import {
  Users,
  Plus,
  Search,
  Eye,
  Pencil,
  Trash2,
  Filter,
  Download,
  Loader2,
  MapPin,
  Phone,
  Mail,
  Store,
  ChevronLeft,
  ChevronRight,
  X,
  AlertCircle,
  CheckCircle,
} from 'lucide-react';

import customerApi from '../../services/customerApi';
import authService from '../../services/authService';

const CustomersList = () => {
  const navigate = useNavigate();

  // ===== AUTH PROTECTION =====
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      toast.error('Please login to continue');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // ===== STATE MANAGEMENT =====
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [customerToDelete, setCustomerToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);

  const ITEMS_PER_PAGE = 9; // 3x3 grid

  // ===== FETCH CUSTOMERS =====
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const response = await customerApi.getAllCustomers();

      if (response.success) {
        let customerData = [];

        if (Array.isArray(response.data)) {
          customerData = response.data;
        } else if (response.data && Array.isArray(response.data.customers)) {
          customerData = response.data.customers;
        } else if (Array.isArray(response.customers)) {
          customerData = response.customers;
        }

        setCustomers(customerData);
      }
    } catch (error) {
      console.error('Failed to fetch customers:', error);
      toast.error('Failed to load customers');
      setCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  // ===== FILTER & SEARCH =====
  const filteredCustomers = customers.filter((customer) => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch =
      !searchQuery ||
      customer.shopName?.toLowerCase().includes(searchLower) ||
      customer.phone?.includes(searchQuery) ||
      customer.email?.toLowerCase().includes(searchLower) ||
      customer.temporaryCustomerId?.toLowerCase().includes(searchLower) ||
      customer.havmorPlatformCustomerId?.toLowerCase().includes(searchLower);

    const matchesStatus = filterStatus === 'ALL' || customer.customerStatus === filterStatus;

    return matchesSearch && matchesStatus;
  });

  // ===== PAGINATION =====
  const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, filterStatus]);

  // ===== DELETE HANDLERS =====
  const handleDeleteClick = (customer) => {
    setCustomerToDelete(customer);
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    if (!customerToDelete) return;

    setDeleteLoading(true);
    try {
      const customerId =
        customerToDelete.temporaryCustomerId || customerToDelete.havmorPlatformCustomerId;
      const response = await customerApi.deleteCustomer(customerId);

      if (response.success) {
        toast.success('Customer deleted successfully!');
        setShowDeleteModal(false);
        setCustomerToDelete(null);
        fetchCustomers();
      }
    } catch (error) {
      console.error('Delete failed:', error);
      toast.error(error.message || 'Failed to delete customer');
    } finally {
      setDeleteLoading(false);
    }
  };

  // ===== NAVIGATION HANDLERS =====
  const handleView = (customer) => {
    const customerId = customer.temporaryCustomerId || customer.havmorPlatformCustomerId;
    navigate(`/customers/${customerId}`);
  };

  const handleEdit = (customer) => {
    const customerId = customer.temporaryCustomerId || customer.havmorPlatformCustomerId;
    navigate(`/customers/edit/${customerId}`);
  };

  // ===== EXPORT TO CSV =====
  const handleExport = () => {
    if (filteredCustomers.length === 0) {
      toast.error('No customers to export');
      return;
    }

    const csvHeaders = [
      'Shop Name',
      'Customer Status',
      'Customer ID',
      'Phone',
      'Email',
      'City',
      'State',
      'PIN Code',
    ];

    const csvRows = filteredCustomers.map((customer) => [
      customer.shopName,
      customer.customerStatus,
      customer.temporaryCustomerId || customer.havmorPlatformCustomerId,
      customer.phone,
      customer.email || 'N/A',
      customer.customerAddress?.city || 'N/A',
      customer.customerAddress?.state || 'N/A',
      customer.customerAddress?.pinCode || 'N/A',
    ]);

    const csvContent = [
      csvHeaders.join(','),
      ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);

    toast.success('Customers exported successfully!');
  };

  // ===== DELETE MODAL =====
  const DeleteModal = () => {
    if (!showDeleteModal || !customerToDelete) return null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
        <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
          <div className="border-b-2 border-gray-200 p-6 flex items-center justify-between">
            <div className="flex items-center">
              <div className="bg-red-100 p-3 rounded-full mr-4">
                <AlertCircle size={24} className="text-red-600" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-black">Delete Customer</h3>
                <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
              </div>
            </div>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setCustomerToDelete(null);
              }}
              className="text-gray-500 hover:text-black transition-colors"
            >
              <X size={24} />
            </button>
          </div>

          <div className="p-6">
            <p className="text-gray-700 mb-4">Are you sure you want to delete this customer?</p>
            <div className="bg-vanilla rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Shop Name:</span>
                <span className="text-black font-semibold">{customerToDelete.shopName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 font-medium">Phone:</span>
                <span className="text-black font-semibold">{customerToDelete.phone}</span>
              </div>
            </div>
          </div>

          <div className="border-t-2 border-gray-200 p-6 flex justify-end gap-4">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setCustomerToDelete(null);
              }}
              className="btn-outline h-12 px-6"
              disabled={deleteLoading}
            >
              Cancel
            </button>
            <button
              onClick={handleDeleteConfirm}
              disabled={deleteLoading}
              className={`bg-red-600 hover:bg-red-700 text-white font-semibold h-12 px-6 rounded-lg transition-colors flex items-center ${
                deleteLoading ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {deleteLoading ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 size={20} className="mr-2" />
                  Delete
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    );
  };

  // ===== EMPTY STATE =====
  const EmptyState = () => (
    <div className="card p-12 text-center">
      <div className="flex flex-col items-center">
        <div className="bg-vanilla p-6 rounded-full mb-6">
          <Users size={48} className="text-coffee" />
        </div>
        <h3 className="text-2xl font-bold text-black mb-2">No Customers Found</h3>
        <p className="text-gray-600 mb-6 max-w-md">
          {searchQuery || filterStatus !== 'ALL'
            ? 'Try adjusting your search or filters'
            : 'Get started by adding your first customer'}
        </p>
        {!searchQuery && filterStatus === 'ALL' && (
          <button onClick={() => navigate('/customers/add')} className="btn-primary h-12 px-8">
            <Plus size={20} className="mr-2" />
            Add First Customer
          </button>
        )}
      </div>
    </div>
  );

  // ===== LOADING STATE =====
  if (loading) {
    return (
      <div className="bg-cream min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 size={48} className="animate-spin text-black mx-auto mb-4" />
          <p className="text-lg font-medium text-coffee">Loading customers...</p>
        </div>
      </div>
    );
  }

  // ===== MAIN RENDER =====
  return (
    <div className="bg-cream min-h-screen px-4 py-6 sm:py-8">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-alpino text-4xl font-bold tracking-wide text-black sm:text-5xl">
              All Customers
            </h1>
            <p className="text-coffee text-base font-medium tracking-wide mt-2">
              {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
            </p>
          </div>
          <button
            onClick={() => navigate('/customers/add')}
            className="btn-primary h-12 px-6 flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Customer
          </button>
        </div>

        {/* Search & Filters */}
        <div className="mb-6 flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search customers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full pl-12 pr-4 rounded-lg border-2 border-gray-300 focus:border-peach outline-none transition-all bg-white"
            />
          </div>

          <div className="flex gap-4">
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-12 pl-4 pr-10 rounded-lg border-2 border-gray-300 focus:border-peach outline-none transition-all cursor-pointer appearance-none bg-white font-medium"
              >
                <option value="ALL">All Status</option>
                <option value="TEMPORARY">Temporary</option>
                <option value="PERMANENT">Permanent</option>
              </select>
              <Filter size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>

            <button
              onClick={handleExport}
              className="btn-outline h-12 px-4 flex items-center gap-2"
              title="Export to CSV"
            >
              <Download size={20} />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </div>

        {/* Customers Grid */}
        {filteredCustomers.length === 0 ? (
          <EmptyState />
        ) : (
          <>
            {/* Grid Layout */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              {paginatedCustomers.map((customer) => (
                <div
                  key={
                    customer._id ||
                    customer.temporaryCustomerId ||
                    customer.havmorPlatformCustomerId
                  }
                  className="card p-5 hover:shadow-xl transition-all duration-200 group"
                >
                  {/* Card Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-black line-clamp-1 flex-1 mr-2">
                        {customer.shopName}
                      </h3>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
                          customer.customerStatus === 'PERMANENT'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {customer.customerStatus === 'PERMANENT' ? (
                          <CheckCircle size={12} className="inline mr-1" />
                        ) : (
                          '○'
                        )}{' '}
                        {customer.customerStatus === 'PERMANENT' ? 'Permanent' : 'Temporary'}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-mono">
                      ID: {customer.temporaryCustomerId || customer.havmorPlatformCustomerId}
                    </p>
                  </div>

                  {/* Card Content */}
                  <div className="space-y-2.5 mb-4 text-sm">
                    <div className="flex items-center text-gray-700">
                      <Phone size={16} className="mr-2 text-coffee flex-shrink-0" />
                      <span className="font-medium">{customer.phone}</span>
                    </div>

                    {customer.email && (
                      <div className="flex items-center text-gray-700">
                        <Mail size={16} className="mr-2 text-coffee flex-shrink-0" />
                        <span className="line-clamp-1">{customer.email}</span>
                      </div>
                    )}

                    {customer.customerAddress?.city && (
                      <div className="flex items-center text-gray-700">
                        <MapPin size={16} className="mr-2 text-coffee flex-shrink-0" />
                        <span className="line-clamp-1">
                          {customer.customerAddress.city}, {customer.customerAddress.state}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => handleView(customer)}
                      className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-semibold"
                    >
                      <Eye size={16} />
                      View
                    </button>
                    <button
                      onClick={() => handleEdit(customer)}
                      className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-sm font-semibold"
                    >
                      <Pencil size={16} />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClick(customer)}
                      className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="card p-4 flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Page {currentPage} of {totalPages}
                </p>

                <div className="flex gap-2">
                  <button
                    onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="p-2 rounded-lg border-2 border-gray-300 hover:bg-vanilla disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronLeft size={20} />
                  </button>

                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <button
                          key={pageNum}
                          onClick={() => setCurrentPage(pageNum)}
                          className={`h-10 w-10 rounded-lg font-semibold transition-colors ${
                            currentPage === pageNum
                              ? 'bg-black text-cream'
                              : 'bg-white border-2 border-gray-300 hover:bg-vanilla'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    })}
                  </div>

                  <button
                    onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="p-2 rounded-lg border-2 border-gray-300 hover:bg-vanilla disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <DeleteModal />
    </div>
  );
};

export default CustomersList;
