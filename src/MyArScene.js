import React, { Component }   from 'react';
import * as THREE from "three";
import ArHelper from './arHelper';

class MyArScene extends Component {

	constructor(props) {
		super(props);
		// this method will be called when the screen is touched
		this.onTouchStart = this.onTouchStart.bind(this);
		// this method will be called when the screen is released
		this.onTouchEnd = this.onTouchEnd.bind(this);
		// this method will be called before each three.js render
		this.onFrame = this.onFrame.bind(this);
		// instanciate a new ArHelper and let him handle all the boring work.
		this.arHelper = new ArHelper(this);
		// init the ar session
		this.arHelper.init();

		// Create your content, now that everything is setup,
		// you can handle your three scene as you want.
		// This is just a basic example
		this.createGeometry();
	}

	// create a geometry with Three.JS
	// this method is called once (in the constructor)
	createGeometry() {
		// create a geometry and a material, with Three.JS
		var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		this.cube = new THREE.Mesh( geometry, material );

		// get the Three.JS scene from the ArHelper instance
		const threeScene = this.arHelper.getThreeScene();
		threeScene.add( this.cube );
	}

	// This method is called before each Three.JS render
	onFrame(time, frame, pose) {
		// Check if the screen is beeing touched
		if (this.arHelper.isDown()) {
			// get planar surfaces hits locations asynchronously
			this.arHelper.getHits(frame).then(hits => {
				// if there is a hit
				if (hits.length > 0) {
					// position the cube previously created (line 32) at the hit location
					// (which is a Three.Matrix4)
					this.cube.position.setFromMatrixPosition(hits[0]);
				}
			});

		}
	}

	// this event will be called when the screen is touched
	// do what you want with it
	onTouchStart(e) {
		console.log("TOUCH START : ", e);
	}

	// this event will be called when the screen is released
	// do what you want with it
	onTouchEnd(e) {
		console.log("TOUCH END : ", e);
	}

	render() {
		// render
		return this.arHelper.render();
	}
}


export default MyArScene;
