import React, {useEffect, useState} from "react";
import './styles/App.css';
import twitterLogo from './assets/twitter-logo.svg';
import nftService from "./service";
import miningGif from "./assets/mining.gif"
import logo from "./assets/logo.svg"
import Web3 from "web3";
import ChainLogo from './assets/ChainLogos'
import detectEthereumProvider from '@metamask/detect-provider';
import {Alert, Button, FormSelect, Navbar, OverlayTrigger, Tooltip} from 'react-bootstrap'
import ErrorMessage from "./ErrorMessage";


const networks = {
  polygon: {
    chainId: `0x${Number(137).toString(16)}`,
    chainName: "Polygon Mainnet",
    nativeCurrency: {
      name: "MATIC",
      symbol: "MATIC",
      decimals: 18
    },
    rpcUrls: ["https://polygon-rpc.com/"],
    blockExplorerUrls: ["https://polygonscan.com/"]
  },
  bsc: {
    chainId: `0x${Number(56).toString(16)}`,
    chainName: "Binance Smart Chain Mainnet",
    nativeCurrency: {
      name: "Binance Chain Native Token",
      symbol: "BNB",
      decimals: 18
    },
    rpcUrls: [
      "https://bsc-dataseed1.binance.org",
      "https://bsc-dataseed2.binance.org",
      "https://bsc-dataseed3.binance.org",
      "https://bsc-dataseed4.binance.org",
      "https://bsc-dataseed1.defibit.io",
      "https://bsc-dataseed2.defibit.io",
      "https://bsc-dataseed3.defibit.io",
      "https://bsc-dataseed4.defibit.io",
      "https://bsc-dataseed1.ninicoin.io",
      "https://bsc-dataseed2.ninicoin.io",
      "https://bsc-dataseed3.ninicoin.io",
      "https://bsc-dataseed4.ninicoin.io",
      "wss://bsc-ws-node.nariox.org"
    ],
    blockExplorerUrls: ["https://bscscan.com"]
  }
};

const changeNetwork = async ({ networkName, setError }) => {
  try {
    if (!window.ethereum) throw new Error("No crypto wallet found");
    await window.ethereum.request({
      method: "wallet_addEthereumChain",
      params: [
        {
          ...networks[networkName]
        }
      ]
    });
  } catch (err) {
    setError(err.message);
  }
};

const TWITTER_HANDLE = 'goldfinch_fi';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

