import {
  FileText,
  FileType,
  Sheet,
  File as FileIcon,
} from 'lucide-react'

// Helper function to get file type icon and color
export const getFileTypeInfo = (mimeType: string) => {
  if (mimeType.includes('pdf')) {
    return {
      icon: FileText,
      bgColor: 'bg-red-50',
      iconColor: 'text-red-500',
      borderColor: 'border-red-100',
      label: 'PDF',
    }
  } else if (mimeType.includes('word') || mimeType.includes('document')) {
    return {
      icon: FileType,
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      borderColor: 'border-blue-100',
      label: 'DOCX',
    }
  } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
    return {
      icon: Sheet,
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      borderColor: 'border-green-100',
      label: 'XLSX',
    }
  } else if (mimeType.includes('text')) {
    return {
      icon: FileText,
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-500',
      borderColor: 'border-slate-100',
      label: 'TXT',
    }
  } else {
    return {
      icon: FileIcon,
      bgColor: 'bg-slate-50',
      iconColor: 'text-slate-500',
      borderColor: 'border-slate-100',
      label: 'FILE',
    }
  }
}
