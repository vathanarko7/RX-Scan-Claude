(function () {
  const canvas = document.getElementById('auth-canvas');
  const authScreen = document.getElementById('auth-screen');
  if (!canvas || !authScreen) return;

  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const ctx = canvas.getContext('2d');
  const state = {
    width: 0,
    height: 0,
    dpr: 1,
    particles: [],
    barcodes: [],
    molecules: [],
    barcodeScans: [],
    rxGlyphs: [],
    dnaPhase: 0,
    radarPhase: 0,
    frame: 0,
  };

  const palette = {
    bg: '#060a10',
    teal: '0,212,170',
    blue: '0,136,255',
    white: '232,237,245',
  };

  function rgba(color, alpha) {
    return `rgba(${color},${alpha})`;
  }

  function buildBarcodeBars(width) {
    const bars = [];
    let used = 0;
    while (used < width) {
      const barWidth = Math.random() * 3 + 1;
      const gap = Math.random() * 2 + 1;
      const height = Math.random() * 0.55 + 0.35;
      bars.push({ width: barWidth, gap, height });
      used += barWidth + gap;
    }
    return bars;
  }

  function resize() {
    state.dpr = Math.min(window.devicePixelRatio || 1, 2);
    state.width = window.innerWidth;
    state.height = window.innerHeight;
    canvas.width = Math.round(state.width * state.dpr);
    canvas.height = Math.round(state.height * state.dpr);
    canvas.style.width = `${state.width}px`;
    canvas.style.height = `${state.height}px`;
    ctx.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
    seedScene();
  }

  function seedScene() {
    const particleCount = state.width < 768 ? 36 : 58;
    const barcodeCount = state.width < 768 ? 3 : 5;
    const moleculeCount = state.width < 768 ? 3 : 4;
    const scanCount = state.width < 768 ? 2 : 3;
    const glyphCount = state.width < 768 ? 2 : 4;

    state.particles = Array.from({ length: particleCount }, () => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      radius: Math.random() * 2 + 0.8,
      alpha: Math.random() * 0.5 + 0.25,
      color: Math.random() > 0.58 ? palette.teal : Math.random() > 0.45 ? palette.blue : palette.white,
    }));

    state.barcodes = Array.from({ length: barcodeCount }, () => {
      const width = Math.random() * 70 + 48;
      return {
        x: Math.random() * state.width,
        y: Math.random() * state.height,
        width,
        height: Math.random() * 90 + 70,
        vx: (Math.random() - 0.5) * 0.08,
        vy: (Math.random() - 0.5) * 0.14,
        alpha: Math.random() * 0.08 + 0.03,
        alphaVelocity: (Math.random() - 0.5) * 0.002,
        bars: buildBarcodeBars(width),
      };
    });

    state.molecules = Array.from({ length: moleculeCount }, () => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      radius: Math.random() * 28 + 22,
      vx: (Math.random() - 0.5) * 0.18,
      vy: (Math.random() - 0.5) * 0.18,
      rotation: Math.random() * Math.PI * 2,
      rotationVelocity: (Math.random() - 0.5) * 0.007,
      alpha: Math.random() * 0.14 + 0.05,
    }));

    state.barcodeScans = Array.from({ length: scanCount }, () => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      width: Math.random() * 160 + 120,
      velocity: Math.random() * 0.5 + 0.3,
      alpha: Math.random() * 0.16 + 0.06,
    }));

    state.rxGlyphs = Array.from({ length: glyphCount }, () => ({
      x: Math.random() * state.width,
      y: Math.random() * state.height,
      vx: (Math.random() - 0.5) * 0.08,
      vy: -(Math.random() * 0.2 + 0.08),
      size: Math.random() * 16 + 18,
      alpha: Math.random() * 0.05 + 0.03,
    }));
  }

  function drawBackdropGlow() {
    const gradient = ctx.createRadialGradient(
      state.width * 0.5,
      state.height * 0.45,
      0,
      state.width * 0.5,
      state.height * 0.45,
      state.width * 0.58
    );
    gradient.addColorStop(0, rgba(palette.teal, 0.05));
    gradient.addColorStop(0.55, rgba(palette.blue, 0.025));
    gradient.addColorStop(1, 'transparent');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, state.width, state.height);
  }

  function drawRadarRing() {
    const centerX = state.width * 0.5;
    const centerY = state.height * 0.5;
    const radiusA = 150 + Math.sin(state.radarPhase * 0.55) * 18;
    const radiusB = 215 + Math.cos(state.radarPhase * 0.28) * 12;

    ctx.save();
    ctx.globalAlpha = 0.08;
    ctx.setLineDash([7, 12]);
    ctx.lineWidth = 1;
    ctx.strokeStyle = rgba(palette.teal, 0.38);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusA, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.045;
    ctx.strokeStyle = rgba(palette.blue, 0.28);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radiusB, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawConnections() {
    const maxDistance = 120;
    for (let i = 0; i < state.particles.length; i += 1) {
      for (let j = i + 1; j < state.particles.length; j += 1) {
        const a = state.particles[i];
        const b = state.particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        if (distance >= maxDistance) continue;
        const alpha = (1 - distance / maxDistance) * 0.18;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = rgba(palette.teal, alpha);
        ctx.lineWidth = 0.55;
        ctx.stroke();
      }
    }
  }

  function drawParticles() {
    state.particles.forEach((particle) => {
      ctx.beginPath();
      ctx.arc(particle.x, particle.y, particle.radius, 0, Math.PI * 2);
      ctx.fillStyle = rgba(particle.color, particle.alpha * 0.9);
      ctx.fill();
      if (particle.radius > 2) {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.radius + 2.4, 0, Math.PI * 2);
        ctx.strokeStyle = rgba(particle.color, particle.alpha * 0.18);
        ctx.lineWidth = 0.8;
        ctx.stroke();
      }
    });
  }

  function drawBarcodes() {
    state.barcodes.forEach((barcode) => {
      ctx.save();
      ctx.globalAlpha = barcode.alpha;
      let currentX = barcode.x;
      barcode.bars.forEach((bar) => {
        ctx.fillStyle = rgba(palette.teal, 1);
        ctx.fillRect(currentX, barcode.y, bar.width, barcode.height * bar.height);
        currentX += bar.width + bar.gap;
      });
      ctx.fillStyle = rgba(palette.blue, 0.75);
      ctx.fillRect(barcode.x - 4, barcode.y + barcode.height * 0.54, barcode.width + 8, 1.6);
      ctx.restore();
    });
  }

  function drawMolecules() {
    state.molecules.forEach((molecule) => {
      ctx.save();
      ctx.translate(molecule.x, molecule.y);
      ctx.rotate(molecule.rotation);
      ctx.globalAlpha = molecule.alpha;

      ctx.beginPath();
      ctx.arc(0, 0, molecule.radius, 0, Math.PI * 2);
      ctx.strokeStyle = rgba(palette.blue, 0.5);
      ctx.lineWidth = 1;
      ctx.stroke();

      const atoms = 4;
      for (let i = 0; i < atoms; i += 1) {
        const angle = (Math.PI * 2 * i) / atoms;
        const atomX = Math.cos(angle) * molecule.radius;
        const atomY = Math.sin(angle) * molecule.radius;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(atomX, atomY);
        ctx.strokeStyle = rgba(palette.teal, 0.36);
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.beginPath();
        ctx.arc(atomX, atomY, 3.2, 0, Math.PI * 2);
        ctx.fillStyle = rgba(i % 2 === 0 ? palette.teal : palette.blue, 0.72);
        ctx.fill();
      }

      ctx.beginPath();
      ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
      ctx.fillStyle = rgba(palette.white, 0.7);
      ctx.fill();
      ctx.restore();
    });
  }

  function drawScanStrips() {
    state.barcodeScans.forEach((strip) => {
      const gradient = ctx.createLinearGradient(strip.x - strip.width, strip.y, strip.x + strip.width, strip.y);
      gradient.addColorStop(0, rgba(palette.teal, 0));
      gradient.addColorStop(0.5, rgba(palette.teal, strip.alpha));
      gradient.addColorStop(1, rgba(palette.teal, 0));
      ctx.fillStyle = gradient;
      ctx.fillRect(strip.x - strip.width, strip.y, strip.width * 2, 1.5);
    });
  }

  function drawDNA() {
    const xBase = state.width * 0.885;
    const amplitude = state.width < 768 ? 18 : 28;
    const points = state.width < 768 ? 18 : 24;
    const spacing = state.height / points;

    ctx.save();
    ctx.globalAlpha = 0.12;
    for (let i = 0; i < points - 1; i += 1) {
      const y1 = i * spacing;
      const y2 = y1 + spacing;
      const phase1 = state.dnaPhase + i * 0.48;
      const phase2 = state.dnaPhase + (i + 1) * 0.48;
      const ax1 = xBase + Math.sin(phase1) * amplitude;
      const bx1 = xBase - Math.sin(phase1) * amplitude;
      const ax2 = xBase + Math.sin(phase2) * amplitude;
      const bx2 = xBase - Math.sin(phase2) * amplitude;

      ctx.beginPath();
      ctx.moveTo(ax1, y1);
      ctx.lineTo(ax2, y2);
      ctx.strokeStyle = rgba(palette.teal, 0.64);
      ctx.lineWidth = 1.35;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(bx1, y1);
      ctx.lineTo(bx2, y2);
      ctx.strokeStyle = rgba(palette.blue, 0.52);
      ctx.lineWidth = 1.35;
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(ax1, y1);
      ctx.lineTo(bx1, y1);
      ctx.strokeStyle = rgba(palette.white, 0.18);
      ctx.lineWidth = 0.8;
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(ax1, y1, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = rgba(palette.teal, 0.76);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(bx1, y1, 2.2, 0, Math.PI * 2);
      ctx.fillStyle = rgba(palette.blue, 0.7);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGlyphs() {
    state.rxGlyphs.forEach((glyph) => {
      ctx.save();
      ctx.globalAlpha = glyph.alpha;
      ctx.font = `700 ${glyph.size}px Syne, sans-serif`;
      ctx.fillStyle = rgba(palette.teal, 1);
      ctx.fillText('Rx', glyph.x, glyph.y);
      ctx.restore();
    });
  }

  function updateScene() {
    state.particles.forEach((particle) => {
      particle.x += particle.vx;
      particle.y += particle.vy;
      if (particle.x < -12) particle.x = state.width + 12;
      if (particle.x > state.width + 12) particle.x = -12;
      if (particle.y < -12) particle.y = state.height + 12;
      if (particle.y > state.height + 12) particle.y = -12;
    });

    state.barcodes.forEach((barcode) => {
      barcode.x += barcode.vx;
      barcode.y += barcode.vy;
      barcode.alpha += barcode.alphaVelocity;
      barcode.alpha = Math.max(0.03, Math.min(0.16, barcode.alpha));
      if (barcode.y > state.height + 120) barcode.y = -140;
      if (barcode.y < -140) barcode.y = state.height + 120;
      if (barcode.x > state.width + 120) barcode.x = -120;
      if (barcode.x < -120) barcode.x = state.width + 120;
    });

    state.molecules.forEach((molecule) => {
      molecule.x += molecule.vx;
      molecule.y += molecule.vy;
      molecule.rotation += molecule.rotationVelocity;
      if (molecule.x > state.width + 70) molecule.x = -70;
      if (molecule.x < -70) molecule.x = state.width + 70;
      if (molecule.y > state.height + 70) molecule.y = -70;
      if (molecule.y < -70) molecule.y = state.height + 70;
    });

    state.barcodeScans.forEach((strip) => {
      strip.y += strip.velocity;
      strip.x += 0.25;
      if (strip.y > state.height + 20) strip.y = -20;
      if (strip.x > state.width + strip.width) strip.x = -strip.width;
    });

    state.rxGlyphs.forEach((glyph) => {
      glyph.x += glyph.vx;
      glyph.y += glyph.vy;
      if (glyph.y < -30) {
        glyph.y = state.height + 20;
        glyph.x = Math.random() * state.width;
      }
    });

    state.dnaPhase += 0.012;
    state.radarPhase += 0.01;
    state.frame += 1;
  }

  function renderStaticFrame() {
    ctx.clearRect(0, 0, state.width, state.height);
    drawBackdropGlow();
    drawRadarRing();
    drawDNA();
    drawConnections();
    drawBarcodes();
    drawMolecules();
    drawScanStrips();
    drawParticles();
    drawGlyphs();
  }

  function animate() {
    ctx.clearRect(0, 0, state.width, state.height);
    drawBackdropGlow();
    drawRadarRing();
    drawDNA();
    drawConnections();
    drawBarcodes();
    drawMolecules();
    drawScanStrips();
    drawParticles();
    drawGlyphs();
    updateScene();
    requestAnimationFrame(animate);
  }

  function boot() {
    resize();
    if (prefersReducedMotion.matches) {
      renderStaticFrame();
      return;
    }
    animate();
  }

  window.addEventListener('resize', resize);
  if (prefersReducedMotion.addEventListener) {
    prefersReducedMotion.addEventListener('change', () => {
      resize();
      renderStaticFrame();
    });
  }

  boot();
}());
