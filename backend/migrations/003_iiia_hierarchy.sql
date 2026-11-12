-- 003_iiia_hierarchy.sql
-- Creates the IIIA academic hierarchy used by the FPK IIIA Academic Hub:
--   academic field -> semesters (S1..S6, MS1..MS4) -> modules -> resources
--
-- Idempotent: safe to re-run.

begin;

-- 1) The single IIIA academic field ------------------------------------------

insert into public.academic_fields (name, slug)
values ('Génie Informatique et Intelligence Artificielle', 'genie-informatique-ia')
on conflict (slug) do nothing;

-- 2) Semesters: S1..S6 (Licence) and MS1..MS4 (Master) ----------------------

insert into public.semesters (academic_field_id, name, slug)
select af.id, s.name, s.slug
from public.academic_fields af
cross join (
  values
    ('S1', 's1'),
    ('S2', 's2'),
    ('S3', 's3'),
    ('S4', 's4'),
    ('S5', 's5'),
    ('S6', 's6'),
    ('MS1', 'ms1'),
    ('MS2', 'ms2'),
    ('MS3', 'ms3'),
    ('MS4', 'ms4')
) as s(name, slug)
where af.slug = 'genie-informatique-ia'
on conflict (academic_field_id, slug) do nothing;

-- 3) Module catalogue ---------------------------------------------------------

insert into public.modules (semester_id, title, code, description)
select sem.id, m.title, m.code, m.description
from public.semesters sem
join public.academic_fields af on af.id = sem.academic_field_id
join (
  values
    -- S1
    ('s1', 'INF101', 'Introduction à la programmation', 'Bases de la programmation structurée : variables, conditions, boucles et fonctions.'),
    ('s1', 'INF102', 'Algorithmique et structures de données', 'Listes, piles, files, arbres, graphes et complexité algorithmique.'),
    ('s1', 'MAT101', 'Mathématiques pour l''informatique', 'Logique, ensembles, relations et raisonnement mathématique.'),
    -- S2
    ('s2', 'INF201', 'Architecture des ordinateurs', 'Processeurs, mémoires, représentation de l''information et assembleur.'),
    ('s2', 'INF202', 'Systèmes logiques et booléens', 'Algebra booléenne, circuits combinatoires et séquentiels.'),
    ('s2', 'MAT201', 'Analyse 2', 'Suites, séries, intégrales et équations différentielles usuelles.'),
    -- S3
    ('s3', 'INF301', 'Programmation orientée objet', 'Classes, héritage, polymorphisme et conception orientée objet en Java.'),
    ('s3', 'INF302', 'Développement web', 'HTML, CSS, JavaScript et introduction aux frameworks front-end.'),
    ('s3', 'INF303', 'Bases de données', 'Modèle relationnel, SQL, normalisation et transactions.'),
    -- S4
    ('s4', 'INF401', 'Systèmes d''exploitation', 'Processus, threads, ordonnancement, mémoire et systèmes de fichiers.'),
    ('s4', 'INF402', 'Réseaux informatiques', 'Modèle OSI/TCP-IP, protocoles de transport et programmation réseau.'),
    ('s4', 'INF403', 'Génie logiciel', 'Cycle de vie, méthodologies agiles, UML et gestion de projet.'),
    -- S5
    ('s5', 'INF501', 'Compilation', 'Analyse lexicale, syntaxique et sémantique, génération de code.'),
    ('s5', 'INF502', 'Intelligence artificielle', 'Recherche heuristique, logique et apprentissage automatique.'),
    ('s5', 'INF503', 'Probabilités et statistiques', 'Variables aléatoires, lois usuelles et statistique descriptive.'),
    -- S6
    ('s6', 'INF601', 'Sécurité informatique', 'Cryptographie, vulnérabilités et bonnes pratiques de sécurisation.'),
    ('s6', 'INF602', 'Big Data et systèmes distribués', 'Écosystème Hadoop/Spark, traitement distribué et architectures à grande échelle.'),
    ('s6', 'INF603', 'Projet de fin d''études', 'Conception et réalisation d''un projet complet en équipe.'),
    -- MS1
    ('ms1', 'INF-M1-01', 'Apprentissage automatique avancé', 'Modèles supervisés et non supervisés, évaluation et sélection de modèles.'),
    ('ms1', 'INF-M1-02', 'Ingénierie logicielle avancée', 'Architecture logicielle, patterns, tests et intégration continue.'),
    ('ms1', 'INF-M1-03', 'Recherche opérationnelle', 'Optimisation linéaire, programmation dynamique et heuristiques.'),
    -- MS2
    ('ms2', 'INF-M2-01', 'Apprentissage profond', 'Réseaux de neurones, vision par ordinateur et traitement du langage.'),
    ('ms2', 'INF-M2-02', 'Ingénierie des données', 'Pipelines ETL, data lakes et gouvernance des données.'),
    ('ms2', 'INF-M2-03', 'Stage et mémoire', 'Stage long et soutenance en entreprise ou en laboratoire.'),
    -- MS3
    ('ms3', 'INF-M3-01', 'Systèmes distribués avancés', 'Microservices, files de messages et cohérence distribuée.'),
    ('ms3', 'INF-M3-02', 'Vision par ordinateur', 'Traitement d''images, détection d''objets et reconnaissance.'),
    -- MS4
    ('ms4', 'INF-M4-01', 'Projet de fin d''études', 'Projet de recherche appliquée et soutenance publique.')
) as m(semester_slug, code, title, description)
  on sem.slug = m.semester_slug
where af.slug = 'genie-informatique-ia'
on conflict (semester_id, code) do nothing;

-- 4) Indexes supporting the hierarchy walk -----------------------------------

create index if not exists modules_semester_code_idx
on public.modules (semester_id, code);

create index if not exists resources_module_status_idx
on public.resources (module_id, status);

commit;
