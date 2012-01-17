var radius = 6371;
var tilt = 0.41;
var rotationSpeed = 0.02;

var container, stats;
var camera, controls, scene, renderer;
var geometry, mesh;
var dirLight, pointLight, ambientLight;
var lastUpdate = new Date().getTime();

var delta, d;

init();
initBoids();

var socket = io.connect('http://192.168.228.86');
socket.on('changeOrientation', function (msg) {
  //lon -= msg.ay;
  //lat += msg.ax;
});

animate();

function init() {

	container = document.createElement( 'div' );
	document.body.appendChild( container );

	camera = new THREE.PerspectiveCamera( 25, SCREEN_WIDTH / SCREEN_HEIGHT, 50, 1e7 );
	camera.position.z = radius * 5;

	controls = new THREE.FlyControls( camera );
	
	console.log(camera, controls)

	controls.movementSpeed = 1000;
	controls.domElement = container;
	controls.rollSpeed = Math.PI / 24;
	//controls.autoForward = false;
	//controls.dragToLook = false
	
	//controls.movementSpeed = 100;
	controls.lookSpeed = 3;
	//controls.constrainVertical = [ -0.5, 0.5 ];


	scene = new THREE.Scene();
	scene.fog = new THREE.FogExp2( 0x000000, 0.00000025 );

	pointLight = new THREE.PointLight( 0xffffff );
	pointLight.position.set( -1, 0, 1 ).normalize();
	scene.add( pointLight );

	ambientLight = new THREE.AmbientLight( 0x000000 );
	scene.add( ambientLight );

	var shader = THREE.ShaderUtils.lib[ "normal" ];
	var uniforms = THREE.UniformsUtils.clone( shader.uniforms );

	uniforms[ "uNormalScale" ].value = 0.85;

	uniforms[ "enableAO" ].value = false;
	uniforms[ "enableDiffuse" ].value = true;
	uniforms[ "enableSpecular" ].value = true;

	uniforms[ "uDiffuseColor" ].value.setHex( 0xffffff );
	uniforms[ "uSpecularColor" ].value.setHex( 0x333333 );
	uniforms[ "uAmbientColor" ].value.setHex( 0x000000 );

	uniforms[ "uShininess" ].value = 15;

	var parameters = {

		fragmentShader: shader.fragmentShader,
		vertexShader: shader.vertexShader,
		uniforms: uniforms,
		lights: true,
		fog: true

	};

	var materialNormalMap = new THREE.ShaderMaterial( parameters );

	// stars

	var i, r = radius, starsGeometry = [ new THREE.Geometry(), new THREE.Geometry() ];

	for ( i = 0; i < 250; i ++ ) {

		vector1 = new THREE.Vector3( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
		vector1.multiplyScalar( r );

		starsGeometry[ 0 ].vertices.push( new THREE.Vertex( vector1 ) );

	}

	for ( i = 0; i < 1500; ++i ) {

		vector1 = new THREE.Vector3( Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1 );
		vector1.multiplyScalar( r );

		starsGeometry[ 1 ].vertices.push( new THREE.Vertex( vector1 ) );

	}

	var stars;
	var starsMaterials = [
		new THREE.ParticleBasicMaterial( { color: 0x555555, size: 2, sizeAttenuation: false } ),
		new THREE.ParticleBasicMaterial( { color: 0x555555, size: 1, sizeAttenuation: false } ),
		new THREE.ParticleBasicMaterial( { color: 0x333333, size: 2, sizeAttenuation: false } ),
		new THREE.ParticleBasicMaterial( { color: 0x3a3a3a, size: 1, sizeAttenuation: false } ),
		new THREE.ParticleBasicMaterial( { color: 0x1a1a1a, size: 2, sizeAttenuation: false } ),
		new THREE.ParticleBasicMaterial( { color: 0x1a1a1a, size: 1, sizeAttenuation: false } )
	];

	for ( i = 10; i < 30; i ++ ) {

		stars = new THREE.ParticleSystem( starsGeometry[ i % 2 ], starsMaterials[ i % 6 ] );

		stars.rotation.x = Math.random() * 6;
		stars.rotation.y = Math.random() * 6;
		stars.rotation.z = Math.random() * 6;

		s = i * 10;
		stars.scale.set( s, s, s );

		stars.matrixAutoUpdate = false;
		stars.updateMatrix();

		scene.add( stars );

	}

	renderer = new THREE.WebGLRenderer( { clearColor: 0x000000, clearAlpha: 1 } );
	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	renderer.sortObjects = false;

	renderer.autoClear = false;

	container.appendChild( renderer.domElement );

	stats = new Stats();
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.top = '0px';
	stats.domElement.style.zIndex = 100;
	container.appendChild( stats.domElement );

	window.addEventListener( 'resize', onWindowResize, false );

	// postprocessing

	var renderModel = new THREE.RenderPass( scene, camera );
	var effectFilm = new THREE.FilmPass( 0.35, 0.75, 2048, false );

	effectFilm.renderToScreen = true;

	composer = new THREE.EffectComposer( renderer );

	composer.addPass( renderModel );
	composer.addPass( effectFilm );

};

function makeClickRay(x,y,z) {
  
  var vector = new THREE.Vector3( x, y, z );
	projector.unprojectVector( vector, camera );

	var ray = new THREE.Ray( camera.position, vector.subSelf( camera.position ).normalize() );

	return ray.intersectObjects( objects );
};

function onWindowResize( event ) {

	SCREEN_HEIGHT = window.innerHeight;
	SCREEN_WIDTH  = window.innerWidth;

	renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );

	camera.aspect = SCREEN_WIDTH / SCREEN_HEIGHT;
	camera.updateProjectionMatrix();

	composer.reset();

}

function cap_bottom( val, bottom ) {

	return val < bottom ? bottom : val;

};


function animate() {

	requestAnimationFrame( animate );
  
  onCameraMove(camera);
  renderBoids();
	render();
	
	stats.update();

};


function cap( val, bottom ) {

	return val > bottom ? val : bottom;

};

function render() {
  // 
  delta = this.getFrametime();

	controls.movementSpeed =  camera.position.length();
	controls.update();
	
/*	lat = Math.max( - 85, Math.min( 85, lat ) );
	phi = ( 90 - lat ) * Math.PI / 180;
	theta = lon * Math.PI / 180;

	camera.target.position.x = 500 * Math.sin( phi ) * Math.cos( theta );
	camera.target.position.y = 500 * Math.cos( phi );
	camera.target.position.z = 500 * Math.sin( phi ) * Math.sin( theta );*/
	
	renderer.render( scene, camera );

	//renderer.clear();
	composer.render( delta );

};

function getFrametime() {

	var now = new Date().getTime();
	var tdiff = ( now - lastUpdate ) / 1000;
	lastUpdate = now;
	return tdiff;

};
