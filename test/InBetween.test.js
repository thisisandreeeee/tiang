const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const InBetween = contract.fromArtifact("InBetweenMock");

describe('InBetween', function () {
    let owner, p1, p2, p3;
    let inBetween;
    const ante = 100;

    describe('joinGame', function () {
        beforeEach(async function () {
            [owner, p1, p2] = accounts;
            inBetween = await InBetween.new({ from: owner });
        });

        it("reverts when joining with insufficient funds", async function () {
            await inBetween.topUp({ from: p1, value: ante - 1 });
            await expectRevert(inBetween.joinGame({ from: p1 }), 'balance less than ante');
        });

        it("should add ante to pot when player joins game", async function () {
            await inBetween.topUp({ from: p1, value: ante });
            expect(await inBetween.balanceOf(p1)).to.be.bignumber.equal("100");

            await inBetween.joinGame({ from: p1 });
            expect(await inBetween.balanceOf(p1)).to.be.bignumber.equal("0");
            expect(await inBetween.pot()).to.be.bignumber.equal("100");
        });

        it("should give two cards to player when joining game", async function () {
            await inBetween.topUp({ from: p1, value: ante });
            await inBetween.joinGame({ from: p1 });
            let cards = await inBetween.viewCards({ from: p1 });
            expect(cards.first.initialised).to.be.true;
            expect(cards.second.initialised).to.be.true;
            expect(cards.third.initialised).to.be.false;
        });

        it("should add player to queue after receiving cards", async function () {
            await inBetween.topUp({ from: p1, value: ante });
            await inBetween.joinGame({ from: p1 });
            expect(await inBetween.nextPlayer()).to.equal(p1);

            await inBetween.topUp({ from: p2, value: ante });
            await inBetween.joinGame({ from: p2 });
            expect(await inBetween.nextPlayer()).to.equal(p1);
        });
    });

    describe('bet', function () {
        beforeEach(async function () {
            [owner, p1, p2, p3] = accounts;
            inBetween = await InBetween.new({ from: owner });
            await inBetween.topUp({ from: p1, value: 3 * ante });
            await inBetween.joinGame({ from: p1 });
            await inBetween.topUp({ from: p2, value: 3 * ante });
            await inBetween.joinGame({ from: p2 });
            expect(await inBetween.pot()).to.be.bignumber.equal("200");
        });

        it("reverts if player tries to jump the queue", async function () {
            await expectRevert(inBetween.bet(ante, { from: p2 }), "player is not next in queue");
        });

        it("reverts if player bets less than ante", async function () {
            await expectRevert(inBetween.bet(ante - 1, { from: p1 }), "bet must not be less than ante");
            await inBetween.bet(ante, { from: p1 });
        });

        it("should win bet if final card is Inside and revert when game over", async function () {
            await inBetween.setRandomNumbers(1, 10, 5);
            await inBetween.skipNextPlayer();
            await inBetween.skipNextPlayer();

            await inBetween.topUp({ from: p3, value: 10 * ante });
            await inBetween.joinGame({ from: p3 });
            expect(await inBetween.pot()).to.be.bignumber.equal("300");

            await inBetween.bet(300, { from: p3 });
            expect(await inBetween.gameOver()).to.be.true;
            expect(await inBetween.pot()).to.be.bignumber.equal("0");
            expect(await inBetween.balanceOf(p3)).to.be.bignumber.equal("1200");

            await expectRevert(inBetween.joinGame({ from: p3 }), "game is over");
        });

        it("should lose bet if final card is Outside", async function () {
            await inBetween.setRandomNumbers(1, 5, 10);
            await inBetween.skipNextPlayer();
            await inBetween.skipNextPlayer();

            await inBetween.topUp({ from: p3, value: 10 * ante });
            await inBetween.joinGame({ from: p3 });
            expect(await inBetween.pot()).to.be.bignumber.equal("300");

            await inBetween.bet(ante, { from: p3 });
            expect(await inBetween.gameOver()).to.be.false;
            expect(await inBetween.pot()).to.be.bignumber.equal("400");
            expect(await inBetween.balanceOf(p3)).to.be.bignumber.equal("800");
        });

        it("can only bet up to pot limit", async function () {
            await inBetween.setRandomNumbers(1, 5, 10);
            await inBetween.skipNextPlayer();
            await inBetween.skipNextPlayer();

            await inBetween.topUp({ from: p3, value: 10 * ante });
            await inBetween.joinGame({ from: p3 });
            expect(await inBetween.pot()).to.be.bignumber.equal("300");

            await inBetween.bet(5 * ante, { from: p3 });
            expect(await inBetween.gameOver()).to.be.false;
            expect(await inBetween.pot()).to.be.bignumber.equal("600");
            expect(await inBetween.balanceOf(p3)).to.be.bignumber.equal("600");
        });

        it("should lose 2x bet if final card is Equal", async function () {
            await inBetween.setRandomNumbers(1, 5, 5);
            await inBetween.skipNextPlayer();
            await inBetween.skipNextPlayer();

            await inBetween.topUp({ from: p3, value: 10 * ante });
            await inBetween.joinGame({ from: p3 });
            expect(await inBetween.pot()).to.be.bignumber.equal("300");

            await inBetween.bet(ante, { from: p3 });
            expect(await inBetween.gameOver()).to.be.false;
            expect(await inBetween.pot()).to.be.bignumber.equal("500");
            expect(await inBetween.balanceOf(p3)).to.be.bignumber.equal("700");
        });
    });
});
