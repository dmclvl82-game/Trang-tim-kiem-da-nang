const defaultEngines = [
    { id: 'google', name: 'Google', color: '#1a0dab', borderColor: '#4285F4', type: 'builtin', url: 'https://www.google.com/search?q=' },
    { id: 'bing', name: 'Bing', color: '#0078d4', borderColor: '#0078d4', type: 'builtin', url: 'https://www.bing.com/search?q=' },
    { id: 'coccoc', name: 'Cốc Cốc', color: '#008f5d', borderColor: '#008f5d', type: 'builtin', url: 'https://coccoc.com/search?q=' },
    { id: 'yahoo', name: 'Yahoo!', color: '#6001d2', borderColor: '#6001d2', type: 'builtin', url: 'https://vn.search.yahoo.com/search?p=' },
    { id: 'duckduckgo', name: 'DuckDuckGo', color: '#de5833', borderColor: '#de5833', type: 'builtin', url: 'https://duckduckgo.com/?q=' },
    { id: 'startpage', name: 'Startpage', color: '#3b5998', borderColor: '#3b5998', type: 'builtin', url: 'https://www.startpage.com/do/search?q=' },
    { id: 'youtube', name: 'YouTube', color: '#ff0000', borderColor: '#ff0000', type: 'builtin', url: 'https://www.youtube.com/results?search_query=' },
    { id: 'tiktok', name: 'TikTok', color: '#010101', borderColor: '#010101', type: 'builtin', url: 'https://www.tiktok.com/search?q=' },
    { id: 'facebook', name: 'Facebook', color: '#1877f2', borderColor: '#1877f2', type: 'builtin', url: 'https://www.facebook.com/search/top?q=' },
    { id: 'shopee', name: 'Shopee', color: '#ee4d2d', borderColor: '#ee4d2d', type: 'builtin', url: 'https://shopee.vn/search?keyword=' },
    { id: 'gemini', name: 'Gemini', color: '#4285F4', borderColor: '#4285F4', type: 'builtin', url: 'https://gemini.google.com' },
    { id: 'chatgpt', name: 'ChatGPT', color: '#10a37f', borderColor: '#10a37f', type: 'builtin', url: 'https://chatgpt.com' },
    { id: 'notes', name: 'Note (Ghi chú)', color: '#f59e0b', borderColor: '#f59e0b', type: 'builtin', url: 'notes' },
    { id: 'camera', name: 'Camera', color: '#6366f1', borderColor: '#6366f1', type: 'builtin', url: 'camera' }
];

function getEngines() {
    const stored = localStorage.getItem('searchEngines');
    if (stored) {
        try { return JSON.parse(stored); } catch (e) {}
    }
    return JSON.parse(JSON.stringify(defaultEngines));
}

window.addEventListener('DOMContentLoaded', () => {
    const loggedUser = localStorage.getItem('currentUser');
    if (loggedUser) {
        document.getElementById('authOverlay').style.display = 'none';
        document.getElementById('userInfo').style.display = 'flex';
        document.getElementById('currentUsername').textContent = loggedUser;
    }

    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        document.body.classList.add('dark-mode');
        document.getElementById('themeToggleBtn').textContent = '☀️';
    }

    const savedBg = localStorage.getItem('bgImage');
    if (savedBg) { applyBackgroundImage(savedBg); }
    
    renderHistory();
    renderSearchButtons();
    renderDefaultEngineSelect();
    renderSettingsEnginesList();
    renderWorkspaceNotesList();
    handleInputChange();

    initClockAndCalendar();
    initWeatherWidget();
    initWidgetDraggable();

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.search-box')) { hideSuggestions(); }
    });
});

