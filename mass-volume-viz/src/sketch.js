import p5 from './p5.min.js';
global.p5 = p5;

export default class Sketch {

    constructor() {
        new p5(this.sketch);
    }

    sketch = (p5) => {

        p5.preload = () => {
            // fontRegular = loadFont('assets/Kulim_Park/KulimPark-Regular.ttf');
            // fontSemiBold = loadFont('assets/Kulim_Park/KulimPark-SemiBold.ttf');
            // fontBold = loadFont('assets/Kulim_Park/KulimPark-Bold.ttf');
        }

        p5.setup = () => {
            var canvas = p5.createCanvas(100, 100);
            canvas.parent('sketch-holder');
            p5.background(255, 0, 200);
        }
    }

}



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