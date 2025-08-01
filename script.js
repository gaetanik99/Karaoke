
// === CONFIGURAZIONE GLOBALE ===
const CONFIG = {
    ADMIN_PASSWORD: 'pizza2024',
    STORAGE_KEY: 'pizzaKaraokeSongs',
    EXTRACTIONS_KEY: 'pizzaKaraokeExtractions',
    PARTICIPANTS_KEY: 'pizzaKaraokeParticipants',
    TEAMS_KEY: 'pizzaKaraokeTeams',
    ANIMATION_DURATION: 3000,
    CONFETTI_COUNT: 50
};

// === VARIABILI GLOBALI ===
let songs = [];
let extractedSongs = []; // Array di oggetti: {song, singer, score, extractionOrder, timestamp}
let participants = []; // Array di oggetti: {name, team}
let teams = []; // Array di stringhe: nomi delle squadre
let isExtracting = false;
let isAdminMode = false;
let showTeamView = true; // Toggle per visualizzazione classifica
let currentExtractedSong = null; // Canzone estratta ma non ancora salvata

// === SQUADRE PREDEFINITE ===
const DEFAULT_TEAMS = [
    "Squadra Rossa",
    "Squadra Blu",
    "Squadra Verde",
    "Squadra Gialla"
];

// === CANZONI PREDEFINITE ===
const DEFAULT_SONGS = [
    "Volare - Domenico Modugno",
    "Azzurro - Adriano Celentano",
    "Nel blu dipinto di blu - Domenico Modugno",
    "Caruso - Lucio Dalla",
    "Laura non c'è - Nek",
    "Bella ciao - Canto popolare",
    "Sarà perché ti amo - Ricchi e Poveri",
    "Felicità - Al Bano e Romina Power",
    "Tanti auguri a te - Tradizionale",
    "Amico - Lucio Battisti",
    "Imagine - John Lennon",
    "Bohemian Rhapsody - Queen",
    "Sweet Child O' Mine - Guns N' Roses",
    "Hotel California - Eagles",
    "Yesterday - The Beatles",
    "Hallelujah - Leonard Cohen",
    "Don't Stop Believin' - Journey",
    "Livin' on a Prayer - Bon Jovi",
    "Sweet Caroline - Neil Diamond",
    "My Way - Frank Sinatra",
    "Despacito - Luis Fonsi",
    "Shape of You - Ed Sheeran",
    "Uptown Funk - Mark Ronson ft. Bruno Mars",
    "Can't Stop the Feeling - Justin Timberlake",
    "Happy - Pharrell Williams",
    "Shake It Off - Taylor Swift",
    "Someone Like You - Adele",
    "Rolling in the Deep - Adele",
    "Counting Stars - OneRepublic",
    "Radioactive - Imagine Dragons",
    "Macarena - Los Del Rio",
    "YMCA - Village People",
    "I Will Survive - Gloria Gaynor",
    "Dancing Queen - ABBA",
    "Mamma Mia - ABBA",
    "Don't Stop Me Now - Queen",
    "We Are the Champions - Queen",
    "Eye of the Tiger - Survivor",
    "Footloose - Kenny Loggins",
    "Girls Just Want to Have Fun - Cyndi Lauper"
];

// === INIZIALIZZAZIONE ===
document.addEventListener('DOMContentLoaded', function () {
    initializeApp();
});

// === GESTIONE MENU HAMBURGER ===
function toggleMenu() {
    const sideMenu = document.getElementById('sideMenu');
    const menuOverlay = document.getElementById('menuOverlay');
    const hamburgerIcon = document.querySelector('.hamburger-icon');
    
    sideMenu.classList.toggle('active');
    menuOverlay.classList.toggle('active');
    hamburgerIcon.classList.toggle('active');
    
    // Previeni lo scroll del body quando il menu è aperto
    if (sideMenu.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
    } else {
        document.body.style.overflow = 'auto';
    }
}

function initializeApp() {
    loadSongs();
    loadExtractions();
    loadTeams();
    loadParticipants();
    updateStats();
    updateSongsTables();
    updateTeamsList();
    updateTeamSelect();
    updateParticipantsList();
    updateLeaderboard();
    setupEventListeners();

    // Assicurati che le sezioni di gestione siano nascoste all'avvio
    hideSongManagement();
    hideParticipantsManagement();

    console.log('🍕 Pizza Karaoke inizializzato!');
}

function setupEventListeners() {
    // Gestione input canzone con Enter
    document.getElementById('songInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addSong();
        }
    });

    // Gestione input partecipante con Enter
    document.getElementById('participantName').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            document.getElementById('participantTeamSelect').focus();
        }
    });

    document.getElementById('participantTeamSelect').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addParticipant();
        }
    });

    // Gestione input squadra con Enter
    document.getElementById('teamNameInput').addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            addTeam();
        }
    });



    // Shortcuts da tastiera
    document.addEventListener('keydown', function (e) {
        if (e.ctrlKey && e.key === 'e') {
            e.preventDefault();
            extractSong();
        }
        if (e.ctrlKey && e.key === 'g') {
            e.preventDefault();
            toggleSongManagement();
        }
        if (e.ctrlKey && e.key === 'p') {
            e.preventDefault();
            toggleParticipantsManagement();
        }
        if (e.ctrlKey && e.key === 'r') {
            e.preventDefault();
            resetExtractions();
        }
        // Chiudi il menu quando si preme ESC
        if (e.key === 'Escape') {
            const sideMenu = document.getElementById('sideMenu');
            if (sideMenu && sideMenu.classList.contains('active')) {
                toggleMenu();
            }
        }
    });
}

// === GESTIONE STORAGE ===
function saveSongs() {
    localStorage.setItem(CONFIG.STORAGE_KEY, JSON.stringify(songs));
}

function loadSongs() {
    const savedSongs = localStorage.getItem(CONFIG.STORAGE_KEY);
    if (savedSongs) {
        songs = JSON.parse(savedSongs);
    } else {
        songs = [...DEFAULT_SONGS];
        saveSongs();
    }
}

function saveExtractions() {
    localStorage.setItem(CONFIG.EXTRACTIONS_KEY, JSON.stringify(extractedSongs));
}

function loadExtractions() {
    const savedExtractions = localStorage.getItem(CONFIG.EXTRACTIONS_KEY);
    if (savedExtractions) {
        const parsed = JSON.parse(savedExtractions);

        // Migrazione dati: se sono stringhe, convertile in oggetti
        if (parsed.length > 0 && typeof parsed[0] === 'string') {
            extractedSongs = parsed.map((song, index) => ({
                song: song,
                singer: '',
                score: '',
                extractionOrder: index + 1,
                timestamp: new Date().toISOString()
            }));
            saveExtractions(); // Salva nel nuovo formato
        } else {
            extractedSongs = parsed;
        }
    }
}

// === STORAGE PARTECIPANTI ===
function saveParticipants() {
    localStorage.setItem(CONFIG.PARTICIPANTS_KEY, JSON.stringify(participants));
}

function loadParticipants() {
    const savedParticipants = localStorage.getItem(CONFIG.PARTICIPANTS_KEY);
    if (savedParticipants) {
        participants = JSON.parse(savedParticipants);

        // Migrazione: aggiungi skipsUsed ai partecipanti esistenti che non ce l'hanno
        participants.forEach(participant => {
            if (participant.skipsUsed === undefined) {
                participant.skipsUsed = 0;
            }
        });

        // Salva i dati migrati
        saveParticipants();
    }
}

// === STORAGE SQUADRE ===
function saveTeams() {
    localStorage.setItem(CONFIG.TEAMS_KEY, JSON.stringify(teams));
}

function loadTeams() {
    const savedTeams = localStorage.getItem(CONFIG.TEAMS_KEY);
    if (savedTeams) {
        teams = JSON.parse(savedTeams);
    } else {
        teams = [...DEFAULT_TEAMS];
        saveTeams();
    }
}

// === GESTIONE CANZONI ===
function addSong() {
    const input = document.getElementById('songInput');
    const songTitle = input.value.trim();

    if (songTitle === '') {
        showToast('Inserisci un titolo valido!', 'warning');
        return;
    }

    if (songs.includes(songTitle)) {
        showToast('Questa canzone è già presente!', 'warning');
        return;
    }

    songs.push(songTitle);
    saveSongs();
    updateStats();
    updateSongsList();
    input.value = '';

    showToast('Canzone aggiunta con successo! 🎵', 'success');
}

function removeSong(index) {
    if (confirm('Sei sicuro di voler rimuovere questa canzone?')) {
        const removedSong = songs.splice(index, 1)[0];

        // Rimuovi anche dalle canzoni estratte se presente
        const extractedIndex = extractedSongs.findIndex(item => item.song === removedSong);
        if (extractedIndex > -1) {
            extractedSongs.splice(extractedIndex, 1);
            saveExtractions();
        }

        saveSongs();
        updateStats();
        updateSongsList();
        updateSongsTables();

        showToast('Canzone rimossa!', 'success');
    }
}

