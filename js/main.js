/* =========================================================
   NOVAPOL SEGUROS — script principal
   ========================================================= */
/* ---------------------------------------------------------
   CONFIGURACIÓN DE FORMULARIOS (Web3Forms)
   Los formularios llegan al correo novapolseguros@gmail.com.
   Pega abajo tu Access Key gratuita (ver LEEME-FORMULARIOS.md).
   --------------------------------------------------------- */
var NOVAPOL_CONFIG = {
  web3formsAccessKey: '188b448d-3555-4859-83aa-a9cc12105274',
  endpoint: 'https://api.web3forms.com/submit',
  whatsappUrl: 'https://wa.me/573016755052?text=Hola%20Novapol%20Seguros%2C%20quisiera%20recibir%20asesor%C3%ADa.'
};

document.addEventListener('DOMContentLoaded', function () {

  /* ---------- Menú móvil ---------- */
  var hamburger = document.querySelector('.hamburger');
  var mobileMenu = document.querySelector('.mobile-menu');

  if (hamburger && mobileMenu) {
    hamburger.addEventListener('click', function () {
      var isOpen = mobileMenu.classList.toggle('is-open');
      hamburger.classList.toggle('is-open', isOpen);
      hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    mobileMenu.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mobileMenu.classList.remove('is-open');
        hamburger.classList.remove('is-open');
        document.body.style.overflow = '';
      });
    });
  }

  /* ---------- Header: sombra al hacer scroll ---------- */
  var header = document.querySelector('.site-header');
  if (header) {
    var toggleHeaderShadow = function () {
      header.style.boxShadow = window.scrollY > 8 ? '0 4px 18px rgba(14,33,54,.08)' : 'none';
    };
    window.addEventListener('scroll', toggleHeaderShadow, { passive: true });
    toggleHeaderShadow();
  }

  /* ---------- Revelado suave al hacer scroll ---------- */
  var revealEls = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealEls.length) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('in');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });
    revealEls.forEach(function (el) { io.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add('in'); });
  }

  /* ---------- Toggle de audiencia en Contacto (cliente / asociado) ---------- */
  var audienceButtons = document.querySelectorAll('[data-audience-btn]');
  var audienceForms = document.querySelectorAll('[data-audience-form]');
  audienceButtons.forEach(function (btn) {
    btn.addEventListener('click', function () {
      var target = btn.getAttribute('data-audience-btn');
      audienceButtons.forEach(function (b) { b.classList.toggle('active', b === btn); });
      audienceForms.forEach(function (f) {
        f.style.display = f.getAttribute('data-audience-form') === target ? 'block' : 'none';
      });
    });
  });

  /* ---------- Botones "Quiero asesoría": preseleccionan el seguro en el formulario ---------- */
  document.querySelectorAll('[data-seguro]').forEach(function (link) {
    link.addEventListener('click', function () {
      var select = document.getElementById('c-seguro');
      var clientBtn = document.querySelector('[data-audience-btn="cliente"]');
      if (clientBtn) clientBtn.click();
      if (select) select.value = link.getAttribute('data-seguro');
    });
  });

  /* ---------- Validación y envío de formularios ---------- */
  var forms = document.querySelectorAll('form[data-validate]');

  function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  forms.forEach(function (form) {
    form.addEventListener('submit', function (e) {
      e.preventDefault();

      var valid = true;
      var fields = form.querySelectorAll('[data-required]');

      fields.forEach(function (field) {
        var wrapper = field.closest('.field');
        var value = (field.value || '').trim();
        var fieldValid = value.length > 0;

        if (fieldValid && field.type === 'email') {
          fieldValid = isValidEmail(value);
        }
        if (fieldValid && field.type === 'checkbox') {
          fieldValid = field.checked;
        }

        if (wrapper) {
          wrapper.classList.toggle('has-error', !fieldValid);
        }
        if (!fieldValid) valid = false;
      });

      var status = form.querySelector('.form-status');
      var submitBtn = form.querySelector('button[type="submit"]');

      if (!valid) {
        if (status) {
          status.textContent = 'Por favor revisa los campos marcados antes de continuar.';
          status.className = 'form-status show error';
        }
        return;
      }

      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.dataset.originalText = submitBtn.dataset.originalText || submitBtn.textContent;
        submitBtn.textContent = 'Enviando...';
      }
      if (status) {
        status.className = 'form-status show';
        status.style.background = 'rgba(28,58,92,.08)';
        status.style.color = '#1c3a5c';
        status.textContent = 'Enviando tu información...';
      }

      var keyMissing = !NOVAPOL_CONFIG.web3formsAccessKey ||
        NOVAPOL_CONFIG.web3formsAccessKey.indexOf('PEGA_AQUI') === 0;

      function finish(ok, msg) {
        if (status) {
          status.removeAttribute('style');
          status.className = 'form-status show ' + (ok ? 'success' : 'error');
          status.textContent = msg;
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.textContent = submitBtn.dataset.originalText;
        }
        if (ok) form.reset();
      }

      if (keyMissing) {
        finish(false, 'El formulario aún no está activado. Por favor escríbenos por WhatsApp al +57 301 675 5052 o a novapolseguros@gmail.com.');
        return;
      }

      // Se arma el envío con todos los campos que tienen atributo name
      var payload = {
        access_key: NOVAPOL_CONFIG.web3formsAccessKey,
        subject: form.getAttribute('data-subject') || 'Nuevo mensaje - Novapol Seguros',
        from_name: 'Sitio web Novapol Seguros',
        botcheck: ''
      };
      form.querySelectorAll('input[name], select[name], textarea[name]').forEach(function (el) {
        if (el.type === 'checkbox') {
          payload[el.name] = el.checked ? 'Sí' : 'No';
        } else if (el.name === 'botcheck') {
          payload.botcheck = el.value;
        } else {
          payload[el.name] = (el.value || '').trim();
        }
      });

      fetch(NOVAPOL_CONFIG.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
        body: JSON.stringify(payload)
      })
        .then(function (res) { return res.json().catch(function () { return {}; }).then(function (data) { return { ok: res.ok, data: data }; }); })
        .then(function (r) {
          if (r.ok && r.data.success !== false) {
            finish(true, '¡Listo! Recibimos tu información. Un asesor de Novapol se pondrá en contacto contigo muy pronto.');
          } else {
            finish(false, 'No pudimos enviar tu información. Inténtalo de nuevo o escríbenos por WhatsApp al +57 301 675 5052.');
          }
        })
        .catch(function () {
          finish(false, 'No pudimos enviar tu información. Revisa tu conexión o escríbenos por WhatsApp al +57 301 675 5052.');
        });
    });

    // Quita el estado de error apenas el usuario corrige el campo
    form.querySelectorAll('[data-required]').forEach(function (field) {
      field.addEventListener('input', function () {
        var wrapper = field.closest('.field');
        if (wrapper) wrapper.classList.remove('has-error');
      });
      field.addEventListener('change', function () {
        var wrapper = field.closest('.field');
        if (wrapper) wrapper.classList.remove('has-error');
      });
    });
  });

  /* ---------- Resaltar enlace activo según la sección visible (solo index) ---------- */
  var navLinks = document.querySelectorAll('.nav-desktop a[href^="#"]');
  var sections = [];
  navLinks.forEach(function (link) {
    var id = link.getAttribute('href').replace('#', '');
    var section = document.getElementById(id);
    if (section) sections.push({ link: link, section: section });
  });

  if (sections.length && 'IntersectionObserver' in window) {
    var navObserver = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        var match = sections.find(function (s) { return s.section === entry.target; });
        if (!match) return;
        if (entry.isIntersecting) {
          navLinks.forEach(function (l) { l.classList.remove('current'); });
          match.link.classList.add('current');
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });

    sections.forEach(function (s) { navObserver.observe(s.section); });
  }

});
