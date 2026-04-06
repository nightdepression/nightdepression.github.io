window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.classList.add('hidden');
  setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
});

// Пуск и часики
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');

startButton.addEventListener('click', () => {
  if (startMenu.classList.contains('show')) {
    startMenu.classList.remove('show');
  } else {
    startMenu.classList.add('show');
  }
});


const clockElement = document.getElementById('clock');

// Функция обновления времени
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString('ru-RU', {
    hour: '2-digit',
    minute: '2-digit'
  });

  clockElement.textContent = timeString;
};

updateClock();
setInterval(updateClock, 30000);

// Animated Spiderweb Background Logic using Canvas and Anime.js
const bgCanvas = document.getElementById('bgCanvas');
const bgCtx = bgCanvas.getContext('2d');
let points = [];
let reqAnimFrame;

function initAnimatedBg() {
  resizeBgCanvas();
  window.addEventListener('resize', resizeBgCanvas);

  points = [];
  const numPoints = Math.floor((window.innerWidth * window.innerHeight) / 10000);
  for (let i = 0; i < numPoints; i++) {
    points.push({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 1,
      vy: (Math.random() - 0.5) * 1,
      radius: Math.random() * 2 + 1
    });
  }
  if (!reqAnimFrame) {
    animateBg();
  }
}

function resizeBgCanvas() {
  bgCanvas.width = window.innerWidth;
  bgCanvas.height = window.innerHeight;
}

function animateBg() {
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);

  // Update & Draw points
  bgCtx.fillStyle = 'rgba(255, 111, 241, 0.8)';
  points.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;

    if (p.x < 0 || p.x > bgCanvas.width) p.vx *= -1;
    if (p.y < 0 || p.y > bgCanvas.height) p.vy *= -1;

    bgCtx.beginPath();
    bgCtx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
    bgCtx.fill();
  });

  // Draw lines (spiderweb)
  bgCtx.lineWidth = 0.5;
  for (let i = 0; i < points.length; i++) {
    for (let j = i + 1; j < points.length; j++) {
      const dist = Math.hypot(points[i].x - points[j].x, points[i].y - points[j].y);
      if (dist < 120) {
        bgCtx.strokeStyle = `rgba(255, 255, 255, ${1 - dist / 120})`;
        bgCtx.beginPath();
        bgCtx.moveTo(points[i].x, points[i].y);
        bgCtx.lineTo(points[j].x, points[j].y);
        bgCtx.stroke();
      }
    }
  }

  reqAnimFrame = requestAnimationFrame(animateBg);
}

function stopAnimatedBg() {
  if (reqAnimFrame) {
    cancelAnimationFrame(reqAnimFrame);
    reqAnimFrame = null;
  }
  bgCtx.clearRect(0, 0, bgCanvas.width, bgCanvas.height);
  window.removeEventListener('resize', resizeBgCanvas);
}

