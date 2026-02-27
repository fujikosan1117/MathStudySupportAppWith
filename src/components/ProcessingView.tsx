'use client';

import { Hexagon, HexGridBackground, ScanLine, C } from './HexUI';

export default function ProcessingView() {
  return (
    <div className="processing-screen">
      <HexGridBackground />
      <ScanLine />
      <div className="processing-hex">
        <Hexagon size={60} stroke={C.accent} strokeWidth={1.5} />
      </div>
      <span className="processing-text">AI が解析中...</span>
      <span className="processing-sub-text">少々お待ちください</span>
    </div>
  );
}
