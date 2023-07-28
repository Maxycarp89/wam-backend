const { pool } = require('../database/connection')
// CAMPAÑAS
const getCampaing = async (campaingID) => {
    try {
        const resultGetCampaing = await pool.query(
            "SELECT * FROM campaings WHERE ?",
            { campaingID }
            );
            console.log("controlador de campaña", resultGetCampaing);
     
        if (resultGetCampaing.length > 0) {
            return {
                campaing: resultGetCampaing,
                message: "Get campaing Successfully",
            };
        } else {
            return { campaing: [], message: "Campaing not found" };
        }
    } catch (error) {
        console.log(error);
        //return { result: [], error }
    }
};

const getCampaingId = async (req, res) => {
    let campaingID = req.params.id;
    console.log("log id ", campaingID);
    console.log(campaingID);
    try {
        const resultGetCampaing = await pool.query(
            "SELECT * FROM campaings WHERE ?",
            { campaingID }
        );
        console.log(resultGetCampaing);
        if (resultGetCampaing.length > 0) {
            let body = resultGetCampaing[0]
            return res.status(200).json({ status: 200, body});
        } else return { campaing: [], message: "Campaing not found" };
    } catch (error) {
        console.log(error);
        return { result: [], error };
    }
};

// USUARIO
const getUserEmail = async(userEmail) => {
    try {
        result = await pool.query('SELECT * FROM users WHERE ?',{userEmail})
        console.log("result ",result);
        return result
        
    } catch (error) {
        console.log("Error usuario:=> ",error);
    }
}
const getUserId = async(userEmail) => {
    try {
        result = await pool.query('SELECT userID,userEmail FROM users WHERE ?',{userEmail})
        return result
        
    } catch (error) {
        console.log("Error usuario:=> ",error);
    }
}
module.exports = { getCampaing,getUserEmail,getUserId, getCampaingId };
