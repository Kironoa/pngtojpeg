"use client";

import { useState, useRef, useCallback } from "react";

export default function Home() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [jpegPreview, setJpegPreview] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState<number | null>(null);
  const [jpegSize, setJpegSize] = useState<number | null>(null);
  const [quality, setQuality] = useState<number>(0.92);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const handleFile = useCallback((file: File) => {
    if (!file || !file.type.startsWith("image/")) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target?.result as string;
      setImagePreview(dataUrl);
      setOriginalSize(file.size);
      setJpegPreview(null);
      setJpegSize(null);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const convertToJpeg = useCallback(() => {
    if (!imagePreview) return;

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);

      const jpegDataUrl = canvas.toDataURL("image/jpeg", quality);
      setJpegPreview(jpegDataUrl);

      const base64Length = jpegDataUrl.split(",")[1].length;
      const size = Math.round((base64Length * 3) / 4);
      setJpegSize(size);
    };
    img.src = imagePreview;
  }, [imagePreview, quality]);

  const handleDownload = useCallback(() => {
    if (!jpegPreview) return;
    const link = document.createElement("a");
    link.href = jpegPreview;
    link.download = "converted.jpeg";
    link.click();
  }, [jpegPreview]);

  const handleQualityChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setQuality(Number(e.target.value));
    if (jpegPreview) convertToJpeg();
  }, [jpegPreview, convertToJpeg]);

  const resetConverter = useCallback(() => {
    setImagePreview(null);
    setJpegPreview(null);
    setOriginalSize(null);
    setJpegSize(null);
    setQuality(0.92);
    if (fileInputRef.current) fileInputRef.current.value = "";
  }, []);

  return (
    <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 py-12 dark:bg-black">
      <div className="w-full max-w-2xl">
        <h1 className="mb-2 text-3xl font-bold text-center text-black dark:text-white">
          PNG to JPEG Converter
        </h1>
          <p className="mb-8 text-center text-gray-500 dark:text-gray-400">
            Upload a PNG image and convert it to high-quality JPEG (Lossy Compression)
          </p>

        <div
          className={`relative rounded-2xl border-2 border-dashed p-12 text-center cursor-pointer transition-colors ${
            isDragging
              ? "border-blue-500 bg-blue-50 dark:bg-blue-950/20"
              : "border-gray-300 bg-white hover:border-blue-400 dark:border-gray-700 dark:bg-gray-900 dark:hover:border-blue-500"
          }`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/png"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />
          {imagePreview ? (
            <div className="flex flex-col items-center gap-4">
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-48 rounded-lg shadow-md"
              />
              <div className="flex flex-col items-center gap-2">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {originalSize && formatBytes(originalSize)}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    resetConverter();
                  }}
                  className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                >
                  Remove image
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <svg
                className="h-12 w-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <p className="text-lg font-medium text-gray-600 dark:text-gray-400">
                Drop your PNG here or{" "}
                <span className="text-blue-600 dark:text-blue-400">browse</span>
              </p>
              <p className="text-sm text-gray-400">Supports .png files</p>
            </div>
          )}
        </div>

        {imagePreview && (
          <div className="mt-6 flex flex-col items-center gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={convertToJpeg}
                className="rounded-xl bg-blue-600 px-6 py-3 text-white font-medium hover:bg-blue-700 transition-colors"
              >
                Convert to JPEG
              </button>
              <button
                onClick={resetConverter}
                className="rounded-xl border border-gray-300 px-6 py-3 text-gray-700 font-medium hover:bg-gray-100 transition-colors dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                New Upload
              </button>
            </div>

            <div className="w-full rounded-xl bg-white p-4 shadow-sm border dark:border-gray-800">
                <label className="block mb-2 text-sm font-medium text-gray-700 dark:text-gray-300">
                  JPEG Quality: {Math.round(quality * 100)}% — Compression: Lossy | Method: JPEG Compression
                </label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.01"
                value={quality}
                onChange={handleQualityChange}
                className="w-full cursor-pointer accent-blue-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>Lower size</span>
                <span>Higher quality</span>
              </div>
            </div>
          </div>
        )}

        {jpegPreview && (
          <div className="mt-6 flex flex-col items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-white">
              Converted Image
            </h2>
            <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
              Compression: Lossy | Algorithm: JPEG Compression
            </span>
            <img
              src={jpegPreview}
              alt="JPEG result"
              className="max-h-64 rounded-xl shadow-md"
            />
            <div className="flex flex-wrap items-center justify-center gap-4 text-sm">
              {originalSize && jpegSize && (
                <>
                  <span className="text-gray-500 dark:text-gray-400">
                    Original:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatBytes(originalSize)}
                    </span>
                  </span>
                  <span className="text-gray-400">→</span>
                  <span className="text-gray-500 dark:text-gray-400">
                    Converted:{" "}
                    <span className="font-medium text-gray-700 dark:text-gray-300">
                      {formatBytes(jpegSize)}
                    </span>
                  </span>
                  <span className="text-gray-400">
                    ({(jpegSize / originalSize).toFixed(1)}%)
                  </span>
                </>
              )}
            </div>
            <button
              onClick={handleDownload}
              className="rounded-xl bg-green-600 px-8 py-3 text-white font-medium hover:bg-green-700 transition-colors shadow-lg"
            >
              Download JPEG
            </button>
          </div>
        )}
      </div>
    </main>
  );
}