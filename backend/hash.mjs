import bcrypt from 'bcrypt';
const password = 'PaLMeRiTa1968';
bcrypt.hash(password, 10).then(hash => {
    console.log('Hash generado:', hash);
});
