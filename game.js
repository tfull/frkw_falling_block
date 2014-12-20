// dropbox

(function(){
    enchant();

    const WIDTH = 10;
    const HEIGHT = 20;
    const HEIGHT_D = 8;
    const MODES = { title: 0, game: 1, pause: 2, over: 3 };
    const DIFFICULTY = { easy: 0, normal: 1, hard: 2, frkw: 3 };

    COLORS = ["#ffff00","#00ffff","#00ff00","#ff0000","#0000ff","#ff8000","#800080","#ff00ff"];

    const EASY = {
        speed: [ 48, 36, 24, 16, 12, 10, 8 ],
        goal: [ 10000, 20000, 30000, 50000, 70000, 100000, 150000 ],
    };
    const NORMAL = {
        speed: [ 48, 36, 24, 12, 8, 6, 4 ],
        goal: [ 10000, 30000, 60000, 100000, 150000, 210000, 280000 ],
    };
    const HARD = {
        speed: [ 24, 16, 12, 10, 8, 6, 4, 3 ],
        goal: [ 20000, 35000, 75000, 120000, 180000, 255000, 345000, 450000 ],
    };
    const FRKW = {
        speed: [ 12, 10, 6, 4, 3, 2 ],
        goal: [ 40000, 80000, 160000, 320000, 640000, 1280000 ],
    };

    function format(d, n){
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

    function initGame(gamev){
        gamev.field = [];
        for(var i = 0; i < gamev.height_d + gamev.height; i++){
            gamev.field[i] = [];
            for(var j = 0; j < gamev.width; j++){
                gamev.field[i][j] = 0;
            }
        }

        gamev.line = 0;
        gamev.score = 0;
        gamev.mode = 0;
        gamev.level = 0;
        gamev.flame_count = gamev.speeds[gamev.level];

        gamev.block = getBlock(gamev.frkw_p, gamev.help_p)
        gamev.nexts = [];
        for(var i = 0; i < 2; i++){
            gamev.nexts[i] = getBlock(gamev.frkw_p, gamev.help_p);
        }
        gamev.block.x = parseInt((gamev.width - gamev.block.width) / 2);
        gamev.block.y = gamev.height_d - gamev.block.height;
    }

    function getBlock(frkw_p, help_p){
        var r = Math.floor(Math.random() * 100);

        if(r < frkw_p){
            return BigBlock.nextBlock();
        }else if(r < frkw_p + help_p){
            return HelpBlock.nextBlock();
        }else{
            return NormalBlock.nextBlock();
        }
    }

    function supplyBlock(gamev){
        gamev.block = gamev.nexts[0];
        gamev.block.x = parseInt((gamev.width - gamev.block.width) / 2);
        gamev.block.y = gamev.height_d - gamev.block.height;
        gamev.nexts[0] = gamev.nexts[1];
        gamev.nexts[1] = getBlock(gamev.frkw_p, gamev.help_p);
    }

    function deletable(gamev){
        for(var i = 0; i < gamev.height_d + gamev.height; i++){
            var bury = true;

            for(var j = 0; j < gamev.width; j++){
                if(gamev.field[i][j] == 0){
                    bury = false;
                    break;
                }
            }
            if(bury){
                return true;
            }
        }
        return false;
    }

    function collision(gamev){
        var block = gamev.block;

        for(var i = 0; i < block.height; i++){
            for(var j = 0; j < block.width; j++){
                if(block.data[i][j] == 0){
                    continue;
                }

                var px = block.x + j;
                var py = block.y + i;

                if(py < 0 || py >= gamev.height_d + gamev.height){
                    return true;
                }
                if(px < 0 || px >= gamev.width){
                    return true;
                }

                if(gamev.field[py][px] > 0){
                    return true;
                }
            }
        }
        return false;
    }

    function lock(gamev){
        var block = gamev.block;

        for(var i = 0; i < block.height; i++){
            for(var j = 0; j < block.width; j++){
                var px = block.x + j;
                var py = block.y + i;

                if(px < 0 || px >= gamev.width){
                    continue;
                }
                if(py < 0 || py >= gamev.height + gamev.height_d){
                    continue;
                }

                if(block.data[i][j] > 0){
                    gamev.field[block.y + i][block.x + j] = block.data[i][j];
                }
            }
        }
    }

    function deleteBlocks(gamev){
        var lines = 0;
        var field = gamev.field;

        for(var i = gamev.height_d + gamev.height - 1; i >= lines; i--){
            while(i >= lines){
                var bury = true;
                for(var j = 0; j < gamev.width; j++){
                    if(field[i - lines][j] == 0){
                        bury = false;
                        break;
                    }
                }
                if(bury){
                    lines ++;
                }else{
                    break;
                }
            }

            if(lines > i){
                break;
            }

            for(var j = 0; j < gamev.width; j++){
                field[i][j] = field[i - lines][j];
            }
        }

        for(var i = 0; i < lines; i++){
            for(var j = 0; j < gamev.width; j++){
                field[i][j] = 0;
            }
        }

        return lines;
    }

    function checkOver(gamev){
        for(var i = 0; i < gamev.height_d + 1; i++){
            for(var j = 0; j < gamev.width; j++){
                if(gamev.field[i][j] > 0){
                    return true;
                }
            }
        }

        return false;
    }

    function help1(gamev){
        for(var i = gamev.height_d + gamev.height - 1; i > gamev.block.y; i--){
            if(gamev.field[i][gamev.block.x] == 0){
                gamev.block.y = i;
                return;
            }
        }
    }

    function help2(gamev){
        var maxi = -1;

        for(var i = gamev.block.y + 2; i < gamev.height_d + gamev.height; i++){
            if(gamev.field[i][gamev.block.x] == 0){
                maxi = i;
            }else{
                break;
            }
        }
        if(maxi > 0){
            gamev.field[maxi][gamev.block.x] = 8;
        }
    }

    function help3(gamev){
        var block = gamev.block;

        for(var i = block.y; i < gamev.height_d + gamev.height; i++){
            for(var j = 0; j < block.width; j++){
                gamev.field[i][j + block.x] = 0;
            }
        }
    }

    function titleLoop(titlev, key){
        if(key._up == 1){
            if(titlev.difficulty > DIFFICULTY.easy){
                titlev.difficulty --;
            }
        }
        if(key._down == 1){
            if(titlev.difficulty < DIFFICULTY.frkw){
                titlev.difficulty ++;
            }
        }

        return key.space();
    }

    function makeTitleScene(){
        var scene = new Scene();
        var label = new Label("Furukawa Block Game");
        scene.backgroundColor = "#000000";
        return scene;
    }

    function showTitle(scene, titlev){
        while(scene.firstChild){
            scene.removeChild(scene.firstChild);
        }

        var label = new Label("Furukawa Block Game");
        label.x = 100;
        label.y = 100;
        label.color = "#ffffff";
        scene.addChild(label);

        var ds = [ "Easy", "Normal", "Hard", "古川" ];
        for(var i in ds){
            label = new Label(ds[i]);
            label.x = 150;
            label.y = 200 + i * 25;
            label.color = "#ffffff";
            scene.addChild(label);
        }

        label = new Label("->");
        label.x = 100;
        label.y = 200 + titlev.difficulty * 25;
        label.color = "#ff0000";
        scene.addChild(label);
    }

    function gameLoop(gamev, key){
        gamev.flame_count --;

        var block = gamev.block;
        var field = gamev.field;

        if(key.space()){
            if(block.type == 1){
                if(block.kind == 1){
                    help1(gamev);
                    gamev.flame_count = 0;
                }else if(block.kind == 2){
                    help2(gamev);
                }else if(block.kind == 3){
                    help3(gamev);
                    supplyBlock(gamev);
                }
            }else{
                block.rotate();
                if(collision(gamev)){
                    block.inverse();
                }
            }
        }

        if(key.down()){
            block.y += 1;
            gamev.flame_count = gamev.speeds[gamev.level];
            if(collision(gamev)){
                block.y -= 1;
                lock(gamev);
                supplyBlock(gamev);
                key.reset();
                if(deletable(gamev)){
                    gamev.mode = 1; // delete
                }else{
                    if(checkOver(gamev)){
                        gamev.mode = 2; // over
                    }
                }
            }else{
                gamev.score ++;
            }
        }
        if(key.left()){
            block.x -= 1;
            if(collision(gamev)){
                block.x += 1;
            }
        }
        if(key.right()){
            block.x += 1;
            if(collision(gamev)){
                block.x -= 1;
            }
        }

        if(gamev.flame_count <= 0){
            gamev.flame_count = gamev.speeds[gamev.level];
            block.y += 1;
            if(collision(gamev)){
                block.y -= 1;
                lock(gamev);
                supplyBlock(gamev);
                key.reset();
                if(deletable(gamev)){
                    gamev.mode = 1; // delete
                }else{
                    if(checkOver(gamev)){
                        gamev.mode = 2; // over
                    }
                }
            }
        }
    }

    function showGame(scene, gamev, assets){
        while(scene.firstChild){
            scene.removeChild(scene.firstChild);
        }

        var label;

        label = new Label(format(10, gamev.score));
        label.x = 600;
        label.y = 100;
        label.color = "#ffff00";
        scene.addChild(label);

        label = new Label("Score");
        label.x = 600;
        label.y = 75;
        label.color = "#ffffff";
        scene.addChild(label);

        label = new Label("line");
        label.x = 600;
        label.y = 175;
        label.color = "#ffffff";
        scene.addChild(label);

        label = new Label(format(10, gamev.line));
        label.x = 600;
        label.y = 200;
        label.color = "#ffff00";
        scene.addChild(label);

        for(var i = 0; i < gamev.height + 1; i++){
            var sprite = new Sprite(25, 25);
            sprite.x = 0;
            sprite.y = i * 25;
            sprite.image = assets["wall.png"];
            scene.addChild(sprite);

            sprite = new Sprite(25, 25);
            sprite.x = (gamev.width + 1) * 25;
            sprite.y = i * 25;
            sprite.image = assets["wall.png"];
            scene.addChild(sprite);
        }

        for(var j = 0; j < gamev.width; j++){
            var sprite = new Sprite(25, 25);
            sprite.x = (j + 1) * 25;
            sprite.y = gamev.height * 25;
            sprite.image = assets["wall.png"];
            scene.addChild(sprite);
        }

        for(var i = 0; i < gamev.height; i++){
            for(var j = 0; j < gamev.width; j++){
                if(gamev.field[i + gamev.height_d][j] > 0){
                    var sprite = new Sprite(25, 25);
                    sprite.x = (j + 1) * 25;
                    sprite.y = i * 25;
                    sprite.image = assets["0" + gamev.field[i + gamev.height_d][j] + ".png"];
                    scene.addChild(sprite);
                }else{
                    var sprite = new Sprite(25, 25);
                    sprite.x = (j + 1) * 25;
                    sprite.y = i * 25;
                    sprite.image = assets["back.png"];
                    scene.addChild(sprite);
                }
            }
        }

        for(var i = 0; i < gamev.block.height; i++){
            for(var j = 0; j < gamev.block.width; j++){
                var px = gamev.block.x + j;
                var py = gamev.block.y + i;

                if(py >= gamev.height_d && gamev.block.data[i][j] > 0){
                    var sprite = new Sprite(25, 25);
                    sprite.x = (px + 1) * 25;
                    sprite.y = (py - gamev.height_d) * 25;
                    sprite.backgroundColor = COLORS[gamev.block.data[i][j] - 1];
                    scene.addChild(sprite);
                }
            }
        }
    }

    function showDeleteEffect(scene, gamev){
        for(var i = 0; i < gamev.height; i++){
            var bury = true;

            for(var j = 0; j < gamev.width; j++){
                if(gamev.field[i + gamev.height_d][j] == 0){
                    bury = false;
                    break;
                }
            }
            if(bury){
                var label = new Label("deleted");
                label.x = 0;
                label.y = i * 25;
                scene.addChild(label);
            }
        }
    }

    function showGameOver(scene, gamev, assets){
        showGame(scene, gamev, assets);
        var label = new Label("Game Over");
        label.x = 400;
        label.y = 0;
        label.color = "#ffffff";
        scene.addChild(label);
    }

    function gameOverLoop(gamev, key){
        return key.space();
    }

    function makeGameScene(){
        var scene = new Scene();
        scene.backgroundColor = "black";
        return scene;
    }

    function makeOverScene(){
        var scene = new Scene();
        scene.backgroundColor = "#000000";
        return scene;
    }

    window.onload = function(){
        var game = new Game(800, 600);
        var key = new Key(2);
        game.preload('01.png','02.png','03.png','04.png','05.png','06.png','07.png','08.png','wall.png','back.png');
        game.fps = 24;
        game.keybind(32, "space");
        var ltofc = [ 24, 16, 12, 10, 8, 6, 4 ];
        var titlev = { difficulty: 0 };
        var gamev = { flame_count: 0, line: 0, score: 0, field: undefined, block: undefined, nexts: [], frkw_p: 3, help_p: 18, width: WIDTH, height: HEIGHT, height_d: HEIGHT_D, mode: 0, level: 0, speeds: ltofc };
        var delete_mode_count = 0;
        var scenes = { title: makeTitleScene(), game: makeGameScene() , over: makeOverScene() };
        var mode = MODES.title;

        game.onload = function(){
            game.addEventListener('enterframe', function(){
                key.scan(game.input);

                game.popScene();

                if(mode == MODES.title){
                    if(titleLoop(titlev, key)){
                        initGame(gamev);
                        delete_mode_count = 0;
                        mode = MODES.game;
                    }
                    showTitle(scenes.title, titlev);
                    game.pushScene(scenes.title);
                }else if(mode == MODES.game){
                    if(gamev.mode == 0){
                        gameLoop(gamev, key);
                        if(gamev.mode == 2){
                            mode = MODES.over;
                        }
                        showGame(scenes.game, gamev, game.assets);
                        game.pushScene(scenes.game);
                    }else{
                        if(delete_mode_count <= 0){
                            delete_mode_count = gamev.speeds[gamev.level];
                        }else{
                            if(key.down()){
                                delete_mode_count -= 2;
                            }else{
                                delete_mode_count -= 1;
                            }
                        }

                        if(delete_mode_count <= 0){
                            gamev.mode = 0;
                            var lines = deleteBlocks(gamev);
                            gamev.score += Math.pow(lines, 2) * 100;
                            gamev.line += lines;
                            if(checkOver(gamev)){
                                mode = MODES.over;
                            }
                        }

                        showGame(scenes.game, gamev, game.assets);
                        showDeleteEffect(scenes.game, gamev);
                        game.pushScene(scenes.game);
                    }
                }else if(mode == MODES.pause){

                }else if(mode == MODES.over){
                    if(gameOverLoop(gamev, key)){
                        mode = MODES.title;
                    }
                    showGameOver(scenes.over, gamev, game.assets);
                    game.pushScene(scenes.over);
                }
            });
        }
        
        game.start();
    }
})();
