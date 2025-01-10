const logger = require("../util/log.js");
const State = require("../models/State.model.js");
const { getChainState, storeChainState} = require('../manager/chainStateManager.js');
const crypto = require('crypto');
const { keccak256 } = require('js-sha3');

const createHashFromJson = (json) => {
  return crypto.createHash('sha256').update(JSON.stringify(json)).digest('hex');
};

// Left here in case we want to use keccak
// const createHashFromJson = (json) => {
//   return keccak256(JSON.stringify(json));
// };

const storeState = async (req, res) => {
    const { id } = req.params;

    const state = req.body;
    if (!state) {
        return res.status(400).json({ success: false, message: "State not provided" });
    }            
    
    logger.info(`Got state for entity ID ${id}: ` + JSON.stringify(state));

    try {
        const hash = createHashFromJson(state);
        logger.info(`Created hash ${hash}`);
        
        const now = Date.now();

        await State.updateOne(
            { _id: hash },
            { 
                entityId: id, 
                data: state, 
                lastUpdated: now
            },
            { upsert: true }
        );

        storeChainState(id, hash, now.toString());

        res.status(201).json({ success: true, hash: hash });

    } catch (error) {
        logger.error(error);
        res.status(500).json({ success: false, message: "Server Error", error });
    }
}

const getState = async (req, res) => {
    const { id, hash } = req.params;

    try {
        
        let state;
        if (hash) {
            state = await State.findOne({ _id: hash, entityId: parseInt(id) });
        } else {
            state = await State.findOne({ entityId: parseInt(id) }).sort({ lastUpdated: -1 });
        }

        const chainState = await getChainState(id);

        if (state) {
            res.status(200).json({ status: true, message: {
                state: state,
                chainState: chainState,
            } });
        } else {
            res.status(404).json({ status: false, message: "State not found" });
        }
    } catch (error) {
        logger.error(error);
        res.status(500).json({ status: false, message: "Server error", error });
    }
};

module.exports = {    
    getState,
    storeState,    
}