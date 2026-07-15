const API_URL = 'http://localhost:3000/grade-regular';

let allSchedules = [];
let filteredSchedules = [];

const filters = {
    diaSemana: [],
    turma: [],
    sala: [],
};

let searchQuery = '';
let showFilters = false;
let expandedId = null;

const searchInput = document.getElementById('search-input');
const toggleFiltersBtn = document.getElementById('toggle-filters-btn');
const filterPanel = document.getElementById('filter-panel');
const activeFiltersBadge = document.getElementById('active-filters-badge');
const clearFiltersBtn = document.getElementById('clear-filters-btn');
const filtersContainer = document.getElementById('filters-container');
const listContainer = document.getElementById('list-container');
const logsCount = document.getElementById('logs-count');
const totalLogsCount = document.getElementById('total-logs-count');

const levelStyles = {
    'segunda-feira': "bg-blue-500/10 text-blue-600 dark:text-blue-400",
    'terça-feira': "bg-green-500/10 text-green-600 dark:text-green-400",
    'quarta-feira': "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
    'quinta-feira': "bg-orange-500/10 text-orange-600 dark:text-orange-400",
    'sexta-feira': "bg-purple-500/10 text-purple-600 dark:text-purple-400",
};

const getDiaStyle = (dia) => {
    const defaultStyle = "bg-muted text-foreground";
    if (!dia) return defaultStyle;
    const normalized = dia.toLowerCase().trim();
    if (normalized.startsWith('segunda')) return levelStyles['segunda-feira'];
    if (normalized.startsWith('terça')) return levelStyles['terça-feira'];
    if (normalized.startsWith('quarta')) return levelStyles['quarta-feira'];
    if (normalized.startsWith('quinta')) return levelStyles['quinta-feira'];
    if (normalized.startsWith('sexta')) return levelStyles['sexta-feira'];
    return defaultStyle;
};

async function init() {
    setupEventListeners();
    await fetchSchedules();
}

function setupEventListeners() {
    searchInput.addEventListener('input', (e) => {
        searchQuery = e.target.value;
        applyFilters();
    });

    toggleFiltersBtn.addEventListener('click', () => {
        showFilters = !showFilters;
        if (showFilters) {
            filterPanel.classList.add('open');
            toggleFiltersBtn.classList.remove('bg-background');
            toggleFiltersBtn.classList.add('bg-accent', 'text-accent-foreground');
        } else {
            filterPanel.classList.remove('open');
            toggleFiltersBtn.classList.add('bg-background');
            toggleFiltersBtn.classList.remove('bg-accent', 'text-accent-foreground');
        }
    });

    clearFiltersBtn.addEventListener('click', () => {
        filters.diaSemana = [];
        filters.turma = [];
        filters.sala = [];
        applyFilters();
        renderFilters();
    });
}

async function fetchSchedules() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Erro ao buscar dados');
        const data = await response.json();
        allSchedules = data;
        applyFilters();
        renderFilters();
    } catch (error) {
        console.error(error);
        listContainer.innerHTML = `<div class="p-12 text-center text-red-500">Erro ao carregar dados. Verifique se a API está rodando na porta 3000.</div>`;
    }
}

function applyFilters() {
    const lowerQuery = searchQuery.toLowerCase();

    filteredSchedules = allSchedules.filter((schedule) => {
        const matchSearch =
            (schedule.disciplina || '').toLowerCase().includes(lowerQuery) ||
            (schedule.turma || '').toLowerCase().includes(lowerQuery) ||
            (schedule.professor || '').toLowerCase().includes(lowerQuery);

        const matchDia = filters.diaSemana.length === 0 || filters.diaSemana.includes(schedule.diaSemana);
        const matchTurma = filters.turma.length === 0 || filters.turma.includes(schedule.turma);
        const matchSala = filters.sala.length === 0 || filters.sala.includes(schedule.sala);

        return matchSearch && matchDia && matchTurma && matchSala;
    });

    const activeFiltersCount = filters.diaSemana.length + filters.turma.length + filters.sala.length;

    if (activeFiltersCount > 0) {
        activeFiltersBadge.textContent = activeFiltersCount;
        activeFiltersBadge.classList.remove('hidden');
        clearFiltersBtn.classList.remove('hidden');
    } else {
        activeFiltersBadge.classList.add('hidden');
        clearFiltersBtn.classList.add('hidden');
    }

    renderList();
}

function toggleFilter(category, value) {
    const current = filters[category];
    if (current.includes(value)) {
        filters[category] = current.filter(v => v !== value);
    } else {
        filters[category].push(value);
    }
    applyFilters();
    renderFilters();
}

