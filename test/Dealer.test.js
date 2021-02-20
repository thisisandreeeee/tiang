const { accounts, contract } = require('@openzeppelin/test-environment');
const { balance, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Dealer = contract.fromArtifact("DealerMock");
const Game = contract.fromArtifact("GameMock");

describe('Dealer', function () {
    const ante = 100;
    let owner, p1, p2, p3;
    let dealer;
    let balanceTracker;

    beforeEach(async function () {
        [owner, p1, p2, p3] = accounts;
        dealer = await Dealer.new({ from: owner });
    });

    describe('newGame', function () {
        it('can create multiple game instances', async function () {
            await dealer.newGame(100, { from: owner });
            await dealer.newGame(200, { from: owner });
            game1 = await Game.at(await dealer.games(1));
            game2 = await Game.at(await dealer.games(2));
            expect(await game1.ante()).to.be.bignumber.equal("100");
            expect(await game2.ante()).to.be.bignumber.equal("200");

            games = await dealer.listGames(5);
            expect(games.length).to.equal(3);
            expect(games[1]).to.equal(game1.address);
            expect(games[2]).to.equal(game2.address);
        });
    });

    describe('join', function () {
        beforeEach(async function () {
            await dealer.newGame(ante, { from: owner });
            balanceTracker = await balance.tracker(dealer.address);
        });

        it('reverts when joining with insufficient funds', async function () {
            await dealer.topUp({ from: p1, value: ante - 1 });
            await expectRevert(dealer.join(1, { from: p1 }), "balance less than ante");
            expect(await balanceTracker.delta()).to.be.bignumber.equal("99");
            expect(await dealer.balanceOf(p1)).to.be.bignumber.equal("99");
        });

        it('reverts if joining with invalid gameId', async function () {
            await expectRevert(dealer.join(2, { from: p1 }), "invalid opcode");
        });

        it('reverts when betting without joining', async function () {
            await dealer.topUp({ from: p1, value: 10 * ante });
            await expectRevert(dealer.bet(1, ante, { from: p1 }), "player is not in game");

            await dealer.join(1, { from: p1 });
            await dealer.bet(1, ante, { from: p1 });
            await expectRevert(dealer.bet(1, ante, { from: p1 }), "player does not have opening cards");
        });

        it('allows multiple users to join game', async function () {
            await dealer.topUp({ from: p1, value: ante });
            await dealer.topUp({ from: p2, value: 2 * ante });
            expect(await dealer.balanceOf(p1)).to.be.bignumber.equal("100");
            expect(await dealer.balanceOf(p2)).to.be.bignumber.equal("200");
            expect(await balanceTracker.delta()).to.be.bignumber.equal("300");

            await dealer.join(1, { from: p1 });
            await dealer.join(1, { from: p2 });
            expect(await dealer.balanceOf(p1)).to.be.bignumber.equal("0");
            expect(await dealer.balanceOf(p2)).to.be.bignumber.equal("100");
            expect(await balanceTracker.delta()).to.be.bignumber.equal("0");
        });

        it('does not deduct twice if joining game twice', async function () {
            await dealer.topUp({ from: p1, value: 2 * ante });
            expect(await dealer.balanceOf(p1)).to.be.bignumber.equal("200");

            await dealer.join(1, { from: p1 });
            expect(await dealer.balanceOf(p1)).to.be.bignumber.equal("100");

            await expectRevert(dealer.join(1, { from: p1 }), "player is already in game");
            expect(await dealer.balanceOf(p1)).to.be.bignumber.equal("100");
        });

        it('allows rejoin only if players have a full hand', async function () {
            await dealer.topUp({ from: p1, value: 10 * ante });
            await dealer.join(1, { from: p1 });

            await expectRevert(dealer.rejoin(1, { from: p1 }), "already have opening cards");
            await dealer.bet(1, ante, { from: p1 });
            await dealer.rejoin(1, { from: p1 });
        });
    });

    describe('bet', function () {
        let game;

        beforeEach(async function () {
            await dealer.newGame(ante, { from: owner });
            game = await Game.at(await dealer.games(1));
            balanceTracker = await balance.tracker(dealer.address);

            await dealer.topUp({ from: p1, value: 3 * ante });
            await dealer.join(1, { from: p1 });
            await dealer.topUp({ from: p2, value: 3 * ante });
            await dealer.join(1, { from: p2 });
            expect(await balanceTracker.delta()).to.be.bignumber.equal("600");
        });

        it('reverts if player tries to jump the queue', async function () {
            await expectRevert(dealer.bet(1, ante, { from: p2 }), "player is not next in queue");
        });

        it('reverts if player bets less than ante', async function () {
            await expectRevert(dealer.bet(1, ante - 1, { from: p1 }), "bet must not be less than ante");
            await dealer.bet(1, ante, { from: p1 });
        });

        it('wins bet if final card is Inside', async function () {
            await game.setRandomNumbers(1, 10, 5);
            await game.skipNextPlayer();
            await game.skipNextPlayer();

            await dealer.topUp({ from: p3, value: 10 * ante });
            await dealer.join(1, { from: p3 });
            await dealer.bet(1, 300, { from: p3 });
            expect(await dealer.balanceOf(p3)).to.be.bignumber.equal("1200");

            await expectRevert(dealer.join(1, { from: p3 }), "game is over");
        });

        it('can only win the remaining if pot is less than ante', async function () {
            await game.setRandomNumbers(1, 10, 5);
            await game.skipNextPlayer();
            await game.skipNextPlayer();

            await dealer.topUp({ from: p3, value: 10 * ante });
            await dealer.join(1, { from: p3 });
            await dealer.bet(1, 290, { from: p3 });
            expect(await dealer.balanceOf(p3)).to.be.bignumber.equal("1190");

            await dealer.rejoin(1, { from: p3 });
            await dealer.bet(1, 100, { from: p3 });
            expect(await dealer.balanceOf(p3)).to.be.bignumber.equal("1200");
        });

        it('loses bet if final card is Outside', async function () {
            await game.setRandomNumbers(1, 5, 10);
            await game.skipNextPlayer();
            await game.skipNextPlayer();

            await dealer.topUp({ from: p3, value: 10 * ante });
            await dealer.join(1, { from: p3 });
            await dealer.bet(1, ante, { from: p3 });
            expect(await dealer.balanceOf(p3)).to.be.bignumber.equal("800");
        });

        it('can only bet up to total pot', async function () {
            await game.setRandomNumbers(1, 5, 10);
            await game.skipNextPlayer();
            await game.skipNextPlayer();

            await dealer.topUp({ from: p3, value: 10 * ante });
            await dealer.join(1, { from: p3 });
            await dealer.bet(1, 500, { from: p3 });
            expect(await dealer.balanceOf(p3)).to.be.bignumber.equal("600");
        });

        it('loses 2x bet if final card is Equal', async function () {
            await game.setRandomNumbers(1, 5, 5);
            await game.skipNextPlayer();
            await game.skipNextPlayer();

            await dealer.topUp({ from: p3, value: 10 * ante });
            await dealer.join(1, { from: p3 });
            await dealer.bet(1, ante, { from: p3 });
            expect(await dealer.balanceOf(p3)).to.be.bignumber.equal("700");
        });
    });
});