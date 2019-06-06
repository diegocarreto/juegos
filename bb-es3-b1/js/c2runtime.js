document.write("<script type='text/javascript' src='js/jquery-g5-1.0.0.js'></script>" +
               "<script type='text/javascript' src='js/jquery-g5-utils-1.0.0.js'></script>" +
               "<script type='text/javascript' src='js/mazes.js'></script>" +
               "<script type='text/javascript' src='js/engine.js'></script>" +
               "<script type='text/javascript' src='js/configuration.js'></script>");

'use strict';

var $Global = {

    Player: null,
    Interval: null,
    Level: 1,
    Pause: true,
    GameOver: false
};

function InitGame(Player, Init) {
    $Global.Player = Player;

    if (Init === "true")
        GameStart();

    $Global.Interval = setInterval(function () {

        $Global.Pause = false;
        clearInterval($Global.Interval);
    }, 1500);

    Player = Init = null;
}

function ChangePlayer(Init) {

    if (Init == undefined)
        Init = false;

    $Global.Pause = true;
    showmeChar("#c2canvas", '.modalWindow', false);
}

function GameStart() {

    $('#c2canvas').G5({
        pathImages: "media/images",
        start: function (Allocator) {

            $engine.Reset(Allocator, null);
        },
        onKeyDown: function (Key, Keys, Allocator) {

            Allocator.Controls.LastPress = Key;
            Allocator.Controls.Pressing = Keys;
        },
        onKeyUp: function (Key, Keys, Allocator) {

            Allocator.Controls.Pressing[Key] = false;
        },
        onTouch: function (Type, Touches, Settings, Allocator) {

            var touch;

            for (var i = 0; i < Touches.length; i++) {
                
                touch = Touches[i];

                if (Type == "down" && Allocator.Controls.JoystickId == -1)
                    break;
                else if (Type == "move" && Allocator.Controls.JoystickId == touch.identifier)
                    break;
                else if (Type == "up" && Allocator.Controls.JoystickId == touch.identifier)
                    break;
            }

            $engine.Move(Type, touch.clientX, touch.clientY, Settings, Allocator, touch.identifier);
            
            touch = null;

        },
        onMouse: function (Type, x, y, Settings, Allocator) {

            $engine.Move(Type, x, y, Settings, Allocator);
        },
        run: function (player, Settings, Allocator) {

            if (!$Global.GameOver && !$Global.Pause) {

                Allocator.Player.Number = $Global.Player;

                $engine.MovePlayer(Allocator, 2);
                $engine.MoveEnemies(Allocator, Settings);
                $engine.ToolTip(Allocator);
            }
        },
        paint: function (ctx, Settings, Allocator) {

            var rival,
                letters,
                letter,
                letterName;

            ctx.Img("Space");

            if ($configuration.debug)
                ctx.Txt("Player: x=" + Allocator.Player.Body.x + " y=" + Allocator.Player.Body.y, 33, 20, "#fff", "24px Times New Roman");

            ctx.Img("Planet", 0, 395);

            ctx.Img("Face" + Allocator.Player.Number, 43, 430, 90, 90);

            ctx.Img("Menu", 36, 475, 105, 80);

            ctx.Img("Nivel", 323, 390, 173, 76);

            ctx.Img(Allocator.Environment.Level, 465, 390, 61, 76);

            ctx.Img("Palabra", 383, 466, 173, 76);

            for (var i = 0; i < Allocator.Walls.Blocks.length; i++)
                Allocator.Walls.Blocks[i].Draw(ctx, '#fff');

            letters = Allocator.Words.Letters.sort($utils.DynamicSort("order"));

            for (var i = 0; i < letters.length; i++) {
                letter = letters[i];

                if (letter.touched == 0) {

                    letter.Img(ctx, letter.type);
                    ctx.Img("Cage", letter.x, letter.y, 42, 44);
                }

                letterName = letter.type;

                if (letter.touched == 0)
                    letterName += "1";

                ctx.Img(letterName, (568 + (30 * i)), 476, 40, 40);
            }

            Allocator.Player.Body.Img(ctx, "Player" + Allocator.Player.Number + Allocator.Player.Direction);

            for (var i = 0; i < Allocator.Enemies["Rivals" + Allocator.Environment.Level].length; i++) {
                var rival = Allocator.Enemies["Rivals" + Allocator.Environment.Level][i];

                rival.Img(ctx, "Enemy" + rival.type);
            }

            if (Allocator.Environment.ToolTips.Show) {

                ctx.Img("Box", Allocator.Player.Body.x + 40, Allocator.Player.Body.y - 28);
                ctx.Txt(Allocator.Environment.ToolTips.LabelUp, Allocator.Player.Body.x + 75, Allocator.Player.Body.y - 5, "#fff", "16px Arial");
                ctx.Txt(Allocator.Environment.ToolTips.LabelDown, Allocator.Player.Body.x + 60, Allocator.Player.Body.y + 10, "#fff", "16px Arial");
            }

            if (Allocator.Player.ShowCage) {
                ctx.Img("Cage", Allocator.Player.Body.x, Allocator.Player.Body.y, 42, 44);
                ctx.Img("GameOver");
            }

            if (Allocator.Player.ShowNextLevel)
                ctx.Img("NextLevel");

            if (Allocator.Player.ShowEnd)
                ctx.Img("End");

            if (Allocator.Controls.JoystickId != -1 && Allocator.Controls.JoystickId != undefined)
            {
                ctx.Img("joystick1", Allocator.Controls.X - 215, Allocator.Controls.Y - 160, 200, 200);
                ctx.Img("joystick2", Allocator.Controls.X2 - 164, Allocator.Controls.Y2 - 110, 100, 100);
            }

            rival = letters = letter = letterName = null;
        }
    });
}

