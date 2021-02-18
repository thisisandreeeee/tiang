const { accounts, contract } = require('@openzeppelin/test-environment');
const { balance, ether, expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Cashier = contract.fromArtifact('CashierMock');

describe('Cashier', function () {
    const [payer, payee1, payee2] = accounts;
    const amount = ether('10');

    beforeEach(async function () {
        this.contract = await Cashier.new({ from: payer, value: amount });
    });

    describe('balance', function () {
        it('can record a deposit correctly', async function () {
            await this.contract.callDeposit(payee1, 100);
            expect(await this.contract.balanceOf(payee1)).to.be.bignumber.equal('100')
        });

        it('can add multiple balances on one account', async function () {
            await this.contract.callDeposit(payee1, 200);
            await this.contract.callDeposit(payee1, 300);
            expect(await this.contract.balanceOf(payee1)).to.be.bignumber.equal('500');
        });

        it('can deduct balances on one account', async function () {
            await this.contract.callDeposit(payee1, 200);
            await this.contract.callDeduct(payee1, 50);
            expect(await this.contract.balanceOf(payee1)).to.be.bignumber.equal('150');
        });

        it('reverts if deduct more than total', async function () {
            await this.contract.callDeposit(payee1, 50);
            await expectRevert(this.contract.callDeduct(payee1, 100), "cannot deduct more than total");
            expect(await this.contract.balanceOf(payee1)).to.be.bignumber.equal("50");
        })

        it('can add balances on multiple accounts', async function () {
            await this.contract.callDeposit(payee1, 200);
            await this.contract.callDeposit(payee2, 300);
            expect(await this.contract.balanceOf(payee1)).to.be.bignumber.equal('200');
            expect(await this.contract.balanceOf(payee2)).to.be.bignumber.equal('300');
        });
    });

    describe('withdraw', function () {
        it('can withdraw funds', async function () {
            const balanceTracker = await balance.tracker(payee1);

            await this.contract.callDeposit(payee1, amount);
            expect(await this.contract.balanceOf(payee1)).to.be.bignumber.equal(amount);

            await this.contract.withdraw(payee1);
            expect(await balanceTracker.delta()).to.be.bignumber.equal(amount);
            expect(await this.contract.balanceOf(payee1)).to.be.bignumber.equal('0');
        });
    });

    describe('top up', function () {
        it('can top up funds', async function () {
            await this.contract.topUp({ from: payee1, value: amount });
            expect(await this.contract.contractBalance.call()).to.be.bignumber.equal(ether('20'));
            expect(await this.contract.balanceOf(payee1)).to.be.bignumber.equal(amount);
        });
    })
});
