var GameScene = (function(){
    function makeLabel(s, x, y, c){
        var label = new Label(s);
        label.x = x;
        label.y = y;
        label.color = c;
        return label;
    }

    function makeSprite(w, h, x, y, img){
        var sprite = new Sprite(w, h);
        sprite.x = x;
        sprite.y = y;
        sprite.image = img;
        return sprite;
    }

    function makeSpriteB(w, h, x, y, c){
        var sprite = new Sprite(w, h);
        sprite.x = x;
        sprite.y = y;
        sprite.backgroundColor = c;
        return sprite;
    }

    function format(d, n){
        if(isNaN(n)){
            return "----------";
        }
        var s = "";
        do{
            s = (n % 10) + s;
            n = Math.floor(n / 10);
            d -= 1;
        }while(n > 0);

        for(var i = 0; i < d; i++){
            s = "0" + s;
        }

        return s;
    }

    const COLORS = ["#ffff00","#00ffff","#00ff00","#ff0000","#0000ff","#ff8000","#800080","#ff00ff"];

    function GameScene(asset){
        this.asset = asset;
        this.scene = new Scene();
        this.scene.backgroundColor = "#000000";
        this.score_k = makeLabel("Score", 600, 175, "#ffffff");
        this.score_l = makeLabel(format(10, 0), 600, 200, "#ffff00");
        this.line_k = makeLabel("Line", 600, 275, "#ffffff");
        this.line_l = makeLabel(format(10, 0), 600, 300, "#ffff00");
        this.level_k = makeLabel("Level", 600, 375, "#ffffff");
        this.level_l = makeLabel("0 / 0", 600, 400, "#00ff00");
        this.dif_k = makeLabel("Difficulty", 600, 75, "#ffffff");
        this.dif_l = makeLabel("", 600, 100, "#ffff00");
        this.next_k = makeLabel("Next", 600, 475, "#ffffff");
        this.next_l = makeLabel("", 600, 500, "#ffffff");
        this.margin_x = 50;
        this.margin_y = 25;
        this.eraser = [];
    }

    GameScene.prototype.initialize = function(gamev, asset){
        while(this.scene.firstChild){
            this.scene.removeChild(this.scene.firstChild);
        }

        this.scene.addChild(this.score_k);
        this.scene.addChild(this.score_l);
        this.scene.addChild(this.line_k);
        this.scene.addChild(this.line_l);
        this.scene.addChild(this.level_k);
        this.scene.addChild(this.level_l);
        this.scene.addChild(this.dif_k);
        this.scene.addChild(this.dif_l);
        this.scene.addChild(this.next_k);
        this.scene.addChild(this.next_l);

        this.dif_l.text = gamev.difficulty.name;
        this.next_l.text = format(10, gamev.difficulty.goal[gamev.level]);

        for(var i = 0; i < gamev.height + 1; i++){
            this.scene.addChild(makeSprite(25, 25, this.margin_x - 25, i * 25 + this.margin_y, this.asset['wall.png']));
            this.scene.addChild(makeSprite(25, 25, gamev.width * 25 + this.margin_x, i * 25 + this.margin_y, this.asset['wall.png']));
        }

        for(var j = 0; j < gamev.width; j++){
            this.scene.addChild(makeSprite(25, 25, j * 25 + this.margin_x, gamev.height * 25 + this.margin_y, this.asset['wall.png']));
        }

        this.field = []; // field
        this.board = []; // sprite field
        for(var i = 0; i < gamev.height; i++){
            this.field[i] = [];
            this.board[i] = [];
            for(var j = 0; j < gamev.width; j++){
                this.field[i][j] = 0;
                this.board[i][j] = makeSprite(25, 25, j * 25 + this.margin_x, i * 25 + this.margin_y, this.asset['back.png']);
                this.scene.addChild(this.board[i][j]);
            }
        }

        for(var j = 0; j < gamev.width; j++){
            this.scene.addChild(makeSprite(25, 25, this.margin_x + j * 25, this.margin_y, this.asset['net.png']));
        }

        this.nexts_field = [];
        this.nexts_board = [];

        for(var h = 0; h < 2; h++){
            this.nexts_field[h] = [];
            this.nexts_board[h] = [];
            for(var i = 0; i < gamev.height_d; i++){
                this.nexts_field[h][i] = [];
                this.nexts_board[h][i] = [];
                for(var j = 0; j < gamev.height_d; j++){
                    if(i < gamev.nexts[h].height && j < gamev.nexts[h].width){
                        var v = gamev.nexts[h].data[i][j];
                        var img;
                        this.nexts_field[h][i][j] = v;
                        if(v == 0){
                            img = this.asset['back.png'];
                        }else{
                            img = this.asset['0' + v + '.png'];
                        }
                        this.nexts_board[h][i][j] = makeSprite(25, 25, (gamev.width + 2 + j) * 25 + this.margin_x, ((h * (gamev.height_d + 1) + i) * 25) + this.margin_y, img);
                    }else{
                        this.nexts_field[h][i][j] = - 1;
                        this.nexts_board[h][i][j] = makeSpriteB(25, 25, (gamev.width + 2 + j) * 25 + this.margin_x, ((h * (gamev.height_d + 1) + i) * 25) + this.margin_y, "#808080");
                    }
                    this.scene.addChild(this.nexts_board[h][i][j]);
                }
            }
        }
    }

    GameScene.prototype.getScene = function(){
        return this.scene;
    }

    GameScene.prototype.read = function(gamev){
        this.score_l.text = format(10, gamev.score);
        this.line_l.text = format(10, gamev.line);
        this.level_l.text = (gamev.level + 1) + " / " + gamev.difficulty.goal.length;
        this.next_l.text = format(10, gamev.difficulty.goal[gamev.level]);

        var block = gamev.block;

        for(var i = 0; i < gamev.height; i++){
            for(var j = 0; j < gamev.width; j++){
                var nv;
                var bi = i + gamev.height_d - block.y;
                var bj = j - block.x;

                if(bj >= 0 && bj < block.width && bi >= 0 && bi < block.height && block.data[bi][bj] > 0){
                    nv = block.data[bi][bj] + 10;
                }else{
                    nv = gamev.field[gamev.height_d + i][j];
                }

                if(nv != this.field[i][j]){
                    if(nv == 0){
                        this.board[i][j].backgroundColor = null;
                        this.board[i][j].image = this.asset['back.png'];
                    }else if(nv < 10){
                        this.board[i][j].backgroundColor = null;
                        this.board[i][j].image = this.asset['0' + nv + '.png'];
                    }else{
                        this.board[i][j].backgroundColor = COLORS[nv - 10 - 1];
                        this.board[i][j].image = null;
                    }

                    this.field[i][j] = nv;
                }
            }
        }

        for(var h = 0; h < 2; h++){
            for(var i = 0; i < gamev.height_d; i++){
                for(var j = 0; j < gamev.height_d; j++){
                    var nv;

                    if(i < gamev.nexts[h].height && j < gamev.nexts[h].width){
                        nv = gamev.nexts[h].data[i][j];
                    }else{
                        nv = - 1;
                    }

                    if(nv != this.nexts_field[h][i][j]){
                        var img;
                        var bak;

                        if(nv == -1){
                            img = null;
                            bak = "#808080";
                        }else if(nv == 0){
                            img = this.asset['back.png'];
                            bak = null;
                        }else{
                            img = this.asset['0' + nv + '.png'];
                            bak = null;
                        }
                        this.nexts_board[h][i][j].image = img;
                        this.nexts_board[h][i][j].backgroundColor = bak;
                        this.nexts_field[h][i][j] = nv;
                    }
                }
            }
        }
    }

    GameScene.prototype.deleteStart = function(gamev){
        for(var i = 0; i < gamev.height; i++){
            var bury = true;

            for(var j = 0; j < gamev.width; j++){
                if(gamev.field[i + gamev.height_d][j] == 0){
                    bury = false;
                    break;
                }
            }

            if(bury){
                var sprite = makeSprite(25 * gamev.width, 25, this.margin_x, i * 25 + this.margin_y, this.asset['eraser.png']);
                this.eraser.push(sprite);
                this.scene.addChild(sprite);
            }
        }
    }

    GameScene.prototype.deleteEnd = function(gamev){
        for(var i = 0; i < this.eraser.length; i++){
            this.scene.removeChild(this.eraser[i]);
        }

        this.eraser = [];
    }

    GameScene.prototype.clear = function(gamev){
        var label = makeLabel("Game Clear!", 350, 500, "#ffff00");
        label.font = "36px Times New Roman";
        this.scene.addChild(label);
    }

    GameScene.prototype.over = function(gamev){
        var label = makeLabel("Game Over...", 350, 500, "#ff0000");
        label.font = "36px Times New Roman";
        this.scene.addChild(label);
    }


    return GameScene;
})();

var TitleScene = function(){
    function TitleScene(asset){
        this.asset = asset;
        this.scene = new Scene();
        this.scene.backgroundColor = "#000000";
    }

    TitleScene.prototype.initialize = function(titlev, dif){
        this.cursor = new Label("=>");
        this.cursor.x = 100;
        this.cursor.y = titlev.difficulty * 50 + 250;
        this.cursor.font = "24px Times New Roman";
        this.cursor.color = "#ff0000";

        this.scene.addChild(this.cursor);

        var label = new Label("Furukawa Blocks");

        label.x = 100;
        label.y = 50;
        label.font = "36px Times New Roman";
        label.color = "#ffffff";

        this.scene.addChild(label);

        for(var i = 0; i < dif.length; i++){
            var label = new Label(dif[i].name);
            label.x = 150;
            label.y = i * 50 + 250;
            label.font = "24px Times New Roman";
            label.color = "#ffffff";

            this.scene.addChild(label);
        }
    }

    TitleScene.prototype.read = function(titlev){
        this.cursor.y = titlev.difficulty * 50 + 250;
    }

    TitleScene.prototype.getScene = function(){
        return this.scene;
    }

    return TitleScene;
}();