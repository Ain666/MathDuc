import React, { useState, useEffect, createContext, useContext, ReactElement } from 'react';

const translations = {
  en: {
    checkingApiKey: 'Checking API Key...',
    apiKeyRequired: 'API Key Required',
    apiKeyPrompt: 'To use this application, please enter your personal Google AI API key. The app will save the key to your browser\'s local storage so you don\'t have to re-enter it.',
    pasteApiKey: 'Paste your API key here',
    save: 'Save',
    getApiKey: 'You can get your API key at',
    headerTitle: 'AI Assistant for Math Teachers',
    selectOrChangeKey: 'Select or change your API key',
    setApiKey: 'Set API Key',
    changeApiKey: 'Change API Key',
    linkCopied: 'Link copied!',
    shared: 'Shared!',
    darkMode: 'Toggle dark mode',
    languageSwitcherTooltip: 'Change language',
    shareApp: 'Share application',
    shareViaZalo: 'Share via Zalo',
    shareViaMessenger: 'Share via Messenger',
    sendViaEmail: 'Send via Email',
    copyLink: 'Copy link',
    history: 'History',
    input: 'Input',
    inputSubtitle: 'Mr. Tuan has trained me to automatically recognize languages and generate questions in your desired language.',
    toolsAndRefDocs: 'Upload Reference Docs (matrix, samples, etc.) & Tools:',
    uploadRefDocs: 'Upload reference documents (matrix, sample exams, etc.) & Tools:',
    uploadImage: 'Upload Image file (JPG, PNG) or Paste image into the input box',
    uploadPdf: 'Upload PDF file (.pdf)',
    uploadWord: 'Upload Word file (.doc, .docx)',
    uploadText: 'Upload Text file (.txt)',
    formulaCheatsheet: 'Formula Cheat Sheet',
    advancedHandwriting: 'Advanced Handwriting',
    advancedHandwritingTooltip: 'Enable to improve accuracy when analyzing images or PDFs containing handwritten text.',
    extractFromFile: 'Extract from file',
    extractAndSolve: 'Extract & Solve',
    clearInput: 'Clear input',
    stopRecording: 'Stop recording',
    startRecording: 'Start voice recording',
    inputPlaceholder: 'Input text with your voice, paste content, or drag & drop files here',
    copy: 'Copy',
    uploadedFiles: 'Uploaded files:',
    deleteFile: 'Delete file',
    aiFunctions: 'AI Functions',
    examCreationGuide: 'Guide to using the exam generation function',
    generateExam: 'Generate Exam',
    generateVariations: 'Generate Variations',
    commonOptions: 'Common Options',
    generalOptions: 'General Options',
    answerKey: 'Answer Key',
    briefSolutions: 'Brief Solutions',
    forGenerateVariations: 'For "Generate Variations"',
    quantity: 'Qty:',
    originalProblem: 'Original Problem',
    output: 'Output',
    clearOutput: 'Clear output',
    share: 'Share',
    shareLinkViaZalo: 'Share link via Zalo',
    shareLinkViaMessenger: 'Share link via Messenger',
    sendContentViaEmail: 'Send content via Email',
    copyAllContent: 'Copy all content',
    exportWord: 'Export Word file',
    copyDropdown: 'Copy',
    copyText: 'Copy Text',
    copyMarkdown: 'Copy Markdown',
    copyLatex: 'Copy LaTeX',
    copyFormula: 'Copy Formula',
    resultPlaceholderTitle: 'Results will appear here',
    resultPlaceholderBody: 'Content from the AI will be beautifully formatted for you.',
    elaborationError: 'Error generating explanation',
    apiKeyError: 'API Key Error',
    apiKeyErrorDetails: 'Please check and enter a valid API key.',
    detailedExplanationFor: 'Detailed explanation for:',
    explain: 'Explain',
    explainMore: 'Explain more',
    copied: 'Copied!',
    algebra: 'Algebra',
    geometry: 'Geometry',
    trigonometry: 'Trigonometry',
    calculus: 'Calculus',
    quadraticFormula: 'Quadratic Formula',
    distributiveProperty: 'Distributive Property',
    logProductRule: 'Logarithm (Product)',
    logQuotientRule: 'Logarithm (Quotient)',
    logPowerRule: 'Logarithm (Power)',
    pythagoreanTheorem: 'Pythagorean Theorem',
    areaOfCircle: 'Area of a Circle',
    circumferenceOfCircle: 'Circumference of a Circle',
    volumeOfSphere: 'Volume of a Sphere',
    sineDefinition: 'Sine Definition',
    cosineDefinition: 'Cosine Definition',
    tangentDefinition: 'Tangent Definition',
    pythagoreanIdentity: 'Pythagorean Identity',
    powerRuleDerivative: 'Power Rule (Derivative)',
    powerRuleIntegral: 'Power Rule (Integral)',
    integrationByParts: 'Integration by Parts',
    examHelpTitle: 'Guide to Effective Exam Creation',
    examHelpIntro: 'To help the AI create high-quality exams, provide clear instructions. The AI will analyze both the <strong>text you enter</strong> and the <strong>files you upload</strong> (images, PDFs, Word).',
    examHelpBestMethod: 'The most effective method:',
    examHelpStep1: '<strong>Enter general requirements in the text box:</strong><br/><em class="text-gray-500 dark:text-gray-400">Example: "Create a 15-minute test for chapter 1 of calculus 12, with 10 multiple-choice questions."</em>',
    examHelpStep2: '<strong>Upload the Matrix & Specification files:</strong> This is the most crucial step for a correctly structured exam.',
    examHelpMatrixExample: 'Example Exam Matrix (in Word/PDF file):',
    examHelpSpecExample: 'Example Specifications (Detailed Description):',
    examHelpSpecContent1: '- Question 1 (Recognition): Topic: Exponents. Requires recognition of the formula a^m * a^n.',
    examHelpSpecContent2: '- Question 2 (Comprehension): Topic: Exponential Functions. Requires finding the domain...',
    examHelpTips: 'Tips:',
    examHelpTip1: 'The more detail you provide, the more accurate the result.',
    examHelpTip2: 'You can upload a sample exam for the AI to learn its style and question format.',
    examHelpTip3: 'Use the "Answer Key" and "Brief Solutions" options for a complete exam set.',
    standardize: 'Standardize',
    standardizeInput: 'Standardize Input',
  },
  vi: {
    checkingApiKey: 'Đang kiểm tra API Key...',
    apiKeyRequired: 'Yêu cầu API Key',
    apiKeyPrompt: 'Để sử dụng ứng dụng này, vui lòng nhập API key Google AI cá nhân của bạn. Ứng dụng sẽ lưu key vào bộ nhớ cục bộ của trình duyệt để bạn không phải nhập lại.',
    pasteApiKey: 'Dán API key của bạn vào đây',
    save: 'Lưu',
    getApiKey: 'Bạn có thể lấy API key của mình tại',
    headerTitle: 'AI Trợ Lý Thầy Tuấn Toán',
    selectOrChangeKey: 'Chọn hoặc thay đổi API Key của bạn',
    setApiKey: 'Thiết lập API Key',
    changeApiKey: 'Đổi API Key',
    linkCopied: 'Đã sao chép liên kết!',
    shared: 'Đã chia sẻ!',
    darkMode: 'Đổi màn hình bảo vệ mắt',
    languageSwitcherTooltip: 'Thay đổi ngôn ngữ',
    shareApp: 'Chia sẻ ứng dụng',
    shareViaZalo: 'Chia sẻ qua Zalo',
    shareViaMessenger: 'Chia sẻ qua Messenger',
    sendViaEmail: 'Gửi qua Email',
    copyLink: 'Sao chép liên kết',
    history: 'Lịch sử',
    input: 'Đầu vào',
    inputSubtitle: 'Thầy Tuấn đã huấn luyện tôi tự động nhận diện ngôn ngữ và ra đề theo ngôn ngữ bạn muốn',
    toolsAndRefDocs: 'Tải lên tài liệu tham khảo (ma trận, mẫu đề, v.v.) & Công cụ:',
    uploadRefDocs: 'Tải lên tài liệu tham khảo (ma trận, mẫu đề, v.v.) & Công cụ:',
    uploadImage: 'Tải file Ảnh (JPG, PNG) hoặc Dán ảnh vào ô nhập liệu',
    uploadPdf: 'Tải file PDF (.pdf)',
    uploadWord: 'Tải file Word (.doc, .docx)',
    uploadText: 'Tải file văn bản (.txt)',
    formulaCheatsheet: 'Sổ tay công thức',
    advancedHandwriting: 'Chữ viết tay NC',
    advancedHandwritingTooltip: 'Kích hoạt để cải thiện độ chính xác khi phân tích ảnh hoặc PDF có chứa chữ viết tay.',
    extractFromFile: 'Xuất từ file',
    extractAndSolve: 'Xuất & Giải',
    clearInput: 'Xóa đầu vào',
    stopRecording: 'Dừng ghi âm',
    startRecording: 'Ghi âm giọng nói',
    inputPlaceholder: 'Nhập văn bản bằng giọng nói, dán nội dung, hoặc kéo thả tệp vào đây',
    copy: 'Sao chép',
    uploadedFiles: 'Tệp đã tải lên:',
    deleteFile: 'Xóa tệp',
    aiFunctions: 'Chức năng AI',
    examCreationGuide: 'Hướng dẫn sử dụng chức năng tạo đề',
    generateExam: 'Tạo đề',
    generateVariations: 'Sinh đề',
    commonOptions: 'Tùy chọn chung',
    generalOptions: 'Tùy chọn chung',
    answerKey: 'Đáp án',
    briefSolutions: 'Giải ngắn',
    forGenerateVariations: 'Cho "Sinh đề"',
    quantity: 'SL:',
    originalProblem: 'Đề gốc',
    output: 'Đầu ra',
    clearOutput: 'Xóa đầu ra',
    share: 'Chia sẻ',
    shareLinkViaZalo: 'Chia sẻ liên kết qua Zalo',
    shareLinkViaMessenger: 'Chia sẻ liên kết qua Messenger',
    sendContentViaEmail: 'Gửi nội dung qua Email',
    copyAllContent: 'Sao chép toàn bộ nội dung',
    exportWord: 'Xuất file Word',
    copyDropdown: 'Sao chép',
    copyText: 'Sao chép Văn bản',
    copyMarkdown: 'Sao chép Markdown',
    copyLatex: 'Sao chép LaTeX',
    copyFormula: 'Sao chép Công thức',
    resultPlaceholderTitle: 'Kết quả sẽ hiện ở đây',
    resultPlaceholderBody: 'Nội dung từ AI sẽ được định dạng đẹp mắt cho bạn.',
    elaborationError: 'Lỗi khi tạo giải thích',
    apiKeyError: 'Lỗi API Key',
    apiKeyErrorDetails: 'Vui lòng kiểm tra lại và nhập API Key hợp lệ.',
    detailedExplanationFor: 'Giải thích chi tiết cho:',
    explain: 'Giải thích',
    explainMore: 'Giải thích thêm',
    copied: 'Đã chép!',
    algebra: 'Đại số',
    geometry: 'Hình học',
    trigonometry: 'Lượng giác',
    calculus: 'Giải tích',
    quadraticFormula: 'Công thức nghiệm bậc hai',
    distributiveProperty: 'Tính chất phân phối',
    logProductRule: 'Logarit (Tích)',
    logQuotientRule: 'Logarit (Thương)',
    logPowerRule: 'Logarit (Lũy thừa)',
    pythagoreanTheorem: 'Định lý Pythagoras',
    areaOfCircle: 'Diện tích hình tròn',
    circumferenceOfCircle: 'Chu vi hình tròn',
    volumeOfSphere: 'Thể tích hình cầu',
    sineDefinition: 'Định nghĩa sin',
    cosineDefinition: 'Định nghĩa cos',
    tangentDefinition: 'Định nghĩa tan',
    pythagoreanIdentity: 'Đồng nhất thức Pythagoras',
    powerRuleDerivative: 'Đạo hàm lũy thừa',
    powerRuleIntegral: 'Tích phân lũy thừa',
    integrationByParts: 'Tích phân từng phần',
    examHelpTitle: 'Hướng dẫn tạo đề thi hiệu quả',
    examHelpIntro: 'Để AI tạo ra đề thi chất lượng cao, hãy cung cấp chỉ dẫn rõ ràng. AI sẽ phân tích cả <strong>văn bản bạn nhập</strong> và <strong>các tệp bạn tải lên</strong> (ảnh, PDF, Word).',
    examHelpBestMethod: 'Phương pháp hiệu quả nhất:',
    examHelpStep1: '<strong>Nhập yêu cầu chung vào ô văn bản:</strong><br/><em class="text-gray-500 dark:text-gray-400">Ví dụ: "Tạo đề kiểm tra 15 phút chương 1 giải tích 12, gồm 10 câu trắc nghiệm."</em>',
    examHelpStep2: '<strong>Tải lên tệp Ma Trận & Đặc Tả:</strong> Đây là bước quan trọng nhất để đề thi có cấu trúc chính xác.',
    examHelpMatrixExample: 'Ví dụ Ma Trận Đề (trong file Word/PDF):',
    examHelpSpecExample: 'Ví dụ Đặc Tả (Mô tả chi tiết):',
    examHelpSpecContent1: '- Câu 1 (Nhận biết): Chủ đề Lũy thừa. Yêu cầu nhận biết công thức a^m * a^n.',
    examHelpSpecContent2: '- Câu 2 (Thông hiểu): Chủ đề Hàm số mũ. Yêu cầu tìm tập xác định...',
    examHelpTips: 'Mẹo:',
    examHelpTip1: 'Cung cấp càng chi tiết, kết quả càng chính xác.',
    examHelpTip2: 'Bạn có thể tải lên đề thi mẫu để AI học theo phong cách và dạng câu hỏi.',
    examHelpTip3: 'Sử dụng các tùy chọn "Đáp án" và "Giải ngắn" để có bộ đề hoàn chỉnh.',
    standardize: 'Chuẩn hóa',
    standardizeInput: 'Chuẩn hóa Đầu vào',
  }
};

