document.addEventListener('DOMContentLoaded', function() {
    // Khởi tạo AudioSynth
    const synth = new AudioSynth();
    synth.setVolume(0.5);
    
    // DOM Elements
    const keysContainer = document.querySelector('.keys');
    const volumeControl = document.getElementById('volume');
    const instrumentSelect = document.getElementById('instrument');
    const keyHistoryContainer = document.getElementById('key-history-container');
    const sequenceInput = document.getElementById('sequence-input');
    const playSequenceBtn = document.getElementById('play-sequence');
    const playSpeed = document.getElementById('play-speed');
    const speedValue = document.getElementById('speed-value');
    
    // Mảng lưu trữ lịch sử phím đã nhấn
    const keyHistory = [];
    
    // Trạng thái đang phát
    let isPlaying = false;
    
    // Tạo các nhạc cụ
    const piano = synth.createInstrument('piano');
    const organ = synth.createInstrument('organ');
    const acoustic = synth.createInstrument('acoustic');
    const edm = synth.createInstrument('edm');
    
    let currentInstrument = piano;
    
    // Các nốt nhạc
    const notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
    
    // Ánh xạ bàn phím
    const keyMap = {
        // Octave 4
        'a': {note: 'C', octave: 4},
        'w': {note: 'C#', octave: 4},
        's': {note: 'D', octave: 4},
        'e': {note: 'D#', octave: 4},
        'd': {note: 'E', octave: 4},
        'f': {note: 'F', octave: 4},
        't': {note: 'F#', octave: 4},
        'g': {note: 'G', octave: 4},
        'y': {note: 'G#', octave: 4},
        'h': {note: 'A', octave: 4},
        'u': {note: 'A#', octave: 4},
        'j': {note: 'B', octave: 4},
        // Octave 5
        'k': {note: 'C', octave: 5},
        'o': {note: 'C#', octave: 5},
        'l': {note: 'D', octave: 5},
        'p': {note: 'D#', octave: 5},
        ';': {note: 'E', octave: 5},
        'z': {note: 'F', octave: 5},
        'r': {note: 'F#', octave: 5},
        'x': {note: 'G', octave: 5},
        'i': {note: 'G#', octave: 5},
        'c': {note: 'A', octave: 5},
        '[': {note: 'A#', octave: 5},
        'v': {note: 'B', octave: 5},
        // Octave 6
        'b': {note: 'C', octave: 6},
        '=': {note: 'C#', octave: 6},
        'n': {note: 'D', octave: 6},
        'q': {note: 'D#', octave: 6},
        'm': {note: 'E', octave: 6},
        ',': {note: 'F', octave: 6},
        '!': {note: 'F#', octave: 6},
        '.': {note: 'G', octave: 6},
        '@': {note: 'G#', octave: 6},
        '/': {note: 'A', octave: 6},
        '#': {note: 'A#', octave: 6},
        '0': {note: 'B', octave: 6},
        // Octave 7
        '1': {note: 'C', octave: 7},
        '$': {note: 'C#', octave: 7},
        '2': {note: 'D', octave: 7},
        '%': {note: 'D#', octave: 7},
        '3': {note: 'E', octave: 7},
        '4': {note: 'F', octave: 7},
        '^': {note: 'F#', octave: 7},
        '5': {note: 'G', octave: 7},
        '&': {note: 'G#', octave: 7},
        '6': {note: 'A', octave: 7},
        '*': {note: 'A#', octave: 7},
        '7': {note: 'B', octave: 7}
    };
    
    // Tạo phím đàn
    function createPianoKeys() {
        // 4 octave từ C4 đến B7 (49 phím)
        for (let octave = 4; octave <= 7; octave++) {
            for (let i = 0; i < notes.length; i++) {
                const note = notes[i];
                const isBlackKey = note.includes('#');
                
                // Tạo element phím đàn
                const keyElement = document.createElement('div');
                keyElement.className = `key ${isBlackKey ? 'black' : 'white'}`;
                keyElement.dataset.note = note;
                keyElement.dataset.octave = octave;
                
                // Tìm nhãn bàn phím tương ứng
                let keyLabel = '';
                for (const [keyChar, mapping] of Object.entries(keyMap)) {
                    if (mapping.note === note && mapping.octave === octave) {
                        keyLabel = keyChar.toUpperCase();
                        break;
                    }
                }
                
                // Thêm nội dung phím
                keyElement.innerHTML = `
                    <div class="note-name">${note.replace('#', '♯')}${octave}</div>
                    ${keyLabel ? `<div class="key-label">${keyLabel}</div>` : ''}
                `;
                
                // Thêm sự kiện
                keyElement.addEventListener('mousedown', playKey);
                keyElement.addEventListener('touchstart', playKey);
                keyElement.addEventListener('mouseup', releaseKey);
                keyElement.addEventListener('mouseleave', releaseKey);
                keyElement.addEventListener('touchend', releaseKey);
                
                keysContainer.appendChild(keyElement);
                
                // Dừng ở B7 (phím thứ 49)
                if (octave === 7 && note === 'B') break;
            }
        }
    }
    
    // Phát âm thanh khi nhấn phím
    function playKey(e) {
        e.preventDefault();
        const key = e.target.closest('.key');
        if (!key) return;
        
        key.classList.add('active');
        
        const note = key.dataset.note;
        const octave = parseInt(key.dataset.octave);
        
        // Phát âm thanh
        currentInstrument.play(note, octave, 1.5);
        
        // Tìm phím tương ứng
        let keyChar = '';
        for (const [k, mapping] of Object.entries(keyMap)) {
            if (mapping.note === note && mapping.octave === octave) {
                keyChar = k;
                break;
            }
        }
        
        // Thêm vào lịch sử nếu có phím tương ứng
        if (keyChar) {
            addToKeyHistory(keyChar, note, octave);
        }
    }
    
    // Nhả phím
    function releaseKey(e) {
        e.preventDefault();
        const key = e.target.closest('.key');
        if (key) key.classList.remove('active');
    }
    
    // Hàm để thêm phím vào lịch sử
    function addToKeyHistory(key, note, octave) {
        // Tạo element mới
        const keyHistoryElement = document.createElement('div');
        const isBlackKey = note.includes('#');
        keyHistoryElement.className = `history-key ${isBlackKey ? 'black' : 'white'}`;
        keyHistoryElement.textContent = `${key.toUpperCase()} (${note}${octave})`;
        
        // Thêm vào mảng lưu trữ và vào container
        keyHistory.push({key, note, octave});
        keyHistoryContainer.prepend(keyHistoryElement);
        
        // Giới hạn số lượng hiển thị
        if (keyHistoryContainer.children.length > 50) {
            keyHistoryContainer.removeChild(keyHistoryContainer.lastChild);
        }
    }
    
    // Sự kiện bàn phím vật lý
    document.addEventListener('keydown', function(e) {
        // Nếu phím đã được nhấn, không xử lý tiếp
        if (e.repeat) return;
        
        const key = e.key.toLowerCase();
        if (keyMap[key]) {
            const {note, octave} = keyMap[key];
            const keyElement = document.querySelector(`.key[data-note="${note}"][data-octave="${octave}"]`);
            
            if (keyElement) {
                keyElement.classList.add('active');
                currentInstrument.play(note, octave, 1.5);
                
                // Thêm vào lịch sử
                addToKeyHistory(key, note, octave);
                
                // Tự động nhả phím sau 300ms
                setTimeout(() => {
                    keyElement.classList.remove('active');
                }, 300);
            }
        }
    });
    
    // Thay đổi âm lượng
    volumeControl.addEventListener('input', function() {
        synth.setVolume(parseFloat(this.value));
    });
    
    // Thay đổi nhạc cụ
    instrumentSelect.addEventListener('change', function() {
        switch(this.value) {
            case '0': currentInstrument = piano; break;
            case '1': currentInstrument = organ; break;
            case '2': currentInstrument = acoustic; break;
            case '3': currentInstrument = edm; break;
        }
    });
    
    // Hàm để mô phỏng nhấn phím
    function simulateKeyPress(key) {
        const lowerKey = key.toLowerCase();
        if (keyMap[lowerKey]) {
            const {note, octave} = keyMap[lowerKey];
            const keyElement = document.querySelector(`.key[data-note="${note}"][data-octave="${octave}"]`);
            
            if (keyElement) {
                // Hiệu ứng phím được nhấn
                keyElement.classList.add('active');
                
                // Phát âm thanh
                currentInstrument.play(note, octave, 1.5);
                
                // Thêm vào lịch sử
                addToKeyHistory(lowerKey, note, octave);
                
                // Tự động nhả phím sau 300ms
                setTimeout(() => {
                    keyElement.classList.remove('active');
                }, 300);
                
                return true;
            }
        }
        return false;
    }
    
    // Hàm để phát chuỗi phím
    function playSequence(sequence) {
        if (isPlaying) return;
        
        isPlaying = true;
        playSequenceBtn.disabled = true;
        playSequenceBtn.textContent = 'Đang phát...';
        
        const delay = parseInt(playSpeed.value);
        const keys = sequence.split('');
        let currentIndex = 0;
        
        function playNextKey() {
            if (currentIndex < keys.length) {
                const key = keys[currentIndex];
                
                // Bỏ qua khoảng trắng nhưng vẫn tạo delay
                if (key === ' ') {
                    currentIndex++;
                    setTimeout(playNextKey, delay / 2); // Khoảng trắng tạo delay ngắn hơn
                    return;
                }
                
                simulateKeyPress(key);
                currentIndex++;
                setTimeout(playNextKey, delay);
            } else {
                // Kết thúc chuỗi
                isPlaying = false;
                playSequenceBtn.disabled = false;
                playSequenceBtn.textContent = 'Chơi nhạc';
            }
        }
        
        // Bắt đầu phát
        playNextKey();
    }
    
    // Sự kiện khi nhấn nút Play
    playSequenceBtn.addEventListener('click', function() {
        const sequence = sequenceInput.value.trim().replace(/\s+/g, ' ');
        if (sequence) {
            playSequence(sequence);
        }
    });
    
    // Cài đặt giá trị mặc định cho bài Jingle Bells (đầy đủ)
    sequenceInput.value = 'ddd ddd dgad d ffff fddd ddsd g ddd ddd dgad d ffff fddd ggfs a';
    
    // Cài đặt tốc độ mặc định là 400ms
    playSpeed.value = 400;
    speedValue.textContent = '400ms';
    
    // Cập nhật hiển thị tốc độ phát
    playSpeed.addEventListener('input', function() {
        speedValue.textContent = `${this.value}ms`;
    });
    
    // Khởi tạo piano
    createPianoKeys();
});