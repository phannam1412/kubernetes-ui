
class MoreInfo extends React.Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
    }

    addWindow() {
        let url = prompt('Please enter your url:');
        if(url.trim().length === 0) return;
        showWindow(<IframeWindow src={url} />, url);
    }

    render() {

        let teamcity_link = '';
        let prometheus = '';
        let grafana = '';
        if(this.props.context === 'lel_stfw') {
            let ticket_id = this.props.namespace.substr(5).toUpperCase();
            teamcity_link = "http://teamcity.internal.lel.asia/viewType.html?buildTypeId=Ops_StressTestFramework_StfwCluster_CreateStfwCluster&branch_Ops_StressTestFramework_StfwCluster="+ticket_id+"&tab=buildTypeStatusDiv";
            prometheus = "http://prometheus.monitoring.staging.internal.lel.asia/graph?g0.range_input=1h&g0.tab=1";
            grafana = 'http://grafana.monitoring.stfw.internal.lel.asia/d/4iNiG9cizqwe/stress-test-v-1-1?orgId=1&from=now-5m&to=now&var-interval=5m&var-name_space=stfw-stfwa-47&var-sampler=All&var-locust_path=All';
        }

        if(this.props.context === 'showroom') {
            prometheus = 'http://trackingnumbers.'+this.props.namespace+'.'+this.props.context+'.internal.lel.asia/metrics';
            grafana = 'http://grafana.monitoring.showroom.internal.lel.asia/d/4iNiG9cizqwe/stress-test-v-1-1?orgId=1&from=now-5m&to=now&var-interval=5m&var-name_space=stfw-stfwa-47&var-sampler=All&var-locust_path=All';

            if(this.props.namespace.indexOf('stfw-') === 0) {
                let ticket_id = this.props.namespace.substr(5).toUpperCase();
                teamcity_link = "http://teamcity.internal.lel.asia/viewType.html?buildTypeId=Ops_StressTestFramework_CreateShowroom&branch_Ops_StressTestFramework_Showroom="+ticket_id+"&tab=buildTypeStatusDiv";
            }

            if(this.props.namespace.indexOf('tms-') === 0) {
                let ticket_id = this.props.namespace.substr(4).toUpperCase();
                teamcity_link = "http://teamcity.internal.lel.asia/viewType.html?buildTypeId=Ops_Tms_Showrooms_Create&branch_Ops_Tms_Showrooms="+ticket_id+"&tab=buildTypeStatusDiv";
            }
        }

        return (
            <div>
                { teamcity_link ? <a href="javascript:void(0)" onClick={() => showWindow(<IframeWindow src={teamcity_link} />, teamcity_link)}> - Teamcity </a> : '- Teamcity' }
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a href="https://jira.lzd.co/secure/RapidBoard.jspa?rapidView=688&selectedIssue=ADDR-121&quickFilter=8360" target="_blank">
                    - Jira</a>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a href="javascript:void(0)" onClick={() => showWindow(<IframeWindow src={prometheus} />, prometheus)}>
                    - Prometheus</a>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a href="javascript:void(0)" onClick={() => showWindow(<IframeWindow src={grafana} />, grafana)}>
                    - Grafana</a>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a href="javascript:void(0)" onClick={() => showWindow(<SqlViewer />, 'SQL Viewer', null, 800, 600)}>
                    - SQL Viewer </a>
                &nbsp;&nbsp;&nbsp;&nbsp;
                <a href="javascript:void(0)" onClick={() => this.addWindow()}>
                    - Add window </a>
                &nbsp;&nbsp;&nbsp;&nbsp;
            </div>
        )
    }
}


/*


Hi Liya,

                                         isActive                                    deletedAt
                    |
Expected result     |    - when true, the areas can be queried      - when null, the areas can be queried based on application logic
                    |    - when false, the areas are hidden         - when not null, the areas are always hidden
--------------------|-----------------------------------------------------------------------------------------------------------------
Actual result       |                                               - when null, the areas can also be retrieved in
                    |                                                 /addresses/administrative-levels/:id
                    |                                                 /addresses/administrative-levels/:id/parents


 */
