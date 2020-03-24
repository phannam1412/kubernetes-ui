
class Overload extends React.Component {
    constructor(props) {
        super(props);
        this.state = {show: true};
    }

    componentDidMount() {
        bind('show-overload', () => {
            this.setState({show: true});
        });
        bind('hide-overload', () => {
            this.setState({show: false});
        });
    }

    render() {
        return (
            <div style={{display: this.state.show ? 'block' : 'none'}}>Overload</div>
        )
    }
}
