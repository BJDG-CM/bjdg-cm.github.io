(() => {
  'use strict';

  const config = window.YEJUN_SITE_CONFIG;
  if (!config) return;

  const state = { sites: [], query: '', category: 'All', source: 'fallback' };
  const els = {
    header: document.getElementById('site-header'),
    summary: document.getElementById('category-summary'),
    grid: document.getElementById('site-grid'),
    filters: document.getElementById('filter-row'),
    search: document.getElementById('site-search'),
    resultCount: document.getElementById('result-count'),
    reset: document.getElementById('reset-filters'),
    empty: document.getElementById('empty-state'),
    sync: document.getElementById('sync-state'),
    backToTop: document.getElementById('back-to-top')
  };

  const palette = ['#3b82f6', '#10b39a', '#f5943a', '#8b5cf6', '#f16a6a', '#ec6aa6', '#0ea5e9', '#22c55e'];
  const hashColor = (name) => palette[[...name].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length];
  const cleanTags = (values) => [...new Set((values || []).filter(Boolean).map(String))].slice(0, 5);
  const siteUrl = (repoName) => `https://${config.owner.toLowerCase()}.github.io/${encodeURIComponent(repoName)}/`;

  function normalizeRepo(repo, isLiveDiscovery = false) {
    const override = config.overrides[repo.name] || {};
    const accent = override.accentColor || hashColor(repo.name);
    const category = override.category || inferCategory(repo);
    return {
      id: repo.name,
      repoName: repo.name,
      name: override.name || titleFromRepo(repo.name),
      kr: override.kr || '',
      url: override.url || siteUrl(repo.name),
      repo: repo.html_url || `https://github.com/${config.owner}/${repo.name}`,
      description: override.description || repo.description || 'GitHub Pages로 공개된 웹 프로젝트입니다.',
      category,
      preview: override.preview || acronym(repo.name),
      accentColor: accent,
      onAccent: override.onAccent || '#ffffff',
      featured: Boolean(override.featured),
      tags: cleanTags(override.tags || [repo.language, ...(repo.topics || [])]),
      updatedAt: repo.updated_at || null,
      autoDiscovered: !config.overrides[repo.name] && isLiveDiscovery
    };
  }

  function fallbackSites() {
    return Object.entries(config.overrides).map(([name, override]) => normalizeRepo({
      name,
      html_url: `https://github.com/${config.owner}/${name}`,
      description: override.description,
      language: null,
      topics: [],
      updated_at: null
    }));
  }

  function inferCategory(repo) {
    const text = `${repo.name} ${repo.description || ''} ${(repo.topics || []).join(' ')}`.toLowerCase();
    if (/blog|article|news|writing/.test(text)) return 'Content';
    if (/gist|campus|graduation|school/.test(text)) return 'Campus';
    if (/tool|drive|calc|download|utility|clipboard/.test(text)) return 'Utility';
    if (/profile|homepage|portfolio/.test(text)) return 'Portfolio';
    return 'Other';
  }

  function titleFromRepo(name) {
    return name.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase());
  }

  function acronym(name) {
    const words = name.split(/[-_\s]+/).filter(Boolean);
    if (words.length > 1) return words.slice(0, 3).map((word) => word[0]).join('').toUpperCase();
    return name.replace(/[^a-z0-9]/gi, '').slice(0, 4).toUpperCase() || 'WEB';
  }

  async function fetchGenerated() {
    try {
      const response = await fetch(`data/sites.generated.json?v=${Date.now()}`, { cache: 'no-store' });
      if (!response.ok) throw new Error(`generated data ${response.status}`);
      const payload = await response.json();
      return Array.isArray(payload.sites) ? payload.sites.map((repo) => normalizeRepo(repo)) : [];
    } catch (_) {
      return [];
    }
  }

  async function fetchLiveRepos() {
    const response = await fetch(`https://api.github.com/users/${config.owner}/repos?per_page=100&type=owner&sort=updated`, {
      headers: { Accept: 'application/vnd.github+json' }
    });
    if (!response.ok) throw new Error(`GitHub API ${response.status}`);
    const repos = await response.json();
    return repos
      .filter((repo) => repo.has_pages && !repo.archived && !repo.disabled && !config.hiddenRepositories.includes(repo.name))
      .map((repo) => normalizeRepo(repo, true));
  }

  function mergeSites(...groups) {
    const merged = new Map();
    groups.flat().forEach((site) => {
      const current = merged.get(site.repoName);
      merged.set(site.repoName, current ? { ...current, ...site, autoDiscovered: current.autoDiscovered || site.autoDiscovered } : site);
    });
    return [...merged.values()].sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      const aIndex = Object.keys(config.overrides).indexOf(a.repoName);
      const bIndex = Object.keys(config.overrides).indexOf(b.repoName);
      if (aIndex !== -1 || bIndex !== -1) return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
      return new Date(b.updatedAt || 0) - new Date(a.updatedAt || 0) || a.name.localeCompare(b.name);
    });
  }

  function filteredSites() {
    const query = state.query.trim().toLowerCase();
    return state.sites.filter((site) => {
      if (state.category !== 'All' && site.category !== state.category) return false;
      if (!query) return true;
      return [site.name, site.kr, site.description, site.category, ...(site.tags || [])].join(' ').toLowerCase().includes(query);
    });
  }

  function categoryCounts() {
    const counts = {};
    state.sites.forEach((site) => { counts[site.category] = (counts[site.category] || 0) + 1; });
    return counts;
  }

  function renderSummary() {
    const counts = categoryCounts();
    const keys = Object.keys(config.categories).filter((key) => key !== 'All' && counts[key]);
    els.summary.innerHTML = keys.map((key) => {
      const meta = config.categories[key];
      return `<button class="summary-card" type="button" role="listitem" data-pick-category="${key}" style="background:linear-gradient(140deg,${meta.color},color-mix(in srgb,${meta.color} 76%,#0e1018));--summary-shadow:color-mix(in srgb,${meta.color} 70%,transparent)">
        <strong>${counts[key]}</strong><span>${meta.label}<small>${meta.en}</small></span>
      </button>`;
    }).join('');
  }

  function renderFilters() {
    const counts = categoryCounts();
    const keys = Object.keys(config.categories).filter((key) => key === 'All' || counts[key]);
    els.filters.innerHTML = keys.map((key) => {
      const meta = config.categories[key];
      const count = key === 'All' ? state.sites.length : counts[key];
      const active = state.category === key;
      return `<button type="button" data-category="${key}" aria-pressed="${active}" style="--filter-color:${meta.color};--filter-on:${meta.onColor}">${meta.label} ${count}</button>`;
    }).join('');
  }

  function renderGrid() {
    const sites = filteredSites();
    els.resultCount.textContent = String(sites.length);
    els.grid.setAttribute('aria-busy', 'false');
    els.empty.hidden = sites.length !== 0;
    els.grid.hidden = sites.length === 0;
    els.grid.innerHTML = sites.map((site, index) => cardHtml(site, index)).join('');
  }

  function cardHtml(site, index) {
    const category = config.categories[site.category] || config.categories.Other;
    const solid = site.featured;
    const previewBg = solid
      ? `linear-gradient(140deg,${site.accentColor},color-mix(in srgb,${site.accentColor} 68%,#0e1018))`
      : `color-mix(in srgb,${site.accentColor} 9%,var(--surface))`;
    const previewColor = solid ? '#fff' : site.accentColor;
    const tags = (site.tags.length ? site.tags : ['GitHub Pages']).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('');
    return `<article class="site-card${site.featured ? ' featured' : ''}" style="--accent:${site.accentColor};--on-accent:${site.onAccent};--preview-bg:${previewBg};--delay:${Math.min(index * 42, 420)}ms">
      <div class="card-preview" style="color:${previewColor}">
        <span class="category-badge">${category.en}</span>
        ${site.autoDiscovered ? '<span class="auto-badge">AUTO</span>' : ''}
        <div class="preview-symbol" aria-hidden="true"><div class="preview-window"></div><strong>${escapeHtml(site.preview)}</strong></div>
      </div>
      <div class="card-body">
        <div class="card-title"><h3>${escapeHtml(site.name)}</h3><p>${escapeHtml(site.url.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</p></div>
        <p class="card-description">${escapeHtml(site.description)}</p>
        <div class="tag-list">${tags}</div>
        <div class="card-actions">
          <a class="open-site" href="${escapeAttr(site.url)}" target="_blank" rel="noopener noreferrer">사이트 열기 <span aria-hidden="true">↗</span></a>
          <a class="open-repo" href="${escapeAttr(site.repo)}" target="_blank" rel="noopener noreferrer" aria-label="${escapeAttr(site.name)} GitHub 저장소">Repo <span aria-hidden="true">↗</span></a>
        </div>
      </div>
    </article>`;
  }

  function render() {
    if (state.category !== 'All' && !state.sites.some((site) => site.category === state.category)) state.category = 'All';
    renderSummary();
    renderFilters();
    renderGrid();
  }

  function setTheme(choice) {
    const dark = choice === 'dark' || (choice === 'system' && matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.dataset.theme = dark ? 'dark' : 'light';
    document.documentElement.dataset.themeChoice = choice;
    try { localStorage.setItem('yw-theme', choice); } catch (_) {}
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', dark ? '#0f1220' : '#f4f5f9');
    document.querySelectorAll('[data-theme-choice]').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.themeChoice === choice)));
  }

  function escapeHtml(value) {
    return String(value).replace(/[&<>'"]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[char]));
  }
  const escapeAttr = escapeHtml;

  document.addEventListener('click', (event) => {
    const themeButton = event.target.closest('[data-theme-choice]');
    if (themeButton) setTheme(themeButton.dataset.themeChoice);

    const categoryButton = event.target.closest('[data-category]');
    if (categoryButton) { state.category = categoryButton.dataset.category; render(); }

    const summaryButton = event.target.closest('[data-pick-category]');
    if (summaryButton) {
      state.category = summaryButton.dataset.pickCategory;
      render();
      document.getElementById('directory').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
    }

    if (event.target.closest('[data-reset]')) { state.query = ''; state.category = 'All'; els.search.value = ''; render(); }
  });

  els.search.addEventListener('input', (event) => { state.query = event.target.value; renderGrid(); });
  els.reset.addEventListener('click', () => { state.query = ''; state.category = 'All'; els.search.value = ''; render(); });
  els.backToTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' }));

  const onScroll = () => {
    const scrolled = window.scrollY > 10;
    els.header.classList.toggle('scrolled', scrolled);
    els.backToTop.classList.toggle('visible', window.scrollY > 500);
  };
  addEventListener('scroll', onScroll, { passive: true });

  const media = matchMedia('(prefers-color-scheme: dark)');
  media.addEventListener?.('change', () => {
    if ((localStorage.getItem('yw-theme') || 'system') === 'system') setTheme('system');
  });

  async function init() {
    setTheme(document.documentElement.dataset.themeChoice || 'system');
    document.getElementById('current-year').textContent = String(new Date().getFullYear());

    const fallback = fallbackSites();
    const generated = await fetchGenerated();
    state.sites = mergeSites(fallback, generated);
    state.source = generated.length ? 'generated' : 'fallback';
    els.sync.textContent = generated.length ? `자동 동기화 목록 · ${state.sites.length}개` : `기본 목록 · ${state.sites.length}개`;
    render();

    try {
      const live = await fetchLiveRepos();
      state.sites = mergeSites(fallback, generated, live);
      state.source = 'live';
      els.sync.textContent = `GitHub Pages 자동 탐색 · ${state.sites.length}개`;
      render();
    } catch (error) {
      els.sync.textContent = state.source === 'generated' ? `최근 동기화 목록 · ${state.sites.length}개` : `기본 목록 · GitHub 확인 지연`;
      console.warn('GitHub Pages live discovery failed:', error);
    }
  }

  init();
})();
