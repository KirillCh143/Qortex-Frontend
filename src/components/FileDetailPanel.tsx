import {
  X,
  Download,
  Loader2,
  Edit,
  Trash2,
  User,
  Calendar,
  FolderOpen,
  FileText,
} from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
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
import { usePermissions } from '@/hooks/usePermissions'

interface FileDetailPanelProps {
  file: DirectusFile | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onDownload: (file: DirectusFile) => void
  onDelete?: (file: DirectusFile) => void
  isDownloading: boolean
}

export function FileDetailPanel({
  file,
  open,
  onOpenChange,
  onDownload,
  onDelete,
  isDownloading,
}: FileDetailPanelProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [editedTitle, setEditedTitle] = useState('')
  const [editedDescription, setEditedDescription] = useState('')
  const [editedFolder, setEditedFolder] = useState<string>('root')

  const { canManageFiles } = usePermissions()
  const updateFileMutation = useUpdateFile()
  const { data: folders = [], isLoading: foldersLoading } = useFolders()

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px'
    }
  }, [editedDescription, isEditing])

  if (!file) return null

  const handleClose = () => {
    onOpenChange(false)
    // Reset edit mode when closing
    setIsEditing(false)
  }

  const handleEdit = () => {
    setEditedTitle(file.title)
    setEditedDescription(file.description)
    setEditedFolder(file.folder || 'root')
    setIsEditing(true)
  }

  const handleSave = async () => {
    try {
      await updateFileMutation.mutateAsync({
        id: file.id,
        data: {
          title: editedTitle,
          description: editedDescription,
          folder: editedFolder === 'root' ? null : editedFolder,
        },
      })
      setIsEditing(false)
    } catch (error) {
      console.error('Failed to update file:', error)
    }
  }

  const handleCancel = () => {
    setEditedTitle(file.title)
    setEditedDescription(file.description)
    setEditedFolder(file.folder || 'root')
    setIsEditing(false)
  }

  // Build folder options with hierarchy
  const buildFolderOptions = () => {
    const folderMap = new Map(folders.map((f) => [f.id, f]))
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
      ...sortedFolders.map((f) => ({
        id: f.id,
        name: f.name,
        depth: getFolderDepth(f.id),
      })),
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
        className={`fixed right-0 top-0 h-full w-full md:w-1/5 bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="p-6 h-full flex flex-col">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute top-5 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="Close"
          >
            <X className="h-5 w-5 text-gray-500" />
          </button>

          {/* Panel header */}
          <div className="mb-4 border-b border-slate-300/85 pb-6 -mx-6 px-6">
            <h2 className="text-lg font-semibold text-gray-900">Информация о файле</h2>
          </div>

          {/* Document title and file type badge */}
          <div className="mb-6">
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
            <div className="flex items-center gap-3 text-sm text-gray-500 pt-1">
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {getFileTypeInfo(file.type).label}
              </span>
              <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                {formatFileSize(file.filesize)}
              </span>
            </div>
          </div>

          {/* Description section */}
          <div className="mb-6 mt-2 border border-violet-300 rounded-xl p-4 bg-violet-50/50">
            <h3 className="text-md font-medium text-[#7049f3]/90 mb-2 flex items-center gap-2">
              <FileText className="h-4 w-4 text-[#7049f3]/90" />
              Описание:
            </h3>
            {isEditing ? (
              <Textarea
                ref={textareaRef}
                value={editedDescription}
                onChange={(e) => setEditedDescription(e.target.value)}
                placeholder="Описание файла"
                className="min-h-[100px] resize-none overflow-hidden"
              />
            ) : (
              <p
                className={`leading-relaxed ${file.description ? 'text-gray-800' : 'text-gray-400 italic'}`}
              >
                {file.description || 'Описание файла отсутствует.'}
              </p>
            )}
          </div>

          {/* Metadata section */}
          <div className="mb-6 space-y-2">
            <div className="flex justify-between py-1">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <User className="h-4 w-4 text-gray-700" />
                Автор:
              </span>
              <span className="text-sm text-gray-600">
                {file.uploaded_by
                  ? `${file.uploaded_by.first_name} ${file.uploaded_by.last_name}`
                  : 'Неизвестный'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <Calendar className="h-4 w-4 text-gray-700" />
                Дата:
              </span>
              <span className="text-sm text-gray-600">
                {formatDateRussian(new Date(file.uploaded_on))}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                <FolderOpen className="h-4 w-4 text-gray-700" />
                Папка:
              </span>
              <span className="text-sm text-gray-600">
                {file.folder
                  ? (folders.find((f) => f.id === file.folder)?.name ?? 'Неизвестная папка')
                  : 'Корневая папка'}
              </span>
            </div>
          </div>

          {/* Move to Folder section (editing mode) */}
          {isEditing && (
            <div className="mb-6">
              <label className="text-sm font-medium text-gray-700 mb-2 block">
                Переместить в папку
              </label>
              <Select
                value={editedFolder}
                onValueChange={setEditedFolder}
                disabled={updateFileMutation.isPending || foldersLoading}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Выберите папку" />
                </SelectTrigger>
                <SelectContent>
                  {buildFolderOptions().map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      <span style={{ paddingLeft: `${folder.depth * 16}px` }}>{folder.name}</span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Spacer to push buttons to bottom */}
          <div className="flex-1" />

          {/* Action buttons */}
          <div className="space-y-3 border-t border-slate-300/85 pt-6 -mx-6 px-6">
            {isEditing ? (
              <>
                <div className="flex gap-3">
                  <Button
                    onClick={handleSave}
                    disabled={updateFileMutation.isPending}
                    className="flex-1 rounded-xl bg-[#8466e4] hover:bg-[#7049f3] text-white shadow-lg shadow-indigo-500/20 h-12"
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
                    className="flex-1 h-12 rounded-xl bg-white border border-slate-300 hover:border-violet-300 text-gray-900"
                  >
                    Отмена
                  </Button>
                </div>
              </>
            ) : (
              <>
                <Button
                  onClick={() => onDownload(file)}
                  disabled={isDownloading}
                  className="w-full bg-white text-slate-500 border border-slate-400/75 hover:border-none hover:shadow-lg hover:shadow-indigo-500/30 hover:bg-[#7049f3]/90 hover:text-white active:bg-[#7049f3] rounded-xl h-12"
                >
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Скачать
                </Button>
                {canManageFiles && (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleEdit}
                      className="flex-1 bg-white text-slate-500 border border-slate-400/75 hover:border-none hover:shadow-lg hover:shadow-indigo-500/30 hover:bg-[#7049f3]/90 hover:text-white active:bg-[#7049f3] rounded-xl h-12"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Редактировать
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => onDelete?.(file)}
                      className="flex-1 border-red-300 text-red-600 hover:bg-red-50 rounded-xl h-12 hover:shadow-lg hover:shadow-red-100/50"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Удалить
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
