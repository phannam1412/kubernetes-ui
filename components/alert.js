
class Alert extends React.Component {
    constructor(props) {
        super(props);
        this.state = {message: ''};
    }

    componentDidMount() {
        bind('show-alert', data => {
            this.setState({message: data.message});
            if($(this.component).hasClass('show')) return;
            $(this.component).fadeTo(3000, 500).fadeOut();
        });
    }

    render() {
        return (
            <div style={{zIndex: 9999,display: 'none', position: 'fixed', width: '80%', left: '10%', bottom: 50}} ref={component => this.component = component} className="alert alert-warning alert-dismissible fade" role="alert">
                {this.state.message}
                <a href="javascript:void(0)" type="button" className="close" data-dismiss="alert" aria-label="Close">
                    <span aria-hidden="true">&times;</span>
                </a>
            </div>
        )
    }
}
