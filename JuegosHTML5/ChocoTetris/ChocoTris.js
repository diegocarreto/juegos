//*********************************CONFIGURACION*********************************

var PUNTOS_POR_LINEA = 77;
var VELOCIDAD_INICIAL = 30000;
var INCREMENTO_DEVELOCIDAD_POR_LINEA = 495;
var INCREMENTO_DEVELOCIDAD_POR_NIVEL = 1495;
var PUNTOS_POR_NIVEL = 310;
var DURACION_MENSAJES = 15;
var ESPERA_AL_INICIO_DEL_JUEGO = 3000;

var congratulations = ["Eres muy bueno 1",
                        "Eres muy bueno 2",
                        "Eres muy bueno 3",
                        "Eres muy bueno 4",
                        "Eres muy bueno 5",
                        "Eres muy bueno 6",
                        "Eres muy bueno 7",
                        "Eres muy bueno 8",
                        "Eres muy bueno 9",
                        "Eres muy bueno 10",
                        "Eres muy bueno 11",
                        "Eres muy bueno 12",
                        "Eres muy bueno 13",
                        "Eres muy bueno 14",
                        "Eres muy bueno 15",
                        "Eres muy bueno 16",
                        "Eres muy bueno 17",
                        "Eres muy bueno 18",
                        "Eres muy bueno 19",
                        "Eres muy bueno 20",
                        "Eres muy bueno 21",
                        "Eres muy bueno 22",
                        "Eres muy bueno 23",
                        "Eres muy bueno 24",
                        "Eres muy bueno 25",
                        "Eres muy bueno 26",
                        "Eres muy bueno 27",
                        "Eres muy bueno 28",
                        "Eres muy bueno 29",
                        "Eres muy bueno 30"];


//**************************************************************************Chocotris**************************************************************************

//Detecta el path del juego
var pathMedia = (typeof pathGame == "undefined") ? "" : pathGame;

var aEnvironment = new Audio();
aEnvironment.src = pathMedia + "media/audio/environment.mp3";

var aRotate = new Audio();
aRotate.src = pathMedia + "media/audio/rotate.mp3";

var aLine1 = new Audio();
aLine1.src = pathMedia + "media/audio/line1.mp3";

var aLine2 = new Audio();
aLine2.src = pathMedia + "media/audio/line2.mp3";

var aLine3 = new Audio();
aLine3.src = pathMedia + "media/audio/line3.mp3";

var aLine4 = new Audio();
aLine4.src = pathMedia + "media/audio/line4.mp3";

var contadorMostrarMensaje = 0;

var velocidad = VELOCIDAD_INICIAL; //velocidad del juego
var fpi, cpi, rot; //fila, columna y rotación de la ficha
var tablero;  //matriz con el tablero
var pieza = 0; //pieza
var record = 0;  //almacena la mejor puntuación
var lineas = 0;   //almacena la  puntuación actual
var puntos = 0;   //almacena los puntos del usuario
var nivel = 0;     //almacena el nivel del usuario
var pos = [  //Valores referencia de coordenadas relativas
              [0, 0],
              [0, 1],
              [-1, 0],
              [1, 0],
              [-1, -1],
              [0, -1],
              [1, -1],
              [0, -2]
        ];
var piezas = [  //Diseño de las piezas, el primer valor de cada fila corresponde con el número de rotaciones posibles
              [4, 0, 1, 2, 3],
              [4, 0, 1, 5, 6],
              [4, 0, 1, 5, 4],
              [2, 0, 1, 5, 7],
              [2, 0, 2, 5, 6],
              [2, 0, 3, 5, 4],
              [1, 0, 5, 6, 3]
	];

//Detecta si el dispositivo es touch screen
var touchable = 'createTouch' in document;

$(document).ready(function () {
    eventoCargar();
    document.focus();
});

