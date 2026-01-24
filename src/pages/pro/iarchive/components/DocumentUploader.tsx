/**
 * DocumentUploader - Drag & drop upload with hash generation
 */

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Upload,
    FileText,
    X,
    Check,
    AlertCircle,
    Loader2,
    File,
    Image,
    FileSpreadsheet,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';

interface UploadFile {
    id: string;
    file: File;
    name: string;
    size: number;
    type: string;
    status: 'pending' | 'uploading' | 'processing' | 'complete' | 'error';
    progress: number;
    hash?: string;
    error?: string;
}

interface DocumentUploaderProps {
    onUploadComplete?: (files: UploadFile[]) => void;
    maxFiles?: number;
    maxSize?: number; // in bytes
    acceptedTypes?: string[];
}

// Generate SHA-256 hash client-side
async function generateSHA256(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Format bytes to human readable
function formatBytes(bytes: number): string {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// Get icon for file type
function getFileIcon(type: string) {
    if (type.startsWith('image/')) return Image;
    if (type.includes('spreadsheet') || type.includes('excel')) return FileSpreadsheet;
    if (type.includes('pdf')) return FileText;
    return File;
}

export function DocumentUploader({
    onUploadComplete,
    maxFiles = 10,
    maxSize = 100 * 1024 * 1024, // 100MB
    acceptedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
}: DocumentUploaderProps) {
    const [files, setFiles] = useState<UploadFile[]>([]);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleFiles = useCallback(async (newFiles: FileList | File[]) => {
        const fileArray = Array.from(newFiles);

        // Validate files
        const validFiles: UploadFile[] = [];

        for (const file of fileArray) {
            if (files.length + validFiles.length >= maxFiles) {
                continue; // Skip if max reached
            }

            if (file.size > maxSize) {
                validFiles.push({
                    id: crypto.randomUUID(),
                    file,
                    name: file.name,
                    size: file.size,
                    type: file.type,
                    status: 'error',
                    progress: 0,
                    error: `Fichier trop volumineux (max ${formatBytes(maxSize)})`,
                });
                continue;
            }

            validFiles.push({
                id: crypto.randomUUID(),
                file,
                name: file.name,
                size: file.size,
                type: file.type,
                status: 'pending',
                progress: 0,
            });
        }

        setFiles(prev => [...prev, ...validFiles]);

        // Process each file
        for (const uploadFile of validFiles.filter(f => f.status === 'pending')) {
            await processFile(uploadFile);
        }
    }, [files, maxFiles, maxSize]);

    const processFile = async (uploadFile: UploadFile) => {
        // Update status to uploading
        setFiles(prev => prev.map(f =>
            f.id === uploadFile.id
                ? { ...f, status: 'uploading' as const, progress: 10 }
                : f
        ));

        try {
            // Simulate upload progress
            for (let i = 20; i <= 60; i += 10) {
                await new Promise(r => setTimeout(r, 100));
                setFiles(prev => prev.map(f =>
                    f.id === uploadFile.id ? { ...f, progress: i } : f
                ));
            }

            // Generate hash
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id
                    ? { ...f, status: 'processing' as const, progress: 70 }
                    : f
            ));

            const hash = await generateSHA256(uploadFile.file);

            // Complete
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id
                    ? { ...f, status: 'complete' as const, progress: 100, hash }
                    : f
            ));

        } catch (error) {
            setFiles(prev => prev.map(f =>
                f.id === uploadFile.id
                    ? { ...f, status: 'error' as const, error: 'Erreur de traitement' }
                    : f
            ));
        }
    };

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(false);
        handleFiles(e.dataTransfer.files);
    }, [handleFiles]);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragOver(true);
    }, []);

    const handleDragLeave = useCallback(() => {
        setIsDragOver(false);
    }, []);

    const removeFile = (id: string) => {
        setFiles(prev => prev.filter(f => f.id !== id));
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            handleFiles(e.target.files);
        }
    };

    const completedFiles = files.filter(f => f.status === 'complete');

    return (
        <div className="space-y-4">
            {/* Drop Zone */}
            <div
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={cn(
                    'relative border-2 border-dashed rounded-xl p-8 transition-all text-center',
                    isDragOver
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-border hover:border-emerald-500/50 hover:bg-muted/50'
                )}
            >
                <input
                    type="file"
                    multiple
                    accept={acceptedTypes.join(',')}
                    onChange={handleInputChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />

                <motion.div
                    animate={{ scale: isDragOver ? 1.05 : 1 }}
                    className="flex flex-col items-center gap-4"
                >
                    <div className={cn(
                        'p-4 rounded-full transition-colors',
                        isDragOver ? 'bg-emerald-500/20' : 'bg-muted'
                    )}>
                        <Upload className={cn(
                            'h-8 w-8 transition-colors',
                            isDragOver ? 'text-emerald-500' : 'text-muted-foreground'
                        )} />
                    </div>

                    <div>
                        <p className="font-medium">
                            {isDragOver ? 'Déposez vos fichiers ici' : 'Glissez-déposez vos documents'}
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            ou cliquez pour sélectionner • Max {formatBytes(maxSize)} par fichier
                        </p>
                    </div>

                    <div className="flex gap-2 text-xs text-muted-foreground">
                        <span className="px-2 py-1 bg-muted rounded">PDF</span>
                        <span className="px-2 py-1 bg-muted rounded">Images</span>
                        <span className="px-2 py-1 bg-muted rounded">Word</span>
                    </div>
                </motion.div>
            </div>

            {/* File List */}
            <AnimatePresence>
                {files.length > 0 && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="space-y-2"
                    >
                        {files.map((file) => {
                            const FileIcon = getFileIcon(file.type);

                            return (
                                <motion.div
                                    key={file.id}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: 20 }}
                                    className={cn(
                                        'flex items-center gap-3 p-3 rounded-lg border',
                                        file.status === 'error' && 'border-red-500/30 bg-red-500/5',
                                        file.status === 'complete' && 'border-emerald-500/30 bg-emerald-500/5'
                                    )}
                                >
                                    {/* Icon */}
                                    <div className={cn(
                                        'p-2 rounded-lg',
                                        file.status === 'error' ? 'bg-red-500/10' : 'bg-emerald-500/10'
                                    )}>
                                        <FileIcon className={cn(
                                            'h-5 w-5',
                                            file.status === 'error' ? 'text-red-500' : 'text-emerald-500'
                                        )} />
                                    </div>

                                    {/* Info */}
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-sm truncate">{file.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            {formatBytes(file.size)}
                                            {file.hash && (
                                                <span className="ml-2 font-mono">
                                                    SHA-256: {file.hash.substring(0, 8)}...
                                                </span>
                                            )}
                                        </p>
                                        {file.status !== 'complete' && file.status !== 'error' && (
                                            <Progress value={file.progress} className="h-1 mt-1" />
                                        )}
                                        {file.error && (
                                            <p className="text-xs text-red-500 mt-1">{file.error}</p>
                                        )}
                                    </div>

                                    {/* Status */}
                                    <div className="flex items-center gap-2">
                                        {file.status === 'uploading' && (
                                            <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
                                        )}
                                        {file.status === 'processing' && (
                                            <span className="text-xs text-muted-foreground">Calcul hash...</span>
                                        )}
                                        {file.status === 'complete' && (
                                            <Check className="h-4 w-4 text-emerald-500" />
                                        )}
                                        {file.status === 'error' && (
                                            <AlertCircle className="h-4 w-4 text-red-500" />
                                        )}

                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8"
                                            onClick={() => removeFile(file.id)}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Actions */}
            {completedFiles.length > 0 && (
                <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setFiles([])}>
                        Annuler
                    </Button>
                    <Button
                        className="bg-emerald-500 hover:bg-emerald-600"
                        onClick={() => onUploadComplete?.(completedFiles)}
                    >
                        <Upload className="h-4 w-4 mr-2" />
                        Archiver {completedFiles.length} document{completedFiles.length > 1 ? 's' : ''}
                    </Button>
                </div>
            )}
        </div>
    );
}
