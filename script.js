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

  /* ---------- 移动端荣誉轮播：自动滚 + 手指左右滑动 ---------- */
  class MarqueeSwipe {
    constructor(track, opts = {}) {
      this.track = track;
      this.direction = opts.direction || 1; // 1 = 向左, -1 = 向右
      this.speed = opts.speed || 0.6;       // 自动滚速度 px/frame
      this.friction = opts.friction || 0.92;
      this.snap = opts.snap || false;

      this.x = 0;
      this.velocity = 0;
      this.isDragging = false;
      this.pointerId = null;
      this.startX = 0;
      this.lastX = 0;
      this.lastTime = 0;
      this.rAF = null;
      this.halfWidth = 0;

      // 复制一份内容，保证无缝循环
      this.track.innerHTML += this.track.innerHTML;
      this.refresh();
      this.bind();
      this.play();
    }

    refresh() {
      this.halfWidth = this.track.scrollWidth / 2;
      // 初始位置：反向轨道从 -halfWidth 开始，跟 CSS 关键帧一致
      if (this.direction === -1 && this.x === 0) this.x = -this.halfWidth;
      this.setTransform(this.x);
    }

    setTransform(x) {
      // 无缝循环
      if (this.direction === 1) {
        while (x <= -this.halfWidth) x += this.halfWidth;
        while (x > 0) x -= this.halfWidth;
      } else {
        while (x >= 0) x -= this.halfWidth;
        while (x < -this.halfWidth) x += this.halfWidth;
      }
      this.x = x;
      this.track.style.transform = `translate3d(${x.toFixed(2)}px, 0, 0)`;
    }

    play() {
      if (this.rAF) return;
      const loop = (now) => {
        if (!this.isDragging) {
          if (Math.abs(this.velocity) > 0.3) {
            this.x += this.velocity;
            this.velocity *= this.friction;
          } else {
            this.velocity = 0;
            this.x += this.direction * this.speed;
          }
          this.setTransform(this.x);
        }
        this.rAF = requestAnimationFrame(loop);
      };
      this.rAF = requestAnimationFrame(loop);
    }

    pause() {
      if (this.rAF) {
        cancelAnimationFrame(this.rAF);
        this.rAF = null;
      }
    }

    destroy() {
      this.pause();
      this.unbind();
      this.track.style.transform = '';
      // 恢复原始内容（去掉复制的一半）
      const children = Array.from(this.track.children);
      const half = Math.floor(children.length / 2);
      children.slice(half).forEach(c => c.remove());
    }

    bind() {
      this.onDown = this.onDown.bind(this);
      this.onMove = this.onMove.bind(this);
      this.onUp = this.onUp.bind(this);
      this.track.addEventListener('pointerdown', this.onDown, { passive: false });
      window.addEventListener('pointermove', this.onMove, { passive: false });
      window.addEventListener('pointerup', this.onUp);
      window.addEventListener('pointercancel', this.onUp);
    }

    unbind() {
      this.track.removeEventListener('pointerdown', this.onDown);
      window.removeEventListener('pointermove', this.onMove);
      window.removeEventListener('pointerup', this.onUp);
      window.removeEventListener('pointercancel', this.onUp);
    }

    onDown(e) {
      // 点在链接上时让链接能正常跳转，不拦截
      if (e.target.closest('a')) return;
      this.isDragging = true;
      this.pointerId = e.pointerId;
      this.track.setPointerCapture?.(e.pointerId);
      this.startX = e.clientX;
      this.lastX = e.clientX;
      this.lastTime = performance.now();
      this.velocity = 0;
      this.track.style.cursor = 'grabbing';
    }

    onMove(e) {
      if (!this.isDragging || e.pointerId !== this.pointerId) return;
      e.preventDefault();
      const now = performance.now();
      const dx = e.clientX - this.lastX;
      const dt = now - this.lastTime;
      this.x += dx;
      this.setTransform(this.x);
      if (dt > 0) this.velocity = dx / dt * 16; // 估算每帧速度
      this.lastX = e.clientX;
      this.lastTime = now;
    }

    onUp(e) {
      if (!this.isDragging || e.pointerId !== this.pointerId) return;
      this.isDragging = false;
      this.pointerId = null;
      this.track.style.cursor = '';
      // 惯性结束后继续自动滚
      if (Math.abs(this.velocity) > 1.5) {
        // 速度方向决定接下来往哪边滑；若速度很小仍按原方向
        if (Math.abs(this.velocity) > 3) this.direction = this.velocity > 0 ? 1 : -1;
      }
    }
  }

  const tracks = document.querySelectorAll('.awards-track');
  let mobileMarquees = [];
  const isMobile = () => window.innerWidth <= 768;

  const initMobileMarquee = () => {
    if (mobileMarquees.length) return;
    tracks.forEach((track, i) => {
      const direction = track.classList.contains('awards-track--reverse') ? -1 : 1;
      mobileMarquees.push(new MarqueeSwipe(track, {
        direction,
        speed: 0.5 + i * 0.1, // 上下排速度略有差异，避免死板
        friction: 0.93
      }));
    });
  };

  const destroyMobileMarquee = () => {
    mobileMarquees.forEach(m => m.destroy());
    mobileMarquees = [];
  };

  if (isMobile()) initMobileMarquee();

  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      if (isMobile()) {
        if (!mobileMarquees.length) initMobileMarquee();
        else mobileMarquees.forEach(m => m.refresh());
      } else {
        destroyMobileMarquee();
      }
    }, 150);
  });
});
