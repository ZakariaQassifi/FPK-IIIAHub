import type {
  AcademicField,
  AcademicModule,
  AdminStats,
  Announcement,
  PendingResource,
  Resource,
  ResourceCategory,
  Semester,
  Submission,
  Timetable,
} from '@/types'

const BASE_SEMESTERS = [
  { name: 'S1', slug: 's1' },
  { name: 'S2', slug: 's2' },
  { name: 'S3', slug: 's3' },
  { name: 'S4', slug: 's4' },
  { name: 'S5', slug: 's5' },
  { name: 'S6', slug: 's6' },
  { name: 'M1', slug: 'm1' },
  { name: 'M2', slug: 'm2' },
] as const

export const SEMESTER_ORDER: readonly string[] = BASE_SEMESTERS.map(
  (semester) => semester.slug,
)

interface ModuleDef {
  code: string
  title: string
  description: string
}

const MODULE_DEFS: Record<string, ModuleDef[]> = {
  'informatique|s1': [
    {
      code: 'INF101',
      title: 'Introduction à la programmation',
      description: 'Bases de la programmation structurée en Python : variables, conditions, boucles et fonctions.',
    },
    {
      code: 'MAT101',
      title: 'Mathématiques pour l\'informatique',
      description: 'Logique, ensembles, relations et bases du raisonnement mathématique pour informaticiens.',
    },
  ],
  'informatique|s2': [
    {
      code: 'INF201',
      title: 'Algorithmique et structures de données',
      description: 'Listes, piles, files, arbres, graphes et complexité algorithmique.',
    },
    {
      code: 'INF202',
      title: 'Architecture des ordinateurs',
      description: 'Processeurs, mémoires, représentation de l\'information et assembleur.',
    },
    {
      code: 'MAT201',
      title: 'Analyse 2',
      description: 'Suites, séries, intégrales et équations différentielles usuelles.',
    },
  ],
  'informatique|s3': [
    {
      code: 'INF301',
      title: 'Programmation orientée objet',
      description: 'Classes, héritage, polymorphisme et conception orientée objet en Java.',
    },
    {
      code: 'INF302',
      title: 'Développement web',
      description: 'HTML, CSS, JavaScript et introduction aux frameworks front-end.',
    },
  ],
  'informatique|s4': [
    {
      code: 'INF401',
      title: "Systèmes d'exploitation",
      description: 'Processus, threads, ordonnancement, mémoire et systèmes de fichiers.',
    },
    {
      code: 'INF402',
      title: 'Bases de données',
      description: 'Modèle relationnel, SQL, normalisation et transactions.',
    },
    {
      code: 'INF403',
      title: 'Génie logiciel',
      description: 'Cycle de vie, méthodologies agiles, UML et gestion de projet.',
    },
  ],
  'informatique|s5': [
    {
      code: 'INF501',
      title: 'Réseaux informatiques',
      description: 'Modèle OSI/TCP-IP, protocoles de transport et programmation réseau.',
    },
    {
      code: 'INF502',
      title: 'Compilation',
      description: 'Analyse lexicale, syntaxique et sémantique, génération de code.',
    },
    {
      code: 'INF503',
      title: 'Intelligence artificielle',
      description: 'Recherche heuristique, logique, apprentissage automatique.',
    },
  ],
  'informatique|s6': [
    {
      code: 'INF601',
      title: 'Sécurité informatique',
      description: 'Cryptographie, vulnérabilités et bonnes pratiques de sécurisation.',
    },
    {
      code: 'INF602',
      title: 'Big Data',
      description: 'Écosystème Hadoop/Spark, traitement distribué de données massives.',
    },
    {
      code: 'INF603',
      title: 'Projet de fin d\'études',
      description: 'Conception et réalisation d\'un projet complet en équipe.',
    },
  ],
  'informatique|m1': [
    {
      code: 'INF-M1-01',
      title: 'Apprentissage automatique avancé',
      description: 'Modèles supervisés et non supervisés, évaluation et sélection de modèles.',
    },
    {
      code: 'INF-M1-02',
      title: 'Architectures distribuées',
      description: 'Microservices, files de messages et systèmes répartis à grande échelle.',
    },
    {
      code: 'INF-M1-03',
      title: 'Recherche opérationnelle',
      description: 'Optimisation linéaire, programmation dynamique et heuristiques.',
    },
  ],
  'informatique|m2': [
    {
      code: 'INF-M2-01',
      title: 'Apprentissage profond',
      description: 'Réseaux de neurones, vision par ordinateur et traitement du langage.',
    },
    {
      code: 'INF-M2-02',
      title: 'Ingénierie des données',
      description: 'Pipelines ETL, data lakes et gouvernance des données.',
    },
    {
      code: 'INF-M2-03',
      title: 'Projet de fin d\'études',
      description: 'Stage long et soutenance en entreprise ou en laboratoire.',
    },
  ],
  'mathematiques-et-informatique|s1': [
    {
      code: 'MAT101',
      title: 'Analyse 1',
      description: 'Nombres réels, suites numériques, limites et fonctions continues.',
    },
    {
      code: 'MAT102',
      title: 'Algèbre linéaire',
      description: 'Espaces vectoriels, matrices, déterminants et systèmes linéaires.',
    },
    {
      code: 'INF101',
      title: 'Introduction à la programmation',
      description: 'Algorithmique et programmation structurée en Python.',
    },
  ],
  'mathematiques-et-informatique|s2': [
    {
      code: 'MAT201',
      title: 'Probabilités et statistiques',
      description: 'Variables aléatoires, lois usuelles et statistique descriptive.',
    },
    {
      code: 'MAT202',
      title: 'Analyse 2',
      description: 'Calcul différentiel, intégrales multiples et séries.',
    },
    {
      code: 'INF201',
      title: 'Algorithmique et structures de données',
      description: 'Structures de données fondamentales et complexité.',
    },
  ],
  'mathematiques-et-informatique|s3': [
    {
      code: 'MAT301',
      title: 'Analyse 3',
      description: 'Fonctions de plusieurs variables, formes différentielles.',
    },
    {
      code: 'MAT302',
      title: 'Équations différentielles',
      description: 'EDO linéaires, systèmes dynamiques et méthodes de résolution.',
    },
    {
      code: 'INF301',
      title: 'Programmation orientée objet',
      description: 'Conception objet et langage Java.',
    },
  ],
  'mathematiques-et-informatique|s4': [
    {
      code: 'MAT401',
      title: 'Analyse numérique',
      description: 'Erreurs, interpolation, résolution numérique d\'équations.',
    },
    {
      code: 'MAT402',
      title: 'Statistiques inférentielles',
      description: 'Estimation, tests d\'hypothèses et intervalles de confiance.',
    },
    {
      code: 'INF401',
      title: "Systèmes d'exploitation",
      description: 'Notions fondamentales des systèmes d\'exploitation.',
    },
  ],
  'mathematiques-et-informatique|s5': [
    {
      code: 'MAT501',
      title: 'Optimisation',
      description: 'Optimisation convexe, contraintes et dualité.',
    },
    {
      code: 'MAT502',
      title: 'Méthodes numériques avancées',
      description: 'EDP, éléments finis et calcul scientifique.',
    },
    {
      code: 'INF501',
      title: 'Réseaux informatiques',
      description: 'Protocoles réseau et applications scientifiques.',
    },
  ],
  'mathematiques-et-informatique|s6': [
    {
      code: 'MAT601',
      title: 'Modélisation stochastique',
      description: 'Chaînes de Markov, processus et simulations.',
    },
    {
      code: 'MAT602',
      title: 'Data science',
      description: 'Analyse de données, visualisation et modèles prédictifs.',
    },
    {
      code: 'MAT603',
      title: 'Projet de fin d\'études',
      description: 'Projet de recherche appliquée en mathématiques et informatique.',
    },
  ],
  'mathematiques-et-informatique|m1': [
    {
      code: 'MAT-M1-01',
      title: 'Analyse fonctionnelle',
      description: 'Espaces de Banach et Hilbert, opérateurs bornés.',
    },
    {
      code: 'MAT-M1-02',
      title: 'Probabilités avancées',
      description: 'Convergence, martingales et calcul stochastique.',
    },
    {
      code: 'MAT-M1-03',
      title: 'Optimisation numérique',
      description: 'Méthodes de gradient, optimisation non linéaire et sous-gradient.',
    },
  ],
  'mathematiques-et-informatique|m2': [
    {
      code: 'MAT-M2-01',
      title: 'Statistique avancée',
      description: 'Modèles linéaires généralisés, méthodes bayésiennes.',
    },
    {
      code: 'MAT-M2-02',
      title: 'Calcul scientifique parallèle',
      description: 'Calcul haute performance et méthodes itératives.',
    },
    {
      code: 'MAT-M2-03',
      title: 'Projet de fin d\'études',
      description: 'Stage de recherche et rédaction d\'un mémoire.',
    },
  ],
}

