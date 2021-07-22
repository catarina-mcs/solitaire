const foundationsDisplay = Array.from(document.getElementsByClassName('foundations-pile'));
const wasteDisplay = document.querySelector('.waste-pile');
const stockDisplay = document.querySelector('.stock-pile');
const tableauDisplay = Array.from(document.getElementsByClassName('tableau-pile'));
const placeholders = Array.from(document.getElementsByClassName('placeholder'));
const hiddenCards = document.getElementsByClassName('hidden');
const btnUndo = document.getElementById('btn-undo');
const btnPauseStart = document.getElementById('btn-pause-start');
const btnRestart = document.getElementById('btn-restart');
const btnNewGame = document.getElementById('btn-new-game');
let deck = [];
let foundations = [[],[],[],[]];
let waste = [];
let stock = [];
let tableau = [];
let isLastTableauPileCard = true;
let score, moves, seconds, minutes, clock, thisGameDeck, stopLoop;
let selectedCard, selectedCardDisplay, cardIndex, originArray, destinationArray, originPileDisplay, destinationPileDisplay, amountMovedCards, lastMove, lastMovedCard, prevCardHidden;


btnUndo.addEventListener('click', undoLastMove);
btnPauseStart.addEventListener('click', pauseStartGame);
btnRestart.addEventListener('click', restartGame);
btnNewGame.addEventListener('click', startGame);

function startGame() {
    score = 0;
    moves = 0;
    seconds = 0;
    minutes = 0;
    clearInterval(clock);
    createCards();
    shuffleCards();
    distributeCards(deck);
    displayCards();
}
startGame();

function restartGame() {
    score = 0;
    moves = 0;
    seconds = 0;
    minutes = 0;
    clearInterval(clock);
    distributeCards(thisGameDeck);
    displayCards();
}


function createCards() {
    const suits = ['hearts', 'diamonds', 'spades', 'clubs'];

    suits.forEach(suit => {
        for (let i = 0; i < 13; i++) {
            deck.push({
                suit: suit,
                value: i+1,
                color: (suit === 'hearts' || suit === 'diamonds') ? 'red' : 'black',
                imageSrc: `./images/deck/${suit}-${i+1}.png`
            });
        }
    });
}


function shuffleCards() {
    deck.forEach((_, i) => {
        const randomNum = Math.floor(Math.random() * deck.length);
        let temp;
        
        temp = deck[randomNum];
        deck[randomNum] = deck[i];
        deck[i] = temp;
    });

    thisGameDeck = deck.map(card => card);
}


function distributeCards(cards) {
    foundations = [[],[],[],[]];
    waste = [];
    stock = [];
    tableau = [];

    for (let i = 0; i < 7; i++) {
        tableau.push(cards.splice(0, i+1));
    }
        
    stock = (cards.splice(0, cards.length));
    stock.forEach(card => {
        card.position = 'stock';
    });
}


function displayCards() {
    tableau.forEach((pile, i) => {
        let tableauPileHtml = '';
        pile.forEach((card,j) => {
            tableauPileHtml += (j === pile.length - 1) ?
                `<img src="${card.imageSrc}" class="card"/>` :
                '<img src="./images/card-back.png" class="card hidden"/>';
        });
        tableauDisplay[i].innerHTML = tableauPileHtml;
        alignTableauCards(tableauDisplay[i]);
        tableauDisplay[i].addEventListener('click', moveCard);
    });

    stockDisplay.innerHTML = '<img src="./images/card-back.png" class="card"/>';
    stockDisplay.addEventListener('click', turnStockCard);

    wasteDisplay.innerHTML = '';

    foundationsDisplay.forEach(pile => {
        pile.innerHTML = '';
        pile.addEventListener('click', moveCard);
    });
}


function alignTableauCards(tableauPile) {
    const tableauPileCards = Array.from(tableauPile.children);
    let zIndex = 1;
    let top = 0;
    tableauPileCards.forEach(card => {
        card.style.zIndex = zIndex;
        card.style.top = `${top}px`;
        zIndex++;
        top += 30;
    });
}


