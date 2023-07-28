const { pool } = require("../database/connection");
const { getUserDataByID } = require("./usersControllers");
const fs = require("fs");
const {
    clientes,
    clienteIniciado,
    MessageMedia,
    numberDictionary,
} = require("./clientwp");

const { insertMessage } = require("./messagesSQLControllers");
const { dictionary } = require("./dictionary");

exports.uploadImage = async (req, res) => {
    try {
        res.send({ status: "Ok", result: `Upload image successfully` });
    } catch (error) {
        res.status(500).send({ status: "error", "error message": error });
    }
};

exports.getDictionary = async (req, res) => {
    result = await dictionary();
    console.log(result);
    res.status(200).json({ status: "Ok", result });
};

//busca una campaña
exports.getCampaing = async (campaingID) => {
    try {
        const resultGetCampaing = await pool.query(
            "SELECT * FROM campaings WHERE ?",
            { campaingID }
        );
        console.log(resultGetCampaing);
        if (resultGetCampaing.length > 0) {
            let body = resultGetCampaing[0];
            return {
                campaing: resultGetCampaing,
                message: "Get campaing Successfully",
                body,
            };
        } else return { campaing: [], message: "Campaing not found" };
    } catch (error) {
        console.log(error);
        return { result: [], error };
    }
};

//busca numero de celulares asociados
const getNumebrs = async (campaingID) => {
    try {
        const getNumbersResult = await pool.query(
            "SELECT * FROM numbers WHERE ?",
            { campaingID }
        );
        if (getNumbersResult.length > 0) {
            const { numbers } = getNumbersResult[0];
            return { numbers: JSON.parse(numbers) }; //convierte a json el array de telefonos
        } else {
            return { numbers: [], message: "Numbers not found" };
        }
    } catch (error) {
        console.log(error);
        const { sqlMessage } = error;
        return { numbers: [], sqlMessage };
    }
};

///inserta una nueva campaña
const postCampaing = async ({ campaing }) => {
    try {
        const resultInsertCampaing = await pool.query(
            `INSERT INTO campaings SET ?;`,
            campaing
        );
        return { lastInserID: resultInsertCampaing.insertId };
    } catch (error) {
        console.log("error en postcampaing", error);
        return {
            message:
                "An error has ocurred when try to insert campaing, please tray again",
        };
        // res.status(400).send()
    }
};

//inserta los numeros asociados a una nueva campaña
const postNumbers = async (numeros, campaingID) => {
    try {
        const resultInsertNumbers = await pool.query(
            `INSERT INTO numbers (numbers, campaingID) VALUES (?, ?)`,
            [JSON.stringify(numeros), campaingID]
        );
        return { insertId: resultInsertNumbers.insertId };
    } catch (error) {
        console.log(error);
        return {
            message:
                "An error has ocurred when try to insert numbers, please try again",
        };
    }
};

exports.updateNumbers = async (numbers, campaingID) => {
    try {
        const result = await pool.query(
            `UPDATE numbers SET numbers= ? WHERE campaingID = ${campaingID};`,
            [JSON.stringify(numbers)]
        );
        return { result };
    } catch (error) {
        console.log(error);
        return {
            message:
                "An error has ocurred when try to update numbers, please try again",
        };
    }
};

const updateSendCapaingDate = async ({ campaingID }) => {
    const date = new Date();
    const month =
        date.getMonth() + 1 > 9
            ? date.getMonth() + 1
            : "0" + (date.getMonth() + 1);
    const formatedDate = `${date.getFullYear()}-${month}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    try {
        pool.query("UPDATE campaings SET ? WHERE ?", [
            { sendDate: formatedDate, campaingStatus: "En Progreso" },
            { campaingID },
        ]);
        console.log("update sendDate successfully");
    } catch (error) {
        console.log("error when try to update SendCapaingDate", error);
    }
};

const updateEndCapaingDate = async ({ campaingID }) => {
    const date = new Date();
    const month =
        date.getMonth() + 1 > 9
            ? date.getMonth() + 1
            : "0" + (date.getMonth() + 1);
    const formatedDate = `${date.getFullYear()}-${month}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
    try {
        pool.query("UPDATE campaings SET ? WHERE ?", [
            { endDate: formatedDate, campaingStatus: "Enviado" },
            { campaingID },
        ]);
        console.log("update endDate successfully");
    } catch (error) {
        console.log("error when try to update EndCapaingDate", error);
    }
};

