// --- MODIFICATION DU 'WINDOW LOAD' ---
window.addEventListener('load', () => {
    const loader = document.getElementById('fake-loader');

    setTimeout(() => {
        loader.classList.add('loader-hidden');
        document.body.style.overflow = 'auto'; 
        loader.addEventListener('transitionend', () => {
           loader.remove(); 
        });
        
        // Lancer les deux scripts (Kanji + Yen)
        fetchRandomKanji();
        fetchYenRate(); // <--- On ajoute ça ici !

    }, 600); 

    // Clic sur le widget Kanji
    document.getElementById('jap-widget').addEventListener('click', fetchRandomKanji);
});

// --- API JAPONAISE + TRADUCTION FRANÇAISE ---

const kanjiApiBase = "https://kanjiapi.dev/v1/kanji";
const translateApiBase = "https://api.mymemory.translated.net/get";
let joyoList = []; 

async function fetchRandomKanji() {
    const widget = document.getElementById('jap-widget');
    const wordEl = document.getElementById('jp-word');
    const readEl = document.getElementById('jp-reading');
    const meanEl = document.getElementById('jp-meaning');

    // Animation de chargement
    widget.style.opacity = 0.7;
    wordEl.textContent = "...";
    readEl.textContent = "Chargement...";
    meanEl.textContent = "Traduction en cours...";
    
    try {
        // 1. Récupérer la liste des Kanji (si vide)
        if (joyoList.length === 0) {
            const response = await fetch(`${kanjiApiBase}/joyo`);
            joyoList = await response.json();
        }

        // 2. Choisir un Kanji au hasard
        const randomKanji = joyoList[Math.floor(Math.random() * joyoList.length)];

        // 3. Récupérer les détails (Anglais)
        const detailResponse = await fetch(`${kanjiApiBase}/${randomKanji}`);
        const data = await detailResponse.json();

        // 4. Préparer le mot anglais pour la traduction
        // L'API donne souvent "tree; wood". On ne garde que le premier mot "tree" pour que la traduction soit propre.
        let englishWord = data.meanings[0].split(';')[0]; 

        // 5. TRADUCTION via MyMemory (Anglais -> Français)
        const transUrl = `${translateApiBase}?q=${englishWord}&langpair=en|fr`;
        const transResponse = await fetch(transUrl);
        const transData = await transResponse.json();
        
        // Si la traduction marche, on la prend, sinon on garde l'anglais
        let frenchWord = transData.responseData.translatedText || englishWord;

        // --- AFFICHAGE ---
        widget.style.opacity = 1;
        wordEl.textContent = data.kanji;

        // Lecture (On privilégie le Kunyomi/Hiragana)
        let reading = "";
        if (data.kun_readings.length > 0) {
            reading = data.kun_readings[0];
        } else if (data.on_readings.length > 0) {
            reading = data.on_readings[0];
        }
        readEl.textContent = reading;

        // Signification en Français (1ère lettre majuscule)
        meanEl.textContent = frenchWord.charAt(0).toUpperCase() + frenchWord.slice(1).toLowerCase();

    } catch (error) {
        console.error("Erreur:", error);
        wordEl.textContent = "Error";
        readEl.textContent = "";
        meanEl.textContent = "Réessayer...";
        widget.style.opacity = 1;
    }
}

// --- TAUX DE CHANGE (EUR -> JPY) ---

async function fetchYenRate() {
    const rateEl = document.getElementById('yen-rate');
    
    try {
        // Appel à l'API gratuite Frankfurter
        const response = await fetch('https://api.frankfurter.app/latest?from=EUR&to=JPY');
        const data = await response.json();
        
        // On récupère le taux
        const rate = data.rates.JPY;
        
        // On l'affiche (avec 2 chiffres après la virgule)
        rateEl.textContent = rate.toFixed(2);
        
        // Petit effet couleur : Vert si le Yen est fort (faible pour nous), Rouge sinon ? 
        // Pour l'instant on laisse en violet (accent-color) via le CSS.
        
    } catch (error) {
        console.error("Erreur Taux:", error);
        rateEl.textContent = "---";
    }
}

// --- HEURE DE TOKYO ---

function updateTokyoTime() {
    const timeEl = document.getElementById('jp-time');
    const now = new Date();
    timeEl.textContent = now.toLocaleTimeString('fr-FR', { 
        timeZone: 'Asia/Tokyo', 
        hour: '2-digit', 
        minute: '2-digit', 
        second: '2-digit' 
    });
}
setInterval(updateTokyoTime, 1000);
updateTokyoTime(); // Lancer tout de suite

const musicBtn = document.getElementById('musicBtn');
const audio = document.getElementById('myAudio');
const volumeSlider = document.getElementById('volumeSlider');
const volumeValue = document.getElementById('volumeValue');
const volumeColor = document.getElementsByClassName('volumeColor');

musicBtn.addEventListener('click', () => {
    if (audio.paused) {
        audio.play();
        musicBtn.textContent = "Pause ⏸";
    } else {
        audio.pause();
        musicBtn.textContent = "Jouer la musique ♫";
    }
});
// le volume par défaut (0.5 = 50%)
audio.volume = volumeSlider.value;

volumeSlider.addEventListener('input', (e) => {
    audio.volume = e.target.value;
    const percentage = Math.round(e.target.value * 100);
    volumeValue.textContent = `${percentage}%`;
    volumeColor[0].style.color = `color-mix(in srgb, violet ${percentage}%, white ${100 - percentage}%)`;
});