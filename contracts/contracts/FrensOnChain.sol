// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Base64.sol";
import "./FrenStates1.sol";
import "./FrenStates2.sol";



contract FrensOnChain is ERC721Enumerable, Ownable {
  using Strings for uint256;
  using Strings for int256;

   struct Fren { 
      string name;
      string givenName;
      string description;
      int256 happiness;
      int256 energy;
      int256 cleanliness;
      string frenColor1;
      string frenColor2;
      string frenColor3;
      string frenColor4;
      uint256 bornTimestamp;
   }
   
   mapping (uint256 => Fren) public frens;
   mapping (address => uint256[]) public frensOfOwner;
   uint256 public generationCost = 0.005 ether;
   uint256 public feedCost = 0.0005 ether;
   uint256 public cleanCost = 0.0005 ether;
   uint256 public playCost = 0.0005 ether;
   uint256 public reviveCost = 0.05 ether;

  //  event Eaten (uint256 indexed _eaterId, uint256 indexed _eatenId);
   
   constructor() ERC721("FrensOnChain", "FRENS") {}

  function mint() public payable  {
    uint256 supply = totalSupply();
    
    Fren memory newFren = Fren(
        string(abi.encodePacked('Frens On Chain #', uint256(supply + 1).toString())), 
        "",
        "Frens On Chain is 100% on-chain, dynamic, NFT game. Frens On Chain last forever.",
        101,
        101,
        101,        
        randomNum(361, block.prevrandao, supply).toString(),
        randomNum(361, block.timestamp, supply+30).toString(),
        randomNum(101, block.prevrandao, block.timestamp).toString(),
        randomNum(361, block.prevrandao, supply+10).toString(),
        block.timestamp
        );
    
    if (msg.sender != owner()) {
      require(msg.value >= generationCost);
    }
    
    frens[supply + 1] = newFren;
    frensOfOwner[msg.sender].push(supply + 1);
    _safeMint(msg.sender, supply + 1);
    generationCost = (generationCost * 101) / 100;

}

  function randomNum(uint256 _mod, uint256 _seed, uint _salt) public view returns(uint256) {
      uint256 num = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, _seed, _salt)));
      num = uint(keccak256(abi.encodePacked(block.timestamp, msg.sender, _seed, _salt, num))) % _mod;
      return num;
  }

  function feed(uint256 _tokenId) payable public {
    require(_exists(_tokenId),"ERC721Metadata: Query for nonexistent token");
    require(isAlive(_tokenId),"That Fren is dead!");
    require(ownerOf(_tokenId) == msg.sender,"You are not the owner's of the Fren");
    require(msg.value >= feedCost);
    Fren storage fren = frens[_tokenId];
    fren.energy = fren.energy + 3;
  }

  function clean(uint256 _tokenId) payable public {
    require(_exists(_tokenId),"ERC721Metadata: Query for nonexistent token");
    require(isAlive(_tokenId),"That Fren is dead!");
    require(ownerOf(_tokenId) == msg.sender,"You are not the owner's of the Fren");
    require(msg.value >= cleanCost);
    Fren storage fren = frens[_tokenId];
    fren.cleanliness = fren.cleanliness + 3;
  }

  function play(uint256 _tokenId) payable public {
    require(_exists(_tokenId),"ERC721Metadata: Query for nonexistent token");
    require(isAlive(_tokenId),"That Fren is dead!");
    require(ownerOf(_tokenId) == msg.sender,"You are not the owner's of the Fren");
    require(msg.value >= playCost);
    Fren storage fren = frens[_tokenId];
    fren.happiness = fren.happiness + 3;
  }

  function calculateDaysAlive(uint256 _tokenId) public view returns(int256) {
    require(_exists(_tokenId),"ERC721Metadata: Query for nonexistent token");
    Fren memory fren = frens[_tokenId];
    int256 daysAlive = int256((block.timestamp - fren.bornTimestamp) / 86400)+1;
    return daysAlive;
  }

  //every day, the fren loses 1 hunger, 1 energy, 1 cleanliness, and 1 happiness
  //to check if the fren is alive, we check if any of the stats are 0
  function isAlive(uint256 _tokenId) public view returns(bool) {
    require(_exists(_tokenId),"ERC721Metadata: Query for nonexistent token");
    Fren memory fren = frens[_tokenId];
    int256 daysAlive = calculateDaysAlive(_tokenId);
    int256 energy = fren.energy - daysAlive;
    int256 cleanliness = fren.cleanliness - daysAlive;
    int256 happiness = fren.happiness - daysAlive;
    if(energy <= 0 || cleanliness <= 0 || happiness <= 0){
        return false;
    }else{
        return true;
    }
  }

  function revive(uint256 _tokenId) payable public {
    require(_exists(_tokenId),"ERC721Metadata: Query for nonexistent token");
    require(!isAlive(_tokenId),"That Fren is still alive!");
    require(ownerOf(_tokenId) == msg.sender,"You are not the owner's of the Fren");
    require(msg.value >= reviveCost);
    Fren storage fren = frens[_tokenId];
    fren.energy = 101;
    fren.cleanliness = 101;
    fren.happiness = 101;
  }

