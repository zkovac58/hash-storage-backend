const logger = require("../util/log.js");
const { connect, keyStores, KeyPair, providers } = require("near-api-js");

const privateKey = process.env.PRIVATE_KEY;
const accountId = process.env.ACCOUNT_ID;
const networkId = process.env.NETWORK_ID;
const nodeUrl = process.env.NODE_URL;
const contractId = process.env.CONTRACT_ID;
const gasLimit = process.env.GAS_LIMIT;

const chainConnect = async () => {
    const myKeyStore = new keyStores.InMemoryKeyStore();        
    const keyPair = KeyPair.fromString(privateKey);
    await myKeyStore.setKey("testnet", accountId, keyPair);

    const connectionConfig = {
        networkId: networkId,
        keyStore: myKeyStore,
        nodeUrl: nodeUrl,
    };
    const nearConnection = await connect(connectionConfig);
    logger.info(nearConnection);    
    return nearConnection;
}

const storeChainState = async (entityId, hash, lastUpdated) => {

    const nearConnection = await chainConnect();

    const account = await nearConnection.account(accountId);

    const contractCallResult = await account.functionCall({
        contractId: contractId, 
        methodName: "update_entity_state",
        args: {
            entity_id: `${entityId}`,
            state_hash: hash,
            last_updated: `${lastUpdated}`,
        },
        gas: gasLimit,
        deposit: 0,
    });
    logger.info(contractCallResult);
}

const getChainState = async (entityId) => {

    const contractResponse = await viewContract({
        contractId: contractId,
        methodName: "get_entity_state_hash",
        args: {
            entity_id: `${entityId}`
        }
    });
    
    logger.info(contractResponse);
    return contractResponse;
}

async function viewContract({
  contractId,
  methodName,
  args = {},
  finality = "optimistic",
}) {       
    
    const url = nodeUrl;
    const provider = new providers.JsonRpcProvider({ url });

    const argsBase64 = args
        ? Buffer.from(JSON.stringify(args)).toString("base64")
        : "";

    const viewCallResult = await provider.query({
        request_type: "call_function",
        account_id: contractId,
        method_name: methodName,
        args_base64: argsBase64,
        finality: finality,
    });

    return JSON.parse(Buffer.from(viewCallResult.result).toString());
}

module.exports = {    
    getChainState,
    storeChainState,    
}