


class node {
    constructor(){
        // use this instead of canvas to more easyly utilize input fields and other dom elements
       O
        
    }
}



//initialize tooltips

window.onload = function() {
    $('[data-toggle="tooltip"]').tooltip(); 
}
var stageWidth = window.innerWidth;
var stageHeigth = window.innerHeight;

var stage = new Konva.Stage({
    container: 'TreeContainer',
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
var startWidth = window.innerWidth;
var startHeight = window.innerHeight;
stage.width(startWidth);
stage.height(startHeight);
stage.batchDraw();

function resizeCanvas() {
   

    
    var containerWidth = window.innerWidth;
    var containerHeight = window.innerHeight;
    
    console.log("containerHeight");
    console.log(containerHeight);

    console.log("containerWidth");
    console.log(containerWidth);


    
    stage.width(containerWidth);
    stage.height(containerHeight);

    //todo try to add in canvas scale
    
    stage.scale(containerHeight/ startHeight);

    //counter with scale
    stage.batchDraw();
  }

// adapt the stage on any window resize
window.addEventListener('resize', resizeCanvas);
