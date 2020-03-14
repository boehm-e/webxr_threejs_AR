import React, { Component }   from 'react';
import { Flipper, Flipped }   from 'react-flip-toolkit';
import Button                 from '@material-ui/core/Button';
import TextTexture            from '@seregpie/three.text-texture';
import Dialog                 from '@material-ui/core/Dialog';
import DialogActions          from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import styles                 from './AR.module.css';
import * as THREE from "three";

class ArHelper {
	constructor(context) {
		this.onXRFrame = this.onXRFrame.bind(this);
		this.onEnterAR = this.onEnterAR.bind(this);
		this._touchStart = this._touchStart.bind(this);
		this._touchEnd = this._touchEnd.bind(this);
		this.getHits = this.getHits.bind(this);
		this.getProjectionMatrix = this.getProjectionMatrix.bind(this);
		this.getThreeScene = this.getThreeScene.bind(this);
		this.isDown = this.isDown.bind(this);

		this.onTouchStart = context.onTouchStart;
		this.onTouchEnd = context.onTouchEnd;
		this.onFrame = context.onFrame;

		this.renderer = new THREE.WebGLRenderer({	alpha: true,	preserveDrawingBuffer: false,});
		this.renderer.autoClear = false;
		this.scene = new THREE.Scene();

		this.camera = new THREE.PerspectiveCamera();
		this.camera.matrixAutoUpdate = false;
		this.touch = false;
	}

	async init() {
		console.log('init');
		if (navigator.xr && XRSession.prototype.requestHitTestSource) {
			console.log('navigator.xr && XRSession.prototype.requestHitTestSource ok');
			navigator.xr.isSessionSupported('immersive-ar').then(
				() => {
					console.log('supportsSession immersive-ar ok');
				},
				() => {
					this.onNoXRDevice();
				},
			);
		} else {
			this.onNoXRDevice();
			return;
		}
	}

	_touchStart(e) {
		this.touch = true;
		this.onTouchStart(e);
	}


	_touchEnd(e) {
		this.touch = false;
		this.onTouchEnd(e);
	}

	isDown() {
		return this.touch;
	}

	async onEnterAR() {
		console.log('onEnterAR');
		navigator.xr
		.requestSession('immersive-ar')
		.then(xrSession => {
			this.session = xrSession;
			console.log('requestSession immersive-ar ok');
			xrSession.addEventListener('end', this.onXRSessionEnded.bind(this));
			xrSession.addEventListener('selectstart', this._touchStart)
			xrSession.addEventListener('selectend', this._touchEnd)
			this.onSessionStarted();
		})
		.catch(error => {
			console.warn('requestSession immersive-ar error: ', error);
			this.onNoXRDevice();
		});
	}

	onXRSessionEnded = () => {
		console.log('onXRSessionEnded');
		if (this.renderer) {
			this.renderer.vr.setSession(null);
			this.stabilized = false;
		}
	};

	onNoXRDevice() {
		console.log('onNoXRDevice');
	}

	async onSessionStarted() {
		console.log('onSessionStarted');
		this.gl = this.renderer.getContext();
		this.renderer.vr.enabled = true;
		this.XRReferenceSpaceType = 'local';
		this.renderer.vr.setReferenceSpaceType(this.XRReferenceSpaceType);
		this.renderer.vr.setSession(this.session);
		this.session.baseLayer = new XRWebGLLayer(this.session, this.gl);
		this.frameOfRef = await this.session.requestReferenceSpace('local');

		this.tick();
	}

	tick = () => {
		this.rafId = this.session.requestAnimationFrame(this.onXRFrame.bind(this));
	};

	onXRFrame(time, frame) {
		const { session } = frame;
		const pose = 'getDevicePose' in frame ? frame.getDevicePose(this.frameOfRef) : frame.getViewerPose(this.frameOfRef);
		this.tick();
		if (pose == null) {
			return;
		}
		const poseMatrix = new THREE.Matrix4().fromArray(pose.transform.matrix);
		this.onFrame(time, frame, poseMatrix);

		for (const view of frame.getViewerPose(this.frameOfRef).views) {
			const viewport = session.renderState.baseLayer.getViewport(view);
			this.renderer.setViewport(viewport.x, viewport.y, viewport.width, viewport.height);
			this.camera.projectionMatrix.fromArray(view.projectionMatrix);
			const viewMatrix = new THREE.Matrix4().fromArray(view.transform.inverse.matrix);
			this.camera.matrix.getInverse(viewMatrix);
			this.camera.updateMatrixWorld(true);
			this.renderer.render(this.scene, this.camera);
		}
	}

	getProjectionMatrix(frame) {
		const pose = 'getDevicePose' in frame ? frame.getDevicePose(this.frameOfRef) : frame.getViewerPose(this.frameOfRef);
		const poseMatrix = new THREE.Matrix4().fromArray(pose.views[0].projectionMatrix);
	}

	getThreeScene() {
		return this.scene;
	}

	async getHits(frame) {
		return new Promise((resolve, reject) => {
			const { session } = frame;
			if (this.session == null) {
				return resolve([]);
			}


			this.raycaster = this.raycaster || new THREE.Raycaster();
			this.raycaster.setFromCamera({ x: 0, y: 0 }, this.camera);
			const ray = this.raycaster.ray;
			let xrray = new XRRay(ray.origin, ray.direction);
			try {
				this.session.requestHitTest(xrray, this.frameOfRef).then(hits => {
					return resolve(hits.map(hit => new THREE.Matrix4().fromArray(hit.hitMatrix)));
				});
			} catch (e) {
				return resolve([]);
				console.log("ERROR HIT TEST", e);
			}
		});
	}

	render() {
		return (
			<span className="row">
				<a onClick={this.onEnterAR} className={`${styles.rainbowButton}`} alt="Start AR"></a>
			</span>
		);
	}
}


export default ArHelper;
