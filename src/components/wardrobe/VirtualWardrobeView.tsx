import React, { useState } from 'react';
import { 
  Layers, 
  Plus, 
  Trash2, 
  Sparkles, 
  ShoppingBag, 
  Check, 
  ArrowRight, 
  Eye, 
  Shirt, 
  Compass,
  AlertCircle
} from 'lucide-react';
import { useSasher } from '../../context/SasherContext';
import { adaptiveEngine } from '../../services/adaptiveEngine';
import { 
  WardrobeItem, 
  CuratedOutfitLook, 
  FitPreferenceType, 
  OccasionType 
} from '../../types/adaptiveFashion';
import { Product } from '../../types';

interface VirtualWardrobeViewProps {
  onSelectProduct?: (product: Product) => void;
  onNavigateToCatalog?: () => void;
}

export const VirtualWardrobeView: React.FC<VirtualWardrobeViewProps> = ({
  onSelectProduct,
  onNavigateToCatalog
}) => {
  const { products, addToCart } = useSasher();
  const [wardrobe, setWardrobe] = useState<WardrobeItem[]>(() => adaptiveEngine.getWardrobe());
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string>('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState<boolean>(false);
  const [selectedForOutfit, setSelectedForOutfit] = useState<WardrobeItem | null>(null);
  const [generatedOutfit, setGeneratedOutfit] = useState<CuratedOutfitLook | null>(null);

  // New Item Form State
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<WardrobeItem['category']>('Shirt');
  const [newItemColor, setNewItemColor] = useState('Navy');
  const [newItemPattern, setNewItemPattern] = useState<WardrobeItem['pattern']>('Solid');
  const [newItemStyle, setNewItemStyle] = useState('Casual');
  const [newItemFit, setNewItemFit] = useState<FitPreferenceType>('Oversized');
  const [newItemBrand, setNewItemBrand] = useState('Uniqlo');
  const [newItemOccasion, setNewItemOccasion] = useState<OccasionType>('Casual');
  const [newItemImageUrl, setNewItemImageUrl] = useState('https://images.unsplash.com/photo-1596755094514-f87e34085b2c?auto=format&fit=crop&w=600&q=80');

  const filteredItems = activeCategoryFilter === 'All' 
    ? wardrobe 
    : wardrobe.filter(w => w.category === activeCategoryFilter);

  const handleCreateOutfit = (item: WardrobeItem) => {
    setSelectedForOutfit(item);
    const outfit = adaptiveEngine.createWardrobeHybridOutfit(item, products);
    setGeneratedOutfit(outfit);
  };

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const added = adaptiveEngine.addWardrobeItem({
      name: newItemName.trim(),
      category: newItemCategory,
      color: newItemColor,
      pattern: newItemPattern,
      style: newItemStyle,
      fit: newItemFit,
      brand: newItemBrand,
      occasion: newItemOccasion,
      imageUrl: newItemImageUrl || 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?auto=format&fit=crop&w=600&q=80'
    });

    setWardrobe(adaptiveEngine.getWardrobe());
    setIsAddModalOpen(false);
    setNewItemName('');
  };

  const handleDeleteItem = (id: string) => {
    adaptiveEngine.deleteWardrobeItem(id);
    setWardrobe(adaptiveEngine.getWardrobe());
    if (selectedForOutfit?.id === id) {
      setSelectedForOutfit(null);
      setGeneratedOutfit(null);
    }
  };

  return (
    <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10 font-sans">
      
      {/* Header & Stats Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-white/[0.08]">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-[#d4a373] mb-1">
            <Layers className="w-3.5 h-3.5" />
            <span>WARDROBE INTELLIGENCE & GAP ANALYSIS</span>
          </div>
          <h1 className="font-editorial text-3xl sm:text-4xl text-[#f4f4f5]">
            My Virtual Wardrobe
          </h1>
          <p className="text-xs sm:text-sm text-[#a1a1aa] mt-1">
            SASHER tracks the clothing you already own to complete high-synergy outfits without buying redundant pieces.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-5 py-2.5 rounded-xl bg-[#d4a373] hover:bg-[#e0b487] text-[#09090b] font-bold text-xs font-mono flex items-center gap-2 transition-all shadow-lg cursor-pointer shrink-0 self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Wardrobe Piece</span>
        </button>
      </div>

      {/* Capsule Wardrobe Gap Analysis Ribbon */}
      <div className="p-4 sm:p-5 rounded-2xl bg-[#141518] border border-amber-500/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-mono font-bold text-amber-300">
              Capsule Gap Recommendation
            </div>
            <p className="text-xs text-[#d4d4d8] mt-0.5">
              Your wardrobe has solid tops & sneakers, but lacks a <span className="text-[#f4f4f5] font-semibold">Structured Wool Overcoat</span> and <span className="text-[#f4f4f5] font-semibold">Pleated Linen Trousers</span> for formal/wedding versatility.
            </p>
          </div>
        </div>

        <button
          onClick={onNavigateToCatalog}
          className="px-3.5 py-1.5 rounded-xl bg-[#1f2025] hover:bg-white/[0.08] text-xs font-mono text-[#d4a373] border border-white/[0.08] shrink-0 transition-colors cursor-pointer"
        >
          Explore Gap Fillers →
        </button>
      </div>

      {/* Category Tabs: All, Shirt, Pants, Shoes, Jacket, Accessories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {['All', 'Shirt', 'Pants', 'Shoes', 'Jacket', 'Accessories'].map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategoryFilter(cat)}
            className={`px-4 py-2 rounded-xl text-xs font-mono transition-all cursor-pointer ${
              activeCategoryFilter === cat
                ? 'bg-[#d4a373] text-[#09090b] font-bold shadow'
                : 'bg-[#141518] text-[#a1a1aa] hover:text-[#f4f4f5] border border-white/[0.08]'
            }`}
          >
            {cat} {cat === 'All' ? `(${wardrobe.length})` : `(${wardrobe.filter(w => w.category === cat).length})`}
          </button>
        ))}
      </div>

      {/* Main Wardrobe Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5">
        {filteredItems.map(item => (
          <div 
            key={item.id}
            className="p-4 rounded-3xl bg-[#121316] border border-white/[0.08] hover:border-[#d4a373]/40 transition-all flex flex-col justify-between space-y-3 group"
          >
            {/* Image Stage */}
            <div className="relative aspect-[3/4] w-full rounded-2xl overflow-hidden bg-[#0c0d0f]">
              <img 
                src={item.imageUrl} 
                alt={item.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <div className="absolute top-2.5 left-2.5 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/30">
                OWNED PIECE
              </div>
              <button
                onClick={() => handleDeleteItem(item.id)}
                className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-black/70 text-[#71717a] hover:text-rose-400 transition-colors"
                title="Remove from Wardrobe"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Info & Attribute Tags */}
            <div className="space-y-1">
              <div className="text-[10px] font-mono text-[#a1a1aa]">
                {item.brand || 'Personal'} · {item.fit} Fit
              </div>
              <h3 className="font-semibold text-xs text-[#f4f4f5] truncate">
                {item.name}
              </h3>
              <div className="flex flex-wrap gap-1 pt-1">
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#d4d4d8]">
                  {item.color}
                </span>
                <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-white/[0.06] text-[#d4d4d8]">
                  {item.style}
                </span>
              </div>
            </div>

            {/* "Create An Outfit" Action */}
            <button
              onClick={() => handleCreateOutfit(item)}
              className="w-full py-2 px-3 rounded-xl bg-[#191b20] hover:bg-[#d4a373] text-[#d4a373] hover:text-[#09090b] font-mono text-xs font-semibold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Create Outfit</span>
            </button>
          </div>
        ))}
      </div>

      {/* Generated Outfit Drawer / Section (Feature 7 & 12) */}
      {generatedOutfit && selectedForOutfit && (
        <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#15171d] to-[#0e0f13] border border-[#d4a373]/40 shadow-2xl space-y-6 animate-in slide-in-from-bottom-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="text-xs font-mono uppercase tracking-wider text-[#10b981] flex items-center gap-1.5 mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                <span>HYBRID OUTFIT SYNTHESIS · OWNED + RECOMMENDED</span>
              </div>
              <h2 className="font-editorial text-2xl sm:text-3xl text-[#f4f4f5]">
                {generatedOutfit.title}
              </h2>
              <p className="text-xs text-[#a1a1aa]">
                {generatedOutfit.explanation}
              </p>
            </div>

            <div className="text-right">
              <span className="text-xs font-mono text-[#a1a1aa]">To Complete Look</span>
              <div className="text-2xl font-mono font-bold text-[#d4a373]">
                ₹{generatedOutfit.totalCost.toLocaleString('en-IN')}
              </div>
            </div>
          </div>

          {/* Items Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {generatedOutfit.items.map((it, idx) => (
              <div 
                key={idx}
                className={`p-4 rounded-2xl border flex flex-col justify-between space-y-3 ${
                  it.isOwned 
                    ? 'bg-[#121316] border-emerald-500/40' 
                    : 'bg-[#181a20] border-white/[0.08]'
                }`}
              >
                <div className="relative aspect-[3/4] rounded-xl overflow-hidden bg-[#0a0a0c]">
                  <img 
                    src={'imageUrl' in it.item ? it.item.imageUrl : ''} 
                    alt={it.item.name}
                    className="w-full h-full object-cover"
                  />
                  <div className={`absolute top-2 left-2 px-2 py-0.5 rounded-full text-[9px] font-mono font-bold ${
                    it.isOwned ? 'bg-emerald-500 text-[#09090b]' : 'bg-[#d4a373] text-[#09090b]'
                  }`}>
                    {it.isOwned ? 'IN YOUR CLOSET' : 'RECOMMENDED'}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] font-mono text-[#71717a] uppercase">{it.role}</div>
                  <div className="text-xs font-semibold text-[#f4f4f5] truncate">{it.item.name}</div>
                  <div className="text-xs font-mono text-[#d4a373] mt-0.5">
                    {it.isOwned ? '₹0 (Owned)' : `₹${it.price.toLocaleString('en-IN')} · ${it.retailer}`}
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              onClick={() => {
                generatedOutfit.items.forEach(it => {
                  if (!it.isOwned && 'id' in it.item) {
                    addToCart(it.item as Product);
                  }
                });
              }}
              className="px-6 py-3 rounded-xl bg-[#d4a373] hover:bg-[#e0b487] text-[#09090b] font-bold text-xs font-mono flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Missing Recommended Items to Cart</span>
            </button>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-[#121316] border border-white/[0.12] rounded-3xl p-6 sm:p-8 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4">
              <h3 className="font-editorial text-2xl text-[#f4f4f5]">
                Add Clothing Piece to Wardrobe
              </h3>
              <button 
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#71717a] hover:text-[#f4f4f5]"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddItem} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[#a1a1aa] block mb-1">Item Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Vintage Wash Black Denim Jacket"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#18191d] border border-white/[0.08] text-[#f4f4f5] outline-none font-sans"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#a1a1aa] block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#18191d] border border-white/[0.08] text-[#f4f4f5] outline-none"
                  >
                    <option value="Shirt">Shirt / Top</option>
                    <option value="Pants">Pants / Trousers</option>
                    <option value="Shoes">Shoes / Sneakers</option>
                    <option value="Jacket">Jacket / Outerwear</option>
                    <option value="Accessories">Accessories</option>
                    <option value="Traditional">Traditional / Ethnic</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#a1a1aa] block mb-1">Color</label>
                  <input
                    type="text"
                    value={newItemColor}
                    onChange={e => setNewItemColor(e.target.value)}
                    className="w-full p-2.5 rounded-xl bg-[#18191d] border border-white/[0.08] text-[#f4f4f5] outline-none font-sans"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[#a1a1aa] block mb-1">Fit</label>
                  <select
                    value={newItemFit}
                    onChange={e => setNewItemFit(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#18191d] border border-white/[0.08] text-[#f4f4f5] outline-none"
                  >
                    <option value="Oversized">Oversized</option>
                    <option value="Relaxed">Relaxed</option>
                    <option value="Regular">Regular</option>
                    <option value="Slim">Slim</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#a1a1aa] block mb-1">Occasion</label>
                  <select
                    value={newItemOccasion}
                    onChange={e => setNewItemOccasion(e.target.value as any)}
                    className="w-full p-2.5 rounded-xl bg-[#18191d] border border-white/[0.08] text-[#f4f4f5] outline-none"
                  >
                    <option value="College">College</option>
                    <option value="Casual">Casual</option>
                    <option value="Office">Office</option>
                    <option value="Party">Party</option>
                    <option value="Wedding">Wedding</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-[#a1a1aa] block mb-1">Image URL (Unsplash or Photo)</label>
                <input
                  type="text"
                  value={newItemImageUrl}
                  onChange={e => setNewItemImageUrl(e.target.value)}
                  className="w-full p-2.5 rounded-xl bg-[#18191d] border border-white/[0.08] text-[#f4f4f5] outline-none font-sans text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/[0.05] text-[#a1a1aa]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#d4a373] text-[#09090b] font-bold"
                >
                  Add Piece
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
