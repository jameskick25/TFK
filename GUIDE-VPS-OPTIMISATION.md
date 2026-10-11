# Guide d'Architecture & Optimisation VPS : La Stack Ultime & Migration depuis React

Ce guide succède au guide mutualisé Octenium (`GUIDE-OCTENIUM-NODE.md`).
Ayant désormais un **VPS (Serveur Privé Virtuel)** avec accès root et ressources dédiées, toutes les contraintes destructrices de performance imposées par l'hébergement mutualisé (Phusion Passenger qui tue Node après chaque requête, cold starts de 8 secondes, limite de 20 Entry Processes, interdiction de Sharp, hacks de symlinks dans `public_html`, et scripts keepwarm) sont **définitivement obsolètes**.

Ce document définit :
1. **La stack la plus optimisée sur un VPS** et pourquoi elle surpasse l'ancienne architecture.
2. **Comment bien réécrire/migrer depuis React** (RSC, séparation client/serveur, zéro régression).
3. **Le plan d'optimisation global** (Frontend Lighthouse 100, Backend/DB, Nginx, PM2, sécurité et déploiement).

---

## 1. Ce qui change radicalement : Mutualisé (Octenium) vs VPS

| Contrainte sur Octenium (Ancien) | Réalité sur VPS (Nouveau) | Gain Concret |
|---|---|---|
| **Processus Node tué à l'inactivité** (Passenger idle kill) | **Processus Node persistant 24/7** en mémoire RAM | Temps de réponse moyen divisé par 10 (15–30 ms au lieu de 1–5 s). Fini les cold starts ! |
| **Hack keepwarm requis** (cron curl toutes les 30s) | **Plus aucun keepwarm nécessaire** | Économie de bande passante, suppression des scripts de contournement |
| **Limite de 20 Entry Processes** (saturation rapide) | **Nginx gère des dizaines de milliers de connexions** | Capacité à encaisser des pics de trafic e-commerce réels |
| **Next.js déconseillé** (cold start lourd, trop de RAM) | **Next.js Standalone hautement recommandé** | Rendu SSR ultra-rapide, SEO parfait, expérience moderne |
| **Interdiction de `sharp`** en production | **`sharp` natif C++ exécuté à pleine puissance** | Génération WebP/AVIF à la volée en quelques millisecondes |
| **Liens symboliques manuels dans `public_html`** | **Nginx sert directement le dossier `/public`** | Zéro requête statique touchant Node.js |
| **Pas de PM2 ni Docker, pas d'accès root** | **PM2 Cluster Mode + Nginx + Certbot SSL** | Haute disponibilité, rechargement sans coupure (*zero-downtime*), SSL auto |

---

## 2. Quelle est la Stack la plus Optimisée sur un VPS ?

### 2.1 La Stack Gagnante Recommandée

Pour une boutique e-commerce ou une application vitrine dynamique nécessitant un **SEO parfait**, une **vitesse instantanée** et une **maintenance simple** :

```
                        ┌──────────────────────────────────────────────────┐
                        │              Client / Navigateur                │
                        └────────────────────────┬─────────────────────────┘
                                                 │ HTTPS (HTTP/2 ou HTTP/3)
                                                 ▼
                        ┌──────────────────────────────────────────────────┐
                        │             Nginx (Reverse Proxy)                │
                        │   - Terminaison SSL (Let's Encrypt / Certbot)    │
                        │   - Cache statique agressif (/_next/static, etc.)│
                        │   - Compression Gzip / Brotli                    │
                        │   - Pare-feu de base & Rate Limiting             │
                        └────────┬────────────────────────────────┬────────┘
             Fichiers Statiques  │                                │ Requêtes Dynamiques / SSR
             (/_next/static,     │                                │ (proxy_pass http://127.0.0.1:3000)
              /images, /uploads) │                                ▼
                                 │                 ┌───────────────────────────────┐
                                 │                 │    PM2 Cluster (Node.js)      │
                                 │                 │  Next.js 15/16 (Standalone)   │
                                 │                 │  + Sharp natif                │
                                 │                 └──────────────┬────────────────┘
                                 │                                │
                                 │                                ▼
                                 │                 ┌───────────────────────────────┐
                                 └────────────────►│ Base de données (PostgreSQL   │
                                                   │ ou Supabase avec Pooling)     │
                                                   └───────────────────────────────┘
```

