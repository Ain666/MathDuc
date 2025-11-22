
import React from 'react';

export const GEMINI_FORMATTING_INSTRUCTIONS = `
IMPORTANT: Follow these formatting rules strictly. Failure to do so will result in incorrect rendering.

**--- ABSOLUTE RULES (HIGHEST PRIORITY) ---**

*   **MULTIPLE CHOICE LAYOUT**: This is the single most important formatting requirement.
    - **CRITICAL: Newline Before First Option**: The first option (e.g., A.) MUST start on a new line. There must be a line break between the question text and option A.
    - **One Option Per Line**: Each subsequent option (B, C, D, etc.) MUST also be on its own completely separate line.
    - **Force Line Breaks**: To ensure each option is on its own line in Markdown, you MUST end the line of each option with two spaces. This is NOT optional.
    - Do NOT use list markers like \`-\` or \`*\`.
    - **CORRECT FORMAT (This is what you MUST produce):**
      Câu 1: Cho hàm số \${y=f(x)}\$. Mệnh đề nào sau đây đúng?
      A. Nội dung phương án một.  
      B. Nội dung phương án hai.  
      C. Nội dung phương án ba.  
      D. Nội dung phương án bốn.
    - **INCORRECT FORMAT (DO NOT produce this):**
      Câu 1: Cho hàm số \${y=f(x)}\$. Mệnh đề nào sau đây đúng? A. Nội dung phương án một.
*   **NO DUPLICATION**: You MUST NOT write a formula or expression in plain text and then repeat it in LaTeX. Provide only the single, correctly formatted LaTeX version. This is a critical error to avoid.
    *   **WRONG**: \`CO2 \${\\mathrm{CO_2}}\$\`
    *   **WRONG**: \`Công thức là x^2+y^2=r^2, được viết là \${x^2+y^2=r^2}\$\`
    *   **CORRECT**: Simply write the text with the embedded formula: \`Công thức là \${x^2+y^2=r^2}\$\`.
    *   **CORRECT**: \`\${\\mathrm{CO_2}}\$\`
*   **Math vs. Chemistry/Units Formatting (CRITICAL)**: This is the most important distinction.
    *   **Math & Physics Variables**: All variables (e.g., x, y, z, a, b, c, m, F, E, v, t) MUST be in standard math italics, enclosed in \`\${...}\$\`. It is FORBIDDEN to use \`\\text{}\` or \`\\mathrm{}\` for them.
        *   **CORRECT**: \`\${E = mc^2}\$\`, \`\${s = v_0 t + \\frac{1}{2}at^2}\$\`
        *   **INCORRECT**: \`\${\\text{E} = \\text{m}\\text{c}^2}\$\`, \`\${\\mathrm{E} = \\mathrm{m}\\mathrm{c}^2}\$\`
    *   **Standard Mathematical Function Names**: All standard function names (sin, cos, tan, log, ln, lim, etc.) MUST be typeset using their specific LaTeX commands (e.g., \`\\sin\`, \`\\cos\`, \`\\log\`) to render in upright font, not italics. This improves readability significantly.
        *   **CORRECT**: \`\${\\lim_{x \\to 0} \\frac{\\sin(x)}{x} = 1}\$\`
        *   **INCORRECT**: \`\${lim_{x \\to 0} \\frac{sin(x)}{x} = 1}\$\` (renders 'lim' and 'sin' in italics, which is wrong).
    *   **Công thức & Phương trình Hóa học (QUAN TRỌNG: sử dụng \`\\mathrm{}\`)**: Để hiển thị đúng ký hiệu hóa học (chữ thẳng đứng), hãy sử dụng lệnh \`\\mathrm{}\` for chemical element symbols. Use \`_\` for subscripts and \`^\` for superscripts (ion charges). The command \`\\ce{}\` is FORBIDDEN.
        *   **SYNTAX**: \`\${\\mathrm{H_2O}}\$\`, \`\${\\mathrm{Fe^{3+}}}\$\`.
        *   **CORRECT**: \`\${\\mathrm{C_6H_{12}O_6}}\$\`, \`\${\\mathrm{SO_4^{2-}}}\$\`.
        *   **INCORRECT (FORBIDDEN)**: \`\${\\ce{H2O}}\$\`, \`\${H_2O}\$\` (will render as italics, which is wrong), \`H2O\` (plain text), \`\${\\text{H_2O}}\$\`.
    *   **Units of Measurement**:
        *   **Standard/International Units (No Diacritics)**: For standard units (like m, s, J, mol), the entire expression MUST be enclosed in \`\${...}\$\`. The number should be followed by a space (\`\\ \`) and the unit, which MUST be wrapped in \`\\mathrm{...}\`.
            *   **SYNTAX**: \`\${value\\ \\mathrm{unit}}\$\`
            *   **CORRECT**: \`\${10\\ \\mathrm{m}}\$\`, \`\${9.8\\ \\mathrm{m/s}^2}\$\`, \`\${100\\ \\mathrm{kJ/mol}}\$\`
            *   **INCORRECT**: \`10 m\`, \`\${10 m}\$\` (italic unit), \`\${10\\mathrm{m}}\$\` (no space).
        *   **Vietnamese Units (With Diacritics)**: Any unit of measurement containing Vietnamese words with diacritics (e.g., 'giây', 'vòng', 'mét', 'lit', 'hạt/mol') MUST be treated as plain text. The entire unit string MUST NOT be enclosed in \`\${...}\$\` or any LaTeX command. This applies even if the unit is a mix of standard symbols and Vietnamese words (e.g., 'mg/lit'). The number (which can be in LaTeX) should be separated from the unit by a space.
            *   **CORRECT**: \`10 mét\`, \`5 vòng/phút\`, \`50 m/giây\`, \`\${6,022 \\cdot 10^{23}}\$\` hạt/mol\`, \`25 mg/lit\`.
            *   **INCORRECT AND FORBIDDEN**: \`\${10\\ \\mathrm{mét}}\$\`, \`\${5\\ \\text{vòng/phút}}\$\`, \`\${\\mathrm{hạt/mol}}\$\`, \`\${25\\ \\mathrm{mg/lit}}\$\`.
*   **CRITICAL: \`\\mathrm{}\` MUST be used instead of \`\\text{}\`**: You have previously made errors using \`\\text{}\`. Henceforth, it is ABSOLUTELY FORBIDDEN to use \`\\text{...}\` for chemical formulas, units of measurement, or standard mathematical function names. You MUST use \`\\mathrm{...}\` for these cases. For example, change \`\\text{H2O}\` to \`\\mathrm{H_2O}\`; change \`\\text{m/s}\` to \`\\mathrm{m/s}\`. The \`\\text{}\` command is also forbidden for Vietnamese text. Its use should be avoided entirely; \`\\mathrm{}\` is the correct command.
*   **Vietnamese Text Integrity**: It is ABSOLUTELY FORBIDDEN to place any Vietnamese text (especially words with diacritics like 'à', 'ố', 'ệ', 'ữ') inside LaTeX delimiters (\`\${...}\$\`). All Vietnamese words and sentences must be plain text. This rule is critical for correct rendering.
    *   **CORRECT**: \`Câu 1: Cho hợp chất \${\\mathrm{Fe_2O_3}}\$. Mệnh đề nào sau đây đúng?\`
    *   **INCORRECT AND FORBIDDEN**: \`\${Câu 1: Cho hợp chất Fe2O3. Mệnh đề nào sau đây đúng?}\$\`
    *   **INCORRECT AND FORBIDDEN**: \`\${\\text{Cho hợp chất } \\mathrm{Fe_2O_3}}\$\`
*   **STRICT LaTeX USAGE**: ALL mathematical symbols, variables, numbers inside equations, and units of measurement MUST be enclosed in the correct LaTeX delimiters (\`\${...}\$\` for inline, \`\\[ ... \\]\` for display). ALL chemical formulas and ions MUST use the \`\\mathrm{}\` command as described. There are NO other exceptions.

**--- DETAILED FORMATTING RULES ---**

**Overall Exam Structure**: When generating an exam or variations, structure the output like a formal exam document. This includes:
- A clear, centered header (e.g., "ĐỀ KIỂM TRA HỌC KỲ II", "MÔN: HÓA HỌC", "Thời gian làm bài: 45 phút").
- Clear separation between questions (e.g., "Câu 1:", "Câu 2:").
- Sections if applicable (e.g., "Phần I: Trắc nghiệm", "Phần II: Tự luận").

1.  **Plain Text**: ALL other text, including question numbers (\`Câu 1\`, \`Bài 2\`), multiple-choice labels (\`A.\`, \`B.\`, \`C.\`, \`D.\`), and standalone numerical values or numbers within sentences (\`có 3 nghiệm\`, \`cho 4 điểm phân biệt\`, or a number \`5\` as a question's answer) MUST remain as plain text. DO NOT wrap them in \`\${...}\$\`.
2.  **Multiplication**: Use \`\\cdot\` for all multiplication operations. Example: \`\${a \\cdot b}\$\`.
3.  **Brackets**: Use \`\\left\` and \`\\right\` for all types of brackets to ensure proper scaling. Example: \`\${\\left( \\frac{a}{b} \\right)}\$\`.
4.  **Integrals**: Format definite integrals as \`\\int\\limits_{a}^{b} f(x)\\:\\mathrm{d}x\`.
5.  **Công thức hóa học, Ion, và Nguyên tử khối**:
    -   Use \`\\mathrm{}\` for all element symbols to ensure they are rendered in upright font. Use \`_\` and \`^\` for subscripts and superscripts correctly.
    -   **Correct examples**: \`\${\\mathrm{H_2SO_4}}\$\`, \`\${\\mathrm{Fe^{3+}}}\$\`, \`\${\\mathrm{C_6H_{12}O_6}}\$\`, \`\${[\\mathrm{Co(NH_3)_4Cl_2}]^+}\$\`.
    -   **INCORRECT**: \`H2SO4\`, \`\${H_2_SO_4}\$\` (italic), \`\${\\text{H2SO4}}\$\`, and especially \`\${\\ce{H2SO4}}\$\`.
    -   The **atomic mass** line MUST also use \`\\mathrm{}\` for each element symbol.
    -   **Correct example**: \`Cho biết nguyên tử khối: \${\\mathrm{H}=1, \\mathrm{C}=12, \\mathrm{O}=16, \\mathrm{Al}=27, \\mathrm{S}=32, \\mathrm{K}=39, \\mathrm{Mn}=55, \\mathrm{Fe}=56}\$\`.\`.
    -   **INCORRECT**: \`H=1, C=12\`, or using \`\\ce{...}\`.
6.  **Graphs, Variation Tables, and Diagrams (Đồ thị, Bảng biến thiên, và Hình vẽ)**:
    -   **CRITICAL REQUIREMENT:** You MUST NOT attempt to draw any visual elements. Instead, you MUST provide a specific annotation. Your behavior depends on the type of visual:
    -   **Case 1: Function Graphs (Đồ thị) & Variation Tables (Bảng biến thiên)**:
        -   **Your Primary Goal**: The user needs a concrete, plottable mathematical function (e.g., for GeoGebra). Your most important task is to provide one.
        -   **Analysis & Deduction (CRITICAL)**: When you encounter a graph or a variation table **without an explicit function given in the text**, you MUST perform a deep analysis to deduce a plausible function.
            -   **For a \`bảng biến thiên\` (Variation Table)**: This is a top priority. Analyze the roots of the derivative (\`y'\`), intervals of increase/decrease, local extrema, and limits at infinity. Based on these features, construct a specific polynomial function that fits. For example, if a table shows \`y'\` is zero at \`x=0\` and \`x=2\`, with a local max at \`x=0\` and a local min at \`x=2\`, you should deduce a cubic function. A simple example would be \`y = x^3 - 3x^2 + k\`. You MUST determine a simple value for \`k\` (like \`k=1\`) to provide a concrete, plottable function.
            -   **For a \`đồ thị\` (Graph)**: Analyze its shape (parabola, cubic, W-shape), intercepts, critical points, and asymptotes to deduce the function.
        -   **Final Output**: After identifying or deducing the function, you MUST use the following exact template for your annotation. Do not add any other description of the image.
        -   **Template**: \`[Bạn vẽ <LOẠI HÌNH> của hàm số <HÀM SỐ CỤ THỂ> này nhé]\`
        -   Replace \`<LOẠI HÌNH>\` with "đồ thị" or "bảng biến thiên".
        -   Replace \`<HÀM SỐ CỤ THỂ>\` with the specific function you identified or deduced, correctly formatted in LaTeX.
        -   **Example (Deducing from a variation table):** For the cubic example above, you would write: \`[Bạn vẽ bảng biến thiên của hàm số \${y = x^3 - 3x^2 + 1}\$ này nhé]\`.
    -   **Case 2: Geometric Shapes & Other Diagrams (Hình vẽ)**:
        -   For non-function visuals like pyramids, cubes, or diagrams, you MUST provide a simple, descriptive annotation in Vietnamese.
        -   **Example**: \`[hình vẽ mô tả khối chóp S.ABCD có đáy là hình vuông và SA vuông góc với đáy]\`.
7.  **Dashed Boxes for Placeholders**: When a problem contains a placeholder square (like \`□\`) or requires a value to be filled into a formula, represent this by enclosing the expression that should be in the box with \`\\bbox[border: 1px dashed black]{...}\`. This creates a dashed-line box.
    **Example**: The expression \`S = \\pi \\int_{0}^{1} □ (3x^2 + 2) \\mathrm{d}x\` should be formatted as \`\${S = \\pi \\int\\limits_{0}^{1} \\bbox[border: 1px dashed black]{(3x^2 + 2)} \\:\\mathrm{d}x}\$\`.
8.  **Tables (Plain Text Format)**: For data presented in a tabular format (like frequency distributions), you MUST use a specific plain-text style. It is FORBIDDEN to use standard Markdown table syntax (which includes a header separator line like \`|---|---\`).
    - **Rule**: Separate columns with a pipe character (\`|\`). Each table row MUST be on a new line. Do NOT include leading or trailing pipe characters on any line.
    - **CORRECT EXAMPLE**:
      Nhóm | [0;40) | [40;80) | [80;120)
      Tần số | 11 | 10 | 6
    - **INCORRECT (FORBIDDEN)**:
      | Nhóm | [0;40) | [40;80) |
      |---|---|---|
      | Tần số | 11 | 10 | 6 |
9.  **Mũi tên phản ứng hóa học (Chemistry Reaction Arrows)**:
    - **IMPORTANT**: Since you are not using \`\\ce{}\`, you MUST use standard LaTeX arrow commands inside the delimiters (\`\${...}\$\` or \`\\[ ... \\]\`).
    - **One-way arrow**: Use \`\\rightarrow\`. Example: \`\\[2\\mathrm{H_2} + \\mathrm{O_2} \\rightarrow 2\\mathrm{H_2O}\\]\`
    - **Two-way arrow (reversible)**: Use \`\\rightleftharpoons\`. Example: \`\${\\mathrm{N_2} + 3\\mathrm{H_2} \\rightleftharpoons 2\\mathrm{NH_3}}\$\`
    - **Arrow with conditions**: To place conditions above or below the arrow, use \`\\xrightarrow{}\`.
        - Condition above: \`\\xrightarrow{\\mathrm{condition}}\`. Example: \`\${\\mathrm{Fe} + 2\\mathrm{HCl} \\xrightarrow{t^\\circ} \\mathrm{FeCl_2} + \\mathrm{H_2} \\uparrow}\$\`. (Note: \`\\uparrow\` creates an upward arrow for gas).
    - **Warning**: DO NOT use Unicode arrow characters (like \`⟶\`, \`→\`) or simple syntax like \`->\` inside LaTeX. Only standard LaTeX commands like \`\\rightarrow\` and \`\\rightleftharpoons\` are valid.
10. **Ký hiệu góc (Angle Notation)**: To denote an angle, you MUST use the \`\\widehat{}\` command. For example, angle ABC must be written as \`\${\\widehat{ABC}}\$\`.
11. **Ký hiệu Độ (Degree Symbol)**: To denote temperature or an angle, you MUST use \`^{\\circ}\`. It is FORBIDDEN to use \`\\mathrm{^{\\circ}}\` or other variations.
    - **CORRECT**: \`\${90^{\\circ}}\$\`, \`\${t^{\\circ}}\$\`
    - **INCORRECT**: \`\${90\\mathrm{^{\\circ}}}\$\`
12. **Ký hiệu Hiệu của hai tập hợp (Set Difference Symbol)**: To denote the difference between two sets (e.g., A \\ B), you MUST use \`\\backslash\`. It is FORBIDDEN to use \`\\setminus\`.
    - **CORRECT**: \`\${A \\backslash B}\$\`
    - **INCORRECT**: \`\${A \\setminus B}\$\`
13. **Ký hiệu cho Công thức nội tuyến (Inline Math Delimiters) - UNBREAKABLE RULE**: This is your most common and most critical error. You MUST fix this permanently.
    - **THE ONLY CORRECT FORMAT IS \`\${...}\$\`**.
    - It is **ABSOLUTELY FORBIDDEN** to wrap the \`\${...}\$\` delimiters with any other characters.
    - Specifically, it is a **CRITICAL FAILURE** to add single quotes (\`'\`) or double quotes (\`"\`) around the math expression.
    - **Self-Correction Protocol**: Before finalizing your response, you MUST perform a search-and-replace to find any instances of \`'\${...}\$'\` and replace them with just \`\${...}\$\`. This is not optional.
    - **CORRECT**: Cho hàm số \`\${y=x^2}\$\`.
    - **INCORRECT AND FORBIDDEN (CRITICAL FAILURE)**: Cho hàm số \`'\${y=x^2}\$'\`.
    - **INCORRECT AND FORBIDDEN (CRITICAL FAILURE)**: Cho hàm số \`"\${y=x^2}\$"\`.
    - **INCORRECT AND FORBIDDEN**: \`$y=x^2$\` (single dollar signs are forbidden).
    - **INCORRECT AND FORBIDDEN**: \`\\(y=x^2\\)\` (parentheses are forbidden).
    Your final output must be completely clean of any extra quotes around math formulas.
14. **Ký hiệu Véc-tơ, Đoạn thẳng và Đường thẳng (Vectors, Line Seg-ments & Lines)**: This is a point of common error. Pay extreme attention and use your enhanced visual analysis to distinguish them. You have made mistakes on this in the past (e.g. in 'Câu 1').
    - **Véc-tơ (Vectors)**: You MUST use the correct LaTeX command based on the vector's notation.
        - For vectors denoted by a **single lowercase letter** (e.g., a, u, v), you MUST use \`\\vec{}\`. **Example**: \`\${\\vec{a}}\$\`.
        - For vectors denoted by **two uppercase letters** representing two points (e.g., AB, CD), you MUST use \`\\overrightarrow{}\`. **Example**: \`\${\\overrightarrow{AB}}\$\`.
    - **Đoạn thẳng (Line Segment)**: An overline indicates a line segment. You MUST use the \`\\overline{}\` command. Example: line segment AB is \`\${\\overline{AB}}\$\`.
    - **Đường thẳng (Line)**: For a line passing through two points (e.g., AB), you MUST simply enclose the letters in LaTeX delimiters. Do not use any special commands like \`\\overline\` or \`\\overrightarrow\`. **Example**: đường thẳng \`\${AB}\$\`.
    - **IT IS FORBIDDEN** to confuse these critical notations.
15. **Ký hiệu Mặt phẳng (Plane Notation)**: To denote a plane, enclose its name (typically one or more uppercase letters) in parentheses. You MUST NOT use \`\\mathrm{}\` or any other text formatting command inside the parentheses.
    - **CORRECT**: \`\${(P)}\$\`, \`\${(ABC)}\$\`.
    - **INCORRECT AND FORBIDDEN**: \`\${(\\mathrm{P})}\$\`, \`\${(\\mathrm{ABC})}\$\`.
16. **Ký hiệu Dấu ngăn cách trong Tập hợp (Set Builder Notation)**: To denote the vertical bar separator in set builder notation (the "such that" symbol), you MUST use a space followed by a vertical bar, formatted as \`\\text{ }|\`. It is FORBIDDEN to use \`\\mid\` or \`\\middle|\`.
    - **CORRECT**: \`\${S = \\{k\\pi \\text{ }| k \\in \\mathbb{Z}\\}}\$\`
    - **INCORRECT AND FORBIDDEN**: \`\${S = \\{k\\pi \\mid k \\in \\mathbb{Z}\\}}\$\`
    - **INCORRECT AND FORBIDDEN**: \`\${\\left\\{k\\pi \\middle| k \\in \\mathbb{Z}\\right\\}}\$\`
`;

