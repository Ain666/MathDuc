
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { OutputProgress } from './OutputProgress';
import { CopyIcon, ChevronDownIcon, SparklesIcon, TrashIcon, TextIcon, MarkdownIcon, LatexIcon, FormulaIcon, ShareIcon, ZaloIcon, MessengerIcon, MailIcon, WordIcon, LightbulbIcon, HourglassIcon } from '../constants';
import { elaborateText, standardizeText } from '../services/geminiService';
import { useTranslation } from '../lib/i18n';

interface OutputPanelProps {
  outputContent: string;
  setOutputContent: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  progress: number;
  playBeep: (count?: number) => void;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  playCompletionSound: () => void;
}

const CopyDropdown: React.FC<{ content: string; playBeep: (count?: number) => void }> = ({ content, playBeep }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text).then(() => {
            playBeep(1);
            setIsOpen(false);
        }).catch(err => {
            console.error("Failed to copy:", err);
        });
    };
    
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const highlightAndCopyEquation = () => {
        // This is a placeholder for a more complex function.
        // For now, it copies everything.
        copyToClipboard(content);
    };
    
    const CopyOptionButton: React.FC<{ onClick: () => void; text: string; icon: React.ReactNode; colorClass: string }> = ({ onClick, text, icon, colorClass }) => (
      <button 
          onClick={onClick} 
          className={`w-full text-left px-4 py-2.5 text-sm flex items-center space-x-3 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors font-medium ${colorClass}`}
      >
          {icon}
          <span>{text}</span>
      </button>
    );

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center space-x-2 px-4 py-2 font-semibold text-white bg-primary hover:bg-primary-dark rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-primary"
            >
                <CopyIcon className="w-5 h-5" />
                <span className="text-[12pt]">{t('copyDropdown')}</span>
                <ChevronDownIcon className={`w-5 h-5 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 py-1 overflow-hidden">
                    <CopyOptionButton 
                        onClick={() => copyToClipboard(content)} 
                        text={t('copyText')}
                        icon={<TextIcon className="w-5 h-5"/>}
                        colorClass="text-sky-600 dark:text-sky-400"
                    />
                    <CopyOptionButton 
                        onClick={() => copyToClipboard(content)} 
                        text={t('copyMarkdown')}
                        icon={<MarkdownIcon className="w-5 h-5"/>}
                        colorClass="text-indigo-600 dark:text-indigo-400"
                    />
                    <CopyOptionButton 
                        onClick={() => copyToClipboard(content)} 
                        text={t('copyLatex')}
                        icon={<LatexIcon className="w-5 h-5"/>}
                        colorClass="text-teal-600 dark:text-teal-400"
                    />
                    <CopyOptionButton 
                        onClick={highlightAndCopyEquation} 
                        text={t('copyFormula')}
                        icon={<FormulaIcon className="w-5 h-5"/>}
                        colorClass="text-amber-600 dark:text-amber-400"
                    />
                </div>
            )}
        </div>
    );
};


export const OutputPanel: React.FC<OutputPanelProps> = ({ outputContent, setOutputContent, isLoading, progress, playBeep, setIsLoading, setProgress, playCompletionSound }) => {
  const { t } = useTranslation();
  const [isAnimating, setIsAnimating] = useState(false);
  const prevOutputContentRef = useRef('');
  const [shareStatus, setShareStatus] = useState<string>('');
  const [showShareOptions, setShowShareOptions] = useState(false);
  const shareRef = useRef<HTMLDivElement>(null);
  const outputContainerRef = useRef<HTMLDivElement>(null);
  const [selection, setSelection] = useState<{ text: string; top: number; left: number } | null>(null);

  const handleMouseUp = () => {
    if (!outputContainerRef.current) return;
    const currentSelection = window.getSelection();
    const text = currentSelection?.toString().trim();

    if (text && text.length > 3) { 
        const range = currentSelection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = outputContainerRef.current.getBoundingClientRect();
        
        setSelection({
            text: text,
            top: rect.top - containerRect.top + outputContainerRef.current.scrollTop + rect.height,
            left: rect.left - containerRect.left + outputContainerRef.current.scrollLeft + rect.width / 2,
        });
    } else {
        setSelection(null);
    }
  };

  const handleElaborationRequest = async () => {
    if (!selection) return;

    const { text } = selection;
    setSelection(null); 
    setIsLoading(true);
    setProgress(0);

    try {
        const result = await elaborateText({
            fullText: outputContent,
            selectedText: text,
            onProgress: setProgress
        });
        
        const header = `\n\n---\n\n### ${t('detailedExplanationFor')} "*${text.length > 70 ? text.substring(0, 70) + '...' : text}*"\n\n`;
        setOutputContent(prev => prev + header + result);
        playCompletionSound();
        
        setTimeout(() => {
            if (outputContainerRef.current) {
                outputContainerRef.current.scrollTop = outputContainerRef.current.scrollHeight;
            }
        }, 100);

    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (
            errorMessage.includes('API key not found') ||
            errorMessage.includes('API key not valid') ||
            errorMessage.includes('API key is invalid') ||
            errorMessage.includes('Request had invalid authentication credentials') ||
            errorMessage.includes('permission to access') ||
            errorMessage.includes('Requested entity was not found')
        ) {
            const errorMsg = `\n\n---\n\n### ${t('apiKeyError')}\n\n${t('apiKeyErrorDetails')}`;
            setOutputContent(prev => prev + errorMsg);
        } else {
            console.error("Elaboration failed:", error);
            const errorMsg = `\n\n---\n\n### ${t('elaborationError')}\n\n> ${errorMessage}`;
            setOutputContent(prev => prev + errorMsg);
        }
    } finally {
        setIsLoading(false);
    }
  };

  const handleStandardize = async () => {
    if (!outputContent) return;

    playBeep();
    setIsLoading(true);
    setProgress(0);

    try {
        const standardizedResult = await standardizeText({
            text: outputContent,
            onProgress: setProgress,
        });
        setOutputContent(standardizedResult);
        playCompletionSound();
    } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        if (
            errorMessage.includes('API key not found') ||
            errorMessage.includes('API key not valid') ||
            errorMessage.includes('API key is invalid') ||
            errorMessage.includes('Request had invalid authentication credentials') ||
            errorMessage.includes('permission to access') ||
            errorMessage.includes('Requested entity was not found')
        ) {
            const errorMsg = `\n\n---\n\n### ${t('apiKeyError')}\n\n${t('apiKeyErrorDetails')}`;
            setOutputContent(prev => prev + errorMsg);
        } else {
            console.error("Standardization failed:", error);
            const errorMsg = `\n\n---\n\n### ${t('elaborationError')}\n\n> ${errorMessage}`;
            setOutputContent(prev => prev + errorMsg);
        }
    } finally {
        setIsLoading(false);
    }
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

  const handleExportWord = () => {
    if (!outputContent || !outputContainerRef.current) {
        return;
    }

    const contentHtml = outputContainerRef.current.innerHTML;
    const styles = `
        body { font-family: 'Tinos', 'Times New Roman', serif; font-size: 14pt; }
        .textbook-output { line-height: 1.7; }
        .textbook-output p { margin-bottom: 1.25em; }
        .textbook-output h1, .textbook-output h2, .textbook-output h3, .textbook-output h4, .textbook-output h5, .textbook-output h6 { font-weight: 700; margin-top: 1.5em; margin-bottom: 0.5em; }
        .textbook-output ul, .textbook-output ol { margin-bottom: 1.25em; }
        .textbook-output ul { list-style-type: none; padding-left: 0.5em; margin-left: 0; }
        .textbook-output ol { list-style-type: decimal; margin-left: 1.5rem; }
        .textbook-output li { margin-bottom: 0.5em; }
        .katex { font-size: 1.1em !important; color: inherit; vertical-align: -0.05em; background-color: transparent; padding: 0 0.1em; border-radius: 0; line-height: 1; }
        .katex-display { display: block; margin: 1.5em auto; padding-bottom: 1em; overflow-x: auto; overflow-y: hidden; text-align: center; border-bottom: 1px solid #e5e7eb; background-color: transparent; border-radius: 0; max-width: 95%; }
        .katex-display .katex { background-color: transparent; padding: 0; border-radius: 0; color: inherit; font-weight: normal; }
    `;

    const htmlString = `
        <!DOCTYPE html>
        <html lang="vi">
        <head>
            <meta charset="UTF-8">
            <title>AI Assistant Export</title>
            <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.10/dist/katex.min.css" integrity="sha384-sN/JTRAKCKAAzTEReAWxa2xgdGQRAqsBUVTiiyL55TCNsJgS2oNaR2Dq2auDBqtL" crossorigin="anonymous">
            <style>${styles}</style>
        </head>
        <body>
            <div class="textbook-output">${contentHtml}</div>
        </body>
        </html>
    `;

    const blob = new Blob(['\ufeff', htmlString], {
        type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document;charset=utf-8'
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'ai-export.docx';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    playBeep();
  };

  const handleShare = async () => {
    if (!outputContent) return;

    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Nội dung được tạo bởi AI',
          text: outputContent,
        });
        setShareStatus(t('shared'));
      } catch (err) {
        if (err instanceof Error && err.name !== 'AbortError') {
            console.error('Lỗi khi chia sẻ:', err);
        }
        return;
      }
    } else {
      setShowShareOptions(prev => !prev);
    }
    setTimeout(() => setShareStatus(''), 2500);
  };
  
  const handleCopyContent = () => {
    if (!outputContent) return;
    navigator.clipboard.writeText(outputContent);
    setShareStatus(t('linkCopied'));
    playBeep();
    setShowShareOptions(false);
    setTimeout(() => setShareStatus(''), 2500);
  };

  useEffect(() => {
    if (!prevOutputContentRef.current && outputContent) {
      setIsAnimating(true);
      const timer = setTimeout(() => setIsAnimating(false), 500);
      return () => clearTimeout(timer);
    }
    prevOutputContentRef.current = outputContent;
  }, [outputContent]);

  const subject = 'Nội dung được tạo bởi AI';
  const url = window.location.href;
  const encodedUrl = encodeURIComponent(url);
  const encodedSubject = encodeURIComponent(subject);
  const mailBody = outputContent.length > 1500 ? outputContent.substring(0, 1500) + '...' : outputContent;
  const encodedBody = encodeURIComponent(mailBody + `\n\nChia sẻ từ: ${url}`);
  
  // Custom component to render display math with a copy button
  const DisplayMath = ({ node, inline, className, children, ...props }: any) => {
    const [copied, setCopied] = useState(false);
    const match = /language-math/.test(className || '');
    
    const handleCopy = () => {
        const latexCode = String(children).trim();
        navigator.clipboard.writeText(latexCode);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (match && !inline) {
        return (
            <div className="group relative">
                <code className={className} {...props}>
                    {children}
                </code>
                <button 
                    onClick={handleCopy}
                    title={t('copyLatex')}
                    className="absolute top-2 right-2 p-1.5 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm rounded-md text-gray-600 dark:text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity duration-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    {copied ? <span className="text-xs text-green-500 px-1">{t('copied')}</span> : <CopyIcon className="w-4 h-4" />}
                </button>
            </div>
        );
    }
    return <code className={className} {...props}>{children}</code>;
  };

  return (
    <div className="p-4 bg-white dark:bg-gray-900 shadow-md rounded-lg border-2 border-accent-dark dark:border-accent">
      <div className="flex justify-between items-center mb-2">
        <div className="flex items-center space-x-2">
          <p className="font-bold text-secondary-dark dark:text-secondary-light">{t('output')}</p>
          <button
            title={t('clearOutput')}
            onClick={() => {
              setOutputContent('');
              playBeep();
            }}
            disabled={!outputContent}
            className="p-2 text-white bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-700 rounded-full transition-colors disabled:bg-gray-400 dark:disabled:bg-gray-600 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-red-500"
          >
            <TrashIcon className="w-5 h-5"/>
          </button>
        </div>
        <div className="flex items-center space-x-2">
            {shareStatus && (
                <span className="text-sm font-semibold text-green-600 dark:text-green-400 animate-fade-in transition-opacity duration-300">
                    {shareStatus}
                </span>
            )}
             <div className="relative" ref={shareRef}>
                <button
                    title={t('share')}
                    onClick={handleShare}
                    disabled={!outputContent}
                    className="p-2 text-primary hover:text-primary-dark dark:text-primary-light dark:hover:text-cyan-200 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <ShareIcon className="w-5 h-5"/>
                </button>
                {showShareOptions && (
                    <div className="absolute right-0 mt-2 w-64 bg-white dark:bg-gray-800 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-20 py-1 overflow-hidden animate-fade-in">
                        <a href={`https://zalo.me/share/d?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowShareOptions(false)} className="flex items-center space-x-3 w-full text-left px-4 py-2.5 text-sm text-blue-600 dark:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                            <ZaloIcon className="w-5 h-5" />
                            <span>{t('shareLinkViaZalo')}</span>
                        </a>
                        <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`} target="_blank" rel="noopener noreferrer" onClick={() => setShowShareOptions(false)} className="flex items-center space-x-3 w-full text-left px-4 py-2.5 text-sm text-blue-800 dark:text-blue-500 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                            <MessengerIcon className="w-5 h-5" />
                            <span>{t('shareLinkViaMessenger')}</span>
                        </a>
                        <a href={`mailto:?subject=${encodedSubject}&body=${encodedBody}`} onClick={() => setShowShareOptions(false)} className="flex items-center space-x-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                            <MailIcon className="w-5 h-5" />
                            <span>{t('sendContentViaEmail')}</span>
                        </a>
                        <button onClick={handleCopyContent} className="flex items-center space-x-3 w-full text-left px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 font-medium">
                            <CopyIcon className="w-5 h-5" />
                            <span>{t('copyAllContent')}</span>
                        </button>
                    </div>
                )}
            </div>
             <button
                title={t('exportWord')}
                onClick={handleExportWord}
                disabled={!outputContent}
                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-gray-200 dark:hover:bg-gray-700 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                <WordIcon className="w-5 h-5"/>
            </button>
            <button
                title={t('standardize')}
                onClick={handleStandardize}
                disabled={!outputContent || isLoading}
                className="flex items-center space-x-2 px-4 py-2 font-semibold text-secondary-dark dark:text-secondary-light bg-secondary/20 hover:bg-secondary/30 rounded-md shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 focus:ring-secondary disabled:bg-gray-400/20 dark:disabled:bg-gray-600/20 disabled:text-gray-500 dark:disabled:text-gray-400 disabled:cursor-not-allowed"
            >
                <SparklesIcon className="w-5 h-5" />
                <span className="text-[12pt]">{t('standardize')}</span>
            </button>
            <CopyDropdown content={outputContent} playBeep={playBeep} />
        </div>
      </div>
      <div className="relative border-2 border-green-500 dark:border-green-400 bg-gray-50 dark:bg-gray-800/50 rounded-lg h-96 overflow-hidden">
        <div ref={outputContainerRef} onMouseUp={handleMouseUp} className="p-6 w-full h-full overflow-y-auto textbook-output custom-scrollbar text-[12pt]">
            {outputContent ? (
                <div className={isAnimating ? 'animate-fade-in' : ''}>
                    <ReactMarkdown 
                        remarkPlugins={[remarkMath]} 
                        rehypePlugins={[rehypeKatex]}
                        components={{
                            code: DisplayMath
                        }}
                    >
                        {outputContent}
                    </ReactMarkdown>
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                    <SparklesIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                    <h3 className="text-lg font-semibold text-secondary-dark dark:text-secondary-light">{t('resultPlaceholderTitle')}</h3>
                    <p className="text-secondary dark:text-secondary-light/80 mt-1 text-sm">
                        {t('resultPlaceholderBody')}
                    </p>
                </div>
            )}
        </div>
        {selection && !isLoading && (
            <div 
                className="absolute z-20 animate-fade-in"
                style={{ top: `${selection.top}px`, left: `${selection.left}px`, transform: 'translate(-50%, 5px)' }}
            >
                <button
                    onClick={handleElaborationRequest}
                    title={t('explainMore')}
                    className="flex items-center space-x-2 px-3 py-1.5 bg-secondary hover:bg-secondary-dark text-white rounded-full shadow-lg hover:scale-105 transition-transform duration-200"
                >
                    <LightbulbIcon className="w-5 h-5"/>
                    <span className="text-sm font-semibold">{t('explain')}</span>
                </button>
            </div>
        )}
        {isLoading && <OutputProgress progress={progress} />}
      </div>
    </div>
  );
};