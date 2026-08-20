(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const limit = Number(document.body.dataset.limit || 50);
  const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  const presets = {
    "amazon-main": { label: "Amazon main image", width: 1600, height: 1600, strict: true, background: "#ffffff", margin: 7.5, min: 1000, note: "Conservative marketplace main-image preset: square, white canvas and no promotional overlays." },
    "flipkart-main": { label: "Flipkart main image", width: 1500, height: 1500, strict: true, background: "#ffffff", margin: 7.5, min: 1000, note: "Conservative Flipkart starting point for a clean square main image." },
    "meesho-main": { label: "Meesho catalogue", width: 1200, height: 1200, strict: true, background: "#ffffff", margin: 7.5, min: 800, note: "Conservative Meesho catalogue starting point with a clean square canvas." },
    "myntra-main": { label: "Myntra portrait", width: 1500, height: 2000, strict: true, background: "#ffffff", margin: 7.5, min: 1000, note: "Portrait fashion-catalogue starting point. Category rules may differ." },
    "quickcommerce-main": { label: "Quick-commerce packshot", width: 1200, height: 1200, strict: true, background: "#ffffff", margin: 7.5, min: 800, note: "Conservative packshot starting point for grocery and quick-commerce catalogues." },
    "shopify-square": { label: "Shopify / D2C square", width: 2048, height: 2048, strict: false, background: "#ffffff", margin: 6, min: 800, note: "High-resolution owned-store preset. Branding layers remain available." },
    "instagram-feed": { label: "Instagram feed", width: 1080, height: 1350, strict: false, background: "#f3efe4", margin: 6, min: 800, note: "4:5 social-commerce portrait with optional promotional layers." },
    "reels-story": { label: "Reels / Story / Status", width: 1080, height: 1920, strict: false, background: "#f3efe4", margin: 8, min: 800, note: "9:16 social story canvas. Keep critical content inside the safe-zone guide." },
    custom: { label: "Custom dimensions", width: 1600, height: 1600, strict: false, background: "#ffffff", margin: 6, min: 320, note: "Custom canvas. Confirm the target platform requirements before upload." }
  };

  const ids = [
    "preset", "customWidth", "customHeight", "presetNote", "enableCompliance", "enableBackground", "background", "backgroundText",
    "enableCrop", "enableMargin", "margin", "marginValue", "enableAdjustments", "brightness", "brightnessValue", "contrast",
    "contrastValue", "saturation", "saturationValue", "enableShadow", "shadowBlur", "shadowOpacity", "enableRotation", "rotation",
    "rotationValue", "showPrice", "priceText", "badgeColor", "enableWatermark", "storeName", "enableLogo", "logoInput",
    "logoLabel", "removeLogo", "enableSafeZone", "includeManifest", "skuPrefix", "format", "quality", "qualityValue",
    "resetImageSettings", "compareOriginal", "previewStage", "previewName", "previewImage", "previewPlaceholder", "rendering",
    "dimensionLabel", "complianceTitle", "complianceScore", "complianceList", "photoInput", "dropZone", "queueList",
    "photoCount", "photoLimit", "clearAll", "exportBatch", "progressTrack", "progressBar", "statusMessage"
  ];
  const e = {};
  ids.forEach((id) => { e[id] = $(id); });
  const state = { items: [], activeId: null, logoUrl: null, previewUrl: null, renderToken: 0, exporting: false, comparing: false };

  function clamp(value, min, max) { return Math.min(max, Math.max(min, Number(value) || 0)); }
  function currentPreset() { return presets[e.preset.value] || presets.custom; }
  function setStatus(message, type) {
    e.statusMessage.textContent = message;
    e.statusMessage.className = "status-message" + (type ? " " + type : "");
  }
  function readOptions() {
    const preset = currentPreset();
    const strictGuard = e.enableCompliance.checked && preset.strict;
    const width = clamp(e.customWidth.value, 320, 6000);
    const height = clamp(e.customHeight.value, 320, 6000);
    return {
      presetKey: e.preset.value, preset: preset, width: width, height: height,
      compliance: e.enableCompliance.checked, strictGuard: strictGuard,
      backgroundEnabled: e.enableBackground.checked || strictGuard || e.format.value === "jpeg",
      background: strictGuard ? "#ffffff" : e.background.value,
      cropEnabled: e.enableCrop.checked,
      fit: e.enableCrop.checked ? (document.querySelector('input[name="fit"]:checked') || {}).value || "contain" : "contain",
      marginEnabled: e.enableMargin.checked,
      margin: e.enableMargin.checked ? clamp(e.margin.value, 0, 28) : 0,
      adjustmentsEnabled: e.enableAdjustments.checked,
      brightness: e.enableAdjustments.checked ? clamp(e.brightness.value, 60, 150) : 100,
      contrast: e.enableAdjustments.checked ? clamp(e.contrast.value, 60, 160) : 100,
      saturation: e.enableAdjustments.checked ? clamp(e.saturation.value, 0, 180) : 100,
      shadowEnabled: e.enableShadow.checked,
      shadowBlur: clamp(e.shadowBlur.value, 0, 50),
      shadowOpacity: clamp(e.shadowOpacity.value, 0, 60) / 100,
      rotationEnabled: e.enableRotation.checked,
      rotation: e.enableRotation.checked ? clamp(e.rotation.value, -15, 15) : 0,
      showPrice: e.showPrice.checked && !strictGuard, priceText: e.priceText.value.trim(), badgeColor: e.badgeColor.value,
      watermarkEnabled: e.enableWatermark.checked && !strictGuard, storeName: e.storeName.value.trim(),
      logoEnabled: e.enableLogo.checked && !strictGuard, safeZone: e.enableSafeZone.checked,
      includeManifest: e.includeManifest.checked, skuPrefix: e.skuPrefix.value.trim(),
      format: e.format.value, quality: clamp(e.quality.value, 60, 100) / 100
    };
  }

  function syncFeatureStates() {
    document.querySelectorAll("[data-feature-controls]").forEach((node) => {
      const toggle = $(node.dataset.featureControls);
      node.classList.toggle("feature-off", Boolean(toggle && !toggle.checked));
      node.querySelectorAll("input, select, button").forEach((control) => { control.disabled = Boolean(toggle && !toggle.checked); });
    });
  }
  function syncLabels() {
    const options = readOptions();
    e.marginValue.textContent = e.margin.value + "%";
    e.brightnessValue.textContent = e.brightness.value + "%";
    e.contrastValue.textContent = e.contrast.value + "%";
    e.saturationValue.textContent = e.saturation.value + "%";
    e.rotationValue.textContent = e.rotation.value + "°";
    e.qualityValue.textContent = e.quality.value + "%";
    e.backgroundText.textContent = e.background.value.toUpperCase();
    e.dimensionLabel.textContent = options.width + " × " + options.height + " px";
    e.quality.disabled = options.format === "png";
    syncFeatureStates();
  }
  function saveSettings() {
    try {
      const values = {};
      document.querySelectorAll("#imageWorkspace input, #imageWorkspace select").forEach((input) => {
        if (input.type !== "file") values[input.id || input.name + ":" + input.value] = input.type === "checkbox" || input.type === "radio" ? input.checked : input.value;
      });
      localStorage.setItem("sellerPhotoStudio.image.v11", JSON.stringify(values));
    } catch (_) {}
  }
  function restoreSettings() {
    try {
      const values = JSON.parse(localStorage.getItem("sellerPhotoStudio.image.v11") || "null");
      if (!values) return;
      document.querySelectorAll("#imageWorkspace input, #imageWorkspace select").forEach((input) => {
        if (input.type === "file") return;
        const key = input.id || input.name + ":" + input.value;
        if (!(key in values)) return;
        if (input.type === "checkbox" || input.type === "radio") input.checked = Boolean(values[key]);
        else input.value = values[key];
      });
    } catch (_) {}
  }
  function applyPreset(resetCreative) {
    const preset = currentPreset();
    if (resetCreative || e.preset.value !== "custom") {
      e.customWidth.value = String(preset.width);
      e.customHeight.value = String(preset.height);
    }
    e.presetNote.textContent = preset.note + " Verify current category rules in your seller portal.";
    if (resetCreative) {
      e.background.value = preset.background;
      e.margin.value = String(preset.margin);
      e.enableBackground.checked = true;
      e.enableCrop.checked = true;
      e.enableMargin.checked = true;
      e.enableCompliance.checked = preset.strict;
      e.enableAdjustments.checked = true;
      e.brightness.value = "100"; e.contrast.value = "100"; e.saturation.value = "100";
      e.enableShadow.checked = false; e.enableRotation.checked = false;
      e.showPrice.checked = false; e.enableWatermark.checked = false; e.enableLogo.checked = false;
      e.enableSafeZone.checked = true;
    }
    schedulePreview();
  }
  function resetImageSettings() {
    applyPreset(true);
    e.format.value = "jpeg"; e.quality.value = "90"; e.includeManifest.checked = true;
    setStatus("Platform-safe defaults restored.");
  }
  function loadImage(url) {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.onload = () => resolve(image);
      image.onerror = () => reject(new Error("This image could not be read."));
      image.src = url;
    });
  }
  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath(); ctx.moveTo(x + r, y); ctx.lineTo(x + width - r, y); ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r); ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }
  function drawFitted(ctx, image, area, options) {
    const rotation = options.rotation * Math.PI / 180;
    const scale = (options.fit === "cover" ? Math.max(area.w / image.naturalWidth, area.h / image.naturalHeight) : Math.min(area.w / image.naturalWidth, area.h / image.naturalHeight));
    const drawW = image.naturalWidth * scale, drawH = image.naturalHeight * scale;
    ctx.save();
    if (options.fit === "cover") { ctx.beginPath(); ctx.rect(area.x, area.y, area.w, area.h); ctx.clip(); }
    ctx.translate(area.x + area.w / 2, area.y + area.h / 2); ctx.rotate(rotation);
    if (options.shadowEnabled) {
      ctx.shadowColor = "rgba(0,0,0," + options.shadowOpacity + ")";
      ctx.shadowBlur = options.shadowBlur * (area.w / options.width);
      ctx.shadowOffsetY = Math.max(2, options.shadowBlur * .35 * (area.w / options.width));
    }
    ctx.filter = "brightness(" + options.brightness + "%) contrast(" + options.contrast + "%) saturate(" + options.saturation + "%)";
    ctx.drawImage(image, -drawW / 2, -drawH / 2, drawW, drawH);
    ctx.restore();
  }
  async function drawOutput(item, options, preview) {
    const previewScale = preview ? Math.min(1, 760 / Math.max(options.width, options.height)) : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(options.width * previewScale));
    canvas.height = Math.max(1, Math.round(options.height * previewScale));
    const ctx = canvas.getContext("2d");
    const scale = canvas.width / options.width;
    const photo = await loadImage(item.url);
    if (options.backgroundEnabled) { ctx.fillStyle = options.background; ctx.fillRect(0, 0, canvas.width, canvas.height); }
    else { ctx.clearRect(0, 0, canvas.width, canvas.height); }
    const pad = options.width * (options.margin / 100) * scale;
    const area = { x: pad, y: pad, w: canvas.width - pad * 2, h: canvas.height - pad * 2 };
    drawFitted(ctx, photo, area, options);
    if (options.showPrice && options.priceText) {
      const font = Math.max(15, Math.round(options.width * .038 * scale));
      const gap = Math.round(options.width * .025 * scale), px = Math.round(font * .68), h = Math.round(font * 1.75);
      ctx.font = "800 " + font + "px Arial, sans-serif";
      const w = Math.ceil(ctx.measureText(options.priceText).width + px * 2);
      roundRect(ctx, gap, gap, w, h, h * .28); ctx.fillStyle = options.badgeColor; ctx.fill(); ctx.strokeStyle = "rgba(20,20,20,.65)"; ctx.stroke();
      ctx.fillStyle = "#171717"; ctx.textAlign = "center"; ctx.textBaseline = "middle"; ctx.fillText(options.priceText, gap + w / 2, gap + h / 2);
    }
    if (options.watermarkEnabled && options.storeName) {
      const font = Math.max(12, Math.round(options.width * .022 * scale)), gap = Math.round(options.width * .026 * scale);
      ctx.font = "800 " + font + "px Arial, sans-serif"; const label = options.storeName.toUpperCase(), w = ctx.measureText(label).width;
      roundRect(ctx, gap, canvas.height - gap - font * 2.15, w + font * 1.35, font * 2.15, font * .45);
      ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill(); ctx.fillStyle = "#171717"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.fillText(label, gap + font * .68, canvas.height - gap - font * .62);
    }
    if (options.logoEnabled && state.logoUrl) {
      try {
        const logo = await loadImage(state.logoUrl), maxW = canvas.width * .2, maxH = canvas.height * .11;
        const logoScale = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight, 1);
        const w = logo.naturalWidth * logoScale, h = logo.naturalHeight * logoScale, gap = Math.round(options.width * .026 * scale);
        ctx.drawImage(logo, canvas.width - gap - w, canvas.height - gap - h, w, h);
      } catch (_) {}
    }
    if (preview && options.safeZone) {
      ctx.save(); ctx.setLineDash([10, 8]); ctx.lineWidth = Math.max(2, canvas.width / 500); ctx.strokeStyle = "rgba(38,119,255,.75)";
      ctx.strokeRect(area.x + 1, area.y + 1, area.w - 2, area.h - 2); ctx.restore();
    }
    return canvas;
  }
  function canvasToBlob(canvas, options) {
    const mime = options.format === "png" ? "image/png" : "image/jpeg";
    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The image could not be exported.")), mime, options.quality));
  }

  function renderCompliance(item, options) {
    const checks = [];
    const ratio = options.width / options.height;
    const expected = options.preset.width / options.preset.height;
    checks.push({ ok: Math.abs(ratio - expected) < .015 || options.presetKey === "custom", text: "Canvas aspect ratio matches the selected placement" });
    checks.push({ ok: options.width >= options.preset.min && options.height >= Math.min(options.preset.min, options.preset.height), text: "Output resolution meets this preset's conservative minimum" });
    checks.push({ ok: !options.preset.strict || options.background.toLowerCase() === "#ffffff", text: options.preset.strict ? "Main-image canvas is pure white" : "Background treatment is available for this channel" });
    checks.push({ ok: !options.preset.strict || (!options.showPrice && !options.watermarkEnabled && !options.logoEnabled), text: options.preset.strict ? "Promotional overlays are suppressed" : "Branding overlays follow your selected toggles" });
    checks.push({ ok: options.margin <= 10, text: "Estimated product occupancy is at least 80%" });
    checks.push({ ok: Boolean(item) && item.width >= Math.min(options.width, options.preset.min) && item.height >= Math.min(options.height, options.preset.min), text: item ? "Source photo has enough pixels for the selected output" : "Add a source photo to check its resolution" });
    e.complianceTitle.textContent = options.preset.label;
    e.complianceScore.textContent = checks.filter((check) => check.ok).length + "/" + checks.length + " ready";
    e.complianceList.replaceChildren();
    checks.forEach((check) => {
      const li = document.createElement("li"); li.className = check.ok ? "pass" : "warn";
      const icon = document.createElement("span"); icon.textContent = check.ok ? "✓" : "!";
      const text = document.createElement("span"); text.textContent = check.text; li.append(icon, text); e.complianceList.append(li);
    });
  }
  let renderTimer;
  function schedulePreview() {
    syncLabels(); saveSettings(); clearTimeout(renderTimer); renderTimer = setTimeout(renderPreview, 100);
  }
  async function renderPreview() {
    const item = state.items.find((candidate) => candidate.id === state.activeId) || state.items[0];
    const options = readOptions(); renderCompliance(item, options);
    if (!item) { e.previewPlaceholder.hidden = false; e.previewImage.hidden = true; e.previewName.textContent = "Add a photo to begin"; return; }
    if (state.comparing) { e.previewImage.src = item.url; e.previewImage.hidden = false; e.previewPlaceholder.hidden = true; e.previewName.textContent = item.name + " · original"; return; }
    const token = ++state.renderToken; e.rendering.hidden = false;
    try {
      const canvas = await drawOutput(item, options, true);
      const blob = await canvasToBlob(canvas, { ...options, format: "jpeg", quality: .88 });
      if (token !== state.renderToken) return;
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      state.previewUrl = URL.createObjectURL(blob); e.previewImage.src = state.previewUrl; e.previewImage.hidden = false;
      e.previewPlaceholder.hidden = true; e.previewName.textContent = item.name;
    } catch (error) { setStatus(error.message || "Preview failed.", "error"); }
    finally { if (token === state.renderToken) e.rendering.hidden = true; }
  }
  function renderQueue() {
    e.photoCount.textContent = String(state.items.length); e.photoLimit.textContent = String(limit);
    e.clearAll.disabled = !state.items.length || state.exporting; e.exportBatch.disabled = !state.items.length || state.exporting;
    e.queueList.replaceChildren();
    if (!state.items.length) { const empty = document.createElement("p"); empty.className = "empty-queue"; empty.textContent = "Your batch is empty."; e.queueList.append(empty); return; }
    state.items.forEach((item) => {
      const row = document.createElement("div"); row.className = "queue-item" + (item.id === state.activeId ? " active" : ""); row.tabIndex = 0;
      const thumb = document.createElement("img"); thumb.className = "queue-thumb"; thumb.src = item.url; thumb.alt = "";
      const meta = document.createElement("div"); meta.className = "queue-meta";
      const name = document.createElement("strong"); name.textContent = item.name;
      const size = document.createElement("span"); size.textContent = item.width + " × " + item.height; meta.append(name, size);
      const remove = document.createElement("button"); remove.className = "remove-photo"; remove.type = "button"; remove.textContent = "×"; remove.setAttribute("aria-label", "Remove " + item.name);
      remove.addEventListener("click", (event) => { event.stopPropagation(); removeItem(item.id); });
      const activate = () => { state.activeId = item.id; renderQueue(); renderPreview(); };
      row.addEventListener("click", activate); row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") activate(); });
      row.append(thumb, meta, remove); e.queueList.append(row);
    });
  }
  async function addFiles(fileList) {
    if (state.exporting) return;
    const files = Array.from(fileList), available = Math.max(0, limit - state.items.length);
    let added = 0, skipped = 0;
    for (const file of files.slice(0, available)) {
      if (!acceptedTypes.has(file.type) || file.size > 25 * 1024 * 1024) { skipped += 1; continue; }
      const url = URL.createObjectURL(file);
      try {
        const image = await loadImage(url);
        const item = { id: Date.now() + "-" + Math.random().toString(36).slice(2), file: file, url: url, name: file.name, width: image.naturalWidth, height: image.naturalHeight };
        state.items.push(item); added += 1; if (!state.activeId) state.activeId = item.id;
      } catch (_) { URL.revokeObjectURL(url); skipped += 1; }
    }
    if (files.length > available) skipped += files.length - available;
    e.photoInput.value = ""; renderQueue(); schedulePreview();
    setStatus(added + " photo" + (added === 1 ? "" : "s") + " added." + (skipped ? " " + skipped + " skipped due to the batch, format or 25 MB limit." : ""), skipped ? "error" : "");
  }
  function removeItem(id) {
    const index = state.items.findIndex((item) => item.id === id); if (index < 0) return;
    URL.revokeObjectURL(state.items[index].url); state.items.splice(index, 1);
    if (state.activeId === id) state.activeId = state.items[0] ? state.items[0].id : null;
    renderQueue(); renderPreview(); setStatus(state.items.length ? state.items.length + " photos in this batch." : "Add photos to create your first batch.");
  }
  function clearItems() {
    state.items.forEach((item) => URL.revokeObjectURL(item.url)); state.items = []; state.activeId = null;
    renderQueue(); renderPreview(); setStatus("Batch cleared.");
  }

  const crcTable = (() => {
    const table = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) { let c = n; for (let k = 0; k < 8; k += 1) c = (c & 1) ? 0xedb88320 ^ (c >>> 1) : c >>> 1; table[n] = c >>> 0; }
    return table;
  })();
  function crc32(bytes) { let crc = 0xffffffff; for (const byte of bytes) crc = crcTable[(crc ^ byte) & 0xff] ^ (crc >>> 8); return (crc ^ 0xffffffff) >>> 0; }
  function concat(chunks) { const size = chunks.reduce((sum, chunk) => sum + chunk.length, 0); const output = new Uint8Array(size); let offset = 0; chunks.forEach((chunk) => { output.set(chunk, offset); offset += chunk.length; }); return output; }
  function dosDateTime(date) { const year = Math.max(1980, date.getFullYear()); return { time: (date.getHours() << 11) | (date.getMinutes() << 5) | Math.floor(date.getSeconds() / 2), date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate() }; }
  function createZip(entries) {
    const encoder = new TextEncoder(), localChunks = [], centralChunks = []; let offset = 0; const stamp = dosDateTime(new Date());
    entries.forEach((entry) => {
      const name = encoder.encode(entry.name), bytes = entry.bytes, crc = crc32(bytes);
      const local = new Uint8Array(30 + name.length), lv = new DataView(local.buffer);
      lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(8, 0, true); lv.setUint16(10, stamp.time, true); lv.setUint16(12, stamp.date, true); lv.setUint32(14, crc, true); lv.setUint32(18, bytes.length, true); lv.setUint32(22, bytes.length, true); lv.setUint16(26, name.length, true); local.set(name, 30); localChunks.push(local, bytes);
      const central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true); cv.setUint16(12, stamp.time, true); cv.setUint16(14, stamp.date, true); cv.setUint32(16, crc, true); cv.setUint32(20, bytes.length, true); cv.setUint32(24, bytes.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); central.set(name, 46); centralChunks.push(central);
      offset += local.length + bytes.length;
    });
    const central = concat(centralChunks), end = new Uint8Array(22), ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true); ev.setUint32(12, central.length, true); ev.setUint32(16, offset, true);
    return new Blob(localChunks.concat([central, end]), { type: "application/zip" });
  }
  function safeBaseName(name, index) {
    return name.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 55) || "product-" + (index + 1);
  }
  async function exportBatch() {
    if (!state.items.length || state.exporting) return;
    state.exporting = true; renderQueue(); e.progressTrack.hidden = false; e.progressBar.style.width = "0%";
    const options = readOptions(), entries = [], used = new Set();
    const rows = [["source_name", "output_filename", "platform_preset", "width", "height", "format", "sku_prefix", "compliance_guard"]];
    try {
      for (let index = 0; index < state.items.length; index += 1) {
        const item = state.items[index]; setStatus("Formatting " + (index + 1) + " of " + state.items.length + ": " + item.name);
        const canvas = await drawOutput(item, options, false), blob = await canvasToBlob(canvas, options);
        const sku = options.skuPrefix ? safeBaseName(options.skuPrefix, index) + "-" : "";
        let base = sku + safeBaseName(item.name, index) + "-" + options.width + "x" + options.height, suffix = 2;
        while (used.has(base)) base = sku + safeBaseName(item.name, index) + "-" + options.width + "x" + options.height + "-" + suffix++;
        used.add(base); const outputName = base + "." + (options.format === "png" ? "png" : "jpg");
        entries.push({ name: outputName, bytes: new Uint8Array(await blob.arrayBuffer()) });
        rows.push([item.name, outputName, options.preset.label, options.width, options.height, options.format.toUpperCase(), options.skuPrefix, options.compliance ? "ON" : "OFF"]);
        e.progressBar.style.width = Math.round(((index + 1) / state.items.length) * 92) + "%";
      }
      if (options.includeManifest) {
        const csv = rows.map((row) => row.map((value) => '"' + String(value).replaceAll('"', '""') + '"').join(",")).join("\r\n");
        entries.push({ name: "sellerphoto-export-manifest.csv", bytes: new TextEncoder().encode(csv) });
      }
      setStatus("Packing your ZIP…"); const zip = createZip(entries); e.progressBar.style.width = "100%";
      const url = URL.createObjectURL(zip), link = document.createElement("a"); link.href = url; link.download = "SellerPhotoStudio-" + new Date().toISOString().slice(0, 10) + ".zip";
      document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
      setStatus(state.items.length + " finished photo" + (state.items.length === 1 ? "" : "s") + " downloaded.", "success");
    } catch (error) { setStatus(error.message || "The batch could not be exported.", "error"); }
    finally { state.exporting = false; renderQueue(); setTimeout(() => { e.progressTrack.hidden = true; e.progressBar.style.width = "0%"; }, 1100); }
  }

  document.querySelectorAll(".workspace-tab").forEach((button) => button.addEventListener("click", () => {
    document.querySelectorAll(".workspace-tab").forEach((tab) => { const active = tab === button; tab.classList.toggle("active", active); tab.setAttribute("aria-selected", String(active)); });
    document.querySelectorAll("[data-workspace]").forEach((workspace) => { const active = workspace.id === button.dataset.workspaceTarget; workspace.hidden = !active; workspace.classList.toggle("active", active); });
    window.dispatchEvent(new CustomEvent("sellerphoto:workspace", { detail: button.dataset.workspaceTarget }));
  }));
  document.querySelectorAll("#imageWorkspace input, #imageWorkspace select").forEach((input) => {
    if (input.type !== "file") { input.addEventListener("input", schedulePreview); input.addEventListener("change", schedulePreview); }
  });
  e.preset.addEventListener("change", () => applyPreset(true));
  e.resetImageSettings.addEventListener("click", resetImageSettings);
  e.photoInput.addEventListener("change", () => addFiles(e.photoInput.files));
  ["dragenter", "dragover"].forEach((name) => e.dropZone.addEventListener(name, (event) => { event.preventDefault(); e.dropZone.classList.add("drag-over"); }));
  ["dragleave", "drop"].forEach((name) => e.dropZone.addEventListener(name, (event) => { event.preventDefault(); e.dropZone.classList.remove("drag-over"); }));
  e.dropZone.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));
  e.clearAll.addEventListener("click", clearItems); e.exportBatch.addEventListener("click", exportBatch);
  e.logoInput.addEventListener("change", () => {
    const file = e.logoInput.files && e.logoInput.files[0];
    if (!file || !acceptedTypes.has(file.type)) return setStatus("Choose a PNG, JPG or WebP logo.", "error");
    if (state.logoUrl) URL.revokeObjectURL(state.logoUrl); state.logoUrl = URL.createObjectURL(file); e.logoLabel.textContent = file.name; e.removeLogo.hidden = false; schedulePreview();
  });
  e.removeLogo.addEventListener("click", () => {
    if (state.logoUrl) URL.revokeObjectURL(state.logoUrl); state.logoUrl = null; e.logoInput.value = ""; e.logoLabel.textContent = "Choose logo file"; e.removeLogo.hidden = true; schedulePreview();
  });
  const startCompare = () => { if (!state.items.length) return; state.comparing = true; e.compareOriginal.setAttribute("aria-pressed", "true"); renderPreview(); };
  const endCompare = () => { if (!state.comparing) return; state.comparing = false; e.compareOriginal.setAttribute("aria-pressed", "false"); renderPreview(); };
  e.compareOriginal.addEventListener("pointerdown", startCompare); e.compareOriginal.addEventListener("pointerup", endCompare);
  e.compareOriginal.addEventListener("pointerleave", endCompare); e.compareOriginal.addEventListener("keydown", (event) => { if (event.key === " " || event.key === "Enter") startCompare(); });
  e.compareOriginal.addEventListener("keyup", endCompare);
  window.addEventListener("beforeunload", () => {
    state.items.forEach((item) => URL.revokeObjectURL(item.url)); if (state.logoUrl) URL.revokeObjectURL(state.logoUrl); if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
  });
  window.SellerPhotoApp = { presets: presets, readOptions: readOptions, drawOutput: drawOutput, createZip: createZip };
  restoreSettings(); e.photoLimit.textContent = String(limit); applyPreset(false); renderQueue();
})();
