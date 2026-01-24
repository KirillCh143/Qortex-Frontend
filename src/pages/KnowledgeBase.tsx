import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Search,
  X,
  Download,
  Loader2,
  LayoutGrid,
  List,
  FilePlus,
  FolderPlus,
  FileText,
  FileType,
  Sheet,
  File as FileIcon,
  Trash2,
} from 'lucide-react'
import { formatFileSize, formatDateRussian } from '@/lib/mockDocuments'
import { useFiles, useDownloadFile, useDeleteFile } from '@/hooks/useFiles'
import { useFolders } from '@/hooks/useFolders'
import type { DirectusFile } from '@/services/directus/types'
import FileListView from '@/components/FileListView'
import { FolderTree } from '@/components/FolderTree'
import { CreateFolderDialog } from '@/components/CreateFolderDialog'
import { UploadFileDialog } from '@/components/UploadFileDialog'
import AutoScrollTitle from '@/components/AutoScrollTitle'

// Helper function to get file type icon and color
const getFileTypeInfo = (mimeType: string) => {
  if (mimeType.includes('pdf')) {
    return {
      icon: FileText,
      bgColor: 'bg-red-100',
      iconColor: 'text-red-500',
      label: 'PDF',
    }
  } else if (mimeType.includes('word') || mimeType.includes('document')) {
    return {
      icon: FileType,
      bgColor: 'bg-blue-100',
      iconColor: 'text-blue-500',
      label: 'DOCX',
    }
  } else if (mimeType.includes('sheet') || mimeType.includes('excel')) {
    return {
      icon: Sheet,
      bgColor: 'bg-green-100',
      iconColor: 'text-green-500',
      label: 'XLSX',
    }
  } else if (mimeType.includes('text')) {
    return {
      icon: FileText,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-500',
      label: 'TXT',
    }
  } else {
    return {
      icon: FileIcon,
      bgColor: 'bg-gray-100',
      iconColor: 'text-gray-500',
      label: 'FILE',
    }
  }
}

// Helper function for Russian pluralization of file count
const getPluralForm = (count: number) => {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'файлов'
  }

  if (lastDigit === 1) {
    return 'файл'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'файла'
  }

  return 'файлов'
}

