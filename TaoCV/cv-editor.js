/**
 * CV Editor - Overflow logic Trang 1 -> 2 -> 3
 * Một nguồn dữ liệu (Trang 1). Tràn Trang 1 -> Trang 2 (1123px). Tràn Trang 2 -> Trang 3.
 * cv-sidebar-green (Kĩ năng) cũng tràn sang trang tiếp theo, không dùng scroll.
 *
 * Build marker: 20260514-37-strict
 */
(function () {
    if (typeof window !== 'undefined') {
        window.__CV_EDITOR_BUILD__ = '20260514-37-strict';
        try {
            console.log(
                '%c[cv-editor] build ' + window.__CV_EDITOR_BUILD__,
                'background:#10b981;color:#fff;padding:2px 8px;border-radius:4px;font-weight:bold'
            );
        } catch (_) {}
    }
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
        var content1 = document.querySelector(PAGE1_CONTENT);
        if (!list1 || !list2) {
            try { console.warn('[cv-editor] moveOverflowItemsToPage2 ABORT — list1=', !!list1, 'list2=', !!list2); } catch (_) {}
            return;
        }
        var maxIter = 50;
        var moved = 0;
        var startCount = list1.querySelectorAll(SPLIT_SELECTOR).length;
        while (hasOverflowPage1() && maxIter-- > 0) {
            var items = list1.querySelectorAll(SPLIT_SELECTOR);
            if (items.length === 0) break;
            var lastSplit = items[items.length - 1];
            try {
                list2.insertBefore(lastSplit, list2.firstChild);
                moved++;
            } catch (e) {
                try { console.warn('[cv-editor] insertBefore FAILED', e); } catch (_) {}
                break;
            }
            /* Force reflow MULTIPLE elements để getBoundingClientRect ở vòng kế
               tiếp đo đúng. Browser có thể không reflow .cv-content nếu chỉ
               touch list1. Đụng vào content + cardInner + body bắt buộc reflow. */
            void list1.offsetHeight;
            if (content1) void content1.offsetHeight;
            void document.body.offsetHeight;
        }
        try {
            console.log('[cv-editor] moveOverflowItemsToPage2 done — start=' + startCount +
                ', moved=' + moved + ', remaining=' + list1.querySelectorAll(SPLIT_SELECTOR).length +
                ', maxIter exhausted=' + (maxIter < 0));
        } catch (_) {}
    }

    function moveOverflowItemsToPage3() {
        var list2 = document.querySelector(PAGE2_EXP_LIST);
        var list3 = document.querySelector(PAGE3_EXP_LIST);
        if (!list2 || !list3) return;
        var maxIter = 50;
        while (hasOverflowPage2() && maxIter-- > 0) {
            var items = list2.querySelectorAll(SPLIT_SELECTOR);
            if (items.length === 0) break;
            var lastSplit = items[items.length - 1];
            list3.insertBefore(lastSplit, list3.firstChild);
            void list2.offsetHeight;
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

        /* Safety buffer 8px: nếu item nằm trong vùng 8px sát biên dưới cũng
           coi là tràn. Đảm bảo không bị clip do font metrics khác giữa các
           môi trường (Live Server, headless, ...) hoặc do line-height
           anti-aliasing sub-pixel. */
        var SAFETY_BUFFER = 8;

        /* 1) So sánh bounding rect của lastItem so với content. */
        var list = content.querySelector('.cv-exp-list');
        if (list && list.children.length > 0) {
            var lastItem = list.children[list.children.length - 1];
            var contentRect = content.getBoundingClientRect();
            var lastRect = lastItem.getBoundingClientRect();
            if (lastRect.bottom > contentRect.bottom - SAFETY_BUFFER) return true;

            /* 1b) Quét TẤT CẢ children của list — nếu BẤT KỲ item nào vượt biên,
               coi là overflow. Đảm bảo bắt được trường hợp middle item bị clip. */
            for (var k = 0; k < list.children.length; k++) {
                var anyItem = list.children[k];
                var anyRect = anyItem.getBoundingClientRect();
                if (anyRect.bottom > contentRect.bottom - SAFETY_BUFFER) return true;
            }
        }

        /* 2) Fallback dùng scrollHeight vs clientHeight (chuẩn cho overflow:hidden) */
        if (content.scrollHeight > content.clientHeight + SAFETY_BUFFER) return true;

        /* 3) Fallback v10/v11: inner stack flex column trong .cv-content absolute */
        var stackSelectors = ['.cv-v10-main-stack', '.cv-v11-main-stack'];
        for (var si = 0; si < stackSelectors.length; si++) {
            var stack = content.querySelector(stackSelectors[si]);
            if (stack) {
                var cardInner = document.querySelector('#cv-card-page1 .cv-card-inner');
                var stackRect = stack.getBoundingClientRect();
                if (cardInner) {
                    var cardRect = cardInner.getBoundingClientRect();
                    if (stackRect.bottom > cardRect.bottom - 24 - SAFETY_BUFFER) return true;
                }
                if (stack.scrollHeight > content.clientHeight + SAFETY_BUFFER) return true;
            }
        }

        return false;
    }

    function hasOverflowPage2() {
        var content = document.querySelector(PAGE2_CONTENT);
        if (!content) return false;
        var list = content.querySelector('.cv-exp-list');
        if (list && list.children.length > 0) {
            var lastItem = list.children[list.children.length - 1];
            var contentRect = content.getBoundingClientRect();
            var lastRect = lastItem.getBoundingClientRect();
            if (lastRect.bottom > contentRect.bottom - 2) return true;
        }
        return content.scrollHeight > content.clientHeight + 2;
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

        /* Diagnostic: in console một lần mỗi 800ms để user xem có overflow hay không */
        try {
            var nowKey = Math.floor(Date.now() / 800);
            if (window.__cv_lastLog !== nowKey) {
                window.__cv_lastLog = nowKey;
                var listDbg = content.querySelector('.cv-exp-list');
                var info = {
                    template: (wrapper.className.match(/cv-template-v\d+/) || [''])[0],
                    contentClient: content.clientHeight,
                    contentScroll: content.scrollHeight,
                    listChildren: listDbg ? listDbg.children.length : 0,
                    hasOverflow: hasOverflowPage1(),
                    hasPage2Class: wrapper.classList.contains('cv-has-page2')
                };
                console.log('[cv-editor] checkOverflow', info);
            }
        } catch (_) {}
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
                /* Failsafe pass cuối — đảm bảo không còn item nào tràn biên */
                failsafeMoveOverflow();
                updateEmptyClasses();
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
                failsafeMoveOverflow();
                updateEmptyClasses();
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

        /* FAILSAFE: ép buộc move bất kỳ exp-item nào còn tràn biên trên page 1 / page 2.
           Đây là pass cuối, không tin vào hasOverflowPage1/2 mà so sánh trực tiếp bottom. */
        failsafeMoveOverflow();

        /* Cập nhật class .cv-is-empty / .cv-sidebar-all-empty sau mỗi lần
           reflow nội dung để CSS ẩn các section / icon-circle dư thừa. */
        updateEmptyClasses();
    }

    /**
     * Failsafe: dò TỪNG exp-item-split trên page 1 / page 2, item nào có
     * bottom > content.bottom (hoặc scrollHeight > clientHeight) thì move
     * sang page kế tiếp. Dùng kết hợp BOTH bounding rect VÀ scrollHeight
     * để bắt được mọi loại overflow (sub-pixel, layout-thrashing, ...).
     * Đây là pass an toàn cuối — không phụ thuộc hasOverflowPageN.
     */
    function failsafeMoveOverflow() {
        try {
            var content1 = document.querySelector(PAGE1_CONTENT);
            var list1 = document.querySelector(PAGE1_EXP_LIST);
            var list2 = document.querySelector(PAGE2_EXP_LIST);
            var wrapper = document.querySelector(WRAPPER);
            if (content1 && list1 && list2) {
                var movedToPage2 = 0;
                var maxIter = 30;
                while (maxIter-- > 0) {
                    var items = list1.querySelectorAll(SPLIT_SELECTOR);
                    if (items.length === 0) break;
                    /* Force reflow trước khi đo */
                    void content1.offsetHeight;
                    var contentBottom = content1.getBoundingClientRect().bottom;
                    var lastItem = items[items.length - 1];
                    var lastBottom = lastItem.getBoundingClientRect().bottom;
                    /* Threshold thoáng hơn 8px — đảm bảo move bất kỳ item nào gần
                       chạm biên dưới, tránh half-line clip do sub-pixel rounding
                       hoặc font metrics khác biệt giữa môi trường (Live Server,
                       headless Chrome, v.v.). */
                    var hasRectOverflow = lastBottom > contentBottom - 8;
                    var hasScrollOverflow = content1.scrollHeight > content1.clientHeight + 1;
                    if (hasRectOverflow || hasScrollOverflow) {
                        list2.insertBefore(lastItem, list2.firstChild);
                        void list1.offsetHeight;
                        void content1.offsetHeight;
                        movedToPage2++;
                    } else {
                        break;
                    }
                }
                if (movedToPage2 > 0 && wrapper) {
                    wrapper.classList.add('cv-has-page2');
                    console.log('[cv-editor] failsafe page1→page2 moved', movedToPage2, 'item(s)');
                }
            }

            var content2 = document.querySelector(PAGE2_CONTENT);
            var list3 = document.querySelector(PAGE3_EXP_LIST);
            if (content2 && list2 && list3) {
                var movedToPage3 = 0;
                var maxIter2 = 30;
                while (maxIter2-- > 0) {
                    var items2 = list2.querySelectorAll(SPLIT_SELECTOR);
                    if (items2.length === 0) break;
                    void content2.offsetHeight;
                    var contentBottom2 = content2.getBoundingClientRect().bottom;
                    var lastItem2 = items2[items2.length - 1];
                    var lastBottom2 = lastItem2.getBoundingClientRect().bottom;
                    var hasRectOverflow2 = lastBottom2 > contentBottom2 - 8;
                    var hasScrollOverflow2 = content2.scrollHeight > content2.clientHeight + 1;
                    if (hasRectOverflow2 || hasScrollOverflow2) {
                        list3.insertBefore(lastItem2, list3.firstChild);
                        void list2.offsetHeight;
                        void content2.offsetHeight;
                        movedToPage3++;
                    } else {
                        break;
                    }
                }
                if (movedToPage3 > 0 && wrapper) {
                    wrapper.classList.add('cv-has-page3');
                    console.log('[cv-editor] failsafe page2→page3 moved', movedToPage3, 'item(s)');
                }
            }
        } catch (e) {
            try { console.warn('[cv-editor] failsafe error', e); } catch (_) {}
        }
    }

    function debouncedCheck(allowRemove) {
        if (debounceTimer) clearTimeout(debounceTimer);
        debounceTimer = setTimeout(function () {
            debounceTimer = null;
            checkOverflow(allowRemove);
            updateEmptyClasses();
        }, DEBOUNCE_MS);
    }

    /**
     * Toggle class `cv-is-empty` lên các container ở page 2/3 nếu chúng không
     * có element con. Dùng JS thay cho `:has(:empty)` để chắc chắn hoạt động
     * trên trình duyệt cũ và tránh nhầm lẫn do whitespace text-node.
     */
    function updateEmptyClasses() {
        var ids = [
            'cv-lang-list-page2', 'cv-lang-list-page3',
            'cv-skill-tags-page2', 'cv-skill-tags-page3',
            'cv-exp-list-page2', 'cv-exp-list-page3'
        ];
        for (var i = 0; i < ids.length; i++) {
            var el = document.getElementById(ids[i]);
            if (!el) continue;
            if (el.children.length === 0) {
                el.classList.add('cv-is-empty');
            } else {
                el.classList.remove('cv-is-empty');
            }
        }

        /* Mark wrapper card khi cả lang & skill ở page 2/3 đều rỗng để CSS
           có thể ẩn sidebar và mở rộng content full-width. */
        var card2 = document.getElementById('cv-card-page2');
        if (card2) {
            var lang2 = document.getElementById('cv-lang-list-page2');
            var skill2 = document.getElementById('cv-skill-tags-page2');
            var bothEmpty2 = (!lang2 || lang2.children.length === 0) &&
                             (!skill2 || skill2.children.length === 0);
            card2.classList.toggle('cv-sidebar-all-empty', bothEmpty2);
        }
        var card3 = document.getElementById('cv-card-page3');
        if (card3) {
            var lang3 = document.getElementById('cv-lang-list-page3');
            var skill3 = document.getElementById('cv-skill-tags-page3');
            var bothEmpty3 = (!lang3 || lang3.children.length === 0) &&
                             (!skill3 || skill3.children.length === 0);
            card3.classList.toggle('cv-sidebar-all-empty', bothEmpty3);
        }
    }

    /**
     * BRUTE-FORCE overflow handler — bypass mọi detection logic phức tạp.
     * Đo TRỰC TIẾP bounding rect của từng exp-item-split, item nào có
     * bottom > content.bottom (strict, không buffer) thì FORCE-MOVE sang
     * page kế tiếp. Chỉ move item KHI CHẮC CHẮN vượt biên (>= 1px) để tránh
     * false positive với items vừa-suýt-soát-fit.
     */
    function bruteForceMoveOverflow() {
        try {
            var wrapper = document.querySelector(WRAPPER);
            if (!wrapper) return;

            /* Force complete reflow trước khi đo bằng cách touch nhiều element */
            void document.body.offsetHeight;

            /* Page 1 → Page 2 — chuyển BẤT KỲ item nào có bottom vượt biên content.
               Threshold = +0.5px để chỉ move khi thực sự overflow (không phải khi
               vừa-chạm-biên fits). */
            var content1 = document.querySelector(PAGE1_CONTENT);
            var list1 = document.querySelector(PAGE1_EXP_LIST);
            var list2 = document.querySelector(PAGE2_EXP_LIST);
            if (content1 && list1 && list2) {
                var contentBottom = content1.getBoundingClientRect().bottom;
                var items = Array.prototype.slice.call(list1.querySelectorAll(SPLIT_SELECTOR));
                /* Tìm INDEX đầu tiên mà item.bottom THỰC SỰ vượt biên */
                var firstOverflowIdx = -1;
                for (var i = 0; i < items.length; i++) {
                    var rect = items[i].getBoundingClientRect();
                    if (rect.bottom > contentBottom + 0.5) {
                        firstOverflowIdx = i;
                        break;
                    }
                }
                /* Nếu phát hiện overflow — KEEP item đầu trên page 1 (không thể
                   move hết), chuyển tất cả từ index max(1, firstOverflowIdx) trở
                   đi sang page 2. */
                if (firstOverflowIdx >= 0) {
                    var startMoveIdx = Math.max(1, firstOverflowIdx);
                    var movedCount = 0;
                    for (var j = items.length - 1; j >= startMoveIdx; j--) {
                        list2.insertBefore(items[j], list2.firstChild);
                        movedCount++;
                    }
                    if (movedCount > 0) {
                        wrapper.classList.add('cv-has-page2');
                        try {
                            console.log('[cv-editor] bruteForce p1→p2 moved ' + movedCount +
                                ' item(s) starting at idx ' + startMoveIdx +
                                ' (contentBottom=' + Math.round(contentBottom) + ')');
                        } catch (_) {}
                    }
                }
            }

            /* Page 2 → Page 3 — tương tự */
            var content2 = document.querySelector(PAGE2_CONTENT);
            var list3 = document.querySelector(PAGE3_EXP_LIST);
            if (content2 && list2 && list3) {
                var contentBottom2 = content2.getBoundingClientRect().bottom;
                var items2 = Array.prototype.slice.call(list2.querySelectorAll(SPLIT_SELECTOR));
                var firstOverflowIdx2 = -1;
                for (var k = 0; k < items2.length; k++) {
                    var rect2 = items2[k].getBoundingClientRect();
                    if (rect2.bottom > contentBottom2 + 0.5) {
                        firstOverflowIdx2 = k;
                        break;
                    }
                }
                if (firstOverflowIdx2 >= 0) {
                    var startMoveIdx2 = Math.max(1, firstOverflowIdx2);
                    var movedCount2 = 0;
                    for (var m = items2.length - 1; m >= startMoveIdx2; m--) {
                        list3.insertBefore(items2[m], list3.firstChild);
                        movedCount2++;
                    }
                    if (movedCount2 > 0) {
                        wrapper.classList.add('cv-has-page3');
                        try {
                            console.log('[cv-editor] bruteForce p2→p3 moved ' + movedCount2 + ' item(s)');
                        } catch (_) {}
                    }
                }
            }
        } catch (e) {
            try { console.warn('[cv-editor] bruteForceMoveOverflow error', e); } catch (_) {}
        }
    }

    function init() {
        // Chạy sau khi layout ổn định (double rAF)
        requestAnimationFrame(function () {
            requestAnimationFrame(function () {
                checkOverflow(true);
            });
        });

        /* Chạy lại sau khi fonts load xong — bullet text với font Inter có metrics
           khác nhau giữa fallback và font thực, ảnh hưởng line-height → overflow
           detection phải re-run sau font load để tránh sai phép đo lần đầu. */
        if (document.fonts && document.fonts.ready && typeof document.fonts.ready.then === 'function') {
            document.fonts.ready.then(function () {
                requestAnimationFrame(function () {
                    checkOverflow(true);
                    failsafeMoveOverflow();
                    bruteForceMoveOverflow();
                    updateEmptyClasses();
                });
            });
        }

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
            /* Failsafe + bruteForce pass — chạy sau cùng khi font/image đã settle */
            setTimeout(function () { failsafeMoveOverflow(); bruteForceMoveOverflow(); updateEmptyClasses(); }, 1200);
            setTimeout(function () { failsafeMoveOverflow(); bruteForceMoveOverflow(); updateEmptyClasses(); }, 2200);
            setTimeout(function () { failsafeMoveOverflow(); bruteForceMoveOverflow(); updateEmptyClasses(); }, 4000);
            setTimeout(function () { failsafeMoveOverflow(); bruteForceMoveOverflow(); updateEmptyClasses(); }, 5500);
            /* Long-tail — bắt edge case khi font/image load chậm hoặc layout shift muộn */
            setTimeout(function () { bruteForceMoveOverflow(); updateEmptyClasses(); }, 8000);
            setTimeout(function () { bruteForceMoveOverflow(); updateEmptyClasses(); }, 12000);
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
