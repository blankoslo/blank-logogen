var colors = {
    'red': {
        'primary': '#f8485e',
        'secondary': '#e12b38'
    },

    'blue': {
        'primary': '#59cbe8',
        'secondary': '#009ed9'
    },

    'yellow': {
        'primary': '#fdd757',
        'secondary': '#ffbf3f'
    }
};

function hash(string) {
    var hash = 0;
    if (string.length == 0 || typeof(string) !== 'string') {
        return hash;
    }

    for (var i = 0; i < string.length; i++) {
        var chr = string.charCodeAt(i);
        hash = ((hash<<5)-hash) + chr;
        hash = hash & hash; // Convert to 32bit
    }

    return hash;
};

function PRNG(seed) {
    this.seed = seed;
    this.take = () => {
        var x = Math.sin(this.seed++) * 10000;
        return x - Math.floor(x);
    }
}

var Config = function() {
    this.color = colors.red;
    this.top = {
        'x': 166.4,
        'y': 57.6
    };

    this.middleTop = {
        'x': 140.8
    };

    this.middleBottom = {
        'x': 160.0
    };

    this.bottom = {
        'x': 108.8,
        'y': 262.4
    };

    this.setColor = function(color) {
        if (color && colors[color]) {
            this.color = colors[color];
        }
    };

    this.setShapeFromString = function(string) {
        var rng = new PRNG(hash(string));

        this.top.x = 64 + rng.take() * 128;
        this.top.y = rng.take() * (128 - 32);

        this.middleTop.x = 64 + rng.take() * 128;
        this.middleBottom.x = 64 + rng.take() * 128;

        this.bottom.x = 64 + rng.take() * 128;
        this.bottom.y = 128 + 64 + 32 + rng.take() * (128 - 32);
    };
};

module.exports = Config;
