'use client'

import { useState, useCallback, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { DocumentIcon, PhotoIcon, XMarkIcon } from '@heroicons/react/24/outline'

interface FileDropZoneProps {
  onFilesDrop: (files: File[]) => void
  maxSize?: number // in MB
  accept?: string[]
}

export function FileDropZone({ onFilesDrop, maxSize = 10, accept = ['image/*', 'application/pdf'] }: FileDropZoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true)
    } else if (e.type === 'dragleave') {
      setIsDragging(false)
    }
  }, [])

  const validateFiles = (files: File[]) => {
    for (const file of files) {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setError(`File ${file.name} is too large. Maximum size is ${maxSize}MB`)
        return false
      }

      // Check file type
      const fileType = file.type
      if (!accept.some(type => {
        if (type.endsWith('/*')) {
          const category = type.split('/')[0]
          return fileType.startsWith(category)
        }
        return type === fileType
      })) {
        setError(`File ${file.name} is not an accepted file type`)
        return false
      }
    }
    return true
  }

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
    setError(null)

    const { files } = e.dataTransfer
    const fileList = Array.from(files)

    if (validateFiles(fileList)) {
      onFilesDrop(fileList)
    }
  }, [maxSize, accept, onFilesDrop])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || [])
    if (validateFiles(files)) {
      onFilesDrop(files)
    }
    event.target.value = '' // Reset input
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="relative"
    >
      <div
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`p-6 md:p-8 border-2 border-dashed rounded-lg transition-colors cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-muted-foreground/20 hover:border-primary/50'
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelect}
          className="hidden"
          multiple
          accept={accept.join(',')}
          title="Choose files to upload"
          aria-label="Choose files to upload"
        />
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="flex space-x-2">
            <DocumentIcon className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
            <PhotoIcon className="h-6 w-6 md:h-8 md:w-8 text-muted-foreground" />
          </div>
          <div>
            <p className="text-sm md:text-base font-medium">
              Drop files here or tap to upload
            </p>
            <p className="text-xs md:text-sm text-muted-foreground mt-1">
              Maximum file size: {maxSize}MB
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Supported formats: Images, PDFs, Documents
            </p>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="absolute top-full left-0 right-0 mt-2 p-2 bg-destructive text-destructive-foreground text-sm rounded-md shadow-lg"
          >
            <div className="flex items-center justify-between">
              <span className="mr-2">{error}</span>
              <button
                onClick={() => setError(null)}
                className="p-1 hover:bg-destructive-foreground/10 rounded transition-colors"
                title="Clear error message"
                aria-label="Clear error message"
              >
                <XMarkIcon className="h-4 w-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
} 