1. **Framework Applicatif : Next.js 15/16 (App Router) en mode Standalone**
   - **Pourquoi ?** L'architecture **RSC (React Server Components)** exécute la logique de base de données et le templating sur le VPS. Le client ne reçoit que du HTML pré-rendu et un bundle JS ultra-léger.
   - **Mode Standalone (`output: 'standalone'`)** : Ne déploie que le code strictement nécessaire (~60–100 Mo) sans le dossier `node_modules` de développement (évite 600 Mo inutiles).
2. **Moteur d'Optimisation d'Images : `sharp`**
   - Intégré nativement avec `<Image />` de Next.js.
   - Redimensionne et compresse les uploads clients en WebP/AVIF à la volée avec mise en cache sur disque.
3. **Reverse Proxy : Nginx**
   - Sert tous les assets statiques (`/_next/static/*`, `/images/*`, `/uploads/*`) directement depuis le disque sans solliciter Node.js.
   - Gère le SSL avec renouvellement automatique (Certbot).
   - Compression Brotli / Gzip activée.
4. **Gestionnaire de Processus : PM2 (Cluster Mode)**
   - Démarre automatiquement 1 worker par cœur CPU disponible (`instances: 'max'` ou `instances: 2`).
   - Redémarrage automatique en cas de crash.
   - Rechargement sans interruption de service (`pm2 reload`).
5. **Base de Données & Auth : Supabase (PostgreSQL) ou MariaDB/PostgreSQL local**
   - Utilisation d'un **Connection Pooler** (Transaction mode / PgBouncer) pour éviter la saturation des connexions.

---

## 3. Comment Bien Réécrire / Migrer depuis React

Si l'application d'origine était une SPA classique (Create React App, Vite, ou un vieux Next.js rempli de `useEffect` et de `'use client'`), la réécriture doit suivre **4 principes clés** pour diviser le temps de chargement par 5 sans aucune régression.

### Règle #1 : Inverser la Logique — Passer en "RSC First" (Server-Driven)

Dans un React classique, le navigateur télécharge un gros bundle JS vide, affiche une page blanche ou un skeleton, puis exécute `fetch('/api/products')`.
**C'est lent et mauvais pour le SEO.**

**L'approche optimisée Next.js (App Router) :**
- **Par défaut, chaque fichier est un Server Component** (zéro directive au début du fichier).
- La requête en base de données s'exécute directement dans le composant sur le VPS (accès ultra-rapide à 1–2 ms de latence).
- Le navigateur reçoit du HTML complet immédiatement affichable.

```tsx
// src/app/(public)/catalog/page.tsx - SERVER COMPONENT (Par défaut, 0 Ko de JS client)
import { getProducts } from '@/utils/supabase/queries';
import ProductCard from '@/components/ProductCard';

export default async function CatalogPage() {
  const products = await getProducts(); // Directement sur le serveur

  return (
    <main className="catalog-container">
      <h1>Notre Catalogue</h1>
      <div className="product-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </main>
  );
}
```

### Règle #2 : Isoler les Îlots d'Interactivité (`'use client'`)

N'ajoutez `'use client'` que sur les petits composants qui manipulent des événements navigateur (`onClick`, `useState`, `localStorage`).

```tsx
// src/components/AddToCartButton.tsx - CLIENT COMPONENT (Seulement le bouton est hydraté)
'use client';

import { useCart } from '@/context/CartContext';
import { useState } from 'react';

export default function AddToCartButton({ product }: { product: Product }) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      onClick={() => {
        addItem(product);
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
      }}
      className="btn-primary"
    >
      {added ? '✓ Ajouté' : 'Ajouter au panier'}
    </button>
  );
}
```

### Règle #3 : Mutations via Server Actions (Adieu le boilerplate d'API)

Au lieu de créer une route `/api/order` + `fetch()` manuel avec gestion de statuts :
Utilisez une **Server Action** sécurisée avec typage direct et revalidation du cache.

