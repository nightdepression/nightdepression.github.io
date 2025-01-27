window.addEventListener('load', () => {
  const loader = document.getElementById('loader');
  loader.classList.add('hidden');
  setTimeout(() => {
    loader.style.display = 'none';
  }, 500);
});

// Пуск и часики
// Элементы для меню "Пуск"
const startButton = document.getElementById('startButton');
const startMenu = document.getElementById('startMenu');

startButton.addEventListener('click', () => {
  startMenu.classList.toggle('active');
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
  console.log('Switching background to:', index);
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
      video.muted = true; // выключаем звук, если нужен false
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
changeBackgroundIcon.addEventListener('click', () => {
  currentBackgroundIndex = (currentBackgroundIndex + 1) % backgrounds.length;
  setBackground(currentBackgroundIndex);
});

// // Массив ID
// const youtubeIDs = [
//   'BAu9xtNrS30',
//   'ElqnsQPWhDM',
//   'UOj6be6EEKM'
// ];

// let currentIndex = 0; // начинаем с 0
// const bgIframe = document.getElementById('bgIframe');
// const backgroundLayer = document.getElementById('backgroundLayer');
// const changeBackgroundIcon = document.getElementById('changeBackgroundIcon');

// function setYouTubeVideo(index) {
//   backgroundLayer.classList.remove('fade-in');
//   backgroundLayer.classList.add('fade-out');

//   backgroundLayer.addEventListener('transitionend', handleTransition);

//   function handleTransition() {
//     backgroundLayer.removeEventListener('transitionend', handleTransition);

//     // Меняем src у iframe
//     const videoId = youtubeIDs[index];
//     bgIframe.src = `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&controls=0&playlist=${videoId}`;

//     // Запускаем fade-in
//     requestAnimationFrame(() => {
//       backgroundLayer.classList.remove('fade-out');
//       backgroundLayer.classList.add('fade-in');
//     });
//   }
// }

// // При клике на иконку «Сменить фон» — следующий индекс
// changeBackgroundIcon.addEventListener('click', () => {
//   currentIndex = (currentIndex + 1) % youtubeIDs.length;
//   setYouTubeVideo(currentIndex);
// });

// Плеер
// Массив треков
const tracks = [
  {
    title: 'По переходам',
    artist: 'f0lk',
    cover: 'https://t2.genius.com/unsafe/340x340/https%3A%2F%2Fimages.genius.com%2F77d7909d5bd0f16c2cdde0805e9830ec.1000x1000x1.jpg',
    url: 'music/f0lk - Transitions.mp3'
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

// DOM-элементы плеера
const musicWindow = document.getElementById('musicWindow');
const closeMusicWindow = document.getElementById('closeMusicWindow');
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
audio.volume = 0.5;  // стартовая громкость

// Показать окно плеера по клику
musicPlayerIcon.addEventListener('click', () => {
  musicWindow.style.display = 'block';
  loadTrack(currentTrackIndex);
});

// Закрыть окно плеера
closeMusicWindow.addEventListener('click', () => {
  musicWindow.style.display = 'none';
  // Если нужно остановить трек, нужно убрать коммент ниже
  // audio.pause();
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
