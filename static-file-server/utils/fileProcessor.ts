import JSZip from "jszip"

interface FileEntry {
  content: string
  type: string
}

export async function processZipFile(file: File): Promise<string> {
  const zip = new JSZip()
  const contents = await zip.loadAsync(file)
  let mainHtmlFile = ""
  const files: Record<string, FileEntry> = {}

  for (const [filename, zipEntry] of Object.entries(contents.files)) {
    if (!zipEntry.dir) {
      const content = await zipEntry.async("string")
      const type = getFileType(filename)
      files[filename] = { content, type }

      if (filename.endsWith(".html") && !mainHtmlFile) {
        mainHtmlFile = filename
      }
    }
  }

  if (!mainHtmlFile) {
    throw new Error("No HTML file found in the ZIP archive")
  }

  localStorage.setItem("virtual-fs", JSON.stringify(files))
  return mainHtmlFile
}

function getFileType(filename: string): string {
  const ext = filename.split(".").pop()?.toLowerCase()
  switch (ext) {
    case "html":
      return "text/html"
    case "css":
      return "text/css"
    case "js":
      return "application/javascript"
    default:
      return "text/plain"
  }
}

export function getFileContent(filename: string): FileEntry | null {
  const files = JSON.parse(localStorage.getItem("virtual-fs") || "{}")
  return files[filename] || null
}

export function createBlobUrl(filename: string): string | null {
  const file = getFileContent(filename)
  if (!file) return null

  const blob = new Blob([file.content], { type: file.type })
  return URL.createObjectURL(blob)
}

