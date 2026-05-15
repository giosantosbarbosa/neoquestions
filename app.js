/**
 * NeoQuestions IF - Core Application Script
 * Responsável pela lógica da Página do Público e persistência local.
 */

// 1. Configurações e Estado Inicial
const STORAGE_KEY = 'neoquestions_data';

// Seleção de Elementos do DOM
const questionForm = document.getElementById('questionForm');
const userNameInput = document.getElementById('userName');
const userQuestionInput = document.getElementById('userQuestion');
const questionsFeed = document.getElementById('questionsFeed');
const btnSubmit = document.getElementById('btnSubmit');

// 2. Inicialização
document.addEventListener('DOMContentLoaded', () => {
    renderQuestions();
    
    // Escuta mudanças no LocalStorage (para atualizar o feed se houver abas abertas)
    window.addEventListener('storage', renderQuestions);
});

// 3. Função para Guardar Pergunta
questionForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const author = userNameInput.value.trim() || "Anónimo";
    const questionText = userQuestionInput.value.trim();

    if (!questionText) return;

    // Criar objeto da pergunta seguindo a estrutura definida
    const newQuestion = {
        id: Date.now(), // ID único baseado no timestamp
        autor: author,
        pergunta: questionText,
        votos: 0,
        destaque: false,
        respondida: false,
        data: new Date().toISOString()
    };

    saveQuestion(newQuestion);
    
    // Feedback Visual e Reset
    resetForm();
});

// 4. Lógica de Persistência (LocalStorage)
function saveQuestion(question) {
    const questions = getAllQuestions();
    questions.unshift(question); // Adiciona ao início (mais recente primeiro)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(questions));
    
    renderQuestions(); // Atualiza a lista na interface
}

function getAllQuestions() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function renderQuestions() {
    const questions = getAllQuestions();
    questionsFeed.innerHTML = '';

    if (questions.length === 0) {
        questionsFeed.innerHTML = `<p style="text-align: center; opacity: 0.6;">Ainda não há perguntas.</p>`;
        return;
    }

    questions.forEach(q => {
        const card = document.createElement('div');
        // Adiciona a classe 'answered' se q.respondida for true
        card.className = `question-card ${q.respondida ? 'answered' : ''} ${q.destaque ? 'highlight' : ''}`;
        
        card.innerHTML = `
            <div class="card-content">
                ${q.respondida ? '<div class="answered-badge"><i class="fa-solid fa-check-double"></i> Respondida</div>' : ''}
                <span class="author">
                    <i class="fa-solid fa-user-circle"></i> ${q.autor}
                </span>
                <p class="text">${q.pergunta}</p>
                <div class="card-footer" style="font-size: 0.7rem; margin-top: 10px; opacity: 0.5;">
                    ${new Date(q.data).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                </div>
            </div>
        `;
        questionsFeed.appendChild(card);
    });
}

// 6. Funções Auxiliares (UX)

/**
 * Limpa o formulário e dá feedback de sucesso
 */
function resetForm() {
    const originalText = btnSubmit.innerHTML;
    
    // Efeito de sucesso no botão
    btnSubmit.disabled = true;
    btnSubmit.innerHTML = '<span>Enviado com sucesso!</span> <i class="fa-solid fa-check"></i>';
    btnSubmit.style.backgroundColor = '#1a6b20';

    // Limpa campos
    userNameInput.value = '';
    userQuestionInput.value = '';

    setTimeout(() => {
        btnSubmit.disabled = false;
        btnSubmit.innerHTML = originalText;
        btnSubmit.style.backgroundColor = ''; // Volta ao CSS original
    }, 2000);
}

/**
 * Função chamada pelos Chips de Sugestão no index.html
 */
window.fillQuestion = function(text) {
    userQuestionInput.value = text;
    userQuestionInput.focus();
    
    // Scroll suave até o campo para facilitar em telas pequenas
    userQuestionInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
};