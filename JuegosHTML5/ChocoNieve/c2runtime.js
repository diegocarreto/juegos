var $game = new Object();
$game.pathMedia = (typeof pathGame == "undefined") ? "" : pathGame;

document.write("<script type='text/javascript' src='" + $game.pathMedia + "jquery-g5-1.0.0.js'></script>");

(function ($, window, document) {

    $(function () {

        //Crea numeros aleatorios
        $game.Random = function (min, max) {

            return Math.floor(Math.random() * max) + min;
        };

        $game.padLeft = function(text, len){

            var  c= "0";
            
            text += "";    

            while(text.length < len) 
                text = c + text;

            return text;
        }

        $game.ConfigureEnemys = function () {

            var enemys = new Array();

            for (var i = 0; i < 4; i++) {

                var enemysInternal = new Array();

                for (var j = 0; j < 3; j++) {

                    var objEnemy = new Object();

                    //Calcula la posicion inicial horizontal de los enemigos
                    objEnemy.x = -1 * (this.Random(100, 500) + (j * this.Random(150, 300)));

                    objEnemy.y = 124 + (i * 71);

                    objEnemy.image = "enemy" + this.Random(1, 4);

                    objEnemy.inSight = false;

                    var typeEnemy = this.Random(1, 4);
                    objEnemy.balloon = "ballonEnemy" + typeEnemy;
                    objEnemy.typeEnemy = typeEnemy;

                    enemysInternal[j] = objEnemy;
                }

                enemys[i] = enemysInternal; 
            }

            return enemys;
        };

        $game.ObtainMissile = function (Player, Missiles) {

            var x = -1000, objMissile = new Object();

            for (var i = 0; i < 4; i++) {

                for (var j = 0; j < 3; j++) {

                    var missile = Missiles[i][j];

                    if (missile.x > x && missile.inSight == false) {
                       
                        x = missile.x;

                        objMissile.typeMissil =  missile.typeEnemy;
                        objMissile.x = Player.x;
                        objMissile.fired = false;
                    }
                }
            }

            Player.missiles.push(objMissile);
        }

        $('#c2canvas').G5({
            speed: 25000,
            pathImages: $game.pathMedia + "media/images",
            gameOver: function (points, level) {

                if (points > 0 && typeof functionName != "undefined" && typeof q != "undefined") {

                    if (typeof (window[functionName]) === "function") {

                        var key = hex_md5(q + "wH4DsxHyu8dAqsdeAqCbHfsD" + points);

                        window[functionName](key, points, level);
                    }
                }
            },
            updatePoints: function (points) {

                if (typeof (window["updateScore"]) === "function")
                    window["updateScore"](points);
            },
            start: function (Allocator, player) {

                var objImages = new Object();

                objImages.instructions = "instructions.png";
                objImages.backGround = "background.png";
                objImages.pause = "pausa.png";
                objImages.gameOver = "gameover.png";

                objImages.player = "pancho.png";
                objImages.player = "pancho.png";
                objImages.separator = "separador.png";

                objImages.ballonPlayer1 = "burbuja-p-00.png";
                objImages.ballonPlayer2 = "burbuja-p-01.png";
                objImages.ballonPlayer3 = "burbuja-p-02.png";
                objImages.ballonPlayer4 = "burbuja-p-03.png";

                objImages.missile1 = "missile-00.png";
                objImages.missile2 = "missile-01.png";
                objImages.missile3 = "missile-02.png";
                objImages.missile4 = "missile-03.png";

                objImages.enemy1 = "guindilla01.png";
                objImages.enemy2 = "guindilla02.png";
                objImages.enemy3 = "guindilla03.png";
                objImages.enemy4 = "guindilla04.png";

                objImages.ballonEnemy1 = "burbuja-g-00.png";
                objImages.ballonEnemy2 = "burbuja-g-01.png";
                objImages.ballonEnemy3 = "burbuja-g-02.png";
                objImages.ballonEnemy4 = "burbuja-g-03.png";

                Allocator.Images = objImages;

                var objSettings = new Object();

                objSettings.verticalMovementPlayer = 71;
                objSettings.enemys = $game.ConfigureEnemys();

                objSettings.trackPlayer = 0;

                Allocator.objSettings = objSettings;

                player.width = 91;
                player.height = 121;
                player.x = 750;
                player.y = 114;

                player.missiles = new Array(); 
                
                $game.ObtainMissile(player, Allocator.objSettings.enemys);
            },
            reset: function (player, Settings, Allocator) {

                //Allocator.objSettings.enemys = $game.ConfigureEnemys();
                player.y = 114;
            },
            onKeyDown: function (key, keys, allocator) {

                //Si se presiona la tecla espaciadora se asigna el movimiento
                var objMove = new Object();

                //Obtiene el valor del movimiento de las variables iniciales
                objMove.verticalMovementPlayer = allocator.objSettings.verticalMovementPlayer;

                switch (key) {

                    case 32:

                        allocator.objShot = true;

                        break;

                    case 38:

                        objMove.verticalMovementPlayer *= -1;
                        allocator.objMove = objMove;

                        break;

                    case 40:

                        allocator.objMove = objMove;

                        break;
                }
            },
            run: function (player, Settings, Allocator) {

                if (Settings.instructions) {

                } else if (!Settings.pause) {

                    if (!Settings.gameOver) {

                        //Mueve los enemigos
                        for (var i = 0; i < Allocator.objSettings.enemys.length; i++) {

                            var enemyExternal = Allocator.objSettings.enemys[i];

                            for (var j = 0; j < enemyExternal.length; j++) {

                                var enemy = enemyExternal[j];

                                enemy.x += .8;

                                if (enemy.x >= 557) {

                                    enemy.x = -1 * ($game.Random(77, 450) + (j * $game.Random(150, 300)));

                                    enemy.image = "enemy" + $game.Random(1, 4);

                                    enemy.inSight = false;

                                    var typeEnemy = $game.Random(1, 4);
                                    enemy.balloon = "ballonEnemy" + typeEnemy;
                                    enemy.typeEnemy = typeEnemy;

                                    player.lives -= 1;
                                                                                            
                                    if (player.lives == 0)
                                        Settings.gameOver = true;
                                }
                            }
                        }

                        //Identifica si se encuentra el indicador de movimiento
                        if (typeof Allocator.objMove != "undefined") {

                            if ((player.y + Allocator.objMove.verticalMovementPlayer) >= 114 && (player.y + Allocator.objMove.verticalMovementPlayer) <= 370) {

                                player.y += Allocator.objMove.verticalMovementPlayer;

                                if (Allocator.objMove.verticalMovementPlayer < 0)
                                    Allocator.objSettings.trackPlayer--;
                                else
                                    Allocator.objSettings.trackPlayer++;
                            }

                            //Elimina el indicador de movimiento
                            Allocator.objMove = undefined;
                        }

                        if (typeof Allocator.objShot != "undefined") {

                            Allocator.objShot = undefined;

                            //Encuentra el enemigo mas proximo en el carril indicado
                            var x = Allocator.objSettings.enemys[Allocator.objSettings.trackPlayer][0].x;
                            var enemy = Allocator.objSettings.enemys[Allocator.objSettings.trackPlayer][0];

                            if(Allocator.objSettings.enemys[Allocator.objSettings.trackPlayer][1].x > x){

                                x = Allocator.objSettings.enemys[Allocator.objSettings.trackPlayer][1].x;
                                enemy  = Allocator.objSettings.enemys[Allocator.objSettings.trackPlayer][1];
                            }

                            if(Allocator.objSettings.enemys[Allocator.objSettings.trackPlayer][2].x > x)
                                enemy  = Allocator.objSettings.enemys[Allocator.objSettings.trackPlayer][2];

                            var missil = null;

                            //Busca el misil no marcado
                            for(var i = 0; i < player.missiles.length; i++){

                               if(player.missiles[i].fired == false){

                                   player.missiles[i].fired = true;
                                   missil = player.missiles[i];
                                   missil.y = player.y;
                                   missil.track = Allocator.objSettings.trackPlayer;

                                   break;
                               } 
                            }

                            if (missil != null && missil.typeMissil == enemy.typeEnemy)
                               enemy.inSight = true;

                            $game.ObtainMissile(player, Allocator.objSettings.enemys);
                        }

                        //Mueve los misiles
                        for(var i = 0; i < player.missiles.length; i++){

                            var missile = player.missiles[i];

                            if(missile.fired == true)
                               missile.x -= 10;

                            if(missile.x <= 0)
                                player.missiles.shift();
                        }

                        //Busca si un misil choca con un enemigo
                        for(var i = 0; i < player.missiles.length; i++){

                            var missile = player.missiles[i];

                            if(missile.fired == true){

                                //Verifica si el misil choca con los enemigos
                                for (var k = 0; k < 3; k++) {

                                    var enemy = Allocator.objSettings.enemys[missile.track][k];

                                    if(missile.x <= enemy.x + 77){

                                        if(missile.typeMissil == enemy.typeEnemy){

                                            enemy.x = -1 * ($game.Random(77, 450) + (j * $game.Random(150, 300)));

                                            enemy.image = "enemy" + $game.Random(1, 4);

                                            enemy.inSight = false;

                                            var typeEnemy = $game.Random(1, 4);
                                            enemy.balloon = "ballonEnemy" + typeEnemy;
                                            enemy.typeEnemy = typeEnemy;

                                            Settings.points += 70;
                                        }
                                        else{

                                           enemy.inSight = false;

                                            player.lives -= 1;

                                            if (player.lives == 0)
                                                Settings.gameOver = true;
                                        }

                                        player.missiles.shift();

                                        break;
                                    }
                                }   
                            }
                        }
                    }
                }
            },
            paint: function (ctx, Settings, Allocator, player) {

                //Pinta los enemigos
                for (var i = 0; i < Allocator.objSettings.enemys.length; i++) {

                    var enemyExternal = Allocator.objSettings.enemys[i];

                    for (var j = 0; j < enemyExternal.length; j++) {

                        var enemy = enemyExternal[j];

                        ctx.Img(enemy.image, enemy.x, enemy.y, 77, 107);
                        ctx.Img(enemy.balloon, enemy.x + 27, enemy.y - 55);
                    }

                    ctx.Img("separator", 0, 208 + (i * Allocator.objSettings.verticalMovementPlayer));
                }

                //Pinta al jugador
                ctx.Img("player", player.x, player.y, player.width, player.height);

                //pinta el misil del jugador
                for(var i = 0;i < player.missiles.length; i++) {

                    var missile = player.missiles[i], y = player.y;

                    if(missile.fired == true)
                        y = missile.y;
                    else {

                        y = player.y;
                        ctx.Img("ballonPlayer" + missile.typeMissil, missile.x - 35, y - 62);
                     }

                    ctx.Img("missile" + missile.typeMissil, missile.x - 35, y + 30, 50, 40);
                }




                ctx.txt("25px Arial",$game.padLeft(Settings.points,5),816,93,"#000");
                
                if (Settings.instructions)
                    ctx.Img("instructions", 0, 0);
                else if (Settings.pause)
                    ctx.Img("pause", 0, 0);
                else if (Settings.gameOver)
                    ctx.Img("gameOver", 0, 0);
            }
        });
    });
} (window.jQuery, window, document));

