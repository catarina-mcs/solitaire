const gameArea = document.querySelector('.game-area');
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
const minutesDisplay = document.getElementById('minutes');
const secondsDisplay = document.getElementById('seconds');
const scoreDisplay = document.getElementById('score');
const movesDisplay = document.getElementById('moves');
const winningMessage = document.querySelector('.winning-message');
let deck = [];
let foundations, waste, stock, tableau;
let isLastTableauPileCard = true;
let longestPileLength = 0;
let score, moves, seconds, minutes, clock, thisGameDeck, stopLoop, stockHasOneRound;
let selectedCard, selectedCardDisplay, cardIndex, undoCardIndex, originArray, undoOriginArray, destinationArray, originPileDisplay, undoOriginPileDisplay, destinationPileDisplay, amountMovedCards, lastMove, lastMovedCard, prevCardHidden;


btnPauseStart.addEventListener('click', pauseStartGame);
btnRestart.addEventListener('click', restartGame);
btnNewGame.addEventListener('click', startGame);

function reset() {
    foundations = [[],[],[],[]];
    waste = [];
    stock = [];
    tableau = [];
    minutes = 0;
    seconds = 0;
    score = 0;
    moves = 0;
    stockHasOneRound = false;
    minutesDisplay.textContent = '00';
    secondsDisplay.textContent = '00';
    scoreDisplay.textContent = '0';
    movesDisplay.textContent = '0';
    foundationsDisplay.forEach(pile => pile.style.cursor = 'default');
    tableauDisplay.forEach(pile => pile.style.cursor = 'default');
    gameArea.style.marginBottom = '42px';
    winningMessage.style.display = 'none';
    btnUndo.classList.add('inactive');
}

function startGame() {
    reset();
    clearInterval(clock);
    createCards();
    shuffleCards();
    distributeCards();
    displayCards();
}
startGame();

function restartGame() {
    reset();
    clearInterval(clock);
    distributeCards();
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


function distributeCards() {
    deck = thisGameDeck.map(card => card);

    for (let i = 0; i < 7; i++) {
        tableau.push(deck.splice(0, i+1));
    }
        
    stock = (deck.splice(0, deck.length));
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
        if (!card.classList.contains('hidden')) top += 30
        else top += 20;
    });

    if (tableauPileCards.length > longestPileLength && tableauPileCards.length > 5) {
        longestPileLength = tableauPileCards.length;
        gameArea.style.marginBottom = `${(30 * (longestPileLength - 6)) + 150 + 42}px`; 
    }
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
    btnUndo.classList.remove('inactive');
    lastMove = 'turn stock card';
    moves ++;
    movesDisplay.textContent = moves;
    moves === 1 && startClock();
    
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
        if (stock.length === 0 && waste.length !== 0) {
            (stockDisplay.innerHTML = '↻');
            stockHasOneRound = true;
        }
        (stock.length === 0 && waste.length === 0) && (stockDisplay.innerHTML = '');
    } else if (stock.length === 0) {
        waste.forEach(card => stock.unshift(card));
        waste = [];
        if (stock.length > 0) {
            stockDisplay.innerHTML = '<img src="./images/card-back.png" class="card"/>';
            stockHasOneRound = false;
        } 
        wasteDisplay.innerHTML = '';
        wasteDisplay.removeEventListener('click', moveCard);
    }
}


