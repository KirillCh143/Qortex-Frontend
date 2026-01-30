import { X, Download, Loader2, Edit } from 'lucide-react'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatFileSize, formatDateRussian } from '@/lib/mockDocuments'
import type { DirectusFile } from '@/services/directus/types'
import { getFileTypeInfo } from '@/lib/fileTypeHelpers'
import { useUpdateFile } from '@/hooks/useFiles'
import { useFolders } from '@/hooks/useFolders'

interface FileDetailPanelProps {
  file: DirectusFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (file: DirectusFile) => void
  isDownloading: boolean
}

export function FileDetailPanel({
  file,
  open,
  onOpenChange,
  onDownload,
  isDownloading,
}: FileDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')

  const updateFileMutation = useUpdateFile()
  const { data: folders = [], isLoading: foldersLoading } = useFolders()

  if (!file) return null

  const handleClose = () => {
    onOpenChange(false)
    // Reset edit mode when closing
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditedTitle(file.title)
    setEditedDescription(file.description)
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await updateFileMutation.mutateAsync({
        id: file.id,
        data: {
          title: editedTitle,
          description: editedDescription
        }
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update file:', error)
    }
  }

  const handleCancel = () => {
    setEditedTitle(file.title)
    setEditedDescription(file.description)
    setIsEditing(false)
  }

  const handleMoveToFolder = async (newFolderId: string) => {
    try {
      await updateFileMutation.mutateAsync({
        id: file.id,
        data: {
          folder: newFolderId === 'root' ? null : newFolderId
        }
      })
      // Close the detail panel after successful move
      handleClose()
    } catch (error) {
      console.error('Failed to move file:', error)
    }
  }

  // Build folder options with hierarchy
  const buildFolderOptions = () => {
    const folderMap = new Map(folders.map(f => [f.id, f]))
    const getFolderDepth = (folderId: string): number => {
      const folder = folderMap.get(folderId)
      if (!folder || !folder.parent) return 0
      return 1 + getFolderDepth(folder.parent)
    }

    const sortedFolders = [...folders].sort((a, b) => {
      const depthDiff = getFolderDepth(a.id) - getFolderDepth(b.id)
      if (depthDiff !== 0) return depthDiff
      return a.name.localeCompare(b.name)
    })

    return [
      { id: 'root', name: 'Корневая папка', depth: 0 },
      ...sortedFolders.map(f => ({
        id: f.id,
        name: f.name,
        depth: getFolderDepth(f.id)
      }))
    ]
  }

  return (
    <>
      {/* Overlay with fade animation */}
      <div
        className={`fixed inset-0 bg-black/10 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          open ? 'opacity-100' : 'opacity-0'
        }`}
        onClick={handleClose}
      />

      {/* Panel with slide-in animation */}
      <div
        className={`fixed right-0 top-0 h-full w-full md:w-1/4 bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          {/* Panel header */}
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-900">Информация о файле</h2>
          </div>

          {/* Document title and file type badge */}
          <div className="mb-6 pr-12">
            {isEditing ? (
              <Input
                value={editedTitle}
                onChange={(e) => setEditedTitle(e.target.value)}
                className="mb-2"
                placeholder="Название файла"
              />
            ) : (
              <h3 className="text-xl font-bold text-gray-900 mb-2">{file.title}</h3>
            )}
            <div className="flex items-center gap-3 text-sm text-gray-500">
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {getFileTypeInfo(file.type).label}
              </span>
              <span>{formatDateRussian(new Date(file.uploaded_on))}</span>
            </div>
          </div>

          {/* Metadata section */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Имя файла:</span>
              <span className="text-sm text-gray-600">{file.filename_download}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Размер:</span>
              <span className="text-sm text-gray-600">{formatFileSize(file.filesize)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-gray-100">
              <span className="text-sm font-medium text-gray-700">Загрузил:</span>
              <span className="text-sm text-gray-600">
                {file.uploaded_by
                  ? `${file.uploaded_by.first_name} ${file.uploaded_by.last_name}`
                  : 'Неизвестный'}
              </span>
            </div>
          </div>

          {/* Description section */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">Описание</h3>
            {isEditing ? (
              <Textarea
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Описание файла"
                className="min-h-[100px]"
              />
            ) : (
              <p className="text-gray-700 leading-relaxed">{file.description}</p>
            )}
          </div>

          {/* Action buttons */}
          <div className="space-y-3">
            {isEditing ? (
              <div className="flex gap-3">
                <Button
                  onClick={handleSave}
                  disabled={updateFileMutation.isPending}
                  className="flex-1 bg-[#8466e4] hover:bg-[#7049f3]"
                >
                  {updateFileMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : null}
                  Сохранить
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={updateFileMutation.isPending}
                  className="flex-1"
                >
                  Отмена
                </Button>
              </div>
            ) : (
              <>
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={handleEdit}
                    className="flex-1 border-[#8466e4] text-[#8466e4] hover:bg-[#8466e4]/10"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Редактировать
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => onDownload(file)}
                    disabled={isDownloading}
                    className="flex-1"
                  >
                    {isDownloading ? (
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    ) : (
                      <Download className="h-4 w-4 mr-2" />
                    )}
                    Скачать
                  </Button>
                </div>

                {/* Move to Folder section */}
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Переместить в папку
                  </label>
                  <Select
                    value={file.folder || 'root'}
                    onValueChange={handleMoveToFolder}
                    disabled={updateFileMutation.isPending || foldersLoading}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Выберите папку" />
                    </SelectTrigger>
                    <SelectContent>
                      {buildFolderOptions().map(folder => (
                        <SelectItem key={folder.id} value={folder.id}>
                          <span style={{ paddingLeft: `${folder.depth * 16}px` }}>
                            {folder.name}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
