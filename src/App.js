/* eslint-disable no-use-before-define */
/* eslint-disable no-unused-vars */
/* eslint-disable no-lone-blocks */

import "./styles/App.css";
import { Button } from "react-bootstrap";
import "bootstrap/dist/css/bootstrap.min.css";
import React, { Component } from "react";
import "sf-font";
import NFT from "./components/nft";
import ABI from "./blockchain/ABIs/ABI.json";
import VAULTABI from "./blockchain/ABIs/VAULTABI.json";
import {
  NFTCONTRACT,
  STAKINGCONTRACT,
} from "./blockchain/config.js";
import Web3 from "web3";


var account = null;
var contract = null;
var vaultcontract = null;


class App extends Component {
  constructor() {
    super();
    this.state = {
      balance: [],
      rawearn: [],
    };
  }

  render() {

    async function connectwallet() {
      const chainId = 200;

      if (window.ethereum.networkVersion !== chainId) {
        try {
          await window.ethereum.request({
            method: "wallet_switchEthereumChain",
            params: [{ chainId: web3.utils.toHex(chainId) }],
          });
        } catch (err) {
          // This error code indicates that the chain has not been added to MetaMask
          if (err.code === 4902) {
            await window.ethereum.request({
              method: "wallet_addEthereumChain",
              params: [
                {
                  chainName: "Dogechain Mainnet",
                  chainId: web3.utils.toHex(chainId),
                  nativeCurrency: {
                    name: "DOGE",
                    decimals: 18,
                    symbol: "DOGE",
                  },
                  rpcUrls: ["https://rpc-us.dogechain.dog"],
                },
              ],
            });
          }
        }
      }

      if (window.ethereum) {
        var web3 = new Web3(window.ethereum);
        await window.ethereum.send("eth_requestAccounts");
        var accounts = await web3.eth.getAccounts();
        account = accounts[0];
        let accountText = `${accounts[0].slice(0, 4)}***${accounts[0].slice(38, 42)}`
        document.getElementById("connectbtn").value = accountText;
        contract = new web3.eth.Contract(ABI, NFTCONTRACT);
        vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);

        var getstakednfts = await vaultcontract.methods
          .tokensOfOwner(account)
          .call();
        if (getstakednfts.length <= 1) {
          const getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
          document.getElementById("yournfts").textContent = getstakednfts;
          document.getElementById("stakedbalance").textContent = getbalance;
        } else {
          const getbalance = Number(await vaultcontract.methods.balanceOf(account).call());
          document.getElementById("yournfts").textContent = getbalance;
          document.getElementById("stakedbalance").textContent = getbalance;
        }

        var getTotalSupply = Number(await vaultcontract.methods.totalStaked().call());
        document.getElementById("totalsupply").textContent = `${getTotalSupply + 'Goblins'}`;

        var getNftBalance = await contract.methods
        .walletOfOwner(account)
        .call();
        if (getNftBalance.length <=1) {
          const getSupply = Number(await contract.methods.balanceOf(account).call());
          document.getElementById("nftbalance").textContent = getSupply;
        } else {
          const getSupply = Number(await contract.methods.balanceOf(account).call());
          document.getElementById("nftbalance").textContent = getSupply;
        }
        

        var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
        const arraynft = Array.from(rawnfts.map(Number));
        const tokenid = arraynft.filter(Number);
        var rwdArray = [];
        tokenid.forEach(async (id) => {
          var rawearn = await vaultcontract.methods
            .earningInfo(account, [id])
            .call();
          var array = Array.from(rawearn.map(Number));
          array.forEach(async (item) => {
            var earned = String(item).split(",")[0];
            var earnedrwd = Web3.utils.fromWei(earned);
            var rewardx = Number(earnedrwd).toFixed(2);
            var numrwd = Number(rewardx);
            rwdArray.push(numrwd);
          });
        });

      } else {
        alert('Please install metamask')
      }
    }

    async function verify() {
      var getstakednfts = await vaultcontract.methods
        .tokensOfOwner(account)
        .call();
      if (getstakednfts.length <= 15) {
        document.getElementById("yournfts").textContent = getstakednfts;
      } else {
        const getbalance = Number(
          await vaultcontract.methods.balanceOf(account).call()
        );
        document.getElementById("yournfts").textContent = getbalance;
      }
      var getbalance = Number(
        await vaultcontract.methods.balanceOf(account).call()
      );
      document.getElementById("stakedbalance").textContent = getbalance;
    }

    async function enable() {
      contract.methods
        .setApprovalForAll(STAKINGCONTRACT, true)
        .send({ from: account });
    }

