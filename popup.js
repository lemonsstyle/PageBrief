const STORAGE_KEY = "pageSummaryAiSettings";
const DEBUG_STORAGE_KEY = "pageSummaryAiDebugLog";
const UI_STATE_STORAGE_KEY = "pageSummaryAiUiState";
const SUMMARY_CACHE_STORAGE_KEY = "pageSummaryAiSummaryCache";
const LOCALE_STORAGE_KEY = "pageBriefLocale";
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
const SUPPORTED_LOCALES = new Set(["zh", "en"]);
const DEFAULT_LOCALE = "zh";
const OPENROUTER_REQUEST_TITLE = "PageBrief";
const PRESET_OPTION_LABELS = {
  openai: {
    zh: "OpenAI",
    en: "OpenAI"
  },
  deepseek: {
    zh: "DeepSeek",
    en: "DeepSeek"
  },
  openrouter: {
    zh: "OpenRouter",
    en: "OpenRouter"
  },
  siliconflow: {
    zh: "SiliconFlow",
    en: "SiliconFlow"
  },
  ollama: {
    zh: "Ollama 本地模型",
    en: "Ollama Local"
  },
  custom: {
    zh: "本地接口",
    en: "Local Endpoint"
  }
};
const COPY_FEEDBACK_DURATION_MS = 1200;
const MESSAGES = {
  zh: {
    languageLabel: "界面语言",
    targetLength: "目标长度",
    lengthText: "{value} 字",
    debugLogs: "调试日志",
    clearLogs: "清空日志",
    noLogs: "暂无日志。",
    summaryTitle: "摘要",
    copy: "复制",
    copied: "已复制",
    summaryEmpty: "点击“总结当前页”生成结果。",
    summarizePage: "总结当前页",
    summarizing: "生成中...",
    modelConfig: "模型配置",
    presetLabel: "模板",
    apiUrlLabel: "API URL",
    modelIdLabel: "Model ID",
    modelPlaceholder: "例如：gpt-4.1-mini",
    apiKeyLabel: "API Key",
    privacyPolicy: "隐私说明",
    saveConfig: "保存配置",
    saved: "已保存",
    configSaved: "配置已保存。",
    openUtility: "打开工具面板",
    closeUtility: "关闭工具面板",
    noModel: "未设模型",
    preparingPage: "正在整理当前网页内容。",
    readingPage: "正在读取网页内容…",
    generatingSummary: "正在生成摘要…",
    requestFailed: "本次请求失败。",
    copyLogs: "复制日志",
    logsCleared: "调试日志已清空。",
    copySummaryFailed: "复制摘要失败。",
    copyLogsFailed:
      "复制调试日志失败。你可以右键弹窗选择检查，在 Console 里看更完整日志。",
    clearLogsFailed: "清空调试日志失败。",
    errorMissingApiUrl: "请先填写 API URL。",
    errorMissingModel: "请先填写 Model ID。",
    errorMissingApiKey: "请先填写 API Key。",
    errorInvalidApiUrl: "API URL 格式不对。",
    errorInvalidApiProtocol: "API URL 只支持 HTTP 或 HTTPS。",
    errorRemoteHttp: "远程接口必须使用 HTTPS。",
    errorPermissionDenied: "没有拿到接口访问权限。",
    errorMissingTab: "没有找到当前标签页。",
    errorEmptyPageText: "当前页面暂时读不到可总结内容。",
    errorRequestTimeout: "模型响应超时，请稍后重试。",
    errorRequestNetwork: "接口连接失败，请检查 URL 或网络。",
    errorEmptyModelOutput: "模型返回为空，请换个模型再试。",
    errorGenericSummary: "总结失败，请稍后再试。",
    errorRequestTimeoutDetail: "模型请求超时，{seconds} 秒内没有返回。",
    errorRequestNetworkDetail: "请求 {origin} 失败。",
    errorApiResponseFallback: "模型请求失败，HTTP {status}。",
    errorApiResponseDetail: "模型请求失败：{detail}",
    apiStatus400: "请求参数有误，请检查模型 ID。",
    apiStatus401: "鉴权失败，请检查 API Key。",
    apiStatus404: "接口地址不对，请检查 API URL。",
    apiStatus408: "模型响应超时，请稍后重试。",
    apiStatus429: "请求过于频繁，请稍后再试。",
    apiStatus5xx: "模型服务暂时不可用，请稍后重试。",
    apiStatusDefault: "模型返回了错误结果，请检查配置。",
    modelOutputFallback: "模型没有返回可展示的摘要。",
    logInitFailed: "初始化失败",
    logCacheRestored: "已恢复最近摘要",
    logInitReady: "插件已加载",
    logSaveFailed: "保存配置失败",
    logRequestStart: "开始总结",
    logCachePersistFailed: "缓存摘要失败",
    logRequestFailed: "总结失败",
    logSaveSuccess: "手动保存成功",
    logPermissionExists: "网络权限已存在",
    logPermissionGranted: "已授予网络权限",
    logPageExtracted: "页面内容已提取",
    logSummaryCached: "已缓存网页摘要",
    logLengthOutOfRange: "首轮摘要未落入目标区间",
    logLengthStillOutOfRange: "修正后仍未落入目标区间",
    logResponseReceived: "模型接口已返回",
    logCopySummaryFailed: "复制摘要失败",
    logCopyLogsFailed: "复制调试日志失败",
    logClearLogsFailed: "清空调试日志失败"
  },
  en: {
    languageLabel: "Language",
    targetLength: "Length",
    lengthText: "{value} chars",
    debugLogs: "Debug Log",
    clearLogs: "Clear log",
    noLogs: "No logs yet.",
    summaryTitle: "Summary",
    copy: "Copy",
    copied: "Copied",
    summaryEmpty: "Click “Summarize This Page” to generate a summary.",
    summarizePage: "Summarize This Page",
    summarizing: "Summarizing...",
    modelConfig: "Model Setup",
    presetLabel: "Preset",
    apiUrlLabel: "API URL",
    modelIdLabel: "Model ID",
    modelPlaceholder: "e.g. gpt-4.1-mini",
    apiKeyLabel: "API Key",
    privacyPolicy: "Privacy Policy",
    saveConfig: "Save Settings",
    saved: "Saved",
    configSaved: "Settings saved.",
    openUtility: "Open tools",
    closeUtility: "Close tools",
    noModel: "No model",
    preparingPage: "Preparing page content.",
    readingPage: "Reading page content…",
    generatingSummary: "Generating summary…",
    requestFailed: "This request failed.",
    copyLogs: "Copy logs",
    logsCleared: "Debug log cleared.",
    copySummaryFailed: "Couldn't copy the summary.",
    copyLogsFailed:
      "Couldn't copy the debug log. Open the popup inspector and check Console for details.",
    clearLogsFailed: "Couldn't clear the debug log.",
    errorMissingApiUrl: "Enter an API URL first.",
    errorMissingModel: "Enter a Model ID first.",
    errorMissingApiKey: "Enter an API key first.",
    errorInvalidApiUrl: "The API URL format is invalid.",
    errorInvalidApiProtocol: "The API URL must use HTTP or HTTPS.",
    errorRemoteHttp: "Remote endpoints must use HTTPS.",
    errorPermissionDenied: "The network permission was not granted.",
    errorMissingTab: "The current tab could not be found.",
    errorEmptyPageText: "This page does not expose readable content right now.",
    errorRequestTimeout: "The model timed out. Please try again.",
    errorRequestNetwork: "The endpoint could not be reached. Check the URL or network.",
    errorEmptyModelOutput: "The model returned no content. Try another model.",
    errorGenericSummary: "The summary could not be generated. Please try again.",
    errorRequestTimeoutDetail: "The model request timed out after {seconds} seconds.",
    errorRequestNetworkDetail: "Request to {origin} failed.",
    errorApiResponseFallback: "Model request failed with HTTP {status}.",
    errorApiResponseDetail: "Model request failed: {detail}",
    apiStatus400: "The request looks invalid. Check the Model ID.",
    apiStatus401: "Authentication failed. Check the API key.",
    apiStatus404: "The endpoint was not found. Check the API URL.",
    apiStatus408: "The model timed out. Please try again.",
    apiStatus429: "Too many requests. Please wait and try again.",
    apiStatus5xx: "The model service is unavailable right now. Please try again later.",
    apiStatusDefault: "The model returned an error. Check the configuration.",
    modelOutputFallback: "The model returned no summary to display.",
    logInitFailed: "Initialization failed",
    logCacheRestored: "Recent summary restored",
    logInitReady: "Extension loaded",
    logSaveFailed: "Saving settings failed",
    logRequestStart: "Summary started",
    logCachePersistFailed: "Saving summary cache failed",
    logRequestFailed: "Summary failed",
    logSaveSuccess: "Settings saved manually",
    logPermissionExists: "Network permission already granted",
    logPermissionGranted: "Network permission granted",
    logPageExtracted: "Page content extracted",
    logSummaryCached: "Summary cached",
    logLengthOutOfRange: "First summary missed the target length",
    logLengthStillOutOfRange: "Revised summary still missed the target length",
    logResponseReceived: "Model response received",
    logCopySummaryFailed: "Copying summary failed",
    logCopyLogsFailed: "Copying debug log failed",
    logClearLogsFailed: "Clearing debug log failed"
  }
};

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
  localeSwitch: document.querySelector("#localeSwitch"),
  localeZhButton: document.querySelector("#localeZhButton"),
  localeEnButton: document.querySelector("#localeEnButton"),
  statusBar: document.querySelector("#statusBar"),
  summary: document.querySelector("#summary"),
  debugLog: document.querySelector("#debugLog"),
  copyLogsButton: document.querySelector("#copyLogsButton"),
  clearLogsButton: document.querySelector("#clearLogsButton"),
  configLink: document.querySelector(".config-link")
};
const i18nNodes = {
  text: Array.from(document.querySelectorAll("[data-i18n]")),
  placeholder: Array.from(document.querySelectorAll("[data-i18n-placeholder]"))
};

