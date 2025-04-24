#!/usr/bin/env bash

# Mettre à jour les paquets et installer les dépendances nécessaires
apt-get update && apt-get install -y \
  libnss3 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libxcomposite1 \
  libxrandr2 \
  libxdamage1 \
  libgbm1 \
  libasound2 \
  fonts-liberation \
  libappindicator3-1 \
  libxshmfence1 \
  libpangocairo-1.0-0 \
  libx11-xcb1 \
  libxshmfence-dev

# Installer les dépendances pour Puppeteer
npm install