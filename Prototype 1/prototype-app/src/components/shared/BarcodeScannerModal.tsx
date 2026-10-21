import React, { useState } from 'react';
import { X, Camera, Check, Barcode } from 'lucide-react';
import { InventoryItem } from '../../types';

interface BarcodeScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  inventory: InventoryItem[];
  onItemScanned: (item: InventoryItem, action: 'INSPECT' | 'DEDUCT' | 'RESTOCK') => void;
}

export const BarcodeScannerModal: React.FC<BarcodeScannerModalProps> = ({
  isOpen,
  onClose,
  inventory,
  onItemScanned,
}) => {
  const [selectedAction, setSelectedAction] = useState<'DEDUCT' | 'RESTOCK' | 'INSPECT'>('DEDUCT');
  const [scannedSuccessItem, setScannedSuccessItem] = useState<InventoryItem | null>(null);

  if (!isOpen) return null;

  const handleSimulateScan = (item: InventoryItem) => {
    setScannedSuccessItem(item);
    setTimeout(() => {
      onItemScanned(item, selectedAction);
      setScannedSuccessItem(null);
      onClose();
    }, 1200);
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.9)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
    }}>
      <div className="glass-panel-elevated" style={{
        width: '100%',
        maxWidth: '480px',
        padding: '24px',
        position: 'relative',
        border: '1px solid var(--border-accent)',
      }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Camera size={20} color="var(--accent-cyan)" />
            <h3 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-main)' }}>Optical Barcode Scanner</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Action Toggle */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '16px', background: 'rgba(0,0,0,0.3)', padding: '4px', borderRadius: '8px' }}>
          {(['DEDUCT', 'RESTOCK', 'INSPECT'] as const).map((act) => (
            <button
              key={act}
              onClick={() => setSelectedAction(act)}
              style={{
                flex: 1,
                padding: '6px 8px',
                fontSize: '11px',
                fontWeight: 700,
                borderRadius: '6px',
                border: 'none',
                cursor: 'pointer',
                background: selectedAction === act ? 'var(--accent-cyan)' : 'transparent',
                color: selectedAction === act ? '#080b11' : 'var(--text-muted)',
                transition: 'all 0.2s',
              }}
            >
              {act === 'DEDUCT' ? '- Deduct for Job' : act === 'RESTOCK' ? '+ Restock' : '🔍 Lookup'}
            </button>
          ))}
        </div>

        {/* Viewfinder Camera Simulation */}
        <div style={{
          position: 'relative',
          width: '100%',
          height: '220px',
          background: '#040711',
          borderRadius: '16px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          border: '2px solid rgba(6,182,212,0.4)',
          marginBottom: '16px',
          boxShadow: 'inset 0 0 40px rgba(6,182,212,0.15)',
        }}>
          {/* Scanning Reticle Frame */}
          <div style={{
            width: '200px',
            height: '130px',
            border: '2px dashed rgba(6,182,212,0.8)',
            borderRadius: '12px',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            {/* Animated Laser Line */}
            <div
              className="animate-scan-line"
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                height: '3px',
                background: 'linear-gradient(90deg, transparent, #06b6d4, #22d3ee, transparent)',
                boxShadow: '0 0 12px #06b6d4',
              }}
            />

            <Barcode size={48} color="rgba(255,255,255,0.2)" />
          </div>

          <p style={{ fontSize: '11px', color: 'var(--accent-cyan)', marginTop: '12px', fontWeight: 600, letterSpacing: '0.5px' }}>
            AIM CAMERA AT PART SKU BARCODE OR QR CODE
          </p>

          {/* Success Flash Overlay */}
          {scannedSuccessItem && (
            <div style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: 'rgba(16,185,129,0.92)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              zIndex: 30,
            }}>
              <Check size={42} />
              <h4 style={{ fontSize: '16px', fontWeight: 700, marginTop: '8px' }}>Scan Confirmed!</h4>
              <p style={{ fontSize: '12px' }}>{scannedSuccessItem.name}</p>
            </div>
          )}
        </div>

        {/* Quick Simulated Barcode Triggers */}
        <div>
          <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '8px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Tap a part to simulate instant barcode scan:
          </label>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', maxHeight: '160px', overflowY: 'auto' }}>
            {inventory.slice(0, 4).map((item) => (
              <button
                key={item.id}
                onClick={() => handleSimulateScan(item)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  color: 'white',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'background 0.2s',
                }}
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 600 }}>{item.name}</div>
                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', fontFamily: 'var(--font-mono)' }}>
                    {item.barcode} &bull; Qty: {item.stockQty} {item.unitOfMeasure}
                  </div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--accent-cyan)', fontWeight: 700 }}>
                  Scan →
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
