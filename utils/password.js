const bcrypt = require('bcryptjs');

module.exports = {

    hashPassword: async (password) => {

        const saltRounds = 10;
        const hashedPassword = bcrypt.hashSync(password, saltRounds);
        return hashedPassword;
      },
    
    comparePassword: async (a, b) => {
      return await bcrypt.compare(a, b)
}


}