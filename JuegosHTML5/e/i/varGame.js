//*********************************CONFIGURACION*********************************

//Velocidad
var SPEED = 50;
var speed = SPEED;


//*******************************************************************************
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

//Variable para el fondo
var bgTimer = 0;

//Imagen de fondo
var iBackground = new Image();
iBackground.src = 'nebula.jpg';

//Imagen de la nave
var iSpacecraft = new Image();
iSpacecraft.src = 'nave.png';

//Imagen de los enemigos
var iEnemy1 = new Image();
iEnemy1.src = 'enemigo1.png';

var iEnemy2 = new Image();
iEnemy2.src = 'enemigo2.png';

var iEnemy2d = new Image();
iEnemy2d.src = 'enemigo2d.png';

var canvas = null;
var ctx = null;

var x = 50;
var y = 50;

var halfWidth = null;
var halfHeight = null;

//Almacena la ultima tecla presionada
var lastKey = null;

//Almacena la indicacion si el juego esta en pausa
var PAUSE = false;

//Almacena las teclas presionadas
var PRESSING = [];

//Represeta el cuadro que controla el jugador
var player = null;

//Represeta las municiones
var shots = [];

//Almacena la indicacion si el juego termino
var GAMEOVER = true;

//Guarda los puntos del usuario
var score = 0;

//Represeta los enemigos
var enemies = [];

