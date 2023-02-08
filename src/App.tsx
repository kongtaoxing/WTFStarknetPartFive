import React, { useEffect, useState } from 'react';
import { ethers } from "ethers";
import {
  type ConnectOptions,
  type DisconnectOptions,
  connect,
  disconnect,
} from "get-starknet";
import { stark, uint256, AccountInterface, constants } from "starknet"
import './styles/App.css';
import ethLogo from './assets/ethlogo.png';
import twitterLogo from './assets/twitter-logo.svg';

// Constants
const TWITTER_HANDLE = 'WTFAcademy_';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

window.chainLogo = {};
chainLogo = ethLogo;

// contract info
const ETHER_ADDRESS = '0x049d36570d4e46f48e99674bd3fcc84644ddd6b96f7c741b1562b82f9e004dc7';
const NFT_ADDRESS = '0x06fba4abcca41b2ae445f6c97d1da9e71567a560be908bc2df7606635c9057f8';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState<string>();
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [record, setRecord] = useState('');
	const [mints, setMints] = useState([]);
  const [value, setValue] = useState();
  const [chain, setChain] = useState("localhost")
  const [isConnected, setConnected] = useState(false)
  const [account, setAccount] = useState<AccountInterface | null>(null)

  const connectWallet = async () => {
    const windowStarknet = await connect({
      modalMode: "alwaysAsk"
    })
    await windowStarknet?.enable({ starknetVersion: "v4" } as any)
    return windowStarknet;
  }

  const handleDisconnect = async () => {
    await disconnect({ clearLastWallet: true });
    setAccount(account => { return null })
    setCurrentAccount(currentAccount => { return ""; })
    setChain(chain => { return "localhost"; })
    setConnected(connected => {return false})
  }

  async function chainId(id) {
    if (id === constants.StarknetChainId.MAINNET) {
      return "mainnet-alpha"
    } else if (id === constants.StarknetChainId.TESTNET) {
      return "goerli-alpha"
    } else {
      return "localhost"
    }
  }
  
  const handleConnectClick = async () => {
    try {
      const wallet = await connectWallet()
      if (wallet?.account) {
        setAccount(account => { return wallet.account })
        setCurrentAccount(currentAccount => { return wallet.account.address; })
        let chainName = await chainId(wallet?.provider.chainId);
        setChain(() => { return chainName; });
        setConnected(connected => {return !!wallet?.isConnected})
        console.log('current account:', currentAccount)
      }
    }
    catch(e) {
      console.log(e.message);
      if (e.message.includes('User abort')) { /*ignore*/ }
    }
  }
  
	// Create a function to render if wallet is not connected yet
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
      <img src="./src/WTF.png" alt="WTF png" />
      <br></br>
      <button className="cta-button connect-wallet-button" onClick={handleConnectClick}>
        Connect Wallet
      </button>
    </div>
	);

	// Form to enter domain name and data
	const renderInputForm = () => {
		if (chain !== 'goerli-alpha') {
      console.log('chain:', chain)
			return (
				<div className="connect-wallet-container">
        <p>Please Switch to StarkNet Goerli Testnet</p>
      </div>
			);
		}
		return (
			<div className="form-container">
        <div className="first-row">
          <input
            type="text"
            value={value}
            placeholder='ETH Donate to WTF Academy'
            onChange={e => setValue(e.target.value)}
          />
        </div>
          {/* If the editing variable is true, return the "Set record" and "Cancel" button */}    
          {editing ? (
            <div className="button-container">
              {/* This will call the updateDomain function we just made */}
              <button className='cta-button mint-button' disabled={loading} onClick={updateDomain}>
                Set record
              </button>  
              {/* This will let us get out of editing mode by setting editing to false */}
              <button className='cta-button mint-button' onClick={() => {setEditing(false)}}>
                Cancel
              </button>  
            </div>
          ) : (
            // If editing is not true, the mint button will be returned instead
            <button className='cta-button mint-button' disabled={loading} onClick={claimNFT}>
              Mint
            </button> 
          )}
      </div>
		);
	}

  const claimNFT = async () => {
    console.log(chain)
    try {
      const uint = uint256.bnToUint256(ethers.utils.parseEther(value)._hex);
      const callTx = account.execute([{
            contractAddress: ETHER_ADDRESS,
            entrypoint: "transfer", 
            calldata: 
              stark.compileCalldata({
                recipient: '0x05f3f4C2dE5e1091ecf810832110D32d4F449c071790B57d9C807Bb670f47572',
                amount: {type: 'struct', low: uint.low, high: uint.high},
              })
          },
          {
            contractAddress: NFT_ADDRESS,
            entrypoint: "mint",
            calldata: []
            //   stark.compileCalldata({
            //   amount: {type: 'struct', low: value1, high: '0'},
            // })
          }]);
      await account.provider.waitForTransaction(callTx.transaction_hash);
      console.log('Txn hash is:', callTx.transaction_hash);
    }
    catch (error) {
      console.log(error);
    }
  }
    
	return (
		<div className="App">
			<div className="container">

				<div className="header-container">
  <header>
    <div className="left">
      <p className="title">✨ Mint Certificate</p><br></br>
      <p className="subtitle">Congratulations, you have a passed WTF StarkNet course! Connect your wallet and Mint the certificate on StarkNet!</p>
    </div>
    {/* Display a logo and wallet connection status*/}
    <div className="right">
      <img alt="Network logo" className="logo" src={chainLogo} />
      { currentAccount ? <button onClick = {handleDisconnect} className = 'ru-button'> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</button> : <p> Not Connected </p> }
    </div>
  </header>
</div>

        {!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}

        <div className="footer-container">
					<img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
					<a
						className="footer-text"
						href={TWITTER_LINK}
						target="_blank"
						rel="noreferrer"
					>{`built with @${TWITTER_HANDLE}`}</a>
				</div>
			</div>
		</div>
	);
}

export default App;
