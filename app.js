(() => {
  'use strict';
  const $ = (id) => document.getElementById(id);
  const stage = $('stage');
  const mediaMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const state = { game: 'plate', mode: 'add', interaction: 'manual', left: 2, right: 1, total: 6, take: 2, phase: 'ready', started: false, goal: 3, completed: 0, credited: false };
  let foods = [];
  let job = null;
  let sequence = 0;
  let motionWasChosen = false;
  const games = window.countingGames;
  const game = () => games[state.game];
  const quantity = (n) => `${n}${game().unit}`;
  const regions = { left: $('left-plate'), right: $('right-plate'), result: $('result-plate'), taken: $('taken-tray') };
  let drag = null;
  const ignoredPointers = new Map();
  const ignoredClicks = new Set();
  document.addEventListener('pointerup', (event) => {
    const ignored = ignoredPointers.get(event.pointerId);
    if (ignored) { ignored.suppressClickUntil = performance.now() + 250; ignoredPointers.delete(event.pointerId); }
  }, true);
  document.addEventListener('pointercancel', (event) => { ignoredPointers.delete(event.pointerId); ignoredClicks.delete(event.pointerId); }, true);
  document.addEventListener('click', (event) => {
    if (ignoredClicks.has(event.pointerId)) { ignoredClicks.delete(event.pointerId); event.preventDefault(); event.stopPropagation(); }
  }, true);


  function cancelJob() {
    cancelDrag();
    job?.abort();
    job = null;
    for (const food of foods) food.el.getAnimations().forEach((animation) => animation.cancel());
  }

  function pause(ms, signal) {
    return new Promise((resolve) => {
      if (signal.aborted) return resolve(false);
      const abort = () => { clearTimeout(timer); resolve(false); };
      const timer = setTimeout(() => { signal.removeEventListener('abort', abort); resolve(true); }, ms);
      signal.addEventListener('abort', abort, { once: true });
    });
  }

  function setPhase(phase) { state.phase = phase; stage.dataset.phase = phase; syncGuide(); }
  function say(text) { $('announcement').textContent = text; }
  function resultNumber() { return state.mode === 'add' ? state.left + state.right : state.total - state.take; }
  function message(title, hint) { $('message').textContent = title; $('hint').textContent = hint; }

  function syncGuide() {
    const step = !state.started ? 1 : ['checking', 'counting', 'done', 'complete'].includes(state.phase) ? 3 : 2;
    document.querySelectorAll('#lesson-steps li').forEach((item) => {
      if (Number(item.dataset.step) === step) item.setAttribute('aria-current', 'step');
      else item.removeAttribute('aria-current');
    });
    const manual = state.started && state.interaction === 'manual';
    $('primary').hidden = manual && ['placing', 'checking'].includes(state.phase);
    $('show-equation').hidden = state.phase !== 'done';
    $('reset').hidden = ['done', 'complete'].includes(state.phase);
    $('completion-badge').hidden = state.phase !== 'complete';
    stage.hidden = !state.started || state.phase === 'complete';
    $('recount').hidden = !manual || state.phase !== 'checking' || !foods.some((food) => food.el.classList.contains('counted'));
    $('progress').hidden = !manual || !['placing', 'checking'].includes(state.phase);
    foods.forEach((food) => {
      const needsMove = state.phase === 'placing' && (state.mode === 'add' ? food.location !== 'result' : food.location === 'result');
      const needsCount = state.phase === 'checking' && food.location === 'result' && !food.el.classList.contains('counted');
      food.el.classList.toggle('touch-target', manual && (needsMove || needsCount));
    });
    syncSession();
  }

  function syncSession() {
    const stars = $('session-stars');
    if (stars.children.length !== state.goal) {
      stars.replaceChildren(...Array.from({ length: state.goal }, () => {
        const star = document.createElement('span'); star.className = 'session-star'; return star;
      }));
    }
    Array.from(stars.children).forEach((star, i) => {
      const earned = i < state.completed;
      star.textContent = earned ? '★' : '☆'; star.classList.toggle('earned', earned);
    });
    $('session-progress').dataset.goal = state.goal;
    $('session-progress').setAttribute('aria-label', `${state.goal}問のうち${state.completed}問できました`);
    $('session-counter').textContent = state.started ? `${state.completed} / ${state.goal}` : `${state.goal}もん`;
  }

  function chooseNextNumbers() {
    const choices = [];
    if (state.mode === 'add') {
      for (let left = 1; left <= 3; left++) for (let right = 1; right <= 3; right++) {
        if (left !== state.left || right !== state.right) choices.push({ left, right });
      }
    } else {
      for (let total = 1; total <= 6; total++) for (let take = 1; take <= Math.min(3, total); take++) {
        if (total !== state.total || take !== state.take) choices.push({ total, take });
      }
    }
    Object.assign(state, choices[Math.floor(Math.random() * choices.length)]);
  }

  function nextProblem() {
    chooseNextNumbers(); state.credited = false;
    reset(false);
    $('lesson').scrollIntoView({ block: 'start' });
    $('message').focus({ preventScroll: true });
    say(`${state.completed + 1}問目。` + $('message').textContent + '。' + $('hint').textContent);
    if (state.interaction === 'auto') run();
  }

  function finishProblem() {
    // One star per problem, even after a reset or repeated completion callback.
    if (!state.credited) { state.completed = Math.min(state.goal, state.completed + 1); state.credited = true; }
    setPhase('done');
    foods.forEach((food) => { food.el.disabled = true; });
    $('primary').textContent = state.completed === state.goal ? 'ゴール！' : 'つぎへ →';
    $('primary').setAttribute('aria-disabled', 'false');
  }

  function showCompletion() {
    cancelJob(); setPhase('complete');
    message('できた！', `${state.goal}問できました。星が全部そろいました。`);
    $('equation').hidden = true;
    $('primary').textContent = 'もういちど';
    $('primary').setAttribute('aria-disabled', 'false');
    $('lesson').scrollIntoView({ block: 'start' });
    $('message').focus({ preventScroll: true });
    say($('hint').textContent);
  }

  function prepareLesson(announce = true) {
    state.started = false;
    state.completed = 0; state.credited = false;
    $('teacher-settings').open = announce;
    reset(announce);
  }

  function startLesson() {
    if (state.started) return;
    state.started = true;
    $('teacher-settings').open = false;
    reset(false);
    $('lesson').scrollIntoView({ block: 'start' });
    $('message').focus({ preventScroll: true });
    say($('message').textContent + '。' + $('hint').textContent);
    if (state.interaction === 'auto') run();
  }

  function syncGame() {
    const current = game();
    stage.dataset.game = state.game;
    $('lesson').setAttribute('aria-label', current.title + 'の教材');
    $('food-label').textContent = `${current.noun}を かぞえよう`;
    $('left-label').textContent = $('left-legend').textContent = current.left;
    $('right-label').textContent = $('right-legend').textContent = current.right;
    $('result-label').textContent = state.mode === 'add' ? current.result : current.remaining;
    $('taken-label').textContent = current.takeLabel;
    $('take-legend').textContent = current.takeLegend;
    $('game-menu').textContent = 'えらびなおす';
    $('game-menu').setAttribute('aria-label', `${current.name}。ゲームをえらびなおす`);
    $('setup-art').innerHTML = current.illustration.replaceAll('__ANIMAL__', 'setup-' + state.game);
  }

  function syncSettings() {
    document.querySelectorAll('.interaction-switch button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.interaction === state.interaction)));
    document.querySelectorAll('.mode-switch button').forEach((button) => button.setAttribute('aria-pressed', String(button.dataset.mode === state.mode)));
    document.querySelectorAll('[data-setting]').forEach((group) => {
      const key = group.dataset.setting;
      group.querySelectorAll('button').forEach((button) => {
        const n = Number(button.dataset.number);
        button.setAttribute('aria-label', `${group.closest('fieldset').querySelector('legend').textContent} ${key === 'goal' ? n + '問' : quantity(n)}`);
        button.setAttribute('aria-pressed', String(n === state[key]));
        button.disabled = key === 'take' && n > state.total;
      });
    });
    $('add-settings').hidden = state.mode !== 'add';
    $('subtract-settings').hidden = state.mode !== 'subtract';
    $('take-help').textContent = state.total < 3 ? `${quantity(state.total)}まで選べます。` : 'はじめの数まで選べます。';
  }

  function newFood(id, home) {
    const el = document.createElement('button');
    el.type = 'button'; el.disabled = state.interaction === 'auto' || !state.started;
    el.className = 'food'; el.dataset.id = id; el.dataset.location = home; el.innerHTML = game().illustration.replaceAll('__ANIMAL__', id) + '<span class="count-badge"></span>';
    $('foods').append(el);
    const food = { el, home, location: home, x: 0, y: 0, suppressClickUntil: 0 };
    el.addEventListener('click', (event) => {
      if (drag || (event.detail > 0 && performance.now() < food.suppressClickUntil)) return;
      touchFood(food);
    });
    el.addEventListener('pointerdown', (event) => startDrag(event, food));
    el.addEventListener('pointermove', moveDrag);
    el.addEventListener('pointerup', endDrag);
    el.addEventListener('pointercancel', cancelPointer);
    el.addEventListener('lostpointercapture', cancelPointer);
    return food;
  }

  // Rows are centered; six objects always remain individually visible.
  function slots(n) {
    if (n === 1) return [[.5, .52]];
    if (n === 2) return [[.34, .52], [.66, .52]];
    if (n === 3) return [[.27, .52], [.5, .52], [.73, .52]];
    if (n === 4) return [[.34, .33], [.66, .33], [.34, .73], [.66, .73]];
    if (n === 5) return [[.27, .33], [.5, .33], [.73, .33], [.34, .73], [.66, .73]];
    return [[.27, .33], [.5, .33], [.73, .33], [.27, .73], [.5, .73], [.73, .73]];
  }

  function layout(animate = false, signal = null) {
    const rect = stage.getBoundingClientRect();
    Object.entries(regions).forEach(([location, region]) => {
      const items = foods.filter((food) => food.location === location);
      if (!items.length) { region.classList.remove('track-wrap'); return; }
      const box = region.getBoundingClientRect();
      const wrapTrain = state.game === 'train' && state.interaction === 'manual' && box.width / (items.length + .08) < 44;
      const columns = wrapTrain ? Math.min(3, Math.max(1, Math.floor(box.width / 46))) : items.length;
      const trainSize = Math.min(rect.height <= 300 ? 52 : 76, box.width / (columns + .08), wrapTrain ? box.height * .44 : Infinity);
      region.classList.toggle('track-wrap', wrapTrain);
      if (state.game === 'train') region.style.setProperty('--track-offset', `${trainSize * .38}px`);
      const points = state.game === 'train'
        ? items.map((_, i) => {
          const rowSize = Math.min(columns, items.length - Math.floor(i / columns) * columns);
          return [.5 + (i % columns - (rowSize - 1) / 2) * trainSize / box.width, wrapTrain ? (i < columns ? .3 : .74) : .52];
        })
        : state.interaction === 'manual' && (location === 'left' || location === 'right') && items.length === 3
          ? [[.5, .3], [.27, .74], [.73, .74]]
        : state.interaction === 'manual' && (location === 'left' || location === 'right') && items.length === 2
          ? [[.29, .52], [.71, .52]]
        : state.interaction === 'manual' && location === 'taken' && items.length === 2
          ? [[.5, .3], [.5, .73]]
        : state.interaction === 'manual' && location === 'taken' && items.length === 3 && box.width * .46 < 44
          ? [[.5, .16], [.5, .5], [.5, .84]]
        : state.interaction === 'manual' && location === 'result' && box.width * .23 < 44 && items.length >= 5
          ? items.map((_, i) => [i % 2 === 0 ? .32 : .68, [.2, .5, .8][Math.floor(i / 2)]])
        : state.interaction === 'manual' && location === 'result' && box.width * .23 < 44 && items.length === 3
          ? [[.5, .28], [.27, .72], [.73, .72]]
        : location === 'taken' && items.length === 3
          ? [[.5, .24], [.27, .68], [.73, .68]] : slots(items.length);
      // Keep each square touch target separate, including on wide but shallow screens.
      let itemSize = Math.max(44, Math.min(76, rect.width * .08));
      if (state.interaction === 'manual' && state.game !== 'train') {
        points.forEach((a, i) => points.slice(i + 1).forEach((b) => {
          itemSize = Math.min(itemSize, Math.max(Math.abs(a[0] - b[0]) * box.width, Math.abs(a[1] - b[1]) * box.height));
        }));
      }
      items.forEach((food, i) => {
        if (state.game === 'train') {
          food.el.style.width = `${trainSize}px`; food.el.style.height = `${trainSize}px`;
        } else if (state.interaction === 'manual') {
          food.el.style.width = `${itemSize}px`; food.el.style.height = `${itemSize}px`;
        }
        const x = box.left - rect.left + box.width * points[i][0];
        const y = box.top - rect.top + box.height * points[i][1];
        food.el.style.left = `${x}px`; food.el.style.top = `${y}px`;
        food.el.dataset.location = location;
        if (animate && food.location !== food.home) {
          const animation = food.el.animate([{ left: `${food.x}px`, top: `${food.y}px` }, { left: `${x}px`, top: `${y}px` }], {
            duration: 950, delay: i * 110, easing: 'cubic-bezier(.45,0,.2,1)', fill: 'backwards'
          });
          signal?.addEventListener('abort', () => animation.cancel(), { once: true });
        }
        food.x = x; food.y = y;
      });
    });
  }

  function sceneDescription() {
    const current = game();
    const objects = (n) => `${current.noun}${n}${current.nounUnit}`;
    if (state.interaction === 'manual') {
      const amount = (where) => foods.filter((food) => food.location === where).length;
      return state.mode === 'add'
        ? `${current.left}に${objects(amount('left'))}、${current.right}に${objects(amount('right'))}、${current.result}に${objects(amount('result'))}。自分で移動できます。`
        : `${current.remaining}に${objects(amount('result'))}、${current.takeLabel}は${amount('taken')}${current.nounUnit}。自分で移動できます。`;
    }
    if (state.phase === 'ready') return state.mode === 'add'
      ? `${current.left}に${objects(state.left)}、${current.right}に${objects(state.right)}。`
      : `${current.area}に${objects(state.total)}。${state.take}${current.nounUnit}${state.game === 'animals' ? 'がおでかけします' : state.game === 'train' ? 'をきりはなします' : state.game === 'balloon' ? 'をとばします' : 'をとります'}。`;
    return state.mode === 'add' ? `${current.result}に${objects(resultNumber())}。`
      : `${current.remaining}に${objects(resultNumber())}、${current.takeLabel}は${state.take}${current.nounUnit}。`;
  }

  function reset(announce = true) {
    cancelJob(); setPhase('ready'); syncGame(); syncSettings();
    stage.hidden = !state.started;
    $('preparation-panel').hidden = state.started;
    $('settings-start').hidden = state.started;
    $('progress').textContent = '';
    stage.dataset.mode = state.mode;
    stage.dataset.interaction = state.interaction;
    stage.setAttribute('role', state.interaction === 'manual' ? 'group' : 'img');
    $('foods').setAttribute('aria-hidden', String(state.interaction === 'auto'));
    for (const group of ['left-group', 'right-group', 'result-group', 'taken-group']) $(group).setAttribute('aria-hidden', String(state.interaction === 'auto'));
    for (const region of Object.values(regions)) {
      region.setAttribute('role', 'presentation');
      region.removeAttribute('tabindex');
      region.removeAttribute('aria-label');
    }
    $('mode-label').textContent = state.mode === 'add' ? 'あわせる' : 'へらす';
    $('taken-group').hidden = state.mode !== 'subtract';
    $('empty-mark').hidden = true;
    $('equation').hidden = true;
    $('show-equation').disabled = true;
    $('show-equation').setAttribute('aria-expanded', 'false');
    $('show-equation').textContent = 'しきをみる';
    $('primary').setAttribute('aria-disabled', 'false');
    $('primary').innerHTML = `${state.mode === 'add' ? game().addAction : game().takeAction} <span aria-hidden="true">${state.mode === 'add' ? (state.game === 'balloon' ? '↑' : '↘') : '→'}</span>`;
    message(state.mode === 'add' ? 'あわせて いくつ？' : 'のこりは いくつ？', 'ボタンを おして、たしかめよう。');
    $('foods').replaceChildren(); foods = []; sequence++;
    if (state.mode === 'add') {
      for (let i = 0; i < state.left; i++) foods.push(newFood(`${sequence}-left-${i}`, 'left'));
      for (let i = 0; i < state.right; i++) foods.push(newFood(`${sequence}-right-${i}`, 'right'));
    } else {
      for (let i = 0; i < state.total; i++) foods.push(newFood(`${sequence}-apple-${i}`, 'result'));
    }
    if (state.started) layout();
    stage.setAttribute('aria-label', sceneDescription());
    if (!state.started) {
      setPhase('preparing');
      message('はじめよう', 'せんせいと かずを きめて「はじめる」を おそう。');
      $('setup-quantity').textContent = state.mode === 'add' ? `${quantity(state.left)} と ${quantity(state.right)}` : `${quantity(state.total)} から ${quantity(state.take)}`;
      $('setup-description').textContent = state.mode === 'add' ? `${game().noun}を あつめる あそび。` : `${game().noun}を ${quantity(state.take)} うごかす あそび。`;
      $('primary').textContent = 'はじめる';
    } else if (state.interaction === 'manual') updateManual();
    else foods.forEach((food) => food.el.setAttribute('aria-label', game().noun));
    if (announce) say(!state.started ? $('setup-quantity').textContent + '。' + $('hint').textContent : 'はじめの数に戻りました。' + sceneDescription());
  }

  async function count(signal) {
    setPhase('counting');
    const remaining = foods.filter((food) => food.location === 'result');
    foods.forEach((food) => { food.el.classList.remove('counted', 'current'); food.el.querySelector('.count-badge').textContent = ''; });
    for (let i = 0; i < remaining.length; i++) {
      remaining.forEach((food) => food.el.classList.remove('current'));
      remaining[i].el.classList.add('counted', 'current');
      remaining[i].el.querySelector('.count-badge').textContent = String(i + 1);
      message(quantity(i + 1), 'ひとつずつ、かぞえよう。');
      if (!(await pause(650, signal))) return;
    }
    if (signal.aborted) return;
    remaining.forEach((food) => food.el.classList.remove('current'));
    const n = remaining.length;
    $('empty-mark').hidden = n !== 0;
    finishProblem();
    message(state.mode === 'add' ? `ぜんぶで ${quantity(n)}！` : `のこり ${quantity(n)}！`, state.completed === state.goal ? '「ゴール！」で おしまい。' : '「つぎへ」で つぎの もんだいへ。');
    $('show-equation').disabled = false;
    $('equation').textContent = state.mode === 'add' ? `${state.left} ＋ ${state.right} ＝ ${n}` : `${state.total} − ${state.take} ＝ ${n}`;
    stage.setAttribute('aria-label', sceneDescription());
    say($('message').textContent + ` ${state.goal}問のうち${state.completed}問できました。` + (state.mode === 'subtract' ? ` ${game().takeLabel}は${quantity(state.take)}。` : ''));
    job = null;
  }

  async function run() {
    if (!state.started) { startLesson(); return; }
    if (state.phase === 'complete') { state.completed = 0; nextProblem(); return; }
    if (state.phase === 'done') {
      if (state.completed === state.goal) showCompletion();
      else nextProblem();
      return;
    }
    if (state.interaction === 'manual') {
      if (placementComplete()) beginManualCount();
      return;
    }
    if (state.phase === 'moving' || state.phase === 'counting') return;
    job = new AbortController(); const signal = job.signal;
    $('primary').setAttribute('aria-disabled', 'true');
    $('primary').textContent = 'かぞえているよ…';
    $('show-equation').disabled = true;
    $('equation').hidden = true;
    $('show-equation').setAttribute('aria-expanded', 'false');
    $('show-equation').textContent = 'しきをみる';
    if (state.phase === 'ready') {
      setPhase('moving');
      message(state.mode === 'add' ? game().addHeading : game().takeHeading, state.mode === 'add' ? game().addHint : game().takeHint);
      if (state.mode === 'add') foods.forEach((food) => { food.location = 'result'; });
      else foods.slice(-state.take).forEach((food) => { food.location = 'taken'; });
      layout(!$('reduced-motion').checked, signal);
      // Keep the movement readable; reduced motion preserves the objects without travel.
      const duration = $('reduced-motion').checked ? 180 : 1000 + 110 * (state.mode === 'add' ? resultNumber() - 1 : state.take - 1);
      if (!(await pause(duration, signal))) return;
    }
    await count(signal);
  }

  document.querySelectorAll('[data-setting]').forEach((group) => {
    const key = group.dataset.setting;
    const values = group.dataset.values ? group.dataset.values.split(',').map(Number) : Array.from({ length: Number(group.dataset.max) }, (_, i) => i + 1);
    for (const n of values) {
      const button = document.createElement('button');
      button.type = 'button'; button.textContent = key === 'goal' ? `${n}もん` : String(n); button.dataset.number = String(n);
      button.setAttribute('aria-label', `${group.closest('fieldset').querySelector('legend').textContent} ${n}こ`);
      if (key === 'take') button.setAttribute('aria-describedby', 'take-help');
      button.addEventListener('click', () => {
        if (key === 'take' && n > state.total) return;
        state[key] = n;
        if (key === 'total') state.take = Math.min(state.take, state.total);
        prepareLesson();
      });
      group.append(button);
    }
  });
  document.querySelectorAll('.mode-switch button').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.mode === state.mode) return;
    state.mode = button.dataset.mode; prepareLesson();
  }));
  document.querySelectorAll('.interaction-switch button').forEach((button) => button.addEventListener('click', () => {
    if (button.dataset.interaction === state.interaction) return;
    state.interaction = button.dataset.interaction; prepareLesson();
  }));
  $('primary').addEventListener('click', run);
  $('recount').addEventListener('click', () => { if (state.started && state.interaction === 'manual') beginManualCount(); });
  $('settings-start').addEventListener('click', startLesson);
  $('change-settings').addEventListener('click', () => {
    $('teacher-settings').open = true;
    $('teacher-settings').scrollIntoView({ block: 'start' });
    $('teacher-settings').querySelector('summary').focus({ preventScroll: true });
  });
  $('license-open').addEventListener('click', () => $('license-dialog').showModal());
  $('license-close').addEventListener('click', () => $('license-dialog').close());
  $('license-dialog').addEventListener('close', () => $('license-open').focus());
  $('game-menu').addEventListener('click', () => {
    // Cancel before hiding the lesson so no old move/count can update a new game.
    prepareLesson(false);
    $('lesson-workspace').hidden = true;
    $('game-picker').hidden = false;
    $('game-menu').hidden = true;
    $('picker-heading').focus();
  });
  Object.entries(games).forEach(([id, current]) => {
    const button = document.createElement('button');
    button.type = 'button'; button.className = 'game-card'; button.dataset.game = id;
    button.setAttribute('aria-label', current.title);
    button.innerHTML = `<span class="game-art art-${id}" aria-hidden="true">${current.illustration.replaceAll('__ANIMAL__', 'card-' + id)}</span><span class="game-card-title">${current.name}</span>`;
    button.addEventListener('click', () => {
      state.game = id;
      $('game-picker').hidden = true;
      $('lesson-workspace').hidden = false;
      $('game-menu').hidden = false;
      prepareLesson(false);
      say(current.title + '。' + sceneDescription());
      $('message').focus({ preventScroll: true });
      window.scrollTo(0, 0);
    });
    $('game-cards').append(button);
  });
  $('reset').addEventListener('click', () => reset());
  $('show-equation').addEventListener('click', () => {
    if (state.phase !== 'done') return;
    $('equation').hidden = !$('equation').hidden;
    $('show-equation').setAttribute('aria-expanded', String(!$('equation').hidden));
    $('show-equation').textContent = $('equation').hidden ? 'しきをみる' : 'しきをかくす';
  });
  $('reduced-motion').checked = mediaMotion.matches;
  $('reduced-motion').addEventListener('change', () => { motionWasChosen = true; prepareLesson(); });
  mediaMotion.addEventListener('change', () => { if (!motionWasChosen) { $('reduced-motion').checked = mediaMotion.matches; reset(); } });
  // A resize during travel cancels interpolation and places the same nodes in their destination.
  new ResizeObserver(() => {
    if (stage.hidden) return;
    cancelDrag();
    foods.forEach((food) => food.el.getAnimations().forEach((animation) => animation.cancel()));
    layout();
  }).observe(stage);
  reset(false);

  function placementComplete() {
    return state.mode === 'add' ? foods.every((food) => food.location === 'result') : foods.filter((food) => food.location === 'taken').length === state.take;
  }

  function clearMarks() {
    foods.forEach((food) => { food.el.classList.remove('counted', 'current'); food.el.querySelector('.count-badge').textContent = ''; });
    $('equation').hidden = true; $('show-equation').disabled = true;
    $('show-equation').setAttribute('aria-expanded', 'false'); $('show-equation').textContent = 'しきをみる';
  }

  function selectFood(food) {
    foods.forEach((item) => { item.el.classList.toggle('selected', item === food); item.el.setAttribute('aria-pressed', String(item === food)); });
  }

  function updateFoodNames() {
    const names = { left: game().left, right: game().right, result: state.mode === 'add' ? game().result : game().remaining, taken: game().takeLabel };
    foods.forEach((food, i) => {
      const action = state.phase === 'done' ? '数え終わりました'
        : food.el.classList.contains('counted') ? 'もう数えました。つかんで元へ戻すこともできます'
        : placementComplete() && food.location === 'result' ? 'タッチして数える。つかんで元へ戻すこともできます'
        : `タッチすると${names[tapDestination(food)]}へ1つ移動`;
      food.el.setAttribute('aria-label', `${names[food.location]}の${game().noun}、${i + 1}つ目。${action}`);
    });
    stage.setAttribute('aria-label', sceneDescription());
    syncGuide();
  }

  function updateManual() {
    clearMarks(); selectFood(null); $('empty-mark').hidden = true;
    const removed = foods.filter((food) => food.location === 'taken').length;
    const collected = foods.filter((food) => food.location === 'result').length;
    if (placementComplete()) { beginManualCount(); return; }
    setPhase('placing');
    message('タッチしてね', `ふちのついた ${game().noun}を 1つ タッチ。${state.mode === 'add' ? game().addHint : `あと ${quantity(state.take - removed)} うごかすよ。`}`);
    $('progress').textContent = state.mode === 'add' ? `${quantity(collected)} あつまった` : `${quantity(removed)} うごかした ／ のこり ${quantity(collected)}`;
    $('primary').textContent = 'ものを タッチしてね'; $('primary').setAttribute('aria-disabled', 'true');
    updateFoodNames();
  }

  function beginManualCount() {
    clearMarks(); selectFood(null);
    setPhase('checking');
    const remaining = foods.filter((food) => food.location === 'result');
    if (remaining.length === 0) { finishManual(); return; }
    message('かぞえよう', `${state.mode === 'add' ? game().result : game().remaining}の ${game().noun}を 1つずつ タッチ。`);
    $('progress').textContent = 'ばんごうが ついたら、かぞえた しるし。';
    $('primary').textContent = 'かぞえなおす'; $('primary').setAttribute('aria-disabled', 'false');
    updateFoodNames(); say('移動できました。' + $('hint').textContent);
  }

  function finishManual() {
    const remaining = foods.filter((food) => food.location === 'result').length;
    finishProblem(); $('empty-mark').hidden = remaining !== 0;
    message(state.mode === 'add' ? `ぜんぶで ${quantity(remaining)}！` : `のこり ${quantity(remaining)}！`, (remaining === 0 ? game().empty : 'できたね！') + (state.completed === state.goal ? '「ゴール！」で おしまい。' : '「つぎへ」で つぎの もんだいへ。'));
    $('show-equation').disabled = false;
    $('equation').textContent = state.mode === 'add' ? `${state.left} ＋ ${state.right} ＝ ${remaining}` : `${state.total} − ${state.take} ＝ ${remaining}`;
    updateFoodNames(); say($('message').textContent + ` ${state.goal}問のうち${state.completed}問できました。`);
  }

  function touchFood(food) {
    if (!state.started || state.interaction !== 'manual' || ['done', 'complete'].includes(state.phase)) return;
    if (placementComplete() && food.location === 'result') {
      selectFood(food);
      if (food.el.classList.contains('counted')) { say('この' + game().noun + 'は、もう数えました。'); return; }
      foods.forEach((item) => item.el.classList.remove('current'));
      const number = foods.filter((item) => item.location === 'result' && item.el.classList.contains('counted')).length + 1;
      food.el.classList.add('counted', 'current'); food.el.querySelector('.count-badge').textContent = String(number);
      updateFoodNames();
      message('かぞえよう', 'ふちのついた、まだ ばんごうのない えを タッチ。');
      $('progress').textContent = `${quantity(number)} かぞえた`; say(quantity(number));
      if (number === foods.filter((item) => item.location === 'result').length) finishManual();
    } else {
      const destination = tapDestination(food);
      if (transfer(food, destination, true)) say(`${game().noun}を1つ移動しました。` + $('message').textContent + '。' + $('hint').textContent);
    }
  }

  function tapDestination(food) {
    return state.mode === 'add' ? (food.location === 'result' ? food.home : 'result')
      : (food.location === 'taken' ? 'result' : 'taken');
  }

  function destinationAllowed(food, destination) {
    return state.mode === 'add'
      ? (food.location === 'result' ? destination === food.home : destination === 'result')
      : (food.location === 'taken' ? destination === 'result' : destination === 'taken');
  }

  function transfer(food, destination, animateTap = false) {
    if (!state.started || state.interaction !== 'manual' || ['done', 'complete'].includes(state.phase) || destination === food.location) return false;
    if (!destinationAllowed(food, destination)) { $('hint').textContent = 'うごかす場所を たしかめよう。'; layout(); return false; }
    if (state.mode === 'subtract' && destination === 'taken' && foods.filter((item) => item.location === 'taken').length >= state.take) {
      $('hint').textContent = `うごかすのは ${quantity(state.take)}まで。`; say($('hint').textContent); layout(); return false;
    }
    const origin = { x: food.x, y: food.y };
    food.el.getAnimations().forEach((animation) => animation.cancel());
    food.location = destination; layout(); updateManual();
    // A tap moves only this object; counting starts on the next activation.
    if (animateTap && !$('reduced-motion').checked) food.el.animate([
      { left: `${origin.x}px`, top: `${origin.y}px` },
      { left: `${food.x}px`, top: `${food.y}px` }
    ], { duration: 320, easing: 'ease-out' });
    return true;
  }

  function startDrag(event, food) {
    if (!state.started || state.interaction !== 'manual' || ['done', 'complete'].includes(state.phase) || event.button !== 0) return;
    ignoredClicks.delete(event.pointerId);
    if (drag) { ignoredPointers.set(event.pointerId, food); ignoredClicks.add(event.pointerId); event.preventDefault(); return; }
    food.suppressClickUntil = 0;
    const rect = stage.getBoundingClientRect();
    drag = { food, id: event.pointerId, startX: event.clientX, startY: event.clientY, offsetX: event.clientX - rect.left - food.x, offsetY: event.clientY - rect.top - food.y, moved: false };
    food.el.setPointerCapture(event.pointerId);
  }

  function moveDrag(event) {
    if (!drag || event.pointerId !== drag.id) return;
    if (!drag.moved && Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY) < 6) return;
    drag.moved = true; event.preventDefault();
    const { food } = drag; food.el.classList.add('dragging');
    const rect = stage.getBoundingClientRect();
    const halfWidth = food.el.offsetWidth / 2, halfHeight = food.el.offsetHeight / 2;
    const x = Math.max(halfWidth, Math.min(rect.width - halfWidth, event.clientX - rect.left - drag.offsetX));
    const y = Math.max(halfHeight, Math.min(rect.height - halfHeight, event.clientY - rect.top - drag.offsetY));
    food.el.style.left = `${x}px`; food.el.style.top = `${y}px`;
    for (const region of Object.values(regions)) region.classList.toggle('drop-active', inside(event, region));
  }

  function inside(event, region) {
    const rect = region.getBoundingClientRect();
    return rect.width > 0 && event.clientX >= rect.left - 8 && event.clientX <= rect.right + 8 && event.clientY >= rect.top - 8 && event.clientY <= rect.bottom + 8;
  }

  function endDrag(event) {
    if (ignoredPointers.has(event.pointerId)) {
      ignoredPointers.get(event.pointerId).suppressClickUntil = performance.now() + 250;
      ignoredPointers.delete(event.pointerId);
      return;
    }
    if (!drag || event.pointerId !== drag.id) return;
    const current = drag; drag = null;
    current.food.el.classList.remove('dragging');
    if (current.food.el.hasPointerCapture(event.pointerId)) current.food.el.releasePointerCapture(event.pointerId);
    for (const region of Object.values(regions)) region.classList.remove('drop-active');
    if (!current.moved) return;
    current.food.suppressClickUntil = performance.now() + 250;
    const destination = Object.entries(regions).find(([, region]) => inside(event, region))?.[0];
    if (!destination || !transfer(current.food, destination)) layout();
  }

  function cancelPointer(event) {
    ignoredPointers.delete(event.pointerId);
    if (drag && drag.id === event.pointerId) cancelDrag();
  }

  function cancelDrag() {
    if (!drag) return;
    const current = drag; drag = null;
    current.food.el.classList.remove('dragging');
    current.food.suppressClickUntil = performance.now() + 250;
    if (current.food.el.hasPointerCapture(current.id)) current.food.el.releasePointerCapture(current.id);
    for (const region of Object.values(regions)) region.classList.remove('drop-active');
    layout();
  }
})();
