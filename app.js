const express = require('express');
const multer = require('multer');
const app= express();

app.use(express.urlencoded({extended:false}));
app.use(express.json());
app.use('/resources', express.static('public'));
app.use('/resources', express.static(__dirname + '/public'));

app.set('view_engine', 'ejs');

const bcryptjs= require ('bcryptjs');

const session = require('express-session');
app.use(session({
    secret:'secret',
    resave: true,
    saveUninitialized:true
}));

const connection = require('./database/conexion');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'public/uploads')
    },
    filename: function (req, file, cb) {
        const ext = file.originalname;
        cb(null,`${ext}`)
    }
});

const upload = multer({storage})

app.get('/index', (req,res)=>{
    res.render('index.ejs');
});

app.get('/logout', (req, res)=>{
    req.session.destroy(()=>{
        res.render('index.ejs')
    })
});

app.get('/perfil/:id_usuario', (req, res)=>{
    connection.query('SELECT * FROM usuario WHERE id_usuario= ?', [req.params.id_usuario], (error,results)=>{
        connection.query('SELECT * FROM foto WHERE id_usuario= ?', [req.params.id_usuario], (error,results2)=>{
            if (error) {
                throw error;
            }else{
                res.render('perfil.ejs',{results:results[0],results2});
            }
        })
    })
});

app.get('/subir_imagen/:id_usuario', (req, res)=>{
    connection.query('SELECT * FROM usuario WHERE id_usuario= ?', [req.params.id_usuario], (error,results)=>{
        if (error) {
            throw error;
        }else{
            res.render('filtros.ejs',{results:results[0]});
        }
})});

app.get('/editar_perfil/:id_usuario', (req, res)=>{
    connection.query('SELECT * FROM usuario WHERE id_usuario= ?', [req.params.id_usuario], (error,results)=>{
        if (error) {
            throw error;
        }else{
            res.render('editar_perfil.ejs',{results:results[0]});
        }
})});

app.post('/sign_up/:usuario', async(req, res)=>{
    const name = req.body.name2;
    const user = req.body.user2;
    const pass = req.body.pass2;
    var condicion = false;
    let passwordHaash = await bcryptjs.hash(pass, 8);
    connection.query('SELECT * FROM usuario WHERE email = ?',[user],(error,results)=>{
        if (results.length == 0) {
            connection.query('INSERT INTO usuario SET ?', {nombre:name,email:user, password:passwordHaash}, async(error, results)=>{
                if (error) {
                    console.log(error);
                } else {
                    res.render('index.ejs',{
                        results:results[0],
                        alert:true,
                        alertTitle: "¡Registro exitoso!",
                        alertMessage: "Su registro se realizó con éxito",
                        alertIcon: "success",
                        showConfirmButton: true,
                        timer: false,
                        ruta: 'index'
                    });
                }
            })
        }else{
            res.render('index.ejs',{
                results:results=false,
                alert:true,
                alertTitle: "¡Registro duplicado!",
                alertMessage: "Este nombre de usuario ya se encuentra en la base de datos, por favor utilice otro",
                alertIcon: "error",
                showConfirmButton: true,
                timer: false,
                ruta: 'index'
            });
        }
        
})});

app.post('/login', async(req, res)=>{
    const user=req.body.user;
    const pass= req.body.pass;
    const id = req.params.id_usuario
    let passwordHaash = await bcryptjs.hash(pass, 8);
    if (user && pass) {
        connection.query('SELECT * FROM usuario WHERE email= ?', [user], async(error, results)=>{
            if (results.length == 0 || !(await bcryptjs.compare(pass,results[0].password))){
                res.render('index.ejs',{
                    results:results=false,
                    alert:true,
                    alertTitle: "Error",
                    alertMessage: "Usuario y/o contraseña incorrectas",
                    alertIcon: "error",
                    showConfirmButton: true,
                    timer: false,
                    ruta: 'index'
                });
            }else{
                req.session.loggedin = true;
                req.session.name = results[0].email
                res.render('index.ejs',{
                    results:results[0],
                    alert:true,
                    alertTitle: "Bienvenido",
                    alertMessage: "Usuario correcto",
                    alertIcon: "success",
                    showConfirmButton: false,
                    timer: 1500,
                    ruta: 'perfil'
                });
            }
        })
    }
});

