import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { generateQRCode } from '@/src/utils/qrcode';

interface QRCodeModalProps {
  url: string;
  isOpen: boolean;
  onClose: () => void;
}

export function QRCodeModal({ url, isOpen, onClose }: QRCodeModalProps) {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen && url) {
      generateQRCode(url).then(setQrDataUrl).catch(console.error);
    }
  }, [isOpen, url]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 z-40"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
          >
            <div className="bg-white border border-gray-200 rounded-xl shadow-2xl max-w-md w-full p-6">
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">
                  微信扫码分享
                </h3>
                <button
                  onClick={onClose}
                  className="text-gray-500 hover:text-gray-800 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* QR Code */}
              <div className="bg-white border border-gray-200 p-4 rounded-lg mb-4 flex items-center justify-center">
                {qrDataUrl ? (
                  <img
                    src={qrDataUrl}
                    alt="QR Code"
                    className="w-48 h-48"
                  />
                ) : (
                  <div className="w-48 h-48 flex items-center justify-center text-gray-400">
                    生成中...
                  </div>
                )}
              </div>

              {/* URL Display */}
              <div className="bg-gray-100 rounded-lg p-3 mb-4">
                <p className="text-xs text-gray-500 mb-1">分享链接:</p>
                <p className="text-sm text-gray-700 break-all font-mono">
                  {url}
                </p>
              </div>

              {/* Instructions */}
              <p className="text-sm text-gray-500 text-center">
                使用微信扫描二维码或复制链接分享
              </p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
