const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
const css = getComputedStyle(document.documentElement);

function hex(h) {
    h = (h || '').trim().replace('#', '');
    if (h.length === 3) h = h.split('').map(c => c + c).join('');
    const n = parseInt(h, 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

const bg = (css.getPropertyValue('--bg-color') || '#141414').trim();
const i1 = hex(css.getPropertyValue('--ink-1') || '#3f3f46');
const i2 = hex(css.getPropertyValue('--ink-2') || '#a1a1aa');

const CELL = 15;
const RAMP = ' .:-=+*#%@';
let w, h, cols, rows;
const mouse = { x: -9999, y: -9999 };

function build() {
    w = cv.width = innerWidth; h = cv.height = innerHeight;
    cols = Math.ceil(w / CELL); rows = Math.ceil(h / CELL);
    ctx.font = `${CELL}px "JetBrains Mono", ui-monospace, monospace`;
    ctx.textBaseline = 'top';
}
addEventListener('resize', build);
addEventListener('mousemove', e => { mouse.x = e.clientX; mouse.y = e.clientY; });
addEventListener('mouseleave', () => { mouse.x = mouse.y = -9999; });
build();

function step(t) {
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
            const px = i * CELL, py = j * CELL;
            let v = Math.sin(i * 0.28 + t) * 0.5
                  + Math.sin(j * 0.34 - t * 0.8) * 0.5
                  + Math.sin((i + j) * 0.18 + t * 0.6) * 0.6
                  + Math.sin(Math.hypot(i - cols / 2, j - rows / 2) * 0.35 - t * 1.4) * 0.7;
            const dx = px - mouse.x, dy = py - mouse.y, d = Math.hypot(dx, dy);
            if (d < 220) v += (1 - d / 220) * 1.6;
            let n = (v / 2.8) * 0.5 + 0.5;
            n = Math.max(0, Math.min(0.999, n));
            const ch = RAMP[(n * RAMP.length) | 0];
            if (ch === ' ') continue;
            const r = i1[0] + (i2[0] - i1[0]) * n | 0;
            const g = i1[1] + (i2[1] - i1[1]) * n | 0;
            const b = i1[2] + (i2[2] - i1[2]) * n | 0;
            ctx.fillStyle = `rgba(${r},${g},${b},${0.25 + n * 0.75})`;
            ctx.fillText(ch, px, py);
        }
    }
}

if (matchMedia('(prefers-reduced-motion: reduce)').matches) {
    step(1.0);
} else {
    let t = 0;
    (function loop() { t += 0.035; step(t); requestAnimationFrame(loop); })();
}
