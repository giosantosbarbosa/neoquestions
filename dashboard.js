/**
 * NeoQuestions IF - Dashboard Script
 * Gestão das perguntas, moderação e destaques em tempo real.
 */

const STORAGE_KEY = 'neoquestions_data';
let currentFilter = 'recent'; // 'recent' ou 'unanswered'

// Seleção de Elementos
const dashFeed = document.getElementById('dashQuestionsFeed');
const highlightZone = document.getElementById('highlightedQuestion');
const totalCounter = document.getElementById('totalQuestions');
const answeredCounter = document.getElementById('answeredCount');
const toast = document.getElementById('toast');

// 1. Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateDashboard();
    
    // Escuta novas perguntas enviadas de outras abas/dispositivos
    window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
            updateDashboard();
            showToast();
        }
    });
});

// 2. Função Principal de Atualização
function updateDashboard() {
    const questions = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    renderStats(questions);
    renderQuestions(questions);
    renderHighlight(questions);
}

// 3. Renderizar Estatísticas
function renderStats(questions) {
    totalCounter.innerText = questions.length;
    answeredCounter.innerText = questions.filter(q => q.respondida).length;
}

// 4. Renderizar Lista de Perguntas
function renderQuestions(questions) {
    dashFeed.innerHTML = '';
    
    let filtered = [...questions];
    
    if (currentFilter === 'unanswered') {
        filtered = filtered.filter(q => !q.respondida);
    }

    if (filtered.length === 0) {
        dashFeed.innerHTML = `<p style="text-align:center; opacity:0.5; padding:20px;">Nenhuma pergunta encontrada.</p>`;
        return;
    }

    filtered.forEach(q => {
        const card = document.createElement('div');
        card.className = `question-card ${q.respondida ? 'answered' : ''} ${q.destaque ? 'highlight' : ''}`;
        card.style.background = "var(--cinza-dashboard)";
        card.style.color = "white";
        card.style.border = q.destaque ? "2px solid var(--verde-if)" : "1px solid #444";

        card.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:flex-start;">
                <div>
                    <strong style="color: var(--verde-if);">${q.autor}</strong>
                    <p style="margin: 10px 0;">${q.pergunta}</p>
                </div>
                <div class="dash-actions" style="display:flex; gap:8px;">
                    <button onclick="toggleHighlight(${q.id})" class="action-btn btn-star" title="Destacar">
                        <i class="fa-${q.destaque ? 'solid' : 'regular'} fa-star"></i>
                    </button>
                    <button onclick="toggleAnswered(${q.id})" class="action-btn btn-check" title="Marcar como respondida">
                        <i class="fa-solid fa-check"></i>
                    </button>
                    <button onclick="deleteQuestion(${q.id})" class="action-btn btn-delete" style="background:var(--vermelho-if); color:white;">
                        <i class="fa-solid fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
        dashFeed.appendChild(card);
    });
}

// 5. Renderizar Pergunta em Destaque (A que aparece no painel lateral)
function renderHighlight(questions) {
    const highlighted = questions.find(q => q.destaque);
    
    if (highlighted) {
        highlightZone.innerHTML = `
            <div style="animation: fadeIn 0.5s ease;">
                <span style="font-size:0.7rem; color:var(--verde-if); font-weight:bold; text-transform:uppercase;">Em Debate:</span>
                <p style="font-size: 1.2rem; margin-top:10px; font-weight: 600;">"${highlighted.pergunta}"</p>
                <p style="margin-top:10px; font-size:0.9rem; opacity:0.8;">— ${highlighted.autor}</p>
            </div>
        `;
        highlightZone.style.borderStyle = "solid";
    } else {
        highlightZone.innerHTML = `<p style="text-align:center; opacity:0.5; font-size:0.8rem;">Clique na estrela para destacar uma pergunta aqui.</p>`;
        highlightZone.style.borderStyle = "dashed";
    }
}

// 6. Funções de Ação (Moderação)

function toggleHighlight(id) {
    const questions = JSON.parse(localStorage.getItem(STORAGE_KEY));
    // Remove destaque de todas e coloca apenas na selecionada (apenas 1 destaque por vez)
    const updated = questions.map(q => ({
        ...q,
        destaque: q.id === id ? !q.destaque : false
    }));
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    updateDashboard();
}

function toggleAnswered(id) {
    const questions = JSON.parse(localStorage.getItem(STORAGE_KEY));
    const updated = questions.map(q => {
        if (q.id === id) return { ...q, respondida: !q.respondida, destaque: false };
        return q;
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    updateDashboard();
}

function deleteQuestion(id) {
    if (confirm('Tem certeza que deseja excluir esta pergunta?')) {
        const questions = JSON.parse(localStorage.getItem(STORAGE_KEY));
        const updated = questions.filter(q => q.id !== id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
        updateDashboard();
    }
}

function clearAllData() {
    if (confirm('ATENÇÃO: Isto apagará TODAS as perguntas do seminário. Continuar?')) {
        localStorage.removeItem(STORAGE_KEY);
        updateDashboard();
    }
}

function filterQuestions(type) {
    currentFilter = type;
    updateDashboard();
}

// 7. Utilitários de UX
function showToast() {
    toast.style.display = 'block';
    setTimeout(() => { toast.style.display = 'none'; }, 3000);
}