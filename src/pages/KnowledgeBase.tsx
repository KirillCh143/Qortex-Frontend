import { useState, useEffect } from 'react'
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
  Download,
  Loader2,
  LayoutGrid,
  List,
  FilePlus,
  FolderPlus,
  User,
  Calendar,
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
import { FileDetailPanel } from '@/components/FileDetailPanel'
import { getFileTypeInfo } from '@/lib/fileTypeHelpers'
import { usePermissions } from '@/hooks/usePermissions'

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
  const [downloadingFileId, setDownloadingFileId] = useState<string | null>(null)

  // Role-based permissions
  const { canManageFiles } = usePermissions()

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

  // Sync selectedDoc with fresh data after mutations (e.g. file update)
  useEffect(() => {
    if (selectedDoc) {
      const updated = files.find((f) => f.id === selectedDoc.id)
      if (updated && updated !== selectedDoc) {
        setSelectedDoc(updated)
      }
    }
  }, [files])

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

    setDownloadingFileId(selectedDoc.id)
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
        setDownloadingFileId(null)
      },
      onError: () => {
        setDownloadingFileId(null)
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
    <div className="h-full flex bg-[#fbfcfd]">
      {/* Folder Sidebar - Far Left */}
      <div className="hidden md:block w-74 border-r border-slate-300/85 overflow-y-auto bg-[#fbfcfd]">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Структура каталогов</h2>
            {canManageFiles && (
              <Button
                size="sm"
                onClick={() => setCreateFolderOpen(true)}
                className="h-11 w-11 p-0 shadow-lg shadow-indigo-500/30 bg-[#7049f3]/90 text-white hover:bg-[#7049f3]"
                title="New Folder"
              >
                <FolderPlus className="h-4 w-4" />
              </Button>
            )}
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
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                    setSearchQuery(e.target.value)
                  }
                  className="pl-10"
                />
              </div>

              {/* Upload button - only for administrators and moderators */}
              {canManageFiles && (
                <Button
                  onClick={() => setUploadFileOpen(true)}
                  disabled={selectedFolderId === null}
                  title={selectedFolderId === null ? 'Please select a folder first' : 'Upload file'}
                  className="h-13 p-6 pl-5 pr-6 rounded-xl bg-[#7049f3]/90 hover:bg-[#7049f3] text-white disabled:bg-indigo-100 disabled:text-gray-900 disabled:shadow-none shrink-0 shadow-lg shadow-indigo-500/20"
                >
                  <FilePlus className="h-5 w-5 mr-2 ml-1" />
                  Добавить
                </Button>
              )}
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
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                {files.map((file) => {
                  const fileTypeInfo = getFileTypeInfo(file.type)
                  const IconComponent = fileTypeInfo.icon
                  const uploaderName = file.uploaded_by
                    ? `${file.uploaded_by.first_name} ${file.uploaded_by.last_name}`
                    : 'Неизвестный'

                  return (
                    <div
                      key={file.id}
                      className={`group p-5 bg-white rounded-xl border hover:border-violet-300 transition-all cursor-pointer relative flex flex-col h-full hover:shadow-md hover:shadow-slate-100 ${
                        selectedDoc?.id === file.id
                          ? 'border-2 border-[#7049f3]/90 shadow-md shadow-slate-100'
                          : 'border-slate-300/85 hover:border-primary/50'
                      }`}
                      onClick={() => setSelectedDoc(file)}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div
                          className={`size-12 rounded-xl ${fileTypeInfo.bgColor} flex items-center justify-center ${fileTypeInfo.iconColor} border ${fileTypeInfo.borderColor}`}
                        >
                          <IconComponent className="w-7 h-7" />
                        </div>
                      </div>
                      <h3 className="font-bold text-slate-800 text-sm mb-1 leading-snug line-clamp-2">
                        <AutoScrollTitle text={file.title} />
                      </h3>
                      <div className="space-y-2 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="size-5 flex items-center justify-center text-slate-500">
                            <User className="h-[14px] w-[14px]" />
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            Автор: {uploaderName}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="size-5 flex items-center justify-center text-slate-500">
                            <Calendar className="h-[14px] w-[14px]" />
                          </div>
                          <span className="text-xs text-slate-500 font-medium">
                            Дата: {formatDateRussian(new Date(file.uploaded_on))}
                          </span>
                        </div>
                      </div>
                      <div className="mt-auto pt-4 border-t border-slate-300/85 flex items-center justify-between">
                        <div className="flex flex-col">
                          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                            {fileTypeInfo.label} • {formatFileSize(file.filesize)}
                          </span>
                        </div>
                        <button
                          className="ml-4 size-10 rounded-full flex items-center justify-center transition-all bg-white text-slate-400 border border-slate-300/85 hover:border-none hover:shadow-lg hover:shadow-indigo-500/30 hover:bg-[#7049f3]/90 hover:text-white active:bg-[#7049f3]"
                          onClick={(e) => {
                            e.stopPropagation()
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
                          }}
                        >
                          {downloadMutation.isPending && downloadingFileId === file.id ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                          ) : (
                            <Download className="h-5 w-5" />
                          )}
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <FileListView
                files={files}
                onSelectFile={setSelectedDoc}
                selectedFile={selectedDoc}
              />
            )}
          </div>
        </div>
      </div>

      {/* Detail Panel */}
      <FileDetailPanel
        file={selectedDoc}
        open={isPanelOpen}
        onOpenChange={(open) => {
          if (!open) {
            handleClosePanel()
          }
        }}
        onDownload={handleDownload}
        onDelete={canManageFiles ? () => setDeleteDialogOpen(true) : undefined}
        isDownloading={downloadMutation.isPending && downloadingFileId === selectedDoc?.id}
      />

      {/* Delete Confirmation Dialog - only for administrators and moderators */}
      {canManageFiles && (
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
                className="bg-red-600 hover:bg-red-700 text-white"
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
      )}

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
