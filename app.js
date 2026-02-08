import { supabase } from './supabaseClient.js'

const USD_TO_EUR = 0.8462;
const EUR_TO_USD = 1 / USD_TO_EUR;

let holdings = [];
let editingId = null;
let deletingId = null;

// Chart instances
let allocChart, assetChart, perfChart;

Chart.defaults.color = '#888';
Chart.defaults.borderColor = 'rgba(255,255,255,0.08)';

const ALLOC_COLORS = ['#8b5cf6','#3b82f6','#10b981','#f59e0b','#ef4444','#06b6d4','#ec4899','#84cc16','#f97316','#14b8a6'];
const ASSET_COLORS = ['#3b82f6','#8b5cf6','#f59e0b','#10b981','#64748b'];

function fmt(n) {
    return Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// ═══════════════════════════════
//  SUPABASE DATA FUNCTIONS
// ═══════════════════════════════
async function loadHoldings() {
    try {
        const { data, error } = await supabase
            .from('holdings')
            .select('*')
            .order('id', { ascending: true });

        if (error) throw error;

        // Map database fields to app format (trade_ccy -> tradeCcy)
        holdings = data.map(h => ({
            id: h.id,
            name: h.name,
            ticker: h.ticker,
            country: h.country,
            tradeCcy: h.trade_ccy,
            invested: parseFloat(h.invested),
            current: parseFloat(h.current)
        }));

        render();
    } catch (error) {
        console.error('Error loading holdings:', error);
        alert('Failed to load portfolio data. Please refresh the page.');
    }
}

async function createHolding(holding) {
    try {
        const { data, error } = await supabase
            .from('holdings')
            .insert([{
                name: holding.name,
                ticker: holding.ticker,
                country: holding.country,
                trade_ccy: holding.tradeCcy,
                invested: holding.invested,
                current: holding.current
            }])
            .select();

        if (error) throw error;

        await loadHoldings();
    } catch (error) {
        console.error('Error creating holding:', error);
        alert('Failed to add holding. Please try again.');
    }
}

async function updateHolding(id, holding) {
    try {
        const { error } = await supabase
            .from('holdings')
            .update({
                name: holding.name,
                ticker: holding.ticker,
                country: holding.country,
                trade_ccy: holding.tradeCcy,
                invested: holding.invested,
                current: holding.current
            })
            .eq('id', id);

        if (error) throw error;

        await loadHoldings();
    } catch (error) {
        console.error('Error updating holding:', error);
        alert('Failed to update holding. Please try again.');
    }
}

async function deleteHolding(id) {
    try {
        const { error } = await supabase
            .from('holdings')
            .delete()
            .eq('id', id);

        if (error) throw error;

        await loadHoldings();
    } catch (error) {
        console.error('Error deleting holding:', error);
        alert('Failed to delete holding. Please try again.');
    }
}

// ═══════════════════════════════
//  RENDER ALL
// ═══════════════════════════════
function render() {
    renderMetrics();
    renderTable();
    renderAllocChart();
    renderAssetChart();
    renderPerfChart();
    updateLastUpdated();
}

function updateLastUpdated() {
    const now = new Date();
    const formatted = now.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    document.getElementById('lastUpdated').textContent = formatted;
}

function renderMetrics() {
    const totInv = holdings.reduce((s, h) => s + h.invested, 0);
    const totCur = holdings.reduce((s, h) => s + h.current, 0);
    const totGain = totCur - totInv;
    const totRet = totInv > 0 ? ((totGain / totInv) * 100).toFixed(1) : '0.0';
    const cash = holdings.find(h => h.ticker === 'CASH');
    const cashVal = cash ? cash.current : 0;
    const cashPct = totCur > 0 ? ((cashVal / totCur) * 100).toFixed(1) : '0.0';
    const pos = totGain >= 0;

    document.getElementById('totalValue').textContent = '€' + fmt(totCur);
    document.getElementById('totalInvested').textContent = '€' + fmt(totInv);
    document.getElementById('unrealizedGain').textContent = (pos ? '+' : '-') + '€' + fmt(totGain);

    const ge = document.getElementById('totalGain');
    ge.className = 'metric-change ' + (pos ? 'positive' : 'negative');
    ge.innerHTML = `<span>${pos ? '↑' : '↓'}</span><span>${pos ? '+' : '-'}€${fmt(totGain)} (${pos ? '+' : ''}${totRet}%)</span>`;

    const re = document.getElementById('returnPercent');
    re.className = 'metric-change ' + (pos ? 'positive' : 'negative');
    re.innerHTML = `<span>${pos ? '↑' : '↓'}</span><span>${totRet}% return</span>`;

    document.getElementById('cashValue').textContent = '€' + fmt(cashVal);
    document.getElementById('cashPercent').innerHTML = `<span>${cashPct}% of portfolio</span>`;
}

function renderTable() {
    const tbody = document.getElementById('holdingsTableBody');
    tbody.innerHTML = '';

    holdings.forEach(h => {
        const gain = h.current - h.invested;
        const ret = h.invested > 0 ? ((gain / h.invested) * 100).toFixed(2) : '0.00';
        const isUSD = h.tradeCcy === 'USD';
        const isGBP = h.tradeCcy === 'GBP';
        const sym = isUSD ? '$' : isGBP ? '£' : '€';
        const ccyCol = isUSD ? '#60a5fa' : isGBP ? '#f59e0b' : '#10b981';
        const rate = isUSD ? EUR_TO_USD : 1;
        const invOrig = h.invested * rate;
        const curOrig = h.current * rate;

        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${h.name}</td>
            <td><span class="ticker">${h.ticker}</span></td>
            <td>${h.country}</td>
            <td style="color:${ccyCol};font-weight:500">${h.tradeCcy}</td>
            <td>${sym}${fmt(invOrig)}</td>
            <td>${sym}${fmt(curOrig)}</td>
            <td>€${fmt(h.current)}</td>
            <td class="${gain >= 0 ? 'gain' : 'loss'}">${gain >= 0 ? '+' : '-'}€${fmt(gain)}</td>
            <td class="${gain >= 0 ? 'gain' : 'loss'}">${gain >= 0 ? '+' : ''}${ret}%</td>
            <td class="actions-cell">
                <button class="btn-dots" onclick="toggleMenu(event,${h.id})">
                    <svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="12" cy="19" r="1.5"/></svg>
                </button>
                <div class="dropdown-menu" id="dd-${h.id}">
                    <button class="dropdown-item" onclick="openEditModal(${h.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                        Edit
                    </button>
                    <button class="dropdown-item danger" onclick="openDeleteModal(${h.id})">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        Delete
                    </button>
                </div>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

// ═══════════════════════════════
//  CHARTS
// ═══════════════════════════════
function renderAllocChart() {
    const top = holdings.filter(h => h.ticker !== 'CASH').sort((a, b) => b.current - a.current).slice(0, 10);
    const total = top.reduce((s, h) => s + h.current, 0);
    const labels = top.map(h => `${h.ticker}  ${((h.current / total) * 100).toFixed(1)}%`);
    const data = top.map(h => h.current);
    const colors = ALLOC_COLORS.slice(0, data.length);

    if (allocChart) {
        allocChart.data.labels = labels;
        allocChart.data.datasets[0].data = data;
        allocChart.data.datasets[0].backgroundColor = colors;
        allocChart.update();
    } else {
        allocChart = new Chart(document.getElementById('allocationChart').getContext('2d'), {
            type: 'doughnut',
            data: { labels, datasets: [{ data, backgroundColor: colors, borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 }, usePointStyle: true, pointStyleWidth: 10 } } } }
        });
    }
}

function renderAssetChart() {
    const etfTickers = ['IVV','VEA'];
    const techTickers = ['MSFT','TSLA','META','NFLX'];
    const types = {
        'ETFs': holdings.filter(h => etfTickers.includes(h.ticker)).reduce((s,h) => s + h.current, 0),
        'Tech Stocks': holdings.filter(h => techTickers.includes(h.ticker)).reduce((s,h) => s + h.current, 0),
        'Other Stocks': holdings.filter(h => !etfTickers.includes(h.ticker) && !techTickers.includes(h.ticker) && h.ticker !== 'XAG' && h.ticker !== 'CASH').reduce((s,h) => s + h.current, 0),
        'Commodities': holdings.filter(h => h.ticker === 'XAG').reduce((s,h) => s + h.current, 0),
        'Cash': holdings.filter(h => h.ticker === 'CASH').reduce((s,h) => s + h.current, 0)
    };
    const total = Object.values(types).reduce((s,v) => s + v, 0);
    const labels = Object.keys(types).map((k,i) => `${k}  ${total > 0 ? ((Object.values(types)[i] / total) * 100).toFixed(1) : '0.0'}%`);
    const data = Object.values(types);

    if (assetChart) {
        assetChart.data.labels = labels;
        assetChart.data.datasets[0].data = data;
        assetChart.update();
    } else {
        assetChart = new Chart(document.getElementById('assetTypeChart').getContext('2d'), {
            type: 'doughnut',
            data: { labels, datasets: [{ data, backgroundColor: ASSET_COLORS, borderWidth: 0 }] },
            options: { responsive: true, maintainAspectRatio: true, plugins: { legend: { position: 'bottom', labels: { padding: 16, font: { size: 12 }, usePointStyle: true, pointStyleWidth: 10 } } } }
        });
    }
}

function renderPerfChart() {
    const perf = holdings.filter(h => h.ticker !== 'CASH').sort((a,b) => b.current - a.current).slice(0, 10);
    const labels = perf.map(h => h.ticker);
    const inv = perf.map(h => h.invested);
    const cur = perf.map(h => h.current);

    if (perfChart) {
        perfChart.data.labels = labels;
        perfChart.data.datasets[0].data = inv;
        perfChart.data.datasets[1].data = cur;
        perfChart.update();
    } else {
        perfChart = new Chart(document.getElementById('performanceChart').getContext('2d'), {
            type: 'bar',
            data: {
                labels,
                datasets: [
                    { label: 'Invested (€)', data: inv, backgroundColor: 'rgba(100,116,139,0.6)', borderColor: 'rgba(100,116,139,0.8)', borderWidth: 1, borderRadius: 4 },
                    { label: 'Current Value (€)', data: cur, backgroundColor: 'rgba(16,185,129,0.7)', borderColor: 'rgba(16,185,129,0.9)', borderWidth: 1, borderRadius: 4 }
                ]
            },
            options: {
                responsive: true, maintainAspectRatio: true,
                plugins: { legend: { display: true, position: 'top', labels: { padding: 16, font: { size: 12 }, usePointStyle: true, pointStyleWidth: 10 } } },
                scales: {
                    y: { grid: { color: 'rgba(255,255,255,0.05)' }, ticks: { callback: v => '€' + v.toLocaleString() } },
                    x: { grid: { display: false } }
                }
            }
        });
    }
}

// ═══════════════════════════════
//  CRUD
// ═══════════════════════════════
function openAddModal() {
    editingId = null;
    document.getElementById('formModalTitle').textContent = 'Add Holding';
    document.getElementById('f_name').value = '';
    document.getElementById('f_ticker').value = '';
    document.getElementById('f_country').value = '';
    document.getElementById('f_tradeCcy').value = 'EUR';
    document.getElementById('f_invested').value = '';
    document.getElementById('f_current').value = '';
    document.getElementById('formModal').classList.add('open');
    document.getElementById('f_name').focus();
}

function openEditModal(id) {
    closeMenus();
    const h = holdings.find(x => x.id === id);
    if (!h) return;
    editingId = id;
    document.getElementById('formModalTitle').textContent = 'Edit Holding';
    document.getElementById('f_name').value = h.name;
    document.getElementById('f_ticker').value = h.ticker;
    document.getElementById('f_country').value = h.country;
    document.getElementById('f_tradeCcy').value = h.tradeCcy;
    document.getElementById('f_invested').value = h.invested;
    document.getElementById('f_current').value = h.current;
    document.getElementById('formModal').classList.add('open');
    document.getElementById('f_name').focus();
}

function closeFormModal() {
    document.getElementById('formModal').classList.remove('open');
    editingId = null;
}

async function saveHolding() {
    const name = document.getElementById('f_name').value.trim();
    const ticker = document.getElementById('f_ticker').value.trim().toUpperCase();
    const country = document.getElementById('f_country').value.trim();
    const tradeCcy = document.getElementById('f_tradeCcy').value;
    const invested = parseFloat(document.getElementById('f_invested').value) || 0;
    const current = parseFloat(document.getElementById('f_current').value) || 0;

    if (!name || !ticker) return;

    if (editingId !== null) {
        await updateHolding(editingId, { name, ticker, country, tradeCcy, invested, current });
    } else {
        await createHolding({ name, ticker, country, tradeCcy, invested, current });
    }

    closeFormModal();
}

function openDeleteModal(id) {
    closeMenus();
    const h = holdings.find(x => x.id === id);
    if (!h) return;
    deletingId = id;
    document.getElementById('deleteMessage').innerHTML = `Are you sure you want to remove <strong>${h.name} (${h.ticker})</strong> from your portfolio?`;
    document.getElementById('deleteModal').classList.add('open');
}

function closeDeleteModal() {
    document.getElementById('deleteModal').classList.remove('open');
    deletingId = null;
}

async function confirmDelete() {
    if (deletingId !== null) {
        await deleteHolding(deletingId);
    }
    closeDeleteModal();
}

// ═══════════════════════════════
//  DROPDOWN MENUS
// ═══════════════════════════════
function toggleMenu(e, id) {
    e.stopPropagation();
    const m = document.getElementById('dd-' + id);
    const wasOpen = m.classList.contains('open');
    closeMenus();
    if (!wasOpen) m.classList.add('open');
}

function closeMenus() {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
}

document.addEventListener('click', closeMenus);
document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeMenus(); closeFormModal(); closeDeleteModal(); }
});

// Enter to save in modal
document.querySelectorAll('#formModal input, #formModal select').forEach(el => {
    el.addEventListener('keydown', e => { if (e.key === 'Enter') saveHolding(); });
});

// Close modals on overlay click
document.getElementById('formModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeFormModal(); });
document.getElementById('deleteModal').addEventListener('click', e => { if (e.target === e.currentTarget) closeDeleteModal(); });

// Make functions globally accessible
window.openAddModal = openAddModal;
window.openEditModal = openEditModal;
window.closeFormModal = closeFormModal;
window.saveHolding = saveHolding;
window.openDeleteModal = openDeleteModal;
window.closeDeleteModal = closeDeleteModal;
window.confirmDelete = confirmDelete;
window.toggleMenu = toggleMenu;

// ═══════════════════════════════
//  INIT
// ═══════════════════════════════
loadHoldings();