export const academicFields: AcademicField[] = [
  {
    id: 'f1',
    name: 'Informatique',
    slug: 'informatique',
    description:
      'Algorithmique, développement, réseaux, systèmes et bases de données.',
    moduleCount: 0,
    resourceCount: 148,
  },
  {
    id: 'f2',
    name: 'Mathématiques et Informatique',
    slug: 'mathematiques-et-informatique',
    description:
      'Analyse, algèbre, probabilités, avec une solide base en informatique.',
    moduleCount: 0,
    resourceCount: 112,
  },
]

export const mockSemesters: Semester[] = academicFields.flatMap((field) =>
  BASE_SEMESTERS.map((semester) => ({
    id: `sem-${field.slug}-${semester.slug}`,
    name: semester.name,
    slug: semester.slug,
    fieldSlug: field.slug,
    fieldName: field.name,
    moduleCount: (MODULE_DEFS[`${field.slug}|${semester.slug}`] ?? []).length,
  })),
)

export const mockModules: AcademicModule[] = Object.entries(MODULE_DEFS).flatMap(
  ([key, defs]) => {
    const [fieldSlug, semesterSlug] = key.split('|')
    const semester =
      mockSemesters.find(
        (s) => s.fieldSlug === fieldSlug && s.slug === semesterSlug,
      ) ?? {
        id: `sem-${fieldSlug}-${semesterSlug}`,
        name: semesterSlug.toUpperCase(),
        slug: semesterSlug,
        fieldSlug,
        fieldName: fieldSlug,
      }
    return defs.map((def) => ({
      id: `${fieldSlug}-${semesterSlug}-${def.code.toLowerCase()}`,
      code: def.code,
      title: def.title,
      description: def.description,
      semester,
    }))
  },
)

