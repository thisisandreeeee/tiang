const { contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Cards = contract.fromArtifact("CardsMock");

describe('Cards', function () {
    let cards;
    let cardsInstance;

    beforeEach(async function () {
        cardsInstance = await Cards.new();
        cards = await cardsInstance.newCards();
    });

    it("reverts if value not in range", async function () {
        expectRevert(await cardsInstance.drawOpeningCards(cards, 1, 13), "value2 not in range");
    });

    it("opening and final cards set correctly", async function () {
        cards = await cardsInstance.drawOpeningCards(cards, 1, 10);
        expect(await cardsInstance.hasOpeningCards(cards)).to.be.true;
        expect(await cardsInstance.hasFinalCard(cards)).to.be.false;
        expect(cards.first.value).to.be.bignumber.equal("1");
        expect(cards.second.value).to.be.bignumber.equal("10");

        cards = await cardsInstance.drawFinalCard(cards, 5);
        expect(await cardsInstance.hasFinalCard(cards)).to.be.true;
        expect(cards.third.value).to.be.bignumber.equal("5");
    });

    it("reverts when drawing cards twice", async function () {
        cards = await cardsInstance.drawOpeningCards(cards, 1, 2);
        await expectRevert(cardsInstance.drawOpeningCards(cards, 1, 2), "already have opening cards");

        cards = await cardsInstance.drawFinalCard(cards, 3);
        await expectRevert(cardsInstance.drawFinalCard(cards, 3), "already have final card");
    });

    it("reverts when drawing final card without opening cards", async function () {
        await expectRevert(cardsInstance.drawFinalCard(cards, 1), "must have opening cards");
    });

    it("returns Unknown result without enough cards", async function () {
        let result = await cardsInstance.result(cards);
        expect(result.toNumber()).to.equal(0); // 0 is enum `Unknown`

        cards = await cardsInstance.drawOpeningCards(cards, 1, 2);
        result = await cardsInstance.result(cards);
        expect(result.toNumber()).to.equal(0); // 0 is enum `Unknown`
    });

    it("returns Inside result correctly", async function () {
        cards = await cardsInstance.drawOpeningCards(cards, 1, 10);
        cards = await cardsInstance.drawFinalCard(cards, 5);
        let result = await cardsInstance.result(cards);
        expect(result.toNumber()).to.equal(1); // 1 is enum `Inside`
    });

    it("returns Outside result correctly", async function () {
        cards = await cardsInstance.drawOpeningCards(cards, 1, 10);
        cards = await cardsInstance.drawFinalCard(cards, 11);
        let result = await cardsInstance.result(cards);
        expect(result.toNumber()).to.equal(2); // 2 is enum `Outside`
    });

    it("returns Equal result correctly", async function () {
        cards = await cardsInstance.drawOpeningCards(cards, 1, 10);
        cards = await cardsInstance.drawFinalCard(cards, 10);
        let result = await cardsInstance.result(cards);
        expect(result.toNumber()).to.equal(3); // 3 is enum `Equal`
    });
});
