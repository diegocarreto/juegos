//Detecta el path del juego
var pathMedia = (typeof pathGame == "undefined") ? "" : pathGame;

document.write("<script type='text/javascript' src='" + pathMedia + "jquery-g5-1.0.0.js'></script>");

$(document).ready(function () {

    $('#c2canvas').G5({
        speed: 25000,
        pathImages: pathMedia + "media/images",
        gameOver: function (points, level) {

            if (points > 0 && typeof functionName != "undefined" && typeof q != "undefined") {

                points = points * 100;

                if (typeof (window[functionName]) === "function") {

                    var key = hex_md5(q + "wH4DsxHyu8dAqsdeAqCbHfsD" + points);

                    window[functionName](key, points, level);
                }
            }
        },
        updatePoints: function (points) {

            if (typeof (window["updateScore"]) === "function")
                window["updateScore"](points * 100);
        },
        start: function (Allocator, player) {

            //Carga todas las imagenes del juego
            var objImages = new Object();

            objImages.instructions = "instructionsPc.png";
            objImages.backGround = "background.png";
            objImages.bb1 = "bowlingBall-01.png";
            objImages.bb2 = "bowlingBall-02.png";
            objImages.bb3 = "bowlingBall-03.png";
            objImages.bb4 = "bowlingBall-04.png";
            objImages.bb5 = "bowlingBall-05.png";
            objImages.gameOver = "gameover.png";
            objImages.tubeDown = "tubeDown.png";
            objImages.tubeTop = "tubeTop.png";
            objImages.pause = "pausa.png";
            objImages.n0 = "0.png";
            objImages.n1 = "1.png";
            objImages.n2 = "2.png";
            objImages.n3 = "3.png";
            objImages.n4 = "4.png";
            objImages.n5 = "5.png";
            objImages.n6 = "6.png";
            objImages.n7 = "7.png";
            objImages.n8 = "8.png";
            objImages.n9 = "9.png";

            Allocator.Images = objImages;

            var objSettings = new Object();

            objSettings.initialRateOfFall = -8;
            objSettings.rateOfFall = objSettings.initialRateOfFall;
            objSettings.gravity = 0.5;
            objSettings.move = -23;
            objSettings.initialPositionY = 30;
            objSettings.positionY = 30;
            objSettings.obstaclesClose = 20;

            Allocator.objSettings = objSettings;

            //Configura las imagenes del jugador
            var objPlayer = new Object();

            var iPlayer1 = new Image();
            iPlayer1.src = pathMedia + 'media/images/bowlingBall-01.png';

            var iPlayer2 = new Image();
            iPlayer2.src = pathMedia + 'media/images/bowlingBall-02.png';

            var iPlayer3 = new Image();
            iPlayer3.src = pathMedia + 'media/images/bowlingBall-03.png';

            var iPlayer4 = new Image();
            iPlayer4.src = pathMedia + 'media/images/bowlingBall-04.png';

            var iPlayer5 = new Image();
            iPlayer5.src = pathMedia + 'media/images/bowlingBall-05.png';

            var aImages = new Array();

            aImages[0] = iPlayer1;
            aImages[1] = iPlayer2;
            aImages[2] = iPlayer3;
            aImages[3] = iPlayer4;
            aImages[4] = iPlayer5;

            objPlayer.aImages = aImages;

            Allocator.objPlayer = objPlayer;

            player.width = player.height = 45;

            Allocator.objObstacles = ConfigureObstacles(Allocator.objSettings.positionY);
        },
        reset: function (player, Settings, Allocator) {

            player.y = 225;

            //Regresa la velocidad de la gravedad a su valor original
            Allocator.objSettings.rateOfFall = Allocator.objSettings.initialRateOfFall;

            //Resetea la posicion y
            Allocator.objSettings.positionY = Allocator.objSettings.initialPositionY;

            //Crea tubos con la posicion original
            Allocator.objObstacles = ConfigureObstacles(Allocator.objSettings.positionY);
        },
        onKeyDown: function (key, keys, allocator) {

            switch (key) {

                case 32:

                    //Si se presiona la tecla espaciadora se asigna el movimiento
                    var objMove = new Object();

                    //Obtiene el valor del movimiento de las variables iniciales
                    objMove.move = allocator.objSettings.move;

                    allocator.objMove = objMove;

                    break;
            }
        },
        onTouch: function (Type, Touches) {

            if (Type == 'start') {

            } else if (Type == 'move') {

            } else if (Type == 'end') {

                alert(Type);
            }
        },
        run: function (player, Settings, Allocator) {

            //La bola de boliche siempre se mantiene en la misma posicion x
            player.x = 270;

            if (Settings.instructions) {

                player.y = 225;

                //Muestra la imagen del jugador
                player.img = Allocator.objPlayer.aImages[0];

            } else if (!Settings.pause) {

                if (!Settings.gameOver) {

                    //Mueve los obstaculos
                    for (var i = 0; i < Allocator.objObstacles.length; i++) {

                        Allocator.objObstacles[i].TopX -= 3;
                        Allocator.objObstacles[i].DownX = Allocator.objObstacles[i].TopX;

                        //Verifica si el jugador paso el obstaculo
                        if (Allocator.objObstacles[i].TopX < 255 && Allocator.objObstacles[i].rid == false) {

                            Allocator.objObstacles[i].rid = true;
                            Settings.points++;
                        }
                    }

                    //verifica si el jugador choco con un obstaculo
                    for (var i = 0; i < Allocator.objObstacles.length; i++) {

                        var obstacle = Allocator.objObstacles[i];

                        //Obtiene los dos tubos de un obstaculo 
                        var tubeTop = new Object();

                        tubeTop.x = obstacle.TopX;
                        tubeTop.y = obstacle.TopY;
                        tubeTop.width = obstacle.width;
                        tubeTop.height = obstacle.height;

                        var tubeDow = new Object();

                        tubeDow.x = obstacle.DownX;
                        tubeDow.y = obstacle.DownY;
                        tubeDow.width = obstacle.width;
                        tubeDow.height = obstacle.height;

                        if (player.intersects(tubeTop) || player.intersects(tubeDow)) {
                            Settings.gameOver = true;
                        }

                    }

                    //Si los tubos salen de la pantalla, los coloca en la parte de atras
                    if (Allocator.objObstacles[0].TopX < -100) {

                        var obstacles = Allocator.objObstacles;

                        var obstacle = obstacles[0];

                        for (var i = 0; i < obstacles.length - 1; i++) {

                            obstacles[i] = obstacles[i + 1];
                        }

                        obstacle.rid = false;

                        //Calcula la posicion vertical de los tubos
                        obstacle.TopY = -1 * Random(0, 200);
                        obstacle.DownY = (250 - (obstacle.TopY * -1)) + 150;

                        var yAux = Settings.points / Allocator.objSettings.obstaclesClose;

                        if (yAux > Allocator.objSettings.initialPositionY)
                            yAux = 0;

                        Allocator.objSettings.positionY -= yAux;

                        //Indica la posicion de y
                        obstacle.TopY = obstacle.TopY + (-1 * Allocator.objSettings.positionY);
                        obstacle.DownY = obstacle.DownY + Allocator.objSettings.positionY;

                        obstacle.TopX = obstacles[obstacles.length - 2].TopX + 240;
                        obstacle.DownX = obstacle.TopX;

                        Allocator.objObstacles[obstacles.length - 1] = obstacle;

                        Allocator.objObstacles = obstacles;
                    }
                }

                //Identifica si se encuentra el indicador de movimiento
                if (typeof Allocator.objMove != "undefined" && !Settings.gameOver) {

                    player.y += Allocator.objMove.move;

                    //Muestra la imagen del jugador
                    player.img = Allocator.objPlayer.aImages[0];

                    if (player.y <= 0)
                        player.y = 0;

                    //Regresa la velocidad de la gravedad a su valor original
                    Allocator.objSettings.rateOfFall = Allocator.objSettings.initialRateOfFall;

                    //Elimina el indicador de movimiento
                    Allocator.objMove = undefined;

                } else {
                    if (player.y < 411) {

                        //Incrementa la velocidad debido a la gravedad
                        Allocator.objSettings.rateOfFall += Allocator.objSettings.gravity;

                        //Muestra la imagen del jugador
                        if (Allocator.objSettings.rateOfFall > 0 && Allocator.objSettings.rateOfFall <= 3)
                            player.img = Allocator.objPlayer.aImages[1];
                        else if (Allocator.objSettings.rateOfFall > 3 && Allocator.objSettings.rateOfFall <= 7)
                            player.img = Allocator.objPlayer.aImages[2];
                        else if (Allocator.objSettings.rateOfFall > 7 && Allocator.objSettings.rateOfFall <= 11)
                            player.img = Allocator.objPlayer.aImages[3];
                        else if (Allocator.objSettings.rateOfFall > 11)
                            player.img = Allocator.objPlayer.aImages[4];

                        //Aplica la gravedad
                        player.y += Allocator.objSettings.rateOfFall;
                    }
                    else {

                        player.y = 411;
                        Settings.gameOver = true;
                    }
                }
            }
        },
        paint: function (ctx, Settings, Allocator, player) {

            //Dibuja los obstaculos
            for (var i = 0; i < Allocator.objObstacles.length; i++) {

                var obstacle = Allocator.objObstacles[i];

                //Pinta el obstaculo de la parte de arriba
                ctx.Img("tubeDown", obstacle.TopX, obstacle.TopY, 76, 250);

                //Pinta el obstaculo de la parte de abajo
                ctx.Img("tubeTop", obstacle.DownX, obstacle.DownY, 76, 250);
            }

            player.paint();

            if (Settings.instructions)
                ctx.Img("instructions", 0, 0)
            else if (Settings.gameOver)
                ctx.Img("gameOver", 0, 0);
            else if (Settings.pause)
                ctx.Img("pause", 0, 0);
            else {

                //Formatea los puntos 
                var pointPrint = Settings.points < 10 ? "0" + Settings.points : Settings.points + "";

                ctx.Img("n" + pointPrint[0], 395, 90, 60, 75);
                ctx.Img("n" + pointPrint[1], 447, 90, 60, 75);
            }
        }
    });
});

