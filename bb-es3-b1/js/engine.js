var $engine = {

    //Verifica si el archivo de configuracion es valido
    CheckConfiguration: function () {

        var words, word, isCorrect = true;

        for (var i = 1; i <= 3; i++) {

            words = $configuration["WordsLevel" + i].split(",");

            for (var j = 0; j < words.length; j++) {

                word = words[j];

                if (word.length != i + 3) {

                    alert("ATENCION: La palabra [" + word + "] del nivel " + i + " debe ser de " + (i + 3) + " caracteres de longitud.");
                    isCorrect &= false;
                }
            }
        }

        words = word = null;

        return isCorrect;
    },

    //Configura la apacion de las letras en el laberinto
    ConfigureWord: function (Words, Width, High, Level) {

        var words = Words.split(","),
            index = $utils.Random(1, words.length),
            word = words[index - 1],
            letters = [],
            order = $utils.GetRandomNumbers(word.length),
            axis;

        switch (Level) {

            case 1:

                axis = [
                    { x: 37, y: 32 },
                    { x: 673, y: 76 },
                    { x: 37, y: 352 },
                    { x: 725, y: 352 }
                ];

                break;

            case 2:

                axis = [
                    { x: 213, y: 76 },
                    { x: 445, y: 168 },
                    { x: 581, y: 260 },
                    { x: 37, y: 216 },
                    { x: 725, y: 32 }
                ];

                break;

            case 3:

                axis = [
                    { x: 37, y: 32 },
                    { x: 483, y: 76 },
                    { x: 313, y: 308 },
                    { x: 81, y: 308 },
                    { x: 677, y: 80 },
                    { x: 677, y: 304 }
                ];

                break;
        }


        for (var i = 0; i < word.length; i++) {

            var a = axis[order[i]];

            letters.push(new $utils.Rectangle(a.x, a.y, Width, High, word.charAt(i), i));
        }

        words = index = word = order = axis;

        return letters;
    },

    //Cambia la direccion sobre el camino de los rivales.
    ChangeWay: function (CurrentWay, Rival, Way, Ways) {

        CurrentWay++;

        Rival[Way.Axis] += Way.Multiplier * -1;

        if (CurrentWay >= Ways.length)
            CurrentWay = 0;

        Way = Ways[CurrentWay];

        return {

            CurrentWay: CurrentWay,
            Rival: Rival,
            Way: Way
        };
    },

    //Configura la ruta que tendra un rival.
    GetWay: function (Way) {

        var movements = Way.split(","),
            way = [],
            movement;

        for (var i = 0; i < movements.length; i++) {

            movement = movements[i].split("|");

            if (movement.length == 2)
                way.push({
                    Movement: movement[0],
                    Axis: (movement[0] == "r" || movement[0] == "l" ? "x" : "y"),
                    Multiplier: (movement[0] == "u" || movement[0] == "l" ? -1 : 1),
                    Coordinates: movement[1]
                });
            else
                way.push({
                    Movement: movements[i],
                    Axis: (movements[i] == "r" || movements[i] == "l" ? "x" : "y"),
                    Multiplier: (movements[i] == "u" || movements[i] == "l" ? -1 : 1)
                });
        }

        movements = movement = null;

        return way;
    },

    //Indica si se presiono una tecla con funcionalidad en la aplicacion
    IsKey: function (Allocator, Key) {

        return Allocator.Controls.Pressing[$utils.Constants[Key]];
    },

    //Mueve al jugador
    Move: function (Type, x, y, Settings, Allocator, JoystickId) {

        var AxisX, AxisY;

        for (var i = 37; i <= 40; i++)
            Allocator.Controls.Pressing[i] = false;

        switch (Type) {

            case "down":

                if (x > 56 && x < 139 && y > 438 && y < 550)
                    ChangePlayer();
                else {

                    Allocator.Controls.X = x;
                    Allocator.Controls.Y = y;
                    Allocator.Controls.X2 = Allocator.Controls.X;
                    Allocator.Controls.Y2 = Allocator.Controls.Y;

                    Allocator.Controls.JoystickId = JoystickId;
                    Allocator.Controls.MousePush = true;
                }

                break;

            case "move":

                if (Allocator.Controls.MousePush) {

                    if (JoystickId != undefined) {

                        if (x > Allocator.Controls.X + 50)
                            x = Allocator.Controls.X + 50;
                        else if (x < Allocator.Controls.X - 50)
                            x = Allocator.Controls.X - 50;

                        if (y >= Allocator.Controls.Y + 50)
                            y = Allocator.Controls.Y + 50;
                        else if (y < Allocator.Controls.Y - 50)
                            y = Allocator.Controls.Y - 50;

                        AxisX = x > Allocator.Controls.X ? 39 : 37;
                        AxisY = y > Allocator.Controls.Y ? 40 : 38;
                    }
                    else {

                        AxisX = x > Allocator.Player.Body.x + 20 ? 39 : 37;
                        AxisY = y > Allocator.Player.Body.y + 20 ? 40 : 38;
                    }

                    Allocator.Controls.LastPress = AxisX;
                    Allocator.Controls.Pressing[AxisX] = true;

                    Allocator.Controls.LastPress = AxisY;
                    Allocator.Controls.Pressing[AxisY] = true;

                    Allocator.Controls.X2 = x;
                    Allocator.Controls.Y2 = y;
                }

                break;

            case "up":

                Allocator.Controls.JoystickId = -1;
                Allocator.Controls.MousePush = false;

                break;
        }

        AxisX = AxisY = null;
    },


    //Mueve los rivales.
    MoveEnemies: function (Allocator, Settings) {

        var $rivals = Allocator.Enemies["Rivals" + Allocator.Environment.Level],
                    $blocks = Allocator.Walls.Blocks,
                    $currentWays = Allocator.Enemies.CurrentWays,
                    $ways,
                    $rival,
                    $block,
                    $currentWay,
                    $way,
                    $nextWay,
                    $deviation = false,
                    $obj;

        for (var i = 0; i < $rivals.length; i++) {
            $rival = $rivals[i];

            if ($rival.IsCollision(Allocator.Player.Body)) {

                $Global.GameOver = true;

                Allocator.Player.ShowCage = true;

                $Global.Interval = setInterval(function () {

                    $Global.GameOver = false;

                    $engine.Reset(Allocator, Settings);
                    clearInterval($Global.Interval);
                }, 3000);
            }

            $currentWay = $currentWays[i];
            $ways = Allocator.Enemies["Ways" + Allocator.Environment.Level][i],
            $way = $ways[$currentWay];
            $nextWay = $ways[$currentWay + 1];

            if ($nextWay == undefined)
                $nextWay = $ways[0]

            if ($nextWay.Coordinates != undefined) {
                if ($way.Movement == "l" && $rival.x <= $nextWay.Coordinates)
                    $deviation = true;
                else if ($way.Movement == "r" && $rival.x >= $nextWay.Coordinates)
                    $deviation = true;
                else if ($way.Movement == "u" && $rival.y <= $nextWay.Coordinates)
                    $deviation = true;
                else if ($way.Movement == "d" && $rival.y >= $nextWay.Coordinates)
                    $deviation = true;
            }

            if ($deviation) {

                $obj = $engine.ChangeWay($currentWay, $rival, $way, $ways);

                $currentWay = $obj.CurrentWay;
                $currentWays[i] = $currentWay;
                $rival = $obj.Rival;
                $way = $obj.Way;

                $deviation = false;
            }
            else {

                for (var j = 0; j < $blocks.length; j++) {

                    $block = $blocks[j];

                    if ($rival.IsCollision($block)) {

                        $obj = $engine.ChangeWay($currentWay, $rival, $way, $ways);

                        $currentWay = $obj.CurrentWay;
                        $currentWays[i] = $currentWay;
                        $rival = $obj.Rival;
                        $way = $obj.Way;

                        break;
                    }
                }
            }

            $rivals[i][$way.Axis] += $way.Multiplier;
        }

        $rivals = $blocks = $currentWays = $ways = $rival = $block = $currentWay = $way = $obj = null;
    },

//Mueve aljugador.
MovePlayer: function (Allocator, Px) {

    var letter,
        touched;

    $utils.keys.forEach(function (key) {

        if ($engine.IsKey(Allocator, key.Key)) {

            Allocator.Player.Body[key.Axis] += Px * key.Multiplier;

            for (var i = 0; i < Allocator.Walls.Blocks.length; i++) {

                if (Allocator.Player.Body.IsCollision(Allocator.Walls.Blocks[i]))
                    Allocator.Player.Body[key.Axis] -= Px * key.Multiplier;
            }

            for (var i = 0; i < Allocator.Words.Letters.length; i++) {

                letter = Allocator.Words.Letters[i];

                if (Allocator.Player.Body.IsCollision(letter) && letter.touched == 0) {

                    touched = Allocator.Words.TouchNumber;

                    if (Allocator.Words.TouchNumber == letter.order) {

                        letter.touched = 1;
                        Allocator.Words.TouchNumber++;

                        if (Allocator.Words.TouchNumber == Allocator.Words.Letters.length) {

                            if ($Global.Level == 1) {

                                Allocator.Player.ShowNextLevel = true;
                                $Global.Level = 2
                                $Global.Pause = true;

                            } else if ($Global.Level == 2) {

                                Allocator.Player.ShowNextLevel = true;
                                $Global.Level = 3;
                                $Global.Pause = true;

                            } else {

                                $Global.Pause = true;
                                Allocator.Player.ShowEnd = true;
                                $Global.Level = 1;
                            }

                            if ($Global.Level == 2 || $Global.Level == 3) {

                                $Global.Interval = setInterval(function () {

                                    $Global.Pause = false;
                                    $engine.Reset(Allocator, null);
                                    clearInterval($Global.Interval);

                                }, 3000);
                            }
                            else {

                                $Global.Interval = setInterval(function () {

                                    ChangePlayer(true);
                                    clearInterval($Global.Interval);
                                }, 3000);
                            }
                        } else
                            $engine.ShowToolTip(Allocator, "               ¡Muybien!", "     la letra [" + letter.type + "] ha sido liberada.");
                    }
                    else
                        $engine.ShowToolTip(Allocator, "   ¡Inténtalo nuevamente!", "Debes liberar otra letra primero.");
                }
            }
        }
    });

    letter = touched = null;
},

Reset: function (Allocator, Settings) {

    $engine.CheckConfiguration();

    Allocator.Images = $utils.GetImages($configuration.Images);

    Allocator.Environment = {

        Level: $Global.Level,
        ToolTips: {

            Initial: 70,
            Timer: 70,
            Show: false,
            LabelUp: "",
            LabelDown: ""
        }
    };

    Allocator.Walls = {

        Blocks: $utils.SetMap($mazes["Level" + (Allocator.Environment.Level - 1)], $mazes.NumberOfVerticalBlocks, 4, 32, 27)
    };

    Allocator.Player = {

        Body: new $utils.Rectangle(269, 168, 38, 38),
        Number: $Global.Player,
        Direction: "d",
        ShowCage: false,
        ShowNextLevel: false,
        ShowEnd: false
    };

    if ($Global.Level == 2) {

        Allocator.Player.Body.x = 261;
        Allocator.Player.Body.y = 160;
    }

    Allocator.Enemies = {

        Rivals1: [new $utils.Rectangle(401, 32, 38, 38, 3),
                  new $utils.Rectangle(81, 352, 38, 38, 0),
                  new $utils.Rectangle(397, 304, 38, 38, 2)],

        Rivals2: [new $utils.Rectangle(37, 32, 38, 38, 0),
                  new $utils.Rectangle(37, 348, 38, 38, 3),
                  new $utils.Rectangle(725, 32, 38, 38, 2),
                  new $utils.Rectangle(725, 348, 38, 38, 1)],

        Rivals3: [new $utils.Rectangle(403, 31, 38, 38, 3),
                 new $utils.Rectangle(725, 32, 38, 38, 0),
                 new $utils.Rectangle(80, 351, 38, 38, 1),
                 new $utils.Rectangle(450, 260, 38, 38, 2)],

        CurrentWays: [0, 0, 0, 0],

        Ways1: [
                    $engine.GetWay("l,r,d,r,u,r,d,r,u,l,d,l|76,d,l,d,r,d,l,d,l,u|353,r|168,u|397"),
                    $engine.GetWay("u,r,d,r,l,u,l,d,l|304,u,r,d,r|216,u,r,u|353,l,u,r,l,d,r,d|125,l,d,r,d"),
                    $engine.GetWay("r,l,d,r,l,u,l,d,l,u|217,r,u,r,d,l,d,r,d,l")
        ],

        Ways2: [
                    $engine.GetWay("d,u,r,d,u,l"),
                    $engine.GetWay("u,r,u,l,u,d,r,d,l,d,r,u,r,l,d,l"),
                    $engine.GetWay("l,d,l,u,d,r,u,r,d,l,r,u"),
                    $engine.GetWay("u,d,l,u,l,d,l,u,l,d,l,u,l,d,l,u|397,r,d,u,l,d,r|216,u|533,r|168,u,r,d,r,u,l,d,l,r,u,r,d")
        ],

        Ways3: [
                    $engine.GetWay("l,d|357,l,d,l,u,l,u,r,l,d,r,d|217,r,d,l,u,r,d,r,u,l,u,l|168,d,u,r,d,r,d,l,u,l,d,r,u|269,l,u,r,d,r,u,r|124,u,l,d,r,d,l,d|129,u,l|168,d,l,u,r,d,r,u,l,u,r,d,r,u,d,l,u"),
                    $engine.GetWay("l,d,l,u,l,d|357,l,u,d,l,u,l,u,r,l,d,r,d|217,r,d,l,r,u,r,d,r,u,r,u,l,u,r,d,l,r,u"),
                    $engine.GetWay("r,u,r,l,d|402,r,u,r,d,l,d,r,u,l,u,l,d,l,u|586,d,u,r,u,r,d,l,u,l,d,l,d,r,l,u,r,u|586,r,u,l,d,l,u,l,d|357,l,d,l,u,l,d|217,r,d,l"),
                    $engine.GetWay("r,d,l,d,r,u,l,u,r|208,u,l,d,l,u,l,d,r,d,l,u,l,d,r,u,r,d,r,d,l,u,l,d,u,r,d,r,u,l,u,r,u,l,u,d,r,l,u,r,d,r,u,r|76,d,l,d,l,u,l,d|401,r,u")
        ]
    };

    Allocator.Words = {

        TouchNumber: 0,
        Letters: $engine.ConfigureWord($configuration["WordsLevel" + Allocator.Environment.Level].toLowerCase(), 40, 40, Allocator.Environment.Level)
    };

    Allocator.Controls = {

        LastPress: null,
        Pressing: [],
        MousePush: false,
        X: 0,
        Y: 0,
        X2: 0,
        Y2: 0,
        JoystickId: -1
    };
},

//Muestra los tooltips.
ShowToolTip: function (Allocator, Message1, Message2) {

    Allocator.Environment.ToolTips.Show = true;

    Allocator.Environment.ToolTips.LabelUp = Message1;
    Allocator.Environment.ToolTips.LabelDown = Message2;
},

ToolTip: function (Allocator) {

    if (Allocator.Environment.ToolTips.Show) {

        if (Allocator.Environment.ToolTips.Timer > 0)
            Allocator.Environment.ToolTips.Timer -= 1;
        else {

            Allocator.Environment.ToolTips.Timer = Allocator.Environment.ToolTips.Initial;
            Allocator.Environment.ToolTips.Show = false;
        }
    }
}
};