#!/usr/bin/env bash

# Mettre à jour les paquets du système
apt-get update

# Installer les dépendances nécessaires pour exécuter Playwright
apt-get install -y wget curl unzip \
    libnss3 libatk1.0-0 libatk-bridge2.0-0 libcups2 libxkbcommon0 \
    libxcomposite1 libxrandr2 libxdamage1 libfontconfig1 libdrm2 \
    libgbm1 libasound2 libpangocairo-1.0-0 libpangoft2-1.0-0

# Installer Playwright avec les navigateurs nécessaires
npx playwright install --with-deps