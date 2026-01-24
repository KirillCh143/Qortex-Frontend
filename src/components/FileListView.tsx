import { Download, FileText, FileType, Sheet, File } from 'lucide-react'
import { formatFileSize, formatDateRussian } from '@/lib/mockDocuments'
import { Checkbox } from '@/components/ui/checkbox'
import { Card, CardContent } from '@/components/ui/card'
import type { DirectusFile } from '@/services/directus/types'

interface FileListViewProps {
  files: DirectusFile[]
  onSelectFile: (file: DirectusFile) => void
}

// Helper function to get file icon, color, and label based on file type
function getFileTypeInfo(mimeType: string) {
  if (mimeType.includes('pdf')) {
    return {
      Icon: FileText,
      bgColor: 'bg-red-100',
      textColor: 'text-red-500',
      label: 'PDF',
    }
  } else if (mimeType.includes('word') || mimeType.includes('document')) {
    return {
      Icon: FileType,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-500',
      label: 'DOCX',
    }
  } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return {
      Icon: Sheet,
      bgColor: 'bg-green-100',
      textColor: 'text-green-500',
      label: 'XLSX',
    }
  } else if (mimeType.includes('text')) {
    return {
      Icon: FileText,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-500',
      label: 'TXT',
    }
  } else {
    return {
      Icon: File,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-500',
      label: 'FILE',
    }
  }
}

export default function FileListView({ files, onSelectFile }: FileListViewProps) {
  return (
    <div className="flex flex-col gap-3">
      {files.map((file) => {
        const { Icon, bgColor, textColor, label } = getFileTypeInfo(file.type)
        const uploaderName = file.user_created
          ? `${file.user_created.first_name} ${file.user_created.last_name}`
          : 'Неизвестный'

        return (
          <Card
            key={file.id}
            onClick={() => onSelectFile(file)}
            className="cursor-pointer hover:border-[#8466e4] transition-all rounded-xl shadow-none bg-white border border-indigo-200"
          >
            <CardContent className="p-4 flex items-center gap-4">
              {/* Checkbox on far left */}
              <Checkbox onClick={(e) => e.stopPropagation()} />

              {/* File icon */}
              <div className={`w-12 h-12 rounded-lg ${bgColor} flex items-center justify-center shrink-0`}>
                <Icon className={`h-6 w-6 ${textColor}`} />
              </div>

              {/* File info - takes remaining space */}
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 truncate">{file.title}</h3>
                <p className="text-sm text-gray-600 font-medium">Загрузил: {uploaderName}</p>
                <p className="text-xs text-gray-500">
                  {formatDateRussian(new Date(file.uploaded_on))} • {formatFileSize(file.filesize)} • {label}
                </p>
              </div>

              {/* Download icon on far right */}
              <Download className="h-5 w-5 text-gray-400 shrink-0" />
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
