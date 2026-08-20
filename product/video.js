(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const e = {};
  [
    "videoPreset", "sceneDuration", "videoFps", "enableMotion", "motionStyle", "enableTransition", "transitionStyle",
    "transitionDuration", "enableCaptions", "captionColor", "captionBackground", "enableVideoCta", "videoPrice", "videoCta",
    "enableVideoLogo", "videoLogoInput", "videoLogoLabel", "enableMusic", "musicInput", "musicLabel", "musicVolume",
    "musicVolumeValue", "enableVideoSafeZone", "videoCanvas", "videoEmpty", "videoPreviewName", "videoDimensionLabel",
    "videoPlay", "videoScrubber", "videoTime", "videoProgressTrack", "videoProgressBar", "videoStatus", "exportVideo",
    "videoDropZone", "videoPhotoInput", "sceneList", "sceneCount", "clearScenes"
  ].forEach((id) => { e[id] = $(id); });

  if (!e.videoCanvas) return;
  const formats = {
    vertical: { width: 1080, height: 1920, label: "Reels / Shorts / Status", safe: { top: .08, right: .12, bottom: .18, left: .08 } },
    square: { width: 1080, height: 1080, label: "Marketplace / social square", safe: { top: .07, right: .07, bottom: .12, left: .07 } },
    portrait: { width: 1080, height: 1350, label: "Instagram portrait", safe: { top: .07, right: .07, bottom: .13, left: .07 } },
    landscape: { width: 1920, height: 1080, label: "YouTube / website", safe: { top: .07, right: .08, bottom: .12, left: .08 } }
  };
  const accepted = new Set(["image/jpeg", "image/png", "image/webp"]);
  const state = { scenes: [], logoUrl: null, musicUrl: null, playing: false, playStarted: 0, playOffset: 0, frame: null, exporting: false };
  const ctx = e.videoCanvas.getContext("2d");

  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); }
  function options() {
    return {
      format: formats[e.videoPreset.value] || formats.vertical,
      sceneDuration: clamp(e.sceneDuration.value, 1.5, 8),
      fps: clamp(e.videoFps.value, 24, 30),
      motion: e.enableMotion.checked, motionStyle: e.motionStyle.value,
      transition: e.enableTransition.checked, transitionStyle: e.transitionStyle.value,
      transitionDuration: clamp(e.transitionDuration.value, .2, 1.5),
      captions: e.enableCaptions.checked, captionColor: e.captionColor.value, captionBackground: e.captionBackground.value,
      cta: e.enableVideoCta.checked, price: e.videoPrice.value.trim(), ctaText: e.videoCta.value.trim(),
      logo: e.enableVideoLogo.checked && Boolean(state.logoUrl), music: e.enableMusic.checked && Boolean(state.musicUrl),
      musicVolume: clamp(e.musicVolume.value, 0, 100) / 100, safeZone: e.enableVideoSafeZone.checked
    };
  }
  function totalDuration() { return state.scenes.length * options().sceneDuration; }
  function timeLabel(seconds) {
    const safe = Math.max(0, seconds || 0), minutes = Math.floor(safe / 60), secs = Math.floor(safe % 60);
    return String(minutes).padStart(2, "0") + ":" + String(secs).padStart(2, "0");
  }
  function setStatus(message, type) {
    e.videoStatus.textContent = message;
    e.videoStatus.className = "status-message" + (type ? " " + type : "");
  }
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image(); image.onload = () => resolve(image); image.onerror = () => reject(new Error("This scene could not be read.")); image.src = url;
    });
  }
  function roundRect(context, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    context.beginPath(); context.moveTo(x + r, y); context.lineTo(x + width - r, y); context.quadraticCurveTo(x + width, y, x + width, y + r);
    context.lineTo(x + width, y + height - r); context.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    context.lineTo(x + r, y + height); context.quadraticCurveTo(x, y + height, x, y + height - r);
    context.lineTo(x, y + r); context.quadraticCurveTo(x, y, x + r, y); context.closePath();
  }
  function syncControls() {
    document.querySelectorAll("[data-video-controls]").forEach((node) => {
      const toggle = $(node.dataset.videoControls), off = toggle && !toggle.checked;
      node.classList.toggle("feature-off", Boolean(off));
      node.querySelectorAll("input, select, button").forEach((control) => { control.disabled = Boolean(off); });
    });
    const format = options().format;
    if (e.videoCanvas.width !== format.width || e.videoCanvas.height !== format.height) {
      e.videoCanvas.width = format.width; e.videoCanvas.height = format.height;
    }
    e.videoDimensionLabel.textContent = format.width + " × " + format.height + " · WebM";
    e.musicVolumeValue.textContent = e.musicVolume.value + "%";
    e.sceneCount.textContent = String(state.scenes.length);
    const total = totalDuration();
    e.videoTime.textContent = timeLabel(state.playOffset) + " / " + timeLabel(total);
    e.videoPlay.disabled = !state.scenes.length || state.exporting;
    e.exportVideo.disabled = !state.scenes.length || state.exporting || typeof MediaRecorder === "undefined";
    e.clearScenes.disabled = !state.scenes.length || state.exporting;
    try {
      const values = {};
      document.querySelectorAll("#videoWorkspace input, #videoWorkspace select").forEach((input) => {
        if (input.type !== "file" && input.id) values[input.id] = input.type === "checkbox" ? input.checked : input.value;
      });
      localStorage.setItem("sellerPhotoStudio.video.v11", JSON.stringify(values));
    } catch (_) {}
  }
  function restoreSettings() {
    try {
      const values = JSON.parse(localStorage.getItem("sellerPhotoStudio.video.v11") || "null");
      if (!values) return;
      Object.keys(values).forEach((id) => {
        const input = $(id); if (!input || input.type === "file") return;
        if (input.type === "checkbox") input.checked = Boolean(values[id]); else input.value = values[id];
      });
    } catch (_) {}
  }
  function drawCover(image, progress, style, alpha, offsetX) {
    const width = e.videoCanvas.width, height = e.videoCanvas.height;
    let zoom = 1.06, shiftX = 0, shiftY = 0;
    if (style === "zoom-in") zoom = 1.02 + progress * .1;
    if (style === "zoom-out") zoom = 1.12 - progress * .1;
    if (style === "pan-left") { zoom = 1.1; shiftX = width * (.04 - progress * .08); }
    if (style === "pan-right") { zoom = 1.1; shiftX = width * (-.04 + progress * .08); }
    const scale = Math.max(width / image.naturalWidth, height / image.naturalHeight) * zoom;
    const drawW = image.naturalWidth * scale, drawH = image.naturalHeight * scale;
    ctx.save(); ctx.globalAlpha = alpha; ctx.translate(offsetX || 0, 0);
    ctx.drawImage(image, (width - drawW) / 2 + shiftX, (height - drawH) / 2 + shiftY, drawW, drawH);
    ctx.restore();
  }
  function drawTextOverlay(scene, currentOptions, includeGuides) {
    const width = e.videoCanvas.width, height = e.videoCanvas.height, unit = Math.min(width, height);
    if (currentOptions.captions && scene.caption) {
      const fontSize = Math.round(unit * .052), paddingX = fontSize * .7, paddingY = fontSize * .45;
      ctx.font = "800 " + fontSize + "px Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const maxText = width * .76, words = scene.caption.trim().split(/\s+/), lines = []; let line = "";
      words.forEach((word) => {
        const test = line ? line + " " + word : word;
        if (ctx.measureText(test).width > maxText && line) { lines.push(line); line = word; } else line = test;
      });
      if (line) lines.push(line); const used = lines.slice(0, 2), boxH = used.length * fontSize * 1.15 + paddingY * 2;
      const boxY = height * .69;
      roundRect(ctx, width * .1, boxY, width * .8, boxH, fontSize * .35); ctx.fillStyle = currentOptions.captionBackground + "e6"; ctx.fill();
      ctx.fillStyle = currentOptions.captionColor;
      used.forEach((text, index) => ctx.fillText(text, width / 2, boxY + paddingY + fontSize * .58 + index * fontSize * 1.15));
    }
    if (currentOptions.cta && (currentOptions.price || currentOptions.ctaText)) {
      const font = Math.round(unit * .043), y = height * .88;
      ctx.font = "800 " + font + "px Arial, sans-serif"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      const label = [currentOptions.price, currentOptions.ctaText].filter(Boolean).join("  ·  ");
      const w = Math.min(width * .82, ctx.measureText(label).width + font * 1.5);
      roundRect(ctx, (width - w) / 2, y - font, w, font * 2.05, font); ctx.fillStyle = "#c7ff4a"; ctx.fill();
      ctx.fillStyle = "#171717"; ctx.fillText(label, width / 2, y + font * .04);
    }
    if (currentOptions.logo && state.logoImage) {
      const maxW = width * .18, maxH = height * .09, scale = Math.min(maxW / state.logoImage.naturalWidth, maxH / state.logoImage.naturalHeight, 1);
      const w = state.logoImage.naturalWidth * scale, h = state.logoImage.naturalHeight * scale;
      ctx.drawImage(state.logoImage, width - w - width * .06, height * .055, w, h);
    }
    if (includeGuides && currentOptions.safeZone) {
      const safe = currentOptions.format.safe;
      ctx.save(); ctx.setLineDash([22, 16]); ctx.lineWidth = Math.max(3, width / 360); ctx.strokeStyle = "rgba(199,255,74,.9)";
      ctx.strokeRect(width * safe.left, height * safe.top, width * (1 - safe.left - safe.right), height * (1 - safe.top - safe.bottom)); ctx.restore();
    }
  }
  function renderAt(time, includeGuides) {
    const currentOptions = options(), total = totalDuration(), safeTime = total ? Math.max(0, Math.min(time, Math.max(0, total - .001))) : 0;
    ctx.fillStyle = "#11120f"; ctx.fillRect(0, 0, e.videoCanvas.width, e.videoCanvas.height);
    if (!state.scenes.length) return;
    const index = Math.min(state.scenes.length - 1, Math.floor(safeTime / currentOptions.sceneDuration));
    const local = safeTime - index * currentOptions.sceneDuration, progress = local / currentOptions.sceneDuration;
    const scene = state.scenes[index], transitionStart = currentOptions.sceneDuration - Math.min(currentOptions.transitionDuration, currentOptions.sceneDuration * .45);
    let transitionProgress = 0;
    if (currentOptions.transition && index < state.scenes.length - 1 && local > transitionStart) transitionProgress = (local - transitionStart) / (currentOptions.sceneDuration - transitionStart);
    if (transitionProgress && currentOptions.transitionStyle === "slide") {
      drawCover(scene.image, currentOptions.motion ? progress : .5, currentOptions.motionStyle, 1, -transitionProgress * e.videoCanvas.width);
      drawCover(state.scenes[index + 1].image, 0, currentOptions.motionStyle, 1, (1 - transitionProgress) * e.videoCanvas.width);
    } else {
      drawCover(scene.image, currentOptions.motion ? progress : .5, currentOptions.motionStyle, 1, 0);
      if (transitionProgress) drawCover(state.scenes[index + 1].image, 0, currentOptions.motionStyle, transitionProgress, 0);
    }
    drawTextOverlay(transitionProgress > .5 ? state.scenes[index + 1] : scene, currentOptions, includeGuides);
    e.videoPreviewName.textContent = scene.name;
  }
  function updatePreview(time) {
    state.playOffset = Math.max(0, Math.min(time, totalDuration()));
    renderAt(state.playOffset, true);
    const total = totalDuration(); e.videoScrubber.value = total ? String(Math.round(state.playOffset / total * 1000)) : "0";
    e.videoTime.textContent = timeLabel(state.playOffset) + " / " + timeLabel(total);
  }
  function stopPlayback(reset) {
    state.playing = false; if (state.frame) cancelAnimationFrame(state.frame); state.frame = null; e.videoPlay.textContent = "Play preview";
    if (reset) updatePreview(0);
  }
  function playbackFrame(now) {
    if (!state.playing) return;
    const elapsed = (now - state.playStarted) / 1000, time = state.playOffset + elapsed;
    if (time >= totalDuration()) { stopPlayback(true); return; }
    renderAt(time, true); e.videoScrubber.value = String(Math.round(time / totalDuration() * 1000));
    e.videoTime.textContent = timeLabel(time) + " / " + timeLabel(totalDuration()); state.frame = requestAnimationFrame(playbackFrame);
  }
  function togglePlayback() {
    if (state.playing) {
      const elapsed = (performance.now() - state.playStarted) / 1000; state.playOffset = Math.min(totalDuration(), state.playOffset + elapsed); stopPlayback(false); updatePreview(state.playOffset); return;
    }
    if (!state.scenes.length) return;
    if (state.playOffset >= totalDuration() - .05) state.playOffset = 0;
    state.playing = true; state.playStarted = performance.now(); e.videoPlay.textContent = "Pause preview"; state.frame = requestAnimationFrame(playbackFrame);
  }
  function renderScenes() {
    e.sceneList.replaceChildren(); e.sceneCount.textContent = String(state.scenes.length); e.videoEmpty.hidden = Boolean(state.scenes.length);
    if (!state.scenes.length) {
      const empty = document.createElement("p"); empty.className = "empty-queue"; empty.textContent = "No scenes yet."; e.sceneList.append(empty);
    } else state.scenes.forEach((scene, index) => {
      const row = document.createElement("article"); row.className = "scene-item";
      const image = document.createElement("img"); image.src = scene.url; image.alt = "";
      const content = document.createElement("div"); content.className = "scene-copy";
      const title = document.createElement("strong"); title.textContent = String(index + 1).padStart(2, "0") + " · " + scene.name;
      const caption = document.createElement("input"); caption.type = "text"; caption.maxLength = 68; caption.value = scene.caption; caption.placeholder = "Scene selling point";
      caption.addEventListener("input", () => { scene.caption = caption.value; updatePreview(state.playOffset); });
      content.append(title, caption);
      const actions = document.createElement("div"); actions.className = "scene-actions";
      [["↑", -1, "Move up"], ["↓", 1, "Move down"]].forEach((entry) => {
        const button = document.createElement("button"); button.type = "button"; button.textContent = entry[0]; button.title = entry[2];
        button.disabled = index + entry[1] < 0 || index + entry[1] >= state.scenes.length;
        button.addEventListener("click", () => { const next = index + entry[1]; const item = state.scenes.splice(index, 1)[0]; state.scenes.splice(next, 0, item); renderScenes(); updatePreview(0); });
        actions.append(button);
      });
      const remove = document.createElement("button"); remove.type = "button"; remove.textContent = "×"; remove.title = "Remove scene";
      remove.addEventListener("click", () => { URL.revokeObjectURL(scene.url); state.scenes.splice(index, 1); stopPlayback(true); renderScenes(); syncControls(); updatePreview(0); });
      actions.append(remove); row.append(image, content, actions); e.sceneList.append(row);
    });
    syncControls(); updatePreview(Math.min(state.playOffset, totalDuration()));
  }
  async function addScenes(fileList) {
    const files = Array.from(fileList), available = Math.max(0, 12 - state.scenes.length); let added = 0, skipped = 0;
    for (const file of files.slice(0, available)) {
      if (!accepted.has(file.type) || file.size > 25 * 1024 * 1024) { skipped += 1; continue; }
      const url = URL.createObjectURL(file);
      try {
        const image = await loadImage(url); state.scenes.push({ id: Date.now() + "-" + Math.random(), file: file, url: url, image: image, name: file.name, caption: "Discover " + file.name.replace(/\.[^.]+$/, "").replace(/[-_]+/g, " ") });
        added += 1;
      } catch (_) { URL.revokeObjectURL(url); skipped += 1; }
    }
    if (files.length > available) skipped += files.length - available;
    e.videoPhotoInput.value = ""; renderScenes();
    setStatus(added + " scene" + (added === 1 ? "" : "s") + " added." + (skipped ? " " + skipped + " skipped due to the 12-scene, format or 25 MB limit." : ""), skipped ? "error" : "");
  }
  function clearScenes() {
    stopPlayback(true); state.scenes.forEach((scene) => URL.revokeObjectURL(scene.url)); state.scenes = []; renderScenes(); setStatus("Timeline cleared.");
  }
  function supportedMime() {
    const candidates = ["video/webm;codecs=vp9", "video/webm;codecs=vp8", "video/webm"];
    return candidates.find((type) => MediaRecorder.isTypeSupported(type)) || "";
  }
  async function exportVideo() {
    if (!state.scenes.length || state.exporting || typeof MediaRecorder === "undefined") return;
    stopPlayback(false); state.exporting = true; syncControls(); e.videoProgressTrack.hidden = false; e.videoProgressBar.style.width = "0%";
    const currentOptions = options(), total = totalDuration(), canvasStream = e.videoCanvas.captureStream(currentOptions.fps);
    let exportStream = canvasStream, audio = null, audioContext = null;
    try {
      if (currentOptions.music && state.musicUrl) {
        audio = new Audio(state.musicUrl); audio.loop = true; audio.volume = currentOptions.musicVolume;
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const source = audioContext.createMediaElementSource(audio), gain = audioContext.createGain(), destination = audioContext.createMediaStreamDestination();
        gain.gain.value = currentOptions.musicVolume; source.connect(gain); gain.connect(destination);
        exportStream = new MediaStream(canvasStream.getVideoTracks().concat(destination.stream.getAudioTracks()));
      }
      const chunks = [], mimeType = supportedMime(), recorder = new MediaRecorder(exportStream, mimeType ? { mimeType: mimeType, videoBitsPerSecond: 8000000 } : undefined);
      recorder.ondataavailable = (event) => { if (event.data && event.data.size) chunks.push(event.data); };
      const finished = new Promise((resolve, reject) => { recorder.onstop = resolve; recorder.onerror = () => reject(new Error("The browser could not record this video.")); });
      recorder.start(250); if (audio) { audio.currentTime = 0; await audio.play(); }
      const started = performance.now();
      await new Promise((resolve) => {
        function frame(now) {
          const time = Math.min(total, (now - started) / 1000); renderAt(Math.min(time, total - .001), false);
          e.videoProgressBar.style.width = Math.round(time / total * 100) + "%"; setStatus("Generating video · " + timeLabel(time) + " / " + timeLabel(total));
          if (time >= total) { resolve(); return; } requestAnimationFrame(frame);
        }
        requestAnimationFrame(frame);
      });
      recorder.stop(); if (audio) audio.pause(); await finished;
      const blob = new Blob(chunks, { type: recorder.mimeType || "video/webm" }), url = URL.createObjectURL(blob), link = document.createElement("a");
      link.href = url; link.download = "SellerPhoto-product-video-" + new Date().toISOString().slice(0, 10) + ".webm"; document.body.append(link); link.click(); link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 8000); setStatus("Product video downloaded. Convert to MP4 only if your upload portal requires it.", "success");
    } catch (error) { setStatus(error.message || "The video could not be generated.", "error"); }
    finally {
      if (audio) audio.pause(); if (audioContext) audioContext.close(); state.exporting = false; syncControls(); updatePreview(0);
      setTimeout(() => { e.videoProgressTrack.hidden = true; e.videoProgressBar.style.width = "0%"; }, 1200);
    }
  }

  document.querySelectorAll("#videoWorkspace input, #videoWorkspace select").forEach((input) => {
    if (input.type !== "file") {
      input.addEventListener("input", () => { syncControls(); updatePreview(state.playOffset); });
      input.addEventListener("change", () => { syncControls(); updatePreview(state.playOffset); });
    }
  });
  e.videoPhotoInput.addEventListener("change", () => addScenes(e.videoPhotoInput.files));
  ["dragenter", "dragover"].forEach((name) => e.videoDropZone.addEventListener(name, (event) => { event.preventDefault(); e.videoDropZone.classList.add("drag-over"); }));
  ["dragleave", "drop"].forEach((name) => e.videoDropZone.addEventListener(name, (event) => { event.preventDefault(); e.videoDropZone.classList.remove("drag-over"); }));
  e.videoDropZone.addEventListener("drop", (event) => addScenes(event.dataTransfer.files));
  e.videoPlay.addEventListener("click", togglePlayback);
  e.videoScrubber.addEventListener("input", () => { stopPlayback(false); updatePreview(totalDuration() * Number(e.videoScrubber.value) / 1000); });
  e.clearScenes.addEventListener("click", clearScenes); e.exportVideo.addEventListener("click", exportVideo);
  e.videoLogoInput.addEventListener("change", async () => {
    const file = e.videoLogoInput.files && e.videoLogoInput.files[0]; if (!file || !accepted.has(file.type)) return setStatus("Choose a PNG, JPG or WebP logo.", "error");
    if (state.logoUrl) URL.revokeObjectURL(state.logoUrl); state.logoUrl = URL.createObjectURL(file); state.logoImage = await loadImage(state.logoUrl);
    e.videoLogoLabel.textContent = file.name; e.enableVideoLogo.checked = true; syncControls(); updatePreview(state.playOffset);
  });
  e.musicInput.addEventListener("change", () => {
    const file = e.musicInput.files && e.musicInput.files[0]; if (!file) return;
    if (state.musicUrl) URL.revokeObjectURL(state.musicUrl); state.musicUrl = URL.createObjectURL(file); e.musicLabel.textContent = file.name; e.enableMusic.checked = true; syncControls();
  });
  window.addEventListener("sellerphoto:workspace", (event) => { if (event.detail === "videoWorkspace") updatePreview(state.playOffset); else stopPlayback(false); });
  window.addEventListener("beforeunload", () => {
    state.scenes.forEach((scene) => URL.revokeObjectURL(scene.url)); if (state.logoUrl) URL.revokeObjectURL(state.logoUrl); if (state.musicUrl) URL.revokeObjectURL(state.musicUrl);
  });
  window.SellerPhotoVideo = { formats: formats, renderAt: renderAt, exportVideo: exportVideo };
  restoreSettings(); syncControls(); renderScenes(); updatePreview(0);
})();
