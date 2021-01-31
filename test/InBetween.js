const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const InBetween = contract.fromArtifact("InBetween");
const Queue = contract.fromArtifact("Queue");

describe('InBetween', function () {
  let owner, player;
  let inBetween;

  beforeEach(async function () {
    [owner, player] = accounts;
    inBetween = await InBetween.new({ from: owner });
  });

  it("reverts when joining with insufficient funds", async function () {
    await expectRevert(inBetween.joinGame({ from: player, value: 5 }), 'sent amount less than ante');
  });

  it("reverts when player is already in game", async function () {
    await inBetween.joinGame({ from: player, value: 100 });
    await expectRevert(inBetween.joinGame({ from: player, value: 100 }), 'player is already in game');
  });

  it("reverts if viewing stake or hand when not in game", async function () {
    await expectRevert(inBetween.viewStake({ from: player }), "player not in game");
    await expectRevert(inBetween.viewHand({ from: player }), "player not in game");
  });

  it("ante deposited when joining game is correct", async function () {
    await inBetween.joinGame({ from: player, value: 100 });
    let stake = await inBetween.viewStake({ from: player });
    expect(stake.toNumber()).to.equal(100);
  });

  it("player gets two cards when joining game", async function () {
    await inBetween.joinGame({ from: player, value: 100 });
    let hand = await inBetween.viewHand({ from: player });
    expect(hand.first.initialised).to.be.true;
    expect(hand.second.initialised).to.be.true;
    expect(hand.third.initialised).to.be.false;
  });
});
