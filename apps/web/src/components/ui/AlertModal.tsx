import { motion, AnimatePresence } from 'framer-motion';
import type { WeatherAlert } from '@/types';
import { X, AlertTriangle } from 'lucide-react';
import { useState } from 'react';

interface Props {
  alerts: WeatherAlert[];
}

const levelColor: Record<string, string> = {
  blue: 'border-blue-400 bg-blue-500/20',
  yellow: 'border-yellow-400 bg-yellow-500/20',
  orange: 'border-orange-400 bg-orange-500/20',
  red: 'border-red-500 bg-red-500/20',
};

export function AlertModal({ alerts }: Props) {
  const [isOpen, setIsOpen] = useState(true);
  if (!alerts.length || !isOpen) return null;

  const alert = alerts[0];

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className={`w-full max-w-lg rounded-3xl border-2 p-6 shadow-2xl ${levelColor[alert.level] || levelColor.blue}`}
          style={{ background: 'rgba(0,0,0,0.4)', backdropFilter: 'blur(28px)' }}
        >
          <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-7 w-7 text-white" />
              <h3 className="text-xl font-semibold text-white">{alert.title}</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white/70 hover:text-white">
              <X className="h-6 w-6" />
            </button>
          </div>
          <p className="text-sm text-white/80">发布时间：{alert.publishTime}</p>
          <p className="mt-3 text-white/90">{alert.content}</p>
          <div className="mt-4">
            <p className="text-sm font-medium text-white">防御指南：</p>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-white/80">
              {alert.defenseGuide.map((guide, i) => (
                <li key={i}>{guide}</li>
              ))}
            </ul>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
