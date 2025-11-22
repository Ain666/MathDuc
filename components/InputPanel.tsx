import React, { useRef, useState, useCallback, ChangeEvent, useEffect } from 'react';
import type { UploadedFile } from '../types';
import { extractText, extractAndSolve, generateExam, generateVariations, standardizeText } from '../services/geminiService';
import { InputProgress } from './InputProgress';
import { FormulaCheatSheet } from './FormulaCheatSheet';
import { CopyIcon, HourglassIcon, AiIcon, ImageIcon, PdfIcon, WordIcon, FileIcon, TrashIcon, BookOpenIcon, FileSearchIcon, FileCogIcon, FilePlus2Icon, CopyPlusIcon, PenLineIcon, QuestionMarkCircleIcon, MicrophoneIcon, SparklesIcon } from '../constants';
import { useTranslation } from '../lib/i18n';

interface InputPanelProps {
  inputContent: string;
  setInputContent: React.Dispatch<React.SetStateAction<string>>;
  setOutputContent: React.Dispatch<React.SetStateAction<string>>;
  isLoading: boolean;
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>;
  isLoadingOutput: boolean;
  progress: number;
  setProgress: React.Dispatch<React.SetStateAction<number>>;
  uploadedFiles: UploadedFile[];
  setUploadedFiles: React.Dispatch<React.SetStateAction<UploadedFile[]>>;
  playBeep: (count?: number) => void;
  playCompletionSound: () => void;
  playMusic: () => void;
  setIsLoadingOutput: React.Dispatch<React.SetStateAction<boolean>>;
  setOutputProgress: React.Dispatch<React.SetStateAction<number>>;
}

interface ActionButtonProps extends React.PropsWithChildren<{
  onClick: () => void;
  disabled: boolean;
  className?: string;
  isIconOnly?: boolean;
  title?: string;
  isLoading?: boolean;
  progress?: number;
}> {}

const ActionButton: React.FC<ActionButtonProps> = ({ onClick, disabled, children, className, isIconOnly = false, title, isLoading = false, progress = 0 }) => (
    <button
        onClick={onClick}
        disabled={disabled}
        title={title}
        className={`relative overflow-hidden flex items-center justify-center font-semibold text-white rounded-md shadow-sm transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-900 ${
            isIconOnly ? 'p-2' : 'px-4 py-2 text-sm'
        } ${
            disabled ? 'bg-gray-400 dark:bg-gray-600 cursor-not-allowed' : ''
        } ${className}`}
    >
        {isLoading && progress > 0 && (
            <span
                className="absolute top-0 left-0 h-full bg-white/25"
                style={{ width: `${progress}%`, transition: 'width 0.3s ease-out' }}
            />
        )}
        <div className="relative z-10 flex items-center justify-center">
            {isLoading ? <HourglassIcon className="w-5 h-5 animate-spin"/> : children}
        </div>
    </button>
);

const FileUploadButton: React.FC<{ onFileSelect: (files: File[]) => void; accept: string; icon: React.ReactNode; title: string; }> = ({ onFileSelect, accept, icon, title }) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (event.target.files) {
            onFileSelect(Array.from(event.target.files));
        }
    };

    return (
        <>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept={accept}
                className="hidden"
                multiple
            />
            <button
                onClick={() => fileInputRef.current?.click()}
                title={title}
                className="p-2 rounded-md bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 border-2 border-transparent hover:border-primary transition-all"
            >
                {icon}
            </button>
        </>
    );
};

const FileChip: React.FC<{ file: File; onRemove: () => void }> = ({ file, onRemove }) => {
    const getFileIcon = (type: string) => {
        if (type.startsWith('image/')) return <ImageIcon className="w-4 h-4 text-pink-500" />;
        if (type === 'application/pdf') return <PdfIcon className="w-4 h-4 text-red-500" />;
        if (type.includes('word')) return <WordIcon className="w-4 h-4 text-blue-500" />;
        return <FileIcon className="w-4 h-4 text-gray-500" />;
    };

    return (
        <div className="flex items-center bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1 text-sm animate-fade-in">
            {getFileIcon(file.type)}
            <span className="ml-2 mr-2 truncate max-w-xs">{file.name}</span>
            <button onClick={onRemove} className="text-gray-500 dark:text-gray-400 hover:text-red-500 dark:hover:text-red-400">
                &times;
            </button>
        </div>
    );
};


