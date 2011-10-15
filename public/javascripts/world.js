var camera, scene, renderer, projector;

var fov = 70,
texture_placeholder,
isUserInteracting = false,
onMouseDownMouseX = 0, onMouseDownMouseY = 0,
lon = 0, onMouseDownLon = 0,
lat = 0, onMouseDownLat = 0,
phi = 0, theta = 0, objects = [];

var content = {
  "window" : {
    title : "This is a window",
    details : "You can look through me to see the world outside"
  },
  
  "socket" : {
    title : "This is a plug socket",
    details : "You can use me to power things"
  }
}, 
contentDom = document.querySelector("#contentDom"),
contentTitle = contentDom.querySelector("#contentTitle"),
contentDetails = contentDom.querySelector("#contentDetails");

init();
animate();

function init() {

	var container, mesh, contentMesh1;

	container = document.getElementById( 'container' );

	camera = new THREE.Camera( fov, window.innerWidth / window.innerHeight, 1, 1100 );

	scene = new THREE.Scene();

	mesh = new THREE.Mesh( new THREE.Sphere( 500, 60, 40 ), new THREE.MeshBasicMaterial( { map: THREE.ImageUtils.loadTexture( '/images/panorama.jpg' ) } ) );
	mesh.scale.x = -1;
	scene.addObject( mesh );
	
	
	/* contentObject */
	
	var object1= new THREE.Mesh( new THREE.Sphere( 50, 16, 16 ), new THREE.MeshLambertMaterial({ color: 0xCC0000 }) );
	scene.addObject( object1 );
	
	object1.position.x = -435.217578748312;
  object1.position.y = -227.77245361675767;
  object1.position.z = 93.30256439058276;
  
  object1.contentData = "socket";
  
  objects.push( object1 )
  
  var object2 = new THREE.Mesh( new THREE.Sphere( 50, 16, 16 ), new THREE.MeshLambertMaterial({ color: 0xCC0000 }) );
	scene.addObject( object2 );
	
	object2.position.x = 489.86611857857986;
  object2.position.y = 16.577589194263247;
  object2.position.z = 98.77433576219552;
  
  object2.contentData = "window";
  
  objects.push( object2 )
  
  projector = new THREE.Projector();

	renderer = new THREE.WebGLRenderer();
	renderer.setSize( window.innerWidth, window.innerHeight );

	container.appendChild( renderer.domElement );

	document.addEventListener( 'mousedown', onDocumentMouseDown, false );
	document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	document.addEventListener( 'mouseup', onDocumentMouseUp, false );
	document.addEventListener( 'mousewheel', onDocumentMouseWheel, false );
	document.addEventListener( 'DOMMouseScroll', onDocumentMouseWheel, false);

}

var socket = io.connect('http://192.168.228.86');
socket.on('changeOrientation', function (msg) {
  lon -= msg.ay;
  lat += msg.ax;
});

socket.on('clientClick', function (msg) {
  
	var intersects = makeClickRay( 0, 0, 0.5 );
	
	if ( intersects.length > 0 ) {
	  var data = intersects[ 0 ].object.contentData
	  socket.emit('clickMessage', { title: content[data].title, details: content[data].details });
	}
});
/*
window.ondeviceorientation = function(e) {
  lon += e.gamma;//( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
	lat += e.beta//( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;
  //console.log(e.beta, e.gamma)
}*/

function makeClickRay(x,y,z) {
  
  var vector = new THREE.Vector3( x, y, z );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	return ray.intersectObjects( objects );
}

function onDocumentMouseDown( event ) {

	event.preventDefault();

	isUserInteracting = true;

	onPointerDownPointerX = event.clientX;
	onPointerDownPointerY = event.clientY;

	onPointerDownLon = lon;
	onPointerDownLat = lat;

	var intersects = makeClickRay(( onPointerDownPointerX / window.innerWidth ) * 2 - 1, - ( onPointerDownPointerY / window.innerHeight ) * 2 + 1, 0.5);

	if ( intersects.length > 0 ) {
    infoOn(intersects[ 0 ].object.contentData);
	}
}

function infoOn(data) {
  contentTitle.innerHTML = content[data].title;
	contentDetails.innerHTML = content[data].details;
  contentDom.className = "active";
}

function infoOff() {
  contentDom.className = "";
}

function onDocumentMouseMove( event ) {

	if ( isUserInteracting ) {

		lon = ( onPointerDownPointerX - event.clientX ) * 0.1 + onPointerDownLon;
		lat = ( event.clientY - onPointerDownPointerY ) * 0.1 + onPointerDownLat;

	}
}

function onDocumentMouseUp( event ) {

	isUserInteracting = false;

}

function onDocumentMouseWheel( event ) {

	// WebKit

	if ( event.wheelDeltaY ) {

		fov -= event.wheelDeltaY * 0.05;

	// Opera / Explorer 9

	} else if ( event.wheelDelta ) {

		fov -= event.wheelDelta * 0.05;

	// Firefox

	} else if ( event.detail ) {

		fov += event.detail * 1.0;

	}

	camera.projectionMatrix = THREE.Matrix4.makePerspective( fov, window.innerWidth / window.innerHeight, 1, 1100 );
	render();

}

function animate() {

	requestAnimationFrame( animate );
	render();

}

function render() {

	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = ( 90 - lat ) * Math.PI / 180;
	theta = lon * Math.PI / 180;

	camera.target.position.x = 500 * Math.sin( phi ) * Math.cos( theta );
	camera.target.position.y = 500 * Math.cos( phi );
	camera.target.position.z = 500 * Math.sin( phi ) * Math.sin( theta );

	/*
	// distortion
	camera.position.x = - camera.target.position.x;
	camera.position.y = - camera.target.position.y;
	camera.position.z = - camera.target.position.z;
	*/

	renderer.render( scene, camera );

}