import { useRef, useState } from 'react';
import html2canvas from 'html2canvas';
import { X, Download, Share2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShareCard } from './ShareCard';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  city?: string;
  temperature?: number;
  weatherText?: string;
  source?: string;
}

export function ShareModal({ isOpen, onClose, city, temperature, weatherText, source }: Props) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const generateImage = async () => {
    if (!cardRef.current) return null;
    setIsLoading(true);
    try {
      const canvas = await html2canvas(cardRef.current, {
        backgroundColor: null,
        scale: 2,
        useCORS: true,
      });
      return canvas;
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownload = async () => {
    const canvas = await generateImage();
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `${city || 'weather'}-share.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  };

  const handleShare = async () => {
    const canvas = await generateImage();
    if (!canvas) return;

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob(resolve, 'image/png')
    );
    if (!blob) return;

    const file = new File([blob], `${city || 'weather'}-share.png`, { type: 'image/png' });
    const shareData: ShareData = {
      title: `${city || '天气'}`,
      text: `${city || ''} ${temperature ?? '-'}° ${weatherText || ''}`,
    };

    try {
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({ ...shareData, files: [file] });
      } else if (typeof navigator.share === 'function') {
        await navigator.share(shareData);
      }
    } catch {
      // User cancelled or share failed
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative w-full max-w-sm rounded-3xl border border-white/20 bg-slate-950/90 p-6 shadow-2xl backdrop-blur-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={onClose}
              className="absolute right-4 top-4 rounded-full p-1 text-white/70 transition hover:bg-white/10 hover:text-white"
              aria-label="关闭"
            >
              <X className="h-5 w-5" />
            </button>
            <h3 className="mb-6 text-xl font-semibold text-white">分享天气卡片</h3>
            <div className="mb-6 flex justify-center">
              <ShareCard
                ref={cardRef}
                city={city}
                temperature={temperature}
                weatherText={weatherText}
                source={source}
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleDownload}
                disabled={isLoading}
                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white/10 py-2.5 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                下载图片
              </button>
              {typeof navigator.share === 'function' && (
                <button
                  onClick={handleShare}
                  disabled={isLoading}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-blue-500/80 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500 disabled:opacity-50"
                >
                  <Share2 className="h-4 w-4" />
                  分享
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
