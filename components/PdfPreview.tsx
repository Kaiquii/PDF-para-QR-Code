"use client";

import { useEffect, useRef, useState } from "react";
import { Download, AlertCircle } from "lucide-react";

interface PdfPreviewProps {
  file: File;
}

export function PdfPreview({ file }: PdfPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isRendered, setIsRendered] = useState(false);
  const [isRendering, setIsRendering] = useState(false);

  useEffect(() => {
    let isActive = true;

    const renderPdf = async () => {
      setIsRendering(true);
      setError(null);

      let pdfjsLib;
      try {
        pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.mjs`;
      } catch (err) {
        console.error("Erro ao carregar pdfjs-dist:", err);
        if (isActive) setError("Falha ao carregar a biblioteca de PDF.");
        setIsRendering(false);
        return;
      }

      const canvas = canvasRef.current;
      if (!canvas) {
        if (isActive)
          setError("Erro interno: Referência do Canvas não encontrada.");
        setIsRendering(false);
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

          if (context && isActive) {
            canvas.height = viewport.height;
            canvas.width = viewport.width;

            const renderContext: import("pdfjs-dist/types/src/display/api").RenderParameters =
              {
                canvasContext: context,
                viewport: viewport,
                canvas: canvas,
              };

            await page.render(renderContext).promise;
            if (isActive) {
              setIsRendered(true);
              setIsRendering(false);
            }
          } else if (!context && isActive) {
            setError("Não foi possível obter o contexto 2D do canvas.");
            setIsRendering(false);
          }
        } catch (err) {
          console.error("Erro ao renderizar PDF:", err);
          if (isActive) {
            if (err instanceof Error) {
              setError(`Erro ao renderizar PDF: ${err.message}`);
            } else {
              setError("Não foi possível renderizar o PDF para visualização.");
            }
            setIsRendering(false);
          }
        }
      };

      fileReader.onerror = () => {
        if (isActive) {
          setError("Erro ao ler o arquivo PDF.");
          setIsRendering(false);
        }
      };

      fileReader.readAsArrayBuffer(file);
    };

    if (file) {
      setIsRendered(false);
      renderPdf();
    }

    return () => {
      isActive = false;
    };
  }, [file]);

  const handleDownloadPng = () => {
    if (canvasRef.current && isRendered) {
      const link = document.createElement("a");
      link.download = `${file.name.replace(".pdf", "")}_preview.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  return (
    <div className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex justify-between items-center">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">
          Preview (Página 1)
        </h3>

        {isRendered && (
          <button
            onClick={handleDownloadPng}
            className="flex items-center gap-2 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 px-3 py-1.5 rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/30 cursor-pointer"
          >
            <Download size={14} />
            Baixar PNG
          </button>
        )}
      </div>

      <div className="p-4 flex flex-col items-center justify-center min-h-[300px] bg-gray-100 dark:bg-gray-900/50 relative">
        {isRendering && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-100/80 dark:bg-gray-900/80 z-10 animate-in fade-in">
            <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-3"></div>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Renderizando PDF...
            </p>
          </div>
        )}

        {error && (
          <div className="flex flex-col items-center text-red-500 p-6 text-center">
            <AlertCircle className="mb-2" size={32} />
            <p className="text-sm font-medium">{error}</p>
          </div>
        )}

        <div
          className={`shadow-lg bg-white ${isRendered && !error ? "opacity-100" : "opacity-0"} max-h-[500px] overflow-auto rounded-md border border-gray-200 dark:border-gray-700`}
        >
          <canvas
            ref={canvasRef}
            className="block max-w-full h-auto"
            style={{ width: "100%" }}
          />
        </div>
      </div>
    </div>
  );
}
