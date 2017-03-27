<?php
require_once 'rabbit_vendor/autoload.php';

use PhpAmqpLib\Connection\AMQPStreamConnection;
use PhpAmqpLib\Message\AMQPMessage;

class Consumer extends CI_Controller
{

    private $connection;
    private $channel;
    private $response;
    private $corr_id;

    public function __construct()
    {
        parent::__construct();
        $this->connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
        $this->channel = $this->connection->channel();
    }

    public function queueSend()
    {
        $this->channel->queue_declare('hello', false, false, false, false);
        $msg = new AMQPMessage('Hello World');
        $this->channel->basic_publish($msg, '', 'hello');
        echo "Sent 'Hello World!' \n";

        $this->channel->close();
        $this->connection->close();
    }

    public function queueReceive()
    {
        $this->channel->queue_declare('hello', false, false, false, false);
        echo ' [*] Waiting for messages. To exit press CTRL+C', "\n";

        $callback = function ($msg) {
            echo " [x] Received ", $msg->body, "\n";
            echo $this->getData();
        };

        $this->channel->basic_consume('hello', '', false, true, false, false, $callback);

        while (count($this->channel->callbacks)) {
            $this->channel->wait();
        }

        $this->channel->close();
        $this->connection->close();
    }

    //------------------------ Work Queue Example ----------------------------//

    public function queueSendWorkQ($argv = "Hello World!")
    {
        $taskName = 'task_queue';
        $this->channel->queue_declare($taskName, false, true, false, false);

        $msg = new AMQPMessage($argv,
            array('delivery_mode' => 2) # make message persistent
        );

        $this->channel->basic_publish($msg, '', $taskName);
        echo " [x] Sent ", $argv, "\n";

        $this->channel->close();
        $this->connection->close();
    }

    public function queueReceiveWorkQ()
    {
        $taskName = 'task_queue';
        $this->channel->queue_declare($taskName, false, true, false, false);
        echo ' [*] Waiting for messages. To exit press CTRL+C', "\n";
        $callback = function ($msg) {
            echo " [x] Received ", $msg->body, "\n";
            sleep(5);
            echo " [x] Done", "\n";
            $this->queueSendWorkTwoQ();
            $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
        };
        $this->channel->basic_qos(null, 1, null);
        $this->channel->basic_consume($taskName, '', false, false, false, false, $callback);
        while (count($this->channel->callbacks)) {
            $this->channel->wait();
        }
        $this->channel->close();
        $this->connection->close();
    }

    public function queueSendWorkTwoQ($argv = "Hello World!")
    {
        $connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
        $channel = $connection->channel();

        $taskName = 'task_queue_two';
        $channel->queue_declare($taskName, false, true, false, false);

        $msg = new AMQPMessage($argv,
            array('delivery_mode' => 2) # make message persistent
        );

        $channel->basic_publish($msg, '', $taskName);
        echo " [x] Sent ", $argv, "\n";

        $channel->close();
        $connection->close();
    }

    public function queueReceiveWorkTwoQ()
    {
        $taskName = 'task_queue_two';
        $this->channel->queue_declare($taskName, false, true, false, false);
        echo ' [*] Waiting for messages. To exit press CTRL+C', "\n";
        $callback = function ($msg) {
            echo " [x] Received Method Two", $msg->body, "\n";
            sleep(5);
            echo " [x] Done Method Two", "\n";
            $msg->delivery_info['channel']->basic_ack($msg->delivery_info['delivery_tag']);
        };
        $this->channel->basic_qos(null, 1, null);
        $this->channel->basic_consume($taskName, '', false, false, false, false, $callback);
        while (count($this->channel->callbacks)) {
            $this->channel->wait();
        }
        $this->channel->close();
        $this->connection->close();
    }


    //------------------------------Publish/Subscribe----------------------------//

    public function queueSendPublishQ($data = 'Hello World')
    {
        $this->channel->exchange_declare('logs', 'fanout', false, false, false);
        $msg = new AMQPMessage($data);

        $this->channel->basic_publish($msg, 'logs');
        echo " [x] Sent ", $data, "\n";

        $this->channel->close();
        $this->connection->close();
    }

    public function queueReceivePublishQ()
    {
        $this->channel->exchange_declare('logs', 'fanout', false, false, false);
        list($queue_name, ,) = $this->channel->queue_declare("", false, false, true, false);

        $this->channel->queue_bind($queue_name, 'logs');
        echo ' [*] Waiting for logs. To exit press CTRL+C', "\n";

        $callback = function ($msg) {
            echo ' [x] ', $msg->body, "\n";
        };

        $this->channel->basic_consume($queue_name, '', false, true, false, false, $callback);
        while (count($this->channel->callbacks)) {
            $this->channel->wait();
        }

        $this->channel->close();
        $this->connection->close();
    }


    //--------------------------- Routing ------------------------------//

