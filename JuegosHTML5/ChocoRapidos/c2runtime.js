//*********************************CONFIGURACION*********************************

//Velocidad
var SPEED = 32;
var SHIPPOINTS = 17;
var POWERUPSPOINTS = 34;
var INCREMENTENEMIESFORLEVEL = 4;
var MAXENEMIESFORLEVEL = 17;
var PLAYERLIVES = 4;
var MAXPLAYERLIVES = 6;
var TIMEBETWEENLEVEL = 80;
var TIMEBEFOREINSTRUCTIONS = 90;

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

//**************************************************************************Vector**************************************************************************
var Vector2 = function (x, y) {

    this.x = x || 0;
    this.y = y || 0;

};

Vector2.prototype = {

    reset: function (x, y) {

        this.x = x;
        this.y = y;

        return this;

    },

    toString: function (decPlaces) {
        decPlaces = decPlaces || 3;
        var scalar = Math.pow(10, decPlaces);
        return "[" + Math.round(this.x * scalar) / scalar + ", " + Math.round(this.y * scalar) / scalar + "]";
    },

    clone: function () {
        return new Vector2(this.x, this.y);
    },

    copyTo: function (v) {
        v.x = this.x;
        v.y = this.y;
    },

    copyFrom: function (v) {
        this.x = v.x;
        this.y = v.y;
    },

    magnitude: function () {
        return Math.sqrt((this.x * this.x) + (this.y * this.y));
    },

    magnitudeSquared: function () {
        return (this.x * this.x) + (this.y * this.y);
    },

    normalise: function () {

        var m = this.magnitude();

        this.x = this.x / m;
        this.y = this.y / m;

        return this;
    },

    reverse: function () {
        this.x = -this.x;
        this.y = -this.y;

        return this;
    },

    plusEq: function (v) {
        this.x += v.x;
        this.y += v.y;

        return this;
    },

    plusNew: function (v) {
        return new Vector2(this.x + v.x, this.y + v.y);
    },

    minusEq: function (v) {
        this.x -= v.x;
        this.y -= v.y;

        return this;
    },

    minusNew: function (v) {
        return new Vector2(this.x - v.x, this.y - v.y);
    },

    multiplyEq: function (scalar) {
        this.x *= scalar;
        this.y *= scalar;

        return this;
    },

    multiplyNew: function (scalar) {
        var returnvec = this.clone();
        return returnvec.multiplyEq(scalar);
    },

    divideEq: function (scalar) {
        this.x /= scalar;
        this.y /= scalar;
        return this;
    },

    divideNew: function (scalar) {
        var returnvec = this.clone();
        return returnvec.divideEq(scalar);
    },

    dot: function (v) {
        return (this.x * v.x) + (this.y * v.y);
    },

    angle: function (useRadians) {

        return Math.atan2(this.y, this.x) * (useRadians ? 1 : Vector2Const.TO_DEGREES);

    },

    rotate: function (angle, useRadians) {

        var cosRY = Math.cos(angle * (useRadians ? 1 : Vector2Const.TO_RADIANS));
        var sinRY = Math.sin(angle * (useRadians ? 1 : Vector2Const.TO_RADIANS));

        Vector2Const.temp.copyFrom(this);

        this.x = (Vector2Const.temp.x * cosRY) - (Vector2Const.temp.y * sinRY);
        this.y = (Vector2Const.temp.x * sinRY) + (Vector2Const.temp.y * cosRY);

        return this;
    },

    equals: function (v) {
        return ((this.x == v.x) && (this.y == v.x));
    },

    isCloseTo: function (v, tolerance) {
        if (this.equals(v)) return true;

        Vector2Const.temp.copyFrom(this);
        Vector2Const.temp.minusEq(v);

        return (Vector2Const.temp.magnitudeSquared() < tolerance * tolerance);
    },

    rotateAroundPoint: function (point, angle, useRadians) {
        Vector2Const.temp.copyFrom(this);
        //trace("rotate around point "+t+" "+point+" " +angle);
        Vector2Const.temp.minusEq(point);
        //trace("after subtract "+t);
        Vector2Const.temp.rotate(angle, useRadians);
        //trace("after rotate "+t);
        Vector2Const.temp.plusEq(point);
        //trace("after add "+t);
        this.copyFrom(Vector2Const.temp);

    },

    isMagLessThan: function (distance) {
        return (this.magnitudeSquared() < distance * distance);
    },

    isMagGreaterThan: function (distance) {
        return (this.magnitudeSquared() > distance * distance);
    }

};

Vector2Const = {
    TO_DEGREES: 180 / Math.PI,
    TO_RADIANS: Math.PI / 180,
    temp: new Vector2()
};


//Detecta el path del juego
var pathMedia = (typeof pathGame == "undefined") ? "" : pathGame;

//Detecta si el dispositivo es touch screen
var touchable = 'createTouch' in document;

//Agrega una escucha, cuando termina de cargar la pagina se ejecuta la funcion init
window.addEventListener('load', init, false);

//Id del jostick
var leftTouchID = -1;

//Guarda los contactos
var touches = [];

//vectores de los componentes del jostick
var leftTouchPos = new Vector2(0, 0),
    leftTouchStartPos = new Vector2(0, 0),
    leftVector = new Vector2(0, 0);

//Variables para las mejoras                                                                     
var powerups = [];
var multishot = 1;

//Velocidad de la nave
var speedShip = SPEED - 10;

//Variable para el fondo
var bgTimer = 0;

var instructionTimer = 0;

var maxBoderX = 185;

//Audios del juego
var aEnvironment = new Audio();
aEnvironment.src = pathMedia + "media/audio/environment.mp3";

var aInicio = new Audio();
aInicio.src = pathMedia + "media/audio/motorInicio.mp3";

var aAddMejora = new Audio();
aAddMejora.src = pathMedia + "media/audio/addMejora.mp3";

var aExplosion = new Audio();
aExplosion.src = pathMedia + "media/audio/explosion.mp3";

var aNextLevel = new Audio();
aNextLevel.src = pathMedia + "media/audio/mejoras.mp3";

var aShot = new Audio();
aShot.src = pathMedia + "media/audio/shot.mp3";

var aMultiShot2 = new Audio();
aMultiShot2.src = pathMedia + "media/audio/multiShot2.mp3";

var aMultiShot3 = new Audio();
aMultiShot3.src = pathMedia + "media/audio/multiShot3.mp3";

