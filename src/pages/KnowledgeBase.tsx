import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Search, X, Download, Eye } from 'lucide-react'
import { mockDocuments, formatFileSize, formatDate, generateMockFileContent, type Document } from '@/lib/mockDocuments'

export default function KnowledgeBase() {
  const [documents] = useState<Document[]>(mockDocuments)
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(mockDocuments)
  const [selectedDoc, setSelectedDoc] = useState<Document | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Filter documents when search query changes
  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredDocuments(documents)
    } else {
      const query = searchQuery.toLowerCase()
      const filtered = documents.filter(
        doc =>
          doc.title.toLowerCase().includes(query) ||
          doc.description.toLowerCase().includes(query)
      )
      setFilteredDocuments(filtered)
    }
  }, [searchQuery, documents])

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

  const handleView = () => {
    if (!selectedDoc) return

    // Generate mock file content
    const blob = generateMockFileContent(selectedDoc)
    const url = URL.createObjectURL(blob)

    // Open in new tab
    window.open(url, '_blank')

    // Clean up blob URL after short delay
    setTimeout(() => {
      URL.revokeObjectURL(url)
    }, 100)
  }

  const handleDownload = () => {
    if (!selectedDoc) return

    // Generate mock file content
    const blob = generateMockFileContent(selectedDoc)
    const url = URL.createObjectURL(blob)

    // Create anchor element and trigger download
    const a = document.createElement('a')
    a.href = url
    a.download = selectedDoc.filename
    document.body.appendChild(a)
    a.click()

    // Clean up
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  return (
    <div className="h-full overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Knowledge Base</h1>
          <p className="mt-2 text-gray-600">Browse Internal Documentation</p>
        </div>

        {/* Search bar */}
        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search documents..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Document list */}
        {filteredDocuments.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <p>No documents found</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDocuments.map((doc) => (
              <Card
                key={doc.id}
                className="cursor-pointer transition-colors hover:border-cyan-500"
                onClick={() => setSelectedDoc(doc)}
              >
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <span className="px-2 py-1 text-xs font-medium bg-gray-100 text-gray-700 rounded whitespace-nowrap">
                      {doc.category}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="line-clamp-2 mb-3">
                    {doc.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <span>{formatFileSize(doc.filesize)}</span>
                    <span>{formatDate(doc.uploadedOn)}</span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
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
                    {selectedDoc.category}
                  </span>
                  <span>{formatDate(selectedDoc.uploadedOn)}</span>
                </div>
              </div>

              {/* Metadata section */}
              <div className="mb-6 space-y-2">
                <div className="flex justify-between py-2 border-b border-gray-100">
                  <span className="text-sm font-medium text-gray-700">Filename:</span>
                  <span className="text-sm text-gray-600">{selectedDoc.filename}</span>
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
              <div className="flex gap-2">
                <Button
                  onClick={handleView}
                  className="flex-1 bg-cyan-500 hover:bg-cyan-600"
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View
                </Button>
                <Button
                  variant="outline"
                  onClick={handleDownload}
                  className="flex-1"
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