const mockModulesBySemesterId = new Map<string, AcademicModule[]>(
  mockSemesters.map((semester) => [
    semester.id,
    mockModules.filter((module) => module.semester.id === semester.id),
  ]),
)

for (const field of academicFields) {
  field.moduleCount = mockModules.filter(
    (module) => module.semester.fieldSlug === field.slug,
  ).length
}

function resource(
  id: string,
  moduleId: string,
  category: ResourceCategory,
  title: string,
  uploadedAt: string,
  professorName: string | null,
  fileSize: number,
): Resource {
  const module = mockModules.find((m) => m.id === moduleId)
  return {
    id,
    moduleId,
    title,
    category,
    moduleName: module?.title ?? '',
    academicYear: '2025/2026',
    professorName,
    fileSize,
    fileUrl: '#',
    uploadedAt,
  }
}

export const mockResources: Resource[] = [
  resource(
    'r1',
    'informatique-s2-inf201',
    'COURS',
    "Algorithmique et structures de données — Cours complet d'introduction",
    '2026-11-08T10:30:00Z',
    'Pr. El Amrani',
    2_411_520,
  ),
  resource(
    'r2',
    'mathematiques-et-informatique-s1-mat101',
    'EXAMS',
    'Examen final — Analyse 1 (session normale)',
    '2026-11-06T14:00:00Z',
    'Pr. Benali',
    891_904,
  ),
  resource(
    'r3',
    'informatique-s4-inf402',
    'TD',
    'Série de TD n°4 — Bases de données relationnelles',
    '2026-11-04T09:15:00Z',
    'Pr. Idrissi',
    524_288,
  ),
  resource(
    'r4',
    'informatique-s3-inf301',
    'TP',
    'TP — Programmation orientée objet en Java (séance 3)',
    '2026-11-02T16:45:00Z',
    'Pr. El Amrani',
    1_572_864,
  ),
  resource(
    'r5',
    'informatique-s4-inf401',
    'SLIDES',
    "Slides — Systèmes d'exploitation : processus et threads",
    '2026-10-30T11:20:00Z',
    'Pr. Tazi',
    4_194_304,
  ),
  resource(
    'r6',
    'mathematiques-et-informatique-s2-mat201',
    'CORRECTIONS',
    'Correction — Examen de Probabilités (session de rattrapage)',
    '2026-10-27T08:00:00Z',
    'Pr. Benali',
    734_003,
  ),
  resource(
    'r7',
    'mathematiques-et-informatique-s1-mat102',
    'RESUMES',
    'Résumé — Algèbre linéaire (chapitres 1 à 5)',
    '2026-10-24T19:10:00Z',
    null,
    629_145,
  ),
  resource(
    'r8',
    'informatique-s5-inf501',
    'COURS',
    'Cours — Réseaux informatiques : la couche transport',
    '2026-10-21T13:35:00Z',
    'Pr. Idrissi',
    3_145_728,
  ),
  resource(
    'r9',
    'informatique-s4-inf402',
    'EXAMS',
    'Examen — Bases de données (session principale 2025)',
    '2026-10-18T09:00:00Z',
    'Pr. Idrissi',
    1_048_576,
  ),
  resource(
    'r10',
    'mathematiques-et-informatique-s1-mat101',
    'TD',
    'Série de TD n°2 — Limites et continuité',
    '2026-10-15T14:30:00Z',
    'Pr. Benali',
    458_752,
  ),
]

