<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8" />
    <title>Kubernetes UI</title>
    <link rel="stylesheet" href="bootstrap.min.css" />

    <style>
        .nav-tabs li {
            padding: 15px;
            border: 1px solid #111;
        }
        td .action-list {
            position: absolute;
            display: none;
            background-color: #222;
            top: 30px;
            left: 10px;
            z-index: 100;
            min-width: 300px;
        }
        td:hover .action-list {
            display: block;
        }
        .status-running {
            color: green;
        }
        .status-completed {
            color: grey;
        }
        .status-crashloopbackoff, .status-containercannotrun, .status-imagepullbackoff, .status-unknown, .status-error {
            color: red;
        }

        body.modal-open {
            overflow: visible;
        }

        body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            background-color: black;
            color: white;
            font-size: 12px;
            font-family: "monospace";
            max-width: 1200px;
            padding: 15px;
        }

        a {
            color: #80bdff;
        }

        .table td, .table th {
            border-top: 1px solid #222 !important;
        }

        .nav-tabs {
            border-bottom: none;
        }
    </style>
</head>
<body>

<div id="main"></div>


<!-- react -->
<script src="react.development.js" crossorigin></script>
<script src="react-dom.development.js" crossorigin></script>

<!-- babel -->
<script src="babel.min.js"></script>


<!-- xterm -->
<!--<link rel="stylesheet" href="node_modules/xterm/dist/xterm.css" />-->
<!--<script src="node_modules/xterm/dist/xterm.js"></script>-->
<!--<div id="terminal"></div>-->
<!--<script>-->
<!--    var term = new Terminal();-->
<!--    term.open(document.getElementById('terminal'));-->
<!--    term.write('$ ')-->
<!--</script>-->




<!-- bootstrap -->
<script src="jquery-3.3.1.slim.min.js"></script>
<script src="popper.min.js"></script>
<script src="bootstrap.min.js"></script>

<!-- Bootstrap core JavaScript
    ================================================== -->
<!-- Placed at the end of the document so the pages load faster -->
<script src="https://ajax.googleapis.com/ajax/libs/jquery/1.11.1/jquery.min.js"></script>
<script src="//maxcdn.bootstrapcdn.com/bootstrap/3.2.0/js/bootstrap.min.js"></script>

<!--<script src="prop-types.js"></script>-->
<!--<script src="react-tabs.development.js"></script>-->

<!-- jQuery UI -->
<link rel="stylesheet" href="https://code.jquery.com/ui/1.11.3/themes/smoothness/jquery-ui.css" />
<script src="https://code.jquery.com/ui/1.11.3/jquery-ui.min.js"></script>

<script type="text/babel">

    <?php print file_get_contents('lib.js'); ?>

    <?php
    $files = glob('./components/*');
    foreach($files as $file)
        if(is_file($file))
            print file_get_contents($file);
    ?>

    ReactDOM.render(<Main/>, document.querySelector('#main'));

</script>

</body>
</html>
