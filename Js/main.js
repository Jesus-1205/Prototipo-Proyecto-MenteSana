// --- VARIABLES DE ESTADO ---
let currentQuizStep = 0;
let userResponses = {};

// --- REFERENCIAS AL DOM ---
const elements = {
    sidebar: document.getElementById('sidebar'),
    sidebarToggle: document.getElementById('sidebarToggle'),
    mobileMenuBtn: document.getElementById('mobileMenuBtn'),
    themeToggle: document.getElementById('themeToggle'),
    resourcesToggle: document.getElementById('resourcesToggle'),
    preloader: document.getElementById('preloader'),
    onboardingOverlay: document.getElementById('onboardingOverlay'),
    quizOverlay: document.getElementById('quizOverlay'),
    quizContent: document.getElementById('quizContent'),
    quizProgress: document.getElementById('quizProgress'),
    nextQuizBtn: document.getElementById('nextQuizBtn'),
    prevQuizBtn: document.getElementById('prevQuizBtn'),
    chatMessages: document.getElementById('chatMessages'),
    userInput: document.getElementById('userInput'),
    sendBtn: document.getElementById('sendBtn')
};

// --- INTERFAZ Y NAVEGACIÓN ---
elements.sidebarToggle.onclick = () => elements.sidebar.classList.toggle('minimize');
elements.mobileMenuBtn.onclick = () => document.body.classList.toggle('show-sidebar');
elements.resourcesToggle.onclick = (e) => {
    e.preventDefault();
    elements.resourcesToggle.parentElement.classList.toggle('sub-menu-toggle');
};

elements.themeToggle.onclick = () => {
    document.body.classList.toggle('dark-mode');
    const isDark = document.body.classList.contains('dark-mode');
    elements.themeToggle.innerHTML = isDark ? "<i class='bx bx-sun text-2xl'></i>" : "<i class='bx bx-moon text-2xl'></i>";
};

const updateButtonIcon = () => {
    const val = elements.userInput.value.trim();
    if (val.length > 0) {
        elements.sendBtn.classList.remove('sendButonActive');
        elements.sendBtn.classList.add('sendButonDeactivated');
    } else {
        elements.sendBtn.classList.remove('sendButonDeactivated');
        elements.sendBtn.classList.add('sendButonActive');
    }
};
elements.userInput.addEventListener('input', updateButtonIcon);

// --- LÓGICA DE ONBOARDING ---
document.getElementById('onboardingForm').onsubmit = (e) => {
    e.preventDefault();
    const name = document.getElementById('userName').value;
    document.getElementById('displayUserName').textContent = name;
    elements.onboardingOverlay.style.display = 'none';
    elements.quizOverlay.style.display = 'flex';
    renderQuizStep();
};

// --- LÓGICA DEL QUIZ ---
window.selectOption = (stepIdx, optId) => {
    userResponses[stepIdx] = optId;
    renderQuizStep();
};

function renderQuizStep() {
    const step = quizSteps[currentQuizStep];
    elements.quizProgress.style.width = `${((currentQuizStep + 1) / quizSteps.length) * 100}%`;
    
    elements.quizContent.innerHTML = `
        <h3 class="text-xl font-bold mb-2">${step.title}</h3>
        <p class="text-sm text-gray-400 mb-6">${step.subtitle}</p>
        <div class="space-y-3">
            ${step.options.map(opt => `
                <div class="quiz-option ${userResponses[currentQuizStep] === opt.id ? 'selected' : ''}" 
                    onclick="selectOption(${currentQuizStep}, '${opt.id}')">
                    <span class="text-2xl">${opt.icon}</span>
                    <span class="font-medium text-sm">${opt.text}</span>
                </div>
            `).join('')}
        </div>
    `;
    
    elements.prevQuizBtn.classList.toggle('hidden', currentQuizStep === 0);
    elements.nextQuizBtn.textContent = currentQuizStep === quizSteps.length - 1 ? 'Finalizar' : 'Continuar';
}

elements.nextQuizBtn.onclick = () => {
    if (!userResponses[currentQuizStep]) {
        alert("Por favor, selecciona una opción para continuar.");
        return;
    }
    if (currentQuizStep < quizSteps.length - 1) {
        currentQuizStep++;
        renderQuizStep();
    } else {
        finishQuiz();
    }
};

elements.prevQuizBtn.onclick = () => {
    if (currentQuizStep > 0) {
        currentQuizStep--;
        renderQuizStep();
    }
};

function finishQuiz() {
    elements.quizOverlay.style.display = 'none';
    elements.preloader.style.display = 'flex';
    
    setTimeout(() => {
        elements.preloader.style.opacity = '0';
        setTimeout(() => {
            elements.preloader.style.display = 'none';
            const name = document.getElementById('userName').value;
            const motivation = quizSteps[0].options.find(o => o.id === userResponses[0]).text;
            const focus = quizSteps[3].options.find(o => o.id === userResponses[3]).text;
            
            addMessage(`¡Todo listo, ${name}! Veo que tu motivación es "${motivation}" y buscas enfocarte en "${focus}".`, false);
            addMessage("¿Cómo te sientes hoy respecto a estas metas?", false);
        }, 500);
    }, 2500);
}

// --- LÓGICA DEL CHAT ---
function addMessage(text, isUser = false) {
    const b = document.createElement('div');
    b.className = `chat-bubble ${isUser ? 'bubble-user' : 'bubble-ai'}`;
    b.textContent = text;
    elements.chatMessages.appendChild(b);
    elements.chatMessages.scrollTop = elements.chatMessages.scrollHeight;
}

const handleSend = () => {
    const val = elements.userInput.value.trim();
    if(!val) return;
    
    addMessage(val, true);
    elements.userInput.value = '';
    updateButtonIcon();
    
    setTimeout(() => {
        addMessage("Te entiendo. Teniendo en cuenta tu perfil, este es un buen momento para dar un pequeño paso. ¿Qué podrías hacer hoy?", false);
    }, 1000);
};

elements.sendBtn.onclick = handleSend;
elements.userInput.onkeypress = (e) => {
    if(e.key === 'Enter') handleSend();
};