function removeAllSongs() {
    if (songs.length === 0) {
        showToast('Non ci sono canzoni da rimuovere!', 'warning');
        return;
    }

    if (confirm('Sei sicuro di voler rimuovere TUTTE le canzoni? Questa azione non può essere annullata!')) {
        songs = [];
        extractedSongs = [];

        saveSongs();
        saveExtractions();
        updateStats();
        updateSongsList();
        updateSongsTables();

        // Reset anche il display dell'estrazione
        document.getElementById('songDisplay').innerHTML = 'Premi "Estrai Canzone" per iniziare!';
        document.getElementById('participantInfo').innerHTML = '';

        showToast('Tutte le canzoni sono state rimosse! 🗑️', 'success');
    }
}

function loadDefaultSongs() {
    if (confirm('Questo sostituirà tutte le canzoni attuali con quelle predefinite. Continuare?')) {
        songs = [...DEFAULT_SONGS];
        extractedSongs = [];
        saveSongs();
        saveExtractions();
        updateStats();
        updateSongsList();
        updateSongsTables();

        showToast('Canzoni predefinite caricate! 📚', 'success');
    }
}

function updateSongsList() {
    const songsList = document.getElementById('songsList');
    songsList.innerHTML = '';

    if (songs.length === 0) {
        songsList.innerHTML = '<p style="text-align: center; opacity: 0.7;">Nessuna canzone disponibile</p>';
        return;
    }

    songs.forEach((song, index) => {
        const songItem = document.createElement('div');
        songItem.className = 'song-item';

        const isExtracted = extractedSongs.some(item => item.song === song);
        const statusIcon = isExtracted ? '✅' : '🎵';

        songItem.innerHTML = `
                    <span class="song-title">${statusIcon} ${song}</span>
                    <button class="btn btn-danger btn-small" onclick="removeSong(${index})">
                        🗑️ Rimuovi
                    </button>
                `;

        if (isExtracted) {
            songItem.style.opacity = '0.6';
        }

        songsList.appendChild(songItem);
    });

    // Aggiorna anche le tabelle e la classifica
    updateSongsTables();
    updateLeaderboard();
}

// === GESTIONE TABELLE ===
function updateSongsTables() {
    updateAllSongsTable();
    updateExtractedSongsTable();
}

function updateAllSongsTable() {
    const tableBody = document.getElementById('allSongsTableBody');
    tableBody.innerHTML = '';

    if (songs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" style="text-align: center; opacity: 0.6; padding: 20px;">Nessuna canzone disponibile</td></tr>';
        return;
    }

    songs.forEach((song, index) => {
        const isExtracted = extractedSongs.some(extracted => extracted.song === song);
        const row = document.createElement('tr');

        row.innerHTML = `
                    <td style="font-weight: bold; color: var(--accent-color);">${index + 1}</td>
                    <td style="font-weight: bold;">${song}</td>
                    <td>
                        <span class="song-status ${isExtracted ? 'status-extracted' : 'status-available'}">
                            ${isExtracted ? '🎯 Estratta' : '✅ Disponibile'}
                        </span>
                    </td>
                `;

        tableBody.appendChild(row);
    });
}

function updateExtractedSongsTable() {
    const tableBody = document.getElementById('extractedSongsTableBody');
    tableBody.innerHTML = '';

    if (extractedSongs.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="6" style="text-align: center; opacity: 0.6; padding: 20px;">Nessuna canzone estratta ancora</td></tr>';
        return;
    }

    extractedSongs.forEach((extractedObj, index) => {
        const row = document.createElement('tr');

        // Crea select per partecipanti
        let participantOptions = '<option value="">Seleziona partecipante...</option>';
        participants.forEach(participant => {
            const selected = extractedObj.singer === participant.name ? 'selected' : '';
            participantOptions += `<option value="${participant.name}" data-team="${participant.team}" ${selected}>${participant.name} (${participant.team})</option>`;
        });

        row.innerHTML = `
                    <td style="font-weight: bold; color: var(--accent-color);">
                        <span class="extraction-order">${extractedObj.extractionOrder}</span>
                    </td>
                    <td style="font-weight: bold;">${extractedObj.song}</td>
                    <td>
                        <select class="custom-select" onchange="selectParticipant(${index}, this)">
                            ${participantOptions}
                        </select>
                    </td>
                    <td>
                        <span class="team-badge" id="teamBadge_${index}">
                            ${extractedObj.team || 'N/A'}
                        </span>
                    </td>
                    <td>
                        <input type="number" 
                               class="editable-input score-input" 
                               value="${extractedObj.score || ''}" 
                               placeholder="0-10"
                               min="0" max="10" step="0.1"
                               onchange="updateExtractedSong(${index}, 'score', this.value)">
                    </td>
                    <td>
                        <button class="btn btn-mini btn-save" 
                                onclick="saveExtractedSongData(${index})" 
                                title="Salva modifiche">
                            💾
                        </button>
                        <button class="btn btn-mini btn-danger" 
                                onclick="removeExtractedSong(${index})" 
                                title="Rimuovi estrazione">
                            🗑️
                        </button>
                    </td>
                `;

        tableBody.appendChild(row);
    });
}

function selectParticipant(index, selectElement) {
    const selectedOption = selectElement.options[selectElement.selectedIndex];
    const participantName = selectedOption.value;
    const team = selectedOption.getAttribute('data-team') || '';

    if (extractedSongs[index]) {
        extractedSongs[index].singer = participantName;
        extractedSongs[index].team = team;

        // Aggiorna il badge della squadra
        const teamBadge = document.getElementById(`teamBadge_${index}`);
        if (teamBadge) {
            teamBadge.textContent = team || 'N/A';
        }

        saveExtractions();
        updateLeaderboard();
        showToast('Partecipante assegnato! 👤', 'success');
    }
}

function updateExtractedSong(index, field, value) {
    if (extractedSongs[index]) {
        extractedSongs[index][field] = value;

        // Aggiorna anche la squadra se il cantante cambia
        if (field === 'singer') {
            const participant = participants.find(p => p.name === value);
            extractedSongs[index].team = participant ? participant.team : '';
        }

        // Auto-save dopo 1 secondo di inattività
        clearTimeout(window.autoSaveTimeout);
        window.autoSaveTimeout = setTimeout(() => {
            saveExtractions();
            updateExtractedSongsTable();
            updateLeaderboard(); // Aggiorna la classifica in tempo reale
            showToast('Modifiche salvate automaticamente! 💾', 'success');
        }, 1000);
    }
}

function saveExtractedSongData(index) {
    saveExtractions();
    showToast('Dati salvati! 💾', 'success');
}

function removeExtractedSong(index) {
    if (confirm('Sei sicuro di voler rimuovere questa estrazione?')) {
        extractedSongs.splice(index, 1);

        // Riordina i numeri di estrazione
        extractedSongs.forEach((obj, i) => {
            obj.extractionOrder = i + 1;
        });

        saveExtractions();
        updateStats();
        updateSongsTables();
        updateLeaderboard();
        showToast('Estrazione rimossa!', 'success');
    }
}

// === ESTRAZIONE CANZONI ===
function extractSong() {
    if (isExtracting) return;

    const availableSongs = songs.filter(song =>
        !extractedSongs.some(extracted => extracted.song === song)
    );

    if (availableSongs.length === 0) {
        showToast('Tutte le canzoni sono state estratte! 🎉', 'warning');
        if (extractedSongs.length > 0) {
            celebrateCompletion();
        }
        return;
    }

    isExtracting = true;

    // Countdown integrato
    const songDisplay = document.getElementById('songDisplay');
    let countdown = 3;

    const countdownInterval = setInterval(() => {
        songDisplay.innerHTML = `<div class="countdown">${countdown}</div>`;
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);
            songDisplay.innerHTML = '<div class="countdown">Estrazione in corso...</div>';

            setTimeout(() => {
                const randomIndex = Math.floor(Math.random() * availableSongs.length);
                const selectedSong = availableSongs[randomIndex];

                // Salva la canzone estratta temporaneamente (NON in extractedSongs)
                currentExtractedSong = {
                    song: selectedSong,
                    singer: '',
                    score: '',
                    extractionOrder: extractedSongs.length + 1,
                    timestamp: new Date().toISOString()
                };

                displayExtractedSong(selectedSong);
                createConfetti();

                showToast('Canzone estratta! 🎤', 'success');

                // Mostra il form per inserire cantante e punteggio dopo un breve delay
                setTimeout(() => {
                    showSingerScoreForm(-1); // -1 indica che è una nuova estrazione
                }, 2000);

                isExtracting = false;
            }, 1000);
        }
    }, 1000);
}

function startExtractionAnimation() {
    const songDisplay = document.getElementById('songDisplay');
    const participantInfo = document.getElementById('participantInfo');

    songDisplay.classList.add('extracting');
    participantInfo.innerHTML = '';

    // Countdown
    let countdown = 3;
    const countdownInterval = setInterval(() => {
        songDisplay.innerHTML = `<span class="countdown">${countdown}</span>`;
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);
            songDisplay.innerHTML = 'Estrazione in corso...';
        }
    }, 1000);

    // Memorizza l'intervallo per poterlo cancellare se necessario
    return countdownInterval;
}



