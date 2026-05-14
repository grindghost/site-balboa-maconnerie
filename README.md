# Balboa Maçonnerie — site vitrine

**Site Web vitrine (one pager)** pour **Balboa Maçonnerie**, entreprise de maçonnerie résidentielle à Québec. Une seule page d’accueil présente les services, une galerie de réalisations, les témoignages et un formulaire de demande de soumission.

## Stack

- **HTML** sémantique (`index.html`), **CSS** sur mesure (`styles.css`), **JavaScript** sans framework (`script.js`).
- **Aucun build** ni bundler : fichiers servis tels quels.
- **Formulaire** : envoi via [Web3Forms](https://web3forms.com) (`fetch` vers leur API), puis redirection vers `merci.html`.

## Déploiement

Le site est **hébergé sur [Vercel](https://vercel.com)** (projet statique, preset *Other* / pas de framework). Exemple d’URL de production : [balboa-maconnerie.vercel.app](https://balboa-maconnerie.vercel.app/).

Après changement de domaine, mettre à jour dans `index.html` les balises **canonical** et **Open Graph**, le **JSON-LD**, ainsi que `robots.txt` et `sitemap.xml`.

## Développement local

```bash
python3 -m http.server 8080
```

Ouvrir `http://localhost:8080`. Le formulaire fonctionne comme en production (Web3Forms côté navigateur).

## Fichiers principaux

| Fichier | Rôle |
|--------|------|
| `index.html` | Page unique : structure, SEO, JSON-LD, formulaire |
| `merci.html` | Page de remerciement après envoi réussi |
| `styles.css` | Thème, mise en page, responsive |
| `script.js` | Navigation mobile, lightbox galerie, formulaire |
| `assets/` | Logo, images, textures |
| `robots.txt`, `sitemap.xml` | SEO |

Les textes de référence sont dans `text.md` ; la direction artistique peut s’appuyer sur `preview.png` et `assets/mockup-reference.png`.

## Coordonnées et formulaire

Coordonnées, liens et clé Web3Forms : voir `index.html` (pied de page et champs cachés du formulaire). Pour le spam ou des besoins avancés, les options Web3Forms (domaine autorisé, captcha, etc.) se configurent dans leur tableau de bord.

## Balises Google (optionnel)

Emplacement prévu dans `index.html` (commentaire *Google tag*). Ne pas y placer de secrets.

## Contenu

Textes : `text.md`. Logo et visuels : droits de leurs auteurs respectifs.
