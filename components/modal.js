class Modal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {message: <div/>};
    }

    componentDidMount() {
        bind('show-custom', data => {
            $(this.modal).modal('show');
            this.setState({message: data.message, title: data.title});
        });
        bind('hide-custom', () => {
            $(this.modal).modal('hide');
        });
        bind('show-message', data => {
            $(this.modal).modal('show');
            this.setState({message: data.message, title: data.title});
        });
        bind('hide-message', () => {
            $(this.modal).modal('hide');
        });
    }

    render() {
        return (
            <div>
                <div className="modal fade show" ref={modal=> this.modal = modal} id="exampleModal" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
                    <div style={{maxWidth: 1200}} className="modal-dialog" role="document">
                        <div className="modal-content" style={{backgroundColor: '#111',borderWidth: 5, borderColor: 'white'}}>
                            <div className="modal-header">
                                <h5 style={{color: 'white'}} className="modal-title" id="exampleModalLabel">{this.state.title}</h5>
                                <a href="javascript:void(0)" type="button" className="close" data-dismiss="modal" aria-label="Close">
                                    <span aria-hidden="true">&times;</span>
                                </a>
                            </div>

                            {
                                typeof this.state.message === 'object'
                                    ? <div style={{color: 'white'}} className="modal-body">
                                        {this.state.message}
                                    </div>
                                    : <div style={{color: 'white'}} className="modal-body">
                                        <div dangerouslySetInnerHTML={{__html: this.state.message}} />
                                    </div>
                            }

                            <div className="modal-footer">
                                <a href="javascript:void(0)" type="button" className="btn btn-secondary" data-dismiss="modal">Close</a>
                                {/*<a href="javascript:void(0)" type="button" className="btn btn-primary">Save changes</a>*/}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }
}
