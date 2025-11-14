"use client";

import { useState, useRef, ChangeEvent, FormEvent } from "react";
import QRCode from "react-qr-code";

interface VercelBlobResult {
  url: string;
}

export default function Home() {
  const inputFileRef = useRef<HTMLInputElement>(null);
  const pdfCanvasRef = useRef<HTMLCanvasElement>(null);
  const qrCodeWrapperRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pdfRendered, setPdfRendered] = useState(false);

  const renderPdfPageToCanvas = async (pdfFile: File) => {
    let pdfjsLib;
    try {
      pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
    } catch (error) {
      console.error("Erro ao carregar pdfjs-dist:", error);
      setError("Falha ao carregar a biblioteca de PDF.");
      return;
    }

    const canvas = pdfCanvasRef.current;
    if (!canvas) {
      setError("Erro interno: Referência do Canvas não encontrada.");
      return;
    }

    const fileReader = new FileReader();
    fileReader.onload = async () => {
      try {
        const typedArray = new Uint8Array(fileReader.result as ArrayBuffer);
        const pdf = await pdfjsLib.getDocument({ data: typedArray }).promise;
        const page = await pdf.getPage(1);
        const viewport = page.getViewport({ scale: 1.5 });
        const context = canvas.getContext("2d");

        if (context) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;

          const renderContext: import("pdfjs-dist/types/src/display/api").RenderParameters =
            {
              canvasContext: context,
              viewport: viewport,
              canvas: canvas,
            };
          await page.render(renderContext).promise;
          setPdfRendered(true);
        } else {
          setError("Não foi possível obter o contexto 2D do canvas.");
        }
      } catch (err) {
        console.error("Erro ao renderizar PDF:", err);
        if (err instanceof Error) {
          setError(`Erro ao renderizar PDF: ${err.message}`);
        } else {
          setError("Não foi possível renderizar o PDF para visualização.");
        }
      }
    };
    fileReader.readAsArrayBuffer(pdfFile);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFile = e.target.files[0];
      if (selectedFile.type !== "application/pdf") {
        setError("Por favor, selecione um arquivo PDF.");
        setFile(null);
        setPdfRendered(false);
      } else {
        setFile(selectedFile);
        setError(null);
        setGeneratedUrl(null);
        setPdfRendered(false);
        renderPdfPageToCanvas(selectedFile);
      }
    }
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!file) {
      setError("Nenhum arquivo selecionado.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/upload?filename=${file.name}`, {
        method: "POST",
        body: file,
      });

      if (!response.ok) {
        throw new Error("Falha no upload do arquivo.");
      }

      const newBlob = (await response.json()) as VercelBlobResult;
      setGeneratedUrl(newBlob.url);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Ocorreu um erro desconhecido durante o upload.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDownloadPng = () => {
    if (pdfCanvasRef.current && pdfRendered) {
      const link = document.createElement("a");
      link.download = `${file?.name.replace(".pdf", "") || "preview"}.png`;
      link.href = pdfCanvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  const handleDownloadQrCodePng = () => {
    const qrWrapper = qrCodeWrapperRef.current;
    if (!qrWrapper) {
      setError("Wrapper do QR Code não encontrado.");
      return;
    }

    const svgElement = qrWrapper.querySelector("svg");
    if (!svgElement) {
      setError("Elemento SVG do QR Code não encontrado.");
      return;
    }

    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      setError("Não foi possível obter o contexto 2D para o QR Code.");
      return;
    }

    const img = new Image();
    const svgBlob = new Blob([svgData], {
      type: "image/svg+xml;charset=utf-8",
    });
    const url = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      const link = document.createElement("a");
      link.download = `${
        file?.name.replace(".pdf", "_qrcode") || "qrcode"
      }.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.onerror = (error) => {
      console.error("Erro ao carregar SVG para imagem:", error);
      setError("Falha ao gerar a imagem do QR Code.");
    };

    img.src = url;
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-900 text-white p-8">
      <div className="w-full max-w-md bg-gray-800 rounded-lg shadow-xl p-8">
        <h1 className="text-3xl font-bold text-center text-blue-400 mb-6">
          PDF para QR Code
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="file-upload"
              className="block text-sm font-medium text-gray-300 mb-2"
            >
              Selecione seu arquivo PDF:
            </label>
            <input
              id="file-upload"
              ref={inputFileRef}
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
              required
              className="block w-full text-sm text-gray-400
                file:mr-4 file:py-2 file:px-4
                file:rounded-full file:border-0
                file:text-sm file:font-semibold
                file:bg-blue-600 file:text-white
                hover:file:bg-blue-700 cursor-pointer"
            />
          </div>

          {file && !error && (
            <div className="mt-4 border border-gray-700 rounded-lg p-2 bg-gray-700 flex flex-col items-center">
              <h3 className="text-md font-medium mb-2 text-gray-300">
                Pré-visualização do PDF (1ª Página)
              </h3>
              <canvas
                ref={pdfCanvasRef}
                className="max-w-full h-auto border border-gray-600 bg-white"
              />
              {pdfRendered && (
                <button
                  type="button"
                  onClick={handleDownloadPng}
                  className="mt-4 bg-purple-600 text-white font-bold py-2 px-4 rounded-lg
                    hover:bg-purple-700 transition duration-300"
                >
                  Baixar Pré-visualização (PNG)
                </button>
              )}
            </div>
          )}

          <button
            type="submit"
            disabled={isLoading || !file}
            className="w-full bg-green-600 text-white font-bold py-3 px-4 rounded-lg
              hover:bg-green-700 transition duration-300
              disabled:bg-gray-500 disabled:cursor-not-allowed"
          >
            {isLoading ? "Enviando..." : "Gerar QR Code"}
          </button>

          {error && <p className="text-red-500 text-center">{error}</p>}
        </form>

        {generatedUrl && (
          <div className="mt-8 pt-6 border-t border-gray-700 flex flex-col items-center">
            <h2 className="text-xl font-semibold mb-4">
              Seu QR Code está pronto!
            </h2>
            <div className="bg-white p-4 rounded-lg" ref={qrCodeWrapperRef}>
              <QRCode value={generatedUrl} size={256} viewBox={`0 0 256 256`} />
            </div>
            <a
              href={generatedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 text-blue-400 hover:text-blue-300 text-sm truncate w-full text-center"
            >
              Link do PDF: {generatedUrl}
            </a>

            <button
              type="button"
              onClick={handleDownloadQrCodePng}
              className="mt-4 bg-yellow-500 text-white font-bold py-2 px-4 rounded-lg
                hover:bg-yellow-600 transition duration-300"
            >
              Baixar QR Code (PNG)
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
