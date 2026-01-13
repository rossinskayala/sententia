// Состояние игры
const gameState = {
    currentScene: 0,
    selectedChoice: null
};

// Последовательность сцен
const scenes = [
    { type: 'image', src: 'cover.jpg', screen: 'cover' },
    { type: 'video', src: 'introduction.mp4', screen: 'video' },
    { type: 'video', src: 'home.mp4', screen: 'video' },
    { type: 'video', src: 'thoughts.mp4', screen: 'video' },
    { type: 'choice', src: 'choice.mp4', screen: 'choice' },
    // Динамическая сцена выбора будет вставлена здесь
    { type: 'video', src: 'forest.mp4', screen: 'video' },
    { type: 'video', src: 'one_hand_clap.mp4', screen: 'video' },
    { type: 'image', src: 'end.jpg', screen: 'end' }
];

// Соответствие выборов и видео
const choiceMap = {
    'woman': 'woman.mp4',
    'president': 'president.mp4',
    'friend': 'friend.mp4',
    'child': 'child.mp4'
};

// Элементы DOM
const coverScreen = document.getElementById('cover-screen');
const videoScreen = document.getElementById('video-screen');
const choiceScreen = document.getElementById('choice-screen');
const endScreen = document.getElementById('end-screen');
const gameVideo = document.getElementById('game-video');
const choiceVideo = document.getElementById('choice-video');
const coverImage = document.getElementById('cover-image');
const endImage = document.getElementById('end-image');
const choiceButtons = document.getElementById('choice-buttons');
const exitButton = document.getElementById('exit-btn');
const controlsHints = document.querySelectorAll('.controls-hint');

// Показать подсказку об управлении на 3 секунды
function showControlsHint() {
    // Показать подсказку только на активном экране
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen) {
        const hint = activeScreen.querySelector('.controls-hint');
        if (hint) {
            hint.classList.add('show');
            setTimeout(() => {
                hint.classList.remove('show');
            }, 3000);
        }
    }
}

// Скрыть все экраны
function hideAllScreens() {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
}

// Показать конкретный экран
function showScreen(screenName) {
    hideAllScreens();
    switch(screenName) {
        case 'cover':
            coverScreen.classList.add('active');
            break;
        case 'video':
            videoScreen.classList.add('active');
            break;
        case 'choice':
            choiceScreen.classList.add('active');
            break;
        case 'end':
            endScreen.classList.add('active');
            break;
    }
}

// Перейти к следующей сцене
function nextScene() {
    if (gameState.currentScene >= scenes.length) {
        return;
    }

    const scene = scenes[gameState.currentScene];
    
    if (scene.type === 'image') {
        if (scene.screen === 'cover') {
            showScreen('cover');
            showControlsHint();
        } else if (scene.screen === 'end') {
            showScreen('end');
        }
        gameState.currentScene++;
    } else if (scene.type === 'video') {
        showScreen('video');
        gameVideo.src = scene.src;
        gameVideo.load();
        
        // Обработка ошибок загрузки видео
        gameVideo.onerror = () => {
            console.error('Ошибка загрузки видео:', scene.src);
            // Перейти к следующей сцене при ошибке
            gameState.currentScene++;
            nextScene();
        };
        
        // Установить обработчик завершения видео
        gameVideo.onended = () => {
            gameState.currentScene++;
            nextScene();
        };
        
        // Воспроизведение со звуком
        gameVideo.muted = false; // Убеждаемся, что звук включен
        gameVideo.play().catch(e => {
            console.log('Автовоспроизведение заблокировано:', e);
            // Если автовоспроизведение заблокировано, пользователь может нажать play вручную
        });
        showControlsHint();
    } else if (scene.type === 'choice') {
        showScreen('choice');
        choiceVideo.src = scene.src;
        choiceVideo.load();
        // Воспроизведение со звуком
        choiceVideo.muted = false; // Убеждаемся, что звук включен
        choiceVideo.play().catch(e => {
            console.log('Автовоспроизведение заблокировано:', e);
            // Если автовоспроизведение заблокировано, пользователь может нажать play вручную
        });
        showControlsHint();
    }
}

