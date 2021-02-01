const { accounts, contract } = require('@openzeppelin/test-environment');
const { expectRevert } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const Queue = contract.fromArtifact("Queue");

describe('Queue', function () {
  let queue;
  let [p1, p2, p3] = accounts;

  beforeEach(async function () {
    queue = await Queue.new();
  });

  it("empty queue has length 0", async function () {
    expect(await queue.length()).to.be.bignumber.equal("0");
  });

  it("revert when viewing empty queue", async function () {
    await expectRevert(queue.head(), "queue cannot be empty");
    await expectRevert(queue.tail(), "queue cannot be empty");
    await expectRevert(queue.pop(), "queue cannot be empty");
  });

  it("should have correct length after push", async function () {
    await queue.push(p1);
    expect(await queue.head()).to.equal(p1);
    expect(await queue.tail()).to.equal(p1);
    expect(await queue.length()).to.be.bignumber.equal("1");

    await queue.push(p2);
    expect(await queue.head()).to.equal(p1);
    expect(await queue.tail()).to.equal(p2);
    expect(await queue.length()).to.be.bignumber.equal("2");

    await queue.push(p3);
    expect(await queue.head()).to.equal(p1);
    expect(await queue.tail()).to.equal(p3);
    expect(await queue.length()).to.be.bignumber.equal("3");
  });

  it("should pop the correct address", async function () {
    // we do not directly check the popped value because of a solidity quirk
    // if you invoke .pop(), the ABI returns a transaction object instead of the return value
    // if you invoke .pop.call(), the ABI returns the correct value but does not update state
    // thus, we check the next element in the queue to verify pop works as expected
    await queue.push(p1);
    await queue.push(p2);
    await queue.push(p3);
    expect(await queue.head()).to.equal(p1);
    expect(await queue.length()).to.be.bignumber.equal("3");

    await queue.pop();
    expect(await queue.head()).to.equal(p2);
    expect(await queue.length()).to.be.bignumber.equal("2");

    await queue.pop();
    await queue.pop();
    expect(await queue.length()).to.be.bignumber.equal("0");
    await expectRevert(queue.head(), "queue cannot be empty");
  });


});
