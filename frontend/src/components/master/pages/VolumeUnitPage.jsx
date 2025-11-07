// src/features/master/pages/VolumeUnitPage.jsx

import React from 'react';
import MasterList from '../components/MasterList.jsx';
import { MASTER_CONFIG } from '../config/master.config.js';

/**
 * Volume Unit Management Page
 * Wrapper component for MasterList
 */
const VolumeUnitPage = () => {
  return <MasterList type="volumeUnit" config={MASTER_CONFIG.volumeUnit} />;
};

export default VolumeUnitPage;
