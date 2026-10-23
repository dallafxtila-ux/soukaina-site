# Site de Soukaina : guide

Site vitrine en deux univers, 100 % gratuit :
- `index.html` : accueil avec les deux portes
- `oeuvres.html` : galerie (les œuvres sont dans `data/oeuvres.json`, images dans `images/oeuvres/`)
- `ateliers.html` : ateliers (`data/ateliers.json`, rempli par Soukaina depuis le back office)
- `.pages.yml` : configuration du back office (Pages CMS)

## 1. Mettre le code sur GitHub (5 min)
1. Crée un compte sur https://github.com
2. Crée un dépôt **public** nommé `soukaina-site`, puis glisse-dépose tout le contenu du dossier (bouton « uploading an existing file »).

## 2. Mettre en ligne gratuitement (5 min)
1. Crée un compte sur https://dash.cloudflare.com, puis va dans **Workers & Pages → Create → Pages → Connect to Git**.
2. Choisis le dépôt `soukaina-site`. Laisse le build command vide et mets le dossier de sortie à `/`.
3. Le site est en ligne sur `soukaina-site.pages.dev`, puis sur **dallaf.com** une fois le domaine branché. Chaque modification sur GitHub le met à jour tout seul.

## 3. Formulaire de contact (2 min)
1. Va sur https://web3forms.com, saisis l'e-mail de Soukaina et récupère la clé reçue par mail.
2. Dans `js/main.js`, remplace `A_REMPLACER` par cette clé.
3. Remplace aussi les `A_REMPLACER` de l'Instagram et de l'e-mail dans `oeuvres.html`, `ateliers.html` et `index.html`.

## 4. Back office de Soukaina (5 min)
1. Soukaina crée un compte GitHub. Tu l'ajoutes au dépôt dans **Settings → Collaborators**.
2. Elle va sur https://app.pagescms.org, se connecte avec GitHub et ouvre `soukaina-site`.
3. Elle voit **« Mes ateliers »**. Le bouton **+ Ajouter** sert à saisir le titre, la date, la photo, le texte, le prix et le lien de paiement, puis elle clique sur **Save**.
4. Environ 1 minute après, l'atelier apparaît sur le site. Une fois la date passée, il bascule tout seul dans « Ils ont eu lieu ».

Le lien de paiement peut venir de SumUp, PayPal, HelloAsso, Lydia Pro ou Stripe Payment Link. Il suffit de coller l'URL.

## Ajouter une œuvre (toi)
Mets la photo dans `images/oeuvres/` (JPG d'environ 1600 px de large, moins de 400 Ko). Ajoute ensuite une ligne dans `data/oeuvres.json` :
```json
{ "titre": "...", "annee": "2026", "technique": "Acrylique sur toile", "dimensions": "80 × 100 cm", "image": "images/oeuvres/ma-photo.jpg", "disponible": true }
```

## Tester en local
```bash
python3 -m http.server 8765
```
Puis ouvre http://localhost:8765. Ouvrir le fichier HTML directement (en double-cliquant) ne charge pas les données.