// Kéo thả thanh widget
function initWidgetDraggable() {
    const widget = document.querySelector('.top-widget-bar');
    if (!widget) return;
    const savedPos = localStorage.getItem('widgetPos');
    if (savedPos) {
        try {
            const pos = JSON.parse(savedPos);
            widget.style.top = pos.top + 'px';
            widget.style.left = pos.left + 'px';
            widget.style.position = 'fixed';
        } catch(e) {}
    }

    let isDragging = false, startX, startY, initialLeft, initialTop;
    widget.addEventListener('pointerdown', (e) => {
        isDragging = true;
        startX = e.clientX; startY = e.clientY;
        const rect = widget.getBoundingClientRect();
        initialLeft = rect.left; initialTop = rect.top;
        widget.style.cursor = 'grabbing';
        widget.setPointerCapture(e.pointerId);
        e.preventDefault();
    });
    document.addEventListener('pointermove', (e) => {
        if (!isDragging) return;
        widget.style.left = (initialLeft + (e.clientX - startX)) + 'px';
        widget.style.top = (initialTop + (e.clientY - startY)) + 'px';
        widget.style.position = 'fixed';
    });
    document.addEventListener('pointerup', (e) => {
        if (isDragging) {
            isDragging = false;
            widget.style.cursor = 'move';
            try { widget.releasePointerCapture(e.pointerId); } catch(err) {}
            const rect = widget.getBoundingClientRect();
            localStorage.setItem('widgetPos', JSON.stringify({ top: rect.top, left: rect.left }));
        }
    });
}

// --- Workspace Ghi chú ---
function getNotesStorageKey() {
    return 'userNotes_' + (localStorage.getItem('currentUser') || 'Khách');
}

function openNotesWorkspace() {
    toggleMainElements(false);
    document.getElementById('notesWorkspace').style.display = 'block';
    renderWorkspaceNotesList();
}

function closeNotesWorkspace() {
    toggleMainElements(true);
    document.getElementById('notesWorkspace').style.display = 'none';
}

function saveWorkspaceNote() {
    const titleInput = document.getElementById('wsNoteTitle');
    const contentInput = document.getElementById('wsNoteContent');
    const title = titleInput.value.trim(), content = contentInput.value.trim();
    if (!title && !content) { alert('Vui lòng nhập tiêu đề hoặc nội dung ghi chú!'); return; }
    
    let notes = JSON.parse(localStorage.getItem(getNotesStorageKey()) || '[]');
    notes.unshift({ id: 'note_' + Date.now(), title: title || 'Không tiêu đề', content, date: new Date().toLocaleString('vi-VN') });
    localStorage.setItem(getNotesStorageKey(), JSON.stringify(notes));
    titleInput.value = ''; contentInput.value = '';
    renderWorkspaceNotesList();
}

function deleteWorkspaceNote(id) {
    let notes = JSON.parse(localStorage.getItem(getNotesStorageKey()) || '[]');
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem(getNotesStorageKey(), JSON.stringify(notes));
    renderWorkspaceNotesList();
}

function renderWorkspaceNotesList() {
    const container = document.getElementById('wsNotesListContainer');
    if (!container) return;
    const notes = JSON.parse(localStorage.getItem(getNotesStorageKey()) || '[]');
    container.innerHTML = notes.length === 0 ? '<span style="font-size: 13px; color: #9aa0a6;">Chưa có ghi chú nào.</span>' : '';
    notes.forEach(note => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 10px; background: rgba(0,0,0,0.03); border-radius: 8px; border: 1px solid #dadce0; font-size: 13px;';
        item.innerHTML = `<div style="display: flex; justify-content: space-between; margin-bottom: 4px;"><strong style="color: #f59e0b;">${escapeHtml(note.title)}</strong><button onclick="deleteWorkspaceNote('${note.id}')" style="background:none; border:none; color:#EA4335; cursor:pointer; font-weight:bold;">✕</button></div><p style="white-space: pre-wrap; margin-bottom: 4px;">${escapeHtml(note.content)}</p><span style="font-size: 11px; color: #9aa0a6;">${note.date}</span>`;
        container.appendChild(item);
    });
}

// --- Workspace Camera ---
let camStream = null;
let camFacingMode = 'user';
let mediaRecorder = null;
let recordedChunks = [];
let isRecording = false;

async function openCameraWorkspace() {
    toggleMainElements(false);
    document.getElementById('cameraWorkspace').style.display = 'block';
    await initCamStream(camFacingMode);
}