```tsx
// src/app/actions/order.ts
'use server';

import { createServerClient } from '@/utils/supabase/server';
import { revalidatePath } from 'next/cache';

export async function submitOrder(formData: FormData) {
  const supabase = await createServerClient();
  
  // Validation des champs
  const fullName = formData.get('fullName') as string;
  const phone = formData.get('phone') as string;
  // ... insertion en base
  
  revalidatePath('/admin/orders'); // Rafraîchit le back-office immédiatement
  return { success: true };
}
```

### Règle #4 : Zéro Régression sur les Données Existantes

Lors de la refonte depuis l'ancien site :
1. **Conserver scrupuleusement les clés `localStorage`** (ex: `ammode_cart_v1` ou `cart_items`) pour que les paniers des clients existants ne soient pas vidés.
2. **Conserver la même structure d'URL** (ex: `/product/[slug]`, `/catalog`, `/cart`) pour préserver le référencement Google.
3. **Conserver les cookies d'authentification** et la signature des sessions.

---

## 4. Plan d'Optimisation Global du Projet

### 4.1 Frontend & Core Web Vitals (Lighthouse 95–100)

1. **Images WebP/AVIF automatiques avec `<Image />`** :
   - Indiquer toujours `sizes` pour éviter de charger des photos de 2000 px sur mobile :
     ```tsx
     <Image
       src={product.image_url}
       alt={product.name}
       fill
       sizes="(max-width: 768px) 50vw, (max-width: 1200px) 33vw, 25vw"
       priority={isFirstImage} // True pour la 1ère image (LCP sous 1.2s)
       loading={isFirstImage ? 'eager' : 'lazy'}
     />
     ```
2. **Polices auto-hébergées avec `next/font`** :
   - Évite les requêtes lentes vers `fonts.googleapis.com` et élimine tout Layout Shift (CLS = 0) :
     ```tsx
     import { Outfit } from 'next/font/google';
     const outfit = Outfit({ subsets: ['latin'], display: 'swap' });
     ```
3. **Imports Dynamiques pour les Composants Lourds** :
   - Graphiques d'administration ou modales complexes chargés uniquement lors du clic utilisateur :
     ```tsx
     import dynamic from 'next/dynamic';
     const AdminChart = dynamic(() => import('@/components/admin/Chart'), { ssr: false });
     ```

### 4.2 Backend & Base de Données

1. **Activation du Cache de Données Next.js (`unstable_cache` / `fetch cache`)** :
   - Mettre en cache les requêtes de catalogue (ex: 60 secondes ou invalidation par tag).
   - Lors d'une modification produit dans l'admin, appeler `revalidateTag('products')` pour purger le cache instantanément.
2. **Connection Pooling** :
   - Ne jamais ouvrir une nouvelle connexion SQL par requête.
   - Utiliser le pool Supabase (Port 6543 avec pooler PgBouncer) ou un pool `mysql2` / `pg` avec `max: 10` connexions par worker.
3. **Index SQL Indispensables** :
   - Créer des index sur les colonnes filtrées fréquemment :
     ```sql
     CREATE INDEX IF NOT EXISTS idx_products_category ON products(category_id);
     CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
     CREATE INDEX IF NOT EXISTS idx_products_created_at ON products(created_at DESC);
     ```

---

## 5. Configuration Complète du VPS (Guide Pratique Prêt à l'Emploi)

### 5.1 Prérequis Système (Ubuntu 22.04 / 24.04 LTS)

Connectez-vous en SSH à votre VPS (`ssh root@ip_du_vps`) :

```bash
# 1. Mise à jour du système
sudo apt update && sudo apt upgrade -y

# 2. Installation de Node.js (Version LTS 20 ou 22)
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs nginx git ufw fail2ban

# 3. Installation de PM2 globalement
sudo npm install -g pm2

# 4. Configuration d'un fichier SWAP (Vital sur VPS 1-2 Go de RAM pour compiler Next.js sans crash)
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
```

### 5.2 Configuration Next.js en mode Standalone

