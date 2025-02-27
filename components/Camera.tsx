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
  const photoStripRef = useRef<HTMLDivElement>(null);
  const [selectedFilter, setSelectedFilter] = useState(FILTERS[0]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [showShutter, setShowShutter] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [countdownText, setCountdownText] = useState("");
  const [isPhotoEmerging, setIsPhotoEmerging] = useState(false);

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

  const capturePhoto = async () => {
    // Trigger shutter effect
    setShowShutter(true);
    await new Promise((resolve) => setTimeout(resolve, 200));
    setShowShutter(false);

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

    for (let i = 0; i < 1; i++) {
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
        {/* Camera */}
        <div className="aspect-video relative rounded-lg w-full h-[60vh] overflow-hidden">
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
            {showShutter && (
              <div className="absolute inset-0 bg-black shutter-effect" />
            )}
          </AnimatePresence>
        </div>
        {/* Filters */}
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

        {/* Photo Buttons */}
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

      {/* Photo Slot */}
      {/* <div className="w-full max-w-md h-8 bg-gray-300 mt-4 shadow-inner flex justify-center items-center ml-[14rem]">
        <div className="w-[90%] h-1 bg-gray-500 rounded-full"></div>
      </div> */}

      {/* Take photos */}

      <AnimatePresence>
        {photos.length > 0 && (
          <div className="mt-8 relative  p-4" id="photo-strip">
            {/* Complete Photo Strip - Photo and WaterMark */}
            <div className="max-w-md mx-auto bg-[#e8e6e1] p-4 mb-[9rem]">
              <div className="aspect-[1/1.5] flex flex-col">
                {/* Photo Section */}
                <div className="space-y-2">
                  {photos.map((photo, index) => (
                    <div key={index} className="overflow-hidden ">
                      <img
                        src={photo}
                        alt={`Photo ${index + 1}`}
                        className={`w-full h-auto md:w-auto border  ${selectedFilter.class}`}
                      />
                    </div>
                  ))}
                </div>

                {/* Title Section */}
                <div className="font-bold text-black">
                  <h1 className="text-5xl tracking-tight leading-none">fvd</h1>
                  <h2 className="text-2xl">gfb</h2>
                </div>

                {/* Details Section */}
                <div className="mt-4 space-y-2 text-sm text-black">
                  <div className="flex">
                    <span className="w-24 text-left">running time</span>
                    <span className="flex-1">bsdf MINUTES</span>
                  </div>

                  <div className="flex items-start">
                    <span className="w-24 text-left">directed by</span>
                    <span className="flex-1">frgver + </span>
                  </div>

                  <div className="flex items-start">
                    <span className="w-24 text-left">produced by</span>
                    <span className="flex-1">frgver + </span>
                  </div>

                  <div className="flex items-start mb-9">
                    <span className="w-24 text-left">starring</span>
                    <span className="flex-1">frgver + </span>
                  </div>

                  <div className="flex items-end mb-9">
                    <span className="w-24 text-left">starring</span>
                    <span className="flex-1">frgvedewefr + </span>
                    <Image
                      src="/hc1.png"
                      width={64}
                      height={64}
                      alt="Logo 1"
                      className="w-12 h-12 md:w-16 md:h-16"
                      priority
                      unoptimized
                    ></Image>
                    <span className="flex-1">
                      {new Date().toLocaleString()} • HK25
                    </span>
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
      </AnimatePresence>
    </div>
  );
}