function updateCardsDisplay() {
    if (!isLastTableauPileCard) {
        for (let i = 0; i < amountMovedCards; i++) {
            destinationPileDisplay.appendChild(originPileDisplay.children[cardIndex]);
        }
    } else destinationPileDisplay.appendChild(selectedCardDisplay);

    if (destinationPileDisplay.classList.contains('tableau-pile')) {
        alignTableauCards(destinationPileDisplay);
    } else {
        selectedCardDisplay.style.zIndex = destinationArray.length;
        selectedCardDisplay.style.top = '0px';
    }

    if (originPileDisplay.children[cardIndex - 1] && originPileDisplay.children[cardIndex - 1].classList.contains('hidden')) {
        originPileDisplay.children[cardIndex - 1].classList.remove('hidden');
        originPileDisplay.children[cardIndex - 1].setAttribute('src', originArray[cardIndex - 1].imageSrc);
        prevCardHidden = true;
    } else prevCardHidden = false;
}


function updateArrays() {
    if (destinationPileDisplay.classList.contains('foundations-pile')) {
        amountMovedCards = originArray.length - cardIndex;
        const movedCard = originArray.pop();
        destinationArray.push(movedCard);
    } else if (destinationPileDisplay.classList.contains('tableau-pile')) {
        amountMovedCards = originArray.length - cardIndex;
        const movedCards = originArray.splice(cardIndex, amountMovedCards);
        destinationArray.push(...movedCards);
    }
    updateCardsDisplay();
}


function turnStockCard() {
    btnUndo.addEventListener('click', undoLastMove);
    lastMove = 'turn stock card';
    moves ++;
    startClock();

    if (selectedCardDisplay) {
        selectedCardDisplay.classList.remove('card-active');
        selectedCardDisplay = null;
    }

    wasteDisplay.addEventListener('click', moveCard);
    if (stock.length > 0) {
        const turnedCard = stock.pop();
        waste.push(turnedCard);
        const cardImg = document.createElement('img');
        cardImg.setAttribute('src', turnedCard.imageSrc);
        cardImg.classList.add('card');
        cardImg.style.zIndex = waste.length;
        wasteDisplay.appendChild(cardImg);
        (stock.length === 0 && waste.length !== 0) && (stockDisplay.innerHTML = '↻') ;
        (stock.length === 0 && waste.length === 0) && (stockDisplay.innerHTML = '') ;
    } else if (stock.length === 0) {
        waste.forEach(card => stock.unshift(card));
        waste = [];
        stockDisplay.innerHTML = '<img src="./images/card-back.png" class="card"/>';
        wasteDisplay.innerHTML = '';
        wasteDisplay.removeEventListener('click', moveCard);
    }
}


function moveCard(e) {
    if (!selectedCardDisplay) {
        if (e.target.classList.contains('card') && !e.target.classList.contains('hidden')) {
            selectedCardDisplay = e.target;
            selectedCardDisplay.classList.add('card-active');
            originPileDisplay = e.target.parentNode;
            findSelectedCard();
        } else console.log('select a valid card');
        return;
    }

    if (selectedCardDisplay) {
        if (e.target === selectedCardDisplay) {
            selectedCardDisplay.classList.remove('card-active');
            selectedCardDisplay = null;
            return;
        }
        
        destinationPileDisplay = e.target.classList.contains('card') ? e.target.parentNode : e.target;
        findDestinationArray();
        
        if (isMoveValid()) {
            updateArrays();
            updateScore('make move');
            moves ++;
            startClock();
            btnUndo.addEventListener('click', undoLastMove);
            lastMove = 'move card';
            lastMovedCard = selectedCardDisplay;
            selectedCardDisplay.classList.remove('card-active');
            selectedCardDisplay = null;
            gameIsWon();
        } else if (e.target.classList.contains('card') && !e.target.classList.contains('hidden')) {
            selectedCardDisplay.classList.remove('card-active');
            selectedCardDisplay = e.target;
            selectedCardDisplay.classList.add('card-active');
            originPileDisplay = e.target.parentNode;
            findSelectedCard();
        } else console.log('move not valid');
    }
}


