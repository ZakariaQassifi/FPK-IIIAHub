export type Locale = 'fr' | 'en'

export const LOCALES: Locale[] = ['fr', 'en']

export const LOCALE_LABELS: Record<Locale, string> = {
  fr: 'FR',
  en: 'EN',
}

const fr = {
  'nav.home': 'Accueil',
  'nav.library': 'Bibliothèque',
  'nav.about': 'À propos',
  'nav.signIn': 'Se connecter',
  'nav.signOut': 'Déconnexion',
  'nav.menu': 'Menu',
  'nav.dismiss': 'Fermer',
  'nav.language': 'Langue',

  'hero.eyebrow': 'Génie Informatique et IA · FPK Khouribga',
  'hero.title': 'Le référentiel académique',
  'hero.titleAccent': 'réservé à la filière IIIA.',
  'hero.subtitle':
    'Cours, TD, TP, examens et corrigés du département Génie Informatique et Intelligence Artificielle. Une source unique, vérifiée et éditorialisée pour les étudiants de la FPK.',
  'hero.ctaPrimary': 'Accéder à la bibliothèque',
  'hero.ctaSecondary': 'Voir les annonces',
  'hero.statResources': 'Ressources',
  'hero.statModules': 'Modules',
  'hero.statSemesters': 'Semestres',
  'hero.statProgram': 'Filière',

  'announcements.title': 'Annonces officielles',
  'announcements.subtitle': 'Communiqués épinglés du département IIIA.',
  'announcements.empty': 'Aucune annonce épinglée pour le moment.',
  'announcements.validUntil': "— valable jusqu'au",

  'cta.title': 'Accédez à la bibliothèque IIIA',
  'cta.subtitle':
    'Parcourez tous les semestres de la licence et du master, et téléchargez les ressources de votre choix.',
  'cta.button': 'Explorer les semestres',

  'library.badge': 'Bibliothèque IIIA',
  'library.title': 'Choisissez votre semestre',
  'library.description':
    'Parcourez les ressources pédagogiques du département Génie Informatique et Intelligence Artificielle, organisées par semestre de la licence au master.',

  'semester.back': 'Retour à la bibliothèque',
  'semester.separator': 'Ressources',
  'semester.licence': 'Licence',
  'semester.master': 'Master',
  'semester.title': 'Semestre {semester}',
  'semester.count':
    '{count} ressources pédagogiques disponibles pour le semestre {semester}.',
  'semester.empty':
    'Aucune ressource publiée pour ce semestre pour le moment.',
  'semester.timetableTitle': 'Emploi du temps',
  'semester.timetableDescription': 'Consultez l’emploi du temps officiel du semestre.',
  'semester.timetablePreview': 'Prévisualiser',
  'semester.timetableCategory': 'Emploi du temps',
  'semester.modulesSeparator': 'Modules',
  'semester.modulesDescription':
    'Sélectionnez un module pour consulter ses cours, travaux dirigés, travaux pratiques et examens.',
  'semester.noModules':
    'Aucun module n’est encore publié pour ce semestre.',

  'module.back': 'Retour aux modules',
  'module.title': 'Ressources du module',
  'module.separator': 'Ressources',
  'module.empty': 'Aucune ressource publiée pour ce module pour le moment.',
  'module.sectionEmpty': 'Aucune ressource disponible',

  'semesterCard.title': 'Semestre {label}',

  'category.COURS': 'Cours',
  'category.TD': 'TD',
  'category.TP': 'TP',
  'category.TD_TP': 'TD & TP',
  'category.EXAMS': 'Examens',
  'category.CORRECTIONS': 'Corrigés',
  'category.OTHERS': 'Autres',

  'resource.download': 'Télécharger',
  'resource.professorUnknown': 'Non spécifié',

  'admin.title': 'Administration',
  'admin.subtitle':
    'Modération, publication de ressources, emplois du temps et annonces officielles.',
  'contribute.navLabel': 'Contribuer',
  'contribute.eyebrow': 'Vieuvre etudiants',
  'contribute.backHome': 'Retour a l’accueil',
  'contribute.whyTitle': 'Pourquoi contribuer ?',
  'contribute.whyPoint1':
    'Partagez vos resumes, fiches de revision et supports de cours avec vos camarades.',
  'contribute.whyPoint2':
    'Ajoutez les sujets d’examens des annees precedentes pour aider les promotions futures.',
  'contribute.whyPoint3':
    'Documentez le travail de votre semestre : TD, TP, projets et materiels d’etude.',
  'contribute.processTitle': 'Comment ca se passe',
  'contribute.processStep1':
    'Vous envoyez un document avec le semestre et le module concernes.',
  'contribute.processStep2':
    'Un administrateur verifie le contenu, la qualite et les droits d’auteur.',
  'contribute.processStep3':
    'Le document est publie dans la bibliotheque et visible par toute la promotion.',
  'contribute.rulesTitle': 'Avant de publier',
  'contribute.rules':
    'Ne partagez que des documents dont vous detenez les droits. Les resumes, corriges et supports pedagogiques sont les bienvenus ; les documents tiers soumis a droits d’auteur ne le sont pas.',
  'contribute.formTitle': 'Votre contribution',
  'contribute.emailHint': 'Une adresse universitaire nous permet de vous recontacter.',
  'contribute.noModules': 'Aucun module publie pour ce semestre.',
  'contribute.errorFormat':
    'Format non supporte : envoyez un fichier PDF ou une image.',
  'contribute.errorSize':
    'Fichier trop volumineux : la taille maximale est de 25 Mo.',
  'contribute.title': 'Contribuer a la bibliotheque',
  'contribute.subtitle': 'Partagez un document avec la communaute IIIA.',
  'contribute.close': 'Fermer',
  'contribute.fieldTitle': 'Titre du document',
  'contribute.fieldCategory': 'Categorie',
  'contribute.fieldSemester': 'Semestre cible',
  'contribute.fieldModule': 'Module cible',
  'contribute.fieldName': 'Votre nom',
  'contribute.fieldEmail': 'Votre e-mail',
  'contribute.fieldAcademicYear': 'Annee academique',
  'contribute.fieldFile': 'Fichier (PDF ou image, 25 Mo max)',
  'contribute.titlePlaceholder': 'Ex : Fiche de revision - Complexite algorithmique',
  'contribute.namePlaceholder': 'Prenom Nom',
  'contribute.selectSemester': 'Selectionner un semestre...',
  'contribute.selectSemesterFirst': "Choisissez d'abord un semestre",
  'contribute.selectModule': 'Selectionner un module...',
  'contribute.submit': 'Envoyer pour validation',
  'contribute.submitting': 'Envoi en cours...',
  'contribute.disclaimer':
    'Votre document sera envoye a un administrateur pour verification avant d’etre publie dans la bibliotheque. Merci de ne partager que des documents dont vous etes le titulaire des droits.',
  'contribute.success': 'Merci ! « {title} » a ete envoye et sera publie apres validation.',
  'contribute.errorSemester': 'Veuillez selectionner un semestre.',
  'contribute.errorModule': 'Veuillez selectionner un module.',
  'contribute.errorTitle': 'Le titre doit contenir au moins 3 caracteres.',
  'contribute.errorContributor': 'Indiquez votre nom ou votre adresse e-mail.',
  'contribute.errorFile': 'Veuillez choisir un fichier.',
  'contribute.errorGeneric': 'Envoi impossible. Reessayez plus tard.',

  'admin.queueEmpty': 'Aucun document en attente',
  'admin.queueEmptyDescription':
    'Les contributions des etudiants apparaitront ici avant publication.',
  'admin.queueLoadError': 'Impossible de charger la file d’attente',
  'admin.view': 'Voir',
  'admin.anonymous': 'Contributeur anonyme',
  'admin.previewDownload': 'Previsualiser',
  'admin.approve': 'Accepter',
  'admin.reject': 'Refuser',
  'admin.approveConfirm': 'Publier « {title} » dans la bibliotheque ?',
  'admin.rejectConfirm': 'Refuser et supprimer « {title} » ?',
  'admin.submittedOn': 'Envoye le {date}',
  'admin.errorGeneric': 'Une erreur est survenue.',
  'admin.tabQueue': 'File d’attente',
  'admin.tabModules': 'Modules',

  'admin.modules.addTitle': 'Ajouter un module',
  'admin.modules.addDescription':
    'Créez les modules d’un semestre. Un semestre accepte au maximum 7 modules.',
  'admin.modules.fieldName': 'Nom du module',
  'admin.modules.namePlaceholder': 'Ex : Bases de données',
  'admin.modules.add': 'Ajouter le module',
  'admin.modules.creating': 'Création…',
  'admin.modules.created': 'Module créé avec succès.',
  'admin.modules.updated': 'Module mis à jour avec succès.',
  'admin.modules.deleted': 'Module supprimé.',
  'admin.modules.deletedWithResources':
    'Module supprimé avec {count} ressource(s) associée(s).',
  'admin.modules.nameTooShort':
    'Le nom du module doit contenir au moins 3 caractères.',
  'admin.modules.selectSemesterError': 'Veuillez d’abord sélectionner un semestre.',
  'admin.modules.limitReached':
    'Limite atteinte : ce semestre contient déjà {limit} modules. Supprimez-en un avant d’en ajouter un autre.',
  'admin.modules.limitHint':
    'Ce semestre a atteint la limite de {limit} modules.',
  'admin.modules.counter': '{used} / {limit} modules utilisés',
  'admin.modules.tableTitle': 'Modules',
  'admin.modules.tableFiltered':
    'Modules du semestre sélectionné.',
  'admin.modules.tableAll': 'Tous les modules de la filière IIIA.',
  'admin.modules.countForSemester': '{count} module(s)',
  'admin.modules.countAll': '{count} au total',
  'admin.modules.tableSemester': 'Semestre',
  'admin.modules.tableName': 'Module',
  'admin.modules.tableResources': 'Ressources',
  'admin.modules.tableActions': 'Actions',
  'admin.modules.emptySemester': 'Aucun module dans ce semestre.',
  'admin.modules.emptyAll': 'Aucun module créé pour le moment.',
  'admin.modules.editTitle': 'Renommer le module',
  'admin.modules.editDescription':
    'Le code du module reste inchangé ; seules les ressources lui sont rattachées.',
  'admin.modules.deleteConfirm': 'Supprimer le module « {title} » ?',
  'admin.modules.genericError': 'Une erreur est survenue.',

  'admin.tabResources': 'Ressources',
  'admin.tabTimetables': 'Emplois du temps',
  'admin.tabAnnouncements': 'Annonces',
  'admin.statResources': 'Ressources totales',
  'admin.statPending': 'En attente de validation',
  'admin.statStudents': 'Étudiants inscrits',

  'admin.uploadResourceTitle': 'Publier une ressource',
  'admin.uploadResourceDescription':
    'Choisissez le semestre, le module, la catégorie puis téléversez le document PDF. La ressource est publiée immédiatement.',
  'admin.fieldSemester': 'Semestre',
  'admin.fieldModule': 'Module',
  'admin.fieldCategory': 'Catégorie',
  'admin.fieldTitle': 'Titre du document',
  'admin.fieldAcademicYear': 'Année académique',
  'admin.fieldFile': 'Fichier PDF (25 Mo max)',
  'admin.moduleExisting': 'Choisir un module',
  'admin.moduleNew': 'Nouveau module',
  'admin.moduleNamePlaceholder': 'Nom du nouveau module',
  'admin.moduleCodePlaceholder': 'Code (ex : INF404)',
  'admin.selectSemester': 'Sélectionner un semestre…',
  'admin.selectSemesterFirst': 'Choisissez d’abord un semestre',
  'admin.selectModule': 'Sélectionner un module…',
  'admin.loading': 'Chargement…',
  'admin.titlePlaceholder': 'Ex : Cours 3 — Chapitre 1 : Introduction',
  'admin.publishResource': 'Publier la ressource',
  'admin.uploading': 'Envoi en cours…',
  'admin.uploadSuccess':
    'Ressource publiée avec succès. Les étudiants ont été notifiés par e-mail.',

  'admin.uploadTimetableTitle': 'Publier un emploi du temps',
  'admin.uploadTimetableDescription':
    'Le fichier remplace l’emploi du temps existant du semestre pour l’année sélectionnée.',
  'admin.publishTimetable': 'Mettre en ligne',
  'admin.timetableSuccess': 'Emploi du temps mis en ligne avec succès.',
  'admin.publishedTimetables': 'Emplois du temps publiés',
  'admin.noTimetables': 'Aucun emploi du temps publié pour le moment.',
  'admin.deleteTimetableConfirm': 'Supprimer l’emploi du temps « {label} » ?',

  'admin.publishedResources': 'Ressources publiées',
  'admin.publishedResourcesDescription':
    'Toutes les ressources en ligne. Vous pouvez modifier leurs métadonnées ou les supprimer.',
  'admin.noResources': 'Aucune ressource publiée pour le moment.',
  'admin.editResource': 'Modifier la ressource',
  'admin.deleteResourceConfirm': 'Supprimer « {title} » définitivement ?',

  'admin.edit': 'Modifier',
  'admin.delete': 'Supprimer',
  'admin.save': 'Enregistrer',
  'admin.saving': 'Enregistrement…',
  'admin.cancel': 'Annuler',

  'about.title': 'À propos',
  'about.kicker':
    'Initiative Indépendante • Par un étudiant, pour les étudiants',
  'about.missionTitle': 'Notre mission',
  'about.missionBody1':
    'FPK IIIA Academic Hub est un référentiel académique centralisé, créé pour aider les étudiants du département Génie Informatique et Intelligence Artificielle (IIIA) de la Faculté Polydisciplinaire de Khouribga à accéder rapidement et facilement à leurs cours, TD, TP et examens.',
  'about.missionBody2':
    'Notre objectif est simple : rassembler en un seul endroit les ressources pédagogiques essentielles, vérifiées et organisées par semestre, afin que chaque étudiant puisse se concentrer sur l’apprentissage plutôt que sur la recherche de documents.',
  'about.featuresTitle': 'Ce que vous trouverez ici',
  'about.feature.cours.title': 'Cours',
  'about.feature.cours.description': 'Supports de cours et modules par semestre',
  'about.feature.td_tp.title': 'TD & TP',
  'about.feature.td_tp.description':
    'Séances dirigées et travaux pratiques',
  'about.feature.exams.title': 'Examens & Corrigés',
  'about.feature.exams.description':
    "Sujets d'examens et corrigés associés",
  'about.feature.timetables.title': 'Emplois du temps',
  'about.feature.timetables.description':
    'Calendriers académiques par semestre',
  'about.feature.announcements.title': 'Annonces',
  'about.feature.announcements.description':
    'Communiqués officiels du département',
  'about.cta': 'Accéder à la bibliothèque',

  'footer.description':
    'Référentiel académique centralisé pour les étudiants en Génie Informatique et Intelligence Artificielle de la FPK.',
  'footer.navigationTitle': 'Navigation académique',
  'footer.levelsTitle': "Niveaux d'études",
  'footer.aboutTitle': 'À propos & mentions',
  'footer.creditsTitle': 'Crédits',
  'footer.creditsText':
    'Développé avec soin pour la communauté IIIA.',
  'footer.disclaimer.initiative': 'Initiative étudiante',
  'footer.disclaimer.byStudent': 'Par un étudiant, pour les étudiants',
  'footer.disclaimer.unofficial': 'Non-officiel',
  'footer.level.licence': 'Licence IIIA (S1 - S6)',
  'footer.level.master': 'Master IIIA (MS1 - MS4)',
  'footer.level.timetables': 'Emplois du temps',
  'footer.level.announcements': 'Annonces',
  'footer.copyright':
    '© 2026 FPK IIIA Academic Hub. Tous droits réservés.',
  'footer.country': 'Morocco',
  'footer.independent': 'Projet Indépendant',
  'footer.zexter': 'Zexter Team',
}

