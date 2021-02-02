const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const InBetween = contract.fromArtifact("InBetween");
const Queue = contract.fromArtifact("Queue");

describe('InBetween', function () {
    let owner, p1, p2, p3;
    let inBetween;

    describe('Join', function () {
        beforeEach(async function () {
            [owner, p1] = accounts;
            inBetween = await InBetween.new({ from: owner });
        });

        it("reverts when joining with insufficient funds", async function () {
            await expectRevert(inBetween.joinGame({ from: p1, value: 5 }), 'sent amount less than ante');
        });

        it("reverts when player is already in game", async function () {
            await inBetween.joinGame({ from: p1, value: 100 });
            await expectRevert(inBetween.joinGame({ from: p1, value: 100 }), 'player is already in game');
        });

        it("reverts if viewing stake or hand when not in game", async function () {
            await expectRevert(inBetween.viewStake({ from: p1 }), "player not in game");
            await expectRevert(inBetween.viewCards({ from: p1 }), "player not in game");
        });

        it("ante deposited when joining game is correct", async function () {
            await inBetween.joinGame({ from: p1, value: 100 });
            let stake = await inBetween.viewStake({ from: p1 });
            expect(stake.toNumber()).to.equal(100);
        });

        it("player gets two cards when joining game", async function () {
            await inBetween.joinGame({ from: p1, value: 100 });
            let hand = await inBetween.viewCards({ from: p1 });
            expect(hand.first.initialised).to.be.true;
            expect(hand.second.initialised).to.be.true;
            expect(hand.third.initialised).to.be.false;
        });
    });

    describe('Bet', function () {
        beforeEach(async function () {
            [owner, p1, p2, p3] = accounts;
            inBetween = await InBetween.new({ from: owner });
        });

        xit("test bet", async function () {
            await inBetween.joinGame({ from: p1, value: 100 });
        });
    });
});
