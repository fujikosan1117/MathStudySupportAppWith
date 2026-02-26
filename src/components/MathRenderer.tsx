/**
 * MathRenderer.tsx — Markdown + LaTeX 数式レンダラー
 *
 * WebView 内で KaTeX (CDN) を使い、Gemini が返した
 * Markdown テキスト中の $...$ や $$...$$ を数式として描画する。
 * ページ高さを postMessage で RN 側に通知し、自動リサイズする。
 */
import React, { useState } from 'react';
import { View, ActivityIndicator, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

interface MathRendererProps {
  content: string;
  minHeight?: number;
}

const generateHtml = (content: string): string => {
  const escaped = JSON.stringify(content);
  return `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"></script>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: -apple-system, 'Hiragino Sans', sans-serif;
      font-size: 16px;
      line-height: 1.8;
      color: #E0E0E0;
      background-color: #000000;
      padding: 16px;
      word-wrap: break-word;
      overflow-wrap: break-word;
    }
    h1 { font-size: 1.4em; color: #FFFFFF; margin: 16px 0 8px; }
    h2 { font-size: 1.2em; color: #FFFFFF; margin: 14px 0 6px; }
    h3 { font-size: 1.1em; color: #CCCCCC; margin: 12px 0 4px; }
    p { margin-bottom: 12px; }
    ul, ol { padding-left: 20px; margin-bottom: 12px; }
    li { margin-bottom: 4px; }
    code {
      background: #1A1A1A;
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 0.9em;
      font-family: 'Courier New', monospace;
      color: #CCCCCC;
    }
    pre {
      background: #1A1A1A;
      padding: 12px;
      border-radius: 8px;
      overflow-x: auto;
      margin-bottom: 12px;
      color: #CCCCCC;
    }
    .katex-display {
      overflow-x: auto;
      overflow-y: hidden;
      margin: 12px 0;
    }
    .katex { color: #FFFFFF; }
    strong { font-weight: 700; color: #FFFFFF; }
    blockquote {
      border-left: 3px solid #555555;
      padding-left: 12px;
      color: #999999;
      margin: 8px 0;
    }
  </style>
</head>
<body>
  <div id="content"></div>
  <script>
    const raw = ${escaped};

    // Simple markdown conversion
    function convertMarkdown(text) {
      const lines = text.split('\\n');
      let html = '';
      let inList = false;

      for (let line of lines) {
        if (line.startsWith('### ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<h3>' + line.slice(4) + '</h3>';
        } else if (line.startsWith('## ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<h2>' + line.slice(3) + '</h2>';
        } else if (line.startsWith('# ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<h1>' + line.slice(2) + '</h1>';
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          if (!inList) { html += '<ul>'; inList = true; }
          html += '<li>' + line.slice(2) + '</li>';
        } else if (line.startsWith('> ')) {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<blockquote>' + line.slice(2) + '</blockquote>';
        } else if (line.trim() === '') {
          if (inList) { html += '</ul>'; inList = false; }
          html += '<br>';
        } else {
          if (inList) { html += '</ul>'; inList = false; }
          // Bold: **text**
          let processed = line.replace(/\\*\\*(.+?)\\*\\*/g, '<strong>$1</strong>');
          // Inline code: \`code\`
          processed = processed.replace(/\`(.+?)\`/g, '<code>$1</code>');
          html += '<p>' + processed + '</p>';
        }
      }
      if (inList) html += '</ul>';
      return html;
    }

    document.getElementById('content').innerHTML = convertMarkdown(raw);

    renderMathInElement(document.body, {
      delimiters: [
        { left: '$$', right: '$$', display: true },
        { left: '$', right: '$', display: false },
        { left: '\\\\[', right: '\\\\]', display: true },
        { left: '\\\\(', right: '\\\\)', display: false }
      ],
      throwOnError: false,
      errorColor: '#CC0000'
    });

    // ページ高さを RN に通知
    window.ReactNativeWebView.postMessage(
      JSON.stringify({ type: 'height', value: document.body.scrollHeight })
    );
  </script>
</body>
</html>
`;
};

export default function MathRenderer({ content, minHeight = 200 }: MathRendererProps) {
  const [height, setHeight] = useState(minHeight);
  const [loading, setLoading] = useState(true);

  return (
    <View style={[styles.container, { height }]}>
      {loading && (
        <View style={styles.loader}>
          <ActivityIndicator size="small" color="#FFFFFF" />
        </View>
      )}
      <WebView
        source={{ html: generateHtml(content) }}
        style={styles.webview}
        scrollEnabled={false}
        onLoadEnd={() => setLoading(false)}
        onMessage={(event) => {
          try {
            const msg = JSON.parse(event.nativeEvent.data);
            if (msg.type === 'height') {
              setHeight(Math.max(msg.value + 32, minHeight));
            }
          } catch {}
        }}
        showsVerticalScrollIndicator={false}
        originWhitelist={['*']}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  loader: {
    position: 'absolute',
    top: 16,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 1,
  },
});
