// ============================================================
// تقييم الأعمال الفنية — منطق التطبيق (محدّث بكل الفجوات)
// ============================================================

// --- الحالة ---
const state = {
  view: 'home',
  library: [],
  system: null,
  activeDraft: null,
  editMemory: {},
  current: null,
  currentDetailsId: null,
  filters: { medium: 'all', format: 'all', sort: 'desc' },
  sysTab: 'criteria',
  editingId: null,
  wizardData: { name: '', medium: null, format: null, relation: null, nature: null },
  expandedCriteria: new Set(),
  theme: 'dark'
};

// --- التهيئة ---
function init() {
  state.system = getEffectiveSystem();
  state.library = loadFromStorage('eval_library', []);
  state.activeDraft = loadFromStorage('eval_active_draft', null);
  state.editMemory = loadFromStorage('eval_edit_memory', {});

  initTheme();
  render();

  // فحص المسودة النشطة — لها الأولوية على ذاكرة التحرير
  if (state.activeDraft && state.activeDraft.draftState === 'active') {
    showActiveDraftAlert();
  }
}

// --- الثيم ---
function initTheme() {
  try {
    state.theme = (_localStorageAvailable ? localStorage.getItem('eval_theme') : null) ||
      (matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light');
  } catch(e) {
    state.theme = matchMedia('(prefers-color-scheme:dark)').matches ? 'dark' : 'light';
  }
  document.documentElement.setAttribute('data-theme', state.theme);
}

function toggleTheme() {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', state.theme);
  if (_localStorageAvailable) { try { localStorage.setItem('eval_theme', state.theme); } catch(e) {} }
  render();
}

// --- العرض الرئيسي ---
function render() {
  const app = document.getElementById('app');
  app.innerHTML = '';

  switch (state.view) {
    case 'home': renderHome(app); break;
    case 'wizard': renderWizard(app); break;
    case 'evaluation': renderEvaluation(app); break;
    case 'details': renderDetails(app); break;
    case 'system': renderSystemManagement(app); break;
  }
}

// --- الهيدر ---
function renderHeader(container, showBack) {
  const header = document.createElement('div');
  header.className = 'app-header';

  if (showBack) {
    const back = document.createElement('button');
    back.className = 'eval-back';
    back.innerHTML = '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
    back.onclick = () => goHome();
    header.appendChild(back);
  } else {
    const logo = document.createElement('div');
    logo.className = 'logo';
    logo.innerHTML = '<svg width="28" height="28" viewBox="0 0 100 100"><circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" stroke-width="6" style="color:var(--color-primary)"/><circle cx="50" cy="50" r="8" fill="currentColor" style="color:var(--color-primary)"/></svg><span>تقييم الأعمال</span>';
    header.appendChild(logo);
  }

  const themeBtn = document.createElement('button');
  themeBtn.className = 'theme-toggle';
  themeBtn.innerHTML = state.theme === 'dark'
    ? '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>'
    : '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>';
  themeBtn.onclick = toggleTheme;
  themeBtn.setAttribute('aria-label', 'تبديل الثيم');
  header.appendChild(themeBtn);

  container.appendChild(header);
}

// --- الصفحة الرئيسية ---
function renderHome(container) {
  renderHeader(container, false);

  const actions = document.createElement('div');
  actions.className = 'home-actions';

  const newBtn = document.createElement('button');
  newBtn.className = 'btn btn-primary';
  newBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> تقييم جديد';
  newBtn.onclick = () => startNewEvaluation();
  actions.appendChild(newBtn);

  const sysBtn = document.createElement('button');
  sysBtn.className = 'btn btn-secondary';
  sysBtn.innerHTML = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg> إدارة النظام';
  sysBtn.onclick = () => { state.view = 'system'; state.sysTab = 'criteria'; render(); };
  actions.appendChild(sysBtn);

  container.appendChild(actions);

  // الفلترة والترتيب
  const filters = document.createElement('div');
  filters.className = 'filters';

  const mediumSelect = document.createElement('select');
  mediumSelect.className = 'filter-select';
  mediumSelect.innerHTML = '<option value="all">كل الوسائط</option>' +
    Object.entries(MEDIA).map(([k,v]) => `<option value="${k}" ${state.filters.medium===k?'selected':''}>${v}</option>`).join('');
  mediumSelect.onchange = (e) => { state.filters.medium = e.target.value; render(); };
  filters.appendChild(mediumSelect);

  const formatSelect = document.createElement('select');
  formatSelect.className = 'filter-select';
  formatSelect.innerHTML = '<option value="all">كل الصيغ</option>' +
    Object.entries(FORMATS).map(([k,v]) => `<option value="${k}" ${state.filters.format===k?'selected':''}>${v}</option>`).join('');
  formatSelect.onchange = (e) => { state.filters.format = e.target.value; render(); };
  filters.appendChild(formatSelect);

  const sortBtn = document.createElement('button');
  sortBtn.className = 'sort-toggle';
  sortBtn.innerHTML = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="${state.filters.sort==='desc'?'M12 5v14M19 12l-7 7-7-7':'M12 19V5M5 12l7-7 7 7'}"/></svg> ${state.filters.sort==='desc'?'الأعلى':'الأقل'}`;
  sortBtn.onclick = () => { state.filters.sort = state.filters.sort==='desc'?'asc':'desc'; render(); };
  filters.appendChild(sortBtn);

  container.appendChild(filters);

  // أزرار التصدير/الاستيراد
  const ioActions = document.createElement('div');
  ioActions.className = 'home-actions';
  ioActions.style.marginBottom = 'var(--space-4)';

  const exportBtn = document.createElement('button');
  exportBtn.className = 'btn btn-secondary';
  exportBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg> تصدير';
  exportBtn.onclick = () => exportData();
  ioActions.appendChild(exportBtn);

  const importBtn = document.createElement('button');
  importBtn.className = 'btn btn-secondary';
  importBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/></svg> استيراد';
  importBtn.onclick = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => { if (e.target.files[0]) importData(e.target.files[0]); };
    input.click();
  };
  ioActions.appendChild(importBtn);

  container.appendChild(ioActions);

  // المكتبة
  const filtered = getFilteredLibrary();
  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = 'المكتبة';
  container.appendChild(title);

  if (filtered.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg><p>لا توجد أعمال بعد. ابدأ بتقييم عمل جديد.</p>';
    container.appendChild(empty);
  } else {
    const list = document.createElement('div');
    list.className = 'library-list';
    for (const item of filtered) {
      list.appendChild(renderCard(item));
    }
    container.appendChild(list);
  }

  checkBackupReminder();
}

// --- كرت العمل ---
function renderCard(ev) {
  const card = document.createElement('div');
  card.className = 'card';
  card.onclick = () => openDetails(ev.id);

  // المسار
  const path = document.createElement('div');
  path.className = 'card-path';
  path.innerHTML = `<span class="chip">${MEDIA[ev.medium]}</span><span class="chip">${FORMATS[ev.format]}</span>` +
    (ev.relation === 'derivative' ? `<span class="chip">${RELATIONS.derivative}${ev.nature ? ' (' + NATURES[ev.nature] + ')' : ''}</span>` : `<span class="chip">${RELATIONS.independent}</span>`);
  card.appendChild(path);

  const name = document.createElement('div');
  name.className = 'card-name';
  name.textContent = ev.name;
  card.appendChild(name);

  if (ev.status === 'completed') {
    // استخدام النتيجة المخزّنة إن وُجدت
    const affected = isWorkAffected(ev);
    const outdated = isWeightOutdated(state.system, ev);

    if (ev.totalScore != null && ev.weights) {
      // عرض النتيجة المخزّنة
      const scoresDiv = document.createElement('div');
      scoresDiv.className = 'card-scores';
      // استخدم categoryScores المخزّنة إن وُجدت
      if (ev.categoryScores && ev.categoryScores.length > 0) {
        for (const cs of ev.categoryScores) {
          const row = document.createElement('div');
          row.className = 'card-score-row';
          row.innerHTML = `<span>${escapeHtml(cs.name)}</span><span class="score-val">${formatNumber(cs.points)}</span>`;
          scoresDiv.appendChild(row);
        }
      } else {
        // احسب من الدرجات الخام إن لم تكن مخزّنة
        const config = { medium: ev.medium, format: ev.format, relation: ev.relation, nature: ev.nature };
        const categoriesWithCriteria = getApplicableCriteriaByCategory(state.system, config);
        const weights = ev.weights;
        for (const { category, criteria } of categoriesWithCriteria) {
          const weight = weights[category.id];
          if (!weight) continue;
          let sum = 0, count = 0;
          for (const crit of criteria) {
            const score = ev.scores ? ev.scores[crit.id] : undefined;
            if (score !== undefined && score !== null) { sum += score; count++; }
          }
          if (count > 0) {
            const avg = sum / count;
            const points = (avg / 4) * weight;
            const row = document.createElement('div');
            row.className = 'card-score-row';
            row.innerHTML = `<span>${category.name}</span><span class="score-val">${formatNumber(points)}</span>`;
            scoresDiv.appendChild(row);
          }
        }
      }
      card.appendChild(scoresDiv);
    } else {
      // مسودة أو لا توجد نتيجة مخزّنة — احسب
      const config = { medium: ev.medium, format: ev.format, relation: ev.relation, nature: ev.nature };
      const result = calculateScore(state.system, config, ev.scores || {});
      const scoresDiv = document.createElement('div');
      scoresDiv.className = 'card-scores';
      for (const cs of result.categoryScores) {
        if (!cs.allScored) continue;
        const row = document.createElement('div');
        row.className = 'card-score-row';
        row.innerHTML = `<span>${cs.name}</span><span class="score-val">${formatNumber(cs.points)}</span>`;
        scoresDiv.appendChild(row);
      }
      card.appendChild(scoresDiv);
    }

    // النتيجة النهائية
    const final = document.createElement('div');
    final.className = 'card-final';
    const displayScore = ev.totalScore != null ? ev.totalScore : 0;
    let badge = '';
    if (affected) badge = ' ⚠️ متأثر';
    else if (outdated) badge = ' ⚠️ أوزان قديمة';
    final.innerHTML = `<span class="label">النتيجة النهائية${badge}</span><span class="value">${formatNumber(displayScore)} / 10</span>`;
    card.appendChild(final);

    if (affected) {
      const badge = document.createElement('div');
      badge.className = 'card-affected-badge';
      badge.textContent = 'متأثر بتغيير النظام';
      card.appendChild(badge);
    } else if (outdated) {
      const badge = document.createElement('div');
      badge.className = 'card-affected-badge';
      badge.style.color = 'var(--color-warning)';
      badge.textContent = 'الأوزان تغيّرت — أعد الحساب من التفاصيل';
      card.appendChild(badge);
    }
  } else {
    const badge = document.createElement('div');
    badge.className = 'card-draft-badge';
    badge.innerHTML = '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 8v4l3 3M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0z"/></svg> غير مكتمل';
    card.appendChild(badge);
  }

  return card;
}

// --- الفلترة والترتيب ---
function getFilteredLibrary() {
  let items = state.library.filter(ev => {
    if (state.filters.medium !== 'all' && ev.medium !== state.filters.medium) return false;
    if (state.filters.format !== 'all' && ev.format !== state.filters.format) return false;
    return true;
  });

  const completed = items.filter(ev => ev.status === 'completed');
  const drafts = items.filter(ev => ev.status === 'draft');

  completed.sort((a, b) => {
    let diff = 0;
    if (a.totalScore != null && b.totalScore != null) {
      diff = state.filters.sort === 'desc' ? b.totalScore - a.totalScore : a.totalScore - b.totalScore;
    }
    if (diff === 0) {
      diff = (b.updatedAt || 0) - (a.updatedAt || 0);
    }
    return diff;
  });

  return [...completed, ...drafts];
}

// --- المعالج ---
function renderWizard(container) {
  renderHeader(container, true);

  const wizard = document.createElement('div');
  wizard.className = 'wizard';

  const title = document.createElement('h2');
  title.className = 'section-title';
  title.textContent = state.editingId ? 'تعديل التكوين' : 'تقييم جديد';
  wizard.appendChild(title);

  // 1. اسم العمل
  const nameField = document.createElement('div');
  nameField.className = 'wizard-field';
  nameField.innerHTML = `<label class="wizard-label">اسم العمل</label>`;
  const nameInput = document.createElement('input');
  nameInput.className = 'wizard-input';
  nameInput.type = 'text';
  nameInput.placeholder = 'اكتب اسم العمل...';
  nameInput.value = state.wizardData.name;
  nameInput.oninput = (e) => {
    state.wizardData.name = e.target.value;
    updateWizardButton();
  };
  nameField.appendChild(nameInput);
  wizard.appendChild(nameField);

  // 2. الوسيط
  wizard.appendChild(renderWizardOptions('الوسيط', 'medium', MEDIA, state.wizardData.medium, (val) => {
    state.wizardData.medium = val;
    render();
  }));

  // 3. الصيغة
  if (state.wizardData.medium) {
    wizard.appendChild(renderWizardOptions('الصيغة', 'format', FORMATS, state.wizardData.format, (val) => {
      state.wizardData.format = val;
      render();
    }));
  }

  // 4. العلاقة بالمصدر
  if (state.wizardData.format) {
    wizard.appendChild(renderWizardOptions('العلاقة بالمصدر', 'relation', RELATIONS, state.wizardData.relation, (val) => {
      state.wizardData.relation = val;
      if (val !== 'derivative') {
        state.wizardData.nature = null;
      }
      render();
    }));
  }

  // 5. طبيعة العمل
  if (state.wizardData.relation === 'derivative') {
    wizard.appendChild(renderWizardOptions('طبيعة العمل', 'nature', NATURES, state.wizardData.nature, (val) => {
      state.wizardData.nature = val;
      render();
    }));
  }

  // زر البدء
  const actions = document.createElement('div');
  actions.className = 'wizard-actions';
  const startBtn = document.createElement('button');
  startBtn.className = 'btn btn-primary btn-full';
  startBtn.id = 'wizard-start';
  startBtn.textContent = 'ابدأ التقييم';
  startBtn.disabled = !wizardCanStart();
  startBtn.onclick = () => startEvaluation();
  actions.appendChild(startBtn);
  wizard.appendChild(actions);

  container.appendChild(wizard);
}

function renderWizardOptions(label, field, options, selected, onSelect) {
  const fieldDiv = document.createElement('div');
  fieldDiv.className = 'wizard-field';
  fieldDiv.innerHTML = `<label class="wizard-label">${label}</label>`;
  const opts = document.createElement('div');
  opts.className = 'wizard-options';
  for (const [key, val] of Object.entries(options)) {
    const btn = document.createElement('button');
    btn.className = 'wizard-option' + (selected === key ? ' selected' : '');
    btn.textContent = val;
    btn.onclick = () => onSelect(key);
    opts.appendChild(btn);
  }
  fieldDiv.appendChild(opts);
  return fieldDiv;
}

function wizardCanStart() {
  const d = state.wizardData;
  if (!d.name.trim()) return false;
  if (!d.medium) return false;
  if (!d.format) return false;
  if (!d.relation) return false;
  if (d.relation === 'derivative' && !d.nature) return false;
  return true;
}

function updateWizardButton() {
  const btn = document.getElementById('wizard-start');
  if (btn) btn.disabled = !wizardCanStart();
}

function startNewEvaluation() {
  if (state.activeDraft && state.activeDraft.draftState === 'active') {
    showActiveDraftAlert();
    return;
  }
  state.editingId = null;
  state.wizardData = { name: '', medium: null, format: null, relation: null, nature: null };
  state.view = 'wizard';
  render();
  window.scrollTo(0, 0);
}

function startEvaluation() {
  const d = state.wizardData;
  const config = { medium: d.medium, format: d.format, relation: d.relation, nature: d.nature };

  if (state.editingId) {
    const ev = state.library.find(e => e.id === state.editingId);
    if (ev) {
      const oldMedium = ev.medium;

      // إذا تغير الوسيط، اعرض تأكيدًا تفصيليًا
      if (oldMedium !== d.medium) {
        const deletedScores = [];
        for (const key in ev.scores) {
          if (key.startsWith('production.') || key.startsWith('performance.')) {
            const crit = state.system.criteria.find(c => c.id === key);
            deletedScores.push(crit ? crit.name : key);
          }
        }
        if (deletedScores.length > 0) {
          showMediumChangeConfirm(oldMedium, d.medium, deletedScores, () => {
            applyMediumChange(ev, d, config);
          });
          return;
        }
      }

      applyMediumChange(ev, d, config);
    }
    return;
  }

  // تقييم جديد
  const id = generateUUID();
  const ev = {
    id,
    name: d.name.trim(),
    medium: d.medium,
    format: d.format,
    relation: d.relation,
    nature: d.nature,
    scores: {},
    notes: '',
    status: 'draft',
    draftState: 'active',
    criterionIds: getApplicableCriteria(state.system, config).map(c => c.id),
    weights: calculateFullWeights(state.system, d.medium, d.format, d.relation),
    totalScore: null,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    completedAt: null
  };

  state.current = ev;
  state.activeDraft = ev;
  saveToStorage('eval_active_draft', ev);
  state.view = 'evaluation';
  state.expandedCriteria.clear();
  render();
}

// تأكيد تغيير الوسيط التفصيلي
function showMediumChangeConfirm(oldMedium, newMedium, deletedScores, onConfirm) {
  const layerNames = { base: 'أساسية', medium: 'الوسيط', performance: 'الأداء', source: 'المصدر', series: 'السلسلة' };
  const deletedList = deletedScores.map(s => `<li>${escapeHtml(s)}</li>`).join('');
  const formHTML = `
    <div class="modal-body">
      <p style="font-size:var(--text-base);margin-bottom:var(--space-3)">تغيير الوسيط من <strong>${MEDIA[oldMedium]}</strong> إلى <strong>${MEDIA[newMedium]}</strong></p>
      <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-2)">سيتم حذف درجات المعايير التالية (${deletedScores.length}):</p>
      <ul style="font-size:var(--text-sm);color:var(--color-text-muted);padding-right:var(--space-5);list-style:disc;margin-bottom:var(--space-3)">
        ${deletedList}
      </ul>
      <p style="font-size:var(--text-xs);color:var(--color-text-faint)">درجات السرد والقيمة محفوظة لأنها مشتركة بين كل الوسائط.</p>
    </div>
    <div class="modal-actions">
      <button class="btn btn-danger" id="medium-confirm">حذف ومتابعة</button>
      <button class="btn btn-secondary" id="medium-cancel">إلغاء</button>
    </div>
  `;
  showModal('تأكيد تغيير الوسيط', formHTML);
  document.getElementById('medium-confirm').onclick = () => { hideModal(); onConfirm(); };
  document.getElementById('medium-cancel').onclick = hideModal;
}

function applyMediumChange(ev, d, config) {
  const oldMedium = ev.medium;
  ev.medium = d.medium;
  ev.format = d.format;
  ev.relation = d.relation;
  ev.nature = d.nature;

  if (oldMedium !== d.medium) {
    for (const key in ev.scores) {
      if (key.startsWith('production.') || key.startsWith('performance.')) {
        delete ev.scores[key];
      }
    }
  }

  const result = calculateScore(state.system, config, ev.scores);
  if (result.allScored) {
    ev.status = 'completed';
    ev.totalScore = result.totalScore;
    ev.weights = result.weights;
    ev.completedAt = ev.completedAt || Date.now();
  } else {
    ev.status = 'draft';
    ev.oldScore = ev.totalScore;
    ev.oldCompletedAt = ev.completedAt;
    ev.totalScore = null;
    ev.completedAt = null;
  }
  ev.criterionIds = getApplicableCriteria(state.system, config).map(c => c.id);
  ev.updatedAt = Date.now();
  saveLibrary();
  clearEditMemory(ev.id);
  state.editingId = null;
  state.current = ev;
  state.view = 'evaluation';
  state.expandedCriteria.clear();
  render();
}

// --- شاشة التقييم ---
function renderEvaluation(container) {
  if (!state.current) { goHome(); return; }
  const ev = state.current;
  const config = { medium: ev.medium, format: ev.format, relation: ev.relation, nature: ev.nature };

  renderHeader(container, true);

  // العنوان مع إمكانية تعديل الاسم
  const header = document.createElement('div');
  header.className = 'eval-header';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'eval-title';

  const nameRow = document.createElement('div');
  nameRow.style.display = 'flex';
  nameRow.style.alignItems = 'center';
  nameRow.style.gap = 'var(--space-2)';

  const nameInput = document.createElement('input');
  nameInput.className = 'wizard-input';
  nameInput.type = 'text';
  nameInput.value = ev.name;
  nameInput.style.flex = '1';
  nameInput.style.minHeight = '40px';
  nameInput.style.fontSize = 'var(--text-lg)';
  nameInput.style.fontWeight = '600';
  nameInput.style.fontFamily = 'var(--font-display)';
  nameInput.oninput = (e) => {
    ev.name = e.target.value;
    autoSaveCurrent();
  };
  nameInput.onblur = () => {
    autoSaveCurrent();
  };
  nameRow.appendChild(nameInput);

  titleDiv.appendChild(nameRow);

  const configLine = document.createElement('div');
  configLine.className = 'config';
  configLine.textContent = `${MEDIA[ev.medium]} — ${FORMATS[ev.format]} — ${RELATIONS[ev.relation]}${ev.nature ? ' (' + NATURES[ev.nature] + ')' : ''}`;
  titleDiv.appendChild(configLine);

  header.appendChild(titleDiv);
  container.appendChild(header);

  // التقدم
  const categoriesWithCriteria = getApplicableCriteriaByCategory(state.system, config);
  const result = calculateScore(state.system, config, ev.scores || {});
  const totalCriteria = result.categoryScores.reduce((sum, cs) => sum + (cs.criteriaCount || 0), 0);
  const scoredCount = result.categoryScores.reduce((sum, cs) => sum + (cs.scoredCount || 0), 0);

  const progress = document.createElement('div');
  progress.className = 'eval-progress';

  let progressHTML = `
    <div class="eval-progress-text">${scoredCount} من ${totalCriteria} معيارًا</div>
    <div class="eval-progress-bar"><div class="eval-progress-fill" style="width:${totalCriteria ? (scoredCount/totalCriteria*100) : 0}%"></div></div>
  `;

  // عرض نتيجة كل فئة مكتملة فور اكتمالها
  let completedCategoriesHTML = '';
  for (const cs of result.categoryScores) {
    if (cs.allScored && cs.scoredCount > 0) {
      completedCategoriesHTML += `<div class="eval-category-score-line"><span>${cs.name}</span><span class="score-val">${formatNumber(cs.points)}</span></div>`;
    }
  }
  if (completedCategoriesHTML) {
    progressHTML += `<div class="eval-category-scores">${completedCategoriesHTML}</div>`;
  }

  // النتيجة النهائية فقط عند اكتمال كل المعايير
  if (result.allScored) {
    progressHTML += `<div class="eval-score-display"><span class="score">${formatNumber(result.totalScore)}</span><span class="max">/ 10</span></div>`;
  }

  progress.innerHTML = progressHTML;
  container.appendChild(progress);

  // الفئات والمعايير
  for (const { category, criteria } of categoriesWithCriteria) {
    const weight = result.weights[category.id];
    if (!weight) continue;

    const catDiv = document.createElement('div');
    catDiv.className = 'eval-category';

    // عرض نتيجة الفئة عند الاكتمال
    const cs = result.categoryScores.find(s => s.categoryId === category.id);
    let scoreLabel = '';
    if (cs && cs.allScored) {
      scoreLabel = ` — ${formatNumber(cs.points)} نقطة`;
    }

    catDiv.innerHTML = `
      <div class="eval-category-header">
        <span class="eval-category-name">${escapeHtml(category.name)}${scoreLabel}</span>
        <span class="eval-category-weight">${formatPercent(weight)}</span>
      </div>
    `;

    const list = document.createElement('div');
    list.className = 'eval-criteria-list';

    for (const crit of criteria) {
      list.appendChild(renderCriterion(crit, ev, config));
    }

    catDiv.appendChild(list);
    container.appendChild(catDiv);
  }

  // الملاحظات
  const notesDiv = document.createElement('div');
  notesDiv.className = 'eval-notes';
  notesDiv.innerHTML = `<label class="wizard-label">ملاحظات</label>`;
  const notesArea = document.createElement('textarea');
  notesArea.className = 'details-notes';
  notesArea.placeholder = 'اكتب ملاحظاتك عن العمل...';
  notesArea.value = ev.notes || '';
  notesArea.onblur = (e) => {
    ev.notes = e.target.value;
    autoSaveCurrent();
  };
  notesDiv.appendChild(notesArea);
  container.appendChild(notesDiv);

  // أزرار الإجراءات
  const actions = document.createElement('div');
  actions.className = 'eval-actions';

  if (result.allScored) {
    const saveBtn = document.createElement('button');
    saveBtn.className = 'btn btn-primary btn-full';
    saveBtn.textContent = 'حفظ التقييم';
    saveBtn.onclick = () => saveFinal();
    actions.appendChild(saveBtn);
  }

  const draftBtn = document.createElement('button');
  draftBtn.className = 'btn btn-secondary btn-full';
  draftBtn.textContent = 'حفظ كمسودة';
  draftBtn.onclick = () => saveDraft();
  actions.appendChild(draftBtn);

  if (ev.draftState === 'active' || state.editingId) {
    const delBtn = document.createElement('button');
    delBtn.className = 'btn btn-danger btn-full';
    delBtn.textContent = 'حذف';
    delBtn.onclick = () => {
      showConfirm('حذف', 'هل أنت متأكد من الحذف؟ لا يمكن التراجع.', () => {
        if (state.editingId) {
          state.library = state.library.filter(e => e.id !== state.editingId);
          saveLibrary();
          clearEditMemory(state.editingId);
          state.editingId = null;
        } else {
          state.activeDraft = null;
          if (_localStorageAvailable) { try { localStorage.removeItem('eval_active_draft'); } catch(e) {} }
          delete _memStore['eval_active_draft'];
        }
        state.current = null;
        goHome();
      });
    };
    actions.appendChild(delBtn);
  }

  container.appendChild(actions);
}

function renderCriterion(crit, ev, config) {
  const div = document.createElement('div');
  div.className = 'eval-criterion';

  const score = ev.scores ? ev.scores[crit.id] : undefined;
  const levelName = score !== undefined ? (SCORE_LEVELS.find(l => l.value === score)?.name || '') : '';
  const isExpanded = state.expandedCriteria.has(crit.id);

  if (isExpanded) div.classList.add('expanded');

  const head = document.createElement('div');
  head.className = 'eval-criterion-head';
  head.innerHTML = `
    <span class="eval-criterion-name">${escapeHtml(crit.name)}</span>
    <span class="eval-criterion-score">${levelName ? `<span class="level-name">${levelName}</span>` : 'اختر الدرجة'} <svg class="chevron" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 9l6 6 6-6"/></svg></span>
  `;
  head.onclick = () => {
    if (state.expandedCriteria.has(crit.id)) {
      state.expandedCriteria.delete(crit.id);
    } else {
      state.expandedCriteria.add(crit.id);
    }
    render();
  };
  div.appendChild(head);

  const body = document.createElement('div');
  body.className = 'eval-criterion-body';

  const text = getCriterionText(crit, config);
  if (text) {
    const textDiv = document.createElement('div');
    textDiv.className = 'eval-criterion-text';
    textDiv.textContent = text;
    body.appendChild(textDiv);
  }

  const opts = document.createElement('div');
  opts.className = 'eval-score-options';
  for (const level of SCORE_LEVELS) {
    const opt = document.createElement('button');
    opt.className = 'eval-score-option' + (score === level.value ? ' selected' : '');
    opt.innerHTML = `<span>${level.name}</span><span class="num">${level.value}</span>`;
    opt.onclick = () => {
      if (!ev.scores) ev.scores = {};
      ev.scores[crit.id] = level.value;
      autoSaveCurrent();
      const scrollY = window.scrollY;
      render();
      window.scrollTo(0, scrollY);
    };
    opts.appendChild(opt);
  }
  body.appendChild(opts);

  div.appendChild(body);
  return div;
}

// --- الحفظ ---
function autoSaveCurrent() {
  if (!state.current) return;
  const ev = state.current;

  if (state.editingId) {
    state.editMemory[ev.id] = JSON.parse(JSON.stringify(ev));
    saveToStorage('eval_edit_memory', state.editMemory);
  } else if (ev.draftState === 'active') {
    state.activeDraft = ev;
    saveToStorage('eval_active_draft', ev);
  }
}

function saveFinal() {
  if (!state.current) return;
  const ev = state.current;
  const config = { medium: ev.medium, format: ev.format, relation: ev.relation, nature: ev.nature };
  const result = calculateScore(state.system, config, ev.scores || {});

  if (!result.allScored) {
    showToast('أكمل جميع المعايير أولاً');
    return;
  }

  const trimmedName = ev.name.trim();
  if (!trimmedName) {
    showToast('اكتب اسم العمل أولاً');
    return;
  }
  const duplicate = state.library.find(e => e.id !== ev.id && e.name.trim() === trimmedName);
  if (duplicate) {
    showToast('اسم العمل مكرر. عدّل الاسم في الأعلى ثم احفظ.');
    return;
  }

  ev.name = trimmedName;
  ev.status = 'completed';
  ev.draftState = null;
  ev.totalScore = result.totalScore;
  ev.weights = result.weights;
  ev.categoryScores = result.categoryScores.map(cs => ({ categoryId: cs.categoryId, name: cs.name, points: cs.points }));
  ev.criterionIds = getApplicableCriteria(state.system, config).map(c => c.id);
  ev.completedAt = ev.completedAt || Date.now();
  ev.updatedAt = Date.now();

  const existing = state.library.find(e => e.id === ev.id);
  if (existing) {
    Object.assign(existing, ev);
  } else {
    state.library.push(ev);
  }

  state.activeDraft = null;
  if (_localStorageAvailable) { try { localStorage.removeItem('eval_active_draft'); } catch(e) {} }
  delete _memStore['eval_active_draft'];
  clearEditMemory(ev.id);
  state.editingId = null;

  saveLibrary();
  updateBackupCounter();
  state.current = null;
  goHome();
  showToast('تم حفظ التقييم');
}

function saveDraft() {
  if (!state.current) return;
  const ev = state.current;

  const trimmedName = ev.name.trim();
  if (!trimmedName) {
    showToast('اكتب اسم العمل أولاً');
    return;
  }
  const duplicate = state.library.find(e => e.id !== ev.id && e.name.trim() === trimmedName);
  if (duplicate) {
    showToast('اسم العمل مكرر. عدّل الاسم في الأعلى ثم احفظ.');
    return;
  }

  ev.name = trimmedName;
  ev.status = 'draft';
  ev.draftState = 'archived';
  ev.updatedAt = Date.now();

  if (state.editingId) {
    ev.oldScore = ev.totalScore;
    ev.oldCompletedAt = ev.completedAt;
    ev.totalScore = null;
    ev.completedAt = null;
    const existing = state.library.find(e => e.id === ev.id);
    if (existing) {
      Object.assign(existing, ev);
    } else {
      state.library.push(ev);
    }
    clearEditMemory(ev.id);
    state.editingId = null;
  } else {
    const existing = state.library.find(e => e.id === ev.id);
    if (existing) {
      Object.assign(existing, ev);
    } else {
      state.library.push(ev);
    }
    state.activeDraft = null;
    if (_localStorageAvailable) { try { localStorage.removeItem('eval_active_draft'); } catch(e) {} }
    delete _memStore['eval_active_draft'];
  }

  saveLibrary();
  state.current = null;
  goHome();
  showToast('تم حفظ المسودة');
}

// --- صفحة التفاصيل ---
function renderDetails(container) {
  if (!state.currentDetailsId) { goHome(); return; }
  const ev = state.library.find(e => e.id === state.currentDetailsId);
  if (!ev) { goHome(); return; }

  renderHeader(container, true);

  const config = { medium: ev.medium, format: ev.format, relation: ev.relation, nature: ev.nature };

  // العنوان
  const header = document.createElement('div');
  header.className = 'details-header';
  header.innerHTML = `
    <div class="eval-title">
      <h2>${escapeHtml(ev.name)}</h2>
      <div class="config">${MEDIA[ev.medium]} — ${FORMATS[ev.format]} — ${RELATIONS[ev.relation]}${ev.nature ? ' (' + NATURES[ev.nature] + ')' : ''}</div>
    </div>
  `;
  container.appendChild(header);

  // الملاحظات
  const notesSection = document.createElement('div');
  notesSection.className = 'details-section';
  notesSection.innerHTML = `<label class="wizard-label">ملاحظات</label>`;
  const notesArea = document.createElement('textarea');
  notesArea.className = 'details-notes';
  notesArea.placeholder = 'اكتب ملاحظاتك عن العمل...';
  notesArea.value = ev.notes || '';
  notesArea.onblur = (e) => {
    ev.notes = e.target.value;
    saveLibrary();
  };
  notesSection.appendChild(notesArea);
  container.appendChild(notesSection);

  // زر التعديل
  const editSection = document.createElement('div');
  editSection.className = 'details-section';
  const editBtn = document.createElement('button');
  editBtn.className = 'btn btn-secondary btn-full';
  editBtn.textContent = 'تعديل';
  editBtn.onclick = () => editWork(ev.id);
  editSection.appendChild(editBtn);
  container.appendChild(editSection);

  // زر إعادة الحساب بالأوزان الحالية (للأعمال المكتملة غير المتأثرة)
  if (ev.status === 'completed') {
    const affected = isWorkAffected(ev);
    const outdated = isWeightOutdated(state.system, ev);

    if (!affected && outdated) {
      const recalcSection = document.createElement('div');
      recalcSection.className = 'details-section';
      const recalcBtn = document.createElement('button');
      recalcBtn.className = 'btn btn-secondary btn-full';
      recalcBtn.style.borderColor = 'var(--color-warning)';
      recalcBtn.style.color = 'var(--color-warning)';
      recalcBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 4v6h-6M1 20v-6h6"/><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/></svg> أعد الحساب بالأوزان الحالية';
      recalcBtn.onclick = () => recalculateWork(ev);
      recalcSection.appendChild(recalcBtn);
      container.appendChild(recalcSection);
    } else if (affected) {
      const warnSection = document.createElement('div');
      warnSection.className = 'details-section';
      const warn = document.createElement('div');
      warn.className = 'alert-banner';
      warn.innerHTML = `
        <div class="icon">⚠️</div>
        <div class="text">هذا العمل متأثر بتغيير المعايير. أكمل إعادة التقييم قبل إعادة الحساب بالأوزان الجديدة.</div>
      `;
      warnSection.appendChild(warn);
      container.appendChild(warnSection);
    }
  }

  // النص القابل للنسخ
  if (ev.status === 'completed') {
    const copySection = document.createElement('div');
    copySection.className = 'details-section';
    copySection.innerHTML = `<label class="wizard-label">نص التقييم</label>`;

    const copyText = document.createElement('div');
    copyText.className = 'details-copy-text';
    copyText.textContent = generateCopyText(state.system, ev);
    copySection.appendChild(copyText);

    const copyBtn = document.createElement('button');
    copyBtn.className = 'btn btn-primary btn-full';
    copyBtn.style.marginTop = 'var(--space-2)';
    copyBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg> نسخ';
    copyBtn.onclick = () => {
      const text = generateCopyText(state.system, ev);
      navigator.clipboard.writeText(text).then(() => {
        showToast('تم النسخ');
      }).catch(() => {
        const ta = document.createElement('textarea');
        ta.value = text;
        document.body.appendChild(ta);
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
        showToast('تم النسخ');
      });
    };
    copySection.appendChild(copyBtn);
    container.appendChild(copySection);
  }

  // الحذف
  const actions = document.createElement('div');
  actions.className = 'details-actions';
  const delBtn = document.createElement('button');
  delBtn.className = 'btn btn-danger btn-full';
  delBtn.textContent = 'حذف';
  delBtn.onclick = () => {
    showConfirm('حذف', `هل أنت متأكد من حذف "${ev.name}"؟ لا يمكن التراجع.`, () => {
      state.library = state.library.filter(e => e.id !== ev.id);
      saveLibrary();
      clearEditMemory(ev.id);
      state.currentDetailsId = null;
      goHome();
      showToast('تم الحذف');
    });
  };
  actions.appendChild(delBtn);
  container.appendChild(actions);
}

// إعادة الحساب بالأوزان الحالية
function recalculateWork(ev) {
  const config = { medium: ev.medium, format: ev.format, relation: ev.relation, nature: ev.nature };
  const result = calculateScore(state.system, config, ev.scores || {});

  if (!result.allScored) {
    showToast('لا يمكن إعادة الحساب — المعايير غير مكتملة');
    return;
  }

  ev.totalScore = result.totalScore;
  ev.weights = result.weights;
  ev.categoryScores = result.categoryScores.map(cs => ({ categoryId: cs.categoryId, name: cs.name, points: cs.points }));
  ev.updatedAt = Date.now();
  saveLibrary();
  render();
  showToast('تم إعادة الحساب بالأوزان الحالية');
}

// --- فتح التفاصيل ---
function openDetails(id) {
  // استعادة ذاكرة التحرير إن وُجدت (لها أولوية أقل من المسودة النشطة)
  const ev = state.library.find(e => e.id === id);
  if (ev && state.editMemory[id]) {
    Object.assign(ev, state.editMemory[id]);
  }
  state.currentDetailsId = id;
  state.view = 'details';
  render();
}

// --- التعديل ---
function editWork(id) {
  const ev = state.library.find(e => e.id === id);
  if (!ev) return;

  // استعادة ذاكرة التحرير إن وُجدت
  if (state.editMemory[id]) {
    Object.assign(ev, state.editMemory[id]);
  }

  state.editingId = id;
  state.wizardData = {
    name: ev.name,
    medium: ev.medium,
    format: ev.format,
    relation: ev.relation,
    nature: ev.nature
  };
  state.current = ev;
  state.view = 'wizard';
  state.expandedCriteria.clear();
  render();
}

// --- التنبيه عن المسودة النشطة ---
function showActiveDraftAlert() {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = '';
  overlay.classList.remove('hidden');

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-title">تقييم غير مكتمل</div>
    <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-4)">لديك تقييم غير مكتمل. متابعة أم بدء جديد؟</p>
    <div class="modal-actions">
      <button class="btn btn-primary" id="draft-continue">متابعة</button>
      <button class="btn btn-secondary" id="draft-new">بدء جديد</button>
    </div>
  `;
  overlay.appendChild(modal);

  document.getElementById('draft-continue').onclick = () => {
    hideModal();
    state.current = state.activeDraft;
    state.view = 'evaluation';
    state.expandedCriteria.clear();
    render();
  };

  document.getElementById('draft-new').onclick = () => {
    hideModal();
    const draft = state.activeDraft;
    const trimmedName = draft.name.trim();
    if (!trimmedName || state.library.some(e => e.name.trim() === trimmedName)) {
      // لا تُؤرشف — ابقَ على المسودة النشطة ولا تفتح المعالج
      showToast('لم تُحفظ المسودة — اسم فارغ أو مكرر. عدّل الاسم أو احذف المسودة من شاشة التقييم.');
      // افتح المسودة ليعدّل الاسم
      state.current = state.activeDraft;
      state.view = 'evaluation';
      state.expandedCriteria.clear();
      render();
    } else {
      draft.draftState = 'archived';
      draft.name = trimmedName;
      const existing = state.library.find(e => e.id === draft.id);
      if (existing) Object.assign(existing, draft);
      else state.library.push(draft);
      saveLibrary();
      state.activeDraft = null;
      if (_localStorageAvailable) { try { localStorage.removeItem('eval_active_draft'); } catch(e) {} }
      delete _memStore['eval_active_draft'];
      startNewEvaluation();
    }
  };
}

