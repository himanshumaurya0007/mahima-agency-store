// src/features/master/components/MasterList.jsx

import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Plus, Search, Trash2, X } from 'lucide-react';

import Button from '../../../components/common/Button';
import EmptyState from '../../../components/common/EmptyState';
import { PageLoader } from '../../../components/common/Loader';
import MasterModal from './MasterModal';
import authService from '../../../services/authService';
import masterApi from '../services/master.api';

/**
 * Master List Component
 * Reusable component for managing Categories, Pack Sizes, and Volume Units
 * @param {Object} config - Configuration object from master.config.js
 */
const MasterList = ({ config }) => {
  const navigate = useNavigate();

  // State
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [modal, setModal] = useState({
    isOpen: false,
    mode: null,
    item: null,
    loading: false,
  });

  // Auth check
  useEffect(() => {
    if (!authService.isAuthenticated()) {
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  // Fetch items
  const fetchItems = useCallback(async () => {
    try {
      setLoading(true);
      const response = await masterApi.getAll(config.apiEndpoint);

      if (response?.success) {
        const data = response.data || [];
        setItems(data);
        setFilteredItems(data);
      } else {
        setItems([]);
        setFilteredItems([]);
      }
    } catch (error) {
      console.error(`Fetch ${config.title} failed:`, error);
      toast.error(`Failed to load ${config.title.toLowerCase()}`);
      setItems([]);
      setFilteredItems([]);
    } finally {
      setLoading(false);
    }
  }, [config.apiEndpoint, config.title]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  // Search filter
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredItems(items);
      return;
    }

    const searchLower = searchTerm.toLowerCase();
    const filtered = items.filter((item) =>
      item.name?.toLowerCase().includes(searchLower) ||
      item.code?.toLowerCase().includes(searchLower)
    );
    setFilteredItems(filtered);
  }, [searchTerm, items]);

  // Modal actions
  const openModal = (mode, item = null) => {
    setModal({ isOpen: true, mode, item, loading: false });
  };

  const closeModal = () => {
    setModal({ isOpen: false, mode: null, item: null, loading: false });
  };

  // CRUD operations
  const handleCreate = async (formData) => {
    setModal((prev) => ({ ...prev, loading: true }));

    try {
      const response = await masterApi.create(config.apiEndpoint, formData);

      if (response.success) {
        toast.success(`${config.singularTitle} added successfully`);
        fetchItems();
        closeModal();
      }
    } catch (error) {
      const errorMsg =
        error.statusCode === 409
          ? `${config.singularTitle} already exists`
          : error.errors?.[0] || `Failed to add ${config.singularTitle.toLowerCase()}`;

      toast.error(errorMsg);
    } finally {
      setModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleDelete = async () => {
    if (!modal.item?._id) return;

    setModal((prev) => ({ ...prev, loading: true }));

    try {
      const response = await masterApi.delete(config.apiEndpoint, modal.item._id);

      if (response.success) {
        toast.success(`${config.singularTitle} deleted successfully`);
        setItems((prev) => prev.filter((item) => item._id !== modal.item._id));
        closeModal();
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error(`Failed to delete ${config.singularTitle.toLowerCase()}`);
    } finally {
      setModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleToggleStatus = async (item) => {
    try {
      const response = await masterApi.toggleStatus(
        config.apiEndpoint,
        item._id,
        item.isActive
      );

      if (response.success) {
        toast.success(`${config.singularTitle} status updated`);
        setItems((prev) =>
          prev.map((i) =>
            i._id === item._id ? { ...i, isActive: !i.isActive } : i
          )
        );
      }
    // eslint-disable-next-line no-unused-vars
    } catch (error) {
      toast.error('Failed to update status');
    }
  };

  // Render loading state
  if (loading) {
    return <PageLoader message={`Loading ${config.title.toLowerCase()}...`} />;
  }

  return (
    <div className="bg-cream min-h-screen px-4 py-6 sm:py-8 animate-fade-in">
      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <Header
          title={config.title}
          singularTitle={config.singularTitle}
          count={filteredItems.length}
          onAdd={() => openModal('add')}
          addButtonLabel={config.addButtonLabel}
        />

        {/* Search */}
        <SearchBar
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          placeholder={config.searchPlaceholder}
        />

        {/* Content */}
        {filteredItems.length === 0 ? (
          <EmptyState
            icon={Search}
            title={`No ${config.title} Found`}
            description={
              searchTerm
                ? 'Try adjusting your search'
                : `Start by adding your first ${config.singularTitle.toLowerCase()}`
            }
            actionLabel={!searchTerm ? config.addButtonLabel : undefined}
            onAction={!searchTerm ? () => openModal('add') : undefined}
          />
        ) : (
          <DataTable
            config={config}
            items={filteredItems}
            onToggle={handleToggleStatus}
            onDelete={(item) => openModal('delete', item)}
          />
        )}

        {/* Modal */}
        <MasterModal
          isOpen={modal.isOpen}
          mode={modal.mode}
          item={modal.item}
          config={config}
          onClose={closeModal}
          onSave={handleCreate}
          onDelete={handleDelete}
          loading={modal.loading}
        />
      </div>
    </div>
  );
};

// Sub-components

const Header = ({ title, singularTitle, count, onAdd, addButtonLabel }) => (
  <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
    <div className="space-y-1">
      <h1 className="font-alpino text-4xl font-bold tracking-wide text-black sm:text-5xl">
        {title}
      </h1>
      <p className="text-coffee text-base font-medium tracking-wide">
        {count} {singularTitle.toLowerCase()}
        {count !== 1 ? 's' : ''} found
      </p>
    </div>
    <Button 
      variant="primary" 
      icon={Plus} 
      onClick={onAdd} 
      className="h-12 px-6 cursor-pointer"
    >
      {addButtonLabel}
    </Button>
  </div>
);

const SearchBar = ({ searchTerm, onSearch, placeholder }) => (
  <div className="card mb-6 p-6">
    <div className="relative max-w-md">
      <Search
        size={20}
        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={searchTerm}
        onChange={(e) => onSearch(e.target.value)}
        className="h-12 w-full rounded-lg border-2 border-gray-300 bg-white pl-12 pr-10 text-base font-medium tracking-wider text-black outline-none transition-all duration-200 hover:border-gray-400 focus:border-peach focus:shadow-md cursor-text"
      />
      {searchTerm && (
        <button
          onClick={() => onSearch('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black transition-colors cursor-pointer"
          aria-label="Clear search"
        >
          <X size={20} />
        </button>
      )}
    </div>
  </div>
);

const DataTable = ({ config, items, onToggle, onDelete }) => {
  // Check if any item has a code field
  const hasCode = items.some((item) => config.getRowData(item).code);

  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full" style={{ tableLayout: 'fixed' }}>
          {/* Dynamic colgroup based on whether code exists */}
          <colgroup>
            {hasCode ? (
              <>
                <col style={{ width: '35%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '25%' }} />
              </>
            ) : (
              <>
                <col style={{ width: '50%' }} />
                <col style={{ width: '20%' }} />
                <col style={{ width: '30%' }} />
              </>
            )}
          </colgroup>

          <thead className="bg-gray-50 border-b-2 border-gray-200">
            <tr>
              {config.tableColumns.map((column) => (
                <th
                  key={column}
                  className="px-6 py-4 text-center text-sm font-bold tracking-wider text-black uppercase"
                >
                  {column}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-200">
            {items.map((item) => {
              const rowData = config.getRowData(item);
              return (
                <tr key={item._id} className="hover:bg-gray-50 transition-colors">
                  {/* Name Column */}
                  <td className="px-6 py-4 text-center text-base font-semibold text-black">
                    <div className="truncate" title={rowData.name}>
                      {rowData.name}
                    </div>
                  </td>

                  {/* Code Column - Only render if code exists */}
                  {rowData.code && (
                    <td className="px-6 py-4 text-center text-base font-medium text-gray-700">
                      {rowData.code}
                    </td>
                  )}

                  {/* Status Column */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center">
                      <ToggleSwitch
                        isActive={rowData.isActive}
                        onChange={() => onToggle(item)}
                      />
                    </div>
                  </td>

                  {/* Actions Column */}
                  <td className="px-6 py-4">
                    <div className="flex justify-center items-center">
                      <Button
                        variant="outline"
                        icon={Trash2}
                        onClick={() => onDelete(item)}
                        className="h-9 px-4 text-sm border-red-300 text-red-600 hover:bg-red-50 cursor-pointer"
                      >
                        Delete
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

const ToggleSwitch = ({ isActive, onChange }) => (
  <button
    onClick={onChange}
    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors cursor-pointer ${
      isActive ? 'bg-blue-600' : 'bg-gray-300'
    }`}
    aria-label={`Toggle status: ${isActive ? 'Active' : 'Inactive'}`}
  >
    <span
      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
        isActive ? 'translate-x-6' : 'translate-x-1'
      }`}
    />
  </button>
);

export default MasterList;