var aMultiShot4 = new Audio();
aMultiShot4.src = pathMedia + "media/audio/multiShot4.mp3";

var aDamage = new Audio();
aDamage.src = pathMedia + "media/audio/damage.mp3";

var aExplosionDeath = new Audio();
aExplosionDeath.src = pathMedia + "media/audio/explosionDeath.mp3";

//Imagenes de fondo
var iBackground1 = new Image();
iBackground1.src = pathMedia + 'media/images/mar1.jpg';

var iBackground2 = new Image();
iBackground2.src = pathMedia + 'media/images/nebula2.jpg';

var iBackground3 = new Image();
iBackground3.src = pathMedia + 'media/images/nebula3.jpg';

var iBackground4 = new Image();
iBackground4.src = pathMedia + 'media/images/nebula4.jpg';

var iBackground5 = new Image();
iBackground5.src = pathMedia + 'media/images/nebula5.jpg';

var iBackground6 = new Image();
iBackground6.src = pathMedia + 'media/images/nebula6.jpg';

var iBackground7 = new Image();
iBackground7.src = pathMedia + 'media/images/nebula7.jpg';

var iBackground8 = new Image();
iBackground8.src = pathMedia + 'media/images/nebula8.jpg';

var iBackground9 = new Image();
iBackground9.src = pathMedia + 'media/images/nebula9.jpg';

var indexBackground = random(9);

var aBackground = [iBackground1, iBackground1, iBackground1, iBackground1, iBackground1,
                   iBackground1, iBackground1, iBackground1, iBackground1];

var iPlanet = new Image();
iPlanet.src = pathMedia + 'media/images/planet.png';

var iPlanet2 = new Image();
iPlanet2.src = pathMedia + 'media/images/planet2.gif';

var iPlanet3 = new Image();
iPlanet3.src = pathMedia + 'media/images/planet3.gif';

var iPlanet4 = new Image();
iPlanet4.src = pathMedia + 'media/images/planet4.gif';

var iPlanet5 = new Image();
iPlanet5.src = pathMedia + 'media/images/planet5.png';

var iPlanet6 = new Image();
iPlanet6.src = pathMedia + 'media/images/planet6.png';

var iPlanet7 = new Image();
iPlanet7.src = pathMedia + 'media/images/planet7.png';

var iPlanet8 = new Image();
iPlanet8.src = pathMedia + 'media/images/planet8.png';

var iPlanet9 = new Image();
iPlanet9.src = pathMedia + 'media/images/planet9.gif';

var iAsteroid = new Image();
iAsteroid.src = pathMedia + 'media/images/asteroid.png';

var iFireBall = new Image();
iFireBall.src = pathMedia + 'media/images/fireball.png';

var iFireBall2 = new Image();
iFireBall2.src = pathMedia + 'media/images/fireball2.png';

var iFireBall3 = new Image();
iFireBall3.src = pathMedia + 'media/images/fireball3.png';

//Imagen de la nave
var iLifeGuard = new Image();
iLifeGuard.src = pathMedia + 'media/images/LifeGuard.png';

//Imagenes de los disparos
var iLaser1 = new Image();
iLaser1.src = pathMedia + 'media/images/laser1.png';

var iLaser2 = new Image();
iLaser2.src = pathMedia + 'media/images/laser2.png';

var iLaser3 = new Image();
iLaser3.src = pathMedia + 'media/images/laser3.png';

//Imagen de la lata
var iCan = new Image();
iCan.src = pathMedia + 'media/images/lata.png';

//Imagenes para las instrucciones
var iControl = new Image();
iControl.src = pathMedia + 'media/images/control.png';

var iPanchoEspacial = new Image();
iPanchoEspacial.src = pathMedia + 'media/images/panchoEspacial.png';

var iHologram = new Image();
iHologram.src = pathMedia + 'media/images/holograma.png';

var iInstructionsBackground = new Image();
iInstructionsBackground.src = pathMedia + 'media/images/iInstructionsBackground.png';

var iGlobe = new Image();
iGlobe.src = pathMedia + 'media/images/globo.png';

//Imagen del logo
var iChocoMilk = new Image();
iChocoMilk.src = pathMedia + 'media/images/logoChoco.png';

//Imagen de la pantera
var iPantera = new Image();
iPantera.src = pathMedia + 'media/images/pantera.png';

//Imagen de la medalla
var iMedal = new Image();
iMedal.src = pathMedia + 'media/images/medal.png';

//Imagen del logo del centro espacial
var iSpaceCenter = new Image();
iSpaceCenter.src = pathMedia + 'media/images/logoCentroEspacial.png';

//Imagen del misil que agrega disparos
var iMulti = new Image();
iMulti.src = pathMedia + 'media/images/AddMulti.png';

//Imagenes de las instrucciones

var iInstructionsBackgroundDesk = new Image();
iInstructionsBackgroundDesk.src = pathMedia + 'media/images/rapidosDesk.jpg';

var iInstructionsBackgroundIpad = new Image();
iInstructionsBackgroundIpad.src = pathMedia + 'media/images/rapidosIpad.jpg';

//Imagen de los enemigos
var iEnemy1 = new Image();
iEnemy1.src = pathMedia + 'media/images/langosta.png';

var iEnemy1d = new Image();
iEnemy1d.src = pathMedia + 'media/images/langostaa.png';

var iEnemy2 = new Image();
iEnemy2.src = pathMedia + 'media/images/pulpo.png';

var iEnemy2d = new Image();
iEnemy2d.src = pathMedia + 'media/images/pulpoa.png';

var iEnemy3 = new Image();
iEnemy3.src = pathMedia + 'media/images/enemigo3.png';

var iEnemy3d = new Image();
iEnemy3d.src = pathMedia + 'media/images/enemigo3.png';

var iEnemy4 = new Image();
iEnemy4.src = pathMedia + 'media/images/enemigo4.png';

var instructions = 1;

var timerShot = 0;

var speed = SPEED;

var canvas = null;
var ctx = null;

var x = 50;
var y = 50;

var halfWidth = null;
var halfHeight = null;

//Almacena la ultima tecla presionada
var lastKey = null;

//Nivel en el que se encuentra el nivel
var level = 1;

//Almacena la indicacion si el juego esta en pausa
var PAUSE = false;

//Almacena las teclas presionadas
var PRESSING = [];

//Almacena los mensajes
var messages = [];

//Represeta el cuadro que controla el jugador
var player = null;

