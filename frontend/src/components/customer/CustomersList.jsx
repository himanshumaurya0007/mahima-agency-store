// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import { toast } from 'react-hot-toast';
// import {
//   Users,
//   Plus,
//   Search,
//   Eye,
//   Pencil,
//   Trash2,
//   Filter,
//   Download,
//   Loader2,
//   MapPin,
//   Phone,
//   Mail,
//   Store,
//   ChevronLeft,
//   ChevronRight,
//   X,
//   AlertCircle,
//   CheckCircle,
// } from 'lucide-react';

// import customerApi from '../../services/customerApi';
// import authService from '../../services/authService';

// const CustomersList = () => {
//   const navigate = useNavigate();

//   // ===== AUTH PROTECTION =====
//   useEffect(() => {
//     if (!authService.isAuthenticated()) {
//       toast.error('Please login to continue');
//       navigate('/login', { replace: true });
//     }
//   }, [navigate]);

//   // ===== STATE MANAGEMENT =====
//   const [customers, setCustomers] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [filterStatus, setFilterStatus] = useState('ALL');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [showDeleteModal, setShowDeleteModal] = useState(false);
//   const [customerToDelete, setCustomerToDelete] = useState(null);
//   const [deleteLoading, setDeleteLoading] = useState(false);

//   const ITEMS_PER_PAGE = 9; // 3x3 grid

//   // ===== FETCH CUSTOMERS =====
//   useEffect(() => {
//     fetchCustomers();
//   }, []);

//   const fetchCustomers = async () => {
//     setLoading(true);
//     try {
//       const response = await customerApi.getAllCustomers();

//       if (response.success) {
//         let customerData = [];

//         if (Array.isArray(response.data)) {
//           customerData = response.data;
//         } else if (response.data && Array.isArray(response.data.customers)) {
//           customerData = response.data.customers;
//         } else if (Array.isArray(response.customers)) {
//           customerData = response.customers;
//         }

//         setCustomers(customerData);
//       }
//     } catch (error) {
//       console.error('Failed to fetch customers:', error);
//       toast.error('Failed to load customers');
//       setCustomers([]);
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ===== FILTER & SEARCH =====
//   const filteredCustomers = customers.filter((customer) => {
//     const searchLower = searchQuery.toLowerCase();
//     const matchesSearch =
//       !searchQuery ||
//       customer.shopName?.toLowerCase().includes(searchLower) ||
//       customer.phone?.includes(searchQuery) ||
//       customer.email?.toLowerCase().includes(searchLower) ||
//       customer.temporaryCustomerId?.toLowerCase().includes(searchLower) ||
//       customer.havmorPlatformCustomerId?.toLowerCase().includes(searchLower);

//     const matchesStatus = filterStatus === 'ALL' || customer.customerStatus === filterStatus;

//     return matchesSearch && matchesStatus;
//   });

//   // ===== PAGINATION =====
//   const totalPages = Math.ceil(filteredCustomers.length / ITEMS_PER_PAGE);
//   const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
//   const endIndex = startIndex + ITEMS_PER_PAGE;
//   const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

//   useEffect(() => {
//     setCurrentPage(1);
//   }, [searchQuery, filterStatus]);

//   // ===== DELETE HANDLERS =====
//   const handleDeleteClick = (customer) => {
//     setCustomerToDelete(customer);
//     setShowDeleteModal(true);
//   };

//   const handleDeleteConfirm = async () => {
//     if (!customerToDelete) return;

//     setDeleteLoading(true);
//     try {
//       const customerId =
//         customerToDelete.temporaryCustomerId || customerToDelete.havmorPlatformCustomerId;
//       const response = await customerApi.deleteCustomer(customerId);

//       if (response.success) {
//         toast.success('Customer deleted successfully!');
//         setShowDeleteModal(false);
//         setCustomerToDelete(null);
//         fetchCustomers();
//       }
//     } catch (error) {
//       console.error('Delete failed:', error);
//       toast.error(error.message || 'Failed to delete customer');
//     } finally {
//       setDeleteLoading(false);
//     }
//   };

//   // ===== NAVIGATION HANDLERS =====
//   const handleView = (customer) => {
//     const customerId = customer.temporaryCustomerId || customer.havmorPlatformCustomerId;
//     navigate(`/customers/${customerId}`);
//   };

