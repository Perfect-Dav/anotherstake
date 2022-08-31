/* eslint-disable array-callback-return */
import '../styles/App.css';
import { Button } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import React from 'react';
import { useEffect, useState } from 'react'
import 'sf-font';
import VAULTABI from '../blockchain/ABIs/VAULTABI.json';
import { NFTCONTRACT, STAKINGCONTRACT, nftpng } from '../blockchain/config';
import Web3 from 'web3';
import ABI from '../blockchain/ABIs/ABI.json';

var account = null;
var vaultcontract = null;
var nftcontract = null;

export default function NFT() {
  const [apicall, getNfts] = useState([])
  const [nftstk, getStk] = useState([])
  const [loadingState, setLoadingState] = useState('not-loaded')

  useEffect(() => {
    callApi()
  }, [])


  async function callApi() {
    var web3 = new Web3(window.ethereum);
    await window.ethereum.send("eth_requestAccounts");
    var accounts = await web3.eth.getAccounts();
    account = accounts[0];
    // document.getElementById("wallet-address").textContent = account;
    nftcontract = new web3.eth.Contract(ABI, NFTCONTRACT);
    vaultcontract = new web3.eth.Contract(VAULTABI, STAKINGCONTRACT);



    const tokensOwned = await nftcontract.methods.walletOfOwner(account).call();
    const nfts = tokensOwned.map((id) => (
      {
        token_id: id,
        ownerOf: account,
      })
    );

    const vaultOwned = await vaultcontract.methods.tokensOfOwner(account).call();
    const nftStaked = vaultOwned.map((id) => (
      {
        token_id: id,
        ownerOf: STAKINGCONTRACT,
      })
    );


    if (tokensOwned.length !== 0) {
      const apicall = await Promise.all(nfts.map(async (i) => {
        let item = {
          tokenId: i.token_id,
          holder: i.ownerOf,
          wallet: account,
        }
        return item
      }))
      const stakednfts = await vaultcontract.methods.tokensOfOwner(account).call()
        .then(id => {
          return id;
        })
      const nftstk = await Promise.all(stakednfts.map(async i => {
        let stkid = {
          tokenId: i,
        }
        return stkid
      }))
      getNfts(apicall)
      getStk(nftstk)
      setLoadingState('loaded')
    } else {
      const apicall = await Promise.all(nftStaked.map(async (i) => {
        let item = {
          tokenId: i.token_id,
          holder: i.ownerOf,
          wallet: account,
        }
        return item
      }))
      const stakednfts = await vaultcontract.methods.tokensOfOwner(account).call()
        .then(id => {
          return id;
        })
      const nftstk = await Promise.all(stakednfts.map(async i => {
        let stkid = {
          tokenId: i,
        }
        return stkid
      }))
      getNfts(apicall)
      getStk(nftstk)
      setLoadingState('loaded')
    }
  }

  if (loadingState === 'loaded' && !apicall.length)
    return (
      <h1 className="text-3xl">You don't have any NFT. You can Mint or Get on Oasis.</h1>)
  return (
    <div className="container">
      <h4>GOBLIN'S ZONE</h4>
      <div className="row">
        {apicall.map((nft, i) => {
          var owner = nft.wallet;
          if (owner.indexOf(nft.holder) !== -1) {
            async function stakeit() {
              vaultcontract.methods.stake([nft.tokenId]).send({ from: account });
            }
            return (
              <div className='col-md-3'>
                <div className="card nft-card" key={i} >
                  <div className="image-over">
                    <img className="card-img-top" src={nftpng + nft.tokenId + '.png'} alt={nft.tokenId + 'image'} />
                  </div>
                  <div className="card-caption col-12 p-0">
                    <div className="card-body">
                      <h5 className="mb-0">Goblins NFT #{nft.tokenId}</h5>
                      <div className="card-bottom d-flex justify-content-between">
                        <Button className='action-btn' onClick={stakeit}>Stake #{nft.tokenId}</Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          }
        })}
        {nftstk.map((nft, i) => {
          async function unstakeit() {
            vaultcontract.methods.unstake([nft.tokenId]).send({ from: account });
          }
          return (
            <div className='col-md-3'>
              <div className="card nft-card" key={i} >
                <div className="image-over">
                  <img className="card-img-top" src={nftpng + nft.tokenId + '.png'} alt={nft.tokenId + 'image'} />
                </div>
                <div className="card-caption col-12 p-0">
                  <div className="card-body">
                    <h5 className="mb-0">Goblins NFT #{nft.tokenId}</h5>
                    <div className="card-bottom d-flex justify-content-between">
                      <Button className='action-tn' style={{backgroundColor: '#d3d08d', padding: '14px', width: '126px', border: 'none', maxWidth: '100%'}}  onClick={unstakeit}>UnStake #{nft.tokenId}</Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}