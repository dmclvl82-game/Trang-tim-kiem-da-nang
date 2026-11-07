const defaultEngines = [
    { id: 'google', name: 'Google', color: '#1a0dab', borderColor: '#4285F4', type: 'builtin', url: 'https://www.google.com/search?q=' },
    { id: 'bing', name: 'Bing', color: '#0078d4', borderColor: '#0078d4', type: 'builtin', url: 'https://www.bing.com/search?q=' },
    { id: 'coccoc', name: 'Cốc Cốc', color: '#008f5d', borderColor: '#008f5d', type: 'builtin', url: 'https://coccoc.com/search?q=' },
    { id: 'yahoo', name: 'Yahoo!', color: '#6001d2', borderColor: '#6001d2', type: 'builtin', url: 'https://vn.search.yahoo.com/search?p=' },
    { id: 'duckduckgo', name: 'DuckDuckGo', color: '#de5833', borderColor: '#de5833', type: 'builtin', url: 'https://duckduckgo.com/?q=' },
    { id: 'startpage', name: 'Startpage', color: '#3b5998', borderColor: '#3b5998', type: 'builtin', url: 'https://www.startpage.com/do/search?q=' },
    { id: 'youtube', name: 'YouTube', color: '#ff0000', borderColor: '#ff0000', type: 'builtin', url: 'https://www.youtube.com' },
    { id: 'tiktok', name: 'TikTok', color: '#010101', borderColor: '#010101', type: 'builtin', url: 'https://www.tiktok.com' },
    { id: 'facebook', name: 'Facebook', color: '#1877f2', borderColor: '#1877f2', type: 'builtin', url: 'https://www.facebook.com/' },
    { id: 'shopee', name: 'Shopee', color: '#ee4d2d', borderColor: '#ee4d2d', type: 'builtin', url: 'https://shopee.com' },
    { id: 'gemini', name: 'Gemini', color: '#4285F4', borderColor: '#4285F4', type: 'builtin', url: 'https://gemini.google.com' },
    { id: 'chatgpt', name: 'ChatGPT', color: '#10a37f', borderColor: '#10a37f', type: 'builtin', url: 'https://chatgpt.com' },
    { id: 'notes', name: 'Note (Ghi chú)', color: '#f59e0b', borderColor: '#f59e0b', type: 'builtin', url: 'notes' },
    { id: 'camera', name: 'Camera', color: '#6366f1', borderColor: '#6366f1', type: 'builtin', url: 'camera' },
    { id: 'matrix', name: 'Định thức (Ma trận)', color: '#7c3aed', borderColor: '#7c3aed', type: 'builtin', url: 'matrix' },
    { id: 'cpp', name: 'Học C++', color: '#2563eb', borderColor: '#2563eb', type: 'builtin', url: 'cpp' }
]; 

// Các nút hệ thống (mở workspace riêng, không thể xóa)
const SYSTEM_ENGINE_IDS = ['notes', 'camera', 'matrix', 'cpp'];

// --- Công tắc hiển thị: Game Dino & Nhân vật pixel ---
function applyDisplayToggles() {
    const showDino = localStorage.getItem('showDinoGame') !== '0';
    const showChar = localStorage.getItem('showCharacter') !== '0';
    const widget = document.querySelector('.dino-widget');
    if (widget) widget.style.display = showDino ? 'block' : 'none';
    const ch = document.getElementById('character');
    const bb = document.getElementById('bubble');
    if (ch) ch.style.display = showChar ? '' : 'none';
    if (bb) bb.style.display = showChar ? '' : 'none';
    const cbDino = document.getElementById('showDinoToggle');
    const cbChar = document.getElementById('showCharacterToggle');
    if (cbDino) cbDino.checked = showDino;
    if (cbChar) cbChar.checked = showChar;
}
function toggleDinoVisibility() {
    const show = document.getElementById('showDinoToggle').checked;
    localStorage.setItem('showDinoGame', show ? '1' : '0');
    const widget = document.querySelector('.dino-widget');
    if (widget) widget.style.display = show ? 'block' : 'none';
}
function toggleCharacterVisibility() {
    const show = document.getElementById('showCharacterToggle').checked;
    localStorage.setItem('showCharacter', show ? '1' : '0');
    const ch = document.getElementById('character');
    const bb = document.getElementById('bubble');
    if (ch) ch.style.display = show ? '' : 'none';
    if (bb) bb.style.display = show ? '' : 'none';
}

function getEngines() {
    const stored = localStorage.getItem('searchEngines');
    if (stored) {
        try {
            const list = JSON.parse(stored);
            // Người dùng cũ đã lưu danh sách nút: tự bổ sung các nút hệ thống mới (vd: Định thức)
            defaultEngines.forEach(d => {
                if (SYSTEM_ENGINE_IDS.includes(d.id) && !list.some(e => e.id === d.id)) list.push({ ...d });
            });
            return list;
        } catch (e) {}
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
        document.getElementById('themeToggleCheckbox').checked = true;
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
    applyDisplayToggles();

    document.addEventListener('click', (e) => {
        if (!e.target.closest('.searchbar')) { hideSuggestions(); }
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
            const maxLeft = Math.max(0, window.innerWidth - widget.offsetWidth);
            const maxTop = Math.max(0, window.innerHeight - widget.offsetHeight);
            widget.style.top = Math.min(Math.max(0, pos.top), maxTop) + 'px';
            widget.style.left = Math.min(Math.max(0, pos.left), maxLeft) + 'px';
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
            const maxLeft = Math.max(0, window.innerWidth - rect.width);
            const maxTop = Math.max(0, window.innerHeight - rect.height);
            const clampedLeft = Math.min(Math.max(0, rect.left), maxLeft);
            const clampedTop = Math.min(Math.max(0, rect.top), maxTop);
            widget.style.left = clampedLeft + 'px';
            widget.style.top = clampedTop + 'px';
            localStorage.setItem('widgetPos', JSON.stringify({ top: clampedTop, left: clampedLeft }));
        }
    });
}

// --- Workspace Ghi chú & Checklist ---
let draftChecklistItems = [];

function getNotesStorageKey() {
    return 'userNotes_' + (localStorage.getItem('currentUser') || 'Khách');
}

function openNotesWorkspace() {
    toggleMainElements(false);
    document.getElementById('notesWorkspace').style.display = 'block';
    draftChecklistItems = [];
    document.getElementById('wsNoteTitle').value = '';
    document.getElementById('wsNewItemInput').value = '';
    renderDraftChecklist();
    renderWorkspaceNotesList();
}

function closeNotesWorkspace() {
    toggleMainElements(true);
    document.getElementById('notesWorkspace').style.display = 'none';
}

function addDraftChecklistItem() {
    const input = document.getElementById('wsNewItemInput');
    const val = input.value.trim();
    if (!val) {
        input.focus();
        return;
    }
    draftChecklistItems.push({ text: val, checked: false });
    input.value = '';
    input.focus();
    renderDraftChecklist();
}

function removeDraftChecklistItem(index) {
    draftChecklistItems.splice(index, 1);
    renderDraftChecklist();
}

function renderDraftChecklist() {
    const container = document.getElementById('wsDraftItemsContainer');
    if (!container) return;
    
    if (draftChecklistItems.length === 0) {
        container.innerHTML = '<span style="font-size: 12px; color: #9aa0a6; font-style: italic;">Chưa có mục việc nào được thêm vào danh sách nháp.</span>';
        return;
    }

    container.innerHTML = '';
    draftChecklistItems.forEach((item, index) => {
        const div = document.createElement('div');
        div.style.cssText = 'display: flex; justify-content: space-between; align-items: center; padding: 8px 12px; background: rgba(66, 133, 244, 0.08); border-radius: 6px; font-size: 13px; border: 1px solid rgba(66, 133, 244, 0.2);';
        div.innerHTML = `<span style="font-weight: 500;">📌 ${escapeHtml(item.text)}</span><button onclick="removeDraftChecklistItem(${index})" style="background:none; border:none; color:#EA4335; cursor:pointer; font-weight:bold; font-size: 14px; padding: 2px 6px;">✕</button>`;
        container.appendChild(div);
    });
}

function saveWorkspaceNote() {
    const titleInput = document.getElementById('wsNoteTitle');
    const title = titleInput.value.trim();
    
    if (!title && draftChecklistItems.length === 0) { 
        alert('Vui lòng nhập tiêu đề hoặc thêm ít nhất một mục checklist!'); 
        return; 
    }
    
    let notes = JSON.parse(localStorage.getItem(getNotesStorageKey()) || '[]');
    notes.unshift({ 
        id: 'note_' + Date.now(), 
        title: title || 'Danh sách công việc', 
        items: [...draftChecklistItems], 
        date: new Date().toLocaleString('vi-VN') 
    });
    localStorage.setItem(getNotesStorageKey(), JSON.stringify(notes));
    
    // Reset form
    titleInput.value = ''; 
    document.getElementById('wsNewItemInput').value = '';
    draftChecklistItems = [];
    renderDraftChecklist();
    renderWorkspaceNotesList();
}

function deleteWorkspaceNote(id) {
    let notes = JSON.parse(localStorage.getItem(getNotesStorageKey()) || '[]');
    notes = notes.filter(n => n.id !== id);
    localStorage.setItem(getNotesStorageKey(), JSON.stringify(notes));
    renderWorkspaceNotesList();
}

function toggleChecklistItem(noteId, itemIndex) {
    let notes = JSON.parse(localStorage.getItem(getNotesStorageKey()) || '[]');
    const note = notes.find(n => n.id === noteId);
    if (note && note.items && note.items[itemIndex]) {
        note.items[itemIndex].checked = !note.items[itemIndex].checked;
        localStorage.setItem(getNotesStorageKey(), JSON.stringify(notes));
        renderWorkspaceNotesList();
    }
}

