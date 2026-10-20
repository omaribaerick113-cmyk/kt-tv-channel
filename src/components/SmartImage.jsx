import React, { useEffect, useState } from 'react';
import { Shirt } from 'lucide-react';

/** <img> that never shows a broken-image icon: missing/failed images become a branded placeholder. */
export default function SmartImage({ src, alt = '', width, height, className = '', eager = false, icon: Icon = Shirt, label = 'Image coming soon' }) {
  const [failed, setFailed] = useState(false);
  useEffect(() => setFailed(false), [src]);
  if (!src || failed) {
    return <div className={`image-placeholder ${className}`} role="img" aria-label={alt || label}><Icon size={40} aria-hidden="true" /><span>{label}</span></div>;
  }
  return <img className={className} src={src} alt={alt} width={width} height={height} loading={eager ? 'eager' : 'lazy'} decoding="async" onError={() => setFailed(true)} />;
}
