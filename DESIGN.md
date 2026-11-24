# Sistema de Diseño y Directivas de Marca — SicaEstudio

Este documento establece la identidad visual, paleta cromática, directivas tipográficas y patrones de interfaz para **SicaEstudio**. La estética está inspirada en el universo editorial, la papelería fina y el etiquetado artesanal ("Warm Vanilla & Antique Brass / Editorial Craft").

---

## 1. Extracción Cromática del Isotipo (`logo.jpg`)

Del análisis colorimétrico del archivo de marca original en `public/logo.jpg`:

| Muestra | Elemento Original | HEX | RGB | HSL | Rol en Marca |
| :--- | :--- | :--- | :--- | :--- | :--- |
| ![#F0D79E](https://via.placeholder.com/16/F0D79E/000000?text=+) | **Fondo Vainilla Cálido** | `#F0D79E` | `240, 215, 158` | `42°, 73%, 78%` | Tono base de identidad, calidez y artesanía |
| ![#A18417](https://via.placeholder.com/16/A18417/FFFFFF?text=+) | **Tipografía Ocre Dorado (SICA)** | `#A18417` | `161, 132, 23` | `47°, 75%, 36%` | Color primario de marca, prestigio y firma |

---

## 2. Paleta de Colores Completa ("Warm Vanilla Studio")

La paleta se aleja intencionalmente del blanco clínico y del negro puro (`#000000`), optando por una atmósfera cálida, orgánica, moderna y de alta gama.

### A. Primarios (Golden Ochre / Ocre Dorado de Sica)
Es el color insignia de la marca extraído del trazo del logo. Comunica exclusividad, detalle manual y calidez.

* **Primary 50** (`#FAF7EC`): Fondos de insignias y banners suaves.
* **Primary 100** (`#F4ECCF`): Chips seleccionados y estados hover sutiles.
* **Primary 200** (`#E8D99E`): Bordes destacados y filetes decorativos.
* **Primary 300** (`#DCBF68`): Acentos en ilustraciones e iconos.
* **Primary 400** (`#BC9D21`): Estados hover de botones secundarios.
* **Primary 500 (Core)** (`#A18417`): **Color corporativo principal**. Botones primarios, enlaces activos, logotipo e isotipos.
* **Primary 600** (`#846C12`): Hover de botones primarios.
* **Primary 700** (`#66520D`): Textos con énfasis de color de alto contraste.
* **Primary 800** (`#4A3B09`): Títulos decorativos profundos.
* **Primary 900** (`#2E2405`): Sombras y contrastes tonales extremos.

### B. Sistema Base Vainilla & Superficies
Garantiza que la interfaz se perciba envolvente, artesanal y limpia.

* **Vanilla Canvas** (`#FAF7F0`): Fondo principal de toda la aplicación. Aporta serenidad y textura visual.
* **Vanilla Card / Surface** (`#FFFFFF`): Fondo de tarjetas de producto y paneles interactivos, creando una elevación limpia sobre el Canvas.
* **Vanilla Soft** (`#F5EFE6`): Fondos de secciones alternas, headers secundarios y hovers de menú.
* **Vanilla Accent / Hero** (`#F0D79E`): El color exacto de fondo del isotipo. Se usa en chips destacados, banners promocionales y tarjetas de categoría.
* **Vanilla Deep** (`#DDC385`): Tono vainilla tostado para divisores y bordes activos.
* **Vanilla Border** (`#E8DECF`): Líneas de división y bordes de tarjetas sutiles pero visibles.

### C. Secundarios (Tonalidades Tierra & Botánica)
Enriquecen la vidriera y categorizan los productos de forma natural:

* **Terracotta Wine** (`#8C533E`): Tono terracota/arcilla noble. Ideal para categorías de vinos, etiquetas y sellos.
* **Olive Salvia** (`#5A6347`): Verde oliva atenuado. Evoca naturaleza, hojas secas y papelería ecológica.
* **Sand Neutral** (`#C4B59D`): Arena neutro para metadatos, fechas o pies de foto.

### D. Contraste & Tipografía (Warm Noir)
Negros y grises con base cálida que ofrecen máxima legibilidad sin la agresividad del negro digital.

* **Noir 900 (High Contrast)** (`#1C1917`): Títulos principales (H1, H2, H3) y texto de alto impacto.
* **Noir 800 (Body Text)** (`#292524`): Párrafos, descripciones de productos e inputs de formularios.
* **Noir 600 (Muted)** (`#57534E`): Textos secundarios, breadcrumbs y categorías en tarjetas.
* **Noir 400 (Subtle)** (`#A8A29E`): Placeholders, iconos inactivos y bordes tenues.

### E. Acento de Conversión (WhatsApp CTA)
* **WhatsApp Emerald** (`#1EBE5D`): Verde fresco pero equilibrado, optimizado para contrastar con el fondo vainilla y generar clics claros hacia la venta directa.
* **WhatsApp Hover** (`#17A34E`): Estado activo en interacción.

---

## 3. Tipografía

El maridaje tipográfico combina la elegancia editorial con la claridad de interfaces contemporáneas:

1. **Titulares y Marca (Display / Serif):**
   * **Fuente:** `Playfair Display` (o `Cinzel` / `Cormorant Garamond`)
   * **Uso:** Nombre de marca en Navbar, H1 del Hero, títulos de secciones de la vidriera y nombres de productos premium.
   * **Atributos:** Tracking ligeramente abierto (`tracking-tight`), peso `font-semibold` o `font-bold`.

2. **Cuerpo e Interfaz (UI / Sans):**
   * **Fuente:** `Geist Sans`
   * **Uso:** Navegación, descripciones, botones, badges, precios y panel de administración.
   * **Atributos:** Proporciones humanistas, excelente legibilidad en dispositivos móviles.

---

## 4. Principios de Interfaz (UI/UX)

1. **Vidriera Inmersiva (Experience Mode):**
   * Las imágenes de los trabajos son las protagonistas indiscutidas.
   * Cada tarjeta de producto cuenta con un contenedor cuadrado (`aspect-square`) con `object-cover`.
   * En hover en desktop, la imagen escala suavemente (`scale-105`) con una transición de 300ms.

2. **Contraste y Jerarquía:**
   * Las tarjetas descansan sobre un lienzo suave `#FAF7F0`, con un borde de 1px en `#E8DECF` y esquinas redondeadas `rounded-2xl`.
   * La elevación no usa sombras grises oscuras, sino sombras difuminadas con leve tinte cálido: `shadow-[0_4px_24px_-4px_rgba(28,25,23,0.06)]`.

3. **Interacciones Físicas y Táctiles (Directivas Emil Kowalski):**
   * Botones con respuesta inmediata al pulsar: `active:scale-[0.98]`.
   * Transición uniforme: `transition-all duration-200 ease-out`.

4. **Botón de WhatsApp Prominente:**
   * Cada producto ofrece un botón claro y directo que abre el chat con el mensaje pre-cargado.
   * Ícono oficial de WhatsApp con contraste blanco puro sobre verde esmeralda.

---

## 5. Mapeo de Tokens en Tailwind CSS

```css
:root {
  --background: #FAF7F0;
  --foreground: #1C1917;
  --surface: #FFFFFF;
  --surface-hover: #F5EFE6;
  --border: #E8DECF;
  
  --brand-primary: #A18417;
  --brand-primary-hover: #866D12;
  --brand-primary-light: #FAF7EC;

  --brand-vanilla: #F0D79E;
  --brand-vanilla-soft: #F5EFE6;
  --brand-vanilla-deep: #DDC385;

  --brand-terracotta: #8C533E;
  --brand-olive: #5A6347;
}
```
