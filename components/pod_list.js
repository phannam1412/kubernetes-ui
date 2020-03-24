class PodList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            pods: [],
        };
    }

    componentWillMount() {
        this.load();

        setInterval(() => {
            this.setState({loading: true});
            this.load();
        }, 5000);

        bind('switch-context', data => this.load());
        bind('switch-namespace', data => this.load());
    }

    getMoreDetailForPod(pods) {
        pods.forEach(async item => {
            if(!this.inTrackingStatuses(item.status)) return item;
            let json = await myexec('kubectl describe pod ' + item.name);
            item.note = json[json.length - 1];
            this.forceUpdate();
        });
    }

    async load() {
        let json = await myexec('kubectl get pods');
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

        // Keep the old note before loading new note to ensure the UI doesn't fluctuate so much.
        let old = this.state.pods.filter(item => this.inTrackingStatuses(item.status));
        old.forEach(item => {
            pods.forEach(pod => {
                if(pod.name === item.name)
                    pod.note = item.note;
            });
        });

        this.setState({pods, loading: false});
        this.props.didLoad && this.props.didLoad(pods);
        this.getMoreDetailForPod(pods);
    }

    inTrackingStatuses(status) {
        return ['Running', 'Completed', 'Terminating'].indexOf(status) === -1;
    }

    async viewLog(pod_name, container = '') {
        showWindow(<LogViewer pod={pod_name} />, 'kubectl logs ' + pod_name)
    }

    async deletePod(pod_name) {
        showAlert('deleting pod...');
        let json = await myexec(`kubectl delete pod ${pod_name}`);
        showAlert(joinForDisplay(json));
    }

    async forceDeletePod(pod_name) {
        showAlert('fofce deleting pod...');
        let json = await myexec(`kubectl delete pod ${pod_name} --grace-period=0 --force`);
        showAlert(joinForDisplay(json));
    }

    async command(pod_name) {
        showWindow(<CommandLine pod={pod_name} />, 'kubectl exec -it ' + pod_name + ' bash')
    }

    async recreate(pod_name) {
        showAlert('recreating pod...');
        call_api('POST', '/recreate', {pod: pod_name});
    }

    swipeAll() {
        if(!this.state.pods) return;
        let count = 0;
         this.state.pods.forEach(pod => {
             if(this.state.filter && this.state.filter.trim().length > 0 && pod.name.indexOf(this.state.filter) === - 1)
                 return;
             count++;
             myexec(`kubectl delete pod ${pod.name} --grace-period=0 --force`);
         });
        showAlert('Swipping ' + count + ' pods...');
    }

    render() {
        return (
            <div>
                <h3>All pods ({this.state.pods && this.state.pods.length})</h3>
                Filter: <input type="text" onChange={e => this.setState({filter: e.target.value})} />
                <span style={{display: 'inline-block', width: 200}}> {this.state.loading === true ? 'loading...' : ''}</span>
                <a href="javascript:void(0)" onClick={() => this.swipeAll()}>Swipe all</a>
                <br/>
                <br/>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Ready</td>
                        <td>Status</td>
                        <td>Restarts</td>
                        <td>Age</td>
                        <td/>
                        <td/>
                        <td/>
                        <td/>
                        <td/>
                        <td/>
                        <td/>
                    </tr>
                    {
                        this.state.pods && this.state.pods.map((pod, index) => {

                            if(this.state.filter && this.state.filter.trim().length > 0 && pod.name.indexOf(this.state.filter) === - 1)
                                return <tr key={index} />;

                                let should_show_note = this.inTrackingStatuses(pod.status);
                            
                            return (
                                <tr key={pod.name}>
                                    <td style={{position: "relative"}}>
                                        <a href="javascript:void(0)" onClick={() => describe('pod', pod.name)}>{pod.name}</a>
                                        <br/>
                                        {should_show_note && <span className="note" style={{fontSize: 10, color: 'lightgray'}}>{pod.note}</span>}
                                    </td>
                                    <td>{pod.ready}</td>
                                    <td className={'status-' + pod.status.toLowerCase()}>{pod.status}</td>
                                    <td>{pod.restarts}</td>
                                    <td>{pod.age}</td>
                                    <td><a href="javascript:void(0)" onClick={() => showYamlEditor('pod', pod.name)}>YAML</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.command(pod.name)}>Execute</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.viewLog(pod.name)}>Log</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.recreate(pod.name)}>Recreate</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.deletePod(pod.name)}>Delete</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.forceDeletePod(pod.name)}>Force Delete</a></td>
                                </tr>
                            )
                        })
                    }
                    </tbody>
                </table>

            </div>
        )
    }
}
