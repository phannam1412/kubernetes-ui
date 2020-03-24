
class EventList extends React.Component {
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
        let json = await myexec('kubectl get events');
        let events = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                last_seen: pieces[0],
                first_seen: pieces[1],
                count: pieces[2],
                name: pieces[3],
                kind: pieces[4],
                subobject: pieces[5],
                type: pieces[6],
                reason: pieces[7],
                source: pieces[8],
                message: pieces[9],
            }
        });
        events = events.slice(1);
        this.setState({events});
    }

    render() {
        return (
            <div>
                <h3>All Events</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Last Seen</td>
                        <td>First Seen</td>
                        <td>Count</td>
                        <td>Name</td>
                        <td>Kind</td>
                        <td>Subobject</td>
                        <td>Type</td>
                        <td>Reason</td>
                        <td>Source</td>
                        <td>Message</td>
                        <td/>
                    </tr>
                    {
                        this.state.events && this.state.events.map((event, index) => {
                            return (
                                <tr key={index}>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => describe('events', event.name)}>{event.name}</a>
                                    </td>
                                    <td>{event.last_seen}</td>
                                    <td>{event.first_seen}</td>
                                    <td>{event.count}</td>
                                    <td>{event.name}</td>
                                    <td>{event.kind}</td>
                                    <td>{event.subobject}</td>
                                    <td>{event.type}</td>
                                    <td>{event.reason}</td>
                                    <td>{event.source}</td>
                                    <td>{event.message}</td>
                                    <td>
                                        <a href="javascript:void(0)" onClick={() => showYamlEditor('events', event.name)}>YAML</a>
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
