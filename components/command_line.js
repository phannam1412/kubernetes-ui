class CommandLine extends React.Component {
    constructor(props) {
        super(props);
        this.state = {text: '', input: '', pod: '', loading: false};
    }

    componentDidMount() {
        $(this.modal).modal('show');
        this.setState({pod: this.props.pod});
    }

    execute() {
        if(this.state.input.trim().length === 0) {
            this.setState({loading: true, text: this.state.text + '<br/>' + '$', input: ''});
            setTimeout(() => this.refs.viewer.scrollTop = 999999999, 500);
            return;
        }
        this.setState({loading: true, text: this.state.text + '<br/>' + '$ ' + this.state.input + '<br/>', input: ''});
        setTimeout(() => this.refs.viewer.scrollTop = 999999999, 500);
        this._execute();
    }

    async _execute() {
        let json = await myexec(`kubectl exec ${this.state.pod} -- sh -c "${this.state.input}"`);
        let text = joinForDisplay(json);
        this.setState({text: this.state.text + text, loading: false});
        setTimeout(() => this.refs.viewer.scrollTop = 999999999, 500);
    }

    onKeyUp(e) {
        if (e.key === 'Enter') {
            this.execute();
        }
    }

    render() {
        return (
            <div>
                { <div ref='viewer' style={{overflow: 'scroll', maxHeight: 450, whiteSpace: 'nowrap'}} dangerouslySetInnerHTML={{__html: this.state.text}} /> }
                <br/>
                <br/>
                <input type="text" style={{backgroundColor: '#222', border: 0, color: 'white'}} className="form-control" onKeyUp={e => this.onKeyUp(e)} value={this.state.input} onChange={e => this.setState({input: e.target.value})} />
            </div>
        )
    }
}