// --- إدارة النظام ---
function renderSystemManagement(container) {
  renderHeader(container, true);

  const header = document.createElement('div');
  header.className = 'sys-header';
  header.innerHTML = '<h2>إدارة النظام</h2>';
  container.appendChild(header);

  // التبويبات (مع المحذوفات)
  const tabs = document.createElement('div');
  tabs.className = 'sys-tabs';
  const catTab = document.createElement('button');
  catTab.className = 'sys-tab' + (state.sysTab === 'categories' ? ' active' : '');
  catTab.textContent = 'الفئات';
  catTab.onclick = () => { state.sysTab = 'categories'; render(); };
  tabs.appendChild(catTab);

  const critTab = document.createElement('button');
  critTab.className = 'sys-tab' + (state.sysTab === 'criteria' ? ' active' : '');
  critTab.textContent = 'المعايير';
  critTab.onclick = () => { state.sysTab = 'criteria'; render(); };
  tabs.appendChild(critTab);

  const trashTab = document.createElement('button');
  trashTab.className = 'sys-tab' + (state.sysTab === 'trash' ? ' active' : '');
  trashTab.innerHTML = 'المحذوفات';
  trashTab.onclick = () => { state.sysTab = 'trash'; render(); };
  tabs.appendChild(trashTab);

  container.appendChild(tabs);

  if (state.sysTab === 'trash') {
    renderTrashTab(container);
    return;
  }

  // زر الإضافة
  const addBtn = document.createElement('button');
  addBtn.className = 'btn btn-primary btn-full';
  addBtn.style.marginBottom = 'var(--space-4)';
  addBtn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 5v14M5 12h14"/></svg> ' + (state.sysTab === 'categories' ? 'فئة جديدة' : 'معيار جديد');
  addBtn.onclick = () => state.sysTab === 'categories' ? showAddCategoryForm() : showAddCriterionForm();
  container.appendChild(addBtn);

  const list = document.createElement('div');
  list.className = 'sys-list';

  if (state.sysTab === 'categories') {
    for (const cat of state.system.categories) {
      if (cat.deleted) continue;
      list.appendChild(renderSysCategoryItem(cat));
    }
  } else {
    for (const crit of state.system.criteria) {
      if (crit.deleted) continue;
      list.appendChild(renderSysCriterionItem(crit));
    }
  }

  container.appendChild(list);
}