//Crea numeros aleatorios
function Random(min, max) {

    return Math.floor(Math.random() * max) + min;
}

//Configura los obstaculos
function ConfigureObstacles(y) {

    var obstacles = new Array();

    var x = 990;
    var incrementX = 240;

    for (var i = 0; i < 7; i++) {

        var objObstacle = new Object();

        //Indica si el obstaculo ya fue librado por el usuario
        objObstacle.rid = false;

        //Calcula la posicion vertical de los tubos
        objObstacle.TopY = -1 * Random(0, 200);
        objObstacle.DownY = (250 - (objObstacle.TopY * -1)) + 150;
        objObstacle.width = 60;
        objObstacle.height = 250;

        //Indica la posicion de y
        objObstacle.TopY = objObstacle.TopY + (-1 * y);
        objObstacle.DownY = objObstacle.DownY + y;

        //Calcula la posicion horizontal
        objObstacle.TopX = (x + (incrementX * i));
        objObstacle.DownX = objObstacle.TopX;

        obstacles[i] = objObstacle;
    }

    return obstacles;
}

//*********************************MD5*********************************
var hexcase = 0; function hex_md5(a) { return rstr2hex(rstr_md5(str2rstr_utf8(a))) } function hex_hmac_md5(a, b) { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(b))) } function md5_vm_test() { return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72" } function rstr_md5(a) { return binl2rstr(binl_md5(rstr2binl(a), a.length * 8)) } function rstr_hmac_md5(c, f) { var e = rstr2binl(c); if (e.length > 16) { e = binl_md5(e, c.length * 8) } var a = Array(16), d = Array(16); for (var b = 0; b < 16; b++) { a[b] = e[b] ^ 909522486; d[b] = e[b] ^ 1549556828 } var g = binl_md5(a.concat(rstr2binl(f)), 512 + f.length * 8); return binl2rstr(binl_md5(d.concat(g), 512 + 128)) } function rstr2hex(c) { try { hexcase } catch (g) { hexcase = 0 } var f = hexcase ? "0123456789ABCDEF" : "0123456789abcdef"; var b = ""; var a; for (var d = 0; d < c.length; d++) { a = c.charCodeAt(d); b += f.charAt((a >>> 4) & 15) + f.charAt(a & 15) } return b } function str2rstr_utf8(c) { var b = ""; var d = -1; var a, e; while (++d < c.length) { a = c.charCodeAt(d); e = d + 1 < c.length ? c.charCodeAt(d + 1) : 0; if (55296 <= a && a <= 56319 && 56320 <= e && e <= 57343) { a = 65536 + ((a & 1023) << 10) + (e & 1023); d++ } if (a <= 127) { b += String.fromCharCode(a) } else { if (a <= 2047) { b += String.fromCharCode(192 | ((a >>> 6) & 31), 128 | (a & 63)) } else { if (a <= 65535) { b += String.fromCharCode(224 | ((a >>> 12) & 15), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } else { if (a <= 2097151) { b += String.fromCharCode(240 | ((a >>> 18) & 7), 128 | ((a >>> 12) & 63), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } } } } } return b } function rstr2binl(b) { var a = Array(b.length >> 2); for (var c = 0; c < a.length; c++) { a[c] = 0 } for (var c = 0; c < b.length * 8; c += 8) { a[c >> 5] |= (b.charCodeAt(c / 8) & 255) << (c % 32) } return a } function binl2rstr(b) { var a = ""; for (var c = 0; c < b.length * 32; c += 8) { a += String.fromCharCode((b[c >> 5] >>> (c % 32)) & 255) } return a } function binl_md5(p, k) { p[k >> 5] |= 128 << ((k) % 32); p[(((k + 64) >>> 9) << 4) + 14] = k; var o = 1732584193; var n = -271733879; var m = -1732584194; var l = 271733878; for (var g = 0; g < p.length; g += 16) { var j = o; var h = n; var f = m; var e = l; o = md5_ff(o, n, m, l, p[g + 0], 7, -680876936); l = md5_ff(l, o, n, m, p[g + 1], 12, -389564586); m = md5_ff(m, l, o, n, p[g + 2], 17, 606105819); n = md5_ff(n, m, l, o, p[g + 3], 22, -1044525330); o = md5_ff(o, n, m, l, p[g + 4], 7, -176418897); l = md5_ff(l, o, n, m, p[g + 5], 12, 1200080426); m = md5_ff(m, l, o, n, p[g + 6], 17, -1473231341); n = md5_ff(n, m, l, o, p[g + 7], 22, -45705983); o = md5_ff(o, n, m, l, p[g + 8], 7, 1770035416); l = md5_ff(l, o, n, m, p[g + 9], 12, -1958414417); m = md5_ff(m, l, o, n, p[g + 10], 17, -42063); n = md5_ff(n, m, l, o, p[g + 11], 22, -1990404162); o = md5_ff(o, n, m, l, p[g + 12], 7, 1804603682); l = md5_ff(l, o, n, m, p[g + 13], 12, -40341101); m = md5_ff(m, l, o, n, p[g + 14], 17, -1502002290); n = md5_ff(n, m, l, o, p[g + 15], 22, 1236535329); o = md5_gg(o, n, m, l, p[g + 1], 5, -165796510); l = md5_gg(l, o, n, m, p[g + 6], 9, -1069501632); m = md5_gg(m, l, o, n, p[g + 11], 14, 643717713); n = md5_gg(n, m, l, o, p[g + 0], 20, -373897302); o = md5_gg(o, n, m, l, p[g + 5], 5, -701558691); l = md5_gg(l, o, n, m, p[g + 10], 9, 38016083); m = md5_gg(m, l, o, n, p[g + 15], 14, -660478335); n = md5_gg(n, m, l, o, p[g + 4], 20, -405537848); o = md5_gg(o, n, m, l, p[g + 9], 5, 568446438); l = md5_gg(l, o, n, m, p[g + 14], 9, -1019803690); m = md5_gg(m, l, o, n, p[g + 3], 14, -187363961); n = md5_gg(n, m, l, o, p[g + 8], 20, 1163531501); o = md5_gg(o, n, m, l, p[g + 13], 5, -1444681467); l = md5_gg(l, o, n, m, p[g + 2], 9, -51403784); m = md5_gg(m, l, o, n, p[g + 7], 14, 1735328473); n = md5_gg(n, m, l, o, p[g + 12], 20, -1926607734); o = md5_hh(o, n, m, l, p[g + 5], 4, -378558); l = md5_hh(l, o, n, m, p[g + 8], 11, -2022574463); m = md5_hh(m, l, o, n, p[g + 11], 16, 1839030562); n = md5_hh(n, m, l, o, p[g + 14], 23, -35309556); o = md5_hh(o, n, m, l, p[g + 1], 4, -1530992060); l = md5_hh(l, o, n, m, p[g + 4], 11, 1272893353); m = md5_hh(m, l, o, n, p[g + 7], 16, -155497632); n = md5_hh(n, m, l, o, p[g + 10], 23, -1094730640); o = md5_hh(o, n, m, l, p[g + 13], 4, 681279174); l = md5_hh(l, o, n, m, p[g + 0], 11, -358537222); m = md5_hh(m, l, o, n, p[g + 3], 16, -722521979); n = md5_hh(n, m, l, o, p[g + 6], 23, 76029189); o = md5_hh(o, n, m, l, p[g + 9], 4, -640364487); l = md5_hh(l, o, n, m, p[g + 12], 11, -421815835); m = md5_hh(m, l, o, n, p[g + 15], 16, 530742520); n = md5_hh(n, m, l, o, p[g + 2], 23, -995338651); o = md5_ii(o, n, m, l, p[g + 0], 6, -198630844); l = md5_ii(l, o, n, m, p[g + 7], 10, 1126891415); m = md5_ii(m, l, o, n, p[g + 14], 15, -1416354905); n = md5_ii(n, m, l, o, p[g + 5], 21, -57434055); o = md5_ii(o, n, m, l, p[g + 12], 6, 1700485571); l = md5_ii(l, o, n, m, p[g + 3], 10, -1894986606); m = md5_ii(m, l, o, n, p[g + 10], 15, -1051523); n = md5_ii(n, m, l, o, p[g + 1], 21, -2054922799); o = md5_ii(o, n, m, l, p[g + 8], 6, 1873313359); l = md5_ii(l, o, n, m, p[g + 15], 10, -30611744); m = md5_ii(m, l, o, n, p[g + 6], 15, -1560198380); n = md5_ii(n, m, l, o, p[g + 13], 21, 1309151649); o = md5_ii(o, n, m, l, p[g + 4], 6, -145523070); l = md5_ii(l, o, n, m, p[g + 11], 10, -1120210379); m = md5_ii(m, l, o, n, p[g + 2], 15, 718787259); n = md5_ii(n, m, l, o, p[g + 9], 21, -343485551); o = safe_add(o, j); n = safe_add(n, h); m = safe_add(m, f); l = safe_add(l, e) } return Array(o, n, m, l) } function md5_cmn(h, e, d, c, g, f) { return safe_add(bit_rol(safe_add(safe_add(e, h), safe_add(c, f)), g), d) } function md5_ff(g, f, k, j, e, i, h) { return md5_cmn((f & k) | ((~f) & j), g, f, e, i, h) } function md5_gg(g, f, k, j, e, i, h) { return md5_cmn((f & j) | (k & (~j)), g, f, e, i, h) } function md5_hh(g, f, k, j, e, i, h) { return md5_cmn(f ^ k ^ j, g, f, e, i, h) } function md5_ii(g, f, k, j, e, i, h) { return md5_cmn(k ^ (f | (~j)), g, f, e, i, h) } function safe_add(a, d) { var c = (a & 65535) + (d & 65535); var b = (a >> 16) + (d >> 16) + (c >> 16); return (b << 16) | (c & 65535) } function bit_rol(a, b) { return (a << b) | (a >>> (32 - b)) };