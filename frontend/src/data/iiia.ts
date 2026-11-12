import type {
  AdminModule,
  AdminResource,
  AdminTimetable,
  IIIAAnnouncement,
  IIIAModule,
  IIIAResource,
  IIIASemester,
} from '@/types/iiia'

export const IIIA_SEMESTERS: IIIASemester[] = [
  { id: 'sem-s1', slug: 'S1', label: 'S1', level: 'LICENCE', moduleCount: 3, resourceCount: 12 },
  { id: 'sem-s2', slug: 'S2', label: 'S2', level: 'LICENCE', moduleCount: 3, resourceCount: 14 },
  { id: 'sem-s3', slug: 'S3', label: 'S3', level: 'LICENCE', moduleCount: 3, resourceCount: 16 },
  { id: 'sem-s4', slug: 'S4', label: 'S4', level: 'LICENCE', moduleCount: 3, resourceCount: 15 },
  { id: 'sem-s5', slug: 'S5', label: 'S5', level: 'LICENCE', moduleCount: 3, resourceCount: 18 },
  { id: 'sem-s6', slug: 'S6', label: 'S6', level: 'LICENCE', moduleCount: 3, resourceCount: 17 },
  { id: 'sem-ms1', slug: 'MS1', label: 'MS1', level: 'MASTER', moduleCount: 3, resourceCount: 13 },
  { id: 'sem-ms2', slug: 'MS2', label: 'MS2', level: 'MASTER', moduleCount: 3, resourceCount: 11 },
  { id: 'sem-ms3', slug: 'MS3', label: 'MS3', level: 'MASTER', moduleCount: 2, resourceCount: 9 },
  { id: 'sem-ms4', slug: 'MS4', label: 'MS4', level: 'MASTER', moduleCount: 1, resourceCount: 6 },
]

interface ModuleSeed {
  code: string
  title: string
  description: string
  semester: string
  counts: Record<string, number>
}