Dans le projet (`next.config.ts` ou `next.config.js`) :

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone', // <--- GÉNÈRE LE BUNDLE ULTRA-OPTIMISÉ POUR VPS
  images: {
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 jours de cache pour les images
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
```

### 5.3 Configuration PM2 (`ecosystem.config.js`)

Créez ce fichier à la racine de votre projet sur le VPS :

```javascript
module.exports = {
  apps: [
    {
      name: 'boutique-next',
      script: '.next/standalone/server.js',
      instances: 'max', // Utilise tous les cœurs CPU du VPS
      exec_mode: 'cluster',
      env: {
        PORT: 3000,
        NODE_ENV: 'production',
      },
      max_memory_restart: '800M', // Redémarre si fuite de mémoire
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
    },
  ],
};
```

### 5.4 Configuration Nginx Optimisée (`/etc/nginx/sites-available/mon-site`)

Remplacez `votredomaine.com` et `/var/www/mon-site` par vos valeurs réelles :

```nginx
# Rate Limiting pour protéger l'API et les formulaires contre les attaques
limit_req_zone $binary_remote_addr zone=one:10m rate=20r/s;

server {
    listen 80;
    server_name votredomaine.com www.votredomaine.com;

    # Emplacement des fichiers de l'application
    root /var/www/mon-site;

    # En-têtes de sécurité
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;

    # Compression Gzip
    gzip on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml application/json application/javascript application/rss+xml font/woff2 image/svg+xml;

    # 1. Assets Statiques Next.js : Cache IMMUABLE de 1 an
    location /_next/static/ {
        alias /var/www/mon-site/.next/static/;
        expires 365d;
        access_log off;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 2. Fichiers publics (favicon, logos, images statiques)
    location /public/ {
        alias /var/www/mon-site/public/;
        expires 30d;
        access_log off;
        add_header Cache-Control "public, max-age=2592000";
    }

    # 3. Proxy inverse vers l'application Node.js / Next.js
    location / {
        limit_req zone=one burst=40 nodelay;

        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        
        # En-têtes WebSocket et transmission de l'IP réelle du visiteur
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_cache_bypass $http_upgrade;
        proxy_read_timeout 60s;
        proxy_connect_timeout 60s;
    }
}
```

Activez le site et installez le certificat SSL gratuit :
```bash
sudo ln -s /etc/nginx/sites-available/mon-site /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# Installation du certificat SSL Let's Encrypt (Automatique & Renouvelable)
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d votredomaine.com -d www.votredomaine.com
```

### 5.5 Sécurisation du Pare-feu (UFW & Fail2ban)

```bash
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh          # Port 22 (ou votre port SSH personnalisé)
sudo ufw allow 'Nginx Full' # Ports 80 (HTTP) et 443 (HTTPS)
sudo ufw enable

sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

---

## 6. Script de Déploiement Automatisé en 1 Clic (`deploy.sh`)

Créez ce script sur votre VPS dans `/var/www/mon-site/deploy.sh` :

```bash
#!/bin/bash
set -e

echo "🚀 Début du déploiement..."

# 1. Récupération des dernières modifications
git pull origin main

# 2. Installation des dépendances propres
npm ci

# 3. Compilation optimisée Next.js
npm run build

# 4. Copie des fichiers statiques nécessaires au mode standalone
cp -r public .next/standalone/
cp -r .next/static .next/standalone/.next/

# 5. Rechargement de l'application sans coupure de service (Zero-Downtime)
pm2 reload ecosystem.config.js --update-env

echo "✅ Déploiement terminé avec succès ! Service 100% en ligne."
```

Rendez-le exécutable :
```bash
chmod +x /var/www/mon-site/deploy.sh
```

Pour déployer chaque nouvelle version :
```bash
./deploy.sh
```

---

## 7. Synthèse : La Checklist de Réussite

- [x] **Zéro cold start** : Vérifier que `pm2 status` montre l'application en cours d'exécution continue (*uptime* croissant).
- [x] **Standalone actif** : Vérifier la présence de `.next/standalone/server.js` après le build.
- [x] **Nginx en frontal** : `curl -sI https://votredomaine.com/_next/static/...` renvoie `Cache-Control: immutable` directement depuis Nginx.
- [x] **Images Sharp** : Vérifier que les images servies sur mobile sont au format `image/avif` ou `image/webp`.
- [x] **Panier conservé** : Tester un ajout au panier, rafraîchir la page, naviguer : le panier persiste via le `localStorage`.
- [x] **Lighthouse Mobile** : Lancer un audit Google Lighthouse : Viser 95+ en Performance, 100 en SEO et 100 en Accessibilité.
