import React, { useState } from 'react';
import { Camera, AlertTriangle, Plus, Minus, ArrowLeftRight, Search, Boxes, Sparkles } from 'lucide-react';
import { InventoryItem } from '../../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onOpenScanner: () => void;
  onUpdateStock: (itemId: string, delta: number) => void;
  onTransferStock: (itemId: string, targetBranchId: string, qty: number) => void;
}

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onOpenScanner,
  onUpdateStock,
  onTransferStock,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [transferModalItem, setTransferModalItem] = useState<InventoryItem | null>(null);
  const [transferQty, setTransferQty] = useState(1);
  const [targetBranch, setTargetBranch] = useState('branch-2');

  const lowStockItems = inventory.filter((item) => item.stockQty <= item.minSafetyStock);

  const filteredItems = inventory.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesSearch =
      searchQuery === '' ||
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.oemNumber.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ['ALL', 'Brakes', 'Fluids & Oils', 'Filters', 'Engine', 'Suspension'];

  const handleConfirmTransfer = () => {
    if (transferModalItem && transferQty > 0) {
      onTransferStock(transferModalItem.id, targetBranch, transferQty);
      setTransferModalItem(null);
    }
  };

  return (
    <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* SECTOR 1: Stock Status & Attention Alerts */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <Boxes size={14} /> Sector 1 &bull; Stock Level Summary
          </span>
          <span className="sector-subtitle">{inventory.length} cataloged SKUs</span>
        </div>

        <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div style={{ background: 'rgba(255, 255, 255, 0.03)', padding: '14px', borderRadius: '14px', border: '1px solid var(--border-subtle)' }}>
              <div style={{ fontSize: '11px', color: 'var(--text-dim)', textTransform: 'uppercase' }}>Total In Stock</div>
              <div style={{ fontSize: '24px', fontWeight: 800, color: 'white', fontFamily: 'var(--font-mono)', marginTop: '4px' }}>
                {inventory.reduce((acc, i) => acc + i.stockQty, 0)}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Parts & fluid units</div>
            </div>

            <div style={{
              background: lowStockItems.length > 0 ? 'rgba(245, 158, 11, 0.08)' : 'rgba(255, 255, 255, 0.03)',
              padding: '14px',
              borderRadius: '14px',
              border: `1px solid ${lowStockItems.length > 0 ? 'rgba(245, 158, 11, 0.3)' : 'var(--border-subtle)'}`,
            }}>
              <div style={{ fontSize: '11px', color: lowStockItems.length > 0 ? '#fbbf24' : 'var(--text-dim)', textTransform: 'uppercase' }}>
                Low Stock Alert
              </div>
              <div style={{
                fontSize: '24px',
                fontWeight: 800,
                color: lowStockItems.length > 0 ? '#f59e0b' : 'var(--accent-emerald)',
                fontFamily: 'var(--font-mono)',
                marginTop: '4px',
              }}>
                {lowStockItems.length}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                {lowStockItems.length > 0 ? 'Needs reordering' : 'Healthy inventory'}
              </div>
            </div>
          </div>

          {lowStockItems.length > 0 && (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              fontSize: '12px',
              color: '#fbbf24',
              background: 'rgba(245, 158, 11, 0.06)',
              padding: '10px 12px',
              borderRadius: '10px',
            }}>
              <AlertTriangle size={15} style={{ flexShrink: 0 }} />
              <span>Restock recommended to prevent vehicle bay downtime.</span>
            </div>
          )}
        </div>
      </section>

      {/* SECTOR 2: Warehouse Equipment & Tools */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <Sparkles size={14} /> Sector 2 &bull; Inventory Scanner Tool
          </span>
          <span className="sector-subtitle">Barcode & QR intake</span>
        </div>

        <button
          onClick={onOpenScanner}
          className="btn-primary"
          style={{
            width: '100%',
            padding: '14px',
            borderRadius: '16px',
            fontSize: '14px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '10px',
          }}
        >
          <Camera size={18} /> Launch Optical Barcode Scanner
        </button>
      </section>

      {/* SECTOR 3: Parts Catalog & Stock Adjustment */}
      <section>
        <div className="sector-header">
          <span className="sector-title">
            <Boxes size={14} /> Sector 3 &bull; Parts Catalog ({filteredItems.length})
          </span>
          <span className="sector-subtitle">Live stock adjustment</span>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', marginBottom: '14px' }}>
          <Search size={15} color="var(--text-dim)" style={{ position: 'absolute', left: '14px', top: '13px' }} />
          <input
            type="text"
            placeholder="Search by part name, SKU, OEM number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '14px',
              padding: '12px 14px 12px 40px',
              color: 'white',
              fontSize: '13px',
              outline: 'none',
            }}
          />
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '6px', marginBottom: '16px' }}>
          {categories.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '7px 14px',
                  borderRadius: '12px',
                  fontSize: '12px',
                  fontWeight: 600,
                  whiteSpace: 'nowrap',
                  border: isSelected ? '1px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                  background: isSelected ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255, 255, 255, 0.03)',
                  color: isSelected ? 'var(--accent-cyan)' : 'var(--text-muted)',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Breathable Parts List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {filteredItems.map((item) => {
            const isLowStock = item.stockQty <= item.minSafetyStock;

            return (
              <div
                key={item.id}
                className="glass-panel"
                style={{
                  padding: '18px 20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  borderColor: isLowStock ? 'rgba(245, 158, 11, 0.35)' : 'var(--border-card)',
                }}
              >
                {/* Title & Category Row */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '10px' }}>
                  <div>
                    <h4 style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>{item.name}</h4>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)', fontFamily: 'var(--font-mono)', marginTop: '2px' }}>
                      SKU: {item.sku} &bull; OEM: {item.oemNumber}
                    </div>
                  </div>
                  <span style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: 'rgba(255, 255, 255, 0.05)',
                    color: 'var(--text-muted)',
                  }}>
                    {item.category}
                  </span>
                </div>

                {/* Price & Quantity Adjuster */}
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '6px',
                  borderTop: '1px solid var(--border-subtle)',
                }}>
                  <div>
                    <div style={{ fontSize: '11px', color: 'var(--text-dim)' }}>Retail Price</div>
                    <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--accent-emerald)', fontFamily: 'var(--font-mono)' }}>
                      ${item.retailPrice.toFixed(2)}
                      <span style={{ fontSize: '11px', color: 'var(--text-dim)', fontWeight: 400, marginLeft: '6px' }}>
                        (Cost: ${item.unitCost.toFixed(2)})
                      </span>
                    </div>
                  </div>

                  {/* Big Comfortable Stock Touch Controls */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <button
                      onClick={() => onUpdateStock(item.id, -1)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: 'rgba(239, 68, 68, 0.12)',
                        border: '1px solid rgba(239, 68, 68, 0.3)',
                        color: '#f87171',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Minus size={14} />
                    </button>

                    <div style={{ textAlign: 'center', minWidth: '46px' }}>
                      <div style={{
                        fontSize: '15px',
                        fontWeight: 800,
                        color: isLowStock ? '#fbbf24' : 'white',
                        fontFamily: 'var(--font-mono)',
                      }}>
                        {item.stockQty}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-dim)' }}>
                        {item.unitOfMeasure}
                      </div>
                    </div>

                    <button
                      onClick={() => onUpdateStock(item.id, 1)}
                      style={{
                        width: '34px',
                        height: '34px',
                        borderRadius: '10px',
                        background: 'rgba(16, 185, 129, 0.12)',
                        border: '1px solid rgba(16, 185, 129, 0.3)',
                        color: '#34d399',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                </div>

                {/* Transfer stock link */}
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '4px' }}>
                  <button
                    onClick={() => setTransferModalItem(item)}
                    style={{
                      background: 'transparent',
                      border: 'none',
                      color: 'var(--accent-cyan)',
                      fontSize: '11px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px',
                    }}
                  >
                    <ArrowLeftRight size={12} /> Transfer to another branch &rarr;
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Transfer Modal */}
      {transferModalItem && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.85)',
          backdropFilter: 'blur(8px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '20px',
        }}>
          <div className="glass-panel-elevated" style={{ width: '100%', maxWidth: '420px', padding: '24px' }}>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'white', marginBottom: '8px' }}>
              Inter-Branch Stock Transfer
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
              Transferring: <strong>{transferModalItem.name}</strong> (Available: {transferModalItem.stockQty})
            </p>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Destination Branch
              </label>
              <select
                value={targetBranch}
                onChange={(e) => setTargetBranch(e.target.value)}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: 'white',
                  fontSize: '13px',
                }}
              >
                <option value="branch-2">Apex West Airport Express</option>
                <option value="branch-3">Apex North Bay Heavy Depot</option>
              </select>
            </div>

            <div style={{ marginBottom: '20px' }}>
              <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
                Quantity to Transfer
              </label>
              <input
                type="number"
                min="1"
                max={transferModalItem.stockQty}
                value={transferQty}
                onChange={(e) => setTransferQty(Number(e.target.value))}
                style={{
                  width: '100%',
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '10px',
                  color: 'white',
                  fontSize: '13px',
                }}
              />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setTransferModalItem(null)} className="btn-secondary" style={{ flex: 1 }}>
                Cancel
              </button>
              <button onClick={handleConfirmTransfer} className="btn-primary" style={{ flex: 1 }}>
                Confirm Transfer
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
