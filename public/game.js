// dropbox

(function(){
    enchant();

    const marginx = 25;
    const marginy = 25;

    const WIDTH = 10;
    const HEIGHT = 20;
    const HEIGHT_D = 8;
    const MODES = { title: 0, game: 1, pause: 2, over: 3, clear: 4 };

     const EASY = {
        name: "Easy",
        speed: [ 48, 36, 24, 16, 12, 10, 8 ],
        goal: [ 10000, 20000, 30000, 50000, 70000, 100000, 150000 ],
        frkw_p: 2,
        help_p: 2,
    };
    const NORMAL = {
        name: "Normal",
        speed: [ 48, 36, 24, 12, 8, 6, 4 ],
        goal: [ 10000, 30000, 60000, 100000, 150000, 210000, 280000 ],
        frkw_p: 3,
        help_p: 1,
    };
    const HARD = {
        name: "Hard",
        speed: [ 24, 16, 12, 10, 8, 6, 4, 3 ],
        goal: [ 20000, 35000, 75000, 120000, 180000, 255000, 345000, 450000 ],
        frkw_p: 4,
        help_p: 1,
    };
    const FRKW = {
        name: "古川",
        speed: [ 12, 10, 6, 4, 3, 2 ],
        goal: [ 40000, 80000, 160000, 320000, 640000, 1280000 ],
        frkw_p: 12,
        help_p: 0,
    };

    const DIFFICULTY = [ EASY, NORMAL, HARD, FRKW ];

    function flameToInterval(flame){
        if(flame > 20){
            return 5;
        }else if(flame > 12){
            return 4;
        }else if(flame > 6){
            return 3;
        }else if(flame > 4){
            return 2;
        }else{
            return 1;
        }
    }

    function initGame(gamev, key){
        gamev.field = [];
        for(var i = 0; i < gamev.height_d + gamev.height; i++){
            gamev.field[i] = [];
            for(var j = 0; j < gamev.width; j++){
                gamev.field[i][j] = 0;
            }
        }

        gamev.frkw_p = gamev.difficulty.frkw_p;
        gamev.help_p = gamev.difficulty.help_p;

        gamev.line = 0;
        gamev.score = 0;
        gamev.mode = 0;
        gamev.level = 0;
        gamev.flame_count = gamev.difficulty.speed[gamev.level];

        key.reset();
        key.setInterval(flameToInterval(gamev.flame_count));

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
            if(titlev.difficulty > 0){
                titlev.difficulty --;
            }
        }
        if(key._down == 1){
            if(titlev.difficulty < DIFFICULTY.length - 1){
                titlev.difficulty ++;
            }
        }

        return key.space();
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

        function f(gamev, key){
            gamev.block.y -= 1;
            lock(gamev);
            supplyBlock(gamev);
            key.reset();
            if(deletable(gamev)){
                gamev.mode = 1;
            }else if(checkOver(gamev)){
                gamev.mode = 2;
            }else if(checkLevelUp(gamev)){
                if(levelUp(gamev, key)){
                    gamev.mode = 3;
                }
            }
        }

        if(key.down()){
            block.y += 1;
            gamev.flame_count = gamev.difficulty.speed[gamev.level];
            if(collision(gamev)){
                f(gamev, key);
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
            gamev.flame_count = gamev.difficulty.speed[gamev.level];
            block.y += 1;
            if(collision(gamev)){
                f(gamev, key);
            }
        }
    }

    function levelUp(gamev, key){
        gamev.level ++;

        if(gamev.level < gamev.difficulty.goal.length){
            key.setInterval(flameToInterval(gamev.difficulty.speed[gamev.level]));
            return false;
        }else{
            return true;
        }
    }

    function gameOverLoop(gamev, key){
        return key.space();
    }

    function checkLevelUp(gamev){
        return gamev.score > gamev.difficulty.goal[gamev.level];
    }

    function gameClearLoop(gamev, key){
        return key.space();
    }

    window.onload = function(){
        var game = new Game(800, 600);
        var key = new Key(2);
        game.preload('01.png','02.png','03.png','04.png','05.png','06.png','07.png','08.png','wall.png','back.png','net.png','eraser.png');
        game.fps = 24;
        game.keybind(32, "space");
        var titlev = { difficulty: 0 };
        var gamev = { flame_count: 0, line: 0, score: 0, field: undefined, block: undefined, nexts: [], frkw_p: 3, help_p: 18, width: WIDTH, height: HEIGHT, height_d: HEIGHT_D, mode: 0, level: 0, speed: undefined, difficulty: 0 };
        var delete_mode_count = 0;
        var scenes = { title: new TitleScene(game.assets), game: new GameScene(game.assets) };
        var mode = MODES.title;
        scenes.title.initialize(titlev, DIFFICULTY);

        game.onload = function(){
            game.addEventListener('enterframe', function(){
                key.scan(game.input);

                game.popScene();

                if(mode == MODES.title){
                    if(titleLoop(titlev, key)){
                        gamev.difficulty = DIFFICULTY[titlev.difficulty];
                        initGame(gamev, key);
                        scenes.game.initialize(gamev);
                        delete_mode_count = 0;
                        mode = MODES.game;
                    }
                    scenes.title.read(titlev);
                    game.pushScene(scenes.title.getScene());
                }else if(mode == MODES.game){
                    if(gamev.mode == 0){
                        gameLoop(gamev, key);
                        if(gamev.mode == 2){ // over
                            mode = MODES.over;
                            scenes.game.over(gamev);
                        }else if(gamev.mode == 3){ // clear
                            mode = MODES.clear;
                            scenes.game.clear(gamev);
                        }
                        scenes.game.read(gamev);
                        game.pushScene(scenes.game.getScene());
                    }else{
                        if(delete_mode_count <= 0){
                            delete_mode_count = gamev.difficulty.speed[gamev.level];
                            scenes.game.deleteStart(gamev);
                        }else{
                            if(key._down > 0){
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
                            scenes.game.deleteEnd(gamev);
                            if(checkLevelUp(gamev)){
                                levelUp(gamev, key);
                            }
                            if(checkOver(gamev)){
                                key.reset();
                                mode = MODES.over;
                                scenes.game.read(gamev);
                                scenes.game.over(gamev);
                            }else if(gamev.level >= gamev.difficulty.goal.length){
                                key.reset();
                                mode = MODES.clear;
                                scenes.game.read(gamev);
                                scenes.game.clear(gamev);
                            }
                        }

                        game.pushScene(scenes.game.getScene());
                    }
                }else if(mode == MODES.pause){

                }else if(mode == MODES.over){
                    if(gameOverLoop(gamev, key)){
                        mode = MODES.title;
                    }
                    game.pushScene(scenes.game.getScene());
                }else if(mode == MODES.clear){
                    if(gameClearLoop(gamev, key)){
                        mode = MODES.title;
                    }
                    game.pushScene(scenes.game.getScene());
                }
            });
        }
        
        game.start();
    }
})();
