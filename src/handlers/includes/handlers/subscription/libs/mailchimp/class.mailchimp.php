<?php 

class OPanda_MailchimpSubscriptionService extends OPanda_Subscription {

    /**
     * Inits the service via api keys.
     */
    public function init( $options ) {
        parent::init($options);
        
        if ( empty( $options['api_key'] ) )
            throw new OPanda_SubscriptionException('The MailChimp API Key is empty.');
        
        $this->apiKey = $options['api_key'];
    }

    /**
     * Get options (Wordpress only).
     */
    public function getOptions() {
        
        return array(
            'api_key' => get_option('opanda_mailchimp_apikey')
        );
    }
    
    public function initMailChimpLibs() {
        
        if ( !$this->inited )
            throw new OPanda_SubscriptionException('MailChimp service is not inited.');

        require_once 'libs/mailchimp.php';    
        return new MailChimp( $this->apiKey );
    }
    

    /**
     * Returns available Opt-In modes.
     * 
     * @since 1.0.0
     * @return mixed[]
     */
    public function getOptInModes() {
        return array( 'double-optin', 'quick-double-optin', 'quick' );
    }
    
    /**
     * Returns lists available to subscribe.
     * 
     * @since 1.0.0
     * @return mixed[]
     */
    public function getLists() {
        
        $MailChimp = $this->initMailChimpLibs();
        $response = $MailChimp->call('lists/list');
        
        if ( !$response ) {
            throw new OPanda_SubscriptionException( __( 'The API Key is incorrect.', 'optinpanda' ) );   
        }
            
        $lists = array();
        foreach( $response['data'] as $value ) {
            $lists[] = array(
                'title' => $value['name'],
                'value' => $value['id']
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

        $vars = array();
        if ( !empty( $identityData['name'] ) ) $vars['FNAME'] = $identityData['name'];
        if ( !empty( $identityData['family'] ) ) $vars['LNAME'] = $identityData['family'];
        if ( empty( $identityData['name'] ) && !empty( $identityData['displayName'] ) ) $vars['FNAME'] = $identityData['displayName'];
        
        $MailChimp = $this->initMailChimpLibs();
        $response = $MailChimp->call('lists/subscribe', array(
            'id'                => $listId,
            'email'             => array('email' => $identityData['email'] ),
            'merge_vars'        => $vars,
            'double_optin'      => $doubleOptin,
            'update_existing'   => false,
            'replace_interests' => false,
            'send_welcome'      => !$doubleOptin ? true : false,
        ));
             
        if( isset($response['error']) && $response['code'] != 214 )
            throw new OPanda_SubscriptionException ( '[subscribe]: ' . $response['error'] );   
                 
        return array('status' => $doubleOptin ? 'pending' : 'subscribed');
    }
    
    /**
     * Checks if the user subscribed.
     */  
    public function check( $identityData, $listId ) { 
        
        $MailChimp = $this->initMailChimpLibs();
        $response = $MailChimp->call('/lists/member-info', array( 
                       'id' => $listId,
                       'emails' => array( 
                           array('email' => $identityData['email'])           
                       )
                    ));
         
        if( !sizeof($response) && !isset($response['data'][0]['status']) )
            throw new OPanda_SubscriptionException('[check]: Unexpected error occurred.');
         
        return array('status' => $response['data'][0]['status']);
    }
}
