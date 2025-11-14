import { put } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");

  if (!filename || !request.body) {
    return NextResponse.json(
      { error: "Nome do arquivo não encontrado." },
      { status: 400 }
    );
  }

  try {
    const blob = await put(filename, request.body, {
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (err) {
    console.error("ERRO NO UPLOAD DO BLOB:", err);
    return NextResponse.json(
      { error: "Erro interno do servidor ao fazer upload." },
      { status: 500 }
    );
  }
}
