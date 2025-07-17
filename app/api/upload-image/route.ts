import { put } from "@vercel/blob"
import { NextResponse } from "next/server"

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url)
  const filename = searchParams.get("filename")

  if (!filename || !request.body) {
    return NextResponse.json({ error: "No filename or file body provided." }, { status: 400 })
  }

  try {
    const blob = await put(filename, request.body, {
      access: "public",
      addRandomSuffix: true, // garante unicidade
      // allowOverwrite: false  // (padrão)
    })

    return NextResponse.json(blob)
  } catch (error) {
    console.error("Error uploading to Vercel Blob:", error)
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ error: "Failed to upload file.", details: errorMessage }, { status: 500 })
  }
}
