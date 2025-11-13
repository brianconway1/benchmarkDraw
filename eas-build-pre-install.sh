#!/bin/bash
# EAS Build pre-install hook
# This ensures npm install uses --legacy-peer-deps
export npm_config_legacy_peer_deps=true

