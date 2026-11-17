import React, { useState } from 'react';

interface AvatarBadgeProps {
  src?: string;
  name: string;
  size?: number;
}

export const AvatarBadge: React.FC<AvatarBadgeProps> = ({ src, name, size = 36 }) => {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const failed = !!src && failedSrc === src;

  const initials = name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase() || '')
    .join('');

  if (!src || failed) {
    return (
      <div
        aria-label={name}
        style={{
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: 'var(--radius-control)',
          border: '1px solid var(--border-strong)',
          background: 'var(--bg-elevated)',
          color: 'var(--accent-primary)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'var(--font-mono)',
          fontWeight: 700,
          fontSize: `${Math.max(10, Math.round(size * 0.36))}px`,
          flexShrink: 0,
        }}
      >
        {initials || 'AP'}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={name}
      onError={() => setFailedSrc(src)}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: 'var(--radius-sharp)',
        border: '1px solid var(--border-strong)',
        objectFit: 'cover',
        flexShrink: 0,
        background: 'var(--bg-elevated)',
      }}
    />
  );
};
