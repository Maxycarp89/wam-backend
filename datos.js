const data=['5493814735101','5493816484601','5493813628481','5493814203050'];

let posicion=0;

const aleatorio=(min,max)=>{        
    return Math.floor(Math.random() * (max - min) + min);
}

const recorrer=()=>{
    if(!data[posicion])
        return
    
    setTimeout(()=>{
        console.log('Numero de Cel. :',data[posicion]);
        posicion++;
        recorrer();
    },aleatorio(1000,15000))
}


recorrer();
console.log('Fin del proceso');