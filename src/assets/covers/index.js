// 生成SVG格式的几何图案封面
export const generateGeometricCover = (index) => {
  const patterns = [
    // 封面1: 紫色渐变背景 + 几何线条
    `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:#f3e8ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d8b4fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad1)"/>
      <path d="M0,540 L1920,540" stroke="#c084fc" stroke-width="1" stroke-opacity="0.2"/>
      <path d="M960,0 L960,1080" stroke="#c084fc" stroke-width="1" stroke-opacity="0.2"/>
      ${Array.from({length: 20}, (_, i) => 
        `<circle cx="${Math.random() * 1920}" cy="${Math.random() * 1080}" r="${Math.random() * 50 + 10}"
         fill="#a855f7" fill-opacity="0.1"/>`
      ).join('')}
    </svg>`,

    // 封面2: 紫色波浪图案
    `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad2" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#faf5ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#e9d5ff;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad2)"/>
      ${Array.from({length: 5}, (_, i) => 
        `<path d="M0,${200 + i * 200} C480,${150 + i * 200} 960,${250 + i * 200} 1920,${200 + i * 200}"
         stroke="#9333ea" stroke-width="2" stroke-opacity="${0.1 + i * 0.02}" fill="none"/>`
      ).join('')}
    </svg>`,

    // 封面3: 紫色多边形图案
    `<svg width="1920" height="1080" viewBox="0 0 1920 1080" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="grad3" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" style="stop-color:#f3e8ff;stop-opacity:1" />
          <stop offset="100%" style="stop-color:#d8b4fe;stop-opacity:1" />
        </linearGradient>
      </defs>
      <rect width="100%" height="100%" fill="url(#grad3)"/>
      ${Array.from({length: 15}, () => {
        const points = Array.from({length: 6}, () => 
          `${Math.random() * 1920},${Math.random() * 1080}`
        ).join(' ');
        return `<polygon points="${points}" fill="#7e22ce" fill-opacity="0.1"/>`;
      }).join('')}
    </svg>`
  ];

  return patterns[index % patterns.length];
}; 