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

// Логика смены фонов, используя массив (для хостингов)
const backgrounds = [
  { type: 'image', url: 'backgrounds/main.jpg' },
  { type: 'video', url: 'backgrounds/1.mp4' },
  { type: 'video', url: 'backgrounds/2.mp4' },
  { type: 'video', url: 'backgrounds/3.mp4' }
];

let currentBackgroundIndex = 0;
const backgroundLayer = document.getElementById('backgroundLayer');

// Функция смены фона
function setBackground(index) {
  backgroundLayer.classList.remove('fade-in');
  backgroundLayer.classList.remove('fade-out');
  backgroundLayer.classList.add('fade-out');
  backgroundLayer.addEventListener('transitionend', handleTransition);

  function handleTransition() {
    // Чтобы не вызывался много раз
    backgroundLayer.removeEventListener('transitionend', handleTransition);

    // Очищаем содержимое
    backgroundLayer.innerHTML = '';
    backgroundLayer.style.background = 'none';

    // Если фон — видео
    if (backgrounds[index].type === 'video') {
      const video = document.createElement('video');
      video.src = backgrounds[index].url;
      video.autoplay = true;
      video.loop = true;
      video.muted = true; // выключаем звук, если нужен false (важно: не будет работать автоплей)
      backgroundLayer.appendChild(video);
    } else {
      backgroundLayer.style.background = `
        url('${backgrounds[index].url}')
        no-repeat center center / cover
      `;
    }

    requestAnimationFrame(() => {
      backgroundLayer.classList.remove('fade-out');
      backgroundLayer.classList.add('fade-in');
    });
  }
}

// Устанавливаем первый фон по умолчанию
setBackground(currentBackgroundIndex);

const changeBackgroundIcon = document.getElementById('changeBackgroundIcon');
function changeBackground() {
  currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
  setBackground(currentBackgroundIndex);
}

changeBackgroundIcon.addEventListener('click', changeBackground);

// Context Menu Logic
const desktopArea = document.getElementById('desktopArea');
const contextMenu = document.getElementById('desktopContextMenu');
const contextRefresh = document.getElementById('contextRefresh');
const contextPersonalize = document.getElementById('contextPersonalize');

// Show context menu
desktopArea.addEventListener('contextmenu', (e) => {
  e.preventDefault();

  // Position the menu
  let x = e.clientX;
  let y = e.clientY;

  // Make sure menu doesn't go off-screen
  if (x + 250 > window.innerWidth) x -= 250;
  if (y + 150 > window.innerHeight) y -= 150;

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
  changeBackground();
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

  header.addEventListener('mousedown', (e) => {
    // Prevent dragging if clicking on window controls
    if (e.target.closest('.window-controls')) return;

    isDragging = true;
    offsetX = e.clientX - windowEl.offsetLeft;
    offsetY = e.clientY - windowEl.offsetTop;
    document.body.style.userSelect = 'none'; // Prevent text selection
  });

  document.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    windowEl.style.left = (e.clientX - offsetX) + 'px';
    windowEl.style.top = (e.clientY - offsetY) + 'px';
  });

  document.addEventListener('mouseup', () => {
    isDragging = false;
    document.body.style.userSelect = '';
  });

  // Window Controls
  const closeBtn = windowEl.querySelector('.close-btn');
  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      windowEl.style.display = 'none';
    });
  }

  const minimizeBtn = windowEl.querySelector('.minimize-btn');
  if (minimizeBtn) {
    minimizeBtn.addEventListener('click', () => {
      windowEl.style.display = 'none'; // Simple minimize behavior for now
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

// Show window function
function openWindow(windowEl) {
  windowEl.style.display = 'flex';
  zIndexCounter++;
  windowEl.style.zIndex = zIndexCounter;
}

// Windows
const aboutMeWindow = document.getElementById('aboutMeWindow');
const skillsWindow = document.getElementById('skillsWindow');
const musicWindow = document.getElementById('musicWindow');
const terminalWindow = document.getElementById('terminalWindow');

// Icons
const aboutMeIcon = document.getElementById('aboutMeIcon');
const skillsIcon = document.getElementById('skillsIcon');
const terminalIcon = document.getElementById('terminalIcon');

// Icon Clicks
aboutMeIcon.addEventListener('click', () => openWindow(aboutMeWindow));
skillsIcon.addEventListener('click', () => openWindow(skillsWindow));
terminalIcon.addEventListener('click', () => {
  openWindow(terminalWindow);
  document.getElementById('terminalInput').focus();
});

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
musicPlayerIcon.addEventListener('click', () => {
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
