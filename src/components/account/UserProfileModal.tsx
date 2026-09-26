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
  ExternalLink
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
  initialTab = 'orders',
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
    wishlistIds 
  } = useSasher();

  const [activeTab, setActiveTab] = useState<'orders' | 'profile' | 'calibration' | 'security'>(initialTab);
  const [prefInput, setPrefInput] = useState('');

  if (!isOpen) return null;

  // Fallback demo profile if user hasn't signed in yet
  const displayUser = user || {
    id: 'guest-patron',
    name: 'Valued Atelier Patron',
    email: 'client@sasher.luxury',
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
    provider: 'google' as const,
    savedPreferences: ['Architectural Outerwear', 'Cashmere Knitwear', 'Minimalist Tailoring'],
    recommendationHistoryCount: 42,
    lastLogin: 'Today, Just Now',
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 font-sans">
      <div 
        className="relative w-full max-w-4xl bg-[#101114] border border-[#27272a] rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 my-auto flex flex-col max-h-[92vh]"
        onClick={e => e.stopPropagation()}
      >
        {/* Brand Accent Top Hairline */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#ff6b1a] via-[#e2a876] to-[#2997ff]" />

        {/* Modal Header with Profile Card */}
        <div className="p-6 bg-[#18191d] border-b border-[#27272a] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              {displayUser.avatarUrl ? (
                <img
                  src={displayUser.avatarUrl}
                  alt={displayUser.name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-[#2997ff] shadow-md"
                />
              ) : (
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#ff6b1a] to-[#2997ff] flex items-center justify-center text-white font-bold text-lg shadow-md">
                  {displayUser.name.charAt(0)}
                </div>
              )}
              <div 
                className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#10b981] border-2 border-[#18191d]" 
                title="Active Session Online"
              />
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-[#f5f5f7]">
                  {displayUser.name}
                </h3>
                {isAuthenticated ? (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center gap-1">
                    <CheckCircle2 className="w-2.5 h-2.5" />
                    <span>Google Verified</span>
                  </span>
                ) : (
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#ff6b1a]/15 text-[#ff6b1a] border border-[#ff6b1a]/30">
                    Atelier Guest Mode
                  </span>
                )}
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-[#71717a]">
                <span>{displayUser.email}</span>
                <span>·</span>
                <span className="text-[#a1a1aa] flex items-center gap-1">
                  <Award className="w-3 h-3 text-[#ff6b1a]" />
                  <span>SASHER Haute Patron</span>
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-center">
            {!isAuthenticated && (
              <button
                onClick={() => {
                  onClose();
                  openSignInModal();
                }}
                className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-[#ff6b1a] to-[#e2a876] text-[#09090b] text-xs font-mono font-bold tracking-wider uppercase transition-all shadow cursor-pointer hover:opacity-95"
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
                className="p-2 text-[#71717a] hover:text-[#ff453a] hover:bg-[#ff453a]/10 rounded-xl transition-colors cursor-pointer border border-transparent hover:border-[#ff453a]/30"
                title="Sign Out"
                aria-label="Sign out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}

            <button
              onClick={onClose}
              className="p-2 text-[#71717a] hover:text-[#f5f5f7] bg-[#141416] hover:bg-[#27272a] rounded-xl transition-colors cursor-pointer border border-[#27272a]"
              aria-label="Close profile modal"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Profile Tabs Navigation */}
        <div className="px-6 bg-[#141416] border-b border-[#27272a] flex items-center gap-2 overflow-x-auto text-xs font-mono scrollbar-none">
          <button
            onClick={() => setActiveTab('orders')}
            className={`py-3.5 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'orders'
                ? 'border-[#ff6b1a] text-[#ff6b1a] font-semibold'
                : 'border-transparent text-[#71717a] hover:text-[#f5f5f7]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Order History</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#27272a] text-[#f5f5f7] text-[10px] tabular-nums">
              {completedOrders.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('profile')}
            className={`py-3.5 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'profile'
                ? 'border-[#ff6b1a] text-[#ff6b1a] font-semibold'
                : 'border-transparent text-[#71717a] hover:text-[#f5f5f7]'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Style & Preferences</span>
          </button>

          <button
            onClick={() => setActiveTab('calibration')}
            className={`py-3.5 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'calibration'
                ? 'border-[#ff6b1a] text-[#ff6b1a] font-semibold'
                : 'border-transparent text-[#71717a] hover:text-[#f5f5f7]'
            }`}
          >
            <Eye className="w-4 h-4" />
            <span>Eye-Tracking & Biometrics</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#10b981]/15 text-[#10b981] text-[10px] tabular-nums">
              {calibrationScore}%
            </span>
          </button>

          <button
            onClick={() => setActiveTab('security')}
            className={`py-3.5 px-3 border-b-2 font-medium transition-colors cursor-pointer flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'security'
                ? 'border-[#ff6b1a] text-[#ff6b1a] font-semibold'
                : 'border-transparent text-[#71717a] hover:text-[#f5f5f7]'
            }`}
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Security & Ledger</span>
          </button>
        </div>

        {/* Modal Tab Content Area */}
        <div className="p-6 overflow-y-auto flex-1">
          {/* TAB 1: ORDER HISTORY */}
          {activeTab === 'orders' && (
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
          )}

          {/* TAB 2: STYLE & AESTHETIC PREFERENCES */}
          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="p-5 bg-[#18191d] border border-[#27272a] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-[#f5f5f7]">
                      Curated Aesthetic Tags & Silhouette Preferences
                    </h4>
                    <p className="text-xs text-[#71717a] mt-0.5">
                      Preferences directly bias your personalization vector (w_profile) across our catalog.
                    </p>
                  </div>
                  <span className="text-[10px] font-mono text-[#ff6b1a] bg-[#ff6b1a]/10 px-2 py-0.5 rounded-full border border-[#ff6b1a]/30">
                    Live Vector Bias
                  </span>
                </div>

                {/* Preference Tags */}
                <div className="flex flex-wrap gap-2 pt-1">
                  {(displayUser.savedPreferences || []).map((pref, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#27272a] text-[#f5f5f7] text-xs font-mono border border-[#3f3f46]/50"
                    >
                      <span>{pref}</span>
                      <button
                        onClick={() => handleRemovePreference(pref)}
                        className="text-[#71717a] hover:text-[#ff453a] transition-colors p-0.5"
                        title="Remove tag"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Add new tag */}
                <form onSubmit={handleAddPreference} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    value={prefInput}
                    onChange={e => setPrefInput(e.target.value)}
                    placeholder="Add aesthetic (e.g. Japanese Denim, Avant-Garde Draping)..."
                    className="flex-1 bg-[#141416] border border-[#27272a] rounded-xl px-3 py-2 text-xs font-mono text-[#f5f5f7] outline-none focus:border-[#ff6b1a]"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 bg-[#27272a] hover:bg-[#323236] text-[#f5f5f7] rounded-xl text-xs font-mono font-medium transition-colors cursor-pointer border border-[#3f3f46]"
                  >
                    Add Tag
                  </button>
                </form>
              </div>

              {/* Real-time Session Intent Analytics */}
              <div className="p-5 bg-[#18191d] border border-[#27272a] rounded-2xl space-y-4 font-mono text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa] font-bold uppercase tracking-wider">
                    Current Session Intent Breakdown
                  </span>
                  <span className="text-[#10b981] flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    <span>Real-time Active</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3 bg-[#141416] rounded-xl border border-[#27272a]">
                    <span className="text-[10px] text-[#71717a] block">Primary Category</span>
                    <span className="text-sm font-bold text-[#ff6b1a]">
                      {sessionIntent.primaryCategory}
                    </span>
                  </div>
                  <div className="p-3 bg-[#141416] rounded-xl border border-[#27272a]">
                    <span className="text-[10px] text-[#71717a] block">Intent Confidence</span>
                    <span className="text-sm font-bold text-[#10b981]">
                      {Math.round(sessionIntent.confidence * 100)}%
                    </span>
                  </div>
                  <div className="p-3 bg-[#141416] rounded-xl border border-[#27272a]">
                    <span className="text-[10px] text-[#71717a] block">Session Interactions</span>
                    <span className="text-sm font-bold text-[#2997ff]">
                      {sessionIntent.totalInteractions} events
                    </span>
                  </div>
                </div>

                <div className="space-y-2 pt-2">
                  <span className="text-[11px] text-[#71717a] block">Recommendation Weights (MMR Mix):</span>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 text-center text-[10px]">
                    <div className="p-2 bg-[#141416] rounded-lg border border-[#27272a]">
                      <span className="text-[#71717a] block">Gaze</span>
                      <strong className="text-[#ff6b1a]">{dynamicWeights.eyeGaze.toFixed(2)}</strong>
                    </div>
                    <div className="p-2 bg-[#141416] rounded-lg border border-[#27272a]">
                      <span className="text-[#71717a] block">Session</span>
                      <strong className="text-[#f5f5f7]">{dynamicWeights.session.toFixed(2)}</strong>
                    </div>
                    <div className="p-2 bg-[#141416] rounded-lg border border-[#27272a]">
                      <span className="text-[#71717a] block">Profile</span>
                      <strong className="text-[#2997ff]">{dynamicWeights.profile.toFixed(2)}</strong>
                    </div>
                    <div className="p-2 bg-[#141416] rounded-lg border border-[#27272a]">
                      <span className="text-[#71717a] block">Collab</span>
                      <strong className="text-[#f5f5f7]">{dynamicWeights.collaborative.toFixed(2)}</strong>
                    </div>
                    <div className="p-2 bg-[#141416] rounded-lg border border-[#27272a]">
                      <span className="text-[#71717a] block">Content</span>
                      <strong className="text-[#f5f5f7]">{dynamicWeights.content.toFixed(2)}</strong>
                    </div>
                    <div className="p-2 bg-[#141416] rounded-lg border border-[#27272a]">
                      <span className="text-[#71717a] block">Popularity</span>
                      <strong className="text-[#71717a]">{dynamicWeights.popularity.toFixed(2)}</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: EYE-TRACKING & BIOMETRIC ACCURACY */}
          {activeTab === 'calibration' && (
            <div className="space-y-6">
              <div className="p-5 bg-[#18191d] border border-[#27272a] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 flex items-center justify-center">
                      <Eye className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-[#f5f5f7]">
                        9-Point Optical Gaze Calibration
                      </h4>
                      <p className="text-xs text-[#71717a]">
                        Client-side visual attention model synchronized with your ocular focal points.
                      </p>
                    </div>
                  </div>

                  <span className="text-xl font-bold font-mono text-[#10b981]">
                    {calibrationScore}%
                  </span>
                </div>

                <div className="w-full bg-[#141416] rounded-full h-2 overflow-hidden border border-[#27272a]">
                  <div
                    className="h-full bg-gradient-to-r from-[#2997ff] via-[#10b981] to-[#ff6b1a] transition-all duration-500"
                    style={{ width: `${calibrationScore}%` }}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono">
                  <div className="p-3 bg-[#141416] rounded-xl border border-[#27272a]">
                    <span className="text-[10px] text-[#71717a] block">Optical Dwell Threshold</span>
                    <span className="text-sm font-semibold text-[#f5f5f7]">1.20 Seconds</span>
                  </div>
                  <div className="p-3 bg-[#141416] rounded-xl border border-[#27272a]">
                    <span className="text-[10px] text-[#71717a] block">Biometric Storage</span>
                    <span className="text-sm font-semibold text-[#10b981]">100% On-Device Only</span>
                  </div>
                  <div className="p-3 bg-[#141416] rounded-xl border border-[#27272a]">
                    <span className="text-[10px] text-[#71717a] block">Attention Weight w6</span>
                    <span className="text-sm font-semibold text-[#ff6b1a]">{dynamicWeights.eyeGaze.toFixed(2)}</span>
                  </div>
                </div>

                <div className="pt-2 flex justify-end">
                  <button
                    onClick={() => {
                      onClose();
                      openCalibration();
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#27272a] hover:bg-[#323236] border border-[#ff6b1a]/40 text-xs font-mono text-[#ff6b1a] transition-colors cursor-pointer font-medium"
                  >
                    <Sliders className="w-3.5 h-3.5" />
                    <span>Recalibrate 9-Point Eye Tracker</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: SECURITY & LEDGER PROOF */}
          {activeTab === 'security' && (
            <div className="space-y-4 font-mono text-xs">
              <div className="p-5 bg-[#18191d] border border-[#27272a] rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[#a1a1aa] font-bold uppercase tracking-wider">
                    Cloud Storage & Identity Status
                  </span>
                  <span className="text-[#10b981] flex items-center gap-1.5 font-mono text-xs">
                    <Database className="w-3.5 h-3.5" />
                    <span>Firestore Connected</span>
                  </span>
                </div>

                <div className="space-y-2 text-[#a1a1aa]">
                  <div className="flex justify-between items-center py-2 border-b border-[#27272a]">
                    <span className="text-[#71717a]">Cloud Database ID:</span>
                    <span className="text-[#f5f5f7] text-[11px]">ai-studio-sasheradaptivefa-afe4cb41...</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#27272a]">
                    <span className="text-[#71717a]">Authentication Method:</span>
                    <span className="text-[#2997ff]">Google OAuth 2.0 / Firebase Auth</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-[#27272a]">
                    <span className="text-[#71717a]">Security Protocol:</span>
                    <span className="text-[#10b981]">256-Bit TLS / Zero-Trust Firestore ABAC</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-[#71717a]">NFC Garment Provenance Tag:</span>
                    <span className="text-[#ff6b1a]">Active on All Completed Purchases</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-[#10b981]/10 rounded-2xl border border-[#10b981]/30 flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[#10b981] shrink-0" />
                <span className="text-[#a1a1aa] text-xs">
                  Your purchase history and personal styling telemetry are protected by zero-knowledge encrypted schemas. You can export or download your official tax invoices at any time.
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