// --- قائمة المحذوفات ---
function renderTrashTab(container) {
  const deletedCats = state.system.categories.filter(c => c.deleted);
  const deletedCrits = state.system.criteria.filter(c => c.deleted);

  if (deletedCats.length === 0 && deletedCrits.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'empty-state';
    empty.innerHTML = '<p>لا توجد عناصر محذوفة.</p>';
    container.appendChild(empty);
    return;
  }

  if (deletedCats.length > 0) {
    const title = document.createElement('h3');
    title.className = 'section-title';
    title.style.fontSize = 'var(--text-base)';
    title.textContent = 'الفئات المحذوفة';
    container.appendChild(title);

    const list = document.createElement('div');
    list.className = 'sys-list';
    for (const cat of deletedCats) {
      const div = document.createElement('div');
      div.className = 'sys-item';
      const layerNames = { base: 'أساسية', medium: 'الوسيط', performance: 'الأداء', source: 'المصدر', series: 'السلسلة' };
      div.innerHTML = `
        <div class="sys-item-head">
          <div>
            <div class="sys-item-name">${escapeHtml(cat.name)}</div>
            <div class="sys-item-id">${cat.id} — ${layerNames[cat.layer] || cat.layer}</div>
          </div>
          <div class="sys-item-actions">
            <button class="sys-item-btn" id="restore-cat-${cat.id}">استعادة</button>
          </div>
        </div>
      `;
      list.appendChild(div);
      div.querySelector(`[id="restore-cat-${cat.id}"]`).onclick = () => restoreCategory(cat.id);
    }
    container.appendChild(list);
  }

  if (deletedCrits.length > 0) {
    const title = document.createElement('h3');
    title.className = 'section-title';
    title.style.fontSize = 'var(--text-base)';
    title.style.marginTop = 'var(--space-4)';
    title.textContent = 'المعايير المحذوفة';
    container.appendChild(title);

    const list = document.createElement('div');
    list.className = 'sys-list';
    for (const crit of deletedCrits) {
      const cat = state.system.categories.find(c => c.id === crit.categoryId);
      const catDeleted = cat && cat.deleted;
      const div = document.createElement('div');
      div.className = 'sys-item';
      div.innerHTML = `
        <div class="sys-item-head">
          <div>
            <div class="sys-item-name">${escapeHtml(crit.name)}</div>
            <div class="sys-item-id">${crit.id} — ${cat ? escapeHtml(cat.name) : '—'}${catDeleted ? ' (فئة محذوفة)' : ''}</div>
          </div>
          <div class="sys-item-actions">
            <button class="sys-item-btn" id="restore-crit-${crit.id}" ${catDeleted ? 'disabled style="opacity:0.4"' : ''}>استعادة</button>
          </div>
        </div>
      `;
      list.appendChild(div);
      if (!catDeleted) {
        div.querySelector(`[id="restore-crit-${crit.id}"]`).onclick = () => restoreCriterion(crit.id);
      } else {
        div.querySelector(`[id="restore-crit-${crit.id}"]`).onclick = () => {
          showToast('استعد الفئة أولاً');
        };
      }
    }
    container.appendChild(list);
  }
}

