class mycanvas {

    constructor(){
        this.crearCanvas();    
    }

    crearCanvas(){
        
        const imagen = document.querySelector('#myFile');
        const btn_restablecer = document.querySelector('#restablecer');
        const btn_invertir = document.querySelector('#invertir');
        const btn_sepia = document.querySelector('#sepia');
        const btn_escalas = document.querySelector('#escalas');
        const imagenPreview = document.querySelector('#imagenPreview');
        const select_canvas = document.querySelector('#select_canvas');
        const ctx = select_canvas.getContext("2d");
        let x=0;
        let y=0;
        let width=select_canvas.width;
        let height=select_canvas.height; 
        let datosOriginales;
        let matriz;
        let matrizV; //matriz adicional
        imagen.addEventListener('change', ()=>{
            
            const selectImagen = imagen.files;

            if (!selectImagen || !selectImagen.length) {
                imagenPreview.src = "";
                return;
              }

                const primerArchivo = selectImagen[0];
                const objectURL = URL.createObjectURL(primerArchivo);
                imagenPreview.src = objectURL;              

                imagenPreview.onload = function(){
                    ctx.clearRect(0, 0, ctx.canvas.offsetWidth, ctx.canvas.offsetHeight);
                    ctx.drawImage(imagenPreview, x, y, width, height);
                    let imgData = ctx.getImageData(x,y,width,height);
                    datosOriginales = imgData.data;
                    
                }
             
        });

        btn_invertir.addEventListener('click', ()=>{
          matriz = [ -1, 0, 0, 0, -1, 0, 0, 0, -1 ];
          matrizV = [ 255, 255, 255 ];
          efectos(ctx, matriz, matrizV);
       });

        btn_escalas.addEventListener('click', ()=>{
           matriz = [ 1/3, 1/3, 1/3, 1/3, 1/3, 1/3, 1/3, 1/3, 1/3 ];
           matrizV = [ 0, 0, 0 ];
           efectos(ctx, matriz, matrizV);
        });

        btn_sepia.addEventListener('click', ()=>{
           matriz = [ 0.393, 0.769, 0.189, 0.349, 0.686, 0.168, 0.272, 0.534, 0.131 ];
           matrizV = [ 0, 0, 0 ];
          efectos(ctx, matriz, matrizV);
        })

        btn_restablecer.addEventListener('click', ()=>{
          restablecerPixel(ctx);
        });
       
        function efectos(ctx, matriz, matrizV){
          let imgData = ctx.getImageData(x,y,width,height);
          console.log(imgData.data);
          for(let i=0; i < imgData.data.length; i+= 4){
            
              const matrizRGB = {  r: imgData.data[i], g: imgData.data[i+1], b: imgData.data[i+2] };
              //RGB Rojo
              imgData.data[i] = matriz[0] * matrizRGB.r + matriz[1] * matrizRGB.g + matriz[2] * matrizRGB.b + matrizV[0];  
              //RGB verde
              imgData.data[i+1] = matriz[3] * matrizRGB.r + matriz[4] * matrizRGB.g + matriz[5] * matrizRGB.b + matrizV[1];
              //RGB azul
              imgData.data[i+2] = matriz[6] * matrizRGB.r + matriz[7] * matrizRGB.g + matriz[8] * matrizRGB.b + matrizV[2];

          }
          ctx.putImageData(imgData, 0, 0);
        }

        function restablecerPixel(ctx) {
         
           let imgData = ctx.getImageData(x,y,width,height);

            for(let i=0; i < imgData.data.length; i+= 4){
              //r
              imgData.data[i] = datosOriginales[i];
              //g
              imgData.data[i + 1] = datosOriginales[i + 1];
              //b
              imgData.data[i + 2] = datosOriginales[i + 2];

            }
            ctx.putImageData(imgData, 0, 0);
        }        
    
    }

    

}

new mycanvas();