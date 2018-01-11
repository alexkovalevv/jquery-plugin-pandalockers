<?php 
abstract class OPanda_Subscription {
    
    public $name;
    public $title; 
    public $options; 
    
    protected $inited = false;
    
    public function __construct( $data ) {
        $this->name = $data['name'];
        $this->title = $data['title'];     
    }
    
    public function init( $options ) {
        $this->inited = true;
        $this->options = $options;   
    }
    
    public function isEmail($email) {
        return filter_var($email, FILTER_VALIDATE_EMAIL);       
    }
    
    public abstract function getOptions();

    public abstract function getOptInModes();
    public abstract function getLists();
    public abstract function subscribe( $identityData, $listId, $doubleOptin );
    public abstract function check( $identityData, $listId );
}

/**
 * A subscription service exception.
 */
class OPanda_SubscriptionException extends Exception {
    
    public function __construct ($message) {
        parent::__construct($message, 0, null);
    }
}