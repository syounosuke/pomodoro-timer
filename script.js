document.addEventListener('DOMContentLoaded', () => {
    // DOM要素の取得
    const timerDisplay = document.getElementById('timer');
    const statusDisplay = document.getElementById('status');
    const startBtn = document.getElementById('start-btn');
    const pauseBtn = document.getElementById('pause-btn');
    const resetBtn = document.getElementById('reset-btn');
    const saveBtn = document.getElementById('save-btn');
    const workTimeInput = document.getElementById('work-time');
    const breakTimeInput = document.getElementById('break-time');
    const completedCountDisplay = document.getElementById('completed-count');
    
    // タイマーの状態
    let timerInterval;
    let isRunning = false;
    let isPaused = false;
    let isWorkTime = true;
    let timeLeft = workTimeInput.value * 60; // 秒単位
    let completedCount = 0;
    
    // 音声通知の設定
    const workCompleteSound = new Audio('https://soundbible.com/grab.php?id=1746&type=mp3'); // 作業終了音
    const breakCompleteSound = new Audio('https://soundbible.com/grab.php?id=1683&type=mp3'); // 休憩終了音
    
    // タイマーの表示を更新する関数
    function updateTimerDisplay() {
        const minutes = Math.floor(timeLeft / 60);
        const seconds = timeLeft % 60;
        
        // 2桁表示のためのパディング
        const displayMinutes = String(minutes).padStart(2, '0');
        const displaySeconds = String(seconds).padStart(2, '0');
        
        timerDisplay.textContent = `${displayMinutes}:${displaySeconds}`;
        
        // タイトルにも残り時間を表示
        document.title = `${displayMinutes}:${displaySeconds} - ポモドーロタイマー`;
    }
    
    // タイマーをスタートする関数
    function startTimer() {
        if (isRunning && !isPaused) return;
        
        if (isPaused) {
            isPaused = false;
        } else {
            isRunning = true;
        }
        
        timerInterval = setInterval(() => {
            if (timeLeft > 0) {
                timeLeft--;
                updateTimerDisplay();
            } else {
                // タイマー終了時の処理
                clearInterval(timerInterval);
                
                if (isWorkTime) {
                    // 作業時間終了
                    completedCount++;
                    completedCountDisplay.textContent = completedCount;
                    isWorkTime = false;
                    statusDisplay.textContent = '休憩時間';
                    document.body.classList.remove('work-mode');
                    document.body.classList.add('break-mode');
                    timeLeft = breakTimeInput.value * 60;
                    workCompleteSound.play();
                    
                    // ブラウザ通知
                    if (Notification.permission === 'granted') {
                        new Notification('作業時間終了', {
                            body: '休憩しましょう！',
                            icon: 'https://img.icons8.com/color/48/000000/tomato.png'
                        });
                    }
                } else {
                    // 休憩時間終了
                    isWorkTime = true;
                    statusDisplay.textContent = '作業時間';
                    document.body.classList.remove('break-mode');
                    document.body.classList.add('work-mode');
                    timeLeft = workTimeInput.value * 60;
                    breakCompleteSound.play();
                    
                    // ブラウザ通知
                    if (Notification.permission === 'granted') {
                        new Notification('休憩時間終了', {
                            body: '作業を再開しましょう！',
                            icon: 'https://img.icons8.com/color/48/000000/tomato.png'
                        });
                    }
                }
                
                updateTimerDisplay();
                startTimer(); // 自動的に次のサイクルを開始
            }
        }, 1000);
    }
    
    // タイマーを一時停止する関数
    function pauseTimer() {
        if (!isRunning) return;
        
        clearInterval(timerInterval);
        isPaused = true;
    }
    
    // タイマーをリセットする関数
    function resetTimer() {
        clearInterval(timerInterval);
        isRunning = false;
        isPaused = false;
        isWorkTime = true;
        timeLeft = workTimeInput.value * 60;
        statusDisplay.textContent = '作業時間';
        document.body.classList.remove('break-mode');
        document.body.classList.add('work-mode');
        updateTimerDisplay();
    }
    
    // 設定を保存する関数
    function saveSettings() {
        const workTime = parseInt(workTimeInput.value);
        const breakTime = parseInt(breakTimeInput.value);
        
        // 値のバリデーション
        if (workTime < 1 || workTime > 60) {
            alert('作業時間は1〜60分の間で設定してください');
            return;
        }
        
        if (breakTime < 1 || breakTime > 30) {
            alert('休憩時間は1〜30分の間で設定してください');
            return;
        }
        
        // タイマーが実行中でない場合は、新しい設定を即時反映
        if (!isRunning) {
            timeLeft = workTime * 60;
            updateTimerDisplay();
        }
        
        alert('設定を保存しました');
    }
    
    // イベントリスナーの設定
    startBtn.addEventListener('click', startTimer);
    pauseBtn.addEventListener('click', pauseTimer);
    resetBtn.addEventListener('click', resetTimer);
    saveBtn.addEventListener('click', saveSettings);
    
    // 初期表示の更新
    updateTimerDisplay();
    document.body.classList.add('work-mode');
    
    // ブラウザ通知の許可を求める
    if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
        Notification.requestPermission();
    }
});