//Genera una nueva partida inicializando las variables
function nuevaPartida() {

    aEnvironment.play();

    tablero = new Array(20);
    for (var n = 0; n < 20; n++) {
        tablero[n] = new Array(12);
        for (var m = 0; m < 12; m++) {
            tablero[n][m] = 0;
        }
    }
    lineas = 0;
    puntos = 0;
    nivel = 0;
    nuevaPieza();
}
//Detecta si una fila columna del tablero está libre para ser ocupada
function cuadroNoDisponible(f, c) {
    if (f < 0) return false;
    return (c < 0 || c >= 12 || f >= 20 || tablero[f][c] > 0);
}
//Detecta si la pieza activa colisiona fuera del tablero o con otra pieza
function colisionaPieza() {
    for (var v = 1; v < 5; v++) {
        var des = piezas[pieza][v];
        var pos2 = rotarCasilla(pos[des]);
        if (cuadroNoDisponible(pos2[0] + fpi, pos2[1] + cpi)) {
            return true;
        }
    }
    return false;
}
//Detecta si hay lineas completas y si las hay las computa y borra la linea desplazando la submatriz superior
function detectarLineas() {

    var numLineas = 0;

    for (var f = 0; f < 20; f++) {
        var contarCuadros = 0;
        for (var c = 0; c < 12; c++) {
            if (tablero[f][c] > 0) {
                contarCuadros++;
            }
        }
        if (contarCuadros == 12) {

            for (var f2 = f; f2 > 0; f2--) {

                for (var c2 = 0; c2 < 12; c2++) {

                    tablero[f2][c2] = tablero[f2 - 1][c2];
                }
            }

            numLineas++;
        }
    }

    if (numLineas > 0) {

        lineas += numLineas;

        puntos += (numLineas * PUNTOS_POR_LINEA);

        if (numLineas > 1)
            puntos += parseInt(parseInt(PUNTOS_POR_LINEA / 4) * numLineas);


        //verifica si existe cambio de nivel
        var nivelActual = nivel;

        nivel = parseInt(puntos / PUNTOS_POR_NIVEL);

        if (nivelActual != nivel) {

            var mostrarNivel = congratulations.length;

            if (nivel < congratulations.length) {

                velocidad -= INCREMENTO_DEVELOCIDAD_POR_NIVEL * nivel;

                $("#mensajes").html(congratulations[nivel - 1]);
                contadorMostrarMensaje = DURACION_MENSAJES;
            }
            else
                $("#mensajes").html("");

        }

        velocidad -= INCREMENTO_DEVELOCIDAD_POR_LINEA;

        UpdateIternalScore();

        switch (numLineas) {

            case 1:

                aLine1.currentTime = 0;
                aLine1.play();

                break;

            case 2:

                aLine2.currentTime = 0;
                aLine2.play();

                break;

            case 3:

                aLine3.currentTime = 0;
                aLine3.play();

                break;

            case 4:

                aLine4.currentTime = 0;
                aLine4.play();

                break;
        }
    }
}
//Baja la pieza, si toca otra pieza o el suelo, saca una nueva pieza
function bajarPieza() {
    fpi = fpi + 1;
    if (colisionaPieza()) {
        fpi = fpi - 1;
        for (v = 1; v < 5; v++) {
            des = piezas[pieza][v];
            var pos2 = rotarCasilla(pos[des]);
            if (pos2[0] + fpi >= 0 && pos2[0] + fpi < 20 &&
					pos2[1] + cpi >= 0 && pos2[1] + cpi < 12) {
                tablero[pos2[0] + fpi][pos2[1] + cpi] = pieza + 1;
            }
        }
        detectarLineas();
        //Si hay algun cuadro en la fila 0 reinicia el juego
        var reiniciar = 0;
        for (var c = 0; c < 12; c++) {
            if (tablero[0][c] != 0) {
                reiniciar = 1;
            }
        }
        if (reiniciar == 1) {
            if (lineas > record) {
                record = lineas;
            }

            SaveScore();
            nuevaPartida();
        } else {
            nuevaPieza();
        }
    }
}
//Mueve la pieza lateralmente
function moverPieza(des) {
    cpi = cpi + des;
    if (colisionaPieza()) {
        cpi = cpi - des;
    }
}
//Rota la pieza según el número de rotaciones posibles tenga la pieza activa. (posición 0 de la pieza)
function rotarPieza() {
    rot = rot + 1;
    if (rot == piezas[pieza][0]) {
        rot = 0;
    }
    if (colisionaPieza()) {
        rot = rot - 1;
        if (rot == -1) {
            rot = piezas[pieza][0] - 1;
        }
    }
    else {
        aRotate.currentTime = 0;
        aRotate.play();
    }
}
//Obtiene unas coordenadas f,c y las rota 90 grados
function rotarCasilla(celda) {
    var pos2 = [celda[0], celda[1]];
    for (var n = 0; n < rot; n++) {
        var f = pos2[1];
        var c = -pos2[0];
        pos2[0] = f;
        pos2[1] = c;
    }
    return pos2;
}
//Genera una nueva pieza aleatoriamente
function nuevaPieza() {
    cpi = 3;
    fpi = 0;
    rot = 0;
    pieza = Math.floor(Math.random() * 7);
}
//Ejecución principal del juego, realiza la animación y repinta
function tick() {
    bajarPieza();
    pintar();
    setTimeout('tick()', velocidad / 100);
}
//Pinta el tablero (lo genera con html) y lo plasma en un div.
function pintar() {
    var lt = " <";
    var des;
    var html = "<table class='tetris'>"
    for (var f = 0; f < 20; f++) {
        html += "<tr>";
        for (var c = 0; c < 12; c++) {
            var color = tablero[f][c];
            if (color == 0) {
                for (v = 1; v < 5; v++) {
                    des = piezas[pieza][v];
                    var pos2 = rotarCasilla(pos[des]);
                    if (f == fpi + pos2[0] && c == cpi + pos2[1]) {
                        color = pieza + 1;
                    }
                }
            }
            html += "<td class='celda" + color + "'/>";
        }
        html += lt + "/tr>";
    }
    html += lt + "/table>";

    $("#lineas").val(pad(lineas, 3));
    $("#puntos").val(pad(puntos, 3));
    $("#nivel").val(pad(nivel, 3));

    $("#tetris").html(html);

    if (contadorMostrarMensaje > 0) {

        contadorMostrarMensaje--;
    }
    else
        $("#mensajes").html("");
}

