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
    { id: 'cpp', name: 'C++ Code', color: '#00599c', borderColor: '#00599c', type: 'builtin', url: 'cpp' }
];

// Các nút hệ thống (mở workspace nội bộ, không thể xóa)
const SYSTEM_BUTTON_IDS = ['notes', 'camera', 'cpp']; 

function getEngines() {
    const stored = localStorage.getItem('searchEngines');
    if (stored) {
        try {
            const list = JSON.parse(stored);
            // Người dùng cũ chưa có nút hệ thống mới (vd: C++ Code) -> tự bổ sung vào cuối danh sách
            let changed = false;
            defaultEngines.filter(d => SYSTEM_BUTTON_IDS.includes(d.id)).forEach(d => {
                if (!list.find(e => e.id === d.id)) { list.push(JSON.parse(JSON.stringify(d))); changed = true; }
            });
            if (changed) localStorage.setItem('searchEngines', JSON.stringify(list));
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
    if (SYSTEM_BUTTON_IDS.includes(id)) { alert('Không thể xóa nút hệ thống này!'); return; }
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
        div.innerHTML = `<span style="color:${e.color}; font-weight:bold;">${e.name}</span>` + (!SYSTEM_BUTTON_IDS.includes(e.id) ? `<button onclick="removeSearchEngine('${e.id}')" style="background:none; border:none; color:#EA4335; cursor:pointer; font-weight:bold;">Xóa</button>` : '');
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
    if (e.target.closest("button, input, select, textarea, a, pre, #cppWorkspace")) return;

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
// WORKSPACE: C++ CODE REPOSITORY (tích hợp từ c_learning_repository_exercise_solutions)
// ==========================================
const CPP_CHAPTERS = [
    { id: 'ALL', label: 'Tất cả' },
    { id: '0', label: 'C++ Cơ Bản' },
    { id: '1', label: 'Chương 1' },
    { id: '2', label: 'Chương 2' },
    { id: '3', label: 'Chương 3' },
    { id: '4', label: 'Chương 4' },
    { id: '5', label: 'Chương 5' }
];

let cppActiveId = null;
let cppChapter = 'ALL';
let cppQuery = '';
let cppInputState = {};
let cppCopyTimer = null;

function getCppActiveExercise() {
    return CPP_DATABASE.find(x => x.id === cppActiveId) || CPP_DATABASE[0];
}

function getCppFiltered() {
    const q = cppQuery.trim().toLowerCase();
    return CPP_DATABASE.filter(item => {
        const okChapter = cppChapter === 'ALL' || String(item.chapter) === cppChapter;
        const okSearch = !q || item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q);
        return okChapter && okSearch;
    });
}

function openCppWorkspace() {
    toggleMainElements(false);
    document.getElementById('cppWorkspace').style.display = 'block';
    if (!cppActiveId) cppActiveId = CPP_DATABASE[0].id;
    renderCppFilters();
    renderCppList();
    renderCppDetail();
}

function closeCppWorkspace() {
    toggleMainElements(true);
    document.getElementById('cppWorkspace').style.display = 'none';
}

function renderCppFilters() {
    const box = document.getElementById('cppChapterFilters');
    if (!box) return;
    box.innerHTML = '';
    CPP_CHAPTERS.forEach(tab => {
        const b = document.createElement('button');
        b.className = 'cpp-chip' + (cppChapter === tab.id ? ' active' : '');
        b.textContent = tab.label;
        b.onclick = () => { cppChapter = tab.id; renderCppFilters(); renderCppList(); };
        box.appendChild(b);
    });
}

function handleCppSearch(value) {
    cppQuery = value;
    renderCppList();
}

function renderCppList() {
    const list = document.getElementById('cppExerciseList');
    const count = document.getElementById('cppCount');
    if (!list) return;
    const items = getCppFiltered();
    if (count) count.textContent = items.length;
    list.innerHTML = '';
    if (items.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'cpp-empty';
        empty.textContent = 'Không tìm thấy bài tập phù hợp';
        list.appendChild(empty);
        return;
    }
    items.forEach(ex => {
        const b = document.createElement('button');
        b.className = 'cpp-item' + (ex.id === cppActiveId ? ' active' : '');
        const tag = document.createElement('span');
        tag.className = 'cpp-item-tag';
        tag.textContent = ex.chapterTitle;
        const title = document.createElement('span');
        title.className = 'cpp-item-title';
        title.textContent = ex.title;
        b.appendChild(tag);
        b.appendChild(title);
        b.onclick = () => { cppActiveId = ex.id; renderCppList(); renderCppDetail(); };
        list.appendChild(b);
    });
}

function renderCppDetail() {
    const ex = getCppActiveExercise();
    document.getElementById('cppChapterBadge').textContent = ex.chapterTitle;
    document.getElementById('cppTitle').textContent = ex.title;
    document.getElementById('cppDesc').textContent = ex.description;
    document.getElementById('cppAlgo').textContent = ex.algorithm;
    document.getElementById('cppCode').textContent = ex.code;
    const copyBtn = document.getElementById('cppCopyBtn');
    if (copyBtn) copyBtn.textContent = '📋 Copy Code';

    // Khởi tạo ô nhập mô phỏng
    const fieldsBox = document.getElementById('cppFields');
    fieldsBox.innerHTML = '';
    cppInputState = {};
    const inter = ex.interactive || {};
    if (inter.fields) {
        inter.fields.forEach(f => {
            cppInputState[f.name] = f.default;
            const wrap = document.createElement('div');
            wrap.className = 'cpp-field';
            const label = document.createElement('label');
            label.textContent = f.label;
            const input = document.createElement('input');
            input.type = 'text';
            input.value = f.default;
            input.oninput = () => { cppInputState[f.name] = input.value; runCppSimulation(); };
            wrap.appendChild(label);
            wrap.appendChild(input);
            fieldsBox.appendChild(wrap);
        });
    }
    runCppSimulation();
    const box = document.getElementById('cppDetail');
    if (box) box.scrollTop = 0;
}

function runCppSimulation() {
    const ex = getCppActiveExercise();
    const out = document.getElementById('cppOutput');
    let result = '';
    try {
        if (ex.interactive && ex.interactive.run) {
            result = ex.interactive.fields ? ex.interactive.run(cppInputState) : ex.interactive.run();
        }
    } catch (err) {
        result = 'Lỗi khi mô phỏng: ' + err.message;
    }
    out.textContent = '$ ./program_output\n' + (result || 'Chưa có kết quả.');
}

function copyCppCode() {
    const ex = getCppActiveExercise();
    const btn = document.getElementById('cppCopyBtn');
    const done = () => {
        btn.textContent = '✅ Đã sao chép';
        clearTimeout(cppCopyTimer);
        cppCopyTimer = setTimeout(() => { btn.textContent = '📋 Copy Code'; }, 2000);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(ex.code).then(done).catch(() => fallbackCopyCpp(ex.code, done));
    } else {
        fallbackCopyCpp(ex.code, done);
    }
}

function fallbackCopyCpp(text, done) {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.cssText = 'position:fixed;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); done(); } catch (e) { alert('Không thể sao chép tự động, hãy bôi đen code và copy thủ công.'); }
    document.body.removeChild(ta);
}

// --- DỮ LIỆU BÀI TẬP C++ (21 bài: C++ cơ bản + Chương 1–5) ---
const CPP_DATABASE = [
  // ==================== C++ CƠ BẢN ====================
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
    int age;
    string name;
    
    cout << "Nhap ten cua ban: ";
    cin >> name;
    cout << "Nhap tuoi cua ban: ";
    cin >> age;
    
    cout << "Xin chao " << name << ", ban " << age << " tuoi." << endl;
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        { name: "name", label: "Tên", default: "Nam" },
        { name: "age", label: "Tuổi", default: "20" }
      ],
      run: (inputs) => `Xin chao ${inputs.name || 'Ban'}, ban ${inputs.age || '0'} tuoi.`
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
    int n = 10;
    cout << "Cac so chan tu 1 den " << n << " la: ";
    for (int i = 1; i <= n; i++) {
        if (i % 2 == 0) {
            cout << i << " ";
        }
    }
    cout << endl;
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [{ name: "n", label: "Nhập N", default: "10" }],
      run: (inputs) => {
        const n = parseInt(inputs.n) || 0;
        let res = [];
        for (let i = 1; i <= n; i++) if (i % 2 === 0) res.push(i);
        return `Các số chẵn từ 1 đến ${n} là: ${res.join(' ')}`;
      }
    }
  },

  // ==================== CHƯƠNG 1 ====================
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
      fields: [{ name: "t", label: "Số giây (t)", default: "3700" }],
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
        { name: "xa", label: "xa", default: "0" }, { name: "ya", label: "ya", default: "0" },
        { name: "xb", label: "xb", default: "4" }, { name: "yb", label: "yb", default: "0" },
        { name: "xc", label: "xc", default: "0" }, { name: "yc", label: "yc", default: "3" }
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
        { name: "list", label: "6 số (cách nhau bởi khoảng trắng)", default: "-5 0 12 -3 0 7" }
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
        { name: "nums", label: "4 số nguyên", default: "15 -2 8 3" }
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

  // ==================== CHƯƠNG 2 ====================
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
        { name: "a", label: "a", default: "1" },
        { name: "b", label: "b", default: "-5" },
        { name: "c", label: "c", default: "6" }
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
        { name: "a1", label: "a1", default: "2" }, { name: "b1", label: "b1", default: "1" }, { name: "c1", label: "c1", default: "5" },
        { name: "a2", label: "a2", default: "1" }, { name: "b2", label: "b2", default: "-1" }, { name: "c2", label: "c2", default: "1" }
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
        { name: "a", label: "Cạnh a", default: "3" },
        { name: "b", label: "Cạnh b", default: "4" },
        { name: "c", label: "Cạnh c", default: "5" }
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
        { name: "type", label: "Loại hình (1:Vuông, 2:Chữ Nhật, 3:Tam Giác, 4:Tròn)", default: "2" },
        { name: "val", label: "Cạnh/Bán kính (cách bởi dấu cách)", default: "4 5" }
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
      fields: [{ name: "n", label: "Nhập n", default: "28" }],
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
      fields: [{ name: "n", label: "Nhập n", default: "153" }],
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
#include <cmath>
using namespace std;

