//Vi laver først nogle variabler, som vi senere brugerer i koden.
var mic;
var lvl;
var player;
var yOffset = 0;
var zeroFrame = 0;

//Vi laver en funktion, til at tegne vores spillers krop og hoved seperat.
function Player() {
    this.w = 40;
    this.h = 35;
    this.x = width/2-this.w/2;
    this.y = height-this.h-87;
    this.draw = function() {
        image(head, this.x, this.y);
    }
}

function Platform(x, y) {
    this.x = x;
    this.y = y;
    this.w = random(300)+60;
    this.h = random(32)+32;
    this.strength = 60*random()-30;
    console.log(this.strength)
    
    this.draw = function() {
        fill(Math.abs(this.strength)/30 * 255, 0, 200+4*this.strength);
        rect(this.x, this.y, this.w, this.h);
        rect(this.x-(Math.sign(this.strength)*width), this.y, this.w, this.h);
        
        this.x += width+this.strength*lvl;
        this.x %= width;
    }
    
    //Den her funktiom chcker om hovedet og kasserne rammer hinanden. 
    this.collides = function() {
        return !(
            this.x > player.x+player.w ||
            this.x+this.w < player.x ||
            this.y > player.y+player.h ||
            this.y+this.h < player.y
        );
    }
}

//Her laver vi en funktion, som kan lave nye platforme. På den måde falder der s´hele tiden platforme ned.
function platformMakePlease() {
    platforms.push(new Platform(random(width), -random(200)))
}

function death() {
    draw = function() {
        background(0, 200, 255);
        fill(255, 0, 0);
        text("Game over!", 300, 200);
        fill(0)
        text("Points: "+points, 3, 50)
    }
}

function keyPressed() {
    if (keyCode === 82) {
        reset()
        return false;
    }
}

var platforms = [];
var dude;
var head;
var points = 0;

function setup() {
    createCanvas(800, 600);
    noStroke();
    textSize(30);
    dude = loadImage("dude.png");
    head = loadImage("head.png");
    
    mic = new p5.AudioIn();
    mic.start();
    
    platforms.push(new Platform(random(width), 200));
    player = new Player();
}

function reset() {
    player = new Player();
    platforms = [new Platform(random(width), 200)];
    zeroFrame = frameCount;
    yOffset = 0;
    points = 0;
    draw = draw_normal;
}

function draw_normal() {
    lvl = mic.getLevel();
    background(0, 200, 255);
    if (frameCount-zeroFrame > 200) {
        yOffset += 1.5;
    }
    image(dude, width/2-20, height-87.5+yOffset);
    if (frameCount % 150 == 0)
        platformMakePlease()
    player.draw();
    platforms.forEach(function(p, i) {
        if (frameCount-zeroFrame > 200)
            p.y += 1.5;
        p.draw();
        if (p.collides()) {
            death()
        }
        if (p.y > height) {
            delete platforms[i]
            points++;
        }
    })
    
    fill(0)
    text("Points: "+points, 3, 50)
}

draw = draw_normal;
