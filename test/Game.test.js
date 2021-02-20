const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Game = contract.fromArtifact("GameMock");

describe('Game', function () {
    const ante = 100;
    let owner, p1, p2, p3;
    let game;

    beforeEach(async function () {
        [owner, p1, p2, p3] = accounts;
        game = await Game.new({ from: owner });
        await game.init(0, ante);
        await game.sitDown(p1);
    });

    describe('deal', function () {
        it('reverts if dealing without sitting down', async function () {
            await expectRevert(game.dealOpeningCards(p3), "player is not in game");
        });

        it('can deal opening cards correctly once', async function () {
            await game.dealOpeningCards(p1);
            expect(await game.pot()).to.be.bignumber.equal(ante.toString());

            let cards = await game.cards(p1);
            expect(cards.first.initialised).to.be.true;
            expect(cards.second.initialised).to.be.true;
            expect(cards.third.initialised).to.be.false;

            await expectRevert(game.dealOpeningCards(p1), "already have opening cards");
        });

        it('reverts when drawing final card without opening cards', async function () {
            await expectRevert(game.dealFinalCard(p1, ante), "player does not have opening cards");
        });

        it('resets player cards after dealing final card', async function () {
            await game.dealOpeningCards(p1);
            await game.dealFinalCard(p1, ante);

            let cards = await game.cards(p1);
            expect(cards.first.initialised).to.be.false;
            expect(cards.second.initialised).to.be.false;
            expect(cards.third.initialised).to.be.false;
        });

        it('can deal for multiple players', async function () {
            await game.dealOpeningCards(p1);
            await game.sitDown(p2);
            await game.dealOpeningCards(p2);

            expect(await game.pot()).to.be.bignumber.equal((2 * ante).toString());
            expect(await game.isNext(p1)).to.be.true;
            expect(await game.isNext(p2)).to.be.false;

            await expectRevert(game.dealFinalCard(p2, ante), "player is not next in queue");

            await game.dealFinalCard(p1, ante);
            expect(await game.isNext(p2)).to.be.true;
        });

        it('wins bet if final card is Inside', async function () {
            await game.setRandomNumbers(1, 10, 5);
            await game.dealOpeningCards(p1);
            await game.dealFinalCard(p1, ante);
            expect(await game.ended()).to.be.true;
            expect(await game.pot()).to.be.bignumber.equal("0");

            await expectRevert(game.dealOpeningCards(p1), "game is over");
        });

        it('loses bet if final card is Outside', async function () {
            await game.setRandomNumbers(1, 5, 10);
            await game.dealOpeningCards(p1);
            await game.dealFinalCard(p1, ante);
            expect(await game.ended()).to.be.false;
            expect(await game.pot()).to.be.bignumber.equal("200");
        });

        it('loses 2x bet if final card is Equal', async function () {
            await game.setRandomNumbers(1, 5, 5);
            await game.dealOpeningCards(p1);
            await game.dealFinalCard(p1, ante);
            expect(await game.ended()).to.be.false;
            expect(await game.pot()).to.be.bignumber.equal("300");
        });
    });
});