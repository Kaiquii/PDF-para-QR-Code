"use client";

import { useState, FormEvent } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { PdfUploader } from "@/components/PdfUploader";
import { PdfPreview } from "@/components/PdfPreview";
import { QrCodeResult } from "@/components/QrCodeResult";
import { FileText, Loader2, ArrowRight } from "lucide-react";

interface VercelBlobResult {
  url: string;
}

export function MainContainer() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [generatedUrl, setGeneratedUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setError(null);
    setGeneratedUrl(null);
  };

  const handleSubmit = async (e?: FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!file) {
      setError("Nenhum arquivo selecionado.");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(
        `/api/upload?filename=${encodeURIComponent(file.name)}`,
        {
          method: "POST",
          body: file,
        },
      );

      if (!response.ok) {
        throw new Error(
          "Falha no upload do arquivo. Verifique sua conexão ou tente novamente.",
        );
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

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-blue-400/20 dark:bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-purple-400/20 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

      <div className="absolute top-6 right-6 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-xl z-10">
        <div className="text-center mb-10 animate-in slide-in-from-top-4 fade-in">
          <div className="inline-flex items-center justify-center p-3 bg-blue-100 dark:bg-blue-900/30 rounded-2xl mb-4 shadow-inner">
            <FileText
              className="text-blue-600 dark:text-blue-400"
              size={36}
              strokeWidth={2}
            />
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-3">
            PDF para QR Code
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Transforme seus documentos em links compartilháveis
            instantaneamente.
          </p>
        </div>

        <div className="bg-white/80 dark:bg-gray-800/80 backdrop-blur-xl rounded-3xl shadow-xl dark:shadow-2xl dark:shadow-black/40 border border-gray-100 dark:border-gray-700/50 p-6 sm:p-8 animate-in zoom-in-95 fade-in">
          <form
            onSubmit={handleSubmit}
            className="space-y-8 flex flex-col items-center"
          >
            <PdfUploader
              onFileSelect={handleFileSelect}
              isLoading={isLoading}
              selectedFile={file}
            />

            {file && !generatedUrl && (
              <div className="w-full animate-in slide-in-from-bottom-4 fade-in">
                <PdfPreview file={file} />
              </div>
            )}

            {!generatedUrl && (
              <button
                type="submit"
                disabled={isLoading || !file}
                className="w-full relative group overflow-hidden bg-gray-900 dark:bg-white text-white dark:text-gray-900 font-bold py-4 px-6 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-lg dark:hover:shadow-white/20 active:scale-[0.98]"
              >
                <div className="absolute inset-0 w-full h-full bg-linear-to-r from-blue-600 to-purple-600 dark:from-blue-500 dark:to-purple-500 opacity-0 group-hover:opacity-10" />
                <span className="flex items-center justify-center gap-2 relative z-10 cursor-pointer">
                  {isLoading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      GERANDO LINK...
                    </>
                  ) : (
                    <>
                      GERAR QR CODE
                      <ArrowRight
                        size={20}
                        className="group-hover:translate-x-1"
                      />
                    </>
                  )}
                </span>
              </button>
            )}

            {error && (
              <p className="text-red-500 dark:text-red-400 text-center font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-lg w-full animate-pulse">
                {error}
              </p>
            )}
          </form>

          {generatedUrl && file && (
            <div className="mt-8 pt-8 border-t border-gray-100 dark:border-gray-700/50">
              <QrCodeResult url={generatedUrl} filename={file.name} />

              <button
                type="button"
                onClick={() => {
                  setGeneratedUrl(null);
                  setFile(null);
                }}
                className="mt-6 w-full text-center text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white cursor-pointer"
              >
                Criar outro QR Code
              </button>
            </div>
          )}
        </div>

        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-500">
          Seguro e rápido. Seus arquivos são processados na nuvem.
        </div>
      </div>
    </main>
  );
}