function pad(n, length) {

    n = n.toString();

    while (n.length < length)
        n = "0" + n;

    return n;
}

function SaveScore() {

    //Determina si las variables existen
    if (puntos > 0 && typeof functionName != "undefined" && typeof q != "undefined") {

        if (typeof (window[functionName]) === "function") {

            var key = hex_md5(q + "wH4DsxHyu8dAqsdeAqCbHfsD" + score);

            window[functionName](key, puntos, nivel);
        }
    }
}

function UpdateIternalScore() {

    if (typeof (window["updateScore"]) === "function")
        window["updateScore"](puntos);
}

//Al iniciar la pagina inicia el juego
function eventoCargar() {

    if (typeof aEnvironment.loop == 'boolean') {
        aEnvironment.loop = true;
    }
    else {
        aEnvironment.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);
    }

    if (touchable) {

        $("#instruccionesMobile").show();
        $("#instruccionesPC").hide();

        document.addEventListener('touchstart', onTouchStart, false);
        document.addEventListener('touchmove', onTouchMove, false);
        document.addEventListener('touchend', onTouchEnd, false);
    }
    else {

        $("#instruccionesPC").show();
        $("#instruccionesMobile").hide();

        //Agrega una escucha, se presiona una tecla
        document.addEventListener('keydown', function (evt) {

            switch (evt.keyCode) {
                case 37:
                    moverPieza(-1);
                    break;
                case 38:
                    rotarPieza();
                    break;
                case 39:
                    moverPieza(1);
                    break;
                case 40:
                    bajarPieza();
                    break;
            }
            pintar();

        }, false);

    }

    nuevaPartida();
    setTimeout('tick()', ESPERA_AL_INICIO_DEL_JUEGO);
}


var xo = 0, yo = 0, x = 0, y = 0;
//Identificador del movimiento
var idMoveTouch = -1;
function onTouchStart(e) {

    for (var i = 0; i < e.changedTouches.length; i++) {

        var touch = e.changedTouches[i];

        if (idMoveTouch < 0) {

            //Asigna el identificador 
            idMoveTouch = touch.identifier;

            //Asigna las coordenadas de contacto
            xo = touch.clientX;
            yo = touch.clientY;

        }
    }
}

//Decta el movimiento sobre la pantalla
function onTouchMove(e) {

    // Evita el scroll y zoom de la pagina
    e.preventDefault();

    for (var i = 0; i < e.changedTouches.length; i++) {

        var touch = e.changedTouches[i];

        //Si el contacto es el jostick
        if (idMoveTouch == touch.identifier) {

            if (touch.clientX > xo) {

                moverPieza(0);
                pintar();
            }

            if (touch.clientX < xo) {

                moverPieza(-1);
                pintar();

            }

            if (touch.clientY < yo) {

                bajarPieza();
                pintar();
            }

            break;
        }
    }

}

function onTouchEnd(e) {

    //Recorre la matriz de contacto en busca del jostick
    for (var i = 0; i < e.changedTouches.length; i++) {

        var touch = e.changedTouches[i];

        if (idMoveTouch == touch.identifier) {

            xo = yo = x = y = 0;

            idMoveTouch = -1;
        }
        else
            rotarPieza();
    }
}

