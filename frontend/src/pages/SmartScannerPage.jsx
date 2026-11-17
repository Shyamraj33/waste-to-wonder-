import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Camera,
  Upload,
  RefreshCw,
  Sparkles,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldAlert,
  SlidersHorizontal,
  Video,
  Zap,
  Star,
  Crown,
} from 'lucide-react';
import { useChild } from '../context/ChildContext';
import { scanWasteImage, confirmScan } from '../services/api';

const MATERIALS_LIST = [
  { id: 'plastic', label: 'Plastic (Bottles, caps, tubs)' },
  { id: 'cardboard', label: 'Cardboard (Boxes, egg cartons, rolls)' },
  { id: 'paper', label: 'Paper (Newspaper, cups, magazines)' },
  { id: 'metal', label: 'Metal (Tin soup cans, soda cans)' },
  { id: 'glass', label: 'Glass (Clean food jars, bottles)' },
  { id: 'fabric', label: 'Fabric (Old t-shirts, cloth scraps)' },
  { id: 'wood', label: 'Wood (Popsicle sticks, twigs)' },
];

export default function SmartScannerPage() {
  const { child, playSound } = useChild();

  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [isScanning, setIsScanning] = useState(false);
  const [scanResult, setScanResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);

  // Camera capture state
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraLoading, setCameraLoading] = useState(false);
  const videoRef = useRef(null);
  const mediaStreamRef = useRef(null);

  // Manual correction dropdown
  const [isCorrecting, setIsCorrecting] = useState(false);
  const [selectedCorrectMaterial, setSelectedCorrectMaterial] = useState('plastic');

  // Loading animation messages
  const [loadingTip, setLoadingTip] = useState('Analyzing image textures and geometry...');
  const tips = [
    'PyTorch MobileNetV3 is inspecting object edges...',
    'Estimating material density and reflections...',
    'Checking Eco World child safety guidelines...',
    'Finding the best DIY crafts for your age group...',
  ];

  useEffect(() => {
    let interval;
    if (isScanning) {
      let index = 0;
      interval = setInterval(() => {
        index = (index + 1) % tips.length;
        setLoadingTip(tips[index]);
      }, 1500);
    }
    return () => clearInterval(interval);
  }, [isScanning]);

  // When cameraActive turns true and video element mounts, assign stream and play
  useEffect(() => {
    if (cameraActive && videoRef.current && mediaStreamRef.current) {
      videoRef.current.srcObject = mediaStreamRef.current;
      videoRef.current.play().catch((err) => {
        console.warn('Video play interrupted:', err);
      });
    }
  }, [cameraActive]);

  // Clean up camera on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    playSound('click');
    stopCamera();
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
    setScanResult(null);
    setErrorMsg(null);
  };

  const startCamera = async () => {
    playSound('click');
    setErrorMsg(null);
    setCameraLoading(true);

    try {
      stopCamera(); // clear previous stream if any

      // Check browser support
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API is not supported in this browser environment. Please upload a photo instead.');
      }

      // Try multiple fallback constraints for desktop webcams & mobile cameras
      let stream = null;
      try {
        // Try rear/environment camera first (mobile)
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        });
      } catch (errEnv) {
        try {
          // Fall back to front-facing / user camera (laptop / desktop)
          stream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'user', width: { ideal: 1280 }, height: { ideal: 720 } },
          });
        } catch (errUser) {
          // Fall back to generic video constraint
          stream = await navigator.mediaDevices.getUserMedia({ video: true });
        }
      }

      mediaStreamRef.current = stream;
      setCameraActive(true);
      setSelectedFile(null);
      setPreviewUrl(null);
      setScanResult(null);

      // If video ref is already available
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(() => {});
      }
    } catch (err) {
      console.error('Camera error:', err);
      let msg = 'Could not access camera. Please allow camera permissions in your browser or upload an image instead.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        msg = 'Camera permission was denied. Click the camera or lock icon in your browser address bar to allow camera access, or click "Choose Photo" to upload an image.';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        msg = 'No camera device found on this computer. Please click "Choose Photo" to upload an image instead.';
      } else if (err.message) {
        msg = err.message;
      }
      setErrorMsg(msg);
      setCameraActive(false);
    } finally {
      setCameraLoading(false);
    }
  };

  const stopCamera = () => {
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((t) => t.stop());
      mediaStreamRef.current = null;
    }
    setCameraActive(false);
  };

  // Client-side image compression for near-instant upload speed
  const compressImage = async (file) => {
    return new Promise((resolve) => {
      if (file.size && file.size < 150 * 1024) {
        resolve(file);
        return;
      }
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 640;
          let width = img.width;
          let height = img.height;
          if (width > height) {
            if (width > MAX_DIM) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            }
          } else {
            if (height > MAX_DIM) {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          canvas.toBlob(
            (blob) => {
              if (blob) {
                const compressedFile = new File([blob], file.name || 'compressed_waste.jpg', {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                resolve(compressedFile);
              } else {
                resolve(file);
              }
            },
            'image/jpeg',
            0.85
          );
        };
        img.onerror = () => resolve(file);
        img.src = e.target.result;
      };
      reader.onerror = () => resolve(file);
      reader.readAsDataURL(file);
    });
  };

  const takeSnapshot = () => {
    if (!videoRef.current) return;
    playSound('click');

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    const MAX_DIM = 640;
    let vw = video.videoWidth || 640;
    let vh = video.videoHeight || 480;
    if (vw > vh && vw > MAX_DIM) {
      vh = Math.round((vh * MAX_DIM) / vw);
      vw = MAX_DIM;
    } else if (vh > MAX_DIM) {
      vw = Math.round((vw * MAX_DIM) / vh);
      vh = MAX_DIM;
    }
    canvas.width = vw;
    canvas.height = vh;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'camera_snapshot.jpg', { type: 'image/jpeg' });
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(blob));
      stopCamera();
    }, 'image/jpeg', 0.85);
  };

  const runScan = async () => {
    if (!selectedFile) return;
    playSound('click');
    setIsScanning(true);
    setErrorMsg(null);

    try {
      // Compress client-side so upload completes in milliseconds!
      const fileToSend = await compressImage(selectedFile);
      const formData = new FormData();
      formData.append('file', fileToSend);
      formData.append('child_age', child.age_group === '5-7' ? 6 : (child.age_group === '8-10' ? 8 : 11));

      const result = await scanWasteImage(formData);
      setScanResult(result);
      setSelectedCorrectMaterial(result.estimated_material);
      playSound('fanfare');
    } catch (err) {
      setErrorMsg(err.message || 'Error processing image with AI.');
    } finally {
      setIsScanning(false);
    }
  };

  const handleManualCorrection = async (e) => {
    e.preventDefault();
    if (!scanResult) return;
    playSound('click');
    setIsScanning(true);

    try {
      const updated = await confirmScan({
        scan_id: scanResult.scan_id,
        corrected_material: selectedCorrectMaterial,
        child_id: child.id,
      });
      setScanResult(updated);
      setIsCorrecting(false);
      playSound('fanfare');
    } catch (err) {
      setErrorMsg('Failed to update correction.');
    } finally {
      setIsScanning(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="text-center space-y-2">
        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-eco-100 text-eco-800 text-xs font-display font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-eco-600" />
          Smart Waste Scanner – Eco World
        </span>
        <h1 className="text-3xl sm:text-5xl font-display font-extrabold text-slate-900">
          What Recyclable Did You Find? 📸
        </h1>
        <p className="text-base font-semibold text-slate-600 max-w-xl mx-auto">
          Snap a photo or upload an image of any waste container. Our Computer Vision detects its material and recommends awesome DIY crafts!
        </p>
      </div>

      {/* Scanner Box */}
      <div className="kid-card p-6 sm:p-10 border-4 border-eco-200 bg-white">
        {/* Error Alert */}
        {errorMsg && (
          <div className="mb-6 p-4 rounded-2xl bg-rose-50 border-2 border-rose-200 text-rose-800 text-sm font-semibold flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <div className="space-y-1">
              <span className="block font-bold">Camera Notice:</span>
              <span>{errorMsg}</span>
            </div>
          </div>
        )}

        {/* Live Camera View */}
        {cameraActive && (
          <div className="space-y-4 text-center">
            <div className="relative max-w-md mx-auto aspect-video rounded-3xl overflow-hidden bg-slate-900 border-4 border-eco-400 shadow-inner">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 border-2 border-dashed border-white/50 m-6 rounded-2xl pointer-events-none flex items-center justify-center">
                <span className="text-white/70 text-xs font-display font-bold bg-black/40 px-3 py-1 rounded-full">
                  Align waste item inside box
                </span>
              </div>
            </div>
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={takeSnapshot}
                className="btn-kid btn-kid-green py-3 px-8 text-lg flex items-center gap-2 shadow-kid-button"
              >
                <Camera className="w-5 h-5" />
                <span>Snap Picture!</span>
              </button>
              <button
                onClick={stopCamera}
                className="btn-kid btn-kid-white py-3 px-6 text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Image Preview & Upload Dropzone */}
        {!cameraActive && (
          <div>
            {previewUrl ? (
              <div className="space-y-6">
                <div className="relative max-w-md mx-auto aspect-square sm:aspect-video rounded-3xl overflow-hidden border-4 border-eco-300 shadow-md bg-slate-50">
                  <img
                    src={previewUrl}
                    alt="Scanned item preview"
                    className="w-full h-full object-contain p-2"
                  />
                  <button
                    onClick={() => {
                      setSelectedFile(null);
                      setPreviewUrl(null);
                      setScanResult(null);
                    }}
                    className="absolute top-4 right-4 p-2 bg-white/90 rounded-full text-slate-700 shadow-sm hover:bg-rose-50 hover:text-rose-600 transition-colors"
                    title="Remove and retake"
                  >
                    ✕
                  </button>
                </div>

                {/* Scan Action Button */}
                <div className="text-center">
                  {!scanResult && !isScanning && (
                    <button
                      onClick={runScan}
                      className="btn-kid btn-kid-green py-4 px-10 text-xl inline-flex items-center gap-3 shadow-kid-button"
                    >
                      <Sparkles className="w-6 h-6 animate-spin" />
                      <span>Scan with Eco World AI!</span>
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <div className="space-y-6 text-center py-8 sm:py-12 border-4 border-dashed border-eco-200 rounded-3xl bg-eco-50/30">
                <div className="w-20 h-20 mx-auto rounded-3xl bg-eco-100 flex items-center justify-center text-4xl shadow-inner animate-float">
                  ♻️
                </div>

                <div className="space-y-2 max-w-md mx-auto">
                  <h3 className="font-display font-extrabold text-2xl text-slate-800">
                    Upload or Snap a Photo
                  </h3>
                  <p className="text-sm font-semibold text-slate-500">
                    Works great with plastic bottles, cardboard cartons, tin cans, glass jars, and paper rolls!
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <label className="btn-kid btn-kid-green py-3.5 px-8 text-base cursor-pointer flex items-center gap-2">
                    <Upload className="w-5 h-5" />
                    <span>Choose Photo</span>
                    <input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      onChange={handleFileSelect}
                      className="hidden"
                    />
                  </label>

                  <button
                    onClick={startCamera}
                    disabled={cameraLoading}
                    className="btn-kid btn-kid-yellow py-3.5 px-8 text-base flex items-center gap-2"
                  >
                    <Camera className="w-5 h-5 text-amber-900" />
                    <span>{cameraLoading ? 'Starting Camera...' : 'Use Live Camera'}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* AI Scanning Progress Animation */}
        {isScanning && (
          <div className="text-center py-10 space-y-4">
            <div className="w-16 h-16 mx-auto border-4 border-eco-200 border-t-eco-600 rounded-full animate-spin" />
            <div className="space-y-1">
              <h4 className="font-display font-bold text-lg text-slate-800">
                AI Vision In Progress...
              </h4>
              <p className="text-sm font-semibold text-eco-700 animate-pulse">
                {loadingTip}
              </p>
            </div>
          </div>
        )}

        {/* Scan Results Display */}
        {scanResult && !isScanning && (
          <div className="mt-8 pt-8 border-t-2 border-slate-100 space-y-8 animate-fadeIn">
            {/* Detected Object Card */}
            <div className="p-6 rounded-3xl bg-gradient-to-r from-eco-50 via-teal-50 to-sky-50 border-2 border-eco-200">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1 text-center sm:text-left">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-eco-700">
                    Computer Vision Prediction
                  </span>
                  <h3 className="text-2xl sm:text-3xl font-display font-extrabold text-slate-900 flex items-center gap-2 justify-center sm:justify-start">
                    <span>{scanResult.detected_object}</span>
                    <CheckCircle className="w-6 h-6 text-eco-600 inline" />
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 pt-1 text-xs font-bold text-slate-600">
                    <span className="px-2.5 py-1 bg-white rounded-full border border-slate-200 capitalize">
                      Estimated Material: <strong>{scanResult.estimated_material}</strong>
                    </span>
                    <span className="px-2.5 py-1 bg-white rounded-full border border-slate-200">
                      Model Confidence: <strong>{scanResult.confidence}%</strong>
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => setIsCorrecting(!isCorrecting)}
                  className="btn-kid btn-kid-white py-2 px-4 text-xs font-bold flex items-center gap-1.5"
                >
                  <SlidersHorizontal className="w-4 h-4 text-slate-500" />
                  <span>Correct Material</span>
                </button>
              </div>

              {/* Safety notice if present */}
              {scanResult.safety_notice && (
                <div className="mt-4 p-3 rounded-2xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>Safety Note: {scanResult.safety_notice}</span>
                </div>
              )}
            </div>

            {/* Manual Correction Form Drawer */}
            {isCorrecting && (
              <form
                onSubmit={handleManualCorrection}
                className="p-6 rounded-3xl border-2 border-slate-200 bg-slate-50 space-y-4"
              >
                <div className="space-y-1">
                  <h4 className="font-display font-bold text-base text-slate-800">
                    Did AI get it slightly wrong? Pick the right material:
                  </h4>
                  <p className="text-xs text-slate-500 font-semibold">
                    We will instantly update the craft recommendations to match your exact waste item!
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {MATERIALS_LIST.map((mat) => (
                    <label
                      key={mat.id}
                      className={`p-3 rounded-2xl border-2 cursor-pointer flex items-center gap-2 transition-all ${
                        selectedCorrectMaterial === mat.id
                          ? 'border-eco-500 bg-eco-100 text-eco-900 font-bold'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-100 font-medium'
                      }`}
                    >
                      <input
                        type="radio"
                        name="correct_material"
                        value={mat.id}
                        checked={selectedCorrectMaterial === mat.id}
                        onChange={() => setSelectedCorrectMaterial(mat.id)}
                        className="text-eco-600 focus:ring-eco-500"
                      />
                      <span className="text-xs font-display">{mat.label}</span>
                    </label>
                  ))}
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    className="btn-kid btn-kid-green py-2 px-6 text-sm"
                  >
                    Confirm & Update Crafts
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsCorrecting(false)}
                    className="btn-kid btn-kid-white py-2 px-4 text-xs font-bold"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* Suggested Opportunities */}
            {scanResult.suggested_opportunities && scanResult.suggested_opportunities.length > 0 && (
              <div className="space-y-3">
                <h4 className="font-display font-bold text-base text-slate-800 flex items-center gap-2">
                  <span>💡 Creative Ways You Can Reuse This in Eco World:</span>
                </h4>
                <div className="flex flex-wrap gap-2">
                  {scanResult.suggested_opportunities.map((opp, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-full bg-sunny-100 border border-sunny-300 text-amber-900 font-display font-bold text-xs"
                    >
                      ✨ {opp}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Rare & Secret Craft Inventions */}
            {scanResult.rare_crafts && scanResult.rare_crafts.length > 0 && (
              <div className="space-y-4 p-6 sm:p-7 rounded-3xl bg-gradient-to-br from-purple-50 via-pink-50 to-amber-50 border-2 border-purple-300 shadow-md">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-600 text-white text-xs font-display font-extrabold uppercase tracking-wider shadow-sm">
                      <Zap className="w-3.5 h-3.5 text-yellow-300 fill-yellow-300" />
                      Rare Inventions Lab
                    </span>
                    <h4 className="font-display font-extrabold text-2xl text-purple-950 mt-1 flex items-center gap-2">
                      <span>🌟 Rare & Secret Craft Inventions</span>
                    </h4>
                    <p className="text-xs font-semibold text-purple-700">
                      Super creative, hard-to-find DIY inventions you can craft from this waste!
                    </p>
                  </div>
                  <span className="self-start sm:self-auto text-xs font-extrabold text-purple-800 bg-white/80 border border-purple-200 px-3 py-1 rounded-full shadow-xs">
                    {scanResult.rare_crafts.length} Rare Ideas Found
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {scanResult.rare_crafts.map((craft) => (
                    <div
                      key={craft.id}
                      className="p-5 rounded-2xl border-2 border-purple-200 bg-white/95 hover:bg-white hover:border-purple-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900 font-display font-extrabold text-[11px] flex items-center gap-1">
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                            Rare Invention • {craft.category}
                          </span>
                          <span className="text-xs font-extrabold text-purple-900 bg-amber-100 border border-amber-300 px-2.5 py-0.5 rounded-full shadow-xs">
                            +{craft.eco_points} Eco Pts
                          </span>
                        </div>
                        <h5 className="font-display font-extrabold text-lg text-slate-900 line-clamp-1">
                          {craft.title}
                        </h5>
                        <p className="text-xs font-medium text-slate-600 line-clamp-2">
                          {craft.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-purple-100 flex items-center justify-between text-xs font-bold">
                        <span className="text-purple-700">
                          ⏱️ {craft.estimated_time_minutes} min • {craft.difficulty}
                        </span>
                        <Link
                          to={`/crafts/${craft.id}`}
                          onClick={() => playSound('click')}
                          className="btn-kid bg-purple-600 hover:bg-purple-700 text-white py-1.5 px-4 text-xs font-bold inline-flex items-center gap-1 shadow-sm"
                        >
                          <span>Build Invention</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommended Crafts Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-extrabold text-xl text-slate-900">
                    Recommended Crafts For Your {scanResult.detected_object}
                  </h4>
                  <p className="text-xs font-semibold text-slate-500">
                    Ranked by material compatibility and kid safety
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {scanResult.recommended_crafts && scanResult.recommended_crafts.length > 0 ? (
                  scanResult.recommended_crafts.map((craft) => (
                    <div
                      key={craft.id}
                      className="p-5 rounded-3xl border-2 border-eco-200 bg-white hover:border-eco-400 transition-all flex flex-col justify-between space-y-4 shadow-sm"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="px-2.5 py-0.5 rounded-full bg-eco-100 text-eco-800 font-display font-bold text-[11px] capitalize">
                            {craft.category}
                          </span>
                          <span className="text-xs font-extrabold text-amber-700 bg-sunny-100 px-2 py-0.5 rounded-full">
                            +{craft.eco_points} Pts
                          </span>
                        </div>
                        <h5 className="font-display font-extrabold text-lg text-slate-900 line-clamp-1">
                          {craft.title}
                        </h5>
                        <p className="text-xs font-medium text-slate-600 line-clamp-2">
                          {craft.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                        <span className="text-slate-400">
                          ⏱️ {craft.estimated_time_minutes} min • {craft.difficulty}
                        </span>
                        <Link
                          to={`/crafts/${craft.id}`}
                          onClick={() => playSound('click')}
                          className="btn-kid btn-kid-green py-1.5 px-4 text-xs font-bold inline-flex items-center gap-1"
                        >
                          <span>Build This</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 text-center py-6 text-sm font-semibold text-slate-500">
                    No crafts matched this exact material yet. Check out our full 30+ catalog!
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
