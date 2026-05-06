/* ============================================================
   CODE THINKER — SHARED NAVIGATION & PAGE LOGIC
   ============================================================ */

let currentPage = 1;
const totalPages = 20;

/* -------------------- NAVIGATION -------------------- */
function goToPage(n) {
  if (n < 1 || n > totalPages) return;

  // Hide all pages
  document.querySelectorAll('.page').forEach(p => p.classList.remove('active'));

  // Show target page
  const target = document.getElementById('page-' + n);
  if (target) target.classList.add('active');

  // Update sidebar
  document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
  const btn = document.querySelector('.nav-btn[data-target="page-' + n + '"]');
  if (btn) btn.classList.add('active');

  // Update progress
  const pct = (n / totalPages) * 100;
  document.getElementById('progressFill').style.width = pct + '%';
  document.getElementById('progressText').textContent = 'Page ' + n + ' of ' + totalPages;

  // Scroll to top
  window.scrollTo({ top: 0, behavior: 'smooth' });

  // Close mobile sidebar
  document.getElementById('sidebar').classList.remove('open');

  currentPage = n;
}

function toggleSidebar() {
  document.getElementById('sidebar').classList.toggle('open');
}

// Keyboard navigation
document.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') goToPage(currentPage + 1);
  if (e.key === 'ArrowLeft') goToPage(currentPage - 1);
});

/* ============================================================
   PAGE 1 — YOU ARE THE COMPUTER (Canvas Drawing)
   ============================================================ */

(function initPage1() {
  const canvas = document.getElementById('p1-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let p1_currentStep = 0;
  let isDrawing = false;
  let lastX = 0;
  let lastY = 0;
  const steps = document.querySelectorAll('#p1-steps .step');
  const CM = 38.4;
  const CENTER = { x: 192, y: 192 };

  window.p1_setStep = function(n) {
    p1_currentStep = n;
    steps.forEach((s, i) => {
      s.classList.remove('active');
      if (i === n) s.classList.add('active');
    });
  };

  window.p1_markDone = function() {
    steps[p1_currentStep].classList.add('completed');
    if (p1_currentStep < steps.length - 1) {
      p1_setStep(p1_currentStep + 1);
    }
  };

  window.p1_selectRadio = function(el) {
    document.querySelectorAll('#page-1 .radio-item').forEach(r => r.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input').checked = true;
  };

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height)
    };
  }

  canvas.addEventListener('mousedown', e => {
    isDrawing = true;
    const p = getPos(e);
    lastX = p.x;
    lastY = p.y;
  });

  canvas.addEventListener('touchstart', e => {
    e.preventDefault();
    isDrawing = true;
    const p = getPos(e);
    lastX = p.x;
    lastY = p.y;
  }, { passive: false });

  canvas.addEventListener('mousemove', e => {
    if (!isDrawing) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#1a1d2b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
  });

  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    if (!isDrawing) return;
    const p = getPos(e);
    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(p.x, p.y);
    ctx.strokeStyle = '#1a1d2b';
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.stroke();
    lastX = p.x;
    lastY = p.y;
  }, { passive: false });

  window.addEventListener('mouseup', () => isDrawing = false);
  window.addEventListener('touchend', () => isDrawing = false);

  window.p1_clear = function() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    steps.forEach(s => s.classList.remove('completed'));
    p1_setStep(0);
  };

  window.p1_autoDraw = function() {
    p1_clear();
    let s = 0;
    const draw = () => {
      if (s >= 6) return;
      p1_setStep(s);
      ctx.strokeStyle = '#6366f1';
      ctx.lineWidth = 3;
      ctx.lineCap = 'round';
      ctx.beginPath();

      if (s === 0) {
        ctx.arc(CENTER.x, CENTER.y, 4, 0, Math.PI * 2);
        ctx.fillStyle = '#6366f1';
        ctx.fill();
      } else if (s === 1) {
        ctx.moveTo(CENTER.x, CENTER.y);
        ctx.lineTo(CENTER.x, CENTER.y - CM * 3);
      } else if (s === 2) {
        ctx.moveTo(CENTER.x, CENTER.y);
        ctx.lineTo(CENTER.x + CM * 3, CENTER.y);
      } else if (s === 3) {
        ctx.moveTo(CENTER.x, CENTER.y);
        ctx.lineTo(CENTER.x, CENTER.y + CM * 3);
      } else if (s === 4) {
        ctx.moveTo(CENTER.x, CENTER.y);
        ctx.lineTo(CENTER.x - CM * 3, CENTER.y);
      } else if (s === 5) {
        ctx.moveTo(CENTER.x, CENTER.y - CM * 3);
        ctx.lineTo(CENTER.x + CM * 3, CENTER.y - CM * 3);
        ctx.lineTo(CENTER.x + CM * 3, CENTER.y + CM * 3);
        ctx.lineTo(CENTER.x - CM * 3, CENTER.y + CM * 3);
        ctx.lineTo(CENTER.x - CM * 3, CENTER.y - CM * 3);
      }
      ctx.stroke();
      steps[s].classList.add('completed');
      s++;
      setTimeout(draw, 600);
    };
    draw();
  };
})();

