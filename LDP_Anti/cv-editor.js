/**
 * CV Editor - Overflow logic Trang 1 -> 2 -> 3
 * Một nguồn dữ liệu (Trang 1). Tràn Trang 1 -> Trang 2 (1123px). Tràn Trang 2 -> Trang 3.
 * cv-sidebar-green (Kĩ năng) cũng tràn sang trang tiếp theo, không dùng scroll.
 */
(function () {
    var WRAPPER = '.cv-editor-wrapper';
    var PAGE1_CONTENT = '#cv-card-page1 .cv-content';
    var PAGE1_EXP_LIST = '#cv-card-page1 .cv-exp-list';
    var PAGE2_CONTENT = '#cv-card-page2 .cv-content-page2';
    var PAGE2_EXP_LIST = '#cv-exp-list-page2';
    var PAGE3_EXP_LIST = '#cv-exp-list-page3';
    var PAGE1_SKILL_TAGS = '#cv-card-page1 .cv-sidebar-green .cv-skill-tags';
    var PAGE2_SKILL_TAGS = '#cv-skill-tags-page2';
    var PAGE3_SKILL_TAGS = '#cv-skill-tags-page3';
    var PAGE1_LANG_LIST = '#cv-card-page1 .cv-sidebar-green .cv-lang-list';
    var PAGE2_LANG_LIST = '#cv-lang-list-page2';
    var PAGE3_LANG_LIST = '#cv-lang-list-page3';
    var SPLIT_SELECTOR = '.cv-exp-item-split';
    var SKILL_TAG_SELECTOR = '.cv-skill-tag';
    var LANG_ITEM_SELECTOR = '.cv-lang-item';
    var DEBOUNCE_MS = 120;
    var MUTATION_PAUSE_MS = 400;

    var debounceTimer = null;
    var mutationObserverRef = null;

    function moveOverflowItemsToPage2() {
        var list1 = document.querySelector(PAGE1_EXP_LIST);
        var list2 = document.querySelector(PAGE2_EXP_LIST);
        if (!list1 || !list2) return;
        while (hasOverflowPage1()) {
            var items = list1.querySelectorAll(SPLIT_SELECTOR);
            if (items.length === 0) break;
            var lastSplit = items[items.length - 1];
            list2.insertBefore(lastSplit, list2.firstChild);
        }
    }

    function moveOverflowItemsToPage3() {
        var list2 = document.querySelector(PAGE2_EXP_LIST);
        var list3 = document.querySelector(PAGE3_EXP_LIST);
        if (!list2 || !list3) return;
        while (hasOverflowPage2()) {
            var items = list2.querySelectorAll(SPLIT_SELECTOR);
            if (items.length === 0) break;
            var lastSplit = items[items.length - 1];
            list3.insertBefore(lastSplit, list3.firstChild);
        }
    }

    /** Đưa cv-exp-item về Trang 1, giữ đúng thứ tự gốc (1→2→3) */
    function moveSplitItemsBackToPage1() {
        var list1 = document.querySelector(PAGE1_EXP_LIST);
        var list2 = document.querySelector(PAGE2_EXP_LIST);
        var list3 = document.querySelector(PAGE3_EXP_LIST);
        if (!list1 || !list2) return;
        /* Trang 3 -> Trang 2: list3 có thứ tự [cuối..đầu], append ngược để đúng thứ tự */
        if (list3) {
            var items3 = list3.querySelectorAll(SPLIT_SELECTOR);
            for (var j = items3.length - 1; j >= 0; j--) {
                list2.appendChild(items3[j]);
            }
        }
        /* Trang 2 -> Trang 1: list2 đã đúng thứ tự [6,7,8..], append lần lượt để giữ thứ tự */
        var items = list2.querySelectorAll(SPLIT_SELECTOR);
        for (var i = 0; i < items.length; i++) {
            list1.appendChild(items[i]);
        }
    }

    /** Đo overflow toàn diện: Ngôn ngữ hoặc Kĩ năng tràn ra ngoài card (1123px) */
    function hasOverflowSidebarGreen() {
        var cardInner = document.querySelector('#cv-card-page1 .cv-card-inner');
        var green = document.querySelector('#cv-card-page1 .cv-sidebar-green');
        if (!cardInner || !green) return false;
        cardInner.offsetHeight; /* force reflow */
        /* 1. Check chính: toàn bộ green tràn (bắt Ngôn ngữ dài, Kĩ năng nhiều, thông tin đẩy xuống) */
        if (green.scrollHeight > green.clientHeight + 2) return true;
        var tags = green.querySelectorAll(SKILL_TAG_SELECTOR);
        if (tags.length === 0) return false; /* không có skill thì không move skill */
        /* 2. Heuristic: nhiều tag hơn vùng có thể chứa */
        if (tags.length > 10) return true;
        /* 3. Tag cuối tràn boundary card */
        var lastTag = tags[tags.length - 1];
        var cardRect = cardInner.getBoundingClientRect();
        var lastRect = lastTag.getBoundingClientRect();
        if (lastRect.bottom > cardRect.bottom - 1) return true;
        /* 4. Fallback: cv-skill-tags tràn vùng nhìn thấy */
        var skillTags = green.querySelector('.cv-skill-tags');
        if (skillTags && skillTags.scrollHeight > skillTags.clientHeight) return true;
        return false;
    }

    function hasOverflowSidebarGreenPage2() {
        var green = document.querySelector('#cv-card-page2 .cv-sidebar-green-page2');
        if (!green) return false;
        return green.scrollHeight > green.clientHeight + 2;
    }

    /** Trang 1 skill tràn -> chuyển sang Trang 2 (không giới hạn). Trang 2 tràn -> Trang 3. */
    function moveOverflowSidebarItemsToPage2() {
        var list1 = document.querySelector(PAGE1_SKILL_TAGS);
        var list2 = document.querySelector(PAGE2_SKILL_TAGS);
        if (!list1 || !list2) return;
        var maxIter = 500;
        while (hasOverflowSidebarGreen() && maxIter-- > 0) {
            var items = list1.querySelectorAll(SKILL_TAG_SELECTOR);
            if (items.length === 0) break;
            var lastTag = items[items.length - 1];
            list2.insertBefore(lastTag, list2.firstChild);
        }
    }

    /** Trang 2 skill tràn -> chuyển sang Trang 3 */
    function moveOverflowSidebarItemsToPage3() {
        var list2 = document.querySelector(PAGE2_SKILL_TAGS);
        var list3 = document.querySelector(PAGE3_SKILL_TAGS);
        if (!list2 || !list3) return;
        var maxIter = 500;
        while (hasOverflowSidebarGreenPage2() && maxIter-- > 0) {
            var items = list2.querySelectorAll(SKILL_TAG_SELECTOR);
            if (items.length === 0) break;
            var lastTag = items[items.length - 1];
            list3.insertBefore(lastTag, list3.firstChild);
        }
    }

    /** Ngôn ngữ tràn: Trang 1 -> Trang 2. Trang 2 tràn -> Trang 3. */
    function moveOverflowLangItemsToPage2() {
        var list1 = document.querySelector(PAGE1_LANG_LIST);
        var list2 = document.querySelector(PAGE2_LANG_LIST);
        if (!list1 || !list2) return;
        var maxIter = 50;
        while (hasOverflowSidebarGreen() && maxIter-- > 0) {
            var items = list1.querySelectorAll(LANG_ITEM_SELECTOR);
            if (items.length === 0) break;
            var lastItem = items[items.length - 1];
            list2.appendChild(lastItem);
        }
    }

    function moveOverflowLangItemsToPage3() {
        var list2 = document.querySelector(PAGE2_LANG_LIST);
        var list3 = document.querySelector(PAGE3_LANG_LIST);
        if (!list2 || !list3) return;
        while (hasOverflowSidebarGreenPage2()) {
            var items = list2.querySelectorAll(LANG_ITEM_SELECTOR);
            if (items.length === 0) break;
            var lastItem = items[items.length - 1];
            list3.appendChild(lastItem);
        }
    }

    function moveLangItemsBackToPage1() {
        var list1 = document.querySelector(PAGE1_LANG_LIST);
        var list2 = document.querySelector(PAGE2_LANG_LIST);
        var list3 = document.querySelector(PAGE3_LANG_LIST);
        if (!list1 || !list2) return;
        if (list3) {
            var items3 = list3.querySelectorAll(LANG_ITEM_SELECTOR);
            for (var j = items3.length - 1; j >= 0; j--) {
                list2.appendChild(items3[j]);
            }
        }
        var items = list2.querySelectorAll(LANG_ITEM_SELECTOR);
        for (var i = 0; i < items.length; i++) {
            list1.appendChild(items[i]);
        }
    }

    function moveSidebarItemsBackToPage1() {
        var list1 = document.querySelector(PAGE1_SKILL_TAGS);
        var list2 = document.querySelector(PAGE2_SKILL_TAGS);
        var list3 = document.querySelector(PAGE3_SKILL_TAGS);
        if (!list1 || !list2) return;
        if (list3) {
            var items3 = list3.querySelectorAll(SKILL_TAG_SELECTOR);
            for (var j = items3.length - 1; j >= 0; j--) {
                list2.appendChild(items3[j]);
            }
        }
        var items = list2.querySelectorAll(SKILL_TAG_SELECTOR);
        for (var i = 0; i < items.length; i++) {
            list1.appendChild(items[i]);
        }
    }

    function hasOverflowPage1() {
        var content = document.querySelector(PAGE1_CONTENT);
        if (!content) return false;
        var list = content.querySelector('.cv-exp-list');
        if (list && list.children.length > 0) {
            var lastItem = list.children[list.children.length - 1];
            var contentRect = content.getBoundingClientRect();
            var lastRect = lastItem.getBoundingClientRect();
            if (lastRect.bottom > contentRect.bottom + 2) return true;
        }
        return content.scrollHeight > content.clientHeight;
    }

    function hasOverflowPage2() {
        var content = document.querySelector(PAGE2_CONTENT);
        if (!content) return false;
        var list = content.querySelector('.cv-exp-list');
        if (list && list.children.length > 0) {
            var lastItem = list.children[list.children.length - 1];
            var contentRect = content.getBoundingClientRect();
            var lastRect = lastItem.getBoundingClientRect();
            if (lastRect.bottom > contentRect.bottom + 2) return true;
        }
        return content.scrollHeight > content.clientHeight;
    }

    function scheduleReconnectMutationObserver() {
        var w = document.querySelector(WRAPPER);
        if (mutationObserverRef && w) {
            setTimeout(function () {
                mutationObserverRef.observe(w, { childList: true, subtree: true });
            }, MUTATION_PAUSE_MS);
        }
    }

    function checkOverflow(allowRemove) {
        var wrapper = document.querySelector(WRAPPER);
        var content = document.querySelector(PAGE1_CONTENT);
        if (!wrapper || !content) return;
        /* Tạm ngắt MutationObserver để tránh vòng lặp: move -> mutation -> reset -> move */
        if (mutationObserverRef) mutationObserverRef.disconnect();

        var hasPage2 = wrapper.classList.contains('cv-has-page2');
        var hasPage3 = wrapper.classList.contains('cv-has-page3');

        if (allowRemove && (hasPage2 || hasPage3)) {
            moveSplitItemsBackToPage1();
            moveLangItemsBackToPage1();
            moveSidebarItemsBackToPage1();
            wrapper.classList.remove('cv-has-page2', 'cv-has-page3');
            requestAnimationFrame(function () {
                var needPage2 = hasOverflowPage1() || hasOverflowSidebarGreen();
                if (needPage2) {
                    moveOverflowItemsToPage2();
                    moveOverflowSidebarItemsToPage2();
                    moveOverflowLangItemsToPage2();
                    wrapper.classList.add('cv-has-page2');
                    var list3 = document.querySelector(PAGE3_SKILL_TAGS);
                    if (list3 && list3.children.length > 0) wrapper.classList.add('cv-has-page3');
                    if (hasOverflowPage2()) {
                        moveOverflowItemsToPage3();
                        wrapper.classList.add('cv-has-page3');
                    }
                    if (hasOverflowSidebarGreenPage2()) {
                        moveOverflowSidebarItemsToPage3();
                        moveOverflowLangItemsToPage3();
                        wrapper.classList.add('cv-has-page3');
                    }
                }
                scheduleReconnectMutationObserver();
            });
            return;
        }

        if (!hasPage2 && (hasOverflowPage1() || hasOverflowSidebarGreen())) {
            if (hasOverflowSidebarGreen()) wrapper.classList.add('cv-has-page2');
            moveOverflowItemsToPage2();
            moveOverflowSidebarItemsToPage2();
            moveOverflowLangItemsToPage2();
            wrapper.classList.add('cv-has-page2');
            var list2 = document.querySelector(PAGE2_SKILL_TAGS);
            var list3 = document.querySelector(PAGE3_SKILL_TAGS);
            if ((list2 && list2.children.length > 0) || (list3 && list3.children.length > 0)) {
                wrapper.classList.add('cv-has-page2');
            }
            if (list3 && list3.children.length > 0) wrapper.classList.add('cv-has-page3');
            requestAnimationFrame(function () {
                if (hasOverflowPage2()) {
                    moveOverflowItemsToPage3();
                    wrapper.classList.add('cv-has-page3');
                }
                if (hasOverflowSidebarGreenPage2()) {
                    moveOverflowSidebarItemsToPage3();
                    moveOverflowLangItemsToPage3();
                    wrapper.classList.add('cv-has-page3');
                }
                scheduleReconnectMutationObserver();
            });
        } else if (hasPage2 && (hasOverflowPage2() || hasOverflowSidebarGreenPage2())) {
            moveOverflowItemsToPage3();
            moveOverflowSidebarItemsToPage3();
            moveOverflowLangItemsToPage3();
            wrapper.classList.add('cv-has-page3');
            scheduleReconnectMutationObserver();
        }
        if (hasPage2 && hasOverflowSidebarGreen()) {
            moveOverflowSidebarItemsToPage2();
            moveOverflowLangItemsToPage2();
            if (hasOverflowSidebarGreenPage2()) {
                moveOverflowSidebarItemsToPage3();
                moveOverflowLangItemsToPage3();
            }
            var list3 = document.querySelector(PAGE3_SKILL_TAGS);
            if (list3 && list3.children.length > 0) wrapper.classList.add('cv-has-page3');
            scheduleReconnectMutationObserver();
        }
    }

    function debouncedCheck(allowRemove) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            debounceTimer = null;
            checkOverflow(allowRemove);
        }, DEBOUNCE_MS);
    }

    function init() {
        // Chạy sau khi layout ổn định (double rAF)
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                checkOverflow(true);
            });
        });
        window.addEventListener('load', function () {
            requestAnimationFrame(function () {
                checkOverflow(true);
            });
            setTimeout(function () {
                checkOverflow(true);
            }, 300);
            setTimeout(function () {
                checkOverflow(true);
            }, 600);
            setTimeout(function () { checkOverflow(true); }, 1000);
            setTimeout(function () { checkOverflow(true); }, 1500);
            setTimeout(function () { checkOverflow(true); }, 2500);
            setTimeout(function () { checkOverflow(true); }, 3000);
        });

        var wrapper = document.querySelector(WRAPPER);
        var content = document.querySelector(PAGE1_CONTENT);
        var content2 = document.querySelector(PAGE2_CONTENT);
        var sidebarGreen = document.querySelector('#cv-card-page1 .cv-sidebar-green');
        if (wrapper && typeof ResizeObserver !== 'undefined') {
            var ro = new ResizeObserver(function () {
                /* Không reset (allowRemove=false) để tránh dữ liệu nhảy liên tục khi layout thay đổi */
                debouncedCheck(false);
            });
            ro.observe(wrapper);
            if (content) ro.observe(content);
            if (content2) ro.observe(content2);
            if (sidebarGreen) ro.observe(sidebarGreen);
            var skillTagsEl = document.querySelector(PAGE1_SKILL_TAGS);
            if (skillTagsEl) ro.observe(skillTagsEl);
            var langListEl = document.querySelector(PAGE1_LANG_LIST);
            if (langListEl) ro.observe(langListEl);
        }

        if (wrapper && typeof MutationObserver !== 'undefined') {
            mutationObserverRef = new MutationObserver(function () {
                requestAnimationFrame(function () {
                    requestAnimationFrame(function () {
                        debouncedCheck(true);
                    });
                });
            });
            mutationObserverRef.observe(wrapper, { childList: true, subtree: true });
        }

        window.addEventListener('resize', function () {
            debouncedCheck(true);
        });
    }

    document.addEventListener('cv-template-loaded', init);
})();

