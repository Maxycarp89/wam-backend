const { pool } = require("../database/connection");

exports.getAllDirectorios = async () => {
    try {
        const resultDirectorios = await pool.query(
            "SELECT DISTINCT wamNumber, nombreDivision FROM users inner join divisiones on users.divisionId = divisiones.id"
        );
        console.log("directorios :" ,resultDirectorios);
        if (resultDirectorios.length > 0) return resultDirectorios;
        else return { userID: 0 };
    } catch (error) {
        const { sqlMessage } = error;
        console.log(
            "file: usersControllers.js ~ line 10 ~ sqlMessage",
            sqlMessage
        );
    }
};

exports.getDivisionName = async (nombreDivision) => {
    try {
        const resultDirectorios = await pool.query(
            "SELECT id FROM divisiones WHERE ? ",{nombreDivision}
        );
        if (resultDirectorios.length > 0) return resultDirectorios;
        else return { userID: 0 };
    } catch (error) {
        const { sqlMessage } = error;
        console.log(
            "file: usersControllers.js ~ line 10 ~ sqlMessage",
            sqlMessage
        );
    }
};
