//*********************************CONFIGURACION*********************************
//CUERPO
var BODYINCREMENT = 2;

//Velocidad
var SPEEDMIN = 10;
var SPEEDDECREMENT = 5;
var SPEED = 100;
var speed = SPEED;

//Puntos
var POINTS = 15;

//Paredes
var NUMBERWALLS = 35;
var numberWalls = NUMBERWALLS;
var WALLSINCREMENT = 8;

//Frutas
var NUMBERFOOT = 3;
var FOOTINCREMENT = 3;
var numberFoot = NUMBERFOOT;
var numberFootAll = NUMBERFOOT;

//*******************************************************************************

//Agrega una escucha, cuando termina de cargar la pagina se ejecuta la funcion init
window.addEventListener('load', init, false);

var canvas = null;
var ctx = null;

//Represeta los cuadros que controla el jugador
var body = new Array();

//Represeta el cuadro que funciona como comida
var foods = [];

//Guarda los cuadros que funcionan como pared
var wall = new Array();

//Almacena la ultima tecla presionada
var lastKey = null;

//Almacena la direccion del movimiento
var dir = 0;

//Almacena la indicacion si el juego esta en pausa
var PAUSE = true;

//Almacena la indicacion si el juego termino
var GAMEOVER = false;

//Guarda los puntos del usuario
var score = 0;

//Imagen del cuerpo
var iBody = new Image();
iBody.src = 'media/body.png';

//Imagen de la  comida
var iFood = new Image();
iFood.src = 'media/fruit.png';

//Imagen de la  pared(insecto)
var iInsect = new Image();
iInsect.src = 'media/insect.png';

//Sonido al comer
var aEat = new Audio();
aEat.src = 'media/chomp.m4a';

//Sonido al perder
var aDie = new Audio();
aDie.src = 'media/dies.m4a';

function init() {

    //Obtiene el canvas
    canvas = document.getElementById('canvas');

    //Cambia el color de fondo del canvas
    canvas.style.background = '#000';

    //Configura el contexto
    ctx = canvas.getContext('2d');

    //Agrega las paredes
    addWalls();

    //Crea el cuerpo del usuario
    resetBody();

    //Crea la comida
    resetFood();

    //Envia el contexto para pintarlo
    run();
}

function run() {

    //Crea un ciclo cada 50 milisegundos (20 cuadros por segundo)
    setTimeout(run, speed);

    //Configura el juego
    game();

    //Envia el contexto para pintarlo
    paint(ctx);
}

//Reinicia los valores
function reset() {

    alert('Obtuviste ' + score + ' puntos.');

    score = 0;
    dir = 1;

    //Velocidad inicial
    speed = SPEED;

    //Comida inicial
    numberFoot = NUMBERFOOT;
    numberFootAll = NUMBERFOOT;

    //Paredes iniciales
    numberWalls = NUMBERWALLS;

    resetBody();
    resetFood();

    GAMEOVER = false;
    KICKOFF = true;

    addWalls();
}

//Reinicia el cuerpo del usuario
function resetBody() {

    //Posicion inicial del cuadro del jugador
    body.length = 0;                                                                                                            

    body.push(new Rectangle(randomWidth(), randomHeight(), 10, 10));
    body.push(new Rectangle(-10, -10, 10, 10));
    body.push(new Rectangle(-10, -10, 10, 10));
}

function resetFood() {

    //Cambia la posicion de la comida
    foods.length = 0;

    for (var i = 0; i < numberFootAll; i++) {

        foods.push(new Rectangle(randomWidth(), randomHeight(), 10, 10));
    }
}

//Agrega las paredes
function addWalls() {

    //Limpia el array
    wall.length = 0;

    for (var i = 0; i < numberWalls; i++) {

        wall.push(new Rectangle(randomWidth(), randomHeight(), 10, 10));
    }
}

//Obtiene una altura random segun el tamanio del canvas
function randomHeight() {

    return random(canvas.height / 10 - 1) * 10;
}

//Obtiene un ancho random segun el tamanio del canvas
function randomWidth() {

    return random(canvas.width / 10 - 1) * 10;
}

//Crea numeros aleatorios
function random(max) {
    return Math.floor(Math.random() * max);
}

