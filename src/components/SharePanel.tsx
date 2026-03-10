import { useState, useRef } from 'react';
import type React from 'react';
import { ChevronDown, ChevronUp, Download, Upload, Link2, Copy, Share2, QrCode } from 'lucide-react';
import type { FishingParams } from '@/src/types';
import { exportToFile, importFromFile } from '@/src/utils/fileOperations';
import { generateShareUrl, copyToClipboard, shareViaWebShare } from '@/src/utils/urlSharing';
import { QRCodeModal } from './QRCodeModal';

interface SharePanelProps {
  params: FishingParams;
  onImport: (params: FishingParams) => void;
  onToast: (message: string, type: 'success' | 'error' | 'info') => void;
}

export function SharePanel({ params, onImport, onToast }: SharePanelProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [shareUrl, setShareUrl] = useState<string>('');
  const [showQRModal, setShowQRModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    try {
      exportToFile(params);
      onToast('配置已导出', 'success');
    } catch (err) {
      onToast('导出失败: ' + (err as Error).message, 'error');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const importedParams = await importFromFile(file);
      onImport(importedParams);
      onToast('配置已导入', 'success');
    } catch (err) {
      onToast('导入失败: ' + (err as Error).message, 'error');
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleGenerateLink = () => {
    try {
      const url = generateShareUrl(params);
      setShareUrl(url);
      onToast('链接已生成', 'success');
    } catch (err) {
      onToast('生成链接失败', 'error');
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) {
      handleGenerateLink();
      return;
    }

    const success = await copyToClipboard(shareUrl);
    if (success) {
      onToast('链接已复制到剪贴板', 'success');
    } else {
      onToast('复制失败，请手动复制', 'error');
    }
  };

  const handleSystemShare = async () => {
    if (!shareUrl) {
      handleGenerateLink();
      return;
    }

    const success = await shareViaWebShare(shareUrl);
    if (!success) {
      onToast('您的浏览器不支持系统分享', 'info');
    }
  };

  const handleQRCode = () => {
    if (!shareUrl) {
      const url = generateShareUrl(params);
      setShareUrl(url);
    }
    setShowQRModal(true);
  };

  return (
    <div className="border-t border-gray-200 mt-4 pt-4">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-left hover:bg-gray-50 rounded-lg px-3 py-2 transition-colors"
      >
        <div className="flex items-center gap-2">
          <Share2 size={18} className="text-blue-600" />
          <span className="font-medium text-gray-800">分享与保存</span>
        </div>
        {isExpanded ? (
          <ChevronUp size={18} className="text-gray-500" />
        ) : (
          <ChevronDown size={18} className="text-gray-500" />
        )}
      </button>

      {/* Content */}
      {isExpanded && (
        <div className="mt-4 space-y-4 px-3">
          {/* File Operations */}
          <div>
            <p className="text-sm text-gray-600 mb-2">文件操作:</p>
            <div className="flex gap-2">
              <button
                onClick={handleExport}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm"
              >
                <Download size={16} />
                导出配置
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm"
              >
                <Upload size={16} />
                导入配置
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".fishing"
                onChange={handleImport}
                className="hidden"
              />
            </div>
          </div>

          {/* Share Link */}
          <div>
            <p className="text-sm text-gray-600 mb-2">分享链接:</p>
            <div className="flex gap-2 mb-2">
              <button
                onClick={handleGenerateLink}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm"
              >
                <Link2 size={16} />
                生成链接
              </button>
              <button
                onClick={handleCopyLink}
                className="flex items-center gap-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors text-sm"
              >
                <Copy size={16} />
                复制链接
              </button>
            </div>
            {shareUrl && (
              <div className="bg-gray-100 rounded-lg p-3 border border-gray-300">
                <p className="text-xs text-gray-700 break-all font-mono">
                  {shareUrl}
                </p>
              </div>
            )}
          </div>

          {/* Quick Share */}
          <div>
            <p className="text-sm text-gray-600 mb-2">快速分享:</p>
            <div className="flex gap-2">
              <button
                onClick={handleSystemShare}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg transition-colors text-sm"
              >
                <Share2 size={16} />
                系统分享
              </button>
              <button
                onClick={handleQRCode}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg transition-colors text-sm"
              >
                <QrCode size={16} />
                微信二维码
              </button>
            </div>
          </div>
        </div>
      )}

      {/* QR Code Modal */}
      <QRCodeModal
        url={shareUrl}
        isOpen={showQRModal}
        onClose={() => setShowQRModal(false)}
      />
    </div>
  );
}
