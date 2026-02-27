'use client';

import { useRef, useState, useEffect, useCallback } from 'react';
import { Hexagon, C } from './HexUI';

interface CameraViewProps {
  visible: boolean;
  onCapture: (base64: string) => void;
  onClose: () => void;
}

function RectGuideFrame() {
  return (
    <div className="camera-guide-frame">
      <div className="camera-corner camera-corner-tl" />
      <div className="camera-corner camera-corner-tr" />
      <div className="camera-corner camera-corner-bl" />
      <div className="camera-corner camera-corner-br" />
    </div>
  );
}

export default function CameraView({ visible, onCapture, onClose }: CameraViewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isTaking, setIsTaking] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [cameraError, setCameraError] = useState(false);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
  }, []);

  const startCamera = useCallback(async () => {
    setCameraError(false);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.onloadedmetadata = () => setCameraReady(true);
      }
    } catch {
      setCameraError(true);
    }
  }, []);

  useEffect(() => {
    if (visible) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [visible, startCamera, stopCamera]);

  const handleCapture = () => {
    if (!videoRef.current || !canvasRef.current || isTaking) return;
    setIsTaking(true);

    const video = videoRef.current;
    const canvas = canvasRef.current;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) { setIsTaking(false); return; }

    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
    stopCamera();
    onCapture(base64);
    setIsTaking(false);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      const base64 = dataUrl.replace(/^data:image\/\w+;base64,/, '');
      stopCamera();
      onCapture(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleClose = () => {
    stopCamera();
    onClose();
  };

  if (!visible) return null;

  return (
    <div className="camera-overlay">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileUpload}
        style={{ display: 'none' }}
      />

      {/* video は常にDOMに存在させ、refを確保する */}
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="camera-video"
        style={{ display: cameraReady && !cameraError ? 'block' : 'none' }}
      />

      {cameraError || !cameraReady ? (
        <div className="camera-permission">
          <div className="hex-icon-wrap">
            <Hexagon size={56} stroke={C.dimLight} strokeWidth={1.5} />
            <span className="hex-icon-inner" style={{ fontSize: 24 }}>📷</span>
          </div>
          {cameraError ? (
            <>
              <span className="camera-permission-text">
                カメラにアクセスできませんでした。<br />
                ファイルから画像をアップロードしてください。
              </span>
              <button
                className="camera-permission-button"
                onClick={() => fileInputRef.current?.click()}
              >
                ⬡ 画像をアップロード
              </button>
            </>
          ) : (
            <span className="camera-permission-text">カメラを起動中...</span>
          )}
          <button
            className="camera-upload-button"
            style={{ marginTop: 16 }}
            onClick={handleClose}
          >
            キャンセル
          </button>
        </div>
      ) : (
        <div className="camera-container">
          <div className="camera-guide-overlay">
            <RectGuideFrame />
            <span className="camera-guide-text">問題をフレーム内に収めてください</span>
          </div>

          <div className="camera-controls">
            <button className="camera-close-button" onClick={handleClose}>
              <span className="back-hex">
                <Hexagon size={18} stroke={C.dimLight} />
              </span>
              <span className="camera-close-text">CANCEL</span>
            </button>

            <button
              className="camera-capture-button"
              onClick={handleCapture}
              disabled={isTaking}
            >
              {isTaking ? (
                <span className="spinner" />
              ) : (
                <Hexagon size={40} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={2} />
              )}
            </button>

            <div className="camera-spacer">
              <button
                className="camera-upload-button"
                onClick={() => fileInputRef.current?.click()}
              >
                📁 FILE
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
