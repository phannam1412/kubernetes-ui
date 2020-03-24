<?php

use Psr\Http\Message\UploadedFileInterface;
use React\ChildProcess\Process;
use React\Http\Response;
use React\Promise\Promise;
use React\Socket\ConnectionInterface;

include './vendor/autoload.php';

//error_reporting(0);
//@ini_set('display_errors', 0);

ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

/***
 * Execute a command asynchronously.
 * The command will be executed in a child process and response data is returned to client
 * when the command finished execution without blocking other commands.
 *
 * @param $command
 * @param $loop
 * @return Promise
 */
function async_exec($command, $loop) {

    print $command . PHP_EOL;

    return new Promise(function ($resolve, $reject) use ($command, $loop) {

        $result = '';
        $process = new \React\ChildProcess\Process($command);
        $process->start($loop);

        # Process receives data.
        $process->stdout->on('data', function ($chunk) use (&$result) {
            $result .= $chunk;
        });

        # Process exist event.
        $process->on('exit', function($exitCode, $termSignal) use (&$result, $resolve) {

            # Remove empty lines.
            $lines = explode(PHP_EOL, $result);
            $lines = array_filter($lines, function($line){
                return strlen(trim($line)) > 0;
            });

            $resolve(new React\Http\Response(
                         200,
                         array('Content-Type' => 'application/json'),
                         json_encode(array_values($lines))
                     ));
        });
    });
}

# Experiment
//function enablePodExec($loop) {
//    $chat = new React\Socket\Server('127.0.0.1:6000', $loop);
//    $chat->on('connection', function(ConnectionInterface $connection) use($loop) {
//
//        $process = new \React\ChildProcess\Process("kubectl get pods | grep addresses-api-69b4c64d98-5rlss | awk '{print $1}' | xargs -o -J % kubectl exec -it % /bin/bash");
//        $process->start($loop);
//
//        // stdout
//        $process->stdout->on('data', function ($chunk) use ($connection) {
//            $connection->write($chunk);
//        });
//
//        // stderr
//        $process->stderr->on('data', function ($chunk) use ($connection) {
//            $connection->write($chunk);
//        });
//
//        // stdin
//        $connection->on('data', function($data) use ($connection, $process){
//            $result = $process->stdin->write($data);
//        });
//    });
//}

$loop = React\EventLoop\Factory::create();

