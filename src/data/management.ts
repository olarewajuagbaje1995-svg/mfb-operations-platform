// Responsibility: central, typed management content for the public /management page.
// The website owner can add or edit executives here without touching the page component.
// Only profiles with published = true appear publicly.
// Do not invent staff names, photographs, biographies or appointments — unpublished
// entries are clearly marked placeholders until verified information is supplied.

export type ManagementCategory = 'board' | 'executive' | 'departmental'

export interface ManagementPerson {
  id: string
  name: string
  position: string
  category: ManagementCategory
  department?: string
  image?: string
  shortBio: string
  fullBio?: string
  qualifications?: string[]
  linkedin?: string
  displayOrder: number
  published: boolean
}

export const managementTeam: ManagementPerson[] = [
  {
    id: 'ceo',
    name: '',
    position: 'Chief Executive Officer',
    category: 'executive',
    shortBio: '',
    fullBio: '',
    qualifications: [],
    displayOrder: 1,
    published: false,
  },
  {
    id: 'board-chairman',
    name: '',
    position: 'Chairman, Board of Directors',
    category: 'board',
    shortBio: '',
    displayOrder: 2,
    published: false,
  },
  {
    id: 'coo',
    name: '',
    position: 'Chief Operating Officer',
    category: 'executive',
    department: 'Operations',
    shortBio: '',
    displayOrder: 3,
    published: false,
  },
  {
    id: 'cfo',
    name: '',
    position: 'Chief Financial Officer',
    category: 'executive',
    department: 'Finance',
    shortBio: '',
    displayOrder: 4,
    published: false,
  },
  {
    id: 'risk',
    name: '',
    position: 'Head of Risk Management',
    category: 'departmental',
    department: 'Risk Management',
    shortBio: '',
    displayOrder: 5,
    published: false,
  },
]

export const publishedManagement = managementTeam
  .filter((person) => person.published && person.name.trim())
  .sort((a, b) => a.displayOrder - b.displayOrder)
