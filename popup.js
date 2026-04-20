const STORAGE_KEY = "pageSummaryAiSettings";
const DEBUG_STORAGE_KEY = "pageSummaryAiDebugLog";
const UI_STATE_STORAGE_KEY = "pageSummaryAiUiState";
const SUMMARY_CACHE_STORAGE_KEY = "pageSummaryAiSummaryCache";
const DEFAULT_SUMMARY_LIMIT = 60;
const MIN_SUMMARY_LIMIT = 60;
const MAX_SUMMARY_LIMIT = 150;
const SUMMARY_LIMIT_STEP = 10;
const PAGE_TEXT_LIMIT = 12000;
const MAX_DEBUG_ENTRIES = 40;
const MAX_SUMMARY_CACHE_ENTRIES = 10;
const REQUEST_TIMEOUT_MS = 30000;
const MIN_SUMMARY_TOLERANCE = 10;
const SUMMARY_OVERFLOW_GRACE = 18;
const HINT_AUTO_HIDE_MS = 3600;

const PRESETS = {
  openai: {
    label: "OpenAI",
    apiUrl: "https://api.openai.com/v1/chat/completions",
    model: "gpt-4.1-mini"
  },
  deepseek: {
    label: "DeepSeek",
    apiUrl: "https://api.deepseek.com/chat/completions",
    model: "deepseek-chat"
  },
  openrouter: {
    label: "OpenRouter",
    apiUrl: "https://openrouter.ai/api/v1/chat/completions",
    model: ""
  },
  siliconflow: {
    label: "SiliconFlow",
    apiUrl: "https://api.siliconflow.cn/v1/chat/completions",
    model: ""
  },
  ollama: {
    label: "Ollama",
    apiUrl: "http://127.0.0.1:11434/v1/chat/completions",
    model: "llama3.2"
  },
  custom: {
    label: "本地接口",
    apiUrl: "",
    model: ""
  }
};

const PRESET_THEMES = {
  openai: "openai",
  deepseek: "deepseek",
  openrouter: "openrouter",
  siliconflow: "siliconflow",
  ollama: "ollama",
  custom: "custom"
};

const SENTENCE_ENDING_SET = new Set(["。", "！", "？", "!", "?"]);
const CLAUSE_ENDING_SET = new Set(["，", ",", "、", "；", ";", "：", ":"]);
const SENTENCE_ENDING_PATTERN = /[。！？!?]$/;
const LOCALHOST_HOSTNAMES = new Set(["127.0.0.1", "localhost"]);

const elements = {
  app: document.querySelector(".app"),
  preset: document.querySelector("#preset"),
  apiUrl: document.querySelector("#apiUrl"),
  model: document.querySelector("#model"),
  apiKey: document.querySelector("#apiKey"),
  summaryLimit: document.querySelector("#summaryLimit"),
  summaryLimitValue: document.querySelector("#summaryLimitValue"),
  presetBadge: document.querySelector("#presetBadge"),
  modelBadge: document.querySelector("#modelBadge"),
  lengthBadge: document.querySelector("#lengthBadge"),
  configSummary: document.querySelector("#configSummary"),
  saveButton: document.querySelector("#saveButton"),
  summarizeButton: document.querySelector("#summarizeButton"),
  copySummaryButton: document.querySelector("#copySummaryButton"),
  toggleSettingsButton: document.querySelector("#toggleSettingsButton"),
  settingsPanel: document.querySelector("#settingsPanel"),
  settingsBody: document.querySelector("#settingsBody"),
  settingsChevron: document.querySelector("#settingsChevron"),
  toggleUtilityButton: document.querySelector("#toggleUtilityButton"),
  utilityWrap: document.querySelector("#utilityWrap"),
  utilityPanel: document.querySelector("#utilityPanel"),
  statusBar: document.querySelector("#statusBar"),
  summary: document.querySelector("#summary"),
  debugLog: document.querySelector("#debugLog"),
  copyLogsButton: document.querySelector("#copyLogsButton"),
  clearLogsButton: document.querySelector("#clearLogsButton")
};

let debugEntries = [];
let buttonFlashTimers = new WeakMap();
let statusTimer = 0;
let settingsState = createDefaultSettingsState();
let uiState = {
  settingsCollapsed: false,
  utilityOpen: false
};

init().catch((error) => {
  elements.app.classList.add("is-ready");
  void logDebug("INIT", "初始化失败", formatErrorForLog(error));
  setStatus(resolveErrorHint(error), "error");
});