function closeCameraWorkspace() {
    if (camStream) { camStream.getTracks().forEach(t => t.stop()); camStream = null; }
    if (isRecording && mediaRecorder) { mediaRecorder.stop(); isRecording = false; }
    toggleMainElements(true);
    document.getElementById('cameraWorkspace').style.display = 'none';
}

async function initCamStream(mode) {
    if (camStream) { camStream.getTracks().forEach(t => t.stop()); }
    try {
        camStream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: mode }, audio: true });
        document.getElementById('camVideo').srcObject = camStream;
    } catch (err) {
        alert("Không thể truy cập camera hoặc microphone!");
    }
}

function switchCamFacing() {
    camFacingMode = (camFacingMode === 'user') ? 'environment' : 'user';
    initCamStream(camFacingMode);
}

function applyCamFilter(filterVal) {
    document.getElementById('camVideo').style.filter = filterVal;
}

function captureCamImage() {
    const video = document.getElementById('camVideo');
    const canvas = document.getElementById('camCanvas');
    const ctx = canvas.getContext('2d');
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    ctx.filter = document.getElementById('camFilterSelect').value;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/png');
    const photoEl = document.getElementById('camPhoto');
    const dlPhotoEl = document.getElementById('camDownloadPhoto');
    photoEl.src = dataUrl; photoEl.style.display = 'block';
    dlPhotoEl.href = dataUrl; dlPhotoEl.style.display = 'block';
    document.getElementById('camResultArea').style.display = 'block';
}

function toggleCamRecord() {
    const recordBtn = document.getElementById('camRecordBtn');
    if (!isRecording) {
        recordedChunks = [];
        try {
            mediaRecorder = new MediaRecorder(camStream, { mimeType: 'video/webm' });
        } catch (e) {
            mediaRecorder = new MediaRecorder(camStream);
        }
        mediaRecorder.ondataavailable = e => { if (e.data.size > 0) recordedChunks.push(e.data); };
        mediaRecorder.onstop = () => {
            const blob = new Blob(recordedChunks, { type: 'video/webm' });
            const videoURL = URL.createObjectURL(blob);
            const recVideo = document.getElementById('camRecordedVideo');
            const dlVideo = document.getElementById('camDownloadVideo');
            recVideo.src = videoURL; recVideo.style.display = 'block';
            dlVideo.href = videoURL; dlVideo.style.display = 'block';
            document.getElementById('camResultArea').style.display = 'block';
        };
        mediaRecorder.start();
        isRecording = true;
        recordBtn.textContent = "Dừng Quay";
        recordBtn.classList.add('recording');
    } else {
        mediaRecorder.stop();
        isRecording = false;
        recordBtn.textContent = "Bắt Đầu Quay Video";
        recordBtn.classList.remove('recording');
    }
}

function toggleMainElements(show) {
    const val = show ? 'block' : 'none';
    document.querySelector('.logo').style.display = val;
    document.querySelector('.search-box').style.display = val;
    document.getElementById('historyContainer').style.display = show ? 'flex' : 'none';
    document.getElementById('searchButtonsContainer').style.display = show ? 'flex' : 'none';
    document.getElementById('notesWorkspace').style.display = 'none';
    document.getElementById('cameraWorkspace').style.display = 'none';
}

// --- Tiện ích Đồng hồ & Thời tiết ---
function initClockAndCalendar() {
    updateClock(); setInterval(updateClock, 1000);
}
function updateClock() {
    const now = new Date();
    const h = String(now.getHours()).padStart(2, '0'), m = String(now.getMinutes()).padStart(2, '0'), s = String(now.getSeconds()).padStart(2, '0');
    const days = ['Chủ Nhật', 'Thứ Hai', 'Thứ Ba', 'Thứ Tư', 'Thứ Năm', 'Thứ Sáu', 'Thứ Bảy'];
    const wEl = document.getElementById('clockCalendarWidget');
    if (wEl) wEl.innerHTML = `🕒 <b>${h}:${m}:${s}</b> | ${days[now.getDay()]}, ${String(now.getDate()).padStart(2,'0')}/${String(now.getMonth()+1).padStart(2,'0')}/${now.getFullYear()}`;
}