long gcd(long a, long b) {
    a = abs(a); b = abs(b);
    while (b != 0) {
        long temp = a % b;
        a = b;
        b = temp;
    }
    return a;
}

void rutGon(long &tu, long &mau) {
    long g = gcd(tu, mau);
    tu /= g;
    mau /= g;
    if (mau < 0) { tu = -tu; mau = -mau; }
}

int main() {
    long a, b, c, d;
    cout << "Nhap phan so 1 (a b): "; cin >> a >> b;
    cout << "Nhap phan so 2 (c d): "; cin >> c >> d;

    // Tong: (ad + bc)/bd
    long t1 = a*d + c*b, m1 = b*d; rutGon(t1, m1);
    cout << "Tong: " << t1 << "/" << m1 << endl;

    // Hieu: (ad - bc)/bd
    long t2 = a*d - c*b, m2 = b*d; rutGon(t2, m2);
    cout << "Hieu: " << t2 << "/" << m2 << endl;

    // Tich: (ac)/(bd)
    long t3 = a*c, m3 = b*d; rutGon(t3, m3);
    cout << "Tich: " << t3 << "/" << m3 << endl;

    // Thuong: (ad)/(bc)
    long t4 = a*d, m4 = b*c; rutGon(t4, m4);
    cout << "Thuong: " << t4 << "/" << m4 << endl;

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        { name: "p1", label: "Phân số 1 (tử mẫu)", default: "1 2" },
        { name: "p2", label: "Phân số 2 (tử mẫu)", default: "3 4" }
      ],
      run: (inp) => {
        const [a, b] = inp.p1.split(/\s+/).map(Number);
        const [c, d] = inp.p2.split(/\s+/).map(Number);
        
        const gcd = (x, y) => { x = Math.abs(x); y = Math.abs(y); return y === 0 ? x : gcd(y, x % y); };
        const fmt = (t, m) => {
          if (m === 0) return "Mẫu số không thể bằng 0!";
          const g = gcd(t, m);
          t /= g; m /= g;
          if (m < 0) { t = -t; m = -m; }
          return m === 1 ? `${t}` : `${t}/${m}`;
        };

        return `Cộng: ${fmt(a*d + c*b, b*d)}\nTrừ: ${fmt(a*d - c*b, b*d)}\nNhân: ${fmt(a*c, b*d)}\nChia: ${fmt(a*d, b*c)}`;
      }
    }
  },

  // ==================== CHƯƠNG 3 ====================
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
      fields: [{ name: "n", label: "Nhập n", default: "30" }],
      run: (i) => {
        const n = parseInt(i.n);
        const sq = [], pr = [], pal = [];
        for (let k = 1; k <= n; k++) {
          if (Math.floor(Math.sqrt(k)) ** 2 === k) sq.push(k);
          let isP = k >= 2;
          for (let j = 2; j * j <= k; j++) if (k % j === 0) isP = false;
          if (isP) pr.push(k);
          if (k.toString() === k.toString().split('').reverse().join('')) pal.push(k);
        }
        return `Chính phương: ${sq.join(' ')}\nNguyên tố: ${pr.join(' ')}\nCân xứng: ${pal.join(' ')}`;
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
long xn_recursive(int n) {
    if (n == 1 || n == 2) return 1;
    return xn_recursive(n - 1) + (n - 1) * xn_recursive(n - 2);
}

// Khong de quy
long xn_iterative(int n) {
    if (n == 1 || n == 2) return 1;
    long f1 = 1, f2 = 1, fn = 0;
    for (int i = 3; i <= n; i++) {
        fn = f2 + (i - 1) * f1;
        f1 = f2;
        f2 = fn;
    }
    return fn;
}

int main() {
    cout << "x7 (De quy) = " << xn_recursive(7) << endl;
    cout << "x7 (Khong de quy) = " << xn_iterative(7) << endl;
    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [{ name: "n", label: "Nhập n", default: "7" }],
      run: (i) => {
        const n = parseInt(i.n);
        if (n < 1) return "n phải >= 1";
        const calc = (k) => {
          if (k === 1 || k === 2) return 1;
          let f1 = 1, f2 = 1, fn = 0;
          for (let j = 3; j <= k; j++) {
            fn = f2 + (j - 1) * f1;
            f1 = f2;
            f2 = fn;
          }
          return fn;
        };
        return `Kết quả x_${n} = ${calc(n)}`;
      }
    }
  },

  // ==================== CHƯƠNG 4 ====================
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
#include <cmath>
using namespace std;

