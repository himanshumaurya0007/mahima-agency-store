// src/features/master/config/master.config.js

/**
 * Master Data Management Configuration
 * Single source of truth for all master types
 */
export const MASTER_CONFIG = {
  category: {
    title: "Product Categories",
    singularTitle: "Category",
    apiEndpoint: "/masters/products/categories",
    searchPlaceholder: "Search by Category Name",
    addButtonLabel: "Add Category",
    
    fields: [
      {
        name: "name",
        label: "Category Name",
        type: "text",
        required: true,
        placeholder: "Enter category name",
        maxLength: 50,
      },
      {
        name: "code",
        label: "Category Code",
        type: "text",
        required: true,
        placeholder: "Enter category code",
        maxLength: 10,
        uppercase: true,
      },
    ],
    
    tableColumns: ["Category Name", "Code", "Status", "Actions"],
    
    // How to display data in table rows
    getRowData: (item) => ({
      name: item.name,
      code: item.code,
      isActive: item.isActive,
    }),
  },

  packSize: {
    title: "Pack Sizes",
    singularTitle: "Pack Size",
    apiEndpoint: "/masters/products/pack-sizes",
    searchPlaceholder: "Search by Pack Size",
    addButtonLabel: "Add Pack Size",
    
    fields: [
      {
        name: "name",
        label: "Pack Size",
        type: "text",
        required: true,
        placeholder: "Enter pack size (e.g., 500ML)",
        maxLength: 20,
        uppercase: true,
      },
    ],
    
    tableColumns: ["Pack Size", "Status", "Actions"],
    
    getRowData: (item) => ({
      name: item.name,
      isActive: item.isActive,
    }),
  },

  volumeUnit: {
    title: "Volume Units",
    singularTitle: "Volume Unit",
    apiEndpoint: "/masters/products/volume-units",
    searchPlaceholder: "Search by Unit",
    addButtonLabel: "Add Unit",
    
    fields: [
      {
        name: "name",
        label: "Volume Unit",
        type: "text",
        required: true,
        placeholder: "Enter unit (e.g., ML, L, KG)",
        maxLength: 10,
        uppercase: true,
      },
    ],
    
    tableColumns: ["Volume Unit", "Status", "Actions"],
    
    getRowData: (item) => ({
      name: item.name,
      isActive: item.isActive,
    }),
  },
};
