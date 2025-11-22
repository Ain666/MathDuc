
import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { BookOpenIcon, CopyIcon } from '../constants';
import { useTranslation, getFormulas } from '../lib/i18n';

interface FormulaCheatSheetProps {
    playBeep: (count?: number) => void;
}

export const FormulaCheatSheet: React.FC<FormulaCheatSheetProps> = ({ playBeep }) => {
    const { t, language } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    const [copiedFormula, setCopiedFormula] = useState<string | null>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const FORMULAS = getFormulas(language);

    const handleCopy = (latex: string) => {
        navigator.clipboard.writeText(latex);
        playBeep(1);
        setCopiedFormula(latex);
        setTimeout(() => setCopiedFormula(null), 2000);
    };

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <div className="relative" ref={wrapperRef}>
            <button
                onClick={() => setIsOpen(prev => !prev)}
                title={t('formulaCheatsheet')}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 border-2 border-transparent hover:border-accent transition-all"
            >
                <BookOpenIcon className="w-6 h-6 text-amber-500" />
            </button>

            {isOpen && (
                <div className="absolute z-30 top-full mt-2 -right-4 md:right-0 w-80 max-h-96 overflow-y-auto custom-scrollbar bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl p-4 animate-fade-in">
                    <h3 className="font-bold text-lg mb-3 text-primary dark:text-primary-light">{t('formulaCheatsheet')}</h3>
                    {FORMULAS.map(category => (
                        <div key={category.category} className="mb-4">
                            <h4 className="font-semibold text-gray-700 dark:text-gray-300 border-b border-gray-200 dark:border-gray-600 pb-1 mb-2">{category.category}</h4>
                            <ul className="space-y-2">
                                {category.items.map(formula => (
                                    <li key={formula.name} className="flex items-center justify-between group">
                                        <div className="flex-grow">
                                            <p className="text-sm text-gray-600 dark:text-gray-400">{formula.name}</p>
                                            <div className="text-left">
                                                <ReactMarkdown remarkPlugins={[remarkMath]} rehypePlugins={[rehypeKatex]}>
                                                    {`$$${formula.latex}$$`}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleCopy(formula.latex)} 
                                            className="p-1.5 rounded-md text-gray-500 hover:text-primary-dark dark:hover:text-primary-light hover:bg-gray-200 dark:hover:bg-gray-700 opacity-0 group-hover:opacity-100 transition-opacity"
                                            title={t('copyLatex')}
                                        >
                                            {copiedFormula === formula.latex ? <span className="text-xs text-green-500">{t('copied')}</span> : <CopyIcon className="w-4 h-4" />}
                                        </button>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};