// Background / Personalization Logic
const images = ['backgrounds/main.jpg', 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=2070', 'https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=2070'];
const videos = ['backgrounds/1.mp4', 'backgrounds/2.mp4', 'https://cdn.pixabay.com/video/2021/08/04/83866-584742681_tiny.mp4'];

let currentBgMode = 'spiderweb'; // 'spiderweb', 'image', 'video'
let currentMediaIndex = 0;
const backgroundLayer = document.getElementById('backgroundLayer');
let activeMediaElement = null;

function setBgMode(mode, btnElement) {
  currentBgMode = mode;

  // Update Buttons
  document.querySelectorAll('.pers-btn').forEach(btn => btn.classList.remove('active'));
  if (btnElement) btnElement.classList.add('active');

  const mediaControls = document.getElementById('persMediaControls');

  if (mode === 'spiderweb') {
    mediaControls.style.display = 'none';
    if (activeMediaElement) {
      activeMediaElement.classList.remove('fade-in');
      setTimeout(() => { if (activeMediaElement) activeMediaElement.remove(); activeMediaElement = null; }, 1000);
    }
    initAnimatedBg();
  } else {
    mediaControls.style.display = 'block';
    stopAnimatedBg();
    currentMediaIndex = 0;
    renderMediaBackground();
  }
}

function changeMediaBackground() {
  if (currentBgMode === 'image') {
    currentMediaIndex = (currentMediaIndex + 1) % images.length;
  } else if (currentBgMode === 'video') {
    currentMediaIndex = (currentMediaIndex + 1) % videos.length;
  }
  renderMediaBackground();
}

function renderMediaBackground() {
  const oldElement = activeMediaElement;

  let newElement;
  if (currentBgMode === 'image') {
    newElement = document.createElement('img');
    newElement.src = images[currentMediaIndex];
  } else {
    newElement = document.createElement('video');
    newElement.src = videos[currentMediaIndex];
    newElement.autoplay = true;
    newElement.loop = true;
    newElement.muted = true;
  }
  newElement.className = 'bg-media';
  backgroundLayer.appendChild(newElement);

  // Fade in new
  setTimeout(() => newElement.classList.add('fade-in'), 50);
  activeMediaElement = newElement;

  // Cleanup old
  if (oldElement) {
    oldElement.classList.remove('fade-in');
    setTimeout(() => {
      try { backgroundLayer.removeChild(oldElement); } catch(e){}
    }, 1000);
  }
}

// Init default
initAnimatedBg();

// Expose to window for inline onclick handlers
window.setBgMode = setBgMode;
window.changeMediaBackground = changeMediaBackground;

// Personalize action from Context Menu
const personalizeWindow = document.getElementById('personalizeWindow');

// Context Menu Logic
const desktopArea = document.getElementById('desktopArea');
const contextMenu = document.getElementById('desktopContextMenu');
const contextRefresh = document.getElementById('contextRefresh');
const contextPersonalize = document.getElementById('contextPersonalize');
const contextCreateDoc = document.getElementById('contextCreateDoc');

// Keep track of right-click position for new doc
let lastRightClickX = 0;
let lastRightClickY = 0;

// Icon Dragging & Persistence Logic
function makeIconDraggable(icon) {
  let isDragging = false;
  let offsetX, offsetY;

  icon.addEventListener('mousedown', (e) => {
    isDragging = true;
    offsetX = e.clientX - icon.offsetLeft;
    offsetY = e.clientY - icon.offsetTop;
    icon.style.zIndex = 10; // Bring to front while dragging
  });

  icon.addEventListener('touchstart', (e) => {
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - icon.offsetLeft;
    offsetY = touch.clientY - icon.offsetTop;
    icon.style.zIndex = 10;
  }, { passive: true });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    icon.style.left = (e.clientX - offsetX) + 'px';
    icon.style.top = (e.clientY - offsetY) + 'px';
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const touch = e.touches[0];
    icon.style.left = (touch.clientX - offsetX) + 'px';
    icon.style.top = (touch.clientY - offsetY) + 'px';
  }, { passive: false });

  const savePosition = () => {
    if (!isDragging) return;
    isDragging = false;
    icon.style.zIndex = '';

    // Save to localStorage
    if (icon.id) {
      localStorage.setItem(`iconPos_${icon.id}`, JSON.stringify({
        left: icon.style.left,
        top: icon.style.top
      }));
    }
  };

  document.addEventListener('mouseup', savePosition);
  document.addEventListener('touchend', savePosition);

  // Restore position on load
  if (icon.id) {
    const saved = localStorage.getItem(`iconPos_${icon.id}`);
    if (saved) {
      try {
        const { left, top } = JSON.parse(saved);
        icon.style.left = left;
        icon.style.top = top;
      } catch (e) {}
    }
  }
}

document.querySelectorAll('.desktop-icon').forEach(makeIconDraggable);

// Show context menu
desktopArea.addEventListener('contextmenu', (e) => {
  e.preventDefault();

  // Position the menu
  let x = e.clientX;
  let y = e.clientY;

  lastRightClickX = x;
  lastRightClickY = y;

  // Make sure menu doesn't go off-screen
  if (x + 250 > window.innerWidth) x -= 250;
  if (y + 200 > window.innerHeight) y -= 200;

  contextMenu.style.left = `${x}px`;
  contextMenu.style.top = `${y}px`;
  contextMenu.classList.add('show');
});

// Hide menu on click elsewhere
document.addEventListener('click', () => {
  if (contextMenu.classList.contains('show')) {
    contextMenu.classList.remove('show');
  }
});

// Refresh action
contextRefresh.addEventListener('click', () => {
  // Just show loader for a split second to simulate refresh
  const loader = document.getElementById('loader');
  loader.style.display = 'flex';
  loader.classList.remove('hidden');
  setTimeout(() => {
    loader.classList.add('hidden');
    setTimeout(() => {
      loader.style.display = 'none';
    }, 500);
  }, 300);
});