/* ============================================================
   PAGE 2 — ORDER MATTERS (Paper Airplane Ordering)
   ============================================================ */

(function initPage2() {
  const correctOrder = [3, 1, 0, 2]; // Open flat → Fold corners → Fold lengthwise → Fold wings
  let userOrder = [];
  let revealed = false;

  const items = document.querySelectorAll('#p2-orderList .order-item');
  const feedback = document.getElementById('p2-feedback');

  window.p2_selectStep = function(idx) {
    if (revealed) return;
    const el = items[idx];

    // If already selected, deselect it
    const pos = userOrder.indexOf(idx);
    if (pos !== -1) {
      userOrder.splice(pos, 1);
      el.classList.remove('selected');
      p2_updateNumbers();
      feedback.textContent = '';
      feedback.className = 'order-feedback';
      return;
    }

    // If already have 4, ignore
    if (userOrder.length >= 4) return;

    userOrder.push(idx);
    el.classList.add('selected');
    p2_updateNumbers();
  };

  function p2_updateNumbers() {
    items.forEach((el, i) => {
      const numEl = el.querySelector('.order-num');
      const pos = userOrder.indexOf(i);
      numEl.textContent = pos !== -1 ? pos + 1 : '?';
    });
  }

  window.p2_checkOrder = function() {
    if (userOrder.length !== 4) {
      feedback.textContent = 'Select all 4 steps first!';
      feedback.className = 'order-feedback bad';
      return;
    }

    let allCorrect = true;
    items.forEach((el, i) => {
      const userPos = userOrder.indexOf(i);
      const correctPos = correctOrder.indexOf(i);
      el.classList.remove('correct', 'wrong');
      if (userPos === correctPos) {
        el.classList.add('correct');
      } else {
        el.classList.add('wrong');
        allCorrect = false;
      }
    });

    if (allCorrect) {
      feedback.textContent = '🎉 Perfect! That is the correct order.';
      feedback.className = 'order-feedback ok';
    } else {
      feedback.textContent = '❌ Not quite. Steps in red are in the wrong position.';
      feedback.className = 'order-feedback bad';
    }
  };

  window.p2_showAnswer = function() {
    revealed = true;
    userOrder = [...correctOrder];
    items.forEach((el, i) => {
      el.classList.remove('selected', 'wrong');
      el.classList.add('correct');
    });
    p2_updateNumbers();
    feedback.textContent = '👁 Answer revealed: Open → Corners → Lengthwise → Wings';
    feedback.className = 'order-feedback ok';
  };

  window.p2_resetOrder = function() {
    revealed = false;
    userOrder = [];
    items.forEach(el => {
      el.classList.remove('selected', 'correct', 'wrong');
    });
    p2_updateNumbers();
    feedback.textContent = '';
    feedback.className = 'order-feedback';
  };

  window.p2_selectRadio = function(el) {
    document.querySelectorAll('#page-2 .radio-item').forEach(r => r.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input').checked = true;
  };
})();

/* ============================================================
   PAGE 3 — DRAW BY NUMBERS (Dual Canvas + Step Locking)
   ============================================================ */

(function initPage3() {
  function setupCanvas(id) {
    const canvas = document.getElementById(id);
    if (!canvas) return null;
    const ctx = canvas.getContext('2d');
    let isDrawing = false;
    let lastX = 0, lastY = 0;

    function getPos(e) {
      const rect = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - rect.left) * (canvas.width / rect.width),
        y: (clientY - rect.top) * (canvas.height / rect.height)
      };
    }

    canvas.addEventListener('mousedown', e => { isDrawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; });
    canvas.addEventListener('touchstart', e => { e.preventDefault(); isDrawing = true; const p = getPos(e); lastX = p.x; lastY = p.y; }, { passive: false });

    canvas.addEventListener('mousemove', e => {
      if (!isDrawing) return;
      const p = getPos(e);
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = '#1a1d2b'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
      lastX = p.x; lastY = p.y;
    });
    canvas.addEventListener('touchmove', e => {
      e.preventDefault();
      if (!isDrawing) return;
      const p = getPos(e);
      ctx.beginPath(); ctx.moveTo(lastX, lastY); ctx.lineTo(p.x, p.y);
      ctx.strokeStyle = '#1a1d2b'; ctx.lineWidth = 2.5; ctx.lineCap = 'round'; ctx.stroke();
      lastX = p.x; lastY = p.y;
    }, { passive: false });

    window.addEventListener('mouseup', () => isDrawing = false);
    window.addEventListener('touchend', () => isDrawing = false);

    return { canvas, ctx };
  }

  const myCanvas = setupCanvas('p3-myCanvas');
  const friendCanvas = setupCanvas('p3-friendCanvas');

  window.p3_clearMyCanvas = function() {
    if (myCanvas) myCanvas.ctx.clearRect(0, 0, myCanvas.canvas.width, myCanvas.canvas.height);
  };

  window.p3_clearFriendCanvas = function() {
    if (friendCanvas) friendCanvas.ctx.clearRect(0, 0, friendCanvas.canvas.width, friendCanvas.canvas.height);
  };

  window.p3_lockSteps = function() {
    const inputs = document.querySelectorAll('#page-3 .step-input-row input');
    inputs.forEach(inp => inp.classList.add('locked'));
    document.getElementById('p3-lockMsg').textContent = '🔒 Steps locked! Pass them to a friend without saying what it is.';
  };

  window.p3_clearSteps = function() {
    const inputs = document.querySelectorAll('#page-3 .step-input-row input');
    inputs.forEach(inp => { inp.value = ''; inp.classList.remove('locked'); });
    document.getElementById('p3-lockMsg').textContent = '';
  };

  window.p3_selectRadio = function(el) {
    document.querySelectorAll('#page-3 .radio-item').forEach(r => r.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input').checked = true;
  };
})();

