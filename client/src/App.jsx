import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import DashboardLayout from './components/layout/DashboardLayout';
import Summary from './pages/Summary/Summary';
import CreateTemplate from './pages/CreateTemplate/CreateTemplate';
import CreateCampaign from './pages/CreateCampaign/CreateCampaign';
import Chat from './pages/Chat/Chat';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        
        {/* Dashboard Routes */}
        <Route path="/dashboard" element={<DashboardLayout />}>
          <Route index element={<Navigate to="summary" replace />} />
          <Route path="summary" element={<Summary />} />
          <Route path="create-template" element={<CreateTemplate />} />
          <Route path="create-campaign" element={<CreateCampaign />} />
          <Route path="chat" element={<Chat />} />
        </Route>

        <Route path="/" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
