const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const InBetween = contract.fromArtifact("InBetween");

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

  it("ante deposited when joining game is correct", async function () {
    await inBetween.joinGame({ from: player, value: 100 });
    let stake = await inBetween.viewStake({ from: player });
    expect(stake.toNumber()).to.equal(100);
  });

  xit("excess ante is refunded to the player", async function () { });

  xit("player gets two cards when joining game", async function () { });

  xit("revert when drawing opening cards again", async function () { });
  xit("revert when drawing final card without opening cards", async function () { });
});