// Personalize action
contextPersonalize.addEventListener('click', () => {
  openWindow(personalizeWindow);
});

// Create Document action
let docCounter = 1;
contextCreateDoc.addEventListener('click', () => {
  const docName = `Новый текстовый документ (${docCounter}).txt`;
  docCounter++;

  // Create icon
  const newIcon = document.createElement('div');
  newIcon.className = 'desktop-icon dynamic-doc';
  newIcon.id = `docIcon_${docCounter}`;
  newIcon.style.top = `${lastRightClickY}px`;
  newIcon.style.left = `${lastRightClickX}px`;

  const iconImg = document.createElement('i');
  iconImg.className = 'fa-solid fa-file-lines';
  newIcon.appendChild(iconImg);

  const iconText = document.createElement('span');
  iconText.textContent = docName;
  newIcon.appendChild(iconText);

  desktopArea.appendChild(newIcon);
  makeIconDraggable(newIcon);

  // Clone Notepad template to create unique window
  const notepadTemplate = document.getElementById('notepadTemplate');
  const newNotepad = notepadTemplate.cloneNode(true);
  const newId = `notepad_${docCounter}`;
  newNotepad.id = newId;
  newNotepad.querySelector('.doc-title').textContent = docName;

  // Append to body (or desktop)
  document.querySelector('.desktop').appendChild(newNotepad);

  // Make it draggable
  makeDraggable(newNotepad);

  // Bind double click to open this specific document
  addDoubleClickAction(newIcon, () => {
    openWindow(newNotepad);
    newNotepad.querySelector('textarea').focus();
  });
});

// Плеер
// Массив треков
const tracks = [
  {
    title: 'По переходам',
    artist: 'f0lk',
    cover: 'https://t2.genius.com/unsafe/340x340/https%3A%2F%2Fimages.genius.com%2F77d7909d5bd0f16c2cdde0805e9830ec.1000x1000x1.jpg',
    url: 'music/f0lk - transitions.mp3'
  },
  {
    title: 'Тысячи',
    artist: 'H8.HOOD',
    cover: 'https://t2.genius.com/unsafe/340x340/https%3A%2F%2Fimages.genius.com%2Fdc9cfa81e5a375815702b0dc79324107.1000x1000x1.jpg',
    url: 'music/H8.HOOD - Thousands.mp3'
  },
  {
    title: 'Где ты',
    artist: 'f0lk',
    cover: 'https://t2.genius.com/unsafe/340x340/https%3A%2F%2Fimages.genius.com%2F897c7666c84db03f71b320bfe7d77e7d.1000x1000x1.jpg',
    url: 'music/f0lk - where are you.mp3'
  }
];

// Индексы и состояние
let currentTrackIndex = 0;
let isPlaying = false;
let isShuffle = false;
let isRepeat = false;

// Window Dragging Logic
let zIndexCounter = 100;

