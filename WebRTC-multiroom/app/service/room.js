import { Subject } from 'rxjs';
import io from './socket';
import { config } from '../config';

class Room {
	constructor() {
		this._streams = new Subject([]);
		this.streams$ = this._streams.asObservable();

		this.roomId = null;
		this.currentId = null;
		this.connected = false;
		this.peerConnections = {};

		io.on('peer.connected', this._makeOffer);
		io.on('answer', this._onAnswerFromServer);
		io.on('offer', this._onOfferFromServer);
		io.on('ice', this._onIceFromServer);
	}

	createRoom(cb) {
		if (this.connected) return;

		io.emit('room', null, data => {
			this._onRoomCb(data);
			cb(data.roomId);
		});
	}

	joinRoom(roomId) {
		io.emit('room', roomId, this._onRoomCb);
	}

	init(stream) {
		this.stream = stream;
	}

	_onRoomCb = (data) => {
		console.log(data.roomId);
		console.log(data.userId);

		this.roomId = data.roomId;
		this.currentId = data.userId;
		this.connected = true
	}

	_makeOffer = async ({ userId: id }) => {
		const peer = this._getPeerConnection(id);

		try {
			const description = await peer.createOffer();
			await peer.setLocalDescription(description);

			io.emit('offer', {
				sdp: description,
				emitedFrom: this.currentId,
				emitTo: id,
				roomId: this.roomId,
				type: 'offer'
			});
		} catch (e) {
			console.error(e);
		}
	}

	_getPeerConnection(id) {
		if (this.peerConnections[id]) {
			return this.peerConnections[id];
		}

		const peer = new RTCPeerConnection(config.peerConfig);
		peer.onicecandidate = (event) => {
			io.emit('ice', {
				ice: event.candidate,
				emitedFrom: this.currentId,
				emitTo: id,
				roomId: this.roomId,
				type: 'ice'
			});
		};

		peer.onaddstream = (e) => this._onAddStream(e, id);
		peer.addStream(this.stream);

		this.peerConnections[id] = peer;

		return peer;
	}

	_onAddStream(event, id) {
		console.log('new stream')
		this._streams.next({
			stream: event.stream,
			id
		});
	}

	_onOfferFromServer = async (data) => {
		console.log('ON OFFER')
		if (!data.sdp || data.emitedFrom  === this.currentId) return;
		
		const peer = this._getPeerConnection(data.emitedFrom);
		try {
			await peer.setRemoteDescription(new RTCSessionDescription(data.sdp));

			const sdp = await peer.createAnswer();
			peer.setLocalDescription(sdp);
			io.emit('answer', { 
				sdp,
				emitedFrom: this.currentId,
				emitTo: data.emitedFrom,
				roomId: this.roomId,
				type: 'answer'
			});
		} catch (e) {
			console.log(data);
			console.error(e);
		}
	}

	_onAnswerFromServer = async (data) => {
		console.log('ON ANSWER', data);
		if (!data.sdp) return;

		const peer = this._getPeerConnection(data.emitedFrom);
		await peer.setRemoteDescription(new RTCSessionDescription(data.sdp))
	}

	_onIceFromServer = async (data) => {
		if (!data.ice || data.emitedFrom  === this.currentId) return;

		const peer = this._getPeerConnection(data.emitedFrom);
		await peer.addIceCandidate(new RTCIceCandidate(data.ice));
	}
}

const room = new Room();

export default room;