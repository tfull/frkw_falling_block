function Key(interval){
    this._interval = interval;
    this._up = 0;
    this._down = 0;
    this._left = 0;
    this._right = 0;
    this._space = 0;
    this._n = 0;
}

Key.prototype.scan = function(input){
    if(input.up){ this._up += 1; }else{ this._up = 0; }
    if(input.down){ this._down += 1; }else{ this._down = 0; }
    if(input.left){ this._left += 1; }else{ this._left = 0; }
    if(input.right){ this._right += 1; }else{ this._right = 0; }
    if(input.space){ this._space += 1; }else{ this._space = 0; }
    if(input.n){ this._n += 1; }else{ this._n = 0; }
}

Key.prototype.setInterval = function(n){
    this._interval = n;
}

Key.prototype.up = function(){ return this._up == 1; }
Key.prototype.down = function(){
    if(this._interval == 1){
        return this._down > 0;
    }else{
        return this._down % this._interval == 1;
    }
}
Key.prototype.left = function(){
    if(this._interval == 1){
        return this._left > 0 && this._right == 0;
    }else{
        return this._left % this._interval == 1 && this._right == 0;
    }
}
Key.prototype.right = function(){
    if(this._interval == 1){
        return this._right > 0 && this._left == 0;
    }else{
        return this._right % this._interval == 1 && this._left == 0;
    }
}
Key.prototype.space = function(){ return this._space == 1; }

Key.prototype.reset = function(){
    this._down = 0;
    this._left = 0;
    this._right = 0;
    this._space = 2;
}

