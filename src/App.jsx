import React, { useEffect, useState } from 'react';
import './styles/App.css';
import { ethers } from "ethers";
import polygonLogo from './assets/polygonlogo.png';
import ethLogo from './assets/ethlogo.png';
import opLogo from './assets/Optimism.png';
import arbiLogo from './assets/Arbitrum.png';
import avaxLogo from './assets/Avax.png';
import xdaiLogo from './assets/gnosis.svg';
import moonLogo from './assets/Moonbeam.svg';
import hecoLogo from './assets/Heco.png';
import oktLogo from './assets/OKT.png';
import ftmLogo from './assets/Fantom.png';
import bscLogo from './assets/Binance.png';
import twitterLogo from './assets/twitter-logo.svg';
import contractAbi from './utils/contractABI.json';
import { networks } from './utils/networks.js';

// Constants
const TWITTER_HANDLE = 'kongtaoxing';
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`;

window.chainLogo = {};
window.chainId = await ethereum.request({method: 'eth_chainId'});
window.network = networks[chainId];
if (!network) chainLogo = ethLogo;
else if (network.includes("Optimism")) 
  chainLogo = opLogo;
else if (network.includes("Arbitrum")) 
  chainLogo = arbiLogo;
else if (network.includes("Avalanche")) 
  chainLogo = avaxLogo;
else if (network.includes("Polygon")) 
  chainLogo = polygonLogo;
else if (network.includes("xdai") || network.includes("Gnosis"))
  chainLogo = xdaiLogo;
else if (network.includes("Moonbeam"))
  chainLogo = moonLogo;
else if (network.includes("Binance")) 
  chainLogo = bscLogo;
else if (network.includes("Heco")) 
  chainLogo = hecoLogo;
else if (network.includes("OKeX")) 
  chainLogo = oktLogo;
else if (network.includes("Fantom")) 
  chainLogo = ftmLogo;
  
else chainLogo = ethLogo;  //Unknown network
// contract info
const tld = '.nova';
const CONTRACT_ADDRESS = '0xe86fB378d3F703D5C1322C7aBa1EB752be9D0D8A';

const App = () => {
	const [currentAccount, setCurrentAccount] = useState('');
	// Add some state data propertie
	const [domain, setDomain] = useState('');
	const [editing, setEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [record, setRecord] = useState('');
	const [mints, setMints] = useState([]);

	const connectWallet = async () => {
		try {
			const {
				ethereum
			} = window;

			if (!ethereum) {
				alert("Get MetaMask -> https://metamask.io/");
				return;
			}

			// Fancy method to request access to account.
			const accounts = await ethereum.request({
				method: "eth_requestAccounts"
			});

			// Boom! This should print out public address once we authorize Metamask.
			console.log("Connected", accounts[0]);
			setCurrentAccount(accounts[0]);
		} catch (error) {
			console.log(error)
		}
	}

	const switchNetwork = async () => {
		if (window.ethereum) {
			try {
				// Try to switch to the Mumbai testnet
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{
						chainId: '0x1a4'
					}], // Check networks.js for hexadecimal network ids
				});
			} catch (error) {
				// This error code means that the chain we want has not been added to MetaMask
				// In this case we ask the user to add it to their MetaMask
				if (error.code === 4902) {
					try {
						await window.ethereum.request({
							method: 'wallet_addEthereumChain',
							params: [{
								chainId: '0x1a4',
								chainName: 'Optimism Goerli',
								rpcUrls: ['https://goerli.optimism.io/'],
								nativeCurrency: {
									name: "Ether",
									symbol: "ETH",
									decimals: 18
								},
								blockExplorerUrls: ["https://goerli-optimism.etherscan.io/"]
							}, ],
						});
					} catch (error) {
						console.log(error);
					}
				}
				console.log(error);
			}
		} else {
			// If window.ethereum is not found then MetaMask is not installed
			alert('MetaMask is not installed. Please install it to use this app: https://metamask.io/download.html');
		}
	}

	const checkIfWalletIsConnected = async () => {
		const {
			ethereum
		} = window;

		if (!ethereum) {
			console.log('Make sure you have metamask!');
			return;
		} else {
			console.log('We have the ethereum object', ethereum);
		}

		const accounts = await ethereum.request({
			method: 'eth_accounts'
		});

		if (accounts.length !== 0) {
			const account = accounts[0];
			console.log('Found an authorized account:', account);
			setCurrentAccount(account);
		} else {
			console.log('No authorized account found');
		}

		window.chainId = await ethereum.request({
			method: 'eth_chainId'
		});
		ethereum.on('chainChanged', handleChainChanged);

		// Reload the page when they change networks
		function handleChainChanged(_chainId) {
			window.location.reload();
		}
	};

	// Create a function to render if wallet is not connected yet
	const renderNotConnectedContainer = () => (
		<div className="connect-wallet-container">
      <img src="./src/nova.gif" alt="Nova gif" />
      <button className="cta-button connect-wallet-button" onClick={connectWallet}>
        Connect Wallet
      </button>
    </div>
	);

	// Form to enter domain name and data
	const renderInputForm = () => {
		if (network !== 'Optimism Goerli') {
			return (
				<div className="connect-wallet-container">
        <p>Please connect to the Optimism Goerli Testnet</p>
        {/* This button will call our switch network function */}
        <button className='cta-button switch-button' onClick={switchNetwork}>Click here to switch</button>
      </div>
			);
		}
		return (
			<div className="form-container">
        <div className="first-row">
          <input
            type="text"
            value={domain}
            placeholder='domain'
            onChange={e => setDomain(e.target.value)}
          />
          <p className='tld'> {tld} </p>
        </div>
        <input
          type="text"
          value={record}
          placeholder='Set record to Nova!'
          onChange={e => setRecord(e.target.value)}
        />
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
            <button className='cta-button mint-button' disabled={loading} onClick={mintDomain}>
              Mint
            </button>  
          )}
      </div>
		);
	}

	const renderMints = () => {
		if (currentAccount && mints.length > 0) {
			return (
				<div className="mint-container">
        <p className="subtitle"> Recently minted domains!</p>
        <div className="mint-list">
          { mints.map((mint, index) => {
            return (
              <div className="mint-item" key={index}>
                <div className='mint-row'>
                  <a className="link" target="_blank" rel="noopener noreferrer">
                    <p className="underlined">{' '}{mint.name}{tld}{' '}</p>
                  </a>
                  {/* If mint.owner is currentAccount, add an "edit" button*/}
                  { mint.owner.toLowerCase() === currentAccount.toLowerCase() ?
                    <button className="edit-button" onClick={() => editRecord(mint.name)}>
                      <img className="edit-icon" src="https://img.icons8.com/metro/26/000000/pencil.png" alt="Edit button" />
                    </button>
                    :
                    null
                  }
                </div>
          <p> {mint.record} </p>
        </div>)
        })}
      </div>
    </div>);
		}
	};

	// This will take us into edit mode and show us the edit buttons!
	const editRecord = (name) => {
		console.log("Editing record for", name);
		setEditing(true);
		setDomain(name);
	}

	const mintDomain = async () => {
		// Don't run if the domain is empty
		if (!domain) {
			return
		}
		// Alert the user if the domain is too short
		if (domain.length < 3) {
			alert('Domain must be at least 3 characters long');
			return;
		}
		if (domain.length > 10) {
			alert('Domain must be at most 10 characters long');
		}
		// Calculate price based on length of domain (change this to match your contract)	
		// 3 chars = 0.001 ETH, 4 chars = 0.0001 ETH, 5 or more = 0.00001 ETH
		const price = domain.length === 3 ? '0.001' : domain.length === 4 ? '0.0001' : '0.00001';
		console.log("Minting domain", domain, "with price", price, "ether.");
		try {
			const {
				ethereum
			} = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

				console.log("Going to pop wallet now to pay gas...")
				let tx = await contract.register(domain, {
					value: ethers.utils.parseEther(price)
				});
				// Wait for the transaction to be mined
				const receipt = await tx.wait();

				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
					console.log("Domain minted! https://goerli-optimism.etherscan.io/tx/" + tx.hash);
					setTimeout(() => {
						fetchMints();
					}, 2000);

					setRecord('');
					setDomain('');
				} else {
					alert("Transaction failed! Please try again");
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	const updateDomain = async () => {
		if (!record || !domain) {
			return
		}
		setLoading(true);
		console.log("Updating domain", domain, "with record", record);
		try {
			const {
				ethereum
			} = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

				let tx = await contract.setRecord(domain, record);
				await tx.wait();
				console.log("Record set https://goerli-optimism.etherscan.io//tx/" + tx.hash);

				fetchMints();
				setRecord('');
				setDomain('');
			}
		} catch (error) {
			console.log(error);
		}
		setLoading(false);
	}

	const fetchMints = async () => {
		try {
			const {
				ethereum
			} = window;
			if (ethereum) {
				// You know all this
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

				// Get all the domain names from our contract
				const names = await contract.getAllNames();

				// For each name, get the record and the address
				const mintRecords = await Promise.all(names.map(async (name) => {
					const mintRecord = await contract.records(name);
					const owner = await contract.domains(name);
					return {
						id: names.indexOf(name),
						name: name,
						record: mintRecord,
						owner: owner,
					};
				}));

				console.log("MINTS FETCHED ", mintRecords);
				setMints(mintRecords);
			}
		} catch (error) {
			console.log(error);
		}
	}
	useEffect(() => {
		if (network === 'Optimism Goerli') {
			fetchMints();
		}
	}, [currentAccount, network]);

	const setData = async () => {
		try {
			const {
				ethereum
			} = window;
			if (ethereum) {
				const provider = new ethers.providers.Web3Provider(ethereum);
				const signer = provider.getSigner();
				const contract = new ethers.Contract(CONTRACT_ADDRESS, contractAbi.abi, signer);

				console.log("Going to pop wallet now to pay gas...")
				let tx = await contract.register(domain, {
					value: ethers.utils.parseEther(price)
				});
				// Wait for the transaction to be mined
				const receipt = await tx.wait();

				// Check if the transaction was successfully completed
				if (receipt.status === 1) {
					console.log("Domain minted! https://goerli-optimism.etherscan.io/tx/" + tx.hash);

					// Set the record for the domain
					tx = await contract.setRecord(domain, record);
					await tx.wait();

					console.log("Record set! https://goerli-optimism.etherscan.io/tx/" + tx.hash);

					setRecord('');
					setDomain('');
				} else {
					alert("Transaction failed! Please try again");
				}
			}
		} catch (error) {
			console.log(error);
		}
	}

	// This runs our function when the page loads.
	useEffect(() => {
		checkIfWalletIsConnected();
	}, [])

	return (
		<div className="App">
			<div className="container">

				<div className="header-container">
  <header>
    <div className="left">
      <p className="title">✨ Nova Name Service</p>
              <p className="subtitle">THe NNS is a portal to the Web3 world!</p>
    </div>
    {/* Display a logo and wallet connection status*/}
    <div className="right">
      <img alt="Network logo" className="logo" src={chainLogo} />
      { currentAccount ? <p> Wallet: {currentAccount.slice(0, 6)}...{currentAccount.slice(-4)}</p> : <p> Not connected </p> }
    </div>
  </header>
</div>

        {!currentAccount && renderNotConnectedContainer()}
        {currentAccount && renderInputForm()}
        {mints && renderMints()}

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
}

export default App;