function restoreCategory(id) {
  const cat = state.system.categories.find(c => c.id === id);
  if (!cat) return;
  cat.deleted = false;
  // استعادة معايير الفئة أيضًا
  for (const crit of state.system.criteria) {
    if (crit.categoryId === id && crit.deleted) {
      crit.deleted = false;
    }
  }
  saveSystem(state.system);
  render();
  showToast('تمت استعادة الفئة ومعاييرها');
}

function restoreCriterion(id) {
  const crit = state.system.criteria.find(c => c.id === id);
  if (!crit) return;
  const cat = state.system.categories.find(c => c.id === crit.categoryId);
  if (cat && cat.deleted) {
    showToast('استعد الفئة أولاً');
    return;
  }
  crit.deleted = false;
  saveSystem(state.system);
  render();
  showToast('تمت استعادة المعيار');
}

function renderSysCategoryItem(cat) {
  const div = document.createElement('div');
  div.className = 'sys-item';
  const layerNames = { base: 'أساسية', medium: 'الوسيط', performance: 'الأداء', source: 'المصدر', series: 'السلسلة' };
  div.innerHTML = `
    <div class="sys-item-head">
      <div>
        <div class="sys-item-name">${escapeHtml(cat.name)}</div>
        <div class="sys-item-id">${cat.id} — ${layerNames[cat.layer] || cat.layer}</div>
      </div>
      <div class="sys-item-actions">
        <button class="sys-item-btn" id="edit-cat-${cat.id}">تعديل</button>
        <button class="sys-item-btn danger" id="del-cat-${cat.id}">حذف</button>
      </div>
    </div>
  `;
  div.querySelector(`[id="edit-cat-${cat.id}"]`).onclick = () => showEditCategoryForm(cat.id);
  div.querySelector(`[id="del-cat-${cat.id}"]`).onclick = () => confirmDeleteCategory(cat.id);
  return div;
}