function displayExtractedSong(song) {
    const songDisplay = document.getElementById('songDisplay');
    const participantInfo = document.getElementById('participantInfo');

    songDisplay.classList.remove('extracting');
    songDisplay.innerHTML = `🎵 ${song}`;

    // Informazioni per il partecipante
    const tips = [
        "Ricordati di divertirti! 🎉",
        "Non importa se sbagli, l'importante è partecipare! 😊",
        "Fai sentire la tua voce! 🎤",
        "Coinvolgi il pubblico! 👥",
        "Balla se ti va! 💃🕺"
    ];

    const randomTip = tips[Math.floor(Math.random() * tips.length)];
    participantInfo.innerHTML = `💡 ${randomTip}`;
}

// === EFFETTI SPECIALI ===
function createConfetti() {
    const colors = ['#ff6b6b', '#4ecdc4', '#ffe66d', '#95e1d3', '#ffa8a8'];

    for (let i = 0; i < CONFIG.CONFETTI_COUNT; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';
            confetti.style.left = Math.random() * 100 + 'vw';
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.animationDelay = Math.random() * 3 + 's';
            confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';

            document.body.appendChild(confetti);

            setTimeout(() => {
                confetti.remove();
            }, 5000);
        }, i * 50);
    }
}

// === GESTIONE STATISTICHE ===
function updateStats() {
    const totalSongs = songs.length;
    const extractedCount = extractedSongs.length;
    const remainingCount = totalSongs - extractedCount;

    document.getElementById('totalSongs').textContent = totalSongs;
    document.getElementById('extractedCount').textContent = extractedCount;
    document.getElementById('remainingCount').textContent = remainingCount;

    // Aggiorna anche le tabelle
    updateSongsTables();
    updateLeaderboard(); // Aggiorna anche la classifica
}

// === GESTIONE ADMIN ===
function toggleSongManagement() {
    const songManagement = document.getElementById('songManagement');
    const isVisible = songManagement.classList.contains('visible');

    if (isVisible) {
        hideSongManagement();
    } else {
        showSongManagement();
    }
}

function showSongManagement() {
    const songManagement = document.getElementById('songManagement');
    songManagement.classList.add('visible');
    document.getElementById('songInput').focus();

    // Scorri alla sezione
    songManagement.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function hideSongManagement() {
    const songManagement = document.getElementById('songManagement');
    songManagement.classList.remove('visible');
}

// === GESTIONE PARTECIPANTI ===
function toggleParticipantsManagement() {
    const management = document.getElementById('participantsManagement');
    const isVisible = management.classList.contains('visible');

    if (isVisible) {
        hideParticipantsManagement();
    } else {
        showParticipantsManagement();
    }
}

function showParticipantsManagement() {
    const management = document.getElementById('participantsManagement');
    management.classList.add('visible');

    // Scorri alla sezione
    management.scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Focus sul primo campo disponibile
    const teamInput = document.getElementById('teamNameInput');
    const participantInput = document.getElementById('participantName');

    if (teams.length === 0) {
        teamInput.focus();
    } else {
        participantInput.focus();
    }
}

function hideParticipantsManagement() {
    const management = document.getElementById('participantsManagement');
    management.classList.remove('visible');
}

function addParticipant() {
    const name = document.getElementById('participantName').value.trim();
    const team = document.getElementById('participantTeamSelect').value;

    if (!name) {
        showToast('Inserisci il nome del partecipante!', 'warning');
        return;
    }

    if (!team) {
        showToast('Seleziona una squadra!', 'warning');
        return;
    }

    // Controlla se il partecipante esiste già
    if (participants.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showToast('Questo partecipante è già presente!', 'warning');
        return;
    }

    // Aggiungi il partecipante con il contatore dei salti
    participants.push({
        name: name,
        team: team,
        skipsUsed: 0  // Nuovo campo per tracciare i salti utilizzati
    });

    saveParticipants();
    updateParticipantsList();
    updateLeaderboard();

    // Reset form
    document.getElementById('participantName').value = '';
    document.getElementById('participantTeamSelect').value = '';
    document.getElementById('participantName').focus();

    showToast(`${name} aggiunto alla ${team}! 🎤`, 'success');
}

function removeParticipant(index) {
    if (confirm('Sei sicuro di voler rimuovere questo partecipante?')) {
        const removedParticipant = participants.splice(index, 1)[0];

        // Rimuovi dalle estrazioni se presente
        extractedSongs.forEach(extraction => {
            if (extraction.singer === removedParticipant.name) {
                extraction.singer = '';
                extraction.team = '';
            }
        });

        saveParticipants();
        saveExtractions();
        updateParticipantsList();
        updateExtractedSongsTable();

        showToast('Partecipante rimosso!', 'success');
    }
}

function removeAllParticipants() {
    if (participants.length === 0) {
        showToast('Non ci sono partecipanti da rimuovere!', 'warning');
        return;
    }

    if (confirm('Sei sicuro di voler rimuovere TUTTI i partecipanti?')) {
        participants = [];

        // Pulisci anche le estrazioni
        extractedSongs.forEach(extraction => {
            extraction.singer = '';
            extraction.team = '';
        });

        saveParticipants();
        saveExtractions();
        updateParticipantsList();
        updateExtractedSongsTable();

        showToast('Tutti i partecipanti sono stati rimossi! 🗑️', 'success');
    }
}

function updateParticipantsList() {
    const list = document.getElementById('participantsList');
    list.innerHTML = '';

    if (participants.length === 0) {
        list.innerHTML = '<div style="text-align: center; opacity: 0.6; padding: 20px;">Nessun partecipante registrato</div>';
        return;
    }

    // Raggruppa per squadra
    const teams = {};
    participants.forEach(participant => {
        if (!teams[participant.team]) {
            teams[participant.team] = [];
        }
        teams[participant.team].push(participant);
    });

    Object.keys(teams).forEach(teamName => {
        const teamDiv = document.createElement('div');
        teamDiv.innerHTML = `<h4 style="color: var(--accent-color); margin: 15px 0 10px 0;">🏆 Squadra: ${teamName}</h4>`;
        list.appendChild(teamDiv);

        teams[teamName].forEach((participant, teamIndex) => {
            const globalIndex = participants.findIndex(p => p.name === participant.name);
            const item = document.createElement('div');
            item.className = 'participant-item';

            item.innerHTML = `
                        <div class="participant-info">
                            <div class="participant-name">${participant.name}</div>
                            <div class="participant-team">Squadra: ${participant.team}</div>
                        </div>
                        <div style="display: flex; gap: 5px;">
                            <button class="btn btn-small btn-info" onclick="editParticipantTeam(${globalIndex})" title="Modifica squadra">
                                ✏️ Modifica
                            </button>
                            <button class="btn btn-small btn-danger" onclick="removeParticipant(${globalIndex})">
                                🗑️ Rimuovi
                            </button>
                        </div>
                    `;

            list.appendChild(item);
        });
    });
}

function getRandomParticipant() {
    if (participants.length === 0) {
        return null;
    }

    const randomIndex = Math.floor(Math.random() * participants.length);
    return participants[randomIndex];
}

// === GESTIONE SQUADRE ===
function addTeam() {
    const input = document.getElementById('teamNameInput');
    const teamName = input.value.trim();

    if (teamName === '') {
        showToast('Inserisci un nome squadra valido!', 'warning');
        return;
    }

    if (teams.includes(teamName)) {
        showToast('Questa squadra è già presente!', 'warning');
        return;
    }

    teams.push(teamName);
    saveTeams();
    updateTeamsList();
    updateTeamSelect();

    input.value = '';
    input.focus();

    showToast('Squadra aggiunta con successo! 🏆', 'success');
}

function removeTeam(index) {
    if (confirm('Sei sicuro di voler rimuovere questa squadra?')) {
        const removedTeam = teams.splice(index, 1)[0];

        // Rimuovi la squadra dai partecipanti
        participants.forEach(participant => {
            if (participant.team === removedTeam) {
                participant.team = '';
            }
        });

        // Rimuovi la squadra dalle estrazioni
        extractedSongs.forEach(extraction => {
            if (extraction.team === removedTeam) {
                extraction.team = '';
            }
        });

        saveTeams();
        saveParticipants();
        saveExtractions();
        updateTeamsList();
        updateTeamSelect();
        updateParticipantsList();
        updateExtractedSongsTable();

        showToast('Squadra rimossa! 🗑️', 'success');
    }
}

function removeAllTeams() {
    if (confirm('Sei sicuro di voler rimuovere tutte le squadre?')) {
        teams = [];

        // Rimuovi le squadre dai partecipanti
        participants.forEach(participant => {
            participant.team = '';
        });

        // Rimuovi le squadre dalle estrazioni
        extractedSongs.forEach(extraction => {
            extraction.team = '';
        });

        saveTeams();
        saveParticipants();
        saveExtractions();
        updateTeamsList();
        updateTeamSelect();
        updateParticipantsList();
        updateExtractedSongsTable();

        showToast('Tutte le squadre sono state rimosse! 🗑️', 'success');
    }
}

function updateTeamsList() {
    const list = document.getElementById('teamsList');
    list.innerHTML = '';

    teams.forEach((team, index) => {
        const item = document.createElement('div');
        item.className = 'team-item';
        item.innerHTML = `
                    <span>${team}</span>
                    <button class="team-remove-btn" onclick="removeTeam(${index})" title="Rimuovi squadra">
                        ✕
                    </button>
                `;
        list.appendChild(item);
    });
}

function updateTeamSelect() {
    const select = document.getElementById('participantTeamSelect');
    select.innerHTML = '<option value="">Seleziona squadra...</option>';

    teams.forEach(team => {
        const option = document.createElement('option');
        option.value = team;
        option.textContent = team;
        select.appendChild(option);
    });
}

// === RESET SISTEMA ===
function resetExtractions() {
    if (confirm('Sei sicuro di voler resettare tutte le estrazioni? Questo permetterà di estrarre nuovamente tutte le canzoni.')) {
        extractedSongs = [];
        saveExtractions();
        updateStats();
        updateSongsList();
        updateSongsTables();

        document.getElementById('songDisplay').innerHTML = 'Premi "Estrai Canzone" per iniziare!';
        document.getElementById('participantInfo').innerHTML = '';

        showToast('Estrazioni resettate! 🔄', 'success');
    }
}

// === TOAST NOTIFICATIONS ===
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// === UTILITY FUNCTIONS ===
function shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
}

