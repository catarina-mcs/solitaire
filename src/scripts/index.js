function createCards() {
    const suits = ['hearts', 'diamonds', 'spades', 'clubs'];
    let deck = [];

    suits.forEach(suit => {
        for (let i=0; i < 13; i++) {
            deck.push({
                suit: suit,
                value: i,
                imageSrc: `./images/deck/${suit}-${i}`
            });
        }
    });
}
createCards();