const ExamCreationHelp: React.FC = () => {
    const { t } = useTranslation();
    const [isOpen, setIsOpen] = useState(false);
    
    return (
        <div className="relative inline-block">
            <button onClick={() => setIsOpen(!isOpen)} className="ml-2 text-gray-400 hover:text-primary transition-colors">
                <QuestionMarkCircleIcon className="w-5 h-5" />
            </button>
            {isOpen && (
                <div 
                    className="absolute z-30 -right-4 md:right-auto md:left-0 mt-2 w-80 md:w-96 p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-2xl animate-fade-in"
                >
                    <h4 className="font-bold text-lg mb-2 text-accent-dark dark:text-accent">{t('examHelpTitle')}</h4>
                    <p className="text-sm mb-3">{t('examHelpIntro')}</p>
                    <div className="space-y-3 text-sm">
                        <p className="font-semibold">{t('examHelpBestMethod')}</p>
                        <p>{t('examHelpStep1')}</p>
                        <p>{t('examHelpStep2')}</p>
                        <div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                            <p className="font-semibold">{t('examHelpMatrixExample')}</p>
                            <img src="https://i.imgur.com/k2A0L7E.png" alt="Matrix Example" className="mt-1 rounded border dark:border-gray-600"/>
                        </div>
                         <div className="p-2 bg-gray-100 dark:bg-gray-700/50 rounded-md">
                            <p className="font-semibold">{t('examHelpSpecExample')}</p>
                            <p className="text-xs mt-1 pl-2 border-l-2 border-gray-300 dark:border-gray-600">
                                {t('examHelpSpecContent1')}<br/>
                                {t('examHelpSpecContent2')}
                            </p>
                        </div>
                        <p className="font-semibold pt-2">{t('examHelpTips')}</p>
                        <ul className="list-disc list-inside text-xs space-y-1">
                            <li>{t('examHelpTip1')}</li>
                            <li>{t('examHelpTip2')}</li>
                            <li>{t('examHelpTip3')}</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};


export const InputPanel: React.FC<InputPanelProps> = ({
  inputContent, setInputContent, setOutputContent, isLoading, setIsLoading, isLoadingOutput, progress, setProgress,
  uploadedFiles, setUploadedFiles, playBeep, playCompletionSound, playMusic, setIsLoadingOutput, setOutputProgress,
}) => {
    const { t } = useTranslation();
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const finalTranscriptRef = useRef('');
    const [commonOptions, setCommonOptions] = useState({ includeAnswerKey: true, includeSolutions: false });
    const [genVarsOptions, setGenVarsOptions] = useState({ quantity: 2, includeOriginal: true });
    const [useAdvancedHre] = useState(true);
    const [isDragging, setIsDragging] = useState(false);
    const [isStandardizing, setIsStandardizing] = useState(false);

    useEffect(() => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;

            recognition.onresult = (event: any) => {
                let interimTranscript = '';
                let finalTranscript = '';
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }
                
                if (finalTranscript) {
                    finalTranscriptRef.current += finalTranscript.trim() + ' ';
                }

                setInputContent(finalTranscriptRef.current + interimTranscript);
            };
            
            recognition.onerror = (event: any) => {
                console.error("Speech recognition error", event.error);
                setIsListening(false);
            };

            recognition.onend = () => {
                setIsListening(false);
            };
            
            recognitionRef.current = recognition;
        }
    }, [setInputContent]);

    const toggleListening = () => {
        if (isListening) {
            recognitionRef.current?.stop();
            setIsListening(false);
        } else {
            finalTranscriptRef.current = inputContent ? inputContent.trim() + ' ' : '';
            recognitionRef.current?.start();
            setIsListening(true);
        }
    };

    const addFiles = useCallback((newFiles: File[]) => {
        const newUploadedFiles = newFiles.map(file => ({ file, id: `${file.name}-${file.lastModified}` }));
        setUploadedFiles(prev => {
            const existingIds = new Set(prev.map(f => f.id));
            const uniqueNewFiles = newUploadedFiles.filter(f => !existingIds.has(f.id));
            return [...prev, ...uniqueNewFiles];
        });
        playBeep();
    }, [playBeep, setUploadedFiles]);

    const removeFile = useCallback((id: string) => {
        setUploadedFiles(prev => prev.filter(f => f.id !== id));
    }, [setUploadedFiles]);
    
    const handleStandardizeInput = async () => {
        if (!inputContent) return;

        playBeep();
        setIsStandardizing(true);
        
        try {
            const standardizedResult = await standardizeText({ text: inputContent });
            setInputContent(standardizedResult);
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
                setOutputContent(errorMsg);
            } else {
                console.error("Standardization failed:", error);
                const errorMsg = `\n\n---\n\n### ${t('elaborationError')}\n\n> ${errorMessage}`;
                setOutputContent(errorMsg);
            }
        } finally {
            setIsStandardizing(false);
        }
    };

    const handleAction = async (action: (params: any) => Promise<string>, params: any) => {
        playBeep();
        playMusic();
    
        const isOutputAction = ['generateVariations', 'extractAndSolve'].includes(action.name);
        const isInputAction = ['extractText', 'generateExam'].includes(action.name);
    
        if (isOutputAction) {
            setIsLoadingOutput(true);
            setOutputProgress(0);
            setOutputContent('');
        } else if (isInputAction) {
            setIsLoading(true);
            setProgress(0);
        }
    
        try {
            const onProgress = isOutputAction ? setOutputProgress : setProgress;
            const result = await action({ ...params, onProgress });
    
            if (isInputAction) {
                setInputContent(result);
            } else {
                setOutputContent(result);
            }
    
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
                setOutputContent(errorMsg);
            } else {
                console.error("Gemini API call failed:", error);
                const errorMsg = `\n\n---\n\n### ${t('elaborationError')}\n\n> ${errorMessage}`;
                setOutputContent(errorMsg);
            }
        } finally {
            if (isOutputAction) setIsLoadingOutput(false);
            if (isInputAction) setIsLoading(false);
        }
    };
    
    const handlePaste = useCallback((event: ClipboardEvent) => {
        if (event.clipboardData) {
            const items = Array.from(event.clipboardData.items);
            const imageFiles = items.filter(item => item.type.startsWith('image/')).map(item => item.getAsFile()).filter((f): f is File => f !== null);
            if (imageFiles.length > 0) {
                event.preventDefault();
                addFiles(imageFiles);
            }
        }
    }, [addFiles]);

    useEffect(() => {
        const ta = textareaRef.current;
        ta?.addEventListener('paste', handlePaste);
        return () => {
            ta?.removeEventListener('paste', handlePaste);
        };
    }, [handlePaste]);

    const handleDrop = useCallback((event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
        if (event.dataTransfer.files) {
            addFiles(Array.from(event.dataTransfer.files));
        }
    }, [addFiles]);

    const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(true);
    };

    const handleDragLeave = (event: React.DragEvent<HTMLDivElement>) => {
        event.preventDefault();
        setIsDragging(false);
    };

    return (
        <div 
            className={`relative p-4 bg-white dark:bg-gray-900 shadow-md rounded-lg border-2 border-amber-400 transition-all duration-300 ${isDragging ? 'ring-4 ring-primary' : ''}`}
            onDrop={handleDrop} 
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
        >
            {isLoading && <InputProgress progress={progress} />}
            <div className="flex items-baseline space-x-3 mb-2">
                <p className="text-2xl font-bold text-amber-600 dark:text-amber-400">{t('input')}</p>
                <p className="text-lg font-medium text-gray-600 dark:text-gray-300">{t('inputSubtitle')}</p>
            </div>
            
            <p className="text-sm font-semibold text-gray-600 dark:text-gray-400 mb-2">{t('toolsAndRefDocs')}</p>

            <div className="p-3 border-2 border-dashed border-purple-300 dark:border-purple-700 rounded-lg mb-4">
                 <div className="flex justify-between items-center">
                    <div className="flex items-center space-x-2 flex-wrap gap-2">
                        <FileUploadButton onFileSelect={addFiles} accept="image/jpeg,image/png" icon={<ImageIcon className="w-6 h-6 text-green-500" />} title={t('uploadImage')} />
                        <FileUploadButton onFileSelect={addFiles} accept=".pdf" icon={<PdfIcon className="w-6 h-6 text-red-500" />} title={t('uploadPdf')} />
                        <FileUploadButton onFileSelect={addFiles} accept=".doc,.docx" icon={<WordIcon className="w-6 h-6 text-blue-500" />} title={t('uploadWord')} />
                        <FileUploadButton onFileSelect={addFiles} accept=".txt" icon={<FileIcon className="w-6 h-6 text-slate-500 dark:text-slate-400" />} title={t('uploadText')} />
                        <FormulaCheatSheet playBeep={playBeep} />
                    </div>
                    <div className="flex items-center space-x-2">
                        <ActionButton onClick={() => handleAction(extractText, { files: uploadedFiles.map(f => f.file), text: inputContent, useAdvancedHre })} disabled={uploadedFiles.length === 0 || isLoading || isLoadingOutput} title={t('extractFromFile')} className="bg-amber-600 hover:bg-amber-700 focus:ring-amber-500">
                            <FileSearchIcon className="w-5 h-5"/>
                            <span className="ml-2">{t('extractFromFile')} ({uploadedFiles.length})</span>
                        </ActionButton>
                        <ActionButton onClick={() => handleAction(extractAndSolve, { files: uploadedFiles.map(f => f.file), useAdvancedHre })} disabled={uploadedFiles.length === 0 || isLoading || isLoadingOutput} title={t('extractAndSolve')} className="bg-teal-600 hover:bg-teal-700 focus:ring-teal-500">
                             <FileCogIcon className="w-5 h-5"/>
                            <span className="ml-2">{t('extractAndSolve')} ({uploadedFiles.length})</span>
                        </ActionButton>
                    </div>
                </div>
                 {uploadedFiles.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                        <div className="flex flex-wrap gap-2">
                            {uploadedFiles.map(f => (
                                <FileChip key={f.id} file={f.file} onRemove={() => removeFile(f.id)} />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex gap-4">
                <div className="w-2/3">
                    <div className="relative">
                        <textarea
                            ref={textareaRef}
                            value={inputContent}
                            onChange={(e) => setInputContent(e.target.value)}
                            placeholder={t('inputPlaceholder')}
                            className="w-full h-80 p-4 border-2 border-dashed border-amber-500 dark:border-amber-700 bg-amber-50/50 dark:bg-gray-800/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-600 dark:focus:ring-amber-500 transition-colors custom-scrollbar text-[12pt]"
                            aria-label="Input content"
                        />
                    </div>
                    <div className="mt-3 flex items-center justify-end space-x-4">
                        <button 
                            onClick={handleStandardizeInput} 
                            disabled={!inputContent || isStandardizing || isLoading || isLoadingOutput} 
                            title={t('standardizeInput')} 
                            className="flex items-center justify-center h-11 px-6 text-base font-bold rounded-lg bg-violet-100 text-violet-700 hover:bg-violet-200 dark:bg-violet-500/20 dark:text-violet-300 dark:hover:bg-violet-500/30 disabled:bg-gray-200 dark:disabled:bg-gray-700 disabled:text-gray-400 dark:disabled:text-gray-500 transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5"
                        >
                            {isStandardizing ? <HourglassIcon className="w-5 h-5 animate-spin"/> : t('standardize')}
                        </button>
                        <button onClick={toggleListening} title={isListening ? t('stopRecording') : t('startRecording')} className={`flex items-center justify-center h-11 w-11 rounded-full transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5 ${ isListening ? 'bg-red-200 dark:bg-red-800' : 'bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600'}`}>
                            <MicrophoneIcon className={`w-6 h-6 ${ isListening ? 'text-red-500 animate-pulse-mic' : 'text-blue-500' }`}/>
                        </button>
                        <button onClick={() => { setInputContent(''); playBeep(); }} disabled={!inputContent} title={t('clearInput')} className="flex items-center justify-center h-11 w-11 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                            <TrashIcon className="w-6 h-6 text-red-500"/>
                        </button>
                        <button onClick={() => { navigator.clipboard.writeText(inputContent); playBeep(1); }} disabled={!inputContent} title={t('copy')} className="flex items-center justify-center h-11 w-11 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-sm hover:shadow-md transform hover:-translate-y-0.5">
                            <CopyIcon className="w-6 h-6 text-green-600"/>
                        </button>
                    </div>
                </div>

                 <div className="w-1/3 p-4 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg shadow-sm">
                    <div className="flex items-center mb-4">
                        <h3 className="font-bold text-gray-700 dark:text-gray-300">{t('aiFunctions')}</h3>
                        <ExamCreationHelp/>
                    </div>
                    
                    <div className="flex">
                        <button 
                            onClick={() => handleAction(generateExam, { text: inputContent, files: uploadedFiles.map(f => f.file), ...commonOptions })}
                            disabled={(!inputContent && uploadedFiles.length === 0) || isLoading || isLoadingOutput}
                            title={t('generateExam')}
                            className="flex-1 flex items-center justify-center p-2.5 text-white font-semibold rounded-l-md transition-colors duration-200 bg-primary hover:bg-primary-dark disabled:bg-gray-400 text-[12pt] border-r border-blue-600 dark:border-blue-400"
                        >
                            <FilePlus2Icon className="w-5 h-5 mr-2"/>
                            <span>{t('generateExam')}</span>
                        </button>
                        <button
                            onClick={() => handleAction(generateVariations, { text: inputContent, ...genVarsOptions, ...commonOptions })}
                            disabled={!inputContent || isLoading || isLoadingOutput}
                            title={t('generateVariations')}
                            className="flex-1 flex items-center justify-center p-2.5 text-white font-semibold rounded-r-md transition-colors duration-200 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-400 text-[12pt]"
                        >
                            <CopyPlusIcon className="w-5 h-5 mr-2"/>
                            <span>{t('generateVariations')}</span>
                        </button>
                    </div>

                    <div className="mt-4 flex justify-between text-sm">
                        <div>
                            <p className="font-bold text-gray-700 dark:text-gray-300 mb-2">{t('commonOptions')}</p>
                            <label className="flex items-center space-x-2 cursor-pointer mb-2">
                                <input type="checkbox" checked={commonOptions.includeAnswerKey} onChange={e => setCommonOptions(p => ({...p, includeAnswerKey: e.target.checked}))} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <span className="text-gray-700 dark:text-gray-300">{t('answerKey')}</span>
                            </label>
                            <label className="flex items-center space-x-2 cursor-pointer">
                                <input type="checkbox" checked={commonOptions.includeSolutions} onChange={e => setCommonOptions(p => ({...p, includeSolutions: e.target.checked}))} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                                <span className="text-gray-700 dark:text-gray-300">{t('briefSolutions')}</span>
                            </label>
                        </div>
                        <div className="text-right">
                             <p className="font-bold text-orange-500 mb-2">{t('forGenerateVariations')}</p>
                             <div className="flex items-center justify-end space-x-2 mb-2">
                                <span className="text-gray-700 dark:text-gray-300">{t('quantity')}</span>
                                <input type="number" min="1" max="10" value={genVarsOptions.quantity} onChange={e => setGenVarsOptions(p => ({...p, quantity: parseInt(e.target.value) || 1}))} className="w-16 px-2 py-0.5 text-sm bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-1 focus:ring-primary"/>
                            </div>
                            <label className="flex items-center justify-end space-x-2 cursor-pointer">
                                <span className="text-gray-700 dark:text-gray-300">{t('originalProblem')}</span>
                                <input type="checkbox" checked={genVarsOptions.includeOriginal} onChange={e => setGenVarsOptions(p => ({...p, includeOriginal: e.target.checked}))} className="w-4 h-4 text-primary bg-gray-100 border-gray-300 rounded focus:ring-primary dark:focus:ring-blue-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600"/>
                            </label>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};