    public function queueSendRouting($argv = array("Hello World!", 'error'))
    {
        $this->channel->exchange_declare('direct_logs', 'direct', false, false, false);

        $severity = isset($argv[1]) && !empty($argv[1]) ? $argv[1] : 'info';
        $data = $argv[0];

        $msg = new AMQPMessage($data);
        $this->channel->basic_publish($msg, 'direct_logs', $severity);

        echo " [x] Sent ", $severity, ':', $data, " \n";
        $this->channel->close();
        $this->connection->close();
    }

    public function queueReceiveRouting($severities = array('info', 'error'))
    {
        $this->channel->exchange_declare('direct_logs', 'direct', false, false, false);

        list($queue_name, ,) = $this->channel->queue_declare("", false, false, true, false);
        if (empty($severities)) {
            file_put_contents('php://stderr', "Usage: $severities[0] [info] [warning] [error]\n");
            exit(1);
        }

        foreach ($severities as $severity) {
            $this->channel->queue_bind($queue_name, 'direct_logs', $severity);
        }

        echo ' [*] Waiting for logs. To exit press CTRL+C', "\n";
        $callback = function ($msg) {
            echo ' [x] ', $msg->delivery_info['routing_key'], ':', $msg->body, "\n";
        };

        $this->channel->basic_consume($queue_name, '', false, true, false, false, $callback);
        while (count($this->channel->callbacks)) {
            $this->channel->wait();
        }

        $this->channel->close();
        $this->connection->close();
    }

    //---------------------------------Topic -------------

    public function queueSendTopic($hasRoutingKey = false)
    {
        $this->channel->exchange_declare('topic_logs', 'topic', false, false, false);

        $argv = func_get_args();
        if (!$hasRoutingKey) {
            $routing_key = array();
            $arrayData = array(array('imageid' => '1'), array('imageid' => null));
            foreach ($arrayData as $val) {
                if ($val['imageid']) {
                    $routing_key = 'hasImage';

                } else {

                    $routing_key = 'noimage';
                }


                $data = implode(' ', array_slice($argv, 2));
                if (empty($data)) $data = "Hello World!";

                $msg = new AMQPMessage($data);
                $this->channel->basic_publish($msg, 'topic_logs', $routing_key);
                echo " [x] Sent ", $routing_key, ':', $data, " \n";
            }
        } else {
            $routing_key = $hasRoutingKey;

            $data = implode(' ', array_slice($argv, 2));
            if (empty($data)) $data = "Hello World!";

            $msg = new AMQPMessage($data);
            $this->channel->basic_publish($msg, 'topic_logs', $routing_key);
            echo " [x] Sent ", $routing_key, ':', $data, " \n";
        }


        $this->channel->close();
        $this->connection->close();
    }

    public function queueReceiveTopic()
    {
        $this->channel->exchange_declare('topic_logs', 'topic', false, false, false);

        $argv = func_get_args();
        list($queue_name, ,) = $this->channel->queue_declare("", false, false, true, false);
        $binding_keys = $argv;
        if (empty($binding_keys)) {
            file_put_contents('php://stderr', "Usage: $argv[0] [binding_key]\n");
            exit(1);
        }

        foreach ($binding_keys as $binding_key) {
            $this->channel->queue_bind($queue_name, 'topic_logs', $binding_key);
        }
        echo ' [*] Waiting for logs. To exit press CTRL+C', "\n";

        $callback = function ($msg) {
            if ($msg->delivery_info['routing_key'] == 'hasImage') {
                echo ' [x] has image', "\n";
                $this->test();
            } elseif ($msg->delivery_info['routing_key'] == 'noimage') {
                echo ' [x] no image', "\n";
            }


        };
        $this->channel->basic_consume($queue_name, '', false, true, false, false, $callback);

        while (count($this->channel->callbacks)) {
            $this->channel->wait();
        }
        $this->channel->close();
        $this->connection->close();
    }


    //--------------------------------------RPC---------------

    public function fib($n)
    {
        if ($n == 0)
            return 0;
        if ($n == 1)
            return 1;
        return $this->fib($n - 1) + $this->fib($n - 2);
    }

    public function RPCWorkReceiveQ()
    {
        $connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
        $channel = $connection->channel();
        $channel->queue_declare('rpc_queue', false, false, false, false);


        echo " [x] Awaiting RPC requests\n";
        $callback = function ($req) {
            $n = intval($req->body);
            echo " [.] " . $this->fib($n) . "\n";
            $msg = new AMQPMessage(
                (string)$this->fib($n),
                array('correlation_id' => $req->get('correlation_id'))
            );
            $req->delivery_info['channel']->basic_publish(
                $msg, '', $req->get('reply_to'));
            $req->delivery_info['channel']->basic_ack($req->delivery_info['delivery_tag']);
        };
        $channel->basic_qos(null, 1, null);
        $channel->basic_consume('rpc_queue', '', false, false, false, false, $callback);
        while (count($channel->callbacks)) {
            $channel->wait();
        }
        $channel->close();
        $connection->close();
    }

