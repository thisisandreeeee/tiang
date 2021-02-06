// SPDX-License-Identifier: UNLICENSED
pragma solidity 0.7.6;
pragma abicoder v2;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/payment/PullPayment.sol";

import "./Queue.sol";
import "./Cards.sol";

contract InBetween is Ownable, PullPayment {
    using Cards for Cards.Data;
    using SafeMath for uint256;

    uint256 private ante;

    uint256 public pot;
    struct Player {
        uint256 balance;
        Cards.Data cards;
    }
    mapping(address => Player) private players;
    Queue internal queue;

    constructor() {
        ante = 100 wei;
        queue = new Queue();
    }

    function joinGame() external payable {
        uint256 balance = players[msg.sender].balance;
        require(balance == 0, "player is already in game");
        require(msg.value >= ante, "sent amount less than ante");

        // TODO: refund excess ante
        players[msg.sender].balance = balance.add(msg.value);
        pot = pot.add(msg.value);

        players[msg.sender].cards = players[msg.sender].cards.setOpeningCards(
            randomNumber(0),
            randomNumber(1)
        );

        queue.push(msg.sender);
    }

    function viewStake() external view returns (uint256) {
        uint256 stake = players[msg.sender].balance;
        require(stake > 0, "player not in game");
        return stake;
    }

    function viewCards() external view returns (Cards.Data memory) {
        require(players[msg.sender].balance > 0, "player not in game");
        return players[msg.sender].cards;
    }

    function nextPlayer() external view returns (address) {
        if (queue.length() == 0) return address(0);
        return queue.head();
    }

    function bet() external payable {
        // TODO: implement queue time limit
        require(queue.head() == msg.sender, "player is not next in queue");

        // if the final card equals any opening card, the player will need to pay double the bet
        // hence, we require players to send double their bet as collateral which is returned upon a win
        uint256 collateral = msg.value;
        uint256 betAmount = collateral.div(2);
        if (pot >= ante) {
            require(betAmount >= ante, "bet must not be less than ante");
        }
        require(betAmount <= pot, "bet must not be more than pot");

        require(
            players[msg.sender].cards.hasOpeningCards(),
            "player does not have opening cards"
        );
        players[msg.sender].cards = players[msg.sender].cards.setFinalCard(
            randomNumber(2)
        );
        queue.pop();

        Cards.Result result = players[msg.sender].cards.result();
        if (result == Cards.Result.Inside) {
            // player wins their collateral and the bet amount
            _asyncTransfer(msg.sender, collateral.add(betAmount));
            pot -= betAmount;
        } else if (result == Cards.Result.Equal) {
            // player loses their entire collateral
            pot += collateral;
        } else if (result == Cards.Result.Outside) {
            // player loses only the bet amount
            _asyncTransfer(msg.sender, collateral.sub(betAmount));
            pot += betAmount;
        } else {
            revert("unsupported card result");
        }

        // TODO: check if game is over before adding player to queue
        // maybe end game if pot is too small?
        queue.push(msg.sender);
    }

    function withdraw() external {
        // TODO: test this using balance.tracker
        require(payments(msg.sender) > 0, "no funds to withdraw");
        return withdrawPayments(msg.sender);
    }

    function randomNumber(uint256 cursor)
        internal
        view
        virtual
        returns (uint8)
    {
        // not truly random, need to use oracle as RNG
        uint256 rand = uint256(keccak256(abi.encodePacked(block.timestamp)));
        rand = rand.sub(cursor); // hack to allow mocking the RNG in tests
        return uint8(rand.mod(13));
    }
}
