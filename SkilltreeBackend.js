
//TODO: rework the entire path mechanism as i have completely missed the point of raphael
//The thing I thought was creating paths was actually just creating a container with all the paths
//instead of using connections I can use raphael but i have to try and figure out how to get the oldest path. Maybe raphael allows me to add attributes or just save the id of the path in connections


var raph;

//connections is a adjacency list implemented as set of arrays. Elements are only added once the connection is dropped
//raphael draws the connections by using jquery. 
//raphael updates every time that the scene changes (eg drag and drop operations)
//connections only updates when nodes/connections are deleted or new connections are made.
//connections is priarily intended to be read to find adjacient nodes, not to actively draw the nodes
//connections points from source to drain
var connections = [];

//same as connections but points from drain to source
var invConnections = [];


//This is the path that leads to the helper at the moment
//This is "null" when no connections are being draged
var currentPath = null;



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
    stop: function(event, ui){stopConnection(event,ui)},
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
  
  //Assigns to each child of nodeConnector a parent variable, which can be used later in the drag function
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
  console.log("delete");
  
  $("#deleteNodeModal").find(".yesButton").on("click", function(){
    button.closest(".nodeContainer").remove();
  });
  $('#deleteNodeModal').modal();
    

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
  console.log("created Bezier", path);
  //path = "M 0,0 C 0,10 90,100 100,01"

  return path;
}

//Forces the connectors to rearange
function onNodeDrag(event, ui){
    
}


//Initiates the path from the node to the helper
function startConnection(event, ui){
  
  console.assert(currentPath === null, "currentPath not null on initialisation of new path");

  var connectorType;
  if(ui.helper.hasClass("source")){
    connectorType = "source";
  }
  if(ui.helper.hasClass("drain")){
    connectorType = "drain";
  }

  //assigns the newly created path to currentPath
  var path = raph.path(createBezier(ui.position,ui.position));
  currentPath = {
    path: path,
    //This works, because in the beginning each connector (helper) receives the parent attribute
    node: ui.helper.attr("parent"),
    conType: connectorType,
  };

  //sets the id of the helper to be used in the rearange function
  ui.helper.attr("id", "helper");

}

//Updates the path to the helper as the helper is dragged
//also causes rearangement of connectors as the path to the helper is forced to cross connections of the own node
function onConnectionDrag(event, ui){

  //Fetches all the connections on the same side as the new one
  var locConnections = [];
  if(currentPath.conType == "source"){
    locConnections = connections[currentPath.node];
  }
  else{
    locConnections = invConnections[currentPath.node];
  }

  if(locConnections == null){
    locConnections = [];
  }

  locConnections.push("helper");
  
  //This part rearanges the other connections
  var order = calcRearangeConnecors(currentPath.node,locConnections);
  updateConnections(currentPath.node, order);

  //draws the path to the helper
  //THIS IS WHERE I LEFT OF


  //currentPath.path(createBezier());
}


//Adds the new connection to connections, also adds new handles to both the source and drain.
//Releases the path to handle to be a path to node
//Updates the drain to avoid autointersections
function onConnectionDropped(event, ui){
  
}

//This function is called every time a connection is stopped being dragged (be it because of legal or illegal drop)
//Removes the helper id form the helper
function stopConnection(event, ui){
  ui.helper.removeAttr("id");
  currentPath = null;
}

//Takes as an input the id of a node and a list of all id's of connected entities (probably 1 helper and the rest nodes)
//Sorts the destinations by height (later by a metric which prevents crossing of the bezier curves)
//returns the rearanged list of nodes/helper
//input should only contain elements from same type eg (sources or drains)
function calcRearangeConnecors(node, locConnections){
  //this only becomes relevant once I consider a circular/eliptical distance metric
  //$("#"+node).position();

  //transfers the connections into an array of pairs(id, heigth)
  for(let i = 0; i< locConnections.length; i++){
    let c = locConnections[i];
    locConnections[i] = {
      id: c,
      h:$("#"+c).position().top,
    }
  }

  //sort by heigth ascending in topdistance eg descending in screeen position
  locConnections.sort(function(a,b){
    return a.h - b.h;
  });

  return locConnections;
}


//returns the path which connects n1 and n2
//TODO: Find case for double connections
function findPath(n1, n2){

}

//redraws the path to a certain node given the order
//leaves out the helper
function updateConnections(node, order){

}


//TODO: Make all those functions generalized for all the node types

//TODO: Implement without assumption of open connectors