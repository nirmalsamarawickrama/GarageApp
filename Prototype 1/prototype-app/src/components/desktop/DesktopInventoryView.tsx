import React, { useState } from 'react';
import { 
  Search, 
  ArrowRightLeft, 
  Plus, 
  Minus, 
  Barcode,
  Truck
} from 'lucide-react';
import { InventoryItem, PartCategory, GarageBranch } from '../../types';

interface DesktopInventoryViewProps {
  inventory: InventoryItem[];
  branches: GarageBranch[];
  activeBranchId: string;
  onUpdateStock: (itemId: string, delta: number) => void;
  onTransferStock: (itemId: string, targetBranchId: string, qty: number) => void;
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
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | PartCategory>('ALL');
  const [transferModalItem, setTransferModalItem] = useState<InventoryItem | null>(null);
  const [targetBranchId, setTargetBranchId] = useState(branches.find((b) => b.id !== activeBranchId)?.id || '');
  const [transferQty, setTransferQty] = useState(2);

  // Computations
  const totalValuation = inventory.reduce((sum, item) => sum + item.stockQty * item.unitCost, 0);
  const retailValuation = inventory.reduce((sum, item) => sum + item.stockQty * item.retailPrice, 0);
  const criticalItems = inventory.filter((item) => item.stockQty <= item.minSafetyStock);

