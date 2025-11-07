// src/features/master/pages/CategoryPage.jsx

import React from 'react';
import MasterList from '../components/MasterList';
import { MASTER_CONFIG } from '../config/master.config';

/**
 * Product Category Management Page
 * Wrapper component for MasterList
 */
const CategoryPage = () => {
  return <MasterList type="category" config={MASTER_CONFIG.category} />;
};

export default CategoryPage;
