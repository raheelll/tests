<?php
class Promotion extends CI_Controller
{
    function __construct()
    {
        parent::__construct();
        //varify_v8_company_user();
    }

    function index($page = 0)
    {
        echo "index";
    }
    /**
     * @param int $company
     * @param int $site
     */
    public function PromotionList($company =20155,$site = 22514){
        $access_token=0;$refresh_token=   0;
        @$access_token   =    $_GET['access_token'];
        @$refresh_token   =   $_GET['refresh_token'];
        @$client_id   =       $this->config->item('ClientId');
        @$client_secret   =   $this->config->item('ClientSecret');
        $authorize_access_token = $access_token;
        //$url = "https://cbatest.kounta.com/v1/cba/sites/".$site.".json";
        $url = "https://cbatest.kounta.com/v1/cba/sites/".$site."/promotions.json";
       // $url='https://cbatest.kounta.com/v1/companies/'.$company.'/products.json';
       // $url='https://cbatest.kounta.com/v1/companies/'.$company.'/sites.json';
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_HTTPHEADER,Array("Content-Type: application/json","X-Pretty-Print: 1","authorization: Bearer ".$authorize_access_token));
        curl_setopt ($ch, CURLOPT_URL, $url);
        curl_setopt ($ch, CURLOPT_CUSTOMREQUEST, "GET");
        curl_setopt ($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_FOLLOWLOCATION,true);
        $responses	=	curl_exec($ch);
        $err = curl_error($ch);
        curl_close($ch);
        $response =  json_decode($responses);
        $company_id = $company;
        if(sizeof($response)>0) {
            if (isset($response->error)) {
                if ($response->error == 'invalid_token') {
                    $data = '{
								"refresh_token":"' . $refresh_token . '",
								"client_id":"' . $client_id . '",
								"client_secret":"' . $client_secret . '",
								"grant_type":"refresh_token"
					  }';
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_HTTPHEADER, Array("Content-Type: application/json", "X-Pretty-Print: 1"));
                    curl_setopt($ch, CURLOPT_URL, 'https://cbatest.kounta.com/v1/token.json');
                    curl_setopt($ch, CURLOPT_POST, true);
                    curl_setopt($ch, CURLOPT_POSTFIELDS, $data);
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                    $responses = curl_exec($ch);
                    $err = curl_error($ch);
                    curl_close($ch);
                    $response = json_decode($responses);
                    $ch = curl_init();
                    $authorize_access_token = $response->access_token;
                    curl_setopt($ch, CURLOPT_HTTPHEADER, Array("Content-Type: application/json", "X-Pretty-Print: 1", "authorization: Bearer " . $authorize_access_token));
                    curl_setopt($ch, CURLOPT_URL, $url);
                    curl_setopt($ch, CURLOPT_CUSTOMREQUEST, "GET");
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
                    $responses = curl_exec($ch);
                    $err = curl_error($ch);
                    curl_close($ch);
                    $promo_list = json_decode($responses,true);
                   // print_r($promo_list); exit();
                    $promotion_array = [];
                    /*foreach ($promo_list as $row){
                        $promo_data  = [];
                        $promo_data['id'] =     $row['id'];
                        $promo_data['name'] =   $row['name'];
                        $promo_data['image'] =  "image";
                        $promo_data['trigger'] = $row['triggers'];
                        ///$promotion_array.array_push($promo_data);
                        print_r($promo_data);
                    }
                    print_r($promotion_array);
                    exit();
                    echo "<pre>"; print_r($promo_list); exit();*/
                    // get active and inactive promotion against site
                    $promo_url = "https://cbatest.kounta.com/v1/cba/sites/".$site.".json";
                    $ch = curl_init();
                    curl_setopt($ch, CURLOPT_HTTPHEADER,Array("Content-Type: application/json","X-Pretty-Print: 1","authorization: Bearer ".$authorize_access_token));
                    curl_setopt ($ch, CURLOPT_URL, $promo_url);
                    curl_setopt ($ch, CURLOPT_CUSTOMREQUEST, "GET");
                    curl_setopt ($ch, CURLOPT_RETURNTRANSFER, true);
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION,true);
                    $active_promo_response	=	curl_exec($ch);
                    //
                    echo "<pre>"; print_r($active_promo_response); exit();
                    if (isset($response->error)) {
                        print_r($response);
                        exit;
                    }
                } else {
                    exit;
                }
            }
        }
    }
}
?>