//Represeta el cuadro que controla el planeta
var planet = null, planet2 = null, planet3 = null, planet4 = null, planet5 = null, planet6 = null, planet7 = null, planet8 = null, planet9 = null;

//Represeta el cuadro que controla el ateroide
var asteroid = null;

//Representa el cuadro que controlala bola de fuego
var fireBall = null, fireBall2 = null, fireBall3 = null;

//Represeta las municiones
var shots = [];

//Represeta las de los enemigos
var shotsEnemies = [];

//Almacena la indicacion si el juego termino
var GAMEOVER = true;

//Guarda los puntos del usuario
var score = 0;

//Represeta los enemigos
var enemies = [];

var titleLevel = 0;

function init() {

    //Obtiene el canvas
    canvas = document.getElementById('c2canvas');

    //Cambia el color de fondo del canvas
    canvas.style.background = '#000';

    //Configura el contexto
    ctx = canvas.getContext('2d');

    //Represeta el cuadro que controla el jugador
    player = new Rectangle(canvas.width / 2, canvas.height - 10, 64, 64, 0, "player", null);

    //Represeta el cuadro que controla el planeta
    planet = new Rectangle(random((canvas.width - 480) / 10) * random(15), (-1 * random2(1030, 6400)), 480, 480, 0, "", null);
    planet2 = new Rectangle(random((canvas.width - 128) / 10) * random(15), (-1 * random2(1500, 2900)), 128, 128, 0, "", null);
    planet3 = new Rectangle(random((canvas.width - 256) / 10) * random(15), (-1 * random2(500, 1200)), 256, 256, 0, "", null);
    planet4 = new Rectangle(random((canvas.width - 128) / 10) * random(15), (-1 * random2(700, 1800)), 128, 128, 0, "", null);
    planet5 = new Rectangle(random((canvas.width - 385) / 10) * random(15), (-1 * random2(5000, 10000)), 385, 385, 0, "", null);

    //Representa el cuadro que controla el asteroide
    asteroid = new Rectangle(random((canvas.width - 10) / 5) * random(30), -95, 95, 95, 0, "", null);

    //Representa el cuadro que controla la bola de fuego 1
    fireBall = new Rectangle(random((canvas.width - 10) / 4) * random(30), (-1 * random2(95, 150)), 55, 55, 0, "", null);

    //Representa el cuadro que controla la bola de fuego 2
    fireBall2 = new Rectangle(random((canvas.width - 10) / 4) * random(30), (-1 * random2(130, 250)), 55, 55, 0, "", null);

    //Representa el cuadro que controla la bola de fuego 3
    fireBall3 = new Rectangle(random((canvas.width - 10) / 4) * random(30), (-1 * random2(160, 500)), 55, 55, 0, "", null);

    if (touchable) {

        if (canvas.webkitRequestFullScreen) {

            canvas.webkitRequestFullScreen();
        }

        canvas.addEventListener('touchstart', onTouchStart, false);
        canvas.addEventListener('touchmove', onTouchMove, false);
        canvas.addEventListener('touchend', onTouchEnd, false);

        window.onorientationchange = reset;
        window.onresize = reset;
    }
    else {

        //Agrega una escucha, se presiona una tecla
        document.addEventListener('keydown', function (evt) {

            lastKey = evt.keyCode;
            PRESSING[evt.keyCode] = true;
        }, false);

        //Elimina una escucha, se suelta una tecla
        document.addEventListener('keyup', function (evt) {

            PRESSING[evt.keyCode] = false;
        }, false);
    }

    //Configura a musica de fondo
    if (typeof aEnvironment.loop == 'boolean') {
        aEnvironment.loop = true;
    }
    else {
        aEnvironment.addEventListener('ended', function () {
            this.currentTime = 0;
            this.play();
        }, false);
    }

    //Configura la musica de inicio
    aInicio.addEventListener('ended', function () {
        aEnvironment.currentTime = 0;
        aEnvironment.play();
    }, false);

    //Envia el contexto para pintarlo
    run();
}

function run() {

    medias();

    //Crea un ciclo
    setTimeout(run, speed);

    //Configura el juego
    game();

    //Envia el contexto para pintarlo
    paint(ctx);
}

