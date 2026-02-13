window.addEventListener('load', () => {
    const loader = document.getElementById('fake-loader');
    const body = document.body;

    // Temps total de l'animation des lignes (0.5 + 0.8 + 0.5 = 1.8s)
    // On attend 2000ms pour être sûr que ça a bien fini
    setTimeout(() => {
        loader.classList.add('loader-hidden');
        body.style.overflow = 'auto'; 
        loader.addEventListener('transitionend', () => {
            loader.remove(); 
        });
    }, 600); // 600ms pour laisser le temps aux lignes de commencer leur animation
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

// Lancement au démarrage
window.addEventListener('load', () => {
    const loader = document.getElementById('fake-loader');
    
    // On attend que le loader principal disparaisse avant de charger le mot
    // pour ne pas ralentir l'animation du début
    setTimeout(() => {
        fetchRandomKanji();
    }, 2000); 

    // Changement au clic
    document.getElementById('jap-widget').addEventListener('click', fetchRandomKanji);
});
