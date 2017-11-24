/*
 * Mmmmm, dejlig overkommenteret kode // Lucas
*/


//Vi laver først nogle variabler, som vi senere brugerer i koden.
var mic;
var lvl;
var player;
var yOffset = 0;
var zeroFrame = 0;

//Vi laver et objekt til at tegne vores spillers hoved seperat.
function Player() {
    this.w = 40;
    this.h = 35;
    this.x = width/2-this.w/2;
    this.y = height-this.h-87;
    this.draw = function() {
        image(head, this.x, this.y);
    }
}

// Her definerer vi platform-objektet, så vi kan holde styr på forskellige platforme
function Platform(x, y) {
    // Vi giver den positionskoordinater og en bredde og højde
    this.x = x;
    this.y = y;
    this.w = random(60, 360);
    this.h = random(32, 64);
    // Og en tilfældig styrke
    this.strength = random([-1, 1]) * random(3, 60);
    print(this.strength)

    this.draw = function() {
        // Tegn rektanglet, hvis farve vil være afhængig af styrken.
        fill(Math.abs(this.strength)/30 * 255, 0, 200+4*this.strength);
        rect(this.x, this.y, this.w, this.h);
        // Tegn en ghost-platform, så det ligner, de går rundt om skærmen
        rect(this.x - width, this.y, this.w, this.h);

        // Platformerne bevæger sig i forhold til mic level ganget med dens styrke
        // Så de ikke bevæger sig lige hurtigt
        this.x += width+this.strength*lvl;
        // Wrap around
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

//Her laver vi en funktion, som kan lave nye platforme. På den måde falder der hele tiden platforme ned.
function platformMakePlease() {
    platforms.push(new Platform(random(width), -random(200)))
}

function keyPressed() {
    // Hold øje med, om R bliver trykket på
    if (keyCode === 82) {
        // Genstart, hvis R er blevet trykket på
        reset()
        return false;
    }
}

// Flere globale variabler
var platforms = [];
var dude;
var head;
var points = 0;

function setup() {
    createCanvas(800, 600);
    noStroke();
    textSize(30);
    // Indlæs billederne
    dude = loadImage("dude.png");
    head = loadImage("head.png");

    mic = new p5.AudioIn();
    mic.start();

    reset();
}

// Reset hele spillet, og sæt den originale `draw`-funktion til.
function reset() {
    player = new Player();
    platforms = [new Platform(random(width), 200)];
    zeroFrame = frameCount;
    yOffset = 0;
    points = 0;
    state.cur = "normal";
}

var state = {
    // Den nurværende state, der skal køres hver frame
    cur: "normal",
    // Den almindelige draw funktion, der skal køres, når man ikke er død
    normal: function() {
        // Sørg for at hovedet kroppen forsvinder efter 200 frames
        if (frameCount-zeroFrame > 200) {
            yOffset += 1.5;
        }
        // Tegn kroppen
        image(dude, width/2-20, height-87.5+yOffset);
        // Lav en platform hver 150'ende frame
        if (frameCount % 150 == 0)
        platformMakePlease()
        player.draw();
        platforms.forEach(function(p, i) {
            // Bevæg dem kun efter 200'ende frame
            // Så de bevæger sig sammen med kroppen.
            if (frameCount-zeroFrame > 200)
            p.y += 1.5;
            p.draw();
            // Hvis hovedet rør en platform, skal vi dø
            if (p.collides()) {
                state.cur = "dead"
            }
            // Slet platforme, der er udenfor canvas'et
            if (p.y > height) {
                delete platforms[i]
                points++;
            }
        })
    },
    // Gameoverskærmen
    dead: function() {
        // Tegn lydstyrkebar
        fill(0)
        rect(width-50, height-100, 50, 100)
        fill(255, 0, 0);
        rect(width-50, height-100*lvl, 50, 100)
        // Skriv game over
        text("Game over!", 300, 200);
        text("R to restart", 300, 230);
    }
}

function draw() {
    // Opdatér mic-level-variablen (0 til 1)
    lvl = mic.getLevel();
    background(0, 200, 255);
    // Kør nuværende state
    state[state.cur]()
    // Skriv point
    fill(0)
    text("Points: "+points, 3, 50)
}
