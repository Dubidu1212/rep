





class node{
    constructor(){
        this.title = "";
        this.children = [];
        this.parents = [];

        this.description = "";
        
    }
}

var stageWidth = document.getElementById('canvasArea').clientWidth;
var stageHeigth = window.innerHeight  - document.getElementById('Navbar').offsetHeight;



var stage = new Konva.Stage({
    container: 'canvasArea',
    width: stageWidth,
    height: stageHeigth,
    draggable: true,
});

var layer = new Konva.Layer();
stage.add(layer)

var circle = new Konva.Circle({
    radius: 50,
    fill: 'red',
    x: stage.width() / 2,
    y: stage.height() / 2,
});
layer.add(circle);

var rect = new Konva.Rect({
    fill: 'green',
    x: stage.width() - 100,
    y: stage.height() - 100,
    width: 100,
    height: 100,
});
layer.add(rect);



layer.draw();

var scaleBy = 0.95;
stage.on('wheel', (e) => {
    e.evt.preventDefault();
    var oldScale = stage.scaleX();

    var pointer = stage.getPointerPosition();

    var mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
    };

    var newScale = e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    var newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
});


//init Stage
var startWidth = document.getElementById('canvasArea').clientWidth;
var startHeight = window.innerHeight  - document.getElementById('Navbar').offsetHeight;
stage.width(startWidth);
stage.height(startHeight);
stage.batchDraw();

function fitStageIntoParentContainer() {
    var container = document.querySelector('#stage-parent');

    
    var containerWidth = document.getElementById('canvasArea').clientWidth;
    var containerHeight = window.innerHeight  - document.getElementById('Navbar').offsetHeight;
    
    console.log("containerHeight");
    console.log(containerHeight);

    console.log("containerWidth");
    console.log(containerWidth);

    console.log("NavH");
    console.log(document.getElementById('Navbar').offsetHeight);

    
    stage.width(containerWidth);
    stage.height(containerHeight);

    //todo try to add in canvas scale
    
    stage.scale(containerHeight/ startHeight);

    //counter with scale
    stage.batchDraw();
  }

// adapt the stage on any window resize
window.addEventListener('resize', fitStageIntoParentContainer);

