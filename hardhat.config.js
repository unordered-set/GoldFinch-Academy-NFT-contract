/**
 * @type import('hardhat/config').HardhatUserConfig
 */
/**
* @type import('hardhat/config').HardhatUserConfig
*/
require('dotenv').config();
require("@nomiclabs/hardhat-ethers");
const { POLYGON_TEST_API_URL, POLYGON_TEST_PRIVATE_KEY, POLYGON_API_URL, POLYGON_PRIVATE_KEY } = process.env;
module.exports = {
   solidity: "0.8.0",
   defaultNetwork: "localhost",
   networks: {
      hardhat: {},
      polymath_mumbai: {
         url: POLYGON_TEST_API_URL,
         accounts: [`0x${POLYGON_TEST_PRIVATE_KEY}`]
      },
      polymath: {
         url: POLYGON_API_URL,
         accounts: [`0x${POLYGON_PRIVATE_KEY}`]
      }
   },
}