function initWeatherWidget() {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(pos => fetchWeather(pos.coords.latitude, pos.coords.longitude), () => fetchWeather(21.0285, 105.8542), {timeout:5000});
    } else { fetchWeather(21.0285, 105.8542); }
}
async function fetchWeather(lat, lon) {
    try {
        const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,weather_code&timezone=auto`);
        const data = await res.json();
        if (data && data.current) {
            const temp = Math.round(data.current.temperature_2m);
            const wEl = document.getElementById('weatherWidget');
            if (wEl) wEl.innerHTML = `🌤️ <b>${temp}°C</b>`;
        }
    } catch(e) {}
}

// --- Gợi ý từ khóa ---
const suggestionCache = new Map();
let debounceTimer;
function handleInputChange() {
    const input = document.getElementById('searchInput');
    const clearBtn = document.getElementById('clearBtn');
    const query = input.value.trim().toLowerCase();
    if (query.length > 0) {
        clearBtn.style.display = 'block';
        clearTimeout(debounceTimer);
        showLocalHistorySuggestions(query);
        debounceTimer = setTimeout(() => fetchSuggestionsWithCache(query), 150);
    } else {
        clearBtn.style.display = 'none';
        hideSuggestions();
    }
}

function showLocalHistorySuggestions(query) {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const matched = history.filter(item => item.toLowerCase().includes(query));
    if (matched.length > 0) renderSuggestions(matched);
}

async function fetchSuggestionsWithCache(query) {
    if (suggestionCache.has(query)) {
        mergeAndRenderSuggestions(query, suggestionCache.get(query));
        return;
    }
    try {
        const url = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}`;
        const res = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(url)}`);
        const data = await res.json();
        if (data && data.contents) {
            const parsed = JSON.parse(data.contents);
            if (parsed[1] && parsed[1].length > 0) {
                suggestionCache.set(query, parsed[1]);
                mergeAndRenderSuggestions(query, parsed[1]);
            }
        }
    } catch(e) {}
}

function mergeAndRenderSuggestions(query, googleSugs) {
    const history = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    const matched = history.filter(item => item.toLowerCase().includes(query));
    const combined = [...new Set([...matched, ...googleSugs])];
    if (combined.length > 0) renderSuggestions(combined); else hideSuggestions();
}

function renderSuggestions(sugs) {
    const container = document.getElementById('suggestionsContainer');
    container.innerHTML = '';
    sugs.slice(0, 8).forEach(item => {
        const div = document.createElement('div');
        div.className = 'suggestion-item';
        div.textContent = item;
        div.onclick = () => { document.getElementById('searchInput').value = item; hideSuggestions(); triggerDefaultSearch(); };
        container.appendChild(div);
    });
    container.style.display = 'block';
}

function hideSuggestions() {
    const c = document.getElementById('suggestionsContainer');
    if (c) c.style.display = 'none';
}

// --- Cài đặt & Tùy chỉnh ---
function toggleSettings() {
    const o = document.getElementById('settingsOverlay');
    o.style.display = o.style.display === 'flex' ? 'none' : 'flex';
}
function handleBgUpload(e) {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => { localStorage.setItem('bgImage', ev.target.result); applyBackgroundImage(ev.target.result); };
    r.readAsDataURL(f);
}
function applyBackgroundImage(url) {
    if (url) {
        document.body.style.backgroundImage = `url(${url})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundPosition = 'center';
        document.body.style.backgroundAttachment = 'fixed';
    } else { document.body.style.backgroundImage = 'none'; }
}
function removeBgImage() { localStorage.removeItem('bgImage'); applyBackgroundImage(null); }
function changeDefaultEngine(e) { localStorage.setItem('defaultEngine', e.target.value); }

function renderDefaultEngineSelect() {
    const select = document.getElementById('defaultEngineSelect');
    const engines = getEngines();
    const curr = localStorage.getItem('defaultEngine') || 'google';
    select.innerHTML = '';
    engines.filter(e => ['google','coccoc','bing','yahoo','duckduckgo','startpage'].includes(e.id)).forEach(e => {
        const opt = document.createElement('option');
        opt.value = e.id; opt.textContent = e.name;
        if (e.id === curr) opt.selected = true;
        select.appendChild(opt);
    });
}

