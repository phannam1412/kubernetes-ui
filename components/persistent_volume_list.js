
class PersistentVolumeList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentWillMount() {
        setInterval(() => this.load(), 15000);
        bind('switch-context', data => this.load());
        bind('switch-namespace', data => this.load());
    }

    async load() {
        let json = await myexec('kubectl get pv');
        let volumes = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                capacity: pieces[1],
                access_modes: pieces[2],
                reclaim_policy: pieces[3],
                status: pieces[4],
                claim: pieces[5],
                storage_class: pieces[6],
                reason: pieces[7],
                age: pieces[8],
            }
        });
        volumes = volumes.slice(1);
        this.setState({volumes});
    }

    render() {
        return (
            <div>
                <h3>All persistent volumes</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Capacity</td>
                        <td>Access modes</td>
                        <td>Reclaim Policy</td>
                        <td>Status</td>
                        <td>Claim</td>
                        <td>Storage Class</td>
                        <td>Reason</td>
                        <td>Age</td>
                        <td/>
                    </tr>
                    {
                        this.state.volumes && this.state.volumes.map((volume, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => describe('pv', volume.name)}>{volume.name}</a>
                                    </td>
                                    <td>{volume.name}</td>
                                    <td>{volume.capacity}</td>
                                    <td>{volume.access_modes}</td>
                                    <td>{volume.reclaim_policy}</td>
                                    <td>{volume.status}</td>
                                    <td>{volume.claim}</td>
                                    <td>{volume.storage_class}</td>
                                    <td>{volume.reason}</td>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => showYamlEditor('pv', volume.name)}>YAML</a>
                                    </td>
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