    public function getData()
    {
        sleep(15);
        $curl = curl_init();
        curl_setopt_array($curl, array(
            CURLOPT_URL => "http://ip.jsontest.com/",
            CURLOPT_RETURNTRANSFER => true,
            CURLOPT_ENCODING => "",
            CURLOPT_MAXREDIRS => 10,
            CURLOPT_TIMEOUT => 30,
            CURLOPT_HTTP_VERSION => CURL_HTTP_VERSION_1_1,
            CURLOPT_CUSTOMREQUEST => "GET"
        ));

        $getResponse = curl_exec($curl);
        $err = curl_error($curl);
        curl_close($curl);

        return $getResponse;
    }

    public function queueRPCReceiveTest()
    {
        $this->channel->queue_declare('rpc_queue', false, false, false, false);

        echo " [x] Awaiting RPC requests\n";
        $callback = function ($req) {
            $n = intval($req->body);
            $data = $this->getData();
            echo " [.] Data Received $n " . $data . "\n";
            $msg = new AMQPMessage(
                $data,
                array('correlation_id' => $req->get('correlation_id'))
            );
            $req->delivery_info['channel']->basic_publish(
                $msg, '', $req->get('reply_to'));
            $req->delivery_info['channel']->basic_ack($req->delivery_info['delivery_tag']);
        };
        $this->channel->basic_qos(null, 1, null);
        $this->channel->basic_consume('rpc_queue', '', false, false, false, false, $callback);
        while (count($this->channel->callbacks)) {
            $this->channel->wait();
        }
        $this->channel->close();
        $this->connection->close();
    }

    public function on_response($rep)
    {
        if ($rep->get('correlation_id') == $this->corr_id) {
            $this->response = $rep->body;
        }
    }

    public function call($n)
    {
        $connection = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
        $channel = $connection->channel();
        list($callback_queue, ,) = $channel->queue_declare("", false, false, true, false);
        $channel->basic_consume($callback_queue, '', false, false, false, false,
            array($this, 'on_response'));
        $this->response = null;
        $this->corr_id = uniqid();
        $msg = new AMQPMessage(
            (string)$n,
            array('correlation_id' => $this->corr_id,
                'reply_to' => $callback_queue)
        );
        $channel->basic_publish($msg, '', 'rpc_queue');
        while (!$this->response) {
            $channel->wait();
        }
        return $this->response;
    }

    public function test()
    {
        $response = $this->call(30);
        echo " [.] Got ", $response, "\n";
    }

    function fakerdata(){
        $faker = Faker\Factory::create();
        $dataArray=array();
        $checkStatus=array();

        for ($i=0; $i < 10; $i++) {
            $data['name']=$this->spellPurify($this->spellCheck($faker->name));
            $data['image']=$faker->imageUrl($width = 640, $height = 480);
            $check=$this->imagePurify( $data['image']);
            array_push($dataArray,$data);
            array_push($checkStatus,$check);

        }
        foreach($checkStatus as $value){
            print_r($value);

            if($value['res']->status){

            }

        }


    }


    function spellPurify($text = '')
    {
        $checkurl = "http://api1.webpurify.com/services/rest/?method=webpurify.live.replace&format=json&api_key=683d0465d33b0d7c8fac93ae0311b9dc&text=" . urlencode($text);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, Array("Content-Type:application/json"));
        curl_setopt($ch, CURLOPT_URL, $checkurl);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $fire_response = curl_exec($ch);
        curl_close($ch);
        $fire_resp = json_decode($fire_response);
        return $fire_resp->rsp->text;
    }
    function spellCheck($txt = '')
    {
        $fireabse_text = $txt;
        if ($fireabse_text != '') {
            $micro_url = "https://api.cognitive.microsoft.com/bing/v5.0/spellcheck";
            $micro_url = $micro_url . '?text=' . urlencode($fireabse_text) . '&mode=spell&preContextText=&postContextText=&mkt=';
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_HTTPHEADER, Array("Content-Type:application/json", "Ocp-Apim-Subscription-Key:69d9d3f8bd064af88fa047d3d7b5dbca"));
            curl_setopt($ch, CURLOPT_URL, $micro_url);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            $fire_response = curl_exec($ch);
            curl_close($ch);
            $fire_resp = json_decode($fire_response);
            if (@isset($fire_resp->flaggedTokens)) {
                if (@sizeof($fire_resp->flaggedTokens) > 0) {
                    for ($i = 0; $i < sizeof($fire_resp->flaggedTokens); $i++) {
                        $fireabse_text = str_replace($fire_resp->flaggedTokens[$i]->token, $fire_resp->flaggedTokens[$i]->suggestions[0]->suggestion, $fireabse_text);
                    }
                }
            }
        }
        return $fireabse_text;
    }
    function imagePurify($image_url = '')
    {
        $api_key = '58a8da069719a6f274ba2e3a8e21f158';
        $firebase_image_url = $image_url;
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER, Array());
        curl_setopt($ch, CURLOPT_URL, "http://im-api1.webpurify.com/services/rest/?method=webpurify.live.imgcheck&api_key=" . $api_key . "&format=json&imgurl=" . $firebase_image_url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        $fire_response = curl_exec($ch);
        curl_close($ch);

        $foi = json_decode($fire_response);
        return $foi;
    }



}