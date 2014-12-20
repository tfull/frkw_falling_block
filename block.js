function Block(b, t, k){
    this.data = b;
    this.kind = k
    this.type = t;
    this.height = b.length;
    this.width = b[0].length;
    this.x = undefined;
    this.y = undefined;
}

Block.prototype.rotate = function(){
    var tmp = [];

    for(var i = 0; i < this.width; i++){
        tmp[i] = [];
        for(var j = 0; j < this.height; j++){
            tmp[i][j] = this.data[this.height - (j + 1)][i];
        }
    }

    this.data = tmp;
    tmp = this.height;
    this.height = this.width;
    this.width = tmp;
}

Block.prototype.inverse = function(){
    var tmp = [];

    for(var i = 0; i < this.width; i++){
        tmp[i] = [];
        for(var j = 0; j < this.height; j++){
            tmp[i][j] = this.data[j][this.width - (i + 1)];
        }
    }

    this.data = tmp;
    tmp = this.height;
    this.height = this.width;
    this.width = tmp;
}

var NormalBlock = (function(){
    var _o = [[1,1],[1,1]];
    var _i = [[0,0,0,0],[1,1,1,1],[0,0,0,0],[0,0,0,0]];
    var _s = [[0,0,0],[0,1,1],[1,1,0]];
    var _z = [[0,0,0],[1,1,0],[0,1,1]];
    var _j = [[1,0,0],[1,1,1],[0,0,0]];
    var _l = [[0,0,1],[1,1,1],[0,0,0]];
    var _t = [[0,1,0],[1,1,1],[0,0,0]];

    var _nextBlock = function(){
        var kind = Math.floor(Math.random() * 7);
        var tmp = [_o, _i, _s, _z, _j, _l, _t][kind];
        var b = [];

        for(var i = 0; i < tmp.length; i++){
            b[i] = [];
            for(var j = 0; j < tmp[i].length; j++){
                b[i][j] = tmp[i][j] * (kind + 1);
            }
        }
        return new Block(b, 0, 0);
    }

    return { nextBlock: _nextBlock };
})();

var BigBlock = (function(){
    var _f = [[0,0,0,1,0,0,0],[1,1,1,1,1,1,1],[0,0,0,1,0,0,0],[0,1,1,1,1,1,0],[0,1,0,0,0,1,0],[0,1,0,0,0,1,0],[0,1,1,1,1,1,0]];
    var _k = [[0,0,0,0,0,0,0,0],[0,1,0,0,0,0,0,1],[0,1,0,0,1,0,0,1],[0,1,0,0,1,0,0,1],[0,1,0,0,1,0,0,1],[1,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,1],[0,0,0,0,0,0,0,1]];

    var _nextBlock = function(){
        var kind = Math.floor(Math.random() * 2);
        var c = Math.floor(Math.random() * 7) + 1;
        var tmp = [_f, _k][kind];
        var b = [];

        for(var i = 0; i < tmp.length; i++){
            b[i] = [];
            for(var j = 0; j < tmp[i].length; j++){
                b[i][j] = tmp[i][j] * c;
            }
        }
        return new Block(b, 0, 0);
    }

    return { nextBlock: _nextBlock };
})();

var HelpBlock = (function(){
    var _d = [[1]];
    var _i = [[1,0],[1,0]];
    var _o = [[1,1],[1,1]];

    var _nextBlock = function(){
        var kind = Math.floor(Math.random() * 3);
        var tmp = [_d, _i, _o][kind];
        var b = [];

        for(var i = 0; i < tmp.length; i++){
            b[i] = [];
            for(var j = 0; j < tmp[i].length; j++){
                b[i][j] = tmp[i][j] * 8;
            }
        }
        return new Block(b, 1, kind + 1);
    }

    return { nextBlock: _nextBlock };
})();
