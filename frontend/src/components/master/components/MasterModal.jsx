// src/features/master/components/MasterModal.jsx

import React, { useState, useEffect } from 'react';
import { AlertCircle } from 'lucide-react';
import Modal from '../../../components/common/Modal';
import Input from '../../../components/common/Input';
import Button from '../../../components/common/Button';

/**
 * Master Modal Component
 * Handles Add and Delete operations
 */
const MasterModal = ({
  isOpen,
  mode,
  item,
  config,
  onClose,
  onSave,
  onDelete,
  loading,
}) => {
  const [formData, setFormData] = useState({});
  const [errors, setErrors] = useState({});

  // Initialize form
  useEffect(() => {
    const initialData = {};
    config.fields.forEach((field) => {
      initialData[field.name] = mode === 'add' ? '' : item?.[field.name] || '';
    });
    setFormData(initialData);
    setErrors({});
  }, [mode, item, config.fields]);

  // Handle input change
  const handleChange = (e) => {
    const { name, value } = e.target;
    const field = config.fields.find((f) => f.name === name);
    const finalValue = field?.uppercase ? value.toUpperCase() : value;

    setFormData((prev) => ({ ...prev, [name]: finalValue }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    config.fields.forEach((field) => {
      const value = formData[field.name]?.trim() || '';

      if (field.required && !value) {
        newErrors[field.name] = `${field.label} is required`;
      } else if (field.maxLength && value.length > field.maxLength) {
        newErrors[field.name] = `Max ${field.maxLength} characters`;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle save
  const handleSave = () => {
    if (!validateForm()) return;

    const sanitizedData = {};
    config.fields.forEach((field) => {
      sanitizedData[field.name] = formData[field.name]?.trim() || '';
    });

    onSave(sanitizedData);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${mode === 'add' ? 'Add' : 'Delete'} ${config.singularTitle}`}
      size="md"
      closeOnBackdrop={!loading}
      footer={
        <ModalFooter
          mode={mode}
          loading={loading}
          onClose={onClose}
          onSave={handleSave}
          onDelete={onDelete}
        />
      }
    >
      {mode === 'delete' ? (
        <DeleteConfirmation config={config} item={item} />
      ) : (
        <FormFields
          config={config}
          formData={formData}
          errors={errors}
          loading={loading}
          onChange={handleChange}
        />
      )}
    </Modal>
  );
};

const DeleteConfirmation = ({ config, item }) => (
  <div className="space-y-4">
    <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-lg">
      <AlertCircle size={20} className="text-red-600 flex-shrink-0 mt-0.5" />
      <div>
        <p className="text-sm font-semibold text-red-900">
          Delete this {config.singularTitle.toLowerCase()}?
        </p>
        <p className="text-sm text-red-700 mt-1">This action cannot be undone.</p>
      </div>
    </div>
    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
      {config.fields.map((field) => (
        <div key={field.name} className="flex justify-between">
          <span className="text-sm font-semibold text-gray-600">{field.label}:</span>
          <span className="text-sm font-bold text-black">
            {item?.[field.name] || 'N/A'}
          </span>
        </div>
      ))}
    </div>
  </div>
);

const FormFields = ({ config, formData, errors, loading, onChange }) => (
  <div className="space-y-4">
    {config.fields.map((field) => (
      <Input
        key={field.name}
        name={field.name}
        label={field.label}
        type={field.type}
        value={formData[field.name] || ''}
        onChange={onChange}
        placeholder={field.placeholder}
        required={field.required}
        error={errors[field.name]}
        disabled={loading}
        maxLength={field.maxLength}
      />
    ))}
  </div>
);

const ModalFooter = ({ mode, loading, onClose, onSave, onDelete }) => (
  <div className="flex gap-3">
    <Button variant="outline" onClick={onClose} disabled={loading} className="flex-1">
      {mode === 'delete' ? 'Cancel' : 'Discard'}
    </Button>
    <Button
      variant="primary"
      onClick={mode === 'delete' ? onDelete : onSave}
      loading={loading}
      className={`flex-1 ${mode === 'delete' ? 'bg-red-600 hover:bg-red-700' : ''}`}
    >
      {mode === 'delete' ? 'Delete' : 'Add'}
    </Button>
  </div>
);

export default MasterModal;
