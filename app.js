/* ==========================================================================
   THE JOURNEY OF MOBILITY - INTERACTIVE JAVASCRIPT ENGINE
   자동차의 역사와 작동원리 인터랙티브 엔진 & 시뮬레이터
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initScrollProgress();
  initNavScrollSpy();
  initHeroCanvas();
  initEngineSimulator();
  initTimeline();
  initPowertrainFlow();
  initDifferentialDemo();
  initDrivetrainSandbox();
  initQuiz();
  initGlossarySearch();
  initModal();
  initDirectDriveSimulator();
});

/* --------------------------------------------------------------------------
   1. SCROLL PROGRESS & NAVBAR SPY
   -------------------------------------------------------------------------- */
function initScrollProgress() {
  const progressBar = document.getElementById('scroll-progress');
  window.addEventListener('scroll', () => {
    const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
    const progress = (window.scrollY / totalHeight) * 100;
    if (progressBar) progressBar.style.width = `${progress}%`;
  });
}

function initNavScrollSpy() {
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-link');

  window.addEventListener('scroll', () => {
    let currentId = '';
    const scrollPos = window.scrollY + 120;

    sections.forEach(sec => {
      const top = sec.offsetTop;
      const height = sec.offsetHeight;
      if (scrollPos >= top && scrollPos < top + height) {
        currentId = sec.getAttribute('id');
      }
    });

    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === `#${currentId}`) {
        link.classList.add('active');
      }
    });
  });
}

/* --------------------------------------------------------------------------
   2. HERO PARTICLE BACKGROUND
   -------------------------------------------------------------------------- */
