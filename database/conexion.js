const mysql = require('mysql');
const connection = mysql.createConnection({
host:'localhost', 
user:'root', //SE DEBE CAMBIAR
password:'',// SE DEBE CAMBIAR
database: 'db_fotos' // SE DEBE CAMBIAR

});

connection.connect((error)=>{
    if (error) {
        console.log('El error de conexion es:'+error);
        return;
    }
    console.log('Conexion con exito ');
});
module.exports = connection;