function renderSysCriterionItem(crit) {
  const div = document.createElement('div');
  div.className = 'sys-item';
  const cat = state.system.categories.find(c => c.id === crit.categoryId);
  div.innerHTML = `
    <div class="sys-item-head">
      <div>
        <div class="sys-item-name">${escapeHtml(crit.name)}</div>
        <div class="sys-item-id">${crit.id} — ${cat ? escapeHtml(cat.name) : '—'}</div>
      </div>
      <div class="sys-item-actions">
        <button class="sys-item-btn" id="edit-crit-${crit.id}">تعديل</button>
        <button class="sys-item-btn danger" id="del-crit-${crit.id}">حذف</button>
      </div>
    </div>
  `;
  div.querySelector(`[id="edit-crit-${crit.id}"]`).onclick = () => showEditCriterionForm(crit.id);
  div.querySelector(`[id="del-crit-${crit.id}"]`).onclick = () => confirmDeleteCriterion(crit.id);
  return div;
}

// --- نموذج إضافة معيار (مُحسّن بالشروط ونسخ الصياغة) ---
function showAddCriterionForm() {
  const cats = state.system.categories.filter(c => !c.deleted);

  const formHTML = `
    <div class="modal-body">
      <div class="form-field">
        <label class="form-label">اسم المعيار</label>
        <input class="form-input" id="crit-name" type="text" placeholder="اسم المعيار">
      </div>
      <div class="form-field">
        <label class="form-label">الفئة</label>
        <select class="form-select" id="crit-cat">
          ${cats.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label class="form-label">الوسيط (اختياري)</label>
        <select class="form-select" id="crit-medium">
          <option value="">كل الوسائط</option>
          ${Object.entries(MEDIA).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
        </select>
      </div>

      <div class="form-field">
        <label class="form-label">شروط الانطباق (اختياري)</label>
        <p style="font-size:var(--text-xs);color:var(--color-text-faint);margin-bottom:var(--space-2)">حدد القيم التي يجب أن يطابقها تكوين العمل لينطبق المعيار. اتركها فارغة لكل التكوينات.</p>
      </div>

      <div class="form-field">
        <label class="form-label">الصيغة</label>
        <select class="form-select" id="crit-cond-format">
          <option value="">الكل</option>
          ${Object.entries(FORMATS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label class="form-label">العلاقة بالمصدر</label>
        <select class="form-select" id="crit-cond-relation">
          <option value="">الكل</option>
          ${Object.entries(RELATIONS).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
        </select>
      </div>
      <div class="form-field">
        <label class="form-label">طبيعة العمل</label>
        <select class="form-select" id="crit-cond-nature">
          <option value="">الكل</option>
          ${Object.entries(NATURES).map(([k,v]) => `<option value="${k}">${v}</option>`).join('')}
        </select>
      </div>

      <div class="form-field">
        <label class="form-label">نص المعيار الافتراضي (التعريف والأسئلة)</label>
        <textarea class="form-textarea" id="crit-desc-default" placeholder="نص المعيار كاملًا بأسئلته الفرعية..."></textarea>
      </div>

      <div class="form-field">
        <label class="form-label">نسخ الصياغة حسب الصيغة (اختياري)</label>
        <p style="font-size:var(--text-xs);color:var(--color-text-faint);margin-bottom:var(--space-2)">اتركها فارغة لاستخدام النص الافتراضي.</p>
      </div>
      ${Object.entries(FORMATS).map(([k,v]) => `
        <div class="form-field">
          <label class="form-label">صياغة: ${v}</label>
          <textarea class="form-textarea" id="crit-desc-${k}" placeholder="نص خاص بـ${v} (اختياري)"></textarea>
        </div>
      `).join('')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" id="crit-save">حفظ</button>
      <button class="btn btn-secondary" id="crit-cancel">إلغاء</button>
    </div>
  `;
  showModal('معيار جديد', formHTML);

  document.getElementById('crit-save').onclick = () => {
    const name = document.getElementById('crit-name').value.trim();
    const catId = document.getElementById('crit-cat').value;
    const medium = document.getElementById('crit-medium').value || undefined;
    const condFormat = document.getElementById('crit-cond-format').value || undefined;
    const condRelation = document.getElementById('crit-cond-relation').value || undefined;
    const condNature = document.getElementById('crit-cond-nature').value || undefined;
    const descDefault = document.getElementById('crit-desc-default').value.trim();

    if (!name) { showToast('اكتب اسم المعيار'); return; }
    if (!descDefault) { showToast('اكتب نص المعيار الافتراضي'); return; }

    const existing = state.system.criteria.find(c => !c.deleted && c.categoryId === catId && c.name === name);
    if (existing) { showToast('اسم المعيار مكرر داخل الفئة'); return; }

    // بناء الـ wording
    const wording = { default: descDefault };
    for (const [fk] of Object.entries(FORMATS)) {
      const val = document.getElementById('crit-desc-' + fk).value.trim();
      if (val) wording[fk] = val;
    }

    // بناء الشروط
    const conditions = {};
    if (condFormat) conditions.format = condFormat;
    if (condRelation) conditions.relation = condRelation;
    if (condNature) conditions.nature = condNature;

    // توليد المعرّف
    const prefix = catId + (medium ? '.' + medium : '');
    const allIds = new Set(state.system.criteria.map(c => c.id));
    let num = 1;
    while (allIds.has(prefix + '.' + num)) num++;
    const id = prefix + '.' + num;

    state.system.criteria.push({
      id, categoryId: catId, name,
      wording,
      medium: medium || undefined,
      conditions: Object.keys(conditions).length > 0 ? conditions : undefined,
      custom: true
    });
    saveSystem(state.system);
    hideModal();
    render();
    showToast('تمت إضافة المعيار');
  };

  document.getElementById('crit-cancel').onclick = hideModal;
}

