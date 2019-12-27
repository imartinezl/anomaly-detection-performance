
class Distribution {

  constructor(nx, nunif, pos, scl) {
    this.nx = nx;
    this.nunif = nunif;
    this.pos = pos;
    this.scl = scl;
    this.generate_data();
    this.generate_uniform_data();

  }

  // get ordered indexes
  order(x) {
    let id = new Array(x.length);
    for (var i = 0; i < x.length; ++i) id[i] = i;
    id.sort(function (a, b) { return x[a] < x[b] ? -1 : x[a] > x[b] ? 1 : 0; });
    return id;
  }

  // generate data
  generate_data() {
    this.x = [], this.fx = [], this.sx = [];
    for (let i = 0; i < this.nx; i++) {
      let value = randomGaussian(0, 1)
      this.x.push(value);
      this.fx.push(pdf(value, 0, 1.5));
      this.sx.push(pdf(value, 0, 1));
    }
    this.id_x = this.order(this.x);
    this.id_sx = this.order(this.sx)
  }

  // generate uniform data
  generate_uniform_data() {
    this.unif = [], this.funif = [], this.sunif = [];
    this.lim_y = Math.max(Math.max.apply(Math, this.fx), Math.max.apply(Math, this.sx));
    this.lim_inf = Math.min.apply(Math, this.x);
    this.lim_sup = Math.max.apply(Math, this.x);
    this.volume_support = this.lim_sup - this.lim_inf;
    for (let i = 0; i < this.n_unif; i++) {
      let value = uniform(this.lim_inf, this.lim_sup)
      this.unif.push(value);
      this.funif.push(pdf(value, 0, 1.5));
      this.sunif.push(pdf(value, 0, 1));
    }
    this.id_unif = this.order(this.unif);
  }

  get_threshold(alpha) {
    let mass = 0;
    let cont = 0;
    let t = 0;
    while (mass < alpha) {
      cont++;
      t = s_x[id_s_x[n_x - cont - 1]];
      mass = cont / n_x;
    }
    return t;
  }

  get_cut_points(t) {

    let sign_prev;
    let cut_index = [0];
    let cut_sign = [-1];
    for (let i = 0; i < this.nunif; i++) {
      let pos = this.id_unif[i];
      let sign = Math.sign(this.sunif[pos] - t);
      if (sign_prev && sign - sign_prev !== 0) {
        cut_index.push(i - 1);
        cut_sign.push(sign_prev);
      }
      sign_prev = sign;
    }
    cut_index.push(this.nunif - 2);
    cut_sign.push(-1);
    //console.log(cut_index, cut_sign);

    let cut_points = [];
    let cont = 0;
    for (let i = 0; i < cut_index.length - 1; i++) {
      let good = cut_sign[i] * cut_sign[i + 1] === -1;
      if (good) {
        if (cont % 2 === 0) {
          cut_points.push({ a: cut_index[i], b: cut_index[i + 1] });
        }
        cont++;
      }
    }
    return cut_points;
  }

  update(alpha) {
    this.alpha = alpha;
    this.t = this.get_threshold(this.alpha);
    this.cut_points = this.get_cut_points(this.t);
  }

  display() {
    //push();
    translate(this.pos.x, this.pos.y);
    this.plot_axis();
    //this.plot_fx();
    //pop()
  }

  // plot_axis
  plot_axis() {
    noFill();
    strokeWeight(1/10);
    stroke(0);
    line(this.lim_inf*this.scl.x, 0, this.lim_sup*this.scl.x, 0);
    line(0, 0, 0, this.lim_y*this.scl.y);
  }

  // plot true density
  plot_fx() {
    noFill();
    stroke(255, 0, 0);
    beginShape();
    for (let i = 0; i < this.nx; i++) {
      let pos = this.id_x[i]
      vertex(this.x[pos], this.fx[pos]);
    }
    endShape();
  }

  // plot scoring function
  plot_sx() {
    noFill();
    stroke(0, 255, 0);
    beginShape();
    for (let i = 0; i < this.nx; i++) {
      let pos = this.id_x[i]
      vertex(this.x[pos], this.sx[pos]);
    }
    endShape();
  }

  // plot rug on margin
  plot_rug() {
    noFill();
    stroke(0, 50);
    strokeWeight(0.5);
    for (let i = 0; i < this.nx; i++) {
      push();
      let pos = this.id_x[i]
      translate(this.x[pos], 1);
      line(0, 0, 0, 1);
      pop();
    }

  }

  // plot threshold line
  plot_threshold() {
    line(this.lim_inf, this.t, this.lim_sup, this.t);
  }

  // plot cut points
  plot_cut_points(){

    strokeWeight(4);
    fill(255, 0, 0, 100);
    for (let i = 0; i < this.cut_points.length; i++) {
      let a = this.cut_points[i].a;
      let b = this.cut_points[i].b;
      let xa = this.unif[this.id_unif[a]];
      let xb = this.unif[this.id_unif[b]];
      //line(xa*sx, t*sy, xb*sx, t*sy);
      beginShape();
      vertex(xa, 0);
      for (let j = a; j <= b; j++) {
        let xj = this.unif[this.id_unif[j]];
        let yj = this.sunif[this.id_unif[j]];
        vertex(xj, yj);
      }
      vertex(xb, 0);
      endShape(CLOSE);
    }
  }
}



let d;

setup = () => {
  createCanvas(600, 600);
  background("#F6F6F6");

  let n_x = 1000;
  let n_unif = 1000;
  let pos = createVector(width / 2, height / 2);
  let scl = createVector(50, -500);
  d = new Distribution(n_x, n_unif, pos, scl);

  // generate alpha
  // let alpha_min = 0.0;
  // let alpha_max = 0.999;
  // let alpha_by = 0.001;
  // let alpha = [];
  // for (let a = alpha_min; a <= alpha_max; a+=alpha_by) {
  //   alpha.push(a)
  // }
  let a = 0.98;
  d.update();
  d.display();



}

// draw = () => {
//   background("#F6F6F6");

//   // for(v in x){
//   //   console.log(v);
//   // }
// }


pdf = function (x, mean, std) {
  var m = std * Math.sqrt(2 * Math.PI);
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * pow(std, 2)));
  return e / m;
};

uniform = (min, max) => {
  return Math.random() * (max - min) + min;
}

Array.prototype.sortIndices = function (func) {
  var i = j = this.length,
    that = this;

  while (i--) {
    this[i] = { k: i, v: this[i] };
  }

  this.sort(function (a, b) {
    return func ? func.call(that, a.v, b.v) :
      a.v < b.v ? -1 : a.v > b.v ? 1 : 0;
  });

  while (j--) {
    this[j] = this[j].k;
  }
}