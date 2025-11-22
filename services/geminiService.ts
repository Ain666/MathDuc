import { GoogleGenAI } from "@google/genai";
import { GEMINI_FORMATTING_INSTRUCTIONS, ADVANCED_HRE_INSTRUCTIONS } from '../constants';
import type { GeminiServiceParams } from '../types';

// Declare pdfjsLib and mammoth at a higher scope
declare const pdfjsLib: any;
declare const mammoth: any;

const fileToGenerativeParts = async (file: File): Promise<object[]> => {
  // Handle PDF files by converting each page to a JPEG image
  if (file.type === 'application/pdf') {
    // Set the worker source for pdf.js
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.3.136/pdf.worker.min.mjs`;
    
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;
    const parts = [];

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 2.0 }); // Use a higher scale for better quality
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      if (!context) continue;

      canvas.height = viewport.height;
      canvas.width = viewport.width;

      await page.render({ canvasContext: context, viewport: viewport }).promise;
      
      // Convert canvas to JPEG data URL
      const dataUrl = canvas.toDataURL('image/jpeg', 0.9); // 0.9 quality
      parts.push({
        inlineData: {
          data: dataUrl.split(',')[1],
          mimeType: 'image/jpeg',
        },
      });
    }
    return parts;
  }
  // Handle Word files by extracting their text content
  else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || file.type === 'application/msword') {
    const arrayBuffer = await file.arrayBuffer();
    try {
        const result = await mammoth.extractRawText({ arrayBuffer });
        // The extracted text is sent as a separate text part.
        return [{ text: result.value }];
    } catch (e) {
        console.error("Error processing Word file:", e);
        const errorMessage = `[Lỗi khi xử lý tệp Word: ${file.name}]`;
        return [{ text: errorMessage }];
    }
  }
  // Handle other file types (primarily images) by base64 encoding
  else {
    const base64EncodedData = await new Promise<string>((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
      reader.readAsDataURL(file);
    });
    return [{
      inlineData: { data: base64EncodedData, mimeType: file.type },
    }];
  }
};

// FIX: Aligned with API key guidelines. Removed local storage access and now uses process.env.API_KEY.
const runGemini = async (prompt: string, files: File[] = []) => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    const modelName = 'gemini-2.5-flash';

    // Process all files and flatten the resulting parts array
    const filePartsPromises = files.map(fileToGenerativeParts);
    const nestedFileParts = await Promise.all(filePartsPromises);
    const fileParts = nestedFileParts.flat();

    const contents = { parts: [{ text: prompt }, ...fileParts] };

    const result = await ai.models.generateContent({
        model: modelName,
        contents,
    });

    // Per user request, remove all backticks to prevent incorrect markdown rendering.
    return result.text.replace(/`/g, '');
};

export const standardizeText = async ({ text, onProgress }: { text: string; onProgress?: (progress: number) => void; }): Promise<string> => {
    onProgress?.(25);
    const prompt = `You are an expert AI assistant specializing in cleaning and standardizing text, particularly for mathematical and technical documents. Your task is to process the user's input text and apply the following cleaning and formatting rules precisely. You MUST return ONLY the cleaned text, without any introductory or concluding remarks.

**Formatting and Cleaning Rules:**

1.  **Mathematical Formula Standardization:**
    *   Thoroughly analyze all text to identify mathematical and chemical expressions.
    *   Correct any syntax errors within existing LaTeX delimiters (\`\${...}\$\`).
    *   For any mathematical or chemical formulas that are currently plain text, enclose them in the correct LaTeX delimiters (\`\${...}\$\`).
    *   Apply the complete set of formatting rules from the "Detailed Formatting Rules" section below to ensure all formulas, variables, units, and chemical notations are perfectly formatted. This is your primary task.

2.  **Remove Unnecessary Markdown and Characters:**
    *   Delete all instances of bold markers (\`**\`).
    *   Delete any Markdown table header separator lines (e.g., \`|:---|:---|\`, \`|:---------|:----------------------|\`).
    *   Delete all Markdown heading markers (\`#\`, \`##\`, \`###\`, etc.).
    *   Delete all Markdown horizontal rule markers (\`---\`, \`***\`).
    *   For lines that appear to be part of a table, you MUST remove the leading (\`|\`) and trailing (\`|\`) pipe characters from every line.
        *   **Example Input:** \`| Question 3 | A | A |\`
        *   **Correct Output:** \`Question 3 | A | A\`
    *   Remove any extra or redundant empty lines. A single empty line between paragraphs is sufficient.

3.  **Preserve Content Integrity:**
    *   Do not alter the core meaning or content of the text. Your role is purely for formatting and cleaning.
    *   Maintain the original structure, such as paragraphs and lists, after cleaning.

**Detailed Formatting Rules (HIGHEST PRIORITY):**
${GEMINI_FORMATTING_INSTRUCTIONS}

**User's Text to Process:**
---
${text}
---`;
    onProgress?.(50);
    const result = await runGemini(prompt);
    onProgress?.(100);
    return result;
};

