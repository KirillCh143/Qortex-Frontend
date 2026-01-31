import { useState } from 'react'
import {
  Download,
  FileText,
  FileType,
  Sheet,
  File,
  User,
  Calendar,
  HardDrive,
  Loader2,
} from 'lucide-react'
import { formatFileSize, formatDateRussian } from '@/lib/mockDocuments'
import type { DirectusFile } from '@/services/directus/types'
import { cn } from '@/lib/utils'
import AutoScrollTitle from '@/components/AutoScrollTitle'
import { useDownloadFile } from '@/hooks/useFiles'

interface FileListViewProps {
  files: DirectusFile[]
  onSelectFile: (file: DirectusFile) => void
  selectedFile: DirectusFile | null
}

// Helper function to get file icon, color, and label based on file type
function getFileTypeInfo(mimeType: string) {
  if (mimeType.includes('pdf')) {
    return {
      Icon: FileText,
      iconBg: 'bg-red-50',
      iconText: 'text-red-500',
      iconBorder: 'border-red-100',
      tagBg: 'bg-red-50',
      tagText: 'text-red-600',
      tagBorder: 'border-red-100',
      label: 'PDF',
    }
  } else if (mimeType.includes('word') || mimeType.includes('document')) {
    return {
      Icon: FileType,
      iconBg: 'bg-blue-50',
      iconText: 'text-blue-500',
      iconBorder: 'border-blue-100',
      tagBg: 'bg-blue-50',
      tagText: 'text-blue-600',
      tagBorder: 'border-blue-100',
      label: 'DOCX',
    }
  } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return {
      Icon: Sheet,
      iconBg: 'bg-green-50',
      iconText: 'text-green-600',
      iconBorder: 'border-green-100',
      tagBg: 'bg-green-50',
      tagText: 'text-green-600',
      tagBorder: 'border-green-100',
      label: 'XLSX',
    }
  } else if (mimeType.includes('text')) {
    return {
      Icon: FileText,
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-500',
      iconBorder: 'border-gray-200',
      tagBg: 'bg-gray-100',
      tagText: 'text-gray-600',
      tagBorder: 'border-gray-200',
      label: 'TXT',
    }
  } else {
    return {
      Icon: File,
      iconBg: 'bg-gray-100',
      iconText: 'text-gray-500',
      iconBorder: 'border-gray-200',
      tagBg: 'bg-gray-100',
      tagText: 'text-gray-600',
      tagBorder: 'border-gray-200',
      label: 'FILE',
    }
  }
}

export default function FileListView({ files, onSelectFile, selectedFile }: FileListViewProps) {
  const downloadMutation = useDownloadFile()
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-4">
      {files.map((file) => {
        const isSelected = selectedFile?.id === file.id
        const { Icon, iconBg, iconText, iconBorder, label } = getFileTypeInfo(file.type)
        const uploaderName = file.uploaded_by
          ? `${file.uploaded_by.first_name} ${file.uploaded_by.last_name?.[0] || ''}.`
          : 'Неизвестный'

        const handleDownloadClick = (e: React.MouseEvent) => {
          e.stopPropagation() // Prevent selecting the file when download button is clicked
          setDownloadingFileId(file.id)
          downloadMutation.mutate(file.id, {
            onSuccess: (blob) => {
              const url = URL.createObjectURL(blob)
              const a = document.createElement('a')
              a.href = url
              a.download = file.filename_download
              document.body.appendChild(a)
              a.click()
              document.body.removeChild(a)
              URL.revokeObjectURL(url)
              setDownloadingFileId(null)
            },
            onError: () => {
              setDownloadingFileId(null)
            },
          })
        }

        return (
          <div
            key={file.id}
            onClick={() => onSelectFile(file)}
            className={cn(
              'group flex items-center justify-between p-5 pl-5 pr-6 bg-white rounded-xl border transition-all cursor-pointer',
              {
                'border-2 bg-white border-[#7049f3]/90 relative z-10': isSelected,
                'border-slate-300/85 hover:bg-white hover:border-violet-300 hover:shadow-md hover:shadow-slate-100':
                  !isSelected,
              }
            )}
          >
            <div className="flex items-center gap-5 flex-1 min-w-0">
              <div
                className={cn(
                  'size-12 shrink-0 rounded-xl flex items-center justify-center border',
                  iconBg,
                  iconText,
                  iconBorder
                )}
              >
                <Icon className="h-7 w-7" />
              </div>
              <div className="flex flex-col flex-1 min-w-0 pr-4">
                <h3 className="font-bold text-slate-800 text-sm leading-snug line-clamp-2">
                  <AutoScrollTitle text={file.title} />
                </h3>
                <div className="flex items-center text-xs font-medium text-slate-500 gap-x-2">
                  <span className="flex items-center gap-1">
                    <User className="h-3 w-3" />
                    <span>Автор: {uploaderName}</span>
                  </span>
                  <span className="mx-0.5 font-medium text-slate-500">•</span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    <span>Дата: {formatDateRussian(new Date(file.uploaded_on))}</span>
                  </span>
                  <span className="mx-0.5 font-medium text-slate-500">•</span>
                  <span className="flex items-center gap-1">
                    <File className="h-3 w-3" />
                    <span>Формат: {label}</span>
                  </span>
                  <span className="mx-0.5 font-medium text-slate-500">•</span>
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    <span>Размер: {formatFileSize(file.filesize)}</span>
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={handleDownloadClick}
              disabled={downloadMutation.isPending && downloadingFileId === file.id}
              className="ml-4 size-10 rounded-full flex items-center justify-center transition-all bg-white text-slate-400 border border-slate-300/85 hover:border-none hover:shadow-lg hover:shadow-indigo-500/30 hover:bg-[#7049f3]/90 hover:text-white active:bg-[#7049f3]"
            >
              {downloadMutation.isPending && downloadingFileId === file.id ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <Download className="h-5 w-5" />
              )}
            </button>
          </div>
        )
      })}
    </div>
  )
}
