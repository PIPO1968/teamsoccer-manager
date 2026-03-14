// Script para generar hash bcrypt en Node.js
import bcrypt from 'bcryptjs';

const password = 'PaLMeRiTa1968';
bcrypt.hash(password, 10).then(hash => {
    console.log('Hash generado:', hash);
});
