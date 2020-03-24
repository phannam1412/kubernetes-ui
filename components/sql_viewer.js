class SqlViewer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            context: '',
            namespace: '',
            text: '',
            input: '',
            database: '',
            tables: [],
            pod: '',
            loading: false,
            db_dump_file: '',
            is_dumping: false,
            dumping_database: '',
            loading_database: false,
        };
    }

    componentDidMount() {
        this.detectDefaultContextAndNamespace();
    }

    async detectDefaultContextAndNamespace() {

        let json = await myexec('kubectl config get-contexts');

        let contexts = json.map(item => {
            item = item.replace(/\s\s+/g, ' ');
            let pieces = item.split(' ');
            return {
                current: pieces[0],
                name: pieces[1],
                cluster: pieces[2],
                authinfo: pieces[3],
                namespace: pieces[4],
            }
        });

        contexts = contexts.slice(1);

        let selected = '';

        contexts.forEach(item => selected = item.current === '*' ? item : selected);

        if(selected === '') return ['', ''];

        let context = selected.name;
        let namespace = selected.namespace;
        let pod = '';

        if(context === 'showroom' || context === 'lel_stfw') {
            namespace = 'wide';
            pod = 'wide-db-node1-0';
            this.setState({context, namespace, pod});
            this.loadDatabases(pod);
            return;
        }

        if(context === 'staging') {
            pod = namespace + '-db-node1-0';
            this.setState({context, namespace, pod});
            this.loadDatabases(pod);
            return;
        }

        this.setState({context, namespace, pod});
    }

    execute() {
        this.setState({loading: true});
        let cursorStart = this.refs.myTextarea.selectionStart;
        let cursorEnd = this.refs.myTextarea.selectionEnd;
        let input = this.state.input.substring(cursorStart,cursorEnd);
        if(input.length === 0) {
            this.setState({text: 'Error: Please select sql statement for executing', loading: false});
            return;
        }
        this.executeSql(input);
    }

    listTables() {
        this.setState({loading: true});
        this.executeSql(`\\dt`);
    }

    async executeSql(input) {
        try {
            let json = await myexec(`kubectl exec ${this.state.pod} --context=${this.state.context} --namespace=${this.state.namespace} -- gosu postgres psql -d ${this.state.database} -c "${input}"`);
            if(json.length === 0) this.setState({text: 'No results, maybe error, please check again your query', loading: false});
            else this.setState({text: joinForDisplay(json), loading: false});
        } catch(e) {
            showAlert(e);
            this.setState({loading: false});
        }
    }

    loadDatabases(pod) {
        this.setState({pod, loading_database: true});
        myexec(`kubectl exec ${pod} --context=${this.state.context} --namespace=${this.state.namespace} -- gosu postgres psql -c "\\l"`)
            .then(json => {

                let tables = json.map(item => {

                    item = item.replace(/\s\s+/g, ' ');

                    let pieces = item.split('|');

                    return {
                        name: pieces[0],
                        owner: pieces[1],
                        encoding: pieces[2],
                        collate: pieces[3],
                        ctype: pieces[4],
                        access_privileges: pieces[5],
                    }
                });

                tables = tables.slice(3).filter(item => item.name.trim().length > 0 && item.name.indexOf('rows)') === -1);
                this.setState({tables, database: tables.length > 0 ? tables[0].name : ''});
            })
            .catch(e => {
                alert(e);
                this.setState({loading_database: false});
            });
    }

    switchDatabase(database) {
        this.setState({database});
        this.state.database = database;
        this.listTables();
    }

    onKeyUp(e) {
        if (e.key === 'Enter' && e.metaKey) this.execute();
        if (e.key === 'Enter' && e.ctrlKey) this.execute();
    }

    async viewMasterSlave() {

        if(!this.state.pod) {
            alert('Please select a pod');
            return;
        }

        showWindow('', 'View Master - Slave', async () => {
            let json = await myexec(`kubectl exec -it ${this.state.pod} --context=${this.state.context} --namespace=${this.state.namespace} gosu postgres repmgr cluster show`);
            return joinForDisplay(json);
        });
    }

    dumpDatabase() {
        if(!this.state.database) {
            alert('Please select a database for dumping');
            return;
        }
        showAlert('Dumping database ' + this.state.database + '...');
        this.setState({
            db_dump_file: '',
            is_dumping: true,
            dumping_database: this.state.database,
        });
        let command = `kubectl exec ${this.state.pod} --context=${this.state.context} --namespace=${this.state.namespace} -- gosu postgres pg_dump -d ${this.state.database} --format=c > tmp/db.dump`;
        call_api('GET', '/myexec', {command}, null, 30 * 60 * 1000) // wait 30 minutes
            .then(text => {
                let json = JSON.parse(text);
                if(json.length > 0) showAlert(joinForDisplay(json));
                else showAlert('Dumping database sucessfully');
                this.setState({
                    db_dump_file: getBaseUrl() + '/tmp/db.dump',
                    is_dumping: false,
                });
            }).catch(e => alert(e));
    }

    async dropDatabase() {
        if(!this.state.database) {
            alert('Please select a database for dropping');
            return;
        }
        let command = `kubectl exec ${this.state.pod} --context=${this.state.context} --namespace=${this.state.namespace} -- gosu postgres dropdb ${this.state.database}`;
        showAlert(command);
        let text = await myexec(command);
        showAlert(text);
        this.loadDatabases(this.state.pod);
    }

    async dropAndCreateDatabase() {
        if(!this.state.database) {
            alert('Please select a database for dropping');
            return;
        }

        showAlert('Deleting and creating database');

        let command = `kubectl exec ${this.state.pod} --context=${this.state.context} --namespace=${this.state.namespace} -- gosu postgres dropdb ${this.state.database}`;
        await myexec(command);
        command = `kubectl exec ${this.state.pod} --context=${this.state.context} --namespace=${this.state.namespace} -- gosu postgres createdb ${this.state.database}`;
        await myexec(command);

        this.loadDatabases(this.state.pod);
    }

    async createDb() {
        let db_name = prompt('Please enter database name: ');
        let command = `kubectl exec ${this.state.pod} --context=${this.state.context} --namespace=${this.state.namespace} -- gosu postgres createdb ${db_name}`;
        await myexec(command);
        this.loadDatabases(this.state.pod);
    }

    async executeSqlFile() {
        showAlert('Executing SQL file');
        await ajaxSubmitFiles(this.refs.fileInput.files[0], '/execute-sql-file', {pod: this.state.pod, context: this.state.context, namespace: this.state.namespace, database: this.state.database});
        showAlert('Executed SQL file successfully !');
    }

    render() {
        return (
            <div>
                <ContextList style={{display: 'inline-block'}} context={this.state.context} onChange={item => this.setState({context: item})} />
                &nbsp;&nbsp;&nbsp;
                <NamespaceList style={{display: 'inline-block'}} context={this.state.context} namespace={this.state.namespace} onChange={item => this.setState({namespace: item})} />
                &nbsp;&nbsp;&nbsp;
                <PodDropdownList style={{display: 'inline-block'}} context={this.state.context} namespace={this.state.namespace} pod={this.state.pod} onChange={pod => this.loadDatabases(pod)} />
                <br/>
                Database: <select value={this.state.database} onChange={e => this.switchDatabase(e.target.value)}>
                    {this.state.tables.length && this.state.tables.map((item, index) => <option key={index}>{item.name}</option>)}
                </select>
                &nbsp; &nbsp; { this.state.database_loading ? <span>loading...</span> : '' }
                <br/>
                <br/>
                <a href="javascript:void(0)" onClick={() => this.listTables()}>List tables</a> &nbsp;&nbsp;&nbsp;
                <a href="javascript:void(0)" onClick={() => this.viewMasterSlave()}>View master/slave</a> &nbsp;&nbsp;&nbsp;

                {
                    this.state.is_dumping ?
                        <span>Dumping {this.state.dumping_database}...</span>
                        : <span>
                            <a href="javascript:void(0)" onClick={() => this.dumpDatabase()}>Dump this db</a> &nbsp;
                            { this.state.db_dump_file ? <a href={this.state.db_dump_file} target="_blank">({this.state.db_dump_file})</a> : '' }
                        </span>
                }

                <a href="javascript:void(0)" onClick={() => this.dropDatabase()}>Drop this db</a> &nbsp;&nbsp;&nbsp;
                <a href="javascript:void(0)" onClick={() => this.dropDatabase()}>Drop & create this db</a> &nbsp;&nbsp;&nbsp;
                <a href="javascript:void(0)" onClick={() => this.createDb()}>Create db</a> &nbsp;&nbsp;&nbsp;

                <br/>
                Execute SQL file: <input type="file" ref='fileInput' />
                <a href="javascript:void(0)" onClick={() => this.executeSqlFile()}>Exec</a> &nbsp;&nbsp;&nbsp;

                <br/>
                <br/>
                {
                    this.state.loading ? 'Executing ' + this.state.input + '...'
                        : <div style={{overflow: 'scroll', maxHeight: 450, whiteSpace: 'nowrap'}} dangerouslySetInnerHTML={{__html: this.state.text}} />
                }
                <br/>
                <textarea style={{backgroundColor: '#222', border: 0, color: 'white'}} ref='myTextarea' className="form-control" rows="5" onKeyUp={e => this.onKeyUp(e)} value={this.state.input} onChange={e => this.setState({input: e.target.value})} />
                <br/>
                <a href="javascript:void(0)" onClick={() => this.execute()}>Execute</a>&nbsp;&nbsp;
                <a href="javascript:void(0)" data-dismiss="modal">Close</a>&nbsp;&nbsp;
            </div>
        )
    }
}