export const mockTimetables: Record<string, Timetable> = Object.fromEntries(
  mockSemesters.map((semester) => [
    semester.id,
    {
      id: `tt-${semester.id}`,
      semesterId: semester.id,
      fileUrl: '#',
      academicYear: '2025/2026',
      updatedAt: '2026-10-05T09:00:00Z',
    },
  ]),
)

export const mockAnnouncements: Announcement[] = [
  {
    id: 'a1',
    title: 'Ouverture des inscriptions au cycle Master (M1 & M2)',
    content:
      'Les inscriptions aux cycles Master sont ouvertes du 10 au 30 novembre sur la plateforme en ligne du campus. Munissez-vous de votre relevé de notes et de votre CIN.',
    category: 'Administration',
    isPinned: true,
    authorName: 'Administration FPK',
    publishedAt: '2026-11-09T08:00:00Z',
    expiresAt: '2026-11-30T23:59:00Z',
  },
  {
    id: 'a2',
    title: 'Examens du semestre 3 : planning publié',
    content:
      'Le calendrier officiel des examens du semestre 3 est disponible. Consultez votre emploi du temps et présentez-vous 15 minutes avant le début de chaque épreuve avec votre carte étudiant.',
    category: 'Examens',
    isPinned: true,
    authorName: 'Coordination pédagogique',
    publishedAt: '2026-11-07T10:00:00Z',
    expiresAt: '2026-12-15T23:59:00Z',
  },
  {
    id: 'a3',
    title: 'La plateforme accepte désormais vos contributions',
    content:
      "Étudiants et professeurs peuvent soumettre cours, TD, TP, corrigés et résumés. Chaque document est vérifié par l'administration avant publication. Merci de respecter les droits d'auteur.",
    category: 'Communauté',
    isPinned: true,
    authorName: 'Équipe FPK Academic Hub',
    publishedAt: '2026-11-01T12:00:00Z',
    expiresAt: null,
  },
]

export function getMockField(fieldSlug: string) {
  return academicFields.find((field) => field.slug === fieldSlug) ?? null
}

export function getMockSemesters(fieldSlug: string) {
  return mockSemesters
    .filter((semester) => semester.fieldSlug === fieldSlug)
    .sort(
      (a, b) =>
        SEMESTER_ORDER.indexOf(a.slug) - SEMESTER_ORDER.indexOf(b.slug),
    )
}

export function getMockSemester(
  fieldSlug: string,
  semesterSlug: string,
): Semester | null {
  return (
    mockSemesters.find(
      (semester) =>
        semester.fieldSlug === fieldSlug && semester.slug === semesterSlug,
    ) ?? null
  )
}

export function getMockModules(semesterId: string) {
  return mockModulesBySemesterId.get(semesterId) ?? []
}

export function getMockModule(moduleId: string): AcademicModule | null {
  return mockModules.find((module) => module.id === moduleId) ?? null
}

export function getMockResources(moduleId: string) {
  return mockResources.filter((resource) => resource.moduleId === moduleId)
}