/* ============================================================
   PAGE 4 — TRUE OR FALSE (Boolean Quiz)
   ============================================================ */

(function initPage4() {
  const state = {};

  window.p4_pick = function(btn, val) {
    const item = btn.closest('.tf-item');
    const q = item.dataset.q;
    const isSubjective = item.classList.contains('subjective');

    // Remove picked from siblings
    item.querySelectorAll('.tf-btn').forEach(b => {
      b.classList.remove('picked', 'picked-true', 'picked-false');
    });

    // Mark picked
    btn.classList.add('picked', val === 'true' ? 'picked-true' : 'picked-false');
    state[q] = val;

    // Remove validation styling on re-pick
    if (!isSubjective) {
      item.classList.remove('correct-ans', 'wrong-ans');
    }
  };

  window.p4_check = function() {
    document.querySelectorAll('#p4-warmup .tf-item').forEach(item => {
      const q = item.dataset.q;
      const correct = item.dataset.answer;
      const picked = state[q];

      item.classList.remove('correct-ans', 'wrong-ans');
      if (!picked) return;

      if (picked === correct) {
        item.classList.add('correct-ans');
      } else {
        item.classList.add('wrong-ans');
      }
    });
  };

  window.p4_reset = function() {
    document.querySelectorAll('#page-4 .tf-item').forEach(item => {
      item.classList.remove('correct-ans', 'wrong-ans');
      item.querySelectorAll('.tf-btn').forEach(b => {
        b.classList.remove('picked', 'picked-true', 'picked-false');
      });
    });
    Object.keys(state).forEach(k => delete state[k]);
    document.getElementById('p4-revealBox').style.display = 'none';
  };

  window.p4_reveal = function() {
    document.getElementById('p4-revealBox').style.display = 'block';
  };
})();

