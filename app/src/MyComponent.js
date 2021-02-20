import React from "react";
import { newContextComponents } from "@drizzle/react-components";
import logo from "./logo.png";

const { AccountData, ContractData, ContractForm } = newContextComponents;

export default ({ drizzle, drizzleState }) => {
  // destructure drizzle and drizzleState from props
  return (
    <div className="App">
      <div>
        <img src={logo} alt="drizzle-logo" />
        <h1>In Between</h1>
      </div>

      <div className="section">
        <h2>Ethereum wallet</h2>
        <AccountData
          drizzle={drizzle}
          drizzleState={drizzleState}
          accountIndex={0}
          units="ether"
          precision={3}
        />
      </div>

      <div className="section">
        <h2>Dealer panel</h2>
        <strong>New game: </strong>
        <ContractForm
          drizzle={drizzle}
          contract="Dealer"
          method="newGame"
          labels={['ante']}
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />
        <strong>List games: </strong>
        <ContractData
          drizzle={drizzle}
          drizzleState={drizzleState}
          contract="Dealer"
          method="listGames"
          methodArgs={[10]}
        />
      </div>

      <div className="section">
        <h2>Player details</h2>
        <strong>Top up</strong>
        <ContractForm
          drizzle={drizzle}
          contract="Dealer"
          method="topUp"
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000, value: 5000 }}
        />
        <strong>Withdraw</strong>
        <ContractForm
          drizzle={drizzle}
          contract="Dealer"
          method="withdraw"
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />
        <p>
          <strong>Balance: </strong>
          <ContractData
            drizzle={drizzle}
            drizzleState={drizzleState}
            contract="Dealer"
            method="balanceOf"
            methodArgs={[drizzleState.accounts[0]]}
          />
        </p>
        <strong>Cards: </strong>
        <ContractData
          drizzle={drizzle}
          drizzleState={drizzleState}
          contract="Dealer"
          method="cards"
          methodArgs={[0, drizzleState.accounts[0]]}
        />
      </div>

      <div className="section">
        <h2>Play game</h2>

        <strong>Join</strong>
        <ContractForm
          drizzle={drizzle}
          contract="Dealer"
          method="join"
          labels={['gameId']}
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />

        <strong>Rejoin</strong>
        <ContractForm
          drizzle={drizzle}
          contract="Dealer"
          method="rejoin"
          labels={['gameId']}
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />

        <strong>Bet</strong>
        <ContractForm
          drizzle={drizzle}
          contract="Dealer"
          method="bet"
          labels={['gameId', 'bet amount']}
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />
      </div>
    </div>
  );
};
