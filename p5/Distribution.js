class Distribution {

    constructor(nx, nunif, gen, pdf, alpha, posA, sclA, posB, sclB) {
        this.nx = nx;
        this.nunif = nunif;
        this.gen = gen;
        this.pdf = pdf;
        this.alpha = alpha;
        this.posA = posA;
        this.sclA = sclA;
        this.posB = posB;
        this.sclB = sclB;
        colorMode(HSB, 255)
        this.color = color(random(255), 255, 255, 100);
        this.init();
    }

    init() {
        this.generate_data();
        this.generate_uniform_data();

        this.n = this.alpha.length;
        this.threshold = [];
        this.cut_points = [];
        this.volume = [];
        for (let j = 0; j < this.n; j++) {
            let t = this.get_threshold(this.alpha[j]);
            let cp = this.get_cut_points(t);
            let v = this.get_volume(cp);
            this.threshold.push(t);
            this.cut_points.push(cp);
            this.volume.push(v)
        }

    }

    update(alpha){
        this.alpha = alpha;
        this.init();
    }

    // generate data
    generate_data() {
        this.x = [], this.sx = [];
        for (let i = 0; i < this.nx; i++) {
            let value = this.gen.f(...this.gen.p);
            this.x.push(value);
            this.sx.push(this.pdf.f(value, ...this.pdf.p));
        }
        this.id_x = this.order(this.x);
        this.id_sx = this.order(this.sx)
    }

    // generate uniform data
    generate_uniform_data() {
        this.unif = [], this.sunif = [];
        this.lim_y = Math.max.apply(Math, this.sx);
        this.lim_inf = Math.min.apply(Math, this.x);
        this.lim_sup = Math.max.apply(Math, this.x);
        this.volume_support = this.lim_sup - this.lim_inf;
        for (let i = 0; i < this.nunif; i++) {
            let value = this.runif(this.lim_inf, this.lim_sup);
            this.unif.push(value);
            this.sunif.push(this.pdf.f(value, ...this.pdf.p));
        }
        this.id_unif = this.order(this.unif);
    }
    runif = (min, max) => {
        return Math.random() * (max - min) + min;
    }

    // get ordered indexes
    order(x) {
        let id = new Array(x.length);
        for (var i = 0; i < x.length; ++i) id[i] = i;
        id.sort(function (a, b) { return x[a] < x[b] ? -1 : x[a] > x[b] ? 1 : 0; });
        return id;
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

    get_volume(cp) {
        let v = 0;
        for (let k = 0; k < cp.length; k++) {
            let a = cp[k].a;
            let ax = this.unif[this.id_unif[a]];
            let b = cp[k].b;
            let bx = this.unif[this.id_unif[b]];
            v += bx - ax;
        }
        return v;
    }

    display(j) {
        push();
        translate(this.posA.x, this.posA.y);
        this.plot_axis();
        this.plot_sx();
        this.plot_rug();
        if (this.threshold[j]) this.plot_threshold(j);
        if (this.cut_points[j]) this.plot_cut_points(j);
        pop();
        push();
        translate(this.posB.x, this.posB.y);
        if (this.volume[j]) this.plot_mass_volume(j);
        pop();
    }

    // plot_axis
    plot_axis() {
        noFill();
        strokeWeight(1);
        stroke(0);
        line(this.lim_inf * this.sclA.x, 0, this.lim_sup * this.sclA.x, 0);
        line(0, 0, 0, this.lim_y * this.sclA.y);
    }

    // plot scoring function
    plot_sx() {
        noFill();
        strokeWeight(1.5);
        stroke(this.color);
        beginShape();
        for (let i = 0; i < this.nx; i++) {
            let pos = this.id_x[i]
            vertex(this.x[pos] * this.sclA.x, this.sx[pos] * this.sclA.y);
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
            translate(this.x[pos] * this.sclA.x, 10);
            line(0, 0, 0, 10);
            pop();
        }

    }

    // plot threshold line
    plot_threshold(j) {
        let t = this.threshold[j];
        strokeWeight(1);
        stroke(this.color);
        noFill();
        line(this.lim_inf * this.sclA.x, t * this.sclA.y, this.lim_sup * this.sclA.x, t * this.sclA.y);
    }

    // plot cut points
    plot_cut_points(j) {
        let cp = this.cut_points[j]
        for (let i = 0; i < cp.length; i++) {
            let a = cp[i].a;
            let b = cp[i].b;
            let xa = this.unif[this.id_unif[a]];
            let xb = this.unif[this.id_unif[b]];
            
            noStroke();
            fill(this.color);
            beginShape();
            vertex(xa * this.sclA.x, 0);
            for (let j = a; j <= b; j++) {
                let xj = this.unif[this.id_unif[j]];
                let yj = this.sunif[this.id_unif[j]];
                vertex(xj * this.sclA.x, yj * this.sclA.y);
            }
            vertex(xb * this.sclA.x, 0);
            endShape(CLOSE);
            
            fill(0);
            circle(xa * this.sclA.x, this.threshold[j]*this.sclA.y,4);
            circle(xb * this.sclA.x, this.threshold[j]*this.sclA.y,4);
        }
    }

    plot_mass_volume(j) {

        // let scl_a = 300/(this.alpha[this.n-1]-this.alpha[0]);
        // let scl_v = -30//(this.volume[this.n-1]-this.volume[0]);
        scl_a = this.sclB.x;
        scl_v = this.sclB.y;
        let tmp_alpha = this.alpha.map(e => e * scl_a);
        let tmp_volume = this.volume.map(e => e * scl_v);

        let alpha_min = tmp_alpha[0];
        let alpha_max = tmp_alpha[this.n - 1];
        let alpha_j = tmp_alpha[j];
        let volume_min = tmp_volume[0];
        let volume_max = tmp_volume[this.n - 1];
        let volume_j = tmp_volume[j];

        let origin = createVector(alpha_min, volume_min);
        let last = createVector(alpha_max, volume_max).sub(origin);
        noFill();
        strokeWeight(1);
        stroke(0);
        line(0, 0, last.x, 0);
        line(0, 0, 0, last.y);
        fill(0);
        noStroke();
        textSize(16);
        textAlign(RIGHT, BOTTOM);
        text("Volume\n(x)", 0, last.y);
        textAlign(LEFT, TOP);
        text("Mass (area)", last.x, 0);

        let point = createVector(alpha_j, volume_j).sub(origin);
        noFill();
        strokeWeight(2);
        stroke(this.color);
        line(point.x, 0, point.x, point.y)
        line(0, point.y, point.x, point.y)
        circle(point.x, point.y, 3)

        let alpha_value = Math.round(this.alpha[j] * 100) / 100;
        let volume_value = Math.round(this.volume[j] * 100) / 100;
        fill(0);
        noStroke();
        textSize(16);
        textAlign(CENTER, TOP);
        text(alpha_value, point.x, 0)
        textAlign(RIGHT, BOTTOM);
        text(volume_value, 0, point.y)

        noFill();
        strokeWeight(4);
        stroke(this.color);
        beginShape();
        for (let i = 0; i < this.n; i++) {
            let pi = createVector(tmp_alpha[i], tmp_volume[i]).sub(origin);
            vertex(pi.x, pi.y);
        }
        endShape()


    }
}