function makeDraggable(windowEl) {
  const header = windowEl.querySelector('.window-header');
  let isDragging = false;
  let offsetX, offsetY;

  // Bring to front on mousedown anywhere on window
  windowEl.addEventListener('mousedown', () => {
    zIndexCounter++;
    windowEl.style.zIndex = zIndexCounter;
  });
  windowEl.addEventListener('touchstart', () => {
    zIndexCounter++;
    windowEl.style.zIndex = zIndexCounter;
  }, { passive: true });

  header.addEventListener('mousedown', (e) => {
    // Prevent dragging if clicking on window controls
    if (e.target.closest('.window-controls')) return;

    isDragging = true;
    offsetX = e.clientX - windowEl.offsetLeft;
    offsetY = e.clientY - windowEl.offsetTop;
    document.body.style.userSelect = 'none'; // Prevent text selection
  });

  header.addEventListener('touchstart', (e) => {
    if (e.target.closest('.window-controls')) return;
    isDragging = true;
    const touch = e.touches[0];
    offsetX = touch.clientX - windowEl.offsetLeft;
    offsetY = touch.clientY - windowEl.offsetTop;
    document.body.style.userSelect = 'none';
  }, { passive: true });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    windowEl.style.left = (e.clientX - offsetX) + 'px';
    windowEl.style.top = (e.clientY - offsetY) + 'px';
  });

  document.addEventListener('touchmove', (e) => {
    if (!isDragging) return;
    e.preventDefault(); // Prevent scrolling while dragging
    const touch = e.touches[0];
    windowEl.style.left = (touch.clientX - offsetX) + 'px';
    windowEl.style.top = (touch.clientY - offsetY) + 'px';
  }, { passive: false });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  document.addEventListener('touchend', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  // Window Controls
  const closeBtn = windowEl.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      windowEl.style.display = 'none';
      windowEl.classList.remove('is-open'); // Mark as actually closed
      updateTaskbar();
    });
  }

  const minimizeBtn = windowEl.querySelector('.minimize-btn');
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      windowEl.style.display = 'none'; // Simple minimize behavior for now
      // Don't remove 'is-open', just let display be none, so taskbar knows it's minimized
      updateTaskbar();
    });
  }

  const maximizeBtn = windowEl.querySelector('.maximize-btn');
  if (maximizeBtn) {
    maximizeBtn.addEventListener('click', () => {
      if (windowEl.classList.contains('maximized')) {
        windowEl.classList.remove('maximized');
        windowEl.style.top = windowEl.dataset.prevTop;
        windowEl.style.left = windowEl.dataset.prevLeft;
        windowEl.style.width = windowEl.dataset.prevWidth;
        windowEl.style.height = windowEl.dataset.prevHeight;
      } else {
        // Save current dimensions
        windowEl.dataset.prevTop = windowEl.style.top || windowEl.offsetTop + 'px';
        windowEl.dataset.prevLeft = windowEl.style.left || windowEl.offsetLeft + 'px';
        windowEl.dataset.prevWidth = windowEl.style.width || windowEl.offsetWidth + 'px';
        windowEl.dataset.prevHeight = windowEl.style.height || windowEl.offsetHeight + 'px';

        windowEl.classList.add('maximized');
        windowEl.style.top = '0px';
        windowEl.style.left = '0px';
        windowEl.style.width = '100vw';
        // Height should be 100vh - taskbar height (50px)
        windowEl.style.height = 'calc(100vh - 50px)';
      }
    });
  }
}

// Initialize dragging for all glass windows
document.querySelectorAll('.glass-window').forEach(makeDraggable);

// Taskbar icons container
const centerIconsContainer = document.querySelector('.center-icons');

// Helper function to update taskbar based on open windows
function updateTaskbar() {
  centerIconsContainer.innerHTML = '';
  const openWindows = Array.from(document.querySelectorAll('.glass-window')).filter(win => win.classList.contains('is-open'));

  openWindows.forEach(win => {
    // Determine icon based on window ID or content
    let iconClass = 'fa-solid fa-window-maximize';
    if (win.id === 'musicWindow') iconClass = 'fa-solid fa-music';
    else if (win.id === 'aboutMeWindow') iconClass = 'fa-solid fa-user';
    else if (win.id === 'skillsWindow') iconClass = 'fa-solid fa-code';
    else if (win.id === 'terminalWindow') iconClass = 'fa-solid fa-terminal';

    const taskbarIcon = document.createElement('div');
    taskbarIcon.className = 'icon taskbar-app-icon active-app';
    taskbarIcon.innerHTML = `<i class="${iconClass}"></i>`;

    // Clicking taskbar icon toggles window
    taskbarIcon.addEventListener('click', () => {
      // If it's the topmost window, minimize it
      if (win.style.display !== 'none' && win.style.zIndex == zIndexCounter) {
        win.style.display = 'none';
        taskbarIcon.classList.remove('active-app');
      } else {
        // Bring to front and show
        win.style.display = 'flex';
        zIndexCounter++;
        win.style.zIndex = zIndexCounter;
        taskbarIcon.classList.add('active-app');
      }
    });

    // If it's currently hidden (minimized), don't show the active underline
    if (win.style.display === 'none') {
        taskbarIcon.classList.remove('active-app');
    }

    centerIconsContainer.appendChild(taskbarIcon);
  });
}

// Show window function
function openWindow(windowEl) {
  windowEl.style.display = 'flex';
  windowEl.classList.add('is-open');
  zIndexCounter++;
  windowEl.style.zIndex = zIndexCounter;
  updateTaskbar();
}