let debugEntries = [];
let buttonFlashTimers = new WeakMap();
let statusTimer = 0;
let currentLocale = DEFAULT_LOCALE;
let isBusy = false;
let settingsState = createDefaultSettingsState();
let uiState = {
  settingsCollapsed: false,
  utilityOpen: false
};
let statusState = null;
let summaryState = {
  type: "placeholder",
  key: "summaryEmpty"
};

function normalizeLocale(locale) {
  const normalized = String(locale || "").toLowerCase();
  return normalized.startsWith("en") ? "en" : DEFAULT_LOCALE;
}

function t(key, params = {}) {
  const template =
    MESSAGES[currentLocale]?.[key] ?? MESSAGES[DEFAULT_LOCALE]?.[key] ?? key;

  return template.replace(/\{(\w+)\}/g, (_, token) => String(params[token] ?? ""));
}

function formatLength(value) {
  return t("lengthText", {
    value: normalizeSummaryLimit(value)
  });
}

function getPresetLabel(presetKey) {
  const labels = PRESET_OPTION_LABELS[presetKey] || PRESET_OPTION_LABELS.custom;
  return labels[currentLocale] || labels[DEFAULT_LOCALE];
}

function renderPresetOptions() {
  Array.from(elements.preset.options).forEach((option) => {
    option.textContent = getPresetLabel(option.value);
  });
}