export default function KnowledgeBase() {
  const [selectedDoc, setSelectedDoc] = useState<DirectusFile | null>(null)
  const [isPanelOpen, setIsPanelOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [uploadFileOpen, setUploadFileOpen] = useState(false)

  // Fetch folders and files using React Query
  const { data: folders = [] } = useFolders()
  const {
    data: files = [],
    isLoading,
    error,
  } = useFiles({ search: searchQuery, folder: selectedFolderId })

  // Mutations
  const downloadMutation = useDownloadFile()
  const deleteMutation = useDeleteFile()

  // Trigger panel animation when selectedDoc changes
  useEffect(() => {
    if (selectedDoc) {
      // Small delay to ensure CSS transition applies
      setTimeout(() => setIsPanelOpen(true), 10)
    } else {
      setIsPanelOpen(false)
    }
  }, [selectedDoc])

  // Handle closing detail panel with animation
  const handleClosePanel = () => {
    setIsPanelOpen(false)
    // Wait for animation to complete before clearing selectedDoc
    setTimeout(() => setSelectedDoc(null), 300)
  }

  // Handle escape key to close detail panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedDoc) {
        handleClosePanel()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDoc])

  // Get current folder name for header
  const currentFolderName =
    selectedFolderId === null
      ? ' Все документы'
      : folders.find((f) => f.id === selectedFolderId)?.name || 'Unknown Folder'

  const handleDownload = () => {
    if (!selectedDoc) return

    // Use download mutation - the hook handles the download logic
    downloadMutation.mutate(selectedDoc.id, {
      onSuccess: (blob) => {
        // Override default behavior to use actual filename
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = selectedDoc.filename_download
        document.body.appendChild(a)
        a.click()

        // Clean up
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
      },
    })
  }

  const handleDelete = () => {
    if (!selectedDoc) return

    deleteMutation.mutate(selectedDoc.id, {
      onSuccess: () => {
        console.log('File deleted successfully')
        setDeleteDialogOpen(false)
        handleClosePanel()
      },
      onError: (error) => {
        console.error('Failed to delete file:', error)
        setDeleteDialogOpen(false)
      },
    })
  }

  return (
    <div className="h-full flex bg-[#fdfefe]">
      {/* Folder Sidebar - Far Left */}
      <div className="hidden md:block w-74 border-r border-slate-300 overflow-y-auto bg-[#fdfefe]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Структура каталогов</h2>
            <Button
              size="sm"
              onClick={() => setCreateFolderOpen(true)}
              className="h-10 w-10 p-0 shadow-lg shadow-indigo-500/30 bg-[#7049f3] text-white hover:bg-[#7049f3]/90"
              title="New Folder"
            >
              <FolderPlus className="h-4 w-4" />
            </Button>
          </div>
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
          />
        </div>
      </div>

      {/* Main Content Area - Centered with max-w-7xl */}
      <div className="flex-1 overflow-hidden">
        <div className="h-full flex flex-col max-w-7xl mx-auto w-full p-5 pb-8">
          {/* Header Section - Search Bar with Upload Button */}
          <div className="pb-6 pt-2 ">
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 shadow-lg shadow-indigo-500/10 rounded-xl">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  type="text"
                  placeholder="Поиск по документам..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Upload button */}
              <Button
                onClick={() => setUploadFileOpen(true)}
                disabled={selectedFolderId === null}
                title={selectedFolderId === null ? 'Please select a folder first' : 'Upload file'}
                className="p-7 pl-5 pr-6 rounded-xl bg-[#8466e4] hover:bg-[#7049f3] text-white disabled:bg-indigo-200 disabled:text-gray-900 disabled:shadow-none shrink-0 shadow-lg shadow-indigo-500/30"
              >
                <FilePlus className="h-5 w-5 mr-2 ml-1" />
                Добавить
              </Button>
            </div>
          </div>

          {/* Document List Section */}
          <div className="flex-1 overflow-y-auto pt-2 rounded-xl bg-[#fdfefe]">
            {/* Folder info and View toggle */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <h1 className="text-xl font-bold text-[#242424]">{currentFolderName}</h1>
                <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-sm font-medium rounded-full">
                  {files.length} {getPluralForm(files.length)}
                </span>
              </div>

              <div className="flex items-center gap-3">
                {/* View toggle - Segmented Control */}
                <div className="w-26 relative inline-flex items-center gap-2 bg-indigo-100 rounded-xl p-1">
                  {/* Sliding background */}
                  <div
                    className={`absolute top-1 bottom-1 w-12 bg-white rounded-[10px] shadow-sm transition-all duration-300 ease-in-out ${
                      viewMode === 'grid' ? 'left-1' : 'left-[52px]'
                    }`}
                  />

                  <button
                    onClick={() => setViewMode('grid')}
                    className={`relative ml-[3px] z-10 w-14 py-2 rounded-[10px] text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
                      viewMode === 'grid' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <LayoutGrid className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => setViewMode('list')}
                    className={`relative mr-[2px] z-10 w-14 py-2 rounded-[10px] text-sm font-medium transition-colors duration-200 flex items-center justify-center ${
                      viewMode === 'list' ? 'text-gray-900' : 'text-gray-500 hover:text-gray-900'
                    }`}
                  >
                    <List className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Document list */}
            {isLoading ? (
              <div className="text-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto" />
                <p className="mt-4 text-gray-500">Loading documents...</p>
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-500">
                <p>
                  Error loading documents:{' '}
                  {error instanceof Error ? error.message : 'Unknown error'}
                </p>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                <p>No documents found</p>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                {files.map((file) => {
                  const fileTypeInfo = getFileTypeInfo(file.type)
                  const IconComponent = fileTypeInfo.icon
                  const uploaderName = file.uploaded_by
                    ? `${file.uploaded_by.first_name} ${file.uploaded_by.last_name}`
                    : 'Неизвестный'

                  return (
                    <Card
                      key={file.id}
                      className="group relative rounded-xl shadow-none cursor-pointer transition-all bg-white border border-indigo-200 hover:border-[#8466e4]"
                      onClick={() => setSelectedDoc(file)}
                    >
                      <CardContent className="p-6">
                        <div className="flex flex-col items-start text-start">
                          {/* Large file icon with colored background */}
                          <div
                            className={`w-16 h-16 rounded-xl ${fileTypeInfo.bgColor} flex items-center justify-center mb-4`}
                          >
                            <IconComponent className={`w-8 h-8 ${fileTypeInfo.iconColor}`} />
                          </div>

                          {/* File name */}
                          <AutoScrollTitle text={file.title} />

                          {/* Uploader name */}
                          <p className="text-sm text-gray-600 font-medium">
                            Загрузил: {uploaderName}
                          </p>

                          {/* Date, size, and type */}
                          <p className="text-xs text-gray-500">
                            {formatDateRussian(new Date(file.uploaded_on))} • {formatFileSize(file.filesize)} • {fileTypeInfo.label}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            ) : (
              <FileListView files={files} onSelectFile={setSelectedDoc} />
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDoc && (
        <>
          {/* Overlay with fade animation */}
          <div
            className={`fixed inset-0 bg-black/50 z-50 transition-opacity duration-300 ${
              isPanelOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={handleClosePanel}
          />

          {/* Panel with slide-in animation */}
          <div
            className={`fixed right-0 top-0 h-full w-full md:w-1/2 bg-white shadow-xl z-50 overflow-y-auto transform transition-transform duration-300 ease-in-out ${
              isPanelOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            <div className="p-6">
              {/* Close button */}
              <button
                onClick={handleClosePanel}
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
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedDoc.title}</h3>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                    {getFileTypeInfo(selectedDoc.type).label}
                  </span>
                  <span>{formatDateRussian(new Date(selectedDoc.uploaded_on))}</span>
                </div>
              </div>

              {/* Metadata section */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Имя файла:</span>
                  <span className="text-sm text-gray-600">{selectedDoc.filename_download}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Размер:</span>
                  <span className="text-sm text-gray-600">
                    {formatFileSize(selectedDoc.filesize)}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Загрузил:</span>
                  <span className="text-sm text-gray-600">
                    {selectedDoc.uploaded_by
                      ? `${selectedDoc.uploaded_by.first_name} ${selectedDoc.uploaded_by.last_name}`
                      : 'Неизвестный'}
                  </span>
                </div>
              </div>

              {/* Description section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Описание</h3>
                <p className="text-gray-700 leading-relaxed">{selectedDoc.description}</p>
              </div>

              {/* Action buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  disabled={downloadMutation.isPending}
                  className="flex-1"
                >
                  {downloadMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  Скачать
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={deleteMutation.isPending}
                  className="flex-1"
                >
                  {deleteMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Trash2 className="h-4 w-4 mr-2" />
                  )}
                  Удалить
                </Button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Удалить файл?</DialogTitle>
            <DialogDescription>
              Вы уверены, что хотите удалить этот файл? Это действие нельзя отменить.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Отмена
            </Button>
            <Button
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Удаление...
                </>
              ) : (
                'Удалить'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Folder Dialog */}
      <CreateFolderDialog
        open={createFolderOpen}
        onOpenChange={setCreateFolderOpen}
        folders={folders}
        defaultParentId={selectedFolderId}
      />

      {/* Upload File Dialog */}
      <UploadFileDialog
        open={uploadFileOpen}
        onOpenChange={setUploadFileOpen}
        selectedFolderId={selectedFolderId}
        folders={folders}
      />
    </div>
  )
}