// Обработка выбора
function handleChoice(choice) {
    if (gameState.selectedChoice !== null) return;
    
    gameState.selectedChoice = choice;
    const videoSrc = choiceMap[choice];
    
    // Остановить видео выбора
    choiceVideo.pause();
    
    // Скрыть кнопки выбора
    choiceButtons.style.display = 'none';
    
    // Переключиться на видео экран и воспроизвести выбранное видео
    showScreen('video');
    gameVideo.src = videoSrc;
    gameVideo.load();
    
    // После завершения видео перейти к следующей сцене (forest.mp4)
    gameVideo.onended = () => {
        gameState.currentScene++;
        nextScene();
    };
    
    // Воспроизведение со звуком
    gameVideo.muted = false; // Убеждаемся, что звук включен
    gameVideo.play().catch(e => {
        console.log('Автовоспроизведение заблокировано:', e);
        // Если автовоспроизведение заблокировано, пользователь может нажать play вручную
    });
    showControlsHint();
}

// Инициализация кнопок выбора
document.querySelectorAll('.choice-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const choice = e.target.dataset.choice;
        handleChoice(choice);
    });
});

// Обработка клика/пробела для продолжения
function handleContinue() {
    // Определяем текущую активную сцену по активному экрану
    const activeScreen = document.querySelector('.screen.active');
    
    if (!activeScreen) return;
    
    // Если это экран выбора, не продолжаем
    if (activeScreen.id === 'choice-screen') {
        return;
    }
    
    // Если это изображение (обложка или финал)
    if (activeScreen.id === 'cover-screen' || activeScreen.id === 'end-screen') {
        if (activeScreen.id === 'cover-screen') {
            gameState.currentScene++;
            nextScene();
        }
        // Для end-screen ничего не делаем, игра завершена
        return;
    }
    
    // Если это видео экран
    if (activeScreen.id === 'video-screen') {
        if (gameVideo.paused || gameVideo.ended) {
            gameVideo.play();
        } else {
            // Если видео играет, переходим к следующей сцене
            gameVideo.pause();
            gameVideo.onended = null; // Убираем обработчик, чтобы не вызывался дважды
            gameState.currentScene++;
            nextScene();
        }
    }
}

// Обработка выхода
function handleExit() {
    if (confirm('Вы уверены, что хотите выйти из игры?')) {
        window.close();
        // Если window.close() не работает, попробуем перенаправить
        if (!document.hidden) {
            window.location.href = 'about:blank';
        }
    }
}

// Обработчики событий
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        handleExit();
    } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleContinue();
    }
});

// Обработка клика и касания (для мобильных устройств)
function handleClickOrTouch(e) {
    // Не продолжаем при клике на кнопки выбора или кнопку выхода
    if (e.target.closest('.choice-btn') || e.target.closest('.exit-button')) {
        return;
    }
    
    // Проверяем, что это не экран выбора
    const activeScreen = document.querySelector('.screen.active');
    if (activeScreen && activeScreen.id !== 'choice-screen') {
        handleContinue();
    }
}

document.addEventListener('click', handleClickOrTouch);
// Поддержка touch событий для мобильных устройств
document.addEventListener('touchend', (e) => {
    e.preventDefault();
    handleClickOrTouch(e);
});

exitButton.addEventListener('click', handleExit);

// Предзагрузка медиа
function preloadMedia() {
    // Предзагружаем первое изображение и видео
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = 'cover.jpg';
    document.head.appendChild(link);
}

// Инициализация игры
function initGame() {
    preloadMedia();
    gameState.currentScene = 0;
    // Обложка уже отображается в HTML, поэтому nextScene() не вызываем
    // nextScene() будет вызван при первом клике на обложке
    // Показываем подсказку об управлении для обложки
    showControlsHint();
}

// Запуск игры когда все загружено
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initGame);
} else {
    initGame();
}
