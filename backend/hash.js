const bcrypt = require('bcrypt');
const password = 'PaLMeRiTa1968';
bcrypt.hash(password, 10, (err, hash) => {
    if (err) throw err;
    console.log('Hash generado:', hash);
});