//Configura el juego
function game() {

    //Verifica si el juego esta en modo intruccion
    if (instructions == 0) {

        //Verifica si el juego esta parado
        if (!PAUSE) {

            //Verifica si el juego debe reiniciarse
            if (GAMEOVER)
                reset();

            if (touchable) {

                var xt = (leftVector.x - leftTouchStartPos.x);
                var yt = (leftTouchStartPos.y - leftVector.y);

                if (xt > 0)
                    player.x += speedShip;
                else if (xt < 0)
                    player.x -= speedShip;

                if (yt > 0)
                    player.y -= speedShip;
                else if (yt < 0)
                    player.y += speedShip;

            } else {

                if (PRESSING[39]) //Derecha
                    player.x += speedShip;
                else if (PRESSING[37]) //Izquierda
                    player.x -= speedShip;

                if (PRESSING[38]) //Arriba
                    player.y -= speedShip;
                else if (PRESSING[40]) //Abajo
                    player.y += speedShip;
            }

            // Impide que el usuario salga de la pantala
            if (player.x > canvas.width - 145 - player.width)
                player.x = canvas.width - 145 - player.width;

            if (player.x < maxBoderX - 35)
                player.x = maxBoderX - 35;

            if (player.y > canvas.height - player.height)
                player.y = canvas.height - player.height;

            if (player.y < 96)
                player.y = 96;

            //Nuevo disparo
            if (lastKey == 32) {

                if (timerShot == 0) {

                    PlaySound(3);

                    if (multishot == 1) {

                        shots.push(new Rectangle(player.x + 26, player.y, 15, 55, "laser1"));
                    }

                    if (multishot == 2) {

                        shots.push(new Rectangle(player.x + 15, player.y, 13, 55, "laser2"));
                        shots.push(new Rectangle(player.x + 38, player.y, 13, 55, "laser2"));
                    }

                    if (multishot == 3) {

                        shots.push(new Rectangle(player.x + 15, player.y, 12, 55, "laser3"));
                        shots.push(new Rectangle(player.x + 30, player.y, 15, 55, "laser2"));
                        shots.push(new Rectangle(player.x + 45, player.y, 12, 55, "laser3"));

                    }

                    timerShot = 12;
                }

                lastKey = null;
            }

            //Mueve los disparos
            for (var i = 0, l = shots.length; i < l; i++) {

                //Verifica si existe el disparo
                if (shots[i] != null) {

                    shots[i].y -= 10;

                    if (shots[i].y < 0)
                        shots.splice(i--, 1);
                }
            }

            //Mueve el planeta                                               
            planet.y += 2;

            if (planet.y >= (-1 * (planet.height + 10)))
                planet.x += 0.6;

            if (planet.y > canvas.height + (planet.height - canvas.height) + 500 + random(200)) {

                planet.y = (-1 * random2(1030, 6400));
                planet.x = random((canvas.width - 480) / 10) * random(15);
            }

            //Mueve el planeta
            planet2.y += 1.8;

            if (planet2.y >= (-1 * (planet2.height + 10)))
                planet2.x += -0.4;

            if (planet2.y > canvas.height + (planet2.height - canvas.height) + 3500 + random(200)) {

                planet2.y = (-1 * random2(1500, 2900));
                planet2.x = random((canvas.width - 128) / 10) * random(15);
            }

            //Mueve el planeta
            planet3.y += 1.7;

            if (planet3.y > canvas.height + (planet3.height - canvas.height) + 3596 + random(200)) {

                planet3.y = (-1 * random2(500, 1200));
                planet3.x = random((canvas.width - 256) / 10) * random(15);
            }

            //Mueve el planeta                                               
            planet4.y += 1.8;

            if (planet4.y >= (-1 * (planet4.height + 10)))
                planet4.x += 0.2;

            if (planet4.y > canvas.height + (planet4.height - canvas.height) + 500 + random(200)) {

                planet4.y = (-1 * random2(700, 1800));
                planet4.x = random((canvas.width - 480) / 10) * random(15);
            }

            //Mueve el planeta                                               
            planet5.y += 1.5;

            if (planet5.y >= (-1 * (planet5.height + 10)))
                planet5.x += 0.4;

            if (planet5.y > canvas.height + (planet5.height - canvas.height) + 904 + random(200)) {

                planet5.y = (-1 * random2(5000, 10000));
                planet5.x = random((canvas.width - 385) / 10) * random(15);
            }

            //Mueve el asteroide
            asteroid.y += 3;

            if (asteroid.y > canvas.height + asteroid.height + 400 + random(200)) {

                asteroid.y = -95;
                asteroid.x = random(random((canvas.width - 10) / 5) * random(30));
            }

            //Mueve la bola de fuego 1
            fireBall.y += 1.3;

            if (fireBall.y > canvas.height + fireBall.height + 400 + random(300)) {

                fireBall.y = (-1 * random2(95, 150));
                fireBall.x = random(random((canvas.width) / 4) * random(30));
            }

            //Mueve la bola de fuego 2
            fireBall2.y += 1.3;

            if (fireBall2.y >= (-1 * (fireBall2.height + 10)))
                fireBall2.x += -1;

            if (fireBall2.y > canvas.height + fireBall2.height + 400 + random(300)) {

                fireBall2.y = (-1 * random2(130, 250));
                fireBall2.x = random(random((canvas.width) / 4) * random(30));
            }

            //Mueve la bola de fuego 3
            fireBall3.y += 1.3;

            if (fireBall3.y >= (-1 * (fireBall3.height + 10)))
                fireBall3.x += 1;

            if (fireBall3.y > canvas.height + fireBall3.height + 400 + random(300)) {

                fireBall3.y = (-1 * random2(130, 250));
                fireBall3.x = random(random((canvas.width) / 4) * random(30));
            }

            //Mueve los enemigos
            for (i = 0; i < enemies.length; i++) {

                //Busca los disparos que colisionan con un enemigo antes del movimiento
                shotsEnemiesIntersects(i);

                if (score > (level * 300 + (level * (15 * level)))) {

                    PlaySound(2);

                    enemies.splice(0, enemies.length);
                    shots.splice(0, shots.length);

                    level++;

                    titleLevel = TIMEBETWEENLEVEL;

                    AddEnemies(random(5));

                    indexBackground = random(9);

                    break;
                }

                enemies[i].y += 8;

                if (enemies[i].y > canvas.height) {

                    do {
                        enemies[i].x = random(canvas.width / 10) * 10;
                    }
                    while (enemies[i].x < maxBoderX || enemies[i].x > (canvas.width - maxBoderX));

                    enemies[i].y = -1 * random(150);
                    enemies[i].health = GetEnemiesHealth();
                }

                //Busca los enemigos que chocan con el usuario
                if (player.intersects(enemies[i]) && player.timer < 1) {

                    player.health--;
                    player.timer = 20;
                    multishot = 1;

                    if (player.health < 1) {

                        PlaySound(5);
                        instructionTimer = TIMEBEFOREINSTRUCTIONS;
                    }
                    else
                        PlaySound(4);
                }
            }

            //Mueve las mejoras
            for (i = 0, l = powerups.length; i < l; i++) {

                powerups[i].y += 8;

                //Player intersects
                if (player.intersects(powerups[i])) {

                    aAddMejora.currentTime = 0;
                    aAddMejora.play();

                    if (powerups[i].powerups == 1) {

                        if (multishot < 3) {

                            var myGun = ["BUBBLE", "SUPER BUBBLE", "MEGA BUBBLE", "ROCKET LAUNCHER"];

                            messages.push(new message(myGun[multishot], player.x, player.y));
                            multishot++;
                        } else {

                            messages.push(new message('+' + POWERUPSPOINTS, player.x, player.y));
                            UpdateIternalScore(POWERUPSPOINTS);
                        }
                    }
                    else if (powerups[i].powerups == 3) {

                        if (player.health < MAXPLAYERLIVES) {

                            messages.push(new message('+1 Vida', player.x, player.y));
                            player.health++;

                        } else {

                            messages.push(new message('+' + POWERUPSPOINTS, player.x, player.y));
                            UpdateIternalScore(POWERUPSPOINTS);
                        }

                    } else {

                        messages.push(new message('+' + POWERUPSPOINTS, player.x, player.y));
                        UpdateIternalScore(POWERUPSPOINTS);
                    }

                    powerups.splice(i--, 1);
                    l--;
                }
                else {

                    // Mejora fuera de la pantalla
                    if (powerups[i].y > canvas.height) {

                        powerups.splice(i--, 1);
                        l--;
                        continue;
                    }
                }
            }

            //Mueve los mensajes
            for (i = 0, l = messages.length; i < l; i++) {

                messages[i].y += 2;

                if (messages[i].y > canvas.height - 10) {

                    messages.splice(i--, 1);
                    l--;
                }
            }
        }
    }
    else {

        //Quita las instrucciones
        if (lastKey == 13) {

            aInicio.currentTime = 0;
            aInicio.play();

            reset();
            PAUSE = false;
            GAMEOVER = false;
            instructions = 0;

            lastKey = null;
        }
    }

    //Idnetifica si el usuario ya perdio todas sus vidas
    if (player.health < 1) {

        GAMEOVER = true;
        PAUSE = true;
    }

    //Disminuye el contador de inmunidad del usuario
    if (player.timer > 0) {

        player.timer--;
    }

    //Disminuye el tiempo de los disparos
    if (timerShot > 0) {

        timerShot--;
    }

    // Acciona y detiene el juego
    if (lastKey == 13) {

        PAUSE = !PAUSE;

        if (PAUSE)
            aEnvironment.pause();
        else
            aEnvironment.play();

        lastKey = null;

        if (instructionTimer > 0)
            instructionTimer = 1;
    }

    //Disminuye el tiempo para que se muestren las instrucciones y llama a la funcion guardar
    if (instructionTimer > 0) {

        if (instructionTimer == 1)
            SaveScore();

        instructionTimer--;
    }
}

