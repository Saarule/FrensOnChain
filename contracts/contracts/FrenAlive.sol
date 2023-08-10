// SPDX-License-Identifier: MIT

pragma solidity >=0.8.0 <0.9.0;

library FrenAlive {
    function Fren2String() public pure returns (bytes memory) {
        return bytes(
          abi.encodePacked(
              '<?xml version="1.0"?><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 800" preserveAspectRatio="xMidYMid slice"><defs><linearGradient cx="0.25" cy="0.25" r="0.75" id="grad1" gradientTransform="rotate(120)"><stop offset="0%" stop-color="hsl(100, 50%, 75%)"/><stop offset="50%" stop-color="hsl(250, 50%, 75%)"/><stop offset="100%" stop-color="hsl(20, 50%, 75%)"/></linearGradient></defs><rect width="100%" height="100%" fill="url(#grad1)"/><defs><pattern id="prefix__a" width="20" height="20" patternUnits="userSpaceOnUse" patternTransform="scale(40)" shape-rendering="crispEdges"><path fill="hsl(230, 55%, 40%)" d="M4 3h1v1H4zM5 3h1v1H5zM6 3h1v1H6zM12 3h1v1h-1zM13 3h1v1h-1zM14 3h1v1h-1zM6 4h1v1H6zM12 4h1v1h-1zM6 5h1v1H6zM7 5h1v1H7zM8 5h1v1H8zM9 5h1v1H9zM10 5h1v1h-1zM11 5h1v1h-1zM12 5h1v1h-1zM5 6h1v1H5zM13 6h1v1h-1zM5 7h1v1H5zM7 7h1v1H7zM10 7h1v1h-1zM13 7h1v1h-1zM5 8h1v1H5zM13 8h1v1h-1zM5 9h1v1H5zM13 9h1v1h-1zM5 10h1v1H5zM13 10h1v1h-1zM5 11h1v1H5zM6 11h1v1H6zM7 11h1v1H7zM8 11h1v1H8zM9 11h1v1H9zM10 11h1v1h-1zM11 11h1v1h-1zM12 11h1v1h-1zM13 11h1v1h-1zM6 12h1v1H6zM13 12h1v1h-1zM14 12h1v1h-1zM5 13h1v1H5zM6 13h1v1H6zM14 13h1v1h-1zM15 13h1v1h-1zM6 14h1v1H6zM15 14h1v1h-1zM16 14h1v1h-1zM6 15h1v1H6zM16 15h1v1h-1zM6 16h1v1H6zM16 16h1v1h-1zM6 17h1v1H6zM7 17h1v1H7zM8 17h1v1H8zM9 17h1v1H9zM10 17h1v1h-1zM11 17h1v1h-1zM12 17h1v1h-1zM13 17h1v1h-1zM14 17h1v1h-1zM15 17h1v1h-1zM16 17h1v1h-1z"/></pattern></defs><rect width="100%" height="100%" fill="url(#prefix__a)"/></svg>'
          ));
    }
}