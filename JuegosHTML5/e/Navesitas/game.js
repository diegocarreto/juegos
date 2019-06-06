//*********************************CONFIGURACION*********************************

//Velocidad
var SPEED = 50;
var speed = SPEED;


//*******************************************************************************

//Agrega una escucha, cuando termina de cargar la pagina se ejecuta la funcion init
window.addEventListener('load', init, false);

var canvas = null;
var ctx = null;

var x = 50;
var y = 50;

//Almacena la ultima tecla presionada
var lastKey = null;

//Almacena la indicacion si el juego esta en pausa
var PAUSE = true;

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

//Representa la salud del usuario
var health = 3;

//Representa el danio del usuario
var damaged = 0;

function init() {

    //Obtiene el canvas
    canvas = document.getElementById('canvas');

    //Cambia el color de fondo del canvas
    canvas.style.background = '#000';

    //Configura el contexto
    ctx = canvas.getContext('2d');

    //Represeta el cuadro que controla el jugador
    player = new Rectangle(canvas.width / 2, canvas.height - 10, 10, 10);

    //Envia el contexto para pintarlo
    run();
}

function run() {

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

        if (PRESSING[39]) //Derecha
            player.x += 10;
        if (PRESSING[37]) //Izquierda
            player.x -= 10;
        if (PRESSING[38]) //Arriba
            player.y -= 10;
        if (PRESSING[40]) //Abajo
            player.y += 10;

        // Impide que el usuario salga de la pantala
        if (player.x > canvas.width - player.width)
            player.x = canvas.width - player.width;

        if (player.x < 0)
            player.x = 0;

        if (player.y > canvas.height - player.height)
            player.y = canvas.height  - player.height;

        if (player.y < canvas.height / 2)
            player.y = canvas.height / 2;

        //Nuevo disparo
        if (lastKey == 32) {
            shots.push(new Rectangle(player.x + 3, player.y, 4, 4));
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

            enemies[i].y += 10;

            if (enemies[i].y > canvas.height) {

                enemies[i].x = random(canvas.width / 10) * 10;
                enemies[i].y = 0;
            }

            // Busca los enemigos que chocan con el usuario
            if (player.intersects(enemies[i]) && damaged < 1) {

                health--;
                damaged = 20;
                //GAMEOVER = true;
                //PAUSE = true;
            }

            //Busca los disparos que colisionan con un enemigo antes del movimiento
            shotsEnemiesIntersects(i);
        }
    }

    //Idnetifica si el usuario ya perdio todas sus vidas
    if (health < 1) {

        GAMEOVER = true;
        PAUSE = true;
    }

    //Disminuye el contador de inmunidad del usuario
    if (damaged > 0) {

        damaged--;
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

            //Incrementa el puntaje del usuario
            score++;

            //Crea un nuevo enemigo
            enemies[i].x = random(canvas.width / 10) * 10;
            enemies[i].y = 0;

            //Agrega un nuevo enemigo
            enemies.push(new Rectangle(random(canvas.width / 10) * 10, 0, 10, 10));
            shots.splice(j--, 1);
        }
    }
}

//Pinta los elementos dentro de la etiqueta canvas
function paint(ctx) {

    //Limpia el contexto
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Dibuja el cuerpo del jugador
    ctx.fillStyle = '#0f0';

    if (damaged % 2 == 0)
        ctx.fillRect(player.x, player.y, player.width, player.height);

    //Dibuja los disparos
    ctx.fillStyle = '#f00';
    for (var i = 0, l = shots.length; i < l; i++) {

        ctx.fillRect(shots[i].x, shots[i].y, shots[i].width, shots[i].height);
    }

    //Dibuja los enemigos
    ctx.fillStyle = '#00f';
    for (i = 0; i < enemies.length; i++) {

        ctx.fillRect(enemies[i].x, enemies[i].y, enemies[i].width, enemies[i].height)
    }

    //Dibuja los puntos del usuario
    ctx.fillStyle = '#fff';
    ctx.fillText('Puntos: ' + score, 0, 25);

    //Dibuja la vida del usuario
    ctx.fillText('Vidas: ' + health, 0, 10);

    //Verifica si el juego se encuentra parado
    if (PAUSE) {
        ctx.textAlign = 'center';
        ctx.fillText('PAUSE', canvas.width / 2, canvas.height / 2);
        ctx.textAlign = 'left';
    }
}

//Reinicia los valores
function reset() {

    score = 0;
    health = 3;
    damaged = 0;

    player.x = canvas.width / 2;
    player.y = canvas.height - 10;

    shots.length = 0;
    enemies.length = 0;

    enemies.push(new Rectangle(10, 0, 10, 10));

    GAMEOVER = false;
}

//Agrega una escucha, se presiona una tecla
document.addEventListener('keydown', function (evt) {

    lastKey = evt.keyCode;
    PRESSING[evt.keyCode] = true;
}, false);

//Elimina una escucha, se suelta una tecla
document.addEventListener('keyup', function (evt) {

    PRESSING[evt.keyCode] = false;
}, false);

//Crea numeros aleatorios
function random(max) {
    return ~ ~(Math.random() * max);
}

//Seudo clase para crear los cuadros
function Rectangle(x, y, width, height) {

    this.x = (x == null) ? 0 : x;

    this.y = (y == null) ? 0 : y;

    this.width = (width == null) ? 0 : width;

    this.height = (height == null) ? this.width : height;

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