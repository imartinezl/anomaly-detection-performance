"use strict";

import './style.css';
import p5 from './p5.min.js';
import sketch from './sketch.js';


//import './setup.js';
//import './environment.js';
//import './distribution.js';

export default class App {

    constructor() {
        new p5(sketch);
    }

    init() {

    }
}