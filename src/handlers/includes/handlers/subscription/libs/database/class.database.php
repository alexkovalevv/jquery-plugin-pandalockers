<?php

class OPanda_DatabaseSubscriptionService extends OPanda_Subscription {
    
    /**
     * Get options (Wordpress only).
     */
    public function getOptions() {
        
        return array();
    }
    
    /**
     * Returns available Opt-In modes.
     * 
     * @since 1.0.0
     * @return mixed[]
     */
    public function getOptInModes() {
        return array( 'quick' );
    }
    
    /**
     * Returns lists available to subscribe.
     * 
     * @since 1.0.0
     * @return mixed[]
     */
    public function getLists() {
        return array();
    }
	
    /**
     * Subscribes the person.
     */
    public function subscribe( $identityData, $listId, $doubleOptin ) {
        return array('status' => 'subscribed');
    }
    
    /**
     * Checks if the user subscribed.
     */  
    public function check( $identityData, $listId ) { 
        return array('status' => 'subscribed');
    }
}