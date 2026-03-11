"use client";

import { useRef, useState } from "react";
import QRCode from "react-qr-code";
import { Download, Copy, ExternalLink, Check } from "lucide-react";

interface QrCodeResultProps {
  url: string;
  filename: string;
}

export function QrCodeResult({ url, filename }: QrCodeResultProps) {
  const qrCodeWrapperRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Falha ao copiar:", err);
    }
  };

  const handleDownloadQrCodePng = () => {
    setError(null);
    const qrWrapper = qrCodeWrapperRef.current;
    if (!qrWrapper) return;

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
    const blobUrl = URL.createObjectURL(svgBlob);

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(blobUrl);

      const link = document.createElement("a");
      const safeFilename = filename.replace(".pdf", "");
      link.download = `${safeFilename || "qrcode"}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    };

    img.onerror = (err) => {
      console.error("Erro ao carregar SVG para imagem:", err);
      setError("Falha ao gerar a imagem do QR Code.");
    };

    img.src = blobUrl;
  };

  return (
    <div className="w-full flex flex-col items-center bg-white dark:bg-gray-800 rounded-2xl p-6 shadow-sm border border-gray-200 dark:border-gray-700 animate-in fade-in zoom-in-95">
      <div className="flex items-center justify-center w-12 h-12 bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 rounded-full mb-4">
        <Check size={28} strokeWidth={2.5} />
      </div>

      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2 text-center">
        Seu QR Code está pronto!
      </h2>

      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6 text-center max-w-sm">
        Escaneie o código abaixo com a câmera do celular ou compartilhe o link
        direto.
      </p>

      <div
        ref={qrCodeWrapperRef}
        className="bg-white p-4 rounded-xl shadow-inner border border-gray-100 dark:border-gray-200 mb-6 relative group"
      >
        <QRCode
          value={url}
          size={200}
          viewBox={`0 0 256 256`}
          className="w-48 h-48 md:w-56 md:h-56"
        />

        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 rounded-xl flex items-center justify-center">
          <button
            onClick={handleDownloadQrCodePng}
            className="bg-white text-gray-900 px-4 py-2 rounded-full font-medium text-sm flex items-center gap-2 hover:bg-gray-100 transform translate-y-4 group-hover:translate-y-0"
          >
            <Download size={16} /> Baixar Imagem
          </button>
        </div>
      </div>

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <div className="flex flex-col sm:flex-row gap-3 w-full max-w-sm">
        <button
          onClick={handleCopyLink}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-medium border border-transparent dark:border-gray-600 cursor-pointer"
        >
          {copied ? (
            <Check size={18} className="text-green-500" />
          ) : (
            <Copy size={18} />
          )}
          {copied ? "Copiado!" : "Copiar Link"}
        </button>

        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm shadow-blue-500/20"
        >
          <ExternalLink size={18} />
          Abrir Link
        </a>
      </div>
    </div>
  );
}
