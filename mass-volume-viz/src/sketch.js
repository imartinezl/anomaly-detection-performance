import './utils.js';
import Distribution from './distribution.js';


let sketch = (p5) => {

    var j, jj, alpha, distributions;
    var alpha_min_slider;

    let init = () => {
        j = 0;
        jj = 1;
        // init_slider();
        alpha = generate_alpha();
        distributions = generate_distributions(alpha);
        console.log('init');
    }

    let update = () => {
        j = 0;
        jj = 1;
        alpha = generate_alpha();
        update_distributions(alpha);
    }

    let init_slider = () => {
        alpha_min_slider = document.getElementById('alpha-min-slider');
        alpha_min_slider.addEventListener('change', update);
    }

    p5.setup = () => {
        var canvas = p5.createCanvas(p5.windowWidth, p5.windowHeight);
        canvas.parent('sketch-holder');
        p5.background("#F6F6F6");
        init();
    }

    p5.draw = () => {
        p5.background("#F6F6F6");
        p5.circle(p5.mouseX, p5.mouseY, 10);
        for (let i = 0; i < distributions.length; i++) {
            distributions[i].display(j);
        }
        j += jj;
        if (j >= alpha.length - 1 | j < 0) {
            jj *= -1;
            j += jj;
        }
    }

    let generate_alpha = () => {
        //generate alpha
        // let alpha_min = parseFloat(alpha_min_slider.value);
        let alpha_min = 0.5;
        let alpha_max = 0.99;
        let alpha_by = 0.005;
        let alpha = [];
        for (let a = alpha_min; a <= alpha_max; a += alpha_by) {
            alpha.push(a);
        }
        return alpha;
    }


    let generate_distributions = (alpha) => {
        let n_x = 1000;
        let n_unif = 10000;
        let off = p5.width / 10;
        let w = p5.width / 6;
        let h = p5.height/2;
        let posA = p5.createVector(off, h);
        let sclA = p5.createVector(30/p5.width*1000, -700);
        let posB = p5.createVector(off + w, h);
        let sclB = p5.createVector(250/p5.width*1000, -50);


        let gen = { f: rnorm, p: [0, 1] };
        let pdf = { f: dnorm, p: [0, 1] };
        gen = { f: custom_gen, p: [] };
        pdf = { f: custom_pdf, p: [] };
        let dA = new Distribution(p5, n_x, n_unif, gen, pdf, alpha, posA, sclA, posB, sclB);

        posA = p5.createVector(2*off + 2*w, h);
        sclA = p5.createVector(50, -700);
        posB = p5.createVector(2*off + 3*w, h);
        sclB = p5.createVector(250, -50);
        gen = { f: rnorm, p: [0, 1] };
        pdf = { f: dnorm, p: [0, 1.2] };
        let dB = new Distribution(p5, n_x, n_unif, gen, pdf, alpha, posA, sclA, posB, sclB);

        return [dA, dB];
    }

    let update_distributions = (alpha) => {
        for (let i = 0; i < distributions.length; i++) {
            distributions[i].update(alpha);
        }
    }
}

export default sketch;