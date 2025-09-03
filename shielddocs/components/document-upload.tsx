'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Upload, FileText, Check, AlertCircle } from 'lucide-react'
import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import toast from 'react-hot-toast'

interface DocumentUploadProps {
  onClose: () => void
}

interface UploadedFile {
  id: string
  name: string
  size: number
  type: string
  status: 'uploading' | 'success' | 'error'
  progress: number
}

export function DocumentUpload({ onClose }: DocumentUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: file.size,
      type: file.type,
      status: 'uploading',
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])
    setIsUploading(true)

    // Simulate file upload with progress
    newFiles.forEach((file, index) => {
      const interval = setInterval(() => {
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, progress: Math.min(f.progress + 10, 100) }
              : f
          )
        )
      }, 200)

      setTimeout(() => {
        clearInterval(interval)
        setUploadedFiles(prev => 
          prev.map(f => 
            f.id === file.id 
              ? { ...f, status: 'success', progress: 100 }
              : f
          )
        )
        
        if (index === newFiles.length - 1) {
          setIsUploading(false)
          toast.success('Files uploaded successfully!')
        }
      }, 2000)
    })
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/msword': ['.doc'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'application/vnd.ms-powerpoint': ['.ppt'],
      'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'image/*': ['.png', '.jpg', '.jpeg', '.gif']
    },
    maxSize: 50 * 1024 * 1024, // 50MB
    multiple: true
  })

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== id))
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">
              Upload Documents
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Upload Area */}
          <div className="p-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive
                  ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20'
                  : 'border-gray-300 dark:border-gray-600 hover:border-primary-400 dark:hover:border-primary-500'
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                {isDragActive ? 'Drop files here' : 'Drag & drop files here'}
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                or click to browse files
              </p>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Supports PDF, DOC, DOCX, PPT, PPTX, XLS, XLSX, and images (max 50MB each)
              </p>
            </div>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <div className="mt-6">
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">
                  Uploaded Files
                </h3>
                <div className="space-y-3">
                  {uploadedFiles.map((file) => (
                    <div
                      key={file.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                    >
                      <div className="flex items-center space-x-3">
                        <FileText className="h-5 w-5 text-primary-600" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">
                            {file.name}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {formatFileSize(file.size)}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {file.status === 'uploading' && (
                          <div className="flex items-center space-x-2">
                            <div className="w-16 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                              <div
                                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${file.progress}%` }}
                              />
                            </div>
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              {file.progress}%
                            </span>
                          </div>
                        )}
                        
                        {file.status === 'success' && (
                          <Check className="h-5 w-5 text-success-600" />
                        )}
                        
                        {file.status === 'error' && (
                          <AlertCircle className="h-5 w-5 text-danger-600" />
                        )}
                        
                        <button
                          onClick={() => removeFile(file.id)}
                          className="text-gray-400 hover:text-danger-600"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end space-x-3 p-6 border-t border-gray-200 dark:border-gray-700">
            <button
              onClick={onClose}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              onClick={onClose}
              disabled={isUploading}
              className="btn-primary"
            >
              {isUploading ? 'Uploading...' : 'Done'}
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
