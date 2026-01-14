import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Search } from 'lucide-react'
import { mockDocuments, formatFileSize, formatDate, type Document } from '@/lib/mockDocuments'

export default function KnowledgeBase() {
  const [documents] = useState<Document[]>(mockDocuments)
  const [filteredDocuments, setFilteredDocuments] = useState<Document[]>(mockDocuments)
  const [_selectedDoc, setSelectedDoc] = useState<Document | null>(null)
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
    </div>
  )
}
