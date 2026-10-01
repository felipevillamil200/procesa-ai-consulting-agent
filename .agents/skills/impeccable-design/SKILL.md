---
name: impeccable-design
description: Master principles of impeccable interaction design, micro-animations, typography, polished layouts, and craftsmanship inspired by Emil Kowalski, Linear, and modern UI engineering standards.
---

# Impeccable Design & Interaction Craftsmanship Skill

Este skill establece los estándares no negociables de diseño de interfaz de usuario, micro-interacciones, tipografía, movimiento y refinamiento visual de nivel Silicon Valley (inspirado en la filosofía de diseño de Emil Kowalski, Vercel/Geist, Linear y Apple Human Interface Guidelines).

---

## 1. Filosofía Central: "Craft & Polish"

Una interfaz no solo debe "funcionar", debe sentirse **viva, fluida y placentera**. Cada estado (hover, active, focus, loading, error, empty) debe estar intencionalmente diseñado.

> *"La diferencia entre una aplicación estándar y una aplicación extraordinaria reside en los últimos 20 píxeles y en los primeros 200 milisegundos de interacción."*

---

## 2. Los 7 Mandamientos del Diseño Impecable

### 1. Movimiento con Propósito y Física Natural (Spring & Bézier)
* **Nunca uses transiciones lineales (`ease-linear`)** para elementos de UI interactivos.
* **Curvas recomendadas:**
  * Entrada rápida y desaceleración suave: `cubic-bezier(0.16, 1, 0.3, 1)` (estándar de Apple/Linear).
  * Menús y Modales emergentes: `cubic-bezier(0.32, 0.72, 0, 1)`.
* **Duraciones óptimas:**
  * Micro-interacciones (hover, toggle, botones): `150ms - 200ms`.
  * Modales, paneles laterales (drawers) y popovers: `250ms - 350ms`.
* **Micro-feedback táctil:**
  * Botones y tarjetas clicables deben incluir `active:scale-[0.98]` o `active:scale-95` con `transition-all duration-150`.

### 2. Jerarquía Tipográfica y Ritmo Visual
* **Fuentes:** Usa familias tipográficas modernas con alto rendimiento y legibilidad (ej. Inter, Geist, Plus Jakarta Sans, Outfit, SF Pro).
* **Tracking (Letter-Spacing):**
  * Títulos grandes (`text-xl` a `text-4xl`): siempre usa `tracking-tight` o `tracking-tighter`.
  * Textos secundarios o etiquetas en mayúsculas (`text-[10px]` o `text-xs uppercase`): usa `tracking-wider` o `tracking-widest` con peso semibold o bold.
* **Contraste de color tipográfico:**
  * Texto primario: `text-slate-900` (Modo claro) / `text-slate-50` (Modo oscuro).
  * Texto secundario: `text-slate-500` / `text-slate-400`.
  * Texto terciario/metadatos: `text-slate-400` / `text-slate-500`.

### 3. Elevación, Sombras y Bordes Refinados
* **Evita sombras oscuras o pesadas de una sola capa.**
* **Sombras multicapa y sutiles:**
  * `shadow-sm`: `box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`.
  * `shadow-xl`: combina sombra difusa suave con un anillo de borde sutil (`ring-1 ring-slate-900/5` o `border border-slate-200/80`).
* **Bordes con opacidad suave:**
  * Usa `border-slate-200/80` o `border-white/10` para evitar líneas duras que corten la vista.

### 4. Fondos, Vidrio y Profundidad (Glassmorphism & Gradients)
* Modales y cabeceras flotantes deben usar fondos translúcidos con desenfoque:
  * `bg-white/80 backdrop-blur-md` o `bg-slate-900/80 backdrop-blur-lg`.
* Usa degradados de acento de baja saturación en fondos clave o botones primarios:
  * `bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-700 hover:to-blue-700`.

### 5. Estados Vacíos, Carga y Errores Vivos
* **Nunca dejes un estado en blanco:**
  * **Loading:** Usa skeletons pulsantes (`animate-pulse bg-slate-200/70 rounded-lg`) o spinners sutiles.
  * **Empty State:** Ícono ilustrado con badge suave, título explicativo, texto orientativo y un botón de llamada a la acción (CTA) claro.
  * **Badges:** Usa píldoras redondeadas con borde y fondo suave (`px-2.5 py-0.5 rounded-full text-xs font-medium border bg-emerald-50 text-emerald-700 border-emerald-200`).

### 6. Sistema de Espaciado Matemático (Regla de los 4px / 8px)
* Todos los espaciados, paddings y márgenes deben respetar múltiplos de 4 (Tailwind `p-1`, `p-2`, `p-3`, `p-4`, `p-6`, `gap-3`, `gap-4`, `gap-6`).
* Mantén consistencia de alineación óptica entre íconos y texto usando `inline-flex items-center gap-2`.

### 7. Cero Diálogos Nativos Bloqueantes
* **Prohibido el uso de `alert()`, `confirm()` o `prompt()` nativos del navegador.**
* Usa modales construidos con React/Tailwind, Toasts animados (estilo Sonner) o diálogos interactivos con animaciones de entrada `scale-up` y `fade-in`.

---

## 3. Snippets de Referencia "Kowalski Standard"

### Botón Primario con Micro-Interacción
```jsx
<button className="relative inline-flex items-center justify-center gap-2 px-4 py-2 text-xs font-semibold text-white transition-all duration-150 ease-out bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl shadow-sm hover:from-cyan-500 hover:to-blue-500 hover:shadow active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500/50">
  <Sparkles className="w-3.5 h-3.5" />
  <span>Acción Principal</span>
</button>
```

### Tarjeta con Hover Elevado y Borde Iluminado
```jsx
<div className="group relative p-5 bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-md hover:border-cyan-200 transition-all duration-200 ease-out">
  <div className="flex items-center justify-between">
    <h4 className="text-sm font-bold text-slate-900 tracking-tight group-hover:text-cyan-700 transition-colors">
      Título de Tarjeta
    </h4>
    <span className="w-2 h-2 rounded-full bg-cyan-500 group-hover:scale-125 transition-transform" />
  </div>
</div>
```
