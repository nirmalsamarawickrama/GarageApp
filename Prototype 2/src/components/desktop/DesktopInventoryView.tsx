import React, { useState } from 'react';
import {
  Search,
  ArrowRightLeft,
  Plus,
  Minus,
  Barcode,
  Truck,
  Camera,
  X,
  AlertCircle,
} from 'lucide-react';
import { InventoryItem, PartCategory, GarageBranch } from '../../types';

interface DesktopInventoryViewProps {
  inventory: InventoryItem[];
  branches: GarageBranch[];
  activeBranchId: string;
  onUpdateStock: (itemId: string, delta: number) => void;
  onTransferStock: (itemId: string, targetBranchId: string, qty: number) => boolean;
  onOpenScanner?: () => void;
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

export const DesktopInventoryView: React.FC<DesktopInventoryViewProps> = ({
  inventory,
  branches,
  activeBranchId,
  onUpdateStock,
  onTransferStock,
  onOpenScanner,
  canAdjustStock = true,
  canTransferStock = true,
  canScanBarcode = true,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | PartCategory>('ALL');
  const [transferItemId, setTransferItemId] = useState<string | null>(null);
  const [targetBranchId, setTargetBranchId] = useState('');
  const [transferQtyInput, setTransferQtyInput] = useState('2');
  const [transferError, setTransferError] = useState<string | null>(null);

  const transferModalItem = transferItemId
    ? inventory.find((i) => i.id === transferItemId) || null
    : null;

  const destinationBranches = transferModalItem
    ? branches.filter((b) => b.id !== transferModalItem.branchId)
    : branches.filter((b) => b.id !== activeBranchId);

  const totalValuation = inventory.reduce((sum, item) => sum + item.stockQty * item.unitCost, 0);
  const retailValuation = inventory.reduce((sum, item) => sum + item.stockQty * item.retailPrice, 0);
  const criticalItems = inventory.filter((item) => item.stockQty <= item.minSafetyStock);

  const pricedItems = inventory.filter((item) => item.unitCost > 0);
  const avgMarkupPct =
    pricedItems.length > 0
      ? Math.round(
          (pricedItems.reduce(
            (sum, item) => sum + ((item.retailPrice - item.unitCost) / item.unitCost) * 100,
            0
          ) /
            pricedItems.length) *
            10
        ) / 10
      : 0;

  const filteredInventory = inventory.filter((item) => {
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
    const firstDest = branches.find((b) => b.id !== item.branchId)?.id || '';
    setTransferItemId(item.id);
    setTargetBranchId(firstDest);
    setTransferQtyInput(String(Math.min(2, Math.max(1, item.stockQty))));
    setTransferError(null);
  };

  const closeTransferModal = () => {
    setTransferItemId(null);
    setTransferError(null);
  };

  const handleExecuteTransfer = () => {
    if (!transferModalItem) return;
    const qty = Number(transferQtyInput);
    if (!Number.isFinite(qty) || qty <= 0) {
      setTransferError('Enter a valid positive quantity to transfer.');
      return;
    }
    if (qty > transferModalItem.stockQty) {
      setTransferError(
        `Cannot transfer ${qty} ${transferModalItem.unitOfMeasure}; only ${transferModalItem.stockQty} available.`
      );
      return;
    }
    if (!targetBranchId || targetBranchId === transferModalItem.branchId) {
      setTransferError('Select a different destination branch.');
      return;
    }

    const ok = onTransferStock(transferModalItem.id, targetBranchId, qty);
    if (!ok) {
      setTransferError('Transfer failed. Verify stock levels and destination branch.');
      return;
    }
    closeTransferModal();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Inventory Metrics */}
      <div className="sg-kpi-4">
        <div className="sg-grid-cell">
          <div className="sg-label">Warehouse Value</div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, color: 'var(--accent-secondary)', marginTop: '4px' }}>
            ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="tabular" style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Retail potential: ${retailValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
        </div>

        <div className="sg-grid-cell">
          <div className="sg-label">Total Catalog Parts</div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, marginTop: '4px' }}>
            {inventory.length} SKUs
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Active verified parts
          </div>
        </div>