function moveCard(e) {
    if (!selectedCardDisplay) {
        if (e.target.classList.contains('card') && !e.target.classList.contains('hidden')) {
            selectedCardDisplay = e.target;
            selectedCardDisplay.classList.add('card-active');
            undoOriginPileDisplay = originPileDisplay;
            undoOriginArray = originArray;
            undoCardIndex = cardIndex;
            originPileDisplay = e.target.parentNode;
            findSelectedCard();
            foundationsDisplay.forEach(pile => pile.style.cursor = 'pointer');
            tableauDisplay.forEach(pile => pile.style.cursor = 'pointer');
        }
        return;
    }

    if (selectedCardDisplay) {
        
        if (e.target === selectedCardDisplay) {
            selectedCardDisplay.classList.remove('card-active');
            selectedCardDisplay = null;
            foundationsDisplay.forEach(pile => pile.style.cursor = 'default');
            tableauDisplay.forEach(pile => pile.style.cursor = 'default');
            return;
        }
        
        destinationPileDisplay = e.target.classList.contains('card') ? e.target.parentNode : e.target;
        findDestinationArray();
        
        if (isMoveValid()) {
            updateArrays();
            updateScore('make move');
            moves ++;
            movesDisplay.textContent = moves;
            moves === 1 && startClock();
            foundationsDisplay.forEach(pile => pile.style.cursor = 'default');
            tableauDisplay.forEach(pile => pile.style.cursor = 'default');
            btnUndo.addEventListener('click', undoLastMove);
            btnUndo.classList.remove('inactive');
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
        }
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
        if (waste.length === 0) {
            stock.forEach(card => waste.unshift(card));
            stock = [];
            let wasteInnerHtml = '';
            waste.forEach((card, i) => {
                wasteInnerHtml += `<img src="${card.imageSrc}" class="card" style="z-index: ${i + 1};"/>`
            })
            wasteDisplay.innerHTML = wasteInnerHtml;
            wasteDisplay.addEventListener('click', moveCard);
            stockDisplay.innerHTML = '↻';
        } else if (stock.length === 1 && stockHasOneRound) {
            wasteDisplay.innerHTML = '';
            stockDisplay.innerHTML = '<img src="./images/card-back.png" class="card"/>';
        } else if (waste.length > 0) {
            stock.push(waste.pop());
            wasteDisplay.removeChild(wasteDisplay.children[wasteDisplay.children.length - 1]);
            if (stock.length === 1) stockDisplay.innerHTML = '<img src="./images/card-back.png" class="card"/>';
        }
    } else if (lastMove === 'move card') {
        if (undoOriginPileDisplay.classList.contains('foundations-pile') || undoOriginPileDisplay.classList.contains('waste-pile')) {
            undoOriginArray.push(destinationArray.pop());
            undoOriginPileDisplay.appendChild(lastMovedCard);
            lastMovedCard.style.zIndex = undoOriginArray.length;
            lastMovedCard.style.top = '0px';
        } else if (undoOriginPileDisplay.classList.contains('tableau-pile')) {
            const movedCardIndex = destinationArray.length - amountMovedCards;
            undoOriginArray.push(...destinationArray.splice(movedCardIndex, amountMovedCards));
            for (let i = 0; i < amountMovedCards; i++) {
                undoOriginPileDisplay.appendChild(destinationPileDisplay.children[movedCardIndex]);
            }
            if (prevCardHidden) {
                undoOriginPileDisplay.children[undoCardIndex - 1].classList.add('hidden');
                undoOriginPileDisplay.children[undoCardIndex - 1].setAttribute('src', './images/card-back.png');
            }
            alignTableauCards(undoOriginPileDisplay);
        }
    }
    updateScore('undo move');
    if (moves > 0) {
        btnUndo.removeEventListener('click', undoLastMove);
        btnUndo.classList.add('inactive');
    }
    foundationsDisplay.forEach(pile => pile.style.cursor = 'default');
    tableauDisplay.forEach(pile => pile.style.cursor = 'default');
}


function gameIsWon() {
    if (foundations.every(pile => pile.length === 13)) {
        showWinningMessage();
        clearInterval(clock);
    } else if (hiddenCards.length === 0 && stock.length === 0 && waste.length === 0) automateMoves();
}