type Language = keyof typeof translations;
type TranslationKey = keyof (typeof translations)['en'];

const getInitialLanguage = (): Language => {
    if (typeof window !== 'undefined') {
        const browserLang = navigator.language.split('-')[0];
        if (browserLang === 'vi') {
            return 'vi';
        }
    }
    return 'en';
};

const LanguageContext = createContext<{
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
} | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: React.ReactNode }): ReactElement => {
  const [language, setLanguage] = useState<Language>(getInitialLanguage());

  const t = (key: TranslationKey): string => {
    return translations[language][key] || translations.en[key] || key;
  };

  // FIX: Using React.createElement to avoid parsing errors in a .ts file.
  // Added explicit ReactElement return type to fix downstream typing error in index.tsx.
  return React.createElement(LanguageContext.Provider, { value: { language, setLanguage, t } }, children);
};

export const useTranslation = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useTranslation must be used within a LanguageProvider');
  }
  return context;
};

export const getFormulas = (language: Language) => {
    const t = (key: TranslationKey) => translations[language][key] || translations.en[key] || key;
    return [
        { 
            category: t('algebra'),
            items: [
                { name: t('quadraticFormula'), latex: 'x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}' },
                { name: t('distributiveProperty'), latex: 'a(b+c) = ab + ac' },
                { name: t('logProductRule'), latex: '\\log_b(xy) = \\log_b(x) + \\log_b(y)' },
                { name: t('logQuotientRule'), latex: '\\log_b(\\frac{x}{y}) = \\log_b(x) - \\log_b(y)' },
                { name: t('logPowerRule'), latex: '\\log_b(x^y) = y\\log_b(x)' },
            ]
        },
        { 
            category: t('geometry'),
            items: [
                { name: t('pythagoreanTheorem'), latex: 'a^2 + b^2 = c^2' },
                { name: t('areaOfCircle'), latex: 'A = \\pi r^2' },
                { name: t('circumferenceOfCircle'), latex: 'C = 2\\pi r' },
                { name: t('volumeOfSphere'), latex: 'V = \\frac{4}{3}\\pi r^3' },
            ]
        },
        {
            category: t('trigonometry'),
            items: [
// FIX: Replaced forbidden `\text{}` with `\mathrm{}` as per formatting guidelines.
                { name: t('sineDefinition'), latex: `\\sin(\\theta) = \\frac{\\mathrm{${language === 'vi' ? 'đối' : 'opposite'}}}{\\mathrm{${language === 'vi' ? 'huyền' : 'hypotenuse'}}}` },
                { name: t('cosineDefinition'), latex: `\\cos(\\theta) = \\frac{\\mathrm{${language === 'vi' ? 'kề' : 'adjacent'}}}{\\mathrm{${language === 'vi' ? 'huyền' : 'hypotenuse'}}}` },
                { name: t('tangentDefinition'), latex: `\\tan(\\theta) = \\frac{\\mathrm{${language === 'vi' ? 'đối' : 'opposite'}}}{\\mathrm{${language === 'vi' ? 'kề' : 'adjacent'}}}` },
                { name: t('pythagoreanIdentity'), latex: '\\sin^2(\\theta) + \\cos^2(\\theta) = 1' },
            ]
        },
        {
            category: t('calculus'),
            items: [
                { name: t('powerRuleDerivative'), latex: '\\frac{d}{dx}x^n = nx^{n-1}' },
                { name: t('powerRuleIntegral'), latex: "\\int x^n \\,dx = \\frac{x^{n+1}}{n+1} + C'" },
                { name: t('integrationByParts'), latex: '\\int u \\,dv = uv - \\int v \\,du' },
            ]
        }
    ];
};