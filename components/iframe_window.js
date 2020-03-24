
class IframeWindow extends React.Component {

    constructor(props) {
        super(props);
    }

    componentDidMount() {
        if(this.props.refresh) {
            setInterval(() => {
                this.modal.src = this.modal.src;
            }, this.props.refresh);
        }
    }

    render() {
        return (
                <iframe
                    ref={modal => this.modal = modal}
                    src={this.props.src} frameBorder="0"
                    height="100%" width="100%"
                        style={{width: '100%', height: '100%', backgroundColor: 'white', overflow: 'visible'}} />
        )
    }
}