//   const handleEdit = (customer) => {
//     const customerId = customer.temporaryCustomerId || customer.havmorPlatformCustomerId;
//     navigate(`/customers/edit/${customerId}`);
//   };

//   // ===== EXPORT TO CSV =====
//   const handleExport = () => {
//     if (filteredCustomers.length === 0) {
//       toast.error('No customers to export');
//       return;
//     }

//     const csvHeaders = [
//       'Shop Name',
//       'Customer Status',
//       'Customer ID',
//       'Phone',
//       'Email',
//       'City',
//       'State',
//       'PIN Code',
//     ];

//     const csvRows = filteredCustomers.map((customer) => [
//       customer.shopName,
//       customer.customerStatus,
//       customer.temporaryCustomerId || customer.havmorPlatformCustomerId,
//       customer.phone,
//       customer.email || 'N/A',
//       customer.customerAddress?.city || 'N/A',
//       customer.customerAddress?.state || 'N/A',
//       customer.customerAddress?.pinCode || 'N/A',
//     ]);

//     const csvContent = [
//       csvHeaders.join(','),
//       ...csvRows.map((row) => row.map((cell) => `"${cell}"`).join(',')),
//     ].join('\n');

//     const blob = new Blob([csvContent], { type: 'text/csv' });
//     const url = window.URL.createObjectURL(blob);
//     const a = document.createElement('a');
//     a.href = url;
//     a.download = `customers_${new Date().toISOString().split('T')[0]}.csv`;
//     a.click();
//     window.URL.revokeObjectURL(url);

//     toast.success('Customers exported successfully!');
//   };

//   // ===== DELETE MODAL =====
//   const DeleteModal = () => {
//     if (!showDeleteModal || !customerToDelete) return null;

//     return (
//       <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 px-4">
//         <div className="bg-white rounded-lg shadow-2xl max-w-md w-full">
//           <div className="border-b-2 border-gray-200 p-6 flex items-center justify-between">
//             <div className="flex items-center">
//               <div className="bg-red-100 p-3 rounded-full mr-4">
//                 <AlertCircle size={24} className="text-red-600" />
//               </div>
//               <div>
//                 <h3 className="text-xl font-bold text-black">Delete Customer</h3>
//                 <p className="text-sm text-gray-600 mt-1">This action cannot be undone</p>
//               </div>
//             </div>
//             <button
//               onClick={() => {
//                 setShowDeleteModal(false);
//                 setCustomerToDelete(null);
//               }}
//               className="text-gray-500 hover:text-black transition-colors"
//             >
//               <X size={24} />
//             </button>
//           </div>

//           <div className="p-6">
//             <p className="text-gray-700 mb-4">Are you sure you want to delete this customer?</p>
//             <div className="bg-vanilla rounded-lg p-4 space-y-2">
//               <div className="flex justify-between">
//                 <span className="text-gray-600 font-medium">Shop Name:</span>
//                 <span className="text-black font-semibold">{customerToDelete.shopName}</span>
//               </div>
//               <div className="flex justify-between">
//                 <span className="text-gray-600 font-medium">Phone:</span>
//                 <span className="text-black font-semibold">{customerToDelete.phone}</span>
//               </div>
//             </div>
//           </div>

//           <div className="border-t-2 border-gray-200 p-6 flex justify-end gap-4">
//             <button
//               onClick={() => {
//                 setShowDeleteModal(false);
//                 setCustomerToDelete(null);
//               }}
//               className="btn-outline h-12 px-6"
//               disabled={deleteLoading}
//             >
//               Cancel
//             </button>
//             <button
//               onClick={handleDeleteConfirm}
//               disabled={deleteLoading}
//               className={`bg-red-600 hover:bg-red-700 text-white font-semibold h-12 px-6 rounded-lg transition-colors flex items-center ${
//                 deleteLoading ? 'opacity-70 cursor-not-allowed' : ''
//               }`}
//             >
//               {deleteLoading ? (
//                 <>
//                   <Loader2 size={20} className="mr-2 animate-spin" />
//                   Deleting...
//                 </>
//               ) : (
//                 <>
//                   <Trash2 size={20} className="mr-2" />
//                   Delete
//                 </>
//               )}
//             </button>
//           </div>
//         </div>
//       </div>
//     );
//   };