function SaveScore() {

    //Determina si las variables existen
    if (score > 0 && typeof functionName != "undefined" && typeof q != "undefined") {

        if (typeof (window[functionName]) === "function") {

            var key = hex_md5(q + "wH4DsxHyu8dAqsdeAqCbHfsD" + score);

            window[functionName](key, score, level);
        }
    }

    reset();
}


function UpdateIternalScore(points) {

    score += points;

    if (typeof (window["updateScore"]) === "function")
        window["updateScore"](score);
}

function shotsEnemiesIntersects(i) {

    //Busca los disparos que colisionan con un enemigo antes del movimiento
    for (j = 0; j < shots.length; j++) {

        if (shots[j].intersects(enemies[i])) {

            //Resta la salud a un enemigo
            enemies[i].health--;

            if (enemies[i].health < 1) {

                // Agrega mejoras
                var r = random(25);

                if (r < 6) {

                    if (r == 0)    // New MultiShot
                        powerups.push(new Rectangle(enemies[i].x, enemies[i].y, 15, 50, "", 0, 0, 1));
                    if (r == 1)    // Add live
                        powerups.push(new Rectangle(enemies[i].x, enemies[i].y, 32, 32, "", 0, 0, 3));
                    else        // New ExtraPoints
                        powerups.push(new Rectangle(enemies[i].x, enemies[i].y, 32, 24, "", 0, 0, 2));
                }

                //Incrementa el puntaje del usuario
                UpdateIternalScore(SHIPPOINTS)

                PlaySound(1);

                do {
                    enemies[i].x = random(canvas.width / 10) * 10;
                }
                while (enemies[i].x < maxBoderX || enemies[i].x > (canvas.width - maxBoderX));

                enemies[i].y = -1 * random(150);

                enemies[i].type = GetTypeEnemy();
                enemies[i].health = GetEnemiesHealth();

                if (enemies.length < (level * INCREMENTENEMIESFORLEVEL) && enemies.length < MAXENEMIESFORLEVEL) {

                    AddEnemies(enemies[i].increment);

                    //Cambia el valor de incremento
                    enemies[i].increment = GetIncrement();
                }
            }
            else {
                enemies[i].timer = 1;
            }

            //Elimina el disparo
            shots.splice(j--, 1);
        }
    }
}