function renderLocaleSwitch() {
  const isZh = currentLocale === "zh";
  elements.localeZhButton.classList.toggle("is-active", isZh);
  elements.localeZhButton.setAttribute("aria-pressed", String(isZh));
  elements.localeEnButton.classList.toggle("is-active", !isZh);
  elements.localeEnButton.setAttribute("aria-pressed", String(!isZh));
  elements.localeSwitch.setAttribute("aria-label", t("languageLabel"));
}

function renderButtonText(button, labelKey) {
  button.dataset.labelKey = labelKey;
  button.dataset.originalText = t(labelKey);
  button.textContent = button.dataset.flashKey ? t(button.dataset.flashKey) : t(labelKey);
}

function renderActionLabels() {
  renderButtonText(elements.saveButton, "saveConfig");
  renderButtonText(elements.copySummaryButton, "copy");
  renderButtonText(elements.copyLogsButton, "copyLogs");
  elements.configLink.textContent = t("privacyPolicy");
  const utilityLabel = uiState.utilityOpen ? t("closeUtility") : t("openUtility");
  elements.toggleUtilityButton.setAttribute("aria-label", utilityLabel);
  elements.toggleUtilityButton.title = utilityLabel;
  elements.clearLogsButton.setAttribute("aria-label", t("clearLogs"));
  elements.clearLogsButton.title = t("clearLogs");
  elements.summarizeButton.textContent = isBusy ? t("summarizing") : t("summarizePage");
}

