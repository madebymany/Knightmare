// Based on http://www.openprocessing.org/visuals/?visualID=6910

var MARGIN = 0;
    SCREEN_HEIGHT = window.innerHeight - MARGIN * 2,
    SCREEN_WIDTH  = window.innerWidth,
    SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
    SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

var Boid = function() {

	var vector = new THREE.Vector3(),
	_acceleration, _width = 500, _height = 500, _depth = 200, _goal, _neighborhoodRadius = 200,
	_maxSpeed = 8, _maxSteerForce = 0.1, _avoidWalls = false;

	this.position = new THREE.Vector3();
	this.velocity = new THREE.Vector3();
	_acceleration = new THREE.Vector3();

	this.setGoal = function ( target ) {

		_goal = target;

	}

	this.setAvoidWalls = function ( value ) {

		_avoidWalls = value;

	}

	this.setWorldSize = function ( width, height, depth ) { 
    _width = width;
    _height = height;
    _depth = depth;
   }
	    
	this.run = function ( boids ) {

		if ( _avoidWalls ) {

			vector.set( - _width, this.position.y, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.addSelf( vector );

			vector.set( _width, this.position.y, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.addSelf( vector );

			vector.set( this.position.x, - _height, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.addSelf( vector );

			vector.set( this.position.x, _height, this.position.z );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.addSelf( vector );

			vector.set( this.position.x, this.position.y, - _depth );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.addSelf( vector );

			vector.set( this.position.x, this.position.y, _depth );
			vector = this.avoid( vector );
			vector.multiplyScalar( 5 );
			_acceleration.addSelf( vector );

		}/* else {

			this.checkBounds();

		}
		*/

		if ( Math.random() > 0.5 ) {

			this.flock( boids );

		}

		this.move();

	}

	this.flock = function ( boids ) {

		if ( _goal ) {

			_acceleration.addSelf( this.reach( _goal, 0.005 ) );

		}

		_acceleration.addSelf( this.alignment( boids ) );
		_acceleration.addSelf( this.cohesion( boids ) );
		_acceleration.addSelf( this.separation( boids ) );

	}

	this.move = function () {

		this.velocity.addSelf( _acceleration );

		var l = this.velocity.length();

		if ( l > _maxSpeed ) {

			this.velocity.divideScalar( l / _maxSpeed );

		}

		this.position.addSelf( this.velocity );
		_acceleration.set( 0, 0, 0 );

	}

	this.checkBounds = function () {

		if ( this.position.x >   _width ) this.position.x = - _width;
		if ( this.position.x < - _width ) this.position.x =   _width;
		if ( this.position.y >   _height ) this.position.y = - _height;
		if ( this.position.y < - _height ) this.position.y =  _height;
		if ( this.position.z >  _depth ) this.position.z = - _depth;
		if ( this.position.z < - _depth ) this.position.z =  _depth;

	}

	//

	this.avoid = function ( target ) {

		var steer = new THREE.Vector3();

		steer.copy( this.position );
		steer.subSelf( target );

		steer.multiplyScalar( 1 / this.position.distanceToSquared( target ) );

		return steer;

	}

	this.repulse = function ( target ) {

		var distance = this.position.distanceTo( target );

		if ( distance < 150 ) {

			var steer = new THREE.Vector3();

			steer.sub( this.position, target );
			steer.multiplyScalar( 0.5 / distance );

			_acceleration.addSelf( steer );

		}

	}

	this.reach = function ( target, amount ) {

		var steer = new THREE.Vector3();

		steer.sub( target, this.position );
		steer.multiplyScalar( amount );

		return steer;

	}

	this.alignment = function ( boids ) {

		var boid, velSum = new THREE.Vector3(),
		count = 0;

		for ( var i = 0, il = boids.length; i < il; i++ ) {

			if ( Math.random() > 0.6 ) continue;

			boid = boids[ i ];

			distance = boid.position.distanceTo( this.position );

			if ( distance > 0 && distance <= _neighborhoodRadius ) {

				velSum.addSelf( boid.velocity );
				count++;

			}

		}

		if ( count > 0 ) {

			velSum.divideScalar( count );

			var l = velSum.length();

			if ( l > _maxSteerForce ) {

				velSum.divideScalar( l / _maxSteerForce );

			}

		}

		return velSum;

	}

	this.cohesion = function ( boids ) {

		var boid, distance,
		posSum = new THREE.Vector3(),
		steer = new THREE.Vector3(),
		count = 0;

		for ( var i = 0, il = boids.length; i < il; i ++ ) {

			if ( Math.random() > 0.6 ) continue;

			boid = boids[ i ];
			distance = boid.position.distanceTo( this.position );

			if ( distance > 0 && distance <= _neighborhoodRadius ) {

				posSum.addSelf( boid.position );
				count++;

			}

		}

		if ( count > 0 ) {

			posSum.divideScalar( count );

		}

		steer.sub( posSum, this.position );

		var l = steer.length();

		if ( l > _maxSteerForce ) {

			steer.divideScalar( l / _maxSteerForce );

		}

		return steer;

	}

	this.separation = function ( boids ) {

		var boid, distance,
		posSum = new THREE.Vector3(),
		repulse = new THREE.Vector3();

		for ( var i = 0, il = boids.length; i < il; i ++ ) {

			if ( Math.random() > 0.6 ) continue;

			boid = boids[ i ];
			distance = boid.position.distanceTo( this.position );

			if ( distance > 0 && distance <= _neighborhoodRadius ) {

				repulse.sub( this.position, boid.position );
				repulse.normalize();
				repulse.divideScalar( distance );
				posSum.addSelf( repulse );

			}

		}

		return posSum;

	}

}

// var SCREEN_WIDTH = window.innerWidth,
// SCREEN_HEIGHT = window.innerHeight,
// SCREEN_WIDTH_HALF = SCREEN_WIDTH  / 2,
// SCREEN_HEIGHT_HALF = SCREEN_HEIGHT / 2;

//var camera, scene, renderer,
var birds, bird;

var boid, boids;

//var stats;

// init();
// animate();

function initBoids() {

	// camera = new THREE.PerspectiveCamera( 75, SCREEN_WIDTH / SCREEN_HEIGHT, 1, 10000 );
	//   camera.position.z = 450;
	// 
	//   scene = new THREE.Scene();

	birds = [];
	boids = [];

	for ( var i = 0; i < 200; i ++ ) {

		boid = boids[ i ] = new Boid();
		boid.position.x = Math.random() * 400 - 200;
		boid.position.y = Math.random() * 400 - 200;
		boid.position.z = Math.random() * 400 - 200;
		boid.velocity.x = Math.random() * 10 - 1;
		boid.velocity.y = Math.random() * 10 - 1;
		boid.velocity.z = Math.random() * 10 - 1;
		boid.setAvoidWalls( true );
		boid.setWorldSize( 1000, 1000, 1000 );

		bird = birds[ i ] = new THREE.Mesh( new THREE.CubeGeometry( 20, 20, 20 ), new THREE.MeshBasicMaterial( { color:Math.random() * 0xff0000 } ) );
		bird.phase = Math.floor( Math.random() * 62.83 );
		bird.position = boids[ i ].position;
		bird.doubleSided = true;
		// bird.scale.x = bird.scale.y = bird.scale.z = 10;
		scene.add( bird );


	}

	// renderer = new THREE.CanvasRenderer();
	//   // renderer.autoClear = false;
	//   renderer.setSize( SCREEN_WIDTH, SCREEN_HEIGHT );
	// 
	//   document.addEventListener( 'mousemove', onDocumentMouseMove, false );
	//   document.body.appendChild( renderer.domElement );
	// 
	//   stats = new Stats();
	//   stats.domElement.style.position = 'absolute';
	//   stats.domElement.style.left = '0px';
	//   stats.domElement.style.top = '0px';
	// 
	//   document.getElementById( 'container' ).appendChild(stats.domElement);

}

function onCameraMove( camera ) {

	var vector = new THREE.Vector3( camera.position.x - SCREEN_WIDTH_HALF, - camera.position.y + SCREEN_HEIGHT_HALF, 0 );

	for ( var i = 0, il = boids.length; i < il; i++ ) {

		boid = boids[ i ];

		vector.z = boid.position.z;

		boid.repulse( vector );

	}

}

//
// 
// function animate() {
// 
//  requestAnimationFrame( animate );
// 
//  render();
//  stats.update();
// 
// }

function renderBoids() {

	for ( var i = 0, il = birds.length; i < il; i++ ) {

		boid = boids[ i ];
		boid.run( boids );

		bird = birds[ i ];

		color = bird.materials[ 0 ].color;
		color.r = color.g = color.b = ( 500 - bird.position.z ) / 1000;

		bird.rotation.y = Math.atan2( - boid.velocity.z, boid.velocity.x );
		bird.rotation.z = Math.asin( boid.velocity.y / boid.velocity.length() );

		bird.phase = ( bird.phase + ( Math.max( 0, bird.rotation.z ) + 0.1 )  ) % 62.83;
		//bird.geometry.vertices[ 5 ].position.y = bird.geometry.vertices[ 4 ].position.y = Math.sin( bird.phase ) * 5;

	}

	//renderer.render( scene, camera );

}