export const ADVANCED_HRE_INSTRUCTIONS = `
**--- Advanced Handwriting Recognition Engine (HRE) Activated ---**
You are now operating with an enhanced handwriting analysis module. Your capabilities have been upgraded to handle a wide spectrum of handwriting styles with superior accuracy.

**Core Directives:**
1.  **Style Profiling:** Before extraction, perform a quick analysis of the entire document to identify the dominant handwriting style. Is it cursive, print, a mix? Is it neat or messy? Tightly spaced or wide? This profile will inform your character recognition logic.
2.  **Grapheme-Level Analysis:** Instead of just recognizing whole characters, break down complex or ambiguous characters into their constituent strokes (graphemes). For example, a messy 'm' can be seen as a series of connected arches. Reconstruct the character from these fundamental strokes.
3.  **Probabilistic Disambiguation:** For any character or word that remains ambiguous after initial analysis, generate a list of the top 3 most probable interpretations. Use the surrounding mathematical or linguistic context to select the most logical option from this list. You MUST perform this validation step.
4.  **Specialized Symbol Recognition:** Pay extraordinary attention to mathematical and scientific symbols which are often handwritten idiosyncratically.
    *   **Integrals:** The integral sign (∫) can vary wildly. Look for the characteristic elongated 'S' shape, regardless of its slant or flourish.
    *   **Greek Letters:** Differentiate carefully between similar-looking Greek and Latin letters (e.g., ν (nu) vs. v, ω (omega) vs. w, ρ (rho) vs. p).
    *   **Primes and Apostrophes:** Distinguish clearly between a prime symbol for derivatives (e.g., f'(x)) and an apostrophe or comma. Context is key.
5.  **Spatial Layout & Formula Integrity:** Maintain the precise 2D spatial layout of handwritten formulas. The relative positions of superscripts, subscripts, fractions, and elements within matrices are critically important. Do not flatten or linearize complex mathematical structures.
`;