function renderStatusState() {
  const message = statusState
    ? statusState.type === "key"
      ? t(statusState.key, statusState.params)
      : statusState.text
    : "";

  applyStatusMessage(message, statusState?.tone || "neutral");
}

function renderSummaryState() {
  if (summaryState.type === "content") {
    elements.summary.textContent = summaryState.text;
    elements.summary.classList.remove("empty");
    renderCopySummaryState(true);
    return;
  }

  elements.summary.textContent = t(summaryState.key, summaryState.params);
  elements.summary.classList.add("empty");
  renderCopySummaryState(false);
}

function applyLocale() {
  document.documentElement.lang = currentLocale === "zh" ? "zh-CN" : "en";

  i18nNodes.text.forEach((node) => {
    node.textContent = t(node.dataset.i18n);
  });

  i18nNodes.placeholder.forEach((node) => {
    node.placeholder = t(node.dataset.i18nPlaceholder);
  });

  renderPresetOptions();
  renderLocaleSwitch();
  renderActionLabels();
  renderSettingsSnapshot(readDraftSettingsFromForm());
  renderSummaryLimit(elements.summaryLimit.value);
  renderDebugLog();
  renderSummaryState();
  renderStatusState();
  renderUiState();
}

init().catch((error) => {
  elements.app.classList.add("is-ready");
  void logDebug("INIT", t("logInitFailed"), formatErrorForLog(error));
  setStatusKey(resolveErrorHintKey(error), "error");
});