async function init() {
  bindEvents();

  const [settings, logs, savedUiState, summaryCache, currentTab] = await Promise.all([
    loadSettings(),
    loadDebugLog(),
    loadUiState(),
    loadSummaryCache(),
    queryCurrentTab()
  ]);

  debugEntries = logs;
  uiState = resolveInitialUiState(settings, savedUiState);
  const cachedSummary = findCachedSummaryForUrl(summaryCache, currentTab?.url || "");

  hydrateForm(settings);
  renderSettingsSnapshot(settings);
  renderSummaryLimit(settings.summaryLimit);
  renderDebugLog();
  renderUiState();
  if (cachedSummary?.summary) {
    renderSummary(cachedSummary.summary);
  } else {
    renderCopySummaryState(false);
  }
  setStatus("");
  elements.app.classList.add("is-ready");

  if (cachedSummary?.summary) {
    await logDebug("CACHE", "已恢复最近摘要", {
      url: cachedSummary.url,
      updatedAt: cachedSummary.updatedAt
    });
  }

  await logDebug("INIT", "插件已加载", {
    preset: settings.preset,
    hasApiKey: Boolean(settings.apiKey),
    summaryLimit: settings.summaryLimit
  });
}

function bindEvents() {
  elements.preset.addEventListener("change", onPresetChange);
  elements.saveButton.addEventListener("click", onSave);
  elements.summarizeButton.addEventListener("click", onSummarize);
  elements.copySummaryButton.addEventListener("click", onCopySummary);
  elements.copyLogsButton.addEventListener("click", onCopyLogs);
  elements.clearLogsButton.addEventListener("click", onClearLogs);
  elements.toggleSettingsButton.addEventListener("click", onToggleSettings);
  elements.toggleUtilityButton.addEventListener("click", onToggleUtility);
  elements.summaryLimit.addEventListener("input", onSummaryLimitInput);

  [elements.apiUrl, elements.model, elements.apiKey].forEach((input) => {
    input.addEventListener("input", onFormInput);
  });

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeydown);
}

async function loadSettings() {
  const { [STORAGE_KEY]: saved } = await chrome.storage.local.get(STORAGE_KEY);
  settingsState = normalizeSettingsState(saved);
  return getActiveSettings(settingsState);
}

async function loadUiState() {
  const { [UI_STATE_STORAGE_KEY]: saved } = await chrome.storage.local.get(UI_STATE_STORAGE_KEY);
  return saved || {};
}

async function loadSummaryCache() {
  const { [SUMMARY_CACHE_STORAGE_KEY]: saved } = await chrome.storage.local.get(
    SUMMARY_CACHE_STORAGE_KEY
  );

  if (!Array.isArray(saved)) {
    return [];
  }

  return saved.filter((entry) => entry?.normalizedUrl && typeof entry.summary === "string");
}

function resolveInitialUiState(settings, savedUiState) {
  return {
    settingsCollapsed:
      typeof savedUiState.settingsCollapsed === "boolean"
        ? savedUiState.settingsCollapsed
        : hasUsableSettings(settings),
    utilityOpen: false
  };
}

function createDefaultSettingsState() {
  return {
    preset: "openai",
    summaryLimit: DEFAULT_SUMMARY_LIMIT,
    presets: Object.fromEntries(
      Object.keys(PRESETS).map((presetKey) => [presetKey, createDefaultPresetProfile(presetKey)])
    )
  };
}

function createDefaultPresetProfile(presetKey) {
  const preset = PRESETS[presetKey] || PRESETS.custom;
  return {
    apiUrl: preset.apiUrl,
    model: preset.model,
    apiKey: ""
  };
}

function normalizeSettingsState(saved) {
  const baseState = createDefaultSettingsState();
  const selectedPreset = saved?.preset && PRESETS[saved.preset] ? saved.preset : "openai";
  const profiles = { ...baseState.presets };

  if (saved?.presets && typeof saved.presets === "object") {
    Object.keys(PRESETS).forEach((presetKey) => {
      profiles[presetKey] = normalizePresetProfile(presetKey, saved.presets[presetKey]);
    });
  } else if (saved && typeof saved === "object") {
    profiles[selectedPreset] = normalizePresetProfile(selectedPreset, saved);
  }

  return {
    preset: selectedPreset,
    summaryLimit: normalizeSummaryLimit(saved?.summaryLimit),
    presets: profiles
  };
}

function normalizePresetProfile(presetKey, profile) {
  const defaults = createDefaultPresetProfile(presetKey);
  return {
    apiUrl: typeof profile?.apiUrl === "string" ? profile.apiUrl : defaults.apiUrl,
    model: typeof profile?.model === "string" ? profile.model : defaults.model,
    apiKey: typeof profile?.apiKey === "string" ? profile.apiKey : defaults.apiKey
  };
}

function getActiveSettings(state) {
  const resolvedState = normalizeSettingsState(state);
  const preset = resolvedState.preset;
  const profile = resolvedState.presets[preset];
  return {
    preset,
    apiUrl: profile.apiUrl,
    model: profile.model,
    apiKey: profile.apiKey,
    summaryLimit: resolvedState.summaryLimit
  };
}

