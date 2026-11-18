        function showSection(id) {
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.getElementById(id).classList.add('active');
            document.querySelectorAll('.topic-card').forEach(c => c.classList.remove('active'));
            const card = document.querySelector(`.topic-card[data-section="${id}"]`);
            if (card) card.classList.add('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        document.querySelectorAll('.topic-card').forEach(card => {
            card.addEventListener('click', () => showSection(card.dataset.section));
        });

        // Simple search
        const searchInput = document.getElementById('search');
        searchInput.addEventListener('input', function() {
            const term = this.value.trim().toLowerCase();
            if (term.length < 2) {
                document.querySelectorAll('.topic-card').forEach(c => c.style.display = '');
                return;
            }
            document.querySelectorAll('.topic-card').forEach(card => {
                const text = (card.getAttribute('title') || '').toLowerCase();
                const sectionId = card.dataset.section;
                const section = document.getElementById(sectionId);
                const sectionText = section ? section.textContent.toLowerCase() : '';
                if (text.includes(term) || sectionText.includes(term)) {
                    card.style.display = '';
                } else {
                    card.style.display = 'none';
                }
            });
        });

        // Keyboard shortcut for search
        document.addEventListener('keydown', (e) => {
            if (e.key === '/' && document.activeElement !== searchInput) {
                e.preventDefault();
                searchInput.focus();
            }
        });

        // Metronome
        let audioCtx = null;
        let metroInterval = null;
        let isPlaying = false;
        const bpmSlider = document.getElementById('bpm');
        const bpmValue = document.getElementById('bpm-value');
        const metroToggle = document.getElementById('metro-toggle');
        const indicator = document.getElementById('metro-indicator');

        if (bpmSlider) {
            bpmSlider.addEventListener('input', () => {
                bpmValue.textContent = bpmSlider.value;
                if (isPlaying) restartMetro();
            });
        }

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
            const interval = 60000 / bpm;
            playBeep();
            metroInterval = setInterval(playBeep, interval);
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
            metroToggle.addEventListener('click', () => {
                if (isPlaying) stopMetro();
                else startMetro();
            });
        }
