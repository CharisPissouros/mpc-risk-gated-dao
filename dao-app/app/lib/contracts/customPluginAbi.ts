export const CustomPluginABI = [
  {
    "inputs": [
      { "internalType": "address", "name": "dao", "type": "address" },
      { "internalType": "address", "name": "where", "type": "address" },
      { "internalType": "address", "name": "who", "type": "address" },
      { "internalType": "bytes32", "name": "permissionId", "type": "bytes32" }
    ],
    "name": "DaoUnauthorized",
    "type": "error"
  },
  { "inputs": [], "name": "DelegateCallFailed", "type": "error" },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "target", "type": "address" },
          { "internalType": "enum IPlugin.Operation", "name": "operation", "type": "uint8" }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "targetConfig",
        "type": "tuple"
      }
    ],
    "name": "InvalidTargetConfig",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      { "indexed": false, "internalType": "uint8", "name": "version", "type": "uint8" }
    ],
    "name": "Initialized",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "target", "type": "address" },
          { "internalType": "enum IPlugin.Operation", "name": "operation", "type": "uint8" }
        ],
        "indexed": false,
        "internalType": "struct IPlugin.TargetConfig",
        "name": "newTargetConfig",
        "type": "tuple"
      }
    ],
    "name": "TargetSet",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "CREATE_PROPOSAL_PERMISSION_ID",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "name": "InvestmentProposals",
    "outputs": [
      { "internalType": "uint256", "name": "id", "type": "uint256" },
      { "internalType": "address", "name": "creator", "type": "address" },
      { "internalType": "address", "name": "target", "type": "address" },
      { "internalType": "uint256", "name": "amount", "type": "uint256" },
      { "internalType": "string", "name": "description", "type": "string" },
      { "internalType": "uint256", "name": "riskScore", "type": "uint256" },
      { "internalType": "uint256", "name": "created_timestamp", "type": "uint256" },
      { "internalType": "bool", "name": "executed", "type": "bool" },
      { "internalType": "uint256", "name": "externalProposalId", "type": "uint256" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "LatestRiskData",
    "outputs": [
      { "internalType": "uint256", "name": "RiskScore", "type": "uint256" },
      { "internalType": "uint256", "name": "timestamp", "type": "uint256" },
      { "internalType": "bytes32", "name": "datahash", "type": "bytes32" }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "ORACLE_PERMISSION_ID",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "SET_TARGET_CONFIG_PERMISSION_ID",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "UPDATE_CONFING_PERMISSION_ID",
    "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "address", "name": "_target", "type": "address" },
      { "internalType": "uint256", "name": "_amount", "type": "uint256" },
      { "internalType": "bytes", "name": "_callData", "type": "bytes" },
      { "internalType": "bytes", "name": "_metadata", "type": "bytes" },
      { "internalType": "string", "name": "_description", "type": "string" }
    ],
    "name": "createInvestmentProposal",
    "outputs": [{ "internalType": "uint256", "name": "proposalid", "type": "uint256" }],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "dao",
    "outputs": [{ "internalType": "contract IDAO", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "uint256", "name": "_internalProposalid", "type": "uint256" }],
    "name": "executeInvestment",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCurrentTargetConfig",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "target", "type": "address" },
          { "internalType": "enum IPlugin.Operation", "name": "operation", "type": "uint8" }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getTargetConfig",
    "outputs": [
      {
        "components": [
          { "internalType": "address", "name": "target", "type": "address" },
          { "internalType": "enum IPlugin.Operation", "name": "operation", "type": "uint8" }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "contract IDAO", "name": "_dao", "type": "address" },
      { "internalType": "address", "name": "_tokenVoting", "type": "address" },
      { "internalType": "address", "name": "_oracle", "type": "address" },
      { "internalType": "uint256", "name": "_maxAllowedRiskScore", "type": "uint256" },
      { "internalType": "uint256", "name": "_maxRiskDataAge", "type": "uint256" }
    ],
    "name": "initialize",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxAllowedRiskScore",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "maxRiskDataAge",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "oracle",
    "outputs": [{ "internalType": "address", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "pluginType",
    "outputs": [{ "internalType": "enum IPlugin.PluginType", "name": "", "type": "uint8" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "proposalcount",
    "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "protocolVersion",
    "outputs": [{ "internalType": "uint8[3]", "name": "", "type": "uint8[3]" }],
    "stateMutability": "pure",
    "type": "function"
  },
  {
    "inputs": [
      {
        "components": [
          { "internalType": "address", "name": "target", "type": "address" },
          { "internalType": "enum IPlugin.Operation", "name": "operation", "type": "uint8" }
        ],
        "internalType": "struct IPlugin.TargetConfig",
        "name": "_targetConfig",
        "type": "tuple"
      }
    ],
    "name": "setTargetConfig",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      { "internalType": "uint256", "name": "_RiskScore", "type": "uint256" },
      { "internalType": "bytes32", "name": "_datahash", "type": "bytes32" }
    ],
    "name": "submitRiskData",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [{ "internalType": "bytes4", "name": "_interfaceId", "type": "bytes4" }],
    "name": "supportsInterface",
    "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "tokenforvoting",
    "outputs": [{ "internalType": "contract Tokenvoting", "name": "", "type": "address" }],
    "stateMutability": "view",
    "type": "function"
  }
] as const;