function mergeSettingsIntoState(state, settings) {
  const resolvedState = normalizeSettingsState(state);
  return {
    preset: settings.preset,
    summaryLimit: normalizeSummaryLimit(settings.summaryLimit),
    presets: {
      ...resolvedState.presets,
      [settings.preset]: {
        apiUrl: settings.apiUrl,
        model: settings.model,
        apiKey: settings.apiKey
      }
    }
  };
}

async function persistSettingsState() {
  await chrome.storage.local.set({ [STORAGE_KEY]: settingsState });
}

function hydrateForm(settings) {
  elements.preset.value = settings.preset;
  elements.apiUrl.value = settings.apiUrl;
  elements.model.value = settings.model;
  elements.apiKey.value = settings.apiKey;
  elements.summaryLimit.value = String(settings.summaryLimit);
}

function renderSettingsSnapshot(settings) {
  const preset = PRESETS[settings.preset] || PRESETS.custom;
  const modelText = settings.model || "未设模型";
  elements.presetBadge.textContent = preset.label;
  elements.presetBadge.dataset.theme = PRESET_THEMES[settings.preset] || "custom";
  elements.modelBadge.textContent = modelText;
  elements.lengthBadge.textContent = `${settings.summaryLimit} 字`;
  elements.configSummary.textContent = `${preset.label} · ${modelText}`;
}

async function onPresetChange() {
  settingsState = mergeSettingsIntoState(settingsState, {
    preset: settingsState.preset,
    apiUrl: elements.apiUrl.value.trim(),
    model: elements.model.value.trim(),
    apiKey: elements.apiKey.value.trim(),
    summaryLimit: normalizeSummaryLimit(elements.summaryLimit.value)
  });
  settingsState.preset = PRESETS[elements.preset.value] ? elements.preset.value : "openai";

  const settings = getActiveSettings(settingsState);
  hydrateForm(settings);
  renderSettingsSnapshot(settings);
  renderSummaryLimit(settings.summaryLimit);
}

function onFormInput() {
  renderSettingsSnapshot(readDraftSettingsFromForm());
}

function onSummaryLimitInput() {
  const settings = readDraftSettingsFromForm();
  renderSummaryLimit(settings.summaryLimit);
  renderSettingsSnapshot(settings);
}

function renderSummaryLimit(limit) {
  elements.summaryLimitValue.textContent = `${normalizeSummaryLimit(limit)} 字`;
}

async function onSave() {
  try {
    const settings = await saveSettings();
    renderSettingsSnapshot(settings);
    collapseSettingsPanel();
    flashButtonLabel(elements.saveButton, "已保存");
    setStatus("配置已保存。", "success");
  } catch (error) {
    void logDebug("SAVE", "保存配置失败", formatErrorForLog(error));
    handleInputError(error);
  }
}

async function onSummarize() {
  let settings;

  try {
    settings = readSettingsFromForm({ requireApiKey: true });
  } catch (error) {
    handleInputError(error);
    return;
  }

  setBusy(true);
  resetSummaryState("正在整理当前网页内容。");

  try {
    settingsState = mergeSettingsIntoState(settingsState, settings);
    renderSettingsSnapshot(settings);
    await logDebug("REQUEST", "开始总结", {
      preset: settings.preset,
      apiUrl: settings.apiUrl,
      model: settings.model,
      hasApiKey: Boolean(settings.apiKey),
      summaryLimit: settings.summaryLimit
    });

    await ensureApiPermission(settings.apiUrl);

    setStatus("正在读取网页内容…", "progress");
    const pageData = await extractCurrentPage();

    setStatus("正在生成摘要…", "progress");
    const summary = await requestSummary(settings, pageData);
    renderSummary(summary);
    try {
      await persistSummaryEntry(pageData, summary);
    } catch (cacheError) {
      void logDebug("CACHE", "缓存摘要失败", formatErrorForLog(cacheError));
    }
    setStatus("");
  } catch (error) {
    resetSummaryState("本次请求失败。");
    void logDebug("REQUEST", "总结失败", formatErrorForLog(error));
    setStatus(resolveErrorHint(error), "error");
  } finally {
    setBusy(false);
  }
}

function readDraftSettingsFromForm() {
  return {
    preset: elements.preset.value,
    apiUrl: elements.apiUrl.value.trim(),
    model: elements.model.value.trim(),
    apiKey: elements.apiKey.value.trim(),
    summaryLimit: normalizeSummaryLimit(elements.summaryLimit.value)
  };
}

