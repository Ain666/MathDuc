
import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { InputPanel } from './components/InputPanel';
import { OutputPanel } from './components/OutputPanel';
import { useAudio } from './hooks/useAudio';
import { useBackgroundMusic } from './hooks/useBackgroundMusic';
import { useTranslation } from './lib/i18n';
import type { UploadedFile } from './types';

const App: React.FC = () => {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [inputContent, setInputContent] = useState('');
  const [outputContent, setOutputContent] = useState('');
  const [isLoadingInput, setIsLoadingInput] = useState(false);
  const [isLoadingOutput, setIsLoadingOutput] = useState(false);
  const [inputProgress, setInputProgress] = useState(0);
  const [outputProgress, setOutputProgress] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  
  const { playBeep, playCompletionSound } = useAudio();
  const { playMusic, stopMusic } = useBackgroundMusic();
  const { t } = useTranslation();

  useEffect(() => {
    if (!isLoadingInput && !isLoadingOutput) {
        stopMusic();
    }
  }, [isLoadingInput, isLoadingOutput, stopMusic]);

  const toggleDarkMode = useCallback(() => {
    setIsDarkMode(prev => {
      const newMode = !prev;
      if (newMode) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return newMode;
    });
  }, []);

  return (
    <div className={`min-h-screen transition-colors duration-300 text-[12pt] text-gray-800 dark:text-gray-200`}>
      <div className="container mx-auto p-4 max-w-7xl">
        {/* FIX: Removed props related to API key management from Header component. */}
        <Header isDarkMode={isDarkMode} toggleDarkMode={toggleDarkMode} />
        <main className="mt-4 space-y-6">
          <InputPanel
            inputContent={inputContent}
            setInputContent={setInputContent}
            setOutputContent={setOutputContent}
            isLoading={isLoadingInput}
            setIsLoading={setIsLoadingInput}
            isLoadingOutput={isLoadingOutput}
            progress={inputProgress}
            setProgress={setInputProgress}
            uploadedFiles={uploadedFiles}
            setUploadedFiles={setUploadedFiles}
            playBeep={playBeep}
            playCompletionSound={playCompletionSound}
            playMusic={playMusic}
            setIsLoadingOutput={setIsLoadingOutput}
            setOutputProgress={setOutputProgress}
          />
          <OutputPanel
            outputContent={outputContent}
            setOutputContent={setOutputContent}
            isLoading={isLoadingOutput}
            progress={outputProgress}
            playBeep={playBeep}
            setIsLoading={setIsLoadingOutput}
            setProgress={setOutputProgress}
            playCompletionSound={playCompletionSound}
          />
        </main>
      </div>
    </div>
  );
};

export default App;