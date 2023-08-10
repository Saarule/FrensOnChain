// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

import "hardhat/console.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./Base64.sol";
import "./FrenAlive.sol";


contract FrensOnChain is ERC721Enumerable, Ownable {
  using Strings for uint256;

   struct Fren { 
      string name;
      string description;
      int256 happiness;
      int256 hunger;
      int256 energy;
      int256 cleanliness;
      // string frenColor1;
      // string frenColor2;
      // string frenColor3;
      uint256 bornTimestamp;
   }
   
   mapping (uint256 => Fren) public frens;
   mapping (address => uint256[]) public frensOfOwner;
   uint256 public generationCost = 0.1 ether;
   uint256 public feedCost = 0.01 ether;
   uint256 public cleanCost = 0.01 ether;
   uint256 public playCost = 0.01 ether;
   uint256 public reviveCost = 0.05 ether;
   uint256 public rescueCost = 0.05 ether;

  //  event Eaten (uint256 indexed _eaterId, uint256 indexed _eatenId);
   
   constructor() ERC721("FrensOnChain", "FREN") {}

  function mint() public payable  {
    uint256 supply = totalSupply();
    
    Fren memory newFren = Fren(
        string(abi.encodePacked('Frens On Chain #', uint256(supply + 1).toString())), 
        "Frens On Chain is 100% on-chain, dynamic, NFT game. Frens On Chain last forever.",
        100,
        100,
        100,
        100,        
        // randomNum(361, block.prevrandao, supply).toString(),
        // randomNum(361, block.timestamp, supply+30).toString(),
        // randomNum(361, block.prevrandao, block.timestamp).toString(),
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
    fren.happiness = fren.happiness + 5;
    fren.hunger = fren.hunger + 7;
  }

  function clean(uint256 _tokenId) payable public {
    require(_exists(_tokenId),"ERC721Metadata: Query for nonexistent token");
    require(isAlive(_tokenId),"That Fren is dead!");
    require(ownerOf(_tokenId) == msg.sender,"You are not the owner's of the Fren");
    require(msg.value >= cleanCost);
    Fren storage fren = frens[_tokenId];
    fren.happiness = fren.happiness + 5;
    fren.cleanliness = fren.cleanliness + 7;
  }

  function play(uint256 _tokenId) payable public {
    require(_exists(_tokenId),"ERC721Metadata: Query for nonexistent token");
    require(isAlive(_tokenId),"That Fren is dead!");
    require(ownerOf(_tokenId) == msg.sender,"You are not the owner's of the Fren");
    require(msg.value >= playCost);
    Fren storage fren = frens[_tokenId];
    fren.happiness = fren.happiness + 5;
    fren.energy = fren.energy + 7;
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
    int256 hunger = fren.hunger - daysAlive;
    int256 energy = fren.energy - daysAlive;
    int256 cleanliness = fren.cleanliness - daysAlive;
    int256 happiness = fren.happiness - daysAlive;
    if(hunger <= 0 || energy <= 0 || cleanliness <= 0 || happiness <= 0){
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
    fren.hunger = 100;
    fren.energy = 100;
    fren.cleanliness = 100;
    fren.happiness = 100;
  }
  
  function timeOfDeath(uint256 _tokenId) public view returns(uint256) {
    require(_exists(_tokenId),"ERC721Metadata: Query for nonexistent token");
    Fren memory fren = frens[_tokenId];
    int256 daysAlive = calculateDaysAlive(_tokenId);
    int256 hunger = fren.hunger - daysAlive;
    int256 energy = fren.energy - daysAlive;
    int256 cleanliness = fren.cleanliness - daysAlive;
    int256 happiness = fren.happiness - daysAlive;
    if(hunger <= 0){
        return uint256(fren.bornTimestamp) + (100 - uint256(fren.hunger)) * 86400;
    }else if(energy <= 0){
        return uint256(fren.bornTimestamp) + (100 - uint256(fren.energy)) * 86400;
    }else if(cleanliness <= 0){
        return uint256(fren.bornTimestamp) + (100 - uint256(fren.cleanliness)) * 86400;
    }else if(happiness <= 0){
        return uint256(fren.bornTimestamp) + (100 - uint256(fren.happiness)) * 86400;
    }else{
        return 0;
    }
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
    // Fren memory currentFren = frens[_tokenId];

    // int256 daysAlive = calculateDaysAlive(_tokenId); 
    // uint256 backGroundColor = randomNum(361, block.prevrandao, _tokenId+100); 

    if(isAlive(_tokenId)){
        bytes memory imagePart1 = FrenAlive.Fren2String();
        string memory svg = Base64.encode(bytes(
          abi.encodePacked(
              imagePart1
          )
      ));
        return svg;
    }
    return "dead";
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

  function setFrenName(string memory _name, uint256 _tokenId) public {
    require(ownerOf(_tokenId) == msg.sender,"You are not the owner's of this fren");
    Fren storage fren = frens[_tokenId];
    fren.name = _name;
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