//if the fren is dead for over 10 days, any user can rescue it and get possession of it
  // function rescue(uint256 _tokenId) payable public {
  //   require(_exists(_tokenId),"ERC721Metadata: Query for nonexistent token");
  //   require(!isAlive(_tokenId),"That Fren is still alive!");
  //   require(msg.value >= rescueCost);
  //   Fren storage fren = frens[_tokenId];
  //   require(block.timestamp - timeOfDeath(_tokenId) > 86400*10);
  //   fren.hunger = 100;
  //   fren.energy = 100;
  //   fren.cleanliness = 100;
  //   fren.happiness = 100;
  //   //update both frens and frensOfOwner accordingly to the new owner
  //   address owner = ownerOf(_tokenId);
  //   payable(owner).transfer(msg.value);
  //   _safeTransfer(owner, msg.sender, _tokenId, "");
  // }
  
  function buildImage(uint256 _tokenId) public view returns(string memory) {
    Fren memory currentFren = frens[_tokenId];
    bytes memory imagePart2;
    int256 daysAlive = calculateDaysAlive(_tokenId); 
    string memory givenName = currentFren.givenName;
    int256 energy = currentFren.energy - daysAlive;
    int256 cleanliness = currentFren.cleanliness - daysAlive;
    int256 happiness = currentFren.happiness - daysAlive;
    if(energy >= 100000){
        energy = 99999;
    }
    if(cleanliness >= 100000){
        cleanliness = 99999;
    }
    if(happiness >= 100000){
        happiness = 99999;
    }
    bytes memory imagePart1 = bytes(
        abi.encodePacked(
            '<svg xmlns="http://www.w3.org/2000/svg" width="500" height="550" viewBox="0 0 20 22" preserveAspectRatio="xMidYMid slice"><style>.prefix__small{font:.7px Comic Sans MS}</style><defs><linearGradient id="prefix__background1"><stop stop-color="hsl(50, 70%, 50%)"/></linearGradient></defs><defs><linearGradient id="prefix__background2"><stop stop-color="hsl(',currentFren.frenColor1,', 30%, 50%)"/></linearGradient></defs><defs><linearGradient id="prefix__background3"><stop stop-color="hsl(',currentFren.frenColor2,', 30%, 50%)"/></linearGradient></defs><defs><linearGradient id="prefix__background4"><stop stop-color="hsl(360, 70%, ',currentFren.frenColor3,'%)"/></linearGradient></defs><defs><linearGradient id="prefix__background5"><stop stop-color="hsl(',currentFren.frenColor4,', 50%, 50%)"/></linearGradient></defs>'
        )
        );
    bytes memory imagePart3 = bytes(
        abi.encodePacked(
            '<text x="1" y="1.5" class="prefix__small">#',_tokenId.toString(),'</text><text x="1.1" y="3" class="prefix__small">',givenName,'</text><text x="1" y="21.3" class="prefix__small">Happiness: ',happiness.toString(),'</text><text x="8" y="21.3" class="prefix__small">Energy: ',energy.toString(),'</text><text x="14" y="21.3" class="prefix__small">Cleanliness: ',cleanliness.toString(),'</text></svg>'
        )
    );
    if(isAlive(_tokenId)){

        //if energy, cleanliness, and happiness are above than 70, fren is happy
        if(energy >= 70 && cleanliness >= 70 && happiness >= 70){
          imagePart2 = FrenStates1.Fren2StringHappy();
        }
        // else if those valuse are between 40 and 70, fren is neutral
        else if(energy >= 40 && cleanliness >= 40 && happiness >= 40){
          imagePart2 = FrenStates1.Fren2StringNeutral();
        }
        // else fren is sad
        else{
          imagePart2 = FrenStates2.Fren2StringSad();
        }
        string memory svg = Base64.encode(bytes(
          abi.encodePacked(
              imagePart1,
              imagePart2,
              imagePart3
          )
        ));
        return svg;
    }
    else{
        imagePart2 = FrenStates2.Fren2StringDead();
        imagePart3 = bytes(
          abi.encodePacked(
              '<text x="1" y="1.5" class="prefix__small">#',_tokenId.toString(),'</text><text x="1.1" y="3" class="prefix__small">',givenName,'</text><text x="1" y="21.3" class="prefix__small">Happiness: -----</text><text x="8" y="21.3" class="prefix__small">Energy: -----</text><text x="14" y="21.3" class="prefix__small">Cleanliness: -----</text></svg>'
          )
        );
        string memory svg = Base64.encode(bytes(
          abi.encodePacked(
              imagePart1,
              imagePart2,
              imagePart3
          )
        ));
        return svg;
    }
  }
  
  function buildMetadata(uint256 _tokenId) public view returns(string memory) {
      Fren memory currentImage = frens[_tokenId];
      return string(abi.encodePacked(
              'data:application/json;base64,', Base64.encode(bytes(abi.encodePacked(
                          '{"name":"', 
                          currentImage.name,
                          '", "description":"', 
                          currentImage.description,
                          '", "image": "', 
                          'data:image/svg+xml;base64,', 
                          buildImage(_tokenId),
                          '"}')))));
  }

  function tokenURI(uint256 _tokenId) public view virtual override returns (string memory) {
    require(_exists(_tokenId),"ERC721Metadata: URI query for nonexistent token");
    return buildMetadata(_tokenId);
  }

// name can't be more then 10 characters
  function setFrenName(string memory _name, uint256 _tokenId) public {
    require(ownerOf(_tokenId) == msg.sender,"You are not the owner's of this fren");
    require(bytes(_name).length <= 10, "Name can't be more then 10 characters");
    Fren storage fren = frens[_tokenId];
    fren.givenName = _name;
  }

  function withdraw() public payable onlyOwner {
    (bool os, ) = payable(owner()).call{value: address(this).balance}("");
    require(os);
  }

  // modifier ownerGamer() {
  //     if (msg.sender != owner) {
  //         require(msg.value > 0, "A payment is required");
  //     }
  //     _;
  // }
}