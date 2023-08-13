import { useEffect, useState } from "react";
import Web3 from "web3";
import contract from "../contracts/contract.json";
import Alt from "../assets/logo.png"
import OpenSea from "../assets/open-sea-logo.png"
import ImageMinter from "../assets/preview.png"

const initialInfoState = {
  connected: false,
  status: null,
  account: null,
  web3: null,
  contract: null,
  address: null,
  contractJSON: null,
};

const initialMintState = {
  loading: false,
  status: `Mint your ${contract.name} NFTs`,
  amount: 1,
  frenNumber: 1,
  supply: "0",
  frens: [],
  cost: "0",
  feedCost: "500000000000000",
  playCost: "500000000000000",
  cleanCost: "500000000000000",
  reviveCost: "50000000000000000",
};

function Minter() {
  const [info, setInfo] = useState(initialInfoState);
  const [mintInfo, setMintInfo] = useState(initialMintState);
  const [name, setName] = useState('');

  console.log(info);

  const init = async (_request, _contractJSON) => {
    if (window.ethereum.isMetaMask) {
      try {
        const accounts = await window.ethereum.request({
          method: _request,
        });
        const networkId = await window.ethereum.request({
          method: "net_version",
        });
        if (networkId == _contractJSON.chain_id) {
          let web3 = new Web3(window.ethereum);
          setInfo((prevState) => ({
            ...prevState,
            connected: true,
            status: null,
            account: accounts[0],
            web3: web3,
            contract: new web3.eth.Contract(
              _contractJSON.abi,
              _contractJSON.address
            ),
            contractJSON: _contractJSON,
          }));
        } else {
          setInfo(() => ({
            ...initialInfoState,
            status: `Change network to ${_contractJSON.chain}.`,
          }));
        }
      } catch (err) {
        console.log(err.message);
        setInfo(() => ({
          ...initialInfoState,
        }));
      }
    } else {
      setInfo(() => ({
        ...initialInfoState,
        status: "Please install metamask.",
      }));
    }
  };

  const initListeners = () => {
    if (window.ethereum) {
      window.ethereum.on("accountsChanged", () => {
        window.location.reload();
      });
      window.ethereum.on("chainChanged", () => {
        window.location.reload();
      });
    }
  };

  const getAllFrens = async () => {
    const params = {
      to: info.contractJSON.address,
      from: info.account,
      data: info.contract.methods.frens(1).encodeABI(),
    };
    try {
      const result = await window.ethereum.request({
        method: "eth_call",
        params: [params],
      });
      console.log(result);
      let resultCleaned = result.replace(/^0x+/, '');
      console.log("Important 3: "+resultCleaned);
      let resultArray = resultCleaned.match(/.{1,64}/g);
      console.log("Important 4: " +resultArray);
      
      // for(let i = 0; i < resultArray.length; i++){
      //   console.log("Important 5: " +parseInt(resultArray[i],16));
      //   newArray[i] = (parseInt(resultArray[i],16));
      // }

      //make it showing the image
      console.log(info.web3.utils.hexToNumberString(result));
      setMintInfo((prevState) => ({
        ...prevState,
        frens: info.web3.utils.hexToNumberString(result),
      }));
    } catch (err) {
      setMintInfo((prevState) => ({
        ...prevState,
        frens: [],
      }));
      getAllFrens();
    }
  };

  const getSupply = async () => {
    const params = {
      to: info.contractJSON.address,
      from: info.account,
      data: info.contract.methods.totalSupply().encodeABI(),
    };
    try {
      const result = await window.ethereum.request({
        method: "eth_call",
        params: [params],
      });
      console.log(info.web3.utils.hexToNumberString(result));
      setMintInfo((prevState) => ({
        ...prevState,
        supply: info.web3.utils.hexToNumberString(result),
      }));
    } catch (err) {
      setMintInfo((prevState) => ({
        ...prevState,
        supply: 0,
      }));
      getSupply();
    }
  };

  const getCost = async () => {
    const params = {
      to: info.contractJSON.address,
      from: info.account,
      data: info.contract.methods.generationCost().encodeABI(),
    };
    try {
      const result = await window.ethereum.request({
        method: "eth_call",
        params: [params],
      });
      console.log(info.web3.utils.hexToNumberString(result));
      setMintInfo((prevState) => ({
        ...prevState,
        cost: info.web3.utils.hexToNumberString(result),
      }));
    } catch (err) {
      setMintInfo((prevState) => ({
        ...prevState,
        cost: "0",
      }));
      getCost();
    }
  };

  const mint = async () => {
    const params = {
      to: info.contractJSON.address,
      from: info.account,
      value: String(
        info.web3.utils.toHex(Number(mintInfo.cost) * mintInfo.amount + 100000000000000) // The 100000000000000 is solving an issuse of overflow numbers when calculating the dynamic price.
      ),
      data: info.contract.methods
        .mint()
        .encodeABI(),
    };
    try {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: true,
        status: `Minting your Fren...`,
      }));
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [params],
      });
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status:
          "Nice! Your NFT will show up on Opensea, once the transaction is successful.",
      }));
      getSupply();
    } catch (err) {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status: err.message,
      }));
    }
  };

  const play = async () => {
    const params = {
      to: info.contractJSON.address,
      from: info.account,
      value: String(
        info.web3.utils.toHex(Number(mintInfo.playCost)) 
      ),
      data: info.contract.methods
        .play(mintInfo.frenNumber)
        .encodeABI(),
    };
    try {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: true,
        status: `Playing with Fren...`,
      }));
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [params],
      });
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status:
          "Nice! Your fren's happiness increased.",
      }));
      getSupply();
    } catch (err) {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status: err.message,
      }));
    }
  };

  const feed = async () => {
    const params = {
      to: info.contractJSON.address,
      from: info.account,
      value: String(
        info.web3.utils.toHex(Number(mintInfo.feedCost))
      ),
      data: info.contract.methods
        .feed(mintInfo.frenNumber)
        .encodeABI(),
    };
    try {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: true,
        status: `Feeding Fren...`,
      }));
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [params],
      });
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status:
          "Nice! Your fren's energy increased.",
      }));
      getSupply();
    } catch (err) {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status: err.message,
      }));
    }
  };

  const clean = async () => {
    const params = {
      to: info.contractJSON.address,
      from: info.account,
      value: String(
        info.web3.utils.toHex(Number(mintInfo.cleanCost))
      ),
      data: info.contract.methods
        .clean(mintInfo.frenNumber)
        .encodeABI(),
    };
    try {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: true,
        status: `Cleaning Fren...`,
      }));
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [params],
      });
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status:
          "Nice! Your fren's cleanliness increased.",
      }));
      getSupply();
    } catch (err) {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status: err.message,
      }));
    }
  };

  const revive = async () => {
    const params = {
      to: info.contractJSON.address,
      from: info.account,
      value: String(
        info.web3.utils.toHex(Number(mintInfo.reviveCost))
      ),
      data: info.contract.methods
        .revive(mintInfo.frenNumber)
        .encodeABI(),
    };
    try {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: true,
        status: `Reviving Fren...`,
      }));
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [params],
      });
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status:
          "Nice! Your fren is alive again.",
      }));
      getSupply();
    } catch (err) {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status: err.message,
      }));
    }
  };

  const setNameToFren = async () => {
    const params = {
      to: info.contractJSON.address,
      from: info.account,
      data: info.contract.methods
        .setFrenName(name, mintInfo.frenNumber)
        .encodeABI(),
    };
    try {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: true,
        status: `Setting a name to Fren...`,
      }));
      const txHash = await window.ethereum.request({
        method: "eth_sendTransaction",
        params: [params],
      });
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status:
          "Nice! Your fren has a new name.",
      }));
      getSupply();
    } catch (err) {
      setMintInfo((prevState) => ({
        ...prevState,
        loading: false,
        status: err.message,
      }));
    }
  };
  
  const updateFrenNumber = (newNumber) => {
    if (newNumber >= 1) {
      setMintInfo((prevState) => ({
        ...prevState,
        frenNumber: newNumber,
      }));
    }
  };

  const handleNameChange = (event) => {
    setName(event.target.value);
  };


  const connectToContract = (_contractJSON) => {
    init("eth_requestAccounts", _contractJSON);
  };

  useEffect(() => {
    connectToContract(contract);
    initListeners();
  }, []);

  useEffect(() => {
    if (info.connected) {
      getSupply();
      getCost();
      // getAllFrens();
      // getFrensOfConnectedUser();

    }
  }, [info.connected]);

  return (
    <div className="page" >
      
      
      <div className="card">
        <div className="card_header">
          <img className="card_header_image ns" alt={Alt} src={ImageMinter} />
        </div>
        {mintInfo.supply < contract.total_supply ? (
          <div className="card_body">
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              {/* ************** Mint start here! ************** */}
              <div style={{ width: 10 }}></div>
              <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="button"
                onClick={() => mint()}
              >
                Mint A Fren!
              </button>
            </div>

            {/* ************** Mint ends here! ************** */}
            {/* ************** Flex List start here! ************** */}

            <div
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >

              </div>
            {info.connected ? (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <p style={{ color: "var(--statusText)", textAlign: "center" }}>
                  {info.web3?.utils.fromWei(mintInfo.cost, "ether") *
                    mintInfo.amount}{" "}
                  {contract.chain_symbol}
                </p>
                <div style={{ width: 20 }}></div>
                <p style={{ color: "var(--statusText)", textAlign: "center" }}>
                  |
                </p>
                <div style={{ width: 20 }}></div>
                <p style={{ color: "var(--statusText)", textAlign: "center" }}>
                  {mintInfo.supply}/{contract.total_supply}
                </p>
              </div>
            ) : null}
            {mintInfo.status ? (
              <p className="statusText">{mintInfo.status}</p>
            ) : null}
            {info.status ? (
              <p className="statusText" style={{ color: "var(--error)" }}>
                {info.status}
              </p>
            ) : null}
          </div>
        ) : (
          <div className="card_body">
            <p style={{ color: "var(--statusText)", textAlign: "center" }}>
              {mintInfo.supply}/{contract.total_supply}
            </p>
            <p className="statusText">
              We've sold out! .You can still buy and trade the {contract.name}{" "}
              on marketplaces such as Opensea.
            </p>
          </div>
        )}
        <div className="card_footer colorGradient">
          <button
            className="button"
            style={{
              backgroundColor: info.connected
                ? "var(--success)"
                : "var(--warning)",
            }}
            onClick={() => connectToContract(contract)}
          >
            {info.account ? "Connected" : "Connect Wallet"}
          </button>
          {info.connected ? (
            <span className="accountText">
              {String(info.account).substring(0, 8) +
                "..." +
                String(info.account).substring(34)}
            </span>
          ) : null}
        </div>
        <a
          style={{
            position: "absolute",
            bottom: -25,
            left: 82.5,
            color: "#ffffff",
          }}
          target="_blank"
          href="https://polygonscan.com/address/0x15e9064bc16a1a59121556b5d99c1c5c288d9c51"
        >
          View Smart Contract
        </a>
      </div>
      <div style={{ height: 25 }}></div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 0fr)", gridGap: 30 }}>

                {/* ************** Play start here! ************** */}
                <div style={{width: 100}}>

                <div>Play with your fren and extend its happiness!</div>
                <div style={{ paddingBottom: 24 }}></div>

                <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="small_button"
                onClick={() => updateFrenNumber(mintInfo.frenNumber - 1)}
              >
                -
                </button>

                 {" #"+mintInfo.frenNumber+" "} 

                <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="small_button"
                onClick={() => updateFrenNumber(mintInfo.frenNumber + 1)}
              >
                +
              </button>

              <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="button"
                onClick={() => play()}
              >
                Play
              </button>
              </div>
                {/* ************** Play ends here! ************** */}
                {/* ************** Feed start here! ************** */}
               <div style={{width: 130}}>

                <div>Feed your Fren to increase its energy!</div>
                <div style={{ paddingBottom: 14 }}></div>
                <div style={{paddingLeft:"25px", paddingTop:"25px"}}>
                
                <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="small_button"
                onClick={() => updateFrenNumber(mintInfo.frenNumber - 1)}
                >
                -
                </button>

                {" #"+mintInfo.frenNumber+" "} 

                <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="small_button"
                onClick={() => updateFrenNumber(mintInfo.frenNumber + 1)}
                >
                +
                </button>
                </div>

                <button style={{marginLeft: 35}}
                disabled={!info.connected || mintInfo.cost == "0"}
                className="button"
                onClick={() => feed()}
                >
                Feed
                </button>
                </div>
                {/* ************** Feed ends here! ************** */}
                {/* ************** Clean start here! ************** */}
                <div style={{width: 100, paddingLeft:23}}> 

              <div style={{ width: 10 }}></div>

              <div>Keep your fren clean and increase its cleanliness! </div>
              <div style={{ paddingTop: 10 }}></div>

              <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="small_button"
                onClick={() => updateFrenNumber(mintInfo.frenNumber - 1)}
              >
                -
                </button>

                {" #"+mintInfo.frenNumber+" "} 

                <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="small_button"
                onClick={() => updateFrenNumber(mintInfo.frenNumber + 1)}
              >
                +
              </button>

              <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="button"
                onClick={() => clean()}
              >
                Clean 
              </button>
              </div>
                {/* ************** Clean ends here! ************** */}


      </div>
              {/* ************** Set Name start here! ************** */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 0fr)", gridGap: 10  , paddingTop:40}}>
              <div style={{width: 320}}> 

              <div style={{ width: 10 }}></div>

              <div>You can give your fren a unique name! </div>
              {/* ************** needs to have an input text area here! ************** */}
              
              <div style={{ width: 10, paddingBottom:10 }}></div>

              <div>Choose your Fren: </div>
              <div style={{ width: 10, paddingBottom:10 }}></div>

              <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="small_button"
                onClick={() => updateFrenNumber(mintInfo.frenNumber - 1)}
              >
                -
                </button>

                {" #"+mintInfo.frenNumber+" "} 

                <button
                disabled={!info.connected || mintInfo.cost == "0"}
                className="small_button"
                onClick={() => updateFrenNumber(mintInfo.frenNumber + 1)}
              >
                +
              </button>

              
              <div>
              <h1>How do you want to name your fren?</h1>
              <div style={{ paddingBottom: 10 }}></div>
              <input type="text" value={name} onChange={handleNameChange} />
              <p>Your new fren name will be:</p> <div style={{color:"#d912c8"}}>{name}</div>
            </div>


              <button
                disabled={!info.connected }
                className="button"
                onClick={() => setNameToFren()}
              >
                Set Name 
              </button>
              </div>
            {/* ************** Set Name ends here! ************** */}

            {/* ************** Revive start here! ************** */}

            <div style={{width: 100}}> 

            <div style={{ width: 10 }}></div>

            <div>If your fren is dead use this! </div>
            <div style={{ paddingBottom: 24 }}></div>

            <button
              disabled={!info.connected || mintInfo.cost == "0"}
              className="small_button"
              onClick={() => updateFrenNumber(mintInfo.frenNumber - 1)}
            >
              -
              </button>

              {" #"+mintInfo.frenNumber+" "} 

              <button
              disabled={!info.connected || mintInfo.cost == "0"}
              className="small_button"
              onClick={() => updateFrenNumber(mintInfo.frenNumber + 1)}
            >
              +
            </button>

            <button
              disabled={!info.connected || mintInfo.cost == "0"}
              className="button"
              onClick={() => revive()}
            >
              Revive 
            </button>
            </div>
            {/* ************** Revive ends here! ************** */}

            {/* ************** text area starts here! ************** */}

  </div>

  <div style={{color:"#c2feff", textAlign:"center" }}>
    
  <div style={{ height: 30 }}></div>


      <div>
      <div style={{backgroundColor: "#5112d9", padding: "20px"}}>
        <p style={{color: "#222", fontWeight: "bold" , color:"white"}}>👋 Welcome to Frens On Chain!</p>
        <p style={{color: "#222", color:"white"}}>🐶 Frens On Chain are 100% on-chain generated, dynamic NFTs and your new on-chain frens!</p>
        <p style={{color: "#222", color:"white"}}>🍽️ Take care of your fren by feeding it, playing with it and cleaning it!</p>
        <p style={{color: "#222", color:"white"}}>👀 Your fren will appreciate that and its appearance will change accordingly!</p>
        <p style={{color: "#222", color:"white"}}>🌟 Remember, Frens On Chain last forever!</p>
      </div>
    </div>

    <div style={{ height: 30 }}></div>

      <div style={{fontSize:14}}>
        How to play Frens On Chain:
      </div>
      <div style={{ height: 20 }}></div>

      </div>

      <ul class="a" >
      {/* <li >Frens On Chain : <div style={{color:"#c2feff"}}><i>on chain frens last forever. </i></div></li> */}
      <li>Step 1: Meet Your Fren!</li>
      <div style={{ height: 10 }}></div>
      <ul>Mint your Fren through the dynamic NFT process and witness the magic of on-chain generation.<br/> Each Fren is a one-of-a-kind companion that you can name, love, and care for!</ul>
      <div style={{ height: 10 }}></div>
      <li>Step 2: Nurture and Care!</li>
      <div style={{ height: 10 }}></div>
      <ul>Your Fren comes with three essential attributes: Happiness, energy, and cleanliness.<br/> Just like real pets, these attributes need your attention to thrive. Each day, they decrease by one. Keep a close eye on them!</ul>
      <div style={{ height: 10 }}></div>
      <li>Step 3: Be the Ultimate Caretaker!</li>
      <div style={{ height: 10 }}></div>
      <ul>Interact with your Fren using fun functions:</ul>
      <ul>🍔 Feed: Boost your Fren's energy by 3 points with a scrumptious meal! Keep them energized and ready for exciting adventures.</ul>
      <ul>🎮 Play: Make your Fren's day with some playtime fun! Increase their happiness by 3 points and watch their joyous expressions light up your screen.</ul>
      <ul>🚿 Clean: Keep your Fren sparkling clean and happy by raising their cleanliness by 3 points. A clean Fren is a happy Fren!</ul>
      <div style={{ height: 10 }}></div>
      <li>Step 4: Mood Magic!</li>
      <div style={{ height: 10 }}></div>
      <ul>Watch your Fren's mood transform based on their attributes:</ul>
      <ul>😄 Happy Fren: All attributes above 70! Your Fren will wear a big, bright smile, radiating pure happiness.</ul>
      <ul>😊 Natural Fren: All attributes above 40. The smile takes a break, showcasing a calm and content demeanor.</ul>
      <ul>😢 Sad Fren: If any attribute dips below 40, your Fren will visibly express their sadness, signaling that they need your attention and care.</ul>
      <div style={{ height: 10 }}></div>
      <li>Step 5: Dynamic Evolution!</li>
      <div style={{ height: 10 }}></div>
      <ul>Your Fren's appearance changes as their attributes change. Witness your Fren's image dynamically adapt to their mood and attributes, making every interaction a delightful surprise!</ul>
      <div style={{ height: 10 }}></div>
      <li>Step 6: Cherish and Revive!</li>
      <div style={{ height: 10 }}></div>
      <ul>Remember, your Fren depends on you for their well-being. If any attribute drops below 0, your Fren will need your help to revive. <br/>Use the revive function, but keep in mind, there's a small fee. <br/>Take care of your Fren to avoid this sad situation!</ul>
      <div style={{ height: 10 }}></div>
      <li>Step 7: Get Ready to Fren-gage!</li>
      <div style={{ height: 10 }}></div>

      <ul>Frens On Chain is all about fostering a meaningful bond with your digital pet. Experience the joy of nurturing, playing, and connecting with your Fren in the on-chain universe.<br/> Let's create memories and embark on this heartwarming adventure together! So, what are you waiting for? Start your Fren journey now and let the Fren-tastic times roll!</ul>
      </ul  >
      <div style={{color:"#c2feff"}}>
      On chain frens last forever.
      </div>
      <div style={{ height: 30 }}></div>

      {/* <div style={{color:"#c2feff", textAlign:"center", marginTop: "10px", padding: "20px", backgroundColor: "#222"}}>
    <p>Welcome to Frens On Chain: Your Digital Pet Adventure!</p>
    <p>🌟 Get Ready to Embark on a Fren-tastic Journey! 🌟</p>
    <p>Take care of your fren by feeding it, playing with it and cleaning it.</p>
    <p>Are you ready to dive into the world of adorable, on-chain companions? <br/> Say hello to your new digital friend, your Fren! Get ready to nurture, play, and build a lifelong bond with your unique on-chain buddy.</p>
    <p>Remember, Frens On Chain last forever!</p>
  </div>
  <div style={{ height: 20 }}></div> */}

            {/* ************** text area ends here! ************** */}

      <div> 
        <a href="https://opensea.io/collection/aquaticwars" target="_blank" rel="noopener noreferrer">
        <img src={OpenSea} height={40} width={40}/>
        </a>
      </div>
      <div style={{ height: 30 }}></div>
    </div>
  );
}

export default Minter;
