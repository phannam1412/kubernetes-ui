class WindowManager extends React.Component {
    constructor(props) {
        super(props);
        this.state = {modals: [], primary_key: 1};
    }

    componentDidMount() {
        bind('show-window', data => {
            console.log('show window ' + data.title);

            // Ensure that the new window is always on top.
            $('.kube-window').css('z-index', 9);

            data.primary_key = this.state.primary_key;
            this.state.primary_key++;
            this.state.modals.push(data);
            console.log('number of windows: ' + this.state.modals.length);
            this.forceUpdate();
        });
    }

    willHide(item) {

        console.log('will hide ', item);

        this.state.modals = this.state.modals.filter(modal => {
            return modal.primary_key !== item.primary_key;
        });

        console.log('number of windows: ' + this.state.modals.length);

        this.forceUpdate();
    }

    render() {
        return this.state.modals.map(item => <Window minWidth={item.min_width} minHeight={item.min_height} key={item.primary_key} primaryKey={item.primary_key} message={item.message} title={item.title} fn={item.fn} willHide={() => this.willHide(item)}/>);
    }
}