export const mockSubmissions: Submission[] = [
  {
    id: 's1',
    title: 'TP — Programmation orientée objet en Java (séance 5)',
    category: 'TP',
    status: 'PENDING_REVIEW',
    academicYear: '2025/2026',
    professorName: 'Pr. El Amrani',
    fileSize: 1_310_720,
    fileUrl: '#',
    createdAt: '2026-11-10T09:12:00Z',
    moduleName: 'Programmation orientée objet',
    moduleCode: 'INF301',
    semesterName: 'S3',
    fieldName: 'Informatique',
  },
  {
    id: 's2',
    title: 'Série de TD n°2 — Limites et continuité',
    category: 'TD',
    status: 'PENDING',
    academicYear: '2025/2026',
    professorName: 'Pr. Benali',
    fileSize: 812_544,
    fileUrl: '#',
    createdAt: '2026-11-08T17:40:00Z',
    moduleName: 'Analyse 1',
    moduleCode: 'MAT101',
    semesterName: 'S1',
    fieldName: 'Mathématiques et Informatique',
  },
  {
    id: 's3',
    title: 'Résumé — Algèbre linéaire (chapitres 6 à 9)',
    category: 'RESUMES',
    status: 'APPROVED',
    academicYear: '2025/2026',
    professorName: null,
    fileSize: 645_120,
    fileUrl: '#',
    createdAt: '2026-11-02T14:05:00Z',
    moduleName: 'Algèbre linéaire',
    moduleCode: 'MAT102',
    semesterName: 'S1',
    fieldName: 'Mathématiques et Informatique',
  },
  {
    id: 's4',
    title: 'Examen — Analyse 2 (session 2024, scan de mauvaise qualité)',
    category: 'EXAMS',
    status: 'REJECTED',
    academicYear: '2024/2025',
    professorName: 'Pr. Benali',
    fileSize: 2_201_088,
    fileUrl: '#',
    createdAt: '2026-10-25T11:30:00Z',
    moduleName: 'Analyse 2',
    moduleCode: 'MAT202',
    semesterName: 'S2',
    fieldName: 'Mathématiques et Informatique',
  },
]

export function getMockSubmissions(): Submission[] {
  return mockSubmissions
}

export const mockPendingResources: PendingResource[] = [
  {
    id: 'p1',
    title: "Cours — Développement web : introduction à React (chapitre 1)",
    category: 'COURS',
    status: 'PENDING_REVIEW',
    academicYear: '2025/2026',
    professorName: null,
    fileSize: 3_674_112,
    fileUrl: '#',
    createdAt: '2026-11-10T15:20:00Z',
    moduleId: 'informatique-s3-inf302',
    moduleTitle: 'Développement web',
    moduleCode: 'INF302',
    semesterName: 'S3',
    fieldName: 'Informatique',
    uploaderName: 'Youssef B.',
  },
  {
    id: 'p2',
    title: 'Correction — Examen de Probabilités (session principale)',
    category: 'CORRECTIONS',
    status: 'PENDING_REVIEW',
    academicYear: '2025/2026',
    professorName: 'Pr. Benali',
    fileSize: 1_048_576,
    fileUrl: '#',
    createdAt: '2026-11-09T18:45:00Z',
    moduleId: 'mathematiques-et-informatique-s2-mat201',
    moduleTitle: 'Probabilités et statistiques',
    moduleCode: 'MAT201',
    semesterName: 'S2',
    fieldName: 'Mathématiques et Informatique',
    uploaderName: 'Salma E.',
  },
  {
    id: 'p3',
    title: 'Résumé — Réseaux informatiques (couche réseau)',
    category: 'RESUMES',
    status: 'PENDING',
    academicYear: '2025/2026',
    professorName: null,
    fileSize: 512_000,
    fileUrl: '#',
    createdAt: '2026-11-08T10:05:00Z',
    moduleId: 'informatique-s5-inf501',
    moduleTitle: 'Réseaux informatiques',
    moduleCode: 'INF501',
    semesterName: 'S5',
    fieldName: 'Informatique',
    uploaderName: 'Omar K.',
  },
]

export function getMockPendingResources(): PendingResource[] {
  return mockPendingResources
}

export function getMockAdminStats(): AdminStats {
  return {
    totalResources: 263,
    pendingReviews: mockPendingResources.length,
    totalStudents: 412,
  }
}

export function getMockAdminAnnouncements(): Announcement[] {
  return [
    ...mockAnnouncements,
    {
      id: 'a4',
      title: 'Bibliothèque : horaires étendus pendant les examens',
      content:
        "La bibliothèque universitaire reste ouverte jusqu'à 22h du lundi au samedi pendant toute la période d'examens.",
      category: 'Administration',
      isPinned: false,
      authorName: 'Administration FPK',
      publishedAt: '2026-10-28T09:00:00Z',
      expiresAt: null,
    },
  ]
}

export function getMockTimetable(semesterId: string): Timetable | null {
  return mockTimetables[semesterId] ?? null
}
