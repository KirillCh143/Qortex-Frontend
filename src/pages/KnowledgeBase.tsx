import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Download, Loader2, LayoutGrid, List, Plus, Upload } from 'lucide-react'
import { formatFileSize, formatDate } from '@/lib/mockDocuments'
import { useFiles, useDownloadFile } from '@/hooks/useFiles'
import { useFolders } from '@/hooks/useFolders'
import type { DirectusFile } from '@/services/directus/types'
import FileListView from '@/components/FileListView'
import { FolderTree } from '@/components/FolderTree'
import { CreateFolderDialog } from '@/components/CreateFolderDialog'
import { UploadFileDialog } from '@/components/UploadFileDialog'

export default function KnowledgeBase() {
  const [selectedDoc, setSelectedDoc] = useState<DirectusFile | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null)
  const [createFolderOpen, setCreateFolderOpen] = useState(false)
  const [uploadFileOpen, setUploadFileOpen] = useState(false)

  // Fetch folders and files using React Query
  const { data: folders = [] } = useFolders()
  const { data: files = [], isLoading, error } = useFiles({ search: searchQuery, folder: selectedFolderId })

  // Download mutation
  const downloadMutation = useDownloadFile()

  // Handle escape key to close detail panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && selectedDoc) {
        setSelectedDoc(null)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [selectedDoc])

  // Get current folder name for header
  const currentFolderName = selectedFolderId === null
    ? 'All Documents'
    : folders.find(f => f.id === selectedFolderId)?.name || 'Unknown Folder'

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
      }
    })
  }

  return (
    <div className="h-full flex">
      {/* Folder Sidebar */}
      <div className="hidden md:block w-64 border-r border-gray-200 bg-gray-50 overflow-y-auto">
        <div className="p-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-semibold text-gray-700">Folders</h2>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCreateFolderOpen(true)}
              className="h-8 w-8 p-0"
              title="New Folder"
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          <FolderTree
            folders={folders}
            selectedFolderId={selectedFolderId}
            onSelectFolder={setSelectedFolderId}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
            <p className="mt-2 text-gray-600">Browse Internal Documentation</p>
            <div className="mt-2 text-sm text-gray-600">
              {currentFolderName} • {files.length} documents
            </div>
          </div>

        {/* Search bar and Upload button */}
        <div className="flex gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search documents..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button
            onClick={() => setUploadFileOpen(true)}
            disabled={selectedFolderId === null}
            title={selectedFolderId === null ? 'Please select a folder first' : 'Upload file'}
          >
            <Upload className="h-4 w-4 mr-2" />
            Upload File
          </Button>
        </div>

        {/* View toggle */}
        <div className="flex gap-2 mb-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('grid')}
            className={viewMode === 'grid' ? 'border-cyan-500 bg-cyan-50' : ''}
          >
            <LayoutGrid className="h-4 w-4 mr-2" />
            Grid
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setViewMode('list')}
            className={viewMode === 'list' ? 'border-cyan-500 bg-cyan-50' : ''}
          >
            <List className="h-4 w-4 mr-2" />
            List
          </Button>
        </div>

        {/* Document list */}
        {isLoading ? (
          <div className="text-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-cyan-500 mx-auto" />
            <p className="mt-4 text-gray-500">Loading documents...</p>
          </div>
        ) : error ? (
          <div className="text-center py-12 text-red-500">
            <p>Error loading documents: {error instanceof Error ? error.message : 'Unknown error'}</p>
          </div>
        ) : files.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No documents found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {files.map((file) => (
              <Card
                key={file.id}
                className="cursor-pointer transition-colors hover:border-cyan-500"
                onClick={() => setSelectedDoc(file)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{file.title}</CardTitle>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded whitespace-nowrap">
                      {file.type.split('/')[0]}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-3">
                    {file.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(file.filesize)}</span>
                    <span>{formatDate(new Date(file.uploaded_on))}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <FileListView files={files} onSelectFile={setSelectedDoc} />
        )}
        </div>
      </div>

      {/* Detail Panel */}
      {selectedDoc && (
        <>
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setSelectedDoc(null)}
          />

          {/* Panel */}
          <div className="fixed right-0 top-0 h-full w-full md:w-1/2 bg-white shadow-xl z-50 overflow-y-auto transition-transform duration-300">
            <div className="p-6">
              {/* Close button */}
              <button
                onClick={() => setSelectedDoc(null)}
                className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-gray-500" />
              </button>

              {/* Document header */}
              <div className="mb-6 pr-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {selectedDoc.title}
                </h2>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded">
                    {selectedDoc.type}
                  </span>
                  <span>{formatDate(new Date(selectedDoc.uploaded_on))}</span>
                </div>
              </div>

              {/* Metadata section */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Filename:</span>
                  <span className="text-sm text-gray-600">{selectedDoc.filename_download}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">File size:</span>
                  <span className="text-sm text-gray-600">{formatFileSize(selectedDoc.filesize)}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Uploaded by:</span>
                  <span className="text-sm text-gray-600">System Admin</span>
                </div>
              </div>

              {/* Description section */}
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Description</h3>
                <p className="text-gray-700 leading-relaxed">{selectedDoc.description}</p>
              </div>

              {/* Action buttons */}
              <div>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="w-full"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </>
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
