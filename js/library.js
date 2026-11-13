document.addEventListener('DOMContentLoaded', function () {
    const grid = document.getElementById('softwareGrid');
    if (!grid) return;

    const search = document.getElementById('softwareSearch');
    const category = document.getElementById('categoryFilter');
    const platform = document.getElementById('platformFilter');
    const fileType = document.getElementById('fileTypeFilter');
    const sort = document.getElementById('sortFilter');
    const count = document.getElementById('resultCount');
    const noResults = document.getElementById('noResults');
    const modal = document.getElementById('softwareModal');
    let software = [];

    const safeLink = function (value) {
        try {
            const url = new URL(value);
            return url.protocol === 'https:' ? url.href : '';
        } catch (error) {
            return '';
        }
    };

    const make = function (tag, className, text) {
        const node = document.createElement(tag);
        if (className) node.className = className;
        if (text !== undefined) node.textContent = text;
        return node;
    };

    function fillModal(item) {
        document.getElementById('softwareModalTitle').textContent = item.name;
        document.getElementById('modalCategory').textContent = item.category;
        document.getElementById('modalDescription').textContent = item.description;
        const details = document.getElementById('modalDetails');
        details.replaceChildren();
        [
            ['Version', item.version], ['Developer / vendor', new URL(item.officialWebsite).hostname.replace(/^www\./, '')],
            ['Supported platforms', item.platforms.join(', ')], ['File type', item.fileType],
            ['File size', item.fileSize], ['License', item.license],
            ['Last source check', item.lastVerified]
        ].forEach(function (pair) {
            const row = make('div', 'software-detail-row');
            row.append(make('dt', '', pair[0]), make('dd', '', pair[1]));
            details.append(row);
        });
        document.getElementById('modalSource').href = safeLink(item.sourceUrl);
        document.getElementById('modalDownload').href = safeLink(item.downloadUrl);
    }

    function cardFor(item) {
        const col = make('div', 'col-xl-4 col-md-6 mb-4');
        const card = make('article', 'custom-card software-card h-100');
        const top = make('div', 'software-card-top');
        const icon = make('div', 'software-icon');
        const iconGlyph = make('i', item.icon || 'fa-solid fa-cube');
        iconGlyph.setAttribute('aria-hidden', 'true');
        icon.append(iconGlyph);
        const badge = make('span', 'software-category', item.category);
        top.append(icon, badge);

        const body = make('div', 'software-card-body');
        body.append(make('h2', 'h5 font-weight-bold mb-2', item.name));
        body.append(make('p', 'text-muted small software-description', item.description));
        const metadata = make('div', 'software-meta');
        metadata.append(make('span', '', item.platforms.join(' · ')));
        metadata.append(make('span', '', item.fileType + ' · ' + item.fileSize));
        body.append(metadata);

        const actions = make('div', 'software-actions');
        const details = make('button', 'btn btn-outline-primary btn-sm btn-pill', 'Details');
        details.type = 'button';
        details.addEventListener('click', function () {
            fillModal(item);
            window.jQuery(modal).modal('show');
        });
        actions.append(details);
        const downloadUrl = safeLink(item.downloadUrl);
        if (downloadUrl) {
            const download = make('a', 'btn btn-primary btn-sm btn-pill', 'Official download');
            download.href = downloadUrl;
            download.target = '_blank';
            download.rel = 'noopener noreferrer';
            download.setAttribute('aria-label', 'Open official download page for ' + item.name);
            actions.append(download);
        } else {
            actions.append(make('span', 'text-muted small', 'Download unavailable'));
        }
        card.append(top, body, actions);
        col.append(card);
        return col;
    }

    function render() {
        const term = search.value.trim().toLocaleLowerCase();
        const filtered = software.filter(function (item) {
            const searchable = [item.name, item.category, item.description, item.version, item.fileType, item.fileSize].concat(item.platforms).join(' ').toLocaleLowerCase();
            return (!term || searchable.includes(term)) &&
                (!category.value || item.category === category.value) &&
                (!platform.value || item.platforms.includes(platform.value)) &&
                (!fileType.value || item.fileType === fileType.value);
        });
        filtered.sort(function (a, b) {
            if (sort.value === 'recent') return b.dateAdded.localeCompare(a.dateAdded) || a.name.localeCompare(b.name);
            return a.name.localeCompare(b.name);
        });
        grid.replaceChildren.apply(grid, filtered.map(cardFor));
        count.textContent = 'Showing ' + filtered.length + ' of ' + software.length + ' resources';
        noResults.classList.toggle('d-none', filtered.length !== 0);
    }

    fetch('data/software.json')
        .then(function (response) {
            if (!response.ok) throw new Error('Catalog could not be loaded');
            return response.json();
        })
        .then(function (items) {
            software = items.filter(function (item) {
                return item && item.id && item.name && item.category && item.description &&
                    Array.isArray(item.platforms) && safeLink(item.officialWebsite) &&
                    safeLink(item.sourceUrl) && safeLink(item.downloadUrl);
            });
            Array.from(new Set(software.map(function (item) { return item.category; }))).sort().forEach(function (name) {
                const option = make('option', '', name);
                option.value = name;
                category.append(option);
            });
            render();
        })
        .catch(function () {
            count.textContent = 'The library could not load. Please open this page from a web server.';
        });

    [search, category, platform, fileType, sort].forEach(function (control) {
        control.addEventListener(control === search ? 'input' : 'change', render);
    });
    document.getElementById('clearFilters').addEventListener('click', function () {
        search.value = '';
        category.value = '';
        platform.value = '';
        fileType.value = '';
        sort.value = 'name';
        render();
        search.focus();
    });
});
