# Site personnel de Frédéric Magoulès — version de pré-livraison

Cette copie statique du site est prête à être testée localement puis déposée à
la racine du dépôt `frederic-magoules.github.io`. Elle ne nécessite aucun outil
de compilation, framework ou gestionnaire de dépendances.

## Ouvrir le site

1. Décompresser entièrement l’archive.
2. Ouvrir `index.html` dans un navigateur.
3. Conserver les dossiers `assets` et `pdfs` à côté des fichiers HTML.

Pour GitHub Pages, copier le contenu du dossier
`frederic-magoules.github.io`, y compris `.nojekyll`, à la racine du dépôt.

## Navigation

Le bandeau et le menu commun sont définis dans `assets/js/sidebar.js`. Une
version de secours sans JavaScript est également présente dans chaque page.

Le menu **Research** et son sous-menu **Research Themes** sont conservés dans
le code sous forme de commentaires. La page `research.html` est maintenue sans
modification afin de pouvoir être réactivée ultérieurement. Les liens visibles
qui y menaient ont été désactivés, tandis que le texte « Research Themes » reste
affiché dans la galerie scientifique.

Le menu **Contact** reste lui aussi commenté, conformément à la version
précédente du site.

## Documents PDF

Les documents à jour sont regroupés dans `pdfs/` :

- `biosketch.pdf` ;
- `curriculum.pdf` ;
- `publications.pdf` ;
- `press-coverage.pdf`.

Tous les liens du site vers ces documents utilisent des chemins relatifs afin
de fonctionner aussi bien localement que sur GitHub Pages.

## Structure principale

- `index.html` : Biosketch ;
- `honours-leadership.html` : Academic Recognition ;
- `publications.html` : Selected publications ;
- `authored-books.html`, `edited-books.html` et
  `edited-conference-proceedings.html` : Books ;
- `special-issues.html` : Guest-Edited Journal Issues ;
- `press-coverage.html` : Media and Press Coverage ;
- `pictures.html` : Scientific Gallery ;
- `teaching.html` : Teaching resources ;
- `research.html` : page conservée mais retirée de la navigation.

Les fichiers du très ancien site, les anciennes archives PDF et le fichier
BibTeX de travail ne font pas partie de cette version de pré-livraison.