function showEditCriterionForm(id) {
  const crit = state.system.criteria.find(c => c.id === id);
  if (!crit) return;

  const wording = crit.wording || {};
  const defaultText = typeof wording === 'string' ? wording : (wording.default || '');

  const formHTML = `
    <div class="modal-body">
      <div class="form-field">
        <label class="form-label">اسم المعيار</label>
        <input class="form-input" id="crit-name" type="text" value="${escapeHtml(crit.name)}">
      </div>
      <div class="form-field">
        <label class="form-label">المعرّف (ثابت)</label>
        <input class="form-input" type="text" value="${crit.id}" disabled style="opacity:0.6">
      </div>
      <div class="form-field">
        <label class="form-label">النص الافتراضي</label>
        <textarea class="form-textarea" id="crit-desc-default">${escapeHtml(defaultText)}</textarea>
      </div>
      ${Object.entries(FORMATS).map(([k,v]) => `
        <div class="form-field">
          <label class="form-label">صياغة: ${v}</label>
          <textarea class="form-textarea" id="crit-desc-${k}" placeholder="نص خاص بـ${v} (اختياري)">${escapeHtml(wording[k] || '')}</textarea>
        </div>
      `).join('')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" id="crit-save">حفظ</button>
      <button class="btn btn-secondary" id="crit-cancel">إلغاء</button>
    </div>
  `;
  showModal('تعديل المعيار', formHTML);

  document.getElementById('crit-save').onclick = () => {
    const name = document.getElementById('crit-name').value.trim();
    const desc = document.getElementById('crit-desc-default').value.trim();
    if (!name) { showToast('اكتب اسم المعيار'); return; }
    if (!desc) { showToast('اكتب نص المعيار'); return; }

    const dup = state.system.criteria.find(c => !c.deleted && c.id !== id && c.categoryId === crit.categoryId && c.name === name);
    if (dup) { showToast('اسم المعيار مكرر داخل الفئة'); return; }

    crit.name = name;
    if (!crit.wording || typeof crit.wording !== 'object') {
      crit.wording = {};
    }
    crit.wording.default = desc;
    for (const [fk] of Object.entries(FORMATS)) {
      const val = document.getElementById('crit-desc-' + fk).value.trim();
      if (val) crit.wording[fk] = val;
      else delete crit.wording[fk];
    }
    saveSystem(state.system);
    hideModal();
    render();
    showToast('تم تعديل المعيار');
  };

  document.getElementById('crit-cancel').onclick = hideModal;
}

function confirmDeleteCriterion(id) {
  const crit = state.system.criteria.find(c => c.id === id);
  if (!crit) return;
  const affectedCount = state.library.filter(ev => ev.criterionIds && ev.criterionIds.includes(id)).length;
  showConfirm('حذف المعيار', `سيتم حذف "${crit.name}". ${affectedCount > 0 ? affectedCount + ' عمل متأثر.' : 'لا توجد أعمال متأثرة.'} يمكن الاستعادة من قائمة المحذوفات.`, () => {
    crit.deleted = true;
    saveSystem(state.system);
    render();
    showToast('تم حذف المعيار');
  });
}

// --- نموذج إضافة فئة (مُحسّن بالأوزان وقواعد التعديل) ---
function showAddCategoryForm() {
  const formHTML = `
    <div class="modal-body">
      <div class="form-field">
        <label class="form-label">اسم الفئة</label>
        <input class="form-input" id="cat-name" type="text" placeholder="اسم الفئة">
      </div>
      <div class="form-field">
        <label class="form-label">الطبقة</label>
        <select class="form-select" id="cat-layer">
          <option value="base">أساسية (دائمًا)</option>
          <option value="medium">الوسيط</option>
          <option value="performance">الأداء (واقعي فقط)</option>
          <option value="source">المصدر (تابع فقط)</option>
          <option value="series">السلسلة (سلاسل فقط)</option>
        </select>
      </div>

      <div class="form-field">
        <label class="form-label">الأوزان الأساسية</label>
        <p style="font-size:var(--text-xs);color:var(--color-text-faint);margin-bottom:var(--space-2)">حدد وزن الفئة لكل وسيط منطبق. المجموع يُطبّع تلقائيًا إلى 10.</p>
      </div>
      <div class="form-field">
        <label class="form-label">وزن للواقعي</label>
        <input class="form-input" id="cat-w-live" type="number" step="0.1" min="0" placeholder="0">
      </div>
      <div class="form-field">
        <label class="form-label">وزن للأنمي</label>
        <input class="form-input" id="cat-w-anime" type="number" step="0.1" min="0" placeholder="0">
      </div>
      <div class="form-field">
        <label class="form-label">وزن لـ CGI</label>
        <input class="form-input" id="cat-w-cgi" type="number" step="0.1" min="0" placeholder="0">
      </div>
      <div class="form-field">
        <label class="form-label">وزن للكرتون</label>
        <input class="form-input" id="cat-w-toon" type="number" step="0.1" min="0" placeholder="0">
      </div>

      <div class="form-field">
        <label class="form-label">قواعد التعديل (اختياري)</label>
        <p style="font-size:var(--text-xs);color:var(--color-text-faint);margin-bottom:var(--space-2)">فروق تُطبّق على الوزن عند شروط معينة.</p>
      </div>
      <div class="form-field">
        <label class="form-label">فرع عند التبعية (±)</label>
        <input class="form-input" id="cat-mod-derivative" type="number" step="0.1" placeholder="0">
      </div>
      <div class="form-field">
        <label class="form-label">فرع عند سلسلة أفلام (±)</label>
        <input class="form-input" id="cat-mod-filmSeries" type="number" step="0.1" placeholder="0">
      </div>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" id="cat-save">حفظ</button>
      <button class="btn btn-secondary" id="cat-cancel">إلغاء</button>
    </div>
  `;
  showModal('فئة جديدة', formHTML);

  document.getElementById('cat-save').onclick = () => {
    const name = document.getElementById('cat-name').value.trim();
    const layer = document.getElementById('cat-layer').value;
    if (!name) { showToast('اكتب اسم الفئة'); return; }

    const dup = state.system.categories.find(c => !c.deleted && c.name === name);
    if (dup) { showToast('اسم الفئة مكرر'); return; }

    // جمع الأوزان
    const baseWeights = {};
    const wLive = parseFloat(document.getElementById('cat-w-live').value) || 0;
    const wAnime = parseFloat(document.getElementById('cat-w-anime').value) || 0;
    const wCgi = parseFloat(document.getElementById('cat-w-cgi').value) || 0;
    const wToon = parseFloat(document.getElementById('cat-w-toon').value) || 0;

    if (wLive > 0) baseWeights.live = wLive;
    if (wAnime > 0) baseWeights.anime = wAnime;
    if (wCgi > 0) baseWeights.cgi = wCgi;
    if (wToon > 0) baseWeights.toon = wToon;

    // قواعد التعديل
    const modRules = {};
    const modDerivative = parseFloat(document.getElementById('cat-mod-derivative').value) || 0;
    const modFilmSeries = parseFloat(document.getElementById('cat-mod-filmSeries').value) || 0;
    if (modDerivative !== 0) modRules.derivative = modDerivative;
    if (modFilmSeries !== 0) modRules.filmSeries = modFilmSeries;

    // توليد المعرّف
    const existingIds = new Set(state.system.categories.map(c => c.id));
    let num = 1;
    while (existingIds.has('custom.' + num)) num++;
    const id = 'custom.' + num;

    state.system.categories.push({
      id, name, layer, order: state.system.categories.length + 1, custom: true,
      baseWeights: Object.keys(baseWeights).length > 0 ? baseWeights : undefined,
      modRules: Object.keys(modRules).length > 0 ? modRules : undefined
    });
    saveSystem(state.system);
    hideModal();
    render();
    showToast('تمت إضافة الفئة');
  };

  document.getElementById('cat-cancel').onclick = hideModal;
}