        <div
          className="sg-grid-cell"
          style={{ background: criticalItems.length > 0 ? 'var(--accent-danger-tint)' : 'var(--bg-surface)' }}
        >
          <div className="sg-label">Critical Low Stock</div>
          <div
            className="tabular"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: '26px',
              fontWeight: 700,
              color: criticalItems.length > 0 ? 'var(--accent-danger)' : 'var(--accent-secondary)',
              marginTop: '4px',
            }}
          >
            {criticalItems.length} Alerts
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Below safety stock threshold
          </div>
        </div>

        <div className="sg-grid-cell">
          <div className="sg-label">Average Parts Markup</div>
          <div className="tabular" style={{ fontFamily: 'var(--font-mono)', fontSize: '26px', fontWeight: 700, color: 'var(--accent-amber)', marginTop: '4px' }}>
            {avgMarkupPct}%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Retail vs. unit cost markup
          </div>
        </div>
      </div>

      {/* Filter & Scanner Control Bar */}
      <div
        className="sg-panel"
        style={{
          padding: '14px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ position: 'relative', width: '280px' }}>
          <Search size={14} color="var(--text-muted)" style={{ position: 'absolute', left: '10px', top: '13px' }} />
          <input
            type="text"
            className="sg-input"
            placeholder="Search part name, OEM, SKU, barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '32px' }}
          />
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`sg-btn sg-btn-sm ${selectedCategory === cat ? 'sg-btn-primary' : 'sg-btn-secondary'}`}
            >
              {cat}
            </button>
          ))}
        </div>

        {onOpenScanner && canScanBarcode && (
          <button type="button" onClick={onOpenScanner} className="sg-btn sg-btn-volt">
            <Camera size={15} /> Optical Barcode Scanner
          </button>
        )}
      </div>

      {/* Parts Table */}
      <div className="sg-table-wrap">
        <table className="sg-table">
          <thead>
            <tr>
              <th>Part &amp; Description</th>
              <th>Category</th>
              <th>SKU / OEM #</th>
              <th style={{ textAlign: 'center' }}>In Stock</th>
              <th style={{ textAlign: 'right' }}>Cost ($)</th>
              <th style={{ textAlign: 'right' }}>Retail ($)</th>
              <th style={{ textAlign: 'right' }}>Markup</th>
              <th style={{ textAlign: 'center' }}>Stock Adjustment &amp; Transfer</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.length === 0 ? (
              <tr>
                <td colSpan={8} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No inventory SKUs found in this branch matching your filters.
                </td>
              </tr>
            ) : (
              filteredInventory.map((item) => {
                const isCritical = item.stockQty <= item.minSafetyStock;
                const markupPercent =
                  item.unitCost > 0
                    ? Math.round(((item.retailPrice - item.unitCost) / item.unitCost) * 100)
                    : 0;

                return (
                  <tr
                    key={item.id}
                    style={{
                      background: isCritical ? 'var(--accent-danger-tint)' : 'transparent',
                    }}
                  >
                    <td>
                      <div style={{ fontWeight: 700 }}>{item.name}</div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Barcode size={12} /> {item.barcode}
                      </div>
                    </td>

                    <td>
                      <span className="sg-badge sg-badge-intake">{item.category}</span>
                    </td>

                    <td>
                      <div style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-primary)' }}>
                        {item.sku}
                      </div>
                      <div style={{ fontFamily: 'var(--font-mono)', fontSize: '11px', color: 'var(--text-muted)' }}>
                        OEM: {item.oemNumber}
                      </div>
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div
                        className="tabular"
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontSize: '15px',
                          fontWeight: 700,
                          color: isCritical ? 'var(--accent-danger)' : 'var(--text-primary)',
                        }}
                      >
                        {item.stockQty} {item.unitOfMeasure}
                      </div>
                      <div style={{ fontSize: '10px', color: isCritical ? 'var(--accent-danger)' : 'var(--text-muted)' }}>
                        Min safety: {item.minSafetyStock}
                      </div>
                    </td>

                    <td className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
                      ${item.unitCost.toFixed(2)}
                    </td>

                    <td className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-secondary)' }}>
                      ${item.retailPrice.toFixed(2)}
                    </td>

                    <td className="tabular" style={{ textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700, color: 'var(--accent-amber)' }}>
                      +{markupPercent}%
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                        {canAdjustStock && (
                          <>
                            <button
                              type="button"
                              disabled={item.stockQty <= 0}
                              onClick={() => onUpdateStock(item.id, -1)}
                              className="sg-btn sg-btn-danger sg-btn-sm"
                              style={{ minHeight: '28px', width: '28px', padding: 0 }}
                              title="Deduct 1 unit"
                              aria-label={`Deduct 1 ${item.name}`}
                            >
                              <Minus size={12} />
                            </button>

                            <button
                              type="button"
                              onClick={() => onUpdateStock(item.id, 5)}
                              className="sg-btn sg-btn-emerald sg-btn-sm"
                              style={{ minHeight: '28px', padding: '3px 8px', fontSize: '11px' }}
                              title="Restock +5 units"
                            >
                              <Plus size={12} /> 5
                            </button>
                          </>
                        )}

                        {canTransferStock && (
                          <button
                            type="button"
                            disabled={item.stockQty <= 0}
                            onClick={() => openTransferModal(item)}
                            className="sg-btn sg-btn-secondary sg-btn-sm"
                            style={{ minHeight: '28px', padding: '3px 8px', fontSize: '11px' }}
                          >
                            <ArrowRightLeft size={12} /> Transfer
                          </button>
                        )}

                        {!canAdjustStock && !canTransferStock && (
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Read only</span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Inter-Branch Transfer Modal */}
      {transferModalItem && (
        <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Inter-Branch Stock Transfer">
          <div className="sg-modal" style={{ maxWidth: '480px' }}>
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
                Transfer <strong style={{ color: 'var(--text-primary)' }}>{transferModalItem.name}</strong> from current
                hub to another branch.
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
                <label className="sg-label">Destination Branch Hub</label>
                <select
                  className="sg-select"
                  value={targetBranchId}
                  onChange={(e) => {
                    setTargetBranchId(e.target.value);
                    setTransferError(null);
                  }}
                >
                  {destinationBranches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} ({b.city})
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

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
                <button
                  type="button"
                  onClick={closeTransferModal}
                  className="sg-btn sg-btn-secondary"
                >
                  Cancel
                </button>
                <button type="button" onClick={handleExecuteTransfer} className="sg-btn sg-btn-primary">
                  <Truck size={14} /> Confirm Transfer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