function findSelectedCard() {
    const pileIndex = placeholders.findIndex(placeholder => placeholder === originPileDisplay);

    if (pileIndex <= 3) {
        originArray = foundations[pileIndex];
        cardIndex = originArray.length - 1;
    } else if (pileIndex === 4) {
        originArray = waste;
        cardIndex = originArray.length - 1;
    } else if (pileIndex >= 6) {
        originArray = tableau[pileIndex - 6];
        cardIndex = Array.from(placeholders[pileIndex].children).findIndex(card => card === selectedCardDisplay);
    }
    
    selectedCard = originArray[cardIndex];
}


function findDestinationArray() {
    const pileIndex = placeholders.findIndex(placeholder => placeholder === destinationPileDisplay);

    if (pileIndex <= 3) destinationArray = foundations[pileIndex];
    else if (pileIndex === 4) destinationArray = waste;
    else if (pileIndex >= 6) destinationArray = tableau[pileIndex - 6];
}


function isMoveValid() {
    const originLastCardIndex = originArray.length - 1;
    const destLastCard = destinationArray[destinationArray.length - 1];

    if (
        originPileDisplay.classList.contains('tableau-pile') && 
        selectedCardDisplay !== originPileDisplay.children[originLastCardIndex]
    ) isLastTableauPileCard = false;
    else isLastTableauPileCard = true;

    if (destinationPileDisplay.classList.contains('tableau-pile')) {
        if (destinationArray.length === 0 && selectedCard.value === 13) return true;
        else if (destLastCard && selectedCard.color !== destLastCard.color && selectedCard.value === destLastCard.value - 1) return true;
        else return false;
    } else if (destinationPileDisplay.classList.contains('foundations-pile')) {
        if (!isLastTableauPileCard) return false;
        else if (destinationArray.length === 0 && selectedCard.value === 1) return true;
        else if (destLastCard && selectedCard.suit === destLastCard.suit && selectedCard.value === destLastCard.value + 1) return true;
        else return false;
    }
}


function undoLastMove() {
    if (lastMove === 'turn stock card') {
        stock.push(waste.pop());
        if (wasteDisplay.children.length > 0) wasteDisplay.removeChild(wasteDisplay.children[wasteDisplay.children.length - 1]);
        if (stock.length === 1) stockDisplay.innerHTML = '<img src="./images/card-back.png" class="card"/>';
    } else if (lastMove === 'move card') {
        if (originPileDisplay.classList.contains('foundations-pile') || originPileDisplay.classList.contains('waste-pile')) {
            originArray.push(destinationArray.pop());
            originPileDisplay.appendChild(lastMovedCard);
            lastMovedCard.style.zIndex = originArray.length;
            lastMovedCard.style.top = '0px';
        } else if (originPileDisplay.classList.contains('tableau-pile')) {
            const movedCardIndex = destinationArray.length - amountMovedCards;
            originArray.push(...destinationArray.splice(movedCardIndex, amountMovedCards));
            for (let i = 0; i < amountMovedCards; i++) {
                originPileDisplay.appendChild(destinationPileDisplay.children[movedCardIndex]);
            }
            if (prevCardHidden) {
                originPileDisplay.children[cardIndex - 1].classList.add('hidden');
                originPileDisplay.children[cardIndex - 1].setAttribute('src', './images/card-back.png');
            }
            alignTableauCards(originPileDisplay);
        }
    }
    updateScore('undo move');
    btnUndo.removeEventListener('click', undoLastMove);
}


function gameIsWon() {
    if (foundations.every(pile => pile.length === 13)) {
        console.log('you won the game');
        clearInterval(clock);
    } else if (hiddenCards.length === 0 && stock.length === 0 && waste.length === 0) automateMoves();
}