exports.sendMessages = async (req, res) => {
    //capamingClients(cantidad de clientes)
    const {
        numbers,
        filename = "",
        campaingName,
        campaingDescription,
        campaingClients,
        campaingMessage,
        responseOne,
        userID,
        campaingDirectory,
    } = req.body;
    console.log("campaingDirectory, ", campaingDirectory);
    //guarda en la BD lacampaña actual a enviar
    const { lastInserID, message = "" } = await postCampaing({
        campaing: {
            campaingName,
            campaingDescription,
            campaingClients,
            campaingMessage,
            responseOne,
            userID,
        },
    });

    if (lastInserID > 0) {
        ///guarda los numeros de cel asociados a dicha campaña
        console.log("=======numeros========", numbers);
        if (numbers.length > 0) {
            const { insertId, message = "" } = await postNumbers(
                numbers,
                lastInserID
            );
            if (insertId > 0) {

                await this.sendCampaing({
                    body: {
                        campaingID: lastInserID,
                        userID: userID,
                        filename,
                        campaingDirectory,
                    },
                });

                res.send(
                    `{ "status": "Ok", "message": "msj enviados con exito" }`
                );
            } else if (message?.includes("error"))
                res.status(400).send({ message });
            else if (message?.includes("error"))
                res.status(400).send({ message });
        }else{
            res.status(401).send({status:"Bad Request", message:"No hay numeros"})
        }
    }
};

