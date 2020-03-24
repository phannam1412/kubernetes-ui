class JobList extends React.Component {
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
        let json = await myexec('kubectl get jobs');
        let jobs = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                name: pieces[0],
                desired: pieces[1],
                successful: pieces[2],
                age: pieces[3],
            }
        });
        jobs = jobs.slice(1);
        this.setState({jobs});
        this.props.didLoad && this.props.didLoad(jobs);
    }

    async scale(job) {
        let replicas = prompt('How many replicas do you want to scale');
        showAlert('scaling job ' + job + '...');
        let json = await myexec(`kubectl scale job ${job} --replicas=${replicas}`);
        showAlert(json[0]);
    }

    async delete(job_name) {
        let text = await myexec('kubectl delete job ' + job_name);
        showAlert(text);
    }

    render() {
        return (
            <div>
                <h3>All jobs</h3>
                <table className="table table-striped">
                    <tbody>
                    <tr>
                        <td>Name</td>
                        <td>Desired</td>
                        <td>Successful</td>
                        <td>Age</td>
                        <td/>
                        <td/>
                        <td/>
                    </tr>
                    {
                        this.state.jobs && this.state.jobs.map((job, index) => {
                            return (
                                <tr key={index}>
                                    <td><a href="javascript:void(0)" onClick={() => describe('job', job.name)}>{job.name}</a></td>
                                    <td>{job.desired}</td>
                                    <td>{job.successful}</td>
                                    <td>{job.age}</td>
                                    <td><a href="javascript:void(0)" onClick={() => showYamlEditor('job', job.name)}>YAML</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.scale(job.name)}>Scale</a></td>
                                    <td><a href="javascript:void(0)" onClick={() => this.delete(job.name)}>Delete</a></td>
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
