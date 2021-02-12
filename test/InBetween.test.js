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
            await expectRevert(inBetween.joinGame({ from: p1, value: ante - 1 }), 'sent amount less than ante');
        });

        xit("reverts when player is already in game", async function () {
            await inBetween.joinGame({ from: p1, value: ante });
            await expectRevert(inBetween.joinGame({ from: p1, value: ante }), 'player is already in game');
        });

        it("should add ante to pot when player joins game", async function () {
            await inBetween.joinGame({ from: p1, value: ante });
            let stake = await inBetween.payments(p1);
            expect(stake.toNumber()).to.equal(ante);
            expect(await inBetween.pot()).to.be.bignumber.equal("100");
        });

        it("should give two cards to player when joining game", async function () {
            await inBetween.joinGame({ from: p1, value: ante });
            let cards = await inBetween.viewCards({ from: p1 });
            expect(cards.first.initialised).to.be.true;
            expect(cards.second.initialised).to.be.true;
            expect(cards.third.initialised).to.be.false;
        });

        it("should add player to queue after receiving cards", async function () {
            await inBetween.joinGame({ from: p1, value: ante });
            expect(await inBetween.nextPlayer()).to.equal(p1);

            await inBetween.joinGame({ from: p2, value: ante });
            expect(await inBetween.nextPlayer()).to.equal(p1);
        });
    });

    describe('bet', function () {
        beforeEach(async function () {
            [owner, p1, p2, p3] = accounts;
            inBetween = await InBetween.new({ from: owner });
            await inBetween.joinGame({ from: p1, value: ante });
            await inBetween.joinGame({ from: p2, value: ante });
            expect(await inBetween.pot()).to.be.bignumber.equal("200");
        });

        it("reverts if player tries to jump the queue", async function () {
            await expectRevert(inBetween.bet({ from: p2, value: ante }), "player is not next in queue");
        });

        it("reverts if player bets less than ante", async function () {
            await expectRevert(inBetween.bet({ from: p1, value: ante * 2 - 1 }), "bet must not be less than ante");
            await inBetween.bet({ from: p1, value: ante * 2 });
        });

        it("reverts if player bets more than pot", async function () {
            await expectRevert(inBetween.bet({ from: p1, value: 402 }), "bet must not be more than pot");
        });

        it("should give final card after betting", async function () {
            await inBetween.bet({ from: p1, value: ante * 2 });
            let cards = await inBetween.viewCards({ from: p1 });
            expect(cards.first.initialised).to.be.true;
            expect(cards.second.initialised).to.be.true;
            expect(cards.third.initialised).to.be.true;
        });

        it("should win collateral and bet if final card is Inside", async function () {
            await inBetween.setRandomNumbers(1, 10, 5);
            await inBetween.skipNextPlayer();
            await inBetween.skipNextPlayer();

            await inBetween.joinGame({ from: p3, value: ante });
            expect(await inBetween.pot()).to.be.bignumber.equal("300");

            await inBetween.bet({ from: p3, value: ante * 2 });
            expect(await inBetween.pot()).to.be.bignumber.equal("200");
            expect(await inBetween.payments(p3)).to.be.bignumber.equal("300");
        });

        it("should lose bet if final card is Outside", async function () {
            await inBetween.setRandomNumbers(1, 5, 10);
            await inBetween.skipNextPlayer();
            await inBetween.skipNextPlayer();

            await inBetween.joinGame({ from: p3, value: ante });
            expect(await inBetween.pot()).to.be.bignumber.equal("300");

            await inBetween.bet({ from: p3, value: ante * 2 });
            expect(await inBetween.pot()).to.be.bignumber.equal("400");
            expect(await inBetween.payments(p3)).to.be.bignumber.equal("100");
        });

        it("should lose collateral if final card is Equal", async function () {
            await inBetween.setRandomNumbers(1, 5, 5);
            await inBetween.skipNextPlayer();
            await inBetween.skipNextPlayer();

            await inBetween.joinGame({ from: p3, value: ante });
            expect(await inBetween.pot()).to.be.bignumber.equal("300");

            await inBetween.bet({ from: p3, value: ante * 2 });
            expect(await inBetween.pot()).to.be.bignumber.equal("500");
            expect(await inBetween.payments(p3)).to.be.bignumber.equal("0");
        });
    });
});
