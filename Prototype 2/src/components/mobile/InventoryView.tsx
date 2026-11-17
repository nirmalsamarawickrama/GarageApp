import React, { useState } from 'react';
import {
  Camera,
  AlertTriangle,
  Plus,
  Minus,
  ArrowLeftRight,
  Search,
  Boxes,
  Sparkles,
  X,
  AlertCircle,
} from 'lucide-react';
import { InventoryItem, PartCategory } from '../../types';
import { INITIAL_BRANCHES } from '../../data/mockData';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onOpenScanner: () => void;
  onUpdateStock: (itemId: string, delta: number) => void;
  onTransferStock: (itemId: string, targetBranchId: string, qty: number) => boolean;
  canAdjustStock?: boolean;
  canTransferStock?: boolean;
  canScanBarcode?: boolean;
}

const CATEGORIES: ('ALL' | PartCategory)[] = [
  'ALL',
  'Brakes',
  'Fluids & Oils',
  'Filters',
  'Engine',
  'Suspension',
  'Electrical',
];

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onOpenScanner,
  onUpdateStock,
  onTransferStock,
  canAdjustStock = true,
  canTransferStock = true,
  canScanBarcode = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | PartCategory>('ALL');
  const [transferItemId, setTransferItemId] = useState<string | null>(null);
  const [transferQtyInput, setTransferQtyInput] = useState('1');
  const [targetBranch, setTargetBranch] = useState('');
  const [transferError, setTransferError] = useState<string | null>(null);

  const transferModalItem = transferItemId
    ? inventory.find((i) => i.id === transferItemId) || null
    : null;

  const destinationBranches = transferModalItem
    ? INITIAL_BRANCHES.filter((b) => b.id !== transferModalItem.branchId)
    : INITIAL_BRANCHES;

  const lowStockItems = inventory.filter((item) => item.stockQty <= item.minSafetyStock);

  const filteredItems = inventory.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      q === '' ||
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.oemNumber.toLowerCase().includes(q) ||
      item.barcode.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  const openTransferModal = (item: InventoryItem) => {
    const firstDest = INITIAL_BRANCHES.find((b) => b.id !== item.branchId)?.id || '';
    setTransferItemId(item.id);
    setTargetBranch(firstDest);
    setTransferQtyInput('1');
    setTransferError(null);
  };

  const closeTransferModal = () => {
    setTransferItemId(null);
    setTransferError(null);
  };

  const handleConfirmTransfer = () => {
    if (!transferModalItem) return;
    const qty = Number(transferQtyInput);
    if (!Number.isFinite(qty) || qty <= 0) {
      setTransferError('Enter a valid positive transfer quantity.');
      return;
    }
    if (qty > transferModalItem.stockQty) {
      setTransferError(
        `Cannot transfer ${qty} ${transferModalItem.unitOfMeasure}; only ${transferModalItem.stockQty} available.`
      );
      return;
    }
    if (!targetBranch || targetBranch === transferModalItem.branchId) {
      setTransferError('Select a different destination branch.');
      return;
    }

    const ok = onTransferStock(transferModalItem.id, targetBranch, qty);
    if (!ok) {
      setTransferError('Transfer could not be completed. Check available stock and branch.');
      return;
    }
    closeTransferModal();
  };

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* SECTOR 1: Stock Level Summary */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <Boxes size={14} color="var(--accent-primary)" /> Sector 1 &bull; Stock Level Summary
          </span>
          <span className="sg-sector-subtitle tabular">{inventory.length} cataloged SKUs</span>
        </div>

        <div className="sg-panel" style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div className="sg-grid-matrix" style={{ gridTemplateColumns: '1fr 1fr' }}>
            <div className="sg-grid-cell" style={{ padding: '14px' }}>
              <div className="sg-label">Total In Stock</div>
              <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700 }}>
                {inventory.reduce((acc, i) => acc + i.stockQty, 0)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Parts &amp; fluid units</div>
            </div>

            <div
              className="sg-grid-cell"
              style={{
                padding: '14px',
                background: lowStockItems.length > 0 ? 'var(--accent-amber-tint)' : 'var(--bg-surface)',
              }}
            >
              <div className="sg-label">Low Stock Alert</div>
              <div
                className="tabular"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: '26px',
                  fontWeight: 700,
                  color: lowStockItems.length > 0 ? 'var(--accent-amber)' : 'var(--accent-secondary)',
                }}
              >
                {lowStockItems.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {lowStockItems.length > 0 ? 'Needs reordering' : 'Healthy inventory'}
              </div>
            </div>
          </div>

          {lowStockItems.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                fontSize: '12px',
                fontWeight: 600,
                color: 'var(--accent-amber)',
                background: 'var(--accent-amber-tint)',
                border: '1px solid var(--accent-amber)',
                padding: '10px 12px',
              }}
            >
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>Restock recommended to prevent vehicle bay downtime.</span>
            </div>
          )}
        </div>
      </section>

      {/* SECTOR 2: Inventory Scanner Tool */}
      {canScanBarcode && (
        <section>
          <div className="sg-sector-header">
            <span className="sg-sector-title">
              <Sparkles size={14} /> Sector 2 &bull; Inventory Scanner Tool
            </span>
            <span className="sg-sector-subtitle">Barcode &amp; QR intake</span>
          </div>

          <button
            type="button"
            onClick={onOpenScanner}
            className="sg-btn sg-btn-volt sg-btn-lg"
            style={{ width: '100%' }}
          >
            <Camera size={18} /> Launch Optical Barcode Scanner
          </button>
        </section>
      )}

      {/* SECTOR 3: Parts Catalog */}
      <section>
        <div className="sg-sector-header">
          <span className="sg-sector-title">
            <Boxes size={14} /> Sector 3 &bull; Parts Catalog ({filteredItems.length})
          </span>
          <span className="sg-sector-subtitle">
            {canAdjustStock ? 'Live stock adjustment' : 'Read-only branch catalog'}
          </span>
        </div>

        <div style={{ position: 'relative', marginBottom: '12px' }}>
          <Search
            size={15}
            color="var(--text-muted)"
            style={{ position: 'absolute', left: '12px', top: '13px' }}
          />
          <input
            type="text"
            className="sg-input"
            placeholder="Search by part name, SKU, OEM, barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '36px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '14px' }}>
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`sg-btn sg-btn-sm ${isSelected ? 'sg-btn-primary' : 'sg-btn-secondary'}`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {filteredItems.map((item, idx) => {
            const isLowStock = item.stockQty <= item.minSafetyStock;

            return (
              <article
                key={item.id}
                className="sg-card-interactive stagger-item"
                style={{
                  '--stagger-index': idx,
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderColor: isLowStock ? 'var(--accent-amber)' : 'var(--border-strong)',
                } as React.CSSProperties}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700 }}>{item.name}</h4>
                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>
                      SKU: {item.sku} &bull; OEM: {item.oemNumber}
                    </div>
                  </div>
                  <span className="sg-badge sg-badge-intake">{item.category}</span>
                </div>

                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    paddingTop: '10px',
                    borderTop: '1px solid var(--border-subtle)',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Retail Price</div>
                    <div
                      className="tabular"
                      style={{
                        fontFamily: 'var(--font-mono)',
                        fontSize: '15px',
                        fontWeight: 700,
                        color: 'var(--accent-secondary)',
                      }}
                    >
                      ${item.retailPrice.toFixed(2)}
                      <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 400, marginLeft: '6px' }}>
                        (Cost: ${item.unitCost.toFixed(2)})
                      </span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    {canAdjustStock && (
                      <button
                        type="button"
                        onClick={() => onUpdateStock(item.id, -1)}
                        disabled={item.stockQty <= 0}
                        className="sg-btn sg-btn-danger sg-btn-sm"
                        style={{ width: '36px', minHeight: '36px', padding: 0 }}
                        aria-label={`Deduct 1 ${item.name}`}
                      >
                        <Minus size={14} />
                      </button>
                    )}

                    <div style={{ textAlign: 'center', minWidth: '48px' }}>
                      <div
                        className="tabular"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '16px',
                          fontWeight: 700,
                          color: isLowStock ? 'var(--accent-amber)' : 'var(--text-primary)',
                        }}
                      >
                        {item.stockQty}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>{item.unitOfMeasure}</div>
                    </div>

                    {canAdjustStock && (
                      <button
                        type="button"
                        onClick={() => onUpdateStock(item.id, 1)}
                        className="sg-btn sg-btn-emerald sg-btn-sm"
                        style={{ width: '36px', minHeight: '36px', padding: 0 }}
                        aria-label={`Restock 1 ${item.name}`}
                      >
                        <Plus size={14} />
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontFamily: 'var(--font-mono)', fontSize: '10px', color: 'var(--text-muted)' }}>
                    Safety Min: {item.minSafetyStock}
                  </span>
                  {canTransferStock && (
                    <button
                      type="button"
                      disabled={item.stockQty <= 0}
                      onClick={() => openTransferModal(item)}
                      className="sg-btn sg-btn-secondary sg-btn-sm"
                    >
                      <ArrowLeftRight size={12} /> Transfer Branch
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Transfer Modal */}
      {transferModalItem && (
        <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Inter-Branch Stock Transfer">
          <div className="sg-modal" style={{ maxWidth: '420px' }}>
            <div className="sg-modal-header">
              <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Inter-Branch Stock Transfer</h3>
              <button
                type="button"
                onClick={closeTransferModal}
                className="sg-btn sg-btn-secondary sg-btn-sm"
                aria-label="Close transfer modal"
              >
                <X size={16} />
              </button>
            </div>
            <div className="sg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <p style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                Transferring: <strong style={{ color: 'var(--text-primary)' }}>{transferModalItem.name}</strong> (Available:{' '}
                <span className="tabular">{transferModalItem.stockQty}</span>)
              </p>

              {transferError && (
                <div
                  style={{
                    padding: '10px 12px',
                    background: 'var(--accent-danger-tint)',
                    border: '1px solid var(--accent-danger)',
                    color: 'var(--accent-danger)',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                  }}
                >
                  <AlertCircle size={14} style={{ flexShrink: 0 }} />
                  <span>{transferError}</span>
                </div>
              )}

              <div>
                <label className="sg-label">Destination Branch</label>
                <select
                  className="sg-select"
                  value={targetBranch}
                  onChange={(e) => {
                    setTargetBranch(e.target.value);
                    setTransferError(null);
                  }}
                >
                  {destinationBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="sg-label">
                  Quantity to Transfer (Max: {transferModalItem.stockQty})
                </label>
                <input
                  type="number"
                  min="1"
                  max={transferModalItem.stockQty}
                  className="sg-input sg-input-mono"
                  value={transferQtyInput}
                  onChange={(e) => {
                    setTransferQtyInput(e.target.value);
                    setTransferError(null);
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={closeTransferModal}
                  className="sg-btn sg-btn-secondary"
                  style={{ flex: 1 }}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmTransfer}
                  className="sg-btn sg-btn-primary"
                  style={{ flex: 1 }}
                >
                  Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