  const filteredInventory = inventory.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.oemNumber.toLowerCase().includes(q) ||
      item.barcode.includes(q);
    return matchesCat && matchesSearch;
  });

  const handleExecuteTransfer = () => {
    if (transferModalItem && targetBranchId && transferQty > 0) {
      onTransferStock(transferModalItem.id, targetBranchId, transferQty);
      setTransferModalItem(null);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Inventory Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '18px' }}>
        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--text-muted)' }}>
            Warehouse Inventory Value
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-emerald)', marginTop: '8px' }}>
            ${totalValuation.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Retail potential: ${retailValuation.toLocaleString(undefined, { minimumFractionDigits: 2 })}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-cyan)' }}>
            Total Catalog Parts
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'white', marginTop: '8px' }}>
            {inventory.length} SKUs
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Active verified parts
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: '#f87171' }}>
            Critical Low Stock
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: criticalItems.length > 0 ? '#f87171' : '#34d399', marginTop: '8px' }}>
            {criticalItems.length} Alerts
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Below min safety stock threshold
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--accent-amber)' }}>
            Average Parts Markup
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--accent-amber)', marginTop: '8px' }}>
            114.6%
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-dim)', marginTop: '4px' }}>
            Average gross parts margin
          </div>
        </div>
      </div>

      {/* Search & Category Filter Bar */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
        padding: '16px 20px',
        borderRadius: '16px',
        background: 'rgba(15, 23, 42, 0.75)',
        border: '1px solid var(--border-card)',
      }}>
        {/* Search Input */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          background: 'var(--bg-input)',
          border: '1px solid var(--border-card)',
          borderRadius: '12px',
          padding: '8px 14px',
          width: '320px',
        }}>
          <Search size={16} color="var(--text-muted)" />
          <input
            type="text"
            placeholder="Search part name, OEM, SKU, barcode..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              background: 'transparent',
              border: 'none',
              outline: 'none',
              color: 'white',
              fontSize: '13px',
              width: '100%',
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                padding: '6px 14px',
                borderRadius: '10px',
                border: selectedCategory === cat ? '1px solid var(--accent-cyan)' : '1px solid var(--border-card)',
                background: selectedCategory === cat ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedCategory === cat ? 'var(--accent-cyan)' : 'var(--text-muted)',
                fontWeight: 700,
                fontSize: '12px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Desktop Parts Table */}
      <div className="glass-panel" style={{ padding: '0', overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr style={{
                background: 'rgba(11, 17, 32, 0.8)',
                color: 'var(--text-muted)',
                borderBottom: '1px solid var(--border-card)',
                textAlign: 'left',
              }}>
                <th style={{ padding: '14px 18px' }}>Part &amp; Description</th>
                <th style={{ padding: '14px 16px' }}>Category</th>
                <th style={{ padding: '14px 16px' }}>SKU / OEM #</th>
                <th style={{ padding: '14px 16px', textAlign: 'center' }}>In Stock</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Cost ($)</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Retail ($)</th>
                <th style={{ padding: '14px 16px', textAlign: 'right' }}>Margin</th>
                <th style={{ padding: '14px 18px', textAlign: 'center' }}>Stock Adjustment &amp; Transfer</th>
              </tr>
            </thead>
            <tbody>
              {filteredInventory.map((item) => {
                const isCritical = item.stockQty <= item.minSafetyStock;
                const marginPercent = Math.round(((item.retailPrice - item.unitCost) / item.unitCost) * 100);

                return (
                  <tr
                    key={item.id}
                    style={{
                      borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
                      background: isCritical ? 'rgba(239, 68, 68, 0.04)' : 'transparent',
                    }}
                  >
                    {/* Name & Barcode */}
                    <td style={{ padding: '14px 18px' }}>
                      <div style={{ fontWeight: 800, color: 'white' }}>{item.name}</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                        <Barcode size={12} />
                        <span>{item.barcode}</span>
                      </div>
                    </td>

                    {/* Category */}
                    <td style={{ padding: '14px 16px' }}>
                      <span style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: 'rgba(255, 255, 255, 0.06)',
                        color: 'var(--text-main)',
                      }}>
                        {item.category}
                      </span>
                    </td>

                    {/* SKU / OEM */}
                    <td style={{ padding: '14px 16px' }}>
                      <div style={{ fontWeight: 700, fontFamily: 'var(--font-mono)', color: 'var(--accent-cyan)' }}>
                        {item.sku}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>
                        OEM: {item.oemNumber}
                      </div>
                    </td>

                    {/* In Stock & Safety Meter */}
                    <td style={{ padding: '14px 16px', textAlign: 'center' }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: isCritical ? '#f87171' : 'white',
                      }}>
                        {item.stockQty} {item.unitOfMeasure}
                      </div>
                      <div style={{ fontSize: '10px', color: isCritical ? '#f87171' : 'var(--text-dim)' }}>
                        Min safety: {item.minSafetyStock}
                      </div>
                    </td>

                    {/* Cost */}
                    <td style={{ padding: '14px 16px', textAlign: 'right', color: 'var(--text-muted)' }}>
                      ${item.unitCost.toFixed(2)}
                    </td>

                    {/* Retail */}
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 700, color: 'var(--accent-emerald)' }}>
                      ${item.retailPrice.toFixed(2)}
                    </td>

                    {/* Margin */}
                    <td style={{ padding: '14px 16px', textAlign: 'right', fontWeight: 800, color: 'var(--accent-amber)' }}>
                      +{marginPercent}%
                    </td>

                    {/* Actions */}
                    <td style={{ padding: '14px 18px', textAlign: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                        {/* Deduct 1 */}
                        <button
                          onClick={() => onUpdateStock(item.id, -1)}
                          style={{
                            width: '28px',
                            height: '28px',
                            borderRadius: '8px',
                            background: 'rgba(239, 68, 68, 0.12)',
                            border: '1px solid rgba(239, 68, 68, 0.25)',
                            color: '#f87171',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                          title="Deduct 1 unit"
                        >
                          <Minus size={13} />
                        </button>

                        {/* Restock +5 */}
                        <button
                          onClick={() => onUpdateStock(item.id, 5)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.12)',
                            border: '1px solid rgba(16, 185, 129, 0.25)',
                            color: '#34d399',
                            fontSize: '11px',
                            fontWeight: 700,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                          title="Restock +5 units"
                        >
                          <Plus size={12} />
                          <span>5</span>
                        </button>

                        {/* Transfer Button */}
                        <button
                          onClick={() => setTransferModalItem(item)}
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          title="Transfer to another branch"
                        >
                          <ArrowRightLeft size={12} />
                          <span>Transfer</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Inter-Branch Transfer Modal */}
      {transferModalItem && (
        <div style={{
          position: 'fixed',
          inset: 0,
          zIndex: 130,
          background: 'rgba(0, 0, 0, 0.8)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
        }}>
          <div style={{
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-accent)',
            borderRadius: '20px',
            width: '100%',
            maxWidth: '500px',
            padding: '24px',
            boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'white', marginBottom: '8px' }}>
              Inter-Branch Stock Transfer
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '18px' }}>
              Transfer <strong>{transferModalItem.name}</strong> from current hub to another branch.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Destination Branch Hub
                </label>
                <select
                  value={targetBranchId}
                  onChange={(e) => setTargetBranchId(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                >
                  {branches.filter((b) => b.id !== activeBranchId).map((b) => (
                    <option key={b.id} value={b.id}>{b.name} ({b.city})</option>
                  ))}
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Quantity to Transfer (Max: {transferModalItem.stockQty})
                </label>
                <input
                  type="number"
                  min="1"
                  max={transferModalItem.stockQty}
                  value={transferQty}
                  onChange={(e) => setTransferQty(parseInt(e.target.value) || 1)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    borderRadius: '10px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border-card)',
                    color: 'white',
                    fontSize: '13px',
                  }}
                />
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
              <button onClick={() => setTransferModalItem(null)} className="btn-secondary">
                Cancel
              </button>
              <button onClick={handleExecuteTransfer} className="btn-primary">
                <Truck size={14} />
                <span>Confirm Transfer</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
