// SPDX-License-Identifier: MIT

pragma solidity ^0.8.0;

/// @author: manifold.xyz
/// This contract is used exclusively for testing

import "@manifoldxyz/creator-core-solidity/contracts/ERC721Creator.sol";

contract ERC721CreatorTest is ERC721Creator {
    constructor(string memory _name, string memory _symbol)
        ERC721Creator(_name, _symbol)
    {}
}