function renderWorkspaceNotesList() {
    const container = document.getElementById('wsNotesListContainer');
    if (!container) return;
    const notes = JSON.parse(localStorage.getItem(getNotesStorageKey()) || '[]');
    container.innerHTML = notes.length === 0 ? '<span style="font-size: 13px; color: #9aa0a6;">Chưa có ghi chú nào được lưu.</span>' : '';
    
    notes.forEach(note => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 12px; background: rgba(0,0,0,0.03); border-radius: 8px; border: 1px solid #dadce0; font-size: 13px;';
        
        let itemsHtml = '';
        if (note.items && note.items.length > 0) {
            itemsHtml = '<div style="display: flex; flex-direction: column; gap: 6px; margin-top: 6px;">';
            note.items.forEach((it, idx) => {
                const styleLine = it.checked ? 'text-decoration: line-through; color: #9aa0a6;' : '';
                itemsHtml += `<label style="display: flex; align-items: center; gap: 8px; cursor: pointer; ${styleLine}">
                    <input type="checkbox" ${it.checked ? 'checked' : ''} onchange="toggleChecklistItem('${note.id}', ${idx})" style="cursor: pointer; width: 16px; height: 16px;">
                    <span>${escapeHtml(it.text)}</span>
                </label>`;
            });
            itemsHtml += '</div>';
        }

        item.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
                <strong style="color: #f59e0b; font-size: 14px;">${escapeHtml(note.title)}</strong>
                <button onclick="deleteWorkspaceNote('${note.id}')" style="background:none; border:none; color:#EA4335; cursor:pointer; font-weight:bold; font-size: 14px;">✕</button>
            </div>
            ${itemsHtml}
            <div style="margin-top: 8px; text-align: right;"><span style="font-size: 11px; color: #9aa0a6;">${note.date}</span></div>
        `;
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
    document.querySelector('.searchbar').style.display = val;
    document.getElementById('historyContainer').style.display = show ? 'flex' : 'none';
    document.getElementById('searchButtonsContainer').style.display = show ? 'flex' : 'none';
    document.getElementById('notesWorkspace').style.display = 'none';
    document.getElementById('cameraWorkspace').style.display = 'none';
    const matrixWs = document.getElementById('matrixWorkspace');
    if (matrixWs) matrixWs.style.display = 'none';
    const cppWs = document.getElementById('cppWorkspace');
    if (cppWs) cppWs.style.display = 'none';
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
    } catch(e) {
        const wEl = document.getElementById('weatherWidget');
        if (wEl) wEl.textContent = '🌤️ Không có dữ liệu';
    }
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
    // Bỏ qua kết quả trả về trễ không còn khớp với nội dung đang gõ
    const currentQuery = document.getElementById('searchInput').value.trim().toLowerCase();
    if (currentQuery !== query) return;

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

// Xử lý áp dụng hình nền từ đường dẫn URL
function handleBgUrlApply() {
    const input = document.getElementById('bgUrlInput');
    const url = input.value.trim();
    
    if (!url || !isValidHttpUrl(url)) {
        alert('Vui lòng nhập đường dẫn hình nền hợp lệ (bắt đầu bằng http:// hoặc https://)!');
        input.focus();
        return;
    }
    
    localStorage.setItem('bgImage', url);
    applyBackgroundImage(url);
    input.value = '';
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
    if (!isValidHttpUrl(url)) { alert('Đường dẫn không hợp lệ! Vui lòng nhập URL bắt đầu bằng http:// hoặc https://'); return; }
    let engines = getEngines();
    engines.push({ id: 'eng_' + Date.now(), name, color, borderColor: color, type: 'custom', url });
    localStorage.setItem('searchEngines', JSON.stringify(engines));
    document.getElementById('customBtnName').value = ''; document.getElementById('customBtnUrl').value = '';
    renderSearchButtons(); renderSettingsEnginesList();
}

function removeSearchEngine(id) {
    if (SYSTEM_ENGINE_IDS.includes(id)) { alert('Không thể xóa nút hệ thống này!'); return; }
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
        div.innerHTML = `<span style="color:${e.color}; font-weight:bold;">${e.name}</span>` + (!SYSTEM_ENGINE_IDS.includes(e.id) ? `<button onclick="removeSearchEngine('${e.id}')" style="background:none; border:none; color:#EA4335; cursor:pointer; font-weight:bold;">Xóa</button>` : '');
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
    const engines = getEngines();
    let defaultId = localStorage.getItem('defaultEngine') || 'google';
    // Nếu công cụ mặc định đã bị xóa khỏi danh sách, dùng công cụ đầu tiên còn lại thay thế
    if (!engines.find(e => e.id === defaultId)) {
        defaultId = engines.length > 0 ? engines[0].id : 'google';
    }
    performSearch(defaultId);
}

function performSearch(engineId) {
    hideSuggestions();
    if (engineId === 'notes') { openNotesWorkspace(); return; }
    if (engineId === 'camera') { openCameraWorkspace(); return; }
    if (engineId === 'matrix') { openMatrixWorkspace(); return; }
    if (engineId === 'cpp') { openCppWorkspace(); return; }

    const query = document.getElementById('searchInput').value.trim();
    const engine = getEngines().find(e => e.id === engineId);
    if (!engine) return;
    if (query) saveToHistory(query);

    let url = engine.url;
    if (engine.type === 'builtin') {
        if (['gemini','chatgpt'].includes(engine.id)) {
            url = engine.url;
        } else if (engine.id === 'facebook') {
            url = query === "" ? 'https://www.facebook.com/' : 'https://www.facebook.com/search/top?q=' + encodeURIComponent(query);
        } else {
            url = query === "" ? engine.url.split('?')[0] : engine.url + encodeURIComponent(query);
        }
    } else { 
        url = query === "" ? engine.url : engine.url + encodeURIComponent(query); 
    }
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
    if (h.length === 0) { container.innerHTML = '<span class="history-empty">Chưa có lịch sử tìm kiếm.</span>'; return; }
    h.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.tabIndex = 0; div.setAttribute('role', 'button');
        div.title = 'Enter: tìm lại · Delete: xóa mục này';
        div.onkeydown = ev => {
            if (ev.key === 'Enter') { document.getElementById('searchInput').value = item; triggerDefaultSearch(); }
            else if (ev.key === 'Delete' || ev.key === 'Backspace') { ev.preventDefault(); removeHistory(item); }
        };
        div.innerHTML = `<span>${escapeHtml(item)}</span><span class="history-close" role="button" aria-label="Xóa mục này" title="Xóa mục này">×</span>`;
        div.querySelector('span').onclick = () => { document.getElementById('searchInput').value = item; triggerDefaultSearch(); };
        div.querySelector('.history-close').onclick = e => { e.stopPropagation(); removeHistory(item); };
        container.appendChild(div);
    });
    const clearBtn = document.createElement('button');
    clearBtn.className = 'history-clear'; clearBtn.textContent = 'Xóa tất cả ×';
    clearBtn.onclick = () => { if (confirm('Xóa toàn bộ lịch sử tìm kiếm?')) { localStorage.removeItem('searchHistory'); renderHistory(); } };
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
// Băm mật khẩu bằng SHA-256 trước khi lưu (tránh lưu plaintext trong localStorage)
async function hashPassword(password) {
    const data = new TextEncoder().encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, '0')).join('');
}

async function handleRegister() {
    const u = document.getElementById('authUsername').value.trim(), p = document.getElementById('authPassword').value.trim(), err = document.getElementById('authError');
    if (!u || !p) { err.textContent = 'Nhập đầy đủ thông tin!'; err.style.display = 'block'; return; }
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    if (users[u]) { err.textContent = 'Tên tài khoản đã tồn tại!'; err.style.display = 'block'; return; }
    users[u] = await hashPassword(p); localStorage.setItem('users', JSON.stringify(users)); localStorage.setItem('currentUser', u);
    location.reload();
}
async function handleLogin() {
    const u = document.getElementById('authUsername').value.trim(), p = document.getElementById('authPassword').value.trim(), err = document.getElementById('authError');
    let users = JSON.parse(localStorage.getItem('users') || '{}');
    const hashed = await hashPassword(p);
    if (!users[u] || users[u] !== hashed) { err.textContent = 'Sai tài khoản hoặc mật khẩu!'; err.style.display = 'block'; return; }
    localStorage.setItem('currentUser', u); location.reload();
}
function logout() { localStorage.removeItem('currentUser'); location.reload(); }
function toggleTheme() {
    const checkbox = document.getElementById('themeToggleCheckbox');
    const isDark = checkbox.checked;
    if (isDark) {
        document.body.classList.add('dark-mode');
    } else {
        document.body.classList.remove('dark-mode');
    }
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
}
// Kiểm tra URL hợp lệ (chỉ chấp nhận http/https, chặn javascript: và các chuỗi không phải URL)
function isValidHttpUrl(str) {
    try {
        const u = new URL(str);
        return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (e) { return false; }
}

function escapeHtml(str) {
    return str.replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));
}

document.getElementById('searchInput').addEventListener('keydown', e => {
    if (e.key === 'Enter') { hideSuggestions(); triggerDefaultSearch(); }
});
// ==========================================
// THÔNG BÁO KHI NHẤP CHUỘT PHẢI HOẶC NHẤN GIỮ (MOBILE)
// ==========================================
let toastTimeout;

function showRightClickToast() {
    const toast = document.getElementById('rightClickToast');
    if (!toast) return;

    // Hiển thị thông báo
    toast.classList.add('show');

    // Xóa bộ đếm thời gian cũ nếu thao tác liên tục
    clearTimeout(toastTimeout);

    // Tự động ẩn sau 2.5 giây
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2500);
}

// 1. Dành cho Máy tính (Click chuột phải)
document.addEventListener('contextmenu', (e) => {
    // Nếu muốn chặn menu chuột phải / menu chọn văn bản mặc định, mở comment dòng dưới:
    // e.preventDefault(); 
    showRightClickToast();
});

// 2. Dành cho Thiết bị di động (Nhấn giữ lâu - Long Press)
let touchTimer = null;

document.addEventListener('touchstart', (e) => {
    // Bắt đầu đếm thời gian khi chạm vào màn hình (500ms được tính là nhấn giữ)
    touchTimer = setTimeout(() => {
        showRightClickToast();
    }, 500);
}, { passive: true });

document.addEventListener('touchend', () => {
    // Nếu buông tay ra trước 500ms thì hủy đếm (chỉ là chạm nhanh)
    if (touchTimer) clearTimeout(touchTimer);
});

document.addEventListener('touchmove', () => {
    // Nếu vuốt/cuộn trang thì hủy đếm
    if (touchTimer) clearTimeout(touchTimer);
});
// ==========================================
// LOGIC ĐIỀU KHIỂN NHÂN VẬT & BÓNG THOẠI
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const character = document.getElementById("character");
  const bubble = document.getElementById("bubble");

  if (!character || !bubble) {
    console.error("Không tìm thấy thẻ #character hoặc #bubble trong HTML!");
    return;
  }

  // Khai báo bộ câu thoại phong phú theo từng ngữ cảnh
  const DIALOGUES = {
    click: [
      "Đi thôi nào!",
      "Tới đó ngay đây!",
      "Đợi mình chút nhé!",
      "Đi khám phá thôi!",
      "OK, xuất phát!",
      "Đang đến đây~",
      "Theo chân mình nào!"
    ],
    // Các câu thoại chào mừng khi vừa di chuyển tới điểm mới
    greeting: [
      "Xin chào tôi là Hồ Hiếu Nghĩa , là web developer của trang này.",
      "Chào mừng bạn đến với trang web!",
      "Đã tới nơi rồi nè, chào bạn!",
      "Xin chào! Chúc bạn một ngày tốt lành!",
      "Hề lố! Rất vui được gặp bạn~",
      "Đã tới điểm hẹn rồi nhé!"
    ],
    idle: [
      "Hôm nay trời đẹp thật!",
      "Đang suy nghĩ gì đó...",
      "Nghỉ chân chút đã~",
      "Bạn có cần mình giúp gì không?",
      "Lalalala... ♪",
      "Trang web này thú vị quá!",
      "Đang đứng ngắm cảnh..."
    ],
    jump: [
      "Bật cao lên!",
      "Hế-tô!",
      "Nhảy nè!",
      "Ui chao!"
    ]
  };

  function getRandomPhrase(type) {
    const list = DIALOGUES[type] || DIALOGUES.idle;
    return list[Math.floor(Math.random() * list.length)];
  }

  const state = {
    x: window.innerWidth * 0.5,
    y: window.innerHeight * 0.65,
    tx: window.innerWidth * 0.5,
    ty: window.innerHeight * 0.65,
    speed: 0.09, // Tốc độ di chuyển (đi bộ thong thả)
    mode: "idle",
    facing: 1,
    jumpTimer: 0,
    idleTalkTimer: 0,
    pauseTimer: 0,    // Đếm ngược thời gian đứng yên tạm thời (ms)
    isMoving: false,  // Đánh dấu nhân vật có đang trong trạng thái di chuyển hay không
    action: null,     // Hành động đặc biệt khi đứng yên: "wave" | "adjust-tie"
    actionTimer: 0    // Thời gian còn lại của hành động đặc biệt (ms)
  };

  let tapCount = 0;           // đếm số lần chạm vào nhân vật
  const WAVE_MS = 2000;       // 1 vòng vẫy tay = 24 khung
  const TIE_MS = 2000;        // 1 vòng chỉnh cà vạt = 24 khung
  const JUMP_MS = 900;        // 1 vòng nhảy = 24 khung

  function clamp(v, min, max) {
    return Math.max(min, Math.min(max, v));
  }

  function newDestination() {
    const margin = 70;
    state.tx = margin + Math.random() * Math.max(1, window.innerWidth - margin * 2);
    state.ty = margin + Math.random() * Math.max(1, window.innerHeight - margin * 2);
  }

  function setMode(mode) {
    if (state.mode === mode) return;
    state.mode = mode;
    character.className = "character " + mode;
  }

  function speak(text) {
    bubble.textContent = text;
    bubble.classList.add("show");
    clearTimeout(speak.timer);
    speak.timer = setTimeout(() => bubble.classList.remove("show"), 2200);
  }

  function update(dt) {
    const dx = state.tx - state.x;
    const dy = state.ty - state.y;
    const dist = Math.hypot(dx, dy);

    if (dist < 6) {
      // Vừa di chuyển tới nơi: vẫy tay chào + nói câu chào, đứng yên 2 - 3 giây
      if (state.isMoving) {
        state.isMoving = false;
        state.jumpTimer = 0;
        state.pauseTimer = WAVE_MS + Math.random() * 1000;
        state.action = "wave";
        state.actionTimer = WAVE_MS;
        speak(getRandomPhrase("greeting"));
      }

      // Đang thực hiện hành động đặc biệt (vẫy tay / chỉnh cà vạt) thì giữ nguyên tới khi hết 1 vòng
      if (state.jumpTimer > 0) {
        state.jumpTimer -= dt;
        setMode("jump");
      } else if (state.actionTimer > 0) {
        state.actionTimer -= dt;
        setMode(state.action);
      } else {
        state.action = null;
        setMode("idle");
      }

      // Nếu đang trong thời gian đứng yên tạm thời thì giảm bộ đếm và không nhận điểm di chuyển mới
      if (state.pauseTimer > 0) {
        state.pauseTimer -= dt;
      } else {
        // Hết thời gian tạm dừng -> Chuyển sang trạng thái rảnh rỗi bình thường
        state.idleTalkTimer += dt;
        if (state.idleTalkTimer > 2500) {
          state.idleTalkTimer = 0;
          const r = Math.random();
          if (r < 0.6) {
            // Chỉnh lại cà vạt (1 vòng 24 khung)
            state.action = "adjust-tie";
            state.actionTimer = TIE_MS;
            setMode("adjust-tie");
          } else if (r < 0.85) {
            speak(getRandomPhrase("idle"));
          }
        }

        // Tự động chọn điểm đi dạo tiếp theo khi rảnh rỗi
        if (Math.random() < 0.0015) newDestination();
      }
    } else {
      // Đang trên đường di chuyển
      state.isMoving = true;
      state.idleTalkTimer = 0;
      state.action = null;
      state.actionTimer = 0;
      state.facing = dx >= 0 ? 1 : -1;

      const step = Math.min(dist, state.speed * dt);
      state.x += (dx / dist) * step;
      state.y += (dy / dist) * step;

      // Thỉnh thoảng nhảy ngẫu nhiên khi đang đi
      if (state.jumpTimer <= 0 && Math.random() < 0.0012) {
        state.jumpTimer = JUMP_MS;
        speak(getRandomPhrase("jump"));
      }

      if (state.jumpTimer > 0) {
        state.jumpTimer -= dt;
        setMode("jump");
      } else {
        setMode("walk");
      }
    }

    const margin = 35;
    state.x = clamp(state.x, margin, window.innerWidth - margin);
    state.y = clamp(state.y, margin, window.innerHeight - margin);

    const posX = Math.round(state.x - 56);
    const posY = Math.round(state.y - 56);

    character.style.transform = `translate(${posX}px, ${posY}px) scaleX(${state.facing})`;
    bubble.style.left = Math.round(state.x) + "px";
    bubble.style.top = Math.round(state.y - 58) + "px";
  }

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(32, now - last);
    last = now;
    update(dt);
    requestAnimationFrame(loop);
  }

  window.addEventListener("resize", () => {
    state.x = clamp(state.x, 35, window.innerWidth - 35);
    state.y = clamp(state.y, 35, window.innerHeight - 35);
  });

  // Sự kiện nhấp chuột / chạm màn hình
  document.addEventListener("pointerdown", (e) => {
    if (e.target.closest("button, input, select, textarea, a")) return;

    // Chạm/nhấp trúng người nhân vật -> làm hành động (xoay vòng), không di chuyển
    if (Math.abs(e.clientX - state.x) < 40 && Math.abs(e.clientY - state.y) < 56) {
      const list = ["adjust-tie", "wave", "jump", "matrix"];
      triggerAction(list[tapCount % list.length]);
      tapCount++;
      return;
    }

    state.tx = e.clientX;
    state.ty = e.clientY;
    speak(getRandomPhrase("click"));
  });

  // ===== HIỆU ỨNG MÃ NHỊ PHÂN RƠI TOÀN TRANG (kéo dài 2 giây) =====
  const MATRIX_MS = 2000;
  const matrixFx = { overlay: null, timer: null, fadeTimer: null, stopTimer: null };

  function stopMatrix() {
    clearInterval(matrixFx.timer);
    clearTimeout(matrixFx.fadeTimer);
    clearTimeout(matrixFx.stopTimer);
    if (matrixFx.overlay) matrixFx.overlay.remove();
    matrixFx.overlay = null;
    document.body.classList.remove("matrix-on");
  }

  function startMatrix() {
    stopMatrix();
    const overlay = document.createElement("div");
    overlay.className = "matrix-overlay";
    const canvas = document.createElement("canvas");
    overlay.appendChild(canvas);
    document.body.appendChild(overlay);
    matrixFx.overlay = overlay;

    const ctx = canvas.getContext("2d");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const binary = "01";
    const fontSize = 16;
    const columns = Math.ceil(canvas.width / fontSize);
    const rainDrops = [];
    for (let i = 0; i < columns; i++) {
      rainDrops[i] = Math.random() * -20;   // so le vị trí bắt đầu phía trên màn hình
    }

    function draw() {
      // Lớp phủ đen mờ tạo vệt đuôi mờ dần
      ctx.fillStyle = "rgba(0, 0, 0, 0.05)";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = "#0F0";
      ctx.font = fontSize + "px monospace";
      for (let i = 0; i < rainDrops.length; i++) {
        const text = binary.charAt(Math.floor(Math.random() * binary.length));
        const x = i * fontSize;
        const y = rainDrops[i] * fontSize;
        ctx.fillText(text, x, y);
        if (y > canvas.height && Math.random() > 0.975) {
          rainDrops[i] = 0;
        }
        rainDrops[i]++;
      }
    }
    draw();
    matrixFx.timer = setInterval(draw, 30);

    document.body.classList.add("matrix-on");
    requestAnimationFrame(() => overlay.classList.add("show"));            // hiện dần
    matrixFx.fadeTimer = setTimeout(() => overlay.classList.remove("show"), MATRIX_MS - 350); // mờ dần
    matrixFx.stopTimer = setTimeout(stopMatrix, MATRIX_MS);                // hết 2 giây
  }

  // Kích hoạt nhanh một hành động tại chỗ: "adjust-tie" | "wave" | "jump" | "matrix"
  function triggerAction(name) {
    state.tx = state.x; state.ty = state.y;      // dừng lại tại chỗ
    state.isMoving = false;
    state.jumpTimer = 0;
    state.action = null; state.actionTimer = 0;
    // Khởi động lại hoạt ảnh từ khung đầu tiên
    character.className = "character";
    void character.offsetWidth;
    state.mode = "";
    if (name === "adjust-tie") {
      state.action = "adjust-tie"; state.actionTimer = TIE_MS;
      state.pauseTimer = TIE_MS + 500;
      setMode("adjust-tie");
    } else if (name === "matrix") {
      // Động tác thứ 4: dùng hoạt ảnh chỉnh cà vạt + mã nhị phân rơi toàn trang trong 2 giây
      state.action = "adjust-tie"; state.actionTimer = MATRIX_MS;
      state.pauseTimer = MATRIX_MS + 500;
      setMode("adjust-tie");
      startMatrix();
      speak("Đang giải mã dữ liệu... 0101");
    } else if (name === "wave") {
      state.action = "wave"; state.actionTimer = WAVE_MS;
      state.pauseTimer = WAVE_MS + 500;
      setMode("wave");
      speak(getRandomPhrase("greeting"));
    } else {
      state.jumpTimer = JUMP_MS;
      state.pauseTimer = JUMP_MS + 300;
      setMode("jump");
      speak(getRandomPhrase("jump"));
    }
  }

  // Máy tính: phím tắt (không hoạt động khi đang gõ trong ô nhập)
  //   T = chỉnh cà vạt, W = vẫy tay chào, J = nhảy, A = mã nhị phân (động tác 4)
  window.addEventListener("keydown", (e) => {
    if (e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
    if (e.target && e.target.closest && e.target.closest("input, textarea, select, [contenteditable]")) return;
    // Dùng e.code (vị trí phím) để chạy được cả khi đang bật bộ gõ tiếng Việt (Telex/VNI)
    const k = (e.code || "").toLowerCase();
    if (k === "keyt") triggerAction("adjust-tie");
    else if (k === "keyw") triggerAction("wave");
    else if (k === "keyj") triggerAction("jump");
    else if (k === "keya") triggerAction("matrix");
  }, true);
  console.log("[UniSearchVN] Nhân vật v24h đã tải. Phím: T = chỉnh cà vạt, W = vẫy tay, J = nhảy, A = mã nhị phân; chạm vào nhân vật 4 lần để ra động tác thứ 4.");

  requestAnimationFrame(loop);
});

// ==========================================
// WORKSPACE: TÍNH ĐỊNH THỨC MA TRẬN (n × n)
// ==========================================
(function () {
    'use strict';

    const MAX_N = 10;          // Cỡ ma trận tối đa
    const LAPLACE_MAX_N = 8;   // Laplace có độ phức tạp n! nên giới hạn cỡ ma trận
    const MATHJAX_SRC = 'https://cdn.jsdelivr.net/npm/mathjax@3/es5/tex-mml-chtml.js';

    let dim = 3;
    let lastStepsText = '';
    let guideTypeset = false;
    let mathJaxPromise = null;
    let mathJaxWarned = false;
    let typesetChain = Promise.resolve();
    let toastTimer = null;

    const $ = (id) => document.getElementById(id);

    // ---------- Phân số chính xác (BigInt, không bị tràn số) ----------
    function bgcd(a, b) {
        if (a < 0n) a = -a;
        if (b < 0n) b = -b;
        while (b) { [a, b] = [b, a % b]; }
        return a;
    }

    class Fraction {
        constructor(num, den = 1n) {
            num = BigInt(num); den = BigInt(den);
            if (den === 0n) throw new Error('Mẫu số không thể bằng 0.');
            if (den < 0n) { num = -num; den = -den; }
            const g = bgcd(num, den);
            this.num = num / g;
            this.den = den / g;
        }
        add(f) { return new Fraction(this.num * f.den + f.num * this.den, this.den * f.den); }
        sub(f) { return new Fraction(this.num * f.den - f.num * this.den, this.den * f.den); }
        mul(f) { return new Fraction(this.num * f.num, this.den * f.den); }
        div(f) {
            if (f.num === 0n) throw new Error('Phép chia cho 0.');
            return new Fraction(this.num * f.den, this.den * f.num);
        }
        isZero() { return this.num === 0n; }
        toTex() {
            if (this.den === 1n) return `${this.num}`;
            if (this.num < 0n) return `-\\frac{${-this.num}}{${this.den}}`;
            return `\\frac{${this.num}}{${this.den}}`;
        }
        toString() { return this.den === 1n ? `${this.num}` : `${this.num}/${this.den}`; }
        toNumber() { return Number(this.num) / Number(this.den); }
        // Dạng TeX dùng làm thừa số trong tích: số âm được đặt trong ngoặc
        toTexFactor() { return this.num < 0n ? `(${this.toTex()})` : this.toTex(); }
    }

    // Đọc số thập phân (chấp nhận cả dấu "." và dấu "," kiểu Việt Nam)
    function parseDecimal(s) {
        const m = /^([+-]?)(\d*)(?:[.,](\d*))?$/.exec(s);
        if (!m) return null;
        const intPart = m[2] || '';
        const fracPart = m[3] || '';
        if (!intPart && !fracPart) return null;
        let num = BigInt((intPart || '0') + fracPart);
        if (m[1] === '-') num = -num;
        return new Fraction(num, 10n ** BigInt(fracPart.length));
    }

    // Trả về Fraction, hoặc null nếu ô nhập không hợp lệ. Ô trống = 0.
    function parseCell(raw) {
        const s = String(raw).replace(/\s+/g, '').replace(/−/g, '-');
        if (s === '') return new Fraction(0n);
        const parts = s.split('/');
        if (parts.length > 2) return null;
        const a = parseDecimal(parts[0]);
        if (!a) return null;
        if (parts.length === 1) return a;
        const b = parseDecimal(parts[1]);
        if (!b || b.isZero()) return null;
        return a.div(b);
    }

    // ---------- Giao diện nhập ma trận ----------
    const cell = (i, j) => $(`mxCell_${i}_${j}`);

    function renderGrid(n, keep) {
        const grid = $('mxGrid');
        grid.style.gridTemplateColumns = `repeat(${n}, auto)`;
        grid.innerHTML = '';
        for (let i = 0; i < n; i++) {
            for (let j = 0; j < n; j++) {
                const input = document.createElement('input');
                input.type = 'text';
                input.id = `mxCell_${i}_${j}`;
                input.className = 'mx-cell';
                input.placeholder = '0';
                input.maxLength = 12;
                input.autocomplete = 'off';
                input.setAttribute('aria-label', `Phần tử hàng ${i + 1}, cột ${j + 1}`);
                if (keep && keep[i] && keep[i][j] !== undefined) input.value = keep[i][j];
                input.addEventListener('focus', () => input.select());
                input.addEventListener('input', () => input.classList.remove('mx-invalid'));
                input.addEventListener('keydown', (e) => onCellKey(e, i, j, n));
                grid.appendChild(input);
            }
        }
    }

    function onCellKey(e, r, c, n) {
        const el = e.target;
        let tr = r, tc = c;
        switch (e.key) {
            case 'ArrowRight':
                if (el.selectionEnd !== el.value.length) return;
                tc = (c + 1) % n; break;
            case 'ArrowLeft':
                if (el.selectionStart !== 0) return;
                tc = (c - 1 + n) % n; break;
            case 'ArrowDown': tr = (r + 1) % n; break;
            case 'ArrowUp': tr = (r - 1 + n) % n; break;
            case 'Enter':
                if (r === n - 1 && c === n - 1) { e.preventDefault(); calculate(); return; }
                tc = (c + 1) % n;
                if (tc === 0) tr = (r + 1) % n;
                break;
            default: return;
        }
        e.preventDefault();
        const next = cell(tr, tc);
        if (next) next.focus();
    }

    function changeDimension(n) {
        n = Math.max(1, Math.min(MAX_N, parseInt(n, 10) || 3));
        // Giữ lại các giá trị đã nhập khi đổi cỡ ma trận
        const keep = [];
        for (let i = 0; i < Math.min(dim, n); i++) {
            keep[i] = [];
            for (let j = 0; j < Math.min(dim, n); j++) {
                const el = cell(i, j);
                keep[i][j] = el ? el.value : '';
            }
        }
        dim = n;
        $('mxDimInput').value = n;
        document.querySelectorAll('#mxPresets .mx-preset').forEach(btn => {
            btn.classList.toggle('active', parseInt(btn.dataset.n, 10) === n);
        });
        renderGrid(n, keep);
    }

    function clearMatrix() {
        for (let i = 0; i < dim; i++) for (let j = 0; j < dim; j++) {
            const el = cell(i, j);
            el.value = '';
            el.classList.remove('mx-invalid');
        }
        showToast('Đã xóa dữ liệu ma trận');
    }

    function fillRandom() {
        for (let i = 0; i < dim; i++) for (let j = 0; j < dim; j++) {
            const el = cell(i, j);
            el.value = Math.floor(Math.random() * 19) - 9; // -9 ... 9
            el.classList.remove('mx-invalid');
        }
        showToast('Đã điền ma trận ngẫu nhiên');
    }

    function fillIdentity() {
        for (let i = 0; i < dim; i++) for (let j = 0; j < dim; j++) {
            const el = cell(i, j);
            el.value = (i === j) ? '1' : '0';
            el.classList.remove('mx-invalid');
        }
        showToast('Đã khởi tạo ma trận đơn vị');
    }

    // Đọc ma trận từ lưới nhập; ô sai định dạng được đánh dấu đỏ thay vì bị coi là 0
    function readMatrix() {
        const matrix = [];
        const bad = [];
        for (let i = 0; i < dim; i++) {
            const row = [];
            for (let j = 0; j < dim; j++) {
                const el = cell(i, j);
                const f = parseCell(el.value);
                if (f === null) {
                    bad.push(`(${i + 1}, ${j + 1})`);
                    el.classList.add('mx-invalid');
                    row.push(new Fraction(0n));
                } else {
                    el.classList.remove('mx-invalid');
                    row.push(f);
                }
            }
            matrix.push(row);
        }
        return { matrix, bad };
    }

    function matrixToTex(matrix) {
        const rows = matrix.map(r => r.map(f => f.toTex()).join(' & '));
        return `\\begin{pmatrix}${rows.join(' \\\\ ')}\\end{pmatrix}`;
    }

    // ---------- Các phương pháp giải ----------
    function solveSarrus(matrix) {
        const steps = [];
        steps.push(`<strong>Áp dụng Quy tắc Sarrus cho ma trận 3x3:</strong>`);
        steps.push(`Ma trận $A = ${matrixToTex(matrix)}$`);

        const [a, b, c] = matrix[0], [d, e, f] = matrix[1], [g, h, i] = matrix[2];
        const p1 = a.mul(e).mul(i), p2 = b.mul(f).mul(g), p3 = c.mul(d).mul(h);
        const m1 = c.mul(e).mul(g), m2 = a.mul(f).mul(h), m3 = b.mul(d).mul(i);
        const posSum = p1.add(p2).add(p3);
        const negSum = m1.add(m2).add(m3);
        const result = posSum.sub(negSum);

        steps.push(`<strong>Cộng 3 tích đường chéo chính (chiều xuôi):</strong><br>
            $$P = (${a.toTexFactor()} \\cdot ${e.toTexFactor()} \\cdot ${i.toTexFactor()}) + (${b.toTexFactor()} \\cdot ${f.toTexFactor()} \\cdot ${g.toTexFactor()}) + (${c.toTexFactor()} \\cdot ${d.toTexFactor()} \\cdot ${h.toTexFactor()})$$<br>
            $$P = ${p1.toTex()} + ${p2.toTex()} + ${p3.toTex()} = ${posSum.toTex()}$$`);
        steps.push(`<strong>Cộng 3 tích đường chéo phụ (chiều ngược):</strong><br>
            $$N = (${c.toTexFactor()} \\cdot ${e.toTexFactor()} \\cdot ${g.toTexFactor()}) + (${a.toTexFactor()} \\cdot ${f.toTexFactor()} \\cdot ${h.toTexFactor()}) + (${b.toTexFactor()} \\cdot ${d.toTexFactor()} \\cdot ${i.toTexFactor()})$$<br>
            $$N = ${m1.toTex()} + ${m2.toTex()} + ${m3.toTex()} = ${negSum.toTex()}$$`);
        steps.push(`<strong>Tính Định Thức:</strong><br>
            $$\\det(A) = P - N = ${posSum.toTex()} - (${negSum.toTex()}) = ${result.toTex()}$$`);
        return { result, steps };
    }

    function solveGauss(matrix) {
        const steps = [];
        const n = matrix.length;
        const A = matrix.map(row => row.slice());

        steps.push(`<strong>Sử dụng thuật toán Khử Gauss (đưa về dạng tam giác trên):</strong>`);
        steps.push(`Ma trận ban đầu $A = ${matrixToTex(A)}$`);

        let swapCount = 0;
        for (let i = 0; i < n; i++) {
            let pivotRow = i;
            while (pivotRow < n && A[pivotRow][i].isZero()) pivotRow++;

            if (pivotRow === n) {
                steps.push(`Cột ${i + 1} (từ dòng ${i + 1} trở xuống) toàn số 0 nên định thức bằng 0.`);
                steps.push(`$$\\det(A) = 0$$`);
                return { result: new Fraction(0n), steps };
            }

            if (pivotRow !== i) {
                [A[i], A[pivotRow]] = [A[pivotRow], A[i]];
                swapCount++;
                steps.push(`<strong>Đổi chỗ Dòng ${i + 1} và Dòng ${pivotRow + 1}:</strong> (định thức đổi dấu - nhân thêm $-1$)<br>
                    $$A \\rightarrow ${matrixToTex(A)}$$`);
            }

            for (let j = i + 1; j < n; j++) {
                if (A[j][i].isZero()) continue;
                const factor = A[j][i].div(A[i][i]);
                for (let k = i; k < n; k++) {
                    A[j][k] = A[j][k].sub(factor.mul(A[i][k]));
                }
                steps.push(`<strong>Biến đổi: $d_{${j + 1}} \\rightarrow d_{${j + 1}} - (${factor.toTex()}) \\cdot d_{${i + 1}}$:</strong><br>
                    $$A \\rightarrow ${matrixToTex(A)}$$`);
            }
        }

        let diagProduct = new Fraction(1n);
        const diagTerms = [];
        for (let i = 0; i < n; i++) {
            diagProduct = diagProduct.mul(A[i][i]);
            diagTerms.push(A[i][i].toTexFactor());
        }
        const result = (swapCount % 2 === 0) ? diagProduct : diagProduct.mul(new Fraction(-1n));

        steps.push(`<strong>Ma trận đã về dạng tam giác trên.</strong><br>
            Định thức bằng tích các phần tử trên đường chéo chính${swapCount > 0 ? ` nhân với $(-1)^{${swapCount}}$ do đã đổi dòng ${swapCount} lần` : ''}:`);
        steps.push(`$$\\det(A) = ${swapCount > 0 ? `(-1)^{${swapCount}} \\cdot ` : ''}(${diagTerms.join(' \\cdot ')}) = ${result.toTex()}$$`);
        return { result, steps };
    }

    function laplaceRecursive(mat) {
        const size = mat.length;
        if (size === 1) return mat[0][0];
        if (size === 2) return mat[0][0].mul(mat[1][1]).sub(mat[0][1].mul(mat[1][0]));
        let det = new Fraction(0n);
        for (let j = 0; j < size; j++) {
            const elem = mat[0][j];
            if (elem.isZero()) continue;
            const minor = mat.slice(1).map(row => row.filter((_, c) => c !== j));
            const term = elem.mul(laplaceRecursive(minor));
            det = (j % 2 === 0) ? det.add(term) : det.sub(term);
        }
        return det;
    }

    function solveLaplace(matrix) {
        const steps = [];
        const n = matrix.length;
        steps.push(`<strong>Sử dụng Khai triển Laplace theo Dòng 1:</strong>`);
        steps.push(`Ma trận $A = ${matrixToTex(matrix)}$`);

        const termsTex = [];
        let total = new Fraction(0n);

        for (let j = 0; j < n; j++) {
            const elem = matrix[0][j];
            const sign = (j % 2 === 0) ? 1 : -1;
            const submat = matrix.slice(1).map(row => row.filter((_, c) => c !== j));
            const subDet = laplaceRecursive(submat);
            const termVal = elem.mul(subDet);
            total = (sign === 1) ? total.add(termVal) : total.sub(termVal);

            steps.push(`<strong>Phần tử $a_{1,${j + 1}} = ${elem.toTex()}$:</strong><br>
                Phần bù đại số $C_{1,${j + 1}} = (-1)^{1+${j + 1}} \\cdot \\det${matrixToTex(submat)} = ${sign === 1 ? '' : '-'}(${subDet.toTex()})$`);
            termsTex.push(`(${sign === 1 ? '+' : '-'} ${elem.toTexFactor()} \\cdot (${subDet.toTex()}))`);
        }

        steps.push(`<strong>Tổng hợp khai triển Laplace:</strong><br>
            $$\\det(A) = ${termsTex.join(' ')} = ${total.toTex()}$$`);
        return { result: total, steps };
    }

    // ---------- Điều phối tính toán & hiển thị kết quả ----------
    function calculate() {
        const stepsOutput = $('stepsOutputMx');
        const { matrix, bad } = readMatrix();

        if (bad.length > 0) {
            lastStepsText = '';
            $('mxResultValue').textContent = '--';
            $('mxResultFraction').textContent = '';
            $('mxTypeTag').textContent = '⚠️ Có ô nhập không hợp lệ';
            stepsOutput.innerHTML = `<div class="mx-error">⚠️ Các ô sau không phải số hợp lệ (chỉ nhận số nguyên, thập phân hoặc phân số dạng a/b với b ≠ 0): <b>${bad.join(', ')}</b>.<br>Vui lòng sửa các ô được đánh dấu đỏ rồi tính lại.</div>`;
            showToast('Có ' + bad.length + ' ô nhập không hợp lệ!');
            return;
        }

        const method = $('mxMethod').value;
        let result, steps;

        try {
            if (dim === 1) {
                result = matrix[0][0];
                steps = [
                    `<strong>Ma trận cấp 1x1:</strong> Định thức bằng chính phần tử duy nhất.`,
                    `$$\\det(A) = ${result.toTex()}$$`
                ];
            } else if (dim === 2) {
                const [[a, b], [c, d]] = matrix;
                const ad = a.mul(d), bc = b.mul(c);
                result = ad.sub(bc);
                steps = [
                    `<strong>Công thức ma trận 2x2:</strong> $$\\det(A) = a_{11}a_{22} - a_{12}a_{21}$$`,
                    `$$\\det(A) = (${a.toTex()}) \\cdot (${d.toTex()}) - (${b.toTex()}) \\cdot (${c.toTex()})$$`,
                    `$$\\det(A) = ${ad.toTex()} - (${bc.toTex()}) = ${result.toTex()}$$`
                ];
            } else {
                let chosen = method;
                if (method === 'auto') {
                    chosen = (dim === 3) ? 'sarrus' : 'gauss';
                } else if (method === 'sarrus' && dim !== 3) {
                    showToast('Quy tắc Sarrus chỉ áp dụng cho ma trận 3x3! Đã tự động chuyển sang Khử Gauss.');
                    chosen = 'gauss';
                } else if (method === 'laplace' && dim > LAPLACE_MAX_N) {
                    showToast(`Khai triển Laplace chỉ hỗ trợ tới n = ${LAPLACE_MAX_N} (độ phức tạp n!). Đã chuyển sang Khử Gauss.`);
                    chosen = 'gauss';
                }
                const res = chosen === 'sarrus' ? solveSarrus(matrix)
                          : chosen === 'laplace' ? solveLaplace(matrix)
                          : solveGauss(matrix);
                result = res.result;
                steps = res.steps;
            }
        } catch (err) {
            console.error(err);
            lastStepsText = '';
            stepsOutput.innerHTML = `<div class="mx-error">⚠️ Lỗi tính toán: ${String(err.message).replace(/[<>&]/g, '')}</div>`;
            return;
        }

        // Giá trị chính
        const approx = result.toNumber();
        if (result.den === 1n) {
            $('mxResultValue').textContent = result.num.toLocaleString('vi-VN');
            $('mxResultFraction').textContent = '';
        } else {
            $('mxResultValue').textContent = Number.isFinite(approx)
                ? approx.toLocaleString('vi-VN', { maximumFractionDigits: 6 })
                : result.toString();
            $('mxResultFraction').textContent = `= ${result.toString()}`;
        }
        $('mxTypeTag').textContent = result.isZero()
            ? '⚠️ Ma trận suy biến (det = 0)'
            : '✅ Ma trận khả nghịch (det ≠ 0)';

        // Lời giải từng bước
        stepsOutput.innerHTML = steps.map(s => `<div class="mx-step">${s}</div>`).join('');
        lastStepsText = steps
            .map(s => s.replace(/<br\s*\/?>/gi, '\n').replace(/<[^>]+>/g, '').replace(/[ \t]+\n/g, '\n').replace(/\n[ \t]+/g, '\n').trim())
            .join('\n\n');
        typeset(stepsOutput);
    }

    // ---------- MathJax (chỉ tải khi mở công cụ lần đầu) ----------
    function ensureMathJax() {
        if (window.MathJax && window.MathJax.typesetPromise) return Promise.resolve(window.MathJax);
        if (mathJaxPromise) return mathJaxPromise;
        window.MathJax = {
            tex: {
                inlineMath: [['$', '$'], ['\\(', '\\)']],
                displayMath: [['$$', '$$'], ['\\[', '\\]']]
            },
            startup: { typeset: false } // chỉ render trong vùng của công cụ, không đụng tới phần còn lại của trang
        };
        mathJaxPromise = new Promise((resolve, reject) => {
            const s = document.createElement('script');
            s.src = MATHJAX_SRC;
            s.async = true;
            s.onload = () => {
                const ready = (window.MathJax.startup && window.MathJax.startup.promise) || Promise.resolve();
                ready.then(() => resolve(window.MathJax), reject);
            };
            s.onerror = () => { mathJaxPromise = null; reject(new Error('MathJax load failed')); };
            document.head.appendChild(s);
        });
        return mathJaxPromise;
    }

    function typeset(el) {
        typesetChain = typesetChain
            .then(() => ensureMathJax())
            .then(MJ => MJ.typesetPromise([el]))
            .catch(() => {
                if (!mathJaxWarned) {
                    mathJaxWarned = true;
                    showToast('Không tải được thư viện hiển thị công thức (cần kết nối Internet).');
                }
            });
        return typesetChain;
    }

    // ---------- Tiện ích ----------
    function copySteps() {
        if (!lastStepsText) { showToast('Chưa có lời giải để sao chép. Hãy bấm "Tính Định Thức" trước.'); return; }
        const ok = () => showToast('Đã sao chép lời giải (công thức dạng LaTeX) vào bộ nhớ tạm!');
        const fallback = () => {
            const ta = document.createElement('textarea');
            ta.value = lastStepsText;
            ta.style.position = 'fixed'; ta.style.opacity = '0';
            document.body.appendChild(ta);
            ta.select();
            try { document.execCommand('copy'); ok(); } catch (e) { showToast('Không sao chép được, hãy thử lại.'); }
            document.body.removeChild(ta);
        };
        if (navigator.clipboard && window.isSecureContext) {
            navigator.clipboard.writeText(lastStepsText).then(ok, fallback);
        } else { fallback(); }
    }

    function showToast(msg) {
        const toast = $('mxToast');
        if (!toast) return;
        toast.textContent = msg;
        toast.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => toast.classList.remove('show'), 3000);
    }

    // ---------- Mở / đóng workspace ----------
    function openMatrixWorkspace() {
        toggleMainElements(false);
        $('matrixWorkspace').style.display = 'block';
        if (!guideTypeset) { guideTypeset = true; typeset($('mxGuide')); }
        const first = cell(0, 0);
        if (first) first.focus();
    }

    function closeMatrixWorkspace() {
        toggleMainElements(true);
        $('matrixWorkspace').style.display = 'none';
    }

    window.openMatrixWorkspace = openMatrixWorkspace;
    window.closeMatrixWorkspace = closeMatrixWorkspace;

    document.addEventListener('DOMContentLoaded', () => {
        if (!$('matrixWorkspace')) return;
        renderGrid(dim);
        document.querySelectorAll('#mxPresets .mx-preset').forEach(btn => {
            btn.addEventListener('click', () => changeDimension(btn.dataset.n));
        });
        $('mxDimInput').addEventListener('change', (e) => changeDimension(e.target.value));
        $('mxRandomBtn').addEventListener('click', fillRandom);
        $('mxIdentityBtn').addEventListener('click', fillIdentity);
        $('mxClearBtn').addEventListener('click', clearMatrix);
        $('mxCalcBtn').addEventListener('click', calculate);
        $('mxCopyBtn').addEventListener('click', copySteps);
        $('mxCloseBtn').addEventListener('click', closeMatrixWorkspace);
    });
})();


// ==========================================
// WORKSPACE: HỌC LẬP TRÌNH C/C++ (kho bài tập + lời giải + mô phỏng)
// ==========================================
(function () {
    'use strict';

    // ----- Dữ liệu bài tập (21 bài, code đã đối chiếu với g++) -----
const DATABASE = [
  {
    id: "cpp-basics-1",
    chapter: 0,
    chapterTitle: "C++ Cơ Bản",
    title: "1. Cấu trúc chương trình C++ & Hello World",
    description: "Tìm hiểu cấu trúc chương trình C++ cơ bản nhất và in ra dòng chữ 'Hello World!'.",
    algorithm: "Sử dụng thư viện `<iostream>`, hàm `main()` làm điểm bắt đầu và `std::cout` để in dữ liệu out ra màn hình.",
    code: `#include <iostream>

int main() {
    // In ra dòng chữ Hello World!
    std::cout << "Hello, World! Chào mừng bạn đến với C++." << std::endl;
    return 0;
}`,
    interactive: {
      type: "simple_run",
      run: () => "Hello, World! Chào mừng bạn đến với C++."
    }
  },
  {
    id: "cpp-basics-2",
    chapter: 0,
    chapterTitle: "C++ Cơ Bản",
    title: "2. Biến, Kiểu dữ liệu và Nhập Xuất",
    description: "Khai báo các biến int, double, char, string, bool và nhập dữ liệu từ bàn phím.",
    algorithm: "Dùng `std::cin` để nhập và `std::cout` để xuất dữ liệu.",
    code: `#include <iostream>
#include <string>
using namespace std;

int main() {
    string name;
    int age;
    double height;
    char grade;
    bool isStudent;

    cout << "Nhap ten (khong dau, khong khoang trang): ";
    cin >> name;
    cout << "Nhap tuoi: ";
    cin >> age;
    cout << "Nhap chieu cao (m): ";
    cin >> height;
    cout << "Nhap xep loai (A/B/C): ";
    cin >> grade;
    cout << "Co phai sinh vien? (1 = co, 0 = khong): ";
    cin >> isStudent;

    cout << "Xin chao " << name << ", ban " << age << " tuoi." << endl;
    cout << "Chieu cao: " << height << " m, xep loai: " << grade << endl;
    cout << "Sinh vien: " << (isStudent ? "Co" : "Khong") << endl;
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "name",
          "label": "Tên (string)",
          "default": "Nam"
        },
        {
          "name": "age",
          "label": "Tuổi (int)",
          "default": "20"
        },
        {
          "name": "height",
          "label": "Chiều cao (double)",
          "default": "1.7"
        },
        {
          "name": "grade",
          "label": "Xếp loại (char)",
          "default": "A"
        },
        {
          "name": "student",
          "label": "Sinh viên? (bool: 1 hoặc 0)",
          "default": "1"
        }
      ],
      run: (i) => {
      const name = (i.name || '').trim().split(/\s+/)[0] || '';
      const age = parseInt(i.age); const h = parseFloat(i.height);
      const g = (i.grade || '').trim().charAt(0);
      const stu = (i.student || '').trim() === '1';
      return `Xin chao ${name}, ban ${isNaN(age) ? 0 : age} tuoi.\nChieu cao: ${cppNum(isNaN(h) ? 0 : h)} m, xep loai: ${g}\nSinh vien: ${stu ? 'Co' : 'Khong'}`;
    }
    }
  },
  {
    id: "cpp-basics-3",
    chapter: 0,
    chapterTitle: "C++ Cơ Bản",
    title: "3. Vòng lặp & Cấu trúc Điều khiển",
    description: "Minh họa vòng lặp `for`, `while` và câu lệnh điều kiện `if-else`.",
    algorithm: "Duyệt qua các số từ 1 đến N, kiểm tra tính chẵn lẻ.",
    code: `#include <iostream>
using namespace std;

int main() {
    int n;
    cout << "Nhap N: ";
    cin >> n;

    // Vong lap for + if-else: in cac so chan
    cout << "Cac so chan tu 1 den " << n << " la: ";
    for (int i = 1; i <= n; i++) {
        if (i % 2 == 0) {
            cout << i << " ";
        }
    }
    cout << endl;

    // Vong lap while: tinh tong 1 + 2 + ... + n
    int sum = 0, i = 1;
    while (i <= n) {
        sum += i;
        i++;
    }
    cout << "Tong 1 + 2 + ... + " << n << " = " << sum << endl;
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "n",
          "label": "Nhập N",
          "default": "10"
        }
      ],
      run: (i) => {
      const n = parseInt(i.n) || 0;
      if (n > 20000) return 'Hay nhap N <= 20000 de mo phong.';
      let ev = '', s = 0;
      for (let k = 1; k <= n; k++) if (k % 2 === 0) ev += k + ' ';
      for (let k = 1; k <= n; k++) s += k;
      return `Cac so chan tu 1 den ${n} la: ${ev}\nTong 1 + 2 + ... + ${n} = ${s}`;
    }
    }
  },
  {
    id: "ch1-1",
    chapter: 1,
    chapterTitle: "Chương 1: Giới Thiệu C/C++",
    title: "Bài 1.1: Đổi giây sang Giờ - Phút - Giây",
    description: "Nhập vào t giây, hãy đổi t giây ra dạng giờ – phút – giây (Ví dụ: t=3700 -> 1h 1m 40s).",
    algorithm: "- Giờ = t / 3600\n- Dư sau khi tính giờ = t % 3600\n- Phút = dư / 60\n- Giây = dư % 60.",
    code: `#include <iostream>
using namespace std;

int main() {
    long t;
    cout << "Nhap so giay t: ";
    if (!(cin >> t) || t < 0) {
        cout << "Gia tri khong hop le!";
        return 0;
    }
    
    long hours = t / 3600;
    long minutes = (t % 3600) / 60;
    long seconds = t % 60;
    
    cout << t << "s = " << hours << "h " << minutes << "m " << seconds << "s" << endl;
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "t",
          "label": "Số giây (t)",
          "default": "3700"
        }
      ],
      run: (inputs) => {
        const t = parseInt(inputs.t) || 0;
        if (t < 0) return "Thời gian phải là số không âm!";
        const h = Math.floor(t / 3600);
        const m = Math.floor((t % 3600) / 60);
        const s = t % 60;
        return `${t}s = ${h}h ${m}m ${s}s`;
      }
    }
  },
  {
    id: "ch1-2",
    chapter: 1,
    chapterTitle: "Chương 1: Giới Thiệu C/C++",
    title: "Bài 1.2: Trọng tâm & Đường tròn Nội/Ngoại tiếp Tam Giác",
    description: "Cho A(xa,ya), B(xb,yb), C(xc,yc). Tìm tọa độ trọng tâm G, diện tích đường tròn nội tiếp (r) và ngoại tiếp (R).",
    algorithm: "1. Trọng tâm G = ((xa+xb+xc)/3, (ya+yb+yc)/3)\n2. Tính độ dài 3 cạnh a, b, c bằng công thức khoảng cách Euclide.\n3. Tính diện tích S tam giác bằng công thức Heron: S = sqrt(p*(p-a)*(p-b)*(p-c)).\n4. Bán kính nội tiếp r = S / p => S_noi = pi * r^2.\n5. Bán kính ngoại tiếp R = (a*b*c) / (4*S) => S_ngoai = pi * R^2.",
    code: `#include <iostream>
#include <cmath>
#include <iomanip>

using namespace std;

const double PI = 3.141592653589793;

double distance(double x1, double y1, double x2, double y2) {
    return sqrt((x2 - x1)*(x2 - x1) + (y2 - y1)*(y2 - y1));
}

int main() {
    double xa, ya, xb, yb, xc, yc;
    cout << "Nhap A(xa, ya): "; cin >> xa >> ya;
    cout << "Nhap B(xb, yb): "; cin >> xb >> yb;
    cout << "Nhap C(xc, yc): "; cin >> xc >> yc;

    // Trong tam G
    double xg = (xa + xb + xc) / 3.0;
    double yg = (ya + yb + yc) / 3.0;

    // Do dai cac canh
    double a = distance(xb, yb, xc, yc);
    double b = distance(xa, ya, xc, yc);
    double c = distance(xa, ya, xb, yb);

    double p = (a + b + c) / 2.0; // Nua chu vi
    double S_tri = sqrt(p * (p - a) * (p - b) * (p - c));

    if (S_tri <= 1e-9) {
        cout << "Ba diem khong tao thanh tam giac hop le!" << endl;
        return 0;
    }

    double r = S_tri / p;
    double R = (a * b * c) / (4.0 * S_tri);

    double S_incircle = PI * r * r;
    double S_excircle = PI * R * R;

    cout << fixed << setprecision(2);
    cout << "Trong tam G: (" << xg << ", " << yg << ")" << endl;
    cout << "Dien tich duong tron noi tiep: " << S_incircle << endl;
    cout << "Dien tich duong tron ngoai tiep: " << S_excircle << endl;

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "xa",
          "label": "xa",
          "default": "0"
        },
        {
          "name": "ya",
          "label": "ya",
          "default": "0"
        },
        {
          "name": "xb",
          "label": "xb",
          "default": "4"
        },
        {
          "name": "yb",
          "label": "yb",
          "default": "0"
        },
        {
          "name": "xc",
          "label": "xc",
          "default": "0"
        },
        {
          "name": "yc",
          "label": "yc",
          "default": "3"
        }
      ],
      run: (inp) => {
        const xa = parseFloat(inp.xa)||0, ya = parseFloat(inp.ya)||0;
        const xb = parseFloat(inp.xb)||0, yb = parseFloat(inp.yb)||0;
        const xc = parseFloat(inp.xc)||0, yc = parseFloat(inp.yc)||0;
        
        const xg = ((xa+xb+xc)/3).toFixed(2);
        const yg = ((ya+yb+yc)/3).toFixed(2);
        
        const dist = (x1,y1,x2,y2) => Math.hypot(x2-x1, y2-y1);
        const a = dist(xb,yb,xc,yc), b = dist(xa,ya,xc,yc), c = dist(xa,ya,xb,yb);
        const p = (a+b+c)/2;
        const S_tri = Math.sqrt(Math.max(0, p*(p-a)*(p-b)*(p-c)));
        
        if (S_tri < 1e-6) return "Ba điểm thẳng hàng, không tạo thành tam giác!";
        
        const r = S_tri / p;
        const R = (a*b*c)/(4*S_tri);
        const S_in = (Math.PI * r * r).toFixed(2);
        const S_ex = (Math.PI * R * R).toFixed(2);
        
        return `Trọng tâm G: (${xg}, ${yg})\nDiện tích tròn nội tiếp: ${S_in}\nDiện tích tròn ngoại tiếp: ${S_ex}`;
      }
    }
  },
  {
    id: "ch1-3",
    chapter: 1,
    chapterTitle: "Chương 1: Giới Thiệu C/C++",
    title: "Bài 1.3: Đếm số Âm, bằng 0, Dương trong 6 số nguyên",
    description: "Nhập vào 6 số nguyên. Hãy đếm xem trong đó có bao nhiêu số âm, bao nhiêu số bằng 0, bao nhiêu số dương?",
    algorithm: "Dùng 3 biến đếm `neg`, `zero`, `pos` khởi tạo bằng 0. Duyệt qua 6 số nhập vào và tăng biến đếm tương ứng.",
    code: `#include <iostream>
using namespace std;

int main() {
    int nums[6];
    int neg = 0, zero = 0, pos = 0;
    
    cout << "Nhap 6 so nguyen: ";
    for (int i = 0; i < 6; i++) {
        cin >> nums[i];
        if (nums[i] < 0) neg++;
        else if (nums[i] == 0) zero++;
        else pos++;
    }
    
    cout << "So so am: " << neg << endl;
    cout << "So so bang 0: " << zero << endl;
    cout << "So so duong: " << pos << endl;
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "list",
          "label": "6 số (cách nhau bởi khoảng trắng)",
          "default": "-5 0 12 -3 0 7"
        }
      ],
      run: (inp) => {
        const arr = inp.list.trim().split(/\s+/).map(Number).filter(n => !isNaN(n));
        let neg = 0, zero = 0, pos = 0;
        arr.forEach(n => {
          if (n < 0) neg++;
          else if (n === 0) zero++;
          else pos++;
        });
        return `Kết quả đếm (${arr.length} số nhập vào):\n- Số âm: ${neg}\n- Số bằng 0: ${zero}\n- Số dương: ${pos}`;
      }
    }
  },
  {
    id: "ch1-4",
    chapter: 1,
    chapterTitle: "Chương 1: Giới Thiệu C/C++",
    title: "Bài 1.4: Tìm Max, Min và Sắp xếp 4 số nguyên",
    description: "Nhập 4 số nguyên a, b, c, d. Tìm Max, Min và sắp xếp 4 số theo thứ tự tăng dần.",
    algorithm: "Sử dụng hàm `std::max`, `std::min` hoặc giải thuật hoán đổi đơn giản (hoặc `std::sort`).",
    code: `#include <iostream>
#include <algorithm>
using namespace std;

int main() {
    int a[4];
    cout << "Nhap 4 so nguyen a, b, c, d: ";
    for(int i = 0; i < 4; i++) cin >> a[i];
    
    int minVal = a[0], maxVal = a[0];
    for(int i = 1; i < 4; i++) {
        if(a[i] < minVal) minVal = a[i];
        if(a[i] > maxVal) maxVal = a[i];
    }
    
    // Sap xep tang dan
    sort(a, a + 4);
    
    cout << "Gia tri lon nhat (Max): " << maxVal << endl;
    cout << "Gia tri nho nhat (Min): " << minVal << endl;
    cout << "Day so sau khi sap xep: ";
    for(int i = 0; i < 4; i++) cout << a[i] << " ";
    cout << endl;
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "nums",
          "label": "4 số nguyên",
          "default": "15 -2 8 3"
        }
      ],
      run: (inp) => {
        const arr = inp.nums.trim().split(/\s+/).map(Number).filter(n => !isNaN(n)).slice(0, 4);
        if (arr.length < 4) return "Vui lòng nhập đủ 4 số nguyên!";
        const maxV = Math.max(...arr);
        const minV = Math.min(...arr);
        const sorted = [...arr].sort((a,b) => a - b);
        return `Max: ${maxV}\nMin: ${minV}\nSắp xếp tăng dần: ${sorted.join(' ')}`;
      }
    }
  },
  {
    id: "ch2-1",
    chapter: 2,
    chapterTitle: "Chương 2: Rẽ Nhánh & Lặp",
    title: "Bài 2.1: Giải Phương Trình Bậc 2",
    description: "Giải phương trình ax^2 + bx + c = 0 với các hệ số là số thực.",
    algorithm: "1. Nếu a = 0: Trở thành phương trình bậc nhất bx + c = 0.\n2. Nếu a != 0: Tính Delta = b^2 - 4ac.\n   - Delta < 0: Vô nghiệm thực.\n   - Delta == 0: Nghiệm kép x = -b / (2a).\n   - Delta > 0: 2 nghiệm phân biệt x1, x2 = (-b +- sqrt(Delta)) / (2a).",
    code: `#include <iostream>
#include <cmath>
using namespace std;

int main() {
    double a, b, c;
    cout << "Nhap a, b, c: ";
    cin >> a >> b >> c;

    if (a == 0) {
        if (b == 0) {
            if (c == 0) cout << "Phuong trinh vo so nghiem." << endl;
            else cout << "Phuong trinh vo nghiem." << endl;
        } else {
            cout << "Phuong trinh co 1 nghiem x = " << -c / b << endl;
        }
    } else {
        double delta = b * b - 4 * a * c;
        if (delta < 0) {
            cout << "Phuong trinh vo nghiem thuc." << endl;
        } else if (delta == 0) {
            cout << "Phuong trinh co nghiem kep x = " << -b / (2 * a) << endl;
        } else {
            double x1 = (-b + sqrt(delta)) / (2 * a);
            double x2 = (-b - sqrt(delta)) / (2 * a);
            cout << "Phuong trinh co 2 nghiem phan biet:" << endl;
            cout << "x1 = " << x1 << endl;
            cout << "x2 = " << x2 << endl;
        }
    }
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "a",
          "label": "a",
          "default": "1"
        },
        {
          "name": "b",
          "label": "b",
          "default": "-5"
        },
        {
          "name": "c",
          "label": "c",
          "default": "6"
        }
      ],
      run: (inp) => {
        const a = parseFloat(inp.a), b = parseFloat(inp.b), c = parseFloat(inp.c);
        if (a === 0) {
          if (b === 0) return c === 0 ? "Phương trình vô số nghiệm" : "Phương trình vô nghiệm";
          return `Nghiem bậc nhất x = ${-c/b}`;
        }
        const d = b*b - 4*a*c;
        if (d < 0) return "Phương trình vô nghiệm thực";
        if (d === 0) return `Nghịệm kép x = ${-b/(2*a)}`;
        return `2 nghiệm phân biệt:\nx1 = ${((-b+Math.sqrt(d))/(2*a)).toFixed(2)}\nx2 = ${((-b-Math.sqrt(d))/(2*a)).toFixed(2)}`;
      }
    }
  },
  {
    id: "ch2-2",
    chapter: 2,
    chapterTitle: "Chương 2: Rẽ Nhánh & Lặp",
    title: "Bài 2.2: Giải Hệ Phương Trình Bậc Nhất 2 Ẩn",
    description: "Giải hệ PT: { a1*x + b1*y = c1 ; a2*x + b2*y = c2 } dùng định thức Cramer.",
    algorithm: "D = a1*b2 - a2*b1\nDx = c1*b2 - c2*b1\nDy = a1*c2 - a2*c1\n- Nếu D != 0 => Hệ có 1 nghiệm duy nhất x = Dx/D, y = Dy/D.\n- Nếu D == 0:\n   + Dx != 0 hoặc Dy != 0 => Vô nghiệm.\n   + Dx == 0 và Dy == 0 => Vô số nghiệm.",
    code: `#include <iostream>
using namespace std;

int main() {
    double a1, b1, c1, a2, b2, c2;
    cout << "Nhap a1, b1, c1: "; cin >> a1 >> b1 >> c1;
    cout << "Nhap a2, b2, c2: "; cin >> a2 >> b2 >> c2;

    double D = a1 * b2 - a2 * b1;
    double Dx = c1 * b2 - c2 * b1;
    double Dy = a1 * c2 - a2 * c1;

    if (D != 0) {
        cout << "He phuong trinh co nghiem duy nhat:" << endl;
        cout << "x = " << Dx / D << ", y = " << Dy / D << endl;
    } else {
        if (Dx == 0 && Dy == 0) cout << "He phuong trinh vo so nghiem." << endl;
        else cout << "He phuong trinh vo nghiem." << endl;
    }
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "a1",
          "label": "a1",
          "default": "2"
        },
        {
          "name": "b1",
          "label": "b1",
          "default": "1"
        },
        {
          "name": "c1",
          "label": "c1",
          "default": "5"
        },
        {
          "name": "a2",
          "label": "a2",
          "default": "1"
        },
        {
          "name": "b2",
          "label": "b2",
          "default": "-1"
        },
        {
          "name": "c2",
          "label": "c2",
          "default": "1"
        }
      ],
      run: (i) => {
        const a1 = parseFloat(i.a1), b1 = parseFloat(i.b1), c1 = parseFloat(i.c1);
        const a2 = parseFloat(i.a2), b2 = parseFloat(i.b2), c2 = parseFloat(i.c2);
        const D = a1*b2 - a2*b1, Dx = c1*b2 - c2*b1, Dy = a1*c2 - a2*c1;
        if (D !== 0) return `Nghiệm duy nhất:\nx = ${Dx/D}\ny = ${Dy/D}`;
        return (Dx === 0 && Dy === 0) ? "Vô số nghiệm" : "Vô nghiệm";
      }
    }
  },
  {
    id: "ch2-3",
    chapter: 2,
    chapterTitle: "Chương 2: Rẽ Nhánh & Lặp",
    title: "Bài 2.3: Phân Loại Tam Giác từ 3 Cạnh a, b, c",
    description: "Nhập a, b, c. Kiểm tra có phải 3 cạnh tam giác không và xét loại tam giác (đều, vuông, cân, vuông cân, thường).",
    algorithm: "1. Điều kiện tam giác: a+b>c && a+c>b && b+c>a.\n2. Nếu a=b=c -> Đều.\n3. Nếu a^2+b^2=c^2 hoặc b^2+c^2=a^2 hoặc a^2+c^2=b^2 -> Vuông.\n4. Nếu a=b hoặc b=c hoặc a=c -> Cân.\n5. Kết hợp Vuông & Cân -> Vuông Cân.",
    code: `#include <iostream>
using namespace std;

int main() {
    double a, b, c;
    cout << "Nhap 3 canh a, b, c: ";
    cin >> a >> b >> c;

    if (a + b > c && a + c > b && b + c > a) {
        if (a == b && b == c) {
            cout << "Tam giac Deu" << endl;
        } else {
            bool vuong = (a*a + b*b == c*c) || (a*a + c*c == b*b) || (b*b + c*c == a*a);
            bool can = (a == b || b == c || a == c);

            if (vuong && can) cout << "Tam giac Vuong Can" << endl;
            else if (vuong) cout << "Tam giac Vuong" << endl;
            else if (can) cout << "Tam giac Can" << endl;
            else cout << "Tam giac Thuong" << endl;
        }
    } else {
        cout << "Khong phai 3 canh cua tam giac!" << endl;
    }
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "a",
          "label": "Cạnh a",
          "default": "3"
        },
        {
          "name": "b",
          "label": "Cạnh b",
          "default": "4"
        },
        {
          "name": "c",
          "label": "Cạnh c",
          "default": "5"
        }
      ],
      run: (i) => {
        const a = parseFloat(i.a), b = parseFloat(i.b), c = parseFloat(i.c);
        if (a + b <= c || a + c <= b || b + c <= a) return "Khong phai 3 canh cua tam giac!";
        const vuong = Math.abs(a*a + b*b - c*c) < 1e-5 || Math.abs(a*a + c*c - b*b) < 1e-5 || Math.abs(b*b + c*c - a*a) < 1e-5;
        const can = a === b || b === c || a === c;
        if (a === b && b === c) return "Tam giác Đều";
        if (vuong && can) return "Tam giác Vuông Cân";
        if (vuong) return "Tam giác Vuông";
        if (can) return "Tam giác Cân";
        return "Tam giác Thường";
      }
    }
  },
  {
    id: "ch2-4",
    chapter: 2,
    chapterTitle: "Chương 2: Rẽ Nhánh & Lặp",
    title: "Bài 2.4: Menu Tính Diện Tích Hình (Hàm Con)",
    description: "Tạo menu lựa chọn tính diện tích: Hình vuông, Hình chữ nhật, Tam giác (3 cạnh), Hình tròn.",
    algorithm: "Sử dụng switch-case và viết các hàm con riêng cho từng loại hình.",
    code: `#include <iostream>
#include <cmath>
using namespace std;

double dtHinhVuong(double a) { return a * a; }
double dtHinhChuNhat(double a, double b) { return a * b; }
double dtTamGiac(double a, double b, double c) {
    double p = (a + b + c) / 2.0;
    return sqrt(p * (p - a) * (p - b) * (p - c));
}
double dtHinhTron(double r) { return 3.14159 * r * r; }

int main() {
    int opt;
    cout << "1. Hinh vuong\\n2. Hinh chu nhat\\n3. Tam giac\\n4. Hinh tron\\nChon (1-4): ";
    cin >> opt;

    switch(opt) {
        case 1: {
            double a; cout << "Nhap canh: "; cin >> a;
            cout << "S = " << dtHinhVuong(a) << endl;
            break;
        }
        case 2: {
            double a, b; cout << "Nhap 2 canh: "; cin >> a >> b;
            cout << "S = " << dtHinhChuNhat(a, b) << endl;
            break;
        }
        case 3: {
            double a, b, c; cout << "Nhap 3 canh: "; cin >> a >> b >> c;
            cout << "S = " << dtTamGiac(a, b, c) << endl;
            break;
        }
        case 4: {
            double r; cout << "Nhap ban kinh: "; cin >> r;
            cout << "S = " << dtHinhTron(r) << endl;
            break;
        }
        default: cout << "Lua chon khong hop le!";
    }
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "type",
          "label": "Loại hình (1:Vuông, 2:Chữ Nhật, 3:Tam Giác, 4:Tròn)",
          "default": "2"
        },
        {
          "name": "val",
          "label": "Cạnh/Bán kính (cách bởi dấu cách)",
          "default": "4 5"
        }
      ],
      run: (i) => {
        const type = parseInt(i.type);
        const vals = i.val.trim().split(/\s+/).map(Number);
        if (type === 1) return `Diện tích Hình vuông: ${vals[0] * vals[0]}`;
        if (type === 2) return `Diện tích Hình chữ nhật: ${vals[0] * (vals[1] || vals[0])}`;
        if (type === 3) {
          const [a,b,c] = vals;
          const p = (a+b+c)/2;
          return `Diện tích Tam giác: ${Math.sqrt(p*(p-a)*(p-b)*(p-c)).toFixed(2)}`;
        }
        if (type === 4) return `Diện tích Hình tròn: ${(Math.PI * vals[0] * vals[0]).toFixed(2)}`;
        return "Lựa chọn không hợp lệ!";
      }
    }
  },
  {
    id: "ch2-5",
    chapter: 2,
    chapterTitle: "Chương 2: Rẽ Nhánh & Lặp",
    title: "Bài 2.5: Kiểm tra Số Nguyên Tố & Số Hoàn Chỉnh",
    description: "Nhập số n. Kiểm tra n có phải là số nguyên tố hay không và có phải số hoàn chỉnh (tổng ước thật sự bằng chính nó) không.",
    algorithm: "- SNT: n >= 2 và không chia hết cho số nào từ 2 đến sqrt(n).\n- Số hoàn chỉnh: Tổng các ước từ 1 đến n/2 bằng n.",
    code: `#include <iostream>
#include <cmath>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i <= sqrt(n); i++) {
        if (n % i == 0) return false;
    }
    return true;
}

