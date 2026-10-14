// ==========================================
// STATE MANAGEMENT
// ==========================================
let currentTab = 'trends';
let currentTrends = [];
let currentScript = null;
let selectedHookIndex = 0;

// Video Clipper State
let activeVideo = {
  path: null,
  url: null,
  duration: 15,
  width: 1280,
  height: 720
};
let layoutMode = 'blur_pad';
let subtitleStyle = 'warzone';
let subtitlePosition = 'middle';
let autoBgType = 'gameplay';

// ==========================================
// GOOGLE GEMINI PRO / FLASH API KEY MANAGEMENT (LOCALSTORAGE)
// ==========================================
const GEMINI_KEY_STORAGE = 'user_gemini_api_key';
const GEMINI_MODEL_STORAGE = 'user_gemini_model';

function getGeminiKey() {
  return localStorage.getItem(GEMINI_KEY_STORAGE) || '';
}

function getGeminiModel() {
  return localStorage.getItem(GEMINI_MODEL_STORAGE) || 'gemini-1.5-flash';
}

function openApiKeyModal() {
  const modal = document.getElementById('gemini-modal');
  const input = document.getElementById('gemini-key-input');
  const select = document.getElementById('gemini-model-select');
  const result = document.getElementById('gemini-key-verify-result');

  if (input) input.value = getGeminiKey();
  if (select) select.value = getGeminiModel();
  if (result) result.classList.add('hidden');

  modal?.classList.remove('hidden');
  lucide.createIcons();
}

function closeApiKeyModal() {
  document.getElementById('gemini-modal')?.classList.add('hidden');
}

function toggleKeyVisibility() {
  const input = document.getElementById('gemini-key-input');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

async function saveAndVerifyGeminiKey() {
  const input = document.getElementById('gemini-key-input');
  const modelSelect = document.getElementById('gemini-model-select');
  const resultEl = document.getElementById('gemini-key-verify-result');
  const btn = document.getElementById('save-gemini-key-btn');

  const key = input?.value?.trim();
  const model = modelSelect?.value || 'gemini-1.5-flash';

  if (!key) {
    showToast('Please paste a Gemini API key or click Remove Key.', 'error');
    return;
  }

  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Verifying...`;
  btn.disabled = true;

  try {
    const res = await fetch('/api/gemini/verify-key', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ apiKey: key })
    });

    const data = await res.json();
    if (!res.ok || !data.valid) {
      throw new Error(data.error || 'Invalid API key');
    }

    // Save to localStorage
    localStorage.setItem(GEMINI_KEY_STORAGE, key);
    localStorage.setItem(GEMINI_MODEL_STORAGE, model);

    resultEl.className = 'p-2.5 rounded-lg text-xs font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40';
    resultEl.textContent = `✅ Verified! Successfully connected to Google Gemini (${model}).`;
    resultEl.classList.remove('hidden');

    updateGeminiKeyBadge(true, model);
    showToast('Gemini API Key saved and verified!', 'success');

    setTimeout(() => {
      closeApiKeyModal();
    }, 1200);
  } catch (err) {
    resultEl.className = 'p-2.5 rounded-lg text-xs font-mono bg-rose-500/20 text-rose-300 border border-rose-500/40';
    resultEl.textContent = `❌ Verification failed: ${err.message}`;
    resultEl.classList.remove('hidden');
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
    lucide.createIcons();
  }
}

function clearGeminiKey() {
  localStorage.removeItem(GEMINI_KEY_STORAGE);
  const input = document.getElementById('gemini-key-input');
  if (input) input.value = '';
  const resultEl = document.getElementById('gemini-key-verify-result');
  if (resultEl) {
    resultEl.className = 'p-2.5 rounded-lg text-xs font-mono bg-brand-dark text-slate-400 border border-brand-border';
    resultEl.textContent = 'Key removed from your browser storage.';
    resultEl.classList.remove('hidden');
  }
  updateGeminiKeyBadge(false);
  showToast('Gemini API Key removed.', 'info');
}

function updateGeminiKeyBadge(isConnected, model = 'gemini-1.5-flash') {
  const statusText = document.getElementById('gemini-key-status-text');
  const indicator = document.getElementById('gemini-key-indicator');
  const btn = document.getElementById('gemini-key-btn');

  if (isConnected) {
    const isPro = model.includes('pro');
    if (statusText) statusText.textContent = isPro ? 'Gemini 1.5 Pro' : 'Gemini 1.5 Flash';
    if (indicator) {
      indicator.className = 'w-2 h-2 rounded-full bg-emerald-400 animate-pulse';
    }
    btn?.classList.add('border-emerald-500/40', 'bg-emerald-500/10', 'text-emerald-300');
    btn?.classList.remove('border-purple-500/40', 'bg-purple-500/10', 'text-purple-300');
  } else {
    if (statusText) statusText.textContent = 'Connect Gemini Key';
    if (indicator) {
      indicator.className = 'w-2 h-2 rounded-full bg-slate-500';
    }
    btn?.classList.remove('border-emerald-500/40', 'bg-emerald-500/10', 'text-emerald-300');
    btn?.classList.add('border-purple-500/40', 'bg-purple-500/10', 'text-purple-300');
  }
}

function initGeminiKeyStatus() {
  const key = getGeminiKey();
  if (key && key.length > 10) {
    updateGeminiKeyBadge(true, getGeminiModel());
  } else {
    updateGeminiKeyBadge(false);
  }
}

// AI VOICE NARRATOR STATE
let selectedAiVoice = 'christopher';

function selectAiVoice(voice) {
  selectedAiVoice = voice;
  document.querySelectorAll('.voice-btn').forEach(b => {
    b.classList.remove('active', 'border-purple-500', 'bg-purple-500/20', 'text-white');
    b.classList.add('border-brand-border', 'bg-brand-dark', 'text-slate-400');
  });
  const activeBtn = document.getElementById(`voice-btn-${voice}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'border-purple-500', 'bg-purple-500/20', 'text-white');
    activeBtn.classList.remove('border-brand-border', 'bg-brand-dark', 'text-slate-400');
  }
}

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  lucide.createIcons();
  initGeminiKeyStatus();
  loadTrends();
  loadHashtagsData('warzone clips');
  renderEndCardState();
  renderAudioPlaylist();
});

// ==========================================
// TAB SWITCHING
// ==========================================
function switchTab(tabId) {
  currentTab = tabId;

  // Toggle tab contents
  document.querySelectorAll('.tab-content').forEach(el => el.classList.add('hidden'));
  const targetContent = document.getElementById(`tab-${tabId}`);
  if (targetContent) targetContent.classList.remove('hidden');

  // Toggle button styles
  document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
  const targetBtn = document.getElementById(`tab-${tabId}-btn`);
  if (targetBtn) targetBtn.classList.add('active');

  lucide.createIcons();
}

// ==========================================
// TAB 1: TREND RADAR
// ==========================================
async function loadTrends(category = 'all') {
  try {
    const res = await fetch(`/api/trends?category=${category}`);
    currentTrends = await res.json();
    renderTrends(currentTrends);
  } catch (err) {
    console.error('Failed to load trends:', err);
    showToast('Failed to load trending data', 'error');
  }
}

function filterTrends(category) {
  document.querySelectorAll('.cat-pill').forEach(pill => pill.classList.remove('active'));
  event.target.classList.add('active');
  loadTrends(category);
}

