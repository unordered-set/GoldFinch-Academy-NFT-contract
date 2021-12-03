import { fetchJson } from "@ethersproject/web";
import { ethers } from "ethers";
const GoldFinchContractABI = require('./assets/GoldFinchAcademyParticipantNFT.json');

const { MerkleTree } = require('merkletreejs');
const keccak256 = require('keccak256');
const tokens = require('./assets/tokens.json');

const CONTRACT_ADDRESS = "0x0F69A91e79936549baE6C9BFBEfCAA184e81d4bE";
const EXPLORER_LINK = "https://mumbai.polygonscan.com/tx/";

function hashToken(tokenId, account) {
  return Buffer.from(ethers.utils.solidityKeccak256(['uint256', 'address'], [tokenId, account]).slice(2), 'hex')
}

const nftService = {
  askContractToMintNft: async (nftType, account) => {
    const mayBeEntry = Object.entries(tokens).filter(z => (z[0][0] === nftType && z[1].toUpperCase() === account.toUpperCase()));
    if (mayBeEntry.length !== 1) {
      console.error("Account", account, "is not whitelisted");
      alert(`Account ${account} is not whitelisted for this type of NFT!`);
      return;
    }
    const tokenId = mayBeEntry[0][0];
    const merkleTree = new MerkleTree(Object.entries(tokens).map(token => hashToken(...token)), keccak256, { sortPairs: true });
    const proof = merkleTree.getHexProof(hashToken(tokenId, account));

    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, GoldFinchContractABI.abi, signer);

        console.log("Going to pop wallet now to pay gas for _minting(tokenId=", tokenId, ", proof=", proof);
        let nftTxn = await connectedContract.redeem(account, tokenId , proof)

        console.log("Mining...please wait.")
        await nftTxn.wait();
        
        console.log(`Mined, see transaction: ${EXPLORER_LINK}${nftTxn.hash}`);

      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  },

  getNumMinted: async (account) => {
    try {
      const { ethereum } = window;

      if (ethereum) {
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, GoldFinchContractABI.abi, signer);

        console.log("TRYING", connectedContract);
        let tx = await connectedContract.balanceOf(account)

        return tx;
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  },

  setupEventListener: async (callback) => {
    // Most of this looks the same as our function askContractToMintNft
    try {
      const { ethereum } = window;

      if (ethereum) {
        // Same stuff again
        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const connectedContract = new ethers.Contract(CONTRACT_ADDRESS, GoldFinchContractABI.abi, signer);

        // THIS IS THE MAGIC SAUCE.
        // This will essentially "capture" our event when our contract throws it.
        // If you're familiar with webhooks, it's very similar to that!
        connectedContract.on("Transfer", async (from, to, tokenId) => {
          console.log("OnTrasfer", from, to, tokenId);
          const metadataUrl = await connectedContract.tokenURI(tokenId);
          const metadataResponse = await fetch(metadataUrl);
          const metadataBody = await metadataResponse.json();
          const imageUrl = metadataBody.image;
          // At this point we don't know who minted the token, so we are going to call
          // callback may be more often than needed, but it should protect itself.
          callback(to, imageUrl, CONTRACT_ADDRESS, tokenId);
        });

        console.log("Setup event listener!")
      } else {
        console.log("Ethereum object doesn't exist!");
      }
    } catch (error) {
      console.log(error)
    }
  },
}

export default nftService;
