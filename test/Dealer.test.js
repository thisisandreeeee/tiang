const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Dealer = contract.fromArtifact("Dealer");

describe('Dealer', function () {
    let owner, p1, p2, p3;
    let Dealer;

    describe('join', function () {
        beforeEach(async function () {
            [owner, p1, p2, p3] = accounts;
            Dealer = await Dealer.new({ from: owner });
        });

        xit('reverts when joining with insufficient balance', async function () { });

        xit('should reduce balance when joining game', async function () { });
    });

    describe('bet', function () {
        beforeEach(async function () {
            [owner, p1, p2, p3] = accounts;
            Dealer = await Dealer.new({ from: owner });
        });

        xit('reverts if bet is less than ante', async function () { });

        xit('reverts if balance is less than 2x bet', async function () { });

        xit('can only bet up to pot limit', async function () { });

        xit('should increase balance if win', async function () { });

        xit('should reduce balance if lose', async function () { });

        xit('should deal opening cards if game not over', async function () { });
    });
});