/* Zoom controls: 50% -> 125%, bước 25% (Figma 37520-20299) */
(function () {
    var ZOOM_MIN = 50;
    var ZOOM_MAX = 125;
    var ZOOM_STEP = 25;
    var ZOOM_LEVELS = [50, 75, 100, 125];

    var wrapper = document.querySelector('.cv-editor-wrapper');
    var zoomValueEl = document.getElementById('cv-zoom-value');
    var zoomDropdown = document.getElementById('cv-zoom-dropdown');
    var zoomMenu = document.getElementById('cv-zoom-dropdown-list');
    var zoomInBtn = document.getElementById('cv-zoom-in');
    var zoomOutBtn = document.getElementById('cv-zoom-out');

    var currentZoom = 100;

    function applyZoom(percent) {
        currentZoom = Math.max(ZOOM_MIN, Math.min(ZOOM_MAX, percent));
        currentZoom = ZOOM_LEVELS.reduce(function (prev, curr) {
            return Math.abs(curr - currentZoom) < Math.abs(prev - currentZoom) ? curr : prev;
        });
        if (zoomValueEl) zoomValueEl.textContent = currentZoom + '%';
        if (wrapper) {
            wrapper.style.transformOrigin = 'top center';
            wrapper.style.transform = 'scale(' + (currentZoom / 100) + ')';
        }
        var opts = document.querySelectorAll('.cv-zoom-option');
        opts.forEach(function (el) {
            el.classList.toggle('active', parseInt(el.getAttribute('data-zoom'), 10) === currentZoom);
        });
    }

    function zoomIn() {
        var next = ZOOM_LEVELS[ZOOM_LEVELS.indexOf(currentZoom) + 1];
        if (next != null) applyZoom(next);
    }

    function zoomOut() {
        var idx = ZOOM_LEVELS.indexOf(currentZoom);
        var prev = idx > 0 ? ZOOM_LEVELS[idx - 1] : null;
        if (prev != null) applyZoom(prev);
    }

    function toggleMenu() {
        var isOpen = zoomMenu && zoomMenu.classList.toggle('cv-zoom-menu-open');
        if (zoomDropdown) zoomDropdown.setAttribute('aria-expanded', '' + !!isOpen);
    }

    function initZoom() {
        wrapper = document.querySelector('.cv-editor-wrapper');
        if (!wrapper) return;
        applyZoom(100);
        if (zoomInBtn) zoomInBtn.addEventListener('click', zoomIn);
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', zoomOut);
        if (zoomDropdown && zoomMenu) {
            zoomDropdown.addEventListener('click', function (e) {
                if (e.target.closest('.cv-zoom-option')) return;
                toggleMenu();
            });
            zoomMenu.querySelectorAll('.cv-zoom-option').forEach(function (opt) {
                opt.addEventListener('click', function () {
                    applyZoom(parseInt(opt.getAttribute('data-zoom'), 10));
                    toggleMenu();
                });
            });
        }
        var zoomWrap = document.querySelector('.cv-zoom-dropdown-wrapper');
        document.addEventListener('click', function (e) {
            if (zoomMenu && zoomMenu.classList.contains('cv-zoom-menu-open') &&
                zoomWrap && !zoomWrap.contains(e.target)) {
                toggleMenu();
            }
        });
    }

    document.addEventListener('cv-template-loaded', initZoom);
})();
