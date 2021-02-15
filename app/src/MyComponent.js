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
        <h2>Game overview</h2>
        <ul>
          <li>
            <strong>Next player: </strong>
            <ContractData
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="Manager"
              method="nextPlayer"
            />
          </li>
          <li>
            <strong>Pot: </strong>
            <ContractData
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="Manager"
              method="pot"
            />
          </li>
        </ul>
      </div>

      <div className="section">
        <h2>Player information</h2>
        <ul>
          <li>
            <strong>Balance: </strong>
            <ContractData
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="Manager"
              method="balanceOf"
              methodArgs={[drizzleState.accounts[0]]}
            />
          </li>
          <li>
            <strong>Cards: </strong>
            <ContractData
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="Manager"
              method="viewCards"
            />
          </li>
          <li>
            <strong>Result: </strong>
            <ContractData
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="Manager"
              method="viewResult"
            />
          </li>
        </ul>
      </div>

      <div className="section">
        <h2>Play game</h2>
        <strong>Top up</strong>
        <ContractForm
          drizzle={drizzle}
          contract="Manager"
          method="topUp"
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000, value: 5000 }}
        />

        <strong>Join game</strong>
        <ContractForm
          drizzle={drizzle}
          contract="Manager"
          method="join"
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />

        <strong>Bet</strong>
        <ContractForm
          drizzle={drizzle}
          contract="Manager"
          method="bet"
          labels={['bet amount']}
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />

        <strong>Reset</strong>
        <ContractForm
          drizzle={drizzle}
          contract="Manager"
          method="reset"
          methodArgs={true}
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />
      </div>
    </div>
  );
};
