(() => {
  "use strict";

  const body = document.body;
  const mode = body.dataset.mode || "demo";
  const limit = Number(body.dataset.limit || 3);
  const $ = (id) => document.getElementById(id);
  const elements = {
    preset: $("preset"), background: $("background"), backgroundText: $("backgroundText"),
    margin: $("margin"), marginValue: $("marginValue"), storeName: $("storeName"),
    showPrice: $("showPrice"), priceText: $("priceText"), badgeColor: $("badgeColor"),
    logoInput: $("logoInput"), logoLabel: $("logoLabel"), removeLogo: $("removeLogo"),
    format: $("format"), quality: $("quality"), qualityValue: $("qualityValue"),
    photoInput: $("photoInput"), dropZone: $("dropZone"), queueList: $("queueList"),
    photoCount: $("photoCount"), photoLimit: $("photoLimit"), clearAll: $("clearAll"),
    exportBatch: $("exportBatch"), previewImage: $("previewImage"),
    previewPlaceholder: $("previewPlaceholder"), rendering: $("rendering"),
    previewName: $("previewName"), dimensionLabel: $("dimensionLabel"),
    progressTrack: $("progressTrack"), progressBar: $("progressBar"),
    statusMessage: $("statusMessage"), demoNote: $("demoNote"), modePill: $("modePill"),
  };

  const state = { items: [], activeId: null, logoUrl: null, previewUrl: null, renderToken: 0, exporting: false };
  const acceptedTypes = new Set(["image/jpeg", "image/png", "image/webp"]);
  const settingsInputs = [elements.preset, elements.background, elements.margin, elements.storeName,
    elements.showPrice, elements.priceText, elements.badgeColor, elements.format, elements.quality];

  elements.photoLimit.textContent = String(limit);
  if (mode === "pro") {
    elements.modePill.textContent = "FULL OFFLINE EDITION · 50 PHOTOS";
    elements.demoNote.textContent = "Full edition · No upload, account, or usage limit beyond 50 photos per batch.";
    elements.demoNote.classList.add("pro-note");
  }

  function setStatus(message, type = "") {
    elements.statusMessage.textContent = message;
    elements.statusMessage.className = `status-message${type ? ` ${type}` : ""}`;
  }

  function readOptions() {
    const [width, height] = elements.preset.value.split("x").map(Number);
    return {
      width, height,
      fit: document.querySelector('input[name="fit"]:checked')?.value || "contain",
      background: elements.background.value,
      margin: Number(elements.margin.value),
      storeName: elements.storeName.value.trim(),
      showPrice: elements.showPrice.checked,
      priceText: elements.priceText.value.trim(),
      badgeColor: elements.badgeColor.value,
      format: elements.format.value,
      quality: Number(elements.quality.value) / 100,
    };
  }

  function syncLabels() {
    elements.marginValue.textContent = `${elements.margin.value}%`;
    elements.qualityValue.textContent = `${elements.quality.value}%`;
    elements.backgroundText.textContent = elements.background.value.toUpperCase();
    const options = readOptions();
    elements.dimensionLabel.textContent = `${options.width} × ${options.height} px`;
    elements.quality.disabled = options.format === "png";
  }

  function saveSettings() {
    try {
      const options = readOptions();
      localStorage.setItem("sellerPhotoStudio.settings", JSON.stringify({ ...options, preset: elements.preset.value }));
    } catch (_) { /* Preferences are optional. */ }
  }

  function restoreSettings() {
    try {
      const saved = JSON.parse(localStorage.getItem("sellerPhotoStudio.settings") || "null");
      if (!saved) return;
      if ([...elements.preset.options].some((option) => option.value === saved.preset)) elements.preset.value = saved.preset;
      if (saved.fit) {
        const fit = document.querySelector(`input[name="fit"][value="${saved.fit}"]`);
        if (fit) fit.checked = true;
      }
      if (/^#[0-9a-f]{6}$/i.test(saved.background)) elements.background.value = saved.background;
      if (Number.isFinite(saved.margin)) elements.margin.value = String(saved.margin);
      if (typeof saved.storeName === "string") elements.storeName.value = saved.storeName;
      if (typeof saved.showPrice === "boolean") elements.showPrice.checked = saved.showPrice;
      if (typeof saved.priceText === "string") elements.priceText.value = saved.priceText;
      if (/^#[0-9a-f]{6}$/i.test(saved.badgeColor)) elements.badgeColor.value = saved.badgeColor;
      if (["jpeg", "png"].includes(saved.format)) elements.format.value = saved.format;
      if (Number.isFinite(saved.quality)) elements.quality.value = String(Math.round(saved.quality * 100));
    } catch (_) { /* Ignore invalid saved preferences. */ }
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
    ctx.beginPath();
    ctx.moveTo(x + r, y); ctx.lineTo(x + width - r, y); ctx.quadraticCurveTo(x + width, y, x + width, y + r);
    ctx.lineTo(x + width, y + height - r); ctx.quadraticCurveTo(x + width, y + height, x + width - r, y + height);
    ctx.lineTo(x + r, y + height); ctx.quadraticCurveTo(x, y + height, x, y + height - r);
    ctx.lineTo(x, y + r); ctx.quadraticCurveTo(x, y, x + r, y); ctx.closePath();
  }

  async function drawOutput(item, options, preview = false) {
    const previewScale = preview ? Math.min(1, 720 / Math.max(options.width, options.height)) : 1;
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(options.width * previewScale));
    canvas.height = Math.max(1, Math.round(options.height * previewScale));
    const ctx = canvas.getContext("2d", { alpha: false });
    const scale = canvas.width / options.width;
    const photo = await loadImage(item.url);
    const pad = options.width * (options.margin / 100) * scale;
    const areaX = pad, areaY = pad, areaW = canvas.width - pad * 2, areaH = canvas.height - pad * 2;
    ctx.fillStyle = options.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    const containScale = Math.min(areaW / photo.naturalWidth, areaH / photo.naturalHeight);
    const coverScale = Math.max(areaW / photo.naturalWidth, areaH / photo.naturalHeight);
    const photoScale = options.fit === "cover" ? coverScale : containScale;
    const drawW = photo.naturalWidth * photoScale, drawH = photo.naturalHeight * photoScale;
    const drawX = areaX + (areaW - drawW) / 2, drawY = areaY + (areaH - drawH) / 2;
    ctx.save();
    if (options.fit === "cover") { ctx.beginPath(); ctx.rect(areaX, areaY, areaW, areaH); ctx.clip(); }
    ctx.drawImage(photo, drawX, drawY, drawW, drawH);
    ctx.restore();

    if (options.showPrice && options.priceText) {
      const fontSize = Math.max(15, Math.round(options.width * .038 * scale));
      const gap = Math.round(options.width * .025 * scale);
      const paddingX = Math.round(fontSize * .68), badgeHeight = Math.round(fontSize * 1.75);
      ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
      const badgeWidth = Math.ceil(ctx.measureText(options.priceText).width + paddingX * 2);
      roundRect(ctx, gap, gap, badgeWidth, badgeHeight, badgeHeight * .28);
      ctx.fillStyle = options.badgeColor; ctx.fill();
      ctx.strokeStyle = "rgba(20,20,20,.65)"; ctx.lineWidth = Math.max(1, scale * 2); ctx.stroke();
      ctx.fillStyle = "#171717"; ctx.textAlign = "center"; ctx.textBaseline = "middle";
      ctx.fillText(options.priceText, gap + badgeWidth / 2, gap + badgeHeight / 2 + fontSize * .03);
    }

    if (options.storeName) {
      const fontSize = Math.max(12, Math.round(options.width * .022 * scale));
      const gap = Math.round(options.width * .026 * scale);
      ctx.font = `800 ${fontSize}px Inter, Arial, sans-serif`;
      ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      const label = options.storeName.toUpperCase();
      const labelWidth = ctx.measureText(label).width;
      roundRect(ctx, gap, canvas.height - gap - fontSize * 2.15, labelWidth + fontSize * 1.35, fontSize * 2.15, fontSize * .45);
      ctx.fillStyle = "rgba(255,255,255,.88)"; ctx.fill();
      ctx.fillStyle = "#171717"; ctx.fillText(label, gap + fontSize * .68, canvas.height - gap - fontSize * .62);
    }

    if (state.logoUrl) {
      try {
        const logo = await loadImage(state.logoUrl);
        const maxW = canvas.width * .2, maxH = canvas.height * .11;
        const logoScale = Math.min(maxW / logo.naturalWidth, maxH / logo.naturalHeight, 1);
        const logoW = logo.naturalWidth * logoScale, logoH = logo.naturalHeight * logoScale;
        const gap = Math.round(options.width * .026 * scale);
        const boxPad = Math.max(5, Math.round(options.width * .008 * scale));
        const x = canvas.width - gap - logoW - boxPad * 2, y = canvas.height - gap - logoH - boxPad * 2;
        roundRect(ctx, x, y, logoW + boxPad * 2, logoH + boxPad * 2, boxPad);
        ctx.fillStyle = "rgba(255,255,255,.9)"; ctx.fill();
        ctx.drawImage(logo, x + boxPad, y + boxPad, logoW, logoH);
      } catch (_) { /* A failed logo never blocks the product image. */ }
    }
    return canvas;
  }

  function canvasToBlob(canvas, options) {
    const mime = options.format === "png" ? "image/png" : "image/jpeg";
    return new Promise((resolve, reject) => canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("The image could not be exported.")), mime, options.quality));
  }

  let renderTimer;
  function schedulePreview() {
    syncLabels(); saveSettings();
    clearTimeout(renderTimer);
    renderTimer = setTimeout(renderPreview, 130);
  }

  async function renderPreview() {
    const item = state.items.find((candidate) => candidate.id === state.activeId) || state.items[0];
    if (!item) {
      elements.previewPlaceholder.hidden = false; elements.previewImage.hidden = true;
      elements.previewName.textContent = "Add a photo to begin"; return;
    }
    const token = ++state.renderToken;
    elements.rendering.hidden = false;
    try {
      const options = readOptions();
      const canvas = await drawOutput(item, options, true);
      const blob = await canvasToBlob(canvas, { ...options, format: "jpeg", quality: .88 });
      if (token !== state.renderToken) return;
      if (state.previewUrl) URL.revokeObjectURL(state.previewUrl);
      state.previewUrl = URL.createObjectURL(blob);
      elements.previewImage.src = state.previewUrl;
      elements.previewImage.hidden = false; elements.previewPlaceholder.hidden = true;
      elements.previewName.textContent = item.name;
    } catch (error) {
      if (token === state.renderToken) setStatus(error.message || "Preview failed.", "error");
    } finally { if (token === state.renderToken) elements.rendering.hidden = true; }
  }

  function renderQueue() {
    elements.photoCount.textContent = String(state.items.length);
    elements.clearAll.disabled = state.items.length === 0 || state.exporting;
    elements.exportBatch.disabled = state.items.length === 0 || state.exporting;
    elements.queueList.replaceChildren();
    if (!state.items.length) {
      const empty = document.createElement("p"); empty.className = "empty-queue"; empty.textContent = "Your batch is empty."; elements.queueList.append(empty); return;
    }
    state.items.forEach((item) => {
      const row = document.createElement("div"); row.className = `queue-item${item.id === state.activeId ? " active" : ""}`; row.tabIndex = 0;
      const thumb = document.createElement("img"); thumb.className = "queue-thumb"; thumb.src = item.url; thumb.alt = "";
      const meta = document.createElement("div"); meta.className = "queue-meta";
      const name = document.createElement("strong"); name.textContent = item.name;
      const size = document.createElement("span"); size.textContent = `${item.width} × ${item.height}`; meta.append(name, size);
      const remove = document.createElement("button"); remove.className = "remove-photo"; remove.type = "button"; remove.textContent = "×"; remove.setAttribute("aria-label", `Remove ${item.name}`);
      remove.addEventListener("click", (event) => { event.stopPropagation(); removeItem(item.id); });
      const activate = () => { state.activeId = item.id; renderQueue(); renderPreview(); };
      row.addEventListener("click", activate); row.addEventListener("keydown", (event) => { if (event.key === "Enter" || event.key === " ") activate(); });
      row.append(thumb, meta, remove); elements.queueList.append(row);
    });
  }

  async function addFiles(fileList) {
    if (state.exporting) return;
    const files = [...fileList];
    let rejected = 0, tooLarge = 0, added = 0;
    for (const file of files) {
      if (state.items.length >= limit) break;
      if (!acceptedTypes.has(file.type)) { rejected += 1; continue; }
      if (file.size > 25 * 1024 * 1024) { tooLarge += 1; continue; }
      const url = URL.createObjectURL(file);
      try {
        const image = await loadImage(url);
        const item = { id: `${Date.now()}-${Math.random().toString(36).slice(2)}`, file, url, name: file.name, width: image.naturalWidth, height: image.naturalHeight };
        state.items.push(item); added += 1; if (!state.activeId) state.activeId = item.id;
      } catch (_) { URL.revokeObjectURL(url); rejected += 1; }
    }
    elements.photoInput.value = "";
    renderQueue(); schedulePreview();
    if (files.length + state.items.length - added > limit || state.items.length >= limit && files.length > added) setStatus(`This ${mode === "demo" ? "demo" : "edition"} accepts ${limit} photos per batch.`, "error");
    else if (rejected || tooLarge) setStatus(`${added} added. ${rejected + tooLarge} skipped because of format or file size.`, "error");
    else setStatus(`${added} photo${added === 1 ? "" : "s"} ready to style.`);
  }

  function removeItem(id) {
    const index = state.items.findIndex((item) => item.id === id); if (index < 0) return;
    URL.revokeObjectURL(state.items[index].url); state.items.splice(index, 1);
    if (state.activeId === id) state.activeId = state.items[0]?.id || null;
    renderQueue(); renderPreview(); setStatus(state.items.length ? `${state.items.length} photo${state.items.length === 1 ? "" : "s"} in this batch.` : "Add photos to create your first batch.");
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
      lv.setUint32(0, 0x04034b50, true); lv.setUint16(4, 20, true); lv.setUint16(6, 0x0800, true); lv.setUint16(8, 0, true); lv.setUint16(10, stamp.time, true); lv.setUint16(12, stamp.date, true); lv.setUint32(14, crc, true); lv.setUint32(18, bytes.length, true); lv.setUint32(22, bytes.length, true); lv.setUint16(26, name.length, true); local.set(name, 30);
      localChunks.push(local, bytes);
      const central = new Uint8Array(46 + name.length), cv = new DataView(central.buffer);
      cv.setUint32(0, 0x02014b50, true); cv.setUint16(4, 20, true); cv.setUint16(6, 20, true); cv.setUint16(8, 0x0800, true); cv.setUint16(10, 0, true); cv.setUint16(12, stamp.time, true); cv.setUint16(14, stamp.date, true); cv.setUint32(16, crc, true); cv.setUint32(20, bytes.length, true); cv.setUint32(24, bytes.length, true); cv.setUint16(28, name.length, true); cv.setUint32(42, offset, true); central.set(name, 46); centralChunks.push(central);
      offset += local.length + bytes.length;
    });
    const central = concat(centralChunks), end = new Uint8Array(22), ev = new DataView(end.buffer);
    ev.setUint32(0, 0x06054b50, true); ev.setUint16(8, entries.length, true); ev.setUint16(10, entries.length, true); ev.setUint32(12, central.length, true); ev.setUint32(16, offset, true);
    return new Blob([...localChunks, central, end], { type: "application/zip" });
  }

  function safeBaseName(name, index) {
    const base = name.replace(/\.[^.]+$/, "").normalize("NFKD").replace(/[^a-z0-9_-]+/gi, "-").replace(/^-+|-+$/g, "").slice(0, 55);
    return base || `product-${index + 1}`;
  }

  async function exportBatch() {
    if (!state.items.length || state.exporting) return;
    state.exporting = true; renderQueue(); elements.progressTrack.hidden = false; elements.progressBar.style.width = "0%";
    const options = readOptions(), entries = [], usedNames = new Set();
    try {
      for (let index = 0; index < state.items.length; index += 1) {
        const item = state.items[index]; setStatus(`Formatting ${index + 1} of ${state.items.length}: ${item.name}`);
        const canvas = await drawOutput(item, options, false), blob = await canvasToBlob(canvas, options);
        let base = `${safeBaseName(item.name, index)}-${options.width}x${options.height}`, suffix = 2;
        while (usedNames.has(base)) base = `${safeBaseName(item.name, index)}-${options.width}x${options.height}-${suffix++}`;
        usedNames.add(base); entries.push({ name: `${base}.${options.format === "png" ? "png" : "jpg"}`, bytes: new Uint8Array(await blob.arrayBuffer()) });
        elements.progressBar.style.width = `${Math.round(((index + 1) / state.items.length) * 92)}%`;
      }
      setStatus("Packing your ZIP…"); const zip = createZip(entries); elements.progressBar.style.width = "100%";
      const url = URL.createObjectURL(zip), link = document.createElement("a"); link.href = url; link.download = `SellerPhotoStudio-${new Date().toISOString().slice(0, 10)}.zip`; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
      setStatus(`${entries.length} finished photo${entries.length === 1 ? "" : "s"} downloaded.`, "success");
    } catch (error) { setStatus(error.message || "The batch could not be exported.", "error"); }
    finally { state.exporting = false; renderQueue(); setTimeout(() => { elements.progressTrack.hidden = true; elements.progressBar.style.width = "0%"; }, 1100); }
  }

  settingsInputs.forEach((input) => { input.addEventListener("input", schedulePreview); input.addEventListener("change", schedulePreview); });
  document.querySelectorAll('input[name="fit"]').forEach((input) => input.addEventListener("change", schedulePreview));
  elements.photoInput.addEventListener("change", () => addFiles(elements.photoInput.files));
  ["dragenter", "dragover"].forEach((name) => elements.dropZone.addEventListener(name, (event) => { event.preventDefault(); elements.dropZone.classList.add("drag-over"); }));
  ["dragleave", "drop"].forEach((name) => elements.dropZone.addEventListener(name, (event) => { event.preventDefault(); elements.dropZone.classList.remove("drag-over"); }));
  elements.dropZone.addEventListener("drop", (event) => addFiles(event.dataTransfer.files));
  elements.clearAll.addEventListener("click", clearItems); elements.exportBatch.addEventListener("click", exportBatch);
  elements.logoInput.addEventListener("change", async () => {
    const file = elements.logoInput.files?.[0]; if (!file || !acceptedTypes.has(file.type)) return setStatus("Choose a PNG, JPG, or WebP logo.", "error");
    if (state.logoUrl) URL.revokeObjectURL(state.logoUrl); state.logoUrl = URL.createObjectURL(file); elements.logoLabel.textContent = file.name; elements.removeLogo.hidden = false; schedulePreview();
  });
  elements.removeLogo.addEventListener("click", () => { if (state.logoUrl) URL.revokeObjectURL(state.logoUrl); state.logoUrl = null; elements.logoInput.value = ""; elements.logoLabel.textContent = "Choose PNG or JPG"; elements.removeLogo.hidden = true; schedulePreview(); });
  window.addEventListener("beforeunload", () => { state.items.forEach((item) => URL.revokeObjectURL(item.url)); if (state.logoUrl) URL.revokeObjectURL(state.logoUrl); if (state.previewUrl) URL.revokeObjectURL(state.previewUrl); });

  restoreSettings(); syncLabels(); renderQueue();
})();
