class PixelManipulation {
    constructor(explosionCanvas) {
        this.context = explosionCanvas.getContext("2d");
        this.width = explosionCanvas.width;
        this.height = explosionCanvas.height;
        this.image = this.context.getImageData(0, 0, this.width, this.height);
    }
    getImage() {
        this.image = this.context.getImageData(0, 0, this.width, this.height);
    }
    setImage() {
        this.context.putImageData(this.image, 0, 0);
    }

    setPixel(x, y, red, green, blue) {
        const pixelIndex = (y * this.width + x) * 4;
        this.image.data[pixelIndex] = red;
        this.image.data[pixelIndex + 1] = green;
        this.image.data[pixelIndex + 2] = blue;

    } 
    fillColor(red, green, blue, alpha = 255) {
        for (let i = 0; i < this.width * this.height * 4; i+=4) {
            this.image.data[i] = red;
            this.image.data[i + 1] = green;
            this.image.data[i + 2] = blue;
            this.image.data[i + 3] = alpha;
        }      
    }
}

class Particle {
    constructor() {
        this.x;
        this.y;
        this.direction;
        this.speed;
        this.init;
        this.update;
    }
}

class Swarm {
    constructor(explosionCanvas, amount = 10000, color = 1) {
        this.size = amount;
        this.particles = [];
        this.pixels = new PixelManipulation(explosionCanvas);
        this.color = color;
        this.style = this.initSpin;
        this.update = this.updateSpin;
    }

    setPattern() {
        this.style = this.initSpin;
        this.update = this.updateSpin;
        this.init();
    };

    setColor(color) {
        this.color = color;
    };
    setParticles(value) {
        this.size = value;
        this.init();
    }
    init() {
        this.particles = [];
        for(let i = 0; i < this.size; i++) {
            this.particles.push(new Particle);
            this.particles[i].update = this.update;
            this.particles[i].init = this.style;
            this.particles[i].init();
        }        
        // this.pixels.fillColor(0, 0, 0);
        this.pixels.setImage();
    }

    initSpin() {
        this.direction = 2 * Math.PI * Math.random();
        this.speed = 0.02 * Math.random();
        this.x = 0;
        this.y = 0;
        this.speed *= this.speed/2;
        // this.update = this.updateSpin;
    }
    updateSpin(delta) {
        this.direction += 0.01;
        const xspeed = this.speed * Math.cos(this.direction);
        const yspeed = this.speed * Math.sin(this.direction);

        this.x += xspeed * delta;
        this.y += yspeed * delta;
        if(this.x <= -1.0 || this.x >= 1.0 || this.y <= -1.0 || this.y >= 1.0) {
            // this.init();
            this.x = -1.10;
            this.y = -1.10
        }
    }

    render(delta) {
        const width = explosionCanvas.width;
        const height = explosionCanvas.height;

        const oldPixels = this.pixels.context.getImageData(0, 0, width, height).data;
        for(let y=0; y<height; y++) {
            for(let x = 0; x<width; x++) {

                let redTotal = 0;

                for(let row = -1; row <=1; row++) {
                    for(let col = -1; col <=1; col++) {
                        let currentX = x + col;
                        let currentY = y + row;

                        if(currentX >= 0 && currentX < width && currentY >= 0 && currentY < height) {
                            let red = oldPixels[4*(currentY * width + currentX) + this.color]                            
                            redTotal += red;
                        }
                    }
                }
                this.pixels.image.data[4*(y * width + x) + this.color] = redTotal / 9;
            }
        }

        for(let i = 0; i < this.size; i++) {
            const p = this.particles[i];
            p.update(delta);
            const xPos = Math.floor((1 + p.x) * width/2);
            const yPos = Math.floor(p.y * width/2 + height/2);
            this.pixels.image.data[4 * (yPos * width + xPos) + this.color] = 255;  
        }
        this.pixels.setImage();
    }
}

// start
let currentTime = Date.now();
let previousTime = Date.now();
let deltaTime = 0;

const explosionCanvas = document.querySelector("#explosion-canvas");
let offsetWidth = document.querySelector('#summoned-root').offsetWidth;
explosionCanvas.setAttribute('width', offsetWidth);
explosionCanvas.setAttribute('height', 4 * offsetWidth / 6);

const swarm = new Swarm(explosionCanvas, 2000);
swarm.setPattern();

function explosionRun(color) {
    swarm.particles = [];
    // swarm.pixels.fillColor(0, 0, 0);
    swarm.pixels.setImage();
    swarm.setColor(color);

    setInterval(() => {
        currentTime = Date.now();
        swarm.render(deltaTime);
        deltaTime = currentTime - previousTime;
        previousTime = currentTime;
    }, 2000/48);
}