/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './LandingPage';
import DatabaseSelection from './DatabaseSelection';
import Dashboard from './Dashboard';
import Compliance from './Compliance';
import Architecture from './Architecture';
import LegalFramework from './LegalFramework';
import DigitalSignatures from './DigitalSignatures';
import GDPR from './GDPR';
import Healthcare from './Healthcare';
import CaseStudies from './CaseStudies';
import DataLifecycle from './DataLifecycle';
import DataClassification from './DataClassification';
import Penalties from './Penalties';
import ConsentManagement from './ConsentManagement';
import EncryptionComparison from './EncryptionComparison';
import AuditLog from './AuditLog';
import BreachDetection from './BreachDetection';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/selection" element={<DatabaseSelection />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/compliance" element={<Compliance />} />
      <Route path="/architecture" element={<Architecture />} />
      <Route path="/legal-framework" element={<LegalFramework />} />
      <Route path="/digital-signatures" element={<DigitalSignatures />} />
      <Route path="/gdpr" element={<GDPR />} />
      <Route path="/healthcare" element={<Healthcare />} />
      <Route path="/case-studies" element={<CaseStudies />} />
      <Route path="/data-lifecycle" element={<DataLifecycle />} />
      <Route path="/data-classification" element={<DataClassification />} />
      <Route path="/penalties" element={<Penalties />} />
      <Route path="/consent" element={<ConsentManagement />} />
      <Route path="/encryption" element={<EncryptionComparison />} />
      <Route path="/audit-log" element={<AuditLog />} />
      <Route path="/breach-detection" element={<BreachDetection />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
