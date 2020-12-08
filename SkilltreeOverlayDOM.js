




var raph;
var connections =[];


$(document).ready(function(){
  //TODO: evaluate which functions need to be recalled when new objects are added to the scene such as new nodes etc
  $(".draggable").draggable({
    handle: ".nodeBody",
    opacity: 0.35,
    drag: function(event, ui){onNodeDrag(event,ui)}
  });

  $(".nodeConnector>*").draggable({
    appendTo: "#TreeContainer",
    helper:"clone",
    start: function(event, ui){startConnection(event,ui)},
    drag: function(event, ui){onConnectionDrag(event,ui)},
    revert:"invalid"
  })
  $(".nodeConnector").droppable({
    greedy: true,
    drop: function(event, ui){onConnectionDropped(event, ui, $(this))}
  });

  $(".nodeConnector.drain>*").draggable("option","classes.ui-draggable","drain");
  $(".nodeConnector.source>*").draggable("option","classes.ui-draggable","source");

  $(".nodeConnector.drain").droppable("option","accept", ".source");
  $(".nodeConnector.source").droppable("option","accept", ".drain");

  //add correct parents; used when creating the path
  //add connectorNumber so that we can dynamically adjust the bezier curves when teh parent moves
  
  $(".nodeConnector>*").each(function(){
    $(this).attr("parent", $(this).closest(".nodeContainer").attr('id'));
    $(this).addClass("disconnected");//this is used to dynamically find free places for paths to link to
  });
  
  
  //Button functionalities
  $('.nodeConnectorContainer>button').click(function(){
    connectionCollapse($(this));
  });
  $('.expandNodeButton').click(function(){
    expandNode($(this));
  });
  $('.deleteNodeButton').click(function(){
    deleteNode($(this));
  });

  raph = Raphael("ConnectionContainer","100%","100%");

  //TODD: Make symbols change on click
  //use this for zoom https://jaukia.github.io/zoomooz/
});

function connectionCollapse(button){
  button.parent().find(".collapse:not(:first-child)").collapse('toggle');
  button.parent().find(".collapse:first-child").addClass("show");
}
function expandNode(button){
  button.parents().eq(4).find('.collapse').collapse('toggle');
}
function deleteNode(button){
  $('#deleteNodeModal').modal();
}
function startConnection(event, ui){
  var path = raph.path(createBezier(ui.position,ui.position));
  //TODO: make this concat explicit if not working
  path.attr({
    drain: ".ui-draggable-dragging",
  });

  var connectorType;
  if(ui.helper.hasClass("source")){
    connectorType = "source";
  }
  if(ui.helper.hasClass("drain")){
    connectorType = "drain";
  }

  var obj = {
    path: path,
    source: ui.helper.attr("parent"),
    drain: "helper",
    connectorType: connectorType
  }
  connections.push(obj);
  //creates a connection instance which is somehow passed to onDrag to update the contained path. Good luck!
}
function onConnectionDrag(event, ui){
  //update the path created in startConnection
  //easyest solution is to attach the path first to the handle and than later to the #TreeContainer
  //$(".ui-draggable-dragging");

  //TODO: make this with jquery and id so that it also works if the parent moves
  var connectorType = connections[connections.length-1].connectorType;
  var startPos = $("#"+connections[connections.length-1].source).find(".disconnected."+connectorType).first();
  startPos = startPos.position();
  if(connectorType == "source"){
    connections[connections.length-1].path.attr("path",createBezier(startPos, ui.position));
  }
  else{
    connections[connections.length-1].path.attr("path",createBezier(ui.position,startPos));
  }
}
//note to self: update paths by using the attribute value selector. the value could be a pair of the two connected nodes. That way only affected nodes have to be updated

function onConnectionDropped(event, ui, dock){
  ui.draggable.removeClass("disconnected").draggable("disable");
  dock.removeClass("disconnected").droppable("disable");
  connections[connections.length-1].drain = dock.children().attr("parent");
  
}

