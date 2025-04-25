#!/usr/bin/env bash

# Installer les dépendances nécessaires pour Chromium
apt-get update && apt-get install -y \
  libnss3 \
  libxss1 \
  libasound2 \
  libatk1.0-0 \
  libatk-bridge2.0-0 \
  libcups2 \
  libdrm2 \
  libgbm1 \
  libgtk-3-0 \
  libnspr4 \
  libxcomposite1 \
  fonts-liberation \
  libappindicator3-1 \
  xdg-utils
npm intall
# Copier Chromium local dans le dossier de build
cp -r chrome-bin $RENDER_ROOT/
