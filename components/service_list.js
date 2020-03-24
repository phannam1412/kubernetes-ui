
class ServiceList extends React.Component {
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
        let json = await myexec('kubectl get services');
        let services = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                type: pieces[1],
                cluster_ip: pieces[2],
                external_ip: pieces[3],
                port: pieces[4],
                age: pieces[5],
            }
        });
        services = services.slice(1);
        this.setState({services: services});
    }

    async deleteService(service_name) {
        showAlert('deleting service...');
        let json = await myexec(`kubectl delete service ${service_name}`);
        showAlert(joinForDisplay(json));
    }

    render() {
        return (
            <div>
                <h3>All services</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Type</td>
                        <td>Cluster IP</td>
                        <td>External IP</td>
                        <td>Port</td>
                        <td>Age</td>
                        <td/>
                        <td/>
                        <td/>
                        <td/>
                    </tr>
                    {
                        this.state.services && this.state.services.map((service, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => describe('service', service.name)}>{service.name}</a>
                                    </td>
                                    <td>{service.type}</td>
                                    <td>{service.cluster_ip}</td>
                                    <td>{service.external_ip}</td>
                                    <td style={{maxWidth: 300}}>{service.port}</td>
                                    <td>{service.age}</td>
                                    <td><a href="javascript:void(0)" onClick={() => showYamlEditor('service', service.name)}>YAML</a></td>
                                    <td><a href={"http://" + service.name + "." + this.props.namespace + "." + this.props.context + ".internal.lel.asia"} target="_blank">Link</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => showWindow(<IframeWindow src={"http://" + service.name + "." + this.props.namespace + "." + this.props.context + ".internal.lel.asia/metrics"} />, 'Prometheus metrics')}>Prometheus metrics</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.deleteService(service.name)}>Delete</a></td>
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