function renderTrends(trends) {
  const container = document.getElementById('trends-grid');
  if (!container) return;

  if (trends.length === 0) {
    container.innerHTML = `<div class="col-span-3 text-center py-12 text-slate-500">No trends found for this niche.</div>`;
    return;
  }

  container.innerHTML = trends.map(t => {
    let velocityBadge = 'bg-orange-500/10 text-orange-400 border-orange-500/30';
    if (t.velocityType === 'viral') velocityBadge = 'bg-red-500/10 text-brand-red border-brand-red/30';
    if (t.velocityType === 'breakout') velocityBadge = 'bg-cyan-500/10 text-brand-cyan border-brand-cyan/30';

    return `
      <div class="bg-brand-card p-5 rounded-2xl border border-brand-border hover:border-slate-600 transition flex flex-col justify-between shadow-lg">
        <div>
          <!-- BADGES -->
          <div class="flex items-center justify-between gap-2 mb-3">
            <span class="text-[11px] font-bold px-2.5 py-1 rounded-full border ${velocityBadge} flex items-center gap-1">
              ${t.velocity}
            </span>
            <span class="text-[11px] font-mono text-emerald-400 font-semibold">${t.growth}</span>
          </div>

          <!-- TITLE -->
          <h3 class="font-bold text-base text-slate-100 mb-2 leading-snug">${t.title}</h3>

          <!-- DETAILS -->
          <div class="space-y-2 text-xs text-slate-400 mb-4 bg-brand-dark/50 p-3 rounded-xl border border-brand-border">
            <div class="flex items-center gap-1.5">
              <span class="text-slate-500 font-medium">Hook Strategy:</span>
              <span class="text-slate-200 font-medium">${t.hookPattern}</span>
            </div>
            <div class="flex items-center gap-1.5">
              <span class="text-slate-500 font-medium">Audio Mood:</span>
              <span class="text-brand-cyan font-mono">${t.recommendedAudio}</span>
            </div>
          </div>

          <!-- HASHTAGS -->
          <div class="flex flex-wrap gap-1.5 mb-4">
            ${t.hashtags.map(h => `<span class="text-[10px] px-2 py-0.5 rounded-md bg-brand-dark text-slate-400 border border-brand-border">${h}</span>`).join('')}
          </div>
        </div>

        <!-- ACTION BUTTON -->
        <button onclick="useTrendInScript('${t.id}')" class="w-full py-2.5 px-3 rounded-xl bg-brand-dark hover:bg-brand-red hover:text-white border border-brand-border hover:border-brand-red text-slate-200 text-xs font-bold flex items-center justify-center gap-2 transition group shadow-sm">
          <span>Generate Script From Trend</span>
          <i data-lucide="arrow-right" class="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform"></i>
        </button>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function useTrendInScript(trendId) {
  const trend = currentTrends.find(t => t.id === trendId);
  if (!trend) return;

  document.getElementById('script-topic').value = trend.promptIdea;

  // Map category to niche select
  const nicheSelect = document.getElementById('script-niche');
  const catMap = {
    gaming: 'Call of Duty / Warzone Meta',
    tech: 'Tech & AI',
    finance: 'Personal Finance',
    fitness: 'Fitness & Health',
    ecommerce: 'E-Commerce / TikTok Shop',
    storytelling: 'Storytelling & Mystery',
    psychology: 'Self Improvement'
  };
  if (catMap[trend.category]) {
    nicheSelect.value = catMap[trend.category];
  }

  switchTab('script');
  showToast(`Loaded trend: "${trend.title}" into Script Studio!`, 'success');
}

// ==========================================
// TAB 2: AI SCRIPT & HOOK STUDIO
// ==========================================
document.getElementById('script-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();

  const topic = document.getElementById('script-topic').value.trim();
  const niche = document.getElementById('script-niche').value;
  const tone = document.getElementById('script-tone').value;
  const duration = document.getElementById('script-duration').value;
  const goal = document.getElementById('script-goal').value;

  if (!topic) {
    showToast('Please enter a video topic or concept.', 'error');
    return;
  }

  const btn = document.getElementById('generate-script-btn');
  const originalHtml = btn.innerHTML;
  btn.innerHTML = `<span class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Generating Viral Content...`;
  const apiKey = getGeminiKey();
  const model = getGeminiModel();

  try {
    const res = await fetch('/api/generate-script', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic, niche, tone, duration, goal, apiKey, model })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate');

    currentScript = data;
    selectedHookIndex = 0;
    renderScriptOutput(data);

    if (data.source === 'gemini') {
      showToast(`⚡ Script generated with Google Gemini (${data.model})!`, 'success');
    } else {
      showToast('Viral script generated with 4 hooks!', 'success');
    }
  } catch (err) {
    console.error('Error generating script:', err);
    showToast(err.message, 'error');
  } finally {
    btn.innerHTML = originalHtml;
    btn.disabled = false;
    lucide.createIcons();
  }
});

function renderScriptOutput(data) {
  // Render Hooks
  const hooksContainer = document.getElementById('hooks-container');
  hooksContainer.innerHTML = data.hooks.map((h, idx) => `
    <div onclick="selectHook(${idx})" class="hook-card ${idx === selectedHookIndex ? 'selected' : ''} p-3 rounded-xl border border-brand-border bg-brand-dark/50 hover:border-slate-500 cursor-pointer transition">
      <div class="flex items-center justify-between mb-1">
        <span class="text-[11px] font-bold text-slate-300">Option ${idx + 1}: ${h.type}</span>
        <span class="text-[10px] text-emerald-400 font-mono">${h.score}</span>
      </div>
      <p class="text-xs text-brand-cyan font-medium leading-relaxed mb-1.5">"${h.spoken}"</p>
      <p class="text-[10px] text-slate-400 italic">${h.visual}</p>
    </div>
  `).join('');

  document.getElementById('selected-hook-badge').textContent = `Hook #${selectedHookIndex + 1} Selected`;

  // Render Teleprompter Segments
  const segmentsContainer = document.getElementById('script-segments');
  segmentsContainer.innerHTML = data.segments.map((s, idx) => {
    // If hook segment, show the currently selected hook
    let spokenText = s.spoken;
    let visualText = s.visual;
    if (idx === 0) {
      spokenText = data.hooks[selectedHookIndex].spoken;
      visualText = data.hooks[selectedHookIndex].visual;
    }

    return `
      <div class="p-3.5 rounded-xl border border-brand-border bg-brand-dark/40 flex flex-col gap-1.5 transition hover:bg-brand-dark/60">
        <div class="flex items-center justify-between text-[11px] font-mono">
          <span class="text-brand-red font-bold">${s.time} • ${s.section}</span>
          <span class="text-slate-500">${s.sfx || ''}</span>
        </div>
        <p class="text-xs font-semibold text-slate-100 leading-relaxed">${spokenText}</p>
        <p class="text-[11px] text-slate-400 italic bg-brand-card/60 px-2 py-1 rounded-md border border-brand-border/60">${visualText}</p>
      </div>
    `;
  }).join('');

  // Metrics
  document.getElementById('script-metrics').innerHTML = `
    <span>${data.wordCount} Words</span>
    <span>•</span>
    <span>~${data.estimatedSeconds}s Runtime</span>
  `;

  // SEO Preview
  document.getElementById('seo-preview').textContent = `SEO Caption: ${data.seo.caption}`;
}

function selectHook(idx) {
  selectedHookIndex = idx;
  document.querySelectorAll('.hook-card').forEach((el, i) => {
    el.classList.toggle('selected', i === idx);
  });
  document.getElementById('selected-hook-badge').textContent = `Hook #${idx + 1} Selected`;

  // Re-render teleprompter with selected hook
  if (currentScript) {
    renderScriptOutput(currentScript);
  }
}

function copyFullScript() {
  if (!currentScript) {
    showToast('Please generate a script first', 'error');
    return;
  }

  const hookText = currentScript.hooks[selectedHookIndex].spoken;
  const restText = currentScript.segments.slice(1).map(s => s.spoken).join('\n\n');
  const full = `[HOOK]\n${hookText}\n\n[SCRIPT BODY]\n${restText}\n\n[SEO CAPTION]\n${currentScript.seo.caption}`;

  navigator.clipboard.writeText(full);
  showToast('Full teleprompter script copied to clipboard!', 'success');
}

function downloadScriptTxt() {
  if (!currentScript) {
    showToast('Please generate a script first', 'error');
    return;
  }

  const hookText = currentScript.hooks[selectedHookIndex].spoken;
  const restText = currentScript.segments.slice(1).map(s => s.spoken).join('\n\n');
  const full = `TIKTOK VIRAL SCRIPT\nTopic: ${currentScript.topic}\nNiche: ${currentScript.niche}\n\n[HOOK]:\n${hookText}\n\n[SCRIPT]:\n${restText}\n\n[CTA]:\n${currentScript.endingCTA}\n\n[SEO HASHTAGS]:\n${currentScript.seo.hashtags.join(' ')}`;

  const blob = new Blob([full], { type: 'text/plain' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = `tiktok_script_${Date.now()}.txt`;
  a.click();
  showToast('Script downloaded as TXT!', 'success');
}

function sendScriptToClipper() {
  if (!currentScript) {
    showToast('Please generate a script first', 'error');
    return;
  }

  const hook = currentScript.hooks[selectedHookIndex].spoken;
  const firstSentence = currentScript.segments[1]?.spoken || '';
  const textForSubtitles = `${hook} ${firstSentence}`.slice(0, 180);

  document.getElementById('subtitles-input').value = textForSubtitles;
  switchTab('clipper');
  showToast('Loaded script lines into Video Clipper subtitles!', 'success');
}

// ==========================================
// TAB 3: SHORTS CLIPPER & SUBTITLE ENGINE
// ==========================================
async function loadSampleVideo() {
  try {
    const res = await fetch('/api/sample-video');
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load demo video');

    setVideoSource(data);
    showToast('Loaded demo video for instant clipping!', 'success');
  } catch (err) {
    console.error('Error loading sample video:', err);
    showToast(err.message, 'error');
  }
}

async function handleFileUpload(event) {
  const file = event.target.files[0];
  if (!file) return;

  const label = document.getElementById('upload-label');
  label.textContent = `Uploading ${file.name}...`;

  const formData = new FormData();
  formData.append('video', file);

  try {
    const res = await fetch('/api/upload-video', {
      method: 'POST',
      body: formData
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');

    label.textContent = file.name;
    setVideoSource(data);
    showToast('Video uploaded successfully!', 'success');
  } catch (err) {
    console.error('Upload error:', err);
    label.textContent = 'Upload failed. Try again.';
    showToast(err.message, 'error');
  }
}

async function importFromUrl() {
  const urlInput = document.getElementById('import-url-input');
  const url = urlInput.value.trim();

  if (!url || !url.startsWith('http')) {
    showToast('Please enter a valid video link (YouTube, Twitch, TikTok, etc.)', 'error');
    return;
  }

  const btn = document.getElementById('import-url-btn');
  const originalHtml = btn.innerHTML;
  btn.disabled = true;
  btn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span> Downloading...`;

  showToast('Downloading video via yt-dlp... Please wait a few seconds', 'info');

  try {
    const res = await fetch('/api/download-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Failed to download link');

    setVideoSource(data);
    urlInput.value = '';
    showToast(`Video imported successfully (${data.duration}s)!`, 'success');
  } catch (err) {
    console.error('Import error:', err);
    showToast(err.message, 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = originalHtml;
    lucide.createIcons();
  }
}

function setVideoSource(data) {
  activeVideo = {
    path: data.videoPath,
    url: data.videoUrl,
    duration: data.duration,
    width: data.width,
    height: data.height
  };

  const player = document.getElementById('source-video-player');
  player.src = data.videoUrl;
  player.load();

  const label = document.getElementById('upload-label');
  if (label && data.filename) {
    label.textContent = `Active: ${data.filename.length > 25 ? data.filename.slice(0, 22) + '...' : data.filename}`;
  }

  document.getElementById('source-meta-badge').textContent = `${data.filename ? data.filename + ' • ' : ''}${data.width}x${data.height} • ${data.duration}s`;

  // Set trimmer default bounds
  const startInput = document.getElementById('trim-start');
  const endInput = document.getElementById('trim-end');

  startInput.max = data.duration;
  startInput.value = '0.0';

  endInput.max = data.duration;
  endInput.value = Math.min(10, data.duration).toFixed(1);

  updateTrimTimes();
}

function updateTrimTimes() {
  const start = parseFloat(document.getElementById('trim-start').value) || 0;
  const end = parseFloat(document.getElementById('trim-end').value) || 10;
  const diff = Math.max(0.5, end - start);

  document.getElementById('trim-duration-badge').textContent = `Clip Length: ${diff.toFixed(1)}s`;
}

let manualCrop = {
  cropTop: 0,
  cropBottom: 0,
  cropLeft: 0,
  cropRight: 0,
  fitMode: 'fill'
};
let imageOverlays = [];

function selectLayout(mode) {
  layoutMode = mode;
  document.querySelectorAll('.layout-btn').forEach(btn => btn.classList.remove('active'));
  const activeBtn = document.getElementById(`layout-${mode}`);
  if (activeBtn) activeBtn.classList.add('active');

  const manualPanel = document.getElementById('manual-crop-panel');
  const cropGuide = document.getElementById('manual-crop-guide');

  if (mode === 'manual_crop') {
    if (manualPanel) manualPanel.classList.remove('hidden');
    if (cropGuide) {
      cropGuide.classList.remove('hidden');
      updateCropGuideVisual();
    }
  } else {
    if (manualPanel) manualPanel.classList.add('hidden');
    if (cropGuide) cropGuide.classList.add('hidden');
  }
}

function updateManualCrop(key, value) {
  manualCrop[key] = value;
  const valLabel = document.getElementById(`crop-${key.replace('crop', '').toLowerCase()}-val`);
  if (valLabel) {
    valLabel.textContent = `${value}%`;
  }
  updateCropGuideVisual();
}

function updateCropGuideVisual() {
  const guide = document.getElementById('manual-crop-guide');
  if (!guide) return;
  guide.style.top = `${manualCrop.cropTop}%`;
  guide.style.bottom = `${manualCrop.cropBottom}%`;
  guide.style.left = `${manualCrop.cropLeft}%`;
  guide.style.right = `${manualCrop.cropRight}%`;
}

// WEAPON BUILD LOADOUT OUTRO & OVERLAY STATE (SUPPORTS MULTIPLE WEAPONS/SLIDES)
let pictureMode = 'endcard'; // 'endcard' (default) or 'invideo'
let subtitlePacing = 'fast'; // 'hyper' (0.8s), 'fast' (1.2s), 'normal' (1.8s), 'auto'

function selectSubtitlePacing(pacing) {
  subtitlePacing = pacing;
  document.querySelectorAll('.subpacing-btn').forEach(btn => {
    btn.classList.remove('active', 'border-brand-cyan', 'bg-brand-cyan/20', 'text-white');
    btn.classList.add('border-brand-border', 'bg-brand-dark', 'text-slate-400');
  });
  const activeBtn = document.getElementById(`subpacing-${pacing}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'border-brand-cyan', 'bg-brand-cyan/20', 'text-white');
    activeBtn.classList.remove('border-brand-border', 'bg-brand-dark', 'text-slate-400');
  }
}

let endCardSlides = [];

function selectPictureMode(mode) {
  pictureMode = mode;
  const endcardBtn = document.getElementById('picmode-endcard');
  const invideoBtn = document.getElementById('picmode-invideo');
  const endcardPanel = document.getElementById('endcard-panel');
  const invideoPanel = document.getElementById('invideo-panel');

  if (mode === 'endcard') {
    endcardBtn?.classList.add('active', 'border-emerald-400', 'bg-emerald-500/15', 'text-white');
    endcardBtn?.classList.remove('border-brand-border', 'bg-brand-dark', 'text-slate-400');
    invideoBtn?.classList.remove('active', 'border-emerald-400', 'bg-emerald-500/15', 'text-white');
    invideoBtn?.classList.add('border-brand-border', 'bg-brand-dark', 'text-slate-400');
    endcardPanel?.classList.remove('hidden');
    invideoPanel?.classList.add('hidden');
  } else {
    invideoBtn?.classList.add('active', 'border-emerald-400', 'bg-emerald-500/15', 'text-white');
    invideoBtn?.classList.remove('border-brand-border', 'bg-brand-dark', 'text-slate-400');
    endcardBtn?.classList.remove('active', 'border-emerald-400', 'bg-emerald-500/15', 'text-white');
    endcardBtn?.classList.add('border-brand-border', 'bg-brand-dark', 'text-slate-400');
    invideoPanel?.classList.remove('hidden');
    endcardPanel?.classList.add('hidden');
  }
}

function setSlideDuration(idx, dur) {
  if (endCardSlides[idx]) {
    endCardSlides[idx].duration = dur;
    renderEndCardState();
  }
}

function setSlideZoom(idx, zoomVal) {
  if (endCardSlides[idx]) {
    endCardSlides[idx].zoom = parseFloat(zoomVal);
    renderEndCardState();
  }
}

function setSlideFocus(idx, focusVal) {
  if (endCardSlides[idx]) {
    endCardSlides[idx].focus = focusVal;
    renderEndCardState();
  }
}

function updateSlideTitle(idx, val) {
  if (endCardSlides[idx]) {
    endCardSlides[idx].title = val;
  }
}

function updateSlideSubtitle(idx, val) {
  if (endCardSlides[idx]) {
    endCardSlides[idx].subtitle = val;
  }
}

function moveEndCardSlide(idx, dir) {
  const targetIdx = idx + dir;
  if (targetIdx < 0 || targetIdx >= endCardSlides.length) return;
  const temp = endCardSlides[idx];
  endCardSlides[idx] = endCardSlides[targetIdx];
  endCardSlides[targetIdx] = temp;
  renderEndCardState();
}

function removeEndCardSlide(idx) {
  endCardSlides.splice(idx, 1);
  renderEndCardState();
  showToast('Weapon slide removed', 'info');
}

function renderEndCardState() {
  const emptyEl = document.getElementById('endcard-empty');
  const listEl = document.getElementById('endcard-slides-list');
  const addMoreEl = document.getElementById('endcard-add-more-row');

  if (!listEl) return;

  if (endCardSlides.length === 0) {
    emptyEl?.classList.remove('hidden');
    listEl.innerHTML = '';
    addMoreEl?.classList.add('hidden');
    return;
  }

  emptyEl?.classList.add('hidden');
  addMoreEl?.classList.remove('hidden');

  listEl.innerHTML = endCardSlides.map((slide, idx) => {
    const isPrimary = idx === 0 && endCardSlides.length > 1;
    const isSecondary = idx === 1 && endCardSlides.length > 1;
    const roleLabel = isPrimary ? 'Primary Weapon (1/2)' : (isSecondary ? 'Secondary Weapon (2/2)' : `Slide #${idx + 1}`);
    const currentZoom = slide.zoom || 1.45;
    const currentFocus = slide.focus || 'left';

    return `
      <div class="space-y-3 bg-brand-dark/90 border border-emerald-500/40 rounded-xl p-3.5 shadow-lg">
        <!-- HEADER ROW -->
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-2.5 overflow-hidden">
            <img src="${slide.imageUrl}" alt="Loadout" class="w-14 h-10 object-cover rounded-lg border border-brand-border shrink-0 bg-black">
            <div class="overflow-hidden">
              <div class="flex items-center gap-1.5">
                <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                  ${roleLabel}
                </span>
                <span class="text-xs font-bold text-white truncate max-w-[150px]">${slide.filename}</span>
              </div>
              <div class="text-[10px] text-slate-400 font-mono mt-0.5">
                Full-Screen • ${slide.duration}s • Zoom: <span class="text-amber-400 font-bold">${Math.round(currentZoom * 100)}%</span>
              </div>
            </div>
          </div>
          <div class="flex items-center gap-1">
            ${idx > 0 ? `<button type="button" onclick="moveEndCardSlide(${idx}, -1)" class="text-slate-400 hover:text-white px-2 py-1 rounded bg-black/40 hover:bg-white/10 text-xs font-bold" title="Move Slide Up">▲</button>` : ''}
            ${idx < endCardSlides.length - 1 ? `<button type="button" onclick="moveEndCardSlide(${idx}, 1)" class="text-slate-400 hover:text-white px-2 py-1 rounded bg-black/40 hover:bg-white/10 text-xs font-bold" title="Move Slide Down">▼</button>` : ''}
            <button type="button" onclick="removeEndCardSlide(${idx})" class="text-slate-400 hover:text-red-400 p-1.5 rounded hover:bg-red-500/10 transition ml-1" title="Delete this slide">
              <i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i>
            </button>
          </div>
        </div>

        <!-- ZOOM & READABILITY CONTROLS -->
        <div class="p-2 rounded-lg bg-black/50 border border-brand-border/60 space-y-1.5">
          <div class="flex items-center justify-between">
            <span class="text-[10px] font-bold text-amber-400 flex items-center gap-1">
              <i data-lucide="zoom-in" class="w-3 h-3"></i>
              Attachment Zoom & Readability:
            </span>
            <span class="text-[10px] font-mono text-slate-300 font-bold">${Math.round(currentZoom * 100)}% Scale</span>
          </div>
          <div class="grid grid-cols-4 gap-1">
            <button type="button" onclick="setSlideZoom(${idx}, 1.0)" class="px-1 py-1 rounded text-[10px] font-bold transition ${currentZoom === 1.0 ? 'bg-amber-500/25 border border-amber-500 text-white' : 'bg-brand-dark border border-brand-border text-slate-400 hover:text-white'}">100% Fit</button>
            <button type="button" onclick="setSlideZoom(${idx}, 1.25)" class="px-1 py-1 rounded text-[10px] font-bold transition ${currentZoom === 1.25 ? 'bg-amber-500/25 border border-amber-500 text-white' : 'bg-brand-dark border border-brand-border text-slate-400 hover:text-white'}">125%</button>
            <button type="button" onclick="setSlideZoom(${idx}, 1.45)" class="px-1 py-1 rounded text-[10px] font-bold transition ${(currentZoom === 1.45) ? 'bg-amber-500/25 border border-amber-500 text-white' : 'bg-brand-dark border border-brand-border text-slate-400 hover:text-white'}">145% ⭐</button>
            <button type="button" onclick="setSlideZoom(${idx}, 1.70)" class="px-1 py-1 rounded text-[10px] font-bold transition ${currentZoom === 1.70 ? 'bg-amber-500/25 border border-amber-500 text-white' : 'bg-brand-dark border border-brand-border text-slate-400 hover:text-white'}">170% Big</button>
          </div>
          <div class="flex items-center justify-between text-[10px] pt-1">
            <span class="text-slate-400">Align:</span>
            <div class="flex gap-1">
              <button type="button" onclick="setSlideFocus(${idx}, 'left')" class="px-2 py-0.5 rounded text-[10px] font-bold ${currentFocus === 'left' ? 'bg-brand-cyan/20 border border-brand-cyan text-brand-cyan' : 'bg-brand-dark border border-brand-border text-slate-400'}">Left (Attachments)</button>
              <button type="button" onclick="setSlideFocus(${idx}, 'center')" class="px-2 py-0.5 rounded text-[10px] font-bold ${currentFocus === 'center' ? 'bg-brand-cyan/20 border border-brand-cyan text-brand-cyan' : 'bg-brand-dark border border-brand-border text-slate-400'}">Center</button>
            </div>
          </div>
        </div>

        <!-- DURATION & TOP HEADER -->
        <div class="grid grid-cols-2 gap-2 text-xs">
          <div>
            <label class="block text-[10px] text-slate-400 mb-1">Slide Duration</label>
            <div class="grid grid-cols-3 gap-1">
              <button type="button" onclick="setSlideDuration(${idx}, 2)" class="px-1.5 py-1 rounded text-[11px] font-bold transition ${slide.duration === 2 ? 'bg-emerald-500/25 border border-emerald-500 text-white' : 'bg-brand-dark border border-brand-border text-slate-300 hover:border-slate-500'}">2s</button>
              <button type="button" onclick="setSlideDuration(${idx}, 3)" class="px-1.5 py-1 rounded text-[11px] font-bold transition ${slide.duration === 3 ? 'bg-emerald-500/25 border border-emerald-500 text-white' : 'bg-brand-dark border border-brand-border text-slate-300 hover:border-slate-500'}">3s</button>
              <button type="button" onclick="setSlideDuration(${idx}, 4.5)" class="px-1.5 py-1 rounded text-[11px] font-bold transition ${slide.duration === 4.5 ? 'bg-emerald-500/25 border border-emerald-500 text-white' : 'bg-brand-dark border border-brand-border text-slate-300 hover:border-slate-500'}">4.5s</button>
            </div>
          </div>
          <div>
            <label class="block text-[10px] text-slate-400 mb-1">Slide Weapon Title</label>
            <input type="text" value="${slide.title}" oninput="updateSlideTitle(${idx}, this.value)" class="w-full bg-black/60 border border-brand-border rounded px-2 py-1 text-xs font-mono text-white focus:border-brand-cyan">
          </div>
        </div>

        <!-- SUBTITLE CALLOUT -->
        <div class="text-[10px] text-slate-400 flex items-center justify-between pt-1 border-t border-brand-border/40">
          <span>Slide Bottom Caption:</span>
          <input type="text" value="${slide.subtitle}" oninput="updateSlideSubtitle(${idx}, this.value)" class="w-2/3 bg-black/60 border border-brand-border rounded px-2 py-0.5 text-[10px] font-mono text-slate-300 focus:border-brand-cyan">
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

// ==========================================
// PICTURE OVERLAYS / LOADOUT CARDS STUDIO
// ==========================================
async function handleOverlayImageUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  try {
    showToast(`Uploading ${files.length} weapon build image(s)...`, 'info');

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch('/api/upload-overlay-image', {
        method: 'POST',
        body: formData
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to upload image');

      const rawCleanName = file.name.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ').toUpperCase();
      let defaultTitle = 'SAVE THIS CLASS SETUP [BEST META]';
      if (endCardSlides.length === 0 && files.length > 1) {
        defaultTitle = `PRIMARY: ${rawCleanName} [LONG RANGE]`;
      } else if (endCardSlides.length === 0 && files.length === 1) {
        defaultTitle = `SAVE THIS CLASS SETUP: ${rawCleanName}`;
      } else if (endCardSlides.length === 1) {
        defaultTitle = `SECONDARY: ${rawCleanName} [CLOSE RANGE]`;
      } else {
        defaultTitle = `WEAPON #${endCardSlides.length + 1}: ${rawCleanName}`;
      }

      endCardSlides.push({
        id: 'slide_' + Date.now() + '_' + i,
        filename: data.filename,
        imagePath: data.imagePath,
        imageUrl: data.imageUrl,
        duration: 3.0,
        title: defaultTitle,
        subtitle: 'Screenshot & save for your next match'
      });

      const start = parseFloat(document.getElementById('trim-start')?.value) || 0;
      const end = parseFloat(document.getElementById('trim-end')?.value) || 10;
      const clipDuration = Math.max(1, end - start);

      imageOverlays.push({
        id: 'ov_' + Date.now() + '_' + i,
        filename: data.filename,
        imagePath: data.imagePath,
        imageUrl: data.imageUrl,
        width: data.width,
        height: data.height,
        startTime: Math.round(Math.min(2.5, clipDuration * 0.2) * 10) / 10,
        endTime: Math.round(Math.min(clipDuration, 7.0) * 10) / 10,
        position: 'center',
        scaleWidth: 920,
        borderStyle: 'cod_gold',
        cropTop: 0,
        cropBottom: 0,
        cropLeft: 0,
        cropRight: 0
      });
    }

    renderEndCardState();
    renderOverlayImagesList();
    showToast(`Added ${files.length} weapon build(s) to Outro Slides! Total: ${endCardSlides.length} slide(s).`, 'success');
  } catch (err) {
    console.error('Image overlay upload error:', err);
    showToast(err.message, 'error');
  } finally {
    event.target.value = '';
  }
}

function renderOverlayImagesList() {
  const container = document.getElementById('overlay-images-list');
  if (!container) return;

  if (imageOverlays.length === 0) {
    container.innerHTML = `
      <div id="overlay-empty-state" class="p-3.5 rounded-xl border border-dashed border-slate-700 bg-brand-dark/50 text-center">
        <p class="text-xs text-slate-400">No picture overlays added yet.</p>
        <p class="text-[10px] text-slate-500 mt-0.5">Click <strong class="text-emerald-400">+ Add Picture</strong> above to attach your weapon build or screenshot!</p>
      </div>
    `;
    return;
  }

  container.innerHTML = imageOverlays.map((ov, idx) => `
    <div class="bg-brand-dark/70 border border-brand-border rounded-xl p-3 space-y-2.5">
      <!-- HEADER ROW -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2 overflow-hidden">
          <img src="${ov.imageUrl}" alt="overlay" class="w-10 h-10 object-cover rounded-lg border border-brand-border shrink-0 bg-black">
          <div class="overflow-hidden">
            <div class="text-xs font-bold text-white truncate max-w-[160px]">${ov.filename}</div>
            <div class="text-[10px] text-slate-400 font-mono">${ov.width}x${ov.height}</div>
          </div>
        </div>
        <button type="button" onclick="removeOverlayImage(${idx})" class="text-slate-400 hover:text-red-400 p-1.5 rounded-lg hover:bg-red-500/10 transition" title="Delete overlay">
          <i data-lucide="trash-2" class="w-4 h-4 text-red-400"></i>
        </button>
      </div>

      <!-- TIMING CONTROLS -->
      <div class="bg-brand-dark p-2.5 rounded-lg border border-brand-border/60 space-y-1.5">
        <div class="flex items-center justify-between text-[11px] font-semibold text-slate-300">
          <span class="flex items-center gap-1">
            <i data-lucide="clock" class="w-3.5 h-3.5 text-brand-cyan"></i>
            Frame Display Time (Seconds):
          </span>
          <span class="text-amber-400 font-mono text-[10px]">${(ov.endTime - ov.startTime).toFixed(1)}s Visible</span>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="block text-[10px] text-slate-400">Start (sec)</label>
            <input type="number" min="0" step="0.5" value="${ov.startTime}" onchange="updateOverlaySetting(${idx}, 'startTime', parseFloat(this.value) || 0)" class="w-full bg-black/60 border border-brand-border rounded px-2 py-1 text-xs font-mono text-white focus:border-brand-cyan">
          </div>
          <div>
            <label class="block text-[10px] text-slate-400">End (sec)</label>
            <input type="number" min="0.5" step="0.5" value="${ov.endTime}" onchange="updateOverlaySetting(${idx}, 'endTime', parseFloat(this.value) || 5)" class="w-full bg-black/60 border border-brand-border rounded px-2 py-1 text-xs font-mono text-white focus:border-brand-cyan">
          </div>
        </div>
        <!-- QUICK PRESETS -->
        <div class="flex items-center gap-1.5 pt-0.5">
          <button type="button" onclick="applyOverlayPreset(${idx}, 'hook')" class="px-2 py-0.5 rounded bg-brand-card hover:bg-slate-700 text-[9px] font-bold text-slate-300 transition">0-3s Hook</button>
          <button type="button" onclick="applyOverlayPreset(${idx}, 'mid')" class="px-2 py-0.5 rounded bg-brand-card hover:bg-slate-700 text-[9px] font-bold text-amber-300 transition">3-7s Reveal</button>
          <button type="button" onclick="applyOverlayPreset(${idx}, 'full')" class="px-2 py-0.5 rounded bg-brand-card hover:bg-slate-700 text-[9px] font-bold text-slate-300 transition">Full Clip</button>
        </div>
      </div>

      <!-- POSITION & BORDER -->
      <div class="grid grid-cols-2 gap-2 text-xs">
        <div>
          <label class="block text-[10px] text-slate-400 mb-0.5">Position</label>
          <select onchange="updateOverlaySetting(${idx}, 'position', this.value)" class="w-full bg-brand-dark border border-brand-border rounded-lg px-2 py-1.5 text-xs text-white focus:border-brand-cyan">
            <option value="center" ${ov.position === 'center' ? 'selected' : ''}>🎯 Center Pop-Up (Loadout)</option>
            <option value="top" ${ov.position === 'top' ? 'selected' : ''}>⬆️ Top Card</option>
            <option value="bottom" ${ov.position === 'bottom' ? 'selected' : ''}>⬇️ Bottom Third</option>
            <option value="pip_tr" ${ov.position === 'pip_tr' ? 'selected' : ''}>↗️ PiP Top-Right</option>
            <option value="pip_br" ${ov.position === 'pip_br' ? 'selected' : ''}>↘️ PiP Bottom-Right</option>
            <option value="fullscreen" ${ov.position === 'fullscreen' ? 'selected' : ''}>📺 Full Screen</option>
          </select>
        </div>
        <div>
          <label class="block text-[10px] text-slate-400 mb-0.5">Tactical Border</label>
          <select onchange="updateOverlaySetting(${idx}, 'borderStyle', this.value)" class="w-full bg-brand-dark border border-brand-border rounded-lg px-2 py-1.5 text-xs text-white focus:border-brand-cyan">
            <option value="cod_gold" ${ov.borderStyle === 'cod_gold' ? 'selected' : ''}>🟡 COD Gold Glow</option>
            <option value="viral_red" ${ov.borderStyle === 'viral_red' ? 'selected' : ''}>🔴 Viral Crimson</option>
            <option value="tactical_dark" ${ov.borderStyle === 'tactical_dark' ? 'selected' : ''}>⚫ Tactical Dark</option>
            <option value="none" ${ov.borderStyle === 'none' ? 'selected' : ''}>🚫 No Border</option>
          </select>
        </div>
      </div>

      <!-- MANUAL PICTURE CROP (OPTIONAL) -->
      <details class="text-[11px] bg-brand-dark p-2 rounded-lg border border-brand-border/40">
        <summary class="cursor-pointer text-slate-400 hover:text-slate-200 font-bold flex items-center justify-between">
          <span>✂️ Manually Crop This Picture</span>
          <span class="text-[9px] text-amber-400">Trim unwanted screenshot edges</span>
        </summary>
        <div class="grid grid-cols-2 gap-2 pt-2 text-[10px]">
          <div>
            <span class="text-slate-400">Crop Top: ${ov.cropTop}%</span>
            <input type="range" min="0" max="45" value="${ov.cropTop}" oninput="updateOverlaySetting(${idx}, 'cropTop', parseInt(this.value)||0); this.previousElementSibling.textContent='Crop Top: '+this.value+'%'" class="w-full accent-emerald-400 cursor-pointer">
          </div>
          <div>
            <span class="text-slate-400">Crop Bottom: ${ov.cropBottom}%</span>
            <input type="range" min="0" max="45" value="${ov.cropBottom}" oninput="updateOverlaySetting(${idx}, 'cropBottom', parseInt(this.value)||0); this.previousElementSibling.textContent='Crop Bottom: '+this.value+'%'" class="w-full accent-emerald-400 cursor-pointer">
          </div>
          <div>
            <span class="text-slate-400">Crop Left: ${ov.cropLeft}%</span>
            <input type="range" min="0" max="45" value="${ov.cropLeft}" oninput="updateOverlaySetting(${idx}, 'cropLeft', parseInt(this.value)||0); this.previousElementSibling.textContent='Crop Left: '+this.value+'%'" class="w-full accent-emerald-400 cursor-pointer">
          </div>
          <div>
            <span class="text-slate-400">Crop Right: ${ov.cropRight}%</span>
            <input type="range" min="0" max="45" value="${ov.cropRight}" oninput="updateOverlaySetting(${idx}, 'cropRight', parseInt(this.value)||0); this.previousElementSibling.textContent='Crop Right: '+this.value+'%'" class="w-full accent-emerald-400 cursor-pointer">
          </div>
        </div>
      </details>
    </div>
  `).join('');

  lucide.createIcons();
}

function removeOverlayImage(idx) {
  imageOverlays.splice(idx, 1);
  renderOverlayImagesList();
}

function updateOverlaySetting(idx, key, val) {
  if (imageOverlays[idx]) {
    imageOverlays[idx][key] = val;
  }
}

function applyOverlayPreset(idx, preset) {
  if (!imageOverlays[idx]) return;
  const start = parseFloat(document.getElementById('trim-start')?.value) || 0;
  const end = parseFloat(document.getElementById('trim-end')?.value) || 10;
  const clipDuration = Math.max(1, end - start);

  if (preset === 'hook') {
    imageOverlays[idx].startTime = 0;
    imageOverlays[idx].endTime = Math.min(3.0, clipDuration);
  } else if (preset === 'mid') {
    imageOverlays[idx].startTime = Math.min(2.5, clipDuration * 0.25);
    imageOverlays[idx].endTime = Math.min(7.0, clipDuration * 0.85);
  } else if (preset === 'full') {
    imageOverlays[idx].startTime = 0;
    imageOverlays[idx].endTime = clipDuration;
  }
  renderOverlayImagesList();
}

let facecamFilter = 'none'; // 'none', 'crop_gameplay', 'cover_banner', 'blur_top'
let facecamHeight = 33;

function selectFacecamMode(mode) {
  facecamFilter = mode;
  document.querySelectorAll('.facecam-btn').forEach(btn => {
    btn.classList.remove('active', 'border-brand-cyan', 'bg-brand-cyan/10', 'text-white');
    btn.classList.add('border-brand-border', 'bg-brand-dark', 'text-slate-300');
  });

  const activeBtn = document.getElementById(`facecam-${mode}`);
  if (activeBtn) {
    activeBtn.classList.remove('border-brand-border', 'bg-brand-dark', 'text-slate-300');
    activeBtn.classList.add('active', 'border-brand-cyan', 'bg-brand-cyan/10', 'text-white');
  }

  const panel = document.getElementById('facecam-settings-panel');
  const bannerBox = document.getElementById('facecam-banner-input-box');

  if (mode === 'none') {
    panel.classList.add('hidden');
  } else {
    panel.classList.remove('hidden');
    if (mode === 'cover_banner') {
      bannerBox.classList.remove('hidden');
    } else {
      bannerBox.classList.add('hidden');
    }
  }
}

function updateFacecamHeight(val) {
  facecamHeight = parseInt(val) || 33;
  document.getElementById('facecam-height-val').textContent = `${val}% (Top portion)`;
}

let maskOldCaptions = false;

function toggleMaskOldCaptions(checked) {
  maskOldCaptions = !!checked;
  if (maskOldCaptions) {
    showToast('Wipe Old Captions active: existing center text will be smoothed over.', 'info');
  }
}

let hookCardMode = 'viral_white'; // 'viral_white', 'cod_tactical', 'wipe_only', 'none'
let bgMusicTrack = 'phonk_drift';
let origAudioMode = 'mute'; // 'mute', 'low', 'full'

// MULTI-AUDIO TRACKS PLAYLIST (supports multiple short MP3s with custom order)
let customAudioTracks = [];
let currentPreviewIdx = null;

function resetEditorState() {
  endCardSlides = [];
  customAudioTracks = [];
  imageOverlays = [];
  activeVideo = null;

  const subtitlesInput = document.getElementById('subtitles-input');
  if (subtitlesInput) subtitlesInput.value = '';
  const hookInput = document.getElementById('hookcard-text-input');
  if (hookInput) hookInput.value = '';
  const bannerInput = document.getElementById('facecam-banner-text');
  if (bannerInput) bannerInput.value = '';

  renderEndCardState();
  renderAudioPlaylist();

  // Reset source video player back to clean placeholder
  const videoPlayer = document.getElementById('source-video-player');
  if (videoPlayer) {
    videoPlayer.src = '';
    videoPlayer.classList.add('hidden');
  }
  const videoPrompt = document.getElementById('video-prompt-placeholder');
  if (videoPrompt) videoPrompt.classList.remove('hidden');

  // Reset rendered player container
  document.getElementById('rendered-video-container')?.classList.add('hidden');
  document.getElementById('render-empty')?.classList.remove('hidden');
  document.getElementById('render-done-badge')?.classList.add('hidden');

  showToast('Workspace reset! Ready for a fresh clip from scratch.', 'success');
}

function handleSelectBgMusic(track) {
  bgMusicTrack = track;
}

async function handleCustomAudioUpload(event) {
  const files = event.target.files;
  if (!files || files.length === 0) return;

  const formData = new FormData();
  for (let i = 0; i < files.length; i++) {
    formData.append('audio', files[i]);
  }

  try {
    showToast(`Uploading ${files.length} custom MP3 audio track(s)...`, 'info');
    const res = await fetch('/api/upload-custom-audio', {
      method: 'POST',
      body: formData
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Upload failed');

    const newTracks = data.tracks || [{
      filename: data.filename,
      originalname: data.filename,
      audioUrl: data.audioUrl,
      audioPath: data.audioPath,
      duration: data.duration || 5.0
    }];

    newTracks.forEach((t, i) => {
      customAudioTracks.push({
        id: 'track_' + Date.now() + '_' + i,
        filename: t.originalname || t.filename,
        audioUrl: t.audioUrl,
        audioPath: t.audioPath,
        duration: t.duration || 5.0
      });
    });

    renderAudioPlaylist();
    showToast(`Added ${newTracks.length} track(s) to Multi-Audio Playlist! Total: ${customAudioTracks.length} track(s).`, 'success');
  } catch (err) {
    console.error('Custom audio upload error:', err);
    showToast('Failed to upload custom audio: ' + err.message, 'error');
  } finally {
    event.target.value = '';
  }
}

function renderAudioPlaylist() {
  const emptyEl = document.getElementById('audio-playlist-empty');
  const itemsContainer = document.getElementById('custom-audio-playlist-items');
  const headerEl = document.getElementById('audio-playlist-header');
  const totalDurEl = document.getElementById('audio-total-duration');

  if (!itemsContainer) return;

  if (customAudioTracks.length === 0) {
    emptyEl?.classList.remove('hidden');
    itemsContainer.innerHTML = '';
    if (headerEl) headerEl.textContent = 'Custom Audio Sequencer (0 Tracks)';
    if (totalDurEl) totalDurEl.textContent = '0.0s total';
    return;
  }

  emptyEl?.classList.add('hidden');
  const totalDuration = customAudioTracks.reduce((acc, t) => acc + (parseFloat(t.duration) || 0), 0);
  if (headerEl) headerEl.textContent = `Custom Audio Sequencer (${customAudioTracks.length} Tracks)`;
  if (totalDurEl) totalDurEl.textContent = `${totalDuration.toFixed(1)}s total`;

  itemsContainer.innerHTML = customAudioTracks.map((track, idx) => {
    const isPlaying = (currentPreviewIdx === idx);
    const durStr = (parseFloat(track.duration) || 0).toFixed(1);
    const trackNum = idx + 1;
    const cleanName = track.filename || `Track ${trackNum}`;

    return `
      <div class="flex items-center justify-between p-2 rounded-lg bg-brand-dark/90 border border-brand-border/80 hover:border-slate-600 transition shadow-sm">
        <div class="flex items-center gap-2 overflow-hidden flex-1 min-w-0">
          <span class="text-[10px] font-bold px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono shrink-0">
            #${trackNum}
          </span>
          <button type="button" onclick="togglePlayAudioTrack(${idx})" class="w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${isPlaying ? 'bg-amber-400 text-black' : 'bg-brand-card hover:bg-slate-700 text-slate-200'} transition" title="${isPlaying ? 'Pause' : 'Play preview'}">
            ${isPlaying ? '<span class="text-[9px] font-bold">⏸</span>' : '<span class="text-[9px] font-bold">▶</span>'}
          </button>
          <div class="overflow-hidden flex-1 min-w-0">
            <div class="text-xs font-semibold text-slate-100 truncate">${cleanName}</div>
            <div class="text-[9px] text-slate-400 font-mono">${durStr}s • MP3</div>
          </div>
        </div>

        <div class="flex items-center gap-1 shrink-0 ml-2">
          ${idx > 0 ? `<button type="button" onclick="moveAudioTrack(${idx}, -1)" class="text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-black/40 hover:bg-white/10 text-xs font-bold transition" title="Move Track Up (Play earlier)">▲</button>` : ''}
          ${idx < customAudioTracks.length - 1 ? `<button type="button" onclick="moveAudioTrack(${idx}, 1)" class="text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-black/40 hover:bg-white/10 text-xs font-bold transition" title="Move Track Down (Play later)">▼</button>` : ''}
          <button type="button" onclick="removeAudioTrack(${idx})" class="text-slate-400 hover:text-rose-400 p-1 rounded hover:bg-rose-500/10 transition ml-1" title="Remove this sound clip">
            <i data-lucide="trash-2" class="w-3.5 h-3.5 text-rose-400"></i>
          </button>
        </div>
      </div>
    `;
  }).join('');

  lucide.createIcons();
}

function moveAudioTrack(idx, dir) {
  const targetIdx = idx + dir;
  if (targetIdx < 0 || targetIdx >= customAudioTracks.length) return;
  const temp = customAudioTracks[idx];
  customAudioTracks[idx] = customAudioTracks[targetIdx];
  customAudioTracks[targetIdx] = temp;
  renderAudioPlaylist();
  showToast(`Moved "${temp.filename}" to position #${targetIdx + 1}`, 'info');
}

function removeAudioTrack(idx) {
  const removed = customAudioTracks.splice(idx, 1);
  if (currentPreviewIdx === idx) {
    stopAudioPreview();
  } else if (currentPreviewIdx > idx) {
    currentPreviewIdx--;
  }
  renderAudioPlaylist();
  showToast(`Removed "${removed[0]?.filename || 'track'}" from playlist`, 'info');
}

function clearAllAudioTracks() {
  stopAudioPreview();
  customAudioTracks = [];
  renderAudioPlaylist();
  const input = document.getElementById('custom-audio-input');
  if (input) input.value = '';
  showToast('All custom audio tracks cleared.', 'info');
}

function togglePlayAudioTrack(idx) {
  const player = document.getElementById('audio-preview-player');
  if (!player || !customAudioTracks[idx]) return;

  if (currentPreviewIdx === idx && !player.paused) {
    player.pause();
    currentPreviewIdx = null;
    renderAudioPlaylist();
    return;
  }

  currentPreviewIdx = idx;
  player.src = customAudioTracks[idx].audioUrl;
  player.play().catch(err => console.log('Audio preview playback error:', err));
  renderAudioPlaylist();
}

function stopAudioPreview() {
  const player = document.getElementById('audio-preview-player');
  if (player) {
    player.pause();
    player.src = '';
  }
  currentPreviewIdx = null;
}

function onAudioPreviewEnded() {
  currentPreviewIdx = null;
  renderAudioPlaylist();
}

function selectOrigAudioMode(mode) {
  origAudioMode = mode;
  document.querySelectorAll('.origaudio-btn').forEach(btn => {
    btn.classList.remove('active', 'border-brand-cyan', 'bg-brand-cyan/10', 'text-white');
    btn.classList.add('border-brand-border', 'bg-brand-dark', 'text-slate-300');
  });

  const activeBtn = document.getElementById(`origaudio-${mode}`);
  if (activeBtn) {
    activeBtn.classList.add('active', 'border-brand-cyan', 'bg-brand-cyan/10', 'text-white');
    activeBtn.classList.remove('border-brand-border', 'bg-brand-dark', 'text-slate-300');
  }
}

// ==========================================
// VIRAL SOUNDS MODAL & URL AUDIO EXTRACTOR
// ==========================================
function openViralSoundsModal() {
  const modal = document.getElementById('viral-sounds-modal');
  if (modal) {
    modal.classList.remove('hidden');
    lucide.createIcons();
  }
}

function closeViralSoundsModal() {
  const modal = document.getElementById('viral-sounds-modal');
  if (modal) {
    modal.classList.add('hidden');
  }
}

async function handleExtractAudioFromUrl(inputId = 'audio-url-input', btnId = 'extract-audio-url-btn') {
  const urlInput = document.getElementById(inputId);
  const url = urlInput?.value?.trim();
  if (!url) {
    showToast('Please paste a TikTok or YouTube URL first.', 'error');
    return;
  }

  const btn = document.getElementById(btnId);
  const originalHtml = btn?.innerHTML || 'Extract MP3';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="w-3.5 h-3.5 border-2 border-black/30 border-t-black rounded-full animate-spin"></span> <span>Extracting...</span>`;
  }

  try {
    showToast('Downloading viral audio via yt-dlp...', 'info');
    const res = await fetch('/api/download-audio-url', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to extract audio');

    const newTrack = {
      id: 'track_' + Date.now(),
      filename: data.title || data.filename,
      audioUrl: data.audioUrl,
      audioPath: data.audioPath,
      duration: data.duration || 15.0
    };
    customAudioTracks.push(newTrack);
    renderAudioPlaylist();

    urlInput.value = '';
    closeViralSoundsModal();
    showToast(`Added viral audio "${newTrack.filename}" to playlist!`, 'success');
  } catch (err) {
    console.error('Audio download error:', err);
    showToast(err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
    }
    lucide.createIcons();
  }
}

function selectHookCardMode(mode) {
  hookCardMode = mode;
  document.querySelectorAll('.hookcard-btn').forEach(btn => {
    btn.classList.remove('active', 'border-brand-cyan', 'bg-brand-cyan/10', 'text-white');
    btn.classList.add('border-brand-border', 'bg-brand-dark', 'text-slate-300');
  });

  const activeBtn = document.getElementById(`hookcard-${mode}`);
  if (activeBtn) {
    activeBtn.classList.remove('border-brand-border', 'bg-brand-dark', 'text-slate-300');
    activeBtn.classList.add('active', 'border-brand-cyan', 'bg-brand-cyan/10', 'text-white');
  }

  const inputBox = document.getElementById('hookcard-input-box');
  if (inputBox) {
    if (mode === 'none' || mode === 'wipe_only') {
      inputBox.classList.add('hidden');
    } else {
      inputBox.classList.remove('hidden');
    }
  }
}

function selectSubStyle(style) {
  subtitleStyle = style;
  document.querySelectorAll('.substyle-btn').forEach(btn => btn.classList.remove('active'));
  document.getElementById(`substyle-${style}`).classList.add('active');
}

function clearSubtitles() {
  document.getElementById('subtitles-input').value = '';
}

async function startRenderShort() {
  if (!activeVideo.path) {
    showToast('Please upload a video or click "Use Demo Video" first.', 'error');
    return;
  }

  const startTime = parseFloat(document.getElementById('trim-start').value) || 0;
  const endTime = parseFloat(document.getElementById('trim-end').value) || 10;
  const subtitleText = document.getElementById('subtitles-input').value.trim();

  // Show loading
  document.getElementById('render-empty').classList.add('hidden');
  document.getElementById('rendered-video-container').classList.add('hidden');
  document.getElementById('render-loading').classList.remove('hidden');
  document.getElementById('render-done-badge').classList.add('hidden');

  const renderBtn = document.getElementById('render-btn');
  renderBtn.disabled = true;
  renderBtn.classList.add('opacity-50');

  try {
    const res = await fetch('/api/render-short', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        videoPath: activeVideo.path,
        startTime,
        endTime,
        layoutMode,
        manualCrop,
        facecamFilter,
        facecamHeight,
        maskOldCaptions,
        hookCardMode,
        hookCardText: document.getElementById('hookcard-text-input')?.value?.trim() || '',
        imageOverlays: pictureMode === 'invideo' ? imageOverlays : [],
        endCards: pictureMode === 'endcard' ? endCardSlides : [],
        endCard: (pictureMode === 'endcard' && endCardSlides.length > 0) ? endCardSlides[0] : null,
        bgMusicTrack,
        customAudioPath: customAudioTracks.length > 0 ? customAudioTracks[0].audioPath : null,
        customAudioTracks,
        origAudioMode,
        bannerText: document.getElementById('facecam-banner-text')?.value?.trim() || '',
        subtitleStyle,
        subtitlePosition,
        subtitleText,
        subtitlePacing,
        aiVoice: selectedAiVoice
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Render failed');

    // Display finished video
    const renderedPlayer = document.getElementById('rendered-video-player');
    renderedPlayer.src = data.outputUrl;
    renderedPlayer.volume = 1.0;
    renderedPlayer.muted = false;
    renderedPlayer.load();
    renderedPlayer.play().catch(() => {});

    const downloadBtn = document.getElementById('download-clip-btn');
    downloadBtn.href = data.outputUrl;
    downloadBtn.download = data.filename;

    document.getElementById('render-loading').classList.add('hidden');
    document.getElementById('rendered-video-container').classList.remove('hidden');
    document.getElementById('render-done-badge').classList.remove('hidden');

    showToast('Short clip rendered successfully in 9:16 vertical format!', 'success');
  } catch (err) {
    console.error('Render error:', err);
    document.getElementById('render-loading').classList.add('hidden');
    document.getElementById('render-empty').classList.remove('hidden');
    showToast(err.message, 'error');
  } finally {
    renderBtn.disabled = false;
    renderBtn.classList.remove('opacity-50');
  }
}

// ==========================================
// 1-CLICK FULL VIDEO AUTO-GENERATOR
// ==========================================
function autoCreateVideoFromScript() {
  if (!currentScript) {
    showToast('Please generate a script first', 'error');
    return;
  }

  const hook = currentScript.hooks[selectedHookIndex].spoken;
  const body = currentScript.segments.slice(1, 4).map(s => s.spoken).join(' ');
  const cta = currentScript.endingCTA || '';
  const fullSpoken = `${hook} ${body} ${cta}`.trim();

  document.getElementById('subtitles-input').value = fullSpoken;

  // Auto-populate hook title card input
  const hookCardInput = document.getElementById('hookcard-text-input');
  if (hookCardInput && currentScript.hooks && currentScript.hooks[selectedHookIndex]) {
    const rawHook = currentScript.hooks[selectedHookIndex].text || currentScript.hooks[selectedHookIndex].spoken;
    hookCardInput.value = `“${rawHook.length > 55 ? rawHook.slice(0, 52) + '...' : rawHook} 💀🔥”`;
  }

  switchTab('clipper');
  showToast('Starting 1-Click Auto-Creation with AI Voiceover & Phonk Beat!', 'info');

  // Trigger full auto render
  setTimeout(() => {
    autoCreateFullVideo();
  }, 400);
}

async function autoCreateFullVideo() {
  const scriptText = document.getElementById('subtitles-input').value.trim();
  if (!scriptText) {
    showToast('Please enter script text or generate a script in Tab 2 first.', 'error');
    return;
  }

  // Show loading
  document.getElementById('render-empty').classList.add('hidden');
  document.getElementById('rendered-video-container').classList.add('hidden');
  document.getElementById('render-loading').classList.remove('hidden');
  document.getElementById('render-done-badge').classList.add('hidden');

  const autoBtn = document.getElementById('auto-create-btn');
  const originalHtml = autoBtn.innerHTML;
  autoBtn.disabled = true;
  autoBtn.innerHTML = `<span class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span> Auto-Creating Voiceover & Video...`;

  try {
    const res = await fetch('/api/auto-create-video', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scriptText,
        videoPath: activeVideo ? activeVideo.path : null,
        startTime: parseFloat(document.getElementById('trim-start').value) || 0,
        layoutMode: layoutMode || 'blur_pad',
        manualCrop,
        facecamFilter,
        facecamHeight,
        maskOldCaptions,
        hookCardMode,
        hookCardText: document.getElementById('hookcard-text-input')?.value?.trim() || '',
        imageOverlays: pictureMode === 'invideo' ? imageOverlays : [],
        endCards: pictureMode === 'endcard' ? endCardSlides : [],
        endCard: (pictureMode === 'endcard' && endCardSlides.length > 0) ? endCardSlides[0] : null,
        bgMusicTrack,
        customAudioPath: customAudioTracks.length > 0 ? customAudioTracks[0].audioPath : null,
        customAudioTracks,
        origAudioMode,
        bannerText: document.getElementById('facecam-banner-text')?.value?.trim() || '',
        backgroundType: autoBgType,
        subtitleStyle,
        subtitlePosition,
        subtitlePacing,
        includeBeat: true,
        aiVoice: selectedAiVoice
      })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.details || 'Auto-creation failed');

    // Display finished video
    const renderedPlayer = document.getElementById('rendered-video-player');
    renderedPlayer.src = data.outputUrl;
    renderedPlayer.load();

    const downloadBtn = document.getElementById('download-clip-btn');
    downloadBtn.href = data.outputUrl;
    downloadBtn.download = data.filename;

    document.getElementById('render-loading').classList.add('hidden');
    document.getElementById('rendered-video-container').classList.remove('hidden');
    document.getElementById('render-done-badge').classList.remove('hidden');

    showToast(`Full ${data.duration}s video auto-created with Voiceover & Subtitles!`, 'success');

    // Autoplay preview
    renderedPlayer.play().catch(() => {});
  } catch (err) {
    console.error('Auto create error:', err);
    document.getElementById('render-loading').classList.add('hidden');
    document.getElementById('render-empty').classList.remove('hidden');
    showToast(err.message, 'error');
  } finally {
    autoBtn.disabled = false;
    autoBtn.innerHTML = originalHtml;
    lucide.createIcons();
  }
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'info') {
  const toast = document.getElementById('toast');
  const msg = document.getElementById('toast-msg');
  const icon = document.getElementById('toast-icon');

  msg.textContent = message;

  if (type === 'error') {
    icon.setAttribute('data-lucide', 'alert-circle');
    icon.className = 'w-5 h-5 text-brand-red';
  } else if (type === 'success') {
    icon.setAttribute('data-lucide', 'check-circle-2');
    icon.className = 'w-5 h-5 text-emerald-400';
  } else {
    icon.setAttribute('data-lucide', 'info');
    icon.className = 'w-5 h-5 text-brand-cyan';
  }

  lucide.createIcons();

  toast.classList.add('show');
  setTimeout(() => {
    toast.classList.remove('show');
  }, 3500);
}

// ==========================================
// TAB 4: VIRAL HASHTAGS & TIKTOK SEO
// ==========================================
let currentHashtagsData = null;
let selectedCaptionIndex = 0;

function handleGenerateHashtags(event) {
  if (event) event.preventDefault();
  const input = document.getElementById('hashtag-topic-input');
  const keyword = input ? input.value.trim() : 'warzone clips';
  loadHashtagsData(keyword || 'warzone clips');
}

function setHashtagTopic(topic) {
  const input = document.getElementById('hashtag-topic-input');
  if (input) input.value = topic;
  loadHashtagsData(topic);
}

function sendToHashtagsGenerator() {
  const subText = document.getElementById('subtitles-input')?.value?.trim() || '';
  let topic = 'warzone clips';
  if (/smg|loadout|class|build|attachment|recoil/i.test(subText)) {
    topic = 'broken smg loadout';
  } else if (/sniper|quickscope|headshot|kar98/i.test(subText)) {
    topic = 'rebirth island sniper';
  } else if (/movement|slide|camera|speed/i.test(subText)) {
    topic = 'camera break movement';
  } else if (/rage|death comm|hot mic|scream/i.test(subText)) {
    topic = 'funny death comms rage';
  } else if (/clutch|1v4|wipe|squad/i.test(subText)) {
    topic = '1v4 squad wipe clutch';
  }

  const topicInput = document.getElementById('hashtag-topic-input');
  if (topicInput) topicInput.value = topic;

  switchTab('hashtags');
  loadHashtagsData(topic);
  showToast(`Generated viral hashtags & captions for: "${topic}"!`, 'success');
}

async function loadHashtagsData(keyword = 'warzone clips') {
  const btn = document.getElementById('gen-hashtags-btn');
  const originalHtml = btn ? btn.innerHTML : '';
  if (btn) {
    btn.disabled = true;
    btn.innerHTML = `<span class="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></span> Generating...`;
  }

  try {
    const res = await fetch('/api/generate-captions-hashtags', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ keyword })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to generate hashtags');

    currentHashtagsData = data;
    selectedCaptionIndex = 0;
    renderHashtagsData(data);
  } catch (err) {
    console.error('Hashtags generation error:', err);
    showToast('Failed to generate captions & hashtags: ' + err.message, 'error');
  } finally {
    if (btn) {
      btn.disabled = false;
      btn.innerHTML = originalHtml;
      lucide.createIcons();
    }
  }
}

function renderHashtagsData(data) {
  if (!data) return;

  // 1. Render Hook Captions
  const captionsList = document.getElementById('captions-list');
  if (captionsList && data.captions) {
    captionsList.innerHTML = data.captions.map((cap, idx) => {
      const isSelected = idx === selectedCaptionIndex;
      const borderClass = isSelected
        ? 'border-brand-cyan bg-brand-cyan/10 ring-1 ring-brand-cyan'
        : 'border-brand-border bg-brand-card hover:border-slate-500';
      const charCount = cap.text.length;

      return `
        <div onclick="selectCaptionForBundle(${idx})" class="p-4 rounded-xl border ${borderClass} cursor-pointer transition flex flex-col justify-between gap-3 shadow-md group">
          <div class="flex items-start justify-between gap-2">
            <div>
              <div class="flex items-center gap-2 mb-1.5 flex-wrap">
                <span class="text-xs font-bold text-white">${cap.title}</span>
                <span class="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold">
                  ${cap.hookScore}
                </span>
              </div>
              <p class="text-xs text-slate-200 leading-relaxed font-sans">${cap.text}</p>
            </div>
            ${isSelected ? '<span class="text-[9px] bg-brand-cyan text-black px-2 py-0.5 rounded-full font-black uppercase tracking-wider shrink-0 shadow">Active</span>' : ''}
          </div>

          <div class="flex items-center justify-between text-[11px] pt-2 border-t border-brand-border/40 text-slate-400">
            <span class="font-mono text-[10px] ${charCount <= 150 ? 'text-emerald-400 font-semibold' : 'text-amber-400'}">
              ${charCount} chars ${charCount <= 150 ? '✓ (Safe under 150)' : '⚠️'}
            </span>
            <button type="button" onclick="event.stopPropagation(); copyCaptionText('${cap.text.replace(/'/g, "\\'")}')" class="hover:text-white flex items-center gap-1 font-semibold text-brand-cyan transition">
              <i data-lucide="copy" class="w-3 h-3"></i>
              Copy Hook
            </button>
          </div>
        </div>
      `;
    }).join('');
  }

  // 2. Render Hashtag Tiers
  const megaContainer = document.getElementById('tier-mega-tags');
  if (megaContainer && data.hashtags && data.hashtags.mega) {
    megaContainer.innerHTML = data.hashtags.mega.map(tag => `
      <button type="button" onclick="copyTag('${tag}')" class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-amber-500/10 text-amber-300 border border-amber-500/30 hover:bg-amber-500/20 hover:text-white transition flex items-center gap-1">
        <span>${tag}</span>
        <i data-lucide="copy" class="w-2.5 h-2.5 opacity-60"></i>
      </button>
    `).join('');
  }

  const nicheContainer = document.getElementById('tier-niche-tags');
  if (nicheContainer && data.hashtags && data.hashtags.niche) {
    nicheContainer.innerHTML = data.hashtags.niche.map(tag => `
      <button type="button" onclick="copyTag('${tag}')" class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-brand-cyan/10 text-brand-cyan border border-brand-cyan/30 hover:bg-brand-cyan/20 hover:text-white transition flex items-center gap-1">
        <span>${tag}</span>
        <i data-lucide="copy" class="w-2.5 h-2.5 opacity-60"></i>
      </button>
    `).join('');
  }

  const algoContainer = document.getElementById('tier-algo-tags');
  if (algoContainer && data.hashtags && data.hashtags.algorithm) {
    algoContainer.innerHTML = data.hashtags.algorithm.map(tag => `
      <button type="button" onclick="copyTag('${tag}')" class="px-2.5 py-1 rounded-lg text-xs font-mono font-medium bg-brand-red/10 text-brand-red border border-brand-red/30 hover:bg-brand-red/20 hover:text-white transition flex items-center gap-1">
        <span>${tag}</span>
        <i data-lucide="copy" class="w-2.5 h-2.5 opacity-60"></i>
      </button>
    `).join('');
  }

  // 3. Render SEO Tips
  const tipsContainer = document.getElementById('seo-tips-list');
  if (tipsContainer && data.seoTips) {
    tipsContainer.innerHTML = data.seoTips.map(tip => `
      <div class="flex items-start gap-2 p-2.5 rounded-xl bg-brand-dark/50 border border-brand-border/60">
        <span class="text-xs leading-relaxed text-slate-300">${tip}</span>
      </div>
    `).join('');
  }

  // 4. Update Bundle Preview Box
  updateBundlePreview();
  lucide.createIcons();
}

function selectCaptionForBundle(idx) {
  selectedCaptionIndex = idx;
  if (currentHashtagsData) {
    renderHashtagsData(currentHashtagsData);
  }
}

function updateBundlePreview() {
  if (!currentHashtagsData || !currentHashtagsData.captions) return;

  const captionObj = currentHashtagsData.captions[selectedCaptionIndex] || currentHashtagsData.captions[0];
  const tagsStack = currentHashtagsData.recommendedStack || '';
  const fullBundle = `${captionObj.text}\n\n${tagsStack}`.trim();

  const previewBox = document.getElementById('bundle-preview-text');
  if (previewBox) {
    previewBox.textContent = fullBundle;
  }

  const lengthBadge = document.getElementById('caption-length-badge');
  if (lengthBadge) {
    const totalChars = captionObj.text.length;
    if (totalChars <= 150) {
      lengthBadge.className = 'text-xs font-mono px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400';
      lengthBadge.textContent = `${totalChars} / 150 chars (Optimal Hook ✓)`;
    } else {
      lengthBadge.className = 'text-xs font-mono px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-300';
      lengthBadge.textContent = `${totalChars} / 150 chars (May Truncate behind "more")`;
    }
  }
}

function copyFullBundle() {
  const previewBox = document.getElementById('bundle-preview-text');
  if (!previewBox) return;

  const text = previewBox.textContent;
  navigator.clipboard.writeText(text).then(() => {
    showToast('Ready-to-Post TikTok Bundle copied to clipboard!', 'success');
    const btnText = document.getElementById('copy-bundle-btn-text');
    if (btnText) {
      const orig = btnText.textContent;
      btnText.textContent = 'Copied! ✓';
      setTimeout(() => { btnText.textContent = orig; }, 2000);
    }
  }).catch(() => {
    showToast('Failed to copy. Please select text manually.', 'error');
  });
}

function copyAllHashtags() {
  if (!currentHashtagsData || !currentHashtagsData.hashtags) return;
  const allTags = currentHashtagsData.hashtags.all.join(' ');
  navigator.clipboard.writeText(allTags).then(() => {
    showToast('All hashtags copied to clipboard!', 'success');
  }).catch(() => {
    showToast('Failed to copy hashtags.', 'error');
  });
}

function copyTag(tag) {
  navigator.clipboard.writeText(tag).then(() => {
    showToast(`Copied ${tag}`, 'info');
  });
}

function copyCaptionText(text) {
  navigator.clipboard.writeText(text).then(() => {
    showToast('Caption hook copied to clipboard!', 'info');
  });
}