//Configura el juego
function game() {

    //Vetrifica si el juego esta parado
    if (!PAUSE) {

        //Mueve el cuerpo
        for (var i = body.length - 1; i > 0; i--) {

            body[i].x = body[i - 1].x;
            body[i].y = body[i - 1].y;
        }

        // Cambia la direccion del movimiento
        if (lastKey == 38 && dir!=2)
            dir = 0;
        else if (lastKey == 39 && dir != 3)
            dir = 1;
        else if (lastKey == 40 && dir != 0)
            dir = 2;
        else if (lastKey == 37 && dir != 1)
            dir = 3;

        // Mueve el cuadro
        if (dir == 0)
            body[0].y -= 10;
        else if (dir == 1)
            body[0].x += 10;
        else if (dir == 2)
            body[0].y += 10;
        else if (dir == 3)
            body[0].x -= 10;

        // Reinicio de variables cuando el cuadro sale de la pantalla
        if (body[0].x > canvas.width)
            body[0].x = 0;
        else if (body[0].y > canvas.height)
            body[0].y = 0;
        else if (body[0].x < 0)
            body[0].x = canvas.width;
        else if (body[0].y < 0)
            body[0].y = canvas.height;
    }

    //Verifica si el cuadro del jugador toco la comida
    for (var i = 0, l = foods.length; i < l; i++) {

        if (body[0].intersects(foods[i])) {

            numberFoot--;

            //Elimina la fruta actual
            foods.splice(i--, 1);

            //Incrementa los puntos del usuario
            score += POINTS;

            //Aumenta los cuadro al jugador

            for (var j = 0; j < BODYINCREMENT; j++) {

                body.push(new Rectangle(-10, 0, 10, 10));
            }
        }
    }

    //Verifica si ya se comieron todas las frutas del nivel.
    if (numberFoot < 1) {

        //Aumenta las frutas que hay que recolectar
        numberFootAll += FOOTINCREMENT;

        //Reinicia las frutas
        numberFoot = numberFootAll;
       
        //Incrementa las paredes
        numberWalls += WALLSINCREMENT;

        //Cambia las paredes
        addWalls();

        //Reproduce el sonido
        aEat.play();

        //Cambia la velocidad del juego
        if (speed >= SPEEDMIN)
            speed -= SPEEDDECREMENT;

        //Cambia la posicion de la comida
        resetFood();
    }

    //Verifica si existen coliciones con las paredes
    for (var i = 0, l = wall.length; i < l; i++) {

        for (var j = 0; j < foods.length; j++) {

            //Verifica si la comida toca una pared
            if (foods[j].intersects(wall[i])) {

                //Cambia la posicion de la comida
                foods[j].x = randomWidth();
                foods[j].y = randomHeight();
            }
        }

        //Verifica si el cuadro del jugador toco una pared
        if (body[0].intersects(wall[i])) {

            GAMEOVER = true;
            PAUSE = true;
            aDie.play();
        }
    }

    //Verifica si los cuadros chocan entre si
    for (var i = 2, l = body.length; i < l; i++) {

        if (body[0].intersects(body[i])) {

            GAMEOVER = true;
            PAUSE = true;
            aDie.play();
        }
    }

    // Acciona y detiene el juego
    if (lastKey == 13) {

        PAUSE = !PAUSE;
        lastKey = null;
    }
}

//Pinta los elementos dentro de la etiqueta canvas
function paint(ctx) {

    //Limpia el contexto
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    //Dibuja el cuerpo del jugador
    ctx.fillStyle = '#0f0';
    for (var i = 0, l = body.length; i < l; i++) {

        //Agrega la imagen
        ctx.drawImage(iBody, body[i].x, body[i].y);
    }

    //Dibuja la comida
    ctx.fillStyle = '#f00';

    for (var i = 0; i < foods.length; i++) {
        ctx.drawImage(iFood, foods[i].x, foods[i].y);
    }

    

    //Dibuja los puntos del usuario
    ctx.fillStyle = '#fff';
    ctx.fillText('Puntos: ' + score, 0, 10);

    //Dibuja los cuadros pared
    ctx.fillStyle = '#999';
    for (var i = 0, l = wall.length; i < l; i++) {

        ctx.drawImage(iInsect, wall[i].x, wall[i].y);
    }

    //Verifica si el juego se encuentra parado
    if (PAUSE) {

        ctx.textAlign = 'center';

        //Verifica que etiqueta mostrar
        if (GAMEOVER) {
            ctx.fillText('GAME OVER', canvas.width / 2, canvas.height /2);
            reset();
        }
        else
            ctx.fillText('PAUSE', canvas.width / 2, canvas.height / 2);

        ctx.textAlign = 'left';
    }
}


//Agrega una escucha, se presiona una tecla
document.addEventListener('keydown', function (evt) {
    lastKey = evt.keyCode;
}, false);


//Seudo clase para crear los cuadros
function Rectangle(x, y, width, height) {

    this.x = (x == null) ? 0 : x;

    this.y = (y == null) ? 0 : y;

    this.width = (width == null) ? 0 : width;

    this.height = (height == null) ? this.width : height;

    this.intersects = function (rect) {

        //Verific si el cuadro con el que se coliciono es diferente de nulo
        if (rect != null) {

            //Indica si se cumple la regla de colicion
            return (this.x < rect.x + rect.width &&
                    this.x + this.width > rect.x &&
                    this.y < rect.y + rect.height &&
                    this.y + this.height > rect.y);
        }
    }
}