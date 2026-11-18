// Modular section loader
async function loadSection(id) {
    const content = document.getElementById('content');
    try {
        const res = await fetch(`sections/${id}.html`);
        if (!res.ok) throw new Error('Not found');
        const html = await res.text();
        content.innerHTML = html;
        
        // Highlight active card
        document.querySelectorAll('.topic-card').forEach(c => c.classList.remove('active'));
        const card = document.querySelector(`.topic-card[data-section="${id}"]`);
        if (card) card.classList.add('active');
        
        window.scrollTo({ top: 0, behavior: 'smooth' });
        
        // Re-init metronome if needed
        if (id === 'metronome') initMetronome();
    } catch (e) {
        content.innerHTML = `<div class="section active"><h2>שגיאה</h2><p>לא ניתן לטעון את העמוד.</p></div>`;
    }
}

// Navigation
document.querySelectorAll('.topic-card').forEach(card => {
    card.addEventListener('click', () => loadSection(card.dataset.section));
});

// Search
const searchInput = document.getElementById('search');
searchInput.addEventListener('input', function() {
    const term = this.value.trim().toLowerCase();
    document.querySelectorAll('.topic-card').forEach(card => {
        if (term.length < 2) {
            card.style.display = '';
            return;
        }
        const text = (card.getAttribute('title') || '').toLowerCase();
        card.style.display = text.includes(term) ? '' : 'none';
    });
});

// Keyboard shortcut
document.addEventListener('keydown', (e) => {
    if (e.key === '/' && document.activeElement !== searchInput) {
        e.preventDefault();
        searchInput.focus();
    }
});

// Metronome (loaded on demand)
let audioCtx = null;
let metroInterval = null;
let isPlaying = false;

function initMetronome() {
    const bpmSlider = document.getElementById('bpm');
    const bpmValue = document.getElementById('bpm-value');
    const metroToggle = document.getElementById('metro-toggle');
    const indicator = document.getElementById('metro-indicator');
    
    if (!bpmSlider) return;
    
    bpmSlider.oninput = () => {
        bpmValue.textContent = bpmSlider.value;
        if (isPlaying) restartMetro();
    };
    
    function playBeep() {
        if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.frequency.value = 800;
        osc.type = 'sine';
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.1);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.1);
        if (indicator) {
            indicator.style.color = '#DC0814';
            setTimeout(() => indicator.style.color = '#ccc', 80);
        }
    }
    
    function startMetro() {
        if (isPlaying) return;
        isPlaying = true;
        if (metroToggle) metroToggle.textContent = 'עצור מטרונום';
        const bpm = parseInt(bpmSlider.value) || 110;
        playBeep();
        metroInterval = setInterval(playBeep, 60000 / bpm);
    }
    
    function stopMetro() {
        isPlaying = false;
        if (metroToggle) metroToggle.textContent = 'הפעל מטרונום';
        if (metroInterval) clearInterval(metroInterval);
        metroInterval = null;
        if (indicator) indicator.style.color = '#ccc';
    }
    
    function restartMetro() {
        stopMetro();
        startMetro();
    }
    
    if (metroToggle) {
        metroToggle.onclick = () => isPlaying ? stopMetro() : startMetro();
    }
}

// Load home on start
document.addEventListener('DOMContentLoaded', () => loadSection('home'));
