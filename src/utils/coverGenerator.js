import { generateGeometricCover } from '../assets/covers';

export async function generateCovers() {
  const covers = [];
  
  for (let i = 0; i < 3; i++) {
    const svg = generateGeometricCover(i);
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    
    // 将SVG转换为图片
    const img = new Image();
    img.src = url;
    await new Promise(resolve => img.onload = resolve);

    // 创建canvas并绘制图片
    const canvas = document.createElement('canvas');
    canvas.width = 1920;
    canvas.height = 1080;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);

    // 转换为base64
    const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
    covers.push(dataUrl);

    URL.revokeObjectURL(url);
  }

  return covers;
}

// 为文章生成封面
export function generateArticleCover(index) {
  const svg = `<svg width="800" height="400" viewBox="0 0 800 400" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <linearGradient id="articleGrad${index}" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" style="stop-color:#f3e8ff;stop-opacity:1" />
        <stop offset="100%" style="stop-color:#d8b4fe;stop-opacity:1" />
      </linearGradient>
    </defs>
    <rect width="100%" height="100%" fill="url(#articleGrad${index})"/>
    ${Array.from({length: 8}, () => {
      const x = Math.random() * 800;
      const y = Math.random() * 400;
      const size = Math.random() * 100 + 50;
      return `<circle cx="${x}" cy="${y}" r="${size}" fill="#9333ea" fill-opacity="0.1"/>`;
    }).join('')}
  </svg>`;

  const blob = new Blob([svg], { type: 'image/svg+xml' });
  return URL.createObjectURL(blob);
} 