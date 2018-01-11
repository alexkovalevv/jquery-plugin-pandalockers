<?php

class OPanda_AweberSubscriptionService extends OPanda_Subscription {
    
    /**
     * Inits the service via api keys.
     */
    public function init( $options ) {
        parent::init($options);
        $this->credential = $options;
        $this->acountId = $options['account_id'];
    }
    
    /**
     * Get options (Wordpress only).
     */
    public function getOptions() {
        
        return array(
            'consumer_key' => get_option('opanda_aweber_consumer_key'),
            'consumer_secret' => get_option('opanda_aweber_consumer_secret'),
            'access_key' => get_option('opanda_aweber_access_key'),
            'access_secret' => get_option('opanda_aweber_access_secret'),
            'account_id' => get_option('opanda_aweber_account_id')
        );
    }

    public function initAweberLibs() { 
        
        if ( !$this->inited )
            throw new OPanda_SubscriptionException('Aweber service is not inited.');
        
        if( !class_exists('AWeberAPI') ) require_once 'libs/aweber.php';
        
        if( empty($this->credential['consumer_key']) || empty($this->credential['consumer_secret']) )
            throw new Exception ('Aweber is not connected.');
        
        if( empty( $this->acountId ) )
            throw new Exception ('The Aweber Account ID is not set.');
        
        $api = new AWeberAPI( $this->credential['consumer_key'], $this->credential['consumer_secret']);
        $api->setupAccount( $this->credential['access_key'], $this->credential['access_secret'] );
        
        return $api;
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
        
        $account = $this->getAccount();
                
        $lists = array();
        foreach( $account->lists->data['entries'] as $value ) {
            $lists[] = array(
                'title' => $value['name'],
                'value' => $value['id']
            );
        }
        
        return array(
            'items' => $lists
        );        
    }    
    
    public function getAccount( $access_key = null, $access_secret = null ) {
        
        $aweber = $this->initAweberLibs();  
        
        if( empty($this->credential['access_key']) || empty($this->credential['access_secret']) )
            throw new Exception ('[init]: Aweber is not connected.');
        
        return $aweber->getAccount($this->credential['access_key'], $this->credential['access_secret']);          
    }
   
    public function getCredentialUsingAuthorizeKey($authorize_key) {
        if( !class_exists('AWeberAPI') ) require_once 'libs/aweber.php';
        
        list($consumer_key, $consumer_secret, $access_key, $access_secret) = AWeberAPI::getDataFromAweberID($authorize_key);
        
        if ( empty( $consumer_key) || empty( $consumer_secret) || empty( $access_key ) || empty( $access_secret ) ) {
            throw new OPanda_SubscriptionException( __('Unable to connect your Aweber Account. The Authorization Code is incorrect.', 'optinpanda') );
        }
        
        $aweber = new AWeberAPI( $consumer_key, $consumer_secret );
        $account = $aweber->getAccount( $access_key, $access_secret ); 
        
        return array(
            'consumer_key' => $consumer_key,
            'consumer_secret' => $consumer_secret,
            'access_key' => $access_key,
            'access_secret' => $access_secret,
            'account_id' => $account->id
        );
    }
    
    /**
     * Subscribes the person.
     */
    public function subscribe( $identityData, $listId, $doubleOptin ) {

        if ( !$doubleOptin )
            throw new OPanda_SubscriptionException ('Aweber requires the double opt-in. But the option "doubleOptin" set to false.');
        
        try {
            
            $aweber = $this->initAweberLibs(); 
            $subs = $aweber->loadFromUrl('/accounts/' . $this->acountId . '/lists/' . $listId . '/subscribers');

            $name = null;
            if ( !empty( $identityData['name'] ) ) $name = $identityData['name'];
            elseif( !empty( $identityData['displayName'] ) ) $name = $identityData['displayName'];

            $options = array(
                'email' => $identityData['email'],
                'ip_address' => $_SERVER['REMOTE_ADDR'],
                'ad_tracking' => 'optinpanda'
            );
            
            if ( !empty( $name) ) $options['name'] = $name;
            return $subs->create( $options );
            
       } catch(Exception $ext) {
           
            // already waiting confirmation:
            // "Subscriber already subscribed and has not confirmed."
            if ( strpos( $ext->getMessage(), 'has not confirmed' ) ) {
                return array('status' => 'pending');
            }
            
            // already waiting confirmation:
            // "Subscriber already subscribed."
            if ( strpos( $ext->getMessage(), 'already subscribed' ) ) {
                return array('status' => 'pending');
            }            
            
            /**
            if( !in_array(md5( $ext->getMessage()), array('0f801abf6a78b3f3441183e8c297f3d4', 'd56a25f480e1bb628c88043857eaf71c') ))
                throw new Exception ('subscribe: ' . $ext->getMessage()); */
           
            throw new OPanda_SubscriptionException ('[subscribe]: ' . $ext->getMessage());   
       }
    }
    
    /**
     * Checks if the user subscribed.
     */  
    public function check( $identityData, $listId ) { 
        
        try {
            
            $aweber = $this->initAweberLibs(); 
            $response = $aweber->findSubscribers(
                '/accounts/' . $this->acountId,
                array('email' => $identityData['email']
            ));
            
            if ( !isset( $response->data['entries'][0] ) ) {
                throw new Exception('Unable to check the subscription. Unexpected error occurred.'); 
            }
            
            $status = $response->data['entries'][0]['status'];
            return array('status' => ( $status == 'subscribed' ? 'subscribed' : 'pending' ));
        
       } catch(Exception $ext) {   
            /**
            if( !in_array(md5( $ext->getMessage()), array('0f801abf6a78b3f3441183e8c297f3d4', 'd56a25f480e1bb628c88043857eaf71c') ))
                throw new Exception ('subscribe: ' . $ext->getMessage()); */
           
            throw new OPanda_SubscriptionException ('[check]: ' . $ext->getMessage());   
       }
    }
}