async function init() {
  bindEvents();

  const [settings, logs, savedUiState, summaryCache, currentTab, savedLocale] = await Promise.all([
    loadSettings(),
    loadDebugLog(),
    loadUiState(),
    loadSummaryCache(),
    queryCurrentTab(),
    loadLocale()
  ]);

  currentLocale = savedLocale;
  debugEntries = logs;
  uiState = resolveInitialUiState(settings, savedUiState);
  const cachedSummary = findCachedSummaryForUrl(summaryCache, currentTab?.url || "");

  hydrateForm(settings);
  applyLocale();
  if (cachedSummary?.summary) {
    renderSummary(cachedSummary.summary);
  } else {
    resetSummaryState("summaryEmpty");
  }
  clearStatus();
  elements.app.classList.add("is-ready");

  if (cachedSummary?.summary) {
    await logDebug("CACHE", t("logCacheRestored"), {
      url: cachedSummary.url,
      updatedAt: cachedSummary.updatedAt
    });
  }

  await logDebug("INIT", t("logInitReady"), {
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
  elements.localeZhButton.addEventListener("click", () => {
    void onLocaleChange("zh");
  });
  elements.localeEnButton.addEventListener("click", () => {
    void onLocaleChange("en");
  });
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

async function loadLocale() {
  const { [LOCALE_STORAGE_KEY]: saved } = await chrome.storage.local.get(LOCALE_STORAGE_KEY);
  return normalizeLocale(saved || navigator.language);
}

async function persistLocale() {
  await chrome.storage.local.set({ [LOCALE_STORAGE_KEY]: currentLocale });
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
  const modelText = settings.model || t("noModel");
  elements.presetBadge.textContent = getPresetLabel(settings.preset);
  elements.presetBadge.dataset.theme = PRESET_THEMES[settings.preset] || "custom";
  elements.modelBadge.textContent = modelText;
  elements.lengthBadge.textContent = formatLength(settings.summaryLimit);
  elements.configSummary.textContent = `${getPresetLabel(settings.preset)} · ${modelText}`;
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

async function onLocaleChange(locale) {
  const nextLocale = normalizeLocale(locale);
  if (!SUPPORTED_LOCALES.has(nextLocale) || nextLocale === currentLocale) {
    return;
  }

  currentLocale = nextLocale;
  applyLocale();
  await persistLocale();
}

function renderSummaryLimit(limit) {
  elements.summaryLimitValue.textContent = formatLength(limit);
}

async function onSave() {
  try {
    const settings = await saveSettings();
    renderSettingsSnapshot(settings);
    collapseSettingsPanel();
    flashButtonLabel(elements.saveButton, "saved");
    setStatusKey("configSaved", "success");
  } catch (error) {
    void logDebug("SAVE", t("logSaveFailed"), formatErrorForLog(error));
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
  resetSummaryState("preparingPage");

  try {
    settingsState = mergeSettingsIntoState(settingsState, settings);
    renderSettingsSnapshot(settings);
    await logDebug("REQUEST", t("logRequestStart"), {
      preset: settings.preset,
      apiUrl: settings.apiUrl,
      model: settings.model,
      hasApiKey: Boolean(settings.apiKey),
      summaryLimit: settings.summaryLimit
    });

    await ensureApiPermission(settings.apiUrl);

    setStatusKey("readingPage", "progress");
    const pageData = await extractCurrentPage();

    setStatusKey("generatingSummary", "progress");
    const summary = await requestSummary(settings, pageData);
    renderSummary(summary);
    try {
      await persistSummaryEntry(pageData, summary);
    } catch (cacheError) {
      void logDebug("CACHE", t("logCachePersistFailed"), formatErrorForLog(cacheError));
    }
    clearStatus();
  } catch (error) {
    resetSummaryState("requestFailed");
    void logDebug("REQUEST", t("logRequestFailed"), formatErrorForLog(error));
    setStatusKey(resolveErrorHintKey(error), "error");
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
    throw createUiError("missing_api_url", t("errorMissingApiUrl"), {
      field: elements.apiUrl
    });
  }

  if (!settings.model) {
    throw createUiError("missing_model", t("errorMissingModel"), {
      field: elements.model
    });
  }

  let parsedUrl;
  try {
    parsedUrl = new URL(settings.apiUrl);
  } catch {
    throw createUiError("invalid_api_url", t("errorInvalidApiUrl"), {
      field: elements.apiUrl
    });
  }

  if (!["http:", "https:"].includes(parsedUrl.protocol)) {
    throw createUiError("invalid_api_protocol", t("errorInvalidApiProtocol"), {
      field: elements.apiUrl
    });
  }

  if (parsedUrl.protocol === "http:" && !isLocalhostUrl(parsedUrl)) {
    throw createUiError("remote_http_not_allowed", t("errorRemoteHttp"), {
      field: elements.apiUrl
    });
  }

  if (requireApiKey && !isLocalhostUrl(parsedUrl) && !settings.apiKey) {
    throw createUiError("missing_api_key", t("errorMissingApiKey"), {
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
  void logDebug("SAVE", t("logSaveSuccess"), {
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
    await logDebug("PERMISSION", t("logPermissionExists"), { origin });
    return;
  }

  const granted = await chrome.permissions.request(permissionRequest);
  if (!granted) {
    throw createUiError("permission_denied", t("errorPermissionDenied"), { origin });
  }

  await logDebug("PERMISSION", t("logPermissionGranted"), { origin });
}

async function queryCurrentTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab || null;
}

async function extractCurrentPage() {
  const tab = await queryCurrentTab();

  if (!tab?.id) {
    throw createUiError("missing_tab", t("errorMissingTab"));
  }

  const [{ result }] = await chrome.scripting.executeScript({
    target: { tabId: tab.id },
    func: collectPageContext,
    args: [PAGE_TEXT_LIMIT]
  });

  if (!result?.text) {
    throw createUiError("empty_page_text", t("errorEmptyPageText"));
  }

  await logDebug("PAGE", t("logPageExtracted"), {
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
  await logDebug("CACHE", t("logSummaryCached"), {
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
    await logDebug("LENGTH", t("logLengthOutOfRange"), {
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
    await logDebug("LENGTH", t("logLengthStillOutOfRange"), {
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
    headers["X-Title"] = OPENROUTER_REQUEST_TITLE;
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
  await logDebug("RESPONSE", t("logResponseReceived"), {
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
    throw createUiError("empty_model_output", t("errorEmptyModelOutput"));
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
  return normalized || t("modelOutputFallback");
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
  summaryState = {
    type: "content",
    text: summary
  };
  renderSummaryState();
}

function resetSummaryState(messageKey, params = {}) {
  summaryState = {
    type: "placeholder",
    key: messageKey,
    params
  };
  renderSummaryState();
}

function renderCopySummaryState(enabled) {
  elements.copySummaryButton.disabled = isBusy || !enabled;
}

function setBusy(nextBusy) {
  isBusy = nextBusy;
  elements.saveButton.disabled = isBusy;
  elements.summarizeButton.disabled = isBusy;
  elements.copyLogsButton.disabled = isBusy;
  elements.clearLogsButton.disabled = isBusy || !debugEntries.length;
  elements.summaryLimit.disabled = isBusy;
  elements.copySummaryButton.disabled = isBusy || elements.summary.classList.contains("empty");
  elements.summarizeButton.textContent = isBusy ? t("summarizing") : t("summarizePage");
}

function applyStatusMessage(message, tone = "neutral") {
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

function setStatusKey(key, tone = "neutral", params = {}) {
  statusState = key
    ? {
        type: "key",
        key,
        params,
        tone
      }
    : null;
  renderStatusState();
}

function clearStatus() {
  statusState = null;
  renderStatusState();
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
  const stamp = new Date().toLocaleTimeString(currentLocale === "zh" ? "zh-CN" : "en-US", {
    hour12: false
  });
  const payload = extra ? ` ${stringifyForLog(extra)}` : "";
  debugEntries = [`[${stamp}] ${stage} ${message}${payload}`, ...debugEntries].slice(0, MAX_DEBUG_ENTRIES);
  renderDebugLog();
  await chrome.storage.local.set({ [DEBUG_STORAGE_KEY]: debugEntries });
}

function renderDebugLog() {
  elements.debugLog.textContent = debugEntries.length ? debugEntries.join("\n\n") : t("noLogs");
  elements.clearLogsButton.disabled = elements.summarizeButton.disabled || !debugEntries.length;
}

function renderUiState() {
  elements.settingsPanel.classList.toggle("is-collapsed", uiState.settingsCollapsed);
  elements.toggleSettingsButton.setAttribute("aria-expanded", String(!uiState.settingsCollapsed));
  elements.utilityWrap.classList.toggle("is-open", uiState.utilityOpen);
  elements.utilityPanel.setAttribute("aria-hidden", String(!uiState.utilityOpen));
  const utilityLabel = uiState.utilityOpen ? t("closeUtility") : t("openUtility");
  elements.toggleUtilityButton.setAttribute("aria-label", utilityLabel);
  elements.toggleUtilityButton.title = utilityLabel;
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
    flashButtonLabel(elements.copySummaryButton, "copied");
  } catch (error) {
    void logDebug("COPY", t("logCopySummaryFailed"), formatErrorForLog(error));
    setStatusKey("copySummaryFailed", "error");
  }
}

async function onCopyLogs() {
  try {
    await navigator.clipboard.writeText(elements.debugLog.textContent);
    flashButtonLabel(elements.copyLogsButton, "copied");
  } catch (error) {
    void logDebug("LOG", t("logCopyLogsFailed"), formatErrorForLog(error));
    setStatusKey("copyLogsFailed", "error");
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
    setStatusKey("logsCleared");
  } catch (error) {
    void logDebug("LOG", t("logClearLogsFailed"), formatErrorForLog(error));
    setStatusKey("clearLogsFailed", "error");
  }
}

function flashButtonLabel(button, temporaryKey) {
  button.dataset.flashKey = temporaryKey;
  button.dataset.originalText = button.dataset.labelKey ? t(button.dataset.labelKey) : button.textContent;
  button.textContent = t(temporaryKey);

  const existingTimer = buttonFlashTimers.get(button);
  if (existingTimer) {
    window.clearTimeout(existingTimer);
  }

  const timer = window.setTimeout(() => {
    delete button.dataset.flashKey;
    button.textContent = button.dataset.labelKey ? t(button.dataset.labelKey) : button.dataset.originalText;
    buttonFlashTimers.delete(button);
  }, COPY_FEEDBACK_DURATION_MS);

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
    return createUiError(
      "request_timeout",
      t("errorRequestTimeoutDetail", {
        seconds: REQUEST_TIMEOUT_MS / 1000
      }),
      {
        origin: new URL(apiUrl).origin
      }
    );
  }

  return createUiError(
    "request_network_error",
    t("errorRequestNetworkDetail", {
      origin: new URL(apiUrl).origin
    }),
    {
      origin: new URL(apiUrl).origin,
      causeName: error?.name || ""
    }
  );
}

function createApiResponseError(data, status, requestUrl) {
  const detail =
    data?.error?.message ||
    data?.message ||
    data?.detail ||
    t("errorApiResponseFallback", { status });

  return createUiError("api_response_error", t("errorApiResponseDetail", { detail }), {
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

  setStatusKey(resolveErrorHintKey(error), "error");
}

function resolveErrorHintKey(error) {
  if (!error) {
    return "errorGenericSummary";
  }

  switch (error.code) {
    case "missing_api_url":
      return "errorMissingApiUrl";
    case "missing_model":
      return "errorMissingModel";
    case "missing_api_key":
      return "errorMissingApiKey";
    case "invalid_api_url":
      return "errorInvalidApiUrl";
    case "invalid_api_protocol":
      return "errorInvalidApiProtocol";
    case "remote_http_not_allowed":
      return "errorRemoteHttp";
    case "permission_denied":
      return "errorPermissionDenied";
    case "missing_tab":
      return "errorMissingTab";
    case "empty_page_text":
      return "errorEmptyPageText";
    case "request_timeout":
      return "errorRequestTimeout";
    case "request_network_error":
      return "errorRequestNetwork";
    case "empty_model_output":
      return "errorEmptyModelOutput";
    case "api_response_error":
      return resolveApiStatusHintKey(error.status);
    default:
      return "errorGenericSummary";
  }
}

function resolveApiStatusHintKey(status) {
  if (status === 400) {
    return "apiStatus400";
  }

  if (status === 401 || status === 403) {
    return "apiStatus401";
  }

  if (status === 404) {
    return "apiStatus404";
  }

  if (status === 408) {
    return "apiStatus408";
  }

  if (status === 429) {
    return "apiStatus429";
  }

  if (status >= 500) {
    return "apiStatus5xx";
  }

  return "apiStatusDefault";
}

function stringifyForLog(value) {
  try {
    return JSON.stringify(value);
  } catch {
    return String(value);
  }
}