exports.postCampaing = async (data) => {
    try {
        const resultInsertCampaing = await pool.query(
            `INSERT INTO campaings SET ?;`,
            data
        );

        /* return { lastInserID: resultInsertCampaing.insertId };  */
    } catch (error) {
        console.log("error en postcampaing", error);
        return {
            message:
                "An error has ocurred when try to insert campaing, please tray again",
        };
        // res.status(400).send()
    }
};
exports.sendCampaingEdit = async (req, res) => {

    const { filename = "", userID, campaingID } = req.body;
    console.log(req.body);
    console.log({ userID }, req.body.userID);
    //busca en BD si existe el usuario y toma el campo wanNumber

    const { wamNumber } = await getUserDataByID(userID);

    /* Object.values(await numberDictionary).forEach(element => {
    }); */
    let cliente;
    for (let i = 0; i < clienteIniciado.length; i++) {
        //FILTRO "ACTIVO" EL CLIENTE QUE TIENE LA SESION INICIADA

        if (clienteIniciado.length === 1) {
            cliente = clientes.filter(
                (client) =>
                    client.clienteInit.authStrategy.clientId ==
                    clienteIniciado[0]
            );
        } else {
            cliente = clientes.filter(
                (client) =>
                    client.clienteInit.authStrategy.clientId ==
                    numberDictionary[0][wamNumber]
            );
        }
    }
    if (!!campaingID) {
        try {
            const { campaing = [], message = "" } = await this.getCampaing(
                campaingID
            ); //busca en BD la campaña
            console.log(campaing);
            if (campaing.length === 1) {
                // si existe el numero de campaña, busca numeros de tel. asociados

                const { numbers = [], message = "" } = await getNumebrs(
                    campaingID
                ); //devuelve array json con los numeros
                if (numbers.length > 0) {
                    try {
                        //declara la funcion //numero aleatorio incluyendo el numero minimo y el maximo pasado por parametro
                        const getRandomNumber = (min, max) =>
                            Math.round(Math.random() * (max - min)) + min;
                        if (!!res) {
                            res.writeHead(200, {
                                "Content-Type": "text/plain",
                                "Transfer-Encoding": "chunked",
                            });
                        }
                        /* construct manually - FOR RECORRE POR CADA CEL. PARA EL ENVIO */
                        let cont = 0;
                        let caso;
                        (await numberDictionary).forEach((e) => {
                            if (Object.keys(e)[0] === wamNumber) {
                                caso = e[wamNumber];
                            }
                            Object.keys(e) === wamNumber;
                        });
                        for (let i = 0; i < numbers.length; i++) {
                            let random = getRandomNumber(2500, 15000); //llama la funcion declarada lineas arriba
                            (async function (i) {
                                setTimeout(async function () {
                                    cont++;
                                    if (!!filename) {
                                        ///SI EXISTE EL ARCHIVO
                                        if (i === 0) {
                                            //SI ES EL PRIMER NUMERO DE LA LISTA
                                            console.log("Entro por i===0", i);
                                            //setTimeout(async () => {
                                            console.log(
                                                "Entro por i===0 hola",
                                                numbers.length
                                            );

                                            if (
                                                fs.existsSync(
                                                    `public/${filename.trim()}`
                                                )
                                            ) {
                                                const media =
                                                    MessageMedia.fromFilePath(
                                                        `public/${filename.trim()}`
                                                    );

                                                console.log(
                                                    "entro aquiiiiiiiiiiiii caso",
                                                    caso
                                                );
                                                switch (caso) {
                                                    case "MOTOS":
                                                        console.log(
                                                            "MOTOS indice i es 0 x->",
                                                            numbers[i]
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 148 ~ wamNumber",
                                                            wamNumber
                                                        );

                                                        const resultSendMessagemotos =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );
                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagemotos.timestamp,
                                                            resultSendMessagemotos
                                                                .id.id,
                                                            resultSendMessagemotos.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    case "HOGAR":
                                                        console.log(
                                                            "HOGAR indice i es 0 x->",
                                                            numbers[i]
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 148 ~ wamNumber",
                                                            wamNumber
                                                        );
                                                        const resultSendMessagehogar =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );
                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagehogar.timestamp,
                                                            resultSendMessagehogar
                                                                .id.id,
                                                            resultSendMessagehogar.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    case "STORE":
                                                        console.log(
                                                            "STORE ->",
                                                            wamNumber
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 156 ~ wamNumber",
                                                            wamNumber
                                                        );
                                                        const resultSendMessagestore =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );

                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagestore.timestamp,
                                                            resultSendMessagestore
                                                                .id.id,
                                                            resultSendMessagestore.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                if (i === 0)
                                                    console.log({
                                                        messageee:
                                                            "Mensaje enviado correctamente: i == 0",
                                                    });
                                                if (cont === numbers.length)
                                                    console.log(
                                                        "cont === numbers.length"
                                                    );
                                                updateEndCapaingDate({
                                                    campaingID,
                                                });
                                                console.log(
                                                    "file: index.js ~ line 170 ~ (cont + 1) === numbers.length",
                                                    cont === numbers.length,
                                                    cont,
                                                    numbers.length
                                                );
                                            }
                                            //}, 3000)
                                            updateSendCapaingDate({
                                                campaingID,
                                            }); //actualiza fecha de envio y estado en progreso
                                        } else {
                                            //DISTINTO AL PRIMER NUMERO DE LA LISTA DE CONTACTOS
                                            console.log("Entro por i ??", i);
                                            if (
                                                fs.existsSync(
                                                    `public/${filename.trim()}`
                                                )
                                            ) {
                                                const media =
                                                    MessageMedia.fromFilePath(
                                                        `public/${filename.trim()}`
                                                    );
                                                console.log(
                                                    "num EN ELSE",
                                                    numbers[i]
                                                );
                                                console.log("entro aquii x2");
                                                switch (caso) {
                                                    case "MOTOS":
                                                        console.log(
                                                            "MOTOS ->",
                                                            wamNumber
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 173 ~ wamNumber",
                                                            wamNumber
                                                        );
                                                        const resultSendMessagemotos =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );
                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagemotos.timestamp,
                                                            resultSendMessagemotos
                                                                .id.id,
                                                            resultSendMessagemotos.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    case "HOGAR":
                                                        console.log(
                                                            "HOGAR ->",
                                                            wamNumber
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 177 ~ wamNumber",
                                                            wamNumber
                                                        );
                                                        const resultSendMessagehogar =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );

                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagehogar.timestamp,
                                                            resultSendMessagehogar
                                                                .id.id,
                                                            resultSendMessagehogar.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    case "STORE":
                                                        console.log(
                                                            "STORE ->",
                                                            wamNumber
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 181 ~ wamNumber",
                                                            wamNumber
                                                        );
                                                        const resultSendMessagestore =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );

                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagestore.timestamp,
                                                            resultSendMessagestore
                                                                .id.id,
                                                            resultSendMessagestore.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                if (i === 0)
                                                    updateSendCapaingDate({
                                                        campaingID,
                                                    });
                                                if (cont === numbers.length)
                                                    updateEndCapaingDate({
                                                        campaingID,
                                                    });
                                                console.log(
                                                    "file: index.js ~ line 204 ~ (cont + 1) === numbers.length",
                                                    cont === numbers.length
                                                );
                                                console.log({
                                                    message:
                                                        "Mensaje enviado correctamente",
                                                });
                                            }
                                        }
                                    } else {
                                        ///SI NO EXISTE EL ARCHIVO, ENVIA EL MENAJE A WHATT SIN LA IMAGEN
                                        console.log(
                                            `549${numbers[i]}@c.us`,
                                            campaing[0]?.campaingMessage
                                        );

                                        console.log(
                                            "file: index.js ~ line 197 ~ numberDictionary[wamNumber]",
                                            numberDictionary[wamNumber]
                                        );
                                        switch (caso) {
                                            case "MOTOS":
                                                console.log(
                                                    "MOTOS ->",
                                                    wamNumber
                                                );
                                                console.log(
                                                    "numero de telefono ->",
                                                    {
                                                        telefono: numbers[i],
                                                        i: i,
                                                    }
                                                );
                                                console.log(
                                                    "file: index.js ~ line 204 ~ wamNumber",
                                                    wamNumber
                                                );
                                                const resultSendMessagemotos =
                                                    await cliente[0].clienteInit.sendMessage(
                                                        `549${numbers[i]}@c.us`,
                                                        campaing[0]
                                                            ?.campaingMessage
                                                    );
                                                insertMessage(
                                                    `549${wamNumber}@c.us`,
                                                    `549${numbers[i]}@c.us`,
                                                    resultSendMessagemotos.timestamp,
                                                    resultSendMessagemotos.id
                                                        .id,
                                                    resultSendMessagemotos.ack,
                                                    campaingID
                                                );
                                                break;
                                            case "HOGAR":
                                                console.log(
                                                    "HOGAR ->",
                                                    wamNumber
                                                );
                                                console.log(
                                                    "file: index.js ~ line 208 ~ wamNumber",
                                                    wamNumber
                                                );
                                                const resultSendMessagehogar =
                                                    await cliente[0].clienteInit.sendMessage(
                                                        `549${numbers[i]}@c.us`,
                                                        campaing[0]
                                                            ?.campaingMessage
                                                    );
                                                insertMessage(
                                                    `549${wamNumber}@c.us`,
                                                    `549${numbers[i]}@c.us`,
                                                    resultSendMessagehogar.timestamp,
                                                    resultSendMessagehogar.id
                                                        .id,
                                                    resultSendMessagehogar.ack,
                                                    campaingID
                                                );
                                                break;
                                            case "STORE":
                                                console.log(
                                                    "STORE ->",
                                                    wamNumber
                                                );
                                                console.log(
                                                    "file: index.js ~ line 212 ~ wamNumber",
                                                    wamNumber
                                                );
                                                const resultSendMessagestore =
                                                    await cliente[0].clienteInit.sendMessage(
                                                        `549${numbers[i]}@c.us`,
                                                        campaing[0]
                                                            ?.campaingMessage
                                                    );
                                                insertMessage(
                                                    `549${wamNumber}@c.us`,
                                                    `549${numbers[i]}@c.us`,
                                                    resultSendMessagestore.timestamp,
                                                    resultSendMessagestore.id
                                                        .id,
                                                    resultSendMessagestore.ack,
                                                    campaingID
                                                );
                                                break;
                                            default:
                                                break;
                                        }
                                        console.log({
                                            message:
                                                "Mensaje enviado correctamente",
                                        });
                                        if (i === 0)
                                            updateSendCapaingDate({
                                                campaingID,
                                            });
                                        if (cont === numbers.length)
                                            updateEndCapaingDate({
                                                campaingID,
                                            });
                                    }
                                    console.log(
                                        `${i + 1}) ${numbers[i]} ${
                                            random / 1000
                                        } sec \n`
                                    );
                                }, random * i);
                            })(i);
                            // res.write(`${i + 1}) ${numbers[i]} ${random / 1000} sec \n`)
                        }
                    } catch (error) {
                        console.log(error);
                        if (!!res)
                            return {
                                status: "error",
                                "error message": error,
                            };
                        else return { status: "error", "error message": error };
                    }
                } else if (numbers.length === 0) return { message, numbers }; //no existe cel. vinculados a la capaña
            } else if (campaing.length > 1) {
                if (!!res) return { campaing };
                else return { campaing };
            } else if (campaing.length === 0) {
                if (!!res) return { message: "Campaing not found" };
                else return { message: "Campaing not found" };
            }
        } catch (error) {
            console.log(error);
            return { error };
        }
    }
};