// === GESTIONE EVENTI SPECIALI ===
function celebrateCompletion() {
    if (extractedSongs.length === songs.length && songs.length > 0) {
        setTimeout(() => {
            alert('🎉 Complimenti! Tutte le canzoni sono state estratte! La serata è stata un successo! 🎉');
            createConfetti();
        }, 1000);
    }
}

// === GESTIONE CANTANTE E PUNTEGGIO ===
function showSingerScoreForm(extractedIndex) {
    let extractedSong;

    // Se extractedIndex è -1, usa la canzone estratta temporanea
    if (extractedIndex === -1) {
        extractedSong = currentExtractedSong;
    } else {
        extractedSong = extractedSongs[extractedIndex];
    }

    if (!extractedSong) {
        showToast('Errore: nessuna canzone da modificare!', 'error');
        return;
    }

    // Crea le opzioni per il select dei partecipanti
    let participantOptions = '<option value="">Seleziona partecipante...</option>';
    participants.forEach(participant => {
        const selected = extractedSong.singer === participant.name ? 'selected' : '';
        participantOptions += `<option value="${participant.name}" data-team="${participant.team}" ${selected}>${participant.name} (${participant.team})</option>`;
    });

    // Genera il link YouTube per la ricerca karaoke
    const songTitle = encodeURIComponent(extractedSong.song + ' karaoke');
    const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${songTitle}`;

    const modal = document.createElement('div');
    modal.className = 'admin-overlay visible';
    modal.innerHTML = `
                <div class="admin-modal" style="min-width: 400px;">
                    <h3 style="color: var(--accent-color); margin-bottom: 20px;">🎤 Dettagli Esibizione</h3>
                    <p style="font-size: 1.1rem; margin-bottom: 15px; font-weight: bold;">${extractedSong.song}</p>
                    
                    <!-- Link YouTube Karaoke -->
                    <div style="margin-bottom: 20px; text-align: center;">
                        <a href="${youtubeSearchUrl}" target="_blank" class="btn btn-accent" 
                           style="background-color: #FF0000; border-color: #FF0000; color: white; text-decoration: none; display: inline-block; padding: 8px 16px; border-radius: 5px; font-size: 0.9rem;">
                            🎵 Cerca su YouTube Karaoke
                        </a>
                    </div>
                    
                    <div style="margin-bottom: 15px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nome Cantante:</label>
                        ${participants.length > 0 ? `
            <select id="participantSelect" class="admin-input custom-select" style="margin-bottom: 10px; width: 100%; max-width: none;">
                ${participantOptions}
            </select>
            <div style="text-align: center; margin: 10px 0; opacity: 0.7;">oppure</div>
        ` : ''}
                        <input type="text" id="singerNameInput" class="admin-input" 
                               placeholder="Inserisci il nome del cantante..." 
                               value="${extractedSong.singer || ''}" maxlength="50">
                        
                        ${participants.length > 0 ? `
                            <div style="text-align: center; margin: 15px 0;">
                                <button id="randomSingerBtn" class="btn btn-info" onclick="selectRandomSinger(${extractedIndex})" 
                                        style="background-color: #17a2b8; border-color: #17a2b8; font-size: 0.9rem;">
                                    🎲 Estrai Cantante Casuale
                                </button>
                            </div>
                        ` : ''}
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Punteggio (1-10):</label>
                        <input type="number" id="scoreInput" class="admin-input" 
                               placeholder="Voto da 1 a 10" min="1" max="10" step="0.5"
                               value="${extractedSong.score || ''}">
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="saveSingerScore(${extractedIndex})">
                            💾 Salva
                        </button>
                        ${extractedIndex !== -1 ? `
                        <button class="btn btn-warning" onclick="skipExtractedSong(${extractedIndex})" 
                                style="background-color: #f39c12; border-color: #e67e22;">
                            ⏭️ Salta
                        </button>
                        ` : `
                        <button class="btn btn-warning" onclick="cancelExtraction()" 
                                style="background-color: #f39c12; border-color: #e67e22;">
                            ⏭️ Salta
                        </button>
                        `}
                        <button class="btn btn-secondary" onclick="${extractedIndex === -1 ? 'cancelExtraction()' : 'closeSingerScoreForm()'}">
                            ❌ Chiudi
                        </button>
                    </div>
                </div>
            `;

    document.body.appendChild(modal)

    // Gestione cambio select partecipante
    if (participants.length > 0) {
        const participantSelect = document.getElementById('participantSelect');
        const singerInput = document.getElementById('singerNameInput');

        participantSelect.addEventListener('change', function () {
            if (this.value) {
                singerInput.value = this.value;
            }
        });

        participantSelect.focus();
    } else {
        document.getElementById('singerNameInput').focus();
    }

    // Gestione Enter per salvare
    modal.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            saveSingerScore(extractedIndex);
        }
    });
}

function saveSingerScore(extractedIndex) {
    const singerName = document.getElementById('singerNameInput').value.trim();
    const score = parseFloat(document.getElementById('scoreInput').value);

    // Validazione punteggio
    if (score && (score < 1 || score > 10)) {
        showToast('Il punteggio deve essere tra 1 e 10!', 'warning');
        return;
    }

    if (extractedIndex === -1) {
        // Nuova estrazione - salva currentExtractedSong in extractedSongs
        if (!currentExtractedSong) {
            showToast('Errore: nessuna canzone estratta da salvare!', 'error');
            return;
        }

        // Aggiorna i dati della canzone estratta
        if (singerName) {
            currentExtractedSong.singer = singerName;
            // Trova la squadra del partecipante
            const participant = participants.find(p => p.name === singerName);
            currentExtractedSong.team = participant ? participant.team : '';
        }
        if (!isNaN(score) && score >= 1 && score <= 10) {
            currentExtractedSong.score = score;
        }

        // Aggiungi a extractedSongs
        extractedSongs.push(currentExtractedSong);
        currentExtractedSong = null; // Reset

        // Aggiorna tutto
        saveExtractions();
        updateStats();
        updateSongsList();
        updateSongsTables();
        updateLeaderboard();

    } else {
        // Modifica di estrazione esistente
        if (singerName) {
            extractedSongs[extractedIndex].singer = singerName;
            // Trova la squadra del partecipante
            const participant = participants.find(p => p.name === singerName);
            extractedSongs[extractedIndex].team = participant ? participant.team : '';
        }
        if (!isNaN(score) && score >= 1 && score <= 10) {
            extractedSongs[extractedIndex].score = score;
        }

        saveExtractions();
        updateSongsTables();
        updateLeaderboard();
    }

    closeSingerScoreForm();

    if (singerName || !isNaN(score)) {
        showToast('Dati salvati con successo! 💾', 'success');
    }
}

function closeSingerScoreForm() {
    const modal = document.querySelector('.admin-overlay.visible');
    if (modal) {
        modal.remove();
    }

    // Se c'è una canzone estratta non salvata, chiedi conferma
    if (currentExtractedSong) {
        if (confirm(`Hai una canzone estratta non salvata: "${currentExtractedSong.song}". Vuoi scartarla? (Tornerà disponibile per future estrazioni)`)) {
            currentExtractedSong = null;
            const songDisplay = document.getElementById('songDisplay');
            songDisplay.innerHTML = 'Canzone scartata! Premi "Estrai Canzone" per continuare!';
            document.getElementById('participantInfo').innerHTML = '';
            showToast('Canzone scartata! 🗑️', 'warning');
        }
    }
}

function cancelExtraction() {
    if (confirm('Sei sicuro di voler annullare questa estrazione? La canzone tornerà disponibile.')) {
        // Reset della canzone estratta temporanea
        currentExtractedSong = null;

        // Reset del display
        const songDisplay = document.getElementById('songDisplay');
        songDisplay.innerHTML = 'Premi "Estrai Canzone" per continuare!';
        document.getElementById('participantInfo').innerHTML = '';

        closeSingerScoreForm();
        showToast('Estrazione annullata! La canzone è di nuovo disponibile 🔄', 'success');
    }
}

function editExtractedSong(extractedIndex) {
    showSingerScoreForm(extractedIndex);
}

// Nuova funzione per selezionare un cantante casuale
function selectRandomSinger(extractedIndex) {
    // Se extractedIndex è -1, usa currentExtractedSong
    const targetSong = extractedIndex === -1 ? currentExtractedSong : extractedSongs[extractedIndex];
    if (!targetSong) {
        showToast('Errore: nessuna canzone da assegnare!', 'error');
        return;
    }
    // Rimuovi la parte duplicata e continua con il codice esistente
    // Conta quante volte ha cantato ogni partecipante
    const singerCounts = {};
    participants.forEach(participant => {
        singerCounts[participant.name] = 0;
    });

    // Conta le canzoni cantate da ogni partecipante
    extractedSongs
        .filter(song => song.singer && song.singer.trim() !== '')
        .forEach(song => {
            const singerName = song.singer.trim();
            if (singerCounts.hasOwnProperty(singerName)) {
                singerCounts[singerName]++;
            }
        });

    // Trova il numero minimo di canzoni cantate
    const minSongs = Math.min(...Object.values(singerCounts));

    // Filtra i partecipanti che hanno cantato il numero minimo di volte
    const availableParticipants = participants.filter(participant =>
        singerCounts[participant.name] === minSongs
    );

    // Se non ci sono partecipanti registrati
    if (availableParticipants.length === 0) {
        showToast('Nessun partecipante registrato! 🎤', 'warning');
        return;
    }

    const randomBtn = document.getElementById('randomSingerBtn');
    const participantSelect = document.getElementById('participantSelect');
    const singerInput = document.getElementById('singerNameInput');

    // Disabilita il pulsante durante l'estrazione
    randomBtn.disabled = true;
    randomBtn.style.opacity = '0.6';

    let countdown = 3;
    const originalText = randomBtn.innerHTML;

    const countdownInterval = setInterval(() => {
        randomBtn.innerHTML = `🎲 Estrazione in corso... ${countdown}`;
        countdown--;

        if (countdown < 0) {
            clearInterval(countdownInterval);

            // Seleziona un partecipante casuale tra quelli che hanno cantato meno
            const randomIndex = Math.floor(Math.random() * availableParticipants.length);
            const selectedParticipant = availableParticipants[randomIndex];

            // Aggiorna i campi
            if (participantSelect) {
                participantSelect.value = selectedParticipant.name;
            }
            singerInput.value = selectedParticipant.name;

            // Ripristina il pulsante
            randomBtn.innerHTML = originalText;
            randomBtn.disabled = false;
            randomBtn.style.opacity = '1';

            // Mostra notifica con informazioni sul numero di canzoni
            const currentCount = singerCounts[selectedParticipant.name];
            showToast(`🎤 Estratto: ${selectedParticipant.name} (${selectedParticipant.team}) - ${currentCount + 1}ª canzone!`, 'success');

            // Effetto confetti
            createConfetti();
        }
    }, 1000);
}

// Nuova funzione per saltare la canzone estratta
function skipExtractedSong(extractedIndex) {
    if (extractedIndex === -1) {
        // Nuova estrazione - salta currentExtractedSong
        if (!currentExtractedSong) {
            showToast('Errore: nessuna canzone da saltare!', 'error');
            return;
        }

        if (confirm(`Sei sicuro di voler saltare la canzone "${currentExtractedSong.song}"? Tornerà disponibile per future estrazioni.`)) {
            // Reset currentExtractedSong
            currentExtractedSong = null;

            // Chiudi il popup
            closeSingerScoreForm();

            // Aggiorna il display dell'estrazione
            const songDisplay = document.getElementById('songDisplay');
            songDisplay.innerHTML = 'Canzone saltata! Premi "Estrai Canzone" per continuare!';
            document.getElementById('participantInfo').innerHTML = '';

            showToast('Canzone saltata! Ora è di nuovo disponibile 🔄', 'success');
        }
        return;
    }

    // Gestione per canzoni già estratte
    const skippedSong = extractedSongs[extractedIndex];

    // Trova il partecipante che ha estratto la canzone
    const participant = participants.find(p => p.name === skippedSong.singer);

    if (participant) {
        // Controlla se ha già utilizzato tutti i salti
        if (participant.skipsUsed >= 2) {
            showToast(`${participant.name} ha già utilizzato tutti i 2 salti disponibili! ⚠️`, 'error');
            return;
        }

        if (confirm(`Sei sicuro di voler saltare questa canzone? ${participant.name} avrà ancora ${1 - participant.skipsUsed} salto/i disponibili.`)) {
            // Incrementa il contatore dei salti
            participant.skipsUsed++;

            // Rimuovi la canzone dalle estratte
            extractedSongs.splice(extractedIndex, 1);

            // Riordina i numeri di estrazione
            extractedSongs.forEach((obj, i) => {
                obj.extractionOrder = i + 1;
            });

            // Salva tutto
            saveExtractions();
            saveParticipants();
            updateStats();
            updateSongsTables();
            updateLeaderboard();

            // Chiudi il popup
            closeSingerScoreForm();

            // Aggiorna il display dell'estrazione
            const songDisplay = document.getElementById('songDisplay');
            songDisplay.innerHTML = 'Premi "Estrai Canzone" per continuare!';
            document.getElementById('participantInfo').innerHTML = '';

            const remainingSkips = 2 - participant.skipsUsed;
            showToast(`Canzone "${skippedSong.song}" saltata! ${participant.name} ha ancora ${remainingSkips} salto/i disponibili 🔄`, 'success');
        }
    } else {
        // Fallback per canzoni senza cantante assegnato
        if (confirm('Sei sicuro di voler saltare questa canzone? Tornerà disponibile per future estrazioni.')) {
            // Rimuovi la canzone dalle estratte
            extractedSongs.splice(extractedIndex, 1);

            // Riordina i numeri di estrazione
            extractedSongs.forEach((obj, i) => {
                obj.extractionOrder = i + 1;
            });

            // Salva e aggiorna tutto
            saveExtractions();
            updateStats();
            updateSongsTables();
            updateLeaderboard();

            // Chiudi il popup
            closeSingerScoreForm();

            // Aggiorna il display dell'estrazione
            const songDisplay = document.getElementById('songDisplay');
            songDisplay.innerHTML = 'Premi "Estrai Canzone" per continuare!';
            document.getElementById('participantInfo').innerHTML = '';

            showToast(`Canzone "${skippedSong.song}" saltata! Ora è di nuovo disponibile 🔄`, 'success');
        }
    }
}

// === IMPORT/EXPORT FUNCTIONS ===
function exportSongs() {
    if (songs.length === 0) {
        showToast('Non ci sono canzoni da esportare!', 'warning');
        return;
    }

    const exportData = {
        songs: songs,
        extractedSongs: extractedSongs,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(exportData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `pizza-karaoke-songs-${new Date().toISOString().split('T')[0]}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`Lista esportata con successo! (${songs.length} canzoni) 📤`, 'success');
}

