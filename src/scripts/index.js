const foundationsDisplay = Array.from(document.getElementsByClassName('foundations-pile'));
const wasteDisplay = document.querySelector('.waste-pile');
const stockDisplay = document.querySelector('.stock-pile');
const tableauDisplay = Array.from(document.getElementsByClassName('tableau-pile'));
const placeholders = Array.from(document.getElementsByClassName('placeholder'));
let deck = [];
let foundations = [[],[],[],[]];
let waste = [];
let stock = [];
let tableau = [];
let isLastTableauPileCard = true;
let selectedCard, selectedCardDisplay, cardIndex, originArray, destinationArray, originPileDisplay, destinationPileDisplay;


function createCards() {
    const suits = ['hearts', 'diamonds', 'spades', 'clubs'];

    suits.forEach(suit => {
        for (let i=0; i < 13; i++) {
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
}

function distributeCards() {
    for (let i=0; i < 7; i++) {
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

}


function alignTableauCards(tableauPile) {
    const tableauPileCards = Array.from(tableauPile.children);
    let zIndex = 1;
    let top = 0;
    tableauPileCards.forEach(card => {
        card.style.zIndex = zIndex;
        card.style.top = `${top}px`;
        zIndex++;
        top += 38;
    });
}


function updateCardsDisplay() {
    if (!isLastTableauPileCard) {
        const totalCards = originPileDisplay.children.length;
        for (let i = cardIndex; i < totalCards; i++) {
            destinationPileDisplay.appendChild(originPileDisplay.children[cardIndex]);
        }
    } else destinationPileDisplay.appendChild(selectedCardDisplay);

    if (destinationPileDisplay.classList.contains('tableau-pile')) {
        alignTableauCards(destinationPileDisplay);
    } else {
        selectedCardDisplay.style.zIndex = destinationArray.length;
        selectedCardDisplay.style.top = '0px';
    }

    if (originPileDisplay.children[cardIndex-1] && originPileDisplay.children[cardIndex-1].classList.contains('hidden')) {
        originPileDisplay.children[cardIndex-1].classList.remove('hidden');
        originPileDisplay.children[cardIndex-1].setAttribute('src', originArray[cardIndex-1].imageSrc);
    }
}


function updateArrays() {
    if (destinationPileDisplay.classList.contains('foundations-pile')) {
        const movedCard = originArray.pop();
        destinationArray.push(movedCard);
    } else if (destinationPileDisplay.classList.contains('tableau-pile')) {
        const amountMovedCards = originArray.length - cardIndex;
        const movedCards = originArray.splice(cardIndex, amountMovedCards);
        destinationArray.push(...movedCards);
    }
    updateCardsDisplay();
}


function turnStockCard() {
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
            foundationsDisplay.forEach(pile => pile.addEventListener('click', moveCard));
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
            selectedCardDisplay.classList.remove('card-active');
            selectedCardDisplay = null;
            isLastTableauPileCard = true;
            wasteDisplay.addEventListener('click', moveCard);
            stockDisplay.addEventListener('click', turnStockCard);
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
        originArray = tableau[pileIndex-6];
        cardIndex = Array.from(placeholders[pileIndex].children).findIndex(card => card === selectedCardDisplay);
    }
    
    selectedCard = originArray[cardIndex];
}


function findDestinationArray() {
    const pileIndex = placeholders.findIndex(placeholder => placeholder === destinationPileDisplay);

    if (pileIndex <= 3) destinationArray = foundations[pileIndex];
    else if (pileIndex === 4) destinationArray = waste;
    else if (pileIndex >= 6) destinationArray = tableau[pileIndex-6];
}


function isMoveValid() {
    const originLastCardIndex = originArray.length - 1;
    const destLastCard = destinationArray[destinationArray.length - 1];

    if (
        originPileDisplay.classList.contains('tableau-pile') && 
        selectedCardDisplay !== originPileDisplay.children[originLastCardIndex]
    ) isLastTableauPileCard = false;

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


function startGame() {
    createCards();
    shuffleCards();
    distributeCards();
    displayCards();
}
startGame();