//   // ===== EMPTY STATE =====
//   const EmptyState = () => (
//     <div className="card p-12 text-center">
//       <div className="flex flex-col items-center">
//         <div className="bg-vanilla p-6 rounded-full mb-6">
//           <Users size={48} className="text-coffee" />
//         </div>
//         <h3 className="text-2xl font-bold text-black mb-2">No Customers Found</h3>
//         <p className="text-gray-600 mb-6 max-w-md">
//           {searchQuery || filterStatus !== 'ALL'
//             ? 'Try adjusting your search or filters'
//             : 'Get started by adding your first customer'}
//         </p>
//         {!searchQuery && filterStatus === 'ALL' && (
//           <button onClick={() => navigate('/customers/add')} className="btn-primary h-12 px-8">
//             <Plus size={20} className="mr-2" />
//             Add First Customer
//           </button>
//         )}
//       </div>
//     </div>
//   );

//   // ===== LOADING STATE =====
//   if (loading) {
//     return (
//       <div className="bg-cream min-h-screen flex items-center justify-center">
//         <div className="text-center">
//           <Loader2 size={48} className="animate-spin text-black mx-auto mb-4" />
//           <p className="text-lg font-medium text-coffee">Loading customers...</p>
//         </div>
//       </div>
//     );
//   }

//   // ===== MAIN RENDER =====
//   return (
//     <div className="bg-cream min-h-screen px-4 py-6 sm:py-8">
//       <div className="mx-auto max-w-7xl">
//         {/* Header */}
//         <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
//           <div>
//             <h1 className="font-alpino text-4xl font-bold tracking-wide text-black sm:text-5xl">
//               All Customers
//             </h1>
//             <p className="text-coffee text-base font-medium tracking-wide mt-2">
//               {filteredCustomers.length} customer{filteredCustomers.length !== 1 ? 's' : ''} found
//             </p>
//           </div>
//           <button
//             onClick={() => navigate('/customers/add')}
//             className="btn-primary h-12 px-6 flex items-center"
//           >
//             <Plus size={20} className="mr-2" />
//             Add Customer
//           </button>
//         </div>

//         {/* Search & Filters */}
//         <div className="mb-6 flex flex-col sm:flex-row gap-4">
//           <div className="flex-1 relative">
//             <Search size={20} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
//             <input
//               type="text"
//               placeholder="Search customers..."
//               value={searchQuery}
//               onChange={(e) => setSearchQuery(e.target.value)}
//               className="h-12 w-full pl-12 pr-4 rounded-lg border-2 border-gray-300 focus:border-peach outline-none transition-all bg-white"
//             />
//           </div>

//           <div className="flex gap-4">
//             <div className="relative">
//               <select
//                 value={filterStatus}
//                 onChange={(e) => setFilterStatus(e.target.value)}
//                 className="h-12 pl-4 pr-10 rounded-lg border-2 border-gray-300 focus:border-peach outline-none transition-all cursor-pointer appearance-none bg-white font-medium"
//               >
//                 <option value="ALL">All Status</option>
//                 <option value="TEMPORARY">Temporary</option>
//                 <option value="PERMANENT">Permanent</option>
//               </select>
//               <Filter size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
//             </div>

//             <button
//               onClick={handleExport}
//               className="btn-outline h-12 px-4 flex items-center gap-2"
//               title="Export to CSV"
//             >
//               <Download size={20} />
//               <span className="hidden sm:inline">Export</span>
//             </button>
//           </div>
//         </div>

