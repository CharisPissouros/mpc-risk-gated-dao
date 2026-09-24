import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import * as dotenv from "dotenv";
dotenv.config();

const config: HardhatUserConfig = {
  solidity: {
  	version :"0.8.28",
	settings : {
		optimizer : {
			enabled : true,
			runs : 200,
                            }, 
                   },
             },

networks: {
  sepolia:{
     url: process.env.SEPOLIA_RPC_URL as string,
     accounts: [process.env.PRIVATE_KEY as string],
         },
       },
};


export default config;