export const extractText = async ({ files = [], onProgress, useAdvancedHre }: GeminiServiceParams): Promise<string> => {
    onProgress?.(25);
    const advancedHreText = useAdvancedHre ? ADVANCED_HRE_INSTRUCTIONS : '';
    const prompt = `You are an expert AI assistant for document analysis and OCR. Your task is to extract text from the provided file(s). Follow this process exactly:

**Step 1: Analyze Content**
- First, determine the document's category: Is it **Technical** (contains significant math, physics, or chemistry content) or **General** (standard text like literature, articles, notes)?

**Step 2: Execute Extraction Based on Category**

*   **If the document is "General":**
    *   Your ONLY task is to extract the text verbatim.
    *   Preserve all original paragraphing, line breaks, and structure.
    *   It is ABSOLUTELY FORBIDDEN to alter the text or apply any mathematical or chemical formatting.
    *   **You MUST IGNORE ALL formatting rules listed later in this prompt.** They DO NOT apply to general documents.
    *   Your output should be ONLY the clean, extracted text.

*   **If the document is "Technical":**
    *   Extract all text.
    *   After extraction, you MUST meticulously reformat all mathematical expressions, chemical formulas, and units of measurement according to the "Detailed Formatting Rules" provided below. This is mandatory.

**Universal OCR & Handwriting Protocol (For both categories):**
Your OCR performance must be flawless. You will now operate with state-of-the-art visual analysis capabilities, equivalent to using **augmented optical glasses with a 5x digital zoom and magnifier** to meticulously inspect every detail, especially on difficult sources like poor quality scans, blurry camera photos, and smeared handwritten notes.
*   **Image Pre-processing Simulation:**
    *   **Sharpening & Deblurring:** Mentally apply a high-pass sharpening filter to counteract blur.
    *   **Contrast Enhancement:** Normalize the image histogram to maximize the contrast between text and background.
    *   **Deskew & Denoise:** Correct for any page rotation and remove background noise/artifacts.
*   **Handwriting Recognition Engine (HRE):**
    *   **Activation:** Automatically engage this mode when handwritten text is detected.
    *   **Contextual Disambiguation:** Use the document's context (technical or general) as the primary tool to differentiate similar characters.
    *   **Common Confusion Pairs:** Pay extreme attention to resolving these pairs: [1, l, I], [0, O, o], [5, S], [2, Z], [u, v], [g, q, 9], [x, χ].
${advancedHreText}
*   **Logical Self-Correction Loop:**
    *   **First Pass:** Perform a quick, full extraction.
    *   **Second Pass (Verification):** Reread the extracted text. Does it make logical sense within its context?
    *   **Third Pass (Correction):** If any inconsistencies are found, re-examine the specific area of the source image with maximum focus to correct the error. This is a mandatory step.

**Detailed Formatting Rules (ONLY FOR TECHNICAL DOCUMENTS):**
${GEMINI_FORMATTING_INSTRUCTIONS}`;
    onProgress?.(50);
    const result = await runGemini(prompt, files);
    onProgress?.(100);
    return result;
};

