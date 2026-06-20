import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  icon: LucideIcon;
  title: string;
  value: string;
  description: string;
  extra?: React.ReactNode;
}

export function DetailModal({ isOpen, onClose, icon: Icon, title, value, description, extra }: Props) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.96, opacity: 0, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="glass-card w-full max-w-md overflow-hidden"
          >
            <div className="mb-5 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
                  <Icon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-medium text-white">{title}</h3>
                  <p className="text-2xl font-light text-white">{value}</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="rounded-full p-1 text-white/60 transition hover:bg-white/10 hover:text-white"
                aria-label="关闭"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="leading-relaxed text-white/80">{description}</p>
            {extra && <div className="mt-5 border-t border-white/10 pt-4">{extra}</div>}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
