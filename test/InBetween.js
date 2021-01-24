const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const InBetween = contract.fromArtifact("InBetween");

describe('InBetween', function () {
  beforeEach(async function () {
  });

  it("reverts when joining with insufficient funds", async function () {
    const [owner, player] = accounts;
    inBetween = await InBetween.new({ from: owner });
    await expectRevert(inBetween.joinGame({ from: player, value: 5 }), 'sent amount less than ante');
  });

  it("reverts when player is already in game", async function () {
    const [owner, player] = accounts;
    inBetween = await InBetween.new({ from: owner });
    await inBetween.joinGame({ from: player, value: 100 });
    await expectRevert(inBetween.joinGame({ from: player, value: 100 }), 'player is already in game');
  });

  it("returns the correct stake when joining a game", async function () {
    const [owner, player] = accounts;
    inBetween = await InBetween.new({ from: owner });
    await inBetween.joinGame({ from: player, value: 100 });
    expect(await inBetween.viewStake({ from: player })).to.be.equal(100);
  });
});
