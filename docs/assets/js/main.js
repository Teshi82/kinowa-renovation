'use strict';
/* No frameworks, external requests, analytics, cookies, or browser storage. */
(() => {
  const menuButton = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#global-nav');
  const narrowScreen = window.matchMedia('(max-width: 1000px)');
  const closeMenu = (returnFocus = false) => {
    if (!menuButton || !navigation) return;
    menuButton.setAttribute('aria-expanded', 'false');
    navigation.classList.remove('is-open');
    menuButton.querySelector('.menu-label').textContent = 'メニュー';
    if (returnFocus) menuButton.focus();
  };
  if (menuButton && navigation) {
    menuButton.addEventListener('click', () => {
      const open = menuButton.getAttribute('aria-expanded') !== 'true';
      menuButton.setAttribute('aria-expanded', String(open));
      navigation.classList.toggle('is-open', open);
      menuButton.querySelector('.menu-label').textContent = open ? '閉じる' : 'メニュー';
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && menuButton.getAttribute('aria-expanded') === 'true') closeMenu(true);
    });
    navigation.addEventListener('click', (event) => {
      if (event.target.closest('a') && narrowScreen.matches) closeMenu();
    });
    narrowScreen.addEventListener('change', () => closeMenu());
  }

  const cards = [...document.querySelectorAll('.work-card[data-category]')];
  const filters = [...document.querySelectorAll('[data-filter]')];
  const filterStatus = document.querySelector('#filter-status');
  filters.forEach((button) => {
    button.addEventListener('click', () => {
      const category = button.dataset.filter;
      filters.forEach((item) => item.setAttribute('aria-pressed', String(item === button)));
      let visible = 0;
      cards.forEach((card) => {
        const show = category === 'all' || card.dataset.category === category;
        card.hidden = !show;
        if (show) visible += 1;
      });
      if (filterStatus) filterStatus.textContent = button.textContent + '：' + visible + '件の施工例を表示しています。';
    });
  });

  /* FAQ uses native details/summary: keyboard and no-JS behavior are built in. */
  document.querySelectorAll('a[href^="#"]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const id = link.getAttribute('href').slice(1);
      const target = document.getElementById(id);
      if (!target || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
      target.scrollIntoView({ behavior: reduceMotion ? 'instant' : 'smooth', block: 'start' });
      if (!target.hasAttribute('tabindex')) target.setAttribute('tabindex', '-1');
      target.focus({ preventScroll: true });
      /* Native anchors remain functional without JavaScript. */
      history.pushState(null, '', '#' + encodeURIComponent(id));
    });
  });

  const form = document.querySelector('#contact-form');
  if (form) {
    const ids = ['name', 'email', 'phone', 'service', 'message', 'consent'];
    const fields = ids.map((id) => document.getElementById(id));
    const feedback = document.querySelector('#form-feedback');
    const check = (field) => {
      const value = field.value.trim();
      if (field.id === 'consent') return field.checked ? '' : 'デモと個人情報の取り扱いを確認し、同意にチェックしてください。';
      if (field.id === 'name' && !value) return '氏名を入力してください。架空のお名前でお試しいただけます。';
      if (field.id === 'name' && value.length > 80) return '氏名は80文字以内で入力してください。';
      if (field.id === 'email') {
        if (!value) return 'メールアドレスを入力してください。';
        if (value.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) || field.validity.typeMismatch) return 'sample@example.com のような形式で入力してください。';
      }
      if (field.id === 'phone' && value) {
        const digits = value.replace(/\D/g, '');
        if (!/^[0-9+()\s-]+$/.test(value) || digits.length < 7 || digits.length > 15) return '電話番号は7〜15桁の数字で入力してください（ハイフン・括弧・空白も使えます）。';
      }
      if (field.id === 'service' && !value) return '希望する工事内容を選択してください。未定も選べます。';
      if (field.id === 'message' && !value) return 'お問い合わせ内容を入力してください。';
      if (field.id === 'message' && value.length > 2000) return 'お問い合わせ内容は2,000文字以内で入力してください。';
      return '';
    };
    const renderError = (field) => {
      const error = check(field);
      document.getElementById(field.id + '-error').textContent = error;
      if (error) field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
      return error;
    };
    /* Register prevention BEFORE enabling controls. Inputs have no name attributes as an extra no-send safeguard. */
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const invalid = fields.filter((field) => renderError(field));
      if (invalid.length) {
        feedback.textContent = invalid.length + '項目を確認してください。入力内容は送信されていません。';
        invalid[0].focus();
        return;
      }
      form.reset();
      fields.forEach((field) => {
        field.removeAttribute('aria-invalid');
        document.getElementById(field.id + '-error').textContent = '';
      });
      feedback.textContent = '入力内容を確認しました。デモサイトのため実際には送信されません。連絡や受付は行われません。入力内容は保存せず、フォームから消去しました。';
      feedback.focus();
    });
    fields.forEach((field) => {
      const update = () => {
        if (field.getAttribute('aria-invalid') === 'true') renderError(field);
        feedback.textContent = '';
      };
      field.addEventListener('input', update);
      field.addEventListener('change', update);
    });
    document.querySelector('#contact-fields').disabled = false;
    document.querySelector('#demo-submit').disabled = false;
  }
  document.documentElement.classList.add('js');
})();
