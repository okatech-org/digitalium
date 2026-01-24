/**
 * DocumentUploader Component
 * Drag & drop file uploader with progress and validation
 */

import React, { useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { formatFileSize, validateFileType, validateFileSize, PLAN_SIZE_LIMITS, PlanType } from '@/lib/storageUtils';

interface UploadingFile {
    id: string;
    file: File;
    progress: number;
    status: 'pending' | 'uploading' | 'success' | 'error';
    error?: string;
}

interface DocumentUploaderProps {
    onUpload: (file: File, onProgress: (progress: number) => void) => Promise<void>;
    planType?: PlanType;
    accept?: string;
    multiple?: boolean;
    maxFiles?: number;
    className?: string;
    disabled?: boolean;
}

export function DocumentUploader({
    onUpload,
    planType = 'free',
    accept = '.pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.txt',
    multiple = true,
    maxFiles = 10,
    className,
    disabled = false,
}: DocumentUploaderProps) {
    const [isDragOver, setIsDragOver] = useState(false);
    const [uploadingFiles, setUploadingFiles] = useState<UploadingFile[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const maxSize = PLAN_SIZE_LIMITS[planType];

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (!disabled) setIsDragOver(true);
    }, [disabled]);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);
    }, []);

    const processFiles = useCallback(async (files: FileList | File[]) => {
        const fileArray = Array.from(files).slice(0, maxFiles);

        // Validate files
        const validFiles: File[] = [];
        const errors: string[] = [];

        for (const file of fileArray) {
            if (!validateFileType(file)) {
                errors.push(`${file.name}: Type de fichier non autorisé`);
                continue;
            }
            if (!validateFileSize(file, maxSize)) {
                errors.push(`${file.name}: Fichier trop volumineux (max ${formatFileSize(maxSize)})`);
                continue;
            }
            validFiles.push(file);
        }

        if (errors.length > 0) {
            console.warn('Upload validation errors:', errors);
        }

        // Add files to uploading queue
        const newUploadingFiles: UploadingFile[] = validFiles.map(file => ({
            id: crypto.randomUUID(),
            file,
            progress: 0,
            status: 'pending' as const,
        }));

        setUploadingFiles(prev => [...prev, ...newUploadingFiles]);

        // Process uploads sequentially
        for (const uploadingFile of newUploadingFiles) {
            try {
                setUploadingFiles(prev => prev.map(f =>
                    f.id === uploadingFile.id ? { ...f, status: 'uploading' } : f
                ));

                await onUpload(uploadingFile.file, (progress) => {
                    setUploadingFiles(prev => prev.map(f =>
                        f.id === uploadingFile.id ? { ...f, progress } : f
                    ));
                });

                setUploadingFiles(prev => prev.map(f =>
                    f.id === uploadingFile.id ? { ...f, status: 'success', progress: 100 } : f
                ));

                // Remove after delay
                setTimeout(() => {
                    setUploadingFiles(prev => prev.filter(f => f.id !== uploadingFile.id));
                }, 2000);

            } catch (error) {
                setUploadingFiles(prev => prev.map(f =>
                    f.id === uploadingFile.id
                        ? { ...f, status: 'error', error: error instanceof Error ? error.message : 'Échec' }
                        : f
                ));
            }
        }
    }, [maxFiles, maxSize, onUpload]);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragOver(false);

        if (disabled) return;

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            processFiles(files);
        }
    }, [disabled, processFiles]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files.length > 0) {
            processFiles(files);
        }
        // Reset input
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [processFiles]);

    const handleClick = useCallback(() => {
        if (!disabled) {
            fileInputRef.current?.click();
        }
    }, [disabled]);

    const removeFile = useCallback((id: string) => {
        setUploadingFiles(prev => prev.filter(f => f.id !== id));
    }, []);

    return (
        <div className={cn('space-y-4', className)}>
            {/* Drop Zone */}
            <div
                onClick={handleClick}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={cn(
                    'relative border-2 border-dashed rounded-xl p-8 transition-all cursor-pointer',
                    'flex flex-col items-center justify-center gap-4 text-center',
                    isDragOver && 'border-primary bg-primary/5 scale-[1.02]',
                    !isDragOver && 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/30',
                    disabled && 'opacity-50 cursor-not-allowed'
                )}
            >
                <input
                    ref={fileInputRef}
                    type="file"
                    accept={accept}
                    multiple={multiple}
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={disabled}
                />

                <motion.div
                    animate={{ scale: isDragOver ? 1.1 : 1 }}
                    className={cn(
                        'p-4 rounded-full',
                        isDragOver ? 'bg-primary/20' : 'bg-muted'
                    )}
                >
                    <Upload className={cn(
                        'w-8 h-8',
                        isDragOver ? 'text-primary' : 'text-muted-foreground'
                    )} />
                </motion.div>

                <div>
                    <p className="font-medium">
                        {isDragOver ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos fichiers'}
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                        ou cliquez pour sélectionner • Max {formatFileSize(maxSize)} par fichier
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 justify-center">
                    {['PDF', 'DOC', 'XLS', 'JPG', 'PNG'].map(type => (
                        <span key={type} className="px-2 py-1 text-xs rounded bg-muted text-muted-foreground">
                            {type}
                        </span>
                    ))}
                </div>
            </div>

            {/* Upload Progress */}
            <AnimatePresence>
                {uploadingFiles.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        {uploadingFiles.map(uploadingFile => (
                            <motion.div
                                key={uploadingFile.id}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={cn(
                                    'flex items-center gap-3 p-3 rounded-lg',
                                    uploadingFile.status === 'success' && 'bg-green-500/10',
                                    uploadingFile.status === 'error' && 'bg-red-500/10',
                                    uploadingFile.status !== 'success' && uploadingFile.status !== 'error' && 'bg-muted'
                                )}
                            >
                                <FileText className="w-5 h-5 flex-shrink-0" />

                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-medium truncate">
                                        {uploadingFile.file.name}
                                    </p>

                                    {uploadingFile.status === 'uploading' && (
                                        <Progress value={uploadingFile.progress} className="h-1 mt-1" />
                                    )}

                                    {uploadingFile.status === 'error' && (
                                        <p className="text-xs text-red-500 mt-1">{uploadingFile.error}</p>
                                    )}
                                </div>

                                <div className="flex-shrink-0">
                                    {uploadingFile.status === 'uploading' && (
                                        <Loader2 className="w-5 h-5 animate-spin text-primary" />
                                    )}
                                    {uploadingFile.status === 'success' && (
                                        <CheckCircle2 className="w-5 h-5 text-green-500" />
                                    )}
                                    {uploadingFile.status === 'error' && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6"
                                            onClick={() => removeFile(uploadingFile.id)}
                                        >
                                            <X className="w-4 h-4" />
                                        </Button>
                                    )}
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
