"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera as CameraIcon, Download, RefreshCw, X } from "lucide-react";
import { toPng } from "html-to-image";
import Image from "next/image";

const FILTERS = [
  { id: "90s", label: "90s", class: "sepia brightness-110" },
  { id: "2000s", label: "2000s", class: "contrast-125 saturate-150" },
  { id: "noir", label: "Noir", class: "grayscale contrast-125" },
  { id: "vintage", label: "Vintage", class: "sepia hue-rotate-15" },
  { id: "fisheye", label: "Fisheye", class: "scale-[1.2] rounded-full" },
];

export function Camera() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdownText, setCountdownText] = useState("");

  useEffect(() => {
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
        });
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.error("Error accessing camera:", err);
      }
    }
    setupCamera();
  }, []);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const context = canvasRef.current.getContext("2d");
      if (context) {
        context.drawImage(videoRef.current, 0, 0, 640, 480);
        const photo = canvasRef.current.toDataURL("image/jpeg");
        setPhotos((prev) => [...prev, photo]);
      }
    }
  };

  const startPhotoSequence = async () => {
    setIsCapturing(true);
    setPhotos([]);

    for (let i = 0; i < 3; i++) {
      // Countdown sequence
      for (let count = 3; count > 0; count--) {
        setCountdownText(count.toString());
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }

      // Show SMILE! message
      setCountdownText("SMILE!");
      await new Promise((resolve) => setTimeout(resolve, 1000));

      // Take photo
      capturePhoto();
      await new Promise((resolve) => setTimeout(resolve, 500));
    }

    setCountdownText("");
    setIsCapturing(false);
  };

  const downloadPhotos = async () => {
    const stripRef = document.getElementById("photo-strip");

    if (!stripRef) return;

    // Temporarily hide the buttons
    const buttonSection = document.querySelector(
      ".photo-buttons"
    ) as HTMLElement;
    if (buttonSection) {
      buttonSection.style.display = "none";
    }

    try {
      // Wait for images to load before capturing
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Capture the photo strip
      const dataUrl = await toPng(stripRef, {
        cacheBust: true,
        backgroundColor: "white", // Ensure background is not transparent
      });

      // Restore buttons
      if (buttonSection) {
        buttonSection.style.display = "";
      }

      // Download the image
      const link = document.createElement("a");
      link.download = `photobooth-${new Date().toISOString()}.png`;
      link.href = dataUrl;
      link.click();
    } catch (error) {
      console.error("Error generating image:", error);
    }
  };

  const discardPhotos = () => {
    setPhotos([]);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="relative rounded-xl overflow-hidden bg-zinc-900 p-4">
        <div className="aspect-video relative rounded-lg overflow-hidden">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className={`w-full h-full object-cover ${selectedFilter.class}`}
          />
          <canvas ref={canvasRef} className="hidden" width="640" height="480" />

          <AnimatePresence>
            {isCapturing && countdownText && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
              >
                <span className="retro-title text-6xl font-bold text-white">
                  {countdownText}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="mt-4 flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setSelectedFilter(filter)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors retro-text
                ${
                  selectedFilter.id === filter.id
                    ? "bg-yellow-400 text-black"
                    : "bg-zinc-800 text-white hover:bg-zinc-700"
                }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <div className="mt-4 flex justify-center gap-4">
          <motion.button
            onClick={startPhotoSequence}
            disabled={isCapturing}
            className="bg-red-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2
                     hover:bg-red-600 transition-colors retro-text text-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <CameraIcon className="w-5 h-5" />
            Take Photos
          </motion.button>
        </div>
      </div>

      {photos.length > 0 && (
        <div className="mt-8 relative bg-white p-4 rounded-xl" id="photo-strip">
          <div className="grid grid-cols-1 md:grid-cols-[2fr,1fr] gap-4">
            {/* Photo Section */}
            <div className="space-y-2">
              {photos.map((photo, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <img
                    src={photo}
                    alt={`Photo ${index + 1}`}
                    className={`w-full h-auto md:w-auto ${selectedFilter.class}`}
                  />
                </div>
              ))}
            </div>

            {/* Right Section with Text and Logos */}
            <div className="flex flex-col items-center justify-between p-4 bg-gray-100 rounded-lg">
              <div className="writing-mode-vertical-rl transform rotate-180 retro-title text-lg md:text-xl">
                HACKNIGHT&apos;25
              </div>
              <div className="space-y-4">
                <Image
                  src="/hc1.png"
                  width={64}
                  height={64}
                  alt="Logo 1"
                  className="w-12 h-12 md:w-16 md:h-16"
                  priority
                  unoptimized
                />
                <Image
                  src="/hc2.png"
                  width={64}
                  height={64}
                  alt="Logo 2"
                  className="w-12 h-12 md:w-16 md:h-16"
                  priority
                  unoptimized
                />
                <div className="mt-4 text-center text-black retro-text text-sm md:text-lg">
                  {new Date().toLocaleString()} • HK25
                </div>
              </div>
            </div>
          </div>

          {/* Buttons (Hidden in Download) */}
          <div className="mt-4 flex justify-center gap-4 photo-buttons">
            <motion.button
              onClick={downloadPhotos}
              className="bg-yellow-400 text-black px-4 py-2 md:px-6 md:py-3 rounded-full font-bold flex items-center gap-2 retro-text text-sm md:text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Download className="w-4 h-4 md:w-5 md:h-5" />
              Save Photos
            </motion.button>

            <motion.button
              onClick={discardPhotos}
              className="bg-red-500 text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-bold flex items-center gap-2 retro-text text-sm md:text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <X className="w-4 h-4 md:w-5 md:h-5" />
              Discard
            </motion.button>

            <motion.button
              onClick={() => setPhotos([])}
              className="bg-zinc-800 text-white px-4 py-2 md:px-6 md:py-3 rounded-full font-bold flex items-center gap-2 retro-text text-sm md:text-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className="w-4 h-4 md:w-5 md:h-5" />
              Retake
            </motion.button>
          </div>
        </div>
      )}
    </div>
  );
}
