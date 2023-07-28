const { pool } = require("../database/connection");
const { getUserEmail } = require("../db/consultar");
const { hashPassword, comparePassword } = require("../utils/password");
const { getAllDirectorios, getDivisionName } = require("./divisionesSQL");

exports.getUserDataByNumber = async (wamNumber) => {
    try {
        const resultGetUserByNumber = await pool.query(
            "SELECT * FROM users WHERE ?;",
            [{ wamNumber }]
        );
        if (resultGetUserByNumber.length > 0)
            return { ...resultGetUserByNumber[0] };
        else return { userID: 0 };
    } catch (error) {
        const { sqlMessage } = error;
        console.log(
            "file: usersControllers.js ~ line 10 ~ sqlMessage",
            sqlMessage
        );
    }
};

exports.getUserDataByID = async (userID) => {
    try {
        const resultGetUserByID = await pool.query(
            "SELECT * FROM users WHERE ?;",
            [{ userID }]
        );
        if (resultGetUserByID.length > 0) return { ...resultGetUserByID[0] };
        else return { userID: 0 };
    } catch (error) {
        const { sqlMessage } = error;
        console.log(
            "file: usersControllers.js ~ line 10 ~ sqlMessage",
            sqlMessage
        );
    }
};

exports.createUser = async (req, res) => {
    let { sector, userEmail, password, userNumber, companyName, userStatus } =
        req.body;

    try {
        let division = await getDivisionName(sector);
        let user = await getUserEmail(userEmail);
        let wamNumbers = await getAllDirectorios();
        delete req.body.sector;
        let divisionId = await division[0].id;
        if (user.length > 0) {
            return res.status(400).json({ user });
        }
        let wamNumber;
        for (let i = 0; i < wamNumbers.length; i++) {
            if (wamNumbers[i].nombreDivision == sector) {
                wamNumber = wamNumbers[i].wamNumber 
            }
        }
        password = await hashPassword(password)
        let response = await pool.query(`INSERT INTO users SET ?;`, {
            divisionId,
            userEmail,
            password,
            userNumber,
            companyName,
            userStatus,
            wamNumber
        });
        return res.status(200).json(response);
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};

exports.loginUser = async (req, res) => {
    const { password} = req.body

    try {
        let user = await getUserEmail(req.body.userEmail)
        
        if (user.length == 0) return res.status(404).json({status:404,user});
        if (user[0]?.userStatus == 0) return res.status(404).json({status:404,user});

        console.log(req.body.userEmail);
        const validPassword = await comparePassword(
        password,
        user[0].password
        );

        if (!validPassword) {
            return res.status(401).json({user})

        }

        delete user.password
        let {userID, userEmail} = user[0]

        console.log("usuario ",userID);
        return res.status(200).send({ status:200,userID,userEmail })
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};
exports.userId = async (req,res) => {

    try {
        let userID = await getUserId(req.userEmail)
        return userID
    } catch (error) {
        console.log(error);
        res.status(500).json(error);
    }
};
