import { Download, FileText, FileType, Sheet, File } from 'lucide-react'
import { formatFileSize, formatDate } from '@/lib/mockDocuments'
import { Checkbox } from '@/components/ui/checkbox'
import type { DirectusFile } from '@/services/directus/types'

interface FileListViewProps {
  files: DirectusFile[]
  onSelectFile: (file: DirectusFile) => void
}

// Helper function to get file icon and color based on file type
function getFileIconAndColor(mimeType: string) {
  if (mimeType.includes('pdf')) {
    return {
      Icon: FileText,
      bgColor: 'bg-red-100',
      textColor: 'text-red-500',
    }
  } else if (mimeType.includes('word') || mimeType.includes('document')) {
    return {
      Icon: FileType,
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-500',
    }
  } else if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) {
    return {
      Icon: Sheet,
      bgColor: 'bg-green-100',
      textColor: 'text-green-500',
    }
  } else {
    return {
      Icon: File,
      bgColor: 'bg-gray-100',
      textColor: 'text-gray-500',
    }
  }
}

export default function FileListView({ files, onSelectFile }: FileListViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full">
        <thead>
          <tr className="bg-gray-50 border-b border-gray-200">
            <th className="w-12 px-4 py-3 text-center"></th>
            <th className="w-16 px-4 py-3"></th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Title</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Type</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Size</th>
            <th className="text-left px-4 py-3 text-sm font-semibold text-gray-700">Uploaded</th>
            <th className="w-12 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => {
            const { Icon, bgColor, textColor } = getFileIconAndColor(file.type)

            return (
              <tr
                key={file.id}
                onClick={() => onSelectFile(file)}
                className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors duration-150"
              >
                <td className="px-4 py-3 text-center">
                  <Checkbox onClick={(e) => e.stopPropagation()} />
                </td>
                <td className="px-4 py-3">
                  <div className={`w-10 h-10 rounded-lg ${bgColor} ${textColor} flex items-center justify-center`}>
                    <Icon className="h-5 w-5" />
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium text-gray-900">{file.title}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{file.type.split('/')[0]}</td>
                <td className="px-4 py-3 text-sm text-gray-600">{formatFileSize(file.filesize)}</td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {formatDate(new Date(file.uploaded_on))}
                </td>
                <td className="px-4 py-3 text-center">
                  <Download className="h-4 w-4 text-gray-400 inline-block" />
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}
