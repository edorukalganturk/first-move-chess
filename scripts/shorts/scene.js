/* Deterministic Canvas scenes: every frame depends only on its timestamp. */
(() => {
  const canvas = document.querySelector('canvas');
  const ctx = canvas.getContext('2d', { alpha: false });
  const C = {
    bg: '#102b26',
    cream: '#f4efdf',
    muted: '#b1c2b7',
    amber: '#efbd78',
    light: '#dbe2d0',
    dark: '#769982',
    ink: '#18392e',
    line: '#355048',
  };
  const B = { x: 96, y: 626, size: 816, square: 102 };
  let data;
  const pieces = {};
  const clamp = (n) => Math.max(0, Math.min(1, n));
  const ease = (n) => {
    const x = clamp(n);
    return x * x * (3 - 2 * x);
  };

  function roundRect(x, y, w, h, r, fill, stroke) {
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, r);
    if (fill) {
      ctx.fillStyle = fill;
      ctx.fill();
    }
    if (stroke) {
      ctx.strokeStyle = stroke;
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
  function text(
    value,
    x,
    y,
    size = 30,
    color = C.cream,
    weight = 400,
    font = 'DM Sans',
    max = 850,
  ) {
    ctx.fillStyle = color;
    ctx.textBaseline = 'top';
    ctx.textAlign = 'left';
    ctx.font = `${weight} ${size}px "${font}"`;
    while (ctx.measureText(value).width > max && size > 18) {
      size -= 1;
      ctx.font = `${weight} ${size}px "${font}"`;
    }
    ctx.fillText(value, x, y);
  }
  function label(value, x, y, color = C.amber, max = 850) {
    ctx.save();
    ctx.letterSpacing = '2px';
    text(value, x, y, 22, color, 700, 'DM Sans', max);
    ctx.restore();
  }
  function center(square) {
    const flipped = !!data.config.boardFlipped;
    const file = square.charCodeAt(0) - 97;
    const rank = Number(square[1]);
    return {
      x: B.x + ((flipped ? 7 - file : file) + 0.5) * B.square,
      y: B.y + ((flipped ? rank - 1 : 8 - rank) + 0.5) * B.square,
    };
  }
  function squareTint(square, color, opacity = 0.5) {
    const p = center(square);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.fillStyle = color;
    ctx.fillRect(p.x - 51, p.y - 51, 102, 102);
    ctx.restore();
  }
  function ring(square, t, radius = 44) {
    const p = center(square);
    ctx.save();
    ctx.strokeStyle = C.amber;
    ctx.lineWidth = 5;
    ctx.shadowColor = '#102b2660';
    ctx.shadowBlur = 10;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius + Math.sin(t * 3) * 2, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
  function arrow(from, to, amount = 1, dashed = false, color = C.amber) {
    const a = center(from),
      b = center(to);
    const dx = b.x - a.x,
      dy = b.y - a.y,
      distance = Math.hypot(dx, dy);
    const ux = dx / distance,
      uy = dy / distance;
    const sx = a.x + ux * 28,
      sy = a.y + uy * 28;
    const ex = a.x + dx * clamp(amount) - ux * 30,
      ey = a.y + dy * clamp(amount) - uy * 30;
    if (Math.hypot(ex - sx, ey - sy) < 12 || amount < 0.15) return;
    ctx.save();
    ctx.strokeStyle = '#153a2bc0';
    ctx.lineWidth = 15;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.strokeStyle = color;
    ctx.lineWidth = 9;
    if (dashed) {
      ctx.setLineDash([15, 15]);
      ctx.lineWidth = 7;
    }
    ctx.beginPath();
    ctx.moveTo(sx, sy);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(ex + ux * 15, ey + uy * 15);
    ctx.lineTo(ex - ux * 13 - uy * 15, ey - uy * 13 + ux * 15);
    ctx.lineTo(ex - ux * 13 + uy * 15, ey - uy * 13 - ux * 15);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function drawPiece(piece, x, y, opacity = 1) {
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.shadowColor = '#0b211c45';
    ctx.shadowOffsetY = 4;
    ctx.shadowBlur = 3;
    ctx.drawImage(pieces[piece], x - 47, y - 47, 94, 94);
    ctx.restore();
  }
  function drawBoard(stateIndex, move, overlays, t) {
    ctx.save();
    ctx.shadowColor = '#06181290';
    ctx.shadowBlur = 35;
    ctx.shadowOffsetY = 22;
    roundRect(B.x - 14, B.y - 14, B.size + 28, B.size + 28, 20, '#24463a', '#456354');
    ctx.restore();
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(B.x, B.y, B.size, B.size, 8);
    ctx.clip();
    for (let row = 0; row < 8; row++)
      for (let col = 0; col < 8; col++) {
        ctx.fillStyle = (row + col) % 2 === 0 ? C.light : C.dark;
        ctx.fillRect(B.x + col * 102, B.y + row * 102, 102, 102);
      }
    for (const square of overlays.tint || []) squareTint(square, C.amber, 0.45);
    if (overlays.target) squareTint(overlays.target, C.amber, 0.3);
    for (const piece of data.positions[stateIndex].pieces) {
      if (move && (piece.square === move.from || piece.square === move.to)) continue;
      const p = center(piece.square);
      drawPiece(piece.key, p.x, p.y);
    }
    if (move) {
      const a = center(move.from),
        b = center(move.to),
        k = ease(move.progress);
      if (move.capture && k < 1) drawPiece(move.capture, b.x, b.y, 1 - ease((k - 0.65) / 0.35));
      drawPiece(
        move.key,
        a.x + (b.x - a.x) * k,
        a.y + (b.y - a.y) * k - Math.sin(k * Math.PI) * 15,
      );
    }
    for (const item of overlays.arrows || []) arrow(...item);
    for (const square of overlays.rings || []) ring(square, t);
    if (overlays.ghost) {
      const p = center(overlays.ghost.square);
      drawPiece(overlays.ghost.key, p.x, p.y, 0.25);
    }
    if (overlays.question) {
      const p = center(overlays.question);
      ctx.save();
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.font = '700 49px "DM Sans"';
      ctx.fillStyle = C.ink;
      ctx.fillText('?', p.x, p.y);
      ctx.restore();
    }
    // Coordinates remain readable without competing with the pieces.
    for (let i = 0; i < 8; i++) {
      text(
        String(data.config.boardFlipped ? i + 1 : 8 - i),
        B.x + 5,
        B.y + i * 102 + 5,
        18,
        i % 2 ? '#173a2e' : '#41634f',
        700,
      );
      text(
        (data.config.boardFlipped ? 'hgfedcba' : 'abcdefgh')[i],
        B.x + i * 102 + 83,
        B.y + B.size - 23,
        18,
        i % 2 ? '#41634f' : '#173a2e',
        700,
      );
    }
    ctx.restore();
  }
  function sicilianScene(scene, local, t) {
    let state = 1,
      move = null,
      overlays = {};
    let notation = '1. e4  c5',
      badge = 'THE SICILIAN DEFENSE';
    if (scene.id === 'hook' || scene.id === 'pressure') {
      overlays = {
        arrows: [['c5', 'd4', ease((local + 0.12) / 0.48)]],
        target: 'd4',
        rings: ['d4'],
      };
      badge = 'c5 CONTROLS d4';
    }
    if (scene.id === 'develop') {
      move = { from: 'c7', to: 'c5', key: 'bp', progress: (local - 0.08) / 0.48 };
      overlays = { tint: ['c7', 'c5'] };
      badge = 'BLACK CHALLENGES THE CENTER';
    }
    if (scene.id === 'exchange') {
      const moves = [
        {
          at: 0.08,
          duration: 0.4,
          state: 2,
          from: 'g1',
          to: 'f3',
          key: 'wn',
          notation: '1. e4  c5    2. Nf3',
        },
        {
          at: 0.7,
          duration: 0.4,
          state: 3,
          from: 'd7',
          to: 'd6',
          key: 'bp',
          notation: '1. e4  c5    2. Nf3  d6',
        },
        {
          at: 1.45,
          duration: 0.4,
          state: 4,
          from: 'd2',
          to: 'd4',
          key: 'wp',
          notation: '2. Nf3  d6    3. d4',
        },
        {
          at: 2.5,
          duration: 0.45,
          state: 5,
          from: 'c5',
          to: 'd4',
          key: 'bp',
          capture: 'wp',
          notation: '2. Nf3  d6    3. d4  cxd4',
        },
        {
          at: 3.8,
          duration: 0.45,
          state: 6,
          from: 'f3',
          to: 'd4',
          key: 'wn',
          capture: 'bp',
          notation: '3. d4  cxd4    4. Nxd4',
        },
      ];
      const current = moves.findLast((item) => local >= item.at);
      if (current) {
        state = current.state;
        move = { ...current, progress: clamp((local - current.at) / current.duration) };
        notation = current.notation;
      }
      overlays = { target: 'd4' };
      badge = 'AN OPEN SICILIAN EXAMPLE';
    }
    if (scene.id === 'file') {
      state = 6;
      notation = '3. d4  cxd4    4. Nxd4';
      badge = 'SEMI-OPEN c-FILE FOR BLACK';
      overlays = {
        tint: ['c3', 'c4', 'c5', 'c6', 'c7'],
        arrows: [['c7', 'c3', ease(local / 0.5), true]],
        rings: ['a8'],
      };
    }
    if (scene.id === 'recall') {
      state = 0;
      notation = '1. e4';
      badge = 'BLACK TO MOVE';
      if (t >= data.config.revealAt) {
        state = 1;
        move = { from: 'c7', to: 'c5', key: 'bp', progress: (t - data.config.revealAt) / 0.4 };
        overlays = { tint: ['c7', 'c5'] };
        notation = '1. e4  c5';
        badge = "THAT'S THE SICILIAN";
      }
    }
    if (scene.id === 'practice') overlays = { tint: ['c5'] };
    return { state, move, overlays, notation, badge };
  }
  function background(t) {
    ctx.fillStyle = C.bg;
    ctx.fillRect(0, 0, 1080, 1920);
    const gradient = ctx.createRadialGradient(180, 330, 20, 180, 330, 1450);
    gradient.addColorStop(0, '#33533c55');
    gradient.addColorStop(1, '#102b2600');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 1080, 1920);
    ctx.strokeStyle = '#a6b9970a';
    ctx.lineWidth = 1;
    for (let i = 0; i < 7; i++) {
      ctx.beginPath();
      ctx.arc(1000, 150, 300 + i * 145 + Math.sin(t * 0.15) * 5, 0, Math.PI * 2);
      ctx.stroke();
    }
    roundRect(84, 135, 34, 34, 8, C.amber);
    ctx.strokeStyle = C.ink;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(93, 159);
    ctx.lineTo(100, 145);
    ctx.lineTo(109, 159);
    ctx.stroke();
    label((data.config.brandName || 'OPENING NOTES').toUpperCase(), 135, 142, C.cream, 450);
    label(data.config.seriesLabel || 'ITALIAN / 01', 736, 142, C.muted, 210);
    if (data.config.displayVariation) {
      text(
        `${data.opening.name} / ${data.opening.variation}`,
        84,
        182,
        25,
        C.muted,
        500,
        'DM Sans',
        852,
      );
    }
    ctx.strokeStyle = C.line;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(84, data.config.displayVariation ? 216 : 196);
    ctx.lineTo(936, data.config.displayVariation ? 216 : 196);
    ctx.stroke();
  }
  function drawIntro(local, duration) {
    const exit = ease((local - duration + 0.18) / 0.18);
    const enter = ease((local + 0.12) / 0.36);
    ctx.save();
    ctx.globalAlpha = 1 - exit;
    ctx.translate(-30 * exit, 0);
    label(data.config.ui?.learnOpenings || 'LEARN CHESS OPENINGS', 84, 350);
    text(data.config.brandName, 80, 404, 112, C.cream, 400, 'DM Serif Display', 860);
    text(data.config.brandTagline || 'Learn. Recall. Play.', 84, 550, 36, C.muted, 500);
    roundRect(84, 639, 852, 3, 1.5, C.line);
    roundRect(84, 639, 852 * ease((local + 0.08) / 0.55), 3, 1.5, C.amber);
    ctx.save();
    ctx.translate((1 - enter) * 22, 0);
    ctx.globalAlpha *= 0.5 + 0.5 * enter;
    roundRect(84, 760, 852, 420, 26, '#1c3a31', '#476251');
    label(data.config.ui?.opening || 'OPENING', 116, 798, C.muted, 790);
    text(data.opening.name, 112, 846, 77, C.cream, 400, 'DM Serif Display', 788);
    label(data.config.ui?.variation || 'VARIATION', 116, 966, C.muted, 790);
    text(data.opening.variation, 112, 1008, 57, C.amber, 700, 'DM Sans', 788);
    label(
      data.config.ui?.repertoire || `${data.opening.side.toUpperCase()} REPERTOIRE`,
      116,
      1113,
      C.muted,
      790,
    );
    ctx.restore();
    label(data.config.ui?.inThisLesson || 'IN THIS LESSON', 84, 1265, C.muted);
    (data.config.introMoves || []).forEach((line, i) =>
      text(line, 84, 1310 + i * 48, 34, C.cream, 500, 'DM Sans', 852),
    );
    roundRect(84, 1528, 852, 91, 20, C.amber);
    text(
      data.config.ui?.introCta || 'Understand the idea. Play from memory.',
      112,
      1554,
      32,
      C.ink,
      700,
      'DM Sans',
      790,
    );
    ctx.restore();
    if (exit > 0) {
      ctx.save();
      ctx.globalAlpha = 0.5 * Math.sin(exit * Math.PI);
      roundRect(84 + exit * 852, 310, 4, 1309, 2, C.amber);
      ctx.restore();
    }
  }
  window.initShorts = async (input) => {
    data = input;
    for (const font of input.fonts) {
      const face = new FontFace(font.family, `url(data:font/woff2;base64,${font.base64})`, {
        weight: String(font.weight),
      });
      document.fonts.add(await face.load());
    }
    await Promise.all(
      Object.entries(input.pieceSvgs).map(async ([key, svg]) => {
        const img = new Image();
        img.src = `data:image/svg+xml;base64,${btoa(svg)}`;
        await img.decode();
        pieces[key] = img;
      }),
    );
    await document.fonts.ready;
  };
  window.renderShortsFrame = (t, png = false) => {
    const scenes = data.config.scenes;
    const index = Math.max(
      0,
      scenes.findIndex((s) => t >= s.start && t < s.end),
    );
    const scene = scenes[index],
      local = t - scene.start;
    const fast = data.config.presentation === 'fast';
    const isSicilian = data.config.openingId === 'sicilian-defense';
    const revealAt = data.config.revealAt ?? 29.8;
    const countdownStart = data.config.countdownStart ?? 26.8;
    let state = 0,
      move = null,
      overlays = {};
    let notation = '1. e4  e5    2. Nf3  Nc6';
    let badge = 'WHITE TO MOVE';
    background(t);
    if (scene.id === 'intro') {
      drawIntro(local, scene.end - scene.start);
      return canvas.toDataURL(png ? 'image/png' : 'image/jpeg', 0.95).split(',')[1];
    }
    if (!isSicilian) {
      if (scene.id === 'hook') {
        overlays = { rings: ['f1'], target: 'c4', question: 'c4' };
        if (fast) {
          state = 1;
          overlays = {
            arrows: [['c4', 'f7', ease((local + 0.12) / 0.48)]],
            rings: ['f7'],
            target: 'f7',
          };
          notation += '    3. Bc4';
          badge = 'ONE DEFENDER: THE KING';
        }
      }
      if (scene.id === 'develop') {
        state = 1;
        const k = clamp(fast ? (local - 0.08) / 0.48 : (local - 0.35) / 0.85);
        move = { from: 'f1', to: 'c4', key: 'wb', progress: k };
        overlays = { tint: ['f1', 'c4'] };
        notation += '    3. Bc4';
        badge = 'DEVELOPMENT';
      }
      if (scene.id === 'pressure') {
        state = 1;
        overlays = {
          arrows: [['c4', 'f7', ease(local / (fast ? 0.38 : 0.8))]],
          rings: ['f7'],
          target: 'f7',
        };
        notation += '    3. Bc4';
        badge = 'AFTER 3. Bc4';
      }
      if (scene.id === 'castle') {
        state = 2;
        const k = clamp(fast ? (local - 0.05) / 0.5 : (local - 0.15) / 0.8);
        move = { from: 'f8', to: 'c5', key: 'bb', progress: k };
        const planStart = fast ? 0.62 : 1.1;
        if (local > planStart)
          overlays = {
            tint: ['f1', 'g1'],
            arrows: [['e1', 'g1', ease((local - planStart) / (fast ? 0.35 : 0.7)), true]],
          };
        notation = '1. e4  e5   2. Nf3  Nc6   3. Bc4  Bc5';
        badge = 'PLAN: O-O';
      }
      if (scene.id === 'center') {
        state = 3;
        const k = clamp(fast ? (local - 0.12) / 0.5 : (local - 0.3) / 0.75);
        move = { from: 'c2', to: 'c3', key: 'wp', progress: k };
        const planStart = fast ? 0.72 : 1.2;
        if (local > planStart)
          overlays = {
            target: 'd4',
            arrows: [
              ['c3', 'd4', ease((local - planStart) / (fast ? 0.4 : 0.8))],
              [
                'd2',
                'd4',
                ease((local - planStart - (fast ? 0.45 : 0.5)) / (fast ? 0.4 : 0.8)),
                true,
              ],
            ],
          };
        notation = '3. Bc4  Bc5    4. c3';
        badge = 'NEXT PLAN: d4';
      }
      if (scene.id === 'recall') {
        if (t < revealAt) overlays = { rings: ['f1'] };
        else {
          state = 1;
          move = { from: 'f1', to: 'c4', key: 'wb', progress: (t - revealAt) / (fast ? 0.4 : 0.7) };
          overlays = { tint: ['f1', 'c4'] };
          notation += '    3. Bc4';
          badge = "THAT'S THE MOVE";
        }
      }
      if (scene.id === 'practice') {
        state = 1;
        overlays = { tint: ['c4'] };
        notation += '    3. Bc4';
        badge = 'THE ITALIAN GAME';
      }
    } else {
      ({ state, move, overlays, notation, badge } = sicilianScene(scene, local, t));
    }
    if (data.config.language === 'tr') {
      notation = notation.replace(/\bN(?=[a-h])/g, 'A').replace(/\bB(?=[a-h])/g, 'F');
      badge = data.config.badges?.[badge] || badge;
    }
    const enter = fast && scene.id === 'hook' ? 1 : ease(local / (fast ? 0.12 : 0.3));
    const answered = scene.id === 'recall' && t >= revealAt;
    const heading =
      answered && fast ? data.config.answerHeading || ['Bc4.', "That's the idea."] : scene.heading;
    ctx.save();
    ctx.globalAlpha = enter;
    ctx.translate(0, (1 - enter) * 12);
    label(
      answered ? data.config.ui?.answered || 'THE ANSWER / WELL PLAYED' : scene.eyebrow,
      84,
      230,
    );
    const hookFont = fast && scene.id === 'hook';
    text(
      heading[0],
      80,
      272,
      hookFont ? 100 : 86,
      C.cream,
      hookFont ? 700 : 400,
      hookFont ? 'DM Sans' : 'DM Serif Display',
      860,
    );
    if (hookFont) {
      ctx.globalAlpha = ease((local + 0.1) / 0.3);
      roundRect(58, 277, 6, 178, 3, C.amber);
    }
    text(
      heading[1],
      80,
      365,
      hookFont ? 100 : 86,
      scene.id === 'hook' || scene.id === 'pressure' ? C.amber : C.cream,
      hookFont ? 700 : 400,
      hookFont ? 'DM Sans' : 'DM Serif Display',
      860,
    );
    ctx.globalAlpha = enter;
    text(
      answered && fast
        ? data.config.answerBody || 'Pressure. King safety. A central plan.'
        : scene.body,
      84,
      479,
      fast ? 34 : 30,
      C.muted,
      400,
      'DM Sans',
      850,
    );
    ctx.restore();
    text(notation, 96, 559, 25, C.cream, 500, 'DM Sans', 790);
    text(badge, 96, 594, 17, C.amber, 700);
    let zoom = 1;
    if (fast && scene.id === 'hook') zoom = 0.94 + 0.06 * ease(local / 0.48);
    if (fast && scene.id === 'pressure') zoom = 1 + 0.018 * ease(local / 3);
    ctx.save();
    ctx.beginPath();
    ctx.roundRect(B.x - 15, B.y - 15, B.size + 30, B.size + 30, 20);
    ctx.clip();
    ctx.translate(B.x + B.size / 2, B.y + B.size / 2);
    ctx.scale(zoom, zoom);
    ctx.translate(-B.x - B.size / 2, -B.y - B.size / 2);
    drawBoard(state, move, overlays, t);
    ctx.restore();
    const cta = fast && scene.id === 'practice';
    roundRect(84, 1494, 852, 143, 22, cta ? C.amber : '#1c3a31', cta ? C.amber : '#3c584b');
    let noteLabel = scene.noteLabel,
      note = scene.note;
    if (scene.id === 'recall' && t >= revealAt) {
      noteLabel = data.config.answerNoteLabel || '3. Bc4 / WELL PLAYED';
      note = data.config.answerNote || 'The Italian Game starts with an idea.';
    }
    label(noteLabel, 112, 1520, cta ? C.ink : C.amber, 790);
    text(note, 112, 1562, fast ? 34 : 29, cta ? C.ink : C.cream, 500, 'DM Sans', 790);
    if (scene.id === 'recall' && t >= countdownStart && t < revealAt) {
      const maxCount = data.config.answerWaitSeconds || Math.ceil(revealAt - countdownStart);
      const countdown = String(Math.min(maxCount, Math.ceil(revealAt - t - 1e-8)));
      roundRect(803, 1509, 113, 111, 16, C.amber);
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.font = '700 62px "DM Sans"';
      ctx.fillStyle = C.ink;
      ctx.fillText(countdown, 860, 1563);
      ctx.textAlign = 'left';
      // Keep text clear of the timer on this scene.
      roundRect(108, 1555, 685, 55, 0, '#1c3a31');
      text(
        data.config.countdownPrompt || 'Choose your square.',
        112,
        1562,
        fast ? 34 : 29,
        C.cream,
        500,
        'DM Sans',
        650,
      );
    }
    // A quiet episode timeline stays above the platform's bottom controls.
    const gap = 9,
      w = (852 - gap * (scenes.length - 1)) / scenes.length;
    scenes.forEach((s, i) => {
      roundRect(84 + i * (w + gap), 1684, w, 4, 2, '#3a5145');
      const progress = clamp((t - s.start) / (s.end - s.start));
      if (progress > 0) roundRect(84 + i * (w + gap), 1684, w * progress, 4, 2, C.amber);
    });
    label(
      data.config.ui?.footer || 'UNDERSTAND THE MOVE. REMEMBER THE PLAN.',
      84,
      1718,
      '#849e8d',
      850,
    );
    if (data.config.voiceDisclosure) label(data.config.voiceDisclosure, 84, 1760, '#849e8d', 850);
    return canvas.toDataURL(png ? 'image/png' : 'image/jpeg', 0.95).split(',')[1];
  };
})();