/* ============================================================
   PAGE 5 — IF THIS, THEN THAT (Rain Simulator)
   ============================================================ */

(function initPage5() {
  let raining = false;

  window.p5_toggleRain = function() {
    raining = !raining;
    const btn = document.getElementById('p5-rainToggle');
    const out = document.getElementById('p5-simResult');

    if (raining) {
      btn.textContent = 'YES 🌧️';
      btn.classList.add('active');
      out.innerHTML = '<span class="sim-output">take an umbrella 🌂</span>';
    } else {
      btn.textContent = 'NO ❌';
      btn.classList.remove('active');
      out.innerHTML = '<span class="sim-output">wear sunglasses 🕶️</span>';
    }
  };
})();

/* ============================================================
   PAGE 6 — YES/NO MAZE (Decision Tree)
   ============================================================ */

(function initPage6() {
  const animals = {
    bear:   { emoji: '🐻', name: 'BEAR' },
    snake:  { emoji: '🐍', name: 'SNAKE' },
    penguin:{ emoji: '🐧', name: 'PENGUIN' },
    eagle:  { emoji: '🦅', name: 'EAGLE' },
    unknown:{ emoji: '❓', name: 'UNKNOWN' }
  };

  function show(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
  }

  function hide(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  }

  function activatePath(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function setAnimal(key) {
    const a = animals[key] || animals.unknown;
    document.getElementById('p6-emoji').textContent = a.emoji;
    document.getElementById('p6-animalName').textContent = a.name;
  }

  function markAnswered(qid) {
    const card = document.querySelector('#' + qid + ' .maze-qcard');
    if (card) card.classList.add('answered');
  }

  function disableButtons(qid) {
    const btns = document.querySelectorAll('#' + qid + ' .maze-btn');
    btns.forEach(b => { b.disabled = true; b.style.opacity = '0.5'; });
  }

  function finish() {
    show('p6-pathEnd');
    show('p6-result');
    document.getElementById('p6-retry').style.display = 'block';
  }

  window.p6_answer = function(level, answer, branch) {
    if (level === 1) {
      // Q1: Is it warm?
      markAnswered('p6-q1');
      disableButtons('p6-q1');
      activatePath('p6-path1');
      if (answer) {
        // YES → warm
        activatePath('p6-path2a');
        show('p6-q2a');
      } else {
        // NO → not warm
        activatePath('p6-path2b');
        show('p6-q2b');
      }
    }

    if (level === 2) {
      if (branch === 'a') {
        // Q2a: Has fur? (after warm=yes)
        markAnswered('p6-q2a');
        disableButtons('p6-q2a');
        if (answer) {
          // YES → BEAR
          setAnimal('bear');
          finish();
        } else {
          // NO → Has scales?
          activatePath('p6-path3a');
          show('p6-q3a');
        }
      }
      if (branch === 'b') {
        // Q2b: Is it cold? (after warm=no)
        markAnswered('p6-q2b');
        disableButtons('p6-q2b');
        if (answer) {
          // YES → Has fur?
          activatePath('p6-path3b');
          show('p6-q3b');
        } else {
          // NO → unknown
          setAnimal('unknown');
          finish();
        }
      }
    }

    if (level === 3) {
      if (branch === 'a') {
        // Q3a: Has scales? (after warm→fur=no)
        markAnswered('p6-q3a');
        disableButtons('p6-q3a');
        if (answer) {
          setAnimal('snake');
        } else {
          setAnimal('unknown');
        }
        finish();
      }
      if (branch === 'b') {
        // Q3b: Has fur? (after cold→cold=yes)
        markAnswered('p6-q3b');
        disableButtons('p6-q3b');
        if (answer) {
          setAnimal('penguin');
          finish();
        } else {
          // NO → Has feathers?
          activatePath('p6-path3c');
          show('p6-q3c');
        }
      }
      if (branch === 'c') {
        // Q3c: Has feathers? (after cold→cold→fur=no)
        markAnswered('p6-q3c');
        disableButtons('p6-q3c');
        if (answer) {
          setAnimal('eagle');
        } else {
          setAnimal('unknown');
        }
        finish();
      }
    }
  };

  window.p6_reset = function() {
    // Hide all questions except q1
    ['p6-q2a','p6-q2b','p6-q3a','p6-q3b','p6-q3c','p6-result'].forEach(hide);
    document.getElementById('p6-retry').style.display = 'none';

    // Reset paths
    document.querySelectorAll('.maze-path').forEach(p => p.classList.remove('active'));

    // Reset question cards
    document.querySelectorAll('.maze-qcard').forEach(c => c.classList.remove('answered'));

    // Reset buttons
    document.querySelectorAll('.maze-btn').forEach(b => {
      b.disabled = false;
      b.style.opacity = '1';
      b.classList.remove('picked');
    });

    setAnimal('unknown');

    // Show q1
    show('p6-q1');
  };

  window.p6_selectRadio = function(el) {
    document.querySelectorAll('#page-6 .radio-item').forEach(r => r.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input').checked = true;
  };

  // Initialize: show only q1
  hide('p6-q2a'); hide('p6-q2b'); hide('p6-q3a'); hide('p6-q3b'); hide('p6-q3c'); hide('p6-result');
  show('p6-q1');
})();

/* ============================================================
   PAGE 7 — DECISION TREE (Color Guesser)
   ============================================================ */

(function initPage7() {
  function activate(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('active');
  }

  function deactivate(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('active');
  }

  function show(id) {
    const el = document.getElementById(id);
    if (el) el.classList.add('visible');
  }

  function hide(id) {
    const el = document.getElementById(id);
    if (el) el.classList.remove('visible');
  }

  function pickBtn(parentId, isYes) {
    const parent = document.getElementById(parentId);
    if (!parent) return;
    parent.querySelectorAll('.tree-btn').forEach(b => b.classList.remove('picked'));
    const selector = isYes ? '.yes' : '.no';
    const btn = parent.querySelector(selector);
    if (btn) btn.classList.add('picked');
    parent.querySelectorAll('.tree-btn').forEach(b => b.disabled = true);
  }

  window.p7_q1 = function(warm) {
    activate('p7-q1');
    pickBtn('p7-q1', warm);
    show('p7-branches');

    if (warm) {
      activate('p7-branch-yes');
      deactivate('p7-branch-no');
      // Disable Q3 buttons visually
      const q3 = document.getElementById('p7-q3');
      if (q3) q3.querySelectorAll('.tree-btn').forEach(b => { b.disabled = true; b.style.opacity = '0.3'; });
    } else {
      activate('p7-branch-no');
      deactivate('p7-branch-yes');
      const q2 = document.getElementById('p7-q2');
      if (q2) q2.querySelectorAll('.tree-btn').forEach(b => { b.disabled = true; b.style.opacity = '0.3'; });
    }
  };

  window.p7_q2 = function(fire) {
    activate('p7-q2');
    pickBtn('p7-q2', fire);
    show('p7-results');
    if (fire) {
      activate('p7-red');
    } else {
      activate('p7-orange');
    }
  };

  window.p7_q3 = function(sky) {
    activate('p7-q3');
    pickBtn('p7-q3', sky);
    show('p7-results');
    if (sky) {
      activate('p7-blue');
    } else {
      activate('p7-green');
    }
  };

  window.p7_resetColor = function() {
    ['p7-q1','p7-q2','p7-q3','p7-red','p7-orange','p7-blue','p7-green','p7-branch-yes','p7-branch-no'].forEach(deactivate);
    hide('p7-branches');
    hide('p7-results');
    document.querySelectorAll('#p7-colorTree .tree-btn').forEach(b => {
      b.classList.remove('picked');
      b.disabled = false;
      b.style.opacity = '1';
    });
  };

  window.p7_selectRadio = function(el) {
    document.querySelectorAll('#page-7 .radio-item').forEach(r => r.classList.remove('selected'));
    el.classList.add('selected');
    el.querySelector('input').checked = true;
  };
})();

/* ============================================================
   PAGES 8–20 — PLACEHOLDER INITIALIZATION
   Add page-specific logic here as prompts arrive.
   ============================================================ */

// Example structure for future pages:
// (function initPageN() { ... })();
