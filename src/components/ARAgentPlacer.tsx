import { useState, useEffect, useRef } from "react";
import {
  Camera,
  MapPin,
  Crosshair,
  CheckCircle,
  ArrowLeft,
  AlertCircle,
  Info,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

interface ARAgentPlacerProps {
  onPlacementComplete?: (coordinates: {
    latitude: number;
    longitude: number;
    altitude: number;
  }) => void;
}

const ARAgentPlacer = ({ onPlacementComplete }: ARAgentPlacerProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [placedPosition, setPlacedPosition] = useState<{
    screenX: number;
    screenY: number;
  } | null>(null);
  const [cameraActive, setCameraActive] = useState(false);
  const [error, setError] = useState<string>("");
  const [locationAccuracy, setLocationAccuracy] = useState<number>(0);
  const [deviceOrientation, setDeviceOrientation] = useState<{
    alpha: number | null;
    beta: number | null;
    gamma: number | null;
  }>({ alpha: null, beta: null, gamma: null });

  // Get deployment data from navigation state
  const deploymentData = location.state?.deploymentData || {};

  useEffect(() => {
    getCurrentLocation();
    initializeCamera();
    initializeDeviceOrientation();

    return () => {
      // Cleanup camera stream
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  const initializeCamera = async () => {
    try {
      // First, check if camera is available
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(
        (device) => device.kind === "videoinput"
      );

      if (videoDevices.length === 0) {
        setError("No camera found on this device.");
        return;
      }

      // Try to get camera stream with fallback options
      let stream = null;

      try {
        // First attempt: High quality with rear camera
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: "environment",
            width: { ideal: 1920 },
            height: { ideal: 1080 },
          },
        });
      } catch (err) {
        console.log("Rear camera unavailable, trying default camera...");
        // Fallback: Try without facingMode
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
          });
        } catch (err2) {
          console.log("HD failed, trying basic camera...");
          // Final fallback: Basic camera
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
          });
        }
      }

      if (stream && videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraActive(true);
        setError("");
      }
    } catch (err: any) {
      console.error("Camera error:", err);

      let errorMessage = "Unable to access camera. ";

      if (err.name === "NotAllowedError") {
        errorMessage += "Please grant camera permissions and reload the page.";
      } else if (err.name === "NotFoundError") {
        errorMessage += "No camera found on this device.";
      } else if (err.name === "NotReadableError") {
        errorMessage +=
          "Camera is already in use by another application. Please close other apps using the camera and try again.";
      } else if (err.name === "OverconstrainedError") {
        errorMessage += "Camera doesn't support the requested settings.";
      } else {
        errorMessage += "An unknown error occurred: " + err.message;
      }

      setError(errorMessage);
    }
  };

  const initializeDeviceOrientation = () => {
    if (typeof DeviceOrientationEvent !== "undefined") {
      // Request permission for iOS 13+
      if (
        typeof (DeviceOrientationEvent as any).requestPermission === "function"
      ) {
        (DeviceOrientationEvent as any)
          .requestPermission()
          .then((permissionState: string) => {
            if (permissionState === "granted") {
              window.addEventListener(
                "deviceorientation",
                handleOrientation,
                true
              );
            }
          })
          .catch(console.error);
      } else {
        // Non iOS 13+ devices
        window.addEventListener("deviceorientation", handleOrientation, true);
      }
    }
  };

  const handleOrientation = (event: DeviceOrientationEvent) => {
    setDeviceOrientation({
      alpha: event.alpha, // Compass direction (0-360)
      beta: event.beta, // Front-to-back tilt (-180 to 180)
      gamma: event.gamma, // Left-to-right tilt (-90 to 90)
    });
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError("Geolocation is not supported by your browser");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setLocationAccuracy(position.coords.accuracy);
        setError("");
      },
      (error) => {
        console.error("Location error:", error);
        setError("Unable to get your location. Please enable GPS.");
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  };

  const handlePlaceAgent = () => {
    if (!videoRef.current || !canvasRef.current) return;

    // Get center of video screen
    const centerX = videoRef.current.videoWidth / 2;
    const centerY = videoRef.current.videoHeight / 2;

    setPlacedPosition({
      screenX: centerX,
      screenY: centerY,
    });
  };

  const confirmPlacement = () => {
    if (!userLocation || !placedPosition) {
      setError("Location or placement position not available");
      return;
    }

    // Calculate approximate distance and bearing from device orientation
    // Assume user is pointing at ground ~2-5 meters away
    const estimatedDistance = 3; // meters
    const bearing = deviceOrientation.alpha || 0; // Compass direction

    // Convert bearing to radians
    const bearingRad = (bearing * Math.PI) / 180;

    // Calculate offset in meters
    const metersPerDegree = 111320;
    const latOffset =
      (Math.cos(bearingRad) * estimatedDistance) / metersPerDegree;
    const lonOffset =
      (Math.sin(bearingRad) * estimatedDistance) /
      (metersPerDegree * Math.cos((userLocation.latitude * Math.PI) / 180));

    const finalCoordinates = {
      latitude: userLocation.latitude + latOffset,
      longitude: userLocation.longitude + lonOffset,
      altitude: 0, // Ground level
    };

    // Navigate back to deployment page with coordinates
    navigate("/deploy", {
      state: {
        ...deploymentData,
        arPlacedCoordinates: finalCoordinates,
        accuracy: locationAccuracy,
      },
    });

    // Also call callback if provided
    if (onPlacementComplete) {
      onPlacementComplete(finalCoordinates);
    }
  };

  const cancelPlacement = () => {
    navigate("/deploy", {
      state: deploymentData,
    });
  };

  if (error && !userLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-red-50 to-red-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <AlertCircle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Location Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <div className="space-y-3">
            <button
              onClick={getCurrentLocation}
              className="w-full bg-red-600 text-white px-6 py-3 rounded-lg hover:bg-red-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={cancelPlacement}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Deployment
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (error && !cameraActive) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-orange-50 to-orange-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <Camera className="h-12 w-12 text-orange-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Camera Error
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>

          {error.includes("already in use") && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm text-blue-800 font-medium mb-2">
                Quick Fix:
              </p>
              <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                <li>Close any other apps using the camera</li>
                <li>Close other browser tabs with camera access</li>
                <li>Check if video conferencing apps are running</li>
                <li>Click "Try Again" below</li>
              </ol>
            </div>
          )}

          <div className="space-y-3">
            <button
              onClick={() => {
                setError("");
                initializeCamera();
              }}
              className="w-full bg-orange-600 text-white px-6 py-3 rounded-lg hover:bg-orange-700 transition-colors flex items-center justify-center space-x-2"
            >
              <Camera className="h-5 w-5" />
              <span>Try Again</span>
            </button>
            <button
              onClick={cancelPlacement}
              className="w-full bg-gray-200 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-300 transition-colors"
            >
              Back to Deployment
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black relative overflow-hidden">
      {/* Camera Video Feed */}
      <div className="absolute inset-0">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover"
        />

        {/* Canvas for AR overlays */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
        />
      </div>

      {/* AR Placement Marker */}
      {cameraActive && !placedPosition && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Crosshair */}
            <div className="w-16 h-16 relative">
              <div className="absolute inset-0 border-4 border-blue-500 rounded-full opacity-60 animate-pulse" />
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-blue-500" />
              <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-blue-500" />
            </div>
            {/* Label */}
            <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-black/70 px-4 py-2 rounded-lg whitespace-nowrap">
              <p className="text-white text-sm font-medium">
                Point at the ground
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Placement Preview */}
      {placedPosition && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Placed Marker */}
            <div className="w-24 h-24 relative animate-bounce">
              {/* Pin Icon */}
              <div className="absolute inset-0 flex items-center justify-center">
                <MapPin className="h-20 w-20 text-green-500 drop-shadow-lg" />
              </div>
              {/* Pulsing Circle */}
              <div className="absolute inset-0">
                <div className="w-full h-full border-4 border-green-400 rounded-full opacity-40 animate-ping" />
              </div>
            </div>
            {/* Label */}
            <div className="absolute top-28 left-1/2 -translate-x-1/2 bg-green-500/90 px-4 py-2 rounded-lg whitespace-nowrap">
              <p className="text-white text-sm font-bold">Agent Placed Here</p>
            </div>
          </div>
        </div>
      )}

      {/* Top Info Bar */}
      <div className="absolute top-0 left-0 right-0 z-10 bg-gradient-to-b from-black/80 to-transparent p-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between">
            <button
              onClick={cancelPlacement}
              className="flex items-center space-x-2 text-white bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg hover:bg-white/20 transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
              <span>Back</span>
            </button>

            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-lg">
              <Camera className="h-5 w-5 text-green-400" />
              <span className="text-white font-medium">AR Placement Mode</span>
            </div>
          </div>
        </div>
      </div>

      {/* Location Info */}
      {userLocation && (
        <div className="absolute top-20 left-4 z-10 bg-black/70 backdrop-blur-sm rounded-xl p-4 text-white max-w-xs">
          <div className="flex items-center mb-2">
            <MapPin className="h-4 w-4 mr-2 text-green-400" />
            <span className="font-medium text-sm">Your Location</span>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            <div>Lat: {userLocation.latitude.toFixed(6)}</div>
            <div>Lon: {userLocation.longitude.toFixed(6)}</div>
            <div>Accuracy: ±{locationAccuracy.toFixed(1)}m</div>
          </div>
        </div>
      )}

      {/* Instructions */}
      <div className="absolute bottom-32 left-0 right-0 z-10 flex justify-center px-4">
        <div className="bg-black/70 backdrop-blur-sm rounded-xl p-4 text-white max-w-md">
          <div className="flex items-center mb-2">
            <Info className="h-4 w-4 mr-2 text-blue-400" />
            <span className="font-medium text-sm">Instructions</span>
          </div>
          <div className="text-xs text-gray-300 space-y-1">
            {!placedPosition ? (
              <>
                <div>• Look around using your device</div>
                <div>• Point camera at the ground where you want the agent</div>
                <div>• Tap "Place Agent" button below</div>
              </>
            ) : (
              <>
                <div>• Green box shows agent preview</div>
                <div>• Red pin marks exact placement</div>
                <div>• Tap "Confirm" to use this location</div>
                <div>• Or "Reposition" to place again</div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="absolute bottom-4 left-0 right-0 z-10 flex justify-center px-4">
        <div className="bg-black/70 backdrop-blur-sm rounded-2xl p-4 max-w-md w-full">
          {!placedPosition ? (
            <button
              onClick={handlePlaceAgent}
              disabled={!cameraActive || !userLocation}
              className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <Crosshair className="h-6 w-6" />
              <span>
                {!cameraActive
                  ? "Starting Camera..."
                  : !userLocation
                  ? "Getting Location..."
                  : "Place Agent Here"}
              </span>
            </button>
          ) : (
            <div className="space-y-3">
              <button
                onClick={confirmPlacement}
                className="w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-green-600 hover:to-emerald-700 transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle className="h-6 w-6" />
                <span>Confirm Placement</span>
              </button>

              <button
                onClick={() => setPlacedPosition(null)}
                className="w-full bg-gray-600 text-white px-8 py-3 rounded-xl font-semibold hover:bg-gray-700 transition-all"
              >
                Reposition Agent
              </button>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="absolute top-24 left-4 right-4 z-10 bg-red-500/90 backdrop-blur-sm rounded-lg p-4 text-white flex items-center">
          <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}
    </div>
  );
};

export default ARAgentPlacer;
