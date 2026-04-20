const prompts = require("prompts");
const cliProgress = require("cli-progress");
const animeService = require("./src/services/animeav1.service");
const downloadService = require("./src/services/download.service");

async function main() {
  console.log("=== Descargador Anime1v ===");
  
  // 1. Buscar anime
  const { query } = await prompts({
    type: "text",
    name: "query",
    message: "Ingresa el nombre del anime a buscar:"
  });

  if (!query) {
    console.log("Búsqueda cancelada.");
    return;
  }

  console.log(`Buscando '${query}'...`);
  const searchResult = await animeService.searchAnime(query);
  
  if (!searchResult.data.results || searchResult.data.results.length === 0) {
    console.log("No se encontraron resultados.");
    return;
  }

  const choices = searchResult.data.results.map((anime, i) => ({
    title: `${anime.title} (${anime.type || "Anime"})`,
    value: anime.url
  }));

  const { animeUrl } = await prompts({
    type: "select",
    name: "animeUrl",
    message: "Selecciona un anime:",
    choices
  });

  if (!animeUrl) return;

  // 2. Obtener info del anime y episodios
  console.log("Obteniendo información del anime, por favor espera...");
  const info = await animeService.getAnimeInfo(animeUrl);
  
  if (!info.data.episodes || info.data.episodes.length === 0) {
    console.log("No se encontraron episodios para este anime.");
    return;
  }

  const episodes = info.data.episodes.sort((a, b) => a.number - b.number);
  console.log(`Se encontraron ${episodes.length} episodios.`);

  const { targetEpisodes } = await prompts({
    type: "text",
    name: "targetEpisodes",
    message: "Ingresa los episodios a descargar separados por coma (ej. 1,2,3) o 'todos':"
  });

  if (!targetEpisodes) return;

  let episodesToDownload = [];
  if (targetEpisodes.trim().toLowerCase() === "todos") {
    episodesToDownload = episodes;
  } else {
    const nums = targetEpisodes.split(",").map(n => Number(n.trim())).filter(n => !isNaN(n));
    episodesToDownload = episodes.filter(ep => nums.includes(ep.number));
  }

  if (episodesToDownload.length === 0) {
    console.log("Ningún episodio seleccionado.");
    return;
  }

  console.log(`\nIniciando cola de descarga para ${episodesToDownload.length} episodios...\n`);

  const multibar = new cliProgress.MultiBar({
    clearOnComplete: false,
    hideCursor: true,
    format: '{episode} | {bar} | {percentage}% | {status}'
  }, cliProgress.Presets.shades_classic);

  const activeDownloads = new Map();

  for (const ep of episodesToDownload) {
    try {
      const result = downloadService.createDownload({ url: ep.url }, "http://localhost");
      
      const bar = multibar.create(100, 0, {
        episode: `Episodio ${ep.number.toString().padStart(3, "0")}`,
        status: "Iniciando..."
      });

      activeDownloads.set(result.downloadId, {
        bar,
        completed: false
      });
    } catch (err) {
      console.error(`Error al iniciar descarga del episodio ${ep.number}: ${err.message}`);
    }
  }

  // Monitoreo de progreso
  const interval = setInterval(() => {
    let allDone = true;

    for (const [downloadId, dlObj] of activeDownloads.entries()) {
      if (dlObj.completed) continue;

      try {
        const stats = downloadService.getDownload(downloadId);
        
        dlObj.bar.update(stats.progress || 0, { status: stats.status });

        if (stats.status === "completed" || stats.status === "failed") {
          dlObj.completed = true;
          if (stats.status === "failed") {
            dlObj.bar.update(stats.progress, { status: `Fallo: ${stats.error}` });
          }
        } else {
          allDone = false;
        }
      } catch (err) {
        // En caso de que se borre o no exista
        dlObj.completed = true;
      }
    }

    if (allDone) {
      clearInterval(interval);
      multibar.stop();
      console.log("\n¡Todas las descargas han finalizado!");
    }
  }, 1000);
}

main().catch(err => {
  console.error("Error inesperado:", err);
  process.exit(1);
});
