---
name: responsive-ui-ux
description: Reglas y estándares de diseño y arquitectura Responsive UI/UX (Mobile-First, Breakpoints, Adaptabilidad de Layouts, Menús Colapsables/Drawers, Touch Targets y optimización para todos los dispositivos).
---

# Responsive UI/UX Design & Engineering Skill

Este skill define las reglas obligatorias de diseño responsivo y adaptabilidad multidispositivo para evitar solapamientos, desbordamientos (*overflow bugs*) y experiencias degradadas en resoluciones móviles, tablets y monitores ultrawide.

---

## 1. Regla de Oro: Mobile-First y Adaptabilidad Real

> **"Un diseño no es responsivo si solo se achica; es responsivo si reorganiza su arquitectura para la ergonomía del dispositivo."**

En resoluciones estrechas (< 1024px), los paneles fijos de escritorio (sidebars, split views, inspectores dobles) **deben transformarse** en:
* **Drawers / Sheets deslizables** con fondo desenfocado (*backdrop-blur*).
* **Vistas de pestañas o acordeones.**
* **Tarjetas apiladas verticalmente** (`flex-col lg:flex-row`).

---

## 2. Sistema de Breakpoints Estándar

| Breakpoint | Ancho (px) | Dispositivos | Comportamiento del Layout |
| :--- | :--- | :--- | :--- |
| **`xs` / Mobile** | `< 640px` | Smartphones (iPhone, Pixel, Galaxy) | 1 Columna, Sidebar oculto en Drawer/Sheet, Barra inferior fija o menú hamburguesa. |
| **`sm` / Tablet Mini**| `640px - 767px` | Teléfonos grandes / Phablets | 1 a 2 Columnas, espaciado compacto (`p-3`), botones táctiles de mínimo 44px. |
| **`md` / Tablet** | `768px - 1023px`| iPads, Tablets Android | Sidebar colapsable (icono + hover) o Drawer, grid 2 columnas. |
| **`lg` / Laptop** | `1024px - 1279px`| MacBooks, Laptops estándar | Sidebar fijo visible, vistas divididas (Split View), layout 3 columnas. |
| **`xl` / Desktop** | `>= 1280px` | Monitores de escritorio | Ancho máximo contenido (`max-w-7xl mx-auto`), paneles laterales extendidos. |

---

## 3. Patrones de Componentes Responsivos

### A. Sidebar / Panel Lateral (Desktop vs Mobile)
* **Desktop (`lg:` en adelante):**
  * `w-72` o `w-80`, fijo a la izquierda o estático en el flujo `flex`.
* **Mobile / Tablet (`< lg`):**
  * **Oculto por defecto:** `hidden lg:flex`.
  * **Activación mediante botón hamburguesa o botón flotante:** Abre un `<aside>` en posición `fixed inset-y-0 left-0 z-50` con animación de entrada (`translate-x-0` vs `-translate-x-full`).
  * **Backdrop interactivo:** Fondo oscuro translúcido `bg-slate-900/60 backdrop-blur-sm fixed inset-0 z-40` que cierra el panel al tocar fuera.

```jsx
{/* Ejemplo de estructura responsiva de Sidebar */}
{/* 1. Backdrop Móvil */}
{isMobileOpen && (
  <div 
    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden transition-opacity"
    onClick={() => setIsMobileOpen(false)}
  />
)}

{/* 2. Drawer Móvil + Sidebar Desktop */}
<aside className={`
  fixed inset-y-0 left-0 z-50 w-80 bg-slate-900 transition-transform duration-300 ease-in-out
  lg:static lg:translate-x-0 lg:z-auto
  ${isMobileOpen ? 'translate-x-0' : '-translate-x-full'}
`}>
  {/* Contenido del Sidebar */}
</aside>
```

---

### B. Chat & Área de Mensajes (Ajuste al Teclado y Viewport)
* **Uso de `100dvh` en lugar de `100vh`:** Evita que la barra de direcciones de Safari/Chrome móvil tape el input de chat.
  * `h-[100dvh]` o `h-screen max-h-[100dvh]`.
* **Área de Scroll Independiente:**
  * El contenedor de mensajes debe tener `flex-1 overflow-y-auto overflow-x-hidden`.
* **Input de Mensajes Fijo Abajo:**
  * `sticky bottom-0` o dentro del flujo `flex-col` con padding seguro para dispositivos con barra de gestos (`pb-4 pb-safe`).

---

### C. Bento Grids y Tablas de Datos
* **Grids Adaptativos:**
  * Usar: `grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4`.
  * Las tarjetas anchas de 2 columnas solo deben ser `col-span-1 md:col-span-2`.
* **Tablas de Datos en Móvil:**
  * **Opción 1:** Contenedor con scroll horizontal suave `overflow-x-auto w-full` con sombra de desbordamiento.
  * **Opción 2 (Recomendada):** En pantallas `< 768px`, transformar las filas de tabla en **tarjetas de datos individuales** (*Card List*).

---

## 4. Ergonomía Táctil y Touch Targets

1. **Tamaño Mínimo de Botones Táctiles:**
   * Todo botón o elemento clicable en móvil debe tener un área mínima de **44px × 44px** (`min-h-[44px] min-w-[44px]` o `p-3`).
2. **Espaciado de Toque:**
   * Margen de al menos `8px` (`gap-2` o `space-y-2`) entre botones adyacentes para evitar toques erróneos.
3. **Inputs y Fuente para Evitar Auto-Zoom en iOS:**
   * En iOS Safari, los `<input>` o `<textarea>` con `font-size < 16px` provocan zoom automático que rompe el layout.
   * Usar siempre `text-base sm:text-sm` en campos de texto.

---

## 5. Checklist de Verificación Responsiva (Pre-Entrega)

- [ ] **Sin Scroll Horizontal Involuntario:** Ningún elemento excede el `100vw` (`overflow-x-hidden` en el contenedor raíz).
- [ ] **Prueba de Breakpoint Móvil (375px a 480px):** Verificar que la pantalla completa sea legible y navegable sin solapamientos.
- [ ] **Prueba de Breakpoint Tablet (768px a 1024px):** Verificar que los grids y paneles no se compriman excesivamente.
- [ ] **Sidebar en Pantallas Pequeñas:** Se oculta correctamente y se abre mediante Drawer/Sheet con botón visible.
- [ ] **Textos Largos y Badges:** Usar `truncate` o `break-words` para evitar que títulos o códigos desborden tarjetas.
- [ ] **Imágenes y Gráficos:** Siempre con `w-full h-auto object-cover` o `max-w-full`.