//Encriptacion MD5
var hexcase = 0; function hex_md5(a) { return rstr2hex(rstr_md5(str2rstr_utf8(a))) } function hex_hmac_md5(a, b) { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(b))) } function md5_vm_test() { return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72" } function rstr_md5(a) { return binl2rstr(binl_md5(rstr2binl(a), a.length * 8)) } function rstr_hmac_md5(c, f) { var e = rstr2binl(c); if (e.length > 16) { e = binl_md5(e, c.length * 8) } var a = Array(16), d = Array(16); for (var b = 0; b < 16; b++) { a[b] = e[b] ^ 909522486; d[b] = e[b] ^ 1549556828 } var g = binl_md5(a.concat(rstr2binl(f)), 512 + f.length * 8); return binl2rstr(binl_md5(d.concat(g), 512 + 128)) } function rstr2hex(c) { try { hexcase } catch (g) { hexcase = 0 } var f = hexcase ? "0123456789ABCDEF" : "0123456789abcdef"; var b = ""; var a; for (var d = 0; d < c.length; d++) { a = c.charCodeAt(d); b += f.charAt((a >>> 4) & 15) + f.charAt(a & 15) } return b } function str2rstr_utf8(c) { var b = ""; var d = -1; var a, e; while (++d < c.length) { a = c.charCodeAt(d); e = d + 1 < c.length ? c.charCodeAt(d + 1) : 0; if (55296 <= a && a <= 56319 && 56320 <= e && e <= 57343) { a = 65536 + ((a & 1023) << 10) + (e & 1023); d++ } if (a <= 127) { b += String.fromCharCode(a) } else { if (a <= 2047) { b += String.fromCharCode(192 | ((a >>> 6) & 31), 128 | (a & 63)) } else { if (a <= 65535) { b += String.fromCharCode(224 | ((a >>> 12) & 15), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } else { if (a <= 2097151) { b += String.fromCharCode(240 | ((a >>> 18) & 7), 128 | ((a >>> 12) & 63), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } } } } } return b } function rstr2binl(b) { var a = Array(b.length >> 2); for (var c = 0; c < a.length; c++) { a[c] = 0 } for (var c = 0; c < b.length * 8; c += 8) { a[c >> 5] |= (b.charCodeAt(c / 8) & 255) << (c % 32) } return a } function binl2rstr(b) { var a = ""; for (var c = 0; c < b.length * 32; c += 8) { a += String.fromCharCode((b[c >> 5] >>> (c % 32)) & 255) } return a } function binl_md5(p, k) { p[k >> 5] |= 128 << ((k) % 32); p[(((k + 64) >>> 9) << 4) + 14] = k; var o = 1732584193; var n = -271733879; var m = -1732584194; var l = 271733878; for (var g = 0; g < p.length; g += 16) { var j = o; var h = n; var f = m; var e = l; o = md5_ff(o, n, m, l, p[g + 0], 7, -680876936); l = md5_ff(l, o, n, m, p[g + 1], 12, -389564586); m = md5_ff(m, l, o, n, p[g + 2], 17, 606105819); n = md5_ff(n, m, l, o, p[g + 3], 22, -1044525330); o = md5_ff(o, n, m, l, p[g + 4], 7, -176418897); l = md5_ff(l, o, n, m, p[g + 5], 12, 1200080426); m = md5_ff(m, l, o, n, p[g + 6], 17, -1473231341); n = md5_ff(n, m, l, o, p[g + 7], 22, -45705983); o = md5_ff(o, n, m, l, p[g + 8], 7, 1770035416); l = md5_ff(l, o, n, m, p[g + 9], 12, -1958414417); m = md5_ff(m, l, o, n, p[g + 10], 17, -42063); n = md5_ff(n, m, l, o, p[g + 11], 22, -1990404162); o = md5_ff(o, n, m, l, p[g + 12], 7, 1804603682); l = md5_ff(l, o, n, m, p[g + 13], 12, -40341101); m = md5_ff(m, l, o, n, p[g + 14], 17, -1502002290); n = md5_ff(n, m, l, o, p[g + 15], 22, 1236535329); o = md5_gg(o, n, m, l, p[g + 1], 5, -165796510); l = md5_gg(l, o, n, m, p[g + 6], 9, -1069501632); m = md5_gg(m, l, o, n, p[g + 11], 14, 643717713); n = md5_gg(n, m, l, o, p[g + 0], 20, -373897302); o = md5_gg(o, n, m, l, p[g + 5], 5, -701558691); l = md5_gg(l, o, n, m, p[g + 10], 9, 38016083); m = md5_gg(m, l, o, n, p[g + 15], 14, -660478335); n = md5_gg(n, m, l, o, p[g + 4], 20, -405537848); o = md5_gg(o, n, m, l, p[g + 9], 5, 568446438); l = md5_gg(l, o, n, m, p[g + 14], 9, -1019803690); m = md5_gg(m, l, o, n, p[g + 3], 14, -187363961); n = md5_gg(n, m, l, o, p[g + 8], 20, 1163531501); o = md5_gg(o, n, m, l, p[g + 13], 5, -1444681467); l = md5_gg(l, o, n, m, p[g + 2], 9, -51403784); m = md5_gg(m, l, o, n, p[g + 7], 14, 1735328473); n = md5_gg(n, m, l, o, p[g + 12], 20, -1926607734); o = md5_hh(o, n, m, l, p[g + 5], 4, -378558); l = md5_hh(l, o, n, m, p[g + 8], 11, -2022574463); m = md5_hh(m, l, o, n, p[g + 11], 16, 1839030562); n = md5_hh(n, m, l, o, p[g + 14], 23, -35309556); o = md5_hh(o, n, m, l, p[g + 1], 4, -1530992060); l = md5_hh(l, o, n, m, p[g + 4], 11, 1272893353); m = md5_hh(m, l, o, n, p[g + 7], 16, -155497632); n = md5_hh(n, m, l, o, p[g + 10], 23, -1094730640); o = md5_hh(o, n, m, l, p[g + 13], 4, 681279174); l = md5_hh(l, o, n, m, p[g + 0], 11, -358537222); m = md5_hh(m, l, o, n, p[g + 3], 16, -722521979); n = md5_hh(n, m, l, o, p[g + 6], 23, 76029189); o = md5_hh(o, n, m, l, p[g + 9], 4, -640364487); l = md5_hh(l, o, n, m, p[g + 12], 11, -421815835); m = md5_hh(m, l, o, n, p[g + 15], 16, 530742520); n = md5_hh(n, m, l, o, p[g + 2], 23, -995338651); o = md5_ii(o, n, m, l, p[g + 0], 6, -198630844); l = md5_ii(l, o, n, m, p[g + 7], 10, 1126891415); m = md5_ii(m, l, o, n, p[g + 14], 15, -1416354905); n = md5_ii(n, m, l, o, p[g + 5], 21, -57434055); o = md5_ii(o, n, m, l, p[g + 12], 6, 1700485571); l = md5_ii(l, o, n, m, p[g + 3], 10, -1894986606); m = md5_ii(m, l, o, n, p[g + 10], 15, -1051523); n = md5_ii(n, m, l, o, p[g + 1], 21, -2054922799); o = md5_ii(o, n, m, l, p[g + 8], 6, 1873313359); l = md5_ii(l, o, n, m, p[g + 15], 10, -30611744); m = md5_ii(m, l, o, n, p[g + 6], 15, -1560198380); n = md5_ii(n, m, l, o, p[g + 13], 21, 1309151649); o = md5_ii(o, n, m, l, p[g + 4], 6, -145523070); l = md5_ii(l, o, n, m, p[g + 11], 10, -1120210379); m = md5_ii(m, l, o, n, p[g + 2], 15, 718787259); n = md5_ii(n, m, l, o, p[g + 9], 21, -343485551); o = safe_add(o, j); n = safe_add(n, h); m = safe_add(m, f); l = safe_add(l, e) } return Array(o, n, m, l) } function md5_cmn(h, e, d, c, g, f) { return safe_add(bit_rol(safe_add(safe_add(e, h), safe_add(c, f)), g), d) } function md5_ff(g, f, k, j, e, i, h) { return md5_cmn((f & k) | ((~f) & j), g, f, e, i, h) } function md5_gg(g, f, k, j, e, i, h) { return md5_cmn((f & j) | (k & (~j)), g, f, e, i, h) } function md5_hh(g, f, k, j, e, i, h) { return md5_cmn(f ^ k ^ j, g, f, e, i, h) } function md5_ii(g, f, k, j, e, i, h) { return md5_cmn(k ^ (f | (~j)), g, f, e, i, h) } function safe_add(a, d) { var c = (a & 65535) + (d & 65535); var b = (a >> 16) + (d >> 16) + (c >> 16); return (b << 16) | (c & 65535) } function bit_rol(a, b) { return (a << b) | (a >>> (32 - b)) };