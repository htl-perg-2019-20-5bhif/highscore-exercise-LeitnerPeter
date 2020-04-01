import { Scene, Types, CANVAS, Game, Physics, Input } from 'phaser';
import { Spaceship, Direction } from './spaceship';
import { Bullet } from './bullet';
import { Meteor } from './meteor';


interface Highscore{
    initials: string;
    points: number;
}


let hits = 0;

/**
 * Space shooter scene
 * 
 * Learn more about Phaser scenes at 
 * https://photonstorm.github.io/phaser3-docs/Phaser.Scenes.Systems.html.
 */
class ShooterScene extends Scene {
    private spaceShip: Spaceship;
    private meteors: Physics.Arcade.Group;
    private bullets: Physics.Arcade.Group;

    private bulletTime = 0;
    private meteorTime = 0;

    private cursors: Types.Input.Keyboard.CursorKeys;
    private spaceKey: Input.Keyboard.Key;
    private isGameOver = false;

    preload() {
        // Preload images so that we can use them in our game
        this.load.image('space', 'images/deep-space.jpg');
        this.load.image('bullet', 'images/scratch-laser.png');
        this.load.image('ship', 'images/scratch-spaceship.png');
        this.load.image('meteor', 'images/scratch-meteor.png');
    }

    create() {
        if (this.isGameOver) {
            return;
        }
        
        //  Add a background
        this.add.tileSprite(0, 0, this.game.canvas.width, this.game.canvas.height, 'space').setOrigin(0, 0);

        // Create bullets and meteors
        this.bullets = this.physics.add.group({
            classType: Bullet,
            maxSize: 10,
            runChildUpdate: true
        });
        this.meteors = this.physics.add.group({
            classType: Meteor,
            maxSize: 20,
            runChildUpdate: true
        });

        // Add the sprite for our space ship.
        this.spaceShip = new Spaceship(this);
        this.physics.add.existing(this.children.add(this.spaceShip));

        // Position the spaceship horizontally in the middle of the screen
        // and vertically at the bottom of the screen.
        this.spaceShip.setPosition(this.game.canvas.width / 2, this.game.canvas.height * 0.9);

        // Setup game input handling
        this.cursors = this.input.keyboard.createCursorKeys();
        this.input.keyboard.addCapture([' ']);
        this.spaceKey = this.input.keyboard.addKey(Input.Keyboard.KeyCodes.SPACE);

        this.physics.add.collider(this.bullets, this.meteors, (bullet: Bullet, meteor: Meteor) => {
            if (meteor.active && bullet.active) {
                hits = hits + 1;
                console.log(hits);
                meteor.kill();
                bullet.kill();
                }
        }, null, this);
        
        this.physics.add.collider(this.spaceShip, this.meteors, this.gameOver, null, this);
        
    }

    update(_, delta: number) {
        // Move ship if cursor keys are pressed
        if (this.cursors.left.isDown) {
            this.spaceShip.move(delta, Direction.Left);
        }
        else if (this.cursors.right.isDown) {
            this.spaceShip.move(delta, Direction.Right);
        }

        if (this.spaceKey.isDown) {
            this.fireBullet();
        }

        this.handleMeteors();
    }

    fireBullet() {
        if (this.time.now > this.bulletTime) {
            // Find the first unused (=unfired) bullet
            const bullet = this.bullets.get() as Bullet;
            if (bullet) {
                bullet.fire(this.spaceShip.x, this.spaceShip.y);
                this.bulletTime = this.time.now + 100;
            }
        }
    }

    handleMeteors() {
        // Check if it is time to launch a new meteor.
        if (this.time.now > this.meteorTime) {
            // Find first meteor that is currently not used
            const meteor = this.meteors.get() as Meteor;
            if (meteor) {
                meteor.fall();
                this.meteorTime = this.time.now + 500 + 1000 * Math.random();
            }
        }
    }

    async gameOver() {
        this.isGameOver = true;

        this.bullets.getChildren().forEach((b: Bullet) => b.kill());
        this.meteors.getChildren().forEach((m: Meteor) => m.kill());
        this.spaceShip.kill();

        // Display "game over" text
        const text = this.add.text(this.game.canvas.width / 2, this.game.canvas.height / 2, "Game Over :-(", 
            { font: "65px Arial", fill: "#ff0044", align: "center" });
        text.setOrigin(0.5, 0.5);

        
        const highscores = (await (await fetch("http://localhost:5000/api/Highscores")).json()) as Highscore[];
        document.getElementById("highscorecontainer").innerHTML = "";
         for(let i = 0;i<highscores.length;i++){
             document.getElementById("highscorecontainer").innerHTML+= `<li>${highscores[i].initials}:${highscores[i].points}</li>`;             
        }
        //console.log(highscores);
    }
}

function sendToServer(){
    const name = (document.getElementById("name") as HTMLInputElement).value;
    const highscore: Highscore={initials: name, points: hits};
    fetch("https://localhost:5001/api/Highscores",{
        method:"POST",
        body:JSON.stringify(highscore),
        headers: {
            'Content-Type': 'application/json'
        }
    });
    console.log(highscore);
}



const config = {
    type: CANVAS,
    width: 512,
    height: 512,
    scene: [ShooterScene],
    physics: { default: 'arcade' },
    audio: { noAudio: true }
};

new Game(config);
//@ts-ignore
window.sendToServer = sendToServer;