    async function rewardinfo() {
      var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
      const arraynft = Array.from(rawnfts.map(Number));
      const tokenid = arraynft.filter(Number);
      var rwdArray = [];
      tokenid.forEach(async (id) => {
        var rawearn = await vaultcontract.methods
          .earningInfo(account, [id])
          .call();
        var array = Array.from(rawearn.map(Number));
        array.forEach(async (item) => {
          var earned = String(item).split(",")[0];
          var earnedrwd = Web3.utils.fromWei(earned);
          var rewardx = Number(earnedrwd).toFixed(2);
          var numrwd = Number(rewardx);
          rwdArray.push(numrwd);
        });
      });
      function delay() {
        return new Promise((resolve) => setTimeout(resolve, 300));
      }
      async function delayedLog(item) {
        await delay();
        var sum = item.reduce((a, b) => a + b, 0);
        var formatsum = Number(sum).toFixed(2);
        document.getElementById("earned").textContent = formatsum;
      }
      async function processArray(rwdArray) {
        for (const item of rwdArray) {
          await delayedLog(item);
        }
      }
      return processArray([rwdArray]);
    }

    async function claimit() {
      var rawnfts = await vaultcontract.methods.tokensOfOwner(account).call();
      await vaultcontract.methods.claim(rawnfts).send({ from: account })
    }

    async function unstakeall() {
      var rawNfts = await vaultcontract.methods.tokensOfOwner(account).call();
      const first25 = rawNfts.slice(0, 30)
      await vaultcontract.methods.unstake(first25).send({ from: account });
    }

    async function stakeAll() {
      var rawNfts = await contract.methods.walletOfOwner(account).call();
      const first25 = rawNfts.slice(0, 30)
      await vaultcontract.methods.stake(first25).send({
        from: account,
      });
    }

    {/**async function stakeInput() {
      const tokenIds = document.querySelector('#stake-input').value
      const nftsIds = JSON.parse("[" + tokenIds + "]");
      await vaultcontract.methods.stake(nftsIds).send({
        from: account,
      });
    }

    async function unstakeInput() {
      const tokenIds = document.querySelector('#unstake-input').value
      const nftsIds = JSON.parse("[" + tokenIds + "]");
      await vaultcontract.methods.unstake(nftsIds).send({
        from: account,
      });
    }**/}


