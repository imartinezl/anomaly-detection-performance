class Environment {
    

    title(){
        translate(50,50);
        fill(0);
        noStroke();
        textSize(40);
        text('TITLE', 0,0);

    }
    display(){
        push();
        this.title();
        pop();
    }
}