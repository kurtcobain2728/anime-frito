# Anime1v API

Una API 100% Open Source construida en Node.js para hacer un scraping limpio y rapido de animes y episodios desde AnimeAV1.

[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)
[![Open Source](https://img.shields.io/badge/Open%20Source-Open-red)](#)

Esta herramienta fue desarrollada para facilitar la consulta y consumo de contenido automatizado. Ha sido liberada de manera gratuita para la comunidad. Si utilizas este codigo en tus proyectos, **por favor incluye los creditos correspondientes a su creador original (FxxMorgan)**.

---

## Caracteristicas

- Busqueda de Anime: Encuentra series, peliculas o especiales por su nombre.
- Informacion Detallada: Obten descripcion, generos, anio, lista completa de episodios y miniaturas.
- Extraccion de Enlaces de Video: Obtiene urls de streaming y descarga en multiples calidades y variaciones (SUB/DUB).
- Descargador Nativo Integrado: Cola de descargas desde los servidores de video directamente al disco.
- CLI Iterativo: Script de terminal integrado para buscar y descargar temporadas completas facilmente.
- Multiples Servidores Soportados: Extrae metadatos y videos desde PixelDrain, 1Fichier, MP4Upload, HLS, UPNShare, entre otros.
- Filtro Configurables: Capacidad de excluir o preferir servidores problematicos.
- Totalmente Modificable: Sin limites de peticiones comerciales ni planes de pago. Todo ocurre en tu entorno.

---

## Instalacion y Uso Local

Este repositorio incluye todo el backend listo para levantarse en tu entorno local o ser desplegado en tu propio VPS/Servidor.

### 1. Requisitos

- [Node.js](https://nodejs.org/) 18 o superior.

### 2. Configurar Variables de Entorno

Copia el archivo base de variables de entorno:

```bash
cp .env.example .env
```
*(En Windows PowerShell: `Copy-Item .env.example .env`)*

En el archivo `.env` puedes definir tus propias contraseñas o API Keys en la variable `API_KEYS` o simplemente deshabilitar el middleware si lo usaras en tu propia red interna. Tambien puedes configurar el puerto (por defecto 3001).

### 3. Instalar dependencias e iniciar

Instala las librerias e inicia el entorno de desarrollo:

```bash
npm install
npm run dev
```

El servidor local estara corriendo por defecto en `http://localhost:3001`.

---

## Herramienta CLI de Descargas Automaticas

El proyecto provee el script `descargador.js` para usar la API directamente desde la consola sin necesidad de escribir clientes HTTP adicionales.

```bash
node descargador.js
```

Funciona de la siguiente manera:
1. Te pregunta el titulo que deseas buscar.
2. Listara los resultados coincidentes para que selecciones el correcto.
3. Descargara la informacion de la serie mostrando el conteo de episodios.
4. Te preguntara que numeros de episodio quieres (puedes decirle "1,2,3" o "todos").
5. Seleccionara automaticamente el mejor servidor (priorizando directos como PixelDrain o 1Fichier) y lo descargara a la carpeta `/downloads` mostrando barras de progreso simultaneas.

---

## Documentacion de Endpoints Principales

Si mantienes el middleware de autenticacion activo, debes pasar tu API Key generada localmente en cada request:
`X-API-Key: <TU_API_KEY_LOCAL>`

### 1. Busqueda de Animes
`GET /api/v1/anime/search?q=nombre_del_anime`
Busca coincidencias textuales en la base de datos de la web fuente y devuelve array con ID, titulo, url del anime y otros meta-datos.

### 2. Informacion de Anime y Capitulos
`GET /api/v1/anime/info?url=url_original_del_anime`
Recibe la URL de un anime entregada por la busqueda y devuelve la informacion en detalle, asi como la lista de objetos `episodes` con sus nombres y URLs correspondientes para el proximo paso.

### 3. Extraccion de Enlaces de Video
`GET /api/v1/anime/episode?url=url_del_episodio`
Dada la URL de un episodio logica extraida del endpoint anterior, este metodo escrapara el reproductor y extraera todos los iframes, enlaces de streaming y archivos de descarga identificando el servidor (PDrain, Fembed, MP4Upload, etc) e idioma (SUB, DUB).

### 4. Controlador de Descarga Interno
`POST /api/v1/anime/download`
Recibe por body `{ "url": "url_de_episodio" }` (y opcionalmente preferancias como `"variant": "SUB"`). El servidor creara un Job en segundo plano descargando el archivo directamente utilizando la prioridad interna. Devuelve un `downloadId`.

`GET /api/v1/anime/download/:id`
Usando el `downloadId`, devuelve el progreso en porcentaje, tamaño, ruta guardada local y el servidor de origen actual. Util para barras de estado.

*(Compatibilidad: para apps legacy, tambien responden en `/api/anime1v/*`)*

---

## Manejo de Servidores y Descargas

La API soporta capturar direcciones de una amplia variedad de servidores. El motor de descarga (usado por `/download` y `descargador.js`) clasifica y prioriza la extraccion.

Servidores nativos altamente compatibles para transferencia de datos:
- PixelDrain (descarga directa preferida)
- 1Fichier
- MP4Upload
- Server internos tipo HLS (.m3u8), UPNShare.

### Filtros Opcionales
En peticiones manuales al endpoint `/episode` puedes controlar los extractores con los siguientes query params:

- Excluir Mega: Por defecto, Mega esta excluido. Sus URL de descarga piden cifrado hash desde el JS del cliente web. Si aun asi necesitas su link en bruto para pasarlo a JDownloader u otro visualizador, puedes pedir `&includeMega=true`.
- Excluir problematicos: Si un servidor demora demasiado la resolucion en tu servidor, omitelos usando querystring: `&excludeServers=mega,fembed,upnshare`
- Servidor preferido: Internamente, si prefieres capturar directo de algun servidor en particular (ej. `&preferredServer=pdrain`), el sistema intentara usar ese primero.

---

## Creditos y Colaboracion

Proyecto originado, escrito y mantenido por **FxxMorgan**.

Ha sido convertido en una solucion comunitaria Open Source. Eres libre de leer, alojar, modificar completamente y extender la logica de esta API. Lo unico que se pide encarecidamente es **mantener los agradecimientos, enlaces locales y el nombre de su autor (FxxMorgan)** en derivados o proyectos que usen la base logica de este scraper.

---

## Soporte y Contacto

- Autor: Feer (FxxMorgan)
- Repositorio y Documentacion: [github.com/FxxMorgan/anime1v-api](https://github.com/FxxMorgan/anime1v-api)
- Reporte de Errores: [Issues en GitHub](https://github.com/FxxMorgan/anime1v-api/issues)

---

## Licencia

Este proyecto se entrega bajo la licencia MIT. Eres libre de darle uso personal, recreativo o formativo. Puedes consultar detalles en el archivo [LICENSE](LICENSE).

---

## Disclaimer

Este proyecto API tiene propositos exclusivamente educativos sobre programacion en NodeJS y scrapping en el DOM. 

Recomiendo respetar los lineamientos y las leyes de copyright del contenido hospedado segun el pais donde realices tu despliegue.