import { useState } from 'react'
import { ChevronRight, ChevronDown, Folder } from 'lucide-react'
import { DirectusFolder } from '@/services/directus/types'

interface FolderTreeProps {
  folders: DirectusFolder[]
  selectedFolderId: string | null
  onSelectFolder: (id: string | null) => void
}

interface FolderNodeProps {
  folder: DirectusFolder
  level: number
  isExpanded: boolean
  isSelected: boolean
  onToggle: () => void
  onSelect: () => void
  children?: React.ReactNode
}

const FolderNode = ({
  folder,
  level,
  isExpanded,
  isSelected,
  onToggle,
  onSelect,
  children,
}: FolderNodeProps) => {
  const handleClick = () => {
    onToggle()
    onSelect()
  }

  return (
    <div>
      <div
        onClick={handleClick}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors ${
          isSelected ? 'bg-cyan-500/10 text-cyan-600' : 'text-gray-700 hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${level * 16 + 12}px` }}
      >
        {children ? (
          isExpanded ? (
            <ChevronDown className="w-4 h-4 flex-shrink-0" />
          ) : (
            <ChevronRight className="w-4 h-4 flex-shrink-0" />
          )
        ) : (
          <div className="w-4" />
        )}
        <Folder className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium truncate">{folder.name}</span>
      </div>
      {isExpanded && children}
    </div>
  )
}

export const FolderTree = ({ folders, selectedFolderId, onSelectFolder }: FolderTreeProps) => {
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Build folder hierarchy
  const folderMap = new Map<string, DirectusFolder>()
  folders.forEach((folder) => folderMap.set(folder.id, folder))

  const rootFolders = folders.filter((f) => f.parent === null)
  const getChildren = (parentId: string) => folders.filter((f) => f.parent === parentId)

  const toggleExpand = (folderId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(folderId)) {
        next.delete(folderId)
      } else {
        next.add(folderId)
      }
      return next
    })
  }

  const renderFolder = (folder: DirectusFolder, level: number): React.ReactNode => {
    const children = getChildren(folder.id)
    const isExpanded = expandedIds.has(folder.id)
    const isSelected = selectedFolderId === folder.id
    const hasChildren = children.length > 0

    return (
      <FolderNode
        key={folder.id}
        folder={folder}
        level={level}
        isExpanded={isExpanded}
        isSelected={isSelected}
        onToggle={() => toggleExpand(folder.id)}
        onSelect={() => onSelectFolder(folder.id)}
      >
        {hasChildren && children.map((child) => renderFolder(child, level + 1))}
      </FolderNode>
    )
  }

  return (
    <div className="space-y-1">
      {/* All Documents option */}
      <div
        onClick={() => onSelectFolder(null)}
        className={`flex items-center gap-2 px-3 py-2 cursor-pointer rounded-md transition-colors ${
          selectedFolderId === null
            ? 'bg-cyan-500/10 text-cyan-600'
            : 'text-gray-700 hover:bg-gray-100'
        }`}
      >
        <Folder className="w-4 h-4 flex-shrink-0" />
        <span className="text-sm font-medium">Все документы</span>
      </div>

      {/* Folder hierarchy */}
      {rootFolders.map((folder) => renderFolder(folder, 0))}
    </div>
  )
}
