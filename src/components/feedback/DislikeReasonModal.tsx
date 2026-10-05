import React, { useState } from 'react';
import { X, ThumbsDown, AlertCircle, Check } from 'lucide-react';
import { Product } from '../../types';
import { adaptiveEngine } from '../../services/adaptiveEngine';
import { DislikeFeedbackSubmission } from '../../types/adaptiveFashion';

interface DislikeReasonModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
  onFeedbackApplied?: () => void;
}

const REASONS: { id: DislikeFeedbackSubmission['reason']; label: string; desc: string }[] = [
  { id: 'too_expensive', label: 'Too expensive', desc: 'Outside my realistic budget for this category' },
  { id: 'bad_color', label: 'Don\'t like color', desc: 'Doesn\'t complement my preferred palette or skin undertone' },
  { id: 'bad_fit', label: 'Don\'t like fit / silhouette', desc: 'Too tight, too oversized, or unflattering proportion' },
  { id: 'not_my_style', label: 'Not my style aesthetic', desc: 'Clashes with my personal wardrobe identity' },
  { id: 'already_own', label: 'Already own something similar', desc: 'Duplicate item in my closet' },
  { id: 'poor_quality', label: 'Material / brand mismatch', desc: 'Prefer different textiles or brands' },
  { id: 'other', label: 'Other reason', desc: 'General aesthetic misalignment' }
];

export const DislikeReasonModal: React.FC<DislikeReasonModalProps> = ({
  product,
  isOpen,
  onClose,
  onFeedbackApplied
}) => {
  const [selectedReason, setSelectedReason] = useState<DislikeFeedbackSubmission['reason']>('not_my_style');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  if (!isOpen || !product) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const reasonObj = REASONS.find(r => r.id === selectedReason);

    adaptiveEngine.recordDislike({
      productId: product.id,
      productName: product.name,
      reason: selectedReason,
      reasonLabel: reasonObj?.label || 'Not my style',
      notes: additionalNotes
    });

    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      onClose();
      if (onFeedbackApplied) onFeedbackApplied();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4 font-sans animate-in fade-in duration-200">
      <div 
        className="relative w-full max-w-md bg-[#121316] border border-white/[0.12] rounded-3xl p-6 sm:p-7 space-y-5 shadow-2xl"
        onClick={e => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-white/[0.08] pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <ThumbsDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] font-mono uppercase tracking-wider text-rose-400">
                RECOMMENDATION TUNING
              </div>
              <h3 className="font-editorial text-xl text-[#f4f4f5]">
                Why is this not for you?
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-[#71717a] hover:text-[#f4f4f5] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="text-xs text-[#a1a1aa] flex items-center gap-2 p-2.5 rounded-xl bg-[#16171b] border border-white/[0.04]">
          <span className="font-semibold text-[#f4f4f5] truncate">{product.name}</span>
          <span>·</span>
          <span>₹{product.price.toLocaleString('en-IN')}</span>
        </div>

        {isSubmitted ? (
          <div className="py-8 text-center space-y-2 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/40">
              <Check className="w-6 h-6" />
            </div>
            <h4 className="font-editorial text-lg text-[#f4f4f5]">Feedback Calibrated</h4>
            <p className="text-xs text-[#a1a1aa]">
              SASHER has adjusted your negative feature vectors to suppress similar pieces.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              {REASONS.map(r => (
                <label
                  key={r.id}
                  className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedReason === r.id 
                      ? 'bg-rose-500/10 border-rose-500/40 text-[#f4f4f5]' 
                      : 'bg-[#16171b] border-white/[0.06] text-[#a1a1aa] hover:bg-white/[0.03]'
                  }`}
                >
                  <input
                    type="radio"
                    name="dislike_reason"
                    checked={selectedReason === r.id}
                    onChange={() => setSelectedReason(r.id)}
                    className="mt-1 accent-rose-500"
                  />
                  <div>
                    <div className="font-semibold text-xs text-[#f4f4f5]">{r.label}</div>
                    <div className="text-[10px] text-[#71717a] mt-0.5">{r.desc}</div>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl bg-white/[0.05] text-xs text-[#a1a1aa] hover:text-[#f4f4f5]"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold text-xs tracking-wider uppercase transition-colors"
              >
                Apply Feedback
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