function init() {

    //Obtiene el canvas
    canvas = document.getElementById('canvas');

    //Cambia el color de fondo del canvas
    canvas.style.background = '#000';

    //Configura el contexto
    ctx = canvas.getContext('2d');

    //Represeta el cuadro que controla el jugador
    player = new Rectangle(canvas.width / 2, canvas.height - 10, 30, 30, 0, "player", null);

    if (touchable) {

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

    //Verifica si el juego esta parado
    if (!PAUSE) {

        //Verifica si el juego debe reiniciarse
        if (GAMEOVER)
            reset();

        if (touchable) {

            var xt = (leftVector.x - leftTouchStartPos.x);
            var yt = (leftTouchStartPos.y - leftVector.y);

            if (xt > 0)
                player.x += 10;
            else if (xt < 0)
                player.x -= 10;

            if (yt > 0)
                player.y -= 10;
            else if (yt < 0)
                player.y += 10;

        } else {

            if (PRESSING[39]) //Derecha
                player.x += 10;
            else if (PRESSING[37]) //Izquierda
                player.x -= 10;

            if (PRESSING[38]) //Arriba
                player.y -= 10;
            else if (PRESSING[40]) //Abajo
                player.y += 10;
        }

        // Impide que el usuario salga de la pantala
        if (player.x > canvas.width - player.width)
            player.x = canvas.width - player.width;

        if (player.x < 0)
            player.x = 0;

        if (player.y > canvas.height - player.height)
            player.y = canvas.height - player.height;

        if (player.y < canvas.height / 2)
            player.y = canvas.height / 2;

        //Nuevo disparo
        if (lastKey == 32) {
            shots.push(new Rectangle(player.x + 13, player.y, 4, 4));
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

        //Mueve los enemigos
        for (i = 0; i < enemies.length; i++) {

            //Busca los disparos que colisionan con un enemigo antes del movimiento
            shotsEnemiesIntersects(i);

            enemies[i].y += 7;

            if (enemies[i].y > canvas.height) {

                enemies[i].x = random(canvas.width / 10) * 10;
                enemies[i].y = 0;
//                enemies[i]
            }

            //Busca los enemigos que chocan con el usuario
            if (player.intersects(enemies[i]) && player.timer < 1) {

                player.health--;
                player.timer = 20;
            }

            if (enemies[i].timer > 0)
                enemies[i].timer--;

            //Busca los disparos que colisionan con un enemigo despues del movimiento
            //shotsEnemiesIntersects(i);
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

    // Acciona y detiene el juego
    if (lastKey == 13) {

        PAUSE = !PAUSE;
        lastKey = null;
    }
}

function shotsEnemiesIntersects(i) {

    //Busca los disparos que colisionan con un enemigo antes del movimiento
    for (j = 0; j < shots.length; j++) {

        if (shots[j].intersects(enemies[i])) {

            //Resta la salud a un enemigo
            enemies[i].health--;

            if (enemies[i].health < 1) {
                
                //Incrementa el puntaje del usuario
                score++;

                //Regenera el enemigo eliminado
                enemies[i].x = random(canvas.width / 10) * 10;
                enemies[i].y = 0;
                enemies[i].type = GetTypeEnemy();
                enemies[i].health = GetEnemiesHealth();

                //Numero inicial de enemigos
                AddEnemies(enemies[i].increment);

                //Cambia el valor de incremento
                enemies[i].increment = GetIncrement();
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

    //Muestra el fondo
    ctx.drawImage(iBackground, 0, bgTimer);
    ctx.drawImage(iBackground, 0, 450 + bgTimer);

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

    //Dibuja el cuerpo del jugador
    if (player.timer % 2 == 0)
        ctx.drawImage(iSpacecraft, player.x, player.y, player.width, player.height);


    //Dibuja los disparos
    ctx.fillStyle = '#f00';
    for (var i = 0, l = shots.length; i < l; i++) {

        ctx.fillRect(shots[i].x, shots[i].y, shots[i].width, shots[i].height);
    }

    //Dibuja los enemigos
    for (i = 0; i < enemies.length; i++) {

        switch (enemies[i].type) {

            case "ship":

                ctx.drawImage(iEnemy1, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);

                break;

            case "asteroid":

                if (enemies[i].timer % 2 == 0) {

                    ctx.drawImage(iEnemy2, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
                }
                else {

                    ctx.drawImage(iEnemy2d, enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height);
                }

                break;
        }
    }

    ctx.fillStyle = '#fff';
    ctx.font = 'bold 18pt Calibri';

    //Dibuja las vida del jugador
    ctx.fillText('Vidas: ' + player.health, 0, 30);

    //Dibuja los puntos del jugador
    ctx.fillText('Puntos: ' + score, 770, 30);

    //Verifica si el juego se encuentra parado
    if (PAUSE) {
        ctx.textAlign = 'center';
        ctx.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }
    else {

        bgTimer++;
        if (bgTimer > 0)
            bgTimer -= 450;

    }
}

//Reinicia los valores
function reset() {

    score = 0;
    player.health = 4;
    player.timer = 0;

    player.x = canvas.width / 2;
    player.y = canvas.height - 10;

    shots.length = 0;
    enemies.length = 0;

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

//Seudo clase para crear los cuadros
function Rectangle(x, y, width, height, type, increment, health) {

    //Indica el numero de objetos que incrementa este objeto
    this.increment = (increment == null) ? 0 : increment;

    this.type = (type == null) ? "user" : type;

    this.x = (x == null) ? 0 : x;

    this.y = (y == null) ? 0 : y;

    this.width = (width == null) ? 0 : width;

    this.height = (height == null) ? this.width : height;

    this.health = (health == null) ? 2 : health;

    this.timer = 0;

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

function onTouchStart(e) {

    for (var i = 0; i < e.changedTouches.length; i++) {

        var touch = e.changedTouches[i];

        //Detecta la posicion en la cual se realizo el contacto
        //Si es de la mitad de la pantalla a la izquierda se muestra el jostick
        if ((leftTouchID < 0) && (touch.clientX < halfWidth)) {

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
        else
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

    switch (random(2)) {

        case 0:

            enemyType = "ship";
            break;

        case 1:

            enemyType = "asteroid";
            break;
    }

    return enemyType;
}

function GetIncrement() {

    return random(2);
}

function AddEnemies(totalEnemies) {

    for (var i = 0; i <= totalEnemies; i++) {

        enemies.push(new Rectangle(random(canvas.width / 10) * 10, 0, 22, 22, GetTypeEnemy(), GetIncrement(), GetEnemiesHealth()));
    }
}

function GetEnemiesHealth() {

    return (random(2) == 0) ? 1 : 2;
}

