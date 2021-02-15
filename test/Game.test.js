const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const GameMock = contract.fromArtifact("GameMock");

describe('Game', function () {
    let owner, p1, p2, p3;
    let game;
    const ante = 100;

    describe('deal opening cards', function () {
        beforeEach(async function () {
            [owner, p1, p2] = accounts;
            game = await GameMock.new({ from: owner });
        });

        it('reverts if game is over', async function () {
            await game.setGameOver();
            await expectRevert(game.dealOpeningCards(p1, { from: owner }), "game is over");
        });

        it('reverts if player already has opening cards', async function () {
            await game.dealOpeningCards(p1, { from: owner });
            await expectRevert(game.dealOpeningCards(p1, { from: owner }), "player already has opening cards");
        });

        it('should give two cards when dealing', async function () {
            await game.dealOpeningCards(p1, { from: owner });
            let cards = await game.cards(p1);
            expect(cards.first.initialised).to.be.true;
            expect(cards.second.initialised).to.be.true;
            expect(cards.third.initialised).to.be.false;
        });

        it('should add ante to pot and contributions', async function () {
            await game.dealOpeningCards(p1, { from: owner });
            expect(await game.pot()).to.be.bignumber.equal("100");
            expect(await game.contributions(p1)).to.be.bignumber.equal("100");
        });

        it('can deal for multiple players', async function () {
            await game.dealOpeningCards(p1, { from: owner });
            expect(await game.nextPlayer()).to.be.equal(p1);

            await game.dealOpeningCards(p2, { from: owner });
            expect(await game.nextPlayer()).to.be.equal(p1);
        });
    });

    describe('deal final card', function () {
        beforeEach(async function () {
            [owner, p1, p2, p3] = accounts;
            game = await GameMock.new({ from: owner });
            await game.dealOpeningCards(p1, { from: owner });
            await game.dealOpeningCards(p2, { from: owner });
            expect(await game.pot()).to.be.bignumber.equal("200");
        });

        it('reverts if game is over ', async function () {
            await game.setGameOver();
            await expectRevert(game.dealFinalCard(p1, ante, { from: owner }), "game is over");
        });

        it('reverts if player tries to jump queue', async function () {
            await expectRevert(game.dealFinalCard(p2, ante, { from: owner }), "player is not next in queue");
        });

        it('should give final card when dealing', async function () {
            await game.dealFinalCard(p1, ante, { from: owner });
            let cards = await game.cards(p1);
            expect(cards.first.initialised).to.be.true;
            expect(cards.second.initialised).to.be.true;
            expect(cards.third.initialised).to.be.true;
        });

        it('should win bet if result is Inside', async function () {
            await game.setRandomNumbers(1, 10, 5);
            await game.skipNextPlayer();
            await game.skipNextPlayer();

            await game.dealOpeningCards(p3, { from: owner });
            expect(await game.pot()).to.be.bignumber.equal("300");

            let winnings = await game.dealFinalCard.call(p3, 300, { from: owner });
            expect(await game.ended()).to.be.true;
            expect(await game.pot()).to.be.bignumber.equal("0");
            expect(winnings).to.be.bignumber.equal("300");

            await expectRevert(game.dealOpeningCards(p3, { from: owner }), "game is over");
        });

        xit('should lose bet if result is Outside', async function () { });

        xit('should lose 2x bet if result is Equal', async function () { });

        xit('should end game when pot is 0', async function () { });

        xit('sum of contributions is pot', async function () { });
    });
})