function readSettingsFromForm(options = {}) {
  const { requireApiKey = false } = options;
  const settings = readDraftSettingsFromForm();

  if (!settings.apiUrl) {
    throw createUiError("missing_api_url", "请先填写 API URL。", {
      field: elements.apiUrl
    });
  }

  if (!settings.model) {
    throw createUiError("missing_model", "请先填写 Model ID。", {
      field: elements.model
    });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(settings.apiUrl);
  } catch {
    throw createUiError("invalid_api_url", "API URL 格式不对。", {
      field: elements.apiUrl
    });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw createUiError("invalid_api_protocol", "API URL 只支持 HTTP 或 HTTPS。", {
      field: elements.apiUrl
    });
  }

  if (parsedUrl.protocol === "http:" && !isLocalhostUrl(parsedUrl)) {
    throw createUiError("remote_http_not_allowed", "远程模型接口必须使用 HTTPS。", {
      field: elements.apiUrl
    });
  }

  if (requireApiKey && !isLocalhostUrl(parsedUrl) && !settings.apiKey) {
    throw createUiError("missing_api_key", "请先填写 API Key。", {
      field: elements.apiKey
    });
  }

  return settings;
}

function hasUsableSettings(settings) {
  if (!settings.apiUrl || !settings.model) {
    return false;
  }

  try {
    const parsedUrl = new URL(settings.apiUrl);
    return isAllowedApiUrl(parsedUrl) && (Boolean(settings.apiKey) || isLocalhostUrl(parsedUrl));
  } catch {
    return false;
  }
}

async function saveSettings() {
  const settings = readSettingsFromForm();
  settingsState = mergeSettingsIntoState(settingsState, settings);
  await persistSettingsState();
  void logDebug("SAVE", "手动保存成功", {
    preset: settings.preset,
    apiUrl: settings.apiUrl,
    model: settings.model,
    hasApiKey: Boolean(settings.apiKey),
    summaryLimit: settings.summaryLimit
  }).catch(() => {});
  return settings;
}

async function ensureApiPermission(apiUrl) {
  const origin = `${new URL(apiUrl).origin}/*`;
  const permissionRequest = { origins: [origin] };
  const alreadyGranted = await chrome.permissions.contains(permissionRequest);

  if (alreadyGranted) {
    await logDebug("PERMISSION", "网络权限已存在", { origin });
    return;
  }

  const granted = await chrome.permissions.request(permissionRequest);
  if (!granted) {
    throw createUiError("permission_denied", "没有拿到接口访问权限。", { origin });
  }

  await logDebug("PERMISSION", "已授予网络权限", { origin });
}

async function queryCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

async function extractCurrentPage() {
  const tab = await queryCurrentTab();

  if (!tab?.id) {
    throw createUiError("missing_tab", "没有找到当前标签页。");
  }

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: collectPageContext,
    args: [PAGE_TEXT_LIMIT]
  });

  if (!result?.text) {
    throw createUiError("empty_page_text", "当前页面暂时读不到可总结内容。");
  }

  await logDebug("PAGE", "页面内容已提取", {
    title: result.title,
    usedSelection: result.usedSelection,
    textLength: [...result.text].length
  });

  return result;
}

async function persistSummaryEntry(pageData, summary) {
  const normalizedUrl = normalizePageUrl(pageData.url);

  if (!normalizedUrl || !summary) {
    return;
  }

  const existingCache = await loadSummaryCache();
  const nextEntry = {
    url: pageData.url,
    normalizedUrl,
    title: pageData.title || "",
    summary,
    updatedAt: Date.now()
  };
  const nextCache = [
    nextEntry,
    ...existingCache.filter((entry) => entry.normalizedUrl !== normalizedUrl)
  ].slice(0, MAX_SUMMARY_CACHE_ENTRIES);

  await chrome.storage.local.set({ [SUMMARY_CACHE_STORAGE_KEY]: nextCache });
  await logDebug("CACHE", "已缓存网页摘要", {
    url: pageData.url,
    cacheSize: nextCache.length
  });
}

function findCachedSummaryForUrl(summaryCache, pageUrl) {
  const normalizedUrl = normalizePageUrl(pageUrl);
  if (!normalizedUrl) {
    return null;
  }

  return summaryCache.find((entry) => entry.normalizedUrl === normalizedUrl) || null;
}

function normalizePageUrl(pageUrl) {
  if (!pageUrl) {
    return "";
  }

  try {
    const url = new URL(pageUrl);
    url.hash = "";
    return url.toString();
  } catch {
    return pageUrl;
  }
}

function collectPageContext(pageTextLimit) {
  const clean = (value) => (value || "").replace(/\s+/g, " ").trim();
  const firstMeta = (selector) => {
    const node = document.querySelector(selector);
    return clean(node?.content || node?.getAttribute("content") || "");
  };

  const selectedText = clean(window.getSelection()?.toString() || "");
  const pageText = clean(document.body?.innerText || "");
  const description =
    firstMeta('meta[name="description"]') ||
    firstMeta('meta[property="og:description"]');
  const title =
    clean(document.title) ||
    firstMeta('meta[property="og:title"]') ||
    firstMeta('meta[name="twitter:title"]');
  const sourceText = selectedText || pageText || description;

  return {
    title,
    url: location.href,
    description,
    usedSelection: Boolean(selectedText),
    text: sourceText.slice(0, pageTextLimit)
  };
}