function addSearchEngine() {
    const name = document.getElementById('customBtnName').value.trim();
    const url = document.getElementById('customBtnUrl').value.trim();
    const color = document.getElementById('customBtnColor').value;
    if (!name || !url) { alert('Vui lòng nhập đầy đủ tên và đường dẫn!'); return; }
    let engines = getEngines();
    engines.push({ id: 'eng_' + Date.now(), name, color, borderColor: color, type: 'custom', url });
    localStorage.setItem('searchEngines', JSON.stringify(engines));
    document.getElementById('customBtnName').value = ''; document.getElementById('customBtnUrl').value = '';
    renderSearchButtons(); renderSettingsEnginesList();
}

function removeSearchEngine(id) {
    if (['notes','camera'].includes(id)) { alert('Không thể xóa nút hệ thống này!'); return; }
    let engines = getEngines().filter(e => e.id !== id);
    localStorage.setItem('searchEngines', JSON.stringify(engines));
    renderSearchButtons(); renderSettingsEnginesList();
}

function renderSettingsEnginesList() {
    const list = document.getElementById('enginesListContainer');
    list.innerHTML = '';
    getEngines().forEach(e => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 4px 8px; background: rgba(0,0,0,0.03); border-radius: 4px; font-size: 13px;';
        div.innerHTML = `<span style="color:${e.color}; font-weight:bold;">${e.name}</span>` + (!['notes','camera'].includes(e.id) ? `<button onclick="removeSearchEngine('${e.id}')" style="background:none; border:none; color:#EA4335; cursor:pointer; font-weight:bold;">Xóa</button>` : '');
        list.appendChild(div);
    });
}

let sortableInstance = null;
function renderSearchButtons() {
    const container = document.getElementById('searchButtonsContainer');
    container.innerHTML = '';
    getEngines().forEach(e => {
        const btn = document.createElement('button');
        btn.className = 'btn';
        btn.style.color = e.color; btn.style.borderColor = e.borderColor || e.color;
        btn.textContent = e.name; btn.setAttribute('data-id', e.id);
        btn.onclick = () => performSearch(e.id);
        container.appendChild(btn);
    });
    if (sortableInstance) sortableInstance.destroy();
    sortableInstance = new Sortable(container, {
        animation: 150,
        onEnd: () => {
            const newEngines = [];
            Array.from(container.children).forEach(el => {
                const found = getEngines().find(e => e.id === el.getAttribute('data-id'));
                if (found) newEngines.push(found);
            });
            localStorage.setItem('searchEngines', JSON.stringify(newEngines));
        }
    });
}

function factoryReset() {
    if (confirm('Khôi phục cài đặt gốc sẽ xóa toàn bộ tùy chỉnh?')) { localStorage.clear(); location.reload(); }
}

// --- Tìm kiếm & Giọng nói ---
function clearSearchInput() {
    const input = document.getElementById('searchInput');
    input.value = ''; document.getElementById('clearBtn').style.display = 'none';
    hideSuggestions(); input.focus();
}

let recognition = null, isListening = false, hasSearched = false;
function toggleVoiceSearch() {
    const SpeechRec = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRec) { alert('Trình duyệt không hỗ trợ tìm kiếm bằng giọng nói.'); return; }
    if (!recognition) {
        recognition = new SpeechRec();
        recognition.lang = 'vi-VN'; recognition.interimResults = true;
        recognition.onstart = () => { isListening = true; hasSearched = false; hideSuggestions(); document.getElementById('voiceOverlay').style.display = 'flex'; };
        recognition.onresult = e => {
            let text = '';
            for (let i = e.resultIndex; i < e.results.length; ++i) text += e.results[i][0].transcript;
            document.getElementById('voiceTranscript').textContent = text;
            document.getElementById('searchInput').value = text;
            handleInputChange();
        };
        recognition.onend = () => {
            isListening = false; document.getElementById('voiceOverlay').style.display = 'none';
            if (document.getElementById('searchInput').value.trim() && !hasSearched) {
                hasSearched = true; triggerDefaultSearch();
            }
        };
    }
    if (isListening) recognition.stop(); else recognition.start();
}
function closeVoiceSearch() { if (recognition) recognition.stop(); document.getElementById('voiceOverlay').style.display = 'none'; }

