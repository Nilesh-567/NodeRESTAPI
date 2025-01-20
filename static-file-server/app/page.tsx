"use client"

import { useState, useCallback, useEffect } from "react"
import { useDropzone } from "react-dropzone"
import { processZipFile, getFileContent } from "../utils/fileProcessor"
import Link from "next/link"

export default function Home() {
  const [uploadStatus, setUploadStatus] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [files, setFiles] = useState<string[]>([])

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file && file.type === "application/zip") {
      try {
        const mainHtmlFile = await processZipFile(file)
        setUploadStatus("File uploaded and processed successfully!")
        setPreviewUrl(`/preview?file=${encodeURIComponent(mainHtmlFile)}`)
        updateFileList()
      } catch (error) {
        setUploadStatus("Error processing file. Please try again.")
        console.error(error)
      }
    } else {
      setUploadStatus("Please upload a valid ZIP file.")
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop })

  const updateFileList = useCallback(() => {
    const virtualFs = JSON.parse(localStorage.getItem("virtual-fs") || "{}")
    setFiles(Object.keys(virtualFs))
  }, [])

  useEffect(() => {
    updateFileList()
  }, [updateFileList])

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Static File Server</h1>
      <div
        {...getRootProps()}
        className={`border-2 border-dashed p-8 mb-4 text-center cursor-pointer ${
          isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
        }`}
      >
        <input {...getInputProps()} />
        {isDragActive ? (
          <p>Drop the ZIP file here ...</p>
        ) : (
          <p>Drag 'n' drop a ZIP file here, or click to select one</p>
        )}
      </div>
      {uploadStatus && <p className="mb-4">{uploadStatus}</p>}
      {previewUrl && (
        <Link
          href={previewUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mb-4 inline-block"
        >
          Preview Uploaded Site
        </Link>
      )}
      {files.length > 0 && (
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Uploaded Files</h2>
          <ul className="list-disc pl-5">
            {files.map((file) => (
              <li key={file} className="mb-2">
                <Link
                  href={`/preview?file=${encodeURIComponent(file)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-500 hover:text-blue-700"
                >
                  {file}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

