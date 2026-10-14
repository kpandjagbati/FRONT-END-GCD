function mimeFor(filename: string) {
  const name = filename.toLowerCase();
  if (name.endsWith(".pdf")) return "application/pdf";
  if (name.endsWith(".xlsx") || name.endsWith(".xls")) {
    return "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  }
  if (name.endsWith(".docx") || name.endsWith(".doc")) {
    return "application/vnd.openxmlformats-officedocument.wordprocessingml.document";
  }
  if (name.endsWith(".txt")) return "text/plain;charset=utf-8";
  if (name.endsWith(".zip")) return "application/zip";
  return "application/octet-stream";
}

/** Un fichier → barre de téléchargements du navigateur (icône ↓). */
export function saveBlob(filename: string, blob: Blob) {
  const safeName = filename.split(/[/\\]/).pop()?.trim() || "fichier";
  const typed =
    blob.type && blob.type !== "application/octet-stream"
      ? blob
      : new Blob([blob], { type: mimeFor(safeName) });
  const url = URL.createObjectURL(typed);
  const link = document.createElement("a");
  link.href = url;
  link.download = safeName;
  link.rel = "noopener";
  link.style.display = "none";
  document.body.appendChild(link);
  link.dispatchEvent(new MouseEvent("click", { bubbles: true, cancelable: true, view: window }));
  window.setTimeout(() => {
    link.remove();
    URL.revokeObjectURL(url);
  }, 2500);
}

/**
 * Plusieurs fichiers → chacun dans la barre ↓ du navigateur (pas un zip).
 * Espacés pour que Chrome/Edge les enchaîne dans l'icône téléchargements.
 */
export async function saveBlobsInBrowser(files: { filename: string; blob: Blob }[]) {
  for (let index = 0; index < files.length; index += 1) {
    saveBlob(files[index].filename, files[index].blob);
    if (index < files.length - 1) {
      await new Promise((resolve) => window.setTimeout(resolve, 700));
    }
  }
}