exports.sendCampaing = async (req, res) => {
    console.log("numberdirecorio en sendcam=> ", await numberDictionary);

    const { filename = "", userID, campaingID } = req.body;
    console.log({ userID, campaingID });
    //busca en BD si existe el usuario y toma el campo wanNumber
    let = 0;
    const { wamNumber } = await getUserDataByID(userID);
    console.log("campaingDirectory=========== ", await numberDictionary);
    /* Object.values(await numberDictionary).forEach(element => {
    }); */
    let cliente;
    for (let i = 0; i < clienteIniciado.length; i++) {
        //FILTRO "ACTIVO" EL CLIENTE QUE TIENE LA SESION INICIADA

        if (clienteIniciado.length === 1) {
            cliente = clientes.filter(
                (client) =>
                    client.clienteInit.authStrategy.clientId ==
                    clienteIniciado[0]
            );
        } else {
            cliente = clientes.filter(
                (client) =>
                    client.clienteInit.authStrategy.clientId ==
                    numberDictionary[0][wamNumber]
            );
        }
    }
    if (!!campaingID) {
        console.log("campaing ", campaingID);
        try {
            const { campaing = [], message = "" } = await this.getCampaing(
                campaingID
            ); //busca en BD la campaña
            console.log(campaing);
            if (campaing.length === 1) {
                // si existe el numero de campaña, busca numeros de tel. asociados

                const { numbers = [], message = "" } = await getNumebrs(
                    campaingID
                ); //devuelve array json con los numeros
                if (numbers.length > 0) {
                    try {
                        //declara la funcion //numero aleatorio incluyendo el numero minimo y el maximo pasado por parametro
                        const getRandomNumber = (min, max) =>
                            Math.round(Math.random() * (max - min)) + min;
                        if (!!res) {
                            res.writeHead(200, {
                                "Content-Type": "text/plain",
                                "Transfer-Encoding": "chunked",
                            });
                        }
                        /* construct manually - FOR RECORRE POR CADA CEL. PARA EL ENVIO */
                        let cont = 0;
                        let caso;
                        (await numberDictionary).forEach((e) => {
                            if (Object.keys(e)[0] === wamNumber) {
                                caso = e[wamNumber];
                            }
                            Object.keys(e) === wamNumber;
                        });
                        for (let i = 0; i < numbers.length; i++) {
                            let random = getRandomNumber(2500, 15000); //llama la funcion declarada lineas arriba
                            (async function (i) {
                                setTimeout(async function () {
                                    cont++;
                                    if (!!filename) {
                                        ///SI EXISTE EL ARCHIVO
                                        if (i === 0) {
                                            //SI ES EL PRIMER NUMERO DE LA LISTA
                                            console.log("Entro por i===0", i);
                                            //setTimeout(async () => {
                                            console.log(
                                                "Entro por i===0 hola",
                                                numbers.length
                                            );

                                            if (
                                                fs.existsSync(
                                                    `public/${filename.trim()}`
                                                )
                                            ) {
                                                const media =
                                                    MessageMedia.fromFilePath(
                                                        `public/${filename.trim()}`
                                                    );

                                                switch (caso) {
                                                    case "MOTOS":
                                                        console.log(
                                                            "MOTOS indice i es 0 x->",
                                                            numbers[i]
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 148 ~ wamNumber",
                                                            wamNumber
                                                        );

                                                        const resultSendMessagemotos =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );

                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagemotos.timestamp,
                                                            resultSendMessagemotos
                                                                .id.id,
                                                            resultSendMessagemotos.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    case "HOGAR":
                                                        console.log(
                                                            "HOGAR indice i es 0 x->",
                                                            numbers[i]
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 148 ~ wamNumber",
                                                            wamNumber
                                                        );
                                                        const resultSendMessagehogar =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );
                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagehogar.timestamp,
                                                            resultSendMessagehogar
                                                                .id.id,
                                                            resultSendMessagehogar.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    case "STORE":
                                                        console.log(
                                                            "STORE ->",
                                                            wamNumber
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 156 ~ wamNumber",
                                                            wamNumber
                                                        );
                                                        const resultSendMessagestore =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );

                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagestore.timestamp,
                                                            resultSendMessagestore
                                                                .id.id,
                                                            resultSendMessagestore.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                if (i === 0)
                                                    console.log({
                                                        messageee:
                                                            "Mensaje enviado correctamente: i == 0",
                                                    });
                                                if (cont === numbers.length)
                                                    console.log(
                                                        "cont === numbers.length"
                                                    );
                                                updateEndCapaingDate({
                                                    campaingID,
                                                });
                                                console.log(
                                                    "file: index.js ~ line 170 ~ (cont + 1) === numbers.length",
                                                    cont === numbers.length,
                                                    cont,
                                                    numbers.length
                                                );
                                            }
                                            //}, 3000)
                                            updateSendCapaingDate({
                                                campaingID,
                                            }); //actualiza fecha de envio y estado en progreso
                                        } else {
                                            //DISTINTO AL PRIMER NUMERO DE LA LISTA DE CONTACTOS
                                            console.log("Entro por i ??", i);
                                            if (
                                                fs.existsSync(
                                                    `public/${filename.trim()}`
                                                )
                                            ) {
                                                const media =
                                                    MessageMedia.fromFilePath(
                                                        `public/${filename.trim()}`
                                                    );
                                                console.log(
                                                    "num EN ELSE",
                                                    numbers[i]
                                                );
                                                console.log("entro aquii x2");
                                                switch (caso) {
                                                    case "MOTOS":
                                                        console.log(
                                                            "MOTOS ->",
                                                            wamNumber
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 173 ~ wamNumber",
                                                            wamNumber
                                                        );
                                                        const resultSendMessagemotos =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );
                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagemotos.timestamp,
                                                            resultSendMessagemotos
                                                                .id.id,
                                                            resultSendMessagemotos.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    case "HOGAR":
                                                        console.log(
                                                            "HOGAR ->",
                                                            wamNumber
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 177 ~ wamNumber",
                                                            wamNumber
                                                        );
                                                        const resultSendMessagehogar =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );

                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagehogar.timestamp,
                                                            resultSendMessagehogar
                                                                .id.id,
                                                            resultSendMessagehogar.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    case "STORE":
                                                        console.log(
                                                            "STORE ->",
                                                            wamNumber
                                                        );
                                                        console.log(
                                                            "file: index.js ~ line 181 ~ wamNumber",
                                                            wamNumber
                                                        );
                                                        const resultSendMessagestore =
                                                            await cliente[0].clienteInit.sendMessage(
                                                                `549${numbers[i]}@c.us`,
                                                                media,
                                                                {
                                                                    caption:
                                                                        campaing[0]
                                                                            ?.campaingMessage,
                                                                }
                                                            );

                                                        insertMessage(
                                                            `549${wamNumber}@c.us`,
                                                            `549${numbers[i]}@c.us`,
                                                            resultSendMessagestore.timestamp,
                                                            resultSendMessagestore
                                                                .id.id,
                                                            resultSendMessagestore.ack,
                                                            campaingID
                                                        );
                                                        break;
                                                    default:
                                                        break;
                                                }
                                                if (i === 0)
                                                    updateSendCapaingDate({
                                                        campaingID,
                                                    });
                                                if (cont === numbers.length)
                                                    updateEndCapaingDate({
                                                        campaingID,
                                                    });
                                                console.log(
                                                    "file: index.js ~ line 204 ~ (cont + 1) === numbers.length",
                                                    cont === numbers.length
                                                );
                                                console.log({
                                                    message:
                                                        "Mensaje enviado correctamente",
                                                });
                                            }
                                        }
                                    } else {
                                        ///SI NO EXISTE EL ARCHIVO, ENVIA EL MENAJE A WHATT SIN LA IMAGEN
                                        console.log(
                                            `549${numbers[i]}@c.us`,
                                            campaing[0]?.campaingMessage
                                        );

                                        console.log(
                                            "file: index.js ~ line 197 ~ numberDictionary[wamNumber]",
                                            numberDictionary[wamNumber]
                                        );
                                        switch (caso) {
                                            case "MOTOS":
                                                console.log(
                                                    "MOTOS ->",
                                                    wamNumber
                                                );
                                                console.log(
                                                    "numero de telefono ->",
                                                    {
                                                        telefono: numbers[i],
                                                        i: i,
                                                    }
                                                );
                                                console.log(
                                                    "file: index.js ~ line 204 ~ wamNumber",
                                                    wamNumber
                                                );
                                                const resultSendMessagemotos =
                                                    await cliente[0].clienteInit.sendMessage(
                                                        `549${numbers[i]}@c.us`,
                                                        campaing[0]
                                                            ?.campaingMessage
                                                    );
                                                insertMessage(
                                                    `549${wamNumber}@c.us`,
                                                    `549${numbers[i]}@c.us`,
                                                    resultSendMessagemotos.timestamp,
                                                    resultSendMessagemotos.id
                                                        .id,
                                                    resultSendMessagemotos.ack,
                                                    campaingID
                                                );
                                                break;
                                            case "HOGAR":
                                                console.log(
                                                    "HOGAR ->",
                                                    wamNumber
                                                );
                                                console.log(
                                                    "file: index.js ~ line 208 ~ wamNumber",
                                                    wamNumber
                                                );
                                                const resultSendMessagehogar =
                                                    await cliente[0].clienteInit.sendMessage(
                                                        `549${numbers[i]}@c.us`,
                                                        campaing[0]
                                                            ?.campaingMessage
                                                    );
                                                insertMessage(
                                                    `549${wamNumber}@c.us`,
                                                    `549${numbers[i]}@c.us`,
                                                    resultSendMessagehogar.timestamp,
                                                    resultSendMessagehogar.id
                                                        .id,
                                                    resultSendMessagehogar.ack,
                                                    campaingID
                                                );
                                                break;
                                            case "STORE":
                                                console.log(
                                                    "STORE ->",
                                                    wamNumber
                                                );
                                                console.log(
                                                    "file: index.js ~ line 212 ~ wamNumber",
                                                    wamNumber
                                                );
                                                const resultSendMessagestore =
                                                    await cliente[0].clienteInit.sendMessage(
                                                        `549${numbers[i]}@c.us`,
                                                        campaing[0]
                                                            ?.campaingMessage
                                                    );
                                                insertMessage(
                                                    `549${wamNumber}@c.us`,
                                                    `549${numbers[i]}@c.us`,
                                                    resultSendMessagestore.timestamp,
                                                    resultSendMessagestore.id
                                                        .id,
                                                    resultSendMessagestore.ack,
                                                    campaingID
                                                );
                                                break;
                                            default:
                                                break;
                                        }
                                        console.log({
                                            message:
                                                "Mensaje enviado correctamente",
                                        });
                                        if (i === 0)
                                            updateSendCapaingDate({
                                                campaingID,
                                            });
                                        if (cont === numbers.length)
                                            updateEndCapaingDate({
                                                campaingID,
                                            });
                                    }
                                    console.log(
                                        `${i + 1}) ${numbers[i]} ${
                                            random / 1000
                                        } sec \n`
                                    );
                                }, random * i);
                            })(i);
                            // res.write(`${i + 1}) ${numbers[i]} ${random / 1000} sec \n`)
                        }
                    } catch (error) {
                        console.log(error);
                        if (!!res)
                            res.status(500).send({
                                status: "error",
                                "error message": error,
                            });
                        else return { status: "error", "error message": error };
                    }
                } else if (numbers.length === 0) {
                    console.log("entro aqui");
                    return res
                        .status(401)
                        .send({ numbers: "No existen nùmeros" }); //no existe cel. vinculados a la capaña
                }
            } else if (campaing.length > 1) {
                if (!!res) res.send({ campaing });
                else return { campaing };
            } else if (campaing.length === 0) {
                if (!!res) res.send({ message: "Campaing not found" });
                else return { message: "Campaing not found" };
            }
        } catch (error) {
            console.log("error===> ", error);
        }
    }
};