const MODULE_SEEDS: ModuleSeed[] = [
  { code: 'INF101', title: 'Introduction à la programmation', description: 'Bases de la programmation structurée : variables, conditions, boucles et fonctions.', semester: 'S1', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF102', title: 'Algorithmique et structures de données', description: 'Listes, piles, files, arbres, graphes et complexité algorithmique.', semester: 'S1', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'MAT101', title: 'Mathématiques pour l’informatique', description: 'Logique, ensembles, relations et raisonnement mathématique.', semester: 'S1', counts: { COURS: 2, EXAMS: 1 } },

  { code: 'INF201', title: 'Architecture des ordinateurs', description: 'Processeurs, mémoires, représentation de l’information et assembleur.', semester: 'S2', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF202', title: 'Systèmes logiques et booléens', description: 'Algèbre booléenne, circuits combinatoires et séquentiels.', semester: 'S2', counts: { COURS: 2, TD: 1 } },
  { code: 'MAT201', title: 'Analyse 2', description: 'Suites, séries, intégrales et équations différentielles usuelles.', semester: 'S2', counts: { COURS: 2, EXAMS: 1, TP: 1 } },

  { code: 'INF301', title: 'Programmation orientée objet', description: 'Classes, héritage, polymorphisme et conception orientée objet en Java.', semester: 'S3', counts: { COURS: 2, TD: 2, TP: 1 } },
  { code: 'INF302', title: 'Développement web', description: 'HTML, CSS, JavaScript et introduction aux frameworks front-end.', semester: 'S3', counts: { COURS: 2, TD: 1, TP: 2 } },
  { code: 'INF303', title: 'Bases de données', description: 'Modèle relationnel, SQL, normalisation et transactions.', semester: 'S3', counts: { COURS: 2, TD: 1, TP: 1 } },

  { code: 'INF401', title: 'Systèmes d’exploitation', description: 'Processus, threads, ordonnancement, mémoire et systèmes de fichiers.', semester: 'S4', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF402', title: 'Réseaux informatiques', description: 'Modèle OSI/TCP-IP, protocoles de transport et programmation réseau.', semester: 'S4', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF403', title: 'Génie logiciel', description: 'Cycle de vie, méthodologies agiles, UML et gestion de projet.', semester: 'S4', counts: { COURS: 2, TD: 1 } },

  { code: 'INF501', title: 'Compilation', description: 'Analyse lexicale, syntaxique et sémantique, génération de code.', semester: 'S5', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF502', title: 'Intelligence artificielle', description: 'Recherche heuristique, logique et apprentissage automatique.', semester: 'S5', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF503', title: 'Probabilités et statistiques', description: 'Variables aléatoires, lois usuelles et statistique descriptive.', semester: 'S5', counts: { COURS: 2, TD: 1, EXAMS: 1 } },

  { code: 'INF601', title: 'Sécurité informatique', description: 'Cryptographie, vulnérabilités et bonnes pratiques de sécurisation.', semester: 'S6', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF602', title: 'Big Data et systèmes distribués', description: 'Écosystème Hadoop/Spark, traitement distribué et architectures à grande échelle.', semester: 'S6', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF603', title: 'Projet de fin d’études', description: 'Conception et réalisation d’un projet complet en équipe.', semester: 'S6', counts: { TD: 1, EXAMS: 1 } },

  { code: 'INF-M1-01', title: 'Apprentissage automatique avancé', description: 'Modèles supervisés et non supervisés, évaluation et sélection de modèles.', semester: 'MS1', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF-M1-02', title: 'Ingénierie logicielle avancée', description: 'Architecture logicielle, patterns, tests et intégration continue.', semester: 'MS1', counts: { COURS: 2, TD: 1 } },
  { code: 'INF-M1-03', title: 'Recherche opérationnelle', description: 'Optimisation linéaire, programmation dynamique et heuristiques.', semester: 'MS1', counts: { COURS: 2, TP: 1 } },

  { code: 'INF-M2-01', title: 'Apprentissage profond', description: 'Réseaux de neurones, vision par ordinateur et traitement du langage.', semester: 'MS2', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF-M2-02', title: 'Ingénierie des données', description: 'Pipelines ETL, data lakes et gouvernance des données.', semester: 'MS2', counts: { COURS: 2, TP: 1 } },
  { code: 'INF-M2-03', title: 'Stage et mémoire', description: 'Stage long et soutenance en entreprise ou en laboratoire.', semester: 'MS2', counts: { TD: 1, EXAMS: 1 } },

  { code: 'INF-M3-01', title: 'Systèmes distribués avancés', description: 'Microservices, files de messages et cohérence distribuée.', semester: 'MS3', counts: { COURS: 2, TD: 1, TP: 1 } },
  { code: 'INF-M3-02', title: 'Vision par ordinateur', description: 'Traitement d’images, détection d’objets et reconnaissance.', semester: 'MS3', counts: { COURS: 2, TP: 1 } },

  { code: 'INF-M4-01', title: 'Projet de fin d’études', description: 'Projet de recherche appliquée et soutenance publique.', semester: 'MS4', counts: { COURS: 1, EXAMS: 1 } },
]

export const IIIA_MODULES: IIIAModule[] = MODULE_SEEDS.map((seed) => {
  const semester = IIIA_SEMESTERS.find((s) => s.slug === seed.semester)
  return {
    id: `mod-${seed.code.toLowerCase()}`,
    title: seed.title,
    code: seed.code,
    description: seed.description,
    semesterSlug: seed.semester,
    semesterName: semester?.label ?? seed.semester,
    resourceCount: Object.values(seed.counts).reduce((sum, n) => sum + n, 0),
    counts: seed.counts,
  }
})

export const IIIA_RESOURCES: IIIAResource[] = IIIA_MODULES.flatMap((module) => {
  const items: IIIAResource[] = []
  let index = 0

  for (const [category, count] of Object.entries(module.counts)) {
    for (let n = 0; n < count; n++) {
      index += 1
      const isExam = category === 'EXAMS'
      items.push({
        id: `res-${module.code.toLowerCase()}-${index}`,
        moduleId: module.id,
        title: isExam
          ? `Examen ${module.title} — session ${n + 1}`
          : `${module.title} — ${category === 'COURS' ? 'Cours' : category === 'TD' ? 'Travaux dirigés' : 'Travaux pratiques'} ${n + 1}`,
        category: category as IIIAResource['category'],
        academicYear: '2025/2026',
        professorName: n % 2 === 0 ? 'Pr. El Amrani' : 'Pr. Benali',
        fileSize: 480_000 + index * 137_000,
        fileUrl: '#',
        uploadedAt: new Date(Date.UTC(2026, 9, 20 - (index % 18))).toISOString(),
      })
    }
  }

  return items
})

export const IIIA_ANNOUNCEMENTS: IIIAAnnouncement[] = [
  {
    id: 'a1',
    title: 'Examens du semestre 3 — planning publié',
    content:
      'Le calendrier officiel des examens du semestre IIIA est disponible. Présentez-vous 15 minutes avant chaque épreuve avec votre carte étudiant.',
    category: 'EXAMEN',
    isPinned: true,
    authorName: 'Coordination pédagogique',
    publishedAt: '2026-11-07T10:00:00Z',
    expiresAt: '2026-12-15T23:59:00Z',
  },
  {
    id: 'a2',
    title: 'Ouverture des inscriptions Master IIIA (M1 & M2)',
    content:
      'Les inscriptions aux cycles Master Génie Informatique et IA sont ouvertes sur la plateforme du campus jusqu’au 30 novembre.',
    category: 'ADMINISTRATIF',
    isPinned: true,
    authorName: 'Administration FPK',
    publishedAt: '2026-11-09T08:00:00Z',
    expiresAt: '2026-11-30T23:59:00Z',
  },
  {
    id: 'a3',
    title: 'Soutenances de projets de fin d’études — MS4',
    content:
      'Le calendrier des soutenances de projets de fin d’études MS4 est affiché au département. Vérifiez votre créneau attribué.',
    category: 'PEDAGOGIQUE',
    isPinned: false,
    authorName: 'Département IIIA',
    publishedAt: '2026-10-28T09:00:00Z',
    expiresAt: '2026-12-20T23:59:00Z',
  },
]

export const IIIA_ADMIN_RESOURCES: AdminResource[] = IIIA_RESOURCES.map(
  (resource) => {
    const module = IIIA_MODULES.find((m) => m.id === resource.moduleId)
    return {
      id: resource.id,
      title: resource.title,
      category: resource.category,
      status: 'APPROVED',
      academicYear: resource.academicYear,
      professorName: resource.professorName,
      fileSize: resource.fileSize,
      fileUrl: resource.fileUrl,
      moduleId: resource.moduleId,
      moduleTitle: module?.title ?? null,
      moduleCode: module?.code ?? null,
      semesterName: module?.semesterName ?? null,
      createdAt: resource.uploadedAt,
    }
  },
)

export const IIIA_ADMIN_TIMETABLES: AdminTimetable[] = IIIA_SEMESTERS.map(
  (semester) => ({
    id: `tt-${semester.slug.toLowerCase()}`,
    semesterId: semester.id,
    semesterName: semester.label,
    academicYear: '2025/2026',
    fileUrl: `timetables/${semester.slug.toLowerCase()}.pdf`,
    updatedAt: new Date(Date.UTC(2026, 9, 5)).toISOString(),
  }),
)

export const IIIA_ADMIN_MODULES: AdminModule[] = IIIA_MODULES.map((module) => ({
  id: module.id,
  title: module.title,
  code: module.code,
  description: module.description,
  semesterId:
    IIIA_SEMESTERS.find((s) => s.slug === module.semesterSlug)?.id ?? '',
  semesterName: module.semesterName,
  semesterSlug: module.semesterSlug,
  resourceCount: module.resourceCount,
}))

export function getMockSemesters(): IIIASemester[] {
  return IIIA_SEMESTERS
}

export function getMockModules(semesterSlug: string): IIIAModule[] {
  return IIIA_MODULES.filter((module) => module.semesterSlug === semesterSlug)
}

export function getMockModuleResources(moduleId: string): IIIAResource[] {
  return IIIA_RESOURCES.filter((resource) => resource.moduleId === moduleId)
}
