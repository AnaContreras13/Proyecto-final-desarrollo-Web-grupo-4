const image_input = document.querySelector("#myFile");
var uploaded_image = ""

image_input.addEventListener("change", function(){
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    uploaded_image = reader.result;
    document.querySelector("#mostrar-imagen").style.backgroundImage = `url(${uploaded_image})`;
  });
  reader.readAsDataURL(this.files[0]);
});