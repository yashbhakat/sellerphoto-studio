(() => {
  "use strict";

  const $ = (id) => document.getElementById(id);
  const inputIds = [
    "forecastProductName", "forecastChannel", "forecastMonths", "baseUnits", "launchGrowth", "rampMonths", "matureGrowth",
    "declineStart", "declineRate", "useDecline", "useSeasonality", "seasonality", "peakMonth", "sellingPrice", "productCost",
    "fulfilmentCost", "packagingCost", "priceErosion", "costInflation", "platformFee", "adRate", "returnRate", "returnCost",
    "includeReturns", "launchCost", "monthlyOverhead", "taxRate", "inventoryWeeks", "targetProfit", "includeTax", "includeWorkingCapital"
  ];
  const e = {};
  inputIds.concat([
    "saveForecast", "resetForecast", "forecastTitle", "forecastHealth", "lifetimeRevenue", "lifetimeUnits", "lifetimeProfit",
    "netMargin", "breakEvenMonth", "breakEvenUnits", "forecastRoi", "initialCash", "peakSalesMonth", "peakUnits", "targetGap",
    "targetStatus", "forecastChart", "scenarioGrid", "forecastInsights", "unitEconomics", "sensitivityBody", "monthlyForecastBody",
    "exportForecastCsv", "printForecast"
  ]).forEach((id) => { e[id] = $(id); });
  if (!e.forecastChart) return;

  const channelPresets = {
    marketplace: { platformFee: 15, adRate: 8, returnRate: 8, fulfilmentCost: 65, packagingCost: 15, monthlyOverhead: 15000, inventoryWeeks: 8 },
    quickcommerce: { platformFee: 22, adRate: 5, returnRate: 3, fulfilmentCost: 35, packagingCost: 10, monthlyOverhead: 18000, inventoryWeeks: 4 },
    d2c: { platformFee: 3, adRate: 18, returnRate: 10, fulfilmentCost: 85, packagingCost: 25, monthlyOverhead: 20000, inventoryWeeks: 6 }
  };
  const scenarioDefinitions = {
    conservative: { label: "Conservative", demand: .75, price: .96, cost: 1.08, ads: 1.2 },
    base: { label: "Base", demand: 1, price: 1, cost: 1, ads: 1 },
    aggressive: { label: "Aggressive", demand: 1.25, price: 1.03, cost: .97, ads: .9 }
  };
  let lastBase = null;

  function number(id, min, max) {
    const value = Number(e[id].value);
    return Math.min(max === undefined ? Number.POSITIVE_INFINITY : max, Math.max(min === undefined ? Number.NEGATIVE_INFINITY : min, Number.isFinite(value) ? value : 0));
  }
  function money(value, compact) {
    const options = compact && Math.abs(value) >= 100000 ? { notation: "compact", maximumFractionDigits: 1 } : { maximumFractionDigits: 0 };
    return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", ...options }).format(value || 0);
  }
  function integer(value) { return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(value || 0); }
  function percent(value, digits) { return (Number.isFinite(value) ? value : 0).toFixed(digits === undefined ? 1 : digits) + "%"; }
  function readAssumptions() {
    return {
      name: e.forecastProductName.value.trim() || "Unnamed product", channel: e.forecastChannel.value,
      months: number("forecastMonths", 12, 60), baseUnits: number("baseUnits", 0), launchGrowth: number("launchGrowth", -90, 300) / 100,
      rampMonths: number("rampMonths", 1, 24), matureGrowth: number("matureGrowth", -90, 100) / 100,
      declineStart: number("declineStart", 2, 60), declineRate: number("declineRate", 0, 50) / 100,
      useDecline: e.useDecline.checked, useSeasonality: e.useSeasonality.checked, seasonality: number("seasonality", 0, 60) / 100,
      peakMonth: number("peakMonth", 1, 12), sellingPrice: number("sellingPrice", 0), productCost: number("productCost", 0),
      fulfilmentCost: number("fulfilmentCost", 0), packagingCost: number("packagingCost", 0),
      priceErosion: number("priceErosion", 0, 50) / 100, costInflation: number("costInflation", 0, 50) / 100,
      platformFee: number("platformFee", 0, 90) / 100, adRate: number("adRate", 0, 90) / 100,
      returnRate: number("returnRate", 0, 90) / 100, returnCost: number("returnCost", 0), includeReturns: e.includeReturns.checked,
      launchCost: number("launchCost", 0), monthlyOverhead: number("monthlyOverhead", 0), taxRate: number("taxRate", 0, 60) / 100,
      inventoryWeeks: number("inventoryWeeks", 0, 52), targetProfit: number("targetProfit", 0),
      includeTax: e.includeTax.checked, includeWorkingCapital: e.includeWorkingCapital.checked
    };
  }
  function simulate(assumptions, factors) {
    const scenario = factors || scenarioDefinitions.base, rows = [];
    const initialInventory = assumptions.includeWorkingCapital ? assumptions.baseUnits * scenario.demand * assumptions.inventoryWeeks / 4.345 * assumptions.productCost * scenario.cost : 0;
    const initialCash = assumptions.launchCost + initialInventory;
    let cumulativeCash = -initialCash, totalRevenue = 0, totalProfitBeforeLaunch = 0, totalGrossUnits = 0, totalNetUnits = 0;
    const start = new Date(); start.setDate(1);
    for (let index = 0; index < assumptions.months; index += 1) {
      const month = index + 1, date = new Date(start.getFullYear(), start.getMonth() + index, 1);
      let demand;
      if (month === 1) demand = assumptions.baseUnits;
      else {
        const prior = rows[index - 1].baselineUnits;
        if (month <= assumptions.rampMonths) demand = prior * (1 + assumptions.launchGrowth);
        else if (assumptions.useDecline && month >= assumptions.declineStart) demand = prior * (1 - assumptions.declineRate);
        else demand = prior * (1 + assumptions.matureGrowth);
      }
      const baselineUnits = Math.max(0, demand);
      let seasonalFactor = 1;
      if (assumptions.useSeasonality) {
        const calendarMonth = date.getMonth() + 1, distance = ((calendarMonth - assumptions.peakMonth + 18) % 12) - 6;
        seasonalFactor = Math.max(.4, 1 + assumptions.seasonality * Math.cos(distance / 6 * Math.PI));
      }
      const grossUnits = Math.max(0, baselineUnits * seasonalFactor * scenario.demand);
      const returnUnits = assumptions.includeReturns ? grossUnits * assumptions.returnRate : 0, netUnits = Math.max(0, grossUnits - returnUnits);
      const years = index / 12, price = assumptions.sellingPrice * scenario.price * Math.pow(1 - assumptions.priceErosion, years);
      const inflation = scenario.cost * Math.pow(1 + assumptions.costInflation, years);
      const productCost = assumptions.productCost * inflation, fulfilment = assumptions.fulfilmentCost * inflation, packaging = assumptions.packagingCost * inflation;
      const revenue = netUnits * price, costOfGoods = grossUnits * productCost, fulfilmentTotal = grossUnits * (fulfilment + packaging);
      const platformCost = revenue * assumptions.platformFee, adCost = revenue * assumptions.adRate * scenario.ads, returnsCost = returnUnits * assumptions.returnCost;
      const variableCost = costOfGoods + fulfilmentTotal + platformCost + adCost + returnsCost;
      const operatingProfit = revenue - variableCost - assumptions.monthlyOverhead;
      const tax = assumptions.includeTax ? Math.max(0, operatingProfit) * assumptions.taxRate : 0;
      const netProfit = operatingProfit - tax;
      let cashFlow = netProfit;
      if (index === assumptions.months - 1 && assumptions.includeWorkingCapital) cashFlow += initialInventory;
      cumulativeCash += cashFlow; totalRevenue += revenue; totalProfitBeforeLaunch += netProfit; totalGrossUnits += grossUnits; totalNetUnits += netUnits;
      rows.push({
        month: month, date: date, label: date.toLocaleDateString("en-IN", { month: "short", year: "numeric" }),
        baselineUnits: baselineUnits, grossUnits: grossUnits, returnUnits: returnUnits, netUnits: netUnits, price: price,
        revenue: revenue, variableCost: variableCost, operatingProfit: operatingProfit, tax: tax, netProfit: netProfit,
        cashFlow: cashFlow, cumulativeCash: cumulativeCash, contributionPerGrossUnit: grossUnits ? (revenue - variableCost) / grossUnits : 0
      });
    }
    const lifetimeProfit = totalProfitBeforeLaunch - assumptions.launchCost;
    const peak = rows.reduce((best, row) => !best || row.revenue > best.revenue ? row : best, null);
    const breakEven = rows.find((row) => row.cumulativeCash >= 0);
    const first = rows[0] || { contributionPerGrossUnit: 0 };
    const operatingBreakEvenUnits = first.contributionPerGrossUnit > 0 ? assumptions.monthlyOverhead / first.contributionPerGrossUnit : 0;
    return {
      assumptions: assumptions, rows: rows, totalRevenue: totalRevenue, lifetimeProfit: lifetimeProfit,
      totalGrossUnits: totalGrossUnits, totalNetUnits: totalNetUnits, initialInventory: initialInventory, initialCash: initialCash,
      roi: initialCash > 0 ? lifetimeProfit / initialCash * 100 : 0, netMargin: totalRevenue > 0 ? lifetimeProfit / totalRevenue * 100 : 0,
      peak: peak, breakEven: breakEven, operatingBreakEvenUnits: operatingBreakEvenUnits
    };
  }
  function health(result) {
    if (result.lifetimeProfit <= 0) return { label: "Economics need revision", className: "risk" };
    if (!result.breakEven) return { label: "No cash breakeven in horizon", className: "watch" };
    if (result.netMargin < 8) return { label: "Thin profit buffer", className: "watch" };
    return { label: "Positive base-case signal", className: "healthy" };
  }
  function renderKpis(result) {
    const assumptions = result.assumptions, status = health(result), targetGap = result.lifetimeProfit - assumptions.targetProfit;
    e.forecastTitle.textContent = assumptions.name; e.forecastHealth.textContent = status.label; e.forecastHealth.className = "scenario-health " + status.className;
    e.lifetimeRevenue.textContent = money(result.totalRevenue, true); e.lifetimeUnits.textContent = integer(result.totalNetUnits) + " net units";
    e.lifetimeProfit.textContent = money(result.lifetimeProfit, true); e.netMargin.textContent = percent(result.netMargin) + " net margin after launch cost";
    e.breakEvenMonth.textContent = result.breakEven ? "Month " + result.breakEven.month : "Not reached";
    e.breakEvenUnits.textContent = integer(result.operatingBreakEvenUnits) + " gross units / month operating BE";
    e.forecastRoi.textContent = percent(result.roi); e.initialCash.textContent = money(result.initialCash) + " initial cash at risk";
    e.peakSalesMonth.textContent = result.peak ? result.peak.label : "—"; e.peakUnits.textContent = integer(result.peak ? result.peak.grossUnits : 0) + " gross units";
    e.targetGap.textContent = money(targetGap, true); e.targetStatus.textContent = assumptions.targetProfit ? (targetGap >= 0 ? "Above lifetime profit target" : "Below lifetime profit target") : "Set a target to track";
  }
  function drawChart(result) {
    const canvas = e.forecastChart, context = canvas.getContext("2d"), width = canvas.width, height = canvas.height;
    context.clearRect(0, 0, width, height); context.fillStyle = "#fbfaf6"; context.fillRect(0, 0, width, height);
    const pad = { left: 78, right: 28, top: 28, bottom: 56 }, plotW = width - pad.left - pad.right, plotH = height - pad.top - pad.bottom;
    const values = result.rows.flatMap((row) => [row.revenue, row.netProfit, 0]), min = Math.min(...values), max = Math.max(...values), range = Math.max(1, max - min);
    context.font = "22px Arial, sans-serif"; context.textAlign = "right"; context.textBaseline = "middle";
    for (let tick = 0; tick <= 4; tick += 1) {
      const value = min + range * (1 - tick / 4), y = pad.top + plotH * tick / 4;
      context.strokeStyle = "#ddd9ce"; context.lineWidth = 1; context.beginPath(); context.moveTo(pad.left, y); context.lineTo(width - pad.right, y); context.stroke();
      context.fillStyle = "#69675f"; context.fillText(money(value, true), pad.left - 12, y);
    }
    const xFor = (index) => pad.left + (result.rows.length === 1 ? 0 : index / (result.rows.length - 1) * plotW);
    const yFor = (value) => pad.top + (max - value) / range * plotH;
    function line(key, color, fill) {
      context.beginPath(); result.rows.forEach((row, index) => { const x = xFor(index), y = yFor(row[key]); if (!index) context.moveTo(x, y); else context.lineTo(x, y); });
      context.strokeStyle = color; context.lineWidth = 5; context.lineJoin = "round"; context.stroke();
      if (fill) { context.lineTo(xFor(result.rows.length - 1), yFor(0)); context.lineTo(xFor(0), yFor(0)); context.closePath(); context.fillStyle = fill; context.fill(); }
    }
    line("revenue", "#2867e8", "rgba(40,103,232,.08)"); line("netProfit", "#167a52");
    context.fillStyle = "#69675f"; context.textAlign = "center"; context.textBaseline = "top";
    const step = Math.max(1, Math.ceil(result.rows.length / 6));
    result.rows.forEach((row, index) => { if (index % step === 0 || index === result.rows.length - 1) context.fillText(row.label, xFor(index), height - pad.bottom + 16); });
  }
  function renderScenarios(assumptions) {
    e.scenarioGrid.replaceChildren();
    Object.keys(scenarioDefinitions).forEach((key) => {
      const result = simulate(assumptions, scenarioDefinitions[key]), card = document.createElement("article"); card.className = "scenario-card " + key;
      const label = document.createElement("span"); label.textContent = scenarioDefinitions[key].label;
      const profit = document.createElement("strong"); profit.textContent = money(result.lifetimeProfit, true);
      const meta = document.createElement("small"); meta.textContent = money(result.totalRevenue, true) + " revenue · " + percent(result.netMargin) + " margin";
      card.append(label, profit, meta); e.scenarioGrid.append(card);
    });
  }
  function renderInsights(result) {
    const assumptions = result.assumptions, first = result.rows[0], insights = [];
    if (first.contributionPerGrossUnit <= 0) insights.push("Each launch-month sale loses money before fixed overhead. Raise price or reduce variable costs.");
    else insights.push("Launch-month contribution is " + money(first.contributionPerGrossUnit) + " per gross unit before fixed overhead.");
    if (!result.breakEven) insights.push("Cash does not recover within " + assumptions.months + " months in the base case; reduce launch cash or strengthen demand.");
    else insights.push("Base-case cumulative cash turns positive in month " + result.breakEven.month + " (" + result.breakEven.label + ").");
    if (assumptions.includeReturns && assumptions.returnRate >= .1) insights.push("Returns consume a material share of demand. Test imagery, product copy and packaging before scaling ads.");
    else insights.push("The return / wastage assumption is " + percent(assumptions.returnRate * 100) + "; compare it with actual category history.");
    if (result.netMargin < 8) insights.push("The model has limited downside protection. Review the sensitivity grid before committing inventory.");
    else insights.push("The base case retains a " + percent(result.netMargin) + " lifetime net margin after launch cost.");
    const targetGap = result.lifetimeProfit - assumptions.targetProfit;
    if (assumptions.targetProfit) insights.push(targetGap >= 0 ? "The base case exceeds the lifetime profit target by " + money(targetGap) + "." : "The base case misses the lifetime profit target by " + money(Math.abs(targetGap)) + ".");
    e.forecastInsights.replaceChildren();
    insights.forEach((text) => { const li = document.createElement("li"); li.textContent = text; e.forecastInsights.append(li); });
    const unitRows = [
      ["Launch selling price", money(first.price)], ["Net revenue / gross unit", money(first.grossUnits ? first.revenue / first.grossUnits : 0)],
      ["Variable cost / gross unit", money(first.grossUnits ? first.variableCost / first.grossUnits : 0)], ["Contribution / gross unit", money(first.contributionPerGrossUnit)],
      ["Operating breakeven", integer(result.operatingBreakEvenUnits) + " units / month"], ["Opening inventory cash", money(result.initialInventory)]
    ];
    e.unitEconomics.replaceChildren();
    unitRows.forEach((row) => { const dt = document.createElement("dt"); dt.textContent = row[0]; const dd = document.createElement("dd"); dd.textContent = row[1]; e.unitEconomics.append(dt, dd); });
  }
  function renderSensitivity(assumptions) {
    e.sensitivityBody.replaceChildren();
    [.9, 1, 1.1].forEach((demand) => {
      const tr = document.createElement("tr"), th = document.createElement("th"); th.textContent = demand === 1 ? "Base demand" : (demand < 1 ? "−10% demand" : "+10% demand"); tr.append(th);
      [.9, 1, 1.1].forEach((price) => {
        const result = simulate(assumptions, { demand: demand, price: price, cost: 1, ads: 1 }), td = document.createElement("td");
        td.textContent = money(result.lifetimeProfit, true); td.className = result.lifetimeProfit >= 0 ? "positive" : "negative"; tr.append(td);
      });
      e.sensitivityBody.append(tr);
    });
  }
  function renderMonthly(result) {
    e.monthlyForecastBody.replaceChildren();
    result.rows.forEach((row) => {
      const tr = document.createElement("tr");
      [row.label, integer(row.grossUnits), money(row.revenue), money(row.variableCost), money(row.netProfit), money(row.cumulativeCash)].forEach((value, index) => {
        const cell = document.createElement(index ? "td" : "th"); cell.textContent = value;
        if ((index === 4 && row.netProfit < 0) || (index === 5 && row.cumulativeCash < 0)) cell.className = "negative";
        tr.append(cell);
      });
      e.monthlyForecastBody.append(tr);
    });
  }
  function render() {
    const assumptions = readAssumptions(), result = simulate(assumptions, scenarioDefinitions.base); lastBase = result;
    renderKpis(result); drawChart(result); renderScenarios(assumptions); renderInsights(result); renderSensitivity(assumptions); renderMonthly(result);
  }
  let renderTimer;
  function scheduleRender() { clearTimeout(renderTimer); renderTimer = setTimeout(render, 80); }
  function saveForecast() {
    try {
      const values = {}; inputIds.forEach((id) => { const input = e[id]; values[id] = input.type === "checkbox" ? input.checked : input.value; });
      localStorage.setItem("sellerPhotoStudio.forecast.v11", JSON.stringify(values));
      e.saveForecast.textContent = "Saved"; setTimeout(() => { e.saveForecast.textContent = "Save assumptions"; }, 1400);
    } catch (_) { e.saveForecast.textContent = "Could not save"; }
  }
  function restoreForecast() {
    try {
      const values = JSON.parse(localStorage.getItem("sellerPhotoStudio.forecast.v11") || "null");
      if (!values) return;
      Object.keys(values).forEach((id) => { const input = e[id]; if (!input) return; if (input.type === "checkbox") input.checked = Boolean(values[id]); else input.value = values[id]; });
    } catch (_) {}
  }
  function applyChannelPreset() {
    const preset = channelPresets[e.forecastChannel.value] || channelPresets.marketplace;
    Object.keys(preset).forEach((id) => { e[id].value = String(preset[id]); }); render();
  }
  function exportCsv() {
    if (!lastBase) render();
    const assumptions = lastBase.assumptions;
    const rows = [
      ["SellerPhoto Studio lifecycle forecast"], ["Product", assumptions.name], ["Channel", assumptions.channel],
      ["Horizon months", assumptions.months], ["Lifetime revenue", lastBase.totalRevenue], ["Lifetime net profit after launch cost", lastBase.lifetimeProfit],
      ["Initial cash at risk", lastBase.initialCash], ["ROI percent", lastBase.roi], [],
      ["Month", "Gross units", "Return units", "Net units", "Selling price", "Net revenue", "Variable cost", "Operating profit", "Estimated tax", "Net profit", "Cumulative cash"]
    ];
    lastBase.rows.forEach((row) => rows.push([row.label, row.grossUnits, row.returnUnits, row.netUnits, row.price, row.revenue, row.variableCost, row.operatingProfit, row.tax, row.netProfit, row.cumulativeCash]));
    rows.push([], ["Planning model only. Results depend on assumptions and are not financial advice or a guarantee of sales."]);
    const csv = rows.map((row) => row.map((value) => '"' + String(value === undefined ? "" : value).replaceAll('"', '""') + '"').join(",")).join("\r\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" }), url = URL.createObjectURL(blob), link = document.createElement("a");
    link.href = url; link.download = "SellerPhoto-lifecycle-forecast-" + new Date().toISOString().slice(0, 10) + ".csv"; document.body.append(link); link.click(); link.remove(); setTimeout(() => URL.revokeObjectURL(url), 5000);
  }

  inputIds.forEach((id) => {
    e[id].addEventListener("input", scheduleRender); e[id].addEventListener("change", scheduleRender);
  });
  e.forecastChannel.addEventListener("change", applyChannelPreset);
  e.saveForecast.addEventListener("click", saveForecast); e.resetForecast.addEventListener("click", applyChannelPreset);
  e.exportForecastCsv.addEventListener("click", exportCsv); e.printForecast.addEventListener("click", () => window.print());
  window.addEventListener("resize", scheduleRender);
  window.addEventListener("sellerphoto:workspace", (event) => { if (event.detail === "forecastWorkspace") render(); });
  window.SellerPhotoForecast = { readAssumptions: readAssumptions, simulate: simulate, scenarios: scenarioDefinitions };
  restoreForecast(); render();
})();
