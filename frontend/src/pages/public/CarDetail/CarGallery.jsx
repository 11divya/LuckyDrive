import { useState } from 'react';
import { Camera } from 'lucide-react';

export default function CarGallery({ images = [], alt = '' }) {
  const [active, setActive] = useState(0);
  if (!images.length) return null;

  const mainSrc = images[active];
  const thumbs = images.slice(0, 4);
  const extra = Math.max(0, images.length - 4);

  return (
    <div>
      <div className="aspect-[16/10] rounded-xl overflow-hidden bg-dark-100 border border-outline-variant/30 mb-4">
        <img src={mainSrc} alt={alt} className="w-full h-full object-cover" />
      </div>
      <div className="grid grid-cols-4 gap-3">
        {thumbs.map((src, i) => {
          const isExtraTile = i === 3 && extra > 0;
          return (
            <button
              type="button"
              key={src + i}
              onClick={() => setActive(i)}
              className={`relative aspect-square rounded-lg overflow-hidden border transition-all ${
                active === i
                  ? 'border-primary ring-2 ring-primary/40'
                  : 'border-outline-variant/40 hover:border-primary/60'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover" />
              {isExtraTile && (
                <div className="absolute inset-0 bg-dark/80 flex flex-col items-center justify-center text-text">
                  <Camera size={16} />
                  <span className="text-xs font-bold mt-1">+{extra} more</span>
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