function automateMoves() {
    let intervalId = setInterval(() => {
        for (let i = 0 ; i < tableau.length; i++) {  // tableau.forEach((tableauPile, i) => {
            stopLoop = false;
            for (let j = 0; j < foundations.length; j++) { // foundations.forEach((foundationsPile, j) => {
                const lastTCardIndex = tableau[i].length - 1;
                const lastFCardIndex = foundations[j] ? foundations[j].length - 1 : 0;

                if (tableau[i].length > 0 && tableau[i][lastTCardIndex].value === 1 && foundations[j].length === 0) {
                    const cardToMove = tableauDisplay[i].children[lastTCardIndex];
                    foundationsDisplay[j].appendChild(cardToMove);
                    cardToMove.style.top = '0px';
                    cardToMove.style.zIndex = foundationsDisplay[j].children.length;
                    foundations[j].push(tableau[i].pop());
                    stopLoop = true;
                    console.log('here');
                    break;
                } else if (
                    tableau[i].length > 0 &&
                    (tableau[i][lastTCardIndex].suit === foundations[j][lastFCardIndex].suit &&
                    tableau[i][lastTCardIndex].value === foundations[j][lastFCardIndex].value + 1)
                ) {
                    const cardToMove = tableauDisplay[i].children[lastTCardIndex];
                    foundationsDisplay[j].appendChild(cardToMove);
                    cardToMove.style.top = '0px';
                    cardToMove.style.zIndex = foundationsDisplay[j].children.length;
                    foundations[j].push(tableau[i].pop());
                    stopLoop = true;
                    break;
                }
            }
            if (stopLoop) break;
        }
        if (foundations.every(pile => pile.length === 13)) {
            clearInterval(intervalId);
            clearInterval(clock);
        }
    }, 400);
}


function updateScore(action) {
    if (action === 'make move') {
        if (prevCardHidden) score += 5;
        if (originPileDisplay.classList.contains('waste-pile') && destinationPileDisplay.classList.contains('tableau-pile')) score += 5;
        if (originPileDisplay.classList.contains('foundations-pile') && destinationPileDisplay.classList.contains('tableau-pile')) score -= 15;
        if (
            (originPileDisplay.classList.contains('waste-pile') || originPileDisplay.classList.contains('tableau-pile')) &&
            destinationPileDisplay.classList.contains('foundations-pile')
        ) score += 10;
    } else if (action === 'undo move' && lastMove === 'move card') {
        if (prevCardHidden) score -= 5;
        if (originPileDisplay.classList.contains('waste-pile') && destinationPileDisplay.classList.contains('tableau-pile')) score -= 5;
        if (originPileDisplay.classList.contains('foundations-pile') && destinationPileDisplay.classList.contains('tableau-pile')) score += 15;
        if (
            (originPileDisplay.classList.contains('waste-pile') || originPileDisplay.classList.contains('tableau-pile')) &&
            destinationPileDisplay.classList.contains('foundations-pile')
        ) score -= 10;
    }
}


function pauseStartGame() {
    if (btnPauseStart.textContent === 'Pause') {
        clearInterval(clock);
        btnPauseStart.textContent = 'Start';
        foundationsDisplay.forEach(pile => pile.removeEventListener('click', moveCard));
        tableauDisplay.forEach(pile => pile.removeEventListener('click', moveCard));
        wasteDisplay.removeEventListener('click', moveCard);
        stockDisplay.removeEventListener('click', turnStockCard);
    } else if (btnPauseStart.textContent === 'Start') {
        clock = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                minutes ++;
                seconds = 0;
            }
            console.log(`${minutes}:${seconds}`);
        }, 1000);
        btnPauseStart.textContent = 'Pause';
        foundationsDisplay.forEach(pile => pile.addEventListener('click', moveCard));
        tableauDisplay.forEach(pile => pile.addEventListener('click', moveCard));
        waste.length > 0 && wasteDisplay.addEventListener('click', moveCard);
        stockDisplay.addEventListener('click', turnStockCard);
    }
}


function startClock() {
    if (moves === 1) {
        clock = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                minutes ++;
                seconds = 0;
            }
            console.log(`${minutes}:${seconds}`);
        }, 1000);
    }
}