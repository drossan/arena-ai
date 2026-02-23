# ⚔️ ArenaAI

**Street Fighter, but with AI models.**

Una plataforma de batallas en tiempo real entre modelos de inteligencia artificial. Los usuarios plantean un tema, eligen dos modelos de IA que se enfrentan en una arena virtual, y el público vota en directo al ganador.

![ArenaAI](https://img.shields.io/badge/Next.js-14-black?logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?logo=typescript)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.2-38bdf8?logo=tailwind-css)

## 🎮 Características

- **Batallas en tiempo real** entre modelos de IA (GPT-4o, Claude, Gemini, Llama, Mistral...)
- **Sistema de streaming** token por token para espectadores
- **Sistema de daño** basado en la calidad de los argumentos
- **Votación en vivo** del público
- **Estética cyberpunk** con animaciones de neón
- **Multi-agente** con Orchestator, Fighters, Referee y Commentator

## 🚀 Demo

```
┌──────────────────────────────────────────────────────┐
│  [HP ████████░░] GPT-4o      vs      Claude [HP ████░░░]  │
│                                                      │
│     🤖 Avatar azul              Avatar púrpura 🤖    │
│     (animado)                       (animado)        │
│                                                      │
│  ┌─────────────────┐        ┌─────────────────────┐  │
│  │  Argumento del  │  💥    │   Respuesta del     │  │
│  │  modelo A       │        │   modelo B          │  │
│  │  (streaming...) │        │   (streaming...)    │  │
│  └─────────────────┘        └─────────────────────┘  │
│                                                      │
│    👥 342 espectadores     [⚔️ VOTAR A | VOTAR B]   │
└──────────────────────────────────────────────────────┘
```

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|------------|
| Frontend & Backend | **Next.js 14** (App Router) |
| Base de datos reactiva | **Convex** |
| Modelos de IA | **OpenRouter** (via `openrouter-kit`) |
| Estilos | Tailwind CSS 4 |
| Animaciones | Framer Motion |
| Lenguaje | TypeScript 5.7 |

## 📦 Instalación

```bash
# Clonar el repositorio
git clone https://github.com/tu-usuario/arenaai.git
cd arenaai

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.local.example .env.local
```

## 🔑 Configuración

Edita `.env.local` con tus API keys:

```bash
# OpenRouter API Key
# Consíguela en: https://openrouter.ai/keys
OPENROUTER_API_KEY=sk-or-v1-...

# Convex (se genera automáticamente al ejecutar npx convex dev)
CONVEX_DEPLOYMENT=dev
NEXT_PUBLIC_CONVEX_URL=http://localhost:6789
```

## 🎯 Uso

### Desarrollo

```bash
# Terminal 1: Iniciar Convex
npx convex dev

# Terminal 2: Iniciar Next.js
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000)

### Comandos disponibles

```bash
npm run dev       # Inicia el servidor de desarrollo
npm run build     # Compila para producción
npm run start     # Inicia el servidor de producción
npm run lint      # Ejecuta el linter
```

## 🏗️ Estructura del Proyecto

```
ArenaAI/
├── src/
│   ├── app/              # Next.js App Router
│   │   ├── layout.tsx    # Layout principal
│   │   ├── page.tsx      # Página de inicio
│   │   └── globals.css   # Estilos globales
│   ├── agents/           # Sistema multi-agente
│   │   ├── orchestrator.ts  # Coordinador de batalla
│   │   ├── fighter.ts       # Agente de modelo combatiente
│   │   ├── referee.ts       # Árbitro que clasifica golpes
│   │   └── commentator.ts   # Comentarista de resúmenes
│   ├── skills/           # Documentación de skills
│   ├── lib/              # Utilidades
│   │   └── openrouter.ts # Cliente de OpenRouter
│   └── components/       # Componentes React
├── convex/               # Backend Convex
│   ├── schema.ts         # Esquema de datos
│   └── types.ts          # Tipos TypeScript
└── public/               # Archivos estáticos
```

## 🤖 Sistema Multi-Agente

ArenaAI utiliza un sistema multi-agente para gestionar las batallas:

```
┌─────────────────────────────────────────────────────────────┐
│                     Orchestrator Agent                      │
│                   (Director de escena)                      │
└───────────────────────────┬─────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│ Fighter Agent │   │ Fighter Agent │   │ Referee Agent │
│   (Model A)   │   │   (Model B)   │   │  (Clasificador)│
└───────────────┘   └───────────────┘   └───────────────┘
        │                   │                   │
        └───────────────────┼───────────────────┘
                            ▼
                   ┌───────────────┐
                   │ Commentator   │
                   │   (Resumen)   │
                   └───────────────┘
```

## 💥 Sistema de Daño

| Tipo de Argumento | Golpe | Daño |
|-------------------|-------|------|
| Argumento con datos y fuentes | ⚡ Lightning Strike | Alto |
| Analogía creativa y original | 🔥 Fire Slash | Medio-alto |
| Contra-argumento directo | 💥 Counter Attack | Medio |
| Argumento vago o genérico | 🫧 Weak Blow | Bajo |

## 🎨 Personajes

| Modelo | Personaje | Color |
|--------|-----------|-------|
| GPT-4o | Electric Blue Warrior | Azul neón |
| Claude 3.5 Sonnet | Purple Warrior | Púrpura |
| Gemini Pro | Neon Green Warrior | Verde neón |
| Llama 3 | Orange Wild Warrior | Naranja |
| Mistral | Ice White Warrior | Blanco hielo |

## 📚 Documentación

- **[CLAUDE.md](./CLAUDE.md)** - Guía para Claude Code
- **[Skills](./src/skills/)** - Documentación técnica por área

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 🙏 Agradecimientos

- **OpenRouter** - API unificada para múltiples modelos de IA
- **Convex** - Base de datos reactiva
- **Vercel** - Plataforma de deployment
- **Chatbot Arena (LMSYS)** - Inspiración para el concepto

---

**Hecho con ❤️ y 🤖 por el equipo de ArenaAI**
