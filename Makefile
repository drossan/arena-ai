# ArenaAI Makefile
# Sistema de comandos para desarrollo y despliegue

.PHONY: help install dev dev-convex build start lint clean test deploy-convex

# Variables
NODE_BIN := node_modules/.bin
CONVEX := npx convex

# Colores para output
COLOR_RESET := \033[0m
COLOR_BOLD := \033[1m
COLOR_GREEN := \033[32m
COLOR_BLUE := \033[34m
COLOR_YELLOW := \033[33m
COLOR_RED := \033[31m

## ▶ help: Muestra este mensaje de ayuda
help:
	@echo '$(COLOR_BOLD)ArenaAI - Comandos disponibles:$(COLOR_RESET)'
	@echo ''
	@sed -n 's/^##//p' ${MAKEFILE_LIST} | column -t -s ':' | sed -e 's/^/ /'
	@echo ''

## ▶ install: Instala todas las dependencias
install:
	@echo '$(COLOR_BLUE)Instalando dependencias...$(COLOR_RESET)'
	npm install
	@echo '$(COLOR_GREEN)✓ Dependencias instaladas$(COLOR_RESET)'

## ▶ dev: Inicia el servidor de desarrollo (Next.js)
dev:
	@echo '$(COLOR_BLUE)Iniciando Next.js en http://localhost:3000$(COLOR_RESET)'
	npm run dev

## ▶ dev-convex: Inicia solo Convex en modo desarrollo
dev-convex:
	@echo '$(COLOR_BLUE)Iniciando Convex...$(COLOR_RESET)'
	$(CONVEX) dev

## ▶ dev-all: Inicia ambos servidores (Convex + Next.js) en terminales separadas
dev-all:
	@echo '$(COLOR_BLUE)Iniciando Convex y Next.js...$(COLOR_RESET)'
	@$(MAKE) -j2 dev-convex dev

## ▶ build: Compila el proyecto para producción
build:
	@echo '$(COLOR_BLUE)Compilando para producción...$(COLOR_RESET)'
	npm run build
	@echo '$(COLOR_GREEN)✓ Build completado$(COLOR_RESET)'

## ▶ start: Inicia el servidor de producción
start:
	@echo '$(COLOR_BLUE)Iniciando servidor de producción...$(COLOR_RESET)'
	npm run start

## ▶ lint: Ejecuta el linter de código
lint:
	@echo '$(COLOR_BLUE)Ejecutando linter...$(COLOR_RESET)'
	npm run lint

## ▶ lint-fix: Ejecuta el linter y corrige automáticamente
lint-fix:
	@echo '$(COLOR_BLUE)Ejecutando linter con autocorrección...$(COLOR_RESET)'
	npx next lint --fix

## ▶ clean: Limpia archivos de build y dependencias
clean:
	@echo '$(COLOR_YELLOW)Limpiando archivos de build...$(COLOR_RESET)'
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf convex/_generated
	@echo '$(COLOR_GREEN)✓ Limpieza completada$(COLOR_RESET)'

## ▶ clean-all: Limpia todo incluyendo node_modules
clean-all:
	@echo '$(COLOR_RED)⚠️  Limpiando todo el proyecto...$(COLOR_RESET)'
	rm -rf .next
	rm -rf node_modules
	rm -rf convex/_generated
	@echo '$(COLOR_GREEN)✓ Limpieza completa finalizada$(COLOR_RESET)'

## ▶ reinit: Limpia y reinstala todo desde cero
reinit: clean-all install
	@echo '$(COLOR_GREEN)✓ Proyecto reinicializado$(COLOR_RESET)'

## ▶ convex-deploy: Despliega Convex a producción
convex-deploy:
	@echo '$(COLOR_BLUE)Desplegando Convex...$(COLOR_RESET)'
	$(CONVEX) deploy
	@echo '$(COLOR_GREEN)✓ Convex desplegado$(COLOR_RESET)'

## ▶ convex-init: Inicializa Convex en modo desarrollo
convex-init:
	@echo '$(COLOR_BLUE)Inicializando Convex...$(COLOR_RESET)'
	$(CONVEX) dev --once
	@echo '$(COLOR_GREEN)✓ Convex inicializado$(COLOR_RESET)'

## ▶ type-check: Verifica tipos de TypeScript
type-check:
	@echo '$(COLOR_BLUE)Verificando tipos de TypeScript...$(COLOR_RESET)'
	npx tsc --noEmit
	@echo '$(COLOR_GREEN)✓ Tipos correctos$(COLOR_RESET)'

## ▶ format: Formatea el código con Prettier
format:
	@echo '$(COLOR_BLUE)Formateando código...$(COLOR_RESET)'
	npx prettier --write "src/**/*.{ts,tsx,js,jsx,json,css,md}"
	@echo '$(COLOR_GREEN)✓ Código formateado$(COLOR_RESET)'

## ▶ test: Ejecuta tests (cuando estén implementados)
test:
	@echo '$(COLOR_YELLOW)⚠️  Tests no implementados aún$(COLOR_RESET)'

## ▶ cov-explorer: Abre el explorador de Convex
cov-explorer:
	@echo '$(COLOR_BLUE)Abriendo explorador de Convex...$(COLOR_RESET)'
	$(CONVEX) dashboard

## ▶ check: Ejecuta todas las verificaciones (lint + type-check)
check: lint type-check
	@echo '$(COLOR_GREEN)✓ Todas las verificaciones pasaron$(COLOR_RESET)'

## ▶ pre-commit: Hook pre-commit (lint + type-check)
pre-commit: check
	@echo '$(COLOR_GREEN)✓ Pre-commit passed$(COLOR_RESET)'

## ▶ upgrade: Actualiza dependencias a las últimas versiones
upgrade:
	@echo '$(COLOR_YELLOW)Actualizando dependencias...$(COLOR_RESET)'
	npx npm-check-updates -u
	npm install
	@echo '$(COLOR_GREEN)✓ Dependencias actualizadas$(COLOR_RESET)'

## ▶ outdated: Muestra dependencias desactualizadas
outdated:
	@echo '$(COLOR_BLUE)Verificando dependencias desactualizadas...$(COLOR_RESET)'
	npm outdated

## ▶ deps-tree: Muestra el árbol de dependencias
deps-tree:
	@echo '$(COLOR_BLUE)Generando árbol de dependencias...$(COLOR_RESET)'
	npm ls --depth=0

## ▶ info: Muestra información del proyecto
info:
	@echo '$(COLOR_BOLD)ArenaAI - Información del Proyecto$(COLOR_RESET)'
	@echo ''
	@echo 'Node: $(shell node --version)'
	@echo 'npm: $(shell npm --version)'
	@echo ''
	@echo 'Variables de entorno:'
	@if [ -f .env.local ]; then \
		echo '✓ .env.local existe'; \
	else \
		echo '✗ .env.local NO existe (crea desde .env.local.example)'; \
	fi
	@echo ''
	@echo 'Dependencias principales:'
	@npm list next convex openrouter-kit framer-motion typescript --depth=0 2>/dev/null | grep -E 'next|convex|openrouter|framer|typescript'

## ▶ new-component: Crea un nuevo componente (uso: make new-component NAME=MiComponente)
new-component:
	@if [ -z "$(NAME)" ]; then \
		echo '$(COLOR_RED)Error: Especifica NAME=NombreDelComponente$(COLOR_RESET)'; \
		exit 1; \
	fi
	@echo '$(COLOR_BLUE)Creando componente: $(NAME)$(COLOR_RESET)'
	@mkdir -p src/components
	@printf "import { cn } from '@/lib/utils'\n\nexport interface $(NAME)Props {\n  className?: string\n}\n\nexport function $(NAME)({ className }: $(NAME)Props) {\n  return (\n    <div className={cn(\"\", className)}>\n      <!-- $(NAME) content -->\n    </div>\n  )\n}\n" > src/components/$(NAME).tsx
	@echo '$(COLOR_GREEN)✓ Componente creado en src/components/$(NAME).tsx$(COLOR_RESET)'

## ▶ size: Analiza el tamaño del bundle
size:
	@echo '$(COLOR_BLUE)Analizando tamaño del bundle...$(COLOR_RESET)'
	npx next build --debug
	@echo '$(COLOR_YELLOW)Revisa el output para ver el tamaño de cada página$(COLOR_RESET)'