var hexcase = 0; function hex_md5(a) { return rstr2hex(rstr_md5(str2rstr_utf8(a))) } function hex_hmac_md5(a, b) { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(b))) } function md5_vm_test() { return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72" } function rstr_md5(a) { return binl2rstr(binl_md5(rstr2binl(a), a.length * 8)) } function rstr_hmac_md5(c, f) { var e = rstr2binl(c); if (e.length > 16) { e = binl_md5(e, c.length * 8) } var a = Array(16), d = Array(16); for (var b = 0; b < 16; b++) { a[b] = e[b] ^ 909522486; d[b] = e[b] ^ 1549556828 } var g = binl_md5(a.concat(rstr2binl(f)), 512 + f.length * 8); return binl2rstr(binl_md5(d.concat(g), 512 + 128)) } function rstr2hex(c) { try { hexcase } catch (g) { hexcase = 0 } var f = hexcase ? "0123456789ABCDEF" : "0123456789abcdef"; var b = ""; var a; for (var d = 0; d < c.length; d++) { a = c.charCodeAt(d); b += f.charAt((a >>> 4) & 15) + f.charAt(a & 15) } return b } function str2rstr_utf8(c) { var b = ""; var d = -1; var a, e; while (++d < c.length) { a = c.charCodeAt(d); e = d + 1 < c.length ? c.charCodeAt(d + 1) : 0; if (55296 <= a && a <= 56319 && 56320 <= e && e <= 57343) { a = 65536 + ((a & 1023) << 10) + (e & 1023); d++ } if (a <= 127) { b += String.fromCharCode(a) } else { if (a <= 2047) { b += String.fromCharCode(192 | ((a >>> 6) & 31), 128 | (a & 63)) } else { if (a <= 65535) { b += String.fromCharCode(224 | ((a >>> 12) & 15), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } else { if (a <= 2097151) { b += String.fromCharCode(240 | ((a >>> 18) & 7), 128 | ((a >>> 12) & 63), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } } } } } return b } function rstr2binl(b) { var a = Array(b.length >> 2); for (var c = 0; c < a.length; c++) { a[c] = 0 } for (var c = 0; c < b.length * 8; c += 8) { a[c >> 5] |= (b.charCodeAt(c / 8) & 255) << (c % 32) } return a } function binl2rstr(b) { var a = ""; for (var c = 0; c < b.length * 32; c += 8) { a += String.fromCharCode((b[c >> 5] >>> (c % 32)) & 255) } return a } function binl_md5(p, k) { p[k >> 5] |= 128 << ((k) % 32); p[(((k + 64) >>> 9) << 4) + 14] = k; var o = 1732584193; var n = -271733879; var m = -1732584194; var l = 271733878; for (var g = 0; g < p.length; g += 16) { var j = o; var h = n; var f = m; var e = l; o = md5_ff(o, n, m, l, p[g + 0], 7, -680876936); l = md5_ff(l, o, n, m, p[g + 1], 12, -389564586); m = md5_ff(m, l, o, n, p[g + 2], 17, 606105819); n = md5_ff(n, m, l, o, p[g + 3], 22, -1044525330); o = md5_ff(o, n, m, l, p[g + 4], 7, -176418897); l = md5_ff(l, o, n, m, p[g + 5], 12, 1200080426); m = md5_ff(m, l, o, n, p[g + 6], 17, -1473231341); n = md5_ff(n, m, l, o, p[g + 7], 22, -45705983); o = md5_ff(o, n, m, l, p[g + 8], 7, 1770035416); l = md5_ff(l, o, n, m, p[g + 9], 12, -1958414417); m = md5_ff(m, l, o, n, p[g + 10], 17, -42063); n = md5_ff(n, m, l, o, p[g + 11], 22, -1990404162); o = md5_ff(o, n, m, l, p[g + 12], 7, 1804603682); l = md5_ff(l, o, n, m, p[g + 13], 12, -40341101); m = md5_ff(m, l, o, n, p[g + 14], 17, -1502002290); n = md5_ff(n, m, l, o, p[g + 15], 22, 1236535329); o = md5_gg(o, n, m, l, p[g + 1], 5, -165796510); l = md5_gg(l, o, n, m, p[g + 6], 9, -1069501632); m = md5_gg(m, l, o, n, p[g + 11], 14, 643717713); n = md5_gg(n, m, l, o, p[g + 0], 20, -373897302); o = md5_gg(o, n, m, l, p[g + 5], 5, -701558691); l = md5_gg(l, o, n, m, p[g + 10], 9, 38016083); m = md5_gg(m, l, o, n, p[g + 15], 14, -660478335); n = md5_gg(n, m, l, o, p[g + 4], 20, -405537848); o = md5_gg(o, n, m, l, p[g + 9], 5, 568446438); l = md5_gg(l, o, n, m, p[g + 14], 9, -1019803690); m = md5_gg(m, l, o, n, p[g + 3], 14, -187363961); n = md5_gg(n, m, l, o, p[g + 8], 20, 1163531501); o = md5_gg(o, n, m, l, p[g + 13], 5, -1444681467); l = md5_gg(l, o, n, m, p[g + 2], 9, -51403784); m = md5_gg(m, l, o, n, p[g + 7], 14, 1735328473); n = md5_gg(n, m, l, o, p[g + 12], 20, -1926607734); o = md5_hh(o, n, m, l, p[g + 5], 4, -378558); l = md5_hh(l, o, n, m, p[g + 8], 11, -2022574463); m = md5_hh(m, l, o, n, p[g + 11], 16, 1839030562); n = md5_hh(n, m, l, o, p[g + 14], 23, -35309556); o = md5_hh(o, n, m, l, p[g + 1], 4, -1530992060); l = md5_hh(l, o, n, m, p[g + 4], 11, 1272893353); m = md5_hh(m, l, o, n, p[g + 7], 16, -155497632); n = md5_hh(n, m, l, o, p[g + 10], 23, -1094730640); o = md5_hh(o, n, m, l, p[g + 13], 4, 681279174); l = md5_hh(l, o, n, m, p[g + 0], 11, -358537222); m = md5_hh(m, l, o, n, p[g + 3], 16, -722521979); n = md5_hh(n, m, l, o, p[g + 6], 23, 76029189); o = md5_hh(o, n, m, l, p[g + 9], 4, -640364487); l = md5_hh(l, o, n, m, p[g + 12], 11, -421815835); m = md5_hh(m, l, o, n, p[g + 15], 16, 530742520); n = md5_hh(n, m, l, o, p[g + 2], 23, -995338651); o = md5_ii(o, n, m, l, p[g + 0], 6, -198630844); l = md5_ii(l, o, n, m, p[g + 7], 10, 1126891415); m = md5_ii(m, l, o, n, p[g + 14], 15, -1416354905); n = md5_ii(n, m, l, o, p[g + 5], 21, -57434055); o = md5_ii(o, n, m, l, p[g + 12], 6, 1700485571); l = md5_ii(l, o, n, m, p[g + 3], 10, -1894986606); m = md5_ii(m, l, o, n, p[g + 10], 15, -1051523); n = md5_ii(n, m, l, o, p[g + 1], 21, -2054922799); o = md5_ii(o, n, m, l, p[g + 8], 6, 1873313359); l = md5_ii(l, o, n, m, p[g + 15], 10, -30611744); m = md5_ii(m, l, o, n, p[g + 6], 15, -1560198380); n = md5_ii(n, m, l, o, p[g + 13], 21, 1309151649); o = md5_ii(o, n, m, l, p[g + 4], 6, -145523070); l = md5_ii(l, o, n, m, p[g + 11], 10, -1120210379); m = md5_ii(m, l, o, n, p[g + 2], 15, 718787259); n = md5_ii(n, m, l, o, p[g + 9], 21, -343485551); o = safe_add(o, j); n = safe_add(n, h); m = safe_add(m, f); l = safe_add(l, e) } return Array(o, n, m, l) } function md5_cmn(h, e, d, c, g, f) { return safe_add(bit_rol(safe_add(safe_add(e, h), safe_add(c, f)), g), d) } function md5_ff(g, f, k, j, e, i, h) { return md5_cmn((f & k) | ((~f) & j), g, f, e, i, h) } function md5_gg(g, f, k, j, e, i, h) { return md5_cmn((f & j) | (k & (~j)), g, f, e, i, h) } function md5_hh(g, f, k, j, e, i, h) { return md5_cmn(f ^ k ^ j, g, f, e, i, h) } function md5_ii(g, f, k, j, e, i, h) { return md5_cmn(k ^ (f | (~j)), g, f, e, i, h) } function safe_add(a, d) { var c = (a & 65535) + (d & 65535); var b = (a >> 16) + (d >> 16) + (c >> 16); return (b << 16) | (c & 65535) } function bit_rol(a, b) { return (a << b) | (a >>> (32 - b)) };