async function requestSummary(settings, pageData) {
  const targetRange = getSummaryTarget(settings.summaryLimit);
  let summary = await requestSummaryOnce(settings, buildMessages(pageData, targetRange));
  let normalizedSummary = compactSummaryText(summary);

  if (!isWithinTargetRange(normalizedSummary, targetRange)) {
    await logDebug("LENGTH", "首轮摘要未落入目标区间", {
      target: targetRange.target,
      min: targetRange.min,
      max: targetRange.max,
      actualLength: getTextLength(normalizedSummary)
    });

    summary = await requestSummaryOnce(
      settings,
      buildRevisionMessages(pageData, normalizedSummary, targetRange)
    );
    normalizedSummary = compactSummaryText(summary);
  }

  if (!isWithinTargetRange(normalizedSummary, targetRange)) {
    await logDebug("LENGTH", "修正后仍未落入目标区间", {
      target: targetRange.target,
      min: targetRange.min,
      max: targetRange.max,
      actualLength: getTextLength(normalizedSummary)
    });
  }

  return normalizeSummary(normalizedSummary, targetRange.max);
}

async function requestSummaryOnce(settings, messages) {
  const requestUrl = normalizeApiUrl(settings.apiUrl);
  const headers = {
    "Content-Type": "application/json"
  };

  const apiKey = resolveApiKey(settings, requestUrl);
  if (apiKey) {
    headers.Authorization = `Bearer ${apiKey}`;
  }

  if (requestUrl.includes("openrouter.ai")) {
    headers["HTTP-Referer"] = "https://page-summary.local";
    headers["X-Title"] = "网页摘要";
  }

  const requestBody = {
    model: settings.model,
    temperature: 0.2,
    max_tokens: Math.max(120, Math.ceil(messages.maxLength * 2.5)),
    messages: messages.payload
  };
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);
  let response;

  try {
    response = await fetch(requestUrl, {
      method: "POST",
      headers,
      body: JSON.stringify(requestBody),
      signal: controller.signal
    });
  } catch (error) {
    throw createFetchRequestError(error, requestUrl);
  } finally {
    window.clearTimeout(timeoutId);
  }

  const rawText = await response.text();
  const data = parseJsonSafely(rawText);
  await logDebug("RESPONSE", "模型接口已返回", {
    url: requestUrl,
    status: response.status,
    ok: response.ok,
    bodyPreview: rawText.slice(0, 280)
  });

  if (!response.ok) {
    throw createApiResponseError(data, response.status, requestUrl);
  }

  const rawSummary = readModelText(data, rawText);
  if (!rawSummary) {
    throw createUiError("empty_model_output", "模型返回为空，请换个模型再试。");
  }

  return rawSummary;
}

function normalizeApiUrl(apiUrl) {
  const url = new URL(apiUrl);
  const pathname = url.pathname.replace(/\/+$/, "");
  if (!pathname.endsWith("/chat/completions")) {
    url.pathname = `${pathname}/chat/completions`;
  }
  return url.toString();
}

function buildMessages(pageData, targetRange) {
  const userPrompt = [
    "请阅读下面的网页信息，输出一段中文摘要。",
    "硬性要求：",
    "1. 只输出一段，不要分点。",
    `2. 目标长度约 ${targetRange.target} 个中文字符，不要明显短于这个长度。`,
    "3. 如果初稿过短，请补足关键信息；如果过长，请压缩到接近目标长度。",
    "4. 不要出现“这篇文章”“该网页”之类空泛表达。",
    "5. 不要加引号，不要解释你的做法。",
    "6. 结尾必须是完整句子，最后用句号、问号或感叹号自然收尾。",
    "",
    `标题：${pageData.title || "无"}`,
    `链接：${pageData.url || "无"}`,
    `描述：${pageData.description || "无"}`,
    "正文：",
    pageData.text
  ].join("\n");

  return {
    maxLength: targetRange.max,
    payload: [
      {
        role: "system",
        content: "你是一个网页摘要助手，必须严格压缩信息密度，用自然中文给出短摘要。"
      },
      {
        role: "user",
        content: userPrompt
      }
    ]
  };
}

function buildRevisionMessages(pageData, previousSummary, targetRange) {
  const userPrompt = [
    "请重写下面这段网页摘要，让它更贴近目标长度。",
    `目标长度约 ${targetRange.target} 个中文字符，不要明显短于这个长度。`,
    "如果上一版过短，请补充关键信息但不要编造；如果过长，请压缩但保留重点。",
    "结尾必须是完整句子，最后用句号、问号或感叹号自然收尾。",
    "只输出最终摘要，不要解释。",
    "",
    `上一版摘要：${previousSummary}`,
    "",
    `标题：${pageData.title || "无"}`,
    `链接：${pageData.url || "无"}`,
    `描述：${pageData.description || "无"}`,
    "正文：",
    pageData.text
  ].join("\n");

  return {
    maxLength: targetRange.max,
    payload: [
      {
        role: "system",
        content: "你是一个网页摘要助手，必须按目标字数重写摘要，只输出最终结果。"
      },
      {
        role: "user",
        content: userPrompt
      }
    ]
  };
}

