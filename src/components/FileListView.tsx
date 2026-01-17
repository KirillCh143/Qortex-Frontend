import { Download } from 'lucide-react'
import { formatFileSize, formatDate } from '@/lib/mockDocuments'
import type { DirectusFile } from '@/services/directus/types'

interface FileListViewProps {
  files: DirectusFile[]
  onSelectFile: (file: DirectusFile) => void
}

export default function FileListView({ files, onSelectFile }: FileListViewProps) {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto w-full">
        <thead>
          <tr className="bg-gray-100 border-b border-gray-200">
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Title</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Type</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Size</th>
            <th className="text-left px-4 py-3 text-sm font-medium text-gray-700">Uploaded</th>
            <th className="w-12 px-4 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr
              key={file.id}
              onClick={() => onSelectFile(file)}
              className="border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 text-sm font-medium text-gray-900">{file.title}</td>
              <td className="px-4 py-3">
                <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                  {file.type.split('/')[0]}
                </span>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">{formatFileSize(file.filesize)}</td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {formatDate(new Date(file.uploaded_on))}
              </td>
              <td className="px-4 py-3 text-center">
                <Download className="h-4 w-4 text-gray-400 inline-block" />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