const en: typeof fr = {
  'nav.home': 'Home',
  'nav.library': 'Library',
  'nav.about': 'About',
  'nav.signIn': 'Sign in',
  'nav.signOut': 'Sign out',
  'nav.menu': 'Menu',
  'nav.dismiss': 'Close',
  'nav.language': 'Language',

  'hero.eyebrow': 'Computer Engineering & AI · FPK Khouribga',
  'hero.title': 'The academic repository',
  'hero.titleAccent': 'built for the IIIA program.',
  'hero.subtitle':
    'Lectures, tutorials, labs, exams and solutions from the Computer Engineering & Artificial Intelligence department. A single, verified and curated source for FPK students.',
  'hero.ctaPrimary': 'Access the library',
  'hero.ctaSecondary': 'View announcements',
  'hero.statResources': 'Resources',
  'hero.statModules': 'Modules',
  'hero.statSemesters': 'Semesters',
  'hero.statProgram': 'Program',

  'announcements.title': 'Official announcements',
  'announcements.subtitle': 'Pinned notices from the IIIA department.',
  'announcements.empty': 'No pinned announcement at the moment.',
  'announcements.validUntil': '— valid until',

  'cta.title': 'Access the IIIA library',
  'cta.subtitle':
    'Browse every semester of the undergraduate and master programs, and download the resources you need.',
  'cta.button': 'Explore semesters',

  'library.badge': 'IIIA Library',
  'library.title': 'Choose your semester',
  'library.description':
    'Browse the teaching resources of the Computer Engineering & Artificial Intelligence department, organised by semester from undergraduate to master.',

  'semester.back': 'Back to the library',
  'semester.separator': 'Resources',
  'semester.licence': 'Undergraduate',
  'semester.master': 'Master',
  'semester.title': 'Semester {semester}',
  'semester.count':
    '{count} teaching resources available for semester {semester}.',
  'semester.empty':
    'No resource has been published for this semester yet.',
  'semester.timetableTitle': 'Timetable',
  'semester.timetableDescription': 'Browse the official timetable of the semester.',
  'semester.timetablePreview': 'Preview',
  'semester.timetableCategory': 'Timetable',
  'semester.modulesSeparator': 'Modules',
  'semester.modulesDescription':
    'Select a module to browse its lectures, tutorials, practical works and exams.',
  'semester.noModules': 'No module has been published for this semester yet.',

  'module.back': 'Back to modules',
  'module.title': 'Module resources',
  'module.separator': 'Resources',
  'module.empty': 'No resource has been published for this module yet.',
  'module.sectionEmpty': 'No resource available yet.',

  'semesterCard.title': 'Semester {label}',

  'category.COURS': 'Lectures',
  'category.TD': 'TD',
  'category.TP': 'TP',
  'category.TD_TP': 'TS&PW',
  'category.EXAMS': 'Exams',
  'category.CORRECTIONS': 'Solutions',
  'category.OTHERS': 'Others',

  'resource.download': 'Download',
  'resource.professorUnknown': 'Not specified',

  'admin.title': 'Administration',
  'admin.subtitle':
    'Moderation, resource publishing, timetables and official announcements.',
  'contribute.navLabel': 'Contribute',
  'contribute.eyebrow': 'Student life',
  'contribute.backHome': 'Back to home',
  'contribute.whyTitle': 'Why contribute?',
  'contribute.whyPoint1':
    'Share your revision sheets, cheat sheets and lecture notes with your classmates.',
  'contribute.whyPoint2':
    'Add past exam papers so future cohorts can prepare with real questions.',
  'contribute.whyPoint3':
    'Document your semester work: tutorials, labs, projects and study material.',
  'contribute.processTitle': 'How it works',
  'contribute.processStep1':
    'You send a document along with the target semester and module.',
  'contribute.processStep2':
    'An administrator reviews the content, its quality and the copyright.',
  'contribute.processStep3':
    'The document is published in the library and visible to the whole cohort.',
  'contribute.rulesTitle': 'Before you publish',
  'contribute.rules':
    'Only share material you hold the rights to. Revision sheets, solutions and teaching material are welcome; third-party documents under copyright are not.',
  'contribute.formTitle': 'Your contribution',
  'contribute.emailHint': 'A university address lets us get back to you.',
  'contribute.noModules': 'No module published for this semester.',
  'contribute.errorFormat':
    'Unsupported format: please upload a PDF file or an image.',
  'contribute.errorSize':
    'File too large: the maximum size is 25 MB.',
  'contribute.title': 'Contribute to the library',
  'contribute.subtitle': 'Share a document with the IIIA community.',
  'contribute.close': 'Close',
  'contribute.fieldTitle': 'Document title',
  'contribute.fieldCategory': 'Category',
  'contribute.fieldSemester': 'Target semester',
  'contribute.fieldModule': 'Target module',
  'contribute.fieldName': 'Your name',
  'contribute.fieldEmail': 'Your email',
  'contribute.fieldAcademicYear': 'Academic year',
  'contribute.fieldFile': 'File (PDF or image, 25 MB max)',
  'contribute.titlePlaceholder': 'E.g. Revision sheet - Algorithm complexity',
  'contribute.namePlaceholder': 'First Last',
  'contribute.selectSemester': 'Select a semester...',
  'contribute.selectSemesterFirst': 'Pick a semester first',
  'contribute.selectModule': 'Select a module...',
  'contribute.submit': 'Submit for review',
  'contribute.submitting': 'Submitting...',
  'contribute.disclaimer':
    'Your document is sent to an administrator for verification before being published in the library. Please only share material you hold the rights to.',
  'contribute.success': 'Thank you! “{title}” was submitted and will be published once approved.',
  'contribute.errorSemester': 'Please select a semester.',
  'contribute.errorModule': 'Please select a module.',
  'contribute.errorTitle': 'The title must contain at least 3 characters.',
  'contribute.errorContributor': 'Please provide your name or your email address.',
  'contribute.errorFile': 'Please choose a file.',
  'contribute.errorGeneric': 'Submission failed. Please try again later.',

  'admin.queueEmpty': 'Nothing pending',
  'admin.queueEmptyDescription':
    'Student contributions will appear here before publication.',
  'admin.queueLoadError': 'Could not load the review queue',
  'admin.view': 'View',
  'admin.anonymous': 'Anonymous contributor',
  'admin.previewDownload': 'Preview',
  'admin.approve': 'Accept',
  'admin.reject': 'Reject',
  'admin.approveConfirm': 'Publish “{title}” in the library?',
  'admin.rejectConfirm': 'Reject and delete “{title}”?',
  'admin.submittedOn': 'Submitted on {date}',
  'admin.errorGeneric': 'Something went wrong.',
  'admin.tabQueue': 'Review queue',
  'admin.tabModules': 'Modules',

  'admin.modules.addTitle': 'Add a module',
  'admin.modules.addDescription':
    'Create the modules of a semester. A semester accepts up to 7 modules.',
  'admin.modules.fieldName': 'Module name',
  'admin.modules.namePlaceholder': 'E.g. Databases',
  'admin.modules.add': 'Add module',
  'admin.modules.creating': 'Creating…',
  'admin.modules.created': 'Module created successfully.',
  'admin.modules.updated': 'Module updated successfully.',
  'admin.modules.deleted': 'Module deleted.',
  'admin.modules.deletedWithResources':
    'Module deleted along with {count} attached resource(s).',
  'admin.modules.nameTooShort':
    'The module name must contain at least 3 characters.',
  'admin.modules.selectSemesterError': 'Please select a semester first.',
  'admin.modules.limitReached':
    'Limit reached: this semester already holds {limit} modules. Delete one before adding another.',
  'admin.modules.limitHint':
    'This semester has reached the {limit} module limit.',
  'admin.modules.counter': '{used} / {limit} modules used',
  'admin.modules.tableTitle': 'Modules',
  'admin.modules.tableFiltered': 'Modules of the selected semester.',
  'admin.modules.tableAll': 'Every module of the IIIA program.',
  'admin.modules.countForSemester': '{count} module(s)',
  'admin.modules.countAll': '{count} total',
  'admin.modules.tableSemester': 'Semester',
  'admin.modules.tableName': 'Module',
  'admin.modules.tableResources': 'Resources',
  'admin.modules.tableActions': 'Actions',
  'admin.modules.emptySemester': 'No module in this semester.',
  'admin.modules.emptyAll': 'No module created yet.',
  'admin.modules.editTitle': 'Rename the module',
  'admin.modules.editDescription':
    'The module code stays unchanged; its resources remain attached.',
  'admin.modules.deleteConfirm': 'Delete the module “{title}”?',
  'admin.modules.genericError': 'Something went wrong.',

  'admin.tabResources': 'Resources',
  'admin.tabTimetables': 'Timetables',
  'admin.tabAnnouncements': 'Announcements',
  'admin.statResources': 'Total resources',
  'admin.statPending': 'Awaiting review',
  'admin.statStudents': 'Enrolled students',

  'admin.uploadResourceTitle': 'Publish a resource',
  'admin.uploadResourceDescription':
    'Pick the semester, the module and the category, then upload the PDF. The resource is published immediately.',
  'admin.fieldSemester': 'Semester',
  'admin.fieldModule': 'Module',
  'admin.fieldCategory': 'Category',
  'admin.fieldTitle': 'Document title',
  'admin.fieldAcademicYear': 'Academic year',
  'admin.fieldFile': 'PDF file (25 MB max)',
  'admin.moduleExisting': 'Pick a module',
  'admin.moduleNew': 'New module',
  'admin.moduleNamePlaceholder': 'Name of the new module',
  'admin.moduleCodePlaceholder': 'Code (e.g. INF404)',
  'admin.selectSemester': 'Select a semester…',
  'admin.selectSemesterFirst': 'Pick a semester first',
  'admin.selectModule': 'Select a module…',
  'admin.loading': 'Loading…',
  'admin.titlePlaceholder': 'E.g. Lecture 3 — Chapter 1: Introduction',
  'admin.publishResource': 'Publish resource',
  'admin.uploading': 'Uploading…',
  'admin.uploadSuccess':
    'Resource published successfully. Students have been notified by email.',

  'admin.uploadTimetableTitle': 'Publish a timetable',
  'admin.uploadTimetableDescription':
    'The file replaces the existing timetable for the selected semester and academic year.',
  'admin.publishTimetable': 'Publish',
  'admin.timetableSuccess': 'Timetable published successfully.',
  'admin.publishedTimetables': 'Published timetables',
  'admin.noTimetables': 'No timetable published yet.',
  'admin.deleteTimetableConfirm': 'Delete the timetable “{label}”?',

  'admin.publishedResources': 'Published resources',
  'admin.publishedResourcesDescription':
    'Every live resource. You can edit its metadata or delete it.',
  'admin.noResources': 'No resource published yet.',
  'admin.editResource': 'Edit resource',
  'admin.deleteResourceConfirm': 'Permanently delete “{title}”?',

  'admin.edit': 'Edit',
  'admin.delete': 'Delete',
  'admin.save': 'Save',
  'admin.saving': 'Saving…',
  'admin.cancel': 'Cancel',

  'about.title': 'About',
  'about.kicker':
    'Independent initiative • By a student, for students',
  'about.missionTitle': 'Our mission',
  'about.missionBody1':
    'FPK IIIA Academic Hub is a centralised academic repository, built to help students of the Computer Engineering & Artificial Intelligence (IIIA) department at the Faculté Polydisciplinaire de Khouribga access their lectures, tutorials, labs and exams quickly and easily.',
  'about.missionBody2':
    'Our goal is simple: to gather all essential teaching resources in one place — verified and organised by semester — so that every student can focus on learning rather than on hunting for documents.',
  'about.featuresTitle': 'What you will find here',
  'about.feature.cours.title': 'Lectures',
  'about.feature.cours.description': 'Lecture notes and modules per semester',
  'about.feature.td_tp.title': 'TS&PW',
  'about.feature.td_tp.description':
    'Tutorial sessions and practical works',
  'about.feature.exams.title': 'Exams & Solutions',
  'about.feature.exams.description': 'Exam papers and their solutions',
  'about.feature.timetables.title': 'Timetables',
  'about.feature.timetables.description': 'Academic calendars per semester',
  'about.feature.announcements.title': 'Announcements',
  'about.feature.announcements.description':
    'Official notices from the department',
  'about.cta': 'Access the library',

  'footer.description':
    'A centralised academic repository for students of Computer Engineering & Artificial Intelligence at FPK.',
  'footer.navigationTitle': 'Academic navigation',
  'footer.levelsTitle': 'Levels of study',
  'footer.aboutTitle': 'About & notices',
  'footer.creditsTitle': 'Credits',
  'footer.creditsText': 'Developed with care for the IIIA community.',
  'footer.disclaimer.initiative': 'Student initiative',
  'footer.disclaimer.byStudent': 'By a student, for students',
  'footer.disclaimer.unofficial': 'Unofficial',
  'footer.level.licence': 'Undergraduate IIIA (S1 - S6)',
  'footer.level.master': 'Master IIIA (MS1 - MS4)',
  'footer.level.timetables': 'Timetables',
  'footer.level.announcements': 'Announcements',
  'footer.copyright': '© 2026 FPK IIIA Academic Hub. All rights reserved.',
  'footer.country': 'Morocco',
  'footer.independent': 'Independent Project',
  'footer.zexter': 'Zexter Team',
}

export const translations: Record<Locale, typeof fr> = { fr, en }

export type TranslationKey = keyof typeof fr

export type TranslationParams = Record<string, string | number>
