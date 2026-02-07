# 📋 Analyse iDocument — Implémenté vs Non-implémenté

> Date : 2026-02-07  
> Scope : iDocument, Configuration Orga, Permissions, Archivage

---

## 1. 📁 Création de dossier — Classement dans le plan de classement

### Ce qui est implémenté ✅
- **NewDossierModal** (`modals/NewDossierModal.tsx`) : formulaire de création avec nom, description, icône, couleur, et templates rapides
- **NewClasseurModal** (`modals/NewClasseurModal.tsx`) : formulaire similaire pour les classeurs
- **CreateFolderDialog** (`components/idocument/CreateFolderDialog.tsx`) : dialogue de création avec chemin parent affiché et sélection de couleur
- **FolderExplorer** (`components/idocument/FolderExplorer.tsx`) : arbre hiérarchique avec navigation par `parentId`

### Ce qui manque ❌
| Gap | Détail |
|-----|--------|
| **Sélection du répertoire de classement** | Le `NewDossierModal` ne demande PAS dans quel classeur/dossier parent placer le nouveau dossier. Il est ouvert contextuellement (dans le classeur courant) mais ne propose pas de naviguer l'arborescence pour choisir un autre emplacement |
| **Affichage des rubriques et sous-rubriques** | Aucun sélecteur de type `TreeSelect` ou `FolderPicker` n'est intégré dans le modal de création pour browser toute l'arborescence disponible |
| **Classement obligatoire** | Aucune validation n'empêche de créer un dossier « volant » sans parent. Le champ `parent_id` n'est pas obligatoire |
| **Tous les niveaux d'arborescence** | Le modal ne propose pas de naviguer de la rubrique jusqu'au dernier dossier ; seul le classeur courant est implicitement le parent |

---

## 2. 📂 Affichage des dossiers

### Ce qui est implémenté ✅
- **Vue grille des dossiers** (`DossierList.tsx`) : affichage sous forme de cartes visuelles (style "manila folder")
- **Vue grille des classeurs** (`ClasseurList.tsx`) : affichage des classeurs de premier niveau
- **FolderExplorer** (sidebar) : vue arborescente hiérarchique dans `IDocumentLayout.tsx` et `FolderExplorer.tsx`
- **Bouton "Arborescence"** : présent dans `IDocumentLayout.tsx` et `DocumentCategoryPage.tsx` pour toggle la sidebar

### Ce qui manque ❌
| Gap | Détail |
|-----|--------|
| **Arborescence = vue par défaut** | L'arborescence est affichée en sidebar à la demande (toggle), PAS comme vue par défaut. La vue par défaut est la grille de classeurs |
| **Actions rapides sur dossier** | Les dossiers proposent via DropdownMenu : "Ouvrir", "Renommer", "Supprimer". Il manque : **Partager**, **Gérer les accès**, **Créer un sous-dossier** directement depuis le menu contextuel |

---

## 3. 📄 Création de document (fichier)

### Ce qui est implémenté ✅
- **NewFichierModal** (`modals/NewFichierModal.tsx`) : formulaire avec nom, référence, type de document (Select), description, tags, zone d'upload drag-and-drop
- **Types de documents** : contrat, facture, devis, rapport, projet, other
- **Upload** : le composant `DocumentUploader.tsx` gère l'upload de fichiers

