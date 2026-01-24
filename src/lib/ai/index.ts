/**
 * AI Services - Barrel export
 */

// Claude Client
export {
    ClaudeClient,
    getClaudeClient,
    IASTED_SYSTEM_PROMPT,
    DOCUMENT_ANALYSIS_PROMPT,
    type ClaudeMessage,
    type ClaudeStreamEvent,
    type DocumentAnalysis,
    type ArchiveContext,
} from './claude-client';

// OCR Service
export {
    extractText,
    hasTextContent,
    parseInvoiceData,
    isOCRSupported,
    type OCRResult,
    type OCRPage,
    type OCRBlock,
    type ExtractedInvoiceData,
} from './ocr-service';

// Auto Classifier
export {
    classifyDocument,
    classifyByFilename,
    classifyByKeywords,
    classifyWithAI,
    type DocumentCategory,
    type ClassificationResult,
} from './auto-classifier';
