import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, FolderPlus } from 'lucide-react'
import { useCreateFolder } from '@/hooks/useFolders'
import type { DirectusFolder } from '@/services/directus/types'

interface CreateFolderDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  folders: DirectusFolder[]
  defaultParentId?: string | null
}

export function CreateFolderDialog({
  open,
  onOpenChange,
  folders,
  defaultParentId = null,
}: CreateFolderDialogProps) {
  const [folderName, setFolderName] = useState('')
  const [parentFolderId, setParentFolderId] = useState<string | null>(defaultParentId)
  const [error, setError] = useState<string | null>(null)

  const createFolderMutation = useCreateFolder()

  // Update parent folder when defaultParentId changes
  useEffect(() => {
    setParentFolderId(defaultParentId)
  }, [defaultParentId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const trimmedName = folderName.trim()
    if (!trimmedName) {
      setError('Folder name is required')
      return
    }

    createFolderMutation.mutate(
      {
        name: trimmedName,
        parent: parentFolderId,
      },
      {
        onSuccess: () => {
          console.log('Folder created successfully')
          // Reset form and close dialog
          setFolderName('')
          setParentFolderId(defaultParentId)
          onOpenChange(false)
        },
        onError: (err) => {
          setError(err instanceof Error ? err.message : 'Failed to create folder')
        },
      }
    )
  }

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      setFolderName('')
      setParentFolderId(defaultParentId)
      setError(null)
    }
    onOpenChange(newOpen)
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-white" hideCloseButton>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-xl font-semibold">Создать новую папку</DialogTitle>
            <DialogDescription>
              Создайте новую папку для организации ваших документов.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-6">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">
                Название папки <span className="text-red-500">*</span>
              </Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Введите название..."
                disabled={createFolderMutation.isPending}
                aria-required="true"
                className="rounded-xl border-slate-300 focus:ring-[#8466e4] focus:border-[#8466e4]"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent-folder">Родительская папка</Label>
              <Select
                value={parentFolderId || 'root'}
                onValueChange={(value) => setParentFolderId(value === 'root' ? null : value)}
                disabled={createFolderMutation.isPending}
              >
                <SelectTrigger id="parent-folder" className="bg-white">
                  <SelectValue placeholder="Выберите папку" />
                </SelectTrigger>
                <SelectContent className="bg-white">
                  <SelectItem value="root">Корневая папка</SelectItem>
                  {folders.map((folder) => (
                    <SelectItem key={folder.id} value={folder.id}>
                      {folder.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
              className="h-13 w-34 rounded-xl bg-white border border-slate-300 hover:border-violet-300 text-gray-900"
              onClick={() => handleOpenChange(false)}
              disabled={createFolderMutation.isPending}
            >
              Отмена
            </Button>
            <Button
              type="submit"
              disabled={createFolderMutation.isPending || !folderName.trim()}
              className="h-13 w-34 rounded-xl bg-[#8466e4] hover:bg-[#7049f3] text-white shadow-lg shadow-indigo-500/20"
            >
              {createFolderMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <FolderPlus className="mr-2 h-4 w-4" />
              )}
              Создать
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
