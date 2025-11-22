
import React, { useState, useRef, useEffect } from 'react';
import { EyeIcon, HistoryIcon, KeyIcon, ShareIcon, ZaloIcon, MessengerIcon, MailIcon, CopyIcon, GlobeIcon } from '../constants';
import { useTranslation } from '../lib/i18n';

interface HeaderProps {
  isDarkMode: boolean;
  toggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({ isDarkMode, toggleDarkMode }) => {
  const [shareStatus, setShareStatus] = useState<string>('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const { t, language, setLanguage } = useTranslation();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'vi' : 'en');
  };

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
    setShareStatus(t('linkCopied'));
    setShowShareOptions(false);
    setTimeout(() => {
      setShareStatus('');
    }, 3000);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (shareRef.current && !shareRef.current.contains(event.target as Node)) {
        setShowShareOptions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleShare = async () => {
    const shareData = {
      title: t('headerTitle'),
      text: 'Hãy thử ứng dụng Trợ lý AI cho Giáo viên Toán này! Bạn có thể sử dụng nó với API key Google AI của riêng mình.',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShareStatus(t('shared'));
        setTimeout(() => setShareStatus(''), 3000);
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
          console.error('Lỗi khi chia sẻ web:', err);
        }
      }
    } else {
      setShowShareOptions(prev => !prev);
    }
  };

  const url = window.location.href;
  const text = 'Hãy thử ứng dụng Trợ lý AI cho Giáo viên Toán này!';
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);

  return (
    <header className="sticky top-4 z-20 flex justify-between items-center p-4 bg-white/60 dark:bg-gray-900/60 backdrop-blur-md border border-gray-200/80 dark:border-gray-700/60 shadow-sm rounded-xl">
      <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary dark:from-primary-light to-secondary dark:to-secondary-light">
        {t('headerTitle')}
      </h1>
      <div className="flex items-center space-x-2 md:space-x-4">
        {shareStatus && (
            <span className="text-sm font-semibold text-green-600 dark:text-green-400 animate-fade-in transition-opacity duration-300">
                {shareStatus}
            </span>
        )}
        
        <button onClick={toggleDarkMode} title={t('darkMode')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <EyeIcon className="w-6 h-6 text-primary dark:text-primary-light" />
        </button>
        
        <button onClick={toggleLanguage} title={t('languageSwitcherTooltip')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
            <GlobeIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />
        </button>

        <div className="relative" ref={shareRef}>
            <button onClick={handleShare} title={t('shareApp')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <ShareIcon className="w-6 h-6 text-accent-dark dark:text-accent" />
            </button>
            {showShareOptions && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 py-1 overflow-hidden animate-fade-in">
                    <a href={`https://zalo.me/share/d?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowShareOptions(false)} className="flex items-center space-x-3 w-full text-left px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                        <ZaloIcon className="w-5 h-5" />
                        <span>{t('shareViaZalo')}</span>
                    </a>
                    <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowShareOptions(false)} className="flex items-center space-x-3 w-full text-left px-4 py-2.5 text-sm text-blue-800 dark:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                        <MessengerIcon className="w-5 h-5" />
                        <span>{t('shareViaMessenger')}</span>
                    </a>
                    <a href={`mailto:?subject=${encodedText}&body=${encodedUrl}`} onClick={() => setShowShareOptions(false)} className="flex items-center space-x-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                        <MailIcon className="w-5 h-5" />
                        <span>{t('sendViaEmail')}</span>
                    </a>
                    <button onClick={() => handleCopy(url)} className="flex items-center space-x-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                        <CopyIcon className="w-5 h-5" />
                        <span>{t('copyLink')}</span>
                    </button>
                </div>
            )}
        </div>

        <button title={t('history')} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
          <HistoryIcon className="w-6 h-6 text-secondary dark:text-secondary-light" />
        </button>
      </div>
    </header>
  );
};