class YamlEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {input: '', pod_name: ''};
    }

    componentDidMount() {
        this.init();
    }

    async init() {
        let type = this.props.type;
        let name = this.props.name;

        let cmd = `kubectl get ${type} ${name} -o yaml`;
        let json = await myexec(cmd);
        let input = json.join('\r\n');

        $(this.modal).modal('show');
        this.setState({input, type, name});
    }

    async create() {
        showAlert('create from yaml file');
        call_api('POST', '/create-from-yaml', {yaml: this.state.input, type: this.state.type, name: this.state.name});
        $(this.modal).modal('hide');
    }

    async apply() {
        showAlert('apply from yaml file');
        let text = await call_api('POST', '/apply-from-yaml', {yaml: this.state.input, type: this.state.type, name: this.state.name});
        showAlert(text);
        $(this.modal).modal('hide');
    }

    // Adjust textarea size everytime the window is resized to get rid of textarea scrollbar.
    adjustTextarea() {
        if(this.textarea === null) return;

        let adjust = () => {
            // @ref https://stackoverflow.com/questions/995168/textarea-to-resize-based-on-content-length
            this.textarea.style.height = '1px';
            $(this.textarea).css('height', this.textarea.scrollHeight + 50);
        };
        adjust();
        $('.window').on('resize', adjust);
    }

    render() {
        return (
            <div>
                <textarea ref={textarea => {this.textarea = textarea; this.adjustTextarea();} } style={{fontSize: 12, color: 'white', backgroundColor: '#111', border: 0}} className="form-control" value={this.state.input} onChange={e => this.setState({input: e.target.value})} />
                <div>
                    <a href="javascript:void(0)" type="button" className="btn btn-primary" onClick={() => this.create()}>Delete and create</a>
                    &nbsp;&nbsp;
                    <a href="javascript:void(0)" type="button" className="btn btn-primary" onClick={() => this.apply()}>Apply</a>
                </div>
            </div>
        )
    }
}
