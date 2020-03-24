
class Main extends React.Component {
    constructor(props) {
        super(props);
        this.state = {context: '', namespace: ''};
    }

    componentDidMount() {
        this.init();
    }

    async init() {
        let data = await detectDefaultContextAndNamespace();
        this.setState({context: data[0], namespace: data[1]});
    }

    async switchContext(context) {
        console.log('Main->switchContext ' + context);
        showAlert('Switching to context ' + context + '...');
        await myexec('kubectl config use-context ' + context);
        trigger('switch-context');
        this.setState({context});
    }

    async switchNamespace(namespace) {
        console.log('Main->switchNamespace ' + namespace);
        showAlert('Switching to namespace ' + namespace + '...');
        await myexec(`kubectl config set-context ${this.state.context} --namespace=${namespace}`);
        trigger('switch-namespace');
        this.setState({namespace});
    }

    nodeDidLoad(nodes) {
        let text = [];
        nodes.forEach(node => {
            if(node.status !== 'Ready')
                text.push(node.name + ' (' + node.status + ')');
        });
        this.setState({warning: text.join(', '), node_notification: nodes.filter(item => item.status !== 'Ready').length});
    }

    render() {

        return (
            <div>
                <Alert/>
                <WindowManager/>
                <Modal/>
                <div className="container">
                    <h2>Kubernetes UI</h2>
                </div>
                <div className="container">
                    <div style={{display: 'flex', flexDirection: 'row'}}>
                        <ContextList context={this.state.context} autoload={15000} onChange={item => this.switchContext(item)} />
                        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                        <NamespaceList context={this.state.context} autoload={15000} namespace={this.state.namespace} onChange={item => this.switchNamespace(item)} />
                    </div>
                    <br/>
                    <MoreInfo context={this.state.context} namespace={this.state.namespace} />
                    <br/>
                    <ul className="nav nav-tabs">
                        <li className="active">
                            <a href="#1" data-toggle="tab">
                                Pods
                                {this.state.pod_notification && this.state.pod_notification > 0 ?
                                    <span className="badge badge-pill badge-danger" style={{left: 0, top: -10, position: 'relative'}}>{this.state.pod_notification}</span> : ''}
                            </a>
                        </li>
                        <li>
                            <a href="#5" data-toggle="tab">
                                Nodes
                                {this.state.node_notification && this.state.node_notification > 0 ?
                                    <span className="badge badge-pill badge-danger" style={{left: 0, top: -10, position: 'relative'}}>{this.state.node_notification}</span> : ''}
                            </a>
                        </li>
                        <li>
                            <a href="#2" data-toggle="tab">
                                Deployments
                                {this.state.deployment_notification && this.state.deployment_notification > 0 ?
                                    <span className="badge badge-pill badge-danger" style={{left: 0, top: -10, position: 'relative'}}>{this.state.deployment_notification}</span> : ''}
                            </a>
                        </li>
                        <li>
                            <a href="#3" data-toggle="tab">Services</a>
                        </li>
                        <li>
                            <a href="#11" data-toggle="tab">Configmaps</a>
                        </li>
                        <li>
                            <a href="#10" data-toggle="tab">Secrets</a>
                        </li>
                        <li>
                            <a href="#8" data-toggle="tab">ReplicaSets</a>
                        </li>
                        <li>
                            <a href="#13" data-toggle="tab">StatefulSets</a>
                        </li>
                        <li>
                            <a href="#12" data-toggle="tab">DaemonSets</a>
                        </li>
                        <li>
                            <a href="#4" data-toggle="tab">
                                Jobs
                                {this.state.job_notification && this.state.job_notification > 0 ?
                                    <span className="badge badge-pill badge-danger" style={{left: 0, top: -10, position: 'relative'}}>{this.state.job_notification}</span> : ''}
                            </a>
                        </li>
                        <li>
                            <a href="#9" data-toggle="tab">Events</a>
                        </li>
                        <li>
                            <a href="#6" data-toggle="tab">Persistent Volumes</a>
                        </li>
                        <li>
                            <a href="#7" data-toggle="tab">Persistent Volume Claims</a>
                        </li>
                    </ul>
                    <br/>
                    <br/>
                    <div className="tab-content ">
                        <div className="tab-pane active" id="1">
                            {this.state.warning && this.state.warning.length > 0 ? <p style={{color: 'red'}}>Warning: {this.state.warning}</p> : ''}
                            <PodList didLoad={pods => this.setState({pod_notification: pods.filter(item => item.status !== 'Running' && item.status !== 'Completed').length})} />
                        </div>
                        <div className="tab-pane" id="2">
                            <DeploymentList didLoad={items => this.setState({deployment_notification: items.filter(item => item.desired !== item.current).length})}/>
                        </div>
                        <div className="tab-pane" id="3">
                            <ServiceList namespace={this.state.namespace} context={this.state.context}/>
                        </div>
                        <div className="tab-pane" id="4">
                            <JobList didLoad={items => this.setState({job_notification: items.filter(item => item.desired !== item.successful).length})}/>
                        </div>
                        <div className="tab-pane" id="5">
                            <NodeList didLoad={nodes => this.nodeDidLoad(nodes)}/>
                        </div>
                        <div className="tab-pane" id="6">
                            <PersistentVolumeList/>
                        </div>
                        <div className="tab-pane" id="7">
                            <PersistentVolumeClaimList/>
                        </div>
                        <div className="tab-pane" id="8">
                            <ReplicaSetList/>
                        </div>
                        <div className="tab-pane" id="9">
                            <EventList/>
                        </div>
                        <div className="tab-pane" id="10">
                            <SecretList/>
                        </div>
                        <div className="tab-pane" id="11">
                            <ConfigMapList/>
                        </div>
                        <div className="tab-pane" id="12">
                            <DaemonSetList/>
                        </div>
                        <div className="tab-pane" id="13">
                            <StatefulSetList/>
                        </div>
                    </div>
                </div>

            </div>
        );
    }
}
