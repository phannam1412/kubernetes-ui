class DeploymentList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        setInterval(() => this.load(), 5000);
        bind('switch-context', data => this.load());
        bind('switch-namespace', data => this.load());
    }

    async load() {
        let json = await myexec('kubectl get deployments');
        let deployments = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                desired: pieces[1],
                current: pieces[2],
                up_to_date: pieces[3],
                available: pieces[4],
                age: pieces[5],
            }
        });
        deployments = deployments.slice(1);
        this.setState({deployments});
        this.props.didLoad && this.props.didLoad(deployments);
    }

    async scale(deployment_name) {
        let replicas = prompt('How many replicas do you want to scale');
        showAlert('scaling deployment ' + deployment_name + '...');
        let json = await myexec(`kubectl scale deployment ${deployment_name} --replicas=${replicas}`);
        showAlert(json[0]);
    }

    async deleteDeployment(deployment_name) {
        showAlert('deleting deployment...');
        let json = await myexec(`kubectl delete deployment ${deployment_name}`);
        showAlert(joinForDisplay(json));
    }

    render() {
        return (
            <div>
                <h3>All deployments</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Desired</td>
                        <td>Current</td>
                        <td>Up-to-date</td>
                        <td>Available</td>
                        <td>Age</td>
                        <td/>
                        <td/>
                        <td/>
                    </tr>
                    {
                        this.state.deployments && this.state.deployments.map((deployment, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => describe('deployment', deployment.name)}>{deployment.name}</a>
                                    </td>
                                    <td>{deployment.desired}</td>
                                    <td>{deployment.current}</td>
                                    <td>{deployment.up_to_date}</td>
                                    <td>{deployment.available}</td>
                                    <td>{deployment.age}</td>
                                    <td><a href="javascript:void(0)" onClick={() => showYamlEditor('deployment', deployment.name)}>Yaml</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.scale(deployment.name)}>Scale</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.deleteDeployment(deployment.name)}>Delete</a></td>
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
