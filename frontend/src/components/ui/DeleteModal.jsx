import React from 'react';
import { AlertCircle, Trash2 } from 'lucide-react';
import Modal from './Modal';
import Button from './Button';

/**
 * Reusable Delete Confirmation Modal
 */
const DeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Delete Confirmation',
  message = 'Are you sure you want to delete this item?',
  itemDetails = null, // Object with key-value pairs to display
  loading = false,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md" showCloseButton={false}>
      {/* Header */}
      <div className="flex items-center mb-4">
        <div className="bg-red-100 p-3 rounded-full mr-4">
          <AlertCircle size={24} className="text-red-600" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-black">{title}</h3>
          <p className="text-sm text-gray-600 mt-1">
            This action cannot be undone
          </p>
        </div>
      </div>

      {/* Message */}
      <p className="text-gray-700 mb-4">{message}</p>

      {/* Item Details */}
      {itemDetails && (
        <div className="bg-vanilla rounded-lg p-4 space-y-2 mb-4">
          {Object.entries(itemDetails).map(([key, value]) => (
            <div key={key} className="flex justify-between">
              <span className="text-gray-600 font-medium">{key}</span>
              <span className="text-black font-semibold">{value}</span>
            </div>
          ))}
        </div>
      )}

      {/* Footer Buttons */}
      <div className="flex justify-end gap-4 mt-6">
        <Button variant="outline" onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="primary"
          onClick={onConfirm}
          loading={loading}
          icon={Trash2}
          className="bg-red-600 hover:bg-red-700"
        >
          Delete
        </Button>
      </div>
    </Modal>
  );
};

export default DeleteModal;