function exportTeamsAndParticipants() {
    const dataToExport = {
        teams: teams,
        participants: participants,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `pizza_karaoke_completo_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showToast('Dati completi esportati con successo! 📦', 'success');
}

function exportTeams() {
    if (teams.length === 0) {
        showToast('Nessuna squadra da esportare!', 'warning');
        return;
    }

    const dataToExport = {
        teams: teams,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `pizza_karaoke_squadre_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showToast('Squadre esportate con successo! 📤', 'success');
}

function exportParticipants() {
    if (participants.length === 0) {
        showToast('Nessun partecipante da esportare!', 'warning');
        return;
    }

    const dataToExport = {
        participants: participants,
        exportDate: new Date().toISOString(),
        version: '1.0'
    };

    const dataStr = JSON.stringify(dataToExport, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `pizza_karaoke_partecipanti_${new Date().toISOString().split('T')[0]}.json`;
    link.click();

    showToast('Partecipanti esportati con successo! 📤', 'success');
}

function importSongs() {
    document.getElementById('importFileInput').click();
}

function handleFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        showToast('Seleziona un file JSON valido!', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importData = JSON.parse(e.target.result);

            // Verifica la struttura del file
            if (!importData.songs || !Array.isArray(importData.songs)) {
                throw new Error('Formato file non valido');
            }

            // Chiedi conferma se ci sono già canzoni
            if (songs.length > 0) {
                const action = confirm(
                    `Hai già ${songs.length} canzoni nella lista.\n\n` +
                    `Clicca OK per SOSTITUIRE la lista attuale con quella importata (${importData.songs.length} canzoni)\n` +
                    `Clicca Annulla per AGGIUNGERE le canzoni importate a quelle esistenti`
                );

                if (action) {
                    // Sostituisci
                    songs = [...importData.songs];
                    // Gestisci il formato delle canzoni estratte (compatibilità)
                    if (importData.extractedSongs && Array.isArray(importData.extractedSongs)) {
                        extractedSongs = importData.extractedSongs.map((item, index) => {
                            if (typeof item === 'string') {
                                // Formato vecchio - converti
                                return {
                                    song: item,
                                    singer: null,
                                    score: null,
                                    extractionOrder: index + 1,
                                    timestamp: new Date().toISOString()
                                };
                            }
                            return item; // Formato nuovo
                        });
                    } else {
                        extractedSongs = [];
                    }
                } else {
                    // Aggiungi (evitando duplicati)
                    const newSongs = importData.songs.filter(song => !songs.includes(song));
                    songs = [...songs, ...newSongs];

                    if (newSongs.length === 0) {
                        showToast('Tutte le canzoni importate erano già presenti!', 'warning');
                        return;
                    }

                    showToast(`${newSongs.length} nuove canzoni aggiunte! (${importData.songs.length - newSongs.length} duplicate ignorate)`, 'success');
                }
            } else {
                // Lista vuota, importa tutto
                songs = [...importData.songs];
                // Gestisci il formato delle canzoni estratte (compatibilità)
                if (importData.extractedSongs && Array.isArray(importData.extractedSongs)) {
                    extractedSongs = importData.extractedSongs.map((item, index) => {
                        if (typeof item === 'string') {
                            // Formato vecchio - converti
                            return {
                                song: item,
                                singer: null,
                                score: null,
                                extractionOrder: index + 1,
                                timestamp: new Date().toISOString()
                            };
                        }
                        return item; // Formato nuovo
                    });
                } else {
                    extractedSongs = [];
                }
            }

            // Salva e aggiorna
            saveSongs();
            saveExtractions();
            updateStats();
            updateSongsList();
            updateSongsTables();

            if (songs.length > 0) {
                showToast(`Lista importata con successo! (${songs.length} canzoni totali) 📥`, 'success');
            }

        } catch (error) {
            console.error('Errore durante l\'importazione:', error);
            showToast('Errore: File non valido o corrotto!', 'error');
        }
    };

    reader.readAsText(file);

    // Reset input per permettere di selezionare lo stesso file
    event.target.value = '';
}

function handleAllFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            let importedCount = 0;

            // Importa squadre se presenti
            if (importedData.teams && Array.isArray(importedData.teams)) {
                const newTeams = importedData.teams.filter(team => !teams.includes(team));
                teams.push(...newTeams);
                importedCount += newTeams.length;
                saveTeams();
                updateTeamsList();
                updateTeamSelect();
            }

            // Importa partecipanti se presenti
            if (importedData.participants && Array.isArray(importedData.participants)) {
                const newParticipants = importedData.participants.filter(p =>
                    !participants.some(existing => existing.name === p.name)
                );
                participants.push(...newParticipants);
                importedCount += newParticipants.length;
                saveParticipants();
                updateParticipantsList();
                updateExtractedSongsTable();
            }

            if (importedCount > 0) {
                showToast(`${importedCount} elementi importati con successo! 📦`, 'success');
            } else {
                showToast('Nessun nuovo elemento da importare!', 'warning');
            }

        } catch (error) {
            showToast('Errore durante l\'importazione del file!', 'error');
            console.error('Errore importazione completa:', error);
        }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

function handleTeamsFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Verifica formato
            if (!importedData.teams || !Array.isArray(importedData.teams)) {
                showToast('Formato file non valido!', 'error');
                return;
            }

            const importedTeams = importedData.teams;

            if (importedTeams.length === 0) {
                showToast('Nessuna squadra trovata nel file!', 'warning');
                return;
            }

            // Controlla duplicati
            const duplicates = importedTeams.filter(team => teams.includes(team));

            if (duplicates.length > 0) {
                const action = confirm(
                    `Trovate ${duplicates.length} squadre duplicate:\n${duplicates.join(', ')}\n\n` +
                    'Vuoi sostituire le squadre esistenti? (OK = Sostituisci, Annulla = Aggiungi solo nuove)'
                );

                if (action) {
                    // Sostituisci tutto
                    teams = [...importedTeams];
                } else {
                    // Aggiungi solo nuove
                    const newTeams = importedTeams.filter(team => !teams.includes(team));
                    teams.push(...newTeams);
                }
            } else {
                // Nessun duplicato, aggiungi tutto
                teams.push(...importedTeams);
            }

            saveTeams();
            updateTeamsList();
            updateTeamSelect();

            showToast(`${importedTeams.length} squadre importate con successo! 📥`, 'success');

        } catch (error) {
            showToast('Errore durante l\'importazione del file!', 'error');
            console.error('Errore importazione squadre:', error);
        }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

function handleParticipantsFileImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const importedData = JSON.parse(e.target.result);

            // Verifica formato
            if (!importedData.participants || !Array.isArray(importedData.participants)) {
                showToast('Formato file non valido!', 'error');
                return;
            }

            const importedParticipants = importedData.participants;

            if (importedParticipants.length === 0) {
                showToast('Nessun partecipante trovato nel file!', 'warning');
                return;
            }

            // Controlla duplicati
            const duplicates = importedParticipants.filter(p =>
                participants.some(existing => existing.name === p.name)
            );

            if (duplicates.length > 0) {
                const action = confirm(
                    `Trovati ${duplicates.length} partecipanti duplicati:\n${duplicates.map(p => p.name).join(', ')}\n\n` +
                    'Vuoi sostituire i partecipanti esistenti? (OK = Sostituisci, Annulla = Aggiungi solo nuovi)'
                );

                if (action) {
                    // Sostituisci tutto
                    participants = [...importedParticipants];
                } else {
                    // Aggiungi solo nuovi
                    const newParticipants = importedParticipants.filter(p =>
                        !participants.some(existing => existing.name === p.name)
                    );
                    participants.push(...newParticipants);
                }
            } else {
                // Nessun duplicato, aggiungi tutto
                participants.push(...importedParticipants);
            }

            saveParticipants();
            updateParticipantsList();
            updateExtractedSongsTable();

            showToast(`${importedParticipants.length} partecipanti importati con successo! 📥`, 'success');

        } catch (error) {
            showToast('Errore durante l\'importazione del file!', 'error');
            console.error('Errore importazione partecipanti:', error);
        }
    };

    reader.readAsText(file);
    event.target.value = ''; // Reset input
}

// === MODIFICA SQUADRA PARTECIPANTE ===
function editParticipantTeam(participantIndex) {
    const participant = participants[participantIndex];
    if (!participant) {
        showToast('Partecipante non trovato!', 'error');
        return;
    }

    // Crea le opzioni per il select delle squadre
    let teamOptions = '<option value="">Nessuna squadra</option>';
    teams.forEach(team => {
        const selected = participant.team === team ? 'selected' : '';
        teamOptions += `<option value="${team}" ${selected}>${team}</option>`;
    });

    const modal = document.createElement('div');
    modal.className = 'admin-overlay visible';
    modal.innerHTML = `
                <div class="admin-modal" style="min-width: 400px;">
                    <h3 style="color: var(--accent-color); margin-bottom: 20px;">✏️ Modifica Squadra</h3>
                    <p style="font-size: 1.1rem; margin-bottom: 15px; font-weight: bold;">Partecipante: ${participant.name}</p>
                    
                    <p style="margin-bottom: 15px; opacity: 0.8;">Squadra attuale: ${participant.team || 'Nessuna'}</p>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 5px; font-weight: bold;">Nuova Squadra:</label>
                        <select id="newTeamSelect" class="admin-input custom-select" style="width: 100%; max-width: none;">
                            ${teamOptions}
                        </select>
                    </div>
                    
                    <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
                        <button class="btn btn-primary" onclick="saveParticipantTeam(${participantIndex})">
                            💾 Salva
                        </button>
                        <button class="btn btn-secondary" onclick="closeEditParticipantModal()">
                            ❌ Annulla
                        </button>
                    </div>
                </div>
            `;

    document.body.appendChild(modal);
    document.getElementById('newTeamSelect').focus();

    // Gestione Enter per salvare
    modal.addEventListener('keypress', function (e) {
        if (e.key === 'Enter') {
            saveParticipantTeam(participantIndex);
        }
    });
}

