/**
 * PDFViewer - Component for rendering PDF documents using pdf.js
 * Displays PDF pages on canvas elements for reliable cross-browser rendering
 */

import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';
import { cn } from '@/lib/utils';

// Set up the worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

interface PDFViewerProps {
    dataUrl: string;
    className?: string;
    showControls?: boolean;
}

export function PDFViewer({ dataUrl, className, showControls = true }: PDFViewerProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [scale, setScale] = useState(1.5);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Load PDF document
    useEffect(() => {
        if (!dataUrl) return;

        setLoading(true);
        setError(null);

        const loadPdf = async () => {
            try {
                const loadingTask = pdfjsLib.getDocument({ url: dataUrl });
                const pdf = await loadingTask.promise;
                setPdfDoc(pdf);
                setTotalPages(pdf.numPages);
                setCurrentPage(1);
            } catch (err) {
                console.error('Error loading PDF:', err);
                setError('Impossible de charger le PDF');
            } finally {
                setLoading(false);
            }
        };

        loadPdf();
    }, [dataUrl]);

    // Render current page
    useEffect(() => {
        if (!pdfDoc || !canvasRef.current) return;

        const renderPage = async () => {
            try {
                const page = await pdfDoc.getPage(currentPage);
                const canvas = canvasRef.current!;
                const context = canvas.getContext('2d')!;

                const viewport = page.getViewport({ scale });
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas,
                };

                await page.render(renderContext as any).promise;
            } catch (err) {
                console.error('Error rendering page:', err);
            }
        };

        renderPage();
    }, [pdfDoc, currentPage, scale]);

    const goToPrevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const goToNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const zoomIn = () => setScale(Math.min(scale + 0.25, 3));
    const zoomOut = () => setScale(Math.max(scale - 0.25, 0.5));

    if (loading) {
        return (
            <div className={cn("flex items-center justify-center h-full", className)}>
                <div className="animate-pulse text-muted-foreground">
                    Chargement du PDF...
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={cn("flex items-center justify-center h-full text-red-500", className)}>
                {error}
            </div>
        );
    }

    return (
        <div className={cn("flex flex-col h-full", className)} ref={containerRef}>
            {/* Controls */}
            {showControls && totalPages > 0 && (
                <div className="flex items-center justify-center gap-4 p-2 border-b bg-muted/50">
                    <div className="flex items-center gap-1">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToPrevPage}
                            disabled={currentPage <= 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <span className="text-sm min-w-[80px] text-center">
                            Page {currentPage} / {totalPages}
                        </span>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={goToNextPage}
                            disabled={currentPage >= totalPages}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" onClick={zoomOut}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <span className="text-sm min-w-[50px] text-center">
                            {Math.round(scale * 100)}%
                        </span>
                        <Button variant="ghost" size="icon" onClick={zoomIn}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Canvas container */}
            <div className="flex-1 overflow-auto flex justify-center p-4 bg-muted/30">
                <canvas
                    ref={canvasRef}
                    className="shadow-lg border bg-white"
                />
            </div>
        </div>
    );
}

/**
 * PDFThumbnail - Renders a single page thumbnail of a PDF
 */
interface PDFThumbnailProps {
    dataUrl: string;
    className?: string;
    width?: number;
}

export function PDFThumbnail({ dataUrl, className, width = 150 }: PDFThumbnailProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        if (!dataUrl || !canvasRef.current) return;

        const loadThumbnail = async () => {
            try {
                setLoading(true);
                setError(false);

                const loadingTask = pdfjsLib.getDocument({ url: dataUrl });
                const pdf = await loadingTask.promise;
                const page = await pdf.getPage(1);

                const canvas = canvasRef.current!;
                const context = canvas.getContext('2d')!;

                // Calculate scale to fit width
                const originalViewport = page.getViewport({ scale: 1 });
                const scale = width / originalViewport.width;
                const viewport = page.getViewport({ scale });

                canvas.height = viewport.height;
                canvas.width = viewport.width;

                await page.render({
                    canvasContext: context,
                    viewport: viewport,
                    canvas: canvas,
                } as any).promise;

                setLoading(false);
            } catch (err) {
                console.error('Error loading PDF thumbnail:', err);
                setError(true);
                setLoading(false);
            }
        };

        loadThumbnail();
    }, [dataUrl, width]);

    return (
        <div className={cn("relative bg-white rounded shadow-sm overflow-hidden", className)}>
            {loading && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50">
                    <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                </div>
            )}
            {error && (
                <div className="absolute inset-0 flex items-center justify-center bg-gray-50 text-gray-400 text-xs">
                    Aperçu non disponible
                </div>
            )}
            <canvas
                ref={canvasRef}
                className={cn("block", loading ? "invisible" : "visible")}
            />
        </div>
    );
}

export default PDFViewer;
