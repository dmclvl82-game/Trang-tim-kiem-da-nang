/* UniSearchVN 3D layer — chỉ điều khiển hiệu ứng trang trí; không đụng logic cũ. */
(function () {
    var root = document.documentElement;
    var fine = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
    var calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (fine && !calm) {
        var raf = 0, x = 0, y = 0;
        window.addEventListener('pointermove', function (e) {
            x = e.clientX / window.innerWidth - 0.5; y = e.clientY / window.innerHeight - 0.5;
            if (raf) return;
            raf = requestAnimationFrame(function () {
                raf = 0; root.style.setProperty('--px', x.toFixed(3)); root.style.setProperty('--py', y.toFixed(3));
            });
        }, { passive: true });
    }
    // Đặt lại vị trí widget đồng hồ/thời tiết (chỉ xóa key 'widgetPos')
    document.addEventListener('DOMContentLoaded', function () {
        var w = document.querySelector('.top-widget-bar');
        if (!w) return;
        w.title = 'Nhấp đúp để đặt lại vị trí';
        w.addEventListener('dblclick', function () {
            try { localStorage.removeItem('widgetPos'); } catch (e) {}
            w.style.position = ''; w.style.top = ''; w.style.left = '';
        });
    });
})();

/* Dock workspace: chỉ gọi lại các hàm mở/đóng đã có; không lưu dữ liệu riêng */
(function () {
    var WS = { notes: ['notesWorkspace', 'openNotesWorkspace', 'closeNotesWorkspace'],
               camera: ['cameraWorkspace', 'openCameraWorkspace', 'closeCameraWorkspace'],
               matrix: ['matrixWorkspace', 'openMatrixWorkspace', 'closeMatrixWorkspace'],
               cpp: ['cppWorkspace', 'openCppWorkspace', 'closeCppWorkspace'] };
    function current() {
        for (var k in WS) { var el = document.getElementById(WS[k][0]); if (el && el.style.display === 'block') return k; }
        return 'home';
    }
    function call(name) { if (typeof window[name] === 'function') window[name](); }
    function closeCurrent() { var k = current(); if (k !== 'home') call(WS[k][2]); }
    function sync() {
        var k = current();
        document.querySelectorAll('.dock button[data-dock]').forEach(function (b) {
            var on = b.dataset.dock === k;
            b.classList.toggle('active', on);
            if (on) b.setAttribute('aria-current', 'page'); else b.removeAttribute('aria-current');
        });
    }
    document.addEventListener('DOMContentLoaded', function () {
        var dock = document.getElementById('workspaceDock');
        if (!dock) return;
        dock.addEventListener('click', function (e) {
            var b = e.target.closest('button[data-dock]'); if (!b) return;
            var key = b.dataset.dock;
            if (key === 'settings') { call('toggleSettings'); return; }
            var was = current();
            closeCurrent();                       // dừng camera/đóng cửa sổ cũ đúng cách
            if (key !== 'home' && key !== was) call(WS[key][1]);
            sync();
        });
        var mo = new MutationObserver(sync);
        Object.keys(WS).forEach(function (k) {
            var el = document.getElementById(WS[k][0]); if (el) mo.observe(el, { attributes: true, attributeFilter: ['style'] });
        });
        sync();
    });
})();
