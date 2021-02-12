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
        <h1>Drizzle Examples</h1>
        <p>
          Examples of how to get started with Drizzle in various situations.
        </p>
      </div>

      <div className="section">
        <h2>Active Account</h2>
        <AccountData
          drizzle={drizzle}
          drizzleState={drizzleState}
          accountIndex={0}
          units="ether"
          precision={3}
        />
      </div>

      <div className="section">
        <h2>InBetween</h2>
        <ul>
          <li>
            <strong>Next player: </strong>
            <ContractData
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="InBetween"
              method="nextPlayer"
            />
          </li>
          <li>
            <strong>Pot: </strong>
            <ContractData
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="InBetween"
              method="pot"
            />
          </li>
          <li>
            <strong>Escrow: </strong>
            <ContractData
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="InBetween"
              method="balanceOf"
              methodArgs={[drizzleState.accounts[0]]}
            />
          </li>
          <li>
            <strong>Cards: </strong>
            <ContractData
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="InBetween"
              method="viewCards"
            />
          </li>
          <li>
            <strong>Result: </strong>
            <ContractData
              drizzle={drizzle}
              drizzleState={drizzleState}
              contract="InBetween"
              method="viewResult"
            />
          </li>
        </ul>

        <strong>Top up: </strong>
        <ContractForm
          drizzle={drizzle}
          contract="InBetween"
          method="topUp"
          sendArgs={{ from: drizzleState.accounts[0], value: 5000, gas: 6000000 }}
        />

        <strong>Join game: </strong>
        <ContractForm
          drizzle={drizzle}
          contract="InBetween"
          method="joinGame"
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />

        <strong>Bet: </strong>
        <ContractForm
          drizzle={drizzle}
          contract="InBetween"
          method="bet"
          labels={['bet amount']}
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />

        <strong>Next round: </strong>
        <ContractForm
          drizzle={drizzle}
          contract="InBetween"
          method="reset"
          methodArgs={false}
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />

        <strong>Result: </strong>
        <ContractForm
          drizzle={drizzle}
          contract="InBetween"
          method="reset"
          methodArgs={true}
          sendArgs={{ from: drizzleState.accounts[0], gas: 6000000 }}
        />
      </div>
    </div>
  );
};
