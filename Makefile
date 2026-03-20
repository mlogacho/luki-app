# =============================================================================
# Makefile — LUKI App
# Targets de desarrollo, build y mantenimiento.
# =============================================================================

.PHONY: setup run web ios android build test clean freeze help

# ── Ayuda ─────────────────────────────────────────────────────────────────────
help: ## Muestra esta ayuda
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-12s\033[0m %s\n", $$1, $$2}'

# ── Configuración inicial ──────────────────────────────────────────────────────
setup: ## Instala dependencias y configura .env
	@bash scripts/setup.sh

# ── Desarrollo ────────────────────────────────────────────────────────────────
run: ## Inicia Expo en modo desarrollo (QR para Expo Go)
	npx expo start

web: ## Inicia Expo en modo web
	npx expo start --web

ios: ## Inicia Expo con simulador iOS
	npx expo start --ios

android: ## Inicia Expo con emulador Android
	npx expo start --android

# ── Build ─────────────────────────────────────────────────────────────────────
build: ## Exporta la versión web estática (salida en dist/)
	npx expo export --platform web

# ── Tests ──────────────────────────────────────────────────────────────────────
test: ## Ejecuta la suite de tests con Jest
	npm test

test-watch: ## Ejecuta tests en modo watch
	npm test -- --watch

# ── Dependencias ──────────────────────────────────────────────────────────────
freeze: ## Muestra paquetes con actualizaciones disponibles
	npm outdated

audit: ## Ejecuta auditoría de seguridad
	npm audit

# ── Limpieza ──────────────────────────────────────────────────────────────────
clean: ## Elimina node_modules/, dist/ y caché de Expo
	rm -rf node_modules dist .expo
	@echo "Limpieza completada."
