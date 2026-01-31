import { useState, useRef, useEffect } from 'react'
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
import { Loader2, Upload } from 'lucide-react'
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
  folders,
}: UploadFileDialogProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const descriptionTextareaRef = useRef<HTMLTextAreaElement>(null)

  const uploadFileMutation = useUploadFile()

  const selectedFolderName =
    selectedFolderId === null
      ? 'Root'
      : folders.find((f) => f.id === selectedFolderId)?.name || 'Unknown Folder'

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

  useEffect(() => {
    if (descriptionTextareaRef.current) {
      // Reset height to auto to calculate scrollHeight correctly
      descriptionTextareaRef.current.style.height = 'auto'
      // Set height to scrollHeight, ensuring a minimum height of 80px (from min-h-[80px])
      descriptionTextareaRef.current.style.height = `${Math.max(
        80,
        descriptionTextareaRef.current.scrollHeight
      )}px`
    }
  }, [description])

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
        folder: selectedFolderId,
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
        },
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
      <DialogContent className="sm:max-w-[500px] bg-white" hideCloseButton={true}>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Загрузить файл</DialogTitle>
            <DialogDescription>Файлы будут сохранены в текущей папке.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="file-input">
                Файл <span className="text-red-500">*</span>
              </Label>
              <Input
                id="file-input"
                ref={fileInputRef}
                type="file"
                onChange={handleFileChange}
                disabled={uploadFileMutation.isPending}
                aria-required="true"
                className="rounded-xl border-slate-300 focus:border-[#8466e4] flex items-center leading-[36px]"
              />
              {selectedFile && (
                <div className="text-sm text-gray-600">
                  <span className="font-medium">{selectedFile.name}</span>
                  <span className="ml-2 text-gray-500">({formatFileSize(selectedFile.size)})</span>
                  <span className="ml-2 text-gray-500">{selectedFile.type || 'Unknown type'}</span>
                </div>
              )}
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file-title">Название</Label>
              <Input
                id="file-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Введите название (необязательно)"
                disabled={uploadFileMutation.isPending}
                className="rounded-xl border-slate-300 focus:border-[#8466e4]"
              />
              <p className="text-xs text-gray-500">Оставьте пустым, чтобы использовать имя файла</p>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="file-description">Описание</Label>
              <Textarea
                id="file-description"
                ref={descriptionTextareaRef}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Введите описание (необязательно)"
                disabled={uploadFileMutation.isPending}
                className="rounded-xl border border-slate-300 hover:border-violet-300 focus:border-[#8466e4] resize-none"
              />
            </div>

            <div className="grid gap-2">
              <Label>Папка</Label>
              <div className="text-sm h-14 text-gray-600 bg-gray-50 px-3 py-2 rounded-xl border border-slate-300 flex items-center">
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
              className="h-13 w-34 rounded-xl bg-white border border-slate-300 hover:border-violet-300 text-gray-900"
              onClick={() => handleOpenChange(false)}
              disabled={uploadFileMutation.isPending}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={uploadFileMutation.isPending || !selectedFile}
              className="bg-[#8466e4] hover:bg-[#7049f3] shadow-lg shadow-indigo-500/20 text-white h-13 w-34 rounded-xl"
            >
              {uploadFileMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Upload className="mr-2 h-4 w-4" />
              )}
              Загрузить
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
