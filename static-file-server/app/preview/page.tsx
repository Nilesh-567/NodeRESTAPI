"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "next/navigation"
import { getFileContent, createBlobUrl } from "../../utils/fileProcessor"

export default function Preview() {
  const [html, setHtml] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const file = searchParams.get("file")

  useEffect(() => {
    if (file) {
      const content = getFileContent(file)
      if (content) {
        let modifiedHtml = content.content
        // Replace relative URLs with Blob URLs
        modifiedHtml = modifiedHtml.replace(/(src|href)=['"]((?!http|https|\/\/)[^'"]+)['"]/g, (match, attr, url) => {
          const blobUrl = createBlobUrl(url)
          return blobUrl ? `${attr}="${blobUrl}"` : match
        })
        setHtml(modifiedHtml)
      }
    }
  }, [file])

  if (!html) {
    return <div>Loading...</div>
  }

  return <iframe srcDoc={html} style={{ width: "100%", height: "100vh", border: "none" }} title="Preview" />
}