// Start menu bindings
document.getElementById('startTerminal').addEventListener('click', () => {
  openWindow(terminalWindow);
  document.getElementById('terminalInput').focus();
  document.getElementById('startMenu').classList.remove('show');
});
document.getElementById('startAbout').addEventListener('click', () => {
  openWindow(aboutMeWindow);
  document.getElementById('startMenu').classList.remove('show');
});
document.getElementById('startSkills').addEventListener('click', () => {
  openWindow(skillsWindow);
  document.getElementById('startMenu').classList.remove('show');
});
document.getElementById('startMusic').addEventListener('click', () => {
  openWindow(musicWindow);
  loadTrack(currentTrackIndex);
  document.getElementById('startMenu').classList.remove('show');
});

// Windows
const aboutMeWindow = document.getElementById('aboutMeWindow');
const skillsWindow = document.getElementById('skillsWindow');
const musicWindow = document.getElementById('musicWindow');
const terminalWindow = document.getElementById('terminalWindow');
const browserWindow = document.getElementById('browserWindow');
const calcWindow = document.getElementById('calcWindow');
const contactsWindow = document.getElementById('contactsWindow');
const paintWindow = document.getElementById('paintWindow');
const snakeWindow = document.getElementById('snakeWindow');

// Icons
const aboutMeIcon = document.getElementById('aboutMeIcon');
const skillsIcon = document.getElementById('skillsIcon');
const terminalIcon = document.getElementById('terminalIcon');
const browserIcon = document.getElementById('browserIcon');
const calcIcon = document.getElementById('calcIcon');
const contactsIcon = document.getElementById('contactsIcon');
const paintIcon = document.getElementById('paintIcon');
const snakeIcon = document.getElementById('snakeIcon');

// Helper for touch-friendly double clicks
function addDoubleClickAction(element, callback) {
  element.addEventListener('dblclick', callback);

  let lastTap = 0;
  element.addEventListener('touchend', (e) => {
    const currentTime = new Date().getTime();
    const tapLength = currentTime - lastTap;
    if (tapLength < 500 && tapLength > 0) {
      e.preventDefault();
      callback();
    }
    lastTap = currentTime;
  });
}

// Icon Clicks
addDoubleClickAction(aboutMeIcon, () => openWindow(aboutMeWindow));
addDoubleClickAction(skillsIcon, () => openWindow(skillsWindow));
addDoubleClickAction(terminalIcon, () => {
  openWindow(terminalWindow);
  document.getElementById('terminalInput').focus();
});
addDoubleClickAction(browserIcon, () => openWindow(browserWindow));
addDoubleClickAction(calcIcon, () => openWindow(calcWindow));
addDoubleClickAction(contactsIcon, () => openWindow(contactsWindow));
addDoubleClickAction(paintIcon, () => {
  openWindow(paintWindow);
  initPaint();
});
addDoubleClickAction(snakeIcon, () => openWindow(snakeWindow));

// Browser Logic
document.getElementById('browserUrl').addEventListener('keydown', function(e) {
  if (e.key === 'Enter') {
    let url = this.value.trim();
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    document.getElementById('browserFrame').src = url;
  }
});