function triggerDefaultSearch() {
    hideSuggestions();
    performSearch(localStorage.getItem('defaultEngine') || 'google');
}

function performSearch(engineId) {
    hideSuggestions();
    if (engineId === 'notes') { openNotesWorkspace(); return; }
    if (engineId === 'camera') { openCameraWorkspace(); return; }

    const query = document.getElementById('searchInput').value.trim();
    const engine = getEngines().find(e => e.id === engineId);
    if (!engine) return;
    if (query) saveToHistory(query);

    let url = engine.url;
    if (engine.type === 'builtin') {
        if (['gemini','chatgpt'].includes(engine.id)) url = engine.url;
        else url = query === "" ? engine.url.split('?')[0] : engine.url + encodeURIComponent(query);
    } else { url = query === "" ? engine.url : engine.url + encodeURIComponent(query); }
    window.open(url, '_blank', 'noopener,noreferrer');
}

function saveToHistory(q) {
    let h = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    h = h.filter(item => item !== q); h.unshift(q);
    if (h.length > 5) h.pop();
    localStorage.setItem('searchHistory', JSON.stringify(h));
    renderHistory();
}

function renderHistory() {
    const container = document.getElementById('historyContainer');
    const h = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    container.innerHTML = '';
    if (h.length === 0) return;
    h.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.innerHTML = `<span>${item}</span><span class="history-close">×</span>`;
        div.querySelector('span').onclick = () => { document.getElementById('searchInput').value = item; triggerDefaultSearch(); };
        div.querySelector('.history-close').onclick = e => { e.stopPropagation(); removeHistory(item); };
        container.appendChild(div);
    });
    const clearBtn = document.createElement('button');
    clearBtn.className = 'history-clear'; clearBtn.textContent = 'Xóa tất cả ×';
    clearBtn.onclick = () => { localStorage.removeItem('searchHistory'); renderHistory(); };
    container.appendChild(clearBtn);
}
function removeHistory(item) {
    let h = JSON.parse(localStorage.getItem('searchHistory') || '[]').filter(i => i !== item);
    localStorage.setItem('searchHistory', JSON.stringify(h));
    renderHistory();
}

// --- Xác thực tài khoản ---
function togglePasswordVisibility() {
    const p = document.getElementById('authPassword'), b = document.getElementById('togglePassBtn');
    p.type = p.type === 'password' ? 'text' : 'password';
    b.textContent = p.type === 'password' ? '👁️' : '🙈';
}
function handleGuestLogin() {
    localStorage.setItem('currentUser', 'Khách');
    document.getElementById('authOverlay').style.display = 'none';
    document.getElementById('userInfo').style.display = 'flex';
    document.getElementById('currentUsername').textContent = 'Khách';
}
function handleRegister() {
    const u = document.getElementById('authUsername').value.trim(), p = document.getElementById('authPassword').value.trim(), err = document.getElementById('authError');
    if (!u || !p) { err.textContent = 'Nhập đầy đủ thông tin!'; err.style.display = 'block'; return; }
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[u]) { err.textContent = 'Tên tài khoản đã tồn tại!'; err.style.display = 'block'; return; }
    users[u] = p; localStorage.setItem('users', JSON.stringify(users)); localStorage.setItem('currentUser', u);
    location.reload();
}
function handleLogin() {
    const u = document.getElementById('authUsername').value.trim(), p = document.getElementById('authPassword').value.trim(), err = document.getElementById('authError');
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (!users[u] || users[u] !== p) { err.textContent = 'Sai tài khoản hoặc mật khẩu!'; err.style.display = 'block'; return; }
    localStorage.setItem('currentUser', u); location.reload();
}
function logout() { localStorage.removeItem('currentUser'); location.reload(); }
function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    document.getElementById('themeToggleBtn').textContent = isDark ? '☀️' : '🌙';
}
function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') { hideSuggestions(); triggerDefaultSearch(); }
});