$router = function(Psr\Http\Message\ServerRequestInterface $request) use($loop) {
    try {
        $uri = $request->getUri()->getPath();

        # Execute commands ?
        if($uri === '/myexec') {
            $_get = $request->getQueryParams();
            return async_exec($_get['command'] . ' 2>&1', $loop);
        }

        # Home ?
        if($uri === '/') {
            ob_start();
            include 'view.php';
            return new React\Http\Response(
                200,
                array('Content-Type' => 'text/html'),
                ob_get_clean()
            );
        }

        # create-from-yaml ?
        if($uri === '/create-from-yaml') {
            $_POST = $request->getParsedBody();
            print 'create from yaml file' . PHP_EOL;
            $yaml = $_POST['yaml'];
            $type = $_POST['type'];
            $name = $_POST['name'];

            file_put_contents('tmp/test.yaml', $yaml);

            return async_exec("(kubectl delete $type $name && kubectl create -f tmp/test.yaml) 2>&1", $loop);
        }

        # apply-from-yaml ?
        if($uri === '/apply-from-yaml') {
            $_POST = $request->getParsedBody();
            $yaml = $_POST['yaml'];
            $type = $_POST['type'];
            $name = $_POST['name'];
            file_put_contents('tmp/test.yaml', $yaml);
            return async_exec("(kubectl apply -f tmp/test.yaml) 2>&1", $loop);
        }

        # recreate ?
        if($uri === '/recreate') {
            $_POST = $request->getParsedBody();
            $pod = $_POST['pod'];
            return async_exec("(kubectl get pod $pod -o yaml > tmp/test.yaml && kubectl delete pod $pod && kubectl create -f tmp/test.yaml) 2>&1", $loop);
        }

        # execute sql file
        if($uri === '/execute-sql-file') {
            $_POST = $request->getParsedBody();
            $files = $request->getUploadedFiles();

            /* @var $file UploadedFileInterface */
            $file = $files['file'];

            $result = file_put_contents('/tmp/query.sql',$file->getStream());
            if($result === false)
                throw new Exception('Cannot save uploaded file');
            $pod = $_POST['pod'];
            $context = $_POST['context'];
            $namespace = $_POST['namespace'];
            $database = $_POST['database'];
            return async_exec("(kubectl cp --context=$context --namespace=$namespace /tmp/query.sql $pod:/tmp/query.sql) 2>&1", $loop)->then(function() use($pod, $context, $namespace, $database, $loop) {
                return async_exec("(kubectl exec $pod --context=$context --namespace=$namespace -- gosu postgres psql -d $database -a -f /tmp/query.sql) 2>&1", $loop);
            });
//            return async_exec("(kubectl exec $pod --context=$context --namespace=$namespace -- gosu postgres psql -d $database -a -f /tmp/query.sql) 2>&1", $loop);
        }

        # view log ?
        if($uri === '/log') {

            $_get = $request->getQueryParams();
            if(isset($_get['container']) && !empty($_get['container'])) {
                $pod = $_get['pod'];
                $container = $_get['container'];

                # There is a weird browser buffer that won't display results when the response is too small.
                # This "cat hello.txt" just to add more output to the response so that it will always display
                # response to the browser.
                $process = new \React\ChildProcess\Process("cat hello.txt && kubectl logs -f $pod -c $container"); # 1mb
            }
            else {
                $pod = $_get['pod'];
                $process = new \React\ChildProcess\Process("cat hello.txt && kubectl logs -f $pod"); # 1mb
            }
            $process->start($loop);
            return new React\Http\Response(200,['Content-Type' => 'text/plain'],$process->stdout);
        }

        # prometheus metrics ?
        if($uri === '/metrics') {
            $text = '
# HELP users_api_requests_total A counter for requests to the wrapped handler.
# TYPE users_api_requests_total counter
users_api_requests_total{code="200",method="get"} 10
users_api_requests_total{code="200",method="post"} 6
            ';
            return new React\Http\Response(200, [], $text);
        }

        # Accessing to /tmp dir. Force download.
        if(strpos($uri, '/tmp/') === 0) {
            $info = pathinfo($uri);
            $name = $info['basename'];
            return new React\Http\Response(
                200,
                ['Content-Type' => 'application/octet-stream', 'Content-Disposition' => "attachment; filename=\"$name\""],
                file_get_contents(ltrim($uri, '/'))
            );
        }

        # Resources ?
        $info = pathinfo($uri);

        # css ?
        if($info['extension'] === 'css') {
            return new React\Http\Response(
                200,
                array('Content-Type' => 'text/css'),
                file_get_contents(ltrim($uri, '/'))
            );
        }

        # js ?
        if($info['extension'] === 'js') {
            return new React\Http\Response(
                200,
                array('Content-Type' => 'text/javascript'),
                file_get_contents(ltrim($uri, '/'))
            );
        }

        # 400 Bad Request
        return new React\Http\Response(
            400,
            array('Content-Type' => 'text/plain'),
            'Command not found'
        );

    } catch(Exception $e) {
        print 'Error: ' . $e->getMessage() . PHP_EOL;

        # 400 Bad Request
        return new React\Http\Response(
            400,
            array('Content-Type' => 'text/plain'),
            'Error: ' . $e->getMessage()
        );
    }
};

$server = new React\Http\Server($router);
$socket = new React\Socket\Server('127.0.0.1:5000', $loop);
$server->listen($socket);
echo "Server running at http://localhost:5000\n";

$loop->run();
