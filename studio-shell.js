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

    function init() {
        var container = document.querySelector('.admin-container');
        var panel = document.querySelector('.settings-panel');
        if (!container || !panel || document.querySelector('.at-rail')) return;

        tagCards();
        buildRail(container);
        buildHeading(panel);
        wirePasteRecognition();
        watchConnectionCard();

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
