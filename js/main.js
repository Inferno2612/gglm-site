/**
 * GGLM — основной скрипт сайта.
 * Три независимых модуля: корзина услуг, отправка формы, плавный скролл.
 */

/* ==========================================================================
   1. Конструктор заявки (корзина услуг)
   ========================================================================== */
function initCart() {
  const cartItemsList = document.getElementById('cart-items-list');
  const cartTotal = document.getElementById('cart-total');
  const cartItemsInput = document.getElementById('cart-items-input');
  const items = document.querySelectorAll('.cart-item');

  if (!cartItemsList || !cartTotal || !cartItemsInput || items.length === 0) return;

  items.forEach((item) => {
    item.addEventListener('click', () => {
      const { type, group } = item.dataset;

      if (type === 'radio') {
        document
          .querySelectorAll(`.cart-item[data-group="${group}"]`)
          .forEach((el) => el.classList.remove('selected'));
        item.classList.add('selected');
      } else if (type === 'checkbox') {
        item.classList.toggle('selected');
      }

      renderCart();
    });
  });

  function renderCart() {
    const selected = document.querySelectorAll('.cart-item.selected');
    let total = 0;
    const names = [];

    cartItemsList.innerHTML = '';

    if (selected.length === 0) {
      cartItemsList.innerHTML =
        '<p class="text-gray-500 text-sm text-center py-4">Услуги не выбраны</p>';
    }

    selected.forEach((item) => {
      const name = item.dataset.name;
      const price = parseInt(item.dataset.price, 10);
      total += price;
      names.push(name);

      const row = document.createElement('div');
      row.className = 'cart-list-item';
      row.innerHTML = `
        <span class="cart-list-item-name">${name}</span>
        <span class="cart-list-item-price">${price.toLocaleString('ru-RU')} ₽</span>
      `;
      cartItemsList.appendChild(row);
    });

    cartTotal.textContent = `${total.toLocaleString('ru-RU')} ₽`;
    cartItemsInput.value = names.join(', ');
  }

  // Экспортируем ресет для использования после отправки формы
  window.__resetCart = () => {
    items.forEach((item) => item.classList.remove('selected'));
    renderCart();
  };
}

/* ==========================================================================
   2. Отправка формы заявки
   ========================================================================== */
function initForm() {
  const SCRIPT_URL =
    'https://script.google.com/macros/s/AKfycbym9Kuut7PMv1Isz5IpW7I67yUkij3ESkQvK0XnbjcPZHxTmYEDAIUDLlQQEgwQ_or82w/exec';

  const form = document.getElementById('gglm-form');
  const successEl = document.getElementById('form-success');
  const errorEl = document.getElementById('form-error');
  const submitBtn = form ? form.querySelector('.btn-submit') : null;

  if (!form || !successEl || !errorEl) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    if (submitBtn) submitBtn.disabled = true;
    errorEl.style.display = 'none';
    successEl.style.display = 'block';
    successEl.textContent = 'Отправляем заявку...';

    try {
      await fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        body: new FormData(form),
      });

      form.reset();
      if (window.__resetCart) window.__resetCart();

      successEl.textContent = 'Спасибо! Заявка отправлена. Мы свяжемся с вами в ближайшее время.';
      setTimeout(() => {
        successEl.style.display = 'none';
      }, 5000);
    } catch (err) {
      successEl.style.display = 'none';
      errorEl.style.display = 'block';
    } finally {
      if (submitBtn) submitBtn.disabled = false;
    }
  });
}

/* ==========================================================================
   3. Плавный скролл к якорям
   ========================================================================== */
function initSmoothScroll() {
  const headerOffset = 80;

  document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;

      const target = document.querySelector(targetId);
      if (!target) return;

      e.preventDefault();
      const top = target.getBoundingClientRect().top + window.pageYOffset - headerOffset;
      window.scrollTo({ top, behavior: 'smooth' });

      // Закрываем мобильное меню, если открыто
      const mobileMenu = document.getElementById('mobile-menu');
      if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
        mobileMenu.classList.add('hidden');
      }
    });
  });
}

/* ==========================================================================
   4. Мобильное меню
   ========================================================================== */
function initMobileMenu() {
  const toggle = document.getElementById('menu-toggle');
  const menu = document.getElementById('mobile-menu');
  if (!toggle || !menu) return;

  toggle.addEventListener('click', () => menu.classList.toggle('hidden'));
}

/* ==========================================================================
   5. Появление секций при скролле
   ========================================================================== */
function initScrollReveal() {
  const targets = document.querySelectorAll('.reveal');
  if (targets.length === 0) return;

  if (!('IntersectionObserver' in window)) {
    targets.forEach((el) => el.classList.add('is-visible'));
    return;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.15 }
  );

  targets.forEach((el) => observer.observe(el));
}

/* ==========================================================================
   Инициализация
   ========================================================================== */
document.addEventListener('DOMContentLoaded', () => {
  initCart();
  initForm();
  initSmoothScroll();
  initMobileMenu();
  initScrollReveal();
});