function createBezier(sourcePos, drainPos){
  
  var proportionalCurvyness = 2;
  var sx = Math.round(sourcePos.left);
  var sy = Math.round(sourcePos.top);
  var dx = Math.round(drainPos.left);
  var dy = Math.round(drainPos.top);

  proportionalCurvyness = Math.abs(proportionalCurvyness* sx - dx);
  
  var path = "M ";
  //if this doesnt work explicitly cast int to string using .toString
  path = path.concat(sx,",",sy," C ",sx + proportionalCurvyness,",", sy," ",dx-proportionalCurvyness,",",dy," ",dx,",",dy);
  console.log(path);
  //path = "M 0,0 C 0,10 90,100 100,01"

  return path;
}
function decodeBezier(path){
  let arr = path.split(" ");
  let source = arr[1];
  let drain = arr[5];
  source = {
    left: source.split(",")[0],
    top: source.split(",")[1]
  }
  drain = {
    left: drain.split(",")[0],
    top: drain.split(",")[1]
  }
  res = {
    source: source,
    drain: drain
  }
  return res;

}

function onNodeDrag(event, ui){
  /*
  for(let i=0; i<connections.length; i++){
    let currConn = connections[i];
    if(currConn.source == ui.helper.attr("id") || currConn.drain == ui.helper.attr("id")){
      //update
      //This wont work as the nodes aren't disconnected anymore at this stage. 
      //An idea would be to assign each Connector an id (can be done when draggable is attached)
      //An other more complicated idea would be to dynamically rearange the connections(which would look more pretty)
      //To do this i would jquery all the connected nodes of all the used nodes. Then I would sort the connected Nodes by heigth and therefore sort the connections accordingly
      //Best would be to have a sort function which takes as an input the id of the node, who's connections have to be rearanged
      //Additionally i would need a function, which takes an id and return all the connected nodes to it
      //The combination of the two would nicely solve the problem
      
      let source = $("#" + currConn.source).find(".disconnected");
      let drain = $("#" + currConn.drain).find(".disconnected");
      connections[i].path.attr("path", createBezier(source, drain));
      
    }
  }
  */
  rearangeConnections(ui.helper.attr("id"));

}

//id given as string not as selector
//TODO: if this is too slow precompute a adjacency list
//TODO: let this return the path aswel
function getConnectedNodes(id){
  let connectedDrain = [];//Connected with the node[id] being the drain
  let connectedSource = [];
  for(let i=0; i<connections.length; i++){
    if(connections[i].drain == id){
      connectedSource.push({
        target: connections[i].source,
        path: connections[i].path
      });
    }
    if(connections[i].source == id){
      connectedDrain.push({
        target: connections[i].drain,
        path: connections[i].path
      });
    }
  }
  let connected = {
    drains: connectedDrain,
    sources: connectedSource
  };
  return connected;
}


//TODO: only do this when nodes are not collapsed
function rearangeConnections(id){
  
  let connNodes = getConnectedNodes(id);
  if(connNodes.sources.length == 0 && connNodes.drains.length == 0){
    return;
  }
    //rearange the drains
  var drains = [];
  for(let i = 0;i < connNodes.drains.length;i++){
    //TODO: make this according to a circular or eliptic distance such that close objects which are behind still get sorted first

    //as of now it only sorts according to heigth
    //can be optimized by using only one query
    let drain = {
      posx: $("#"+connNodes.drains[i].target).position().top,
      poxy: $("#"+connNodes.drains[i].target).position().left,
      id: connNodes.drains[i].target,
      path: connNodes.drains[i].path
    }
    
    drains.push(drain);
  }
  //This function defines the sorting using inline arrow opperator
  //default sorting is lowest first but this here is inverted 
  drains.sort((a,b) => (a.posx < b.posx)? 1: -1);
  //because this are only drains we know that only this side of the connection changes
  console.log(drains);

  $("#"+id).find(".drain:not(.disconnected)").each(function(index){
    console.log(index);
    let drain = $(this).position();
    console.log(drains[index].path.attr("path"));
    let source = decodeBezier(drains[index].path.attr("path") ).source;
    drains[index].path.attr("path",createBezier(source, drain));
  })
  


  //TODO: only change this end of the connection. We can leave the other side by querying the other side of teh connection first using our list of connections then attr then path and then we query the endpoint
  

}



//note to self: //deprecated
/*
  Try to have all the needed data contained within the html. Parse the data from the html using jquery selectors when needed
*/

//TODO: Make all those functions generalized for all the node types
