/**
 * OCR Service for document text extraction
 * Uses browser-native APIs and Tesseract.js for image OCR
 */

// Types for OCR results
export interface OCRResult {
    text: string;
    confidence: number;
    language: string;
    pages?: OCRPage[];
    processingTimeMs: number;
}

export interface OCRPage {
    pageNumber: number;
    text: string;
    confidence: number;
    blocks?: OCRBlock[];
}

export interface OCRBlock {
    text: string;
    confidence: number;
    boundingBox: {
        x: number;
        y: number;
        width: number;
        height: number;
    };
}

export type SupportedMimeType =
    | 'application/pdf'
    | 'image/jpeg'
    | 'image/png'
    | 'image/gif'
    | 'image/webp'
    | 'image/tiff';

/**
 * Check if file type is supported for OCR
 */
export function isOCRSupported(mimeType: string): boolean {
    const supported: SupportedMimeType[] = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'image/tiff',
    ];
    return supported.includes(mimeType as SupportedMimeType);
}

/**
 * Extract text from a PDF using pdf.js (if available)
 */
async function extractTextFromPDF(file: File): Promise<OCRResult> {
    const startTime = Date.now();

    // Dynamic import of pdf.js if available
    try {
        // @ts-ignore - pdf.js is optional
        const pdfjsLib = await import('pdfjs-dist');

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        const pages: OCRPage[] = [];
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const pageText = content.items
                .map((item: any) => item.str)
                .join(' ');

            pages.push({
                pageNumber: i,
                text: pageText,
                confidence: 1.0, // PDF text extraction is reliable
            });

            fullText += pageText + '\n\n';
        }

        return {
            text: fullText.trim(),
            confidence: 1.0,
            language: 'fr',
            pages,
            processingTimeMs: Date.now() - startTime,
        };
    } catch (error) {
        // pdf.js not available, return empty result
        console.warn('PDF.js not available, skipping PDF text extraction');
        return {
            text: '',
            confidence: 0,
            language: 'fr',
            processingTimeMs: Date.now() - startTime,
        };
    }
}

/**
 * Extract text from an image using Tesseract.js (if available)
 */
async function extractTextFromImage(file: File): Promise<OCRResult> {
    const startTime = Date.now();

    try {
        // Dynamic import of Tesseract.js if available
        // @ts-ignore - Tesseract is optional
        const Tesseract = await import('tesseract.js');

        const result = await Tesseract.recognize(file, 'fra', {
            logger: (m: any) => {
                // Progress logging if needed
            },
        });

        const blocks: OCRBlock[] = result.data.blocks?.map((block: any) => ({
            text: block.text,
            confidence: block.confidence / 100,
            boundingBox: {
                x: block.bbox.x0,
                y: block.bbox.y0,
                width: block.bbox.x1 - block.bbox.x0,
                height: block.bbox.y1 - block.bbox.y0,
            },
        })) || [];

        return {
            text: result.data.text,
            confidence: result.data.confidence / 100,
            language: 'fr',
            pages: [{
                pageNumber: 1,
                text: result.data.text,
                confidence: result.data.confidence / 100,
                blocks,
            }],
            processingTimeMs: Date.now() - startTime,
        };
    } catch (error) {
        // Tesseract not available
        console.warn('Tesseract.js not available, skipping image OCR');
        return {
            text: '',
            confidence: 0,
            language: 'fr',
            processingTimeMs: Date.now() - startTime,
        };
    }
}

/**
 * Main OCR function - extracts text from document
 */
export async function extractText(file: File): Promise<OCRResult> {
    if (!isOCRSupported(file.type)) {
        return {
            text: '',
            confidence: 0,
            language: 'fr',
            processingTimeMs: 0,
        };
    }

    if (file.type === 'application/pdf') {
        return extractTextFromPDF(file);
    }

    if (file.type.startsWith('image/')) {
        return extractTextFromImage(file);
    }

    return {
        text: '',
        confidence: 0,
        language: 'fr',
        processingTimeMs: 0,
    };
}

/**
 * Quick text detection - checks if image contains text
 * Uses canvas analysis as a lightweight alternative
 */
export async function hasTextContent(file: File): Promise<boolean> {
    if (!file.type.startsWith('image/')) {
        return file.type === 'application/pdf'; // Assume PDFs have text
    }

    return new Promise((resolve) => {
        const img = new Image();
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);

            // Simple heuristic: check for high contrast areas (text tends to have high contrast)
            const imageData = ctx?.getImageData(0, 0, canvas.width, canvas.height);
            if (!imageData) {
                resolve(false);
                return;
            }

            let highContrastPixels = 0;
            const data = imageData.data;

            for (let i = 0; i < data.length; i += 4) {
                const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
                if (brightness < 50 || brightness > 200) {
                    highContrastPixels++;
                }
            }

            const ratio = highContrastPixels / (data.length / 4);
            resolve(ratio > 0.2); // At least 20% high contrast = likely has text
        };

        img.onerror = () => resolve(false);
        img.src = URL.createObjectURL(file);
    });
}

/**
 * Structure extracted data from document text
 */
export interface ExtractedInvoiceData {
    vendorName?: string;
    invoiceNumber?: string;
    invoiceDate?: string;
    dueDate?: string;
    totalAmount?: number;
    currency?: string;
    taxAmount?: number;
    items?: Array<{
        description: string;
        quantity?: number;
        unitPrice?: number;
        total?: number;
    }>;
}

/**
 * Parse invoice data from extracted text using patterns
 */
export function parseInvoiceData(text: string): ExtractedInvoiceData {
    const data: ExtractedInvoiceData = {};

    // Amount patterns (FCFA, XAF, etc.)
    const amountMatch = text.match(/(?:total|montant|net.*payer)[:\s]*(\d[\d\s,.]*)\s*(?:FCFA|XAF|F)/i);
    if (amountMatch) {
        data.totalAmount = parseFloat(amountMatch[1].replace(/[\s,]/g, '').replace(',', '.'));
        data.currency = 'XAF';
    }

    // Invoice number
    const invoiceMatch = text.match(/(?:facture|invoice)[:\s#]*([A-Z0-9-]+)/i);
    if (invoiceMatch) {
        data.invoiceNumber = invoiceMatch[1];
    }

    // Date patterns (French format)
    const dateMatch = text.match(/(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})/);
    if (dateMatch) {
        const [, day, month, year] = dateMatch;
        data.invoiceDate = `${year.length === 2 ? '20' + year : year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
    }

    // TVA/Tax
    const taxMatch = text.match(/(?:TVA|TAX)[:\s]*(\d[\d\s,.]*)/i);
    if (taxMatch) {
        data.taxAmount = parseFloat(taxMatch[1].replace(/[\s,]/g, '').replace(',', '.'));
    }

    return data;
}

export default {
    extractText,
    hasTextContent,
    parseInvoiceData,
    isOCRSupported,
};
