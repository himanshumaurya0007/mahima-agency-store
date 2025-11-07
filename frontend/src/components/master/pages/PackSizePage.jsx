// src/features/master/pages/PackSizePage.jsx

import React from 'react';
import MasterList from '../components/MasterList';
import { MASTER_CONFIG } from '../config/master.config';

/**
 * Pack Size Management Page
 * Wrapper component for MasterList
 */
const PackSizePage = () => {
  return <MasterList type="packSize" config={MASTER_CONFIG.packSize} />;
};

export default PackSizePage;
