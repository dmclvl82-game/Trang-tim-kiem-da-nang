/* UniSearchVN — cảnh 3D WebGL (Three.js). Mỗi panel HTML được gắn với một tấm 3D có độ dày
   đặt ở độ sâu riêng; camera phối cảnh xoay theo chuột/kéo, HTML bám theo phép chiếu của tấm.
   Không có WebGL/Three.js -> thoát im lặng, giao diện 2D + lớp CSS cũ vẫn dùng bình thường. */
(function () {
    'use strict';
    if (!window.THREE || !window.WebGLRenderingContext) return;
    var T = THREE, root = document.documentElement;
    var calm = matchMedia('(prefers-reduced-motion: reduce)').matches;
    var canvas = document.createElement('canvas'); canvas.id = 'scene3d'; canvas.setAttribute('aria-hidden', 'true');
    var renderer;
    try { renderer = new T.WebGLRenderer({ canvas: canvas, alpha: true, antialias: true, powerPreference: 'low-power' }); } catch (e) { return; }
    document.body.appendChild(canvas); root.classList.add('webgl-on'); renderer.setClearColor(0, 0);

    var FOV = 40, W = 0, H = 0, D = 1000, scene = new T.Scene(), cam = new T.PerspectiveCamera(FOV, 1, 10, 9000);
    var amb = new T.AmbientLight(0xffffff, .75), key = new T.DirectionalLight(0xffffff, .9), glow = new T.PointLight(0x3a9b7a, 1.6, 1200);
    key.position.set(-400, 600, 800); glow.position.set(0, 0, 260); scene.add(amb, key, glow);

    // Sàn lưới + trường hạt + lõi lưới đa diện (màu thương hiệu: xanh ngọc, chấm hồng sen)
    var grid = new T.GridHelper(5000, 50, 0x2e7d62, 0x2e7d62); grid.material.transparent = true; grid.material.opacity = .28; scene.add(grid);
    var N = innerWidth < 900 ? 120 : 360, pp = new Float32Array(N * 3);
    for (var i = 0; i < N; i++) { pp[i * 3] = Math.random() - .5; pp[i * 3 + 1] = Math.random() - .5; pp[i * 3 + 2] = -900 + Math.random() * 1100; }
    var pg = new T.BufferGeometry(); pg.setAttribute('position', new T.BufferAttribute(pp, 3));
    var field = new T.Points(pg, new T.PointsMaterial({ color: 0x3a9b7a, size: 3, transparent: true, opacity: .6 })); scene.add(field);
    var core = null, dot = null;   // tạo bên trong charGroup, cố định trong tay nhân vật

    // === NHÂN VẬT 3D: model thật (lod.fbx, LOD4) + texture, nhúng trong character_model.js ===
    // Model Z-lên, mặt hướng -Y -> xoay -90° quanh X thành Y-lên, mặt hướng +Z.
    // Lõi đa diện + chấm hồng sen là CON của `figure`, nên dính cố định vào quả cầu ánh sáng trong tay
    // (ORB = tâm đĩa sáng, nằm trong character_model.js cùng với lưới đã dời đĩa ra lòng bàn tay). Nhân vật xoay/lơ lửng thì lõi đi theo.
    var charGroup = null;
    try {
        var M = window.CHAR_MODEL, S = 560, ORB = M.orb || [0.18, 0.145, 0.89], ORB_R = 0.24;   // ORB đọc từ chính file model: đĩa sáng và lõi luôn cùng một tâm, dù file nào cũ/mới
           // S: px/đơn vị model (cao 1.77 ≈ 990px)
        var bin = atob(M.geo), u8 = new Uint8Array(bin.length), nv = M.nv, nf = M.nf, i;
        for (i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
        var q = new Int16Array(u8.buffer, 0, nv * 3), n8 = new Int8Array(u8.buffer, nv * 6, nv * 4),
            pos = new Float32Array(nv * 3), nor = new Float32Array(nv * 3);
        for (i = 0; i < nv * 3; i++) {
            pos[i] = M.min[i % 3] + (q[i] + 32768) / 65535 * (M.max[i % 3] - M.min[i % 3]);
            nor[i] = n8[((i / 3) | 0) * 4 + i % 3] / 127;
        }
        var geo = new T.BufferGeometry();
        geo.setAttribute('position', new T.BufferAttribute(pos, 3));
        geo.setAttribute('normal', new T.BufferAttribute(nor, 3));
        geo.setAttribute('uv', new T.BufferAttribute(new Uint16Array(u8.buffer, nv * 10, nv * 2), 2, true));
        geo.setIndex(new T.BufferAttribute(new Uint16Array(u8.buffer, nv * 14, nf * 3), 1));
        var tl = new T.TextureLoader(), srgb = function (src) { var t = tl.load(src); t.colorSpace = T.SRGBColorSpace; t.anisotropy = 4; return t; };
        var figure = new T.Mesh(geo, new T.MeshStandardMaterial({
            map: srgb(M.diffuse), normalMap: tl.load(M.normal), emissiveMap: srgb(M.emissive), emissive: 0xffffff, emissiveIntensity: .8,
            roughness: .6, metalness: .1, side: T.DoubleSide }));
        figure.rotation.x = -Math.PI / 2; figure.scale.setScalar(S);
        figure.position.set(0, -.883 * S, .55 * S);   // đưa tâm thân (y=.55, z=.883 trong model) về gốc nhóm để xoay quanh trục dọc thân

        core = new T.Mesh(new T.IcosahedronGeometry(1, 1),
            new T.MeshBasicMaterial({ color: 0x2e7d62, wireframe: true, transparent: true, opacity: .7 }));
        core.position.set(ORB[0], ORB[1], ORB[2]); core.scale.setScalar(ORB_R); figure.add(core);
        dot = new T.Mesh(new T.SphereGeometry(.028, 16, 12),
            new T.MeshStandardMaterial({ color: 0xff4d6d, emissive: 0xd90429, emissiveIntensity: .7 }));
        figure.add(dot);

        charGroup = new T.Group(); charGroup.add(figure);
        charGroup.position.set(0, -60, -820);
        scene.add(charGroup);
    } catch (e) { /* nhân vật tùy chọn */ }


    // [selector, độ sâu z (px, dương = gần người xem), có tấm 3D]
    var SPEC = [['.logo', 0, 0], ['.searchbar', 140, 1], ['#searchButtonsContainer', 60, 1], ['#historyContainer', 40, 1],
        ['.top-widget-bar', 200, 1], ['.dino-widget', -80, 0], ['#workspaceDock', 160, 1], ['.header-tools', 120, 1],
        ['#notesWorkspace', 60, 1], ['#cameraWorkspace', 60, 1], ['#matrixWorkspace', 60, 1], ['#cppWorkspace', 60, 1]];
    var slabMat = new T.MeshStandardMaterial({ color: 0x1b4d3e, transparent: true, opacity: .5, roughness: .35, metalness: .25, emissive: 0x2e7d62, emissiveIntensity: .12 });
    var edgeMat = new T.LineBasicMaterial({ color: 0x3a9b7a, transparent: true, opacity: .8 });
    var unit = new T.BoxGeometry(1, 1, 1), unitEdges = new T.EdgesGeometry(unit), items = [];
    SPEC.forEach(function (s) {
        var el = document.querySelector(s[0]); if (!el) return;
        var it = { el: el, z: s[1], lift: 0, tl: 0, slab: null, on: false, press: false, vis: false };
        if (s[2]) { it.slab = new T.Group(); it.slab.add(new T.Mesh(unit, slabMat), new T.LineSegments(unitEdges, edgeMat)); scene.add(it.slab); }
        el.addEventListener('pointerenter', function () { it.tl = 36; });
        el.addEventListener('pointerleave', function () { it.tl = 0; });
        if (s[0] === '.top-widget-bar') {
            el.addEventListener('pointerdown', function () { it.press = true; el.style.translate = 'none'; el.style.scale = 'none'; });
            addEventListener('pointerup', function () { it.press = false; });
        }
        items.push(it);
    });
    var flat = function () { return innerWidth < 900 || calm; };   // mobile/giảm chuyển động: không kéo HTML theo camera

    function measure() {
        W = innerWidth; H = innerHeight;
        renderer.setPixelRatio(Math.min(devicePixelRatio || 1, 1.5)); renderer.setSize(W, H, false);
        cam.aspect = W / H; D = (H / 2) / Math.tan(FOV * Math.PI / 360); cam.updateProjectionMatrix();
        grid.position.set(0, -H * .62, -1400); field.scale.set(W, H, 1);
        items.forEach(function (it) {
            var e = it.el; e.style.translate = 'none'; e.style.scale = 'none';
            var r = e.getBoundingClientRect(); it.r = r; it.on = r.width > 0 && r.height > 0; it.k = (D - it.z) / D;
            it.cx = r.left + r.width / 2 - W / 2; it.cy = -(r.top + r.height / 2 - H / 2);
            if (it.slab) { it.slab.visible = it.on; if (it.on) it.slab.scale.set((r.width + 24) * it.k, (r.height + 24) * it.k, 34 * it.k); }
        });
        // lõi đa diện là con của figure (cố định ở quả cầu ánh sáng trong tay), không theo logo
    }
    var timer = 0; function schedule() { clearTimeout(timer); timer = setTimeout(measure, 80); }
    addEventListener('resize', schedule); addEventListener('load', function () { schedule(); setTimeout(measure, 600); });
    if (window.ResizeObserver) new ResizeObserver(schedule).observe(document.body);
    ['searchButtonsContainer', 'historyContainer'].forEach(function (id) { var n = document.getElementById(id); if (n) new MutationObserver(schedule).observe(n, { childList: true }); });

    // Điều khiển camera: chuột xoay nhẹ, kéo ở vùng trống để xoay rộng hơn
    var yaw = 0, pit = 0, ty = 0, tp = 0, dragY = 0, dragP = 0, dolly = 1, drag = false, sx0 = 0, sy0 = 0, mx = 0, my = 0;
    function clamp(v, a) { return Math.max(-a, Math.min(a, v)); }
    addEventListener('pointermove', function (e) {
        mx = e.clientX / W - .5; my = e.clientY / H - .5; glow.position.set(e.clientX - W / 2, -(e.clientY - H / 2), 260);
        if (drag) { dragY = clamp((e.clientX - sx0) / W * .9, .3); dragP = clamp((e.clientY - sy0) / H * .45, .15); }
    }, { passive: true });
    addEventListener('pointerdown', function (e) { if (e.target === document.body || e.target === root) { drag = true; sx0 = e.clientX; sy0 = e.clientY; } });
    addEventListener('pointerup', function () { drag = false; dragY = dragP = 0; });

    // Chuyển cảnh: mở/đóng workspace -> camera lùi ra rồi bay vào
    document.querySelectorAll('#notesWorkspace,#cameraWorkspace,#matrixWorkspace,#cppWorkspace').forEach(function (el) {
        var was = getComputedStyle(el).display !== 'none';
        new MutationObserver(function () {
            var now = getComputedStyle(el).display !== 'none';
            if (now !== was) { was = now; dolly = 1.3; yaw += .22; schedule(); }
        }).observe(el, { attributes: true, attributeFilter: ['style'] });
    });

    var P = new T.Vector3(), Q = new T.Vector3();
    function frame(t) {
        requestAnimationFrame(frame); if (document.hidden || !W) return;
        amb.intensity = document.body.classList.contains('dark-mode') ? .45 : .8;
        if (!calm) { ty = mx * .28 + dragY; tp = my * .14 + dragP; } else { ty = tp = 0; }
        yaw += (ty - yaw) * .06; pit += (tp - pit) * .06; dolly += (1 - dolly) * .08;
        var R = D * dolly;
        cam.position.set(R * Math.sin(yaw) * Math.cos(pit), R * Math.sin(pit), R * Math.cos(yaw) * Math.cos(pit)); cam.lookAt(0, 0, 0);
        items.forEach(function (it) {
            if (!it.on) return;
            it.lift += (it.tl - it.lift) * .15;
            var z = it.z + it.lift, x = it.cx * it.k, y = it.cy * it.k;
            if (it.slab) it.slab.position.set(x, y, z);
            if (flat() || it.press) return;
            P.set(x, y, z).project(cam); Q.set(x + it.r.width / 2 * it.k, y, z).project(cam);
            var dx = (P.x + 1) / 2 * W - (it.cx + W / 2), dy = (1 - P.y) / 2 * H - (H / 2 - it.cy);
            var s = ((Q.x - P.x) / 2 * W) / (it.r.width / 2);
            it.el.style.translate = dx.toFixed(1) + 'px ' + dy.toFixed(1) + 'px'; it.el.style.scale = s.toFixed(4);
        });
        if (!calm) {
            var a = t * .001;
            // Nhân vật: xoay 360° liên tục (một vòng ~21s) + lơ lửng nhẹ + nghiêng nhẹ
            if (charGroup) {
                charGroup.rotation.y = a * 0.30;
                charGroup.rotation.x = Math.sin(a * 0.4) * 0.04;
                charGroup.position.y = -60 + Math.sin(a * 0.7) * 14;
            }
            // Lõi đa diện: chỉ tự xoay quanh tâm; vị trí cố định ở ORB (hệ tọa độ model)
            if (core) { core.rotation.y = a * .25; core.rotation.x = a * .12; }
            // Chấm hồng sen: quay quanh lõi (hệ tọa độ model, bán kính .3)
            if (dot && core) dot.position.set(ORB[0] + Math.cos(a) * .3, ORB[1] + Math.sin(a) * .3, ORB[2] + Math.sin(a * .8) * .13);
        }
        field.rotation.y = yaw * .6;
        renderer.render(scene, cam);
    }
    measure(); requestAnimationFrame(frame);
})();
