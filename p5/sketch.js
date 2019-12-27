
class Distribution {

  constructor(nx, nunif, pos, scl) {
    this.nx = nx;
    this.nunif = nunif;
    this.pos = pos;
    this.scl = scl;
    this.generate_data();
    this.generate_uniform_data();
    this.color = color(random(255),random(255),random(255),100);

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
    this.x = [], this.sx = [];
    for (let i = 0; i < this.nx; i++) {
      let value = randomGaussian(0, 1)
      this.x.push(value);
      this.sx.push(pdf(value, 0, 1));
    }
    this.id_x = this.order(this.x);
    this.id_sx = this.order(this.sx)
  }

  // generate uniform data
  generate_uniform_data() {
    this.unif = [], this.funif = [], this.sunif = [];
    this.lim_y = Math.max.apply(Math, this.sx);
    this.lim_inf = Math.min.apply(Math, this.x);
    this.lim_sup = Math.max.apply(Math, this.x);
    this.volume_support = this.lim_sup - this.lim_inf;
    for (let i = 0; i < this.nunif; i++) {
      let value = uniform(this.lim_inf, this.lim_sup);
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
      t = this.sx[this.id_sx[this.nx - cont - 1]];
      mass = cont / this.nx;
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
    let t = this.get_threshold(alpha);
    let cut_points = this.get_cut_points(t);
    return {alpha, t, cut_points};
  }

  set_data(data){
    this.alpha = data.alpha;
    this.t = data.t;
    this.cut_points = data.cut_points;
  }

  display() {
    translate(this.pos.x, this.pos.y);
    this.plot_axis();
    //this.plot_fx();
    this.plot_sx();
    this.plot_rug();
    if(this.t) this.plot_threshold();
    if(this.cut_points) this.plot_cut_points();
  }

  // plot_axis
  plot_axis() {
    noFill();
    strokeWeight(1);
    stroke(0);
    line(this.lim_inf*this.scl.x, 0, this.lim_sup*this.scl.x, 0);
    line(0, 0, 0, this.lim_y*this.scl.y);
  }

  // plot scoring function
  plot_sx() {
    noFill();
    strokeWeight(1.5);
    stroke(this.color);
    beginShape();
    for (let i = 0; i < this.nx; i++) {
      let pos = this.id_x[i]
      vertex(this.x[pos]*this.scl.x, this.sx[pos]*this.scl.y);
    }
    endShape();
  }

  // plot rug on margin
  plot_rug() {
    noFill();
    strokeWeight(0.5);
    stroke(this.color);
    for (let i = 0; i < this.nx; i++) {
      push();
      let pos = this.id_x[i]
      translate(this.x[pos]*this.scl.x, 10);
      line(0, 0, 0, 10);
      pop();
    }

  }

  // plot threshold line
  plot_threshold() {
    strokeWeight(1);
    stroke(this.color);
    noFill();
    line(this.lim_inf*this.scl.x, this.t*this.scl.y, this.lim_sup*this.scl.x, this.t*this.scl.y);
  }

  // plot cut points
  plot_cut_points(){
    stroke(0);
    strokeWeight(0);
    //this.color.setAlpha(100);
    fill(this.color);
    for (let i = 0; i < this.cut_points.length; i++) {
      let a = this.cut_points[i].a;
      let b = this.cut_points[i].b;
      let xa = this.unif[this.id_unif[a]];
      let xb = this.unif[this.id_unif[b]];
      beginShape();
      vertex(xa*this.scl.x, 0);
      for (let j = a; j <= b; j++) {
        let xj = this.unif[this.id_unif[j]];
        let yj = this.sunif[this.id_unif[j]];
        vertex(xj*this.scl.x, yj*this.scl.y);
      }
      vertex(xb*this.scl.x, 0);
      endShape(CLOSE);
    }
  }
}



let d;
let j = 0, jj=1, data = [];

setup = () => {
  createCanvas(600, 600);
  background("#F6F6F6");
  //colorMode(HSB);

  let n_x = 1000;
  let n_unif = 10000;
  let pos = createVector(width / 2, height-100);
  let scl = createVector(70, -700);
  d = new Distribution(n_x, n_unif, pos, scl);

  //generate alpha
  let alpha_min = 0.0;
  let alpha_max = 0.999;
  let alpha_by = 0.005;
  for (let alpha = alpha_min; alpha <= alpha_max; alpha+=alpha_by) {
    let tmp = d.update(alpha);
    data.push(tmp);
  }
  d.display();
}

draw = () => {
  background("#F6F6F6");
  d.set_data(data[j]);
  d.display();
  j+= jj;
  if(j >= data.length-1 | j < 0){
    jj *= -1;
    j += jj;
  }
}


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