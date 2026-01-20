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
import { Loader2 } from 'lucide-react'
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
  defaultParentId = null
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
        parent: parentFolderId
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
        }
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
      <DialogContent className="sm:max-w-[425px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create Folder</DialogTitle>
            <DialogDescription>
              Create a new folder to organize your documents.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="folder-name">
                Folder Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="folder-name"
                value={folderName}
                onChange={(e) => setFolderName(e.target.value)}
                placeholder="Enter folder name"
                disabled={createFolderMutation.isPending}
                aria-required="true"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="parent-folder">Parent Folder</Label>
              <Select
                value={parentFolderId || 'root'}
                onValueChange={(value) => setParentFolderId(value === 'root' ? null : value)}
                disabled={createFolderMutation.isPending}
              >
                <SelectTrigger id="parent-folder">
                  <SelectValue placeholder="Select parent folder" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="root">Root (No Parent)</SelectItem>
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
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={createFolderMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createFolderMutation.isPending || !folderName.trim()}
            >
              {createFolderMutation.isPending && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Create
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
