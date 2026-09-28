import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useSasher } from '../../context/SasherContext';
import { CompletedOrder } from '../../types';
import { OrderHistory } from './OrderHistory';
import { 
  X, 
  User, 
  ShoppingBag, 
  Eye, 
  EyeOff,
  ShieldCheck, 
  CheckCircle2, 
  Database, 
  Sliders, 
  Sparkles, 
  LogOut, 
  Camera, 
  Layers, 
  Activity, 
  Award,
  Download,
  Truck,
  RotateCcw,
  ExternalLink,
  Plus,
  Trash2,
  Lock,
  MousePointer
} from 'lucide-react';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'orders' | 'profile' | 'calibration' | 'security';
  onOpenTracking: (order: CompletedOrder) => void;
  onOpenReturn: (order: CompletedOrder) => void;
  onSelectProduct?: (productId: string) => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'profile',
  onOpenTracking,
  onOpenReturn,
  onSelectProduct
}) => {
  const { user, isAuthenticated, signOut, openSignInModal, updateUserPreferences } = useAuth();
  const { 
    completedOrders, 
    openCalibration, 
    calibrationScore, 
    sessionIntent, 
    dynamicWeights,
    isEyeTrackingActive,
    toggleEyeTracking,
    setEyeTrackingActive,
    setIsVisualIntentModalOpen,
    currentGazeTarget
  } = useSasher();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'calibration' | 'security'>(initialTab);
  const [prefInput, setPrefInput] = useState('');

  if (!isOpen) return null;

  // Fallback patron profile if guest session
  const displayUser = user || {
    id: 'guest-patron',
    name: 'Valued Atelier Patron',
    email: 'client@sasher.luxury',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    provider: 'google' as const,
    savedPreferences: ['Architectural Outerwear', 'Cashmere Knitwear', 'Minimalist Tailoring'],
    recommendationHistoryCount: 42,
    lastLogin: 'Active Atelier Session',
    calibrationScore: calibrationScore || 94
  };

  const handleAddPreference = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prefInput.trim()) return;
    const updated = [...(displayUser.savedPreferences || []), prefInput.trim()];
    updateUserPreferences(updated);
    setPrefInput('');
  };

  const handleRemovePreference = (pref: string) => {
    const updated = (displayUser.savedPreferences || []).filter(p => p !== pref);
    updateUserPreferences(updated);
  };

  return (
    <div 
      className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div 
        className="relative w-full max-w-4xl bg-[#0e0f12] border border-white/[0.08] rounded-3xl shadow-2xl overflow-hidden my-auto flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Subtle Luxury Top Accent Line */}
        <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#d4a373] to-transparent" />

        {/* Modal Header with Editorial User Profile Card */}
        <div className="p-6 sm:p-7 bg-[#141518] border-b border-white/[0.08] flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <div className="relative">
              {displayUser.avatarUrl ? (
                <img
                  src={displayUser.avatarUrl}
                  alt={displayUser.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-[#d4a373]/40 shadow-lg"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#1f2024] to-[#121316] border border-[#d4a373]/30 flex items-center justify-center text-[#d4a373] font-editorial text-2xl shadow-lg">
                  {displayUser.name.charAt(0)}
                </div>
              )}
              <div 
                className={`absolute -bottom-1 -right-1 w-3.5 h-3.5 rounded-full border-2 border-[#141518] ${
                  isEyeTrackingActive ? 'bg-[#10b981]' : 'bg-[#71717a]'
                }`}
                title={isEyeTrackingActive ? 'Visual Intent Online' : 'Visual Intent Paused'}
              />
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2.5">
                <h3 className="font-editorial text-2xl text-[#f4f4f5] tracking-tight">
                  {displayUser.name}
                </h3>
                {isAuthenticated ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Google Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#d4a373]/15 text-[#d4a373] border border-[#d4a373]/30">
                    Atelier Guest Mode
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#a1a1aa]">
                <span>{displayUser.email}</span>
                <span aria-hidden="true" className="text-[#3f3f46]">·</span>
                <span className="text-[#d4a373] flex items-center gap-1 font-medium">
                  <Award className="w-3.5 h-3.5 text-[#d4a373]" />
                  <span>SASHER Haute Patron</span>
                </span>
                <span aria-hidden="true" className="text-[#3f3f46]">·</span>
                <span className="text-[#71717a]">{displayUser.lastLogin}</span>
              </div>
            </div>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2.5 self-start sm:self-center">
            
            {/* Visual Intent Quick Switch in User Profile Header */}
            <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-2xl border transition-all ${
              isEyeTrackingActive 
                ? 'bg-[#10b981]/10 border-[#10b981]/30 text-[#f4f4f5]' 
                : 'bg-white/[0.03] border-white/[0.08] text-[#71717a]'
            }`}>
              <div className="flex items-center gap-1.5">
                {isEyeTrackingActive ? (
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10b981] opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#10b981]"></span>
                  </span>
                ) : (
                  <span className="h-2 w-2 rounded-full bg-[#71717a]"></span>
                )}
                <div className="flex flex-col text-left">
                  <span className="text-[10px] font-semibold text-[#f4f4f5] leading-none flex items-center gap-1">
                    {isEyeTrackingActive ? <Eye className="w-3 h-3 text-[#10b981]" /> : <EyeOff className="w-3 h-3 text-[#71717a]" />}
                    Visual Intent
                  </span>
                  <span className={`text-[8px] font-mono font-bold mt-0.5 ${
                    isEyeTrackingActive ? 'text-[#10b981]' : 'text-[#71717a]'
                  }`}>
                    {isEyeTrackingActive ? 'ACTIVE (ON)' : 'PAUSED (OFF)'}
                  </span>
                </div>
              </div>
              
              <button
                onClick={() => toggleEyeTracking()}
                type="button"
                role="switch"
                aria-checked={isEyeTrackingActive}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border transition-colors duration-200 ease-in-out focus:outline-none ${
                  isEyeTrackingActive ? 'bg-[#10b981] border-[#10b981]' : 'bg-[#27272a] border-[#3f3f46]'
                }`}
                title={isEyeTrackingActive ? 'Click to Pause Visual Intent' : 'Click to Enable Visual Intent'}
                aria-label="Toggle Visual Intent On or Off"
              >
                <span className="sr-only">Toggle Visual Intent</span>
                <span
                  aria-hidden="true"
                  className={`pointer-events-none inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out mt-[1.5px] ${
                    isEyeTrackingActive ? 'translate-x-4' : 'translate-x-0.5'
                  }`}
                />
              </button>
            </div>

            {!isAuthenticated && (
              <button
                onClick={() => {
                  onClose();
                  openSignInModal();
                }}
                className="px-4 py-2 rounded-xl bg-[#d4a373] hover:bg-[#e0b487] text-[#0D0D0D] text-xs font-medium tracking-wide transition-colors shadow cursor-pointer"
              >
                Sign In with Google
              </button>
            )}

            {isAuthenticated && (
              <button
                onClick={async () => {
                  await signOut();
                  onClose();
                }}
                className="px-3 py-2 text-[#a1a1aa] hover:text-[#ef4444] bg-white/[0.03] hover:bg-[#ef4444]/10 rounded-xl transition-colors cursor-pointer border border-white/[0.08] hover:border-[#ef4444]/30 flex items-center gap-1.5 text-xs font-mono"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-[#a1a1aa] hover:text-[#f4f4f5] bg-white/[0.03] hover:bg-white/[0.08] rounded-xl transition-colors cursor-pointer border border-white/[0.08]"
              aria-label="Close profile modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="px-6 bg-[#111215] border-b border-white/[0.06] flex items-center gap-2 overflow-x-auto text-xs font-medium scrollbar-none">
          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#d4a373] text-[#f4f4f5] font-semibold'
                : 'border-transparent text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <Layers className="w-4 h-4 text-[#d4a373]" />
            <span>Profile & Style Vector</span>
          </button>

          <button
            onClick={() => setActiveTab('calibration')}
            className={`py-3.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'calibration'
                ? 'border-[#d4a373] text-[#f4f4f5] font-semibold'
                : 'border-transparent text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            {isEyeTrackingActive ? (
              <Eye className="w-4 h-4 text-[#10b981]" />
            ) : (
              <EyeOff className="w-4 h-4 text-[#71717a]" />
            )}
            <span>Visual Intent & Biometrics</span>
            <span 
              className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold ${
                isEyeTrackingActive 
                  ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30' 
                  : 'bg-white/[0.06] text-[#71717a]'
              }`}
            >
              {isEyeTrackingActive ? 'ON' : 'OFF'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#d4a373] text-[#f4f4f5] font-semibold'
                : 'border-transparent text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <ShoppingBag className="w-4 h-4 text-[#d4a373]" />
            <span>Order History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-white/[0.08] text-[#f4f4f5] text-[10px] font-mono tabular-nums">
              {completedOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#d4a373] text-[#f4f4f5] font-semibold'
                : 'border-transparent text-[#a1a1aa] hover:text-[#f4f4f5]'
            }`}
          >
            <ShieldCheck className="w-4 h-4 text-[#d4a373]" />
            <span>Security & Data Vault</span>
          </button>
        </div>

        {/* Modal Tab Content Area */}
        <div className="p-6 sm:p-7 overflow-y-auto flex-1 space-y-6">
          
          {/* TAB 1: PROFILE & STYLE VECTOR */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              
              {/* Aesthetic Preferences Section */}
              <div className="p-5 sm:p-6 bg-[#141518] border border-white/[0.08] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <h4 className="font-editorial text-xl text-[#f4f4f5]">
                      Curated Aesthetic Vectors & Style Preferences
                    </h4>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">
                      Explicit style tags directly modulate your personalization score (<span className="font-mono text-[#d4a373]">w_profile</span>) across the product catalog.
                    </p>
                  </div>
                  <span className="text-[11px] font-mono text-[#d4a373] bg-[#d4a373]/10 px-2.5 py-1 rounded-full border border-[#d4a373]/30 self-start sm:self-auto">
                    Active Vector Bias
                  </span>
                </div>

                {/* Preference Tags */}
                <div className="flex flex-wrap gap-2 pt-2">
                  {(displayUser.savedPreferences || []).map((pref, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#1b1c20] text-[#f4f4f5] text-xs border border-white/[0.08] hover:border-[#d4a373]/40 transition-colors"
                    >
                      <span>{pref}</span>
                      <button
                        onClick={() => handleRemovePreference(pref)}
                        className="text-[#71717a] hover:text-[#ef4444] transition-colors p-0.5 cursor-pointer"
                        title="Remove aesthetic"
                        aria-label={`Remove ${pref}`}
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Indian Fashion Preset Suggestions */}
                <div className="space-y-1.5 pt-2 border-t border-white/[0.04]">
                  <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">
                    Curated Indian E-Commerce Aesthetics (Click to Add):
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      'Chikankari Kurta',
                      'Raw Silk Saree',
                      'Royal Sherwani',
                      'Indo-Western Fusion',
                      'Handloom Linen',
                      'Banarasi Silk',
                      'Minimalist Tailoring'
                    ].map((preset) => {
                      const isAdded = (displayUser.savedPreferences || []).includes(preset);
                      return (
                        <button
                          key={preset}
                          type="button"
                          disabled={isAdded}
                          onClick={() => {
                            if (!isAdded) {
                              updateUserPreferences([...(displayUser.savedPreferences || []), preset]);
                            }
                          }}
                          className={`text-[11px] font-mono px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 ${
                            isAdded
                              ? 'bg-white/[0.02] border-white/[0.04] text-[#71717a] opacity-50 cursor-default'
                              : 'bg-white/[0.03] hover:bg-[#d4a373]/10 border-white/[0.08] hover:border-[#d4a373]/40 text-[#a1a1aa] hover:text-[#f4f4f5]'
                          }`}
                        >
                          <Plus className="w-3 h-3 text-[#d4a373]" />
                          <span>{preset}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Add new tag */}
                <form onSubmit={handleAddPreference} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={prefInput}
                    onChange={e => setPrefInput(e.target.value)}
                    placeholder="Add aesthetic (e.g. Japanese Selvedge Denim, Avant-Garde Draping)..."
                    className="flex-1 bg-[#1a1b1f] border border-white/[0.08] rounded-xl px-4 py-2.5 text-xs text-[#f4f4f5] placeholder-[#71717a] outline-none focus:border-[#d4a373]/60 transition-colors"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2.5 bg-[#d4a373]/15 hover:bg-[#d4a373]/25 text-[#d4a373] border border-[#d4a373]/40 rounded-xl text-xs font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Vector</span>
                  </button>
                </form>
              </div>

              {/* Real-time Session Intent Analytics */}
              <div className="p-5 sm:p-6 bg-[#141518] border border-white/[0.08] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-editorial text-xl text-[#f4f4f5]">
                      Current Session Intent Breakdown
                    </h4>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">
                      Interaction signals recorded during your active browsing slate.
                    </p>
                  </div>
                  <span className="text-[#10b981] flex items-center gap-1.5 text-xs font-mono">
                    <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
                    <span>Adapting Live</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">Primary Category</span>
                    <span className="text-base font-semibold text-[#d4a373] mt-0.5 block">
                      {sessionIntent.primaryCategory}
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">Intent Confidence</span>
                    <span className="text-base font-semibold text-[#10b981] mt-0.5 block">
                      {Math.round(sessionIntent.confidence * 100)}%
                    </span>
                  </div>
                  <div className="p-3.5 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] font-mono text-[#71717a] uppercase tracking-wider block">Session Interactions</span>
                    <span className="text-base font-semibold text-[#f4f4f5] mt-0.5 block">
                      {sessionIntent.totalInteractions} events
                    </span>
                  </div>
                </div>

                {/* Hybrid Weights Matrix */}
                <div className="space-y-2 pt-2">
                  <span className="text-xs font-mono text-[#71717a] block uppercase tracking-wider">
                    Hybrid Weight Distribution (MMR Slate Mix):
                  </span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center font-mono">
                    <div className="p-2.5 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-[#71717a] block">Gaze</span>
                      <span className="text-xs font-semibold text-[#d4a373]">{dynamicWeights.eyeGaze.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-[#71717a] block">Session</span>
                      <span className="text-xs font-semibold text-[#f4f4f5]">{dynamicWeights.session.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-[#71717a] block">Profile</span>
                      <span className="text-xs font-semibold text-[#d4a373]">{dynamicWeights.profile.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-[#71717a] block">Collab</span>
                      <span className="text-xs font-semibold text-[#f4f4f5]">{dynamicWeights.collaborative.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-[#71717a] block">Content</span>
                      <span className="text-xs font-semibold text-[#f4f4f5]">{dynamicWeights.content.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                      <span className="text-[10px] text-[#71717a] block">Popularity</span>
                      <span className="text-xs font-semibold text-[#71717a]">{dynamicWeights.popularity.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: VISUAL INTENT & BIOMETRICS (MASTER ON / OFF TOGGLE) */}
          {activeTab === 'calibration' && (
            <div className="space-y-6">
              
              {/* PRIMARY VISUAL INTENT ON/OFF CONTROL CARD */}
              <div className="p-6 bg-[#141518] border border-white/[0.08] rounded-2xl space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${
                        isEyeTrackingActive 
                          ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/40' 
                          : 'bg-white/[0.04] text-[#71717a] border-white/[0.08]'
                      }`}>
                        {isEyeTrackingActive ? <Eye className="w-5 h-5" /> : <EyeOff className="w-5 h-5" />}
                      </div>
                      <div>
                        <h4 className="font-editorial text-2xl text-[#f4f4f5]">
                          Visual Intent Tracking
                        </h4>
                        <div className="flex items-center gap-2">
                          <span 
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                              isEyeTrackingActive 
                                ? 'bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/40' 
                                : 'bg-white/[0.06] text-[#71717a] border border-white/[0.08]'
                            }`}
                          >
                            {isEyeTrackingActive ? 'STATE: ACTIVE (ON)' : 'STATE: PAUSED (OFF)'}
                          </span>
                          <span className="text-xs text-[#a1a1aa]">
                            {isEyeTrackingActive ? 'Recommendations adapting to attention' : 'Standard catalog sorting mode'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* MASTER ON / OFF TOGGLE SWITCH */}
                  <div className="flex items-center gap-3 self-start sm:self-center">
                    <span className="text-xs font-mono text-[#a1a1aa]">
                      {isEyeTrackingActive ? 'Active' : 'Paused'}
                    </span>
                    <button
                      onClick={() => toggleEyeTracking()}
                      type="button"
                      role="switch"
                      aria-checked={isEyeTrackingActive}
                      className={`relative inline-flex h-9 w-18 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-[#d4a373] focus:ring-offset-2 focus:ring-offset-[#141518] ${
                        isEyeTrackingActive 
                          ? 'bg-[#10b981] border-[#10b981]' 
                          : 'bg-[#27272a] border-[#3f3f46]'
                      }`}
                    >
                      <span className="sr-only">Toggle Visual Intent</span>
                      <span
                        aria-hidden="true"
                        className={`pointer-events-none inline-block h-8 w-8 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out flex items-center justify-center ${
                          isEyeTrackingActive ? 'translate-x-9' : 'translate-x-0'
                        }`}
                      >
                        {isEyeTrackingActive ? (
                          <Eye className="w-4 h-4 text-[#10b981]" />
                        ) : (
                          <EyeOff className="w-4 h-4 text-[#71717a]" />
                        )}
                      </span>
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-[#1b1c20] border border-white/[0.06] text-xs text-[#a1a1aa] leading-relaxed">
                  {isEyeTrackingActive ? (
                    <div className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#10b981] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[#f4f4f5] font-medium block">Attention Engine is Active</span>
                        <p className="text-[11px] text-[#a1a1aa] mt-0.5">
                          SASHER is observing non-sensitive interaction signals (hover dwell duration, focus lock, product card interactions) to elevate garments matching your visual intent.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-2.5">
                      <EyeOff className="w-4 h-4 text-[#71717a] shrink-0 mt-0.5" />
                      <div>
                        <span className="text-[#f4f4f5] font-medium block">Attention Engine is Paused</span>
                        <p className="text-[11px] text-[#71717a] mt-0.5">
                          Recommendations will strictly prioritize static brand selections and explicit wishlist additions without dynamic gaze or hover modulation.
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Quick Toggle Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEyeTrackingActive(true)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                        isEyeTrackingActive
                          ? 'bg-[#10b981]/20 text-[#10b981] border-[#10b981]/50 font-semibold'
                          : 'bg-white/[0.04] text-[#a1a1aa] border-white/[0.06] hover:bg-white/[0.08]'
                      }`}
                    >
                      Turn On Visual Intent
                    </button>
                    <button
                      onClick={() => setEyeTrackingActive(false)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors cursor-pointer border ${
                        !isEyeTrackingActive
                          ? 'bg-white/[0.12] text-[#f4f4f5] border-white/[0.24] font-semibold'
                          : 'bg-white/[0.04] text-[#a1a1aa] border-white/[0.06] hover:bg-white/[0.08]'
                      }`}
                    >
                      Turn Off (Pause)
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      onClose();
                      setIsVisualIntentModalOpen(true);
                    }}
                    className="text-xs font-mono text-[#d4a373] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>Open Visual Intent Configurator</span>
                    <ExternalLink className="w-3 h-3" />
                  </button>
                </div>
              </div>

              {/* 9-POINT OPTICAL CALIBRATION CARD */}
              <div className="p-6 bg-[#141518] border border-white/[0.08] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#d4a373]/15 text-[#d4a373] border border-[#d4a373]/30 flex items-center justify-center">
                      <Sliders className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-editorial text-xl text-[#f4f4f5]">
                        Optical Gaze Calibration Quality
                      </h4>
                      <p className="text-xs text-[#a1a1aa]">
                        Ocular coordinate precision synchronized with viewport focal nodes.
                      </p>
                    </div>
                  </div>

                  <span className="text-2xl font-editorial text-[#d4a373]">
                    {calibrationScore}%
                  </span>
                </div>

                <div className="w-full bg-[#1b1c20] rounded-full h-2 overflow-hidden border border-white/[0.06]">
                  <div
                    className="h-full bg-gradient-to-r from-[#d4a373] via-[#10b981] to-[#e0b487] transition-all duration-500"
                    style={{ width: `${calibrationScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-[#71717a] block uppercase">Dwell Threshold</span>
                    <span className="text-sm font-semibold text-[#f4f4f5]">1.20 Seconds</span>
                  </div>
                  <div className="p-3 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-[#71717a] block uppercase">Biometric Storage</span>
                    <span className="text-sm font-semibold text-[#10b981]">100% On-Device Only</span>
                  </div>
                  <div className="p-3 bg-[#1b1c20] rounded-xl border border-white/[0.06]">
                    <span className="text-[10px] text-[#71717a] block uppercase">Intent Weight w_gaze</span>
                    <span className="text-sm font-semibold text-[#d4a373]">
                      {isEyeTrackingActive ? dynamicWeights.eyeGaze.toFixed(2) : '0.00 (Muted)'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      openCalibration();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#d4a373]/15 hover:bg-[#d4a373]/25 border border-[#d4a373]/40 text-xs font-medium text-[#d4a373] transition-colors cursor-pointer"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Run 9-Point Calibration Target</span>
                  </button>
                </div>
              </div>

              {/* LIVE ATTENTION DIAGNOSTICS & TELEMETRY */}
              <div className="p-6 bg-[#141518] border border-white/[0.08] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <Activity className="w-4 h-4 text-[#d4a373]" />
                    <h4 className="font-editorial text-xl text-[#f4f4f5]">
                      Live Attention Diagnostics
                    </h4>
                  </div>
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                    isEyeTrackingActive
                      ? 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/30'
                      : 'bg-white/[0.04] text-[#71717a] border-white/[0.08]'
                  }`}>
                    {isEyeTrackingActive ? 'STREAMING REAL-TIME' : 'STREAM MUTED'}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3.5 rounded-xl bg-[#1b1c20] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono text-[#71717a] uppercase block">
                      Active Gaze Target
                    </span>
                    {isEyeTrackingActive && currentGazeTarget ? (
                      <div className="space-y-0.5">
                        <span className="text-[#f4f4f5] font-medium block truncate">
                          {currentGazeTarget.productName}
                        </span>
                        <div className="flex items-center gap-2 text-[11px] font-mono text-[#10b981]">
                          <span className="w-1.5 h-1.5 rounded-full bg-[#10b981] animate-ping" />
                          <span>Dwell: {currentGazeTarget.dwellSeconds.toFixed(2)}s · {currentGazeTarget.status}</span>
                        </div>
                      </div>
                    ) : isEyeTrackingActive ? (
                      <div className="space-y-0.5">
                        <span className="text-[#a1a1aa] block font-mono text-xs">
                          Scanning catalog viewport...
                        </span>
                        <span className="text-[10px] text-[#71717a] block">
                          Hover or linger on any garment to register intent
                        </span>
                      </div>
                    ) : (
                      <div className="space-y-0.5">
                        <span className="text-[#71717a] font-mono text-xs block">
                          Visual Intent Paused
                        </span>
                        <span className="text-[10px] text-[#52525b] block">
                          Enable engine above to stream attention signals
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#1b1c20] border border-white/[0.06] space-y-1">
                    <span className="text-[10px] font-mono text-[#71717a] uppercase block">
                      Cold-Start Intent Signal
                    </span>
                    <div className="space-y-0.5">
                      <span className="text-[#d4a373] font-medium block">
                        {sessionIntent.primaryCategory} ({Math.round(sessionIntent.confidence * 100)}% Confidence)
                      </span>
                      <span className="text-[10px] font-mono text-[#a1a1aa] block">
                        Weight Bias: w_gaze = {isEyeTrackingActive ? dynamicWeights.eyeGaze.toFixed(2) : '0.00'} · w_session = {dynamicWeights.session.toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* COLD-START MITIGATION IN INDIAN E-COMMERCE RESEARCH ARCHITECTURE */}
              <div className="p-6 bg-gradient-to-br from-[#141518] to-[#121316] border border-[#d4a373]/20 rounded-2xl space-y-3">
                <div className="flex items-center gap-2 text-[#d4a373] text-xs font-mono">
                  <Sparkles className="w-4 h-4 text-[#d4a373]" />
                  <span className="uppercase tracking-wider font-semibold">Research Architecture</span>
                </div>
                <h4 className="font-editorial text-lg text-[#f4f4f5]">
                  Cold-Start Mitigation for Indian E-Commerce
                </h4>
                <p className="text-xs text-[#a1a1aa] leading-relaxed">
                  Traditional collaborative filtering fails for new users (zero interaction history) and new festive garments (no sales data). SASHER fuses client-side visual attention, session decay vectors, and deep multimodal content embeddings to deliver immediate personalization without cold-start delay.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-2 text-[11px] font-mono">
                  <div className="p-2.5 bg-black/40 rounded-lg border border-white/[0.04]">
                    <span className="text-[#d4a373] block font-bold mb-0.5">User Cold-Start</span>
                    <span className="text-[#71717a]">Bootstrapped within 1.2s via first-fixation visual intent.</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded-lg border border-white/[0.04]">
                    <span className="text-[#10b981] block font-bold mb-0.5">Item Cold-Start</span>
                    <span className="text-[#71717a]">New silk sarees & sherwanis matched via CBF attribute similarity.</span>
                  </div>
                  <div className="p-2.5 bg-black/40 rounded-lg border border-white/[0.04]">
                    <span className="text-[#e0b487] block font-bold mb-0.5">Session Decay</span>
                    <span className="text-[#71717a]">Recent actions exponentially weighted over past clicks.</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: ORDER HISTORY */}
          {activeTab === 'orders' && (
            <div className="space-y-4">
              <OrderHistory
                orders={completedOrders}
                onOpenTracking={order => {
                  onClose();
                  onOpenTracking(order);
                }}
                onOpenReturn={order => {
                  onClose();
                  onOpenReturn(order);
                }}
                onSelectProduct={onSelectProduct}
                onExploreCatalog={() => onClose()}
              />
            </div>
          )}

          {/* TAB 4: SECURITY & DATA VAULT */}
          {activeTab === 'security' && (
            <div className="space-y-5">
              <div className="p-6 bg-[#141518] border border-white/[0.08] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-editorial text-xl text-[#f4f4f5]">
                      Cloud Storage & Identity Status
                    </h4>
                    <p className="text-xs text-[#a1a1aa] mt-0.5">
                      Encrypted session metadata synced with Firebase Cloud Storage.
                    </p>
                  </div>
                  <span className="text-[#10b981] flex items-center gap-1.5 font-mono text-xs">
                    <Database className="w-3.5 h-3.5" />
                    <span>Firestore Connected</span>
                  </span>
                </div>

                <div className="space-y-2 text-xs font-mono text-[#a1a1aa]">
                  <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                    <span className="text-[#71717a]">Cloud Database ID:</span>
                    <span className="text-[#f4f4f5] text-[11px]">ai-studio-sasheradaptivefa-afe4cb41...</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                    <span className="text-[#71717a]">Authentication Method:</span>
                    <span className="text-[#d4a373]">Google OAuth 2.0 / Firebase Auth</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5 border-b border-white/[0.06]">
                    <span className="text-[#71717a]">Security Protocol:</span>
                    <span className="text-[#10b981]">256-Bit TLS / Zero-Trust Firestore ABAC</span>
                  </div>
                  <div className="flex justify-between items-center py-2.5">
                    <span className="text-[#71717a]">Garment Provenance NFC Ledger:</span>
                    <span className="text-[#d4a373]">Active on Verified Atelier Purchases</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#10b981]/10 rounded-2xl border border-[#10b981]/25 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#10b981] shrink-0" />
                <span className="text-[#a1a1aa] text-xs leading-relaxed">
                  Your purchase history and styling telemetry are protected by zero-knowledge encrypted schemas. You can export or download official tax invoices for any purchase at any time.
                </span>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