// Paint Logic
function initPaint() {
  const canvas = document.getElementById('paintCanvas');
  if (canvas.dataset.initialized) return; // Only init once
  canvas.dataset.initialized = 'true';

  const ctx = canvas.getContext('2d');
  const colorPicker = document.getElementById('paintColor');
  const sizePicker = document.getElementById('paintSize');
  const clearBtn = document.getElementById('paintClear');
  const eraserBtn = document.getElementById('paintEraser');

  // Resize canvas to fit container
  function resizeCanvas() {
    canvas.width = canvas.parentElement.clientWidth;
    canvas.height = canvas.parentElement.clientHeight - 40; // Minus top bar height approx
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // Call once then hook onto resize
  setTimeout(resizeCanvas, 100); // small delay to ensure window is visible

  let isDrawing = false;
  let isErasing = false;
  let lastX = 0;
  let lastY = 0;

  function startPosition(e) {
    isDrawing = true;
    draw(e);
  }

  function endPosition() {
    isDrawing = false;
    ctx.beginPath();
  }

  function draw(e) {
    if (!isDrawing) return;
    e.preventDefault();

    let clientX, clientY;
    if (e.type.includes('touch')) {
      const rect = canvas.getBoundingClientRect();
      clientX = e.touches[0].clientX - rect.left;
      clientY = e.touches[0].clientY - rect.top;
    } else {
      clientX = e.offsetX;
      clientY = e.offsetY;
    }

    ctx.lineWidth = sizePicker.value;
    ctx.lineCap = 'round';
    ctx.strokeStyle = isErasing ? '#ffffff' : colorPicker.value;

    ctx.lineTo(clientX, clientY);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(clientX, clientY);
  }

  canvas.addEventListener('mousedown', startPosition);
  canvas.addEventListener('mouseup', endPosition);
  canvas.addEventListener('mousemove', draw);
  canvas.addEventListener('mouseout', endPosition);

  canvas.addEventListener('touchstart', startPosition, { passive: false });
  canvas.addEventListener('touchend', endPosition);
  canvas.addEventListener('touchmove', draw, { passive: false });

  clearBtn.addEventListener('click', () => {
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  });

  eraserBtn.addEventListener('click', () => {
    isErasing = !isErasing;
    eraserBtn.style.background = isErasing ? '#bbb' : '#ddd';
  });

  colorPicker.addEventListener('change', () => {
    isErasing = false;
    eraserBtn.style.background = '#ddd';
  });
}

// Snake Logic
const snakeCanvas = document.getElementById('snakeCanvas');
const snakeCtx = snakeCanvas.getContext('2d');
const box = 20;
let snake = [];
let snakeFood;
let snakeScore = 0;
let snakeDirection;
let snakeGameLoop;

function initSnake() {
  snake = [];
  snake[0] = { x: 9 * box, y: 10 * box };

  snakeFood = {
    x: Math.floor(Math.random() * 19) * box,
    y: Math.floor(Math.random() * 19) * box
  };

  snakeScore = 0;
  document.getElementById('snakeScore').textContent = snakeScore;
  snakeDirection = null;
  document.getElementById('snakeOverlay').style.display = 'none';

  if (snakeGameLoop) clearInterval(snakeGameLoop);
  snakeGameLoop = setInterval(drawSnake, 100);
}

document.getElementById('snakeStartBtn').addEventListener('click', initSnake);

document.addEventListener('keydown', direction);

function direction(event) {
  if (event.keyCode == 37 && snakeDirection != 'RIGHT') {
    snakeDirection = 'LEFT';
  } else if (event.keyCode == 38 && snakeDirection != 'DOWN') {
    snakeDirection = 'UP';
  } else if (event.keyCode == 39 && snakeDirection != 'LEFT') {
    snakeDirection = 'RIGHT';
  } else if (event.keyCode == 40 && snakeDirection != 'UP') {
    snakeDirection = 'DOWN';
  }
}

function collision(head, array) {
  for (let i = 0; i < array.length; i++) {
    if (head.x == array[i].x && head.y == array[i].y) {
      return true;
    }
  }
  return false;
}

function drawSnake() {
  snakeCtx.fillStyle = '#000';
  snakeCtx.fillRect(0, 0, snakeCanvas.width, snakeCanvas.height);

  for (let i = 0; i < snake.length; i++) {
    snakeCtx.fillStyle = (i == 0) ? '#FF6FF1' : '#fff';
    snakeCtx.fillRect(snake[i].x, snake[i].y, box, box);
    snakeCtx.strokeStyle = '#000';
    snakeCtx.strokeRect(snake[i].x, snake[i].y, box, box);
  }

  snakeCtx.fillStyle = 'red';
  snakeCtx.fillRect(snakeFood.x, snakeFood.y, box, box);

  let snakeX = snake[0].x;
  let snakeY = snake[0].y;

  if (snakeDirection == 'LEFT') snakeX -= box;
  if (snakeDirection == 'UP') snakeY -= box;
  if (snakeDirection == 'RIGHT') snakeX += box;
  if (snakeDirection == 'DOWN') snakeY += box;

  if (snakeX == snakeFood.x && snakeY == snakeFood.y) {
    snakeScore++;
    document.getElementById('snakeScore').textContent = snakeScore;
    snakeFood = {
      x: Math.floor(Math.random() * 19) * box,
      y: Math.floor(Math.random() * 19) * box
    };
  } else {
    snake.pop();
  }

  let newHead = { x: snakeX, y: snakeY };

  if (snakeX < 0 || snakeX >= snakeCanvas.width || snakeY < 0 || snakeY >= snakeCanvas.height || collision(newHead, snake)) {
    clearInterval(snakeGameLoop);
    document.getElementById('snakeOverlay').style.display = 'flex';
    document.getElementById('snakeOverlay').querySelector('h2').textContent = 'GAME OVER';
  }

  snake.unshift(newHead);
}

// Calculator Logic
let calcDisplayValue = '0';
let calcFirstOperand = null;
let calcWaitingForSecondOperand = false;
let calcOperator = null;

const calcDisplay = document.getElementById('calcDisplay');

function updateCalcDisplay() {
  calcDisplay.textContent = calcDisplayValue;
}

function calcAction(val) {
  if (['+', '-', '*', '/'].includes(val)) {
    handleOperator(val);
  } else if (val === '=') {
    handleOperator(val);
  } else if (val === 'C') {
    calcDisplayValue = '0';
    calcFirstOperand = null;
    calcWaitingForSecondOperand = false;
    calcOperator = null;
  } else if (val === '±') {
    calcDisplayValue = String(-parseFloat(calcDisplayValue));
  } else if (val === '%') {
    calcDisplayValue = String(parseFloat(calcDisplayValue) / 100);
  } else if (val === '.') {
    if (!calcDisplayValue.includes('.')) {
      calcDisplayValue += '.';
    }
  } else {
    // Digits
    if (calcWaitingForSecondOperand) {
      calcDisplayValue = val;
      calcWaitingForSecondOperand = false;
    } else {
      calcDisplayValue = calcDisplayValue === '0' ? val : calcDisplayValue + val;
    }
  }
  updateCalcDisplay();
}

function handleOperator(nextOperator) {
  const inputValue = parseFloat(calcDisplayValue);

  if (calcOperator && calcWaitingForSecondOperand) {
    calcOperator = nextOperator;
    return;
  }

  if (calcFirstOperand == null && !isNaN(inputValue)) {
    calcFirstOperand = inputValue;
  } else if (calcOperator) {
    const result = calculate(calcFirstOperand, inputValue, calcOperator);
    calcDisplayValue = String(Number(result.toFixed(7))); // Fix floating point issues
    calcFirstOperand = result;
  }

  calcWaitingForSecondOperand = true;
  calcOperator = nextOperator;
}

function calculate(first, second, operator) {
  if (operator === '+') return first + second;
  if (operator === '-') return first - second;
  if (operator === '*') return first * second;
  if (operator === '/') return first / second;
  return second;
}

// Ensure globally accessible
window.calcAction = calcAction;

// Terminal Logic
const terminalInput = document.getElementById('terminalInput');
const terminalOutput = document.getElementById('terminalOutput');
const terminalContent = document.getElementById('terminalContent');

terminalInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') {
    const cmd = terminalInput.value.trim();
    const cmdLower = cmd.toLowerCase();

    // Echo command
    const promptLine = document.createElement('div');
    const promptPrefix = document.createElement('span');
    promptPrefix.textContent = 'C:\\Users\\Riin> ';
    promptLine.appendChild(promptPrefix);
    const cmdText = document.createTextNode(cmd);
    promptLine.appendChild(cmdText);
    terminalOutput.appendChild(promptLine);

    // Process command
    if (cmdLower === 'help') {
      appendOutput('Available commands:');
      appendOutput('  help   - Show this help message');
      appendOutput('  clear  - Clear the terminal screen');
      appendOutput('  whoami - Display current user');
      appendOutput('  date   - Show current date and time');
      appendOutput('  echo   - Print text to the terminal');
    } else if (cmdLower === 'clear') {
      terminalOutput.innerHTML = '';
    } else if (cmdLower === 'whoami') {
      appendOutput('Riin');
    } else if (cmdLower === 'date') {
      appendOutput(new Date().toString());
    } else if (cmdLower.startsWith('echo ')) {
      appendOutput(cmd.substring(5));
    } else if (cmdLower !== '') {
      appendOutput(`'${cmd}' is not recognized as an internal or external command, operable program or batch file.`);
    }

    // Scroll to bottom
    terminalContent.scrollTop = terminalContent.scrollHeight;

    // Clear input
    terminalInput.value = '';

    // Reattach input line at the bottom
    terminalContent.appendChild(document.getElementById('terminalInputLine'));
  }
});

