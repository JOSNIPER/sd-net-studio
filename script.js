/* ============================================================
   升达网络技术工作室 · 交互脚本（无外部依赖，内容默认可见）
   - 主题切换 / 移动端菜单 / 滚动进度条 / 导航收缩
   - 二维码弹窗 / 回到顶部 / 数字计数 / 滚动入场（渐进增强）
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
  const root = document.documentElement;

  /* ---------- 主题切换 ---------- */
  const themeToggle = document.getElementById('themeToggle');
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark' || savedTheme === 'light') {
    root.setAttribute('data-theme', savedTheme);
  }
  themeToggle?.addEventListener('click', () => {
    const next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    root.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });

  /* ---------- 移动端菜单 ---------- */
  const menuToggle = document.getElementById('menuToggle');
  const nav = document.getElementById('nav');
  const overlay = document.getElementById('mobileOverlay');
  const closeMenu = () => {
    menuToggle?.classList.remove('open');
    nav?.classList.remove('open');
    overlay && (overlay.style.display = 'none');
  };
  menuToggle?.addEventListener('click', () => {
    const open = nav?.classList.toggle('open');
    menuToggle.classList.toggle('open', !!open);
    if (overlay) overlay.style.display = open ? 'block' : 'none';
  });
  overlay?.addEventListener('click', closeMenu);
  nav?.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));

  /* ---------- 滚动进度条 + 导航收缩 + 回到顶部 ---------- */
  const progress = document.getElementById('scrollProgress');
  const header = document.getElementById('header');
  const backToTop = document.getElementById('backToTop');
  const onScroll = () => {
    const st = window.scrollY || document.documentElement.scrollTop;
    const h = document.documentElement.scrollHeight - window.innerHeight;
    if (progress) progress.style.width = (h > 0 ? (st / h) * 100 : 0) + '%';
    header?.classList.toggle('scrolled', st > 30);
    backToTop?.classList.toggle('show', st > 400);
  };
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  backToTop?.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  /* ---------- 二维码弹窗 ---------- */
  const openModal = (btnId, modalId) => {
    const btn = document.getElementById(btnId);
    const modal = document.getElementById(modalId);
    btn?.addEventListener('click', () => modal?.classList.add('open'));
  };
  openModal('wechatBtn', 'qrModal');
  openModal('wechatBtn2', 'qrModal');
  openModal('qqBtn', 'qqModal');
  openModal('qqBtn2', 'qqModal');
  openModal('onlineRepair', 'qrModal');
  document.querySelectorAll('.qr-modal').forEach(modal => {
    modal.querySelector('.qr-modal-close')?.addEventListener('click', () => modal.classList.remove('open'));
    modal.querySelector('.qr-modal-overlay')?.addEventListener('click', () => modal.classList.remove('open'));
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') document.querySelectorAll('.qr-modal.open').forEach(m => m.classList.remove('open'));
  });

  /* ---------- 数字滚动计数 ---------- */
  const animateCount = (el) => {
    const target = parseFloat(el.dataset.target || '0');
    const suffix = el.dataset.suffix || '';
    const duration = 1400;
    const start = performance.now();
    const step = (now) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + (p === 1 ? suffix : '');
      if (p < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };
  document.querySelectorAll('.stat-number').forEach(animateCount);

  /* ---------- 滚动入场（渐进增强） ---------- */
  // 仅当 JS 正常运行时才隐藏初始态，保证脚本失败内容也完整可见
  document.body.classList.add('js-reveal');
  const reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('in-view');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => io.observe(el));
  } else {
    reveals.forEach(el => el.classList.add('in-view'));
  }
});