function renderFilters() {
    const getUnique = (key) => [...new Set(allSchedules.map(item => item[key]))].filter(Boolean).sort();

    const dias = getUnique('diaSemana');
    const turmas = getUnique('turma');
    const salas = getUnique('sala');

    const createFilterSection = (title, key, items) => {
        if (items.length === 0) return '';

        let html = `
            <div class="space-y-3">
                <p class="text-xs font-semibold uppercase tracking-wide text-muted-foreground">${title}</p>
                <div class="space-y-2">
        `;

        items.forEach(item => {
            const isSelected = filters[key].includes(item);
            const btnClass = isSelected
                ? "border-primary bg-primary/10 text-primary"
                : "border-border text-muted-foreground hover:border-primary/40 hover:bg-muted/40";

            const iconHtml = isSelected ? `<i data-lucide="check" class="h-3.5 w-3.5"></i>` : '';

            html += `
                <button 
                    onclick="toggleFilter('${key}', '${item}')"
                    class="flex w-full items-center justify-between gap-2 border rounded-md px-3 py-2 text-sm transition-colors ${btnClass}"
                >
                    <span class="capitalize text-left truncate">${item}</span>
                    ${iconHtml}
                </button>
            `;
        });

        html += `</div></div>`;
        return html;
    };

    let filtersHtml = '';
    filtersHtml += createFilterSection('Dia da Semana', 'diaSemana', dias);
    filtersHtml += createFilterSection('Turma', 'turma', turmas);
    filtersHtml += createFilterSection('Sala', 'sala', salas);

    filtersContainer.innerHTML = filtersHtml;
    lucide.createIcons();
}

window.toggleRow = function(id) {
    if (expandedId === id) {
        expandedId = null;
    } else {
        expandedId = id;
    }
    renderList();
}

function renderList() {
    logsCount.textContent = filteredSchedules.length;
    totalLogsCount.textContent = allSchedules.length;

    if (filteredSchedules.length === 0) {
        listContainer.innerHTML = `
            <div class="p-12 text-center">
                <p class="text-muted-foreground">Nenhum horário encontrado para os filtros atuais.</p>
            </div>
        `;
        return;
    }

    const grouped = filteredSchedules.reduce((acc, schedule) => {
        if (!acc[schedule.turma]) acc[schedule.turma] = [];
        acc[schedule.turma].push(schedule);
        return acc;
    }, {});

    let html = '';

    Object.keys(grouped).sort().forEach(turma => {
        const isExpanded = expandedId === turma;
        const schedules = grouped[turma];

        html += `
            <div>
                <button
                    onclick="toggleRow('${turma}')"
                    class="w-full p-4 text-left transition-colors hover:bg-muted/50 active:bg-muted/70 group"
                >
                    <div class="flex items-center gap-4">
                        <div class="flex-shrink-0 chevron ${isExpanded ? 'expanded' : ''}">
                            <i data-lucide="chevron-down" class="h-4 w-4 text-muted-foreground"></i>
                        </div>

                        <span class="flex-shrink-0 min-w-max text-sm font-medium text-foreground">
                            Turma: ${turma}
                        </span>

                        <span class="flex-shrink-0 font-mono text-sm font-semibold text-muted-foreground">
                            ${schedules.length} horário(s) encontrados
                        </span>
                    </div>
                </button>

                <div class="row-details ${isExpanded ? 'expanded border-t border-border bg-muted/50' : ''}">
                    <div class="space-y-4 p-4">
                        <div class="divide-y divide-border bg-card rounded-md border border-border">
                            ${schedules.map(schedule => {
                                const diaStyle = getDiaStyle(schedule.diaSemana);
                                return `
                                    <div class="p-3 flex items-center gap-4 text-sm hover:bg-muted/20">
                                        <div class="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold flex-shrink-0 capitalize ${diaStyle} border-transparent w-24 justify-center">
                                            ${schedule.diaSemana}
                                        </div>
                                        <time class="w-28 whitespace-nowrap flex-shrink-0 font-mono text-xs text-muted-foreground">
                                            ${schedule.horario}
                                        </time>
                                        <p class="flex-1 truncate text-sm text-foreground font-medium">
                                            ${schedule.disciplina}
                                        </p>
                                        <span class="w-24 flex-shrink-0 font-mono text-sm font-semibold text-muted-foreground truncate">
                                            ${schedule.sala}
                                        </span>
                                        <span class="w-40 flex-shrink-0 text-right font-mono text-xs text-muted-foreground truncate">
                                            ${schedule.professor}
                                        </span>
                                    </div>
                                `;
                            }).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
    });

    listContainer.innerHTML = html;
    lucide.createIcons();
}

init();
