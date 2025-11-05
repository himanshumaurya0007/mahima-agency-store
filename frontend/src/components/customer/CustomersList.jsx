import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Store,
  Phone,
  MapPin,
  User,
  Filter,
  X,
} from 'lucide-react';
import customerApi from '../../services/customerApi';
import authService from '../../services/authService';
import Button from '../common/Button';
import DeleteModal from '../common/DeleteModal';
import EmptyState from '../common/EmptyState';
import { SkeletonCards } from '../common/Loader';

const CustomersList = () => {
  const navigate = useNavigate();

  // AUTH PROTECTION
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // STATE MANAGEMENT
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [deleteModal, setDeleteModal] = useState({
    isOpen: false,
    customer: null,
    loading: false,
  });

  // FETCH CUSTOMERS
  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const response = await customerApi.getAllCustomers();

      console.log('API Response:', response); // Debug log

      // Handle ApiResponse class instance
      if (response && response.success) {
        const customersData = response.data;

        if (Array.isArray(customersData)) {
          setCustomers(customersData);
          setFilteredCustomers(customersData);
        } else if (customersData && Array.isArray(customersData.customers)) {
          // Fallback if data has nested 'customers' property
          setCustomers(customersData.customers);
          setFilteredCustomers(customersData.customers);
        } else {
          console.error('Unexpected data structure:', customersData);
          setCustomers([]);
          setFilteredCustomers([]);
          toast.error('Invalid data format received');
        }
      } else {
        console.warn('Response not successful:', response);
        setCustomers([]);
        setFilteredCustomers([]);
      }
    } catch (error) {
      console.error('Fetch customers failed:', error);
      toast.error('Failed to load customers');
      setCustomers([]);
      setFilteredCustomers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // SEARCH & FILTER LOGIC
  useEffect(() => {
    if (!Array.isArray(customers)) {
      setFilteredCustomers([]);
      return;
    }

    let filtered = [...customers];

    // Status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter((c) => c.customerStatus === statusFilter);
    }

    // Search filter
    if (searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (customer) =>
          customer.shopName?.toLowerCase().includes(searchLower) ||
          customer.phone?.includes(searchTerm) ||
          customer.email?.toLowerCase().includes(searchLower) ||
          customer.temporaryCustomerId?.includes(searchTerm) ||
          customer.havmorPlatformCustomerId?.includes(searchTerm) ||
          customer.customerAddress?.city?.toLowerCase().includes(searchLower)
      );
    }

    setFilteredCustomers(filtered);
  }, [searchTerm, statusFilter, customers]);

  // DELETE HANDLER
  const handleDeleteClick = (customer) => {
    setDeleteModal({
      isOpen: true,
      customer,
      loading: false,
    });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteModal.customer) return;

    setDeleteModal((prev) => ({ ...prev, loading: true }));

    try {
      const customerId =
        deleteModal.customer.havmorPlatformCustomerId ||
        deleteModal.customer.temporaryCustomerId;

      const response = await customerApi.deleteCustomer(customerId);

      if (response.success) {
        toast.success('Customer deleted successfully!');
        setCustomers((prev) =>
          prev.filter(
            (c) =>
              c.havmorPlatformCustomerId !== customerId &&
              c.temporaryCustomerId !== customerId
          )
        );
        setDeleteModal({ isOpen: false, customer: null, loading: false });
      }
    } catch (error) {
      console.error('Delete customer failed:', error.message);

      let errorMsg = 'Failed to delete customer';
      if (error.statusCode === 404) {
        errorMsg = 'Customer not found';
      } else if (error.statusCode === 500) {
        errorMsg = 'Server error. Please try again.';
      }
      toast.error(errorMsg);
      setDeleteModal((prev) => ({ ...prev, loading: false }));
    }
  };

  // EDIT HANDLER
