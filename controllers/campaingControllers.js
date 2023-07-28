const { sendCampaingEdit, updateNumbers } = require(".");
const { pool } = require("../database/connection");

const editCampaing = async (req, res) => {
    console.log("editCampaing");
    try {
        let campaing = await getCampaing(req.body.campaingID);
        let campania = await campaing.campaing[0];
        console.log("campaña : ", await campania.userID);
        let {
            campaingID,
            campaingName,
            campaingDescription,
            campaingStatus,
            campaingClients,
            campaingMessage,
            responseOne,
            numbers,
            filename,
            userID,
        } = req.body;
        if (campania) {
            let result = await pool.query(
                `UPDATE campaings SET campaingName = ?, campaingDescription = ?, campaingStatus = ?, campaingClients = ?, campaingMessage = ?, responseOne = ? WHERE campaingID = ?;`,
                [
                    campaingName,
                    campaingDescription,
                    campaingStatus,
                    campaingClients,
                    campaingMessage,
                    responseOne,
                    campaingID,
                ]
            );
            console.log("numeros a enviar: ", numbers);
            let resultNumbers = await updateNumbers(numbers, campaingID);
            console.log(await "resul: ", resultNumbers);
            let { userID } = await campania;
            req.body = { campaingID, userID, filename };

            let respuesta = await sendCampaingEdit( req);
            console.log("respuesta al enviar editado: ", respuesta);
            return res.status(201).send({ status: "Ok", result });
        } else {
            return res.status(404).send({ status: "False", result });
        }
    } catch (error) {
        console.log("error", error);
        return res.status(500).send({ status: 500, error });
    }
};

const deleteCampaing = async (req, res) => {
    console.log("req.body: ", req.body);
    let { campaingID } = req.body;
    try {
        let campaing = await getCampaing(campaingID);
        campaing = await campaing.campaing[0];
        console.log("campaña : ", await campaing.campaingID);
        if (campaing) {
            let result = await pool.query(
                `DELETE FROM campaings WHERE campaingID = ?;`,
                [campaingID]
            );
            return res.status(201).send({ status: "Ok", result });
        } else {
            return res.status(404).send({ status: "False", result });
        }
    } catch (error) {
        console.log(error);
        return res.status(500).send({ status: 500, error });
    }
};

const getCampaing = async (campaingID) => {
    try {
        const resultGetCampaing = await pool.query(
            "SELECT * FROM campaings WHERE ?",
            { campaingID }
        );

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
            let body = resultGetCampaing[0];
            return res.status(200).json({ status: 200, body });
        } else return { campaing: [], message: "Campaing not found" };
    } catch (error) {
        console.log(error);
        return { result: [], error };
    }
};

module.exports = { getCampaing, getCampaingId, editCampaing, deleteCampaing };
