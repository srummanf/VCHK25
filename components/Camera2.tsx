"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CameraIcon, Download, RefreshCw, X, Zap } from "lucide-react";
import { toPng } from "html-to-image";

const FILTERS = [
  { id: "none", label: "Normal", class: "" },
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
  const [photoFullyEmerged, setPhotoFullyEmerged] = useState(false);
  const [movieDetails, setMovieDetails] = useState({
    title: "PHOTOBOOTH",
    yearRange: new Date().getFullYear().toString(),
    runningTime: "INSTANT",
    directedBy: "YOU",
    producedBy: "PHOTOBOOTH APP",
    starring: "YOU & FRIENDS",
  });

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

        // Start the photo emerging animation
        setIsPhotoEmerging(true);
        setPhotoFullyEmerged(false);

        // After animation completes, set fully emerged
        setTimeout(() => {
          setPhotoFullyEmerged(true);
        }, 2000); // Match this with the animation duration
      }
    }
  };

  const startPhotoSequence = async () => {
    setIsCapturing(true);
    setPhotos([]);
    setPhotoFullyEmerged(false);

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
    setIsPhotoEmerging(false);
    setPhotoFullyEmerged(false);
  };

  return (
    <div className="max-w-4xl mx-auto">
      
        {/* Polaroid-inspired Camera UI */}
        <div className="relative rounded-3xl overflow bg-white p-6 shadow-xl border-8 border-gray-100">
          <div className="absolute top-4 left-1/2 -translate-x-1/2 w-24 h-6 bg-gradient-to-r from-red-500 via-yellow-500 to-blue-500 rounded-full"></div>

          <div className="mt-6 mb-4 text-center">
            <h2 className="text-2xl font-bold tracking-tight text-gray-800">
              POLAROID PHOTOBOOTH
            </h2>
          </div>

          {/* Camera Viewfinder */}
          <div className="aspect-video relative rounded-lg overflow-hidden border-4 border-gray-200 shadow-inner bg-black mx-auto max-w-2xl">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              className={`w-full h-full object-cover ${selectedFilter.class}`}
            />
            <canvas
              ref={canvasRef}
              className="hidden"
              width="640"
              height="480"
            />

            <AnimatePresence>
              {isCapturing && countdownText && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50"
                >
                  <span className="text-6xl font-bold text-white font-mono">
                    {countdownText}
                  </span>
                </motion.div>
              )}
              {showShutter && (
                <motion.div
                  initial={{ opacity: 1 }}
                  animate={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 bg-white"
                />
              )}
            </AnimatePresence>
          </div>

          {/* Filters */}
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2 justify-center">
            {FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => setSelectedFilter(filter)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${
                  selectedFilter.id === filter.id
                    ? "bg-red-500 text-white"
                    : "bg-gray-200 text-gray-800 hover:bg-gray-300"
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>

          {/* Photo Buttons */}
          <div className="mt-6 flex justify-center gap-4">
            <motion.button
              onClick={startPhotoSequence}
              disabled={isCapturing}
              className="bg-red-500 text-white px-8 py-4 rounded-full font-bold flex items-center gap-2
                     hover:bg-red-600 transition-colors text-lg shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <CameraIcon className="w-6 h-6" />
              {isCapturing ? "Processing..." : "Take Photo"}
            </motion.button>

            <motion.button
              onClick={() =>
                setSelectedFilter(
                  FILTERS[Math.floor(Math.random() * FILTERS.length)]
                )
              }
              className="bg-yellow-400 text-black px-6 py-4 rounded-full font-bold flex items-center gap-2
                     hover:bg-yellow-500 transition-colors text-lg shadow-lg"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Zap className="w-5 h-5" />
              Random Filter
            </motion.button>
          </div>
        </div>

        {/* Photo Dispensing Animation */}
        <AnimatePresence>
          {photos.length > 0 && (
            <div className="relative mt-8 flex justify-center">
              {/* Photo Slot */}
              <div className="w-full max-w-md h-8 bg-gray-300 rounded-t-lg shadow-inner flex justify-center items-center">
                <div className="w-[90%] h-1 bg-gray-500 rounded-full"></div>
              </div>

              {/* Emerging Photo */}
              <motion.div
                ref={photoStripRef}
                initial={{ y: "-100%" }}
                animate={{ y: isPhotoEmerging ? 0 : "-100%" }}
                transition={{
                  type: "spring",
                  stiffness: 50,
                  damping: 20,
                  duration: 2,
                }}
                className="absolute top-8 w-full max-w-md"
              >
                {/* Photo Strip */}
                <div id="photo-strip" className="bg-white p-4 shadow-xl">
                  <div className="aspect-[3/4] flex flex-col">
                    {/* Photo Section */}
                    <div className="relative mb-4 border-8 border-white shadow-md">
                      {photos.map((photo, index) => (
                        <div key={index} className="overflow-hidden">
                          <img
                            src={photo || "/placeholder.svg"}
                            alt={`Photo ${index + 1}`}
                            className={`w-full h-auto ${selectedFilter.class}`}
                          />
                        </div>
                      ))}

                      {/* Polaroid Bottom White Space */}
                      <div className="absolute bottom-0 left-0 right-0 h-16 bg-white flex items-center justify-center">
                        <p className="text-gray-600 font-handwriting text-sm">
                          {new Date().toLocaleDateString()} •{" "}
                          {new Date().toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Movie Poster Style Info */}
                    <div className="font-bold text-black">
                      <h1 className="text-4xl tracking-tight leading-none">
                        {movieDetails.title}
                      </h1>
                      <h2 className="text-xl">{movieDetails.yearRange}</h2>
                    </div>

                    {/* Details Section */}
                    <div className="mt-4 space-y-2 text-sm text-black">
                      <div className="flex">
                        <span className="w-24 text-left font-medium">
                          running time
                        </span>
                        <span className="flex-1">
                          {movieDetails.runningTime}
                        </span>
                      </div>

                      <div className="flex items-start">
                        <span className="w-24 text-left font-medium">
                          directed by
                        </span>
                        <span className="flex-1">
                          {movieDetails.directedBy}
                        </span>
                      </div>

                      <div className="flex items-start">
                        <span className="w-24 text-left font-medium">
                          produced by
                        </span>
                        <span className="flex-1">
                          {movieDetails.producedBy}
                        </span>
                      </div>

                      <div className="flex items-start">
                        <span className="w-24 text-left font-medium">
                          starring
                        </span>
                        <span className="flex-1">{movieDetails.starring}</span>
                      </div>

                      <div className="flex items-center justify-between pt-2 mt-2 border-t border-gray-200">
                        <span className="text-xs text-gray-500">
                          {new Date().toLocaleString()} • PHOTOBOOTH
                        </span>
                        <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold">PB</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Buttons (Only shown when photo fully emerged) */}
                <AnimatePresence>
                  {photoFullyEmerged && (
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 20 }}
                      className="mt-4 flex justify-center gap-4 photo-buttons"
                    >
                      <motion.button
                        onClick={downloadPhotos}
                        className="bg-yellow-400 text-black px-6 py-3 rounded-full font-bold flex items-center gap-2 text-lg shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <Download className="w-5 h-5" />
                        Save Photo
                      </motion.button>

                      <motion.button
                        onClick={discardPhotos}
                        className="bg-red-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 text-lg shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <X className="w-5 h-5" />
                        Discard
                      </motion.button>

                      <motion.button
                        onClick={() => {
                          setPhotos([]);
                          setIsPhotoEmerging(false);
                          setPhotoFullyEmerged(false);
                        }}
                        className="bg-blue-500 text-white px-6 py-3 rounded-full font-bold flex items-center gap-2 text-lg shadow-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <RefreshCw className="w-5 h-5" />
                        Retake
                      </motion.button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      
    </div>
  );
}