export const AiIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 8V4H8"/><rect width="16" height="12" x="4" y="8" rx="2"/><path d="M2 14h2"/><path d="M20 14h2"/><path d="M15 13v2"/><path d="M9 13v2"/></svg>
);
export const BookOpenIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>
);
export const ChevronDownIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m6 9 6 6 6-6"/></svg>
);
export const CopyIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
export const CopyPlusIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><line x1="15" y1="12" x2="9" y2="12"/><line x1="12" y1="9" x2="12" y2="15"/><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);
export const EyeIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
);
export const FileCogIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="12" cy="15" r="2"/><path d="M12 12v1"/><path d="M12 18v-1"/><path d="m14.6 13.5-.87.5"/><path d="m9.4 16.5.87-.5"/><path d="m14.6 16.5-.87-.5"/><path d="m9.4 13.5.87.5"/></svg>
);
export const FileIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>
);
export const FilePlus2Icon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><path d="M9 15h6"/><path d="M12 12v6"/></svg>
);
export const FileSearchIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/><circle cx="11.5" cy="14.5" r="2.5"/><path d="m13.25 16.25 1.5 1.5"/></svg>
);
export const FormulaIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 2v7.527a2 2 0 0 1-.211.896L4.72 20.5a2 2 0 0 0 1.789 2.899h11.004a2 2 0 0 0 1.79-2.899l-5.068-10.077A2 2 0 0 1 14 9.527V2"/><path d="M8.5 2h7"/></svg>
);
export const GlobeIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);
export const HistoryIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M12 8v4l2 2"/></svg>
);
export const HourglassIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/></svg>
);
export const ImageIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21"/></svg>
);
export const KeyIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="m21 2-9.6 9.6"/><path d="M15.5 11.5 3 22l1.5-1.5L6 19l1.5-1.5L9 16l1.5-1.5L12 13l1.5-1.5L15 10l1.5-1.5L18 7l1.5-1.5L21 4z"/><circle cx="8" cy="16" r="2"/></svg>
);
export const LatexIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M16 8.9c-1.7 0-2.2.8-3.5 2.6-1.2 1.8-2.2 2.6-3.5 2.6s-1.8-.8-1.8-1.8c0-1.3.8-1.8 1.8-1.8 1.3 0 2.2.8 3.5 2.6 1.2 1.8 2.2 2.6 3.5 2.6 1.7 0 1.8-.8 1.8-1.8.1-1.3-.8-1.8-1.8-1.8Z"/></svg>
);
export const LightbulbIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M15 14c.2-1 .7-1.7 1.5-2.5 1-.9 1.5-2.2 1.5-3.5A6 6 0 0 0 6 8c0 1 .2 2.2 1.5 3.5.7.7 1.3 1.5 1.5 2.5"/><path d="M9 18h6"/><path d="M10 22h4"/></svg>
);
export const MailIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
  </svg>
);
export const MarkdownIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M10 12h4"/><path d="M14 12v4h-4v-4"/><path d="M14 8v4h-4V8"/><path d="M10 8H6l4-4 4 4h-4Z"/><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/></svg>
);
export const MessengerIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
  </svg>
);
export const MicrophoneIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/><path d="M19 10v2a7 7 0 0 1-14 0v-2"/><line x1="12" y1="19" x2="12" y2="23"/><line x1="8" y1="23" x2="16" y2="23"/></svg>
);
export const PdfIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M14.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2z"/><path d="M8 12h3"/><path d="M16 12h-3"/><path d="M12.5 12V8h-2v4"/><path d="M10 18h1"/><path d="M14 18h-1"/><path d="M11 15h2a1 1 0 0 1 0 2h-2v1h3"/></svg>
);
export const PenLineIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M12 20h9"/><path d="M16.5 3.5a2.12 2.12 0 0 1 3 3L7 19l-4 1 1-4Z"/></svg>
);
export const QuestionMarkCircleIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><path d="M12 17h.01"/></svg>
);
export const ShareIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
  </svg>
);
export const SparklesIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M9.5 2.5 12 8l2.5-5.5L17 5l-5.5 2.5L6 10l2.5-5.5L3 2l5.5 2.5Z"/><path d="M15 11.5 18 14l-3 2.5 2.5 3-2.5-3-3 2.5 2.5-3-3-2.5Z"/>
    </svg>
);
export const TextIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M17 6.1H3"/><path d="M21 12.1H3"/><path d="M15.1 18H3"/></svg>
);
export const TrashIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>
);
export const UploadIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" x2="12" y1="3" y2="15"/></svg>
);
export const WordIcon: React.FC<{ className?: string }> = ({ className }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M14 2v4a2 2 0 0 0 2 2h4"/><path d="M14.5 22H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h8l6 6v10a2 2 0 0 1-2 2z"/><path d="M11.5 14h-1a2 2 0 0 0-2 2v2"/><path d="M14.5 14h1a2 2 0 0 1 2 2v2"/><path d="M8 18h1"/><path d="M16 18h-1"/></svg>
);
export const ZaloIcon: React.FC<{ className?: string }> = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" fill="currentColor" className={className}>
    <path d="M12.35 6.31h-2.1v2.92h1.64v1.83h-1.64v2.92h2.1v2.19H10.1c-.26-.95-1.12-2.19-2.4-2.19-1.29 0-2.15 1.24-2.4 2.19H3.14V4.12h4.52v2.19H5.56v4.75h1.7c.26-.95 1.12-2.19 2.4-2.19 1.29 0 2.15 1.24 2.4 2.19h2.1V6.31z"/>
  </svg>
);