function showEditCategoryForm(id) {
  const cat = state.system.categories.find(c => c.id === id);
  if (!cat) return;

  const bw = cat.baseWeights || {};
  const mr = cat.modRules || {};

  const formHTML = `
    <div class="modal-body">
      <div class="form-field">
        <label class="form-label">اسم الفئة</label>
        <input class="form-input" id="cat-name" type="text" value="${escapeHtml(cat.name)}">
      </div>
      <div class="form-field">
        <label class="form-label">الطبقة</label>
        <select class="form-select" id="cat-layer">
          <option value="base" ${cat.layer==='base'?'selected':''}>أساسية (دائمًا)</option>
          <option value="medium" ${cat.layer==='medium'?'selected':''}>الوسيط</option>
          <option value="performance" ${cat.layer==='performance'?'selected':''}>الأداء (واقعي فقط)</option>
          <option value="source" ${cat.layer==='source'?'selected':''}>المصدر (تابع فقط)</option>
          <option value="series" ${cat.layer==='series'?'selected':''}>السلسلة (سلاسل فقط)</option>
        </select>
      </div>
      ${cat.custom ? `
        <div class="form-field">
          <label class="form-label">الأوزان الأساسية</label>
        </div>
        <div class="form-field">
          <label class="form-label">وزن للواقعي</label>
          <input class="form-input" id="cat-w-live" type="number" step="0.1" min="0" value="${bw.live || ''}">
        </div>
        <div class="form-field">
          <label class="form-label">وزن للأنمي</label>
          <input class="form-input" id="cat-w-anime" type="number" step="0.1" min="0" value="${bw.anime || ''}">
        </div>
        <div class="form-field">
          <label class="form-label">وزن لـ CGI</label>
          <input class="form-input" id="cat-w-cgi" type="number" step="0.1" min="0" value="${bw.cgi || ''}">
        </div>
        <div class="form-field">
          <label class="form-label">وزن للكرتون</label>
          <input class="form-input" id="cat-w-toon" type="number" step="0.1" min="0" value="${bw.toon || ''}">
        </div>
        <div class="form-field">
          <label class="form-label">فرع عند التبعية (±)</label>
          <input class="form-input" id="cat-mod-derivative" type="number" step="0.1" value="${mr.derivative || ''}">
        </div>
        <div class="form-field">
          <label class="form-label">فرع عند سلسلة أفلام (±)</label>
          <input class="form-input" id="cat-mod-filmSeries" type="number" step="0.1" value="${mr.filmSeries || ''}">
        </div>
      ` : '<p style="font-size:var(--text-xs);color:var(--color-text-faint)">الأوزان الأساسية للفئات الأصلية مضمّنة في الكود ولا تُعدّل من هنا.</p>'}
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" id="cat-save">حفظ</button>
      <button class="btn btn-secondary" id="cat-cancel">إلغاء</button>
    </div>
  `;
  showModal('تعديل الفئة', formHTML);

  document.getElementById('cat-save').onclick = () => {
    const name = document.getElementById('cat-name').value.trim();
    const layer = document.getElementById('cat-layer').value;
    if (!name) { showToast('اكتب اسم الفئة'); return; }
    const dup = state.system.categories.find(c => !c.deleted && c.id !== id && c.name === name);
    if (dup) { showToast('اسم الفئة مكرر'); return; }
    cat.name = name;
    cat.layer = layer;

    if (cat.custom) {
      const baseWeights = {};
      const wLive = parseFloat(document.getElementById('cat-w-live').value) || 0;
      const wAnime = parseFloat(document.getElementById('cat-w-anime').value) || 0;
      const wCgi = parseFloat(document.getElementById('cat-w-cgi').value) || 0;
      const wToon = parseFloat(document.getElementById('cat-w-toon').value) || 0;
      if (wLive > 0) baseWeights.live = wLive;
      if (wAnime > 0) baseWeights.anime = wAnime;
      if (wCgi > 0) baseWeights.cgi = wCgi;
      if (wToon > 0) baseWeights.toon = wToon;
      cat.baseWeights = Object.keys(baseWeights).length > 0 ? baseWeights : undefined;

      const modRules = {};
      const modDerivative = parseFloat(document.getElementById('cat-mod-derivative').value) || 0;
      const modFilmSeries = parseFloat(document.getElementById('cat-mod-filmSeries').value) || 0;
      if (modDerivative !== 0) modRules.derivative = modDerivative;
      if (modFilmSeries !== 0) modRules.filmSeries = modFilmSeries;
      cat.modRules = Object.keys(modRules).length > 0 ? modRules : undefined;
    }

    saveSystem(state.system);
    hideModal();
    render();
    showToast('تم تعديل الفئة');
  };

  document.getElementById('cat-cancel').onclick = hideModal;
}

function confirmDeleteCategory(id) {
  const cat = state.system.categories.find(c => c.id === id);
  if (!cat) return;
  const affectedCount = state.library.filter(ev =>
    ev.criterionIds && ev.criterionIds.some(cid => {
      const c = state.system.criteria.find(cr => cr.id === cid);
      return c && c.categoryId === id;
    })
  ).length;
  showConfirm('حذف الفئة', `سيتم حذف "${cat.name}" وكل معاييرها. ${affectedCount > 0 ? affectedCount + ' عمل متأثر.' : 'لا توجد أعمال متأثرة.'} يمكن الاستعادة من قائمة المحذوفات.`, () => {
    cat.deleted = true;
    for (const crit of state.system.criteria) {
      if (crit.categoryId === id) crit.deleted = true;
    }
    saveSystem(state.system);
    render();
    showToast('تم حذف الفئة');
  });
}

// --- التصدير والاستيراد ---
function exportData() {
  const data = {
    schemaVersion: SCHEMA_VERSION,
    library: state.library,
    system: state.system,
    backupState: loadFromStorage('eval_backup_state', { totalCompletedEver: 0, shownThresholds: [] })
  };
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'تقييم-الأعمال-الفنية-' + new Date().toISOString().split('T')[0] + '.json';
  a.click();
  URL.revokeObjectURL(url);
  showToast('تم التصدير');
}

function importData(file) {
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const data = JSON.parse(e.target.result);
      if (data.schemaVersion !== SCHEMA_VERSION) {
        showToast('إصدار الملف غير متوافق');
        return;
      }

      // إحصائيات الاستيراد
      let imported = 0;
      let ignoredDuplicateId = 0;
      let ignoredDuplicateIdInFile = 0;
      let nameConflicts = [];
      let seenIds = new Set(); // لتتبع المكرر داخل الملف نفسه
      let seenNames = new Set(); // لتتبع أسماء مكررة داخل الملف

      // دمج المكتبة
      if (data.library) {
        for (const item of data.library) {
          // معالجة التكرار داخل الملف نفسه
          if (seenIds.has(item.id)) {
            ignoredDuplicateIdInFile++;
            continue;
          }
          seenIds.add(item.id);

          // معالجة التكرار مع المكتبة المحلية
          const existing = state.library.find(e => e.id === item.id);
          if (existing) {
            ignoredDuplicateId++;
            continue;
          }

          // معالجة تكرار الاسم داخل الملف نفسه
          const trimmedName = item.name ? item.name.trim() : '';
          if (trimmedName && seenNames.has(trimmedName)) {
            // الثاني يُحل كتعارض
            nameConflicts.push(item);
            continue;
          }
          if (trimmedName) seenNames.add(trimmedName);

          // معالجة تعارض الاسم مع المكتبة المحلية
          const nameConflict = state.library.find(e => e.name.trim() === trimmedName);
          if (nameConflict) {
            nameConflicts.push(item);
            continue;
          }

          // المسودات النشطة تُحوّل لمؤرشفة
          if (item.draftState === 'active') {
            item.draftState = 'archived';
          }
          state.library.push(item);
          imported++;
        }
      }

      // دمج النظام — مع مراجعة الفروق
      let systemNewItems = [];
      let systemConflicts = [];

      if (data.system) {
        for (const cat of data.system.categories || []) {
          const local = state.system.categories.find(c => c.id === cat.id);
          if (!local) {
            systemNewItems.push({ type: 'category', item: cat });
          } else {
            // مقارنة المحتوى
            if (JSON.stringify(local) !== JSON.stringify(cat)) {
              systemConflicts.push({ type: 'category', local, incoming: cat });
            }
          }
        }
        for (const crit of data.system.criteria || []) {
          const local = state.system.criteria.find(c => c.id === crit.id);
          if (!local) {
            systemNewItems.push({ type: 'criterion', item: crit });
          } else {
            if (JSON.stringify(local) !== JSON.stringify(crit)) {
              systemConflicts.push({ type: 'criterion', local, incoming: crit });
            }
          }
        }
      }

      // معالجة عناصر النظام الجديدة تلقائيًا
      for (const { type, item } of systemNewItems) {
        if (type === 'category') {
          state.system.categories.push(item);
        } else {
          state.system.criteria.push(item);
        }
      }
      if (systemNewItems.length > 0) saveSystem(state.system);

      // دمج حالة النسخ الاحتياطي
      if (data.backupState) {
        const current = loadFromStorage('eval_backup_state', { totalCompletedEver: 0, shownThresholds: [] });
        current.totalCompletedEver = Math.max(current.totalCompletedEver, data.backupState.totalCompletedEver || 0);
        const thresholds = new Set([...(current.shownThresholds || []), ...(data.backupState.shownThresholds || [])]);
        current.shownThresholds = [...thresholds];
        saveToStorage('eval_backup_state', current);
      }

      saveLibrary();

      // معالجة فروق النظام إن وُجدت
      if (systemConflicts.length > 0) {
        showSystemConflictsReview(systemConflicts, () => {
          // بعد مراجعة النظام، عالج تعارضات الأسماء
          finishImport(nameConflicts, imported, ignoredDuplicateId, ignoredDuplicateIdInFile);
        });
      } else {
        finishImport(nameConflicts, imported, ignoredDuplicateId, ignoredDuplicateIdInFile);
      }
    } catch (err) {
      showToast('خطأ في قراءة الملف');
    }
  };
  reader.readAsText(file);
}

function finishImport(nameConflicts, imported, ignoredDuplicateId, ignoredDuplicateIdInFile) {
  if (nameConflicts.length > 0) {
    showImportConflicts(nameConflicts, () => {
      showImportSummary(imported, ignoredDuplicateId, ignoredDuplicateIdInFile, nameConflicts.length);
    });
  } else {
    showImportSummary(imported, ignoredDuplicateId, ignoredDuplicateIdInFile, 0);
  }
}

