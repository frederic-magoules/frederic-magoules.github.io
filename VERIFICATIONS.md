# Vérifications de la version de pré-livraison

Vérifications effectuées le 4 octobre 2026 sur la copie contenue dans cette
archive.

## Navigation et ressources

- 526 références locales actives (`href`, `src`, objets PDF et ressources CSS)
  ont été contrôlées ; toutes leurs cibles existent.
- Les identifiants HTML sont uniques dans chaque page.
- Les fragments des liens internes pointent vers des identifiants existants.
- La syntaxe de `assets/js/sidebar.js` est valide.
- Le menu **Research** et son sous-menu **Research Themes** sont commentés dans
  le menu JavaScript et dans les versions de secours sans JavaScript.
- Aucun lien actif ne pointe vers `research.html`.
- Le texte « Research Themes » reste affiché dans `pictures.html`.
- `research.html` est conservé sans modification de son contenu.

## PDF

- `pdfs/biosketch.pdf` : 1 page, A4 ;
- `pdfs/curriculum.pdf` : 21 pages, A4 ;
- `pdfs/publications.pdf` : 22 pages, A4 ;
- `pdfs/press-coverage.pdf` : 5 pages, A4.

Les quatre documents sont des PDF valides, non chiffrés, et leurs empreintes
correspondent exactement aux fichiers fournis pour cette révision.

## Nettoyage

- l’ancien répertoire `mag/` est absent ;
- l’ancien répertoire `documents/` et ses archives PDF sont absents ;
- aucun fichier `.bib` ne subsiste ;
- l’ancienne redirection `animations.html` vers Research est absente ;
- les trois petites ressources graphiques encore utilisées par le menu ont été
  conservées sous `assets/images/site-navigation-*`, hors de l’ancien
  sous-répertoire `legacy/`.

Ces contrôles sont des vérifications statiques du paquet de livraison : chemins,
ancres, ressources, syntaxe JavaScript et intégrité des PDF.