function saveParticipantTeam(participantIndex) {
    const newTeam = document.getElementById('newTeamSelect').value;
    const participant = participants[participantIndex];
    const oldTeam = participant.team;

    // Aggiorna la squadra del partecipante
    participant.team = newTeam;

    // Aggiorna anche le estrazioni esistenti di questo partecipante
    extractedSongs.forEach(extraction => {
        if (extraction.singer === participant.name) {
            extraction.team = newTeam;
        }
    });

    // Salva i dati
    saveParticipants();
    saveExtractions();

    // Aggiorna le visualizzazioni
    updateParticipantsList();
    updateExtractedSongsTable();
    updateLeaderboard();

    // Chiudi la modale
    closeEditParticipantModal();

    // Mostra messaggio di successo
    const teamMessage = newTeam ? `squadra "${newTeam}"` : 'nessuna squadra';
    const oldTeamMessage = oldTeam ? `"${oldTeam}"` : 'nessuna squadra';
    showToast(`Squadra di ${participant.name} cambiata da ${oldTeamMessage} a ${teamMessage}! ✏️`, 'success');
}

// Funzione per chiudere la modale di modifica
function closeEditParticipantModal() {
    const modal = document.querySelector('.admin-overlay.visible');
    if (modal) {
        modal.remove();
    }
}

// === SHORTCUTS INFO ===
function showShortcuts() {
    const shortcuts = `
                🎹 SHORTCUTS TASTIERA:
                • Ctrl + E = Estrai Canzone
                • Ctrl + G = Gestisci Canzoni
                • Ctrl + P = Gestisci Partecipanti
                • Ctrl + R = Reset Estrazioni
                • Enter = Conferma (nei campi di input)
            `;
    alert(shortcuts);
}

// === GESTIONE CLASSIFICA ===
function toggleLeaderboardView() {
    showTeamView = !showTeamView;
    const teamsDiv = document.getElementById('teamsLeaderboard');
    const participantsDiv = document.getElementById('participantsLeaderboard');
    const toggleBtn = document.getElementById('toggleTeamView');

    if (showTeamView) {
        teamsDiv.classList.remove('hidden');
        participantsDiv.classList.add('hidden');
        toggleBtn.textContent = '👤 Visualizza per Partecipanti';
        toggleBtn.className = 'btn btn-secondary';
    } else {
        teamsDiv.classList.add('hidden');
        participantsDiv.classList.remove('hidden');
        toggleBtn.textContent = '👥 Visualizza per Squadre';
        toggleBtn.className = 'btn btn-accent';
    }
}

function refreshLeaderboard() {
    updateLeaderboard();
    showToast('Classifica aggiornata! 🔄', 'success');
}

function updateLeaderboard() {
    updateTeamsLeaderboard();
    updateParticipantsLeaderboard();
}

function calculateTeamStats() {
    const teamStats = {};

    // Inizializza statistiche per tutte le squadre
    teams.forEach(team => {
        teamStats[team] = {
            name: team,
            participants: [],
            totalScore: 0,
            songCount: 0,
            average: 0
        };
    });

    // Aggiungi partecipanti alle squadre
    participants.forEach(participant => {
        if (participant.team && teamStats[participant.team]) {
            teamStats[participant.team].participants.push(participant.name);
        }
    });

    // Calcola punteggi dalle estrazioni
    extractedSongs.forEach(extraction => {
        if (extraction.singer && extraction.score && !isNaN(parseFloat(extraction.score))) {
            const participant = participants.find(p => p.name === extraction.singer);
            if (participant && participant.team && teamStats[participant.team]) {
                teamStats[participant.team].totalScore += parseFloat(extraction.score);
                teamStats[participant.team].songCount++;
            }
        }
    });

    // Calcola medie
    Object.values(teamStats).forEach(team => {
        if (team.songCount > 0) {
            team.average = (team.totalScore / team.songCount).toFixed(1);
        }
    });

    return Object.values(teamStats).sort((a, b) => b.totalScore - a.totalScore);
}

function calculateParticipantStats() {
    const participantStats = {};

    // Inizializza statistiche per tutti i partecipanti
    participants.forEach(participant => {
        participantStats[participant.name] = {
            name: participant.name,
            team: participant.team || 'Nessuna squadra',
            totalScore: 0,
            songCount: 0,
            average: 0,
            scores: []
        };
    });

    // Calcola punteggi dalle estrazioni
    extractedSongs.forEach(extraction => {
        if (extraction.singer && extraction.score && !isNaN(parseFloat(extraction.score))) {
            if (participantStats[extraction.singer]) {
                const score = parseFloat(extraction.score);
                participantStats[extraction.singer].totalScore += score;
                participantStats[extraction.singer].songCount++;
                participantStats[extraction.singer].scores.push({
                    song: extraction.song,
                    score: score
                });
            }
        }
    });

    // Calcola medie
    Object.values(participantStats).forEach(participant => {
        if (participant.songCount > 0) {
            participant.average = (participant.totalScore / participant.songCount).toFixed(1);
        }
    });

    return Object.values(participantStats).sort((a, b) => b.totalScore - a.totalScore);
}

