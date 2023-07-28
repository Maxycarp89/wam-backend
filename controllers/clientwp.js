const qrcode = require("qrcode-terminal");
const { Client, LocalAuth, MessageMedia } = require("whatsapp-web.js");
const fs = require(`fs`);
const { dictionary } = require("./dictionary");

// ****** CONSULTA SQL PARA RELLENAR DIRECTORIO


let numberDictionary = dictionary();
// *****  //

let clientes = [];
let clienteIniciado = [];

const iniciarCliente = (indiceCliente) => {
    ////inicializar el cliente de whatsapp
    let clienteString = Object.values(indiceCliente).toString();
    console.log("indice de cliente: ", Object.values(indiceCliente).toString());
    const cliente = new Client({
        authStrategy: new LocalAuth({ clientId: clienteString }),
    });

    const listenMessage = () => {
        ///el cliente esta escuchando los mensajes
        cliente.on("message", (msg) => {
            const { from, to, body } = msg;
            console.log(from, to, body);
            if (msg.body === "1") {
                cliente.sendMessage(
                    msg.from,
                    "¡Muchas gracias por aceptar!. Soy un 🤖 y no puedo contestar tus preguntas.Para comunicarte con un asesor seguí este link 👉 http://wa.me/5493814982993"
                );
            }
            //if(msg.body==='2'){
            //    cliente.sendMessage(msg.from,"Recibi 2")
            //}
            //motos.sendMessage(msg.from,respuesta)
        });
    };

    cliente.on("qr", (qr) => {
        console.log(`qr ${clienteString}`);
        qrcode.generate(qr, { small: true });
    });

    cliente.on("ready", () => {
        clienteIniciado.push(clienteString);
        console.log(`El Cliente ${clienteString} esta listo`);

        listenMessage();
    });

    cliente.initialize();
    console.log("cliente ", clienteString);
    return { clienteInit: cliente };
};
async function iniciar () {
    for (let indice of Object.values(await numberDictionary)) {
        clientes.push(iniciarCliente(indice));
    }    
}
iniciar()
module.exports = {
    clientes,
    clienteIniciado,
    numberDictionary,
    MessageMedia,
};
