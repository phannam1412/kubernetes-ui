
class PersistentVolumeClaimList extends React.Component {
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
        let json = await myexec('kubectl get pvc');
        let volumes = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                status: pieces[1],
                volume: pieces[2],
                capacity: pieces[3],
                access_modes: pieces[4],
                storage_class: pieces[5],
                age: pieces[6],
            }
        });
        volumes = volumes.slice(1);
        this.setState({volumes});
    }

    render() {
        return (
            <div>
                <h3>All persistent volume claims</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Status</td>
                        <td>Volume</td>
                        <td>Capacity</td>
                        <td>Access modes</td>
                        <td>Storage Class</td>
                        <td>Age</td>
                        <td/>
                    </tr>
                    {
                        this.state.volumes && this.state.volumes.map((volume, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => describe('pvc', volume.name)}>{volume.name}</a>
                                    </td>
                                    <td>{volume.name}</td>
                                    <td>{volume.status}</td>
                                    <td>{volume.volume}</td>
                                    <td>{volume.capacity}</td>
                                    <td>{volume.access_modes}</td>
                                    <td>{volume.storage_class}</td>
                                    <td>{volume.age}</td>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => showYamlEditor('pvc', volume.name)}>YAML</a>
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
