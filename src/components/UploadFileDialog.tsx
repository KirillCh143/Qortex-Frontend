import { useState, useRef } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { useUploadFile } from '@/hooks/useFiles'
import { formatFileSize } from '@/lib/mockDocuments'
import type { DirectusFolder } from '@/services/directus/types'

interface UploadFileDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedFolderId: string | null
  folders: DirectusFolder[]
}

export function UploadFileDialog({
  open,
  onOpenChange,
  selectedFolderId,
  folders
}: UploadFileDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const uploadFileMutation = useUploadFile()

  const selectedFolderName = selectedFolderId === null
    ? 'Root'
    : folders.find(f => f.id === selectedFolderId)?.name || 'Unknown Folder'

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-fill title with filename if not already set
      if (!title) {
        setTitle(file.name)
      }
      setError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!selectedFile) {
      setError('Please select a file to upload')
      return
    }

    uploadFileMutation.mutate(
      {
        file: selectedFile,
        title: title.trim() || selectedFile.name,
        description: description.trim(),
        folder: selectedFolderId
      },
      {
        onSuccess: () => {
          console.log('File uploaded successfully')
          // Reset form and close dialog
          resetForm()
          onOpenChange(false)
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to upload file')
        }
      }
    )
  }

  const resetForm = () => {
    setSelectedFile(null)
    setTitle('')
    setDescription('')
    setError(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      resetForm()
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Upload File</DialogTitle>
            <DialogDescription>
              Upload a file to the knowledge base. Files will be stored in the selected folder.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="file-input">
                File <span className="text-red-500">*</span>
              </Label>
              <Input
                id="file-input"
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                disabled={uploadFileMutation.isPending}
                aria-required="true"
              />
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="ml-2 text-gray-500">
                    ({formatFileSize(selectedFile.size)})
                  </span>
                  <span className="ml-2 text-gray-500">
                    {selectedFile.type || 'Unknown type'}
                  </span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file-title">Title</Label>
              <Input
                id="file-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter file title (optional)"
                disabled={uploadFileMutation.isPending}
              />
              <p className="text-xs text-gray-500">
                Leave blank to use filename
              </p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file-description">Description</Label>
              <Textarea
                id="file-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter file description (optional)"
                disabled={uploadFileMutation.isPending}
                rows={3}
              />
            </div>

            <div className="grid gap-2">
              <Label>Folder</Label>
              <div className="text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-md border">
                {selectedFolderName}
              </div>
            </div>

            {error && (
              <div className="text-sm text-red-500" role="alert">
                {error}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={uploadFileMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={uploadFileMutation.isPending || !selectedFile}
            >
              {uploadFileMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Upload
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