function showImportSummary(imported, ignoredDupId, ignoredDupInFile, conflictCount) {
  let parts = [];
  if (imported > 0) parts.push(`تم استيراد ${imported} عنصرًا`);
  if (ignoredDupId > 0) parts.push(`تجاهل ${ignoredDupId} لتكرار المعرّف`);
  if (ignoredDupInFile > 0) parts.push(`تجاهل ${ignoredDupInFile} لتكرار المعرّف داخل الملف`);
  if (conflictCount > 0) parts.push(`${conflictCount} تعارض تسمية`);

  const summary = parts.length > 0 ? parts.join('، ') : 'لم يتم استيراد شيء';

  const formHTML = `
    <div class="modal-body">
      <p style="font-size:var(--text-base)">${escapeHtml(summary)}</p>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" id="summary-ok">حسنًا</button>
    </div>
  `;
  showModal('ملخص الاستيراد', formHTML);
  document.getElementById('summary-ok').onclick = () => { hideModal(); render(); };
}

// مراجعة فروق كتلة النظام عند الاستيراد
function showSystemConflictsReview(conflicts, onDone) {
  let currentIndex = 0;

  function showNext() {
    if (currentIndex >= conflicts.length) {
      hideModal();
      onDone();
      return;
    }

    const { type, local, incoming } = conflicts[currentIndex];
    const typeLabel = type === 'category' ? 'فئة' : 'معيار';

    const localStr = JSON.stringify(local, null, 2).slice(0, 500);
    const incomingStr = JSON.stringify(incoming, null, 2).slice(0, 500);

    const formHTML = `
      <div class="modal-body">
        <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-3)">${typeLabel} بمعرّف <code>${incoming.id}</code> يختلف محتواه عن النسخة المحلية.</p>
        <div style="display:flex;gap:var(--space-2);margin-bottom:var(--space-3)">
          <div style="flex:1">
            <label class="form-label">المحلي</label>
            <pre style="font-size:var(--text-xs);background:var(--color-surface);padding:var(--space-2);border-radius:var(--radius-sm);overflow:auto;max-height:150px;white-space:pre-wrap">${escapeHtml(localStr)}</pre>
          </div>
          <div style="flex:1">
            <label class="form-label">الوارد</label>
            <pre style="font-size:var(--text-xs);background:var(--color-surface);padding:var(--space-2);border-radius:var(--radius-sm);overflow:auto;max-height:150px;white-space:pre-wrap">${escapeHtml(incomingStr)}</pre>
          </div>
        </div>
        <p style="font-size:var(--text-xs);color:var(--color-text-faint)">العنصر ${currentIndex + 1} من ${conflicts.length}</p>
      </div>
      <div class="modal-actions">
        <button class="btn btn-primary" id="sys-update">تحديث المحلي</button>
        <button class="btn btn-secondary" id="sys-skip">تخطّي</button>
      </div>
    `;
    showModal(`مراجعة ${typeLabel} (${currentIndex + 1}/${conflicts.length})`, formHTML);

    document.getElementById('sys-update').onclick = () => {
      // استبدال المحلي بالوارد
      if (type === 'category') {
        const idx = state.system.categories.findIndex(c => c.id === incoming.id);
        if (idx >= 0) state.system.categories[idx] = incoming;
      } else {
        const idx = state.system.criteria.findIndex(c => c.id === incoming.id);
        if (idx >= 0) state.system.criteria[idx] = incoming;
      }
      saveSystem(state.system);
      currentIndex++;
      showNext();
    };

    document.getElementById('sys-skip').onclick = () => {
      currentIndex++;
      showNext();
    };
  }

  showNext();
}

function showImportConflicts(conflicts, onDone) {
  const formHTML = `
    <div class="modal-body">
      <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-3)">تعارضات في أسماء الأعمال. عدّل الأسماء أو تخطّى.</p>
      ${conflicts.map((item, i) => `
        <div class="form-field">
          <label class="form-label">${escapeHtml(item.name)}</label>
          <input class="form-input" type="text" id="conflict-${i}" value="${escapeHtml(item.name)}">
        </div>
      `).join('')}
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" id="conflict-resolve">حفظ</button>
      <button class="btn btn-secondary" id="conflict-skip">تخطّي الكل</button>
    </div>
  `;
  showModal('تعارضات الأسماء', formHTML);

  document.getElementById('conflict-resolve').onclick = () => {
    let added = 0;
    for (let i = 0; i < conflicts.length; i++) {
      const newName = document.getElementById(`conflict-${i}`).value.trim();
      if (!newName) continue;
      const conflict = state.library.find(e => e.name.trim() === newName);
      if (conflict) { showToast(`الاسم "${newName}" مكرر أيضًا`); return; }
      const item = conflicts[i];
      item.name = newName;
      if (item.draftState === 'active') item.draftState = 'archived';
      state.library.push(item);
      added++;
    }
    saveLibrary();
    hideModal();
    onDone();
  };

  document.getElementById('conflict-skip').onclick = () => {
    hideModal();
    onDone();
  };
}

// --- تذكير النسخ الاحتياطي ---
function checkBackupReminder() {
  const backupState = loadFromStorage('eval_backup_state', { totalCompletedEver: 0, shownThresholds: [] });
  const total = backupState.totalCompletedEver || 0;
  const shown = backupState.shownThresholds || [];

  let threshold = 9;
  while (threshold <= total) {
    if (!shown.includes(threshold)) {
      showBackupReminder(threshold);
      shown.push(threshold);
      backupState.shownThresholds = shown;
      saveToStorage('eval_backup_state', backupState);
      return;
    }
    threshold += 10;
  }
}

function showBackupReminder(threshold) {
  const formHTML = `
    <div class="modal-body">
      <p style="font-size:var(--text-base);margin-bottom:var(--space-3)">وصلت إلى ${threshold} تقييمًا مكتملًا. يُنصح بنسخ احتياطي لمكتبتك.</p>
      <p style="font-size:var(--text-sm);color:var(--color-text-muted)">يمكن أن تمسح متصفحات الجوال التخزين المحلي بعد فترة من عدم الاستخدام.</p>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" id="backup-export">تصدير الآن</button>
      <button class="btn btn-secondary" id="backup-later">لاحقًا</button>
    </div>
  `;
  showModal('نسخ احتياطي', formHTML);

  document.getElementById('backup-export').onclick = () => { hideModal(); exportData(); };
  document.getElementById('backup-later').onclick = hideModal;
}

function updateBackupCounter() {
  const backupState = loadFromStorage('eval_backup_state', { totalCompletedEver: 0, shownThresholds: [] });
  backupState.totalCompletedEver = (backupState.totalCompletedEver || 0) + 1;
  saveToStorage('eval_backup_state', backupState);
}

// --- فحص الأعمال المتأثرة ---
function isWorkAffected(ev) {
  return _isWorkAffected(state.system, ev);
}

// --- تنبيه امتلاء التخزين ---
function showStorageFullAlert() {
  const overlay = document.getElementById('modal-overlay');
  if (!overlay) {
    alert('امتلأ التخزين. صدّر مكتبتك واحذف بعض العناصر لتفريغ مساحة.');
    return;
  }
  overlay.innerHTML = '';
  overlay.classList.remove('hidden');

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <div class="modal-title">امتلأ التخزين</div>
    <div class="modal-body">
      <p style="font-size:var(--text-sm);color:var(--color-text-muted);margin-bottom:var(--space-3)">امتلأ التخزين المحلي للمتصفح. صدّر مكتبتك كنسخة احتياطية ثم احذف بعض العناصر لتفريغ المساحة.</p>
    </div>
    <div class="modal-actions">
      <button class="btn btn-primary" id="storage-export">تصدير المكتبة</button>
      <button class="btn btn-secondary" id="storage-close">إغلاق</button>
    </div>
  `;
  overlay.appendChild(modal);

  document.getElementById('storage-export').onclick = () => { hideModal(); exportData(); };
  document.getElementById('storage-close').onclick = hideModal;
  overlay.onclick = (e) => { if (e.target === overlay) hideModal(); };
}

// --- المسودات وذاكرة التحرير ---
function clearEditMemory(id) {
  delete state.editMemory[id];
  saveToStorage('eval_edit_memory', state.editMemory);
}

// --- أدوات ---
function saveLibrary() {
  saveToStorage('eval_library', state.library);
}

function goHome() {
  state.view = 'home';
  state.current = null;
  state.currentDetailsId = null;
  state.editingId = null;
  state.expandedCriteria.clear();
  render();
  window.scrollTo(0, 0);
}

function showModal(title, bodyHTML) {
  const overlay = document.getElementById('modal-overlay');
  overlay.innerHTML = '';
  overlay.classList.remove('hidden');

  const modal = document.createElement('div');
  modal.className = 'modal';
  modal.innerHTML = `
    <button class="modal-close" id="modal-close-btn"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 6L6 18M6 6l12 12"/></svg></button>
    <div class="modal-title">${title}</div>
    ${bodyHTML}
  `;
  overlay.appendChild(modal);

  document.getElementById('modal-close-btn').onclick = hideModal;
  overlay.onclick = (e) => { if (e.target === overlay) hideModal(); };
}

function hideModal() {
  const overlay = document.getElementById('modal-overlay');
  overlay.classList.add('hidden');
  overlay.innerHTML = '';
}

function showConfirm(title, message, onConfirm) {
  const formHTML = `
    <div class="modal-body">
      <p style="font-size:var(--text-sm);color:var(--color-text-muted)">${message}</p>
    </div>
    <div class="modal-actions">
      <button class="btn btn-danger" id="confirm-yes">نعم</button>
      <button class="btn btn-secondary" id="confirm-no">إلغاء</button>
    </div>
  `;
  showModal(title, formHTML);
  document.getElementById('confirm-yes').onclick = () => { hideModal(); onConfirm(); };
  document.getElementById('confirm-no').onclick = hideModal;
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.remove('hidden');
  toast.style.animation = 'none';
  void toast.offsetWidth;
  toast.style.animation = '';
  setTimeout(() => toast.classList.add('hidden'), 3000);
}

function escapeHtml(text) {
  if (!text) return '';
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// --- البدء ---
init();
