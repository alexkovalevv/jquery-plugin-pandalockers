<?php
if ( !defined('OPANDA_PROXY') ) exit;

/**
 * The class to proxy the request to the Subscription API.
 */
class OPanda_SubscriptionHandler extends OPanda_Handler {
    /**
     * Handles the proxy request.
     */
    public function handleRequest() {
        
        if( !isset($_POST['opandaRequestType']) || !isset($_POST['opandaService']) ) {
           throw new Opanda_HandlerInternalException('Invalid request. The "opandaRequestType" or "opandaService" are not defined.');
        }
        
        // - service name
        
        $service = $serviceName = $this->options['service'];
        $allowed = array( 'database', 'mailchimp', 'aweber', 'getresponse' );
        
        if ( !in_array( $service, $allowed ) ) {
           throw new Opanda_HandlerInternalException( sprintf( 'The subscription service "%s" not found.', $service ));
        }
        
        // - request type
        
        $requestType = strtolower( $_POST['opandaRequestType'] );
        $allowed = array('check', 'subscribe');

        if ( !in_array( $requestType, $allowed ) ) {
           throw new Opanda_HandlerInternalException( sprintf( 'Invalid request. The action "%s" not found.', $requestType ));
        }
        
        // - identity data
        
        $identityData = isset( $_POST['opandaIdentityData'] ) ? $_POST['opandaIdentityData'] : array();
        $identityData = $this->normilizeValues( $identityData );
        
        if ( empty( $identityData['email'] )) {
           throw new Opanda_HandlerException( 'Unable to subscribe. The email is not specified.' );
        }
        
        $requireName =  isset( $_POST['opandaRequireName'] ) ? $_POST['opandaRequireName'] : true;
        $requireName = $this->normilizeValue( $requireName );
        
        if ( $requireName && empty( $identityData['name'] ) ) {
           throw new Opanda_HandlerException( 'Unable to subscribe. The name is not specified.' );
        }
        
        // - context data
        
        $contextData = isset( $_POST['opandaContextData'] ) ? $_POST['opandaContextData'] : array();
        $contextData = $this->normilizeValues( $contextData );
        // - list id
        
        $listId = isset( $_POST['opandaListId'] ) ? $_POST['opandaListId'] : null;
        if ( empty( $listId ) ) {
           throw new Opanda_HandlerException( 'Unable to subscribe. The list ID is not specified.' );
        }
        
        // - double opt-in
        
        $doubleOptin =  isset( $_POST['opandaDoubleOptin'] ) ? $_POST['opandaDoubleOptin'] : true;
        $doubleOptin = $this->normilizeValue( $doubleOptin );
        
        // - confirmation
        
        $confirm =  isset( $_POST['opandaConfirm'] ) ? $_POST['opandaConfirm'] : true;
        $confirm = $this->normilizeValue( $confirm );
        
        // creating subscription service
        
        require_once('libs/class.subscription.php'); 
        require_once('libs/' . $service . '/class.' . $service . ".php");    

        $class = "OPanda_" . ucfirst($service) . "SubscriptionService"; 

        try {    
            
            $serviceData = array(
                'name' => $service,
                'title' => null
            );
            
            $service = new $class( $serviceData );

            if ( defined( 'OPANDA_WORDPRESS' ) ) {
                $serviceOptions = $service->getOptions();
            } else {
                $serviceOptions = $this->options[$serviceName];
            }
            
            $service->init( $serviceOptions );
            
            $result = array();
            
            if ( 'subscribe' === $requestType ) {
                $result = $service->subscribe( $identityData, $listId, $doubleOptin, $confirm );
            } elseif ( 'check' === $requestType ) {
                $result = $service->check( $identityData, $listId );
            }

            if ( !defined( 'OPANDA_WORDPRESS' ) ) return $result;
            
            // calls the hook to save the lead in the database
            if ( $result && isset( $result['status'] ) ) {

                $actionData = array(
                    'identity' => $identityData,
                    'requestType' => $requestType,
                    'service' => $this->options['service'],
                    'list' => $listId,
                    'doubleOptin' => $doubleOptin,
                    'confirm' => $confirm,
                    'context' => $contextData
                );
                
                if ( 'subscribed' === $result['status'] ) {
                    do_action('opanda_subscribed', $actionData);
                } else {
                    do_action('opanda_pending', $actionData); 
                }
            }
            
            return $result;
            
        } catch(Exception $ex) {
            throw new Opanda_HandlerException( $ex->getMessage() );
        }
    }
}
