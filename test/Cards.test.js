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
        expectRevert(await cardsInstance.setOpeningCards(cards, 1, 13), "value2 not in range");
    });

    it("opening and final cards set correctly", async function () {
        cards = await cardsInstance.setOpeningCards(cards, 1, 10);
        expect(await cardsInstance.hasOpeningCards(cards)).to.be.true;
        expect(await cardsInstance.hasFinalCard(cards)).to.be.false;
        expect(cards.first.value).to.be.bignumber.equal("1");
        expect(cards.second.value).to.be.bignumber.equal("10");

        cards = await cardsInstance.setFinalCard(cards, 5);
        expect(await cardsInstance.hasFinalCard(cards)).to.be.true;
        expect(cards.third.value).to.be.bignumber.equal("5");
    });

    it("reverts when drawing cards twice", async function () {
        cards = await cardsInstance.setOpeningCards(cards, 1, 2);
        await expectRevert(cardsInstance.setOpeningCards(cards, 1, 2), "opening cards already set");

        cards = await cardsInstance.setFinalCard(cards, 3);
        await expectRevert(cardsInstance.setFinalCard(cards, 3), "final card already set");
    });

    it("reverts when drawing final card without opening cards", async function () {
        await expectRevert(cardsInstance.setFinalCard(cards, 1), "opening cards not set");
    });

    it("reverts when checking result without cards", async function () {
        await expectRevert(cardsInstance.result(cards), "opening cards not set");
        cards = await cardsInstance.setOpeningCards(cards, 1, 2);
        await expectRevert(cardsInstance.result(cards), "final card not set");
    });

    it("returns Inside result correctly", async function () {
        cards = await cardsInstance.setOpeningCards(cards, 1, 10);
        cards = await cardsInstance.setFinalCard(cards, 5);
        let result = await cardsInstance.result(cards);
        expect(result.toNumber()).to.equal(0); // 0 is enum `Inside`
    });

    it("returns Outside result correctly", async function () {
        cards = await cardsInstance.setOpeningCards(cards, 1, 10);
        cards = await cardsInstance.setFinalCard(cards, 11);
        let result = await cardsInstance.result(cards);
        expect(result.toNumber()).to.equal(1); // 1 is enum `Outside`
    });

    it("returns Equal result correctly", async function () {
        cards = await cardsInstance.setOpeningCards(cards, 1, 10);
        cards = await cardsInstance.setFinalCard(cards, 10);
        let result = await cardsInstance.result(cards);
        expect(result.toNumber()).to.equal(2); // 2 is enum `Equal`
    });
});