app.post('/subir_imagen/:id_usuario', upload.single('myFile'), async(req, res)=>{
    let id_usuario = req.params.id_usuario;
    const imagen = req.file.filename;
    connection.query('SELECT * FROM usuario WHERE id_usuario= ?', [id_usuario], async(error,results)=>{
        if(results.length== 0) {
            res.render('filtros.ejs',{
                results:results[0],
                alert:true,
                alertTitle: "¡USUARIO NO ENCONTRADO",
                alertMessage: "No ha sido posible encontrar al usuario",
                alertIcon: "error",
                showConfirmButton: true,
                timer: false,
                ruta: 'subir_imagen/'+id_usuario
             });
        }else{
            connection.query('INSERT INTO foto SET ?', {id_usuario:id_usuario, imagen:imagen}, async(error,results)=>{
                if (error) {
                    console.log(error);
                } else {
                    res.render('filtros.ejs',{
                        results:results[0],
                        alert:true,
                        alertTitle: "¡SUBIDA EXITOSA!",
                        alertMessage: "Su foto ha sido subida con éxito",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: 'subir_imagen/'+id_usuario
                    });
                }
            })
        }
    })
});

app.post('/editar_foto_perfil/:id_usuario', upload.single('myFile'), async(req, res)=>{
    let id_usuario = req.params.id_usuario;
    const imagen = req.file.filename;
    let sql= "UPDATE usuario SET imagen= ? WHERE id_usuario= ?";
    connection.query('SELECT * FROM usuario WHERE id_usuario= ?', [id_usuario], async(error, results)=>{
        if(results.length== 0) {
            res.render('editar_perfil.ejs',{
                results:results[0],
                alert:true,
                alertTitle: "¡USUARIO NO ENCONTRADO",
                alertMessage: "No ha sido posible encontrar al usuario",
                alertIcon: "error",
                showConfirmButton: true,
                timer: false,
                ruta: 'editar_perfil/'+id_usuario
             });
        }else{
            connection.query(sql,[imagen,id_usuario], async function(error,results){
                if (error) {
                    console.log(error);
                } else {
                    res.render('editar_perfil.ejs',{
                        results:results[0],
                        alert:true,
                        alertTitle: "¡SUBIDA EXITOSA!",
                        alertMessage: "Su foto ha sido subida con éxito",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: 'editar_perfil/'+id_usuario
                     });
                }
            })
        }
    })
});

app.post('/eliminar/:id_usuario/:id_foto', (req,res)=>{
    const id_usuario = req.params.id_usuario;
    const id_foto = req.params.id_foto;
    connection.query('SELECT * FROM usuario WHERE id_usuario= ?', [id_usuario], async(error, results)=>{
        connection.query('SELECT * FROM foto WHERE id_usuario= ?', [id_usuario], async(error, results2)=>{
            connection.query('DELETE FROM foto WHERE id_foto = ?', [id_foto], function(error,results3){
                if (error) {
                    throw error;
                } else {
                    console.log(results2);
                    res.render('perfil.ejs',{
                        results,
                        results2,
                        alert:true,
                        alertTitle: "¡ELIMINACIÓN EXITOSA!",
                        alertMessage: "su fotografía fue realizada con éxito",
                        alertIcon: "success",
                        showConfirmButton: false,
                        timer: 1500,
                        ruta: 'perfil/'+id_usuario
                    });
                }
            })
        })
    })
});

app.listen(8000,(req, res)=>{
    console.log('El servidor esta corriendo http://localhost:8000/index');
});