function appendOutput(text) {
  const line = document.createElement('div');
  line.textContent = text;
  terminalOutput.appendChild(line);
}

// Focus input when clicking anywhere in terminal
terminalContent.addEventListener('click', () => {
  terminalInput.focus();
});

// DOM-элементы плеера
const musicPlayerIcon = document.getElementById('musicPlayerIcon');

const trackTitle = document.getElementById('trackTitle');
const trackArtist = document.getElementById('trackArtist');
const trackCover = document.getElementById('trackCover');

const playPauseBtn = document.getElementById('playPause');
const prevTrackBtn = document.getElementById('prevTrack');
const nextTrackBtn = document.getElementById('nextTrack');

const shuffleBtn = document.getElementById('shuffleBtn');
const repeatBtn = document.getElementById('repeatBtn');

const currentTimeEl = document.getElementById('currentTime');
const totalTimeEl  = document.getElementById('totalTime');
const progressBar = document.getElementById('progressBar');
const progressFilled = document.getElementById('progressFilled');

const volumeContainer = document.getElementById('volumeContainer');
const volumeFilled = document.getElementById('volumeFilled');

// Создаём один Audio-объект
const audio = new Audio();
audio.volume = 0.3;  // стартовая громкость

// Показать окно плеера по клику
addDoubleClickAction(musicPlayerIcon, () => {
  openWindow(musicWindow);
  loadTrack(currentTrackIndex);
});

