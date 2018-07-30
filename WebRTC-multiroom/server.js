const uuid = require('uuid');
const uniqId = require('uniqid');

const rooms = {};
const users = {};

const createRoom = socket => {
	const userId = uniqId();
	const roomId = uuid();
	users[roomId] = [userId];
	rooms[roomId] = [{
		userId,
		socket
	}];
	return {
		roomId,
		userId
	};
};

const joinRoom = (roomId, socket) => {
	const userId = uniqId();
	users[roomId].push(userId);
	rooms[roomId].push({
		userId,
		socket
	});
	rooms[roomId].forEach(user => {
		user.socket.emit('peer.connected', {
			userId
		})
	});

	return userId;
};

const onMessage = (data) => {
	console.log('message', data.type.toUpperCase(), data.emitTo, ' <=== ', data.emitedFrom);
	console.log(data.ice);
	try {
		const room = rooms[data.roomId];
		const client = room.find(client => client.userId === data.emitTo);
		
		client.socket.emit(data.type, data);
	} catch (e) {
		console.log(e);
	}
};

module.exports = () => {
	const io = require('socket.io')(5002);

	io.on('connection', function(socket) {
		console.log('connected webrtc rooms');
		let currentRoom;
		let userId;
	
		socket.on('room', (roomId, cb) => {
			if (roomId) {
				userId = joinRoom(roomId, socket);
			} else {
				const roomData = createRoom(socket);
				currentRoom = roomId = roomData.roomId;
				userId = roomData.userId;
			}
	
			cb({ roomId, userId });
		});
	
		socket.on('ice', onMessage);
		socket.on('offer', onMessage);
		socket.on('answer', onMessage);
	
		socket.on('error', console.log);
	
		socket.on('disconnect', () => {
			console.log('disconnected');
		});
	});
};