const App = () => {
  const [mining, setMining] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [openSeaUrl, setOpenSeaUrl] = useState();
  const [currentAccount, setCurrentAccount] = useState('')
  const [isLogged, setIsLogged] = useState(false)
  const [currentChainID, setCurrentChainID] = useState(-1)
  const [error, setError] = useState();

  const handleNetworkSwitch = async (networkName) => {
    setError();
    await changeNetwork({ networkName, setError });
  };

  const networkChanged = (chainId) => {
    console.log({ chainId });
  };

  useEffect(() => {
    window.ethereum.on("chainChanged", networkChanged);

    return () => {
      window.ethereum.removeListener("chainChanged", networkChanged);
    };
  }, []);

  const SignIn = async () => {
    //Detect Provider
    const provider = await detectEthereumProvider()
    const web3 = new Web3(provider)

    if(!provider) {

      setMessage(messages => [...messages, {head : "Wallet not found", body: `Please install MetaMask!`, variant: 'warning'}])

    } else {

      const address = await ConnectWallet()
      if (address)
        setMessage(messages =>[...messages, {head : "User Login", body: `addres: ${address}`, variant: 'success'}])

    }

  }



  const ConnectWallet = async () => {

    console.log("Try Connect");

    try {
      await window.ethereum.enable();

      const id = await window.ethereum.request({ method: 'eth_chainId' })
      setCurrentChainID(() => parseInt(id, 16))

      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' })
      setIsLogged(true)
      setCurrentAccount(accounts[0])
      return accounts[0]

    } catch(err) {
      if (err.code === 4001) {
        // EIP-1193 userRejectedRequest error
        // If this happens, the user rejected the connection request.
        console.log('Please connect to MetaMask.')
        setMessage(messages =>[...messages, {head : "User Rejected Request", body: 'Please connect to MetaMask.', variant: 'info'}])

      } else if(err.code === -32002) {
        console.log('Please unlock MetaMask.')
        setMessage(messages =>[...messages, {head : "User Request Pending", body: 'Please unlock MetaMask and try agin.', variant: 'info'}])
      } else {
        console.error(err);
        setMessage(messages =>[...messages, {head : "Error", body: err.message, variant: 'info'}])
      }

    }

  }

  const handleAccountsChanged = (accounts) => {

    console.log('handleAccountsChanged');

    if (accounts.length === 0) {
      // MetaMask is locked or the user has not connected any accounts
      setMessage(messages => [...messages, {head : "User Rejected Request", body: 'Please connect to MetaMask.', variant: 'info'}])
    } else if (accounts[0] !== currentAccount) {
      console.log(accounts[0])
      console.log(messages);
      setCurrentAccount(() => accounts[0])
      setMessage(messages => [...messages, {head : "Account Changed", body: `addres: ${accounts[0]}`, variant: 'warning'}])
    }
  }

  useEffect(() => {

  }, []);

  const SignOut = async () => {
    setIsLogged(false)
    setCurrentAccount('')
  }

  const shortAddr = () => {
    return `${currentAccount.substr(0,4)}...${currentAccount.substring(currentAccount.length - 4, currentAccount.length)}`
  }



  const [messages, setMessage] = useState([

  ])
  const [nftType, setNftType] = useState("1");

  const Message = (props) => {

    const [show, setShow] = useState(true);

    const close = () => {
      setShow(false)
      setMessage(messages.filter((item, index) => index !== props.id))
    }

    if(show) {
      return (
          <Alert variant={props.variant ? props.variant : 'dark'} onClose={close} dismissible>
            <Alert.Heading>{props.head}</Alert.Heading>
            <p>
              {props.body}
            </p>
          </Alert>
      )
    } else {
      return(<></>)
    }


  }

  const Chain = (props) => {

    const chainId = props.chainId

    let chainLogo
    let variant
    let chainName

    switch (chainId) {
      case 1: //ETH
        chainLogo = ChainLogo.eth
        variant = "light"
        chainName = "Ethereum Network"
        break;
      case 56: //BNB
        chainLogo = ChainLogo.bnb
        variant = "secondary"
        chainName = "Binance Smart Chain"
        break;
      case 128: //HT
        chainLogo = ChainLogo.ht
        variant = "light"
        chainName = "Heco"
        break;
      case 100: //xDai
        chainLogo = ChainLogo.xdai
        variant = "light"
        chainName = "xDai Stable Chain"
        break;
      case 137: //Polygon
        chainLogo = ChainLogo.polygon
        variant = "light"
        chainName = "Polygon Network"
        break;
      default: // Unknown network
        chainLogo = ChainLogo.unknown
        variant = "light"
        chainName = "Unknown network?"
        break;
    }

    return(
        <OverlayTrigger
            key="left"
            placement="left"
            overlay={
              <Tooltip id={`tooltip-left`}>
                {chainName}
              </Tooltip>
            }
        >
          <Button variant={variant} >
            <img src={chainLogo} width={14} alt={chainName} />
          </Button>
        </OverlayTrigger>
    )
  }


  const listenerCallback = account => (receiver, imageUrl, contractAddress, tokenId) => {
    console.log("ListenerCallBack account=", account, receiver, imageUrl, contractAddress, tokenId);
    if (receiver.toUpperCase() !== account.toUpperCase())
      return;
    setImageUrl(imageUrl);
    setOpenSeaUrl(`https://opensea.io/assets/${contractAddress}/${tokenId}`);
  };

  const handleClickMint = async () => {
    setMining(true);
    await nftService.askContractToMintNft(nftType, currentAccount);
    setMining(false);
  }

  const checkIfWalletIsConnected = async () => {
    const { ethereum } = window;

    if (!ethereum) {
      console.log("Make sure you have metamask!");
      return;
    } else {
      console.log('asdf')
    }

    const accounts = await ethereum.request({ method: 'eth_accounts' });

    if (accounts.length !== 0) {
      const account = accounts[0];
      setCurrentAccount(account);
      nftService.setupEventListener(listenerCallback(account));
    } else {
      console.log("No authorized account found");
    }
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, [])

  const nftTypes = [
    {label: 'Participant', value: "1"},
    {label: 'Top50 Participant', value: "2"},
    {label: 'Top Community Manager', value: "3"},
  ];

  return (
    <div className="App">
      <Navbar className="justify-content-between" variant="dark">
        <img src={logo} width={50} height={50} className="logo"  />
        <div>
          <button
              onClick={() => handleNetworkSwitch("polygon")}
              className="cta-button connect-wallet-button"
              style={{visibility: isLogged ? "visible" : "hidden", height: "38px", marginRight: "20px"}}
          >
            Switch to Polygon
          </button>
          <ErrorMessage message={error} />
          <button className="cta-button connect-wallet-button" style={{height: "38px"}} disabled={isLogged} onClick={SignIn} variant="primary">{isLogged ? shortAddr() : "Connect"}</button>{' '}
          <Button onClick={SignOut} style={{visibility: isLogged ? "visible" : "hidden"}} variant="danger">X</Button>
        </div>
      </Navbar>

      <div className="message-list" >
        {
          messages.map((item,i) => (
              <Message head={item.head} body={item.body} variant={item.variant} id={i} key={i} />
          ))
        }
      </div>

      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">Goldfinch Flight Academy</p>
          <p className="sub-text">
            Earn your <FormSelect style={{width: "auto", display: 'inline-flex'}} onChange={e=>setNftType(e.target.value)} options={nftTypes}>
              <option value="1">GF Flight Academy Participant</option>
              <option value="2">GF Contributor</option>
            </FormSelect>&#39;s NFT
          </p>
          <p style={{color: "red"}}>*Use ONLY Polygon Network</p>
          <button onClick={handleClickMint} style={{visibility: isLogged ? "visible" : "hidden"}} className="cta-button connect-wallet-button">
              Mint NFT
            </button>
          <div style={{height: 100}} />
          {mining && <img src={miningGif} width={100} height={100}/>}
        </div>

        {(imageUrl.length > 0) && (
          <div>
            <a
              className="footer-text"
              href={openSeaUrl}
              target="_blank"
              rel="noreferrer"
            >View on OpenSea</a>
            <div>
            <img src={imageUrl} height={300} width={300}/>
            </div>
          </div>
        )}

        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`built by @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  );
};

export default App;