export const extractAndSolve = async ({ files = [], onProgress, useAdvancedHre }: GeminiServiceParams): Promise<string> => {
    onProgress?.(25);
    const advancedHreText = useAdvancedHre ? ADVANCED_HRE_INSTRUCTIONS : '';
    const prompt = `You are an expert AI assistant for math problems. Follow these steps precisely:
1.  **Full Extraction and Presentation**: First, you MUST extract and present the complete, original content from every single page of the provided file(s). To ensure maximum accuracy, you MUST use the following protocol:
    *   **OCR & Handwriting Protocol (HIGHEST PRIORITY):** Your OCR performance must be flawless. You will now operate with state-of-the-art visual analysis capabilities, equivalent to using **augmented optical glasses with a 5x digital zoom and magnifier** to meticulously inspect every detail. This is especially critical for difficult sources like poor quality scans, blurry camera photos, and smeared handwritten notes.
        *   **Image Pre-processing Simulation:**
            *   **Sharpening & Deblurring:** Mentally apply a high-pass sharpening filter to counteract blur.
            *   **Contrast Enhancement:** Normalize the image histogram to maximize the contrast between text and background.
            *   **Deskew & Denoise:** Correct for any page rotation and remove background noise/artifacts (e.g., coffee stains, shadows).
        *   **Handwriting Recognition Engine (HRE):**
            *   **Activation:** Automatically engage this mode when handwritten text is detected.
            *   **Contextual Disambiguation:** Use mathematical context as the primary tool to differentiate similar characters. For example, in an equation \`... = 5\`, a character that looks like 'S' must be interpreted as '5'. In a variable list, it's likely 'S'.
            *   **Common Confusion Pairs:** Pay extreme attention to resolving these pairs: [1, l, I], [0, O, o], [5, S], [2, Z], [u, v], [g, q, 9], [x, χ].
${advancedHreText}
        *   **Logical Self-Correction Loop:**
            *   **First Pass:** Perform a quick, full extraction.
            *   **Second Pass (Verification):** Reread the extracted text. Does it make logical and mathematical sense? Are equations balanced? Do chemical formulas represent valid compounds?
            *   **Third Pass (Correction):** If any inconsistencies were found in the verification pass, re-examine the specific area of the source image with maximum focus to correct the error. This is a mandatory step. Do not output text that is syntactically or logically flawed.
2.  **Apply Formatting**: After extraction, apply the detailed formatting rules below to all mathematical expressions, chemical formulas, and units within the extracted text.
3.  **Solve All Problems**: After presenting the full, formatted original content, proceed to solve ALL problems contained within it. For each problem, provide a brief explanation for the solution.
4.  **Summarize All Answers**: Finally, create a summary answer table in a horizontal format that includes an answer for EVERY problem you solved. Adapt the table headers (e.g., 'Câu', 'Đáp án', 'Question', 'Answer') to match the document's language. Example format:
    Câu | 1 | 2 | 3 | 4 | 5
    ---|---|---|---|---
    Đáp án | A | C | D | B | A

${GEMINI_FORMATTING_INSTRUCTIONS}`;
    onProgress?.(50);
    const result = await runGemini(prompt, files);
    onProgress?.(100);
    return result;
};

export const generateExam = async ({ text, files = [], onProgress, includeAnswerKey, includeSolutions }: GeminiServiceParams & { includeAnswerKey?: boolean; includeSolutions?: boolean; }): Promise<string> => {
    onProgress?.(25);
    
    let options = [];
    if (includeAnswerKey) options.push("You MUST provide a final answer key table for all generated questions, formatted nicely in a Markdown table.");
    if (includeSolutions) options.push("You MUST provide brief but clear solutions/explanations for every question you generate. Separate each solution clearly.");
    const optionsText = options.length > 0 ? `\n\n**Additional Output Options:**\n${options.join('\n')}` : '';

    const prompt = `You are an AI assistant for a Vietnamese math teacher. Your task is to generate a complete math exam with absolute precision.

**--- CORE DIRECTIVE & PRIORITY HIERARCHY (ABSOLUTE & UNBREAKABLE) ---**

You MUST follow this strict order of priority when generating the exam. Failure to do so is a critical error.

1.  **HIGHEST PRIORITY: File-Based Ma Trận (Matrix) & Đặc Tả (Specifications)**
    *   Your primary and most critical source of instructions is the content within any uploaded files (images, PDFs, Word documents).
    *   You MUST meticulously analyze these files to find the **Ma Trận Đề** (Exam Matrix) and the **Bảng Đặc Tả** (Specification Table).
    *   The generated exam's structure, number of questions per topic, difficulty levels (Nhận biết, Thông hiểu, Vận dụng, Vận dụng cao), and specific content requirements MUST perfectly and exactly match what is defined in these documents.
    *   It is **ABSOLUTELY FORBIDDEN** to generate a question that violates the constraints of the matrix and specifications. For example, if the matrix specifies 2 "Nhận biết" questions for the "Lũy thừa" topic, you MUST generate exactly 2 questions of that type for that topic. No more, no less.

2.  **SECONDARY PRIORITY: Text Input from the User**
    *   The text provided in the input box serves as **supplementary information** or context for the files.
    *   Use this text for details like the exam title, duration ("Thời gian làm bài"), subject ("Môn học"), or general theme if the files do not provide this information.
    *   If there is a conflict between the text input and the uploaded files, **THE FILES ALWAYS WIN**. For example, if the user's text asks for 15 questions but the uploaded matrix defines a structure for only 10 questions, you MUST generate an exam with 10 questions according to the matrix.

**--- STEP-BY-STEP GENERATION PROCESS ---**

You will execute the following steps in order:

1.  **Analyze Files:** Thoroughly examine all provided files. Identify and internalize the Ma Trận and Đặc Tả. If they are not present, note this and rely on the text input.
2.  **Analyze Text Input:** Read the user's text for supplementary details.
3.  **Synthesize Instructions:** Create a final, consolidated generation plan based on the priority hierarchy. The file content is the blueprint; the text input adds details.
4.  **Generate Exam Content:** Write the exam questions one by one, strictly adhering to the plan from step 3. Constantly self-correct to ensure every question matches the required topic, difficulty level, and content as specified in the Đặc Tả.
5.  **Apply Final Formatting:** After generating all content, meticulously apply all formatting rules as defined in the \`GEMINI_FORMATTING_INSTRUCTIONS\`.

**--- OTHER CRITICAL RULES ---**

*   **Content Restriction:** Unless specified by the user's text or the provided Ma Trận/Đặc Tả, you MUST NOT generate problems that involve parameters (e.g., parameter 'm') or complex functions with subtraction. Stick to more direct and standard problem formats.
*   **Vague Requests:** If the user's request (text and files combined) is empty or too vague to create a specific, targeted exam (e.g., no matrix, no specs, just "make an exam"), you MUST NOT generate a generic one. Instead, you must respond politely in Vietnamese, asking for more details (e.g., "Vui lòng cung cấp ma trận, đặc tả chi tiết, hoặc các chủ đề cụ thể để tôi có thể tạo đề chính xác theo yêu cầu của bạn.").
*   **Curriculum Compliance:** All generated content MUST be factually correct and rigorously aligned with the Vietnamese General Education Program 2018 (Chương trình giáo dục phổ thông 2018).

**User's Text Requirements (if any):**
${text}
${optionsText}
${GEMINI_FORMATTING_INSTRUCTIONS}`;
    onProgress?.(50);
    const result = await runGemini(prompt, files);
    onProgress?.(100);
    return result;
};