### Ce qui manque ❌
| Gap | Détail |
|-----|--------|
| **Métadonnées obligatoires** | Le formulaire ne définit PAS quelles métadonnées sont obligatoires vs optionnelles. Seul le nom est requis (`disabled={!formData.name?.trim()}`). Le type reste optionnel (défaut: "other") |
| **Sélection du dossier de destination** | Le modal ne propose PAS de sélectionner un dossier. Il dépend du contexte de navigation (le dossier où l'on se trouve). Aucun sélecteur d'arborescence n'est intégré |
| **Classement obligatoire** | Rien n'empêche de créer un document sans le classer dans un dossier |
| **Visualisation automatique après création** | Après création, le modal se ferme simplement. Il n'y a PAS de redirection automatique vers la visualisation du document créé |
| **Annotation sans téléchargement** | Le `FichierDetails.tsx` permet de voir les métadonnées et pièces jointes, mais il n'y a PAS de visionneuse intégrée permettant d'annoter ou agir sur le document sans le télécharger |

---

## 4. ⚙️ Configuration Orga — Modification des configurations initiales

### Ce qui est implémenté ✅
- **OrganizationConfig** (`pages/shared/OrganizationConfig.tsx`) : page complète avec structure arborescente, formulaire de détails par unité, onglets Général/Archivage/Permissions/Workflows
- **Création d'unités** : dialog de création avec nom, code, type, parent, couleur
- **Templates d'organisation** : modèles PME Standard et Administration Publique applicables
- **Configuration d'archivage par unité** : durée de conservation, base légale, types de docs, archivage auto, approbation requise, héritage parent

### Ce qui manque ❌
| Gap | Détail |
|-----|--------|
| **Modification des configurations initiales** | Les champs du formulaire de détails (onglet Général) affichent les valeurs mais ne sont PAS connectés à un handler `onChange`. Les modifications ne sont pas sauvegardées. Le bouton "Enregistrer" est présent mais sans handler |
| **Traitement en lot** | Aucun mécanisme de propagation des changements aux éléments déjà existants. Pas de message d'avertissement indiquant quels dossiers/documents seraient impactés |
| **Confirmation de propagation** | Pas de dialogue de confirmation demandant à l'Admin de valider l'application des nouvelles valeurs aux éléments existants |

---

## 5. 🏢 Structure organisationnelle — Codes

### Ce qui est implémenté ✅
- **Champ code** dans `OrganizationConfig.tsx` : `<Input maxLength={6}>` limité à 6 caractères
- **Génération automatique de code** : fonction `generateUnitCode()` dans `types/organization.ts` qui prend les 3 premières lettres et ajoute un suffixe numérique si doublon
- **Sélection de parent** : un `<Select>` simple liste toutes les unités à plat pour choisir le parent

### Ce qui manque ❌
| Gap | Détail |
|-----|--------|
| **Limite à 9 caractères** | `maxLength={6}` est hardcodé. Doit passer à `maxLength={9}` |
| **Points et tirets autorisés** | La fonction `generateUnitCode()` utilise `.replace(/[^a-zA-Z]/g, '')` qui supprime TOUS les caractères non-alpha. Les points et tirets ne sont pas autorisés |
| **Affichage hiérarchique des parents** | Le sélecteur de parent est un `<Select>` simple qui liste TOUTES les unités à plat sans indentation. Il faudrait un affichage en arbre (1ers niveaux visibles, puis clic pour déplier les niveaux inférieurs) |
| **Unicité du code inter-niveaux** | La fonction `generateUnitCode()` vérifie l'unicité globale des codes, mais n'empêche PAS explicitement la réutilisation du même code d'un niveau hiérarchique à l'autre (ex: le code "FIN" pourrait être utilisé dans deux départements différents) |

---

## 6. 🔴 Action "Désactiver une unité"

### Ce qui est implémenté ✅
- Le type `OrganizationUnit` a un champ `is_active: boolean`
- Le badge "Actif"/"Inactif" est affiché dans les détails de l'unité sélectionnée

### Ce qui manque ❌
| Gap | Détail |
|-----|--------|
| **Action "Désactiver"** | Aucun bouton ou action dans l'UI ne permet de désactiver une unité. Le menu contextuel propose uniquement "Modifier", "Dupliquer", "Supprimer" |
| **Logique de masquage** | Pas de logique pour rendre une unité désactivée invisible aux autres unités/utilisateurs tout en la conservant dans l'environnement |

---

## 7. 📋 Configuration des documents — Type obligatoire

### Ce qui est implémenté ✅
- **Sélection du type** dans `NewFichierModal.tsx` : champ Select avec les types prédéfinis (contrat, facture, devis, rapport, projet, other)
- **Types de documents par unité** dans `ArchiveConfig` : le champ `document_types: string[]` permet de configurer les types autorisés par unité

### Ce qui manque ❌
| Gap | Détail |
|-----|--------|
| **Type obligatoire à la création** | Le type de document n'est PAS obligatoire lors de la création. Il a une valeur par défaut "other" et aucune validation n'empêche de soumettre sans choisir un type spécifique |
| **Type obligatoire à l'import** | Lors de l'import (SmartImport, GlobalImport), le type n'est pas exigé explicitement |
| **Types préconfigurés dynamiques** | Les types sont hardcodés dans `DOCUMENT_TYPES`. Pas de mécanisme Admin pour les configurer dynamiquement depuis la Configuration Orga |
| **Idem pour les dossiers** | Les dossiers n'ont pas de champ "type de dossier" obligatoire |

---

## 8. 👥 Gestion des permissions — Groupes

### Ce qui est implémenté ✅
- **Types de permissions** : `OrganizationPermission` dans `types/organization.ts` avec 11 permissions granulaires
- **UserPermissions** : structure avec permissions globales et par unité
- **Managers et Membres** : champs `managers: string[]` et `members: string[]` sur chaque `OrganizationUnit`
- **Onglet Permissions** dans `OrganizationConfig.tsx` : boutons "Ajouter un manager" et "Ajouter un membre" (mais non fonctionnels)
- **ShareDialog** : partage de documents avec permissions (view, download, edit, full) et expiration

### Ce qui manque ❌
| Gap | Détail |
|-----|--------|
| **Concept de groupes** | AUCUN système de groupes n'est implémenté. Les permissions sont assignées par `string[]` d'IDs utilisateurs uniquement |
| **Création de groupes** | Pas d'interface pour créer, modifier ou supprimer des groupes dans la configuration |
| **Assignation par groupe** | Pas de mécanisme pour assigner des permissions à un groupe plutôt qu'à des utilisateurs individuels |
| **Fonctionnalité des boutons permissions** | Les boutons "Ajouter un manager/membre" dans l'onglet Permissions n'ont PAS de handler onClick ni de dialogue associé |

---

## 9. 🗃️ Archivage automatique — Conversion PDF

### Ce qui est implémenté ✅
- **AutoArchiveRules** (`iarchive/components/AutoArchiveRules.tsx`) : système complet de règles d'archivage automatique avec source, cible, fréquence, exécution
- **ArchiveSettings** (`pro/admin/ArchiveSettings.tsx`) : page complète de configuration d'archivage par unité
- **Statuts archivistiques** : cycle complet actif → semi_actif → inactif → archive → destruction
- **Transitions de statut** : règles d'affaires complètes avec approbation et conditions automatiques
- **ArchivalStatusTransitionDialog** : dialogue pour les transitions de statut

### Ce qui manque ❌
| Gap | Détail |
|-----|--------|
| **Conversion automatique en PDF** | AUCUNE mention de conversion automatique des documents en PDF lors de l'archivage. Le système gère les statuts et transitions mais pas la transformation de fichiers |
| **Mention dans l'UI** | Nulle part dans l'interface n'est-il indiqué que l'archivage convertit automatiquement les documents en PDF |

---

## 📊 Tableau Récapitulatif

| Fonctionnalité | Implémenté | Partiel | Non implémenté |
|---|:---:|:---:|:---:|
| Création dossier — classement arborescence | | ⚠️ | |
| Classement obligatoire (pas de volant) | | | ❌ |
| Affichage arborescence = vue par défaut | | | ❌ |
| Actions rapides (partager, accès, sous-dossier) | | ⚠️ | |
| Création document — métadonnées obligatoires | | | ❌ |
| Création document — classement obligatoire | | | ❌ |
| Visualisation auto après création | | | ❌ |
| Modification configs initiales | | ⚠️ | |
| Traitement en lot des changements | | | ❌ |
| Codes — 9 caractères, points/tirets | | | ❌ |
| Affichage hiérarchique parents | | ⚠️ | |
| Unicité codes inter-niveaux | | ⚠️ | |
| Désactiver une unité | | ⚠️ | |
| Type document obligatoire | | | ❌ |
| Permissions par groupes | | | ❌ |
| Archivage — conversion PDF auto | | | ❌ |

**Légende :** ⚠️ = des bases existent mais la fonctionnalité n'est pas complète ; ❌ = non implémenté du tout
