const { BN } = require("@openzeppelin/test-helpers");
const { expect } = require("chai");
const truffleAssert = require("truffle-assertions");
const { ZERO_ADDRESS } = require("@openzeppelin/test-helpers/src/constants");

const VerisartExtension = artifacts.require("VerisartExtension.sol");
const ERC721CreatorTest = artifacts.require("ERC721CreatorTest.sol");

contract("VerisartExtension.Mint", (accounts) => {
  let extension;
  let creator;
  let artistWallet = accounts[0];
  let custodialWallet = accounts[1];

  const name = "Token";
  const symbol = "NFT";

  beforeEach(async () => {
    creator = await ERC721CreatorTest.new(name, symbol, { from: artistWallet });

    extension = await VerisartExtension.new(creator.address, custodialWallet);
  });

  it("should mint a token on the creator contract when calling extension", async () => {
    await creator.registerExtension(extension.address, "", {
      from: artistWallet,
    });

    await extension.mint(artistWallet, "abc", { from: custodialWallet });

    expect(await creator.ownerOf(1)).to.equal(artistWallet);
  });

  it("should return correct baseURI + tokenURI when prefix has not been set and is set", async () => {
    await creator.registerExtension(extension.address, "", {
      from: artistWallet,
    });

    await extension.mint(artistWallet, "abc", { from: custodialWallet });

    expect(await creator.tokenURI(1)).to.equal("abc");

    await extension.setTokenURIPrefixExtension("ipfs://", {
      from: artistWallet,
    });

    expect(await creator.tokenURI(1)).to.equal("ipfs://abc");
  });

  it("should prevent token URI prefix from being rugged", async () => {
    await creator.registerExtension(extension.address, "", {
      from: artistWallet,
    });

    await extension.setTokenURIPrefixExtension("ipfs://", {
      from: artistWallet,
    });

    await extension.mint(artistWallet, "abc", { from: custodialWallet });

    expect(await creator.tokenURI(1)).to.equal("ipfs://abc");

    await truffleAssert.reverts(
      extension.setTokenURIPrefixExtension("rugged://", {
        from: artistWallet,
      }),
      "Token URI prefix can only be set once"
    );
  });

  it("should not prevent extension from setting uri prefix if called before being registered and then called after registration", async () => {
    await truffleAssert.reverts(
      extension.setTokenURIPrefixExtension("ipfs://", {
        from: artistWallet,
      }),
      "Must be registered extension"
    );

    await creator.registerExtension(extension.address, "", {
      from: artistWallet,
    });

    await extension.setTokenURIPrefixExtension("ipfs://", {
      from: artistWallet,
    });

    await extension.mint(artistWallet, "abc", { from: custodialWallet });

    expect(await creator.tokenURI(1)).to.equal("ipfs://abc");

    await truffleAssert.reverts(
      extension.setTokenURIPrefixExtension("rugged://", {
        from: artistWallet,
      }),
      "Token URI prefix can only be set once"
    );
  });

  it("should allow minting wallet to be overrided by the creator contract admin", async () => {
    await creator.registerExtension(extension.address, "", {
      from: artistWallet,
    });

    await extension.mint(artistWallet, "abc", { from: custodialWallet });

    expect(await creator.ownerOf(1)).to.equal(artistWallet);

    await extension.setMintingWallet(artistWallet, {
      from: artistWallet,
    });

    await truffleAssert.reverts(
      extension.mint(artistWallet, "def", { from: custodialWallet }),
      "Must be minter wallet only"
    );

    await extension.mint(artistWallet, "def", { from: artistWallet });

    expect(await creator.ownerOf(2)).to.equal(artistWallet);
  });
});
