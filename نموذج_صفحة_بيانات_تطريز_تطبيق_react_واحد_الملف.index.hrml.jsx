import React, { useState } from 'react';

// Export default single-file React component
// Tailwind CSS classes used for styling (no import needed when embedded in a Tailwind project)

export default function EmbroideryForm() {
  const [location, setLocation] = useState('صدر - أعلى');
  const [method, setMethod] = useState('قسطري (Satin)');
  const [stitchCount, setStitchCount] = useState(1200);
  const [density, setDensity] = useState(5); // lower = tighter
  const [color, setColor] = useState('#ff0000');
  const [shape, setShape] = useState('مستطيل');
  const [designName, setDesignName] = useState('تصميم_العميل');

  // Simple generator: create array of 'stitches' as points for SVG preview
  function generateStitches() {
    const stitches = [];
    const cols = Math.max(1, Math.round(Math.sqrt(stitchCount / (density || 1))));
    const rows = Math.max(1, Math.ceil(stitchCount / cols));
    const width = 200;
    const height = 120;
    const spacingX = width / Math.max(1, cols - 1);
    const spacingY = height / Math.max(1, rows - 1);
    let cnt = 0;
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        if (cnt >= stitchCount) break;
        const x = c * spacingX;
        const y = r * spacingY;
        stitches.push({ x: Math.round(x), y: Math.round(y) });
        cnt++;
      }
      if (cnt >= stitchCount) break;
    }
    return { stitches, width, height };
  }

  const preview = generateStitches();

  function downloadJSON() {
    const payload = {
      designName,
      location,
      method,
      stitchCount,
      density,
      color,
      shape,
      generatedOn: new Date().toISOString(),
      stitches: preview.stitches,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designName}.embro.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadSVG() {
    const svgHeader = `<?xml version="1.0" encoding="UTF-8"?>`;
    const viewBox = `0 0 ${preview.width} ${preview.height}`;
    const points = preview.stitches.map(p => `${p.x},${p.y}`).join(' ');
    // draw small circles to represent individual stitches
    const circles = preview.stitches
      .map(p => `<circle cx="${p.x}" cy="${p.y}" r="1.2" />`)
      .join('\n');
    const svg = `${svgHeader}\n<svg xmlns=\"http://www.w3.org/2000/svg\" viewBox=\"${viewBox}\">\n  <g stroke=\"none\" fill=\"${color}\">\n    ${circles}\n  </g>\n</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${designName}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="p-6 max-w-4xl mx-auto font-sans">
      <h1 className="text-2xl font-bold mb-4">نموذج بيانات تطريز - تصدير ملف تصميم</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <label className="block">اسم التصميم</label>
          <input className="w-full p-2 border rounded" value={designName} onChange={e => setDesignName(e.target.value)} />

          <label className="block">مكان التطريز</label>
          <select className="w-full p-2 border rounded" value={location} onChange={e => setLocation(e.target.value)}>
            <option>صدر - أعلى</option>
            <option>صدر - وسط</option>
            <option>ظهر</option>
            <option>كم</option>
            <option>طوق</option>
            <option>جيب</option>
            <option>قماش مخصص</option>
          </select>

          <label className="block">طريقة التطريز</label>
          <select className="w-full p-2 border rounded" value={method} onChange={e => setMethod(e.target.value)}>
            <option>قسطري (Satin)</option>
            <option>پلات (Fill / Tatami)</option>
            <option>سِتِتش حر (Run stitch)</option>
            <option>تطريز رقمي حر (Freehand)</option>
          </select>

          <label className="block">عدد الغرز</label>
          <input type="number" className="w-full p-2 border rounded" value={stitchCount} onChange={e => setStitchCount(Number(e.target.value))} min={1} />

          <label className="block">كثافة الغرزة (1 = مشدود، 10 = فضفاض)</label>
          <input type="range" min="1" max="10" value={density} onChange={e => setDensity(Number(e.target.value))} />
          <div>قيمة الكثافة: {density}</div>

          <label className="block">لون الغرزة</label>
          <input type="color" className="w-24 h-10 p-1 border rounded" value={color} onChange={e => setColor(e.target.value)} />

          <label className="block">شكل الغرزة / منطقة</label>
          <select className="w-full p-2 border rounded" value={shape} onChange={e => setShape(e.target.value)}>
            <option>مستطيل</option>
            <option>دائري</option>
            <option>بيضاوي</option>
            <option>شكل مخصص</option>
          </select>

          <div className="flex gap-2 mt-3">
            <button onClick={downloadJSON} className="px-4 py-2 rounded shadow border">تصدير JSON (.embro.json)</button>
            <button onClick={downloadSVG} className="px-4 py-2 rounded shadow border">تصدير SVG</button>
          </div>

          <div className="mt-3 text-sm text-gray-700">
            ملاحظة: الملفان المصدَّران هما تمثيل بيانات التصميم والمعاينة. لتحويلهما إلى صيغة ماكينة التطريز (مثلاً .DST او .PES) يمكنك استخدام أدوات خارجية مثل مكتبة <code>pyembroidery</code> أو برنامج <code>Ink/Stitch</code>، أو تحويل JSON إلى صيغة وسيطة عبر سكربت بايثون.
          </div>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-semibold mb-2">معاينة التصميم (SVG)</h2>
          <div className="border p-2 bg-white">
            <svg viewBox={`0 0 ${preview.width} ${preview.height}`} className="w-full h-auto border">
              <rect x="0" y="0" width={preview.width} height={preview.height} fill="#fff" />
              <g>
                {preview.stitches.map((p, i) => (
                  <circle key={i} cx={p.x} cy={p.y} r={1.2} />
                ))}
              </g>
            </svg>

            <div className="mt-2 text-sm">
              <div>عدد الغرز المعاين: {preview.stitches.length}</div>
              <div>حجم المعاينة: {preview.width} × {preview.height} (px)</div>
            </div>

            <h3 className="mt-3 font-medium">تفاصيل مُولَّدة</h3>
            <pre className="text-xs p-2 bg-gray-50 overflow-auto h-36">{JSON.stringify({ designName, location, method, stitchCount, density, color, shape }, null, 2)}</pre>
          </div>
        </div>
      </div>

    </div>
  );
}
