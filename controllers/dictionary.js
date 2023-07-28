const { getAllDirectorios } = require("./divisionesSQL");

exports.dictionary = async () => {
      let numberDictionary =[]
      let result = await getAllDirectorios();
      console.log(result)
      
      result.forEach((direct) => {
          direct = { ...direct };
          let key = direct.wamNumber;
          let value = direct.nombreDivision;
  
          let obj = {
              [key]: value,
          };
          numberDictionary.push(obj);
      });
      return await numberDictionary
  };