function updateTeamsLeaderboard() {
    const teamStats = calculateTeamStats();
    const tbody = document.getElementById('teamsLeaderboardBody');
    tbody.innerHTML = '';

    if (teamStats.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td colspan="6" class="no-scores">Nessuna squadra disponibile</td>
                `;
        tbody.appendChild(row);
        return;
    }

    teamStats.forEach((team, index) => {
        const row = document.createElement('tr');
        const position = index + 1;
        const positionClass = position <= 3 ? `position-${position}` : '';

        row.innerHTML = `
                    <td class="position-cell ${positionClass}">${position}</td>
                    <td class="team-name">${team.name}</td>
                    <td>${team.participants.length} (${team.participants.join(', ') || 'Nessuno'})</td>
                    <td>${team.songCount}</td>
                    <td class="score-total">${team.totalScore.toFixed(1)}</td>
                    <td class="score-average">${team.average || '0.0'}</td>
                `;

        tbody.appendChild(row);
    });
}

function updateParticipantsLeaderboard() {
    const participantStats = calculateParticipantStats();
    const tbody = document.getElementById('participantsLeaderboardBody');
    tbody.innerHTML = '';

    if (participantStats.length === 0) {
        const row = document.createElement('tr');
        row.innerHTML = `
                    <td colspan="7" class="no-scores">Nessun partecipante disponibile</td>
                `;
        tbody.appendChild(row);
        return;
    }

    participantStats.forEach((participant, index) => {
        const row = document.createElement('tr');
        const position = index + 1;
        const positionClass = position <= 3 ? `position-${position}` : '';

        const scoresDetail = participant.scores.length > 0
            ? participant.scores.map(s => `${s.score}`).join(', ')
            : 'Nessun punteggio';

        row.innerHTML = `
                    <td class="position-cell ${positionClass}">${position}</td>
                    <td class="participant-name">${participant.name}</td>
                    <td class="team-name">${participant.team}</td>
                    <td>${participant.songCount}</td>
                    <td class="score-total">${participant.totalScore.toFixed(1)}</td>
                    <td class="score-average">${participant.average || '0.0'}</td>
                    <td class="score-details">${scoresDetail}</td>
                `;

        tbody.appendChild(row);
    });
}

// Funzione per chiudere tutte le sezioni di gestione
function closeAllManagementSections() {
    hideSongManagement();
    hideParticipantsManagement();
}

// Aggiungi shortcut per chiudere le sezioni (ESC)
document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        closeAllManagementSections();
    }
});

// Aggiungi shortcut per mostrare gli shortcuts
document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.key === 'h') {
        e.preventDefault();
        showShortcuts();
    }
});

// === BACKUP COMPLETO ===
function exportCompleteBackup() {
    const backupData = {
        // Metadati del backup
        backupInfo: {
            version: '2.0',
            exportDate: new Date().toISOString(),
            description: 'Backup completo Pizza Karaoke - Include tutto: canzoni, partecipanti, squadre, estrazioni e punteggi'
        },

        // Dati principali
        songs: songs,
        teams: teams,
        participants: participants,
        extractedSongs: extractedSongs,

        // Statistiche calcolate (per verifica)
        stats: {
            totalSongs: songs.length,
            totalTeams: teams.length,
            totalParticipants: participants.length,
            totalExtractions: extractedSongs.length,
            extractionsWithScores: extractedSongs.filter(e => e.score && !isNaN(parseFloat(e.score))).length
        }
    };

    const dataStr = JSON.stringify(backupData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });

    const link = document.createElement('a');
    link.href = URL.createObjectURL(dataBlob);
    link.download = `pizza_karaoke_backup_completo_${new Date().toISOString().split('T')[0]}_${new Date().toTimeString().split(' ')[0].replace(/:/g, '-')}.json`;

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    showToast(`💾 Backup completo esportato con successo!\n📊 ${backupData.stats.totalSongs} canzoni, ${backupData.stats.totalParticipants} partecipanti, ${backupData.stats.totalExtractions} estrazioni`, 'success');
}

function handleCompleteBackupImport(event) {
    const file = event.target.files[0];
    if (!file) return;

    if (file.type !== 'application/json') {
        showToast('❌ Seleziona un file JSON valido!', 'error');
        return;
    }

    const reader = new FileReader();
    reader.onload = function (e) {
        try {
            const backupData = JSON.parse(e.target.result);

            // Verifica la struttura del backup
            if (!backupData.backupInfo || !backupData.songs || !backupData.teams || !backupData.participants) {
                throw new Error('Formato backup non valido - dati mancanti');
            }

            // Mostra informazioni del backup
            const backupInfo = backupData.backupInfo;
            const stats = backupData.stats || {};

            const confirmMessage = `🔄 RIPRISTINO BACKUP COMPLETO\n\n` +
                `📅 Data backup: ${new Date(backupInfo.exportDate).toLocaleString('it-IT')}\n` +
                `📊 Contenuto:\n` +
                `   • ${stats.totalSongs || backupData.songs.length} canzoni\n` +
                `   • ${stats.totalTeams || backupData.teams.length} squadre\n` +
                `   • ${stats.totalParticipants || backupData.participants.length} partecipanti\n` +
                `   • ${stats.totalExtractions || (backupData.extractedSongs ? backupData.extractedSongs.length : 0)} estrazioni\n\n` +
                `⚠️ ATTENZIONE: Questo sostituirà TUTTI i dati attuali!\n\n` +
                `Vuoi continuare con il ripristino?`;

            if (!confirm(confirmMessage)) {
                showToast('❌ Ripristino annullato dall\'utente', 'warning');
                return;
            }

            // Ripristina tutti i dati
            songs = Array.isArray(backupData.songs) ? [...backupData.songs] : [];
            teams = Array.isArray(backupData.teams) ? [...backupData.teams] : [];
            participants = Array.isArray(backupData.participants) ? [...backupData.participants] : [];

            // Ripristina estrazioni con controllo formato
            if (Array.isArray(backupData.extractedSongs)) {
                extractedSongs = backupData.extractedSongs.map((item, index) => {
                    if (typeof item === 'string') {
                        // Formato vecchio - converti
                        return {
                            song: item,
                            singer: '',
                            score: '',
                            extractionOrder: index + 1,
                            timestamp: new Date().toISOString(),
                            team: ''
                        };
                    }
                    // Assicurati che abbia tutti i campi necessari
                    return {
                        song: item.song || '',
                        singer: item.singer || '',
                        score: item.score || '',
                        extractionOrder: item.extractionOrder || index + 1,
                        timestamp: item.timestamp || new Date().toISOString(),
                        team: item.team || ''
                    };
                });
            } else {
                extractedSongs = [];
            }

            // Salva tutto nel localStorage
            saveSongs();
            saveTeams();
            saveParticipants();
            saveExtractions();

            // Aggiorna tutta l'interfaccia
            updateStats();
            updateSongsList();
            updateSongsTables();
            updateTeamsList();
            updateTeamSelect();
            updateParticipantsList();
            updateExtractedSongsTable();
            updateLeaderboard();

            // Aggiorna il display dell'estrazione
            const songDisplay = document.getElementById('songDisplay');
            songDisplay.innerHTML = 'Backup ripristinato! Premi "Estrai Canzone" per continuare!';

            // Messaggio di successo
            const successMessage = `✅ BACKUP RIPRISTINATO CON SUCCESSO!\n\n` +
                `📊 Dati ripristinati:\n` +
                `   • ${songs.length} canzoni\n` +
                `   • ${teams.length} squadre\n` +
                `   • ${participants.length} partecipanti\n` +
                `   • ${extractedSongs.length} estrazioni\n\n` +
                `🎉 Tutto pronto per continuare la gara!`;

            showToast(successMessage, 'success');

        } catch (error) {
            console.error('Errore durante il ripristino del backup:', error);
            showToast(`❌ Errore durante il ripristino del backup:\n${error.message}`, 'error');
        }
    };

    reader.readAsText(file);

    // Reset input per permettere di selezionare lo stesso file
    event.target.value = '';
}

// === RESET COMPLETO ===
function resetCompleteApplication() {
    // Prima conferma
    const firstConfirm = confirm(
        '⚠️ ATTENZIONE: RESET COMPLETO\n\n' +
        'Questa operazione cancellerà TUTTI i dati:\n' +
        '• Tutte le canzoni\n' +
        '• Tutte le squadre\n' +
        '• Tutti i partecipanti\n' +
        '• Tutte le estrazioni e punteggi\n' +
        '• Tutta la cronologia\n\n' +
        '❌ QUESTA OPERAZIONE NON PUÒ ESSERE ANNULLATA!\n\n' +
        'Sei sicuro di voler continuare?'
    );

    if (!firstConfirm) {
        showToast('❌ Reset annullato', 'warning');
        return;
    }

    // Seconda conferma di sicurezza
    const secondConfirm = confirm(
        '🚨 ULTIMA CONFERMA\n\n' +
        'Stai per cancellare DEFINITIVAMENTE tutti i dati.\n\n' +
        'SUGGERIMENTO: Prima di procedere, crea un backup completo ' +
        'usando il pulsante "💾 Backup Completo" se vuoi poter ' +
        'ripristinare i dati in futuro.\n\n' +
        'Vuoi davvero procedere con il reset completo?'
    );

    if (!secondConfirm) {
        showToast('❌ Reset annullato - Operazione sicura', 'warning');
        return;
    }

    // Terza conferma finale con digitazione
    const finalConfirm = prompt(
        '🔐 CONFERMA FINALE\n\n' +
        'Per procedere con il reset completo, digita esattamente:\n' +
        'RESET COMPLETO\n\n' +
        '(Maiuscole e minuscole contano)'
    );

    if (finalConfirm !== 'RESET COMPLETO') {
        showToast('❌ Reset annullato - Testo di conferma errato', 'warning');
        return;
    }

    try {
        // Mostra messaggio di elaborazione
        showToast('🔄 Esecuzione reset completo in corso...', 'warning');

        // Cancella tutti i dati dalle variabili
        songs = [];
        teams = [];
        participants = [];
        extractedSongs = [];

        // Cancella tutto dal localStorage
        localStorage.removeItem(CONFIG.STORAGE_KEY);
        localStorage.removeItem(CONFIG.EXTRACTIONS_KEY);
        localStorage.removeItem(CONFIG.PARTICIPANTS_KEY);
        localStorage.removeItem(CONFIG.TEAMS_KEY);

        // Cancella anche eventuali altri dati correlati
        const keysToRemove = [];
        for (let i = 0; i < localStorage.length; i++) {
            const key = localStorage.key(i);
            if (key && key.includes('pizzaKaraoke')) {
                keysToRemove.push(key);
            }
        }
        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Reset delle variabili di stato
        isExtracting = false;
        isAdminMode = false;
        showTeamView = true;

        // Aggiorna tutta l'interfaccia
        updateStats();
        updateSongsList();
        updateSongsTables();
        updateTeamsList();
        updateTeamSelect();
        updateParticipantsList();
        updateExtractedSongsTable();
        updateLeaderboard();

        // Reset del display dell'estrazione
        const songDisplay = document.getElementById('songDisplay');
        songDisplay.innerHTML = 'Applicazione resettata! Premi "Estrai Canzone" per iniziare!';

        // Nascondi tutte le sezioni di gestione
        hideAllManagementSections();

        // Reset dei pulsanti
        const extractBtn = document.getElementById('extractBtn');
        if (extractBtn) {
            extractBtn.disabled = false;
            extractBtn.textContent = '🎲 Estrai Canzone';
        }

        // Messaggio di successo
        setTimeout(() => {
            showToast(
                '✅ RESET COMPLETO ESEGUITO CON SUCCESSO!\n\n' +
                '🆕 L\'applicazione è stata completamente resettata.\n' +
                '📝 Puoi ora iniziare una nuova gara da zero.\n' +
                '💡 Aggiungi canzoni, squadre e partecipanti per iniziare!',
                'success'
            );
        }, 500);

    } catch (error) {
        console.error('Errore durante il reset completo:', error);
        showToast('❌ Errore durante il reset completo: ' + error.message, 'error');
    }
}

// Funzione helper per nascondere tutte le sezioni di gestione
function hideAllManagementSections() {
    const songManagement = document.getElementById('songManagement');
    const participantsManagement = document.getElementById('participantsManagement');

    if (songManagement) {
        songManagement.classList.remove('visible');
    }
    if (participantsManagement) {
        participantsManagement.classList.remove('visible');
    }

    // Reset dei pulsanti di gestione
    const songManagementBtn = document.getElementById('songManagementBtn');
    const participantsManagementBtn = document.getElementById('participantsManagementBtn');

    if (songManagementBtn) {
        songManagementBtn.textContent = '🎵 Gestisci Canzoni';
    }
    if (participantsManagementBtn) {
        participantsManagementBtn.textContent = '👥 Gestisci Partecipanti';
    }
}
