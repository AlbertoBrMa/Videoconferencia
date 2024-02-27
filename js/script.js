"use strict";
//Mediante el evento DOMContentLoaded, me aseguro que todo el código js se ejecutara una vez cargue la página
document.addEventListener("DOMContentLoaded", function () {

    //Capturo varios elementos del html los cuales son los botones para poder asignarles un evento que realice una funcion
    let mensajeErrorDiv = document.getElementById("mensajeError");
    let misBotones = document.getElementsByTagName("input");
    misBotones[2].addEventListener("click", darValor);
    misBotones[3].addEventListener("click", darValor);

    //Declaro varias variables en un ambito global
    let botonClicado;
    let nombre, contraseña;
    let mediaRecorder;
    let arrayVideo = [];

    //Capturo el elemento del formulario para realizar una funcion al realizarse el elemento submit propio de los usuarios.
    document.getElementsByTagName("form")[0].addEventListener("submit", function (event) {

        //Almaceno en una variable el valor obtenido de los inputs del formulario
        nombre = document.getElementById("nombre").value;
        contraseña = document.getElementById("contraseña").value;
        let mensajeError = "";

        //Realizo dos validaciones, la primera para la comprobación del nombre en la que nos aseguramos que el texto sea ASPIRANTE seguido de 4 números.
        if (!/^ASPIRANTE\d{4}$/.test(nombre)) {
            //Guardamos en una variable un mensaje por si el dato esta mal introducido.
            mensajeError += "El nombre debe ser ASPIRANTE seguido de 4 números.\n";
        }

        //La segunda validacion nos asegura que la cadena introducida posea un mínimo de 8 carácteres, un máximo de 40, deba tener una letra máyuscula y un número al menos, y no permita algunos carácteres especiales.
        if (!/^(?=.*[A-Z])(?=.*\d)(?!.*[&ñ@;_]).{8,40}$/.test(contraseña)) {
            mensajeError += "La contraseña o password, tendrá al menos una longitud de 8 caracteres, tiene que incluir al menos una letra Mayúscula y un número. No podrá incluir los caracteres (&,ñ,@,;,_).";
        }

        //En caso de que la variable mensajeError no este vacia al realizar esta comprobación, se creara un elemento p en el cual mostraremos el texto con los errores que se han cometido, y desactivaremos el evento submit para que no recargue la página.
        //Si la variable esta vacia llamamos a la funcion peticion asincrona y desactivamos el submit de nuevo.
        if (mensajeError !== "") {
            mensajeErrorDiv.innerHTML = "";
            let mensajeErrorElemento = document.createElement("p");
            mensajeErrorElemento.textContent = mensajeError;
            mensajeErrorElemento.style.color = "red";
            mensajeErrorDiv.appendChild(mensajeErrorElemento);
            event.preventDefault();
        } else {
            peticionAsincrona(nombre, contraseña, botonClicado, null);
            event.preventDefault();
        }
    });

    //Esta funcion solo la utilizo para darle valor a una variable el cual se obtiene del value de los inputs de tipo submit
    function darValor(event) {
        botonClicado = event.target.value;
    }

    //Esta funcion la usaremos para mantener contacto con la base de datos y el php. Aceptara 4 parametros de entrada.
    function peticionAsincrona(nombre, contraseña, botonClicado, pregunta) {
        //Creo un objeto llamado data con 4 atributos, y les doy un valor.
        const data = {
            nombre: nombre,
            contraseña: contraseña,
            valorBoton: botonClicado,
            pregunta: pregunta
        };

        //Creo otro objeto que usare para especificar la configuracion de la solicitud para que sea de POST y que se entienda que el contenido es un json
        const requestOptions = {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        };

        //Realizo una solicitud HTTP al archivo php, y le paso el objeto de la configuracion anterior.
        fetch('./php/logica.php', requestOptions)
            //Manejo la respuesta que devuelve el servidor, en caso de ser correcta devolvera un json y en caso de poder conectarse con el lado servidor mostrara un mensaje.
            .then(response => {
                if (response.ok) {
                    return response.json();
                } else {
                    throw new Error("Hubo un error en la conexión");
                }
            })
            //Aqui trabajaremos con los datos recibidos del servidor, lo primero comprobaremos si lo obtenido representa que se ha conseguido realizar la acción, ya sea registro, logueo u otra.
            //En caso de conseguirlo realizamos dependiendo de los datos devueltos llamadas a algunas funciones, en caso de que no lo consiga mostrara un mensaje por pantalla comentando el error.
            .then(data => {
                if (data.success) {
                    document.getElementById("mensajeError").innerHTML = data.message;
                    if (data.message == "Inicio de sesión exitoso.") {
                        cambiarPagina();
                    } else if (botonClicado == "iniciarEntrevista" && data.message != null) {
                        document.getElementsByTagName("button")[0].disabled = true;
                        document.getElementsByTagName("button")[1].disabled = true;
                        activarCam();
                        document.getElementsByTagName("button")[2].disabled = false;
                    }

                } else {
                    document.getElementById("mensajeError").innerHTML = "<span style='color: red;'>" + data.error + "</span>";
                }
            })
            .catch(error => console.error(error));
    }

    //Esta funcion se llevara a cabo tras realizar un logueo correcto, aqui realizaremos un cambio en la estructura de la estructura del html, eliminando los elementos del body anteriores y generando unos distintos.
    function cambiarPagina() {
        document.getElementsByTagName("body")[0].innerHTML = "";

        let midiv = document.createElement("div");
        midiv.id="LoNecesitoOSeLia";


        let inputTexto = document.createElement("input");
        inputTexto.id = "inputTexto";
        inputTexto.type = "text";
        inputTexto.placeholder = "Introducir una pregunta";

        let boton1 = document.createElement("button");
        boton1.textContent = "Agregar Pregunta";
        boton1.value = "añadirPregunta";

        let boton2 = document.createElement("button");
        boton2.textContent = "Iniciar Entrevista";
        boton2.value = "iniciarEntrevista";

        let h1Pregunta = document.createElement("h1");
        h1Pregunta.textContent = "Pregunta:";

        let divPregunta = document.createElement("div");
        divPregunta.id = "mensajeError";

        let divGrabacion = document.createElement("div");
        divGrabacion.id = "divGrabacion";

        let camara = document.createElement("video");
        camara.id = "camara";

        divGrabacion.appendChild(camara);

        let boton3 = document.createElement("button");
        boton3.textContent = "Grabar Respuesta";
        boton3.disabled = true;

        let boton4 = document.createElement("button");
        boton4.textContent = "Detener Grabación";
        boton4.disabled = true;


        midiv.appendChild(inputTexto);
        midiv.appendChild(boton1);
        midiv.appendChild(boton2);
        midiv.appendChild(h1Pregunta);
        midiv.appendChild(divPregunta);
        midiv.appendChild(divGrabacion);
        midiv.appendChild(boton3);
        midiv.appendChild(boton4);
        document.body.appendChild(midiv);

        //Aqui les asigno una función que se ejecutara tras realizar un evento.
        boton1.addEventListener("click", darValor);
        boton2.addEventListener("click", darValor);
        boton1.addEventListener("click", añadirPregunta);
        boton2.addEventListener("click", function () {
            peticionAsincrona(null, null, botonClicado, null);
        });
        boton4.addEventListener("click", detenerGrabacion);
    }


    //Una funcion en la que comprobara si en el input de las preguntas se encuentra vacio, en caso de que no lo este realizara una petición asincrona al php, tratando de guardar el valor de la pregunta.
    function añadirPregunta() {
        let pregunta = document.getElementById("inputTexto").value;
        if (/^[\s\S]*\S[\s\S]*$/.test(pregunta) && pregunta != null) {
            peticionAsincrona(nombre, null, botonClicado, pregunta);
            document.getElementById("inputTexto").value = "";
        } else {
            document.getElementById("mensajeError").innerHTML = "<span style='color: red;'>Introduce una pregunta, por favor.</span>";
        }
    }

    async function activarCam() {
        try {
           
            // Obtiene acceso a la webcam y al micrófono
            const permisos = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
    
            // Muestra la transmisión en una etiqueta <video>
            let camara = document.getElementById("camara");
            camara.srcObject = permisos;
    
            // Inicia la reproducción del video
            camara.play();
    
            // Inicializa el objeto MediaRecorder con el permisos de la webcam
            mediaRecorder = new MediaRecorder(permisos);
    
            // Evento que se dispara cuando hay datos disponibles para la grabación
            mediaRecorder.ondataavailable = (event) => {
                if (event.data.size > 0) {
                    arrayVideo.push(event.data);
                }
            };
    
            // Evento que se dispara cuando la grabación ha terminado
            mediaRecorder.onstop = () => {
                // Combina los fragmentos grabados y guárdalos
                guardarGrabacion();

                // Detener cualquier transmisión activa
                permisos.getTracks().forEach(track => track.stop());
            };
    
            document.getElementsByTagName("button")[2].addEventListener("click", function(){
                document.getElementsByTagName("button")[2].disabled = true;
                document.getElementsByTagName("button")[3].disabled = false;
                // Inicia la grabación
                mediaRecorder.start();
               
            });
            
        } catch (error) {
            console.error("Error al acceder a la webcam:", error);

            document.getElementsByTagName("button")[2].disabled = true;
            document.getElementsByTagName("button")[0].disabled = false;
            document.getElementsByTagName("button")[1].disabled = false;

            document.getElementById("mensajeError").innerHTML ="<span style='color: red;'> Error al acceder a la webcam:" + error + ". Prueba a activar los permisos.</span>";
        }
    }
    
    
    function guardarGrabacion() {
        // Crea un blob con los fragmentos grabados
        let blob = new Blob(arrayVideo, { type: 'video/webm' });
    
        // Crea un objeto URL para el blob
        let url = URL.createObjectURL(blob);
    
        // Crea un enlace para descargar la grabación
        let linkDescarga = document.createElement('a');
        linkDescarga.href = url;
    
        // Cambia el nombre del archivo y ajusta la ubicación de descarga
        linkDescarga.download = 'Grabacion.webm';
              
        linkDescarga.click();
    
        // Limpia las variables y el objeto URL
        arrayVideo = [];
        URL.revokeObjectURL(url);
    }
    
    function detenerGrabacion() {
        // Detiene la grabación cuando se hace clic en el botón
        if (mediaRecorder && mediaRecorder.state !== 'inactive') {
            mediaRecorder.stop();
            document.getElementsByTagName("button")[0].disabled=false;
            document.getElementsByTagName("button")[1].disabled=false;
            document.getElementsByTagName("button")[3].disabled=true;
            document.getElementById("mensajeError").innerHTML = "";
        }
    }    
});
