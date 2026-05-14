# Balboa Maçonnerie — site one page

Site statique **HTML / CSS / JavaScript** pour présenter les services de Balboa Maçonnerie et recevoir des demandes de soumission. Le formulaire envoie les données via **[FormSubmit](https://formsubmit.co)** (aucune fonction serverless ni clé API à gérer pour l’envoi).

Les textes proviennent de `text.md`. La direction artistique s’inspire de `preview.png` et de `assets/mockup-reference.png` (copie de référence dans le dépôt).

## Fichiers

| Fichier | Rôle |
|--------|------|
| `index.html` | Structure sémantique, SEO, JSON-LD |
| `styles.css` | Mise en page, thème, responsive |
| `script.js` | Menu mobile, galerie, formulaire (validation client + envoi FormSubmit) |
| `assets/` | Logo, textures de fond, placeholders galerie, mockup |
| `robots.txt` / `sitemap.xml` | SEO — **à adapter à votre domaine** |
| `.env.example` | Rappel : pas de variables requises pour le formulaire |

## Lancement local

Aucune étape de build n’est obligatoire pour le front.

```bash
# Servir la racine du projet (exemple avec Python)
python3 -m http.server 8080
```

Ouvrir `http://localhost:8080`. Le formulaire poste vers FormSubmit : en local, la soumission fonctionne comme en production (redirection après envoi selon FormSubmit).

## Déploiement Vercel

1. Pousser le dépôt sur GitHub (ou autre) et importer le projet dans Vercel, **ou** utiliser `vercel` en CLI depuis ce dossier.
2. Framework preset : **Other** (site statique).
3. Après déploiement, mettre à jour :
   - `canonical`, Open Graph, JSON-LD, `robots.txt`, `sitemap.xml` avec votre domaine réel.

## Remplacement des images

| Emplacement | Usage |
|-------------|-------|
| `assets/hero.png` | Fond du hero (photo principale). Pour de meilleures perfs, exportez aussi une variante WebP et remplacez l’URL dans `.hero__media`. |
| `assets/realisation-1.jpg` … `realisation-6.jpg` | Galerie « Nos réalisations » (dimensions affichées 483×292, `loading="lazy"`). |
| `assets/champion.png` | Fond du bandeau citation (« champion » / Québec). |
| `assets/gloves.png` | Image de la section « À propos » (bloc `about__visual`). |
| `assets/mockup-reference.png` | Référence design / OG image — compressez avant production. |
| `assets/logo.svg` | Logo (copie de `logo.svg` à la racine). |

Après changement de chemins ou de noms de fichiers, mettre à jour `index.html` et les métadonnées Open Graph / JSON-LD si nécessaire.

## Remplacement des coordonnées

Dans `index.html` : pied de page (`tel:`, `mailto:`), lien Facebook, éventuellement le bloc JSON-LD, et l’URL FormSubmit dans l’attribut `action` du formulaire (`https://formsubmit.co/…`). Remplacez les exemples `(418) 555-0123` et `soumissions@balboamaconnerie.ca` si vos coordonnées changent.

## Formulaire (FormSubmit)

- **Action** : `POST` vers `https://formsubmit.co/soumissions@balboamaconnerie.ca` (voir `index.html`).
- **Champs** : `name`, `phone`, `email`, `projectAddress`, `description`, plus les champs réservés FormSubmit (`_subject`, `_template`, `_next`, `_gotcha` anti-spam).
- **Première utilisation** : FormSubmit envoie un courriel de **confirmation** à l’adresse de destination avant d’activer le formulaire.
- **Après envoi** : redirection vers la même page avec `?merci=1#soumission` ; le script affiche un message de remerciement puis nettoie l’URL dans la barre d’adresse.
- **Validation** : règles côté client dans `script.js` (longueurs, description 10 à 1000 caractères, téléphone avec au moins 7 chiffres, etc.). FormSubmit applique sa propre couche côté service.

Pour des pièces jointes ou une logique métier plus poussée, il faudrait repasser par une API ou un autre service.

## Balises Google (Analytics / GTM)

Emplacement prévu dans `index.html` : commentaire `<!-- Google tag ... -->`. Collez-y le snippet fourni par Google **sans** y mettre de secrets côté client (les IDs publics GTM / mesure sont conçus pour être visibles dans la page).

## Licence du contenu

Textes : voir `text.md`. Logo et visuels : droits de leur auteur respectif.
