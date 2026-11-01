// CivicShield AI - Native Device Bridge (Capacitor + Web Fallback)
import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { Geolocation } from "@capacitor/geolocation";
import { App } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

export const isNativePlatform = () => Capacitor.isNativePlatform();

/**
 * Initialize native device settings (Status bar, hardware back button)
 */
export function initNativeApp(navigate) {
  if (!Capacitor.isNativePlatform()) return;

  try {
    // Style Android status bar
    StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
    StatusBar.setBackgroundColor({ color: "#060f1b" }).catch(() => {});
  } catch (e) {
    console.warn("StatusBar setup warning:", e);
  }

  try {
    // Handle Android hardware back navigation
    App.addListener("backButton", ({ canGoBack }) => {
      const currentPath = window.location.pathname;
      if (currentPath === "/" || currentPath === "/dashboard" || currentPath === "/home") {
        App.exitApp();
      } else if (canGoBack && navigate) {
        navigate(-1);
      } else if (canGoBack) {
        window.history.back();
      } else {
        App.exitApp();
      }
    });
  } catch (e) {
    console.warn("App listener warning:", e);
  }
}

/**
 * Capture photo or pick from gallery via native camera
 */
export async function captureNativePhoto(source = "prompt") {
  if (Capacitor.isNativePlatform()) {
    try {
      const cameraSource =
        source === "camera"
          ? CameraSource.Camera
          : source === "photos"
          ? CameraSource.Photos
          : CameraSource.Prompt;

      const image = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        resultType: CameraResultType.Uri,
        source: cameraSource,
      });

      // Convert webPath to File/Blob for standard multipart upload
      const response = await fetch(image.webPath);
      const blob = await response.blob();
      const fileName = `civic_${Date.now()}.${image.format || "jpg"}`;
      const file = new File([blob], fileName, { type: `image/${image.format || "jpeg"}` });

      return {
        file,
        preview: image.webPath,
        name: fileName,
        size: (file.size / (1024 * 1024)).toFixed(2) + " MB",
      };
    } catch (err) {
      if (err.message && err.message.includes("User cancelled")) {
        return null; // User cancelled capture
      }
      console.warn("Native camera failed, falling back:", err);
    }
  }
  return null;
}

/**
 * Get high accuracy GPS coordinates via native Geolocation
 */
export async function getNativeCoordinates() {
  if (Capacitor.isNativePlatform()) {
    try {
      const position = await Geolocation.getCurrentPosition({
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 3000,
      });
      return {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      };
    } catch (err) {
      console.warn("Native geolocation error, falling back:", err);
    }
  }

  // Web Geolocation fallback
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("Geolocation is not supported"));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        resolve({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
      },
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}

