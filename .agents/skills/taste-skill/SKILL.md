---
name: taste-skill
description: Anti-slop frontend design taste skill inspired by Leonxlnx and top-tier products (Linear, Stripe, Raycast, Vercel). Enforces intentional UI curation, asymmetric layouts, distinct vibes, and eliminates generic AI templates.
---

# Taste Skill: Anti-Slop Frontend Curation & Design Direction

Este skill elimina el "código promedio genérico de IA" (*AI slop*) y transforma las interfaces en experiencias digitales con **carácter, dirección de arte e identidad premium**, inspiradas en productos de referencia mundial como **Linear, Stripe, Raycast, Supabase, Vercel y Apple**.

---

## 1. El Protocolo "Design Read" (Obligatorio Antes de Diseñar)

Antes de generar o modificar componentes visuales, el agente debe formular mentalmente su **Design Read**:
1. **Audiencia y Contexto:** ¿Quién usará esto? (Ej: Consultores de negocios, desarrolladores, directivos, usuarios finales).
2. **Atmósfera y Vibe:** ¿Es analítico y denso? ¿Es editorial y elegante? ¿Es técnico y minimalista?
3. **Decisión de Acento:** Seleccionar un acento intencional (ej. Slate + Cyan técnico para analítica; Zinc + Esmeralda para finanzas; Carbón + Ámbar para operaciones).

---

## 2. Los Patrones Prohibidos ("Banned AI Slop")

| ❌ Lo que la IA promedio genera (Prohibido) |  Lo que exige Taste Skill (Estándar Real) |
| :--- | :--- |
| **Gradientes cliché púrpura/azul neón** de fondo sin sentido. | Fondos limpios con sutiles mallas de puntos (`dot-grid`), texturas de ruido suave o desenfoque en capas. |
| **Grid simétrico de 3 tarjetas idénticas** ("Rápido, Seguro, Escalable"). | **Bento Grids asimétricos** con tarjetas de diferente jerarquía (hero card 2x2, mini stats 1x1, visual canvas). |
| **Hero centrado genérico:** "Transforma tu negocio con IA" + 2 botones píldora. | **Hero orientado a la acción:** Interfaz interactiva viva visible de inmediato (demo en vivo, consola, métricas reales). |
| **Texto gris ilegible** (`text-gray-400` sobre blanco). | **Alto contraste estructurado:** `text-slate-900` para títulos, `text-slate-600` para cuerpo, `font-mono` para métricas y IDs. |
| **Cards flotantes sin bordes definidos.** | **Bordes sutiles con luz:** `border border-slate-200/80` con hover `border-cyan-400/50` y sombra multicapa. |

---

## 3. Principios de "Taste" de Productos Reales

### 1. Bento Grids Asimétricos y Ricos en Información (Estilo Apple / Linear)
En lugar de tarjetas vacías, combina:
* Una tarjeta destacada con gráfico o vista interactiva en vivo (ocupa 2 columnas).
* Tarjetas compactas de métricas clave con deltas porcentuales y badges de estado.
* Micro-paneles con código o comandos (`font-mono bg-slate-900 text-slate-100 rounded-xl`).

### 2. Micro-Detalles de Ingeniería Frontend (Estilo Raycast / Vercel)
* **Status Indicators Vivos:** Puntos de estado con anillo de resplandor suave:
  ```jsx
  <span className="relative flex h-2 w-2">
    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
  </span>
  ```
* **Kbd Badges / Atajos de Teclado:** Etiquetas con aspecto de tecla física:
  ```jsx
  <kbd className="px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-500 bg-slate-100 border border-slate-300 rounded-md shadow-[0_1px_0_1px_rgba(0,0,0,0.08)]">
    ⌘K
  </kbd>
  ```
* **Separadores Delicados:** Usa divisores sutiles `divide-y divide-slate-100` o bordes de 1px semitransparentes.

### 3. Tipografía con "Texture"
* Combina tipografía sans-serif limpia (`Inter`, `Geist`, `Plus Jakarta Sans`) con fragmentos monoespaciados (`JetBrains Mono`, `Geist Mono`, `Fira Code`) para datos técnicos, fechas, códigos de proyecto y cifras cuantitativas.
* Modula el `letter-spacing`: `tracking-tight` en titulares grandes y `tracking-widest` en subtítulos en mayúsculas de 10px.

---

## 4. Cuándo se activa este Skill
* Al diseñar o rediseñar pantallas completas, landings, paneles de control o dashboards.
* Siempre que se requiera dotar a la aplicación de un acabado estético de producto comercial de alta gama.
