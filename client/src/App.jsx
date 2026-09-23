import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import LandingPage from './pages/LandingPage.jsx';
import UserPortal from './pages/UserPortal.jsx';
import AdminTracker from './pages/AdminTracker.jsx';
import ClientAdminPortal from './pages/ClientAdminPortal.jsx';
import OpportunityModal from './components/OpportunityModal.jsx';
import LoginModal from './components/LoginModal.jsx';
import IntentModal from './components/IntentModal.jsx';

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [currentView, setCurrentView] = useState('landing'); // 'landing', 'user', 'admin', 'client-admin'
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isIntentModalOpen, setIsIntentModalOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState(null);
  const [notification, setNotification] = useState(null);

  useEffect(() => {
    // Check if previously logged in
    const token = localStorage.getItem('token');
    if (token) {
      fetch('/api/auth/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.user) {
            setCurrentUser(data.user);
            
            // STRICT RULE:
            // Admin & Super Admin NEVER see the intent modal.
            // ONLY normal USERs who haven't selected their intent yet (first-time login) see the modal.
            if (data.user.role === 'USER' && !data.user.intent_selected) {
              setIsIntentModalOpen(true);
            }

            // Automatic smart redirect based on role
            if (data.user.role === 'SUPER_ADMIN') {
              setCurrentView('admin'); // Direct to HQ Lead Management & Referrals Console!
            } else if (data.user.role === 'ADMIN') {
              setCurrentView('client-admin'); // Direct to Client Hospital/College Intake Portal!
            } else {
              setCurrentView('user'); // Direct to Referrer Portal!
            }
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
        });
    }
  }, []);

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showNotification(`Welcome, ${user.name}!`);

    // STRICT RULE:
    // If role is ADMIN or SUPER_ADMIN -> NEVER ask the question!
    // If role is USER and intent is NOT selected yet -> Ask on first login only!
    if (user.role === 'USER' && !user.intent_selected) {
      setIsIntentModalOpen(true);
      return;
    }

    // Automatic role-based redirect right upon login
    if (user.role === 'SUPER_ADMIN') {
      setCurrentView('admin');
    } else if (user.role === 'ADMIN') {
      setCurrentView('client-admin');
    } else {
      setCurrentView('user');
    }
  };

  const handleIntentSelected = (updatedUser, redirectUrl) => {
    setCurrentUser(updatedUser);
    setIsIntentModalOpen(false);
    showNotification(`Workspace active for ${updatedUser.organization_name || updatedUser.name}!`);

    if (updatedUser.role === 'ADMIN') {
      setCurrentView('client-admin');
    } else {
      setCurrentView('user');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setCurrentUser(null);
    setCurrentView('landing');
    fetch('/api/auth/logout', { method: 'POST' });
    showNotification('Logged out successfully');
  };

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 4000);
  };

  const handleSaveOpportunity = async (formData) => {
    try {
      const isEdit = !!editingOpportunity;
      const url = isEdit ? `/api/opportunities/${editingOpportunity.id}` : '/api/opportunities';
      const method = isEdit ? 'PATCH' : 'POST';

      const token = localStorage.getItem('token');
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token || ''}`
        },
        body: JSON.stringify(formData)
      });

      const data = await res.json();
      if (res.ok) {
        setIsModalOpen(false);
        setEditingOpportunity(null);
        showNotification(isEdit ? 'Opportunity updated successfully!' : `Referral submitted! Job ID: ${data.job_id}`);
        
        // Refresh view
        if (currentUser?.role === 'SUPER_ADMIN') {
          setCurrentView('admin');
        } else {
          setCurrentView('user');
        }
      } else {
        alert(data.error || 'Failed to save opportunity');
      }
    } catch (err) {
      console.error('Error saving opportunity:', err);
      alert('Error connecting to server');
    }
  };

  const handleOpenSubmit = () => {
    if (!currentUser) {
      setIsLoginModalOpen(true);
    } else {
      setEditingOpportunity(null);
      setIsModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed bottom-5 right-5 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 text-xs font-bold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-3">
          <span>✨</span>
          <span>{notification}</span>
        </div>
      )}

      {/* Main Top Navigation */}
      <Navbar
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        currentView={currentView}
        setCurrentView={setCurrentView}
        onOpenSubmitModal={handleOpenSubmit}
        onOpenIntentModal={() => setIsIntentModalOpen(true)}
      />

      {/* Main Dynamic View Content */}
      <main className="flex-1">
        {currentView === 'landing' && (
          <LandingPage
            currentUser={currentUser}
            onStartReferring={handleOpenSubmit}
            onTrackRewards={() => {
              if (!currentUser) {
                setIsLoginModalOpen(true);
              } else if (currentUser.role === 'SUPER_ADMIN') {
                setCurrentView('admin');
              } else {
                setCurrentView('user');
              }
            }}
          />
        )}

        {currentView === 'user' && currentUser && (
          <UserPortal
            currentUser={currentUser}
            onOpenSubmitModal={handleOpenSubmit}
          />
        )}

        {currentView === 'client-admin' && currentUser && currentUser.role === 'ADMIN' && (
          <ClientAdminPortal
            currentUser={currentUser}
            onOpenSubmitModal={handleOpenSubmit}
          />
        )}

        {currentView === 'admin' && currentUser && currentUser.role === 'SUPER_ADMIN' && (
          <AdminTracker
            onOpenAddModal={() => {
              setEditingOpportunity(null);
              setIsModalOpen(true);
            }}
            onEditOpportunity={(opp) => {
              setEditingOpportunity(opp);
              setIsModalOpen(true);
            }}
          />
        )}
      </main>

      {/* Login & Registration Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Opportunity Submission & Edit Modal */}
      <OpportunityModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingOpportunity(null);
        }}
        onSave={handleSaveOpportunity}
        initialData={editingOpportunity}
        currentUser={currentUser}
      />

      {/* Post-Login Intent Selection Modal (Option 1: Business vs Option 2: Referrer) */}
      {isIntentModalOpen && currentUser && (
        <IntentModal
          currentUser={currentUser}
          onIntentSelected={handleIntentSelected}
          onDismiss={() => setIsIntentModalOpen(false)}
        />
      )}

      {/* Global Portal Footer (when not on landing page) */}
      {currentView !== 'landing' && (
        <footer className="border-t border-[#E5EAF0] bg-white py-6 px-4 text-center text-xs text-[#667085]">
          <p>© {new Date().getFullYear()} Referral & Rewards Platform. All rights reserved.</p>
        </footer>
      )}

    </div>
  );
}
