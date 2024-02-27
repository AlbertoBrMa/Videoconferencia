<?php
header('Content-Type: application/json');

try {
    // Obtener los datos JSON del cuerpo de la solicitud
    $json_data = file_get_contents('php://input');

    // Decodificar el JSON
    $datos_decodificados = json_decode($json_data, true);

    // Verificar si se pudo decodificar el JSON correctamente
    if ($datos_decodificados === null) {
        http_response_code(400); // Bad Request
        echo json_encode(array('error' => 'Error al decodificar el JSON.'));
    } else {
        realizarConexion($datos_decodificados);
    }
} catch (Exception $e) {
    // Si hay un error, devuelve un mensaje de error en formato JSON
    http_response_code(500);
    echo json_encode(array('error' => 'Error interno del servidor'));
}

function realizarConexion($datos)
{
    $conexion = new mysqli("localhost", "root", "", "entorno_cliente") or die("No se puede conectar con el servidor");
    $nombre = $datos['nombre'];
    $contraseña = $datos['contraseña'];
    $valorBoton = $datos['valorBoton'];
    $pregunta = $datos['pregunta'];


    if ($valorBoton == "Loguearse") {
        $select = "SELECT * FROM usuarios WHERE usuario = '$nombre' AND contraseña = '$contraseña'";
        $consulta = mysqli_query($conexion, $select) or die("Fallo al iniciar sesión: " . mysqli_error($conexion));

        if (mysqli_num_rows($consulta) > 0) {
            

            echo json_encode(array('success' => true, 'message' => 'Inicio de sesión exitoso.'));
        } else {
            echo json_encode(array('error' => 'Error: Nombre de usuario o contraseña incorrectos.'));
        }
    } elseif ($valorBoton == "Registrarse") {
        $select = "SELECT * FROM usuarios WHERE usuario = '$nombre'";
        $consulta = mysqli_query($conexion, $select) or die("Fallo al insertar: " . mysqli_error($conexion));

        if (mysqli_num_rows($consulta) > 0) {
            echo json_encode(array('error' => 'Error: El nombre de usuario ya está registrado.'));
        } else {
            $insercion = "INSERT INTO usuarios (usuario, contraseña) VALUES ('$nombre', '$contraseña')";

            if ($conexion->query($insercion) === TRUE) {
                echo json_encode(array('success' => true, 'message' => 'Usuario registrado exitosamente.'));
            } else {
                echo json_encode(array('error' => 'Error al registrar el usuario: ' . $conexion->error));
            }
        }
    } elseif ($valorBoton == "añadirPregunta") {
        $insertarPregunta = "INSERT INTO registro_preguntas (usuario, pregunta) VALUES ('$nombre', '$pregunta')";
        if ($conexion->query($insertarPregunta) === TRUE) {
            echo json_encode(array('success' => true, 'message' => 'Pregunta almacenada correctamente.'));
        } else {
            echo json_encode(array('error' => 'Error al registrar la pregunta: ' . $conexion->error));
        }
    } elseif ($valorBoton == "iniciarEntrevista") {
        $selectPreguntas = "SELECT * FROM registro_preguntas";
        $consulta = mysqli_query($conexion, $selectPreguntas) or die("Fallo al insertar: " . mysqli_error($conexion));

        if (mysqli_num_rows($consulta) > 0) {
            $arraypreguntas = mysqli_fetch_all($consulta, true);
            $preguntaAleatoria = $arraypreguntas[array_rand($arraypreguntas)];
            echo json_encode(array('success' => true, 'message' => $preguntaAleatoria['pregunta']));
        } else {
            echo json_encode(array('error' => 'Error: No hay ninguna pregunta almacenada.'));
        }

    }
    mysqli_close($conexion);
}
?>