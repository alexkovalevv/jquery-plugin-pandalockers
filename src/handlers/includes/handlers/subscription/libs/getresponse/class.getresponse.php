<?php

class OPanda_GetresponseSubscriptionService extends OPanda_Subscription {
    
    protected $apiUrl = 'http://api2.getresponse.com';
    
    /**
     * Inits the service via api keys.
     */
    public function init( $options ) {
        parent::init($options);

        if ( empty( $options['api_key'] ) )
            throw new OPanda_SubscriptionException('The GetResponse API Key is empty.');
        
        $this->apiKey = $options['api_key'];
    }
    
    /**
     * Get options (Wordpress only).
     */
    public function getOptions() {
        
        return array(
            'api_key' => get_option('opanda_getresponse_apikey')
        );
    }
    
    public function initGetResponseLibs( ) {
        require_once 'libs/getresponse.php';
        
        if ( !$this->inited )
            throw new OPanda_SubscriptionException('GetResponse service is not inited.');

        return new jsonRPCClient($this->apiUrl);
    }
    
    /**
     * Returns available Opt-In modes.
     * 
     * @since 1.0.0
     * @return mixed[]
     */
    public function getOptInModes() {
        return array( 'double-optin', 'quick-double-optin' );
    }
    
    /**
     * Returns lists available to subscribe.
     * 
     * @since 1.0.0
     * @return mixed[]
     */
    public function getLists() {
        
        $getResponse = $this->initGetResponseLibs();
        
        try {
            $campaigns = $getResponse->get_campaigns( $this->apiKey, array (            
                'name' => array ( 'CONTAINS' => '%' )
            )); 
        } catch (Exception $ex) {
            
            $message = $ex->getMessage();
            
            // The API Key may be passed incorrectly
            // "Request have return error: Invalid params"
            if (strpos( $message, 'Invalid params') ) {
                throw new OPanda_SubscriptionException( __( 'The API Key is incorrect.', 'optinpanda' ) ); 
            }
            
            throw $ex;
        }

        $lists = array();
        foreach( $campaigns as $key => $value ) {
            $lists[] = array(
                'title' => $value['name'],
                'value' => $key
            );
        }
        
        return array(
            'items' => $lists
        );
    }
    
    /**
     * Subscribes the person.
     */
    public function subscribe( $identityData, $listId, $doubleOptin ) {

        if ( !$doubleOptin )
            throw new OPanda_SubscriptionException ('GetResponse requires the double opt-in. But the option "doubleOptin" set to false.');
        
        try {  
            $getResponse = $this->initGetResponseLibs();
            
            $getResponse->add_contact( $this->apiKey, array (                
                'campaign'  => $listId,
                'name'      => $identityData['name'],
                'email'     => $identityData['email']
            ));
            
            return array('status' => 'pending');
            
        } catch(Exception $ext) {
            
            // already waiting confirmation:
            // "Request have return error: Contact already queued for target campaign"
            if ( strpos( $ext->getMessage(), 'queued for target campaign' ) ) {
                return array('status' => 'pending');
            }
            
            // already waiting confirmation:
            // "Request have return error: Contact already added to target campaign"
            if ( strpos( $ext->getMessage(), 'already added' ) ) {
                return array('status' => 'subscribed');
            }            

            /**
            if( !in_array(md5($ext->getMessage()), array('ad9f84f2ed3f3352d179ee2d5a17a1a4','92a2ebe1277e1bff0d8ee02b523c28b5')) )
                throw new OPanda_SubscriptionException ('addContact: ' . $ext->getMessage());  */   
            
            throw new OPanda_SubscriptionException ('[subscribe]: ' . $ext->getMessage());
        }   
    }
    
    /**
     * Checks if the user subscribed.
     */  
    public function check( $identityData, $listId ) { 
       
        $getResponse = $this->initGetResponseLibs();

        try { 

            $response = $getResponse->get_contacts( $this->apiKey, array ( 
                'campaigns'  => array($listId),
                'email' => array('EQUALS' => $identityData['email'])
            ));
            
        } catch(Exception $ext) {
            throw new OPanda_SubscriptionException ('[check]: ' . $ext->getMessage());
        }
        
        if( isset($response['error']) ) return array('status' => 'false');
        return array('status' => sizeof($response) ? 'subscribed' : 'pending');
    }
}