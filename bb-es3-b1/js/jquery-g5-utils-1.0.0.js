var $utils = new Object();


//Obtiene una matriz de numeros consecutivos ordenados aleatoriamente.
$utils.GetRandomNumbers = function (Max) {

    var numbers = [],
        result = [],
        index;
            
    for(var i = 0;i < Max; i++)
        numbers.push(i);

    do {

        index = Math.floor(Math.random()*(numbers.length));

        result.push(numbers[index]);

        $utils.RemoveItemArray(numbers,numbers[index]);
    }
    while (numbers.length > 0);

    return result; 
},

$utils.Constants = {

    KEY_LEFT: 37,
    KEY_UP: 38,
    KEY_RIGHT: 39,
    KEY_DOWN: 40
};

$utils.CreateKey = function (Axis, Key, Multiplier) {

    return { Axis: Axis, Key: Key, Multiplier: Multiplier };
};

$utils.keys = [$utils.CreateKey("y", "KEY_UP", -1),
               $utils.CreateKey("y", "KEY_DOWN", 1),
               $utils.CreateKey("x", "KEY_LEFT", -1),
               $utils.CreateKey("x", "KEY_RIGHT", 1)];

$utils.Random = function (Min, Max) {

    return Math.floor(Math.random() * Max) + Min;
};

$utils.GetImages = function (Images) {

    var img = Images.split(","),
                json = "{";

    for (var i = 0; i < img.length; i++)
        json += '"' + img[i] + '":"' + img[i] + '.png",'

    return JSON.parse(json.substring(0, json.length - 1) + "}");
}

$utils.Rectangle = function (x, y, width, height,type, order, touched) {

    this.x = (x == null) ? 0 : x;
    this.y = (y == null) ? 0 : y;
    this.width = (width == null) ? 0 : width;
    this.height = (height == null) ? this.width : height;
    this.type = (type == null) ? 0 : type;
    this.touched = (touched == null) ? 0 : touched;
    this.order = (order == null) ? 0 : order;

    this.Draw = function (Ctx, Color) {

        Ctx.Rect(Color, this.x, this.y, this.width, this.height);
    };

    this.Img = function (Ctx, Img) {

        Ctx.Img(Img, this.x, this.y, this.width, this.height);
    };

    this.IsCollision = function (rect) {

        if (rect != null) {

            return (this.x < rect.x + rect.width &&
                this.x + this.width > rect.x &&
                this.y < rect.y + rect.height &&
                this.y + this.height > rect.y);
        }
        else
            alert("Null");
    }
};

$utils.RemoveItemArray = function (arr, item) {

    var removeCounter = 0;

    for (var index = 0; index < arr.length; index++) {
        if (arr[index] === item) {
            arr.splice(index, 1);
            removeCounter++;
            index--;
        }
    }

    return removeCounter;
}

$utils.DynamicSort = function (property) {
    var sortOrder = 1;

    if (property[0] === "-") {
        sortOrder = -1;
        property = property.substr(1);
    }

    return function (a, b) {

        var result = (a[property] < b[property]) ? -1 : (a[property] > b[property]) ? 1 : 0;

        return result * sortOrder;
    }
};

$utils.SetMap = function (map, columns, blockSize, InitialAaxisX, InitialAaxisY) {

    var col = 0;
    var row = 0;

    var Pared = [];

    for (var i = 0; i < map.length; i++) {

        if (map[i] === '1')
            Pared.push(new $utils.Rectangle((col * blockSize) + InitialAaxisX, (row * blockSize) + InitialAaxisY, blockSize, blockSize));

        col++;

        if (col >= columns) {
            row++;
            col = 0;
        }
    }

    return Pared;
};