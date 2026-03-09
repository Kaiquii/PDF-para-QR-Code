import { put, type PutBlobResult } from "@vercel/blob";
import { NextResponse } from "next/server";

export async function POST(request: Request): Promise<NextResponse> {
  const { searchParams } = new URL(request.url);
  const filename = searchParams.get("filename");
  const fileBody = request.body as ReadableStream;

  if (!filename) {
    return NextResponse.json(
      { error: "O parâmetro 'filename' é obrigatório." },
      { status: 400 },
    );
  }

  if (!request.body) {
    return NextResponse.json(
      { error: "O corpo da requisição (arquivo) está vazio." },
      { status: 400 },
    );
  }

  try {
    const blob: PutBlobResult = await put(filename, fileBody, {
      access: "public",
    });

    return NextResponse.json(blob);
  } catch (err) {
    console.error("ERRO NO UPLOAD DO BLOB:", err);
    return NextResponse.json(
      { error: "Erro interno ao processar o upload." },
      { status: 500 },
    );
  }
}
