import React, { Component }   from 'react';
import * as THREE from "three";
import ArHelper from './arHelper';

class MyArScene extends Component {
	constructor(props) {
		super(props);
		this.onTouchStart = this.onTouchStart.bind(this);
		this.onTouchEnd = this.onTouchEnd.bind(this);
		this.onFrame = this.onFrame.bind(this);
		this.ar = new ArHelper(this);

		this.ar.init();
		this.createGeometry();
	}

	createGeometry() {
		var geometry = new THREE.BoxGeometry( 0.1, 0.1, 0.1 );
		var material = new THREE.MeshBasicMaterial( {color: 0x00ff00} );
		this.cube = new THREE.Mesh( geometry, material );
		this.ar.getThreeScene().add( this.cube );
	}

	onFrame(time, frame, pose) {
		if (this.ar.isDown()) {

			this.ar.getHits(frame).then(hits => {
				if (hits.length > 0) {
					this.cube.position.setFromMatrixPosition(hits[0]);
				}
			});

		}
	}

	onTouchStart(e) {
		console.log("TOUCH START : ", e);
	}

	onTouchEnd(e) {
		console.log("TOUCH END : ", e);
	}

	render() {
		return this.ar.render();
	}
}


export default MyArScene;