    return (
      <div className="App nftapp">
        <nav className="navbar navbarfont navbarglow navbar-expand-md mb-4">
          <div className="container-fluid nav-container">
            <img alt="logo" className='nav-logo' style={{ width: '100px' }} src="logo.jpg" />
            <div className="collapse navbar-collapse" id="navbarCollapse">
              <ul
                className="navbar-nav me-auto mb-2 px-3 mb-md-0"
                style={{ fontSize: "25px" }}
              >
                <li className="nav-item">
                  <a style={{ color: '#fff' }} className="nav-link active" aria-current="page" href="#/">
                    Staking Page
                  </a>
                </li>
              </ul>
            </div>
          </div>
          <div className="px-5" style={{ margin: 'auto' }}>
            <input
              id="connectbtn"
              type="button"
              className="connectbutton form form-control"
              onClick={connectwallet}
              style={{ padding: '20px' }}
              value="Connect Your Wallet"

            />
          </div>
        </nav>
        <div className="container dashboard">
          <div className="row">
            <h4>Goblins Staking Dashboard</h4>
            <Button
              className="btn btn-primary btn-lg authorize"
              onClick={enable}
              style={{
                backgroundColor: "#ffffff10",
                marginBottom: '20px'
              }}
            >
              Approve Your NFT
            </Button>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">My Goblins Staking</h5>
                  <div className="row">
                    <div className="col-md-6">
                    <div>
                    <h6>Total Staked</h6>
                    <p id="stakedbalance">--</p>
                    <a href="#/" onClick={stakeAll} class="btn action-btn btn-primary">Stake All</a>
                  </div>
                    </div>
                    <div className="col-md-6">
                    <div>
                      <h6>Available in Wallet:</h6>
                      <p id="nftbalance">--</p>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="card" onLoad={rewardinfo}> 
                <div class="card-body">
                  <div className="row">
                    <div className="col-md-6">
                    <div>
                    <h6>GobToken Earned:</h6>
                    <p id="earned">--</p>
                    <div className="btn-group" role="group" aria-label="btn-group">
                    <a href="#/" onClick={rewardinfo} class="btn action-btn btn-primary">Check Reward</a>
                    <a href="#/" onClick={claimit} class="btn action-btn btn-primary">Claim</a>
                    </div>
                  </div>
                    </div>
                    <div className="col-md-6">
                    <div>
                      <h6>Available in Vault:</h6>
                      <p id="yournfts">--</p>
                      <a href="#/" onClick={unstakeall} class="btn action-btn btn-primary">Unstake All</a>
                    </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            <div className="col-md-8">
              <div className="card" style={{marginTop: '40px'}}>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <h6>Total Goblins Staked
                        <p id="totalsupply">--</p>
                      </h6>
                    </div>
                    <div className="col-md-4">
                      <h6>Daily rewards
                        <p>0.01 GobToken</p>
                      </h6>
                    </div>
                    <div className="col-md-4">
                      <h6>Max Supply
                        <p>9,999 Goblins</p>
                      </h6>
                    </div>
                  </div>
                </div>
              </div> <br/><br/>
              <div className="card">
              <div className="card-body">
                  <div className="row">
                    <div className="col-md-4">
                      <h6>GobNFT Max Supply
                        <p>210,000</p>
                      </h6>
                    </div>
                    <div className="col-md-4">
                      <h6>GobNFT Price
                        <p>--</p>
                      </h6>
                    </div>
                    <div className="col-md-4">
                      <h6>Liquidity
                        <p>$--</p>
                      </h6>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>


              <NFT />







        {/**<div className="container container-style">
          <div className="col">
            <form className="nftminter">
              <div className="row pt-3">
                <div>
                  <h1 className="pt-2" style={{ fontWeight: "30" }}>
                    Stake and Unstake
                  </h1>
                </div>
              </div>

              <h6 style={{ fontWeight: "300" }}>First time staking?</h6>
              <Button
                className="btn authorize"
                onClick={enable}
                style={{
                  backgroundColor: "#ffffff10",
                  boxShadow: "1px 1px 5px #000000",
                  marginBottom: '20px'
                }}
              >
                Authorize Your Wallet
              </Button>
              <div>
                <label style={{ fontWeight: "300", fontSize: "18px" }}>
                  Vault Options
                </label>
              </div>
              <p>
                Input your NFTs #ID sepparated by a comma (Like this
                12,13,14).
              </p>
              <p>If you don't own the NFT, the transaction will fail.</p>
              <div className="stkunstk-btn-input">
                <Button onClick={stakeInput} style={{ margin: "10px 5px", width: '25%', backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} value="stake">
                  Stake
                </Button>
                <input id='stake-input' placeholder="Input your NFTs #ID" style={{ borderColor: 'black', color: 'white', width: '70%', backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #00000", padding: '3px' }} />
                <Button onClick={unstakeInput} style={{ margin: "10px 5px", width: '25%', backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} value="unstake">
                  Unstake
                </Button>
                <input id='unstake-input' placeholder="Input your NFTs #ID" style={{ borderColor: 'black', color: 'white', width: '70%', backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000", padding: '3px' }} />
              </div>
              <br />
              <Button onClick={stakeAll} style={{ margin: "20px 10px", backgroundColor: "#ffffff10", boxShadow: "1px 1px 5px #000000" }} value="stake-all">
                Stake ALL
              </Button>
              <p>This will stake all your NFTs (Max. 25 per transaction, the same applies to unstake), the gas fee could be higher depending on how many you have.</p> <br />
            </form>
          </div>
          <div className="col vault">
            <form className="nftstaker border-0 col-sm-12" style={{ fontFamily: "SF Pro Display" }}>
              <h2
                style={{
                  borderRadius: "14px",
                  fontWeight: "300",
                  fontSize: "25px",
                }}
              >
                WenLambo NFT Staking Vault{" "}
              </h2>
              <div style={{ width: '60%', margin: 'auto' }}>
                <h6 style={{ fontWeight: "300", padding: '20px 0px' }}>If you don't authorize your wallet, transaction will fail or gas fee will be 0.99 BCH</h6>
                <Button
                  className="btn authorize"
                  onClick={enable}
                  style={{
                    backgroundColor: "#ffffff10",
                    boxShadow: "1px 1px 5px #000000",
                    marginBottom: '20px'
                  }}
                >
                  Authorize Your Wallet
                </Button>
              </div>
              <div className="row px-3">
                <div className="col">
                  <form
                    className="stakingrewards"
                    style={{
                      borderRadius: "25px",
                      boxShadow: "1px 1px 15px #ffffff",
                    }}
                  >
                    <h5 style={{ color: "#FFFFFF", fontWeight: "300" }}>
                      Your Vault Activity
                    </h5>
                    <h6 style={{ color: "#FFFFFF" }}>Verify Staked Amount</h6>
                    <Button
                      onClick={verify}
                      style={{
                        backgroundColor: "#ffffff10",
                        boxShadow: "1px 1px 5px #000000",
                      }}
                    >
                      Verify
                    </Button>
                    <table className="table mt-3 mb-5 px-3 table-dark">
                      <tr>
                        <td style={{ fontSize: "19px" }}>
                          Your Staked NFTs:
                          <span
                            style={{
                              backgroundColor: "#ffffff00",
                              fontSize: "21px",
                              color: "#39FF14",
                              fontWeight: "500",
                              textShadow: "1px 1px 2px #000000",
                            }}
                            id="yournfts"
                          ></span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "19px" }}>
                          Total Staked NFTs:
                          <span
                            style={{
                              backgroundColor: "#ffffff00",
                              fontSize: "21px",
                              color: "#39FF14",
                              fontWeight: "500",
                              textShadow: "1px 1px 2px #000000",
                            }}
                            id="stakedbalance"
                          ></span>
                        </td>
                      </tr>
                      <tr>
                        <td style={{ fontSize: "19px" }}>
                          Unstake All Staked NFTs
                          <Button
                            onClick={unstakeall}
                            className="mb-3"
                            style={{
                              backgroundColor: "#ffffff10",
                              boxShadow: "1px 1px 5px #000000",
                              display: 'block',
                              margin: 'auto'
                            }}
                          >
                            Unstake All
                          </Button>
                        </td>
                      </tr>
                    </table>
                  </form>
                </div>
                <img style={{ margin: 'auto' }} className="col-lg-4 blue-lambo" src="wenlambo-image.png" />
                <div className="col">
                  <form
                    className="stakingrewards"
                    style={{
                      borderRadius: "25px",
                      boxShadow: "1px 1px 15px #ffffff",
                      fontFamily: "SF Pro Display",
                    }}
                  >
                    <h5 style={{ color: "#FFFFFF", fontWeight: "300" }}>
                      {" "}
                      Staking Rewards
                    </h5>
                    <Button
                      onClick={rewardinfo}
                      style={{
                        backgroundColor: "#ffffff10",
                        boxShadow: "1px 1px 5px #000000",
                      }}
                    >
                      Earned RLAM Rewards
                    </Button>
                    <div
                      id="earned"
                      style={{
                        color: "#39FF14",
                        marginTop: "5px",
                        fontSize: "25px",
                        fontWeight: "500",
                        textShadow: "1px 1px 2px #000000",
                      }}
                    >
                      <p style={{ fontSize: "20px" }}>Earned Tokens</p>
                    </div>
                    <div className="col-12 mt-2">
                      <div style={{ color: "white" }}>Claim Rewards</div>
                      <Button
                        onClick={claimit}
                        style={{
                          backgroundColor: "#ffffff10",
                          boxShadow: "1px 1px 5px #000000",
                        }}
                        className="mb-2"
                      >
                        Claim
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
              <div className="row px-4 pt-2">
                <div className="header">
                  <div
                    style={{
                      fontSize: "25px",
                      borderRadius: "14px",
                      color: "#ffffff",
                      fontWeight: "300",
                    }}
                  >
                    WENLAMBO NFT Staking Pool Active Rewards
                  </div>
                  <table className="table px-3 table-bordered table-dark">
                    <thead className="thead-light">
                      <tr>
                        <th scope="col">Collection</th>
                        <th scope="col">Rewards Per Day</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr className="stakegoldeffect">
                        <td>WenLambo Legendary NFT Collection</td>
                        <td
                          className="amount"
                          data-test-id="rewards-summary-one-time"
                        >
                          <span className="amount">25</span>&nbsp;
                          <span className="currency">RLAM/NFT</span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </form>
          </div>
        </div>
        <div className="row nftportal mt-3" style={{ marginRight: '0px' }}>
          <div className="col mt-4 ml-3">
            <img src="smartbch.png" width={"60%"}></img>
          </div>
          <div className="col">
            <h1 className="n2dtitlestyle mt-3">Your NFT Portal</h1>
            <Button
              onClick={refreshPage}
              style={{
                backgroundColor: "#000000",
                boxShadow: "1px 1px 5px #000000",
              }}
            >
              Refresh NFT Portal
            </Button>
          </div>
          <div className="col mt-3 mr-5">
            <img src="smartbch.png" width={"60%"}></img>
          </div>
        </div>**/}
        </div>
    );
  }
}
export default App;
