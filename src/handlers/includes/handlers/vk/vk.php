<?php
if ( !defined('OPANDA_PROXY') ) exit;

/**
 * The class to proxy the request to the Twitter API.
 */
class OPanda_VkHandler extends OPanda_Handler {

    /**
     * Handles the proxy request.
     */
    public function handleRequest() {
        
        // the request type is to determine which action we should to run
        $this->requestCode = isset( $_REQUEST['code'] ) && !empty( $_REQUEST['code'] ) ? $_REQUEST['code'] : null;
	    $this->denied = isset( $_REQUEST['error'] );
	    $this->deniedError = isset( $_REQUEST['error_description'] ) && !empty( $_REQUEST['error_description'] ) ? $_REQUEST['error_description'] : null;
        
        // allowed request types, others will trigger an error
       // $allowed = array('code');

        if ( !$this->denied && empty( $this->requestCode ) )
            throw new Opanda_HandlerException('Invalid request type.'); 

	    $this->doCallback();
    }

	public function doCallback() {

		if ( $this->denied ) {
			?>
			<script>
				if( window.opener ) window.opener.OPanda_VkOAuthDenied( '<?php echo $this->deniedError; ?>' );
				window.close();
			</script>
			<?php
			exit;
		}

		if ( empty( $this->requestCode ) )
			throw new Opanda_HandlerException('Invalid request code.');

		if ( empty( $this->options['app_id'] ) || empty( $this->options['app_secret'] )  )
			throw new Opanda_HandlerException('Invalid appid or secret id.');

		require_once('libs/VKException.php');
		require_once('libs/VK.php');

		$vk = new VK\VK($this->options['app_id'], $this->options['app_secret']);

		$access_token = $vk->getAccessToken($this->requestCode, $this->options['proxy']);

		if ( empty( $access_token ) ) {
			throw new Opanda_HandlerException('Invalid request.');
		}

		?>
		<script>
			if( window.opener ) window.opener.OPanda_VkOAuthCompleted( '<?php echo json_encode($access_token); ?>' );
			window.close();
		</script>
		<?php
		exit;
	}
}


