let distributions, alpha;

let alpha_min_slider;
init_slider = () => {
    alpha_min_slider = createSlider(0, 1, 0, 0.001);
    alpha_min_slider.position(10, 100);
    alpha_min_slider.input(update);
}

generate_alpha = () => {
    //generate alpha
    let alpha_min = alpha_min_slider.value();
    let alpha_max = 0.99;
    let alpha_by = 0.005;
    alpha = [];
    for (let a = alpha_min; a <= alpha_max; a += alpha_by) {
        alpha.push(a);
    }
}

generate_distributions = () => {
    let n_x = 1000;
    let n_unif = 10000;
    let posA = createVector(300, 400);
    let sclA = createVector(70, -700);
    let posB = createVector(600, 400);
    let sclB = createVector(300, -50);

    let gen = { f: randomGaussian, p: [0, 1] };
    let pdf = { f: dnorm, p: [0, 1] };
    //gen = { f: custom_gen, p: [] };
    //pdf = { f: custom_pdf, p: [] };
    let dA = new Distribution(n_x, n_unif, gen, pdf, alpha, posA, sclA, posB, sclB);

    posA = createVector(300, 800);
    sclA = createVector(70, -700);
    posB = createVector(600, 800);
    sclB = createVector(300, -50);
    gen = { f: randomGaussian, p: [0, 1] };
    pdf = { f: dnorm, p: [0, 1.2] };
    let dB = new Distribution(n_x, n_unif, gen, pdf, alpha, posA, sclA, posB, sclB);

    distributions = [dA, dB];
}

update_distributions = () => {
    for (let i = 0; i < distributions.length; i++) {
        distributions[i].update(alpha);
    }
}



custom_gen = (seed) => {
    let num;
    if (random() > 0.5) num = randomGaussian(0, 1);
    else num = randomGaussian(5, 1.5);
    return num
}

custom_pdf = (x) => {
    let num = dnorm(x, 0, 1) + dnorm(x, 5, 1.5);// + random()/100;
    return num
}


dnorm = (x, mean, std) => {
    var m = std * Math.sqrt(2 * Math.PI);
    var e = Math.exp(-Math.pow(x - mean, 2) / (2 * pow(std, 2)));
    return e / m;
};