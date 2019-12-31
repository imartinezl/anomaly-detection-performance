import './setup.js';
import Distribution from './distribution.js';

let sketch = (p5) => {

    var j, jj, alpha, distributions;

    let init = () => {
        j = 0;
        jj = 1;
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

    p5.setup = () => {
        var canvas = p5.createCanvas(1000, 1000);
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
        let alpha_min = 0; //alpha_min_slider.value();
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
        let posA = p5.createVector(300, 400);
        let sclA = p5.createVector(70, -700);
        let posB = p5.createVector(600, 400);
        let sclB = p5.createVector(300, -50);

        let gen = { f: generateGaussian, p: [0, 1] };
        let pdf = { f: dnorm, p: [0, 1] };
        // gen = { f: custom_gen, p: [] };
        // pdf = { f: custom_pdf, p: [] };
        let dA = new Distribution(p5, n_x, n_unif, gen, pdf, alpha, posA, sclA, posB, sclB);

        posA = p5.createVector(300, 800);
        sclA = p5.createVector(70, -700);
        posB = p5.createVector(600, 800);
        sclB = p5.createVector(300, -50);
        gen = { f: generateGaussian, p: [0, 1] };
        pdf = { f: dnorm, p: [0, 1.2] };
        let dB = new Distribution(p5, n_x, n_unif, gen, pdf, alpha, posA, sclA, posB, sclB);

        // distributions = [dA, dB];
        return [dA, dB];
        // return distributions;
    }

    let update_distributions = (alpha) => {
        for (let i = 0; i < distributions.length; i++) {
            distributions[i].update(alpha);
        }
    }
}

export default sketch;



// let env, j = 0,
//     jj = 1;
// let fontRegular, fontSemiBold, fontBold;

// init = () => {
//   init_slider();
//   generate_alpha();
//   generate_distributions();
// }

// update = () => {
//   j = 0;
//   jj = 1;
//   generate_alpha();
//   update_distributions();
// }

// setup = () => {
//   createCanvas(1000, 1000);
//   background("#F6F6F6");
//   env = new Environment();
//   init();
// }

// draw = () => {
//   background("#F6F6F6");
//   //env.display();
//   for (let i = 0; i < distributions.length; i++) {
//     distributions[i].display(j);
//   }
//   j += jj;
//   if (j >= alpha.length - 1 | j < 0) {
//     jj *= -1;
//     j += jj;
//   }
// }