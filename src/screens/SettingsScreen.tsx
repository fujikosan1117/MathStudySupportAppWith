'use client';

import { useState, useEffect } from 'react';
import {
  Hexagon,
  HexGridBackground,
  ScanLine,
  FloatingHex,
  HexRowDecoration,
  C,
  useWindowSize,
} from '../components/HexUI';

const STORAGE_KEY = 'gemini_api_key';

function validateApiKey(key: string): { valid: boolean; message: string } {
  if (!key.trim()) return { valid: false, message: '' };
  if (key.length < 10) return { valid: false, message: 'API Key is too short' };
  if (!key.startsWith('AIza')) return { valid: false, message: 'Invalid format (must start with AIza)' };
  return { valid: true, message: 'Valid API Key format' };
}

function StatusBadge({ connected }: { connected: boolean }) {
  return (
    <div className="status-badge">
      <div className={`status-dot ${connected ? 'status-dot-connected' : 'status-dot-disconnected'}`} />
      <span className="status-text" style={{ color: connected ? C.success : C.dim }}>
        {connected ? 'KEY CONFIGURED' : 'NO KEY SET'}
      </span>
    </div>
  );
}

interface SettingsScreenProps {
  onBack: () => void;
}

export default function SettingsScreen({ onBack }: SettingsScreenProps) {
  const { width, height } = useWindowSize();
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [inputFocused, setInputFocused] = useState(false);

  useEffect(() => {
    try {
      const val = localStorage.getItem(STORAGE_KEY);
      if (val) setApiKey(val);
    } catch {
      // localStorage unavailable
    }
  }, []);

  const validation = validateApiKey(apiKey);

  const handleSave = async () => {
    if (!validation.valid) return;
    setSaveStatus('saving');

    try {
      localStorage.setItem(STORAGE_KEY, apiKey.trim());
      setSaveStatus('saved');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const handleDelete = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
    setApiKey('');
    setSaveStatus('idle');
  };

  const maskedKey =
    showKey
      ? apiKey
      : apiKey.length > 8
        ? apiKey.slice(0, 6) + '•'.repeat(Math.min(apiKey.length - 10, 30)) + apiKey.slice(-4)
        : '•'.repeat(apiKey.length);

  return (
    <div className="settings-container">
      <HexGridBackground />
      <ScanLine />
      <FloatingHex size={70} top={40} left={width - 90} delay={0} />
      <FloatingHex size={50} top={200} left={-15} delay={800} />
      <FloatingHex size={35} top={350} left={width - 60} delay={1600} />
      <FloatingHex size={45} top={height - 200} left={20} delay={400} />
      <FloatingHex size={25} top={120} left={width / 2 - 10} delay={1200} />

      <div className="settings-scroll">
        {/* Back */}
        <button className="back-button" onClick={onBack}>
          <span className="back-hex">
            <Hexagon size={18} stroke={C.dimLight} />
          </span>
          <span className="back-text">BACK</span>
        </button>

        {/* Title */}
        <div className="title-section">
          <div className="title-hex-wrap">
            <Hexagon size={36} fill={C.accent} opacity={0.08} stroke={C.accent} strokeWidth={1.5} />
            <span className="title-hex-inner">🔑</span>
          </div>
          <span className="settings-title">API Key Manager</span>
          <span className="settings-subtitle">GEMINI API CONFIGURATION</span>
          <StatusBadge connected={validation.valid && apiKey.length > 0} />
        </div>

        {/* Divider */}
        <div className="divider-row">
          <div className="divider-line" />
          <Hexagon size={10} fill={C.border} opacity={0.5} />
          <div className="divider-line" />
        </div>

        {/* Input card */}
        <div className={`input-card ${inputFocused ? 'input-card-focused' : ''}`}>
          <div className="input-label">API KEY</div>
          <div className={`input-row ${inputFocused ? 'input-row-focused' : ''}`}>
            <span className="input-icon">⬡</span>
            <input
              className="input-field"
              type="text"
              value={showKey ? apiKey : maskedKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="AIza..."
              autoCapitalize="none"
              autoCorrect="off"
              readOnly={!showKey}
              onFocus={() => { setInputFocused(true); setShowKey(true); }}
              onBlur={() => { setInputFocused(false); setShowKey(false); }}
            />
            <button className="eye-button" onMouseDown={(e) => { e.preventDefault(); setShowKey(!showKey); }}>
              {showKey ? 'HIDE' : 'SHOW'}
            </button>
          </div>

          {apiKey.length > 0 && validation.message !== '' && (
            <div className="validation-row">
              <div className="validation-dot" style={{ background: validation.valid ? C.success : C.error }} />
              <span className="validation-text" style={{ color: validation.valid ? C.success : C.error }}>
                {validation.message}
              </span>
            </div>
          )}
        </div>

        {/* Action buttons */}
        <div className="action-row">
          <button
            className={`save-button ${validation.valid ? 'save-button-valid' : 'save-button-disabled'} ${saveStatus === 'saved' ? 'save-button-success' : ''}`}
            onClick={handleSave}
            disabled={!validation.valid || saveStatus === 'saving'}
          >
            <span className={`save-button-text ${!validation.valid ? 'save-button-text-disabled' : ''}`}>
              {saveStatus === 'saving'
                ? '⟳ SAVING...'
                : saveStatus === 'saved'
                  ? '✓ SAVED'
                  : saveStatus === 'error'
                    ? '✕ ERROR'
                    : '⬡ SAVE KEY'}
            </span>
          </button>

          {apiKey.length > 0 && (
            <button className="delete-button" onClick={handleDelete}>
              <span className="delete-text">DELETE KEY</span>
            </button>
          )}
        </div>

        {/* Info card */}
        <div className="info-card">
          <div className="info-header">
            <Hexagon size={14} stroke={C.dimLight} />
            <span className="info-title">SETUP GUIDE</span>
          </div>
          <div className="info-steps">
            {[
              'Google AI Studio (aistudio.google.com) にアクセス',
              'API キーを作成',
              'キーをコピー (AIza...)',
              '上の入力欄に貼り付けて SAVE',
              'キーはローカルに保存されます',
            ].map((step, i) => (
              <div key={i} className="info-step">
                <div className="info-step-hex">
                  <Hexagon size={16} fill={C.surface} stroke={C.dim} />
                  <span className="info-step-num">{i + 1}</span>
                </div>
                <span className="info-step-text">{step}</span>
              </div>
            ))}
          </div>
        </div>

        <HexRowDecoration />
      </div>
    </div>
  );
}