function automateMoves() {
    let lastTableauIndex = -1;
    let intervalId = setInterval(() => {
        for (let i = 0 ; i < tableau.length; i++) {
            stopLoop = false;
            if (i == lastTableauIndex + 1 || (i == 0 && lastTableauIndex == tableau.length - 1) || lastTableauIndex == -1) {
                for (let j = 0; j < foundations.length; j++) {
                    const lastTCardIndex = tableau[i].length - 1;
                    const lastFCardIndex = foundations[j].length - 1;
    
                    if (tableau[i].length > 0 && tableau[i][lastTCardIndex].value === 1 && foundations[j].length === 0) {
                        const cardToMove = tableauDisplay[i].children[lastTCardIndex];
                        foundationsDisplay[j].appendChild(cardToMove);
                        cardToMove.style.top = '0px';
                        cardToMove.style.zIndex = foundationsDisplay[j].children.length;
                        foundations[j].push(tableau[i].pop());
                        stopLoop = true;
                        score += 10;
                        moves++;
                        scoreDisplay.textContent = score;
                        movesDisplay.textContent = moves;
                        break;
                    } else if (
                        tableau[i].length > 0 && foundations[j].length > 0 &&
                        (tableau[i][lastTCardIndex].suit === foundations[j][lastFCardIndex].suit &&
                        tableau[i][lastTCardIndex].value === foundations[j][lastFCardIndex].value + 1)
                    ) {
                        const cardToMove = tableauDisplay[i].children[lastTCardIndex];
                        foundationsDisplay[j].appendChild(cardToMove);
                        cardToMove.style.top = '0px';
                        cardToMove.style.zIndex = foundationsDisplay[j].children.length;
                        foundations[j].push(tableau[i].pop());
                        stopLoop = true;
                        score += 10;
                        moves++;
                        scoreDisplay.textContent = score;
                        movesDisplay.textContent = moves;
                        break;
                    } 
                }
                lastTableauIndex = i;
            }
            if (stopLoop) break;
        }
        if (foundations.every(pile => pile.length === 13)) {
            clearInterval(intervalId);
            clearInterval(clock);
            showWinningMessage();
        }
    }, 100);
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

    scoreDisplay.textContent = score;
}


function pauseStartGame() {
    if (btnPauseStart.classList.contains('pause') && moves > 0) {
        clearInterval(clock);
        btnPauseStart.classList.remove('pause');
        btnPauseStart.classList.add('play');
        btnPauseStart.setAttribute('src', './images/play-btn.svg');
        foundationsDisplay.forEach(pile => pile.removeEventListener('click', moveCard));
        tableauDisplay.forEach(pile => pile.removeEventListener('click', moveCard));
        wasteDisplay.removeEventListener('click', moveCard);
        stockDisplay.removeEventListener('click', turnStockCard);
    } else if (btnPauseStart.classList.contains('play')) {
        clock = setInterval(() => {
            seconds++;
            if (seconds === 60) {
                minutes ++;
                seconds = 0;
            }
            minutesDisplay.textContent = minutes >= 10 ? minutes : `0${minutes}`;
            secondsDisplay.textContent = seconds >= 10 ? seconds : `0${seconds}`;
        }, 1000);
        btnPauseStart.classList.remove('play');
        btnPauseStart.classList.add('pause');
        btnPauseStart.setAttribute('src', './images/pause-btn.svg');
        foundationsDisplay.forEach(pile => pile.addEventListener('click', moveCard));
        tableauDisplay.forEach(pile => pile.addEventListener('click', moveCard));
        waste.length > 0 && wasteDisplay.addEventListener('click', moveCard);
        stockDisplay.addEventListener('click', turnStockCard);
    }
}


function startClock() {
    clock = setInterval(() => {
        seconds++;
        if (seconds === 60) {
            minutes ++;
            seconds = 0;
        }
        minutesDisplay.textContent = minutes >= 10 ? minutes : `0${minutes}`;
        secondsDisplay.textContent = seconds >= 10 ? seconds : `0${seconds}`;
    }, 1000);
}


function showWinningMessage() {
    gameArea.style.marginBottom = '42px';
    winningMessage.style.display = 'block';
    winningMessage.innerHTML = `
        <h3 class="congrats"> Congratulations, you won! </h3>
        <div class="stats"> 
            <span>${minutesDisplay.textContent}:${secondsDisplay.textContent}</span>
            <span>|</span>
            <span>${score} points</span>
            <span>|</span>
            <span>${moves} moves</span>
        </div>
        <button class="btn btn-popup" id="btn-play-again">Play Again</button>
    `;
    document.getElementById('btn-play-again').addEventListener('click', startGame);
}