export const generateVariations = async ({ text, onProgress, quantity, includeSolutions, includeAnswerKey, includeOriginal }: GeminiServiceParams & { quantity: number, includeSolutions: boolean, includeAnswerKey: boolean, includeOriginal: boolean }): Promise<string> => {
    onProgress?.(25);
    let options = [];
    if (includeOriginal) options.push("Start by re-stating the original problem(s) clearly, labelled as 'Đề gốc', before listing the new variations.");
    if (includeAnswerKey) options.push("Provide a final answer key table for all problems (original and variations).");
    if (includeSolutions) options.push("Provide brief solutions for each problem (original and variations).");
    const optionsText = options.length > 0 ? ` Options: ${options.join(' ')}` : '';

    const prompt = `Generate ${quantity} variations of the following math problem(s). You must only change the numerical values. The new values must be realistic and not significantly increase calculation complexity. Preserve the original structure and LaTeX formatting. **IMPORTANT CONTENT RESTRICTION:** Do not introduce parameters (like a variable 'm') or complex subtraction-based functions if they are not present in the original problem.${optionsText}\n\nOriginal Problem(s):\n${text}\n\n${GEMINI_FORMATTING_INSTRUCTIONS}`;
    onProgress?.(50);
    const result = await runGemini(prompt);
    onProgress?.(100);
    return result;
};

export const elaborateText = async ({ fullText, selectedText, onProgress }: { fullText: string; selectedText: string; onProgress?: (progress: number) => void; }): Promise<string> => {
    onProgress?.(25);
    const prompt = `You are an expert AI assistant specializing in mathematics and science education. The user has provided a larger body of text (the "Full Context") and has selected a specific portion of it that they want a more detailed explanation for.

**Full Context:**
---
${fullText}
---

**Selected Portion to Elaborate On:**
---
${selectedText}
---

**Your Task:**
Provide a clear, detailed, step-by-step explanation of the selected portion. Assume the user is a student or teacher looking for a deeper understanding. Break down complex concepts, define key terms, and if the selection is a step in a problem-solving process, explain the reasoning and logic behind that specific step. Your explanation should be easy to understand.

**CRITICAL FORMATTING INSTRUCTIONS:**
- You MUST maintain the same language (e.g., Vietnamese) and professional tone as the original text.
- You MUST meticulously format all mathematical expressions, chemical formulas, and units of measurement according to the rules provided below. This is mandatory for correct rendering.
- Your response should ONLY be the new, detailed explanation. It is FORBIDDEN to repeat the original text or the selected portion unless it's necessary for the explanation itself.

**Detailed Formatting Rules:**
${GEMINI_FORMATTING_INSTRUCTIONS}`;
    onProgress?.(50);
    const result = await runGemini(prompt);
    onProgress?.(100);
    return result;
};