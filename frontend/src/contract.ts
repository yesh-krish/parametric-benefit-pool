export const CONTRACT_ADDRESS =
  "0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9";

export const BENEFIT_POOL_ABI = [
  "function contribute(uint256 amount)",
  "function totalContributions() view returns (uint256)",
  "function contributions(address) view returns (uint256)",
  "function oracleValue() view returns (uint256)",
  "function threshold() view returns (uint256)",
  "function isTriggered() view returns (bool)",
];