//Pinta los elementos dentro de la etiqueta canvas
function paint(ctx) {

    //Limpia el contexto
    ctx.clearRect(0, 0, canvas.width, canvas.height);


    //Verifica si el juego esta detenido
    if (instructions == 1) {

        if (!touchable)
            ctx.drawImage(iInstructionsBackgroundDesk, 0, 0, 900, 450);
        else
            ctx.drawImage(iInstructionsBackgroundIpad, 0, 0, 900, 450);

        return;
    }
    else {

        //Muestra el fondo
        ctx.drawImage(aBackground[indexBackground], 0, bgTimer);
        ctx.drawImage(aBackground[indexBackground], 0, 448 + bgTimer);

        //Dibuja los disparos
        for (var i = 0, l = shots.length; i < l; i++) {

            //Dibuja los disparos
            for (var i = 0, l = shots.length; i < l; i++) {

                var imgShot;

                switch (shots[i].type) {

                    case "laser1":

                        imgShot = iLaser1;
                        break;

                    case "laser2":

                        imgShot = iLaser2;
                        break;

                    default:

                        imgShot = iLaser3;
                        break;
                }

                ctx.drawImage(imgShot, shots[i].x, shots[i].y, shots[i].width, shots[i].height);
            }
        }

        //Dibuja los enemigos
        for (i = 0; i < enemies.length; i++) {

            switch (enemies[i].type) {

                case "ship":

                    if (enemies[i].timer == 1) {

                        ctx.drawImage(iEnemy1d, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
                    }
                    else {

                        ctx.drawImage(iEnemy1, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
                    }

                    break;

                case "ship2":

                    if (enemies[i].timer == 1) {

                        ctx.drawImage(iEnemy3d, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
                    }
                    else {

                        ctx.drawImage(iEnemy3, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
                    }

                    break;

                case "ship3":

                    ctx.drawImage(iEnemy4, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);

                    break;

                case "asteroid":

                    if (enemies[i].timer == 1) {

                        ctx.drawImage(iEnemy2d, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
                    }
                    else {

                        ctx.drawImage(iEnemy2, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
                    }

                    break;
            }
        }

        //Dibuja las mejoras
        for (i = 0, l = powerups.length; i < l; i++) {

            if (powerups[i].powerups == 1) {

                ctx.drawImage(iMulti, powerups[i].x, powerups[i].y, powerups[i].width, powerups[i].height);
            }
            else if (powerups[i].powerups == 3) {

                ctx.drawImage(iCan, powerups[i].x, powerups[i].y, powerups[i].width, powerups[i].height);
            }
            else {

                ctx.drawImage(iPantera, powerups[i].x, powerups[i].y, powerups[i].width, powerups[i].height);
            }
        }

        //Dibuja los mensajes
        ctx.fillStyle = '#fff';
        for (i = 0, l = messages.length; i < l; i++)
            ctx.fillText(messages[i].string, messages[i].x, messages[i].y);

        //Dibuja los logos
        ctx.drawImage(iChocoMilk, 5, 334, 180, 108);

        //Dibuja el cuerpo del jugador
        if (player.timer % 2 == 0)
            ctx.drawImage(iLifeGuard, player.x, player.y, player.width, player.height);

        //identifica si el dispositivo es tactil
        if (touchable) {

            //Recorre los eventos tactiles
            for (var i = 0; i < touches.length; i++) {

                var touch = touches[i];

                //Si el id del evento es el mismo del evento del jostick lo muestra
                if (touch.identifier == leftTouchID) {

                    //Circulo exterior
                    ctx.beginPath();
                    ctx.strokeStyle = "gray";
                    ctx.lineWidth = 2;
                    ctx.arc(leftTouchStartPos.x, leftTouchStartPos.y, 60, 0, Math.PI * 2, true);
                    ctx.stroke();

                    //Jostick
                    ctx.beginPath();
                    ctx.strokeStyle = "gray";
                    ctx.lineWidth = 6;
                    ctx.arc(leftTouchStartPos.x, leftTouchStartPos.y, 40, 0, Math.PI * 2, true);
                    ctx.stroke();

                    //Palanca
                    ctx.beginPath();
                    ctx.strokeStyle = "gray";
                    ctx.arc(leftTouchPos.x, leftTouchPos.y, 40, 0, Math.PI * 2, true);
                    ctx.stroke();
                }
                else {

                    ctx.beginPath();
                    ctx.strokeStyle = "gray";
                    ctx.lineWidth = "5";
                    ctx.arc(touch.clientX, touch.clientY, 40, 0, Math.PI * 2, true);
                    ctx.stroke();
                }
            }
        }

        ctx.fillStyle = '#fff';
        ctx.font = 'bold 18pt Calibri';

        //Dibuja las vida del jugador
        for (var i = 0; i < player.health; i++) {

            ctx.drawImage(iCan, 4 + (32 * i), 6, 32, 32);
        }

        ctx.textAlign = 'right';
        //Dibuja los puntos del jugador
        ctx.drawImage(iPantera, 800, 6, 32, 32);
        ctx.fillText(score, 855 + ((score.toString().length - 1) * 10), 30);

        //Dibuja el nivel del jugador
        ctx.drawImage(iMedal, 800, 43, 32, 42);
        ctx.fillText(pad(level, score.toString().length), 855 + ((score.toString().length - 1) * 10), 68);

        //Verifica si el juego se encuentra parado
        if (PAUSE) {

            if (!GAMEOVER) {

                ctx.textAlign = 'center';
                ctx.fillText('PAUSA', canvas.width / 2, canvas.height / 2);
                ctx.textAlign = 'left';

            } else {

                ctx.textAlign = 'center';
                ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2);

                ctx.textAlign = 'left';
            }
        }
        else {

            bgTimer += 7.5;
            if (bgTimer > 0)
                bgTimer -= 450;

            if (titleLevel > 0) {

                ctx.textAlign = 'center';
                ctx.fillText('Ahora estas en los rapidos nivel ' + level, canvas.width / 2, canvas.height / 2);

                if (level < congratulations.length)
                    ctx.fillText(congratulations[level - 1], canvas.width / 2, (canvas.height / 2) + 25);

                titleLevel--;
            }
        }
    }
}

//Reinicia los valores
function reset() {

    aEnvironment.pause();
    aEnvironment.currentTime = 0;

    instructions = 1;
    multishot = 1;
    timerShot = 0;
    level = 1;
    titleLevel = 0;
    score = 0;
    indexBackground = random(9);
    player.health = PLAYERLIVES;
    player.timer = 0;

    player.x = canvas.width / 2;
    player.y = canvas.height - 10;

    shots.splice(0, shots.length)
    enemies.splice(0, enemies.length)
    powerups.splice(0, powerups.length)
    messages.splice(0, messages.length)

    //Numero inicial de enemigos
    AddEnemies(random(5));

    GAMEOVER = false;

    medias();
}

function medias() {

    //Desplaza el scroll hasta la parte superior izquierda
    window.scrollTo(0, 0);

    halfWidth = canvas.width / 2;
    halfHeight = canvas.height / 2;
}

//Crea numeros aleatorios
function random(max) {
    return ~ ~(Math.random() * max);
}

//Crea numeros aleatorios
function random2(min, max) {
    return Math.floor(Math.random() * max) + min
}

//Seudo clase para crear los cuadros
function Rectangle(x, y, width, height, type, increment, health, powerups) {

    //Indica el numero de objetos que incrementa este objeto
    this.increment = (increment == null) ? 0 : increment;

    this.type = (type == null) ? "user" : type;

    this.x = (x == null) ? 0 : x;

    this.y = (y == null) ? 0 : y;

    this.width = (width == null) ? 0 : width;

    this.height = (height == null) ? this.width : height;

    this.health = (health == null) ? 2 : health;

    this.timer = 0;

    this.powerups = (powerups == null) ? 1 : powerups;

    this.intersects = function (rect) {

        //Verifica si el cuadro con el que se coliciono es diferente de nulo
        if (rect != null) {

            //Indica si se cumple la regla de colicion
            return (this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y);
        }
    }
}

function message(string, x, y) {
    this.string = (string == null) ? '?' : string;
    this.x = (x == null) ? 0 : x;
    this.y = (y == null) ? 0 : y;
}

function onTouchStart(e) {

    for (var i = 0; i < e.changedTouches.length; i++) {

        var touch = e.changedTouches[i];

        if (instructions == 1 && instructionTimer == 0)
            lastKey = 13;
        else if ((leftTouchID < 0) && (touch.clientX < halfWidth)) {

            //Asigna el identificador del jostick
            leftTouchID = touch.identifier;

            //Coloca el jostick en la posicion del contacto
            leftTouchStartPos.reset(touch.clientX, touch.clientY);

            //Coloca la palanca en la misma posicion del jostick
            leftTouchPos.copyFrom(leftTouchStartPos);

            //Resetea el valor de la palanca a 0
            leftVector.reset(0, 0);

            continue;
        }
        else if (!GAMEOVER)
            lastKey = 32;
    }
    //Asigna la nueva matriz de contactos
    touches = e.touches;
}

//Decta el movimiento sobre la pantalla
function onTouchMove(e) {

    // Evita el scroll y zoom de la pagina
    e.preventDefault();

    //Recorre la matriz de contacto en busca del jostick
    for (var i = 0; i < e.changedTouches.length; i++) {

        var touch = e.changedTouches[i];

        //Si el contacto es el jostick
        if (leftTouchID == touch.identifier) {

            //Cambia la posicion de la palanca
            leftTouchPos.reset(touch.clientX, touch.clientY);

            //Copia los valores al nuevo vector
            leftVector.copyFrom(leftTouchPos);

            break;
        }
    }
    //Asigna la nueva matriz de contactos
    touches = e.touches;
}

function onTouchEnd(e) {

    //Recorre la matriz de contacto en busca del jostick
    for (var i = 0; i < e.changedTouches.length; i++) {

        var touch = e.changedTouches[i];

        //Si el contacto es el jostick
        if (leftTouchID == touch.identifier) {

            leftTouchID = -1;
            leftVector.reset(0, 0);
            leftTouchStartPos.reset(0, 0);
            break;
        }
    }
    //Asigna la nueva matriz de contactos
    touches = e.touches;
}

function GetTypeEnemy() {

    var enemyType = "";

    switch (random(4)) {

        case 0:

            enemyType = "ship";
            break;

        case 1:

            enemyType = "asteroid";
            break;

        case 2:

            enemyType = "ship2";
            break;

        case 3:

            enemyType = "ship3";
            break;
    }

    return enemyType;
}

function GetIncrement() {

    return (random(3) * level);
}

function AddEnemies(totalEnemies) {

    for (var i = 0; i <= totalEnemies; i++) {

        var px = 0;

        do {
            px = random(canvas.width / 10) * 10;
        }
        while (px < maxBoderX || px > (canvas.width - maxBoderX));

        enemies.push(new Rectangle(px, random(30), 40, 40, GetTypeEnemy(), GetIncrement(), GetEnemiesHealth()));
    }
}

function GetEnemiesHealth() {

    return (random(2) == 0) ? 1 : 2;
}

function PlaySound(type) {

    if (!touchable) {

        switch (type) {

            case 1:

                aExplosion.currentTime = 0;
                aExplosion.play();

                break;

            case 2:

                aNextLevel.currentTime = 0;
                aNextLevel.play();

                break;

            case 3:


                if (multishot == 1) {

                    aShot.currentTime = 0;
                    aShot.play();

                } else if (multishot == 2) {

                    aMultiShot2.currentTime = 0;
                    aMultiShot2.play();

                } else if (multishot == 3) {

                    aMultiShot3.currentTime = 0;
                    aMultiShot3.play();

                } else if (multishot == 4) {

                    aMultiShot4.currentTime = 0;
                    aMultiShot4.play();
                }

                break;

            case 4:

                aDamage.currentTime = 0;
                aDamage.play();

                break;

            case 5:

                aEnvironment.pause();

                aExplosionDeath.currentTime = 0;
                aExplosionDeath.play();

                break;
        }
    }
}

function pad(n, length) {

    n = n.toString();

    while (n.length < length)
        n = "0" + n;

    return n;
}

function roundedRect(ctx, x, y, width, height, radius) {

    ctx.beginPath();
    ctx.moveTo(x, y + radius);
    ctx.lineTo(x, y + height - radius);
    ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
    ctx.lineTo(x + width - radius, y + height);
    ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
    ctx.lineTo(x + width, y + radius);
    ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
    ctx.lineTo(x + radius, y);
    ctx.quadraticCurveTo(x, y, x, y + radius);
    ctx.stroke();
}

//Encriptacion MD5
var hexcase = 0; function hex_md5(a) { return rstr2hex(rstr_md5(str2rstr_utf8(a))) } function hex_hmac_md5(a, b) { return rstr2hex(rstr_hmac_md5(str2rstr_utf8(a), str2rstr_utf8(b))) } function md5_vm_test() { return hex_md5("abc").toLowerCase() == "900150983cd24fb0d6963f7d28e17f72" } function rstr_md5(a) { return binl2rstr(binl_md5(rstr2binl(a), a.length * 8)) } function rstr_hmac_md5(c, f) { var e = rstr2binl(c); if (e.length > 16) { e = binl_md5(e, c.length * 8) } var a = Array(16), d = Array(16); for (var b = 0; b < 16; b++) { a[b] = e[b] ^ 909522486; d[b] = e[b] ^ 1549556828 } var g = binl_md5(a.concat(rstr2binl(f)), 512 + f.length * 8); return binl2rstr(binl_md5(d.concat(g), 512 + 128)) } function rstr2hex(c) { try { hexcase } catch (g) { hexcase = 0 } var f = hexcase ? "0123456789ABCDEF" : "0123456789abcdef"; var b = ""; var a; for (var d = 0; d < c.length; d++) { a = c.charCodeAt(d); b += f.charAt((a >>> 4) & 15) + f.charAt(a & 15) } return b } function str2rstr_utf8(c) { var b = ""; var d = -1; var a, e; while (++d < c.length) { a = c.charCodeAt(d); e = d + 1 < c.length ? c.charCodeAt(d + 1) : 0; if (55296 <= a && a <= 56319 && 56320 <= e && e <= 57343) { a = 65536 + ((a & 1023) << 10) + (e & 1023); d++ } if (a <= 127) { b += String.fromCharCode(a) } else { if (a <= 2047) { b += String.fromCharCode(192 | ((a >>> 6) & 31), 128 | (a & 63)) } else { if (a <= 65535) { b += String.fromCharCode(224 | ((a >>> 12) & 15), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } else { if (a <= 2097151) { b += String.fromCharCode(240 | ((a >>> 18) & 7), 128 | ((a >>> 12) & 63), 128 | ((a >>> 6) & 63), 128 | (a & 63)) } } } } } return b } function rstr2binl(b) { var a = Array(b.length >> 2); for (var c = 0; c < a.length; c++) { a[c] = 0 } for (var c = 0; c < b.length * 8; c += 8) { a[c >> 5] |= (b.charCodeAt(c / 8) & 255) << (c % 32) } return a } function binl2rstr(b) { var a = ""; for (var c = 0; c < b.length * 32; c += 8) { a += String.fromCharCode((b[c >> 5] >>> (c % 32)) & 255) } return a } function binl_md5(p, k) { p[k >> 5] |= 128 << ((k) % 32); p[(((k + 64) >>> 9) << 4) + 14] = k; var o = 1732584193; var n = -271733879; var m = -1732584194; var l = 271733878; for (var g = 0; g < p.length; g += 16) { var j = o; var h = n; var f = m; var e = l; o = md5_ff(o, n, m, l, p[g + 0], 7, -680876936); l = md5_ff(l, o, n, m, p[g + 1], 12, -389564586); m = md5_ff(m, l, o, n, p[g + 2], 17, 606105819); n = md5_ff(n, m, l, o, p[g + 3], 22, -1044525330); o = md5_ff(o, n, m, l, p[g + 4], 7, -176418897); l = md5_ff(l, o, n, m, p[g + 5], 12, 1200080426); m = md5_ff(m, l, o, n, p[g + 6], 17, -1473231341); n = md5_ff(n, m, l, o, p[g + 7], 22, -45705983); o = md5_ff(o, n, m, l, p[g + 8], 7, 1770035416); l = md5_ff(l, o, n, m, p[g + 9], 12, -1958414417); m = md5_ff(m, l, o, n, p[g + 10], 17, -42063); n = md5_ff(n, m, l, o, p[g + 11], 22, -1990404162); o = md5_ff(o, n, m, l, p[g + 12], 7, 1804603682); l = md5_ff(l, o, n, m, p[g + 13], 12, -40341101); m = md5_ff(m, l, o, n, p[g + 14], 17, -1502002290); n = md5_ff(n, m, l, o, p[g + 15], 22, 1236535329); o = md5_gg(o, n, m, l, p[g + 1], 5, -165796510); l = md5_gg(l, o, n, m, p[g + 6], 9, -1069501632); m = md5_gg(m, l, o, n, p[g + 11], 14, 643717713); n = md5_gg(n, m, l, o, p[g + 0], 20, -373897302); o = md5_gg(o, n, m, l, p[g + 5], 5, -701558691); l = md5_gg(l, o, n, m, p[g + 10], 9, 38016083); m = md5_gg(m, l, o, n, p[g + 15], 14, -660478335); n = md5_gg(n, m, l, o, p[g + 4], 20, -405537848); o = md5_gg(o, n, m, l, p[g + 9], 5, 568446438); l = md5_gg(l, o, n, m, p[g + 14], 9, -1019803690); m = md5_gg(m, l, o, n, p[g + 3], 14, -187363961); n = md5_gg(n, m, l, o, p[g + 8], 20, 1163531501); o = md5_gg(o, n, m, l, p[g + 13], 5, -1444681467); l = md5_gg(l, o, n, m, p[g + 2], 9, -51403784); m = md5_gg(m, l, o, n, p[g + 7], 14, 1735328473); n = md5_gg(n, m, l, o, p[g + 12], 20, -1926607734); o = md5_hh(o, n, m, l, p[g + 5], 4, -378558); l = md5_hh(l, o, n, m, p[g + 8], 11, -2022574463); m = md5_hh(m, l, o, n, p[g + 11], 16, 1839030562); n = md5_hh(n, m, l, o, p[g + 14], 23, -35309556); o = md5_hh(o, n, m, l, p[g + 1], 4, -1530992060); l = md5_hh(l, o, n, m, p[g + 4], 11, 1272893353); m = md5_hh(m, l, o, n, p[g + 7], 16, -155497632); n = md5_hh(n, m, l, o, p[g + 10], 23, -1094730640); o = md5_hh(o, n, m, l, p[g + 13], 4, 681279174); l = md5_hh(l, o, n, m, p[g + 0], 11, -358537222); m = md5_hh(m, l, o, n, p[g + 3], 16, -722521979); n = md5_hh(n, m, l, o, p[g + 6], 23, 76029189); o = md5_hh(o, n, m, l, p[g + 9], 4, -640364487); l = md5_hh(l, o, n, m, p[g + 12], 11, -421815835); m = md5_hh(m, l, o, n, p[g + 15], 16, 530742520); n = md5_hh(n, m, l, o, p[g + 2], 23, -995338651); o = md5_ii(o, n, m, l, p[g + 0], 6, -198630844); l = md5_ii(l, o, n, m, p[g + 7], 10, 1126891415); m = md5_ii(m, l, o, n, p[g + 14], 15, -1416354905); n = md5_ii(n, m, l, o, p[g + 5], 21, -57434055); o = md5_ii(o, n, m, l, p[g + 12], 6, 1700485571); l = md5_ii(l, o, n, m, p[g + 3], 10, -1894986606); m = md5_ii(m, l, o, n, p[g + 10], 15, -1051523); n = md5_ii(n, m, l, o, p[g + 1], 21, -2054922799); o = md5_ii(o, n, m, l, p[g + 8], 6, 1873313359); l = md5_ii(l, o, n, m, p[g + 15], 10, -30611744); m = md5_ii(m, l, o, n, p[g + 6], 15, -1560198380); n = md5_ii(n, m, l, o, p[g + 13], 21, 1309151649); o = md5_ii(o, n, m, l, p[g + 4], 6, -145523070); l = md5_ii(l, o, n, m, p[g + 11], 10, -1120210379); m = md5_ii(m, l, o, n, p[g + 2], 15, 718787259); n = md5_ii(n, m, l, o, p[g + 9], 21, -343485551); o = safe_add(o, j); n = safe_add(n, h); m = safe_add(m, f); l = safe_add(l, e) } return Array(o, n, m, l) } function md5_cmn(h, e, d, c, g, f) { return safe_add(bit_rol(safe_add(safe_add(e, h), safe_add(c, f)), g), d) } function md5_ff(g, f, k, j, e, i, h) { return md5_cmn((f & k) | ((~f) & j), g, f, e, i, h) } function md5_gg(g, f, k, j, e, i, h) { return md5_cmn((f & j) | (k & (~j)), g, f, e, i, h) } function md5_hh(g, f, k, j, e, i, h) { return md5_cmn(f ^ k ^ j, g, f, e, i, h) } function md5_ii(g, f, k, j, e, i, h) { return md5_cmn(k ^ (f | (~j)), g, f, e, i, h) } function safe_add(a, d) { var c = (a & 65535) + (d & 65535); var b = (a >> 16) + (d >> 16) + (c >> 16); return (b << 16) | (c & 65535) } function bit_rol(a, b) { return (a << b) | (a >>> (32 - b)) };