bool isPrime(int n) {
    if (n < 2) return false;
    for (int i = 2; i <= sqrt(n); i++) if (n % i == 0) return false;
    return true;
}

int main() {
    vector<int> a = {12, 7, 5, 4, 11, 8, 3};
    
    // TBC
    double sum = 0;
    for (int x : a) sum += x;
    cout << "TBC = " << sum / a.size() << endl;

    // Chuyen SNT ve cuoi
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
        { name: "arr", label: "Mảng các số nguyên", default: "12 7 5 4 11 8 3" }
      ],
      run: (i) => {
        const a = i.arr.trim().split(/\s+/).map(Number);
        const avg = (a.reduce((s, x) => s + x, 0) / a.length).toFixed(2);
        
        const isP = (n) => {
          if (n < 2) return false;
          for (let k = 2; k * k <= n; k++) if (n % k === 0) return false;
          return true;
        };

        const normal = a.filter(x => !isP(x));
        const primes = a.filter(x => isP(x));
        
        return `TBC: ${avg}\nMảng đẩy SNT về cuối: ${[...normal, ...primes].join(' ')}`;
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

int main() {
    int n = 3;
    int a[3][3] = {{1, 2, 3}, {4, 3, 2}, {5, 3, 7}};
    int b[3][3] = {{2, 1, 3}, {3, 2, 1}, {4, 5, 2}};

    // 1. Ma tran Tong
    cout << "Ma tran Tong A + B:" << endl;
    for (int i = 0; i < n; i++) {
        for (int j = 0; j < n; j++) cout << a[i][j] + b[i][j] << " ";
        cout << endl;
    }

    // 2. Ma tran C = a[i][j] * MaxRow(b, i)
    cout << "Ma tran C:" << endl;
    for (int i = 0; i < n; i++) {
        int maxB = b[i][0];
        for (int j = 1; j < n; j++) maxB = max(maxB, b[i][j]);
        for (int j = 0; j < n; j++) cout << a[i][j] * maxB << " ";
        cout << endl;
    }

    return 0;
}`,
    interactive: {
      type: "simple_run",
      run: () => "Tổng (A+B):\n3 3 6\n7 5 3\n9 8 9\n\nMa trận C (Nhân Max dòng B):\n3 6 9\n12 9 6\n25 15 35"
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
    string s = "Lap trinh C plus plus rat hay";
    stringstream ss(s);
    string word, firstWord = "", lastWord = "", longestWord = "";
    vector<string> words;

    while (ss >> word) {
        words.push_back(word);
        if (word.length() > longestWord.length()) longestWord = word;
    }

    if (!words.empty()) {
        firstWord = words.front();
        lastWord = words.back();
    }

    cout << "So luong tu: " << words.size() << endl;
    cout << "Tu dau trai: " << firstWord << ", Tu dau phai: " << lastWord << endl;
    cout << "Tu dai nhat: " << longestWord << " (" << longestWord.length() << " ky tu)" << endl;

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [{ name: "str", label: "Nhập chuỗi s", default: "Lap trinh C plus plus rat hay" }],
      run: (i) => {
        const words = i.str.trim().split(/\s+/).filter(Boolean);
        if (words.length === 0) return "Chuỗi rỗng!";
        let maxW = words[0];
        words.forEach(w => { if (w.length > maxW.length) maxW = w; });

        return `Số từ: ${words.length}\nTừ đầu trái: ${words[0]}\nTừ đầu phải: ${words[words.length - 1]}\nTừ dài nhất: ${maxW} (${maxW.length} ký tự)`;
      }
    }
  },

  // ==================== CHƯƠNG 5 ====================
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
SOPHUC trus(SOPHUC u, SOPHUC v) { return {u.thuc - v.thuc, u.au - v.au}; }
SOPHUC nhan(SOPHUC u, SOPHUC v) { 
    return {u.thuc * v.thuc - u.au * v.au, u.thuc * v.au + u.au * v.thuc}; 
}

int main() {
    SOPHUC z1 = {3, 4};  // 3 + 4i
    SOPHUC z2 = {1, -2}; // 1 - 2i

    cout << "|z1| = " << z1.doLon() << endl;
    SOPHUC sum = cong(z1, z2);
    cout << "z1 + z2 = " << sum.thuc << " + " << sum.au << "i" << endl;

    return 0;
}`,
    interactive: {
      type: "inputs",
      fields: [
        { name: "z1", label: "Số phức 1 (Thực Ảo)", default: "3 4" },
        { name: "z2", label: "Số phức 2 (Thực Ảo)", default: "1 -2" }
      ],
      run: (i) => {
        const [a, b] = i.z1.split(/\s+/).map(Number);
        const [c, d] = i.z2.split(/\s+/).map(Number);
        
        const mod1 = Math.hypot(a, b).toFixed(2);
        const sumR = a + c, sumI = b + d;
        const mulR = a*c - b*d, mulI = a*d + b*c;

        return `|Z1| = ${mod1}\nTổng: ${sumR} ${sumI >= 0 ? '+' : ''}${sumI}i\nTích: ${mulR} ${mulI >= 0 ? '+' : ''}${mulI}i`;
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
#include <algorithm>
using namespace std;

struct ThiSinh {
    string sbd;
    string hoTen;
    double ngoaiNgu, coBan, coSo;

    double tongDiem() const {
        return ngoaiNgu + coBan + coSo;
    }
};

int main() {
    vector<ThiSinh> ds = {
        {"CH01", "Nguyen Van A", 7.0, 8.5, 6.0},
        {"CH02", "Tran Thi B", 4.5, 9.0, 8.0}, // Liet NN
        {"CH03", "Le Van C", 8.0, 9.0, 9.5}   // Thu khoa
    };

    cout << "--- THI SINH CO MON < 5 ---" << endl;
    for (auto &ts : ds) {
        if (ts.ngoaiNgu < 5 || ts.coBan < 5 || ts.coSo < 5) {
            cout << ts.sbd << " - " << ts.hoTen << endl;
        }
    }

    return 0;
}`,
    interactive: {
      type: "simple_run",
      run: () => "=== DANH SÁCH THÍ SINH CÓ MÔN < 5 ===\n- SBD: CH02 | Họ tên: Tran Thi B (Ngoại ngữ: 4.5)\n\n=== TÌM THỦ KHOA ===\n- Thủ khoa: Le Van C (SBD: CH03) với Tổng điểm = 26.5"
    }
  }
];
