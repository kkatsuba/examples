import React, { Component } from 'react';
import Video from './Video';
import Room from './service/room';
import './styles.scss';
import { config } from './config';

class App extends Component {
	constructor(props) {
		super(props);

		this.state = {
			callRoom: null,
			clients: [],
			roomId: null
		};

		this.localVideo = React.createRef();
	}

	async componentDidMount() {
		const stream = await navigator.mediaDevices.getUserMedia(config.media);
		this.localVideo.current.srcObject = stream;
		Room.init(stream);
		Room.streams$.subscribe(client => {
			this.setState((prevState) => ({
				clients: [...prevState.clients, client]
			}));
		});
	}

	componentWillUnmount() {
		this.io.close();
	}

	updateState(key, value) {
		this.setState({ [key]: value });
	}

	createRoom() {
		Room.createRoom(roomId => {
			this.setState({ roomId })
		})
	}

	render() {
		return (
			<div>
				<video id="localVideo" muted autoPlay className="video" ref={this.localVideo} />
				{ this.state.roomId && <h1>Your room: {this.state.roomId}</h1>}
				<div>
					<button onClick={() => this.createRoom()}>
						Initiate room
					</button>
				</div>
				<div>
					<button onClick={() => Room.joinRoom(this.state.callRoom)}>
						Join Call
					</button>
					<input
						type="text"
						onChange={e => this.updateState('callRoom', e.target.value)}
					/>
				</div>
				<div>
					{
						this.state.clients.map(cl => <Video stream={cl.stream} key={cl.id}/>)
					}
				</div>
			</div>
		);
	}
}

export default App;
