const defaultEngines = [
    { id: 'google', name: 'Google', color: '#1a0dab', borderColor: '#4285F4', type: 'builtin', url: 'https://www.google.com/search?q=' },
    { id: 'bing', name: 'Bing', color: '#0078d4', borderColor: '#0078d4', type: 'builtin', url: 'https://www.bing.com/search?q=' },
    { id: 'coccoc', name: 'Cốc Cốc', color: '#008f5d', borderColor: '#008f5d', type: 'builtin', url: 'https://coccoc.com/search?q=' },
    { id: 'yahoo', name: 'Yahoo!', color: '#6001d2', borderColor: '#6001d2', type: 'builtin', url: 'https://vn.search.yahoo.com/search?p=' },
    { id: 'duckduckgo', name: 'DuckDuckGo', color: '#de5833', borderColor: '#de5833', type: 'builtin', url: 'https://duckduckgo.com/?q=' },
    { id: 'startpage', name: 'Startpage', color: '#3b5998', borderColor: '#3b5998', type: 'builtin', url: 'https://www.startpage.com/do/search?q=' },
    { id: 'youtube', name: 'YouTube', color: '#ff0000', borderColor: '#ff0000', type: 'builtin', url: 'https://www.youtube.com' },
    { id: 'tiktok', name: 'TikTok', color: '#010101', borderColor: '#010101', type: 'builtin', url: 'https://www.tiktok.com' },
    { id: 'facebook', name: 'Facebook', color: '#1877f2', borderColor: '#1877f2', type: 'builtin', url: 'https://www.facebook.com=' },
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
        div.innerHTML = `<span>${escapeHtml(item)}</span><span class="history-close">×</span>`;
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
