const foundationsDisplay = document.querySelectorAll('.foundations-pile');
const wasteDisplay = document.querySelector('.waste-pile');
const stockDisplay = document.querySelector('.stock-pile');
const tableauDisplay = document.querySelectorAll('.tableau-pile');
let deck = [];
let foundations = [[],[],[],[]];
let waste = [];
let stock = [];
let tableau = [];

function createCards() {
    const suits = ['hearts', 'diamonds', 'spades', 'clubs'];

    suits.forEach(suit => {
        for (let i=0; i < 13; i++) {
            deck.push({
                suit: suit,
                value: i+1,
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

    // console.log(deck);
}

function distributeCards() {
    for (let i=0; i < 7; i++) {
        tableau.push(deck.splice(0, i+1));
        tableau[i].forEach(card => {
            card.position = 'tableau',
            card.pile = i+1;
        });
    }
        
    stock = (deck.splice(0, deck.length));
    stock.forEach(card => {
        card.position = 'stock';
    });
}

function displayCards() {
    tableau.forEach((pile, i) => {
        let zIndex = 0;
        let topDistance = 0;
        let tableauHtml = '';
        pile.forEach(card => {
            tableauHtml += `<img src="${card.imageSrc}" class="card"/>`;
        });
        tableauDisplay[i].innerHTML = tableauHtml;
        Array.from(tableauDisplay[i].children).forEach(card => {
            card.style.zIndex = zIndex;
            card.style.top = `${topDistance}px`;
            zIndex++;
            topDistance += 38;
        });
    });

    const card = stock[stock.length-1];
    stockDisplay.innerHTML = `<img src="${card.imageSrc}" class="card"/>`;

    console.log(tableau);
    console.log(stock);
}

createCards();
shuffleCards();
distributeCards();
displayCards();