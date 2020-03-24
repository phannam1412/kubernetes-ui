class PodDropdownList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        this.load(this.props.context, this.props.namespace);
    }

    componentWillReceiveProps(nextProps) {
        console.log('PodDropdownList->componentWillReceiveProps()', nextProps);
        if(this.props.context === nextProps.context && this.props.namespace === nextProps.namespace) return;
        this.load(nextProps.context, nextProps.namespace);
    }

    load(context, namespace) {

        console.log(`PodDropdownList->load() ${context} ${namespace}`);

        if(!context) context = this.props.context;
        if(!namespace) namespace = this.props.namespace;

        if(!context || !namespace) return;

        this.setState({loading: true});

        myexec(`kubectl get pods --context=${context} --namespace=${namespace}`).then(json => {
            let noti = 0;
            let pods = json.map(item => {
                item = item.replace(/\s\s+/g, ' ');
                let pieces = item.split(' ');
                return {
                    name: pieces[0],
                    ready: pieces[1],
                    status: pieces[2],
                    restarts: pieces[3],
                    age: pieces[4],
                }
            });
            pods = pods.slice(1);
            this.setState({pods, loading: false});
            this.props.didLoad && this.props.didLoad(pods);
        }).catch(e => {
            alert(e);
            this.setState({loading: false});
        });
    }

    switchToPod(pod) {
        this.props.onChange && this.props.onChange(pod);
    }

    render() {

        return (
            <div style={this.props.style}>
                <span>Pod: </span>
                <select value={this.props.pod} onChange={e => this.switchToPod(e.target.value)}>
                    {
                        this.state.pods && this.state.pods.map((pod, index) => {
                            return <option key={index} value={pod.name}>{pod.name}</option>
                        })
                    }
                </select>
                { this.state.loading ? <span>&nbsp;&nbsp;&nbsp; loading...</span> : ''}
            </div>
        );
    }
}
