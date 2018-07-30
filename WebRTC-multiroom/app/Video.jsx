import React, { Component } from 'react';

export default class video extends Component {
	constructor(props) {
		super(props);

		this.video = React.createRef();
	}

	async componentDidMount() {
		this.video.current.srcObject = this.props.stream;
	}

	render() {
		return (
			<video muted autoPlay className="video" ref={this.video} />
		);
	}
}