function readModelText(data, rawText = "") {
  const messageContent = data?.choices?.[0]?.message?.content;
  if (typeof messageContent === "string") {
    return messageContent;
  }

  if (Array.isArray(messageContent)) {
    return messageContent
      .map((part) => {
        if (typeof part === "string") {
          return part;
        }
        return part?.text || part?.content || "";
      })
      .join("\n");
  }

  if (typeof data?.output_text === "string") {
    return data.output_text;
  }

  if (typeof rawText === "string" && rawText.trim() && !data) {
    return rawText.trim();
  }

  return "";
}

function normalizeSummary(text, summaryLimit) {
  const compact = compactSummaryText(text);
  const normalized = trimSummaryToCompleteSentence(compact, summaryLimit);
  return normalized || "模型没有返回可展示的摘要。";
}

function compactSummaryText(text) {
  return text
    .replace(/[\r\n]+/g, " ")
    .replace(/[“”"'`]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function trimSummaryToCompleteSentence(text, maxLength) {
  if (!text) {
    return "";
  }

  const chars = [...text];
  if (chars.length <= maxLength) {
    return ensureSentenceEnding(text);
  }

  const sentenceAfterLimit = sliceToBoundaryAfter(chars, maxLength, SUMMARY_OVERFLOW_GRACE);
  if (sentenceAfterLimit) {
    return sentenceAfterLimit;
  }

  const sentenceBeforeLimit = sliceToBoundaryBefore(chars, maxLength, SENTENCE_ENDING_SET);
  if (sentenceBeforeLimit && getTextLength(sentenceBeforeLimit) >= Math.round(maxLength * 0.65)) {
    return sentenceBeforeLimit;
  }

  const clauseBeforeLimit = sliceToBoundaryBefore(chars, maxLength, CLAUSE_ENDING_SET);
  if (clauseBeforeLimit && getTextLength(clauseBeforeLimit) >= Math.round(maxLength * 0.65)) {
    return ensureSentenceEnding(clauseBeforeLimit);
  }

  return ensureSentenceEnding(chars.slice(0, maxLength).join(""));
}

function sliceToBoundaryAfter(chars, maxLength, overflowLimit) {
  const endIndex = Math.min(chars.length - 1, maxLength + overflowLimit - 1);

  for (let index = maxLength; index <= endIndex; index += 1) {
    if (SENTENCE_ENDING_SET.has(chars[index])) {
      return chars.slice(0, index + 1).join("").trim();
    }
  }

  return "";
}

function sliceToBoundaryBefore(chars, maxLength, boundarySet) {
  const endIndex = Math.min(maxLength, chars.length) - 1;

  for (let index = endIndex; index >= 0; index -= 1) {
    if (boundarySet.has(chars[index])) {
      return chars.slice(0, index + 1).join("").trim();
    }
  }

  return "";
}

function ensureSentenceEnding(text) {
  const trimmed = text.trim();
  if (!trimmed) {
    return "";
  }

  if (SENTENCE_ENDING_PATTERN.test(trimmed)) {
    return trimmed;
  }

  return `${trimTrailingBreaks(trimmed)}。`;
}

function trimTrailingBreaks(text) {
  return text.replace(/[，,、；;：:\s]+$/g, "").trim();
}

function getSummaryTarget(summaryLimit) {
  const target = normalizeSummaryLimit(summaryLimit);
  const tolerance = Math.max(MIN_SUMMARY_TOLERANCE, Math.round(target * 0.15));
  return {
    target,
    min: target,
    max: Math.min(MAX_SUMMARY_LIMIT, target + tolerance)
  };
}

function getTextLength(text) {
  return [...text].length;
}

function isWithinTargetRange(text, targetRange) {
  const length = getTextLength(text);
  return length >= targetRange.min && length <= targetRange.max;
}

function renderSummary(summary) {
  elements.summary.textContent = summary;
  elements.summary.classList.remove("empty");
  renderCopySummaryState(true);
}

function resetSummaryState(message) {
  elements.summary.textContent = message;
  elements.summary.classList.add("empty");
  renderCopySummaryState(false);
}

function renderCopySummaryState(enabled) {
  elements.copySummaryButton.disabled = !enabled;
}

function setBusy(isBusy) {
  elements.saveButton.disabled = isBusy;
  elements.summarizeButton.disabled = isBusy;
  elements.copyLogsButton.disabled = isBusy;
  elements.clearLogsButton.disabled = isBusy || !debugEntries.length;
  elements.summaryLimit.disabled = isBusy;
  elements.copySummaryButton.disabled = isBusy || elements.summary.classList.contains("empty");
  elements.summarizeButton.textContent = isBusy ? "生成中..." : "总结当前页";
}

function setStatus(message, tone = "neutral") {
  window.clearTimeout(statusTimer);
  elements.statusBar.textContent = message;
  elements.statusBar.dataset.tone = tone;
  elements.statusBar.classList.toggle("is-hidden", !message);

  if (!message || tone === "progress") {
    return;
  }

  statusTimer = window.setTimeout(() => {
    elements.statusBar.classList.add("is-hidden");
  }, HINT_AUTO_HIDE_MS);
}

function resolveApiKey(settings, requestUrl) {
  if (settings.apiKey) {
    return settings.apiKey;
  }

  if (isLocalhostUrl(requestUrl)) {
    return "ollama";
  }

  return "";
}

function isLocalhostUrl(url) {
  const hostname = toUrlObject(url).hostname;
  return LOCALHOST_HOSTNAMES.has(hostname);
}

function isAllowedApiUrl(url) {
  const parsedUrl = toUrlObject(url);
  if (isLocalhostUrl(parsedUrl)) {
    return true;
  }

  return parsedUrl.protocol === "https:";
}

function toUrlObject(url) {
  return url instanceof URL ? url : new URL(url);
}

function parseJsonSafely(text) {
  if (!text) {
    return null;
  }

  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

function normalizeSummaryLimit(value) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) {
    return DEFAULT_SUMMARY_LIMIT;
  }

  const clamped = Math.min(MAX_SUMMARY_LIMIT, Math.max(MIN_SUMMARY_LIMIT, numeric));
  return Math.round(clamped / SUMMARY_LIMIT_STEP) * SUMMARY_LIMIT_STEP;
}

async function loadDebugLog() {
  const { [DEBUG_STORAGE_KEY]: saved } = await chrome.storage.local.get(DEBUG_STORAGE_KEY);
  return Array.isArray(saved) ? saved : [];
}

async function logDebug(stage, message, extra = null) {
  const stamp = new Date().toLocaleTimeString("zh-CN", {
    hour12: false
  });
  const payload = extra ? ` ${stringifyForLog(extra)}` : "";
  debugEntries = [`[${stamp}] ${stage} ${message}${payload}`, ...debugEntries].slice(0, MAX_DEBUG_ENTRIES);
  renderDebugLog();
  await chrome.storage.local.set({ [DEBUG_STORAGE_KEY]: debugEntries });
}

function renderDebugLog() {
  elements.debugLog.textContent = debugEntries.length ? debugEntries.join("\n\n") : "暂无日志。";
  elements.clearLogsButton.disabled = elements.summarizeButton.disabled || !debugEntries.length;
}

function renderUiState() {
  elements.settingsPanel.classList.toggle("is-collapsed", uiState.settingsCollapsed);
  elements.toggleSettingsButton.setAttribute("aria-expanded", String(!uiState.settingsCollapsed));
  elements.utilityWrap.classList.toggle("is-open", uiState.utilityOpen);
  elements.utilityPanel.setAttribute("aria-hidden", String(!uiState.utilityOpen));
  elements.toggleUtilityButton.setAttribute(
    "aria-label",
    uiState.utilityOpen ? "关闭工具面板" : "打开工具面板"
  );
}

async function persistUiState() {
  await chrome.storage.local.set({
    [UI_STATE_STORAGE_KEY]: {
      settingsCollapsed: uiState.settingsCollapsed
    }
  });
}

function onToggleSettings() {
  uiState.settingsCollapsed = !uiState.settingsCollapsed;
  renderUiState();
  void persistUiState();
}

function collapseSettingsPanel() {
  uiState.settingsCollapsed = true;
  renderUiState();
  void persistUiState();
}

function expandSettingsPanel() {
  uiState.settingsCollapsed = false;
  renderUiState();
  void persistUiState();
}

function onToggleUtility() {
  uiState.utilityOpen = !uiState.utilityOpen;
  renderUiState();
  void persistUiState();
}

function onDocumentClick(event) {
  if (!uiState.utilityOpen) {
    return;
  }

  if (elements.utilityWrap.contains(event.target)) {
    return;
  }

  uiState.utilityOpen = false;
  renderUiState();
  void persistUiState();
}

function onDocumentKeydown(event) {
  if (event.key === "Escape" && uiState.utilityOpen) {
    uiState.utilityOpen = false;
    renderUiState();
    void persistUiState();
    return;
  }

  if ((event.metaKey || event.ctrlKey) && event.key === "Enter") {
    event.preventDefault();
    void onSummarize();
  }
}

async function onCopySummary() {
  if (elements.summary.classList.contains("empty")) {
    return;
  }

  try {
    await navigator.clipboard.writeText(elements.summary.textContent);
    flashButtonLabel(elements.copySummaryButton, "已复制");
  } catch (error) {
    void logDebug("COPY", "复制摘要失败", formatErrorForLog(error));
    setStatus("复制摘要失败。", "error");
  }
}

async function onCopyLogs() {
  try {
    await navigator.clipboard.writeText(elements.debugLog.textContent);
    flashButtonLabel(elements.copyLogsButton, "已复制");
  } catch (error) {
    void logDebug("LOG", "复制调试日志失败", formatErrorForLog(error));
    setStatus("复制调试日志失败。你可以右键弹窗选择检查，在 Console 里看更完整日志。", "error");
  }
}

async function onClearLogs() {
  if (!debugEntries.length) {
    return;
  }

  try {
    debugEntries = [];
    renderDebugLog();
    await chrome.storage.local.remove(DEBUG_STORAGE_KEY);
    setStatus("调试日志已清空。");
  } catch (error) {
    void logDebug("LOG", "清空调试日志失败", formatErrorForLog(error));
    setStatus("清空调试日志失败。", "error");
  }
}

function flashButtonLabel(button, temporaryText) {
  const originalText = button.dataset.originalText || button.textContent;
  button.dataset.originalText = originalText;
  button.textContent = temporaryText;

  const existingTimer = buttonFlashTimers.get(button);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  const timer = window.setTimeout(() => {
    button.textContent = originalText;
    buttonFlashTimers.delete(button);
  }, 1200);

  buttonFlashTimers.set(button, timer);
}

function formatErrorForLog(error) {
  if (!error) {
    return null;
  }

  return {
    code: error.code || "",
    name: error.name || "Error",
    message: error.message || String(error),
    stack: error.stack || ""
  };
}

function createUiError(code, message, extra = {}) {
  const error = new Error(message);
  error.code = code;
  Object.assign(error, extra);
  return error;
}

function createFetchRequestError(error, apiUrl) {
  if (error?.name === "AbortError") {
    return createUiError("request_timeout", `模型请求超时，${REQUEST_TIMEOUT_MS / 1000} 秒内没有返回。`, {
      origin: new URL(apiUrl).origin
    });
  }

  return createUiError("request_network_error", `请求 ${new URL(apiUrl).origin} 失败。`, {
    origin: new URL(apiUrl).origin,
    causeName: error?.name || ""
  });
}

function createApiResponseError(data, status, requestUrl) {
  const detail =
    data?.error?.message ||
    data?.message ||
    data?.detail ||
    `模型请求失败，HTTP ${status}。`;

  return createUiError("api_response_error", `模型请求失败：${detail}`, {
    status,
    requestUrl
  });
}

function handleInputError(error) {
  if (error?.field) {
    expandSettingsPanel();
    window.setTimeout(() => {
      error.field?.focus();
      error.field?.select?.();
    }, 0);
  }

  setStatus(resolveErrorHint(error), "error");
}

function resolveErrorHint(error) {
  if (!error) {
    return "总结失败，请稍后再试。";
  }

  switch (error.code) {
    case "missing_api_url":
      return "请先填写 API URL。";
    case "missing_model":
      return "请先填写 Model ID。";
    case "missing_api_key":
      return "请先填写 API Key。";
    case "invalid_api_url":
      return "API URL 格式不对。";
    case "invalid_api_protocol":
      return "API URL 只支持 HTTP 或 HTTPS。";
    case "remote_http_not_allowed":
      return "远程接口必须使用 HTTPS。";
    case "permission_denied":
      return "没有拿到接口访问权限。";
    case "missing_tab":
      return "没有找到当前标签页。";
    case "empty_page_text":
      return "当前页面暂时读不到可总结内容。";
    case "request_timeout":
      return "模型响应超时，请稍后重试。";
    case "request_network_error":
      return "接口连接失败，请检查 URL 或网络。";
    case "empty_model_output":
      return "模型返回为空，请换个模型再试。";
    case "api_response_error":
      return resolveApiStatusHint(error.status);
    default:
      return "总结失败，请稍后再试。";
  }
}

function resolveApiStatusHint(status) {
  if (status === 400) {
    return "请求参数有误，请检查模型 ID。";
  }

  if (status === 401 || status === 403) {
    return "鉴权失败，请检查 API Key。";
  }

  if (status === 404) {
    return "接口地址不对，请检查 API URL。";
  }

  if (status === 408) {
    return "模型响应超时，请稍后重试。";
  }

  if (status === 429) {
    return "请求过于频繁，请稍后再试。";
  }

  if (status >= 500) {
    return "模型服务暂时不可用，请稍后重试。";
  }

  return "模型返回了错误结果，请检查配置。";
}

function stringifyForLog(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
