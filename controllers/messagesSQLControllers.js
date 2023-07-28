const { pool } = require('../database/connection')

exports.messageAlreadySaved = async ({ campaingLocal, from }) => {
    try {
        const resultCheckIfMessageIsSaved = await pool.query(`SELECT * FROM chats WHERE ? AND ? AND ?;`, [{ clientNumber: from.replace('549', "").replace('@c.us', "") }, { campaingID: campaingLocal }, { chatBody: '1' }])
        if (resultCheckIfMessageIsSaved.length > 0) return false
        else return true
    } catch (error) {
        const { sqlMessage } = error
        console.log("file: messagesSQLControllers.js ~ line 9 ~ sqlMessage", sqlMessage)
    }
}

exports.insertResponseMessage = async ({ ack, to, from, timestamp, campaingLocal, id }) => {
    try {
        pool.query(`INSERT INTO chats SET ?;`, { msgStatus: `${ack}`, wamNumber: to.replace('549', "").replace('@c.us', ""), clientNumber: from.replace('549', "").replace('@c.us', ""), wppChatID: from, chatDate: timestamp, campaingID: campaingLocal, msgID: id.id, chatBody: '1' })
    } catch (error) {
        const { sqlMessage } = error
        console.log("file: messagesSQLControllers.js ~ line 22 ~ sqlMessage", sqlMessage)
    }
}

exports.insertMessage = async (from, to, timestamp, id, ack, campaingID) => {
    try {
        await pool.query(`INSERT INTO chats SET ?;`, { msgStatus: `${ack}`, wamNumber: from.replace('549', "").replace('@c.us', ""), wppChatID: to, chatDate: timestamp, campaingID, msgID: id, clientNumber: to.replace('549', "").replace('@c.us', "") })
        console.log("mensaje guardado")
    } catch (error) {
        if (error.sqlMessage.includes("Duplicate entry")) {
            console.log("msj ya existe, se actualiza estado. ID -> ", id, "ack nuevo ->", ack)
            updateMessage(ack, id)
        }
    }
}

const updateMessage = async (ack, id) => {
    try {
        await pool.query(`UPDATE chats SET ? WHERE msgID = ?;`, [{ msgStatus: `${ack}` }, id])
        console.log("mensaje actualizado", id)
    } catch (error) {
        console.log("no se pueddo actualizar el msj", id)
    }
}