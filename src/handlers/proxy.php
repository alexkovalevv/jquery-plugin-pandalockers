<?php

define('OPANDA_PROXY', true);
define('OPANDA_PROXY_DIR', dirname(__FILE__));

$handlerName = isset( $_REQUEST['opandaHandler'] ) ? $_REQUEST['opandaHandler'] : null;
$allowed = array('twitter', 'linkedin', 'vk', 'subscription', 'signup');

if ( $handlerName == 'signup') exit;

if ( empty( $handlerName ) || !in_array( $handlerName, $allowed ) ) {
    header( 'Status: 403 Forbidden' );
    header( 'HTTP/1.1 403 Forbidden' );
    exit;
}

// session_save_path('C:\Webservers\tmp');
session_start();

require OPANDA_PROXY_DIR . "/config.php";
$options = $options[$handlerName];

require OPANDA_PROXY_DIR . "/includes/class.handler.php";
require OPANDA_PROXY_DIR . "/includes/handlers/$handlerName/$handlerName.php";

$handlerClass = 'OPanda_' . ucwords( $handlerName ) . 'Handler';
$handler = new $handlerClass( $options );

try {
    
    $result = $handler->handleRequest();
    echo json_encode( $result );
    
} catch (Opanda_HandlerInternalException $ex) {
    echo json_encode(array('error' => $ex->getMessage(), 'detailed' => $ex->getDetailed()));
} catch (Opanda_HandlerException $ex) {
    echo json_encode(array('error' => $ex->getMessage()));
}

exit;