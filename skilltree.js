





class node{
    constructor(){
        this.title = "";
        this.children = [];
        this.parents = [];

        this.description = "";
        
    }
}








var stageWidth = 1000;
var stageHeigth = 1000;

var stage = new Konva.Stage({
    container: 'nav-home',
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

var scaleBy = 1.05;
stage.on('wheel', (e) => {
    e.evt.preventDefault();
    var oldScale = stage.scaleX();

    var pointer = stage.getPointerPosition();

    var mousePointTo = {
    x: (pointer.x - stage.x()) / oldScale,
    y: (pointer.y - stage.y()) / oldScale,
    };

    var newScale =
    e.evt.deltaY > 0 ? oldScale * scaleBy : oldScale / scaleBy;

    stage.scale({ x: newScale, y: newScale });

    var newPos = {
    x: pointer.x - mousePointTo.x * newScale,
    y: pointer.y - mousePointTo.y * newScale,
    };
    stage.position(newPos);
    stage.batchDraw();
});
//TODO: resize borders of canvas


function fitStageIntoParentContainer() {
    var container = document.querySelector('#stage-parent');

    // now we need to fit stage into parent
    var containerWidth = container.clientWidth;
    var containerHeight = container.clientHeight;
    // to do this we need to scale the stage
    console.log(containerHeight);
    console.log(containerWidth);

    stage.width(containerWidth);
    stage.height(containerHeight);
    //stage.scale({ x: scale, y: scale });
    stage.draw();
  }

fitStageIntoParentContainer();
// adapt the stage on any window resize
window.addEventListener('resize', fitStageIntoParentContainer);