function initHeroCanvas() {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = (canvas.width = canvas.offsetWidth);
  let height = (canvas.height = canvas.offsetHeight);

  window.addEventListener('resize', () => {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  });

  const particles = [];
  const particleCount = 45;

  for (let i = 0; i < particleCount; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      radius: Math.random() * 2 + 1,
      color: Math.random() > 0.3 ? 'rgba(0, 240, 255,' : 'rgba(59, 130, 246,'
    });
  }

  function render() {
    ctx.clearRect(0, 0, width, height);

    // Draw connecting lines
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0, 240, 255, ${0.15 * (1 - dist / 120)})`;
          ctx.lineWidth = 1;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }

    // Draw particles
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0) p.x = width;
      if (p.x > width) p.x = 0;
      if (p.y < 0) p.y = height;
      if (p.y > height) p.y = 0;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = p.color + ' 0.6)';
      ctx.fill();
    });

    requestAnimationFrame(render);
  }
  render();
}

/* --------------------------------------------------------------------------
   3. FOUR-STROKE ENGINE SIMULATOR (CANVAS)
   -------------------------------------------------------------------------- */
function initEngineSimulator() {
  const canvas = document.getElementById('engineCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  // Simulation State
  let isRunning = true;
  let rpm = 900; // default idle speed
  let angle = 0; // Crank angle in radians (0 to 4*PI representing 720 degrees)
  let lastTimestamp = 0;

  // Geometry dimensions
  const crankRadius = 45;       // r
  const rodLength = 130;        // L
  const cylinderWidth = 140;
  const pistonHeight = 55;
  const cylinderHeight = 220;

  // UI elements
  const playBtn = document.getElementById('enginePlayBtn');
  const rpmSlider = document.getElementById('engineRpmSlider');
  const rpmValueDisplay = document.getElementById('rpmValueDisplay');
  const strokeTitle = document.getElementById('strokeTitle');
  const strokeDesc = document.getElementById('strokeDesc');
  const valveStatus = document.getElementById('valveStatus');
  const hudAngle = document.getElementById('hudAngle');
  const hudStroke = document.getElementById('hudStroke');
  const telPressure = document.getElementById('telPressure');
  const telTemp = document.getElementById('telTemp');
  const telRpm = document.getElementById('telRpm');
  const strokeButtons = document.querySelectorAll('.stroke-btn');

  const strokeDetails = [
    {
      name: '1. 흡입 행정 (Intake)',
      short: '흡입 (INTAKE)',
      valve: '흡기: 열림 [OPEN] / 배기: 닫힘 [CLOSED]',
      desc: '흡기 밸브가 열리고 피스톤이 하강하면서 실린더 내부에 음압(진공)이 발생합니다. 이에 따라 공기와 안개화된 가솔린 연료의 혼합기가 실린더 내부로 시원하게 빨려 들어옵니다.',
      pressure: '0.8 ~ 1.0 bar',
      temp: '40 ~ 70 ℃',
      spark: false
    },
    {
      name: '2. 압축 행정 (Compression)',
      short: '압축 (COMPRESS)',
      valve: '흡기: 닫힘 [CLOSED] / 배기: 닫힘 [CLOSED]',
      desc: '흡기 및 배기 밸브가 모두 굳게 닫힌 상태에서 피스톤이 상사점(TDC)을 향해 밀고 올라갑니다. 혼합기를 원래 부피의 약 1/10 수준으로 강하게 압축하여 온도와 압력을 극대화합니다.',
      pressure: '12 ~ 18 bar',
      temp: '350 ~ 450 ℃',
      spark: false
    },
    {
      name: '3. 폭발/팽창 행정 (Power)',
      short: '폭발 (POWER)',
      valve: '흡기: 닫힘 [CLOSED] / 배기: 닫힘 [CLOSED]',
      desc: '피스톤이 최상단에 도달하는 순간, 점화 플러그가 20,000V 이상의 초고전압 스파크를 방전합니다! 순간적인 화염 폭발로 팽창한 고온·고압 가스가 피스톤을 엄청난 힘으로 내리누르며 크랭크축을 회전시키는 유일한 동력 생성 행정입니다.',
      pressure: '50 ~ 80 bar',
      temp: '1,800 ~ 2,400 ℃',
      spark: true
    },
    {
      name: '4. 배기 행정 (Exhaust)',
      short: '배기 (EXHAUST)',
      valve: '흡기: 닫힘 [CLOSED] / 배기: 열림 [OPEN]',
      desc: '배기 밸브가 열리고 하사점에 도달한 피스톤이 관성으로 다시 상승합니다. 연소되고 남은 뜨거운 배기가스를 배기 매니폴드로 밀어내며 다음 사이클의 흡입을 준비합니다.',
      pressure: '3 ~ 5 bar',
      temp: '600 ~ 850 ℃',
      spark: false
    }
  ];

  // Particle pool for explosion sparks
  const sparkParticles = [];
  function createSparks(cx, cy) {
    for (let i = 0; i < 25; i++) {
      const ang = Math.random() * Math.PI * 2;
      const speed = Math.random() * 6 + 2;
      sparkParticles.push({
        x: cx,
        y: cy,
        vx: Math.cos(ang) * speed,
        vy: Math.sin(ang) * speed,
        life: 1.0,
        decay: Math.random() * 0.05 + 0.03,
        size: Math.random() * 3 + 2,
        color: Math.random() > 0.4 ? '#ffb703' : '#ff3366'
      });
    }
  }

  // Update Controls
  if (playBtn) {
    playBtn.addEventListener('click', () => {
      isRunning = !isRunning;
      playBtn.innerHTML = isRunning ? '❚❚' : '▶';
    });
  }

  if (rpmSlider) {
    rpmSlider.addEventListener('input', (e) => {
      rpm = parseInt(e.target.value);
      if (rpmValueDisplay) rpmValueDisplay.textContent = `${rpm} RPM`;
      if (telRpm) telRpm.textContent = `${rpm} RPM`;
    });
  }

  strokeButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetStroke = parseInt(btn.getAttribute('data-stroke'));
      angle = (targetStroke * Math.PI) + 0.1; // Jump to middle of stroke
      updateUI(targetStroke);
    });
  });

  function updateUI(strokeIndex) {
    const info = strokeDetails[strokeIndex];
    if (strokeTitle) strokeTitle.textContent = info.name;
    if (strokeDesc) strokeDesc.textContent = info.desc;
    if (valveStatus) valveStatus.textContent = info.valve;
    if (hudStroke) hudStroke.textContent = info.short;
    if (telPressure) telPressure.textContent = info.pressure;
    if (telTemp) telTemp.textContent = info.temp;

    strokeButtons.forEach((b, idx) => {
      b.classList.toggle('active', idx === strokeIndex);
    });
  }

  // Canvas loop
  function loop(timestamp) {
    if (!lastTimestamp) lastTimestamp = timestamp;
    const dt = (timestamp - lastTimestamp) / 1000;
    lastTimestamp = timestamp;

    if (isRunning) {
      // 1 RPM = (rpm * 2 * PI / 60) rad/sec
      const angularSpeed = (rpm * 2 * Math.PI) / 60;
      angle += angularSpeed * dt;
      if (angle >= 4 * Math.PI) {
        angle -= 4 * Math.PI;
      }
    }

    const currentDeg = Math.floor((angle * 180 / Math.PI) % 720);
    if (hudAngle) hudAngle.textContent = `${currentDeg}°`;

    // Determine current stroke (0: Intake 0~180, 1: Compression 180~360, 2: Power 360~540, 3: Exhaust 540~720)
    const strokeIndex = Math.min(3, Math.floor(currentDeg / 180));
    updateUI(strokeIndex);

    renderEngine(strokeIndex, currentDeg);
    requestAnimationFrame(loop);
  }

  function renderEngine(strokeIndex, deg) {
    // Canvas sizing & centering
    const w = canvas.width = canvas.offsetWidth;
    const h = canvas.height = canvas.offsetHeight;
    ctx.clearRect(0, 0, w, h);

    const centerX = w / 2;
    const crankCenterY = h - 90;
    const topOfCylinderY = crankCenterY - rodLength - crankRadius - 70;

    // Kinematics
    // crank pin position
    const crankAngle = angle % (2 * Math.PI);
    const crankPinX = centerX + crankRadius * Math.sin(crankAngle);
    const crankPinY = crankCenterY - crankRadius * Math.cos(crankAngle);

    // Piston wrist pin position (pure vertical motion along center X)
    const sinPhi = (crankRadius / rodLength) * Math.sin(crankAngle);
    const cosPhi = Math.sqrt(Math.max(0, 1 - sinPhi * sinPhi));
    const pistonPinY = crankPinY - rodLength * cosPhi;

    const pistonTopY = pistonPinY - pistonHeight / 2;

    // 1. Draw Cylinder Chamber Background (Combustion Chamber)
    ctx.save();
    const chamberHeight = pistonTopY - topOfCylinderY;

    if (strokeIndex === 0) {
      // Intake: Air-Fuel mix (Cyan blue gradient)
      const grad = ctx.createLinearGradient(centerX, topOfCylinderY, centerX, pistonTopY);
      grad.addColorStop(0, 'rgba(0, 240, 255, 0.55)');
      grad.addColorStop(1, 'rgba(59, 130, 246, 0.25)');
      ctx.fillStyle = grad;
    } else if (strokeIndex === 1) {
      // Compression: Heating up (Cyan to Yellow-Orange)
      const compressionRatio = 1 - (chamberHeight / cylinderHeight);
      const grad = ctx.createLinearGradient(centerX, topOfCylinderY, centerX, pistonTopY);
      grad.addColorStop(0, `rgba(255, 183, 3, ${0.4 + compressionRatio * 0.4})`);
      grad.addColorStop(1, 'rgba(255, 70, 85, 0.3)');
      ctx.fillStyle = grad;
    } else if (strokeIndex === 2) {
      // Power / Explosion: Fire flash!
      const powerProgress = (deg - 360) / 180;
      const flashAlpha = Math.max(0.3, 0.95 - powerProgress * 0.7);
      const grad = ctx.createRadialGradient(centerX, topOfCylinderY + 20, 10, centerX, topOfCylinderY + 60, cylinderWidth);
      grad.addColorStop(0, `rgba(255, 255, 255, ${flashAlpha})`);
      grad.addColorStop(0.3, `rgba(255, 180, 0, ${flashAlpha * 0.9})`);
      grad.addColorStop(0.7, `rgba(255, 51, 102, ${flashAlpha * 0.7})`);
      grad.addColorStop(1, 'rgba(30, 10, 20, 0.2)');
      ctx.fillStyle = grad;

      // Trigger spark at onset of stroke 2
      if (deg >= 360 && deg <= 390 && Math.random() > 0.3) {
        createSparks(centerX, topOfCylinderY + 15);
      }
    } else {
      // Exhaust: Smoke gray/brown
      const grad = ctx.createLinearGradient(centerX, topOfCylinderY, centerX, pistonTopY);
      grad.addColorStop(0, 'rgba(100, 116, 139, 0.45)');
      grad.addColorStop(1, 'rgba(51, 65, 85, 0.2)');
      ctx.fillStyle = grad;
    }

    ctx.fillRect(centerX - cylinderWidth / 2, topOfCylinderY, cylinderWidth, chamberHeight);
    ctx.restore();

    // 2. Draw Cylinder Walls & Cooling Fins
    ctx.save();
    ctx.strokeStyle = '#475569';
    ctx.lineWidth = 4;
    // Left wall
    ctx.beginPath();
    ctx.moveTo(centerX - cylinderWidth / 2, topOfCylinderY);
    ctx.lineTo(centerX - cylinderWidth / 2, topOfCylinderY + cylinderHeight);
    ctx.stroke();

    // Right wall
    ctx.beginPath();
    ctx.moveTo(centerX + cylinderWidth / 2, topOfCylinderY);
    ctx.lineTo(centerX + cylinderWidth / 2, topOfCylinderY + cylinderHeight);
    ctx.stroke();

    // Cooling Fins
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 3;
    for (let finY = topOfCylinderY + 20; finY < topOfCylinderY + cylinderHeight - 20; finY += 24) {
      // Left fins
      ctx.beginPath();
      ctx.moveTo(centerX - cylinderWidth / 2, finY);
      ctx.lineTo(centerX - cylinderWidth / 2 - 22, finY);
      ctx.stroke();
      // Right fins
      ctx.beginPath();
      ctx.moveTo(centerX + cylinderWidth / 2, finY);
      ctx.lineTo(centerX + cylinderWidth / 2 + 22, finY);
      ctx.stroke();
    }
    ctx.restore();

    // 3. Draw Cylinder Head & Valves
    const leftValveOpen = (strokeIndex === 0);  // Intake valve open during intake
    const rightValveOpen = (strokeIndex === 3); // Exhaust valve open during exhaust

    const valveDrop = 14;

    // Intake Port (Left)
    ctx.save();
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX - cylinderWidth / 2, topOfCylinderY);
    ctx.lineTo(centerX - 35, topOfCylinderY);
    ctx.stroke();

    // Left Valve Stem & Head
    const leftValveY = topOfCylinderY + (leftValveOpen ? valveDrop : 0);
    ctx.fillStyle = leftValveOpen ? '#00f0ff' : '#94a3b8';
    ctx.fillRect(centerX - 32, leftValveY, 20, 6); // Valve Head
    ctx.fillRect(centerX - 24, leftValveY - 30, 4, 30); // Stem
    if (leftValveOpen) {
      // Airflow arrows
      ctx.fillStyle = '#00f0ff';
      ctx.font = '12px JetBrains Mono';
      ctx.fillText('IN ➔', centerX - 70, topOfCylinderY - 10);
    }

    // Exhaust Port (Right)
    ctx.strokeStyle = '#ff3366';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(centerX + 35, topOfCylinderY);
    ctx.lineTo(centerX + cylinderWidth / 2, topOfCylinderY);
    ctx.stroke();

    // Right Valve Stem & Head
    const rightValveY = topOfCylinderY + (rightValveOpen ? valveDrop : 0);
    ctx.fillStyle = rightValveOpen ? '#ff3366' : '#94a3b8';
    ctx.fillRect(centerX + 12, rightValveY, 20, 6);
    ctx.fillRect(centerX + 20, rightValveY - 30, 4, 30);
    if (rightValveOpen) {
      // Exhaust gas arrow
      ctx.fillStyle = '#ff7849';
      ctx.font = '12px JetBrains Mono';
      ctx.fillText('➔ EX', centerX + 40, topOfCylinderY - 10);
    }

    // Spark Plug (Center Top)
    ctx.fillStyle = '#e2e8f0';
    ctx.fillRect(centerX - 7, topOfCylinderY - 35, 14, 35);
    ctx.fillStyle = '#f59e0b';
    ctx.fillRect(centerX - 3, topOfCylinderY, 6, 8); // electrode
    ctx.restore();

    // Render Sparks
    if (sparkParticles.length > 0) {
      ctx.save();
      for (let i = sparkParticles.length - 1; i >= 0; i--) {
        const p = sparkParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= p.decay;
        if (p.life <= 0) {
          sparkParticles.splice(i, 1);
          continue;
        }
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }

    // 4. Draw Connecting Rod
    ctx.save();
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 14;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, pistonPinY);
    ctx.lineTo(crankPinX, crankPinY);
    ctx.stroke();

    // Rod inner metallic highlight
    ctx.strokeStyle = '#cbd5e1';
    ctx.lineWidth = 6;
    ctx.stroke();
    ctx.restore();

    // 5. Draw Piston & Rings
    ctx.save();
    const pX = centerX - cylinderWidth / 2 + 2;
    const pW = cylinderWidth - 4;
    const pY = pistonTopY;

    // Piston Body
    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(pX, pY, pW, pistonHeight, [6, 6, 4, 4]);
    ctx.fill();
    ctx.stroke();

    // Piston Compression Rings
    ctx.strokeStyle = '#00f0ff';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(pX, pY + 10);
    ctx.lineTo(pX + pW, pY + 10);
    ctx.moveTo(pX, pY + 18);
    ctx.lineTo(pX + pW, pY + 18);
    ctx.stroke();

    // Wrist pin at piston center
    ctx.beginPath();
    ctx.arc(centerX, pistonPinY, 8, 0, Math.PI * 2);
    ctx.fillStyle = '#f8fafc';
    ctx.fill();
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();
    ctx.restore();

    // 6. Draw Crankshaft & Counterweight
    ctx.save();
    // Crank Disc background
    ctx.beginPath();
    ctx.arc(centerX, crankCenterY, crankRadius + 14, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(15, 23, 42, 0.8)';
    ctx.strokeStyle = '#334155';
    ctx.lineWidth = 2;
    ctx.fill();
    ctx.stroke();

    // Counterweight (Sector shape opposing crank pin)
    const oppAngle = crankAngle + Math.PI;
    ctx.beginPath();
    ctx.arc(centerX, crankCenterY, crankRadius + 10, oppAngle - 0.7, oppAngle + 0.7);
    ctx.lineTo(centerX, crankCenterY);
    ctx.closePath();
    ctx.fillStyle = '#475569';
    ctx.fill();

    // Crank Web arm
    ctx.strokeStyle = '#94a3b8';
    ctx.lineWidth = 16;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX, crankCenterY);
    ctx.lineTo(crankPinX, crankPinY);
    ctx.stroke();

    // Center Main Journal
    ctx.beginPath();
    ctx.arc(centerX, crankCenterY, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#00f0ff';
    ctx.fill();

    // Crank Pin Bearing
    ctx.beginPath();
    ctx.arc(crankPinX, crankPinY, 10, 0, Math.PI * 2);
    ctx.fillStyle = '#ff3366';
    ctx.fill();
    ctx.restore();
  }

  requestAnimationFrame(loop);
}

/* --------------------------------------------------------------------------
   4. TIMELINE FILTERS & INTERACTIVE CARDS
   -------------------------------------------------------------------------- */
function initTimeline() {
  const filterBtns = document.querySelectorAll('.era-filter-btn');
  const items = document.querySelectorAll('.timeline-item');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const era = btn.getAttribute('data-era');
      items.forEach(item => {
        if (era === 'all' || item.getAttribute('data-era') === era) {
          item.style.display = 'block';
          setTimeout(() => item.classList.add('visible'), 50);
        } else {
          item.classList.remove('visible');
          item.style.display = 'none';
        }
      });
    });
  });

  // Intersection Observer for scroll reveal
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
      }
    });
  }, { threshold: 0.15 });

  items.forEach(item => observer.observe(item));
}

/* --------------------------------------------------------------------------
   5. POWERTRAIN FLOW INTERACTIVE
   -------------------------------------------------------------------------- */
function initPowertrainFlow() {
  const nodes = document.querySelectorAll('.flow-node');
  const detailBox = document.getElementById('flowDetailBox');
  if (!detailBox) return;

  const details = {
    engine: {
      icon: '⚡',
      title: '1. 엔진 / 구동 모터 (Engine / Electric Motor)',
      desc: '화학 에너지(가솔린/디젤)의 연소 압력 또는 배터리의 전기 에너지를 전자기력으로 변환하여 바퀴를 굴릴 회전력(토크, Torque)을 최초로 생성하는 자동차의 핵심 심장입니다.'
    },
    clutch: {
      icon: '⚙️',
      title: '2. 클러치 & 토크 컨버터 (Clutch / Torque Converter)',
      desc: '엔진이 회전하는 상태에서 기어를 바꾸거나 차를 정지시킬 때, 엔진과 변속기 사이의 동력을 부드럽게 연결하거나 일시적으로 끊어주는 유압/마찰 결합 장치입니다.'
    },
    trans: {
      icon: '🔄',
      title: '3. 변속기 (Transmission)',
      desc: '엔진의 고정된 회전수를 차량의 주행 속도와 주행 부하에 맞춰 다양한 기어비로 치환합니다. 출발할 때는 강한 힘(높은 토크)을, 고속 주행 시에는 낮은 엔진 회전수로 빠른 속도를 냅니다.'
    },
    shaft: {
      icon: '📏',
      title: '4. 드라이브샤프트 (Driveshaft & Propeller Shaft)',
      desc: '차체 앞부분의 변속기에서 출력된 회전 동력을 차체 바닥을 관통하여 후륜 또는 사륜구동 디퍼런셜 기어까지 비틀림 없이 신속하게 전달하는 고강도 회전축입니다.'
    },
    diff: {
      icon: '🔀',
      title: '5. 디퍼런셜 기어 (Differential Gear / 차동기어)',
      desc: '드라이브샤프트의 회전 방향을 90도 꺾어 바퀴 축으로 전달하는 동시에, 코너링 시 회전 반경이 다른 안쪽 바퀴와 바깥쪽 바퀴가 서로 다른 속도로 부드럽게 회전할 수 있도록 조절합니다.'
    },
    wheels: {
      icon: '🛞',
      title: '6. 구동 바퀴와 타이어 (Drive Wheels & Tires)',
      desc: '전달된 최종 회전 토크를 지면과의 마찰력(트랙션)으로 전환하여 수 톤에 달하는 차량을 전진 또는 후진시키는 최종 추진 종착점입니다.'
    }
  };

  nodes.forEach(node => {
    node.addEventListener('click', () => {
      nodes.forEach(n => n.classList.remove('active'));
      node.classList.add('active');

      const step = node.getAttribute('data-step');
      const data = details[step];
      if (data) {
        detailBox.innerHTML = `
          <div class="flow-detail-icon">${data.icon}</div>
          <div class="flow-detail-content">
            <h4>${data.title}</h4>
            <p>${data.desc}</p>
          </div>
        `;
      }
    });
  });
}

/* --------------------------------------------------------------------------
   6. DIFFERENTIAL GEAR CORNERING SIMULATOR
   -------------------------------------------------------------------------- */
function initDifferentialDemo() {
  const turnBtns = document.querySelectorAll('.turn-btn');
  const leftRpmBadge = document.getElementById('leftWheelRpm');
  const rightRpmBadge = document.getElementById('rightWheelRpm');
  const diffStatusText = document.getElementById('diffStatusText');

  turnBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      turnBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const mode = btn.getAttribute('data-turn');
      if (mode === 'straight') {
        if (leftRpmBadge) leftRpmBadge.textContent = '1000 RPM';
        if (rightRpmBadge) rightRpmBadge.textContent = '1000 RPM';
        if (diffStatusText) {
          diffStatusText.textContent = '직진 주행: 양쪽 바퀴가 동일한 거리를 이동하므로 피니언 기어가 자전하지 않고 1:1로 고르게 구동력을 배분합니다.';
        }
      } else if (mode === 'left') {
        if (leftRpmBadge) leftRpmBadge.textContent = '750 RPM (안쪽 저속)';
        if (rightRpmBadge) rightRpmBadge.textContent = '1250 RPM (바깥 고속)';
        if (diffStatusText) {
          diffStatusText.textContent = '좌회전 중: 회전 반경이 짧은 안쪽(좌측) 바퀴가 저항을 받아 느려지면, 디퍼런셜 피니언 기어가 스스로 회전(자전)하면서 바깥쪽(우측) 바퀴를 그만큼 더 빠르게 회전시켜 타이어 슬립 없는 매끄러운 선회가 가능합니다!';
        }
      } else if (mode === 'right') {
        if (leftRpmBadge) leftRpmBadge.textContent = '1250 RPM (바깥 고속)';
        if (rightRpmBadge) rightRpmBadge.textContent = '750 RPM (안쪽 저속)';
        if (diffStatusText) {
          diffStatusText.textContent = '우회전 중: 회전 반경이 긴 좌측 바퀴가 더 긴 거리를 주행해야 하므로, 디퍼런셜 기어가 회전 차이를 즉각 보상하여 스핀이나 타이어 마모 없이 곡선로를 돌파합니다.';
        }
      }
    });
  });
}

/* --------------------------------------------------------------------------
   7. DRIVETRAIN SANDBOX (FF / FR / AWD / MR)
   -------------------------------------------------------------------------- */
function initDrivetrainSandbox() {
  const driveBtns = document.querySelectorAll('.drive-opt-btn');
  const wheels = {
    fl: document.querySelector('.wheel-fl'),
    fr: document.querySelector('.wheel-fr'),
    rl: document.querySelector('.wheel-rl'),
    rr: document.querySelector('.wheel-rr')
  };
  const engineBlock = document.getElementById('sandboxEngineBlock');
  const title = document.getElementById('driveTitle');
  const desc = document.getElementById('driveDesc');
  const pros = document.getElementById('drivePros');
  const cons = document.getElementById('driveCons');

  const configs = {
    ff: {
      title: 'FF (Front-engine, Front-wheel drive / 전륜구동)',
      engineClass: 'engine-front',
      engineLabel: '엔진 (전방)',
      powered: ['fl', 'fr'],
      desc: '현대 대다수 승용차의 표준 구동방식. 엔진과 변속기가 차량 앞쪽에 가로로 배치되어 앞바퀴로 동력을 전달하고 조향도 담당합니다.',
      pros: '실내 및 트렁크 공간이 넓고 부품 수가 적어 가볍고 연비가 우수함. 눈길·빗길 접지력이 뛰어남.',
      cons: '앞바퀴가 조향과 구동을 동시에 감당하므로 급코너 시 코너 바깥으로 밀리는 언더스티어(Understeer) 발생 가능.'
    },
    fr: {
      title: 'FR (Front-engine, Rear-wheel drive / 후륜구동)',
      engineClass: 'engine-front',
      engineLabel: '엔진 (전방)',
      powered: ['rl', 'rr'],
      desc: '고급 대형 세단 및 정통 스포츠카의 상징. 앞쪽 엔진의 동력을 드라이브샤프트로 뒷바퀴에 전달합니다. 조향은 앞바퀴가, 구동은 뒷바퀴가 전담합니다.',
      pros: '앞뒤 무게 배분이 이상적인 50:50에 가까워 뛰어난 핸들링과 승차감, 가속 시 하중이 뒤로 쏠려 발진 성능 탁월.',
      cons: '차체 바닥을 지나는 드라이브샤프트 터널로 실내 공간 손실, 눈길이나 빙판길에서 후륜 슬립(오버스티어) 취약.'
    },
    awd: {
      title: 'AWD / 4WD (All-Wheel Drive / 4륜구동)',
      engineClass: 'engine-front',
      engineLabel: '엔진/모터',
      powered: ['fl', 'fr', 'rl', 'rr'],
      desc: '4개의 모든 바퀴에 동력을 분배하는 방식. 오프로더뿐 아니라 최근 고성능 전기차와 프리미엄 세단에 전자제어식 AWD가 광범위하게 채택되고 있습니다.',
      pros: '극강의 접지력과 주행 안정성, 빗길/눈길/고속 코너링에서 최고의 트랙션 유지.',
      cons: '차량 중량이 증가하고 구동계 마찰 손실로 연비가 다소 불리하며 차량 가격이 상승함.'
    },
    mr: {
      title: 'MR / RR (Mid-engine / Rear-engine / 미드십·리어)',
      engineClass: 'engine-mid',
      engineLabel: '엔진 (중앙)',
      powered: ['rl', 'rr'],
      desc: '페라리, 람보르기니 등 슈퍼카와 포르쉐 911의 레이아웃. 무거운 엔진을 차량 중심축 또는 뒤쪽에 배치하여 회두성(Turn-in)을 극대화합니다.',
      pros: '선회 관성 모멘트가 극도로 작아 칼날 같은 코너링과 브레이킹 성능 발휘.',
      cons: '실내 공간이 극히 협소(2인승 제한)하며, 한계 주행을 넘어서면 스핀(오버스티어)을 제어하기 매우 까다로움.'
    }
  };

  driveBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      driveBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const type = btn.getAttribute('data-drive');
      const cfg = configs[type];
      if (!cfg) return;

      // Update engine position
      if (engineBlock) {
        engineBlock.className = 'chassis-engine-block ' + cfg.engineClass;
        engineBlock.textContent = cfg.engineLabel;
      }

      // Update powered wheels
      Object.keys(wheels).forEach(k => {
        if (wheels[k]) {
          wheels[k].classList.toggle('powered', cfg.powered.includes(k));
        }
      });

      // Update texts
      if (title) title.textContent = cfg.title;
      if (desc) desc.textContent = cfg.desc;
      if (pros) pros.textContent = cfg.pros;
      if (cons) cons.textContent = cfg.cons;
    });
  });

  // Lab Tab Switcher (Drivetrain vs Quiz)
  const labTabs = document.querySelectorAll('.lab-tab-btn');
  const panes = document.querySelectorAll('.lab-pane');

  labTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      labTabs.forEach(t => t.classList.remove('active'));
      panes.forEach(p => p.classList.remove('active'));

      tab.classList.add('active');
      const targetPane = document.getElementById(tab.getAttribute('data-target'));
      if (targetPane) targetPane.classList.add('active');
    });
  });
}

/* --------------------------------------------------------------------------
   8. MASTER KNOWLEDGE QUIZ
   -------------------------------------------------------------------------- */
function initQuiz() {
  const quizQuestions = [
    {
      q: '1. 1886년 세계 최초로 특허를 획득한 가솔린 내연기관 삼륜차 "페이턴트 모터바겐"을 발명한 인물은 누구일까요?',
      options: ['헨리 포드 (Henry Ford)', '칼 벤츠 (Carl Benz)', '니콜라 퀴뇨 (Nicolas Cugnot)', '루돌프 디젤 (Rudolf Diesel)'],
      answer: 1,
      explanation: '정답은 칼 벤츠(Carl Benz)입니다! 1886년 1월 29일 독일 제국 특허청에 DRP 37435호 특허를 등록하며 인류 최초의 실용적 가솔린 자동차 시대를 열었습니다.'
    },
    {
      q: '2. 4행정 내연기관 사이클 중, 유일하게 외부로 실제 동력(토크)을 발생시키는 행정은 무엇인가요?',
      options: ['흡입 행정 (Intake)', '압축 행정 (Compression)', '폭발/팽창 행정 (Power)', '배기 행정 (Exhaust)'],
      answer: 2,
      explanation: '정답은 폭발/팽창 행정(Power)입니다! 점화플러그의 스파크로 고온·고압 연소 가스가 폭발하며 피스톤을 강하게 내리눌러 크랭크축을 회전시킵니다.'
    },
    {
      q: '3. 자동차가 곡선 도로를 회전할 때, 안쪽 바퀴와 바깥쪽 바퀴의 회전 속도 차이를 조절해주는 핵심 부품은?',
      options: ['디퍼런셜 기어 (차동기어)', '클러치 (Clutch)', '터보차저 (Turbocharger)', '촉매 변환기 (Catalytic Converter)'],
      answer: 0,
      explanation: '정답은 디퍼런셜 기어(Differential Gear)입니다. 코너링 시 회전 반경이 긴 바깥쪽 바퀴가 더 빨리 회전할 수 있도록 내부 피니언 기어가 차동 동작을 수행합니다.'
    },
    {
      q: '4. 전기차(EV)에서 배터리의 직류(DC) 전원을 모터 구동용 교류(AC)로 변환하고 속도를 제어하는 핵심 전력장치는?',
      options: ['감속기 (Reducer)', '인버터 (Inverter)', '컨버터 (LDC)', '배터리 모듈 (Battery Module)'],
      answer: 1,
      explanation: '정답은 인버터(Inverter)입니다. 고전압 배터리의 직류 전기를 3상 교류 전기로 초당 수천 번 이상 정밀 스위칭 변환하여 모터의 토크와 회전수를 완벽하게 제어합니다.'
    },
    {
      q: '5. 전통 내연기관 자동차의 종합 에너지 효율(약 20~25%)에 비해, 최신 순수 전기차의 평균 구동 에너지 효율은 대략 어느 정도일까요?',
      options: ['약 30 ~ 35%', '약 50 ~ 55%', '약 85 ~ 90% 이상', '100%'],
      answer: 2,
      explanation: '정답은 약 85~90% 이상입니다! 내연기관은 열과 배기가스로 70% 이상의 에너지를 버리지만, 전기차는 모터와 인버터의 전자기 변환 손실이 극히 적고 감속 시 회생 제동으로 에너지를 재충전합니다.'
    }
  ];

  let currentIdx = 0;
  let score = 0;

  const countBadge = document.getElementById('quizCountBadge');
  const qTitle = document.getElementById('quizQuestionTitle');
  const optList = document.getElementById('quizOptionList');
  const feedbackBox = document.getElementById('quizFeedbackBox');
  const nextBtn = document.getElementById('quizNextBtn');
  const qContainer = document.getElementById('quizQuestionContainer');
  const resultCard = document.getElementById('quizResultCard');
  const resultScore = document.getElementById('quizResultScore');
  const restartBtn = document.getElementById('quizRestartBtn');

  function renderQuestion() {
    if (!qTitle || !optList) return;
    const current = quizQuestions[currentIdx];
    if (countBadge) countBadge.textContent = `문제 ${currentIdx + 1} / ${quizQuestions.length}`;
    qTitle.textContent = current.q;
    optList.innerHTML = '';
    feedbackBox.classList.remove('show');
    feedbackBox.innerHTML = '';
    nextBtn.style.display = 'none';

    current.options.forEach((opt, idx) => {
      const btn = document.createElement('button');
      btn.className = 'quiz-opt-btn';
      btn.innerHTML = `<span style="color:var(--neon-cyan); font-weight:700;">${idx + 1}.</span> ${opt}`;
      btn.addEventListener('click', () => handleAnswer(idx, btn));
      optList.appendChild(btn);
    });
  }

  function handleAnswer(selectedIdx, clickedBtn) {
    const current = quizQuestions[currentIdx];
    const allBtns = optList.querySelectorAll('.quiz-opt-btn');
    allBtns.forEach(b => (b.disabled = true));

    if (selectedIdx === current.answer) {
      clickedBtn.classList.add('correct');
      score++;
      feedbackBox.innerHTML = `<strong style="color:var(--eco-green)">✓ 정답입니다!</strong><br>${current.explanation}`;
    } else {
      clickedBtn.classList.add('wrong');
      allBtns[current.answer].classList.add('correct');
      feedbackBox.innerHTML = `<strong style="color:var(--speed-red)">✗ 오답입니다.</strong><br>${current.explanation}`;
    }

    feedbackBox.classList.add('show');
    nextBtn.style.display = 'inline-flex';
  }

  if (nextBtn) {
    nextBtn.addEventListener('click', () => {
      currentIdx++;
      if (currentIdx < quizQuestions.length) {
        renderQuestion();
      } else {
        // Show result
        qContainer.style.display = 'none';
        resultCard.style.display = 'block';
        if (resultScore) resultScore.textContent = `${score} / ${quizQuestions.length} 점`;
      }
    });
  }

  if (restartBtn) {
    restartBtn.addEventListener('click', () => {
      currentIdx = 0;
      score = 0;
      qContainer.style.display = 'block';
      resultCard.style.display = 'none';
      renderQuestion();
    });
  }

  renderQuestion();
}

/* --------------------------------------------------------------------------
   9. GLOSSARY INSTANT SEARCH
   -------------------------------------------------------------------------- */
function initGlossarySearch() {
  const searchInput = document.getElementById('glossarySearchInput');
  const cards = document.querySelectorAll('.glossary-card');

  if (!searchInput) return;

  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();

    cards.forEach(card => {
      const text = card.textContent.toLowerCase();
      if (text.includes(query)) {
        card.style.display = 'block';
      } else {
        card.style.display = 'none';
      }
    });
  });
}

/* --------------------------------------------------------------------------
   10. MODAL POPUP FOR DEEP DIVE ANECDOTES
   -------------------------------------------------------------------------- */
function initModal() {
  const modalBackdrop = document.getElementById('historyModal');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const modalTag = document.getElementById('modalTag');
  const modalTitle = document.getElementById('modalTitle');
  const modalBody = document.getElementById('modalBody');

  const modalData = {
    bertha: {
      tag: 'HISTORICAL ANECDOTE • 1888',
      title: '베르타 벤츠의 대담한 세계 최초 장거리 자동차 여행',
      body: `
        칼 벤츠가 자동차를 발명했으나 상용화에 대해 소심해져 있던 1888년 8월, 그의 아내 <strong>베르타 벤츠(Bertha Benz)</strong>는 남편 모르게 두 아들을 태우고 만하임에서 포르츠하임까지 왕복 약 194km의 세계 최초 장거리 주행을 감행했습니다.<br><br>
        • <strong>약국이 세계 최초의 주유소:</strong> 연료(리그로인 세정제)가 떨어지자 비스록(Wiesloch) 마을의 약국에서 구입하여 주유했습니다.<br>
        • <strong>현장 발명:</strong> 막힌 연료 파이프는 모자핀으로 뚫고, 피복이 벗겨진 전선은 가터벨트로 감싸 절연했으며, 닳아버린 목재 브레이크 패드에는 구두공을 찾아가 가죽을 덧대어 <strong>세계 최초의 브레이크 라이닝</strong>을 발명했습니다.<br><br>
        이 대담한 여정은 전 세계 신문에 대서특필되었고, 마차보다 안전하고 실용적인 운송수단임을 만천하에 입증하며 자동차 대중화의 불꽃을 당겼습니다.
      `
    },
    ford: {
      tag: 'INDUSTRIAL REVOLUTION • 1913',
      title: '컨베이어 벨트와 포디즘(Fordism)의 생산 혁명',
      body: `
        1913년 헨리 포드는 시카고 도축장의 고기 해체 레일에서 영감을 얻어 자동차 조립에 이동식 <strong>컨베이어 벨트 시스템</strong>을 최초로 도입했습니다.<br><br>
        • <strong>조립 시간 단축:</strong> 1대당 12시간 8분이 걸리던 조립 시간을 단 <strong>93분</strong>으로 8배 이상 단축시켰습니다.<br>
        • <strong>가격 파괴:</strong> 초기 850달러였던 모델 T의 가격은 260달러까지 폭락하여, 귀족의 사치품이던 자동차를 일반 중산층 노동자도 구매할 수 있는 시대를 열었습니다.<br>
        • <strong>일급 5달러의 충격:</strong> 포드는 노동자의 일급을 당시 업계 2배인 5달러로 파격 인상하여 직원들이 자신이 만든 차를 살 수 있는 건강한 경제 순환을 창조했습니다.
      `
    },
    safety: {
      tag: 'INNOVATION & LIFE • 1959',
      title: '인류를 구한 볼보 닐스 볼린의 3점식 안전벨트 특허 무료 공개',
      body: `
        1959년 볼보(Volvo)의 엔지니어 <strong>닐스 볼린(Nils Bohlin)</strong>은 오늘날 모든 승용차에 기본 장착된 <strong>3점식 V자형 안전벨트</strong>를 개발했습니다.<br><br>
        골반과 흉골을 동시에 단단하게 지지하여 탑승자가 튕겨나가는 것을 방지하는 이 획기적인 기술에 대해, 볼보는 독점 특허를 고집하는 대신 <strong>"모든 인류의 생명 안전이 상업적 이익보다 앞선다"</strong>며 전 세계 모든 자동차 제조사에 무료로 특허를 전격 개방했습니다.<br><br>
        이 고귀한 결단 덕분에 지금까지 전 세계에서 <strong>100만 명 이상의 생명</strong>이 구원받은 것으로 추산됩니다.
      `
    }
  };

  document.querySelectorAll('.timeline-expand-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const key = btn.getAttribute('data-story');
      const item = modalData[key];
      if (item && modalBackdrop) {
        modalTag.textContent = item.tag;
        modalTitle.textContent = item.title;
        modalBody.innerHTML = item.desc || item.body;
        modalBackdrop.classList.add('active');
      }
    });
  });

  if (modalCloseBtn) {
    modalCloseBtn.addEventListener('click', () => {
      modalBackdrop.classList.remove('active');
    });
  }

  if (modalBackdrop) {
    modalBackdrop.addEventListener('click', (e) => {
      if (e.target === modalBackdrop) {
        modalBackdrop.classList.remove('active');
      }
    });
  }
}

/* ==========================================================================
   11. DIRECT TRACK DRIVE SIMULATOR ENGINE (실시간 인터랙티브 주행 시뮬레이터)
   ========================================================================== */
function initDirectDriveSimulator() {
  const canvas = document.getElementById('driveCanvas');
  const minimapCanvas = document.getElementById('minimapCanvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  const miniCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;

  // Viewport setup
  let viewW = (canvas.width = canvas.parentElement.offsetWidth || 1000);
  let viewH = (canvas.height = canvas.parentElement.offsetHeight || 560);

  window.addEventListener('resize', () => {
    if (canvas.parentElement) {
      viewW = canvas.width = canvas.parentElement.offsetWidth;
      viewH = canvas.height = canvas.parentElement.offsetHeight;
    }
  });

  // Offscreen Skidmarks Canvas Buffer
  const skidCanvas = document.createElement('canvas');
  const worldW = 3200;
  const worldH = 2200;
  skidCanvas.width = worldW;
  skidCanvas.height = worldH;
  const skidCtx = skidCanvas.getContext('2d');

  // Input State
  const input = {
    up: false,
    down: false,
    left: false,
    right: false,
    handbrake: false
  };

  // Sound Engine (Web Audio API)
  let audioCtx = null;
  let masterGain = null;
  let isAudioEnabled = false;

  // Synthesizer Nodes
  let engineOsc1 = null;
  let engineOsc2 = null;
  let engineFilter = null;
  let engineGain = null;
  let tireNoiseNode = null;
  let tireGain = null;

  function initAudio() {
    if (audioCtx) return;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    audioCtx = new AudioContext();

    masterGain = audioCtx.createGain();
    masterGain.gain.value = 0.35;
    masterGain.connect(audioCtx.destination);

    // Engine Synth (Dual Sawtooth + Lowpass Filter)
    engineOsc1 = audioCtx.createOscillator();
    engineOsc2 = audioCtx.createOscillator();
    engineFilter = audioCtx.createBiquadFilter();
    engineGain = audioCtx.createGain();

    engineOsc1.type = 'sawtooth';
    engineOsc2.type = 'triangle';
    engineFilter.type = 'lowpass';
    engineFilter.frequency.value = 400;

    engineOsc1.connect(engineFilter);
    engineOsc2.connect(engineFilter);
    engineFilter.connect(engineGain);
    engineGain.connect(masterGain);
    engineGain.gain.value = 0.001;

    engineOsc1.start();
    engineOsc2.start();

    // Tire Screech Noise Synth (White Noise Buffer + Bandpass Filter)
    const bufferSize = audioCtx.sampleRate * 2;
    const noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }

    const whiteNoise = audioCtx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    whiteNoise.loop = true;

    const tireFilter = audioCtx.createBiquadFilter();
    tireFilter.type = 'bandpass';
    tireFilter.frequency.value = 1100;
    tireFilter.Q.value = 3.0;

    tireGain = audioCtx.createGain();
    tireGain.gain.value = 0;

    whiteNoise.connect(tireFilter);
    tireFilter.connect(tireGain);
    tireGain.connect(masterGain);
    whiteNoise.start();
  }

  function playBackfirePop() {
    if (!audioCtx || !isAudioEnabled) return;
    try {
      const popOsc = audioCtx.createOscillator();
      const popGain = audioCtx.createGain();
      popOsc.type = 'sawtooth';
      popOsc.frequency.setValueAtTime(140, audioCtx.currentTime);
      popOsc.frequency.exponentialRampToValueAtTime(30, audioCtx.currentTime + 0.08);

      popGain.gain.setValueAtTime(0.5, audioCtx.currentTime);
      popGain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);

      popOsc.connect(popGain);
      popGain.connect(masterGain);
      popOsc.start();
      popOsc.stop(audioCtx.currentTime + 0.09);
    } catch (e) {}
  }

  // Vehicle Configurations
  const vehicles = {
    v8: {
      id: 'v8',
      name: 'V8 트윈터보 가솔린 GT',
      desc: '프론트 미드십 FR 정통 스포츠카. 7단 듀얼클러치(DCT)의 번개 같은 기어 체결, 고회전 사운드, 날카로운 오버스티어 드리프트를 즐길 수 있습니다.',
      power: '650 HP / 820 Nm',
      zero100: '3.2 초',
      transName: 'FR / 7단 DCT',
      mass: 1540,
      maxRpm: 7800,
      idleRpm: 850,
      gears: [3.8, 2.6, 1.9, 1.45, 1.15, 0.92, 0.76],
      reverseRatio: 3.4,
      finalDrive: 3.6,
      maxSpeed: 88, // m/s (~316 km/h)
      accelForce: 9200,
      brakeForce: 15000,
      gripFactor: 1.18,
      soundType: 'ice',
      bodyColor: '#ff3366',
      accentColor: '#ff8c42',
      length: 50,
      width: 24
    },
    ev: {
      id: 'ev',
      name: '하이퍼 듀얼모터 (전기차 EV)',
      desc: '1,020마력 듀얼모터 AWD. 0 RPM부터 터지는 즉각적인 토크와 1단 감속기, 가속 페달에서 발을 떼면 작동하는 회생제동 원페달 드라이빙을 체험할 수 있습니다.',
      power: '1,020 HP / 1,300 Nm',
      zero100: '2.1 초',
      transName: 'AWD / 1단 감속기 (9.2:1)',
      mass: 2120,
      maxRpm: 18000,
      idleRpm: 0,
      gears: [8.8],
      reverseRatio: 8.8,
      finalDrive: 1.0,
      maxSpeed: 82, // m/s (~295 km/h)
      accelForce: 14500,
      brakeForce: 17500,
      gripFactor: 1.38,
      soundType: 'ev',
      bodyColor: '#00f0ff',
      accentColor: '#3b82f6',
      length: 52,
      width: 25
    },
    benz: {
      id: 'benz',
      name: '1886 벤츠 페이턴트 모터바겐',
      desc: '인류 최초의 특허 가솔린 삼륜차. 단기통 수평 4행정 엔진(0.75마력)과 대형 수평 플라이휠. 독특한 삼륜 조향과 툭-툭-툭 클래식 엔진음을 체감하세요.',
      power: '0.75 HP / 954 cc',
      zero100: '측정 불가 (최고 16 km/h)',
      transName: 'RWD / 벨트 구동 1단',
      mass: 265,
      maxRpm: 450,
      idleRpm: 180,
      gears: [14.0],
      reverseRatio: 14.0,
      finalDrive: 1.0,
      maxSpeed: 4.8, // m/s (~17 km/h)
      accelForce: 750,
      brakeForce: 2200,
      gripFactor: 0.85,
      soundType: 'benz',
      bodyColor: '#2b261f',
      accentColor: '#ffb703',
      length: 46,
      width: 22,
      isThreeWheeler: true
    }
  };

  let currentVehKey = 'v8';
  let curCfg = vehicles[currentVehKey];

  // Car Physics State
  const car = {
    x: 600,
    y: 1100,
    vx: 0,
    vy: 0,
    speed: 0, // m/s
    heading: 0, // radians
    steerAngle: 0, // target steer
    actualSteer: 0,
    gearIdx: 0, // 0-based for forward gears, -1 for reverse
    isReverse: false,
    autoShift: true,
    rpm: 850,
    throttle: 0,
    brake: 0,
    handbrake: false,
    slipAngle: 0,
    latG: 0,
    lonG: 0,
    driftScore: 0,
    shiftTimer: 0 // torque cut during shifts
  };

  // Smoke Particles pool
  const tireParticles = [];

  // Track Circuit Coordinates (Closed loop racing track)
  const trackWaypoints = [
    { x: 500, y: 1100 },
    { x: 1200, y: 1100 },
    { x: 1800, y: 1100 },
    { x: 2300, y: 1100 },
    { x: 2700, y: 1300 },
    { x: 2800, y: 1600 },
    { x: 2600, y: 1900 },
    { x: 2100, y: 1950 },
    { x: 1600, y: 1750 },
    { x: 1300, y: 1550 },
    { x: 1000, y: 1650 },
    { x: 700, y: 1950 },
    { x: 350, y: 1800 },
    { x: 300, y: 1400 }
  ];

  // Driving Difficulty & Electronic Assist Mode
  let assistMode = 'easy'; // 'easy' (default: full assists, no spinouts), 'sport', 'pro'
  const trackWidth = 250; // Increased track width for comfortable, forgiving cornering!

  // Slalom Cones placed in the center infield skidpad
  const cones = [
    { x: 1000, y: 800 },
    { x: 1200, y: 800 },
    { x: 1400, y: 800 },
    { x: 1600, y: 800 },
    { x: 1800, y: 800 }
  ];

  // Lap Timing State
  let lapStartTime = performance.now();
  let bestLapTime = null;
  let currentCheckpoint = 0;
  const checkpoints = [
    { x: 500, y: 1100 },
    { x: 2300, y: 1100 },
    { x: 2600, y: 1900 },
    { x: 1300, y: 1550 },
    { x: 300, y: 1400 }
  ];

  // UI Elements
  const speedNum = document.getElementById('hudSpeedNum');
  const gearDigit = document.getElementById('hudGearDigit');
  const tachFill = document.getElementById('hudTachFill');
  const rpmText = document.getElementById('hudRpmText');
  const tachMax = document.getElementById('hudTachMax');
  const gforceDot = document.getElementById('gforceDot');
  const latGVal = document.getElementById('latGVal');
  const lonGVal = document.getElementById('lonGVal');
  const lapTimeDisplay = document.getElementById('simLapTime');
  const bestLapDisplay = document.getElementById('simBestLap');
  const driftBadge = document.getElementById('hudDriftBadge');
  const driftPtsDisplay = document.getElementById('hudDriftPts');
  const soundBtn = document.getElementById('simSoundToggle');
  const soundIcon = document.getElementById('soundIcon');
  const soundLabel = document.getElementById('soundLabel');
  const gearModeBtn = document.getElementById('simGearModeBtn');
  const gearModeLabel = document.getElementById('gearModeLabel');
  const resetBtn = document.getElementById('simResetBtn');
  const assistBtn = document.getElementById('simAssistBtn');
  const assistLabel = document.getElementById('assistModeLabel');
  const badgeESP = document.getElementById('badgeESP');
  const badgeTCS = document.getElementById('badgeTCS');
  const badgeABS = document.getElementById('badgeABS');
  const badgeSTEER = document.getElementById('badgeSTEER');

  // Shift LEDs
  const shiftLeds = [
    document.getElementById('sLed1'),
    document.getElementById('sLed2'),
    document.getElementById('sLed3'),
    document.getElementById('sLed4'),
    document.getElementById('sLed5')
  ];

  // Tire Badges
  const tireBadges = {
    fl: document.getElementById('tireFL'),
    fr: document.getElementById('tireFR'),
    rl: document.getElementById('tireRL'),
    rr: document.getElementById('tireRR')
  };

  // Vehicle Profile Card Elements
  const cardTitle = document.getElementById('simCardTitle');
  const cardDesc = document.getElementById('simCardDesc');
  const cardPower = document.getElementById('simCardPower');
  const cardZero = document.getElementById('simCardZero');
  const cardTrans = document.getElementById('simCardTrans');

  // Pre-render static track onto asphalt background
  function drawTrack(targetCtx) {
    // Fill terrain (Dark asphalt proving grounds)
    targetCtx.fillStyle = '#0a0d14';
    targetCtx.fillRect(0, 0, worldW, worldH);

    // Grid lines for high-tech proving ground feel
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.025)';
    targetCtx.lineWidth = 1;
    for (let x = 0; x < worldW; x += 100) {
      targetCtx.beginPath();
      targetCtx.moveTo(x, 0);
      targetCtx.lineTo(x, worldH);
      targetCtx.stroke();
    }
    for (let y = 0; y < worldH; y += 100) {
      targetCtx.beginPath();
      targetCtx.moveTo(0, y);
      targetCtx.lineTo(worldW, y);
      targetCtx.stroke();
    }

    // Outer Track Border & Kerbs (Red & White)
    targetCtx.strokeStyle = '#ff3366';
    targetCtx.lineWidth = trackWidth + 28;
    targetCtx.lineCap = 'round';
    targetCtx.lineJoin = 'round';
    targetCtx.beginPath();
    trackWaypoints.forEach((pt, i) => {
      if (i === 0) targetCtx.moveTo(pt.x, pt.y);
      else targetCtx.lineTo(pt.x, pt.y);
    });
    targetCtx.closePath();
    targetCtx.stroke();

    // Main Asphalt Ribbon (Wide & Smooth)
    targetCtx.strokeStyle = '#151b27';
    targetCtx.lineWidth = trackWidth;
    targetCtx.beginPath();
    trackWaypoints.forEach((pt, i) => {
      if (i === 0) targetCtx.moveTo(pt.x, pt.y);
      else targetCtx.lineTo(pt.x, pt.y);
    });
    targetCtx.closePath();
    targetCtx.stroke();

    // High-tech Translucent Glowing Racing Line Guide (Apex Guide)
    targetCtx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
    targetCtx.lineWidth = 6;
    targetCtx.beginPath();
    trackWaypoints.forEach((pt, i) => {
      if (i === 0) targetCtx.moveTo(pt.x, pt.y);
      else targetCtx.lineTo(pt.x, pt.y);
    });
    targetCtx.closePath();
    targetCtx.stroke();

    // Dashed Centerline
    targetCtx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
    targetCtx.lineWidth = 3;
    targetCtx.setLineDash([24, 24]);
    targetCtx.beginPath();
    trackWaypoints.forEach((pt, i) => {
      if (i === 0) targetCtx.moveTo(pt.x, pt.y);
      else targetCtx.lineTo(pt.x, pt.y);
    });
    targetCtx.closePath();
    targetCtx.stroke();
    targetCtx.setLineDash([]);

    // Start/Finish Line (Checkered pattern)
    targetCtx.save();
    targetCtx.translate(500, 1100);
    targetCtx.rotate(Math.PI / 2);
    for (let i = -trackWidth / 2; i < trackWidth / 2; i += 16) {
      targetCtx.fillStyle = (Math.floor(i / 16) % 2 === 0) ? '#ffffff' : '#07090e';
      targetCtx.fillRect(-12, i, 12, 16);
      targetCtx.fillStyle = (Math.floor(i / 16) % 2 === 0) ? '#07090e' : '#ffffff';
      targetCtx.fillRect(0, i, 12, 16);
    }
    targetCtx.restore();

    // Infield Skidpad circle
    targetCtx.strokeStyle = 'rgba(0, 240, 255, 0.18)';
    targetCtx.lineWidth = 4;
    targetCtx.setLineDash([10, 10]);
    targetCtx.beginPath();
    targetCtx.arc(1400, 800, 260, 0, Math.PI * 2);
    targetCtx.stroke();
    targetCtx.setLineDash([]);

    // Slalom Cones
    cones.forEach(c => {
      targetCtx.fillStyle = '#ff7849';
      targetCtx.beginPath();
      targetCtx.arc(c.x, c.y, 9, 0, Math.PI * 2);
      targetCtx.fill();
      targetCtx.strokeStyle = '#fff';
      targetCtx.lineWidth = 2;
      targetCtx.stroke();
    });
  }

  // Draw initial persistent track to background
  const bgCanvas = document.createElement('canvas');
  bgCanvas.width = worldW;
  bgCanvas.height = worldH;
  const bgCtx = bgCanvas.getContext('2d');
  drawTrack(bgCtx);

  // Switch Vehicle Function
  function selectVehicle(key) {
    if (!vehicles[key]) return;
    currentVehKey = key;
    curCfg = vehicles[key];

    // Reset physics parameters
    car.speed = 0;
    car.vx = 0;
    car.vy = 0;
    car.gearIdx = 0;
    car.isReverse = false;
    car.rpm = curCfg.idleRpm;

    // Update buttons
    document.querySelectorAll('.vehicle-pill-btn').forEach(btn => {
      btn.classList.toggle('active', btn.getAttribute('data-veh') === key);
    });

    // Update specs card
    if (cardTitle) cardTitle.textContent = curCfg.name;
    if (cardDesc) cardDesc.textContent = curCfg.desc;
    if (cardPower) cardPower.textContent = curCfg.power;
    if (cardZero) cardZero.textContent = curCfg.zero100;
    if (cardTrans) cardTrans.textContent = curCfg.transName;
    if (hudTachMax) hudTachMax.textContent = `${curCfg.maxRpm.toLocaleString()} RPM`;

    // Audio node adjustments
    if (audioCtx) {
      if (curCfg.soundType === 'ev') {
        engineOsc1.type = 'sine';
        engineOsc2.type = 'sine';
        engineFilter.frequency.value = 2000;
      } else {
        engineOsc1.type = 'sawtooth';
        engineOsc2.type = 'triangle';
        engineFilter.frequency.value = 450;
      }
    }
  }

  // Vehicle Selector Buttons
  document.querySelectorAll('.vehicle-pill-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      selectVehicle(btn.getAttribute('data-veh'));
    });
  });

  // Sound Toggle
  if (soundBtn) {
    soundBtn.addEventListener('click', () => {
      initAudio();
      if (!audioCtx) return;

      if (audioCtx.state === 'suspended') {
        audioCtx.resume();
      }

      isAudioEnabled = !isAudioEnabled;
      soundBtn.classList.toggle('active-sound', isAudioEnabled);
      if (soundIcon) soundIcon.textContent = isAudioEnabled ? '🔊' : '🔇';
      if (soundLabel) soundLabel.textContent = isAudioEnabled ? '사운드 켜짐 (ON)' : '사운드 켜기';
    });
  }

  // Gear Shift Mode (Auto vs Manual)
  if (gearModeBtn) {
    gearModeBtn.addEventListener('click', () => {
      car.autoShift = !car.autoShift;
      if (gearModeLabel) {
        gearModeLabel.textContent = car.autoShift ? '자동 (AUTO)' : '수동 (MANUAL)';
        gearModeLabel.style.color = car.autoShift ? 'var(--neon-cyan)' : 'var(--amber-gold)';
      }
    });
  }

  // Driving Assist & Difficulty Selector (Easy / Sport / Pro)
  if (assistBtn) {
    assistBtn.addEventListener('click', () => {
      if (assistMode === 'easy') {
        assistMode = 'sport';
        assistBtn.style.borderColor = 'var(--amber-gold)';
        assistBtn.style.color = 'var(--amber-gold)';
        assistBtn.style.background = 'rgba(255, 183, 3, 0.12)';
        if (assistLabel) assistLabel.textContent = '스포츠 모드 (SPORT)';
        if (badgeESP) { badgeESP.textContent = 'ESP (다이내믹)'; badgeESP.style.color = 'var(--amber-gold)'; badgeESP.style.borderColor = 'rgba(255,183,3,0.4)'; }
        if (badgeTCS) { badgeTCS.textContent = 'TCS (부분허용)'; badgeTCS.style.color = 'var(--amber-gold)'; badgeTCS.style.borderColor = 'rgba(255,183,3,0.4)'; }
        if (badgeSTEER) { badgeSTEER.textContent = '조향 보조 (보통)'; badgeSTEER.style.color = 'var(--amber-gold)'; }
      } else if (assistMode === 'sport') {
        assistMode = 'pro';
        assistBtn.style.borderColor = 'var(--speed-red)';
        assistBtn.style.color = 'var(--speed-red)';
        assistBtn.style.background = 'rgba(255, 51, 102, 0.12)';
        if (assistLabel) assistLabel.textContent = '프로 레이싱 (PRO)';
        if (badgeESP) { badgeESP.textContent = 'ESP OFF'; badgeESP.style.color = 'var(--text-dim)'; badgeESP.style.borderColor = 'rgba(255,255,255,0.1)'; }
        if (badgeTCS) { badgeTCS.textContent = 'TCS OFF'; badgeTCS.style.color = 'var(--text-dim)'; badgeTCS.style.borderColor = 'rgba(255,255,255,0.1)'; }
        if (badgeSTEER) { badgeSTEER.textContent = '수동 조향 (직결)'; badgeSTEER.style.color = 'var(--text-dim)'; }
      } else {
        assistMode = 'easy';
        assistBtn.style.borderColor = 'var(--eco-green)';
        assistBtn.style.color = 'var(--eco-green)';
        assistBtn.style.background = 'rgba(16, 185, 129, 0.12)';
        if (assistLabel) assistLabel.textContent = '초보자 이지 (EASY)';
        if (badgeESP) { badgeESP.textContent = 'ESP (자세제어) ON'; badgeESP.style.color = 'var(--eco-green)'; badgeESP.style.borderColor = 'rgba(16,185,129,0.4)'; }
        if (badgeTCS) { badgeTCS.textContent = 'TCS (미끄럼방지) ON'; badgeTCS.style.color = 'var(--eco-green)'; badgeTCS.style.borderColor = 'rgba(16,185,129,0.4)'; }
        if (badgeSTEER) { badgeSTEER.textContent = '조향 보조 ON'; badgeSTEER.style.color = 'var(--neon-cyan)'; badgeSTEER.style.borderColor = 'rgba(0,240,255,0.4)'; }
      }
    });
  }

  // Car Reset
  function resetCar() {
    car.x = 500;
    car.y = 1100;
    car.vx = 0;
    car.vy = 0;
    car.speed = 0;
    car.heading = 0;
    car.gearIdx = 0;
    car.isReverse = false;
    car.rpm = curCfg.idleRpm;
    car.steerAngle = 0;
    car.actualSteer = 0;
    car.driftScore = 0;
  }
  if (resetBtn) resetBtn.addEventListener('click', resetCar);

  // Input Listeners (Keyboard)
  window.addEventListener('keydown', e => {
    // Only capture keys if focus or driving
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
      e.preventDefault();
    }
    initAudio();

    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') input.up = true;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') input.down = true;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = true;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = true;
    if (e.key === ' ') input.handbrake = true;
    if (e.key === 'r' || e.key === 'R') resetCar();

    // Manual shifting
    if (!car.autoShift) {
      if (e.key === 'e' || e.key === 'E') {
        // Shift Up
        if (car.gearIdx < curCfg.gears.length - 1) {
          car.gearIdx++;
          car.shiftTimer = 0.14;
          playBackfirePop();
        }
      }
      if (e.key === 'q' || e.key === 'Q') {
        // Shift Down
        if (car.gearIdx > 0) {
          car.gearIdx--;
          car.shiftTimer = 0.12;
          playBackfirePop();
        }
      }
    }
  });

  window.addEventListener('keyup', e => {
    if (e.key === 'ArrowUp' || e.key === 'w' || e.key === 'W') input.up = false;
    if (e.key === 'ArrowDown' || e.key === 's' || e.key === 'S') input.down = false;
    if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') input.left = false;
    if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') input.right = false;
    if (e.key === ' ') input.handbrake = false;
  });

  // Virtual On-screen Buttons
  function bindTouch(btnId, key) {
    const btn = document.getElementById(btnId);
    if (!btn) return;
    const start = e => {
      e.preventDefault();
      initAudio();
      input[key] = true;
      btn.classList.add('pressed');
    };
    const end = e => {
      e.preventDefault();
      input[key] = false;
      btn.classList.remove('pressed');
    };
    btn.addEventListener('mousedown', start);
    btn.addEventListener('mouseup', end);
    btn.addEventListener('mouseleave', end);
    btn.addEventListener('touchstart', start, { passive: false });
    btn.addEventListener('touchend', end, { passive: false });
  }

  bindTouch('vBtnLeft', 'left');
  bindTouch('vBtnRight', 'right');
  bindTouch('vBtnGas', 'up');
  bindTouch('vBtnBrake', 'down');

  // Main Simulation Physics Loop
  let lastTime = performance.now();

  function updatePhysics(dt) {
    if (dt > 0.1) dt = 0.1; // clamp dt spikes

    // Inputs to normalized throttle and brake
    car.throttle = input.up ? 1.0 : 0.0;
    car.brake = input.down ? 1.0 : 0.0;
    car.handbrake = input.handbrake;

    // Steering input with speed-sensitive attenuation & auto-centering
    const maxSteer = (assistMode === 'easy')
      ? Math.max(0.24, 0.48 - (Math.abs(car.speed) / curCfg.maxSpeed) * 0.25)
      : (assistMode === 'sport')
      ? Math.max(0.22, 0.54 - (Math.abs(car.speed) / curCfg.maxSpeed) * 0.32)
      : Math.max(0.20, 0.58 - (Math.abs(car.speed) / curCfg.maxSpeed) * 0.38);

    let targetSteer = 0;
    if (input.left) targetSteer -= maxSteer;
    if (input.right) targetSteer += maxSteer;

    // Fast self-centering when releasing steering keys
    const steerSpeed = (targetSteer === 0 && assistMode === 'easy') ? 22 : 12;
    car.steerAngle += (targetSteer - car.steerAngle) * Math.min(1.0, steerSpeed * dt);

    // Forward vs Reverse logic
    if (car.speed < 0.5 && car.speed > -0.5 && input.down && !input.up) {
      car.isReverse = true;
    } else if (car.isReverse && input.up && !input.down) {
      car.isReverse = false;
    }

    // Engine Torque & Acceleration
    let driveForce = 0;
    const gearRatio = car.isReverse ? curCfg.reverseRatio : curCfg.gears[car.gearIdx];

    if (car.shiftTimer > 0) {
      car.shiftTimer -= dt;
      car.throttle = 0; // Cut torque during shift
    }

    if (!car.isReverse) {
      if (car.throttle > 0) {
        // Torque curve depending on vehicle
        let torqueMult = 1.0;
        if (curCfg.soundType === 'ice') {
          // V8 torque peaks in mid-high RPM
          const normRpm = car.rpm / curCfg.maxRpm;
          torqueMult = Math.sin(normRpm * Math.PI) * 1.2 + 0.3;
        } else if (curCfg.soundType === 'ev') {
          // EV torque instant 100% at 0 RPM, tapering off slightly at top speed
          torqueMult = 1.1 - (car.speed / curCfg.maxSpeed) * 0.35;
        }
        driveForce = car.throttle * (curCfg.accelForce / gearRatio) * torqueMult;

        // Traction Control (TCS): prevents wheelspin on launch
        if (assistMode === 'easy' && Math.abs(car.speed) < 15) {
          driveForce *= 1.08; // Smooth, surefooted acceleration
        }
      }
    } else {
      // Reversing
      driveForce = -car.brake * (curCfg.accelForce / gearRatio) * 0.45;
    }

    // Braking Force (ABS Active)
    let brakeDecel = 0;
    if (!car.isReverse && car.brake > 0) {
      const brakePower = (assistMode === 'easy') ? curCfg.brakeForce * 1.35 : curCfg.brakeForce;
      brakeDecel = (car.brake * brakePower) / curCfg.mass;
    }
    // EV One-pedal Regenerative Braking
    if (curCfg.soundType === 'ev' && car.throttle === 0 && car.brake === 0 && Math.abs(car.speed) > 1) {
      brakeDecel += 4.5; // Smooth regenerative deceleration
    }

    // Aerodynamic Drag & Rolling Resistance
    const dragCoeff = 0.40;
    const aeroDrag = 0.5 * dragCoeff * car.speed * Math.abs(car.speed);
    const rollingResistance = 12 * Math.sign(car.speed);

    // Longitudinal Acceleration
    const netForce = driveForce - (aeroDrag + rollingResistance);
    const accel = netForce / curCfg.mass - (car.speed > 0 ? brakeDecel : -brakeDecel);
    car.lonG = accel / 9.81;

    car.speed += accel * dt;

    // Cap at vehicle top speed
    if (car.speed > curCfg.maxSpeed) car.speed = curCfg.maxSpeed;
    if (car.speed < -curCfg.maxSpeed * 0.25) car.speed = -curCfg.maxSpeed * 0.25;

    // Engine RPM Calculation
    if (curCfg.soundType === 'ice') {
      const wheelRpm = (Math.abs(car.speed) / (0.33 * Math.PI * 2)) * 60;
      const targetRpm = wheelRpm * gearRatio * curCfg.finalDrive;
      car.rpm += (Math.max(curCfg.idleRpm, targetRpm) - car.rpm) * Math.min(1.0, 12 * dt);

      // Rev limiter bouncing
      if (car.rpm >= curCfg.maxRpm - 50) {
        car.rpm = curCfg.maxRpm - 120 + Math.random() * 80;
        playBackfirePop();
      }

      // Automatic Gear Shifting
      if (car.autoShift && !car.isReverse) {
        if (car.rpm > 6900 && car.gearIdx < curCfg.gears.length - 1) {
          car.gearIdx++;
          car.shiftTimer = 0.12;
          playBackfirePop();
        } else if (car.rpm < 2400 && car.gearIdx > 0 && car.speed > 3) {
          car.gearIdx--;
          car.shiftTimer = 0.1;
        }
      }
    } else if (curCfg.soundType === 'ev') {
      car.rpm = (Math.abs(car.speed) / curCfg.maxSpeed) * curCfg.maxRpm;
    } else {
      // Benz Patent 1886
      car.rpm = curCfg.idleRpm + (Math.abs(car.speed) / curCfg.maxSpeed) * (curCfg.maxRpm - curCfg.idleRpm);
    }

    // Vehicle Steering & Lateral Kinematics (Bicycle Model)
    const wheelbase = curCfg.length * 0.7;
    const yawRate = (car.speed / wheelbase) * Math.sin(car.steerAngle);
    car.heading += yawRate * dt;

    // Lateral Velocity & Drift/Slip
    const forwardX = Math.cos(car.heading);
    const forwardY = Math.sin(car.heading);
    const rightX = -Math.sin(car.heading);
    const rightY = Math.cos(car.heading);

    // Current velocity projection
    const targetVx = forwardX * car.speed;
    const targetVy = forwardY * car.speed;

    // Driving Assist Grip Factor
    let grip = curCfg.gripFactor;
    if (assistMode === 'easy') {
      grip *= 1.68; // Massive tire grip, effortless stability
    } else if (assistMode === 'sport') {
      grip *= 1.25;
    }

    // Intentional Drift: Handbrake breaks rear grip
    if (car.handbrake) {
      grip *= 0.32; // controlled slide
    }

    car.vx += (targetVx - car.vx) * Math.min(1.0, grip * 10 * dt);
    car.vy += (targetVy - car.vy) * Math.min(1.0, grip * 10 * dt);

    // Electronic Stability Program (ESP) Active Yaw Damping (Anti-Spin Program)
    if (assistMode === 'easy' && !car.handbrake && Math.abs(car.speed) > 2.0) {
      const currentVelAngle = Math.atan2(car.vy, car.vx);
      let angleDiff = currentVelAngle - car.heading;
      while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
      while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;

      // Automatically align heading with velocity to prevent any spin out!
      car.heading += angleDiff * Math.min(1.0, 7.8 * dt);
    }

    // Update position
    car.x += car.vx * dt * 25; // scale to world canvas units
    car.y += car.vy * dt * 25;

    // Bounds safety
    if (car.x < 100) car.x = 100;
    if (car.x > worldW - 100) car.x = worldW - 100;
    if (car.y < 100) car.y = 100;
    if (car.y > worldH - 100) car.y = worldH - 100;

    // Slip Angle & G-Force
    const currentVelocityAngle = Math.atan2(car.vy, car.vx);
    car.slipAngle = Math.abs(currentVelocityAngle - car.heading) % (Math.PI * 2);
    if (car.slipAngle > Math.PI) car.slipAngle = Math.PI * 2 - car.slipAngle;

    car.latG = (car.speed * yawRate) / 9.81;

    // Spawn Skid Marks & Smoke Particles during drift/hard braking
    const isSlipping = (car.slipAngle > 0.22 && Math.abs(car.speed) > 7) || car.handbrake || (car.brake > 0.6 && Math.abs(car.speed) > 15);

    if (isSlipping) {
      // Draw skid marks on persistent offscreen canvas
      skidCtx.strokeStyle = 'rgba(10, 10, 10, 0.45)';
      skidCtx.lineWidth = 6;
      skidCtx.beginPath();
      const rWheelOffset = 14;
      skidCtx.arc(car.x - forwardX * 18 + rightX * rWheelOffset, car.y - forwardY * 18 + rightY * rWheelOffset, 3, 0, Math.PI * 2);
      skidCtx.arc(car.x - forwardX * 18 - rightX * rWheelOffset, car.y - forwardY * 18 - rightY * rWheelOffset, 3, 0, Math.PI * 2);
      skidCtx.stroke();

      // Tire smoke
      if (Math.random() > 0.25) {
        tireParticles.push({
          x: car.x - forwardX * 20 + (Math.random() - 0.5) * 16,
          y: car.y - forwardY * 20 + (Math.random() - 0.5) * 16,
          vx: (Math.random() - 0.5) * 12,
          vy: (Math.random() - 0.5) * 12,
          life: 1.0,
          decay: Math.random() * 0.04 + 0.03,
          size: Math.random() * 12 + 8
        });
      }

      // Drift Score increment
      if (Math.abs(car.speed) > 12) {
        car.driftScore += Math.floor(car.slipAngle * 25);
        if (driftBadge && driftPtsDisplay) {
          driftBadge.classList.add('active');
          driftPtsDisplay.textContent = `+${car.driftScore} PTS`;
        }
      }
    } else {
      if (driftBadge && car.driftScore === 0) {
        driftBadge.classList.remove('active');
      }
    }

    // Checkpoints & Lap Timing
    const targetCp = checkpoints[currentCheckpoint];
    const distToCp = Math.hypot(car.x - targetCp.x, car.y - targetCp.y);
    if (distToCp < 180) {
      currentCheckpoint = (currentCheckpoint + 1) % checkpoints.length;
      if (currentCheckpoint === 0) {
        // Completed full lap!
        const lapTime = (performance.now() - lapStartTime) / 1000;
        lapStartTime = performance.now();
        if (!bestLapTime || lapTime < bestLapTime) {
          bestLapTime = lapTime;
          if (bestLapDisplay) {
            const m = Math.floor(bestLapTime / 60);
            const s = (bestLapTime % 60).toFixed(2);
            bestLapDisplay.textContent = `BEST: ${m.toString().padStart(2, '0')}:${s.padStart(5, '0')}`;
          }
        }
      }
    }

    // Audio Engine Realtime Modulation
    if (audioCtx && isAudioEnabled) {
      if (curCfg.soundType === 'ice') {
        const normRpm = car.rpm / curCfg.maxRpm;
        engineOsc1.frequency.setValueAtTime(32 + normRpm * 220, audioCtx.currentTime);
        engineOsc2.frequency.setValueAtTime(64 + normRpm * 440, audioCtx.currentTime);
        engineFilter.frequency.setValueAtTime(180 + normRpm * 950 + car.throttle * 400, audioCtx.currentTime);
        engineGain.gain.setValueAtTime(0.08 + car.throttle * 0.16, audioCtx.currentTime);
      } else if (curCfg.soundType === 'ev') {
        const evPitch = 160 + (Math.abs(car.speed) / curCfg.maxSpeed) * 950;
        engineOsc1.frequency.setValueAtTime(evPitch, audioCtx.currentTime);
        engineOsc2.frequency.setValueAtTime(evPitch * 1.5, audioCtx.currentTime);
        engineGain.gain.setValueAtTime(0.06 + (car.throttle + car.brake) * 0.12, audioCtx.currentTime);
      } else {
        // Benz pop frequency
        const benzPitch = 24 + (car.rpm / curCfg.maxRpm) * 90;
        engineOsc1.frequency.setValueAtTime(benzPitch, audioCtx.currentTime);
        engineOsc2.frequency.setValueAtTime(benzPitch * 2, audioCtx.currentTime);
        engineGain.gain.setValueAtTime(0.12, audioCtx.currentTime);
      }

      // Tire screech sound
      if (tireGain) {
        tireGain.gain.setValueAtTime(isSlipping ? Math.min(0.35, car.slipAngle * 0.6) : 0, audioCtx.currentTime);
      }
    }
  }

  // Update HUD Dashboard DOM Elements
  function updateHUD() {
    const kmh = Math.floor(Math.abs(car.speed) * 3.6);
    if (speedNum) speedNum.textContent = kmh;

    // Gear indicator
    if (gearDigit) {
      if (car.isReverse) {
        gearDigit.textContent = 'R';
        gearDigit.style.color = 'var(--speed-red)';
      } else if (kmh === 0 && car.throttle === 0) {
        gearDigit.textContent = 'P';
        gearDigit.style.color = 'var(--neon-cyan)';
      } else if (curCfg.soundType === 'ev') {
        gearDigit.textContent = 'D';
        gearDigit.style.color = 'var(--neon-cyan)';
      } else if (curCfg.soundType === 'benz') {
        gearDigit.textContent = '1';
        gearDigit.style.color = 'var(--amber-gold)';
      } else {
        gearDigit.textContent = car.gearIdx + 1;
        gearDigit.style.color = 'var(--amber-gold)';
      }
    }

    // RPM Bar & Text
    const rpmPercent = Math.min(100, (car.rpm / curCfg.maxRpm) * 100);
    if (tachFill) tachFill.style.width = `${rpmPercent}%`;
    if (rpmText) rpmText.textContent = `${Math.floor(car.rpm)} RPM`;

    // Shift LEDs
    const ledStep = 100 / shiftLeds.length;
    shiftLeds.forEach((led, i) => {
      if (led) {
        led.classList.toggle('lit', rpmPercent > (i + 1) * ledStep - 6);
      }
    });

    // G-Force Ball
    if (gforceDot) {
      const clampLat = Math.max(-1.5, Math.min(1.5, car.latG));
      const clampLon = Math.max(-1.5, Math.min(1.5, car.lonG));
      gforceDot.style.left = `${50 + clampLat * 30}%`;
      gforceDot.style.top = `${50 - clampLon * 30}%`;
    }
    if (latGVal) latGVal.textContent = `${car.latG.toFixed(1)} G`;
    if (lonGVal) lonGVal.textContent = `${car.lonG.toFixed(1)} G`;

    // Tire Slip Badges
    const isSlip = car.slipAngle > 0.25 || car.handbrake;
    Object.keys(tireBadges).forEach(k => {
      if (tireBadges[k]) {
        tireBadges[k].classList.toggle('slip', isSlip);
        tireBadges[k].textContent = isSlip ? `${k.toUpperCase()}: SLIP` : `${k.toUpperCase()}: 100%`;
      }
    });

    // Lap Timer
    if (lapTimeDisplay) {
      const elapsed = (performance.now() - lapStartTime) / 1000;
      const m = Math.floor(elapsed / 60);
      const s = (elapsed % 60).toFixed(2);
      lapTimeDisplay.textContent = `LAP: ${m.toString().padStart(2, '0')}:${s.padStart(5, '0')}`;
    }
  }

  // Draw Car Canvas Rendering
  function renderCar(renderCtx) {
    renderCtx.save();
    renderCtx.translate(car.x, car.y);
    renderCtx.rotate(car.heading);

    const w = curCfg.width;
    const l = curCfg.length;

    // Headlight Beams (Night vision on track)
    const beamGrad = renderCtx.createRadialGradient(l / 2, 0, 10, l / 2 + 160, 0, 180);
    beamGrad.addColorStop(0, 'rgba(255, 255, 255, 0.45)');
    beamGrad.addColorStop(0.4, 'rgba(0, 240, 255, 0.18)');
    beamGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');

    renderCtx.fillStyle = beamGrad;
    renderCtx.beginPath();
    renderCtx.moveTo(l / 2, -w / 2);
    renderCtx.lineTo(l / 2 + 200, -w * 2.2);
    renderCtx.lineTo(l / 2 + 200, w * 2.2);
    renderCtx.lineTo(l / 2, w / 2);
    renderCtx.closePath();
    renderCtx.fill();

    if (curCfg.isThreeWheeler) {
      // 1886 Benz Patent Motorwagen (Three-wheeler visual)
      // Chassis wood beam
      renderCtx.fillStyle = '#4a3728';
      renderCtx.fillRect(-l / 2, -4, l, 8);

      // Large rear wheels
      renderCtx.fillStyle = '#1e1b18';
      renderCtx.fillRect(-l / 2 + 4, -w / 2 - 4, 8, 4);
      renderCtx.fillRect(-l / 2 + 4, w / 2, 8, 4);

      // Large horizontal flywheel (spins with RPM)
      const flywheelAngle = (performance.now() / 1000) * (car.rpm / 60) * Math.PI * 2;
      renderCtx.save();
      renderCtx.translate(-4, 0);
      renderCtx.rotate(flywheelAngle);
      renderCtx.strokeStyle = '#d4af37'; // Brass
      renderCtx.lineWidth = 3;
      renderCtx.beginPath();
      renderCtx.arc(0, 0, 14, 0, Math.PI * 2);
      renderCtx.stroke();
      renderCtx.beginPath();
      renderCtx.moveTo(-14, 0);
      renderCtx.lineTo(14, 0);
      renderCtx.stroke();
      renderCtx.restore();

      // Front single steering wheel
      renderCtx.save();
      renderCtx.translate(l / 2 - 4, 0);
      renderCtx.rotate(car.steerAngle);
      renderCtx.fillStyle = '#1e1b18';
      renderCtx.fillRect(-4, -2, 8, 4);
      renderCtx.restore();

      // Bench Seat
      renderCtx.fillStyle = '#8b5a2b';
      renderCtx.fillRect(-12, -w / 3, 14, (w * 2) / 3);
    } else {
      // Modern Car Rendering (V8 GT / EV)
      // Car Shadow
      renderCtx.fillStyle = 'rgba(0, 0, 0, 0.6)';
      renderCtx.beginPath();
      renderCtx.roundRect(-l / 2 + 4, -w / 2 + 4, l, w, 8);
      renderCtx.fill();

      // 4 Wheels
      renderCtx.fillStyle = '#0f172a';
      // Front Left
      renderCtx.save();
      renderCtx.translate(l / 2 - 12, -w / 2);
      renderCtx.rotate(car.steerAngle);
      renderCtx.fillRect(-8, -4, 16, 7);
      renderCtx.restore();
      // Front Right
      renderCtx.save();
      renderCtx.translate(l / 2 - 12, w / 2);
      renderCtx.rotate(car.steerAngle);
      renderCtx.fillRect(-8, -3, 16, 7);
      renderCtx.restore();
      // Rear Left
      renderCtx.fillRect(-l / 2 + 6, -w / 2 - 4, 16, 7);
      // Rear Right
      renderCtx.fillRect(-l / 2 + 6, w / 2 - 3, 16, 7);

      // Car Body
      renderCtx.fillStyle = curCfg.bodyColor;
      renderCtx.beginPath();
      renderCtx.roundRect(-l / 2, -w / 2, l, w, [6, 12, 12, 6]);
      renderCtx.fill();

      // Roof / Glass Cockpit
      renderCtx.fillStyle = '#0c101a';
      renderCtx.beginPath();
      renderCtx.roundRect(-l / 6, -w / 2 + 3, l / 2, w - 6, 4);
      renderCtx.fill();

      // Windshield Highlight
      renderCtx.fillStyle = 'rgba(0, 240, 255, 0.4)';
      renderCtx.beginPath();
      renderCtx.moveTo(l / 3, -w / 2 + 4);
      renderCtx.lineTo(l / 3 + 6, -w / 2 + 4);
      renderCtx.lineTo(l / 3 + 2, w / 2 - 4);
      renderCtx.lineTo(l / 3 - 4, w / 2 - 4);
      renderCtx.closePath();
      renderCtx.fill();

      // Rear Spoiler (GT wing)
      renderCtx.fillStyle = '#0f172a';
      renderCtx.fillRect(-l / 2 - 2, -w / 2 + 1, 4, w - 2);

      // Taillights
      const isBraking = car.brake > 0 || car.handbrake;
      renderCtx.fillStyle = isBraking ? '#ff0033' : '#aa1122';
      renderCtx.shadowColor = isBraking ? '#ff0033' : 'transparent';
      renderCtx.shadowBlur = isBraking ? 15 : 0;
      renderCtx.fillRect(-l / 2, -w / 2 + 2, 2, 6);
      renderCtx.fillRect(-l / 2, w / 2 - 8, 2, 6);
      renderCtx.shadowBlur = 0;
    }

    renderCtx.restore();
  }

  // Draw Minimap Widget
  function renderMinimap() {
    if (!miniCtx) return;
    const mw = (minimapCanvas.width = minimapCanvas.offsetWidth);
    const mh = (minimapCanvas.height = minimapCanvas.offsetHeight);

    miniCtx.clearRect(0, 0, mw, mh);
    miniCtx.fillStyle = 'rgba(7, 9, 14, 0.9)';
    miniCtx.fillRect(0, 0, mw, mh);

    const scaleX = mw / worldW;
    const scaleY = mh / worldH;

    // Draw track path
    miniCtx.strokeStyle = 'rgba(255, 255, 255, 0.35)';
    miniCtx.lineWidth = 3;
    miniCtx.beginPath();
    trackWaypoints.forEach((pt, i) => {
      if (i === 0) miniCtx.moveTo(pt.x * scaleX, pt.y * scaleY);
      else miniCtx.lineTo(pt.x * scaleX, pt.y * scaleY);
    });
    miniCtx.closePath();
    miniCtx.stroke();

    // Draw car dot
    miniCtx.fillStyle = curCfg.bodyColor;
    miniCtx.beginPath();
    miniCtx.arc(car.x * scaleX, car.y * scaleY, 4, 0, Math.PI * 2);
    miniCtx.fill();
    miniCtx.strokeStyle = '#fff';
    miniCtx.lineWidth = 1;
    miniCtx.stroke();
  }

  // Main Render Loop
  function gameLoop(time) {
    const dt = (time - lastTime) / 1000;
    lastTime = time;

    updatePhysics(dt);
    updateHUD();

    // Clear Canvas
    ctx.clearRect(0, 0, viewW, viewH);

    // Camera follow smoothing
    const camX = car.x - viewW / 2;
    const camY = car.y - viewH / 2;

    ctx.save();
    ctx.translate(-camX, -camY);

    // 1. Draw pre-rendered background track
    ctx.drawImage(bgCanvas, 0, 0);

    // 2. Draw persistent skid marks
    ctx.drawImage(skidCanvas, 0, 0);

    // 3. Draw tire smoke particles
    for (let i = tireParticles.length - 1; i >= 0; i--) {
      const p = tireParticles[i];
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= p.decay;
      p.size += 15 * dt;

      if (p.life <= 0) {
        tireParticles.splice(i, 1);
        continue;
      }

      ctx.fillStyle = `rgba(220, 225, 235, ${p.life * 0.4})`;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Draw Vehicle
    renderCar(ctx);

    ctx.restore();

    // 5. Draw Minimap
    renderMinimap();

    requestAnimationFrame(gameLoop);
  }

  // Start Simulation Loop
  requestAnimationFrame(gameLoop);
}
