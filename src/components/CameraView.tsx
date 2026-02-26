/**
 * CameraView.tsx — カメラ撮影モーダル
 *
 * expo-camera の CameraView を Modal 内で表示し、
 * 撮影した写真を base64 で親コンポーネントに返す。
 * 四隅コーナーブラケットのガイドフレーム付き。
 */
import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Modal,
  Dimensions,
} from 'react-native';
import { CameraView as ExpoCameraView, useCameraPermissions } from 'expo-camera';
import { Hexagon, C } from './HexUI';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface CameraViewProps {
  visible: boolean;
  onCapture: (base64: string) => void;
  onClose: () => void;
}

// 矩形コーナーブラケット ガイドフレーム
function RectGuideFrame() {
  const w = SCREEN_WIDTH * 0.82;
  const h = w * 1.3;
  const corner = 28;
  const borderColor = 'rgba(255,255,255,0.6)';
  const borderWidth = 2.5;

  const cornerStyle = {
    position: 'absolute' as const,
    width: corner,
    height: corner,
    borderColor,
  };

  return (
    <View style={{ width: w, height: h }}>
      <View style={[cornerStyle, { top: 0, left: 0, borderTopWidth: borderWidth, borderLeftWidth: borderWidth }]} />
      <View style={[cornerStyle, { top: 0, right: 0, borderTopWidth: borderWidth, borderRightWidth: borderWidth }]} />
      <View style={[cornerStyle, { bottom: 0, left: 0, borderBottomWidth: borderWidth, borderLeftWidth: borderWidth }]} />
      <View style={[cornerStyle, { bottom: 0, right: 0, borderBottomWidth: borderWidth, borderRightWidth: borderWidth }]} />
    </View>
  );
}

export default function CameraView({ visible, onCapture, onClose }: CameraViewProps) {
  const [permission, requestPermission] = useCameraPermissions();
  const [isTaking, setIsTaking] = useState(false);
  const cameraRef = useRef<ExpoCameraView>(null);

  const handleCapture = async () => {
    if (!cameraRef.current || isTaking) return;
    setIsTaking(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        base64: true,
        quality: 0.8,
      });
      if (photo?.base64) {
        onCapture(photo.base64);
      }
    } catch (error) {
      console.error('Capture failed:', error);
    } finally {
      setIsTaking(false);
    }
  };

  const renderContent = () => {
    if (!permission) {
      return <ActivityIndicator size="large" color="#FFFFFF" />;
    }

    if (!permission.granted) {
      return (
        <View style={styles.permissionContainer}>
          <View style={styles.permHexWrap}>
            <Hexagon size={56} stroke={C.dimLight} strokeWidth={1.5} />
            <View style={styles.permHexInner}>
              <Text style={styles.permHexIcon}>📷</Text>
            </View>
          </View>
          <Text style={styles.permissionText}>
            問題を撮影するためにカメラの許可が必要です。
          </Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>⬡ カメラを許可する</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.cameraContainer}>
        <ExpoCameraView ref={cameraRef} style={styles.camera} facing="back" />

        {/* スキャンガイド */}
        <View style={styles.overlay}>
          <RectGuideFrame />
          <Text style={styles.guideText}>問題をフレーム内に収めてください</Text>
        </View>

        {/* 下部コントロール */}
        <View style={styles.controls}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <View style={styles.closeBtnInner}>
              <Hexagon size={18} stroke={C.dimLight} />
            </View>
            <Text style={styles.closeButtonText}>CANCEL</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.captureButton, isTaking && styles.captureButtonDisabled]}
            onPress={handleCapture}
            disabled={isTaking}
          >
            {isTaking ? (
              <ActivityIndicator color="#000" />
            ) : (
              <Hexagon size={40} fill="#FFFFFF" stroke="#FFFFFF" strokeWidth={2} />
            )}
          </TouchableOpacity>

          <View style={styles.spacer} />
        </View>
      </View>
    );
  };

  return (
    <Modal visible={visible} animationType="slide" statusBarTranslucent>
      <View style={styles.modalContainer}>{renderContent()}</View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: '#000',
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#000000',
    gap: 16,
  },
  permHexWrap: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  permHexInner: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  permHexIcon: {
    fontSize: 24,
  },
  permissionText: {
    color: '#888888',
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
  },
  permissionButton: {
    backgroundColor: '#111111',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
    letterSpacing: 1,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideText: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: 12,
    marginTop: 16,
    letterSpacing: 1,
    fontWeight: '600',
  },
  controls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
    paddingVertical: 32,
    backgroundColor: '#000',
  },
  closeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 8,
    paddingVertical: 8,
  },
  closeBtnInner: {
    opacity: 0.6,
  },
  closeButtonText: {
    color: '#888888',
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 2,
  },
  captureButton: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.3)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  spacer: {
    width: 80,
  },
});