//         {/* Customers Grid */}
//         {filteredCustomers.length === 0 ? (
//           <EmptyState />
//         ) : (
//           <>
//             {/* Grid Layout */}
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
//               {paginatedCustomers.map((customer) => (
//                 <div
//                   key={
//                     customer._id ||
//                     customer.temporaryCustomerId ||
//                     customer.havmorPlatformCustomerId
//                   }
//                   className="card p-5 hover:shadow-xl transition-all duration-200 group"
//                 >
//                   {/* Card Header */}
//                   <div className="mb-4">
//                     <div className="flex items-start justify-between mb-2">
//                       <h3 className="text-lg font-bold text-black line-clamp-1 flex-1 mr-2">
//                         {customer.shopName}
//                       </h3>
//                       <span
//                         className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${
//                           customer.customerStatus === 'PERMANENT'
//                             ? 'bg-green-100 text-green-800'
//                             : 'bg-yellow-100 text-yellow-800'
//                         }`}
//                       >
//                         {customer.customerStatus === 'PERMANENT' ? (
//                           <CheckCircle size={12} className="inline mr-1" />
//                         ) : (
//                           '○'
//                         )}{' '}
//                         {customer.customerStatus === 'PERMANENT' ? 'Permanent' : 'Temporary'}
//                       </span>
//                     </div>
//                     <p className="text-xs text-gray-500 font-mono">
//                       ID: {customer.temporaryCustomerId || customer.havmorPlatformCustomerId}
//                     </p>
//                   </div>

//                   {/* Card Content */}
//                   <div className="space-y-2.5 mb-4 text-sm">
//                     <div className="flex items-center text-gray-700">
//                       <Phone size={16} className="mr-2 text-coffee flex-shrink-0" />
//                       <span className="font-medium">{customer.phone}</span>
//                     </div>

//                     {customer.email && (
//                       <div className="flex items-center text-gray-700">
//                         <Mail size={16} className="mr-2 text-coffee flex-shrink-0" />
//                         <span className="line-clamp-1">{customer.email}</span>
//                       </div>
//                     )}

//                     {customer.customerAddress?.city && (
//                       <div className="flex items-center text-gray-700">
//                         <MapPin size={16} className="mr-2 text-coffee flex-shrink-0" />
//                         <span className="line-clamp-1">
//                           {customer.customerAddress.city}, {customer.customerAddress.state}
//                         </span>
//                       </div>
//                     )}
//                   </div>

//                   {/* Card Actions */}
//                   <div className="flex gap-2 pt-3 border-t border-gray-200">
//                     <button
//                       onClick={() => handleView(customer)}
//                       className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-sm font-semibold"
//                     >
//                       <Eye size={16} />
//                       View
//                     </button>
//                     <button
//                       onClick={() => handleEdit(customer)}
//                       className="flex-1 h-9 flex items-center justify-center gap-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 transition-colors text-sm font-semibold"
//                     >
//                       <Pencil size={16} />
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDeleteClick(customer)}
//                       className="h-9 w-9 flex items-center justify-center rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
//                     >
//                       <Trash2 size={16} />
//                     </button>
//                   </div>
//                 </div>
//               ))}
//             </div>

//             {/* Pagination */}
//             {totalPages > 1 && (
//               <div className="card p-4 flex items-center justify-between">
//                 <p className="text-sm text-gray-600">
//                   Page {currentPage} of {totalPages}
//                 </p>

//                 <div className="flex gap-2">
//                   <button
//                     onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
//                     disabled={currentPage === 1}
//                     className="p-2 rounded-lg border-2 border-gray-300 hover:bg-vanilla disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     <ChevronLeft size={20} />
//                   </button>

//                   <div className="flex gap-1">
//                     {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
//                       let pageNum;
//                       if (totalPages <= 5) {
//                         pageNum = i + 1;
//                       } else if (currentPage <= 3) {
//                         pageNum = i + 1;
//                       } else if (currentPage >= totalPages - 2) {
//                         pageNum = totalPages - 4 + i;
//                       } else {
//                         pageNum = currentPage - 2 + i;
//                       }

//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => setCurrentPage(pageNum)}
//                           className={`h-10 w-10 rounded-lg font-semibold transition-colors ${
//                             currentPage === pageNum
//                               ? 'bg-black text-cream'
//                               : 'bg-white border-2 border-gray-300 hover:bg-vanilla'
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     })}
//                   </div>

//                   <button
//                     onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
//                     disabled={currentPage === totalPages}
//                     className="p-2 rounded-lg border-2 border-gray-300 hover:bg-vanilla disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//                   >
//                     <ChevronRight size={20} />
//                   </button>
//                 </div>
//               </div>
//             )}
//           </>
//         )}
//       </div>

//       <DeleteModal />
//     </div>
//   );
// };

// export default CustomersList;


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
