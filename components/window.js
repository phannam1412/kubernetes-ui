class Window extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidMount() {
        console.log('window.js componentDidMount with primary key ' + this.props.primaryKey);

        $(this.modal).resizable({
            minHeight: 300,
            minWidth: 300,
            handles: 'all',
        });

        $(this.modal).draggable({
            cancel: ".modal-body",
            cursor: "move",
            iframeFix: true,
            scroll: false,
            // opacity: 0.7,
        });

        if(this.props.fn)
            this.props.fn().then(message => this.setState({message}));
        else
            this.setState({message: this.props.message});
    }

    onClick() {
        $('.kube-window').css('z-index', 9);
        $(this.modal).css('z-index', 99);
    }

    render() {

        return (
            <div
                 className="kube-window"
                 style={{width: 600, height: 400, minWidth: this.props.minWidth, minHeight: this.props.minHeight, position: 'fixed', display: 'block', zIndex: 99}}
                 ref={modal=> this.modal = modal}
                 onMouseDown={() => this.onClick()}
                 onClick={() => this.onClick()}>
                <div className="modal-content" style={{backgroundColor: '#111',borderWidth: 5, borderColor: 'white', height: '100%'}}>
                    <div className="modal-header" style={{display: "block", padding: 5, paddingTop: 10}}>
                        <p style={{color: 'white', float: "left"}} className="modal-title">{this.props.title}</p>
                        <a onClick={() => this.props.willHide && this.props.willHide()} href="javascript:void(0)" className="close" data-dismiss="modal" aria-label="Close" style={{float: "right", margin: 0, padding: 0, position: "relative", top: -5, left: -5}}>
                            <span aria-hidden="true">&times;</span>
                        </a>
                    </div>
                    {
                        typeof this.state.message === 'object'
                            ? <div style={{color: 'white', overflowY: 'scroll', position: 'relative'}} className="modal-body">
                                {this.state.message}
                            </div>
                            : <div style={{color: 'white', overflowY: 'scroll', position: 'relative'}} className="modal-body">
                                <div dangerouslySetInnerHTML={{__html: this.state.message}} />
                            </div>
                    }
                </div>
            </div>
        )
    }
}