const handleEditClick = (customer) => {
  const customerId =
    customer.havmorPlatformCustomerId || customer.temporaryCustomerId;
  
  console.log('Navigating to update customer:', customerId); // Debug log
  
  // Make sure customerId is not undefined
  if (!customerId) {
    console.error('Customer ID is undefined!', customer);
    toast.error('Cannot edit customer: Invalid ID');
    return;
  }
  
  navigate(`/customers/update/${customerId}`);
};

  // CLEAR SEARCH
  const handleClearSearch = () => {
    setSearchTerm('');
  };

  // Safe filtered customers array
  const safeFilteredCustomers = Array.isArray(filteredCustomers)
    ? filteredCustomers
    : [];

  return (
    <div className="bg-cream min-h-screen px-4 py-6 sm:py-8 animate-fade-in">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <h1 className="font-alpino text-4xl font-bold tracking-wide text-black sm:text-5xl">
              Customers
            </h1>
            <p className="text-coffee text-base font-medium tracking-wide">
              {safeFilteredCustomers.length} customer
              {safeFilteredCustomers.length !== 1 ? 's' : ''} found
            </p>
          </div>

          <Button
            variant="primary"
            icon={Plus}
            onClick={() => navigate('/customers/add')}
            className="h-12 px-6"
          >
            Add New Customer
          </Button>
        </div>

        {/* Search & Filters */}
        <div className="card mb-6 p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            {/* Search Bar */}
            <div className="relative flex-1 lg:max-w-md">
              <Search
                size={20}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
              />
              <input
                type="text"
                placeholder="Search by shop name, phone, email, ID, city..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-12 w-full rounded-lg border-2 border-gray-300 bg-white pl-12 pr-10 text-base font-medium tracking-wider text-black outline-none transition-all duration-200 hover:border-gray-400 focus:border-peach focus:shadow-md"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors"
                  aria-label="Clear search"
                >
                  <X size={20} />
                </button>
              )}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-3">
              <Filter size={20} className="text-gray-500" />
              <div className="flex gap-2">
                {['ALL', 'TEMPORARY', 'PERMANENT'].map((status) => (
                  <button
                    key={status}
                    onClick={() => setStatusFilter(status)}
                    className={`h-10 rounded-lg px-4 text-sm font-semibold tracking-wide transition-all ${
                      statusFilter === status
                        ? 'bg-black text-cream shadow-md'
                        : 'bg-white text-black border-2 border-gray-300 hover:border-gray-400'
                    }`}
                  >
                    {status.charAt(0) + status.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Customer Cards Grid */}
        {loading ? (
          <SkeletonCards count={9} />
        ) : safeFilteredCustomers.length === 0 ? (
          <EmptyState
            icon={Store}
            title="No Customers Found"
            description={
              searchTerm || statusFilter !== 'ALL'
                ? 'Try adjusting your search or filters'
                : 'Start by adding your first customer'
            }
            actionLabel={
              !searchTerm && statusFilter === 'ALL'
                ? 'Add First Customer'
                : undefined
            }
            onAction={
              !searchTerm && statusFilter === 'ALL'
                ? () => navigate('/customers/add')
                : undefined
            }
          />
        ) : (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {safeFilteredCustomers.map((customer) => {
              if (!customer) return null;

              const customerId =
                customer.havmorPlatformCustomerId ||
                customer.temporaryCustomerId ||
                'unknown';
              const displayId = customer.havmorPlatformCustomerId
                ? `ID: ${customer.havmorPlatformCustomerId}`
                : customer.temporaryCustomerId
                  ? `Temp ID: ${customer.temporaryCustomerId}`
                  : 'No ID';

              return (
                <div
                  key={customer._id || customerId}
                  className="card hover-lift group overflow-hidden transition-all duration-300"
                >
                  {/* Status Badge */}
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wider ${
                        customer.customerStatus === 'PERMANENT'
                          ? 'bg-black text-cream'
                          : 'bg-vanilla text-coffee border-2 border-peach'
                      }`}
                    >
                      {customer.customerStatus || 'UNKNOWN'}
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {displayId}
                    </span>
                  </div>

                  {/* Shop Name */}
                  <h3 className="font-alpino mb-4 text-xl font-bold tracking-wide text-black">
                    {customer.shopName || 'No Shop Name'}
                  </h3>

                  {/* Customer Details */}
                  <div className="space-y-3 text-sm">
                    {(customer.firstName || customer.lastName) && (
                      <div className="flex items-center text-gray-700">
                        <User
                          size={16}
                          className="text-coffee mr-2 flex-shrink-0"
                        />
                        <span className="font-medium">
                          {customer.firstName} {customer.lastName}
                        </span>
                      </div>
                    )}

                    {customer.phone && (
                      <div className="flex items-center text-gray-700">
                        <Phone
                          size={16}
                          className="text-coffee mr-2 flex-shrink-0"
                        />
                        <span className="font-medium">
                          {customer.phone.startsWith('+91')
                            ? customer.phone.slice(3)
                            : customer.phone}
                        </span>
                      </div>
                    )}

                    {customer.customerAddress &&
                      (customer.customerAddress.city ||
                        customer.customerAddress.state) && (
                        <div className="flex items-start text-gray-700">
                          <MapPin
                            size={16}
                            className="text-coffee mr-2 mt-0.5 flex-shrink-0"
                          />
                          <span className="font-medium">
                            {customer.customerAddress.city}
                            {customer.customerAddress.city &&
                              customer.customerAddress.state &&
                              ', '}
                            {customer.customerAddress.state}
                          </span>
                        </div>
                      )}
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex gap-3">
                    <Button
                      variant="primary"
                      icon={Edit}
                      onClick={() => handleEditClick(customer)}
                      className="flex-1 h-10"
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      icon={Trash2}
                      onClick={() => handleDeleteClick(customer)}
                      className="h-10 px-4 border-red-300 text-red-600 hover:bg-red-50 hover:border-red-400"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Delete Confirmation Modal */}
        <DeleteModal
          isOpen={deleteModal.isOpen}
          onClose={() =>
            setDeleteModal({ isOpen: false, customer: null, loading: false })
          }
          onConfirm={handleDeleteConfirm}
          title="Delete Customer"
          message="Are you sure you want to delete this customer? This action cannot be undone."
          itemDetails={
            deleteModal.customer
              ? {
                  'Shop Name': deleteModal.customer.shopName || 'N/A',
                  'Customer ID':
                    deleteModal.customer.havmorPlatformCustomerId ||
                    deleteModal.customer.temporaryCustomerId ||
                    'N/A',
                  Phone: deleteModal.customer.phone || 'N/A',
                }
              : null
          }
          loading={deleteModal.loading}
        />
      </div>
    </div>
  );
};

export default CustomersList;
