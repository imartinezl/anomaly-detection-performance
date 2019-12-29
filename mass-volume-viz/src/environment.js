class Environment {
    
    constructor(){
        this.init();
    }
    
    display_title(){       
        this.title = createDiv('Statistics: Mass-Volume');
        this.title.position(40,20);
        this.title.style('font-size', '24px');
        this.title.style('font-family', 'KulimPark-SemiBold');
        this.title.style('color', '#000000');
    }
    
    
    init(){
        console.log("hey");
        this.display_title();
        this.bar = createDiv('<hr>');
        this.bar.position(40,20);
    }

    display(){
        push();
        //this.display_title();
        pop();
    }
}