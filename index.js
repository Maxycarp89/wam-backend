const express = require("express");
const app = express();
const cors = require("cors");
const xlsx = require("xlsx");
const path = require("path");
const fs = require("fs");
const qrcode= require('qrcode-terminal');
const {Client,LocalAuth,MessageMedia}= require('whatsapp-web.js');
const routes = require("./routes");
const { getCampaing } = require("./db/consultar");
const { clientes } = require("./controllers/clientwp");
//const { get } = require('./routes');
//const { send } = require('process');
//const { Console } = require('console');
//clientes[0].clienteString.authStrategy.clientId
///server
app.use(cors());

// el siguiente middleware hace el parse del cuerpo de la solicitud
// cuando el mismo viene en formato JSON (application/json)
app.use(express.json());

// el siguiente middleware hace el parse del cuerpo de la solicitud
// cuando el mismo se compone de un form data (application/x-www-form-urlencoded)
app.use(express.urlencoded({ extended: false }));

/*app.use(async (req,res,next)=>{
    console.log('prueba')
    const respuesta= await getCampaing(9);
    console.log(respuesta);

    next();

});*/

let respuesta = "";

////inicializar el cliente de whatsapp

const cliente= new Client({
    authStrategy: new LocalAuth()
    });

    cliente.on('qr', qr =>{
        qrcode.generate(qr,{small: true});
    })

    cliente.on('ready',()=>{
        console.log('El Cliente esta listo');               
    })      
  
    ///el cliente esta escuchando los mensajes
    cliente.on('message', msg =>{        
        const {from,to,body}=msg;

        //if(msg.body==='1'){
        //    cliente.sendMessage(msg.from,respuesta)
       // }

        //if(msg.body==='2'){
        //    cliente.sendMessage(msg.from,"Recibi 2")
        //}   
        cliente.sendMessage(msg.from,respuesta)     
        console.log(from,to,body);
    })                
    
    cliente.initialize();  



///rutas
app.get("/", (req, res) => {
    res.send("Hola Mundo");
});

app.post("/enviarmsg", (req, res) => {
    const { archivoexcel, msg } = req.body;
    
    console.log(archivoexcel);
    console.log(msg);
    let listadocel = leerexcel(archivoexcel);

    enviarmensajes(listadocel, msg, 0);

    res.send(req.body);
});

//middleware
app.use("/api/v1", routes);

//desactivo estas rutas que se van adireccionar desde routes
/*app.post('/api/v1/uploadImage',routes)

app.post('/api/v1/sendMessages',(req,res)=>{
    const {numbers,campaingMessage,filename,responseOne}=req.body;
    respuesta=responseOne;
    console.log(req.body);
    res.send(req.body);
    enviarmensajes(numbers,campaingMessage,filename,0)    
})
*/

let posicion = 0,
    bandera = 0;

///Funciones
const aleatorio = (min, max) => {
    return Math.floor(Math.random() * (max - min) + min);
};

const recorrer = (data, msge) => {
    if (!data[posicion]) return;

    setTimeout(() => {
        chatId = data[posicion]["telefono"] + "@c.us";
        cliente.sendMessage(chatId, msge);
        console.log("Numero de Cel. :", data[posicion]["telefono"]);
        posicion++;
        recorrer(data, msge);
    }, aleatorio(2500, 15000));
};

const recorrer1 = (data, msge, filename) => {
    console.log("dataPosicionTelefono: ",data[posicion]["telefono"]);
    //recorre todas las posiciones del array de numeros hasta el ultimo indice dando !true , luego da !false lo que hace que termine la funcion recursiva
    if (!data[posicion]) return;

    console.log(data[posicion]);
    setTimeout(() => {
        //let ruta=path.join("file",filename);
        //let adjunto= MessageMedia.fromFilePath(ruta);

        let adjunto = MessageMedia.fromFilePath(`public/${filename.trim()}`);

        //console.log(ruta);
        //console.log(filename);
        //console.log(adjunto);
        chatId = "549" + data[posicion] + "@c.us";
        clientes[0].clienteString.sendMessage(chatId, adjunto, { caption: msge });
        //cliente.sendMessage(chatId,msge)
        console.log("Numero de Cel. :", data[posicion]);
        posicion++;
        recorrer1(data, msge, filename);
    }, aleatorio(1000, 15000));
};

//recibe la ruta del archivo excel a leer
function leerexcel(ruta) {
    const workbook = xlsx.readFile(ruta);
    const workbookSheets = workbook.SheetNames;
    const sheet = workbookSheets[0];
    const dataexcel = xlsx.utils.sheet_to_json(workbook.Sheets[sheet]);

    return dataexcel;
}

/////recibe el listado de arhicos y enviar el mensaje a todos los contactos
function enviarmensajes(data, msge, filename, comenzar) {
    posicion = comenzar;
    /////opciones de whatsapp
    ////definir cliente de whatsapp
    console.log("funcion enviar mensaje", filename);

    if (bandera == 0) {
        //const cliente= new Client({
        //    authStrategy: new LocalAuth()
        //    });

        console.log("Enviar Mensajes abndera 0!!!");
        // cliente.on('ready',()=>{
        //     console.log('Comenzar el envio !!')
        //     recorrer(data,msge,cliente);
        // })

        //recorrer(data,msge);
        recorrer1(data, msge, filename); //funciona
        bandera = 1;
    } else {
        console.log("Enviar Mensajes bandera 1!!!");
        //cliente.on('ready',()=>{
        //    console.log('Comenzar el envio !!')
        //    recorrer(data,msge,cliente);
        //})

        //recorrer(data,msge);     //funciona bien
        recorrer1(data, msge, filename);
    }
}

///SERVIDOR ESCUCHANDO SOBRE EL PUERTO 3000
app.listen(3002, () => {
    console.log("Server Funcionando");

    cliente.on('ready',()=>{
    const country_code= "549";
    const cel="3813628481";
      const msg="Hola soy un boot,como estas?? ";

      let chatId= country_code+cel+"@c.us";
      let listadocel=leerexcel('prueba.xls');

     console.log('Comenzar el envio !!')
      recorrer(listadocel,msg);

    for(const celulares of listadocel){
       chatId=celulares['telefono']+"@c.us";
       cliente.sendMessage(chatId,msg)
       .then(response => {
       if(response.id.fromMe){
                console.log('El mensaje se envio correctamente');
            }
        })
         console.log(fila['telefono']);
      }

    })
});