bool isPerfect(int n) {
    if (n <= 1) return false;
    int sum = 0;
    for (int i = 1; i <= n / 2; i++) {
        if (n % i == 0) sum += i;
    }
    return sum == n;
}

int main() {
    int n;
    cout << "Nhap n: "; cin >> n;

    if (isPrime(n)) cout << n << " LA so nguyen to." << endl;
    else cout << n << " KHONG PHAI so nguyen to." << endl;

    if (isPerfect(n)) cout << n << " LA so hoan chinh." << endl;
    else cout << n << " KHONG PHAI so hoan chinh." << endl;

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "n",
          "label": "Nhập n",
          "default": "28"
        }
      ],
      run: (i) => {
        const n = parseInt(i.n);
        const checkPrime = (num) => {
          if (num < 2) return false;
          for(let k=2; k<=Math.sqrt(num); k++) if(num % k === 0) return false;
          return true;
        };
        const checkPerfect = (num) => {
          if (num <= 1) return false;
          let s = 0;
          for(let k=1; k<=num/2; k++) if(num % k === 0) s += k;
          return s === num;
        };
        return `${n} ${checkPrime(n) ? "LÀ" : "KHÔNG PHẢI"} Số nguyên tố.\n${n} ${checkPerfect(n) ? "LÀ" : "KHÔNG PHẢI"} Số hoàn chỉnh.`;
      }
    }
  },
  {
    id: "ch2-6",
    chapter: 2,
    chapterTitle: "Chương 2: Rẽ Nhánh & Lặp",
    title: "Bài 2.6: Số Đảo Nguồn, Số Cân Xứng & Số Armstrong",
    description: "Nhập số nguyên n. 1) Tìm số đảo ngược. 2) Kiểm tra n có cân xứng (Palindromic)? 3) Kiểm tra số Armstrong (Ví dụ: 153 = 1^3 + 5^3 + 3^3).",
    algorithm: "1. Đảo ngược: Lấy `n % 10` cộng vào `rev * 10`, sau đó `n /= 10`.\n2. Cân xứng: Số ban đầu == số đảo ngược.\n3. Armstrong: Tổng các chữ số lũy thừa K (K là số chữ số) = n.",
    code: `#include <iostream>
#include <cmath>
using namespace std;

int getReverse(int n) {
    int rev = 0;
    while (n > 0) {
        rev = rev * 10 + n % 10;
        n /= 10;
    }
    return rev;
}

bool isArmstrong(int n) {
    int temp = n, k = 0, sum = 0;
    while (temp > 0) { k++; temp /= 10; }
    temp = n;
    while (temp > 0) {
        int r = temp % 10;
        sum += pow(r, k);
        temp /= 10;
    }
    return sum == n;
}

int main() {
    int n;
    cout << "Nhap n: "; cin >> n;

    int rev = getReverse(n);
    cout << "So dao nguoc: " << rev << endl;
    cout << (rev == n ? "La so can xung" : "Khong la so can xung") << endl;
    cout << (isArmstrong(n) ? "La so Armstrong" : "Khong la so Armstrong") << endl;

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "n",
          "label": "Nhập n",
          "default": "153"
        }
      ],
      run: (i) => {
        const n = parseInt(i.n);
        const str = n.toString();
        const revStr = str.split('').reverse().join('');
        const rev = parseInt(revStr);

        const k = str.length;
        let armSum = 0;
        for (let ch of str) armSum += Math.pow(parseInt(ch), k);

        return `Số đảo ngược: ${rev}\nĐối xứng/Cân xứng: ${str === revStr ? "ĐÚNG" : "KHÔNG"}\nSố Armstrong: ${armSum === n ? "ĐÚNG" : "KHÔNG"}`;
      }
    }
  },
  {
    id: "ch2-7",
    chapter: 2,
    chapterTitle: "Chương 2: Rẽ Nhánh & Lặp",
    title: "Bài 2.7: Phép Tính 2 Phân Số Tối Giản",
    description: "Nhập 2 phân số a/b và c/d. Tính +, -, *, : và đưa kết quả về phân số tối giản.",
    algorithm: "Tính tử và mẫu theo công thức phân số. Rút gọn bằng cách chia cả tử và mẫu cho UCLN(abs(tử), abs(mẫu)).",
    code: `#include <iostream>
#include <cstdlib>
using namespace std;

long long gcd(long long a, long long b) {
    a = llabs(a); b = llabs(b);
    while (b != 0) {
        long long temp = a % b;
        a = b;
        b = temp;
    }
    return a;
}

void rutGon(long long &tu, long long &mau) {
    long long g = gcd(tu, mau);
    tu /= g;
    mau /= g;
    if (mau < 0) { tu = -tu; mau = -mau; }
}

int main() {
    long long a, b, c, d;
    cout << "Nhap phan so 1 (a b): "; cin >> a >> b;
    cout << "Nhap phan so 2 (c d): "; cin >> c >> d;

    if (b == 0 || d == 0) {
        cout << "Mau so phai khac 0!" << endl;
        return 0;
    }

    // Tong: (ad + bc)/bd
    long long t1 = a*d + c*b, m1 = b*d; rutGon(t1, m1);
    cout << "Tong: " << t1 << "/" << m1 << endl;

    // Hieu: (ad - bc)/bd
    long long t2 = a*d - c*b, m2 = b*d; rutGon(t2, m2);
    cout << "Hieu: " << t2 << "/" << m2 << endl;

    // Tich: (ac)/(bd)
    long long t3 = a*c, m3 = b*d; rutGon(t3, m3);
    cout << "Tich: " << t3 << "/" << m3 << endl;

    // Thuong: (ad)/(bc), chi khi phan so thu hai khac 0
    if (c == 0) {
        cout << "Thuong: khong chia duoc cho phan so 0" << endl;
    } else {
        long long t4 = a*d, m4 = b*c; rutGon(t4, m4);
        cout << "Thuong: " << t4 << "/" << m4 << endl;
    }
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "p1",
          "label": "Phân số 1 (tử mẫu)",
          "default": "1 2"
        },
        {
          "name": "p2",
          "label": "Phân số 2 (tử mẫu)",
          "default": "3 4"
        }
      ],
      run: (inp) => {
      const [a, b] = inp.p1.trim().split(/\s+/).map(Number);
      const [c, d] = inp.p2.trim().split(/\s+/).map(Number);
      if ([a, b, c, d].some(x => !Number.isInteger(x))) return 'Du lieu khong hop le (can 2 so nguyen moi phan so)!';
      if (b === 0 || d === 0) return 'Mau so phai khac 0!';
      const gcd = (x, y) => { x = Math.abs(x); y = Math.abs(y); while (y) { [x, y] = [y, x % y]; } return x; };
      const rg = (t, m) => { const g = gcd(t, m); t /= g; m /= g; if (m < 0) { t = -t; m = -m; } return `${t + 0}/${m}`; };
      const div = c === 0 ? 'khong chia duoc cho phan so 0' : rg(a * d, b * c);
      return `Tong: ${rg(a * d + c * b, b * d)}\nHieu: ${rg(a * d - c * b, b * d)}\nTich: ${rg(a * c, b * d)}\nThuong: ${div}`;
    }
    }
  },
  {
    id: "ch3-1",
    chapter: 3,
    chapterTitle: "Chương 3: Chương Trình Con",
    title: "Bài 3.1: Các Số Đặc Biệt <= n",
    description: "Tìm tất cả các Số chính phương, Số hoàn chỉnh, Số nguyên tố, Số cân xứng <= n.",
    algorithm: "Sử dụng các hàm kiểm tra độc lập và duyệt từ 1 đến n.",
    code: `#include <iostream>
#include <cmath>
using namespace std;

bool isSquare(int n) {
    int sq = sqrt(n);
    return sq * sq == n;
}

bool isPerfect(int n) {
    if (n <= 1) return false;
    int sum = 0;
    for (int i = 1; i <= n / 2; i++) if (n % i == 0) sum += i;
    return sum == n;
}

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i <= sqrt(n); i++) if (n % i == 0) return false;
    return true;
}

bool isPalindrome(int n) {
    int temp = n, rev = 0;
    while (temp > 0) { rev = rev * 10 + temp % 10; temp /= 10; }
    return rev == n;
}

int main() {
    int n; cout << "Nhap n: "; cin >> n;

    cout << "So chinh phuong <= " << n << ": ";
    for (int i = 1; i <= n; i++) if (isSquare(i)) cout << i << " ";
    cout << endl;

    cout << "So hoan chinh <= " << n << ": ";
    for (int i = 1; i <= n; i++) if (isPerfect(i)) cout << i << " ";
    cout << endl;

    cout << "So nguyen to <= " << n << ": ";
    for (int i = 1; i <= n; i++) if (isPrime(i)) cout << i << " ";
    cout << endl;

    cout << "So can xung <= " << n << ": ";
    for (int i = 1; i <= n; i++) if (isPalindrome(i)) cout << i << " ";
    cout << endl;

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "n",
          "label": "Nhập n",
          "default": "30"
        }
      ],
      run: (i) => {
      const n = parseInt(i.n);
      if (isNaN(n)) return 'Du lieu khong hop le!';
      if (n > 100000) return 'Hay nhap n <= 100000 de mo phong.';
      const sq = [], pf = [], pr = [], pal = [];
      for (let k = 1; k <= n; k++) {
        if (Math.floor(Math.sqrt(k)) ** 2 === k) sq.push(k);
        let s = 1; if (k > 1) { for (let j = 2; j * j <= k; j++) if (k % j === 0) { s += j; if (j * j !== k) s += k / j; } }
        if (k > 1 && s === k) pf.push(k);
        let p = k >= 2; for (let j = 2; j * j <= k; j++) if (k % j === 0) { p = false; break; }
        if (p) pr.push(k);
        if (String(k) === String(k).split('').reverse().join('')) pal.push(k);
      }
      const f = (a) => a.map(x => x + ' ').join('');
      return `So chinh phuong <= ${n}: ${f(sq)}\nSo hoan chinh <= ${n}: ${f(pf)}\nSo nguyen to <= ${n}: ${f(pr)}\nSo can xung <= ${n}: ${f(pal)}`;
    }
    }
  },
  {
    id: "ch3-2",
    chapter: 3,
    chapterTitle: "Chương 3: Chương Trình Con",
    title: "Bài 3.2: Dãy Số x_n (Đệ Quy & Không Đệ Quy)",
    description: "Dãy x_n: x1=1, x2=1, x_n = x_{n-1} + (n-1)*x_{n-2} với n >= 3. Tính x7 và tổng quát n.",
    algorithm: "Cài đặt bằng đệ quy trực tiếp theo công thức hoặc dùng mảng/vòng lặp để tối ưu hóa quy hoạch động.",
    code: `#include <iostream>
using namespace std;

// De quy
long long xn_recursive(int n) {
    if (n == 1 || n == 2) return 1;
    return xn_recursive(n - 1) + (n - 1) * xn_recursive(n - 2);
}

// Khong de quy
long long xn_iterative(int n) {
    if (n == 1 || n == 2) return 1;
    long long f1 = 1, f2 = 1, fn = 0;
    for (int i = 3; i <= n; i++) {
        fn = f2 + (i - 1) * f1;
        f1 = f2;
        f2 = fn;
    }
    return fn;
}

int main() {
    int n;
    cout << "Nhap n (1 <= n <= 30): ";
    cin >> n;
    if (n < 1 || n > 30) {
        cout << "n khong hop le!" << endl;
        return 0;
    }
    cout << "x" << n << " (De quy) = " << xn_recursive(n) << endl;
    cout << "x" << n << " (Khong de quy) = " << xn_iterative(n) << endl;
    cout << "x7 = " << xn_iterative(7) << endl;
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "n",
          "label": "Nhập n (1 đến 30)",
          "default": "7"
        }
      ],
      run: (i) => {
      const n = parseInt(i.n);
      if (!(n >= 1 && n <= 30)) return 'n khong hop le!';
      const calc = (k) => { if (k <= 2) return 1n; let f1 = 1n, f2 = 1n, fn = 0n; for (let j = 3; j <= k; j++) { fn = f2 + BigInt(j - 1) * f1; f1 = f2; f2 = fn; } return fn; };
      return `x${n} (De quy) = ${calc(n)}\nx${n} (Khong de quy) = ${calc(n)}\nx7 = ${calc(7)}`;
    }
    }
  },
  {
    id: "ch4-1",
    chapter: 4,
    chapterTitle: "Chương 4: Mảng",
    title: "Bài 4.1: Thao Tác Trên Mảng 1 Chiều",
    description: "Cho mảng n số nguyên: 1) Tính TBC. 2) Tìm giá trị lớn thứ k. 3) Chuyển số nguyên tố về cuối mảng.",
    algorithm: "Dùng con trỏ hoặc 2 mảng phụ/kỹ thuật partition để đưa các số nguyên tố về phía cuối mảng.",
    code: `#include <iostream>
#include <vector>
#include <algorithm>
#include <functional>
#include <cmath>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i <= sqrt(n); i++) if (n % i == 0) return false;
    return true;
}

int main() {
    int n, k;
    cout << "Nhap so phan tu n: "; cin >> n;
    if (n <= 0) { cout << "n khong hop le!" << endl; return 0; }

    vector<int> a(n);
    cout << "Nhap " << n << " so nguyen: ";
    for (int &x : a) cin >> x;

    cout << "Nhap k: "; cin >> k;
    if (k < 1 || k > n) { cout << "k khong hop le!" << endl; return 0; }

    // 1. Trung binh cong
    double sum = 0;
    for (int x : a) sum += x;
    cout << "TBC = " << sum / a.size() << endl;

    // 2. Gia tri lon thu k (sap xep ban sao giam dan)
    vector<int> sorted = a;
    sort(sorted.begin(), sorted.end(), greater<int>());
    cout << "Gia tri lon thu " << k << ": " << sorted[k - 1] << endl;

    // 3. Chuyen so nguyen to ve cuoi mang
    vector<int> normal, primes;
    for (int x : a) {
        if (isPrime(x)) primes.push_back(x);
        else normal.push_back(x);
    }
    cout << "Mang sau khi dua SNT ve cuoi: ";
    for (int x : normal) cout << x << " ";
    for (int x : primes) cout << x << " ";
    cout << endl;

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "arr",
          "label": "Mảng các số nguyên",
          "default": "12 7 5 4 11 8 3"
        },
        {
          "name": "k",
          "label": "k (giá trị lớn thứ k)",
          "default": "2"
        }
      ],
      run: (i) => {
      const a = i.arr.trim().split(/\s+/).filter(Boolean).map(Number);
      const k = parseInt(i.k);
      if (a.length === 0 || a.some(x => !Number.isInteger(x))) return 'n khong hop le hoac mang chua gia tri khong phai so nguyen!';
      if (!(k >= 1 && k <= a.length)) return 'k khong hop le!';
      const isP = (n) => { if (n < 2) return false; for (let j = 2; j * j <= n; j++) if (n % j === 0) return false; return true; };
      const avg = a.reduce((s, x) => s + x, 0) / a.length;
      const sorted = [...a].sort((x, y) => y - x);
      const f = (arr) => arr.map(x => x + ' ').join('');
      return `TBC = ${cppNum(avg)}\nGia tri lon thu ${k}: ${sorted[k - 1]}\nMang sau khi dua SNT ve cuoi: ${f(a.filter(x => !isP(x)))}${f(a.filter(isP))}`;
    }
    }
  },
  {
    id: "ch4-2",
    chapter: 4,
    chapterTitle: "Chương 4: Mảng",
    title: "Bài 4.2: Phép Toán Ma Trận (Cộng, Tích, Nhân Max Dòng)",
    description: "Thực hiện phép tính trên 2 ma trận a, b cấp n x n: Cộng 2 ma trận, Tích 2 ma trận và tạo ma trận c = a[i][j] * MaxRow(b, i).",
    algorithm: "Sử dụng mảng 2 chiều và công thức nhân ma trận tiêu chuẩn C[i][j] = sum(A[i][k] * B[k][j]).",
    code: `#include <iostream>
#include <vector>
#include <algorithm>
using namespace std;

typedef vector<vector<int>> Matrix;

Matrix nhap(int n) {
    Matrix m(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) cin >> m[i][j];
    return m;
}

void xuat(const Matrix &m) {
    for (const auto &row : m) {
        for (int x : row) cout << x << " ";
        cout << endl;
    }
}

int main() {
    int n;
    cout << "Nhap cap n (1..10): "; cin >> n;
    if (n < 1 || n > 10) { cout << "n khong hop le!" << endl; return 0; }

    cout << "Nhap ma tran A:" << endl; Matrix a = nhap(n);
    cout << "Nhap ma tran B:" << endl; Matrix b = nhap(n);

    // 1. Ma tran Tong
    Matrix tong(n, vector<int>(n));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++) tong[i][j] = a[i][j] + b[i][j];
    cout << "Ma tran Tong A + B:" << endl; xuat(tong);

    // 2. Ma tran Tich A x B
    Matrix tich(n, vector<int>(n, 0));
    for (int i = 0; i < n; i++)
        for (int j = 0; j < n; j++)
            for (int k = 0; k < n; k++) tich[i][j] += a[i][k] * b[k][j];
    cout << "Ma tran Tich A x B:" << endl; xuat(tich);

    // 3. Ma tran C: c[i][j] = a[i][j] * MaxRow(b, i)
    Matrix c(n, vector<int>(n));
    for (int i = 0; i < n; i++) {
        int maxB = *max_element(b[i].begin(), b[i].end());
        for (int j = 0; j < n; j++) c[i][j] = a[i][j] * maxB;
    }
    cout << "Ma tran C (a[i][j] * Max dong i cua B):" << endl; xuat(c);

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "a",
          "label": "Ma trận A (các dòng cách nhau bởi dấu ;)",
          "default": "1 2 3; 4 3 2; 5 3 7"
        },
        {
          "name": "b",
          "label": "Ma trận B (các dòng cách nhau bởi dấu ;)",
          "default": "2 1 3; 3 2 1; 4 5 2"
        }
      ],
      run: (i) => {
      const parse = (s) => s.split(';').map(r => r.trim()).filter(Boolean).map(r => r.split(/\s+/).map(Number));
      const A = parse(i.a), B = parse(i.b), n = A.length;
      const ok = (M) => M.length === n && M.every(r => r.length === n && r.every(Number.isInteger));
      if (n < 1 || n > 10 || !ok(A) || !ok(B)) return 'Can hai ma tran vuong cung cap n (1..10), gom cac so nguyen!';
      const show = (M) => M.map(r => r.map(x => x + ' ').join('')).join('\n');
      const T = A.map((r, x) => r.map((_, y) => A[x][y] + B[x][y]));
      const P = A.map((r, x) => r.map((_, y) => { let s = 0; for (let k = 0; k < n; k++) s += A[x][k] * B[k][y]; return s; }));
      const C = A.map((r, x) => { const mx = Math.max(...B[x]); return r.map(v => v * mx); });
      return `Ma tran Tong A + B:\n${show(T)}\nMa tran Tich A x B:\n${show(P)}\nMa tran C (a[i][j] * Max dong i cua B):\n${show(C)}`;
    }
    }
  },
  {
    id: "ch4-3",
    chapter: 4,
    chapterTitle: "Chương 4: Mảng",
    title: "Bài 4.3: Thao Tác Trên Chuỗi (String)",
    description: "Đếm từ, độ dài từng từ, từ dài nhất, từ đầu trái/phải và sắp xếp ký tự giữ nguyên khoảng trắng.",
    algorithm: "Sử dụng `stringstream` để tách từ trong C++. Kỹ thuật mảng ký tự để sắp xếp.",
    code: `#include <iostream>
#include <string>
#include <sstream>
#include <vector>
#include <algorithm>
using namespace std;

int main() {
    string s;
    cout << "Nhap chuoi (khong dau): ";
    getline(cin, s);

    stringstream ss(s);
    string word, longestWord = "";
    vector<string> words;

    while (ss >> word) {
        words.push_back(word);
        if (word.length() > longestWord.length()) longestWord = word;
    }

    if (words.empty()) {
        cout << "Chuoi rong!" << endl;
        return 0;
    }

    cout << "So luong tu: " << words.size() << endl;
    cout << "Tu dau trai: " << words.front() << ", Tu dau phai: " << words.back() << endl;
    cout << "Tu dai nhat: " << longestWord << " (" << longestWord.length() << " ky tu)" << endl;

    cout << "Do dai tung tu: ";
    for (const string &w : words) cout << w << "(" << w.length() << ") ";
    cout << endl;

    // Sap xep ky tu tang dan nhung giu nguyen vi tri khoang trang
    string chars;
    for (char c : s) if (c != ' ') chars += c;
    sort(chars.begin(), chars.end());

    string res = s;
    size_t idx = 0;
    for (char &c : res) if (c != ' ') c = chars[idx++];
    cout << "Chuoi sau khi sap xep ky tu: " << res << endl;

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "str",
          "label": "Nhập chuỗi s (không dấu)",
          "default": "Lap trinh C plus plus rat hay"
        }
      ],
      run: (i) => {
      const s = i.str;
      const words = s.split(/\s+/).filter(Boolean);
      if (words.length === 0) return 'Chuoi rong!';
      let lw = '';
      words.forEach(w => { if (w.length > lw.length) lw = w; });
      const chars = s.split('').filter(c => c !== ' ').sort();
      let idx = 0;
      const res = s.split('').map(c => c !== ' ' ? chars[idx++] : c).join('');
      return `So luong tu: ${words.length}\nTu dau trai: ${words[0]}, Tu dau phai: ${words[words.length - 1]}\nTu dai nhat: ${lw} (${lw.length} ky tu)\nDo dai tung tu: ${words.map(w => `${w}(${w.length}) `).join('')}\nChuoi sau khi sap xep ky tu: ${res}`;
    }
    }
  },
  {
    id: "ch5-1",
    chapter: 5,
    chapterTitle: "Chương 5: Struct & Class",
    title: "Bài 5.1: Cấu Trúc Số Phức (SOPHUC)",
    description: "Khai báo struct SOPHUC, tính mô-đun (độ lớn) và thực hiện các phép cộng, trừ, nhân, chia 2 số phức.",
    algorithm: "Số phức Z = a + bi.\n- Độ lớn |Z| = sqrt(a^2 + b^2)\n- Tích (a+bi)(c+di) = (ac-bd) + (ad+bc)i.",
    code: `#include <iostream>
#include <cmath>
using namespace std;

struct SOPHUC {
    double thuc;
    double au;

    double doLon() const {
        return sqrt(thuc * thuc + au * au);
    }
};

SOPHUC cong(SOPHUC u, SOPHUC v) { return {u.thuc + v.thuc, u.au + v.au}; }
SOPHUC tru(SOPHUC u, SOPHUC v) { return {u.thuc - v.thuc, u.au - v.au}; }
SOPHUC nhan(SOPHUC u, SOPHUC v) {
    return {u.thuc * v.thuc - u.au * v.au, u.thuc * v.au + u.au * v.thuc};
}
SOPHUC chia(SOPHUC u, SOPHUC v) {
    double mau = v.thuc * v.thuc + v.au * v.au;
    return {(u.thuc * v.thuc + u.au * v.au) / mau, (u.au * v.thuc - u.thuc * v.au) / mau};
}

void xuat(SOPHUC z) {
    cout << z.thuc << (z.au < 0 ? " - " : " + ") << fabs(z.au) << "i";
}

int main() {
    SOPHUC z1, z2;
    cout << "Nhap z1 (thuc au): "; cin >> z1.thuc >> z1.au;
    cout << "Nhap z2 (thuc au): "; cin >> z2.thuc >> z2.au;

    cout << "|z1| = " << z1.doLon() << endl;
    cout << "|z2| = " << z2.doLon() << endl;
    cout << "z1 + z2 = "; xuat(cong(z1, z2)); cout << endl;
    cout << "z1 - z2 = "; xuat(tru(z1, z2)); cout << endl;
    cout << "z1 * z2 = "; xuat(nhan(z1, z2)); cout << endl;
    if (z2.doLon() == 0) cout << "z1 / z2: khong chia duoc cho 0" << endl;
    else { cout << "z1 / z2 = "; xuat(chia(z1, z2)); cout << endl; }

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "z1",
          "label": "Số phức 1 (Thực Ảo)",
          "default": "3 4"
        },
        {
          "name": "z2",
          "label": "Số phức 2 (Thực Ảo)",
          "default": "1 -2"
        }
      ],
      run: (i) => {
      const [a, b] = i.z1.trim().split(/\s+/).map(Number);
      const [c, d] = i.z2.trim().split(/\s+/).map(Number);
      if ([a, b, c, d].some(x => isNaN(x))) return 'Du lieu khong hop le (moi so phuc can 2 so)!';
      const xs = (re, im) => `${cppNum(re)}${im < 0 ? ' - ' : ' + '}${cppNum(Math.abs(im))}i`;
      const mau = c * c + d * d;
      const div = Math.sqrt(mau) === 0 ? 'z1 / z2: khong chia duoc cho 0' : `z1 / z2 = ${xs((a * c + b * d) / mau, (b * c - a * d) / mau)}`;
      return `|z1| = ${cppNum(Math.sqrt(a * a + b * b))}\n|z2| = ${cppNum(Math.sqrt(mau))}\nz1 + z2 = ${xs(a + c, b + d)}\nz1 - z2 = ${xs(a - c, b - d)}\nz1 * z2 = ${xs(a * c - b * d, a * d + b * c)}\n${div}`;
    }
    }
  },
  {
    id: "ch5-2",
    chapter: 5,
    chapterTitle: "Chương 5: Struct & Class",
    title: "Bài 5.2: Quản Lý Danh Sách Thí Sinh Cao Học",
    description: "Quản lý thí sinh: SBD, Họ tên, Điểm ngoại ngữ, cơ bản, cơ sở. Lọc thí sinh liệt (<5), thủ khoa, đếm đậu, tìm theo SBD.",
    algorithm: "Sử dụng struct `ThiSinh` chứa các trường thông tin và mảng cấu trúc để xử lý.",
    code: `#include <iostream>
#include <string>
#include <vector>
#include <iomanip>
using namespace std;

struct ThiSinh {
    string sbd;
    string hoTen;
    double ngoaiNgu, coBan, coSo;

    double tongDiem() const { return ngoaiNgu + coBan + coSo; }
    bool biLiet() const { return ngoaiNgu < 5 || coBan < 5 || coSo < 5; }
};

int main() {
    vector<ThiSinh> ds = {
        {"CH01", "Nguyen Van A", 7.0, 8.5, 6.0},
        {"CH02", "Tran Thi B", 4.5, 9.0, 8.0},  // Liet ngoai ngu
        {"CH03", "Le Van C", 8.0, 9.0, 9.5}     // Thu khoa
    };
    cout << fixed << setprecision(1);

    // 1. Thi sinh liet (co mon < 5)
    cout << "--- THI SINH CO MON < 5 ---" << endl;
    for (const auto &ts : ds)
        if (ts.biLiet()) cout << ts.sbd << " - " << ts.hoTen << endl;

    // 2. Dem thi sinh dau (khong bi liet) va tim thu khoa
    int dau = 0, best = -1;
    for (int i = 0; i < (int)ds.size(); i++) {
        if (ds[i].biLiet()) continue;
        dau++;
        if (best == -1 || ds[i].tongDiem() > ds[best].tongDiem()) best = i;
    }
    cout << "--- KET QUA TUYEN SINH ---" << endl;
    cout << "So thi sinh dau: " << dau << "/" << ds.size() << endl;
    if (best != -1)
        cout << "Thu khoa: " << ds[best].hoTen << " (" << ds[best].sbd
             << ") - Tong diem: " << ds[best].tongDiem() << endl;
    else
        cout << "Khong co thi sinh dau." << endl;

    // 3. Tim thi sinh theo SBD
    string key;
    cout << "Nhap SBD can tim: "; cin >> key;
    bool found = false;
    for (const auto &ts : ds) {
        if (ts.sbd == key) {
            cout << "Tim thay: " << ts.hoTen << " | NN=" << ts.ngoaiNgu << " CB=" << ts.coBan
                 << " CS=" << ts.coSo << " | Tong=" << ts.tongDiem() << endl;
            found = true;
            break;
        }
    }
    if (!found) cout << "Khong tim thay SBD " << key << endl;

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        {
          "name": "sbd",
          "label": "SBD cần tìm",
          "default": "CH03"
        }
      ],
      run: (inp) => {
      const ds = [
        { sbd: 'CH01', ten: 'Nguyen Van A', nn: 7.0, cb: 8.5, cs: 6.0 },
        { sbd: 'CH02', ten: 'Tran Thi B', nn: 4.5, cb: 9.0, cs: 8.0 },
        { sbd: 'CH03', ten: 'Le Van C', nn: 8.0, cb: 9.0, cs: 9.5 }
      ];
      const tong = (t) => t.nn + t.cb + t.cs, liet = (t) => t.nn < 5 || t.cb < 5 || t.cs < 5;
      const f = (x) => x.toFixed(1);
      let out = '--- THI SINH CO MON < 5 ---\n';
      ds.filter(liet).forEach(t => { out += `${t.sbd} - ${t.ten}\n`; });
      let dau = 0, best = -1;
      ds.forEach((t, k) => { if (liet(t)) return; dau++; if (best === -1 || tong(t) > tong(ds[best])) best = k; });
      out += `--- KET QUA TUYEN SINH ---\nSo thi sinh dau: ${dau}/${ds.length}\n`;
      out += best !== -1 ? `Thu khoa: ${ds[best].ten} (${ds[best].sbd}) - Tong diem: ${f(tong(ds[best]))}\n` : 'Khong co thi sinh dau.\n';
      const key = (inp.sbd || '').trim().split(/\s+/)[0] || '';
      const t = ds.find(x => x.sbd === key);
      out += t ? `Tim thay: ${t.ten} | NN=${f(t.nn)} CB=${f(t.cb)} CS=${f(t.cs)} | Tong=${f(tong(t))}` : `Khong tim thay SBD ${key}`;
      return out;
    }
    }
  }
];

    // ----- Định dạng số thực giống cout (6 chữ số có nghĩa) cho phần mô phỏng -----
function cppNum(x) {
  if (Number.isNaN(x)) return 'nan';
  if (!Number.isFinite(x)) return x < 0 ? '-inf' : 'inf';
  if (x === 0) return Object.is(x, -0) ? '-0' : '0';
  const [m, e] = x.toExponential(5).split('e');
  const E = parseInt(e, 10);
  if (E < -4 || E >= 6) {
    return m.replace(/\.?0+$/, '') + 'e' + (E < 0 ? '-' : '+') + String(Math.abs(E)).padStart(2, '0');
  }
  return String(parseFloat(x.toPrecision(6)));
}

    // ----- Nội dung bài học cho từng bài: mục tiêu, kiến thức, giải thích code, lỗi thường gặp, thử thách, quiz -----
const LESSONS = {
  "cpp-basics-1": {
    level: "Cơ bản", minutes: 10,
    goals: ["Hiểu cấu trúc tối thiểu của một chương trình C++", "In dữ liệu ra màn hình bằng `cout`", "Biết biên dịch và chạy chương trình đầu tiên"],
    theory: [
      "`#include <iostream>` nạp thư viện nhập/xuất chuẩn; thiếu dòng này thì không dùng được `cout`.",
      "`main()` là điểm bắt đầu: chương trình luôn chạy từ hàm này.",
      "`std::cout << ...` gửi dữ liệu ra màn hình; toán tử `<<` có thể nối nhiều giá trị liên tiếp.",
      "`std::endl` xuống dòng; `return 0;` báo chương trình kết thúc bình thường.",
      "Mỗi câu lệnh kết thúc bằng dấu `;`."
    ],
    explain: [
      { code: "#include <iostream>", note: "Khai báo thư viện nhập xuất để trình biên dịch biết `cout`, `cin`, `endl` ở đâu." },
      { code: "int main() {", note: "Hàm chính trả về `int`. Mọi lệnh của chương trình nằm trong cặp `{ }`." },
      { code: "// chú thích", note: "Dòng bắt đầu bằng `//` là chú thích, trình biên dịch bỏ qua." },
      { code: "std::cout << \"Hello, World!\" << std::endl;", note: "`std::` là không gian tên chuẩn. Chuỗi trong nháy kép được in ra rồi xuống dòng." },
      { code: "return 0;", note: "Trả về 0 cho hệ điều hành, nghĩa là chạy thành công." }
    ],
    pitfalls: [
      "Quên dấu `;` cuối lệnh sẽ báo lỗi biên dịch ở dòng ngay sau đó.",
      "Viết `cout` mà không có `std::` hoặc `using namespace std;` sẽ báo lỗi chưa khai báo.",
      "Chữ tiếng Việt có dấu có thể hiển thị lỗi trên một số terminal Windows; khi mới học hãy in không dấu."
    ],
    challenge: ["In ra 3 dòng: họ tên, lớp và trường của bạn, mỗi thông tin một dòng.", "Vẽ một hình tam giác nhỏ bằng dấu `*` chỉ với các lệnh `cout`."],
    quiz: { q: "Chương trình C++ bắt đầu chạy từ đâu?", options: ["Dòng #include đầu tiên", "Hàm main()", "Lệnh cout đầu tiên", "Dòng chú thích"], answer: 1, why: "Hệ điều hành luôn gọi hàm `main()` trước tiên; `#include` chỉ là chỉ thị cho trình biên dịch." }
  },

  "cpp-basics-2": {
    level: "Cơ bản", minutes: 15,
    goals: ["Khai báo biến thuộc các kiểu `int`, `double`, `char`, `string`, `bool`", "Nhập dữ liệu bằng `cin` và xuất bằng `cout`", "Biết giới hạn của `cin >> string`"],
    theory: [
      "`int` là số nguyên; `double` là số thực; `char` là một ký tự (viết trong nháy đơn như 'A'); `string` là chuỗi (cần `<string>`); `bool` là đúng/sai (1/0).",
      "`cin >> x` đọc một giá trị theo kiểu của `x` và bỏ qua khoảng trắng đứng trước.",
      "`cin >> chuỗi` chỉ đọc đến khi gặp khoảng trắng; muốn đọc cả dòng dùng `getline(cin, s)`.",
      "Biến cục bộ chưa gán giá trị chứa giá trị rác, nên hãy gán trước khi dùng.",
      "Toán tử ba ngôi `đk ? a : b` chọn một trong hai giá trị tùy điều kiện."
    ],
    explain: [
      { code: "string name; int age; double height; char grade; bool isStudent;", note: "Khai báo năm biến thuộc năm kiểu khác nhau. Chúng chưa có giá trị cho đến khi `cin` gán." },
      { code: "cin >> name;", note: "Đọc một từ (không có khoảng trắng). Gõ \"Nam Anh\" thì chỉ nhận \"Nam\"." },
      { code: "cin >> age; cin >> height;", note: "`cin` tự chuyển văn bản gõ vào thành số đúng kiểu của biến." },
      { code: "cin >> grade;", note: "Với `char`, `cin` chỉ lấy một ký tự đầu tiên của dữ liệu nhập." },
      { code: "(isStudent ? \"Co\" : \"Khong\")", note: "Toán tử ba ngôi: nếu `isStudent` khác 0 thì in \"Co\", ngược lại in \"Khong\"." }
    ],
    pitfalls: [
      "Nhập chữ vào biến số làm `cin` rơi vào trạng thái lỗi và các lệnh `cin` sau đó không đọc được nữa.",
      "Dùng `cin >> s` cho họ tên có khoảng trắng sẽ mất phần sau; cần `getline`.",
      "Trộn `cin >>` rồi `getline` bị sót ký tự xuống dòng; thêm `cin.ignore()` trước `getline`."
    ],
    challenge: ["Thêm biến `long long` để lưu số điện thoại hoặc số lớn rồi in ra.", "Đọc họ tên đầy đủ có khoảng trắng bằng `getline` thay cho `cin >>`."],
    quiz: { q: "Muốn đọc cả dòng \"Nguyen Van An\" vào một string, dùng cách nào?", options: ["cin >> s;", "getline(cin, s);", "cin.get(s);", "scanf(s);"], answer: 1, why: "`cin >> s` dừng ở khoảng trắng đầu tiên, còn `getline(cin, s)` lấy trọn cả dòng." }
  },

  "cpp-basics-3": {
    level: "Cơ bản", minutes: 15,
    goals: ["Dùng vòng lặp `for` và `while`", "Rẽ nhánh bằng `if`", "Dùng toán tử `%` để kiểm tra chẵn lẻ"],
    theory: [
      "`for (khởi tạo; điều kiện; bước nhảy)` phù hợp khi biết trước số lần lặp.",
      "`while (điều kiện)` lặp khi điều kiện còn đúng; bạn phải tự cập nhật biến trong thân vòng lặp.",
      "`i % 2 == 0` nghĩa là `i` chia hết cho 2, tức số chẵn.",
      "`sum += i` tương đương `sum = sum + i`, là dạng tích lũy rất hay gặp.",
      "Biến khai báo trong `for` chỉ tồn tại bên trong vòng lặp đó."
    ],
    explain: [
      { code: "for (int i = 1; i <= n; i++) {", note: "`i` chạy từ 1 đến `n`, mỗi vòng tăng thêm 1." },
      { code: "if (i % 2 == 0) { cout << i << \" \"; }", note: "Chỉ in những số chia hết cho 2." },
      { code: "int sum = 0, i = 1;", note: "`sum` là biến tích lũy, phải khởi tạo bằng 0 trước khi cộng dồn." },
      { code: "while (i <= n) { sum += i; i++; }", note: "Cộng `i` vào `sum` rồi tăng `i`. Nếu quên `i++` vòng lặp sẽ chạy mãi." }
    ],
    pitfalls: [
      "Quên `i++` trong `while` gây vòng lặp vô hạn.",
      "Nhầm `=` (gán) với `==` (so sánh) trong điều kiện `if`.",
      "Dùng `i < n` thay cho `i <= n` làm thiếu phần tử cuối."
    ],
    challenge: ["In các số lẻ từ 1 đến N rồi tính tổng của chúng.", "Dùng `while` để đếm ngược từ N về 1."],
    quiz: { q: "Điều kiện nào kiểm tra i là số chẵn?", options: ["i / 2 == 0", "i % 2 == 0", "i % 2 == 1", "i = 2"], answer: 1, why: "`%` lấy phần dư; số chẵn chia cho 2 dư 0." }
  },

  "ch1-1": {
    level: "Cơ bản", minutes: 10,
    goals: ["Dùng phép chia nguyên `/` và phép lấy dư `%`", "Kiểm tra dữ liệu nhập hợp lệ", "Phân rã một đại lượng thành nhiều đơn vị"],
    theory: [
      "Với số nguyên, `/` là chia lấy phần nguyên (`3700 / 3600 = 1`).",
      "`%` lấy phần dư (`3700 % 3600 = 100`).",
      "Phân rã thời gian: giờ = t/3600; phút = (t%3600)/60; giây = t%60.",
      "`if (!(cin >> t))` kiểm tra việc đọc dữ liệu có thành công không."
    ],
    explain: [
      { code: "if (!(cin >> t) || t < 0)", note: "Vừa đọc `t` vừa kiểm tra: nếu không phải số hoặc là số âm thì báo lỗi và thoát." },
      { code: "long hours = t / 3600;", note: "Một giờ có 3600 giây; chia nguyên cho 3600 để lấy số giờ trọn vẹn." },
      { code: "long minutes = (t % 3600) / 60;", note: "Phần dư sau khi bỏ giờ, đổi ra phút." },
      { code: "long seconds = t % 60;", note: "Số giây lẻ còn lại." }
    ],
    pitfalls: [
      "Chia hai số nguyên sẽ cắt phần thập phân; đừng dùng `/` để làm tròn.",
      "Trên Windows `long` chỉ 32 bit (tối đa khoảng 2,1 tỉ); dùng `long long` nếu t có thể rất lớn.",
      "Quên kiểm tra số âm sẽ cho kết quả vô nghĩa."
    ],
    challenge: ["Mở rộng để đổi ra ngày - giờ - phút - giây.", "Làm bài ngược lại: nhập giờ, phút, giây rồi đổi ra tổng số giây."],
    quiz: { q: "t = 3700 giây thì số phút (sau khi tách giờ) là bao nhiêu?", options: ["1", "61", "2", "100"], answer: 0, why: "3700 = 1 giờ (3600 giây) + 100 giây dư; 100 giây = 1 phút 40 giây, nên số phút là 1." }
  },

  "ch1-2": {
    level: "Trung bình", minutes: 20,
    goals: ["Viết hàm tự định nghĩa để tính khoảng cách", "Áp dụng công thức Heron", "Làm quen `<cmath>` và `<iomanip>`"],
    theory: [
      "Khoảng cách hai điểm: √((x2−x1)² + (y2−y1)²).",
      "Công thức Heron: p = (a+b+c)/2 và S = √(p(p−a)(p−b)(p−c)).",
      "Bán kính nội tiếp r = S/p; ngoại tiếp R = abc/(4S).",
      "So sánh số thực với 0 nên dùng ngưỡng (`<= 1e-9`) thay vì `==`.",
      "`fixed << setprecision(2)` cố định 2 chữ số sau dấu phẩy."
    ],
    explain: [
      { code: "double distance(...) { return sqrt(...); }", note: "Hàm con được dùng lại ba lần để tính ba cạnh." },
      { code: "double xg = (xa + xb + xc) / 3.0;", note: "Dùng `3.0` để phép chia ra số thực." },
      { code: "if (S_tri <= 1e-9)", note: "Ba điểm thẳng hàng cho diện tích gần 0; chương trình báo không phải tam giác." },
      { code: "double r = S_tri / p; double R = (a*b*c) / (4.0*S_tri);", note: "Tính hai bán kính rồi lấy diện tích hai đường tròn bằng π·r²." },
      { code: "cout << fixed << setprecision(2);", note: "Mọi số thực in ra sau đó đều có 2 chữ số thập phân." }
    ],
    pitfalls: [
      "Viết `1/3` (hai số nguyên) cho kết quả 0; phải viết `1.0/3`.",
      "Dùng `==` để so sánh số thực dễ sai vì sai số làm tròn.",
      "Kiểm tra ba điểm có thẳng hàng trước khi tính để không chia cho 0."
    ],
    challenge: ["Thêm tính chu vi và diện tích tam giác ABC.", "In thêm tọa độ tâm đường tròn ngoại tiếp (nâng cao)."],
    quiz: { q: "Vì sao dùng `S <= 1e-9` thay vì `S == 0`?", options: ["Để chương trình chạy nhanh hơn", "Vì số thực có sai số làm tròn", "Vì C++ không cho so sánh với 0", "Vì S luôn âm"], answer: 1, why: "Phép tính số thực tích lũy sai số nhỏ nên hiếm khi ra đúng 0; ta coi giá trị rất nhỏ là 0." }
  },

  "ch1-3": {
    level: "Cơ bản", minutes: 10,
    goals: ["Dùng mảng một chiều", "Dùng các biến đếm", "Rẽ nhánh nhiều trường hợp với `if - else if - else`"],
    theory: [
      "`int nums[6]` khai báo mảng 6 phần tử, chỉ số từ 0 đến 5.",
      "Biến đếm phải khởi tạo bằng 0 trước khi tăng.",
      "`if - else if - else` chỉ chạy đúng một nhánh đầu tiên thỏa điều kiện.",
      "`cin >> nums[i]` đọc trực tiếp vào phần tử của mảng.",
      "Ba trường hợp âm / bằng 0 / dương bao phủ mọi số nguyên."
    ],
    explain: [
      { code: "int neg = 0, zero = 0, pos = 0;", note: "Ba biến đếm, khởi tạo bằng 0." },
      { code: "for (int i = 0; i < 6; i++) {", note: "Duyệt chỉ số 0 đến 5, đúng 6 lần." },
      { code: "cin >> nums[i];", note: "Đọc phần tử thứ i của mảng." },
      { code: "if (nums[i] < 0) neg++; else if (nums[i] == 0) zero++; else pos++;", note: "Mỗi số rơi vào đúng một nhóm nên tổng ba biến đếm luôn bằng 6." }
    ],
    pitfalls: [
      "Chỉ số mảng bắt đầu từ 0; truy cập `nums[6]` là lỗi tràn mảng.",
      "Quên khởi tạo biến đếm làm kết quả chứa giá trị rác.",
      "Viết ba lệnh `if` rời nhau (không `else`) vẫn đúng nhưng kém hiệu quả."
    ],
    challenge: ["Mở rộng cho N số, N nhập từ bàn phím (dùng `vector`).", "Đếm thêm số chẵn và số lẻ."],
    quiz: { q: "Mảng int a[6] có chỉ số hợp lệ từ đâu đến đâu?", options: ["1 đến 6", "0 đến 6", "0 đến 5", "1 đến 5"], answer: 2, why: "Chỉ số bắt đầu từ 0, nên 6 phần tử có chỉ số 0, 1, 2, 3, 4, 5." }
  },

  "ch1-4": {
    level: "Cơ bản", minutes: 15,
    goals: ["Tìm max và min bằng cách so sánh dần", "Sắp xếp bằng `std::sort`", "Dùng thư viện `<algorithm>`"],
    theory: [
      "Khởi tạo `minVal` và `maxVal` bằng phần tử đầu rồi so sánh với các phần tử còn lại.",
      "`sort(a, a + n)` sắp xếp tăng dần mảng `a` gồm `n` phần tử.",
      "Sắp xếp giảm dần: `sort(a, a + n, greater<int>())`.",
      "`sort` có độ phức tạp khoảng O(n log n).",
      "Sau khi sắp xếp tăng dần, phần tử đầu là min và phần tử cuối là max."
    ],
    explain: [
      { code: "int minVal = a[0], maxVal = a[0];", note: "Lấy phần tử đầu làm giá trị khởi đầu, không cần đoán trước một số quá lớn hay quá nhỏ." },
      { code: "if(a[i] < minVal) minVal = a[i];", note: "Gặp phần tử nhỏ hơn thì cập nhật min; max làm tương tự với dấu `>`." },
      { code: "sort(a, a + 4);", note: "Sắp xếp 4 phần tử từ địa chỉ `a` đến `a + 4` (không gồm `a + 4`)." },
      { code: "for(...) cout << a[i] << \" \";", note: "In mảng đã sắp xếp, cách nhau bởi dấu cách." }
    ],
    pitfalls: [
      "Khởi tạo `minVal = 0` sẽ sai khi mọi số đều dương.",
      "`sort(a, a + 4)` là đoạn nửa mở: `a[4]` không được sắp xếp.",
      "Quên `#include <algorithm>` làm `sort` không được nhận ra."
    ],
    challenge: ["Sắp xếp giảm dần.", "In thêm số lớn thứ hai mà không sắp xếp lại toàn bộ."],
    quiz: { q: "sort(a, a + 4) sắp xếp những phần tử nào?", options: ["a[0] đến a[4]", "a[0] đến a[3]", "a[1] đến a[4]", "Chỉ a[4]"], answer: 1, why: "Đoạn sắp xếp là nửa mở [a, a+4), gồm a[0], a[1], a[2], a[3]." }
  },

  "ch2-1": {
    level: "Trung bình", minutes: 20,
    goals: ["Phân chia trường hợp lồng nhau", "Giải phương trình bậc nhất và bậc hai", "Dùng `sqrt` trong `<cmath>`"],
    theory: [
      "Kiểm tra `a == 0` trước: khi đó phương trình là bậc nhất bx + c = 0.",
      "Δ = b² − 4ac: Δ < 0 vô nghiệm thực; Δ = 0 nghiệm kép; Δ > 0 hai nghiệm phân biệt.",
      "Nghiệm: x = (−b ± √Δ) / (2a).",
      "Bậc nhất: b = 0 và c = 0 là vô số nghiệm; b = 0, c ≠ 0 là vô nghiệm.",
      "Xét các trường hợp đặc biệt trước để tránh chia cho 0."
    ],
    explain: [
      { code: "if (a == 0) { if (b == 0) {...} else {...} }", note: "Nhánh bậc nhất có ba kết quả: vô số nghiệm, vô nghiệm hoặc một nghiệm x = −c/b." },
      { code: "double delta = b * b - 4 * a * c;", note: "Biệt thức quyết định số nghiệm." },
      { code: "else if (delta == 0)", note: "Nghiệm kép x = −b / (2a)." },
      { code: "(-b + sqrt(delta)) / (2 * a)", note: "Công thức nghiệm thứ nhất; nghiệm thứ hai đổi dấu trước căn." }
    ],
    pitfalls: [
      "Chia cho `2 * a` khi `a == 0` gây lỗi; luôn xét `a == 0` trước.",
      "`delta == 0` với số thực có thể trượt do sai số; bài nâng cao nên dùng ngưỡng nhỏ.",
      "Viết `(-b + sqrt(delta)) / 2 * a` (thiếu ngoặc) cho kết quả sai."
    ],
    challenge: ["Mở rộng để in nghiệm phức khi Δ < 0.", "Dùng ngưỡng `1e-9` để so sánh Δ với 0."],
    quiz: { q: "Phương trình 0x² + 0x + 5 = 0 có kết quả gì?", options: ["Vô số nghiệm", "Một nghiệm x = 5", "Vô nghiệm", "Hai nghiệm phân biệt"], answer: 2, why: "Khi a = 0 và b = 0 mà c ≠ 0 thì 5 = 0 không bao giờ đúng, nên vô nghiệm." }
  },

  "ch2-2": {
    level: "Trung bình", minutes: 20,
    goals: ["Hiểu định thức cấp 2 và quy tắc Cramer", "Phân loại: nghiệm duy nhất, vô nghiệm, vô số nghiệm", "Chuyển công thức toán thành code"],
    theory: [
      "D = a1·b2 − a2·b1 là định thức của hệ số.",
      "Dx thay cột hệ số của x bằng cột vế phải; Dy thay cột của y.",
      "Nếu D ≠ 0 thì x = Dx/D và y = Dy/D.",
      "Nếu D = 0: Dx = Dy = 0 thì vô số nghiệm; ngược lại vô nghiệm (khi các hệ số không đồng thời bằng 0).",
      "Hệ nhiều ẩn hơn dùng định thức cấp cao; bạn có thể thử bằng công cụ Định thức (Ma trận) trong trang này."
    ],
    explain: [
      { code: "double D = a1 * b2 - a2 * b1;", note: "Định thức của ma trận hệ số." },
      { code: "double Dx = c1 * b2 - c2 * b1;", note: "Thay cột hệ số của x bằng cột vế phải." },
      { code: "if (D != 0) {...}", note: "Hệ có đúng một nghiệm: chia từng định thức cho D." },
      { code: "if (Dx == 0 && Dy == 0)", note: "Khi D = 0 mà Dx, Dy đều bằng 0 thì hai phương trình biểu diễn cùng một đường thẳng." }
    ],
    pitfalls: [
      "Nhầm vị trí hệ số khi tính Dx, Dy là lỗi hay gặp; hãy vẽ ma trận ra giấy trước.",
      "Trường hợp 0x + 0y = 1 và 0x + 0y = 2 cũng cho D = Dx = Dy = 0 nhưng thực ra vô nghiệm; đề bài thường bỏ qua, nhưng muốn chặt chẽ phải xét riêng.",
      "Quên trường hợp D = 0 thì sẽ chia cho 0."
    ],
    challenge: ["Giải hệ 3 ẩn bằng quy tắc Cramer.", "Dùng ngưỡng `1e-9` thay cho so sánh trực tiếp với 0."],
    quiz: { q: "Hệ có D = 0, Dx = 0, Dy = 0 (các hệ số không đồng thời bằng 0) thì:", options: ["Vô nghiệm", "Nghiệm duy nhất", "Vô số nghiệm", "Nghiệm x = y = 0"], answer: 2, why: "Hai phương trình biểu diễn cùng một đường thẳng nên có vô số nghiệm." }
  },

  "ch2-3": {
    level: "Trung bình", minutes: 20,
    goals: ["Kiểm tra bất đẳng thức tam giác", "Kết hợp điều kiện bằng `&&` và `||`", "Phân loại theo đúng thứ tự ưu tiên"],
    theory: [
      "Ba cạnh a, b, c tạo thành tam giác khi tổng hai cạnh bất kỳ lớn hơn cạnh còn lại.",
      "Tam giác đều: a = b = c.",
      "Tam giác vuông: bình phương một cạnh bằng tổng bình phương hai cạnh kia (Pytago đảo).",
      "Tam giác cân có hai cạnh bằng nhau; vừa vuông vừa cân gọi là vuông cân.",
      "Thứ tự kiểm tra: đều, rồi (vuông và cân), rồi vuông, rồi cân, cuối cùng là thường."
    ],
    explain: [
      { code: "if (a + b > c && a + c > b && b + c > a)", note: "Điều kiện tồn tại tam giác; nếu sai thì in thông báo không phải tam giác." },
      { code: "if (a == b && b == c)", note: "Kiểm tra tam giác đều trước vì nó cũng thỏa điều kiện cân." },
      { code: "bool vuong = (a*a + b*b == c*c) || ...", note: "Thử cả ba cách chọn cạnh huyền." },
      { code: "if (vuong && can) ... else if (vuong) ... else if (can) ...", note: "Đặt trường hợp kết hợp (vuông cân) lên trước các trường hợp đơn." }
    ],
    pitfalls: [
      "So sánh bằng `==` giữa các số thực dễ sai (0.1 + 0.2 khác 0.3); hãy thử với số nguyên cho chắc.",
      "Đặt `else if (can)` trước `vuong && can` thì tam giác vuông cân bị nhận thành cân.",
      "Dùng `a + b >= c` sẽ nhận nhầm ba điểm thẳng hàng là tam giác."
    ],
    challenge: ["Thêm loại tam giác tù và tam giác nhọn.", "Tính thêm chu vi và diện tích sau khi phân loại."],
    quiz: { q: "Tam giác có ba cạnh 3, 4, 5 thuộc loại nào?", options: ["Đều", "Cân", "Vuông", "Vuông cân"], answer: 2, why: "3² + 4² = 25 = 5² nên là tam giác vuông; ba cạnh khác nhau nên không cân." }
  },

  "ch2-4": {
    level: "Trung bình", minutes: 25,
    goals: ["Chia chương trình thành các hàm nhỏ", "Dùng `switch-case` để làm menu", "Hiểu phạm vi biến trong từng `case`"],
    theory: [
      "Hàm gồm kiểu trả về, tên, tham số và thân hàm; giúp tái sử dụng và dễ đọc.",
      "`switch (opt)` so sánh `opt` với từng `case`; `break` để thoát sau khi xong.",
      "`default` xử lý mọi giá trị không khớp case nào.",
      "Khai báo biến mới trong `case` cần bọc trong cặp `{ }`.",
      "Mỗi hình có một hàm diện tích riêng nên rất dễ thêm hình mới."
    ],
    explain: [
      { code: "double dtTamGiac(double a, double b, double c) {...}", note: "Hàm nhận ba cạnh, dùng công thức Heron và trả về diện tích." },
      { code: "cin >> opt; switch(opt) {", note: "Đọc lựa chọn của người dùng rồi rẽ nhánh." },
      { code: "case 1: { double a; ... break; }", note: "Cặp ngoặc nhọn tạo phạm vi riêng cho biến `a`." },
      { code: "default: cout << \"Lua chon khong hop le!\";", note: "Bắt trường hợp người dùng nhập ngoài khoảng từ 1 đến 4." }
    ],
    pitfalls: [
      "Quên `break` làm chương trình chạy tiếp vào case kế bên (fall-through).",
      "Khai báo biến trong `case` mà không có `{ }` gây lỗi biên dịch.",
      "Dùng `3.14159` làm tròn π; có thể dùng hằng số chính xác hơn khi cần."
    ],
    challenge: ["Thêm lựa chọn hình thang và hình thoi.", "Cho menu lặp lại đến khi người dùng chọn 0 để thoát (dùng `do-while`)."],
    quiz: { q: "Quên `break` ở cuối một `case` thì chuyện gì xảy ra?", options: ["Báo lỗi biên dịch", "Chạy tiếp sang các case phía dưới", "Thoát chương trình", "Không có gì khác"], answer: 1, why: "Đó là hiện tượng fall-through: lệnh của case kế tiếp vẫn được thực thi cho đến khi gặp `break`." }
  },

  "ch2-5": {
    level: "Trung bình", minutes: 20,
    goals: ["Viết hàm trả về `bool`", "Biết cách kiểm tra số nguyên tố hiệu quả", "Hiểu khái niệm số hoàn chỉnh"],
    theory: [
      "Số nguyên tố: n ≥ 2 và chỉ chia hết cho 1 và chính nó.",
      "Chỉ cần thử ước từ 2 đến √n: nếu n có ước lớn hơn √n thì cũng có ước nhỏ hơn √n.",
      "Số hoàn chỉnh: tổng các ước dương nhỏ hơn n bằng chính n (6 = 1 + 2 + 3; 28 = 1 + 2 + 4 + 7 + 14).",
      "Ước thật sự của n nằm trong đoạn từ 1 đến n/2.",
      "Hàm `bool` giúp tách phần kiểm tra khỏi phần nhập xuất."
    ],
    explain: [
      { code: "if (n < 2) return false;", note: "0, 1 và số âm không phải số nguyên tố." },
      { code: "for (int i = 2; i <= sqrt(n); i++)", note: "Chỉ thử đến √n; số lần lặp giảm mạnh so với thử đến n." },
      { code: "if (n % i == 0) return false;", note: "Tìm được ước thì kết luận hợp số ngay, không cần xét tiếp." },
      { code: "for (int i = 1; i <= n / 2; i++) if (n % i == 0) sum += i;", note: "Cộng mọi ước thật sự của n." },
      { code: "return sum == n;", note: "Số hoàn chỉnh khi tổng ước bằng chính n." }
    ],
    pitfalls: [
      "Quên trường hợp n < 2 nên coi 1 là số nguyên tố.",
      "Gọi `sqrt(n)` trong điều kiện vòng lặp mỗi vòng khá chậm; có thể viết `i * i <= n`.",
      "Số hoàn chỉnh rất thưa (6, 28, 496, 8128...), n lớn thì vòng lặp `n / 2` chạy chậm."
    ],
    challenge: ["Đổi điều kiện vòng lặp sang `i * i <= n` và so sánh tốc độ.", "In ra tất cả số hoàn chỉnh không quá 10000."],
    quiz: { q: "Vì sao chỉ cần thử chia đến √n khi kiểm tra số nguyên tố?", options: ["Vì √n luôn là số nguyên tố", "Vì nếu có ước lớn hơn √n thì cũng có ước nhỏ hơn √n", "Vì C++ không cho lặp quá √n", "Vì n luôn chia hết cho √n"], answer: 1, why: "Ước đến theo cặp (d, n/d); trong hai ước ấy luôn có một ước không vượt quá √n." }
  },

  "ch2-6": {
    level: "Trung bình", minutes: 25,
    goals: ["Tách chữ số bằng `% 10` và `/ 10`", "Đảo ngược số và kiểm tra số cân xứng", "Kiểm tra số Armstrong bằng `pow`"],
    theory: [
      "`n % 10` lấy chữ số hàng đơn vị; `n / 10` bỏ chữ số cuối.",
      "Đảo ngược: `rev = rev * 10 + chữ số`, lặp đến khi n = 0.",
      "Số cân xứng (palindrome) đọc xuôi ngược như nhau, tức `rev == n`.",
      "Số Armstrong có k chữ số: tổng mỗi chữ số mũ k bằng chính nó (153 = 1³ + 5³ + 3³).",
      "Biểu thức `đk ? a : b` giúp in kết quả gọn trong `cout`."
    ],
    explain: [
      { code: "rev = rev * 10 + n % 10; n /= 10;", note: "Mỗi vòng chuyển chữ số cuối của n sang cuối của rev." },
      { code: "while (temp > 0) { k++; temp /= 10; }", note: "Đếm số chữ số k của n." },
      { code: "sum += pow(r, k);", note: "Cộng chữ số mũ k. `pow` trả về `double`, với số lớn có thể lệch do làm tròn." },
      { code: "cout << (rev == n ? \"La...\" : \"Khong la...\")", note: "Chọn chuỗi cần in ngay trong câu lệnh `cout`." }
    ],
    pitfalls: [
      "`getReverse` dùng `while (n > 0)` nên số 0 và số âm không được xử lý.",
      "Đảo ngược số có chữ số 0 ở cuối làm mất số 0 đầu (120 thành 21).",
      "`pow` trả về `double`; có thể tự viết hàm lũy thừa nguyên để chắc chắn chính xác."
    ],
    challenge: ["Xử lý số âm bằng cách lấy giá trị tuyệt đối.", "Liệt kê các số Armstrong có 3 chữ số."],
    quiz: { q: "Số nào sau đây là số Armstrong?", options: ["152", "153", "154", "155"], answer: 1, why: "1³ + 5³ + 3³ = 1 + 125 + 27 = 153." }
  },

  "ch2-7": {
    level: "Trung bình", minutes: 25,
    goals: ["Viết hàm UCLN bằng thuật toán Euclid", "Dùng tham chiếu `&` để sửa biến gốc", "Cộng, trừ, nhân, chia phân số và rút gọn"],
    theory: [
      "Euclid: UCLN(a, b) = UCLN(b, a % b) cho đến khi b = 0.",
      "Rút gọn bằng cách chia cả tử và mẫu cho UCLN của chúng.",
      "Tham số `long long &tu` là tham chiếu: sửa trong hàm sẽ đổi luôn biến bên ngoài.",
      "a/b + c/d = (ad + bc)/(bd); a/b chia c/d = (ad)/(bc).",
      "Chuẩn hóa dấu để mẫu số luôn dương."
    ],
    explain: [
      { code: "a = llabs(a); b = llabs(b);", note: "UCLN được tính trên giá trị tuyệt đối." },
      { code: "while (b != 0) { long long temp = a % b; a = b; b = temp; }", note: "Vòng lặp Euclid: thay (a, b) bằng (b, a % b)." },
      { code: "void rutGon(long long &tu, long long &mau)", note: "Nhận tử và mẫu bằng tham chiếu, rút gọn trực tiếp tại chỗ." },
      { code: "if (mau < 0) { tu = -tu; mau = -mau; }", note: "Đưa dấu âm lên tử số." },
      { code: "if (b == 0 || d == 0) {...}", note: "Chặn mẫu số bằng 0 ngay sau khi nhập." }
    ],
    pitfalls: [
      "Mẫu số bằng 0 là dữ liệu sai; luôn kiểm tra trước khi tính (code đã có bước này).",
      "Chia cho phân số có tử bằng 0 làm mẫu của kết quả bằng 0; code xử lý riêng trường hợp c = 0.",
      "Dùng `long` trên Windows chỉ 32 bit nên phép nhân `b * d` dễ tràn; dùng `long long`."
    ],
    challenge: ["Cho phép nhập lại khi mẫu số bằng 0 (dùng `do-while`).", "So sánh hai phân số mà không đổi ra số thực."],
    quiz: { q: "UCLN(12, 18) bằng bao nhiêu?", options: ["3", "6", "9", "12"], answer: 1, why: "Euclid: 18 % 12 = 6, rồi 12 % 6 = 0 nên UCLN là 6." }
  },

  "ch3-1": {
    level: "Trung bình", minutes: 25,
    goals: ["Tách chương trình thành các hàm kiểm tra độc lập", "Duyệt và lọc bằng vòng lặp", "Tái sử dụng hàm cho nhiều mục đích"],
    theory: [
      "Mỗi hàm `isXxx` làm đúng một việc và trả về `bool`.",
      "Số chính phương: lấy căn nguyên rồi bình phương lại, bằng chính nó thì đúng.",
      "Duyệt `i` từ 1 đến n, hàm nào trả về đúng thì in `i`.",
      "Số nguyên tố và số hoàn chỉnh dùng lại logic của Bài 2.5.",
      "Số cân xứng dùng lại phép đảo ngược của Bài 2.6."
    ],
    explain: [
      { code: "int sq = sqrt(n); return sq * sq == n;", note: "Lấy phần nguyên của căn rồi bình phương lại; bằng n khi n là số chính phương." },
      { code: "for (int i = 1; i <= n; i++) if (isSquare(i)) cout << i << \" \";", note: "Duyệt mọi số từ 1 đến n và in những số thỏa điều kiện." },
      { code: "bool isPerfect(int n) {...}", note: "Cộng các ước thật sự của n, đúng khi tổng bằng n." },
      { code: "bool isPalindrome(int n) {...}", note: "Đảo ngược n rồi so sánh với chính nó." }
    ],
    pitfalls: [
      "`sqrt` trả về `double`; với số rất lớn có thể làm tròn lệch nên cần kiểm tra thêm.",
      "Duyệt đến n với `isPerfect` chạy O(n) cho từng số nên tổng thể O(n²); n lớn sẽ chậm.",
      "Nhớ rằng 1 không phải số nguyên tố."
    ],
    challenge: ["Chỉ in các số vừa nguyên tố vừa cân xứng.", "Đếm số lượng của mỗi loại thay vì liệt kê."],
    quiz: { q: "Trong các số không quá 30, những số hoàn chỉnh là:", options: ["6 và 28", "6 và 12", "28 và 30", "Chỉ có 6"], answer: 0, why: "6 = 1 + 2 + 3 và 28 = 1 + 2 + 4 + 7 + 14." }
  },

  "ch3-2": {
    level: "Nâng cao", minutes: 25,
    goals: ["Viết hàm đệ quy có điều kiện dừng", "Chuyển đệ quy thành vòng lặp", "So sánh hai cách cài đặt"],
    theory: [
      "Hàm đệ quy gọi lại chính nó với bài toán nhỏ hơn và luôn cần điều kiện dừng (x1 = x2 = 1).",
      "Đệ quy trực tiếp tính lặp lại nhiều giá trị nên số lần gọi tăng rất nhanh theo n.",
      "Cách lặp chỉ giữ hai giá trị gần nhất (`f1`, `f2`): thời gian O(n), bộ nhớ O(1).",
      "Công thức: x_n = x_{n−1} + (n−1)·x_{n−2}.",
      "Dãy tăng nhanh nên dùng `long long` và giới hạn n."
    ],
    explain: [
      { code: "if (n == 1 || n == 2) return 1;", note: "Điều kiện dừng; thiếu nó hàm sẽ gọi vô hạn." },
      { code: "return xn_recursive(n - 1) + (n - 1) * xn_recursive(n - 2);", note: "Chuyển nguyên công thức toán thành code." },
      { code: "long long f1 = 1, f2 = 1, fn = 0;", note: "`f1` là x_{i−2} và `f2` là x_{i−1}." },
      { code: "fn = f2 + (i - 1) * f1; f1 = f2; f2 = fn;", note: "Tính x_i rồi dịch cửa sổ sang phải một bước." },
      { code: "if (n < 1 || n > 30) {...}", note: "Giới hạn n để không bị tràn số và không chạy quá lâu." }
    ],
    pitfalls: [
      "Thiếu điều kiện dừng gây tràn ngăn xếp (stack overflow).",
      "Đệ quy trực tiếp với n lớn (khoảng 40 trở lên) chạy rất chậm.",
      "Dãy tăng nhanh, vượt kiểu `int` từ n khá nhỏ; dùng `long long` và giới hạn n."
    ],
    challenge: ["Thêm bộ nhớ đệm (memoization) cho cách đệ quy.", "Đo thời gian chạy hai cách với n = 30 bằng `<chrono>`."],
    quiz: { q: "Điều kiện dừng của hàm đệ quy dùng để làm gì?", options: ["Tăng tốc độ", "Ngăn hàm tự gọi mãi", "Khai báo biến", "Thoát chương trình"], answer: 1, why: "Không có điều kiện dừng, hàm gọi chính nó vô hạn cho đến khi tràn ngăn xếp." }
  },

  "ch4-1": {
    level: "Trung bình", minutes: 25,
    goals: ["Dùng `vector<int>` và duyệt kiểu range-for", "Tính trung bình cộng", "Tìm giá trị lớn thứ k bằng sắp xếp", "Tách mảng theo điều kiện"],
    theory: [
      "`vector<int> a(n)` tạo mảng động n phần tử; `a.size()` cho số phần tử.",
      "`for (int x : a)` duyệt từng phần tử của mảng.",
      "Trung bình cộng = tổng / số phần tử; dùng biến tổng kiểu `double` để không bị cắt phần thập phân.",
      "Giá trị lớn thứ k: sắp xếp giảm dần rồi lấy phần tử thứ k − 1.",
      "Đưa số nguyên tố về cuối bằng hai mảng phụ giúp giữ nguyên thứ tự ban đầu."
    ],
    explain: [
      { code: "double sum = 0; for (int x : a) sum += x;", note: "Tính tổng; `sum` kiểu `double` để phép chia sau đó ra số thực." },
      { code: "sort(sorted.begin(), sorted.end(), greater<int>());", note: "Sắp xếp bản sao giảm dần để mảng gốc không bị đổi." },
      { code: "sorted[k - 1]", note: "Phần tử thứ k (đếm từ 1) trong dãy giảm dần." },
      { code: "if (isPrime(x)) primes.push_back(x); else normal.push_back(x);", note: "Tách mảng thành hai nhóm, rồi in nhóm thường trước và nhóm nguyên tố sau." }
    ],
    pitfalls: [
      "`a.size()` có kiểu không dấu; `a.size() - 1` khi mảng rỗng thành một số rất lớn.",
      "Chia `tổng / a.size()` với tổng kiểu `int` sẽ cắt phần thập phân.",
      "`k` ngoài khoảng 1 đến n gây truy cập ngoài mảng; code đã kiểm tra trước."
    ],
    challenge: ["Tìm giá trị lớn thứ k nhưng bỏ qua các giá trị trùng nhau.", "Dùng `stable_partition` để đưa số nguyên tố về cuối mà chỉ cần một mảng."],
    quiz: { q: "Với mảng {12, 7, 5, 4, 11, 8, 3}, số lớn thứ 2 là:", options: ["7", "11", "12", "8"], answer: 1, why: "Sắp xếp giảm dần: 12, 11, 8, 7, 5, 4, 3. Phần tử thứ hai là 11." }
  },

  "ch4-2": {
    level: "Nâng cao", minutes: 30,
    goals: ["Dùng mảng hai chiều bằng `vector<vector<int>>`", "Cộng hai ma trận", "Nhân hai ma trận bằng ba vòng lặp lồng nhau"],
    theory: [
      "Ma trận n × n lưu bằng `vector<vector<int>>`, phần tử `m[i][j]` ở dòng i cột j.",
      "Tổng: C[i][j] = A[i][j] + B[i][j].",
      "Tích: C[i][j] = Σ A[i][k]·B[k][j] với k từ 0 đến n−1; độ phức tạp O(n³).",
      "Tích ma trận nói chung không giao hoán: A·B khác B·A.",
      "`max_element(b[i].begin(), b[i].end())` trả về vị trí của phần tử lớn nhất trong dòng i."
    ],
    explain: [
      { code: "Matrix tich(n, vector<int>(n, 0));", note: "Tạo ma trận kết quả và khởi tạo toàn bộ bằng 0 để cộng dồn." },
      { code: "for i for j for k: tich[i][j] += a[i][k] * b[k][j];", note: "Hai vòng ngoài chọn ô kết quả, vòng trong cùng cộng các tích." },
      { code: "int maxB = *max_element(b[i].begin(), b[i].end());", note: "Giá trị lớn nhất của dòng i trong B (dấu `*` lấy giá trị tại vị trí được trả về)." },
      { code: "c[i][j] = a[i][j] * maxB;", note: "Nhân từng phần tử dòng i của A với max dòng i của B." }
    ],
    pitfalls: [
      "Quên khởi tạo ô kết quả của tích bằng 0 làm cộng dồn vào giá trị rác.",
      "Nhầm thứ tự chỉ số `b[k][j]` thành `b[j][k]` cho ra kết quả của ma trận chuyển vị.",
      "Phép nhân có thể tràn `int` khi giá trị lớn."
    ],
    challenge: ["Tính ma trận chuyển vị và in ra.", "Tính tổng đường chéo chính của tích A × B."],
    quiz: { q: "Phần tử C[i][j] của tích A × B được tính bằng gì?", options: ["A[i][j] * B[i][j]", "Tổng A[i][k] * B[k][j] theo k", "A[j][i] + B[i][j]", "A[i][j] - B[j][i]"], answer: 1, why: "Phần tử (i, j) của tích bằng tích vô hướng của dòng i của A với cột j của B." }
  },

  "ch4-3": {
    level: "Trung bình", minutes: 25,
    goals: ["Dùng `string` và `getline`", "Tách từ bằng `stringstream`", "Sắp xếp ký tự nhưng giữ vị trí khoảng trắng"],
    theory: [
      "`getline(cin, s)` đọc cả dòng, kể cả khoảng trắng.",
      "`stringstream ss(s); while (ss >> w)` tách chuỗi thành từng từ.",
      "`w.length()` là độ dài của từ (tính theo byte).",
      "Giữ khoảng trắng: gom các ký tự khác khoảng trắng, sắp xếp, rồi điền lại vào đúng các vị trí không phải khoảng trắng.",
      "Sắp xếp theo mã ASCII nên chữ hoa đứng trước chữ thường."
    ],
    explain: [
      { code: "getline(cin, s);", note: "Đọc cả dòng người dùng nhập." },
      { code: "while (ss >> word) {...}", note: "Mỗi lần đọc một từ và tự bỏ qua khoảng trắng thừa." },
      { code: "if (word.length() > longestWord.length()) longestWord = word;", note: "Chỉ cập nhật khi gặp từ dài hơn hẳn, nên nếu nhiều từ cùng dài nhất thì lấy từ đầu tiên." },
      { code: "for (char &c : res) if (c != ' ') c = chars[idx++];", note: "Duyệt chuỗi kết quả và điền ký tự đã sắp xếp vào các vị trí không phải khoảng trắng." }
    ],
    pitfalls: [
      "Trộn `cin >>` với `getline` dễ bị sót ký tự xuống dòng; thêm `cin.ignore()`.",
      "`length()` đếm byte nên tiếng Việt có dấu (UTF-8) cho kết quả lớn hơn số ký tự nhìn thấy; hãy nhập không dấu.",
      "Quên kiểm tra chuỗi rỗng khiến `words.front()` lỗi; code đã kiểm tra `empty()`."
    ],
    challenge: ["Đảo ngược thứ tự các từ trong câu.", "Viết hoa chữ cái đầu của mỗi từ."],
    quiz: { q: "`while (ss >> word)` làm gì?", options: ["Đọc từng ký tự", "Đọc từng từ cách nhau bởi khoảng trắng", "Đọc cả dòng", "Xóa khoảng trắng khỏi chuỗi gốc"], answer: 1, why: "Toán tử `>>` trên stringstream đọc một từ mỗi lần và bỏ qua khoảng trắng đứng trước." }
  },

  "ch5-1": {
    level: "Trung bình", minutes: 25,
    goals: ["Khai báo `struct` gộp nhiều trường", "Viết hàm thành viên và hàm nhận/trả về struct", "Cài đặt bốn phép tính số phức"],
    theory: [
      "`struct` gom các dữ liệu liên quan (phần thực, phần ảo) thành một kiểu mới.",
      "Khởi tạo gọn: `SOPHUC z = {3, 4};` gán lần lượt từng trường.",
      "Hàm thành viên `const` như `doLon()` đọc dữ liệu mà không sửa nó.",
      "(a+bi)(c+di) = (ac−bd) + (ad+bc)i.",
      "Phép chia: nhân cả tử và mẫu với số phức liên hợp, mẫu trở thành c² + d²."
    ],
    explain: [
      { code: "struct SOPHUC { double thuc; double au; ... };", note: "Kiểu dữ liệu mới gồm hai trường kiểu `double`." },
      { code: "double doLon() const { return sqrt(thuc * thuc + au * au); }", note: "Môđun |z| = √(a² + b²), gọi bằng `z1.doLon()`." },
      { code: "SOPHUC cong(SOPHUC u, SOPHUC v) { return {...}; }", note: "Hàm nhận hai số phức và trả về một số phức mới." },
      { code: "SOPHUC chia(SOPHUC u, SOPHUC v)", note: "Chia bằng cách nhân với số phức liên hợp; chương trình kiểm tra mẫu bằng 0 trước khi gọi." },
      { code: "cout << z.thuc << (z.au < 0 ? \" - \" : \" + \") << fabs(z.au) << \"i\";", note: "In dấu đúng cho phần ảo, tránh kiểu `3 + -2i`." }
    ],
    pitfalls: [
      "Quên kiểm tra mẫu c² + d² = 0 khi chia số phức.",
      "In phần ảo âm bằng dấu `+` cho ra `3 + -2i`; hàm `xuat` xử lý dấu riêng.",
      "Truyền struct lớn theo giá trị tốn bộ nhớ; có thể dùng tham chiếu `const SOPHUC &`."
    ],
    challenge: ["Thêm hàm tính số phức liên hợp.", "Nạp chồng `operator+` để viết `z1 + z2` trực tiếp."],
    quiz: { q: "(3 + 4i)(1 − 2i) bằng bao nhiêu?", options: ["3 − 8i", "11 − 2i", "−5 + 10i", "11 + 2i"], answer: 1, why: "Phần thực: 3·1 − 4·(−2) = 11; phần ảo: 3·(−2) + 4·1 = −2. Kết quả 11 − 2i." }
  },

  "ch5-2": {
    level: "Nâng cao", minutes: 30,
    goals: ["Thiết kế struct có nhiều trường và hàm thành viên", "Lưu danh sách bằng `vector<ThiSinh>`", "Lọc, đếm, tìm lớn nhất và tìm kiếm trong danh sách"],
    theory: [
      "Mảng cấu trúc (`vector<struct>`) biểu diễn một bảng dữ liệu, mỗi phần tử là một dòng.",
      "Hàm thành viên `tongDiem()` và `biLiet()` đặt logic ngay trong cấu trúc cho gọn.",
      "Tìm giá trị lớn nhất: giữ chỉ số `best` và cập nhật khi gặp phần tử tốt hơn.",
      "Tìm tuần tự: duyệt từng phần tử đến khi `sbd` trùng với khóa tìm kiếm.",
      "Ở đây thí sinh \"đậu\" là thí sinh không có môn nào dưới 5."
    ],
    explain: [
      { code: "bool biLiet() const { return ngoaiNgu < 5 || coBan < 5 || coSo < 5; }", note: "Chỉ cần một môn dưới 5 là bị liệt." },
      { code: "if (ds[i].biLiet()) continue;", note: "Bỏ qua thí sinh liệt, chỉ xét thí sinh đậu." },
      { code: "if (best == -1 || ds[i].tongDiem() > ds[best].tongDiem()) best = i;", note: "Thí sinh đầu tiên làm chuẩn, sau đó thay thế khi gặp tổng điểm cao hơn." },
      { code: "cin >> key; if (ts.sbd == key) {...}", note: "Tìm tuần tự theo số báo danh." }
    ],
    pitfalls: [
      "Chỉ số `best` khởi tạo bằng −1 nên phải kiểm tra trước khi truy cập `ds[best]`.",
      "So sánh chuỗi bằng `==` dùng được với `std::string`, nhưng với mảng `char[]` thì không.",
      "Điểm số thực có thể bị làm tròn khi in; kiểm soát bằng `fixed << setprecision(1)`."
    ],
    challenge: ["Sắp xếp danh sách giảm dần theo tổng điểm rồi in bảng xếp hạng.", "Cho người dùng nhập danh sách thí sinh từ bàn phím."],
    quiz: { q: "Vì sao khởi tạo chỉ số thủ khoa bằng −1?", options: ["Để biết chưa tìm thấy ai", "Vì chỉ số mảng bắt đầu từ −1", "Để chương trình chạy nhanh", "Vì −1 là điểm cao nhất"], answer: 0, why: "−1 không phải chỉ số hợp lệ nên dùng để đánh dấu chưa có thí sinh nào, ví dụ khi mọi người đều bị liệt." }
  }
};



    // ----- Trạng thái -----
    const CHAPTER_TABS = [
        { id: 'ALL', label: 'Tất cả' },
        { id: '0', label: 'C++ Cơ Bản' },
        { id: '1', label: 'Chương 1' },
        { id: '2', label: 'Chương 2' },
        { id: '3', label: 'Chương 3' },
        { id: '4', label: 'Chương 4' },
        { id: '5', label: 'Chương 5' }
    ];
    const $ = (id) => document.getElementById(id);
    let selectedChapter = 'ALL';
    let searchQuery = '';
    let activeId = null;
    let inputState = {};
    let toastTimer = null;

    function userKey(prefix) { return prefix + '_' + (localStorage.getItem('currentUser') || 'Khách'); }
    function getLearned() {
        try { const v = JSON.parse(localStorage.getItem(userKey('cppLearned'))); return Array.isArray(v) ? v : []; }
        catch (e) { return []; }
    }
    function setLearned(list) { try { localStorage.setItem(userKey('cppLearned'), JSON.stringify(list)); } catch (e) {} }
    function getExercise(id) { return DATABASE.find(e => e.id === id) || DATABASE[0]; }

    function showToast(msg) {
        const t = $('cppToast'); if (!t) return;
        t.textContent = msg; t.classList.add('show');
        clearTimeout(toastTimer);
        toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
    }

    // ----- Tô màu cú pháp C++ (nhẹ, không cần thư viện) -----
    const CPP_KEYWORDS = 'if|else|for|while|do|switch|case|default|break|continue|return|using|namespace|struct|class|public|private|protected|const|static|new|delete|void|true|false|nullptr|this|typedef|template|typename|auto|sizeof|operator';
    const CPP_TYPES = 'int|long|short|unsigned|signed|float|double|char|bool|string|vector|map|set|pair|size_t|cin|cout|cerr|endl|std';
    const CPP_TOKEN = new RegExp(
        '(\\/\\/[^\\n]*|\\/\\*[\\s\\S]*?\\*\\/)' +                        // 1: comment
        '|("(?:\\\\.|[^"\\\\\\n])*"|\'(?:\\\\.|[^\'\\\\\\n])\')' +          // 2: string / char
        '|(^[ \\t]*#[ \\t]*\\w+(?:[ \\t]*<[^>\\n]+>)?)' +                  // 3: preprocessor (#include <...>)
        '|\\b(' + CPP_KEYWORDS + ')\\b' +                                  // 4: keyword
        '|\\b(' + CPP_TYPES + ')\\b' +                                     // 5: type / stream
        '|\\b(\\d+(?:\\.\\d+)?[fFlLuU]*)\\b', 'gm');                       // 6: number
    function highlightCpp(code) {
        let out = '', last = 0, m;
        CPP_TOKEN.lastIndex = 0;
        while ((m = CPP_TOKEN.exec(code)) !== null) {
            if (m[0] === '') { CPP_TOKEN.lastIndex++; continue; }
            out += escapeHtml(code.slice(last, m.index));
            const cls = m[1] ? 'c' : m[2] ? 's' : m[3] ? 'p' : m[4] ? 'k' : m[5] ? 't' : 'n';
            out += '<span class="' + cls + '">' + escapeHtml(m[0]) + '</span>';
            last = m.index + m[0].length;
        }
        return out + escapeHtml(code.slice(last));
    }
    // `code` trong mô tả -> <code>
    function inlineCode(text) {
        return escapeHtml(text).replace(/`([^`]+)`/g, '<code>$1</code>');
    }

    // ----- Bài học: giới thiệu, giải thích code, lỗi thường gặp, thử thách, quiz -----
    let quizPick = {};
    function getQuizDone() {
        try { const v = JSON.parse(localStorage.getItem(userKey('cppQuiz'))); return Array.isArray(v) ? v : []; }
        catch (e) { return []; }
    }
    function setQuizDone(list) { try { localStorage.setItem(userKey('cppQuiz'), JSON.stringify(list)); } catch (e) {} }
    function listHtml(items) {
        return '<ul class="cpp-ul">' + items.map(t => '<li>' + inlineCode(t) + '</li>').join('') + '</ul>';
    }
    function lessonIntroHtml(ex) {
        const L = LESSONS[ex.id]; if (!L) return '';
        const lv = L.level === 'Cơ bản' ? 'lv1' : L.level === 'Trung bình' ? 'lv2' : 'lv3';
        return '<div class="cpp-card cpp-lesson">' +
            '<div class="cpp-meta"><span class="cpp-level ' + lv + '">' + escapeHtml(L.level) + '</span>' +
            '<span class="cpp-time">⏱ ~' + L.minutes + ' phút</span></div>' +
            '<p class="cpp-label">🎯 Mục tiêu bài học</p>' + listHtml(L.goals) +
            '<p class="cpp-label">📚 Kiến thức cần nhớ</p>' + listHtml(L.theory) +
        '</div>';
    }
    function lessonExplainHtml(ex) {
        const L = LESSONS[ex.id]; if (!L) return '';
        return '<details class="cpp-fold" open><summary>🔍 Giải thích từng đoạn code</summary>' +
            L.explain.map(x => '<div class="cpp-step"><code class="cpp-step-code">' + escapeHtml(x.code) + '</code><p>' + inlineCode(x.note) + '</p></div>').join('') +
        '</details>';
    }
    function quizHtml(ex) {
        const L = LESSONS[ex.id]; if (!L || !L.quiz) return '';
        const q = L.quiz, pick = quizPick[ex.id], answered = pick !== undefined;
        const wasDone = getQuizDone().includes(ex.id);
        let fb = '';
        if (answered) {
            fb = pick === q.answer
                ? '<p class="cpp-quiz-fb ok">✅ Chính xác! ' + inlineCode(q.why) + '</p>'
                : '<p class="cpp-quiz-fb bad">❌ Chưa đúng. Đáp án là ' + String.fromCharCode(65 + q.answer) + '. ' + inlineCode(q.why) + '</p>';
        } else if (wasDone) {
            fb = '<p class="cpp-quiz-fb ok">✓ Bạn đã trả lời đúng câu này trước đó.</p>';
        }
        return '<div class="cpp-card cpp-quiz" id="cppQuiz"><p class="cpp-demo-title">🧠 Kiểm tra nhanh</p>' +
            '<p class="cpp-text">' + inlineCode(q.q) + '</p><div class="cpp-opts">' +
            q.options.map((o, i) => {
                let cls = 'cpp-opt';
                if (answered) { if (i === q.answer) cls += ' correct'; else if (i === pick) cls += ' wrong'; }
                return '<button type="button" class="' + cls + '" data-qi="' + i + '"' + (answered ? ' disabled' : '') + '>' +
                    '<b>' + String.fromCharCode(65 + i) + '.</b> ' + inlineCode(o) + '</button>';
            }).join('') + '</div>' + fb + '</div>';
    }
    function lessonExtraHtml(ex) {
        const L = LESSONS[ex.id]; if (!L) return '';
        return '<details class="cpp-fold"><summary>⚠️ Lỗi thường gặp</summary>' + listHtml(L.pitfalls) + '</details>' +
            '<details class="cpp-fold"><summary>🚀 Thử thách tự luyện</summary>' + listHtml(L.challenge) + '</details>' +
            quizHtml(ex);
    }

    // ----- Vẽ giao diện -----
    function filteredList() {
        const q = searchQuery.trim().toLowerCase();
        return DATABASE.filter(it => {
            const okChapter = selectedChapter === 'ALL' || String(it.chapter) === selectedChapter;
            const okSearch = !q || it.title.toLowerCase().includes(q) || it.description.toLowerCase().includes(q);
            return okChapter && okSearch;
        });
    }

    function renderChips() {
        $('cppChips').innerHTML = CHAPTER_TABS.map(t =>
            '<button type="button" class="cpp-chip' + (t.id === selectedChapter ? ' active' : '') + '" data-ch="' + t.id + '">' + t.label + '</button>'
        ).join('');
    }

    function renderList() {
        const list = filteredList();
        const learned = getLearned();
        $('cppCount').textContent = list.length;
        $('cppList').innerHTML = list.length === 0
            ? '<div class="cpp-empty">Không tìm thấy bài tập phù hợp</div>'
            : list.map(it =>
                '<button type="button" class="cpp-item' + (it.id === activeId ? ' active' : '') + '" data-id="' + it.id + '">' +
                    '<span><span class="cpp-item-tag">' + escapeHtml(it.chapterTitle) + '</span>' +
                    '<span class="cpp-item-title">' + escapeHtml(it.title) + '</span></span>' +
                    (learned.includes(it.id) ? '<span class="cpp-item-done" title="Đã học">✓</span>' : '') +
                '</button>'
            ).join('');
    }

    function renderProgress() {
        const learned = getLearned().filter(id => DATABASE.some(e => e.id === id));
        const pct = Math.round(learned.length / DATABASE.length * 100);
        $('cppProgressFill').style.width = pct + '%';
        $('cppProgressText').textContent = 'Đã học ' + learned.length + '/' + DATABASE.length + ' bài (' + pct + '%)';
    }

    function renderMain() {
        const ex = getExercise(activeId);
        const it = ex.interactive;
        const learned = getLearned().includes(ex.id);
        const fieldsHtml = it && it.fields
            ? '<div class="cpp-fields">' + it.fields.map(f =>
                '<div class="cpp-field"><label>' + escapeHtml(f.label) + '</label>' +
                '<input type="text" data-name="' + escapeHtml(f.name) + '" value="' + escapeHtml(inputState[f.name] != null ? String(inputState[f.name]) : '') + '" autocomplete="off"></div>'
            ).join('') + '</div>'
            : '';

        $('cppMain').innerHTML =
            '<div class="cpp-card">' +
                '<span class="cpp-badge">' + escapeHtml(ex.chapterTitle) + '</span>' +
                '<h3>' + escapeHtml(ex.title) + '</h3>' +
                '<p class="cpp-label">Đề bài</p>' +
                '<p class="cpp-text">' + inlineCode(ex.description) + '</p>' +
                '<div class="cpp-algo"><p class="cpp-label">✨ Tư duy &amp; Giải thuật</p><p>' + inlineCode(ex.algorithm) + '</p></div>' +
            '</div>' + lessonIntroHtml(ex) +
            '<div class="cpp-code-box">' +
                '<div class="cpp-code-bar"><div class="cpp-dots"><i></i><i></i><i></i>solution.cpp</div>' +
                '<button type="button" class="cpp-copy" id="cppCopyBtn">📋 Copy Code</button></div>' +
                '<pre class="cpp-code">' + highlightCpp(ex.code) + '</pre>' +
            '</div>' + lessonExplainHtml(ex) +
            (it ? '<div class="cpp-card"><p class="cpp-demo-title">🖥️ Mô phỏng kết quả chạy</p>' + fieldsHtml +
                '<div class="cpp-out" id="cppOut"></div></div>' : '') +
            lessonExtraHtml(ex) +
            '<div class="cpp-actions">' +
                '<button type="button" class="cpp-btn ghost" id="cppPrevBtn">← Bài trước</button>' +
                '<button type="button" class="cpp-btn' + (learned ? ' done' : '') + '" id="cppLearnBtn">' + (learned ? '✓ Đã học (bấm để bỏ)' : '✔ Đánh dấu đã học') + '</button>' +
                '<button type="button" class="cpp-btn ghost" id="cppNextBtn">Bài sau →</button>' +
            '</div>';
        runDemo();
    }

    function runDemo() {
        const ex = getExercise(activeId), out = $('cppOut');
        if (!out || !ex.interactive) return;
        let result;
        try { result = ex.interactive.run(inputState); }
        catch (e) { result = 'Lỗi khi chạy mô phỏng: ' + e.message; }
        out.textContent = '';
        const cmd = document.createElement('span');
        cmd.className = 'cmd'; cmd.textContent = '$ ./program';
        out.appendChild(cmd);
        out.appendChild(document.createTextNode(result || 'Chưa có kết quả.'));
    }

    function selectExercise(id) {
        activeId = id;
        try { localStorage.setItem(userKey('cppLast'), id); } catch (e) {}
        const ex = getExercise(id);
        inputState = {};
        if (ex.interactive && ex.interactive.fields) ex.interactive.fields.forEach(f => { inputState[f.name] = f.default; });
        renderList();
        renderMain();
    }

    function step(delta) {
        const list = filteredList().length ? filteredList() : DATABASE;
        let i = list.findIndex(e => e.id === activeId);
        i = (i + delta + list.length) % list.length;
        selectExercise(list[i].id);
        const mainEl = $('cppMain'); if (mainEl) mainEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    // ----- Mở / đóng -----
    function openCppWorkspace() {
        toggleMainElements(false);
        $('cppWorkspace').style.display = 'block';
        renderChips();
        renderProgress();
        const last = localStorage.getItem(userKey('cppLast'));
        selectExercise(DATABASE.some(e => e.id === last) ? last : DATABASE[0].id);
        window.scrollTo({ top: 0 });
    }
    function closeCppWorkspace() {
        toggleMainElements(true);
        $('cppWorkspace').style.display = 'none';
    }
    window.openCppWorkspace = openCppWorkspace;
    window.closeCppWorkspace = closeCppWorkspace;

    // ----- Sự kiện (ủy quyền, gắn một lần) -----
    function init() {
        const ws = $('cppWorkspace');
        if (!ws) return;
        $('cppCloseBtn').addEventListener('click', closeCppWorkspace);
        $('cppSearch').addEventListener('input', e => { searchQuery = e.target.value; renderList(); });
        $('cppChips').addEventListener('click', e => {
            const b = e.target.closest('.cpp-chip'); if (!b) return;
            selectedChapter = b.dataset.ch; renderChips(); renderList();
        });
        $('cppList').addEventListener('click', e => {
            const b = e.target.closest('.cpp-item'); if (b) selectExercise(b.dataset.id);
        });
        $('cppMain').addEventListener('input', e => {
            const inp = e.target.closest('input[data-name]'); if (!inp) return;
            inputState[inp.dataset.name] = inp.value; runDemo();
        });
        $('cppMain').addEventListener('click', e => {
            if (e.target.closest('#cppCopyBtn')) {
                const btn = $('cppCopyBtn'), code = getExercise(activeId).code;
                const ok = () => { btn.textContent = '✓ Đã sao chép'; btn.classList.add('done'); setTimeout(() => { btn.textContent = '📋 Copy Code'; btn.classList.remove('done'); }, 1800); };
                if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(ok, () => showToast('Không sao chép được, hãy bôi đen code rồi Ctrl+C'));
                else showToast('Trình duyệt không hỗ trợ sao chép tự động');
            } else if (e.target.closest('#cppLearnBtn')) {
                let list = getLearned();
                if (list.includes(activeId)) { list = list.filter(id => id !== activeId); showToast('Đã bỏ đánh dấu bài này'); }
                else { list.push(activeId); showToast('🎉 Đã đánh dấu hoàn thành!'); }
                setLearned(list); renderProgress(); renderList(); renderMain();
            } else if (e.target.closest('.cpp-opt')) {
                const btn = e.target.closest('.cpp-opt'), ex = getExercise(activeId), L = LESSONS[ex.id];
                if (!L || quizPick[ex.id] !== undefined) return;
                const i = parseInt(btn.dataset.qi, 10);
                quizPick[ex.id] = i;
                if (i === L.quiz.answer) {
                    const done = getQuizDone(); if (!done.includes(ex.id)) { done.push(ex.id); setQuizDone(done); }
                    showToast('✅ Chính xác!');
                }
                const box = $('cppQuiz'); if (box) box.outerHTML = quizHtml(ex);
            } else if (e.target.closest('#cppPrevBtn')) step(-1);
            else if (e.target.closest('#cppNextBtn')) step(1);
        });
    }
    init();
})();
