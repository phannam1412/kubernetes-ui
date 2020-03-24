
class LogViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {container: '', pieces: [], disable_autoscroll: false};
    }

    componentDidMount() {
        this.init();

        setInterval(() => {
            if(this.state.disable_autoscroll) return;
            $(this.iframe).contents().scrollTop(10000000);
        }, 500);
    }

    componentWillUnmount() {
        console.log('LogViewer componentWillUnmount ' + this.props.pod);
        this.killProcess(this.props.pod);
    }

    async killProcess(pod) {
        let json = await myexec(`ps aux | grep "kubectl logs -f ${pod}"`);
        json.forEach(item => {
            let cmd = `kill ${item.replace(/\s\s+/g, ' ').split(' ')[1]}`;
            console.log(json,'execute command: ' + cmd);
            myexec(cmd);
        });
    }

    async init() {
        let pod_name = this.props.pod;
        let container = '';
        let cmd = 'kubectl logs ' + pod_name;
        if(container.length > 0) cmd += ' -c ' + container;
        let bytes = 1;
        let json = await myexec(cmd + ' --limit-bytes=' + bytes);
        let message = json.join('<br/>');
        if(message.indexOf('choose one of:') >= 0) {
            let pieces = message.split('choose one of: [');
            let tmp = pieces[1];
            tmp = tmp.split(']')[0];
            pieces = tmp.trim().split(' ');
            this.setState({pieces});
        }
    }

    render() {
        return (
            this.state.pieces && this.state.pieces.length > 0
                ? <div>
                    <p>Choose one of: </p>
                    <ul>
                        {
                            this.state.pieces.map((item, key) =>
                                <li key={key}><a href="javascript:void(0)" onClick={() => this.setState({container: item, pieces: null})}>{item}</a></li>
                            )
                        }
                    </ul>
                </div>
                : <div>
                    <iframe ref={iframe => this.iframe = iframe}  src={"http://localhost:5000/log?pod="+this.props.pod+"&container=" + this.state.container} frameBorder="0" style={{top: '2%', left: '2%', width: '96%', height: '90%', position: "absolute", backgroundColor: 'white', overflow: 'visible'}} />
                    <div style={{bottom: '2%', left: '2%', position: "absolute"}}>
                        <input type="checkbox" checked={this.state.disable_autoscroll} onChange={e => this.setState({disable_autoscroll: e.target.checked})} />
                        &nbsp;&nbsp;<span>Disable auto scrolling ?</span>
                    </div>
                </div>
        )
    }
}
