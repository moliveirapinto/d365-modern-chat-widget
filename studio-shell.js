/* ============================================================================
   Chat Widget Studio — workspace shell
   Groups the settings cards behind a section rail so one task is visible at a
   time. Cards are tagged in place and shown/hidden with CSS; nothing is
   reparented, so widget-mode switching keeps working untouched.
   ========================================================================== */
(function () {
    'use strict';

    var STORAGE_KEY = 'studio-active-group';

    var SECTIONS = [
        {
            id: 'setup',
            label: 'Setup',
            title: 'Setup',
            blurb: 'Pick a profile, choose how the widget loads, and connect it to your Dynamics 365 environment.',
            match: ['widget profiles', 'demo website background', 'widget mode', 'connection']
        },
        {
            id: 'appearance',
            label: 'Appearance',
            title: 'Appearance',
            blurb: 'Branding, type, colour and avatars — everything the customer actually sees.',
            match: ['header & branding', 'fonts', 'colors', 'colours', 'avatars', 'nextgen options']
        },
        {
            id: 'content',
            label: 'Content',
            title: 'Content',
            blurb: 'The words in the widget: pre-chat questions, labels and localization.',
            match: ['pre-chat form', 'localization']
        },
        {
            id: 'advanced',
            label: 'Advanced',
            title: 'Advanced',
            blurb: 'Authentication and the embed code you paste into your site.',
            match: ['contact authentication', 'embed widget code']
        }
    ];

    function groupFor(title) {
        var t = (title || '').toLowerCase();
        for (var i = 0; i < SECTIONS.length; i++) {
            var m = SECTIONS[i].match;
            for (var j = 0; j < m.length; j++) {
                if (t.indexOf(m[j]) !== -1) return SECTIONS[i].id;
            }
        }
        return null;
    }

    function tagCards() {
        var cards = document.querySelectorAll('.settings-panel .settings-card');
        for (var i = 0; i < cards.length; i++) {
            var heading = cards[i].querySelector('.card-header h2');
            // The unlabelled card is the global action bar — keep it in every section.
            var id = heading ? groupFor(heading.textContent) : 'always';
            cards[i].setAttribute('data-group', id || 'advanced');
        }
    }

    function availableCards(id) {
        var cards = document.querySelectorAll('.settings-panel .settings-card[data-group="' + id + '"]');
        var n = 0;
        for (var i = 0; i < cards.length; i++) {
            if (!cards[i].closest('.hidden') && cards[i].getAttribute('data-connection-ok') !== 'true') n++;
        }
        return n;
    }

    function buildRail(container) {
        var rail = document.createElement('nav');
        rail.className = 'at-rail';
        rail.setAttribute('aria-label', 'Settings sections');

        var eyebrow = document.createElement('div');
        eyebrow.className = 'at-rail-eyebrow';
        eyebrow.textContent = 'Studio';
        rail.appendChild(eyebrow);

        SECTIONS.forEach(function (section) {
            var item = document.createElement('button');
            item.type = 'button';
            item.className = 'at-rail-item';
            item.setAttribute('data-group-target', section.id);

            var dot = document.createElement('span');
            dot.className = 'at-rail-dot';
            item.appendChild(dot);

            var label = document.createElement('span');
            label.textContent = section.label;
            item.appendChild(label);

            var count = document.createElement('span');
            count.className = 'at-rail-count';
            count.setAttribute('data-count-for', section.id);
            item.appendChild(count);

            item.addEventListener('click', function () { activate(section.id); });
            rail.appendChild(item);
        });

        var sep = document.createElement('div');
        sep.className = 'at-rail-sep';
        rail.appendChild(sep);

        var note = document.createElement('p');
        note.className = 'at-rail-note';
        note.innerHTML = 'Changes save automatically and appear in the <strong>live preview</strong>.';
        rail.appendChild(note);

        container.insertBefore(rail, container.firstChild);
        return rail;
    }

    function buildHeading(panel) {
        var head = document.createElement('header');
        head.className = 'at-section-head';
        head.innerHTML = '<h2 data-section-title></h2><p data-section-blurb></p>';
        panel.insertBefore(head, panel.firstChild);
        return head;
    }

    function refreshCounts() {
        SECTIONS.forEach(function (section) {
            var el = document.querySelector('[data-count-for="' + section.id + '"]');
            if (el) el.textContent = availableCards(section.id) || '';
        });
    }

    function expandFirst(id) {
        var cards = document.querySelectorAll('.settings-panel .settings-card[data-group="' + id + '"]');
        var visible = [];
        for (var i = 0; i < cards.length; i++) {
            if (cards[i].offsetParent !== null) visible.push(cards[i]);
        }
        if (!visible.length) return;
        var anyOpen = visible.some(function (c) { return !c.classList.contains('collapsed'); });
        if (!anyOpen) visible[0].classList.remove('collapsed');
    }

    function activate(id) {
        var section = SECTIONS.filter(function (s) { return s.id === id; })[0] || SECTIONS[0];

        document.body.setAttribute('data-studio-group', section.id);

        var items = document.querySelectorAll('.at-rail-item');
        for (var i = 0; i < items.length; i++) {
            var isCurrent = items[i].getAttribute('data-group-target') === section.id;
            items[i].setAttribute('aria-current', isCurrent ? 'true' : 'false');
        }

        var title = document.querySelector('[data-section-title]');
        var blurb = document.querySelector('[data-section-blurb]');
        if (title) title.textContent = section.title;
        if (blurb) blurb.textContent = section.blurb;

        try { localStorage.setItem(STORAGE_KEY, section.id); } catch (e) {}

        requestAnimationFrame(function () {
            expandFirst(section.id);
            refreshCounts();
        });
    }

    /* ── Recognise a pasted embed code immediately ───────────────────────────
       The paste box was only read when "Save" was clicked, so pasting a code
       looked like nothing happened. Parse it as it lands, apply the connection
       IDs and refresh the preview. */

    function readCode(code) {
        var pick = function (attr) {
            var m = code.match(new RegExp('data-' + attr + '\\s*=\\s*["\']([^"\']+)["\']', 'i'));
            return m ? m[1] : '';
        };
        return { appId: pick('app-id'), orgId: pick('org-id'), orgUrl: pick('org-url') };
    }

    function setStatus(el, state, message) {
        el.setAttribute('data-state', state);
        el.textContent = message;
    }

    function applyPastedCode(box, status) {
        var code = (box.value || '').trim();

        if (!code) {
            setStatus(status, 'idle', '');
            return;
        }

        var parts = readCode(code);
        if (!parts.appId || !parts.orgId || !parts.orgUrl) {
            setStatus(status, 'warn', 'That does not look like a complete embed code — it needs data-app-id, data-org-id and data-org-url.');
            return;
        }

        // Mirror into the canonical field so a later save keeps the code.
        var canonical = document.getElementById('lcwCode');
        if (canonical) canonical.value = code;

        try {
            if (typeof window.parseLCWCode === 'function') window.parseLCWCode(code);
        } catch (e) {}

        try {
            var stored = JSON.parse(localStorage.getItem('chatWidgetSettings') || '{}') || {};
            stored.widgetId = parts.appId;
            stored.orgId = parts.orgId;
            stored.orgUrl = parts.orgUrl;
            stored.lcwCode = code;
            localStorage.setItem('chatWidgetSettings', JSON.stringify(stored));
        } catch (e) {}

        ['nswSyncFromGlobal', 'updatePreview', 'nswUpdate', 'updateStandardPreview'].forEach(function (fn) {
            try { if (typeof window[fn] === 'function') window[fn](); } catch (e) {}
        });

        setStatus(status, 'ok', 'Connected to App ID ' + parts.appId.slice(0, 8) + '… · Org ' + parts.orgId.slice(0, 8) + '… — name it above and press Save to keep it as a profile.');
    }

    function wirePasteRecognition() {
        var box = document.getElementById('newProfileLcwCode');
        if (!box || box.getAttribute('data-at-wired')) return;
        box.setAttribute('data-at-wired', '1');

        var status = document.createElement('p');
        status.className = 'at-paste-status';
        status.setAttribute('data-state', 'idle');
        box.parentNode.insertBefore(status, box.nextSibling);

        var timer;
        var run = function () {
            clearTimeout(timer);
            timer = setTimeout(function () { applyPastedCode(box, status); }, 300);
        };
        box.addEventListener('input', run);
        box.addEventListener('paste', run);
    }

    /* ── Hide the Connection card once it is just an echo ────────────────────
       It holds no inputs — only a status line. Connected, it repeats what the
       profile above already shows; unconnected, it explains what to do. */

    function syncConnectionCard() {
        var status = document.getElementById('nsw-conn-text');
        if (!status) return;
        var card = status.closest('.settings-card');
        if (!card) return;
        var connected = /^\s*✓/.test(status.textContent || '');
        card.setAttribute('data-connection-ok', connected ? 'true' : 'false');
        refreshCounts();
    }

    function watchConnectionCard() {
        var status = document.getElementById('nsw-conn-text');
        if (!status || status.getAttribute('data-at-watched')) return;
        status.setAttribute('data-at-watched', '1');
        syncConnectionCard();
        new MutationObserver(syncConnectionCard).observe(status, {
            childList: true, characterData: true, subtree: true
        });
    }

    /* ── Font picker with live previews ──────────────────────────────────────
       The NextGen font field was a free-text box, so you had to know the exact
       CSS stack. It becomes a listbox that renders every option in its own
       typeface. The original input stays as the value holder so the studio's
       existing persistence keeps working. */

    var FONT_GROUPS = [
        { label: '', items: [{ name: 'Widget default', stack: '' }] },
        { label: 'Sans-serif', items: [
            { name: 'Inter', stack: 'Inter, sans-serif' },
            { name: 'Roboto', stack: 'Roboto, sans-serif' },
            { name: 'Open Sans', stack: '"Open Sans", sans-serif' },
            { name: 'Lato', stack: 'Lato, sans-serif' },
            { name: 'Poppins', stack: 'Poppins, sans-serif' },
            { name: 'Montserrat', stack: 'Montserrat, sans-serif' },
            { name: 'Nunito', stack: 'Nunito, sans-serif' },
            { name: 'Source Sans Pro', stack: '"Source Sans Pro", sans-serif' },
            { name: 'Raleway', stack: 'Raleway, sans-serif' },
            { name: 'Ubuntu', stack: 'Ubuntu, sans-serif' },
            { name: 'Rubik', stack: 'Rubik, sans-serif' },
            { name: 'Work Sans', stack: '"Work Sans", sans-serif' },
            { name: 'Fira Sans', stack: '"Fira Sans", sans-serif' },
            { name: 'DM Sans', stack: '"DM Sans", sans-serif' },
            { name: 'Manrope', stack: 'Manrope, sans-serif' },
            { name: 'Plus Jakarta Sans', stack: '"Plus Jakarta Sans", sans-serif' },
            { name: 'Outfit', stack: 'Outfit, sans-serif' },
            { name: 'Lexend', stack: 'Lexend, sans-serif' }
        ]},
        { label: 'Serif', items: [
            { name: 'Playfair Display', stack: '"Playfair Display", serif' },
            { name: 'Merriweather', stack: 'Merriweather, serif' },
            { name: 'Lora', stack: 'Lora, serif' },
            { name: 'Crimson Text', stack: '"Crimson Text", serif' },
            { name: 'Libre Baskerville', stack: '"Libre Baskerville", serif' }
        ]},
        { label: 'Monospace', items: [
            { name: 'JetBrains Mono', stack: '"JetBrains Mono", monospace' },
            { name: 'Fira Code', stack: '"Fira Code", monospace' },
            { name: 'Source Code Pro', stack: '"Source Code Pro", monospace' }
        ]},
        { label: 'Display', items: [
            { name: 'Quicksand', stack: 'Quicksand, sans-serif' },
            { name: 'Comfortaa', stack: 'Comfortaa, cursive' },
            { name: 'Righteous', stack: 'Righteous, cursive' }
        ]}
    ];

    var SAMPLE = 'The quick brown fox';

    function allFonts() {
        var out = [];
        FONT_GROUPS.forEach(function (g) { out = out.concat(g.items); });
        return out;
    }

    function fontName(stack) {
        var match = allFonts().filter(function (f) { return f.stack === stack; })[0];
        if (match) return match.name;
        return stack ? 'Custom' : 'Widget default';
    }

    function buildFontPicker(input) {
        var wrap = document.createElement('div');
        wrap.className = 'at-fontpick';

        var trigger = document.createElement('button');
        trigger.type = 'button';
        trigger.className = 'at-fontpick-trigger';
        trigger.setAttribute('aria-haspopup', 'listbox');
        trigger.setAttribute('aria-expanded', 'false');
        trigger.innerHTML = '<span class="at-fontpick-current"></span><span class="at-fontpick-chevron">▾</span>';

        var menu = document.createElement('div');
        menu.className = 'at-fontpick-menu';
        menu.setAttribute('role', 'listbox');
        menu.hidden = true;

        FONT_GROUPS.forEach(function (group) {
            if (group.label) {
                var heading = document.createElement('div');
                heading.className = 'at-fontpick-group';
                heading.textContent = group.label;
                menu.appendChild(heading);
            }
            group.items.forEach(function (font) {
                var option = document.createElement('button');
                option.type = 'button';
                option.className = 'at-fontpick-option';
                option.setAttribute('role', 'option');
                option.setAttribute('data-stack', font.stack);
                option.innerHTML =
                    '<span class="at-fontpick-name">' + font.name + '</span>' +
                    '<span class="at-fontpick-sample">' + (font.stack ? SAMPLE : 'Uses the widget default') + '</span>';
                if (font.stack) {
                    option.querySelector('.at-fontpick-name').style.fontFamily = font.stack;
                    option.querySelector('.at-fontpick-sample').style.fontFamily = font.stack;
                }
                menu.appendChild(option);
            });
        });

        // Keeps the custom-font-URL workflow reachable now that free text is gone.
        var custom = document.createElement('button');
        custom.type = 'button';
        custom.className = 'at-fontpick-option at-fontpick-custom';
        custom.setAttribute('role', 'option');
        custom.innerHTML = '<span class="at-fontpick-name">Custom…</span><span class="at-fontpick-sample">Type your own CSS font stack</span>';
        menu.appendChild(custom);

        input.parentNode.insertBefore(wrap, input);
        wrap.appendChild(trigger);
        wrap.appendChild(menu);
        wrap.appendChild(input);
        input.classList.add('at-fontpick-input');

        function render() {
            var stack = (input.value || '').trim();
            var label = fontName(stack);
            var current = trigger.querySelector('.at-fontpick-current');
            current.textContent = label + (stack && label !== 'Custom' ? '  ·  ' + SAMPLE : '');
            current.style.fontFamily = stack || '';
            Array.prototype.forEach.call(menu.querySelectorAll('.at-fontpick-option'), function (o) {
                o.setAttribute('aria-selected', o.getAttribute('data-stack') === stack ? 'true' : 'false');
            });
        }

        function close() {
            menu.hidden = true;
            trigger.setAttribute('aria-expanded', 'false');
        }

        function open() {
            menu.hidden = false;
            trigger.setAttribute('aria-expanded', 'true');
            var selected = menu.querySelector('[aria-selected="true"]') || menu.querySelector('.at-fontpick-option');
            if (selected) selected.focus();
        }

        function choose(stack) {
            input.value = stack;
            input.dispatchEvent(new Event('input', { bubbles: true }));
            input.dispatchEvent(new Event('change', { bubbles: true }));
            try { if (typeof window.nswUpdate === 'function') window.nswUpdate(); } catch (e) {}
            render();
            close();
            trigger.focus();
        }

        trigger.addEventListener('click', function () { menu.hidden ? open() : close(); });

        menu.addEventListener('click', function (event) {
            var option = event.target.closest('.at-fontpick-option');
            if (!option) return;
            if (option === custom) {
                close();
                input.classList.add('at-fontpick-input-visible');
                input.focus();
                return;
            }
            choose(option.getAttribute('data-stack'));
        });

        menu.addEventListener('keydown', function (event) {
            var options = Array.prototype.slice.call(menu.querySelectorAll('.at-fontpick-option'));
            var index = options.indexOf(document.activeElement);
            if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
                event.preventDefault();
                var next = index + (event.key === 'ArrowDown' ? 1 : -1);
                if (next < 0) next = options.length - 1;
                if (next >= options.length) next = 0;
                options[next].focus();
            } else if (event.key === 'Escape') {
                close();
                trigger.focus();
            }
        });

        document.addEventListener('click', function (event) {
            if (!wrap.contains(event.target)) close();
        });

        input.addEventListener('input', render);
        render();
    }

    function wireFontPicker() {
        var input = document.getElementById('nsw-font');
        if (!input || input.getAttribute('data-at-picker')) return;
        input.setAttribute('data-at-picker', '1');
        buildFontPicker(input);
    }

    /* ── Display options in one place ────────────────────────────────────────
       "Show Landing Page" lived in Pre-chat Form while the avatar/name toggles
       and action placement sat in two other cards, so it was easy to miss.
       Microsoft's reference groups all four under Display Options; match it.
       Everything stays inside #standardWidgetSettings so the studio's own
       change listeners keep firing. */

    function findCard(root, title) {
        return Array.prototype.filter.call(root.querySelectorAll('.settings-card'), function (card) {
            var h = card.querySelector('.card-header h2');
            return h && h.textContent.trim() === title;
        })[0];
    }

    function rowFor(el) {
        var node = el;
        while (node && node.parentElement && !node.parentElement.classList.contains('card-body')) {
            node = node.parentElement;
        }
        return node && node.parentElement && node.parentElement.classList.contains('card-body') ? node : null;
    }

    function consolidateDisplayOptions() {
        var root = document.getElementById('standardWidgetSettings');
        if (!root) return;

        var target = findCard(root, 'Avatars');
        if (!target || target.getAttribute('data-at-display')) return;

        var body = target.querySelector('.card-body');
        if (!body) return;
        target.setAttribute('data-at-display', '1');

        var landingRow = rowFor(document.getElementById('nsw-landing'));
        if (landingRow) {
            body.insertBefore(landingRow, body.firstChild);
            var label = landingRow.querySelector('.toggle-label');
            if (label) label.textContent = 'Show Landing Page';
        }

        var placementRow = rowFor(document.getElementById('nsw-action-placement'));
        if (placementRow) body.appendChild(placementRow);

        var heading = target.querySelector('.card-header h2');
        var blurb = target.querySelector('.card-header p');
        if (heading) heading.textContent = 'Display Options';
        if (blurb) blurb.textContent = 'Landing page, agent avatar and name, and where the action buttons sit.';
    }

    function init() {
        var container = document.querySelector('.admin-container');
        var panel = document.querySelector('.settings-panel');
        if (!container || !panel || document.querySelector('.at-rail')) return;

        tagCards();
        consolidateDisplayOptions();
        buildRail(container);
        buildHeading(panel);
        wirePasteRecognition();
        watchConnectionCard();
        wireFontPicker();

        var saved = null;
        try { saved = localStorage.getItem(STORAGE_KEY); } catch (e) {}
        var valid = SECTIONS.some(function (s) { return s.id === saved; });
        activate(valid ? saved : SECTIONS[0].id);

        // Switching widget mode swaps which cards exist, so keep the counts honest.
        document.querySelectorAll('input[name="widgetMode"]').forEach(function (radio) {
            radio.addEventListener('change', function () {
                requestAnimationFrame(refreshCounts);
            });
        });
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        init();
    }
}());
