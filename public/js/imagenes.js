const firebaseConfig = {
    apiKey: "AIzaSyD7E6e0Rnz-4YDNovlgkKmaGsnrofKDaa0",
    authDomain: "proyecto-final---grupo-5.firebaseapp.com",
    projectId: "proyecto-final---grupo-5",
    storageBucket: "proyecto-final---grupo-5.appspot.com",
    messagingSenderId: "705947493879",
    appId: "1:705947493879:web:580811d1984e393328baf2",
    measurementId: "G-N874KX2Q6D"
  };

window.onload = inicializar;
var fichero;
var storageRef;
var imagenes_samepicRef;

function inicializar() {
    firebase.initializeApp(firebaseConfig);
    fichero = document.getElementById("myFile");
    fichero.addEventListener("change", subirImagen, false);
    storageRef = firebase.storage().ref();

    imagenes_samepicRef = firebase.database().ref().child("imagenesSamePic");

    mostrarImagenesFirebase();
}

function mostrarImagenesFirebase(){

}

function subirImagen() {
    var id_usuario = document.getElementById("id_usuario");
    var imagenSubir = fichero.files[0];
    var uploadTask = storageRef.child('imagenes/' + imagenSubir.name).put(imagenSubir);
    uploadTask.on('state_changed',
    function(error){
    },
    function(){
        var downloadURL = uploadTask.snapshot.downloadURL;
        document.getElementById('dire_url').innerHTML = downloadURL;
        alert("Se subió la imagen en el URL: "+ downloadURL);
        crearNodoFirebase(imagenSubir.name, downloadURL);
    });
}

function crearNodoFirebase(nombreImagen, downloadURL ){
    imagenes_samepicRef.push({ nombre: nombreImagen, url: downloadURL });
}