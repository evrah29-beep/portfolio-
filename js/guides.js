document.addEventListener('DOMContentLoaded', function () {
    const list = document.getElementById('guideList');
    if (!list) return;

    const search = document.getElementById('guideSearch');
    const category = document.getElementById('guideCategory');
    const count = document.getElementById('guideCount');
    const empty = document.getElementById('guideEmpty');
    const reader = document.getElementById('guideReader');
    let guides = [];
    let activeId = '';

    const make = function (tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };
    const safeLink = function (value) {
        try {
            const url = new URL(value, window.location.href);
            return url.protocol === 'https:' ? url.href : '';
        } catch (error) {
            return '';
        }
    };
    const addSection = function (parent, id, title) {
        const section = make('section', 'guide-section');
        section.id = id;
        section.append(make('h2', 'h4 font-weight-bold', title));
        parent.append(section);
        return section;
    };
    const makeCopyCode = function (code) {
        const wrapper = make('div', 'guide-code-wrap');
        const pre = make('pre', 'guide-code');
        pre.append(make('code', '', code));
        const button = make('button', 'btn btn-sm btn-outline-primary guide-copy', 'Copy');
        button.type = 'button';
        button.setAttribute('aria-label', 'Copy command');
        button.addEventListener('click', function () {
            const copied = function () {
                button.textContent = 'Copied';
                window.setTimeout(function () { button.textContent = 'Copy'; }, 1800);
            };
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(code).then(copied).catch(function () { button.textContent = 'Copy failed'; });
                return;
            }
            const temporary = make('textarea', 'guide-copy-buffer');
            temporary.value = code;
            document.body.append(temporary);
            temporary.select();
            try { document.execCommand('copy'); copied(); } catch (error) { button.textContent = 'Copy failed'; }
            temporary.remove();
        });
        wrapper.append(pre, button);
        return wrapper;
    };

    function visibleGuides() {
        const term = search.value.trim().toLocaleLowerCase();
        return guides.filter(function (guide) {
            const searchable = [guide.title, guide.software, guide.category, guide.shortDescription].join(' ').toLocaleLowerCase();
            return (!term || searchable.includes(term)) && (!category.value || guide.category === category.value);
        }).sort(function (a, b) { return a.title.localeCompare(b.title); });
    }

    function renderList() {
        const matches = visibleGuides();
        list.replaceChildren();
        matches.forEach(function (guide) {
            const link = make('a', 'guide-list-item' + (guide.id === activeId ? ' active' : ''));
            link.href = 'guides.html?id=' + encodeURIComponent(guide.id);
            link.append(make('span', 'guide-list-category', guide.category), make('strong', '', guide.title), make('span', 'guide-list-description', guide.shortDescription));
            link.addEventListener('click', function (event) {
                event.preventDefault();
                showGuide(guide.id, true);
            });
            list.append(link);
        });
        count.textContent = 'Showing ' + matches.length + ' of ' + guides.length + ' published guides';
        empty.classList.toggle('d-none', matches.length > 0);
    }

    function renderGuide(guide) {
        const article = make('article', 'guide-article');
        const top = make('div', 'guide-article-top');
        top.append(make('span', 'guide-category-pill', guide.category), make('span', 'guide-updated', 'Updated ' + guide.lastUpdated));
        const downloadUrl = safeLink(guide.downloadUrl);
        if (downloadUrl) {
            const download = make('a', 'guide-download-link', 'Official software page');
            download.href = downloadUrl;
            download.target = '_blank';
            download.rel = 'noopener noreferrer';
            download.append(make('i', 'fa-solid fa-arrow-up-right-from-square ml-2'));
            top.append(download);
        }
        article.append(top, make('h1', 'guide-title', guide.title), make('p', 'guide-software', guide.software), make('p', 'text-muted guide-lead', guide.shortDescription));

        const toc = make('nav', 'guide-toc');
        toc.setAttribute('aria-label', 'Table of contents');
        toc.append(make('h2', 'h6 font-weight-bold mb-2', 'On this page'));
        const tocList = make('ul', 'mb-0');
        const sectionItems = [];
        const addToc = function (id, label) {
            const li = make('li');
            const a = make('a', '', label);
            a.href = '#' + id;
            li.append(a);
            tocList.append(li);
        };
        addToc('guide-introduction', 'Introduction');
        addToc('guide-requirements', 'Requirements');
        addToc('guide-steps', 'Steps');
        if (guide.images && guide.images.length) addToc('guide-images', 'Screenshots');
        if (guide.warnings && guide.warnings.length) addToc('guide-warnings', 'Warnings');
        if (guide.troubleshooting && guide.troubleshooting.length) addToc('guide-troubleshooting', 'Troubleshooting');
        addToc('guide-references', 'Official references');
        toc.append(tocList);
        article.append(toc);

        const intro = addSection(article, 'guide-introduction', 'Introduction');
        intro.append(make('p', '', guide.introduction));
        const requirements = addSection(article, 'guide-requirements', 'Requirements');
        const requirementList = make('ul', 'guide-bullet-list');
        (guide.requirements || []).forEach(function (text) { requirementList.append(make('li', '', text)); });
        requirements.append(requirementList);

        const steps = addSection(article, 'guide-steps', 'Step-by-step instructions');
        const stepList = make('ol', 'guide-step-list');
        (guide.steps || []).forEach(function (step) {
            const item = make('li', 'guide-step');
            item.append(make('h3', 'h6 font-weight-bold', step.title), make('p', '', step.text));
            if (step.code) item.append(makeCopyCode(step.code));
            stepList.append(item);
        });
        steps.append(stepList);

        if (guide.images && guide.images.length) {
            const images = addSection(article, 'guide-images', 'Screenshots');
            guide.images.forEach(function (image) {
                const src = safeLink(image.src) || (typeof image.src === 'string' && image.src.startsWith('images/') ? image.src : '');
                if (!src) return;
                const figure = make('figure', 'guide-figure');
                const img = document.createElement('img');
                img.src = src;
                img.alt = image.alt || '';
                img.loading = 'lazy';
                figure.append(img);
                if (image.caption) figure.append(make('figcaption', '', image.caption));
                images.append(figure);
            });
        }
        if (guide.warnings && guide.warnings.length) {
            const warnings = addSection(article, 'guide-warnings', 'Important warnings');
            const warningList = make('ul', 'guide-warning-list');
            guide.warnings.forEach(function (warning) { warningList.append(make('li', '', warning)); });
            warnings.append(warningList);
        }
        if (guide.troubleshooting && guide.troubleshooting.length) {
            const troubleshooting = addSection(article, 'guide-troubleshooting', 'Troubleshooting');
            guide.troubleshooting.forEach(function (entry) {
                troubleshooting.append(make('h3', 'h6 font-weight-bold mt-3', entry.issue), make('p', '', entry.resolution));
            });
        }
        const references = addSection(article, 'guide-references', 'Official references');
        const refsList = make('ul', 'guide-reference-list');
        (guide.references || []).forEach(function (reference) {
            const href = safeLink(reference.url);
            if (!href) return;
            const link = make('a', '', reference.label);
            link.href = href;
            link.target = '_blank';
            link.rel = 'noopener noreferrer';
            const li = make('li');
            li.append(link);
            refsList.append(li);
        });
        references.append(refsList);
        article.append(make('p', 'guide-editorial-note', 'Guide steps are a concise summary. Follow the publisher’s current instructions and license terms; this site has not independently tested the procedures.'));

        const index = guides.filter(function (item) { return item.published; }).slice().sort(function (a, b) { return a.title.localeCompare(b.title); });
        const currentIndex = index.findIndex(function (item) { return item.id === guide.id; });
        const pager = make('nav', 'guide-pager');
        pager.setAttribute('aria-label', 'Guide navigation');
        if (currentIndex > 0) {
            const previous = make('a', 'btn btn-outline-primary btn-pill', '← ' + index[currentIndex - 1].title);
            previous.href = 'guides.html?id=' + encodeURIComponent(index[currentIndex - 1].id);
            previous.addEventListener('click', function (event) { event.preventDefault(); showGuide(index[currentIndex - 1].id, true); });
            pager.append(previous);
        } else pager.append(make('span'));
        if (currentIndex < index.length - 1) {
            const next = make('a', 'btn btn-outline-primary btn-pill', index[currentIndex + 1].title + ' →');
            next.href = 'guides.html?id=' + encodeURIComponent(index[currentIndex + 1].id);
            next.addEventListener('click', function (event) { event.preventDefault(); showGuide(index[currentIndex + 1].id, true); });
            pager.append(next);
        }
        article.append(pager);
        const directory = make('button', 'btn btn-link btn-sm p-0 mb-3 guide-directory-back', '← Back to guide directory');
        directory.type = 'button';
        directory.addEventListener('click', function () { document.getElementById('guideLibraryList').scrollIntoView({ behavior: 'smooth' }); });
        article.prepend(directory);
        reader.replaceChildren(article);
        if (window.location.hash) {
            const target = document.getElementById(decodeURIComponent(window.location.hash.slice(1)));
            if (target) target.scrollIntoView();
        }
    }

    function showGuide(id, updateAddress) {
        const guide = guides.find(function (item) { return item.id === id && item.published; });
        if (!guide) return;
        activeId = guide.id;
        if (updateAddress) history.pushState({ guideId: guide.id }, '', 'guides.html?id=' + encodeURIComponent(guide.id));
        renderList();
        renderGuide(guide);
        if (window.matchMedia('(max-width: 991px)').matches) reader.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    fetch('data/guides.json')
        .then(function (response) {
            if (!response.ok) throw new Error('Guides could not be loaded');
            return response.json();
        })
        .then(function (items) {
            guides = items.filter(function (guide) {
                return guide && guide.id && guide.title && guide.category && guide.published === true && Array.isArray(guide.steps) &&
                    (guide.references || []).every(function (reference) { return Boolean(safeLink(reference.url)); }) &&
                    (!guide.downloadUrl || Boolean(safeLink(guide.downloadUrl)));
            });
            Array.from(new Set(guides.map(function (guide) { return guide.category; }))).sort().forEach(function (name) {
                const option = make('option', '', name);
                option.value = name;
                category.append(option);
            });
            renderList();
            const requestedId = new URLSearchParams(window.location.search).get('id');
            if (requestedId) showGuide(requestedId, false);
        })
        .catch(function () { count.textContent = 'Guides could not load. Please open this page from a web server.'; });

    search.addEventListener('input', renderList);
    category.addEventListener('change', renderList);
    window.addEventListener('popstate', function () {
        const id = new URLSearchParams(window.location.search).get('id');
        if (id) showGuide(id, false);
        else { activeId = ''; renderList(); reader.replaceChildren(make('div', 'guide-reader-empty', 'Choose a guide to get started.')); }
    });
});
