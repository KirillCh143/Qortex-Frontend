export interface Document {
  id: string
  title: string
  filename: string
  filesize: number
  uploadedOn: Date
  uploadedBy: string
  description: string
  category: string
  folder: string | null
}

// Mock folder hierarchy
export const mockFolders = [
  // Root folders
  { id: 'folder-hr', name: 'HR', parent: null },
  { id: 'folder-engineering', name: 'Engineering', parent: null },
  { id: 'folder-operations', name: 'Operations', parent: null },
  // HR subfolders
  { id: 'folder-hr-policies', name: 'Policies', parent: 'folder-hr' },
  { id: 'folder-hr-benefits', name: 'Benefits', parent: 'folder-hr' },
  // Engineering subfolders
  { id: 'folder-eng-docs', name: 'Documentation', parent: 'folder-engineering' },
  { id: 'folder-eng-guidelines', name: 'Guidelines', parent: 'folder-engineering' }
];

export const mockDocuments: Document[] = [
  {
    id: '1',
    title: 'Employee Handbook',
    filename: 'employee-handbook.pdf',
    filesize: 2450000,
    uploadedOn: new Date('2024-01-15'),
    uploadedBy: 'System Admin',
    description: 'Complete guide to company policies, benefits, code of conduct, and employee resources. Essential reading for all team members.',
    category: 'HR',
    folder: 'folder-hr-policies'
  },
  {
    id: '2',
    title: 'Technical Guidelines',
    filename: 'technical-guidelines.md',
    filesize: 85000,
    uploadedOn: new Date('2024-02-20'),
    uploadedBy: 'System Admin',
    description: 'Engineering best practices, coding standards, architecture patterns, and development workflow documentation.',
    category: 'Engineering',
    folder: 'folder-eng-guidelines'
  },
  {
    id: '3',
    title: 'Onboarding Checklist',
    filename: 'onboarding-checklist.docx',
    filesize: 125000,
    uploadedOn: new Date('2024-01-10'),
    uploadedBy: 'System Admin',
    description: 'Step-by-step guide for new hires covering first week tasks, account setup, training schedule, and team introductions.',
    category: 'HR',
    folder: 'folder-hr-policies'
  },
  {
    id: '4',
    title: 'API Documentation',
    filename: 'api-docs.pdf',
    filesize: 1750000,
    uploadedOn: new Date('2024-03-05'),
    uploadedBy: 'System Admin',
    description: 'Comprehensive API reference including endpoints, authentication, request/response formats, and integration examples.',
    category: 'Engineering',
    folder: 'folder-eng-docs'
  },
  {
    id: '5',
    title: 'Security Policy',
    filename: 'security-policy.pdf',
    filesize: 320000,
    uploadedOn: new Date('2024-01-22'),
    uploadedBy: 'System Admin',
    description: 'Data protection protocols, access control procedures, incident response plan, and compliance requirements.',
    category: 'Operations',
    folder: 'folder-operations'
  },
  {
    id: '6',
    title: 'Project Management Handbook',
    filename: 'pm-handbook.docx',
    filesize: 445000,
    uploadedOn: new Date('2024-02-15'),
    uploadedBy: 'System Admin',
    description: 'Project lifecycle management, sprint planning templates, stakeholder communication guidelines, and reporting standards.',
    category: 'Operations',
    folder: 'folder-operations'
  },
  {
    id: '7',
    title: 'Code Review Guidelines',
    filename: 'code-review-guide.md',
    filesize: 62000,
    uploadedOn: new Date('2024-03-10'),
    uploadedBy: 'System Admin',
    description: 'Standards for conducting effective code reviews, PR templates, feedback best practices, and quality checklists.',
    category: 'Engineering',
    folder: 'folder-eng-guidelines'
  },
  {
    id: '8',
    title: 'Benefits Overview',
    filename: 'benefits-2024.pdf',
    filesize: 890000,
    uploadedOn: new Date('2024-01-05'),
    uploadedBy: 'System Admin',
    description: 'Detailed breakdown of health insurance plans, retirement options, PTO policy, and additional perks available to employees.',
    category: 'HR',
    folder: 'folder-hr-benefits'
  },
  {
    id: '9',
    title: 'Incident Response Playbook',
    filename: 'incident-response.pdf',
    filesize: 670000,
    uploadedOn: new Date('2024-02-28'),
    uploadedBy: 'System Admin',
    description: 'Step-by-step procedures for handling production incidents, escalation paths, communication templates, and post-mortem process.',
    category: 'Operations',
    folder: 'folder-operations'
  },
  {
    id: '10',
    title: 'Architecture Decision Records',
    filename: 'adr-collection.md',
    filesize: 155000,
    uploadedOn: new Date('2024-03-15'),
    uploadedBy: 'System Admin',
    description: 'Historical record of significant architectural decisions, technology choices, and design trade-offs with rationale.',
    category: 'Engineering',
    folder: 'folder-eng-docs'
  }
]

// Helper function to format filesize
export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return bytes + ' B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
  return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
}

// Helper function to format date in Russian
export function formatDateRussian(date: Date): string {
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'
  ]
  const day = date.getDate()
  const month = months[date.getMonth()]
  const year = date.getFullYear()
  return `${day} ${month} ${year}`
}

// Legacy English date formatter - kept for backward compatibility
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric'
  })
}

// Generate mock file content for view/download
export function generateMockFileContent(document: Document): Blob {
  const extension = document.filename.split('.').pop()?.toLowerCase()
  let content = ''
  let mimeType = 'text/plain'

  // Build content based on file type
  if (extension === 'md') {
    // Markdown format
    mimeType = 'text/markdown'
    content = `# ${document.title}

**Category:** ${document.category}
**Filename:** ${document.filename}
**File Size:** ${formatFileSize(document.filesize)}
**Uploaded:** ${formatDate(document.uploadedOn)}

## Description

${document.description}

## Content

This is mock content for ${document.filename}. Real file content will be served from Directus in Phase 7.

The actual file would contain detailed information related to ${document.title.toLowerCase()}.
`
  } else if (extension === 'pdf' || extension === 'docx') {
    // Plain text representation for PDF/Word
    content = `${document.title}
${'='.repeat(document.title.length)}

Category: ${document.category}
Filename: ${document.filename}
File Size: ${formatFileSize(document.filesize)}
Uploaded: ${formatDate(document.uploadedOn)}

Description:
${document.description}

---

This is mock content for ${document.filename}. Real file content will be served from Directus in Phase 7.

The actual ${extension?.toUpperCase()} file would contain formatted content with proper styling, images, and structured information related to ${document.title.toLowerCase()}.
`
  } else {
    // Default plain text
    content = `${document.title}

This is mock content for ${document.filename}. Real file content will be served from Directus in Phase 7.

Document Information:
- Category: ${document.category}
- Filename: ${document.filename}
- File Size: ${formatFileSize(document.filesize)}
- Uploaded: ${formatDate(document.uploadedOn)}

Description:
${document.description}
`
  }

  return new Blob([content], { type: mimeType })
}
