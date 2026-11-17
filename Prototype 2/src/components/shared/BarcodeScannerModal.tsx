import React, { useState, useEffect, useRef } from 'react';
import { X, Camera, Check, Barcode, Search } from 'lucide-react';
import { InventoryItem } from '../../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onItemScanned: (item: InventoryItem, action: 'INSPECT' | 'DEDUCT' | 'RESTOCK') => void;
  canRestock?: boolean;
  canDeduct?: boolean;
}

const ALL_ACTIONS: { id: 'DEDUCT' | 'RESTOCK' | 'INSPECT'; label: string }[] = [
  { id: 'DEDUCT', label: '-1 Deduct to Job' },
  { id: 'RESTOCK', label: '+5 Restock' },
  { id: 'INSPECT', label: 'Lookup SKU' },
];

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onItemScanned,
  canRestock = true,
  canDeduct = true,
}) => {
  if (!isOpen) return null;
  return (
    <BarcodeScannerModalContent
      onClose={onClose}
      inventory={inventory}
      onItemScanned={onItemScanned}
      canRestock={canRestock}
      canDeduct={canDeduct}
    />
  );
};

const BarcodeScannerModalContent: React.FC<Omit<BarcodeScannerModalProps, 'isOpen'>> = ({
  onClose,
  inventory,
  onItemScanned,
  canRestock = true,
  canDeduct = true,
}) => {
  const actions = ALL_ACTIONS.filter((a) => {
    if (a.id === 'RESTOCK' && !canRestock) return false;
    if (a.id === 'DEDUCT' && !canDeduct) return false;
    return true;
  });

  const [selectedAction, setSelectedAction] = useState<'DEDUCT' | 'RESTOCK' | 'INSPECT'>(
    actions[0]?.id || 'INSPECT'
  );
  const [scannedSuccessItem, setScannedSuccessItem] = useState<InventoryItem | null>(null);
  const [lookupQuery, setLookupQuery] = useState('');
  const scanTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (scanTimerRef.current !== null) {
        window.clearTimeout(scanTimerRef.current);
      }
    };
  }, []);

  const activeIdx = Math.max(0, actions.findIndex((a) => a.id === selectedAction));

  const matchingItems = inventory.filter((item) => {
    const q = lookupQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      item.name.toLowerCase().includes(q) ||
      item.sku.toLowerCase().includes(q) ||
      item.barcode.includes(q) ||
      item.oemNumber.toLowerCase().includes(q)
    );
  });

  const handleClose = () => {
    if (scanTimerRef.current !== null) {
      window.clearTimeout(scanTimerRef.current);
      scanTimerRef.current = null;
    }
    onClose();
  };

  const handleSimulateScan = (item: InventoryItem) => {
    if (scannedSuccessItem) return;
    const actionSnapshot = selectedAction;
    setScannedSuccessItem(item);
    scanTimerRef.current = window.setTimeout(() => {
      scanTimerRef.current = null;
      onItemScanned(item, actionSnapshot);
      setScannedSuccessItem(null);
      onClose();
    }, 900);
  };

  return (
    <div className="sg-modal-backdrop" role="dialog" aria-modal="true" aria-label="Optical Barcode Scanner">
      <div className="sg-modal" style={{ maxWidth: '500px' }}>
        <div className="sg-modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={18} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '16px', fontWeight: 700 }}>Optical Barcode Scanner</h3>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="sg-btn sg-btn-secondary sg-btn-sm"
            aria-label="Close scanner"
          >
            <X size={16} />
          </button>
        </div>

        <div className="sg-modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {/* Sliding Action Selector */}
          <div className="sg-segmented" style={{ gridTemplateColumns: `repeat(${actions.length}, 1fr)` }}>
            <div
              className="sg-segmented-thumb"
              style={{
                width: `calc((100% - 6px) / ${actions.length})`,
                transform: `translateX(${activeIdx * 100}%)`,
              }}
            />
            {actions.map((act) => (
              <button
                key={act.id}
                type="button"
                disabled={!!scannedSuccessItem}
                className="sg-segmented-btn"
                data-active={selectedAction === act.id}
                onClick={() => setSelectedAction(act.id)}
              >
                {act.label}
              </button>
            ))}
          </div>

          {/* Optical Viewfinder Hardware Simulation */}
          <div
            style={{
              position: 'relative',
              width: '100%',
              height: '200px',
              background: 'var(--bg-inverse)',
              border: '2px solid var(--border-strong)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: '210px',
                height: '130px',
                border: '2px dashed var(--accent-volt)',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <div
                className="animate-scan-line"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: '3px',
                  background: 'var(--accent-primary)',
                }}
              />
              <Barcode size={48} color="rgba(255,255,255,0.28)" />
            </div>

            <div
              style={{
                marginTop: '10px',
                fontFamily: 'var(--font-mono)',
                fontSize: '10px',
                fontWeight: 700,
                letterSpacing: '0.08em',
                color: 'var(--accent-volt)',
              }}
            >
              ALIGN PART SKU BARCODE OR QR WITHIN RETICLE
            </div>

            {scannedSuccessItem && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'var(--accent-secondary)',
                  color: 'var(--text-inverse)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                  zIndex: 20,
                }}
              >
                <Check size={40} />
                <div style={{ fontFamily: 'var(--font-display)', fontSize: '16px', fontWeight: 700 }}>
                  Scan Confirmed ({selectedAction})
                </div>
                <div style={{ fontSize: '12px' }}>{scannedSuccessItem.name}</div>
              </div>
            )}
          </div>

          {/* Manual Barcode / SKU Filter + Simulated Triggers */}
          <div>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search
                size={14}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: '10px', top: '12px' }}
              />
              <input
                type="text"
                className="sg-input sg-input-mono"
                placeholder="Filter barcode, SKU, or part name..."
                value={lookupQuery}
                onChange={(e) => setLookupQuery(e.target.value)}
                style={{ paddingLeft: '32px' }}
              />
            </div>

            <label className="sg-label">Tap a part to simulate optical barcode acquisition:</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '170px', overflowY: 'auto' }}>
              {matchingItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  disabled={!!scannedSuccessItem}
                  onClick={() => handleSimulateScan(item)}
                  className="sg-card-interactive"
                  style={{
                    padding: '10px 12px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    textAlign: 'left',
                    cursor: scannedSuccessItem ? 'not-allowed' : 'pointer',
                  }}
                >
                  <div>
                    <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--text-primary)' }}>
                      {item.name}
                    </div>
                    <div
                      className="tabular"
                      style={{ fontSize: '11px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}
                    >
                      {item.barcode} &bull; {item.sku} &bull; Qty: {item.stockQty} {item.unitOfMeasure}
                    </div>
                  </div>
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: '11px',
                      fontWeight: 700,
                      color: 'var(--accent-primary)',
                    }}
                  >
                    SCAN &rarr;
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