// Загрузить трек
function loadTrack(index) {
  const track = tracks[index];
  audio.src = track.url;

  trackTitle.textContent = track.title;
  trackArtist.textContent = track.artist || '';
  trackCover.src = track.cover || 'https://t2.genius.com/unsafe/340x340/https%3A%2F%2Fimages.genius.com%2Fdc9cfa81e5a375815702b0dc79324107.1000x1000x1.jpg';

  // Если играет, продолжаем
  if (isPlaying) {
    audio.play();
  }
}

// Воспроизведение/пауза
function playTrack() {
  audio.play();
  isPlaying = true;
  playPauseBtn.querySelector('i').classList.remove('fa-play');
  playPauseBtn.querySelector('i').classList.add('fa-pause');
}
function pauseTrack() {
  audio.pause();
  isPlaying = false;
  playPauseBtn.querySelector('i').classList.remove('fa-pause');
  playPauseBtn.querySelector('i').classList.add('fa-play');
}

playPauseBtn.addEventListener('click', () => {
  if (!isPlaying) {
    playTrack();
  } else {
    pauseTrack();
  }
});

// Следующий/предыдущий трек
function nextTrack() {
  if (isShuffle) {
    currentTrackIndex = Math.floor(Math.random() * tracks.length);
  } else {
    currentTrackIndex = (currentTrackIndex + 1) % tracks.length;
  }
  loadTrack(currentTrackIndex);
  playTrack();
}
function prevTrack() {
  currentTrackIndex = (currentTrackIndex - 1 + tracks.length) % tracks.length;
  loadTrack(currentTrackIndex);
  playTrack();
}
nextTrackBtn.addEventListener('click', nextTrack);
prevTrackBtn.addEventListener('click', prevTrack);

// Shuffle / Repeat
shuffleBtn.addEventListener('click', () => {
  isShuffle = !isShuffle;
  shuffleBtn.style.color = isShuffle ? '#FF6FF1' : '#fff';
});
repeatBtn.addEventListener('click', () => {
  isRepeat = !isRepeat;
  repeatBtn.style.color = isRepeat ? '#FF6FF1' : '#fff';
});

// Когда трек закончился
audio.addEventListener('ended', () => {
  if (isRepeat) {
    audio.currentTime = 0;
    audio.play();
  } else {
    nextTrack();
  }
});

// Обновление прогресса
audio.addEventListener('timeupdate', () => {
  if (audio.duration) {
    const progress = (audio.currentTime / audio.duration) * 100;
    progressFilled.style.width = `${progress}%`;

    currentTimeEl.textContent = formatTime(audio.currentTime);
    totalTimeEl.textContent = formatTime(audio.duration);
  }
});

// Перемотка
progressBar.addEventListener('click', (e) => {
  const rect = progressBar.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const percent = clickX / width;
  audio.currentTime = percent * audio.duration;
});

// Формат времени (секунды -> мм:сс)
function formatTime(sec) {
  sec = Math.floor(sec);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${s < 10 ? '0'+s : s}`;
}

// Громкость
volumeContainer.addEventListener('click', (e) => {
  const rect = volumeContainer.getBoundingClientRect();
  const clickX = e.clientX - rect.left;
  const width = rect.width;
  const percent = clickX / width;

  audio.volume = percent;
  volumeFilled.style.width = `${percent * 100}%`;
});

// При первом открытии — загружаем трек (без автоигры)
loadTrack(currentTrackIndex);
